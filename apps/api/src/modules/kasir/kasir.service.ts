// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";

export async function openShift(userId, { openingCash }) {
  const open = await prisma.cashierShift.findFirst({ where: { cashierId: userId, status: "OPEN" } });
  if (open) throw badRequest("Anda masih memiliki shift yang terbuka");
  return prisma.cashierShift.create({ data: { cashierId: userId, openingCash } });
}

async function summarize(shift) {
  const rows = await prisma.payment.groupBy({
    by: ["method"],
    _sum: { amount: true },
    _count: true,
    where: { cashierShiftId: shift.id, status: "SUCCESS" },
  });
  const byMethod = Object.fromEntries(rows.map((r) => [r.method, { total: Number(r._sum.amount), count: r._count }]));
  const cashIn = byMethod.CASH?.total ?? 0;
  return { ...shift, byMethod, totalPayments: rows.reduce((s, r) => s + Number(r._sum.amount), 0), expectedCashNow: Number(shift.openingCash) + cashIn };
}

export async function currentShift(userId) {
  const shift = await prisma.cashierShift.findFirst({ where: { cashierId: userId, status: "OPEN" } });
  if (!shift) throw notFound("Tidak ada shift yang terbuka");
  return summarize(shift);
}

export async function closeShift(userId, { closingCash, notes }) {
  const shift = await prisma.cashierShift.findFirst({ where: { cashierId: userId, status: "OPEN" } });
  if (!shift) throw badRequest("Tidak ada shift yang terbuka");
  const s = await summarize(shift);
  const expectedCash = s.expectedCashNow;
  return prisma.cashierShift.update({
    where: { id: shift.id },
    data: { status: "CLOSED", closedAt: new Date(), closingCash, expectedCash, difference: closingCash - expectedCash, notes },
  });
}

export async function listShifts(user, q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(user.role === "KASIR" && { cashierId: user.id }),
    ...(q.cashierId && user.role === "ADMIN" && { cashierId: Number(q.cashierId) }),
    ...(q.status && { status: q.status }),
  };
  const [data, total] = await Promise.all([
    prisma.cashierShift.findMany({ where, skip, take: limit, orderBy: { openedAt: "desc" }, include: { cashier: { select: { name: true } } } }),
    prisma.cashierShift.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

export async function getShift(user, id) {
  const shift = await prisma.cashierShift.findUnique({ where: { id }, include: { cashier: { select: { name: true } }, payments: { include: { order: { select: { orderNumber: true } } } } } });
  if (!shift) throw notFound("Shift tidak ditemukan");
  if (user.role === "KASIR" && shift.cashierId !== user.id) throw forbidden("Bukan shift Anda");
  return summarize(shift);
}
