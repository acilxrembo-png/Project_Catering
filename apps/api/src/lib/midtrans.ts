// @ts-nocheck
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { HttpError } from "./httpError.js";

const { serverKey, isProduction } = env.midtrans;
const SNAP_URL = isProduction
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";
const CORE_URL = isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2";

const authHeader = () => ({
  Authorization: "Basic " + Buffer.from(serverKey + ":").toString("base64"),
  "Content-Type": "application/json",
  Accept: "application/json",
});

function ensureConfigured() {
  if (!serverKey) throw new HttpError(503, "MIDTRANS_SERVER_KEY belum dikonfigurasi");
}

export async function createSnap({ externalId, amount, customer, expiryMinutes }) {
  ensureConfigured();
  const res = await fetch(SNAP_URL, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({
      transaction_details: { order_id: externalId, gross_amount: Math.round(amount) },
      customer_details: { first_name: customer.name, email: customer.email, phone: customer.phone },
      expiry: { unit: "minutes", duration: Math.max(1, expiryMinutes) },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new HttpError(502, "Midtrans menolak transaksi", json);
  return json; // { token, redirect_url }
}

export async function refundTransaction({ externalId, amount, reason, refundKey }) {
  ensureConfigured();
  const res = await fetch(`${CORE_URL}/${externalId}/refund`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify({ refund_key: refundKey, amount: Math.round(amount), reason }),
  });
  const json = await res.json();
  if (!res.ok || !String(json.status_code).startsWith("2")) {
    throw new HttpError(502, "Refund ke Midtrans gagal", json);
  }
  return json;
}

// signature = SHA512(order_id + status_code + gross_amount + serverKey)
export function verifySignature(body) {
  if (!serverKey || !body?.signature_key) return false;
  const hash = crypto
    .createHash("sha512")
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`)
    .digest("hex");
  return hash === body.signature_key;
}
