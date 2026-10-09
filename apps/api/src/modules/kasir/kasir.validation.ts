// @ts-nocheck
import { z } from "zod";
export const openShiftSchema = z.object({ openingCash: z.coerce.number().nonnegative() });
export const closeShiftSchema = z.object({ closingCash: z.coerce.number().nonnegative(), notes: z.string().max(300).optional() });
