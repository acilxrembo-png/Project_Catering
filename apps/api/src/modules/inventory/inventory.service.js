import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";

// ---- bahan baku
export async function listIngredients(q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(q.q && { name: { contains: q.q, mode: "insensitive" } }),
    ...(q.supplierId && { supplierId: Number(q.supplierId) }),
    ...(q.active !== undefined && { isActive: q.active === "true" }),
  };
  const [rows, total] = await Promise.all([
    prisma.ingredient.findMany({ where, include: { supplier: { select: { id: true, name: true } } }, orderBy: { name: "asc" }, skip, take: limit }),
    prisma.ingredient.count({ where }),
  ]);
  const data = rows.map((r) => ({ ...r, isLow: Number(r.stock) <= Number(r.minStock) }));
  return { data: q.low === "true" ? data.filter((d) => d.isLow) : data, meta: pageMeta(page, limit, total) };
}

export async function getIngredient(id) {
  const i = await prisma.ingredient.findUnique({ where: { id }, include: { supplier: true } });
  if (!i) throw notFound("Bahan tidak ditemukan");
  return i;
}

export async function createIngredient(data, userId) {
  const { stock, ...rest } = data;
  return prisma.$transaction(async (tx) => {
    const ing = await tx.ingredient.create({ data: { ...rest, stock } });
    if (Number(stock) > 0) {
      await tx.stockMovement.create({
        data: { ingredientId: ing.id, type: "ADJUSTMENT", quantity: stock, unitCost: rest.costPerUnit, note: "Stok awal", createdById: userId },
      });
    }
    return ing;
  });
}

export async function updateIngredient(id, data) {
  await getIngredient(id);
  return prisma.ingredient.update({ where: { id }, data });
}

export async function removeIngredient(id) {
  await getIngredient(id);
  const used = (await prisma.recipeItem.count({ where: { ingredientId: id } })) + (await prisma.stockMovement.count({ where: { ingredientId: id } }));
  if (used > 0) {
    await prisma.ingredient.update({ where: { id }, data: { isActive: false } });
    return { message: "Bahan sudah dipakai, dinonaktifkan" };
  }
  await prisma.ingredient.delete({ where: { id } });
  return { message: "Bahan dihapus" };
}

// ---- pergerakan stok
export async function addMovement(userId, { ingredientId, type, quantity, unitCost, note }) {
  const signed =
    type === "PURCHASE" ? Math.abs(quantity)
    : type === "ADJUSTMENT" ? quantity
    : -Math.abs(quantity); // USAGE, WASTE, RETURN
  return prisma.$transaction(async (tx) => {
    const ing = await tx.ingredient.findUnique({ where: { id: ingredientId } });
    if (!ing) throw notFound("Bahan tidak ditemukan");
    if (Number(ing.stock) + signed < 0 && type !== "USAGE") throw badRequest("Stok tidak mencukupi");
    const movement = await tx.stockMovement.create({
      data: { ingredientId, type, quantity: signed, unitCost, note, createdById: userId },
    });
    await tx.ingredient.update({
      where: { id: ingredientId },
      data: { stock: { increment: signed }, ...(type === "PURCHASE" && unitCost != null && { costPerUnit: unitCost }) },
    });
    return movement;
  });
}

export async function listMovements(q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(q.ingredientId && { ingredientId: Number(q.ingredientId) }),
    ...(q.type && { type: q.type }),
    ...(q.orderId && { orderId: Number(q.orderId) }),
  };
  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where, skip, take: limit, orderBy: { createdAt: "desc" },
      include: { ingredient: { select: { name: true, unit: true } }, createdBy: { select: { name: true } } },
    }),
    prisma.stockMovement.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

// ---- supplier
export const listSuppliers = () => prisma.supplier.findMany({ orderBy: { name: "asc" } });
export const createSupplier = (data) => prisma.supplier.create({ data });
export async function updateSupplier(id, data) {
  if (!(await prisma.supplier.findUnique({ where: { id } }))) throw notFound("Supplier tidak ditemukan");
  return prisma.supplier.update({ where: { id }, data });
}
export async function removeSupplier(id) {
  const used = (await prisma.ingredient.count({ where: { supplierId: id } })) + (await prisma.expense.count({ where: { supplierId: id } }));
  if (used > 0) {
    await prisma.supplier.update({ where: { id }, data: { isActive: false } });
    return { message: "Supplier sudah dipakai, dinonaktifkan" };
  }
  await prisma.supplier.delete({ where: { id } });
  return { message: "Supplier dihapus" };
}
