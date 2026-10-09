// @ts-nocheck
import { z } from "zod";

const type = z.enum(["FULL", "DOWN_PAYMENT", "SETTLEMENT"]);

export const createGatewayPaymentSchema = z.object({
  orderId: z.number().int().positive(),
  type,
  gateway: z.enum(["MIDTRANS"]).default("MIDTRANS"),
});

// pelanggan upload bukti transfer manual
export const submitTransferSchema = z.object({
  orderId: z.number().int().positive(),
  type,
  amount: z.coerce.number().positive(),
  channel: z.string().optional(), // BCA, BNI, dll
  proofUrl: z.string().url(),
});

// kasir/admin mencatat pembayaran langsung (tunai/EDC/transfer terverifikasi)
export const manualPaymentSchema = z.object({
  orderId: z.number().int().positive(),
  type,
  method: z.enum(["CASH", "EDC", "BANK_TRANSFER", "QRIS"]),
  amount: z.coerce.number().positive(),
  channel: z.string().optional(),
  proofUrl: z.string().url().optional(),
});

export const verifyPaymentSchema = z.object({
  approve: z.boolean(),
  reason: z.string().max(300).optional(),
});
