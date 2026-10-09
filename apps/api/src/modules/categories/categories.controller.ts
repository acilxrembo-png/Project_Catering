// @ts-nocheck
import * as s from "./categories.service.js";
import { created, ok } from "../../lib/response.js";

const isStaff = (req) => ["ADMIN", "KASIR", "DAPUR"].includes(req.user?.role);
export const list = async (req, res) => ok(res, await s.list(isStaff(req) && req.query.all === "true"));
export const get = async (req, res) => ok(res, await s.get(req.params.id));
export const create = async (req, res) => created(res, await s.create(req.body));
export const update = async (req, res) => ok(res, await s.update(req.params.id, req.body));
export const remove = async (req, res) => ok(res, await s.remove(req.params.id));
