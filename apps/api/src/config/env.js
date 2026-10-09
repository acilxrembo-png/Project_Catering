import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(dir, "../../.env") });
// DATABASE_URL berada di packages/database/.env
dotenv.config({ path: path.resolve(dir, "../../../../packages/database/.env") });

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET belum diisi di apps/api/.env");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
  jwtSecret: process.env.JWT_ACCESS_SECRET,
  jwtExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  refreshDays: Number(process.env.REFRESH_TOKEN_DAYS) || 30,
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  },
};
