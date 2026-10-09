// @ts-nocheck
import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(2),
  unit: z.string().min(1),
  stock: z.coerce.number().nonnegative().default(0),
  minStock: z.coerce.number().nonnegative().default(0),
  costPerUnit: z.coerce.number().nonnegative().default(0),
  supplierId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().default(true),
});
// stok hanya berubah lewat pergerakan stok
export const updateIngredientSchema = ingredientSchema.omit({ stock: true }).partial();

export const supplierSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});
export const updateSupplierSchema = supplierSchema.partial();

export const movementSchema = z.object({
  ingredientId: z.number().int().positive(),
  type: z.enum(["PURCHASE", "USAGE", "ADJUSTMENT", "WASTE", "RETURN"]),
  // PURCHASE: masuk; USAGE/WASTE/RETURN: keluar (isi angka positif); ADJUSTMENT: boleh negatif
  quantity: z.coerce.number().refine((n) => n !== 0, "Tidak boleh 0"),
  unitCost: z.coerce.number().nonnegative().optional(),
  note: z.string().max(300).optional(),
});
