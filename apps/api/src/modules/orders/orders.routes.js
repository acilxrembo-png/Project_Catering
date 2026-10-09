import { Router } from "express";
import * as c from "./orders.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { cancelSchema, createOrderSchema, updateNotesSchema, updateStatusSchema } from "./orders.validation.js";

const r = Router();
r.use(authenticate);
r.post("/", authorize("PELANGGAN", "ADMIN", "KASIR"), validate({ body: createOrderSchema }), c.create);
r.get("/", c.list);
r.get("/:id", validate({ params: idParam }), c.get);
r.patch("/:id/status", authorize("ADMIN", "KASIR", "DAPUR"), validate({ params: idParam, body: updateStatusSchema }), c.updateStatus);
r.post("/:id/cancel", validate({ params: idParam, body: cancelSchema }), c.cancel);
r.patch("/:id/notes", authorize("ADMIN", "KASIR", "DAPUR"), validate({ params: idParam, body: updateNotesSchema }), c.updateNotes);
export default r;
