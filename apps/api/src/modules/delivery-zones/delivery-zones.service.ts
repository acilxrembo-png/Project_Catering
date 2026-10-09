// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../lib/httpError.js";

export const list = (all) =>
  prisma.deliveryZone.findMany({ where: all ? {} : { isActive: true }, orderBy: { name: "asc" } });
export const create = (data) => prisma.deliveryZone.create({ data });

export async function update(id, data) {
  if (!(await prisma.deliveryZone.findUnique({ where: { id } }))) throw notFound("Zona tidak ditemukan");
  return prisma.deliveryZone.update({ where: { id }, data });
}

export async function remove(id) {
  const used = await prisma.order.count({ where: { deliveryZoneId: id } });
  if (used > 0) {
    await prisma.deliveryZone.update({ where: { id }, data: { isActive: false } });
    return { message: "Zona sudah dipakai pesanan, dinonaktifkan" };
  }
  await prisma.deliveryZone.delete({ where: { id } });
  return { message: "Zona dihapus" };
}
