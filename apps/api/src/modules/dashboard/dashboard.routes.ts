// @ts-nocheck
import { Router } from "express";
import * as c from "./dashboard.controller.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const r = Router();
r.use(authenticate);
r.get("/stats", authorize("ADMIN", "KASIR"), c.stats);
r.get("/revenue", authorize("ADMIN", "KASIR"), c.revenue);
r.get("/kitchen", authorize("ADMIN", "DAPUR"), c.kitchen);
export default r;
