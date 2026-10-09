import { prisma } from "../../lib/prisma.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";

export async function list(q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(q.entity && { entity: q.entity }),
    ...(q.entityId && { entityId: q.entityId }),
    ...(q.userId && { userId: Number(q.userId) }),
    ...(q.action && { action: q.action }),
    ...((q.from || q.to) && { createdAt: { ...(q.from && { gte: new Date(q.from) }), ...(q.to && { lte: new Date(q.to) }) } }),
  };
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, role: true } } } }),
    prisma.auditLog.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}
