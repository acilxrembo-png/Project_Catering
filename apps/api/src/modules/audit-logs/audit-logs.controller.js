import * as s from "./audit-logs.service.js";
import { ok } from "../../lib/response.js";

export const list = async (req, res) => {
  const r = await s.list(req.query);
  ok(res, r.data, r.meta);
};
