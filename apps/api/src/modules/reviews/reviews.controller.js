import * as s from "./reviews.service.js";
import { created, ok } from "../../lib/response.js";

export const create = async (req, res) => created(res, await s.create(req.user, req.body));
export const byProduct = async (req, res) => {
  const r = await s.listByProduct(req.params.id, req.query);
  ok(res, r.data, r.meta);
};
export const listAll = async (req, res) => {
  const r = await s.listAll(req.query);
  ok(res, r.data, r.meta);
};
export const reply = async (req, res) => ok(res, await s.reply(req.params.id, req.body.adminReply));
export const visibility = async (req, res) => ok(res, await s.setVisibility(req.params.id, req.body.isVisible));
