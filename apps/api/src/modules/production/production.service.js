import { prisma } from "../../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";
import { changeStatus } from "../orders/orders.service.js";
import { notifyRoles } from "../../lib/notify.js";
import { startOfDay, endOfDay } from "../../lib/dates.js";

const include = {
  order: { select: { id: true, orderNumber: true, eventDate: true, eventName: true, status: true, fulfillmentType: true } },
  orderItem: { select: { productName: true, variantName: true, quantity: true, notes: true } },
  assignedTo: { select: { id: true, name: true } },
};

export async function list(user, q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(user.role === "DAPUR" && q.mine === "true" && { assignedToId: user.id }),
    ...(q.status && { status: q.status }),
    ...(q.orderId && { orderId: Number(q.orderId) }),
    ...(q.date && { dueAt: { gte: startOfDay(new Date(q.date)), lt: endOfDay(new Date(q.date)) } }),
  };
  const [data, total] = await Promise.all([
    prisma.productionTask.findMany({ where, include, skip, take: limit, orderBy: [{ priority: "desc" }, { dueAt: "asc" }] }),
    prisma.productionTask.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

export async function assign(id, assignedToId) {
  const task = await prisma.productionTask.findUnique({ where: { id } });
  if (!task) throw notFound("Tugas produksi tidak ditemukan");
  if (assignedToId) {
    const u = await prisma.user.findFirst({ where: { id: assignedToId, role: "DAPUR", isActive: true } });
    if (!u) throw badRequest("Petugas harus staf DAPUR yang aktif");
  }
  return prisma.productionTask.update({ where: { id }, data: { assignedToId }, include });
}

// kurangi stok bahan sesuai resep (produk satuan atau isi paket)
async function deductStock(tx, task, userId) {
  const item = await tx.orderItem.findUnique({
    where: { id: task.orderItemId },
    include: {
      product: {
        include: {
          recipeItems: true,
          packageItems: { include: { product: { include: { recipeItems: true } } } },
        },
      },
    },
  });
  const usage = new Map();
  const add = (recipe, mult) =>
    recipe.forEach((r) => usage.set(r.ingredientId, (usage.get(r.ingredientId) ?? 0) + Number(r.quantityPerUnit) * mult));
  add(item.product.recipeItems, item.quantity);
  item.product.packageItems.forEach((pi) => add(pi.product.recipeItems, item.quantity * pi.quantity));

  for (const [ingredientId, qty] of usage) {
    await tx.ingredient.update({ where: { id: ingredientId }, data: { stock: { decrement: qty } } });
    await tx.stockMovement.create({
      data: { ingredientId, type: "USAGE", quantity: -qty, orderId: task.orderId, note: `Produksi ${item.productName} x${item.quantity}`, createdById: userId },
    });
  }
}

export async function updateStatus(user, id, { status, notes }) {
  const task = await prisma.productionTask.findUnique({ where: { id } });
  if (!task) throw notFound("Tugas produksi tidak ditemukan");
  if (task.status === status) return task;
  if (["DONE", "CANCELLED"].includes(task.status)) throw badRequest(`Tugas sudah ${task.status}`);
  if (status === "CANCELLED" && user.role !== "ADMIN") throw forbidden("Hanya admin yang dapat membatalkan tugas");
  if (status === "DONE" && task.status === "QUEUED") throw badRequest("Mulai tugas (IN_PROGRESS) sebelum menandai selesai");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.productionTask.update({
      where: { id },
      data: {
        status, notes,
        ...(status === "IN_PROGRESS" && { startedAt: new Date(), assignedToId: task.assignedToId ?? user.id }),
        ...(status === "DONE" && { completedAt: new Date() }),
      },
      include,
    });

    const order = await tx.order.findUnique({ where: { id: task.orderId } });
    if (status === "IN_PROGRESS" && order.status === "CONFIRMED") {
      await changeStatus(tx, order.id, "PREPARING", { userId: user.id, note: "Produksi dimulai" });
    }
    if (status === "DONE") {
      await deductStock(tx, task, user.id);
      const open = await tx.productionTask.count({
        where: { orderId: order.id, status: { in: ["QUEUED", "IN_PROGRESS"] } },
      });
      if (open === 0 && order.status === "PREPARING") {
        await changeStatus(tx, order.id, "READY", { userId: user.id, note: "Seluruh item selesai diproduksi" });
        await notifyRoles(["ADMIN", "KASIR"], "PRODUCTION", "Pesanan siap", `${order.orderNumber} siap ${order.fulfillmentType === "DELIVERY" ? "dikirim" : "diambil"}`, { orderId: order.id }, tx);
      }
    }
    return updated;
  });
}

// ringkasan kebutuhan produksi per produk untuk satu hari
export async function summary(date) {
  const day = date ? new Date(date) : new Date();
  const rows = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    _sum: { quantity: true },
    where: {
      order: {
        eventDate: { gte: startOfDay(day), lt: endOfDay(day) },
        status: { in: ["PAID", "CONFIRMED", "PREPARING", "READY"] },
      },
    },
  });
  return rows.map((r) => ({ productId: r.productId, productName: r.productName, totalQuantity: r._sum.quantity }));
}
