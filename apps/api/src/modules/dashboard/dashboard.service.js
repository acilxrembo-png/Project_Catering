import { prisma } from "../../lib/prisma.js";
import { addHours, endOfDay, startOfDay, startOfMonth } from "../../lib/dates.js";

const sum = (agg) => Number(agg._sum.amount ?? 0);

export async function stats() {
  const now = new Date();
  const today = startOfDay(now);
  const month = startOfMonth(now);
  const paidWhere = (from) => ({ status: "SUCCESS", paidAt: { gte: from } });

  const [byStatus, revenueToday, revenueMonth, expenseMonth, upcoming, topProducts, lowStock, needVerify, ordersToday] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: paidWhere(today) }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: paidWhere(month) }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { expenseDate: { gte: month } } }),
    prisma.order.findMany({
      where: { eventDate: { gte: now, lte: addHours(now, 24 * 7) }, status: { in: ["PAID", "CONFIRMED", "PREPARING", "READY", "DELIVERING"] } },
      orderBy: { eventDate: "asc" }, take: 10,
      select: { id: true, orderNumber: true, eventName: true, eventDate: true, status: true, customer: { select: { name: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"], _sum: { quantity: true, subtotal: true },
      where: { order: { createdAt: { gte: month }, status: { notIn: ["CANCELLED", "REFUNDED"] } } },
      orderBy: { _sum: { quantity: "desc" } }, take: 5,
    }),
    prisma.$queryRaw`SELECT id, name, unit, stock::float AS stock, "minStock"::float AS "minStock" FROM "Ingredient" WHERE "isActive" = true AND stock <= "minStock" ORDER BY name LIMIT 20`,
    prisma.payment.count({ where: { gateway: "MANUAL", status: "PENDING", method: "BANK_TRANSFER" } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
  ]);

  const revenue = sum(revenueMonth);
  const expense = sum(expenseMonth);
  return {
    ordersToday,
    ordersByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    revenueToday: sum(revenueToday),
    revenueMonth: revenue,
    expenseMonth: expense,
    profitMonth: revenue - expense,
    pendingTransferVerifications: needVerify,
    upcomingOrders: upcoming,
    topProducts: topProducts.map((p) => ({ productId: p.productId, name: p.productName, quantity: p._sum.quantity, revenue: Number(p._sum.subtotal) })),
    lowStockIngredients: lowStock,
  };
}

// grafik pendapatan harian (default 30 hari terakhir)
export async function revenueChart(days = 30) {
  const from = startOfDay(addHours(new Date(), -24 * (days - 1)));
  const rows = await prisma.$queryRaw`
    SELECT date_trunc('day', "paidAt") AS day, SUM(amount)::float AS total
    FROM "Payment" WHERE status = 'SUCCESS' AND "paidAt" >= ${from}
    GROUP BY 1 ORDER BY 1`;
  return rows.map((r) => ({ date: r.day.toISOString().slice(0, 10), total: r.total }));
}

export async function kitchen() {
  const today = startOfDay();
  const [tasks, upcoming] = await Promise.all([
    prisma.productionTask.groupBy({ by: ["status"], _count: true, where: { dueAt: { gte: today, lt: addHours(endOfDay(), 24 * 2) } } }),
    prisma.productionTask.findMany({
      where: { status: { in: ["QUEUED", "IN_PROGRESS"] } }, orderBy: [{ priority: "desc" }, { dueAt: "asc" }], take: 10,
      include: { order: { select: { orderNumber: true, eventDate: true } }, orderItem: { select: { productName: true, quantity: true } } },
    }),
  ]);
  return { tasksByStatus: Object.fromEntries(tasks.map((t) => [t.status, t._count])), nextTasks: upcoming };
}
