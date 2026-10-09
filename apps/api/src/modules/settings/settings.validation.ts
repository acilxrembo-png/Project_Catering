// @ts-nocheck
import { z } from "zod";
export const settingSchema = z.object({ value: z.any().refine((v) => v !== undefined, "value wajib diisi") });
