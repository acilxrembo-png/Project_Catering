import { Router } from "express";
import * as c from "./users.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import * as v from "./users.validation.js";

const r = Router();
r.use(authenticate);

// akun sendiri (harus sebelum /:id)
r.patch("/me", validate({ body: v.updateMeSchema }), c.updateMe);
r.post("/me/password", validate({ body: v.changePasswordSchema }), c.changePassword);
r.get("/me/addresses", c.listAddresses);
r.post("/me/addresses", validate({ body: v.addressSchema }), c.createAddress);
r.patch("/me/addresses/:id", validate({ params: idParam, body: v.updateAddressSchema }), c.updateAddress);
r.delete("/me/addresses/:id", validate({ params: idParam }), c.deleteAddress);

// admin
r.get("/", authorize("ADMIN", "KASIR"), c.list);
r.post("/", authorize("ADMIN"), validate({ body: v.createStaffSchema }), c.createStaff);
r.get("/:id", authorize("ADMIN", "KASIR"), validate({ params: idParam }), c.get);
r.patch("/:id", authorize("ADMIN"), validate({ params: idParam, body: v.updateUserSchema }), c.update);
export default r;
