import { Request, Response, NextFunction } from "express";

import * as authService from "../services/auth.service";

import { success } from "../utils/apiResponse";

import { UnauthorizedError } from "../utils/errors";

import {
    createEmailVerificationToken,
    verifyEmail,
} from "../services/emailVerification.service";

import {
    setAccessCookie,
    setRefreshCookie,
    clearAuthCookies,
} from "../auth/cookies";

import {
    sendVerificationEmail,
} from "../services/email.service";

import { env } from "../config/env";

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

export async function verifyEmailAddress(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.body.token;

        await verifyEmail(token);

        res.json(
            success(
                null,
                "Email verified successfully"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function resendVerification(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            throw new UnauthorizedError(
                "Authentication required"
            );
        }

        const user = await authService.getCurrentUser(
            req.user.id
        );

        if (user.isEmailVerified) {
            res.json(
                success(
                    null,
                    "Email is already verified"
                )
            );

            return;
        }

        const token =
            await createEmailVerificationToken(user.id);

        await sendVerificationEmail(
            user.email,
            token
        );

        res.json(
            success(
                null,
                "Verification email sent"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        await authService.forgotPassword(
            req.body.email
        );

        /*
         * Always return the same response.
         *
         * This prevents attackers from discovering
         * which emails have JobSphere accounts.
         */
        res.json(
            success(
                null,
                "If an account exists with that email, a password reset link has been sent"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        await authService.resetPassword(
            req.body.token,
            req.body.password
        );

        res.json(
            success(
                null,
                "Password reset successfully"
            )
        );
    } catch (err) {
        next(err);
    }
}