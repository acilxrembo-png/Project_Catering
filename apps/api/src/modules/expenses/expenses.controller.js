import * as s from "./expenses.service.js";
import { created, ok } from "../../lib/response.js";

export const list = async (req, res) => {
  const r = await s.list(req.query);
  ok(res, r.data, r.meta);
};
export const create = async (req, res) => created(res, await s.create(req.user.id, req.body));
export const update = async (req, res) => ok(res, await s.update(req, req.params.id, req.body));
export const remove = async (req, res) => {
  await s.remove(req, req.params.id);
  ok(res, { message: "Pengeluaran dihapus" });
};
export const summary = async (req, res) => ok(res, await s.summary(req.query));
