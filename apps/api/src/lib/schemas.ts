// @ts-nocheck
import { z } from "zod";
export const idParam = z.object({ id: z.coerce.number().int().positive() });
export const money = z.coerce.number().nonnegative();
