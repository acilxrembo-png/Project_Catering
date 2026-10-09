// @ts-nocheck
import { z } from "zod";
export const addItemSchema = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().optional(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().max(300).optional(),
});
export const updateItemSchema = z.object({
  quantity: z.number().int().positive().optional(),
  notes: z.string().max(300).nullable().optional(),
});
