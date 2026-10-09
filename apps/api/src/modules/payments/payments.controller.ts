// @ts-nocheck
import * as s from "./payments.service.js";
import { created, ok } from "../../lib/response.js";

export const createGateway = async (req, res) => created(res, await s.createGatewayPayment(req.user, req.body));
export const submitTransfer = async (req, res) => created(res, await s.submitTransfer(req.user, req.body));
export const manual = async (req, res) => created(res, await s.recordManualPayment(req.user, req.body));
export const verify = async (req, res) => ok(res, await s.verifyPayment(req.user, req.params.id, req.body));
export const list = async (req, res) => {
  const r = await s.listPayments(req.user, req.query);
  ok(res, r.data, r.meta);
};
export const get = async (req, res) => ok(res, await s.getPayment(req.user, req.params.id));
export const invoices = async (req, res) => ok(res, await s.listInvoices(req.user, req.params.id));

// Midtrans mengharapkan HTTP 200 agar tidak mengirim ulang
export const midtransWebhook = async (req, res) => {
  const result = await s.handleMidtransWebhook(req.body);
  res.status(200).json({ success: true, ...result });
};
