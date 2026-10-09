import { Router } from "express";
import * as c from "./audit-logs.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const r = Router();
r.get("/", authenticate, authorize("ADMIN"), c.list);
export default r;
