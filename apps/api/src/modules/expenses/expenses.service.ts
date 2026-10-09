// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";
import { audit } from "../../lib/audit.js";

export async function list(q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(q.category && { category: q.category }),
    ...((q.from || q.to) && { expenseDate: { ...(q.from && { gte: new Date(q.from) }), ...(q.to && { lte: new Date(q.to) }) } }),
  };
  const [data, total, sum] = await Promise.all([
    prisma.expense.findMany({ where, skip, take: limit, orderBy: { expenseDate: "desc" }, include: { supplier: { select: { name: true } }, createdBy: { select: { name: true } } } }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ]);
  return { data, meta: { ...pageMeta(page, limit, total), totalAmount: Number(sum._sum.amount ?? 0) } };
}

export const create = (userId, data) => prisma.expense.create({ data: { ...data, createdById: userId } });

export async function update(req, id, data) {
  const old = await prisma.expense.findUnique({ where: { id } });
  if (!old) throw notFound("Pengeluaran tidak ditemukan");
  const updated = await prisma.expense.update({ where: { id }, data });
  await audit({ req, action: "UPDATE", entity: "Expense", entityId: id, oldValue: { amount: old.amount }, newValue: { amount: updated.amount } });
  return updated;
}

export async function remove(req, id) {
  const old = await prisma.expense.findUnique({ where: { id } });
  if (!old) throw notFound("Pengeluaran tidak ditemukan");
  await prisma.expense.delete({ where: { id } });
  await audit({ req, action: "DELETE", entity: "Expense", entityId: id, oldValue: { amount: old.amount, description: old.description } });
}

// rekap per kategori
export async function summary(q) {
  const rows = await prisma.expense.groupBy({
    by: ["category"],
    _sum: { amount: true },
    where: (q.from || q.to) ? { expenseDate: { ...(q.from && { gte: new Date(q.from) }), ...(q.to && { lte: new Date(q.to) }) } } : {},
  });
  return rows.map((r) => ({ category: r.category, total: Number(r._sum.amount) }));
}
