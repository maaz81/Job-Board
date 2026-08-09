import { prisma } from "../lib/prisma";
import {
    createEmailVerificationToken,
    verifyEmail,
} from "../services/emailVerification.service";

describe("Email Verification Service", () => {
    let userId: string;

    beforeAll(async () => {
        const user = await prisma.user.create({
            data: {
                name: "Email Verification Test",
                email: `verification-${Date.now()}@example.com`,
                password: "test-password",
                role: "CANDIDATE",
            },
        });

        userId = user.id;
    });

    afterAll(async () => {
        await prisma.emailVerificationToken.deleteMany({
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

    beforeEach(async () => {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                isEmailVerified: false,
                emailVerifiedAt: null,
            },
        });

        await prisma.emailVerificationToken.deleteMany({
            where: {
                userId,
            },
        });
    });

    describe("createEmailVerificationToken", () => {
        it("should create a verification token", async () => {
            const token =
                await createEmailVerificationToken(userId);

            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
            expect(token.length).toBe(64);

            const storedToken =
                await prisma.emailVerificationToken.findFirst({
                    where: {
                        userId,
                    },
                });

            expect(storedToken).not.toBeNull();

            // Raw token must never be stored.
            expect(storedToken!.tokenHash).not.toBe(token);
            expect(storedToken!.tokenHash.length).toBe(64);
        });

        it("should replace an existing verification token", async () => {
            await createEmailVerificationToken(userId);
            await createEmailVerificationToken(userId);

            const tokens =
                await prisma.emailVerificationToken.findMany({
                    where: {
                        userId,
                    },
                });

            expect(tokens).toHaveLength(1);
        });
    });

    describe("verifyEmail", () => {
        it("should verify a valid token", async () => {
            const token =
                await createEmailVerificationToken(userId);

            await verifyEmail(token);

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

            expect(user!.isEmailVerified).toBe(true);
            expect(user!.emailVerifiedAt).not.toBeNull();

            const storedToken =
                await prisma.emailVerificationToken.findFirst({
                    where: {
                        userId,
                    },
                });

            expect(storedToken).toBeNull();
        });

        it("should reject an invalid token", async () => {
            await expect(
                verifyEmail("invalid-token")
            ).rejects.toThrow(
                "Invalid or expired verification token"
            );
        });

        it("should reject a token after it has been used", async () => {
            const token =
                await createEmailVerificationToken(userId);

            await verifyEmail(token);

            await expect(
                verifyEmail(token)
            ).rejects.toThrow(
                "Invalid or expired verification token"
            );
        });

        it("should reject an expired token", async () => {
            const token =
                await createEmailVerificationToken(userId);

            await prisma.emailVerificationToken.updateMany({
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
                verifyEmail(token)
            ).rejects.toThrow(
                "Invalid or expired verification token"
            );
        });
    });
});