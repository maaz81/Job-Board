import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";

export type AccessTokenPayload = {
    sub: string;
    role: Role;
};

export type RefreshTokenPayload = {
    sub: string;
};

export function generateAccessToken(input: {
    userId: string;
    role: Role;
}): string {
    const payload: AccessTokenPayload = {
        sub: input.userId,
        role: input.role,
    };

    return jwt.sign(
        payload,
        env.ACCESS_TOKEN_SECRET as Secret,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
        }
    );
}

export function generateRefreshToken(input: {
    userId: string;
}): string {
    const payload: RefreshTokenPayload = {
        sub: input.userId,
    };

    return jwt.sign(
        payload,
        env.REFRESH_TOKEN_SECRET as Secret,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
        }
    );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET
    ) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(
        token,
        env.REFRESH_TOKEN_SECRET
    ) as RefreshTokenPayload;
}