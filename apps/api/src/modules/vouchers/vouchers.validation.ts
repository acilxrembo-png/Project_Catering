// @ts-nocheck
import { z } from "zod";

export const voucherSchema = z
  .object({
    code: z.string().min(3).transform((s) => s.toUpperCase().replace(/\s+/g, "")),
    name: z.string().min(2),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.coerce.number().positive(),
    maxDiscount: z.coerce.number().positive().optional(),
    minOrderAmount: z.coerce.number().nonnegative().default(0),
    quota: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().default(1),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    isActive: z.boolean().default(true),
  })
  .refine((v) => v.endAt > v.startAt, { message: "endAt harus setelah startAt", path: ["endAt"] })
  .refine((v) => v.discountType !== "PERCENTAGE" || v.discountValue <= 100, {
    message: "Persentase maksimal 100",
    path: ["discountValue"],
  });
export const updateVoucherSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  discountValue: z.coerce.number().positive().optional(),
  maxDiscount: z.coerce.number().positive().nullable().optional(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  quota: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});
export const checkVoucherSchema = z.object({ code: z.string().min(1), subtotal: z.coerce.number().positive() });
