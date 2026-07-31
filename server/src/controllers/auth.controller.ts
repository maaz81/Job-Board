import { Request, Response, NextFunction } from "express";

import * as authService from "../services/auth.service";

import { success } from "../utils/apiResponse";

import { UnauthorizedError } from "../utils/errors";

import {
    setAccessCookie,
    setRefreshCookie,
    clearAuthCookies,
} from "../auth/cookies";

export async function register(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await authService.registerUser(
            req.body,
            {
                userAgent: req.get("user-agent"),
                ipAddress: req.ip,
            }
        );

        setAccessCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);

        res.status(201).json(
            success(
                {
                    user: result.user,
                },
                "Account created successfully"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function login(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await authService.loginUser(
            req.body,
            {
                userAgent: req.get("user-agent"),
                ipAddress: req.ip,
            }
        );

        setAccessCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);

        res.json(
            success(
                {
                    user: result.user,
                },
                "Logged in successfully"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function me(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            throw new Error("Unauthorized");
        }

        const user =
            await authService.getCurrentUser(req.user.id);

        res.json(
            success(
                user,
                "User fetched successfully"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function refresh(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const refreshToken =
            req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedError(
                "Refresh token missing"
            );
        }

        const result = await authService.refreshAccessToken(
            refreshToken,
            {
                userAgent: req.get("user-agent"),
                ipAddress: req.ip,
            }
        );

        setAccessCookie(res, result.accessToken);
        setRefreshCookie(res, result.refreshToken);

        res.json(
            success(null, "Access token refreshed")
        );
    } catch (err) {
        next(err);
    }
}

export async function logout(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const refreshToken =
            req.cookies?.refreshToken;

        if (refreshToken) {
            await authService.logoutUser(
                refreshToken
            );
        }

        clearAuthCookies(res);

        res.json(
            success(
                null,
                "Logged out"
            )
        );
    } catch (err) {
        next(err);
    }
}