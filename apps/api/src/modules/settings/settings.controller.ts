// @ts-nocheck
import * as s from "./settings.service.js";
import { ok } from "../../lib/response.js";

export const listPublic = async (_req, res) => ok(res, await s.listPublic());
export const listAll = async (_req, res) => ok(res, await s.listAll());
export const upsert = async (req, res) => ok(res, await s.upsert(req, req.params.key, req.body.value));
