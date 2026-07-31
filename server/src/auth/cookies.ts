import { Response } from "express";
import { env } from "../config/env";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export function setAccessCookie(
    res: Response,
    accessToken: string
) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        maxAge: FIFTEEN_MINUTES,
    });
}

export function setRefreshCookie(
    res: Response,
    refreshToken: string
) {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SAME_SITE,
        maxAge: THIRTY_DAYS,
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie("accessToken");

    res.clearCookie("refreshToken");
}