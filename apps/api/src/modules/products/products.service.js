import { prisma } from "../../lib/prisma.js";
import { uniqueSlug } from "../../lib/slug.js";
import { badRequest, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";

const listInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
  variants: { where: { isAvailable: true }, orderBy: { price: "asc" } },
};

export async function list(q, staff) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    deletedAt: null,
    ...(!(staff && q.all === "true") && { isAvailable: true, category: { isActive: true } }),
    ...(q.categoryId && { categoryId: Number(q.categoryId) }),
    ...(q.type && { type: q.type }),
    ...(q.featured === "true" && { isFeatured: true }),
    ...(q.q && { name: { contains: q.q, mode: "insensitive" } }),
  };
  const orderBy =
    q.sort === "price_asc" ? { basePrice: "asc" } : q.sort === "price_desc" ? { basePrice: "desc" } : { createdAt: "desc" };
  const [data, total] = await Promise.all([
    prisma.product.findMany({ where, include: listInclude, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

export async function get(idOrSlug, staff) {
  const where = /^\d+$/.test(idOrSlug) ? { id: Number(idOrSlug) } : { slug: idOrSlug };
  const product = await prisma.product.findFirst({
    where: { ...where, deletedAt: null },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      variants: true,
      packageItems: { include: { product: { select: { id: true, name: true, unit: true } } } },
      ...(staff && { recipeItems: { include: { ingredient: true } } }),
    },
  });
  if (!product || (!staff && !product.isAvailable)) throw notFound("Produk tidak ditemukan");
  const rating = await prisma.review.aggregate({
    where: { productId: product.id, isVisible: true },
    _avg: { rating: true },
    _count: true,
  });
  return { ...product, rating: { average: rating._avg.rating, count: rating._count } };
}

async function assertPackage(type, packageItems = []) {
  if (type === "PACKAGE" && packageItems.length === 0) throw badRequest("Produk paket wajib punya isi paket");
  if (packageItems.length) {
    const ids = packageItems.map((p) => p.productId);
    const found = await prisma.product.count({ where: { id: { in: ids }, type: "SINGLE", deletedAt: null } });
    if (found !== new Set(ids).size) throw badRequest("Isi paket harus berupa produk SINGLE yang valid");
  }
}

export async function create(input) {
  const { images, variants, packageItems, recipe, ...data } = input;
  await assertPackage(data.type, packageItems);
  const slug = await uniqueSlug(prisma.product, data.name);
  return prisma.product.create({
    data: {
      ...data,
      slug,
      images: images && { create: images },
      variants: variants && { create: variants },
      packageItems: packageItems && { create: packageItems },
      recipeItems: recipe && { create: recipe },
    },
    include: { images: true, variants: true, packageItems: true, recipeItems: true },
  });
}

export async function update(id, input) {
  const { images, variants, packageItems, recipe, ...data } = input;
  const old = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!old) throw notFound("Produk tidak ditemukan");
  await assertPackage(data.type ?? old.type, packageItems);
  const slug = data.name ? await uniqueSlug(prisma.product, data.name, id) : undefined;
  return prisma.$transaction(async (tx) => {
    if (images) await tx.productImage.deleteMany({ where: { productId: id } });
    if (packageItems) await tx.packageItem.deleteMany({ where: { packageId: id } });
    if (recipe) await tx.recipeItem.deleteMany({ where: { productId: id } });
    return tx.product.update({
      where: { id },
      data: {
        ...data,
        slug,
        ...(images && { images: { create: images } }),
        ...(packageItems && { packageItems: { create: packageItems } }),
        ...(recipe && { recipeItems: { create: recipe } }),
      },
      include: { images: true, variants: true, packageItems: true, recipeItems: true },
    });
  });
}

// soft delete
export async function remove(id) {
  const p = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!p) throw notFound("Produk tidak ditemukan");
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isAvailable: false } });
}

export async function addVariant(productId, data) {
  const p = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } });
  if (!p) throw notFound("Produk tidak ditemukan");
  return prisma.productVariant.create({ data: { ...data, productId } });
}

export const updateVariant = (id, data) => prisma.productVariant.update({ where: { id }, data });

export async function removeVariant(id) {
  const used = await prisma.orderItem.count({ where: { variantId: id } });
  if (used > 0) {
    await prisma.productVariant.update({ where: { id }, data: { isAvailable: false } });
    return { message: "Varian sudah pernah dipesan, dinonaktifkan" };
  }
  await prisma.cartItem.deleteMany({ where: { variantId: id } });
  await prisma.productVariant.delete({ where: { id } });
  return { message: "Varian dihapus" };
}
