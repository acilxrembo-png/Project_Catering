import { Router } from "express";
import * as c from "./payments.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import * as v from "./payments.validation.js";

const r = Router();

// webhook publik (diverifikasi lewat signature)
r.post("/webhook/midtrans", c.midtransWebhook);

r.use(authenticate);
r.get("/", c.list);
r.get("/orders/:id/invoices", validate({ params: idParam }), c.invoices);
r.post("/gateway", authorize("PELANGGAN", "ADMIN", "KASIR"), validate({ body: v.createGatewayPaymentSchema }), c.createGateway);
r.post("/transfer", authorize("PELANGGAN"), validate({ body: v.submitTransferSchema }), c.submitTransfer);
r.post("/manual", authorize("ADMIN", "KASIR"), validate({ body: v.manualPaymentSchema }), c.manual);
r.patch("/:id/verify", authorize("ADMIN", "KASIR"), validate({ params: idParam, body: v.verifyPaymentSchema }), c.verify);
r.get("/:id", validate({ params: idParam }), c.get);
export default r;
