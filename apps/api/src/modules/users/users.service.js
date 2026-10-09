import { prisma } from "../../lib/prisma.js";
import { comparePassword, hashPassword } from "../../lib/password.js";
import { badRequest, conflict, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";
import { audit } from "../../lib/audit.js";

const select = {
  id: true, email: true, phone: true, name: true, role: true, avatarUrl: true,
  isActive: true, lastLoginAt: true, createdAt: true, staffProfile: true,
};

export async function listUsers(q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(q.role && { role: q.role }),
    ...(q.isActive !== undefined && { isActive: q.isActive === "true" }),
    ...(q.q && {
      OR: [
        { name: { contains: q.q, mode: "insensitive" } },
        { email: { contains: q.q, mode: "insensitive" } },
        { phone: { contains: q.q } },
      ],
    }),
  };
  const [data, total] = await Promise.all([
    prisma.user.findMany({ where, select, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

export async function getUser(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { ...select, customerProfile: true },
  });
  if (!user) throw notFound("User tidak ditemukan");
  return user;
}

export async function createStaff(input, req) {
  const { employeeCode, position, joinDate, salary, password, ...rest } = input;
  const dupe = await prisma.user.findFirst({
    where: { OR: [{ email: rest.email }, ...(rest.phone ? [{ phone: rest.phone }] : [])] },
  });
  if (dupe) throw conflict("Email atau nomor telepon sudah terdaftar");
  const user = await prisma.user.create({
    data: {
      ...rest,
      passwordHash: await hashPassword(password),
      staffProfile: { create: { employeeCode, position, joinDate, salary } },
    },
    select,
  });
  await audit({ req, action: "CREATE", entity: "User", entityId: user.id, newValue: { email: user.email, role: user.role } });
  return user;
}

export async function updateUser(id, input, req) {
  const old = await getUser(id);
  const { position, salary, ...rest } = input;
  if (id === req.user.id && (rest.isActive === false || (rest.role && rest.role !== old.role))) {
    throw badRequest("Tidak dapat menonaktifkan atau mengubah role akun sendiri");
  }
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...rest,
      ...((position !== undefined || salary !== undefined) && old.staffProfile && {
        staffProfile: { update: { position, salary } },
      }),
    },
    select,
  });
  await audit({ req, action: "UPDATE", entity: "User", entityId: id, oldValue: { role: old.role, isActive: old.isActive }, newValue: { role: user.role, isActive: user.isActive } });
  return user;
}

export const updateMe = (id, data) => prisma.user.update({ where: { id }, data, select });

export async function changePassword(id, { oldPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!(await comparePassword(oldPassword, user.passwordHash))) throw badRequest("Password lama salah");
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(newPassword) } }),
    prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
}

// ---- alamat ----
export const listAddresses = (userId) =>
  prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });

export async function createAddress(userId, data) {
  const count = await prisma.address.count({ where: { userId } });
  const isDefault = data.isDefault || count === 0;
  return prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...data, userId, isDefault } });
  });
}

async function ownAddress(userId, id) {
  const a = await prisma.address.findFirst({ where: { id, userId } });
  if (!a) throw notFound("Alamat tidak ditemukan");
  return a;
}

export async function updateAddress(userId, id, data) {
  await ownAddress(userId, id);
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.update({ where: { id }, data });
  });
}

export async function deleteAddress(userId, id) {
  await ownAddress(userId, id);
  const used = await prisma.order.count({ where: { addressId: id } });
  if (used > 0) throw conflict("Alamat sudah dipakai pada pesanan dan tidak dapat dihapus");
  await prisma.address.delete({ where: { id } });
}
