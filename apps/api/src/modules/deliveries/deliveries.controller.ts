// @ts-nocheck
import * as s from "./deliveries.service.js";
import { ok } from "../../lib/response.js";

export const list = async (req, res) => {
  const r = await s.list(req.query);
  ok(res, r.data, r.meta);
};
export const get = async (req, res) => ok(res, await s.get(req.user, req.params.id));
export const track = async (req, res) => ok(res, await s.trackByOrder(req.user, req.params.id));
export const update = async (req, res) => ok(res, await s.update(req.user, req.params.id, req.body));
