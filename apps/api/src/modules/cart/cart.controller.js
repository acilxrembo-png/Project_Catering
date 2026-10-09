import * as s from "./cart.service.js";
import { created, ok } from "../../lib/response.js";

export const get = async (req, res) => ok(res, await s.getCart(req.user.id));
export const add = async (req, res) => created(res, await s.addItem(req.user.id, req.body));
export const update = async (req, res) => ok(res, await s.updateItem(req.user.id, req.params.id, req.body));
export const remove = async (req, res) => ok(res, await s.removeItem(req.user.id, req.params.id));
export const clear = async (req, res) => ok(res, await s.clear(req.user.id));
