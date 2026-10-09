// @ts-nocheck
import { Router } from "express";
import * as c from "./deliveries.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { updateDeliverySchema } from "./deliveries.validation.js";

const r = Router();
r.use(authenticate);
r.get("/order/:id", validate({ params: idParam }), c.track);
r.get("/", authorize("ADMIN", "KASIR", "DAPUR"), c.list);
r.get("/:id", authorize("ADMIN", "KASIR", "DAPUR"), validate({ params: idParam }), c.get);
r.patch("/:id", authorize("ADMIN", "DAPUR"), validate({ params: idParam, body: updateDeliverySchema }), c.update);
export default r;
