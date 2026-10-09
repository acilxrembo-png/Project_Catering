// @ts-nocheck
import * as s from "./refunds.service.js";
import { created, ok } from "../../lib/response.js";

export const request = async (req, res) => created(res, await s.request(req.user, req.body));
export const approve = async (req, res) => ok(res, await s.decide(req.user, req.params.id, true));
export const reject = async (req, res) => ok(res, await s.decide(req.user, req.params.id, false));
export const process = async (req, res) => ok(res, await s.process(req.user, req.params.id));
export const list = async (req, res) => {
  const r = await s.list(req.user, req.query);
  ok(res, r.data, r.meta);
};
