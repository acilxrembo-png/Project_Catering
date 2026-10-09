import { z } from "zod";
export const requestRefundSchema = z.object({
  paymentId: z.number().int().positive(),
  amount: z.coerce.number().positive(),
  reason: z.string().min(5).max(300),
});
