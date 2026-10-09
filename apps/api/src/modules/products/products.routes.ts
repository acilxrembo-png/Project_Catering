// @ts-nocheck
import { Router } from "express";
import * as c from "./products.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize, optionalAuth } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import * as v from "./products.validation.js";

const r = Router();
const admin = [authenticate, authorize("ADMIN")];

r.get("/", optionalAuth, c.list);
// varian (sebelum /:idOrSlug)
r.patch("/variants/:id", ...admin, validate({ params: idParam, body: v.updateVariantSchema }), c.updateVariant);
r.delete("/variants/:id", ...admin, validate({ params: idParam }), c.removeVariant);
r.get("/:idOrSlug", optionalAuth, c.get);

r.post("/", ...admin, validate({ body: v.createProductSchema }), c.create);
r.patch("/:id", ...admin, validate({ params: idParam, body: v.updateProductSchema }), c.update);
r.delete("/:id", ...admin, validate({ params: idParam }), c.remove);
r.post("/:id/variants", ...admin, validate({ params: idParam, body: v.variantSchema }), c.addVariant);
export default r;
