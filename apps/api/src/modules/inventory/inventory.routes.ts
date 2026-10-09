// @ts-nocheck
import { Router } from "express";
import * as c from "./inventory.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { idParam } from "../../lib/schemas.js";
import * as v from "./inventory.validation.js";

const r = Router();
r.use(authenticate, authorize("ADMIN", "DAPUR", "KASIR"));
const write = authorize("ADMIN", "DAPUR");

r.get("/ingredients", c.listIngredients);
r.get("/ingredients/:id", validate({ params: idParam }), c.getIngredient);
r.post("/ingredients", write, validate({ body: v.ingredientSchema }), c.createIngredient);
r.patch("/ingredients/:id", write, validate({ params: idParam, body: v.updateIngredientSchema }), c.updateIngredient);
r.delete("/ingredients/:id", authorize("ADMIN"), validate({ params: idParam }), c.removeIngredient);

r.get("/movements", c.listMovements);
r.post("/movements", write, validate({ body: v.movementSchema }), c.addMovement);

r.get("/suppliers", c.listSuppliers);
r.post("/suppliers", write, validate({ body: v.supplierSchema }), c.createSupplier);
r.patch("/suppliers/:id", write, validate({ params: idParam, body: v.updateSupplierSchema }), c.updateSupplier);
r.delete("/suppliers/:id", authorize("ADMIN"), validate({ params: idParam }), c.removeSupplier);
export default r;
