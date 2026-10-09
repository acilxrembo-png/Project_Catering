// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { badRequest, notFound } from "../../lib/httpError.js";

const include = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      product: {
        select: {
          id: true, name: true, slug: true, basePrice: true, unit: true, minOrderQty: true,
          maxOrderQty: true, leadTimeHours: true, isAvailable: true,
          images: { orderBy: [{ isPrimary: "desc" }], take: 1 },
        },
      },
      variant: true,
    },
  },
};

function summarize(cart) {
  const items = cart.items.map((it) => {
    const unitPrice = Number(it.variant?.price ?? it.product.basePrice);
    return { ...it, unitPrice, subtotal: unitPrice * it.quantity };
  });
  return { id: cart.id, items, subtotal: items.reduce((s, i) => s + i.subtotal, 0) };
}

async function ensureCart(userId) {
  return prisma.cart.upsert({ where: { userId }, update: {}, create: { userId }, include });
}

export const getCart = async (userId) => summarize(await ensureCart(userId));

export async function addItem(userId, { productId, variantId, quantity, notes }) {
  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null, isAvailable: true },
    include: { variants: { where: { isAvailable: true } } },
  });
  if (!product) throw notFound("Produk tidak tersedia");
  if (product.variants.length && !variantId) throw badRequest("Pilih varian produk terlebih dahulu");
  if (variantId && !product.variants.some((v) => v.id === variantId)) throw badRequest("Varian tidak valid");

  const cart = await ensureCart(userId);
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId: variantId ?? null },
  });
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity, ...(notes && { notes }) },
    });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity, notes } });
  }
  return getCart(userId);
}

async function ownItem(userId, id) {
  const item = await prisma.cartItem.findFirst({ where: { id, cart: { userId } } });
  if (!item) throw notFound("Item keranjang tidak ditemukan");
  return item;
}

export async function updateItem(userId, id, data) {
  await ownItem(userId, id);
  await prisma.cartItem.update({ where: { id }, data });
  return getCart(userId);
}

export async function removeItem(userId, id) {
  await ownItem(userId, id);
  await prisma.cartItem.delete({ where: { id } });
  return getCart(userId);
}

export async function clear(userId) {
  await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
  return getCart(userId);
}
