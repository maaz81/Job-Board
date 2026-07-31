import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const SALT_ROUNDS = 10;

type CreateSessionInput = {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
};

export async function createSession(input: CreateSessionInput) {
    const refreshTokenHash = await bcrypt.hash(
        input.refreshToken,
        SALT_ROUNDS
    );

    return prisma.session.create({
        data: {
            userId: input.userId,
            refreshTokenHash,
            userAgent: input.userAgent,
            ipAddress: input.ipAddress,
            expiresAt: input.expiresAt,
        },
    });
}

export async function findValidSessions(userId: string) {
    return prisma.session.findMany({
        where: {
            userId,
            isRevoked: false,
            expiresAt: {
                gt: new Date(),
            },
        },
        include: {
            user: true,
        },
    });
}

export async function verifyRefreshSession(
    userId: string,
    refreshToken: string
) {
    const sessions = await findValidSessions(userId);

    for (const session of sessions) {
        const valid = await bcrypt.compare(
            refreshToken,
            session.refreshTokenHash
        );

        if (valid) {
            return session;
        }
    }

    return null;
}

export async function revokeSession(sessionId: string) {
    return prisma.session.update({
        where: {
            id: sessionId,
        },
        data: {
            isRevoked: true,
        },
    });
}

export async function revokeAllSessions(userId: string) {
    return prisma.session.updateMany({
        where: {
            userId,
        },
        data: {
            isRevoked: true,
        },
    });
}