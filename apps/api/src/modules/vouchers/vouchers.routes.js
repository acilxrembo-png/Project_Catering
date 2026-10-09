import { Router } from "express";
import * as c from "./vouchers.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { checkVoucherSchema, updateVoucherSchema, voucherSchema } from "./vouchers.validation.js";

const r = Router();
r.use(authenticate);
r.get("/", c.list);
r.post("/check", validate({ body: checkVoucherSchema }), c.check);
r.post("/", authorize("ADMIN"), validate({ body: voucherSchema }), c.create);
r.patch("/:id", authorize("ADMIN"), validate({ params: idParam, body: updateVoucherSchema }), c.update);
r.delete("/:id", authorize("ADMIN"), validate({ params: idParam }), c.remove);
export default r;
