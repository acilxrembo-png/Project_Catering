import { z } from "zod";
export const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const updateCategorySchema = categorySchema.partial();
