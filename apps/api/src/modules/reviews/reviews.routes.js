import { Router } from "express";
import * as c from "./reviews.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { createReviewSchema, replySchema, visibilitySchema } from "./reviews.validation.js";

const r = Router();
r.get("/product/:id", validate({ params: idParam }), c.byProduct); // publik
r.get("/", authenticate, authorize("ADMIN"), c.listAll);
r.post("/", authenticate, authorize("PELANGGAN"), validate({ body: createReviewSchema }), c.create);
r.patch("/:id/reply", authenticate, authorize("ADMIN"), validate({ params: idParam, body: replySchema }), c.reply);
r.patch("/:id/visibility", authenticate, authorize("ADMIN"), validate({ params: idParam, body: visibilitySchema }), c.visibility);
export default r;
