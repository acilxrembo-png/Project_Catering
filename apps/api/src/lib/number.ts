// @ts-nocheck
import { startOfDay } from "./dates.js";

const pad = (n) => String(n).padStart(2, "0");

// contoh: ORD-20261009-0001 (urutan per hari)
export async function generateNumber(db, model, prefix, dateField = "createdAt") {
  const now = new Date();
  const ymd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const count = await db[model].count({ where: { [dateField]: { gte: startOfDay(now) } } });
  return `${prefix}-${ymd}-${String(count + 1).padStart(4, "0")}`;
}
