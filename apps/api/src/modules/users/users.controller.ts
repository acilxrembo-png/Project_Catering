// @ts-nocheck
import * as s from "./users.service.js";
import { created, ok } from "../../lib/response.js";

export const list = async (req, res) => {
  const r = await s.listUsers(req.query);
  ok(res, r.data, r.meta);
};
export const get = async (req, res) => ok(res, await s.getUser(req.params.id));
export const createStaff = async (req, res) => created(res, await s.createStaff(req.body, req));
export const update = async (req, res) => ok(res, await s.updateUser(req.params.id, req.body, req));
export const updateMe = async (req, res) => ok(res, await s.updateMe(req.user.id, req.body));
export const changePassword = async (req, res) => {
  await s.changePassword(req.user.id, req.body);
  ok(res, { message: "Password berhasil diubah, silakan login ulang" });
};
export const listAddresses = async (req, res) => ok(res, await s.listAddresses(req.user.id));
export const createAddress = async (req, res) => created(res, await s.createAddress(req.user.id, req.body));
export const updateAddress = async (req, res) =>
  ok(res, await s.updateAddress(req.user.id, req.params.id, req.body));
export const deleteAddress = async (req, res) => {
  await s.deleteAddress(req.user.id, req.params.id);
  ok(res, { message: "Alamat dihapus" });
};
