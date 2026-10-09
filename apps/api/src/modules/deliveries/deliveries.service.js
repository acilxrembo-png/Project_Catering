import { prisma } from "../../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";
import { changeStatus } from "../orders/orders.service.js";

const include = {
  order: {
    select: {
      id: true, orderNumber: true, status: true, eventDate: true, shippingName: true,
      shippingPhone: true, shippingAddress: true, paymentStatus: true, totalAmount: true, paidAmount: true,
    },
  },
};

export async function list(q) {
  const { page, limit, skip } = getPagination(q);
  const where = { ...(q.status && { status: q.status }) };
  const [data, total] = await Promise.all([
    prisma.delivery.findMany({ where, include, skip, take: limit, orderBy: { scheduledAt: "asc" } }),
    prisma.delivery.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

export async function get(user, id) {
  const d = await prisma.delivery.findUnique({ where: { id }, include: { order: true } });
  if (!d) throw notFound("Pengiriman tidak ditemukan");
  return d;
}

// pelanggan melacak pesanannya sendiri
export async function trackByOrder(user, orderId) {
  const d = await prisma.delivery.findUnique({ where: { orderId }, include: { order: { select: { customerId: true, orderNumber: true, status: true } } } });
  if (!d) throw notFound("Pengiriman belum dibuat");
  if (user.role === "PELANGGAN" && d.order.customerId !== user.id) throw forbidden("Bukan pesanan Anda");
  const { courierPhone, ...pub } = d;
  return user.role === "PELANGGAN" ? { ...pub, courierPhone } : d;
}

export async function update(user, id, data) {
  const d = await prisma.delivery.findUnique({ where: { id }, include: { order: true } });
  if (!d) throw notFound("Pengiriman tidak ditemukan");
  if (["DELIVERED", "RETURNED"].includes(d.status)) throw badRequest("Pengiriman sudah selesai");
  if (data.status === "DELIVERED" && !(data.receivedBy ?? d.receivedBy)) throw badRequest("Nama penerima (receivedBy) wajib diisi");
  if (data.status === "FAILED" && !(data.failureReason ?? d.failureReason)) throw badRequest("failureReason wajib diisi");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.delivery.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === "ON_THE_WAY" && { shippedAt: new Date() }),
        ...(data.status === "DELIVERED" && { deliveredAt: new Date() }),
        ...(!data.status && (data.courierName || data.courierPhone) && d.status === "WAITING" && { status: "ASSIGNED" }),
      },
    });
    if (data.status === "ON_THE_WAY" && d.order.status === "READY") {
      await changeStatus(tx, d.orderId, "DELIVERING", { userId: user.id, note: "Pesanan dalam perjalanan" });
    }
    if (data.status === "DELIVERED") {
      if (d.order.status === "READY") await changeStatus(tx, d.orderId, "DELIVERING", { userId: user.id });
      await changeStatus(tx, d.orderId, "COMPLETED", { userId: user.id, note: "Pesanan diterima pelanggan" });
    }
    return updated;
  });
}
