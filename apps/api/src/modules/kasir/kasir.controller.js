import * as s from "./kasir.service.js";
import { created, ok } from "../../lib/response.js";

export const open = async (req, res) => created(res, await s.openShift(req.user.id, req.body));
export const current = async (req, res) => ok(res, await s.currentShift(req.user.id));
export const close = async (req, res) => ok(res, await s.closeShift(req.user.id, req.body));
export const list = async (req, res) => {
  const r = await s.listShifts(req.user, req.query);
  ok(res, r.data, r.meta);
};
export const get = async (req, res) => ok(res, await s.getShift(req.user, req.params.id));
