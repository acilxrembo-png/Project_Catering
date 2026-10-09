// @ts-nocheck
import { Router } from "express";
import * as c from "./cart.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { addItemSchema, updateItemSchema } from "./cart.validation.js";

const r = Router();
r.use(authenticate, authorize("PELANGGAN"));
r.get("/", c.get);
r.post("/items", validate({ body: addItemSchema }), c.add);
r.patch("/items/:id", validate({ params: idParam, body: updateItemSchema }), c.update);
r.delete("/items/:id", validate({ params: idParam }), c.remove);
r.delete("/", c.clear);
export default r;
