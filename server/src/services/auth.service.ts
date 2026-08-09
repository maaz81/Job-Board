import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import {
    createPasswordResetToken,
    consumePasswordResetToken,
} from "./passwordReset.service";

import {
    ConflictError,
    UnauthorizedError,
} from "../utils/errors";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../auth/jwt";

import { createSession } from "../auth/session";
import { verifyRefreshToken } from "../auth/jwt";
import { verifyRefreshSession } from "../auth/session";
import { revokeSession, revokeAllSessions } from "../auth/session";

import { sendPasswordResetEmail } from "./email.service";

const SALT_ROUNDS = 10;

function createAuthTokens(user: {
    id: string;
    role: Role;
}) {
    return {
        accessToken: generateAccessToken({
            userId: user.id,
            role: user.role,
        }),

        refreshToken: generateRefreshToken({
            userId: user.id,
        }),
    };
}

export async function registerUser(
    input: {
        name: string;
        email: string;
        password: string;
        role: Role;
    },
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
    }
) {
    const email = input.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existing) {
        throw new ConflictError(
            "An account with this email already exists"
        );
    }

    const passwordHash = await bcrypt.hash(
        input.password,
        SALT_ROUNDS
    );

    const user = await prisma.user.create({
        data: {
            name: input.name.trim(),
            email,
            password: passwordHash,
            role: input.role,
        },
    });

    const { accessToken, refreshToken } =
        createAuthTokens(user);

    await createSession({
        userId: user.id,
        refreshToken,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}

export async function loginUser(
    input: {
        email: string;
        password: string;
    },
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
    }
) {
    const email = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (
        !user ||
        !(await bcrypt.compare(
            input.password,
            user.password
        ))
    ) {
        throw new UnauthorizedError(
            "Invalid email or password"
        );
    }

    const { accessToken, refreshToken } =
        createAuthTokens(user);

    await createSession({
        userId: user.id,
        refreshToken,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
    });

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            lastLoginAt: new Date(),
        },
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}

export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            isEmailVerified: true,
            emailVerifiedAt: true,
        },
    });

    if (!user) {
        throw new UnauthorizedError("User not found");
    }

    return user;
}

export async function refreshAccessToken(
    refreshToken: string,
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
    }
) {
    const payload = verifyRefreshToken(refreshToken);

    const session = await verifyRefreshSession(
        payload.sub,
        refreshToken
    );

    if (!session) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    await revokeSession(session.id);

    const accessToken = generateAccessToken({
        userId: session.user.id,
        role: session.user.role,
    });

    const newRefreshToken = generateRefreshToken({
        userId: session.user.id,
    });

    await createSession({
        userId: session.user.id,
        refreshToken: newRefreshToken,
        userAgent: metadata?.userAgent,
        ipAddress: metadata?.ipAddress,
        expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
    });

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}

export async function logoutUser(
    refreshToken: string
) {
    const payload = verifyRefreshToken(refreshToken);

    const session = await verifyRefreshSession(
        payload.sub,
        refreshToken
    );

    if (session) {
        await revokeSession(session.id);
    }
}

export async function forgotPassword(
    email: string
): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (!user) {
        return null;
    }

    const token = await createPasswordResetToken(user.id);

    await sendPasswordResetEmail(
        user.email,
        token
    );

    return token;
}

export async function resetPassword(
    token: string,
    newPassword: string
): Promise<void> {
    const resetToken =
        await consumePasswordResetToken(token);

    const passwordHash = await bcrypt.hash(
        newPassword,
        SALT_ROUNDS
    );

    /*
     * Password change + token deletion + session
     * revocation should happen together.
     */
    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: {
                id: resetToken.userId,
            },
            data: {
                password: passwordHash,
            },
        });

        await tx.passwordResetToken.delete({
            where: {
                id: resetToken.id,
            },
        });

        await tx.session.updateMany({
            where: {
                userId: resetToken.userId,
                isRevoked: false,
            },
            data: {
                isRevoked: true,
            },
        });
    });
}
