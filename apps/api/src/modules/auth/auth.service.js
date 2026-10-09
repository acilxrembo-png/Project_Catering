import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { comparePassword, hashPassword } from "../../lib/password.js";
import { generateRefreshToken, signAccessToken } from "../../lib/jwt.js";
import { conflict, notFound, unauthorized } from "../../lib/httpError.js";
import { audit } from "../../lib/audit.js";

const safe = ({ passwordHash, ...rest }) => rest;

async function issueTokens(user, meta = {}) {
  const refreshToken = generateRefreshToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
      expiresAt: new Date(Date.now() + env.refreshDays * 86400000),
    },
  });
  return { accessToken: signAccessToken(user), refreshToken };
}

export async function register(input, meta) {
  const dupe = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, ...(input.phone ? [{ phone: input.phone }] : [])] },
  });
  if (dupe) throw conflict("Email atau nomor telepon sudah terdaftar");

  const user = await prisma.user.create({
    data: {
      ...input,
      passwordHash: await hashPassword(input.password),
      role: "PELANGGAN",
      customerProfile: { create: {} },
    },
  });
  delete user.password;
  return { user: safe(user), ...(await issueTokens(user, meta)) };
}

export async function login({ email, password }, meta) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw unauthorized("Email atau password salah");
  }
  if (!user.isActive) throw unauthorized("Akun dinonaktifkan");
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit({ userId: user.id, action: "LOGIN", entity: "User", entityId: user.id });
  return { user: safe(user), ...(await issueTokens(user, meta)) };
}

export async function refresh(refreshToken, meta) {
  const session = await prisma.session.findUnique({ where: { refreshToken }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt < new Date() || !session.user.isActive) {
    throw unauthorized("Refresh token tidak valid");
  }
  await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  return issueTokens(session.user, meta);
}

export async function logout(refreshToken) {
  await prisma.session.updateMany({ where: { refreshToken, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function me(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customerProfile: true, staffProfile: true },
  });
  if (!user) throw notFound("User tidak ditemukan");
  return safe(user);
}
