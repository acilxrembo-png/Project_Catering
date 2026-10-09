import { Router } from "express";
import * as c from "./delivery-zones.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize, optionalAuth } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import { updateZoneSchema, zoneSchema } from "./delivery-zones.validation.js";

const r = Router();
r.get("/", optionalAuth, c.list);
r.post("/", authenticate, authorize("ADMIN"), validate({ body: zoneSchema }), c.create);
r.patch("/:id", authenticate, authorize("ADMIN"), validate({ params: idParam, body: updateZoneSchema }), c.update);
r.delete("/:id", authenticate, authorize("ADMIN"), validate({ params: idParam }), c.remove);
export default r;
