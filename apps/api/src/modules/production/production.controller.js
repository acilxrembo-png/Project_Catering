import * as s from "./production.service.js";
import { ok } from "../../lib/response.js";

export const list = async (req, res) => {
  const r = await s.list(req.user, req.query);
  ok(res, r.data, r.meta);
};
export const assign = async (req, res) => ok(res, await s.assign(req.params.id, req.body.assignedToId));
export const updateStatus = async (req, res) => ok(res, await s.updateStatus(req.user, req.params.id, req.body));
export const summary = async (req, res) => ok(res, await s.summary(req.query.date));
