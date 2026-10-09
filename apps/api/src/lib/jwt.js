import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpires });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);

export const generateRefreshToken = () => crypto.randomBytes(48).toString("hex");
