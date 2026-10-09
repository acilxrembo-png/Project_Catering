import { Router } from "express";
import * as c from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.validation.js";

const r = Router();
r.post("/register", validate({ body: registerSchema }), c.register);
r.post("/login", validate({ body: loginSchema }), c.login);
r.post("/refresh", validate({ body: refreshSchema }), c.refresh);
r.post("/logout", validate({ body: refreshSchema }), c.logout);
r.get("/me", authenticate, c.me);
export default r;
