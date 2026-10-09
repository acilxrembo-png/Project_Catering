// @ts-nocheck
import * as s from "./products.service.js";
import { created, ok } from "../../lib/response.js";

const isStaff = (req) => ["ADMIN", "KASIR", "DAPUR"].includes(req.user?.role);

export const list = async (req, res) => {
  const r = await s.list(req.query, isStaff(req));
  ok(res, r.data, r.meta);
};
export const get = async (req, res) => ok(res, await s.get(req.params.idOrSlug, isStaff(req)));
export const create = async (req, res) => created(res, await s.create(req.body));
export const update = async (req, res) => ok(res, await s.update(req.params.id, req.body));
export const remove = async (req, res) => {
  await s.remove(req.params.id);
  ok(res, { message: "Produk dihapus" });
};
export const addVariant = async (req, res) => created(res, await s.addVariant(req.params.id, req.body));
export const updateVariant = async (req, res) => ok(res, await s.updateVariant(req.params.id, req.body));
export const removeVariant = async (req, res) => ok(res, await s.removeVariant(req.params.id));
