import { z } from "zod";

export const createOrderSchema = z
  .object({
    // hanya untuk ADMIN/KASIR yang membuatkan pesanan
    customerId: z.number().int().positive().optional(),
    source: z.enum(["ONLINE", "POS", "WHATSAPP"]).optional(),

    fromCart: z.boolean().default(false),
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          variantId: z.number().int().positive().optional(),
          quantity: z.number().int().positive(),
          notes: z.string().max(300).optional(),
        })
      )
      .optional(),

    fulfillmentType: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
    eventName: z.string().max(150).optional(),
    eventDate: z.coerce.date(),
    guestCount: z.number().int().positive().optional(),

    addressId: z.number().int().positive().optional(),
    shippingName: z.string().optional(),
    shippingPhone: z.string().optional(),
    shippingAddress: z.string().optional(),
    deliveryZoneId: z.number().int().positive().optional(),

    voucherCode: z.string().optional(),
    paymentScheme: z.enum(["FULL", "DOWN_PAYMENT"]).default("FULL"),
    dpPercentage: z.number().int().min(10).max(90).optional(),
    customerNotes: z.string().max(500).optional(),
    internalNotes: z.string().max(500).optional(),
  })
  .refine((v) => v.fromCart || (v.items && v.items.length > 0), {
    message: "Isi items atau gunakan fromCart=true",
    path: ["items"],
  });

export const updateStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "PREPARING", "READY", "DELIVERING", "COMPLETED", "CANCELLED"]),
  note: z.string().max(300).optional(),
  reason: z.string().max(300).optional(),
});
export const cancelSchema = z.object({ reason: z.string().min(3).max(300) });
export const updateNotesSchema = z.object({ internalNotes: z.string().max(500) });
