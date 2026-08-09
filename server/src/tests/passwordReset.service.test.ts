import { prisma } from "../lib/prisma";
import {
    createPasswordResetToken,
    consumePasswordResetToken,
} from "../services/passwordReset.service";


jest.setTimeout(15000);

describe("Password Reset Service", () => {
    let userId: string;

    beforeAll(async () => {
        const user = await prisma.user.create({
            data: {
                name: "Password Reset Test",
                email: `password-reset-${Date.now()}@example.com`,
                password: "old-password-hash",
                role: "CANDIDATE",
            },
        });

        userId = user.id;
    });

    afterEach(async () => {
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId,
            },
        });
    });

    afterAll(async () => {
        await prisma.passwordResetToken.deleteMany({
            where: {
                userId,
            },
        });

        await prisma.user.delete({
            where: {
                id: userId,
            },
        });

        await prisma.$disconnect();
    });

    describe("createPasswordResetToken", () => {
        it("should create a secure password reset token", async () => {
            const token =
                await createPasswordResetToken(userId);

            expect(token).toBeDefined();
            expect(typeof token).toBe("string");

            // 32 random bytes = 64 hex characters
            expect(token).toHaveLength(64);

            const storedToken =
                await prisma.passwordResetToken.findFirst({
                    where: {
                        userId,
                    },
                });

            expect(storedToken).not.toBeNull();

            // Never store the raw token.
            expect(storedToken!.tokenHash).not.toBe(token);

            // SHA-256 produces 64 hex characters.
            expect(storedToken!.tokenHash).toHaveLength(64);

            expect(
                storedToken!.expiresAt.getTime()
            ).toBeGreaterThan(Date.now());
        });

        it("should replace an existing reset token", async () => {
            await createPasswordResetToken(userId);
            await createPasswordResetToken(userId);

            const tokens =
                await prisma.passwordResetToken.findMany({
                    where: {
                        userId,
                    },
                });

            expect(tokens).toHaveLength(1);
        });
    });

    describe("consumePasswordResetToken", () => {
        it("should return a valid reset token", async () => {
            const token =
                await createPasswordResetToken(userId);

            const result =
                await consumePasswordResetToken(token);

            expect(result).toBeDefined();
            expect(result.userId).toBe(userId);
        });

        it("should reject an invalid token", async () => {
            await expect(
                consumePasswordResetToken(
                    "invalid-reset-token"
                )
            ).rejects.toThrow(
                "Invalid or expired password reset token"
            );
        });

        it("should reject an expired token", async () => {
            const token =
                await createPasswordResetToken(userId);

            await prisma.passwordResetToken.updateMany({
                where: {
                    userId,
                },
                data: {
                    expiresAt: new Date(
                        Date.now() - 1000
                    ),
                },
            });

            await expect(
                consumePasswordResetToken(token)
            ).rejects.toThrow(
                "Invalid or expired password reset token"
            );

            // Expired token should be cleaned up.
            const storedToken =
                await prisma.passwordResetToken.findFirst({
                    where: {
                        userId,
                    },
                });

            expect(storedToken).toBeNull();
        });
    });
});