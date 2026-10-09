// @ts-nocheck
import { Router } from "express";
import * as c from "./refunds.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { requestRefundSchema } from "./refunds.validation.js";

const r = Router();
r.use(authenticate);
r.get("/", authorize("PELANGGAN", "ADMIN", "KASIR"), c.list);
r.post("/", authorize("PELANGGAN", "ADMIN", "KASIR"), validate({ body: requestRefundSchema }), c.request);
r.patch("/:id/approve", authorize("ADMIN"), validate({ params: idParam }), c.approve);
r.patch("/:id/reject", authorize("ADMIN"), validate({ params: idParam }), c.reject);
r.post("/:id/process", authorize("ADMIN", "KASIR"), validate({ params: idParam }), c.process);
export default r;
