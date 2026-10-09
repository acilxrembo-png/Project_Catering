// @ts-nocheck
import * as service from "./auth.service.js";
import { created, ok } from "../../lib/response.js";

const meta = (req) => ({ ip: req.ip, userAgent: req.headers["user-agent"] });

export const register = async (req, res) => created(res, await service.register(req.body, meta(req)));
export const login = async (req, res) => ok(res, await service.login(req.body, meta(req)));
export const refresh = async (req, res) => ok(res, await service.refresh(req.body.refreshToken, meta(req)));
export const logout = async (req, res) => {
  await service.logout(req.body.refreshToken);
  ok(res, { message: "Berhasil logout" });
};
export const me = async (req, res) => ok(res, await service.me(req.user.id));
