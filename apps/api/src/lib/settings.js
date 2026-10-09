import { prisma } from "./prisma.js";

export async function getSetting(key, fallback, db = prisma) {
  const row = await db.setting.findUnique({ where: { key } });
  return row ? row.value : fallback;
}
