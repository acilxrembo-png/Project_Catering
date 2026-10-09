import { z } from "zod";
export const zoneSchema = z.object({
  name: z.string().min(2),
  fee: z.coerce.number().nonnegative(),
  minOrderAmount: z.coerce.number().nonnegative().default(0),
  freeShippingOver: z.coerce.number().positive().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});
export const updateZoneSchema = zoneSchema.partial();
