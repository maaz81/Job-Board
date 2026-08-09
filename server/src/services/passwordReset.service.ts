import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { BadRequestError } from "../utils/errors";

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000;

function hashToken(token: string): string {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

export async function createPasswordResetToken(
    userId: string
): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = hashToken(token);

    const expiresAt = new Date(
        Date.now() + RESET_TOKEN_EXPIRY_MS
    );

    // Only one active reset token per user.
    await prisma.passwordResetToken.deleteMany({
        where: {
            userId,
        },
    });

    await prisma.passwordResetToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });

    return token;
}

export async function consumePasswordResetToken(
    token: string
) {
    const tokenHash = hashToken(token);

    const resetToken =
        await prisma.passwordResetToken.findUnique({
            where: {
                tokenHash,
            },
        });

    if (!resetToken) {
        throw new BadRequestError(
            "Invalid or expired password reset token"
        );
    }

    if (resetToken.expiresAt <= new Date()) {
        await prisma.passwordResetToken.delete({
            where: {
                id: resetToken.id,
            },
        });

        throw new BadRequestError(
            "Invalid or expired password reset token"
        );
    }

    return resetToken;
}