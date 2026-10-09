// @ts-nocheck
import { verifyAccessToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { forbidden, unauthorized } from "../lib/httpError.js";

async function loadUser(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  let payload;
  try {
    payload = verifyAccessToken(header.slice(7));
  } catch {
    throw unauthorized("Token tidak valid atau sudah kedaluwarsa");
  }
  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) throw unauthorized("Akun tidak aktif");
  return user;
}

export async function authenticate(req, _res, next) {
  const user = await loadUser(req);
  if (!user) throw unauthorized();
  req.user = user;
  next();
}

export async function optionalAuth(req, _res, next) {
  req.user = (await loadUser(req)) || undefined;
  next();
}

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };

export const STAFF = ["ADMIN", "KASIR", "DAPUR"];
