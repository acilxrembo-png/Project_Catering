import { Router } from "express";
import * as c from "./categories.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize, optionalAuth } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { categorySchema, updateCategorySchema } from "./categories.validation.js";

const r = Router();
r.get("/", optionalAuth, c.list);
r.get("/:id", validate({ params: idParam }), c.get);
r.post("/", authenticate, authorize("ADMIN"), validate({ body: categorySchema }), c.create);
r.patch("/:id", authenticate, authorize("ADMIN"), validate({ params: idParam, body: updateCategorySchema }), c.update);
r.delete("/:id", authenticate, authorize("ADMIN"), validate({ params: idParam }), c.remove);
export default r;
