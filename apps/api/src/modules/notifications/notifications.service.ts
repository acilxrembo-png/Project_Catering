// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";

export async function list(userId, q) {
  const { page, limit, skip } = getPagination(q);
  const where = { userId, ...(q.unread === "true" && { isRead: false }), ...(q.type && { type: q.type }) };
  const [data, total, unread] = await Promise.all([
    prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { data, meta: { ...pageMeta(page, limit, total), unread } };
}

export async function markRead(userId, id) {
  const n = await prisma.notification.findFirst({ where: { id, userId } });
  if (!n) throw notFound("Notifikasi tidak ditemukan");
  return prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
}

export const markAllRead = (userId) =>
  prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
