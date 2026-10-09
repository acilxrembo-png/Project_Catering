import { prisma } from "../../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";
import { notify } from "../../lib/notify.js";

export async function create(user, { orderItemId, ...data }) {
  const item = await prisma.orderItem.findUnique({ where: { id: orderItemId }, include: { order: true } });
  if (!item) throw notFound("Item pesanan tidak ditemukan");
  if (item.order.customerId !== user.id) throw forbidden("Bukan pesanan Anda");
  if (item.order.status !== "COMPLETED") throw badRequest("Review hanya dapat diberikan setelah pesanan selesai");
  if (await prisma.review.findUnique({ where: { orderItemId } })) throw badRequest("Item ini sudah direview");
  return prisma.review.create({
    data: { ...data, orderItemId, userId: user.id, productId: item.productId, orderId: item.orderId },
  });
}

export async function listByProduct(productId, q) {
  const { page, limit, skip } = getPagination(q);
  const where = { productId, isVisible: true };
  const [data, total, agg] = await Promise.all([
    prisma.review.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, avatarUrl: true } } } }),
    prisma.review.count({ where }),
    prisma.review.aggregate({ where, _avg: { rating: true } }),
  ]);
  return { data, meta: { ...pageMeta(page, limit, total), averageRating: agg._avg.rating } };
}

export async function listAll(q) {
  const { page, limit, skip } = getPagination(q);
  const where = { ...(q.productId && { productId: Number(q.productId) }), ...(q.unreplied === "true" && { adminReply: null }) };
  const [data, total] = await Promise.all([
    prisma.review.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } }, product: { select: { name: true } } } }),
    prisma.review.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

export async function reply(id, adminReply) {
  const r = await prisma.review.findUnique({ where: { id } });
  if (!r) throw notFound("Review tidak ditemukan");
  const updated = await prisma.review.update({ where: { id }, data: { adminReply } });
  await notify(r.userId, "SYSTEM", "Balasan untuk review Anda", adminReply.slice(0, 120), { reviewId: id });
  return updated;
}

export async function setVisibility(id, isVisible) {
  if (!(await prisma.review.findUnique({ where: { id } }))) throw notFound("Review tidak ditemukan");
  return prisma.review.update({ where: { id }, data: { isVisible } });
}
