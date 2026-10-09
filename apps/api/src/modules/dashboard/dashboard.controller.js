import * as s from "./dashboard.service.js";
import { ok } from "../../lib/response.js";

export const stats = async (_req, res) => ok(res, await s.stats());
export const revenue = async (req, res) => ok(res, await s.revenueChart(Math.min(365, Number(req.query.days) || 30)));
export const kitchen = async (_req, res) => ok(res, await s.kitchen());
