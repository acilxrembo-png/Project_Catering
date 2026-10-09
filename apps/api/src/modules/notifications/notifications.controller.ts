// @ts-nocheck
import * as s from "./notifications.service.js";
import { ok } from "../../lib/response.js";

export const list = async (req, res) => {
  const r = await s.list(req.user.id, req.query);
  ok(res, r.data, r.meta);
};
export const read = async (req, res) => ok(res, await s.markRead(req.user.id, req.params.id));
export const readAll = async (req, res) => ok(res, { updated: (await s.markAllRead(req.user.id)).count });
