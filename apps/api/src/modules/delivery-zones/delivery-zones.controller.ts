// @ts-nocheck
import * as s from "./delivery-zones.service.js";
import { created, ok } from "../../lib/response.js";

export const list = async (req, res) =>
  ok(res, await s.list(["ADMIN", "KASIR"].includes(req.user?.role) && req.query.all === "true"));
export const create = async (req, res) => created(res, await s.create(req.body));
export const update = async (req, res) => ok(res, await s.update(req.params.id, req.body));
export const remove = async (req, res) => ok(res, await s.remove(req.params.id));
