import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../lib/httpError.js";

// Dipakai juga oleh modul orders
export async function validateVoucher({ code, userId, subtotal }, db = prisma) {
  const voucher = await db.voucher.findUnique({ where: { code: String(code).toUpperCase().trim() } });
  const now = new Date();
  if (!voucher || !voucher.isActive) throw badRequest("Kode voucher tidak valid");
  if (now < voucher.startAt || now > voucher.endAt) throw badRequest("Voucher belum berlaku atau sudah berakhir");
  if (voucher.quota != null && voucher.usedCount >= voucher.quota) throw badRequest("Kuota voucher sudah habis");
  if (subtotal < Number(voucher.minOrderAmount)) {
    throw badRequest(`Minimal belanja untuk voucher ini Rp${Number(voucher.minOrderAmount).toLocaleString("id-ID")}`);
  }
  const used = await db.voucherUsage.count({ where: { voucherId: voucher.id, userId } });
  if (used >= voucher.perUserLimit) throw badRequest("Batas pemakaian voucher untuk akun Anda sudah tercapai");

  let discount =
    voucher.discountType === "PERCENTAGE"
      ? (subtotal * Number(voucher.discountValue)) / 100
      : Number(voucher.discountValue);
  if (voucher.maxDiscount != null) discount = Math.min(discount, Number(voucher.maxDiscount));
  discount = Math.min(Math.round(discount), subtotal);
  return { voucher, discount };
}

export async function check(userId, { code, subtotal }) {
  const { voucher, discount } = await validateVoucher({ code, userId, subtotal });
  return { code: voucher.code, name: voucher.name, discount, totalAfterDiscount: subtotal - discount };
}

export const list = (activeOnly) =>
  prisma.voucher.findMany({
    where: activeOnly ? { isActive: true, endAt: { gte: new Date() }, startAt: { lte: new Date() } } : {},
    orderBy: { createdAt: "desc" },
  });

export const create = (data) => prisma.voucher.create({ data });

export async function update(id, data) {
  const v = await prisma.voucher.findUnique({ where: { id } });
  if (!v) throw notFound("Voucher tidak ditemukan");
  return prisma.voucher.update({ where: { id }, data });
}

export async function remove(id) {
  const used = await prisma.voucherUsage.count({ where: { voucherId: id } });
  if (used > 0) {
    await prisma.voucher.update({ where: { id }, data: { isActive: false } });
    return { message: "Voucher sudah pernah dipakai, dinonaktifkan" };
  }
  await prisma.voucher.delete({ where: { id } });
  return { message: "Voucher dihapus" };
}
