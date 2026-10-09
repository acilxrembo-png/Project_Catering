import { z } from "zod";
export const expenseSchema = z.object({
  category: z.enum(["BAHAN_BAKU", "GAJI", "OPERASIONAL", "TRANSPORT", "PERALATAN", "MARKETING", "LAINNYA"]),
  description: z.string().min(3),
  amount: z.coerce.number().positive(),
  expenseDate: z.coerce.date().optional(),
  receiptUrl: z.string().url().optional(),
  supplierId: z.number().int().positive().optional(),
});
export const updateExpenseSchema = expenseSchema.partial();
