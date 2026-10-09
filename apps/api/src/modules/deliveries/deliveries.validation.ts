// @ts-nocheck
import { z } from "zod";
export const updateDeliverySchema = z.object({
  status: z.enum(["WAITING", "ASSIGNED", "ON_THE_WAY", "DELIVERED", "FAILED", "RETURNED"]).optional(),
  courierName: z.string().optional(),
  courierPhone: z.string().optional(),
  vehicleInfo: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
  receivedBy: z.string().optional(),
  proofPhotoUrl: z.string().url().optional(),
  failureReason: z.string().optional(),
  notes: z.string().optional(),
});
