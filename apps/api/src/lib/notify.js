import { prisma } from "./prisma.js";

export async function notify(userId, type, title, body, data, db = prisma) {
  try {
    await db.notification.create({ data: { userId, type, title, body, data } });
  } catch (e) {
    console.error("Gagal membuat notifikasi:", e.message);
  }
}

// kirim ke semua staf dengan role tertentu
export async function notifyRoles(roles, type, title, body, data, db = prisma) {
  const users = await db.user.findMany({ where: { role: { in: roles }, isActive: true }, select: { id: true } });
  await Promise.all(users.map((u) => notify(u.id, type, title, body, data, db)));
}
