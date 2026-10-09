// @ts-nocheck
import { z } from "zod";
export const assignSchema = z.object({ assignedToId: z.number().int().positive().nullable() });
export const taskStatusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "DONE", "CANCELLED"]),
  notes: z.string().max(300).optional(),
});
