// @ts-nocheck
import { Router } from "express";
import * as c from "./expenses.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { expenseSchema, updateExpenseSchema } from "./expenses.validation.js";

const r = Router();
r.use(authenticate, authorize("ADMIN", "KASIR"));
r.get("/", c.list);
r.get("/summary", c.summary);
r.post("/", validate({ body: expenseSchema }), c.create);
r.patch("/:id", validate({ params: idParam, body: updateExpenseSchema }), c.update);
r.delete("/:id", authorize("ADMIN"), validate({ params: idParam }), c.remove);
export default r;
