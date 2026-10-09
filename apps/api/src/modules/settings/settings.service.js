import { prisma } from "../../lib/prisma.js";
import { audit } from "../../lib/audit.js";

// kunci yang aman ditampilkan ke publik
export const PUBLIC_KEYS = ["business_name", "business_phone", "business_address", "operating_hours", "default_dp_percent", "tax_percent", "service_fee_percent", "bank_accounts"];

export async function listPublic() {
  const rows = await prisma.setting.findMany({ where: { key: { in: PUBLIC_KEYS } } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export const listAll = () => prisma.setting.findMany({ orderBy: { key: "asc" } });

export async function upsert(req, key, value) {
  const old = await prisma.setting.findUnique({ where: { key } });
  const row = await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  await audit({ req, action: "UPDATE", entity: "Setting", entityId: key, oldValue: old?.value, newValue: value });
  return row;
}
