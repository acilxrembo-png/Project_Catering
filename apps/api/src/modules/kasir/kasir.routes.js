import { Router } from "express";
import * as c from "./kasir.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { closeShiftSchema, openShiftSchema } from "./kasir.validation.js";

const r = Router();
r.use(authenticate);
r.post("/shifts/open", authorize("KASIR"), validate({ body: openShiftSchema }), c.open);
r.get("/shifts/current", authorize("KASIR"), c.current);
r.post("/shifts/close", authorize("KASIR"), validate({ body: closeShiftSchema }), c.close);
r.get("/shifts", authorize("KASIR", "ADMIN"), c.list);
r.get("/shifts/:id", authorize("KASIR", "ADMIN"), validate({ params: idParam }), c.get);
export default r;
