// @ts-nocheck
import * as s from "./orders.service.js";
import { created, ok } from "../../lib/response.js";

export const create = async (req, res) => created(res, await s.createOrder(req.user, req.body));
export const list = async (req, res) => {
  const r = await s.listOrders(req.user, req.query);
  ok(res, r.data, r.meta);
};
export const get = async (req, res) => ok(res, await s.getOrder(req.user, req.params.id));
export const updateStatus = async (req, res) => ok(res, await s.updateStatus(req.user, req.params.id, req.body));
export const cancel = async (req, res) => ok(res, await s.cancelOrder(req.user, req.params.id, req.body.reason));
export const updateNotes = async (req, res) => ok(res, await s.updateNotes(req.params.id, req.body.internalNotes));
