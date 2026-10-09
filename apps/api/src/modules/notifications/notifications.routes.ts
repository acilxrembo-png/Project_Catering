// @ts-nocheck
import { Router } from "express";
import * as c from "./notifications.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";

const r = Router();
r.use(authenticate);
r.get("/", c.list);
r.patch("/read-all", c.readAll);
r.patch("/:id/read", validate({ params: idParam }), c.read);
export default r;
