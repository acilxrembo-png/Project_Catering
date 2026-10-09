import { prisma } from "../../lib/prisma.js";
import { uniqueSlug } from "../../lib/slug.js";
import { notFound } from "../../lib/httpError.js";

export const list = (all) =>
  prisma.category.findMany({
    where: all ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { deletedAt: null, isAvailable: true } } } } },
  });

export async function get(id) {
  const c = await prisma.category.findUnique({ where: { id } });
  if (!c) throw notFound("Kategori tidak ditemukan");
  return c;
}

export async function create(data) {
  return prisma.category.create({ data: { ...data, slug: await uniqueSlug(prisma.category, data.name) } });
}

export async function update(id, data) {
  await get(id);
  const slug = data.name ? await uniqueSlug(prisma.category, data.name, id) : undefined;
  return prisma.category.update({ where: { id }, data: { ...data, slug } });
}

export async function remove(id) {
  await get(id);
  const used = await prisma.product.count({ where: { categoryId: id } });
  if (used > 0) {
    await prisma.category.update({ where: { id }, data: { isActive: false } });
    return { message: "Kategori memiliki produk, dinonaktifkan (tidak dihapus)" };
  }
  await prisma.category.delete({ where: { id } });
  return { message: "Kategori dihapus" };
}
