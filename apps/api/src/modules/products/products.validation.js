import { z } from "zod";

const image = z.object({
  url: z.string().url(),
  altText: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});
const variant = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  price: z.coerce.number().positive(),
  isAvailable: z.boolean().default(true),
});

const base = z.object({
  categoryId: z.number().int().positive(),
  sku: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["SINGLE", "PACKAGE"]).default("SINGLE"),
  basePrice: z.coerce.number().positive(),
  unit: z.string().default("porsi"),
  minOrderQty: z.number().int().positive().default(1),
  maxOrderQty: z.number().int().positive().optional(),
  leadTimeHours: z.number().int().nonnegative().default(24),
  dailyCapacity: z.number().int().positive().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  calories: z.number().int().optional(),
  allergens: z.string().optional(),
  images: z.array(image).optional(),
  packageItems: z.array(z.object({ productId: z.number().int(), quantity: z.number().int().positive().default(1) })).optional(),
  recipe: z.array(z.object({ ingredientId: z.number().int(), quantityPerUnit: z.coerce.number().positive() })).optional(),
});

export const createProductSchema = base.extend({ variants: z.array(variant).optional() });
// update: semua opsional; images/packageItems/recipe jika dikirim akan MENGGANTI isi lama
export const updateProductSchema = base.partial().extend({
  images: base.shape.images,
  packageItems: base.shape.packageItems,
  recipe: base.shape.recipe,
});
export const variantSchema = variant;
export const updateVariantSchema = variant.partial();
