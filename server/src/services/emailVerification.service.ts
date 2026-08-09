import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { BadRequestError } from "../utils/errors";

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

export async function createEmailVerificationToken(
    userId: string
): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = hashToken(token);

    const expiresAt = new Date(
        Date.now() + VERIFICATION_TOKEN_EXPIRY_MS
    );

    // Only one active verification token per user.
    await prisma.emailVerificationToken.deleteMany({
        where: {
            userId,
        },
    });

    await prisma.emailVerificationToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });

    return token;
}

export async function verifyEmail(
    token: string
): Promise<void> {
    const tokenHash = hashToken(token);

    const verificationToken =
        await prisma.emailVerificationToken.findUnique({
            where: {
                tokenHash,
            },
        });

    if (!verificationToken) {
        throw new BadRequestError(
            "Invalid or expired verification token"
        );
    }

    if (verificationToken.expiresAt <= new Date()) {
        await prisma.emailVerificationToken.delete({
            where: {
                id: verificationToken.id,
            },
        });

        throw new BadRequestError(
            "Invalid or expired verification token"
        );
    }

    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: verificationToken.userId,
            },
            data: {
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
            },
        }),

        // Token becomes unusable immediately.
        prisma.emailVerificationToken.delete({
            where: {
                id: verificationToken.id,
            },
        }),
    ]);
}