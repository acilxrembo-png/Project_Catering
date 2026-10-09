// @ts-nocheck
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError.js";

export const notFoundHandler = (req, res) =>
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` });

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Data tidak valid",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message, details: err.details });
  }
  if (err?.code === "P2002") {
    return res.status(409).json({ success: false, message: `Data duplikat pada: ${err.meta?.target}` });
  }
  if (err?.code === "P2025") {
    return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
  }
  if (err?.code === "P2003") {
    return res.status(409).json({ success: false, message: "Data masih dipakai oleh data lain" });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Format JSON tidak valid" });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Terjadi kesalahan pada server" });
}
