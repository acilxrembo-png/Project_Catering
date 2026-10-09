import { prisma } from "./prisma.js";

export async function audit({ req, userId, action, entity, entityId, oldValue, newValue }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? req?.user?.id ?? null,
        action,
        entity,
        entityId: entityId != null ? String(entityId) : null,
        oldValue,
        newValue,
        ipAddress: req?.ip,
        userAgent: req?.headers?.["user-agent"],
      },
    });
  } catch (e) {
    console.error("Gagal menulis audit log:", e.message);
  }
}
