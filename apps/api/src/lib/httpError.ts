// @ts-nocheck
export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (m: string, d?: unknown) => new HttpError(400, m, d);
export const unauthorized = (m = "Silakan login terlebih dahulu") => new HttpError(401, m);
export const forbidden = (m = "Anda tidak memiliki akses") => new HttpError(403, m);
export const notFound = (m = "Data tidak ditemukan") => new HttpError(404, m);
export const conflict = (m: string) => new HttpError(409, m);
