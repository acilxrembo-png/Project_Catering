import { z } from "zod";
export const createReviewSchema = z.object({
  orderItemId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  photoUrl: z.string().url().optional(),
});
export const replySchema = z.object({ adminReply: z.string().min(2).max(1000) });
export const visibilitySchema = z.object({ isVisible: z.boolean() });
