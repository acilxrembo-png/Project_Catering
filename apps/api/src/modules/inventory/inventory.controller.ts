// @ts-nocheck
import * as s from "./inventory.service.js";
import { created, ok } from "../../lib/response.js";

const page = (res, r) => ok(res, r.data, r.meta);
export const listIngredients = async (req, res) => page(res, await s.listIngredients(req.query));
export const getIngredient = async (req, res) => ok(res, await s.getIngredient(req.params.id));
export const createIngredient = async (req, res) => created(res, await s.createIngredient(req.body, req.user.id));
export const updateIngredient = async (req, res) => ok(res, await s.updateIngredient(req.params.id, req.body));
export const removeIngredient = async (req, res) => ok(res, await s.removeIngredient(req.params.id));
export const addMovement = async (req, res) => created(res, await s.addMovement(req.user.id, req.body));
export const listMovements = async (req, res) => page(res, await s.listMovements(req.query));
export const listSuppliers = async (_req, res) => ok(res, await s.listSuppliers());
export const createSupplier = async (req, res) => created(res, await s.createSupplier(req.body));
export const updateSupplier = async (req, res) => ok(res, await s.updateSupplier(req.params.id, req.body));
export const removeSupplier = async (req, res) => ok(res, await s.removeSupplier(req.params.id));
