import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8).optional(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "KASIR", "DAPUR"]),
  employeeCode: z.string().min(2),
  position: z.string().optional(),
  joinDate: z.coerce.date().optional(),
  salary: z.coerce.number().nonnegative().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(8).nullable().optional(),
  role: z.enum(["ADMIN", "KASIR", "DAPUR", "PELANGGAN"]).optional(),
  isActive: z.boolean().optional(),
  position: z.string().optional(),
  salary: z.coerce.number().nonnegative().optional(),
});

export const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(8).optional(),
  avatarUrl: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export const addressSchema = z.object({
  label: z.string().min(1),
  recipientName: z.string().min(2),
  phone: z.string().min(8),
  street: z.string().min(3),
  district: z.string().optional(),
  city: z.string().min(2),
  province: z.string().min(2),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});
export const updateAddressSchema = addressSchema.partial();
