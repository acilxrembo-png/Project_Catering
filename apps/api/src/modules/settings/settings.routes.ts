// @ts-nocheck
import { Router } from "express";
import * as c from "./settings.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { settingSchema } from "./settings.validation.js";

const r = Router();
r.get("/public", c.listPublic);
r.get("/", authenticate, authorize("ADMIN"), c.listAll);
r.put("/:key", authenticate, authorize("ADMIN"), validate({ body: settingSchema }), c.upsert);
export default r;
