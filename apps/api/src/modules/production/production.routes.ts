// @ts-nocheck
import { Router } from "express";
import * as c from "./production.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { assignSchema, taskStatusSchema } from "./production.validation.js";

const r = Router();
r.use(authenticate, authorize("ADMIN", "DAPUR"));
r.get("/", c.list);
r.get("/summary", c.summary);
r.patch("/:id/assign", authorize("ADMIN"), validate({ params: idParam, body: assignSchema }), c.assign);
r.patch("/:id/status", validate({ params: idParam, body: taskStatusSchema }), c.updateStatus);
export default r;
