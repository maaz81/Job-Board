import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";
import {
    registerUser,
    loginUser,
    getCurrentUser,
} from "../services/auth.service";
import {
    forgotPassword,
    resetPassword,
} from "../services/auth.service";

jest.setTimeout(15000);
jest.mock("../services/email.service", () => ({
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
}));

describe("Auth Service", () => {
    const testUser = {
        name: "Test Candidate",
        email: `test-${Date.now()}@example.com`,
        password: "Password123!",
        role: Role.CANDIDATE,
    };

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: testUser.email,
            },
        });

        await prisma.$disconnect();
    });

    describe("registerUser", () => {
        it("should register a new user and hash the password", async () => {
            const result = await registerUser(testUser);

            expect(result.user).toMatchObject({
                name: testUser.name,
                email: testUser.email,
                role: Role.CANDIDATE,
            });

            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();

            const user = await prisma.user.findUnique({
                where: {
                    email: testUser.email,
                },
            });

            expect(user).not.toBeNull();

            expect(user!.password).not.toBe(
                testUser.password
            );

            expect(
                await bcrypt.compare(
                    testUser.password,
                    user!.password
                )
            ).toBe(true);
        });
    });

    describe("loginUser", () => {
        it("should login with valid credentials", async () => {
            const result = await loginUser({
                email: testUser.email,
                password: testUser.password,
            });

            expect(result.user.email).toBe(
                testUser.email
            );

            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
        });

        it("should reject an incorrect password", async () => {
            await expect(
                loginUser({
                    email: testUser.email,
                    password: "WrongPassword123!",
                })
            ).rejects.toThrow(
                "Invalid email or password"
            );
        });

        it("should reject an unknown email", async () => {
            await expect(
                loginUser({
                    email: "does-not-exist@example.com",
                    password: "Password123!",
                })
            ).rejects.toThrow(
                "Invalid email or password"
            );
        });
    });

    describe("getCurrentUser", () => {
        it("should return the authenticated user", async () => {
            const user = await prisma.user.findUnique({
                where: {
                    email: testUser.email,
                },
            });

            expect(user).not.toBeNull();

            const result = await getCurrentUser(
                user!.id
            );

            expect(result).toMatchObject({
                id: user!.id,
                name: testUser.name,
                email: testUser.email,
                role: Role.CANDIDATE,
            });
        });
    });
    describe("forgotPassword", () => {
        it("should generate a reset token for an existing email", async () => {
            const result = await forgotPassword(testUser.email);

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect(result).toHaveLength(64);

            const user = await prisma.user.findUnique({
                where: {
                    email: testUser.email,
                },
            });

            expect(user).not.toBeNull();

            const storedToken =
                await prisma.passwordResetToken.findFirst({
                    where: {
                        userId: user!.id,
                    },
                });

            expect(storedToken).not.toBeNull();
            expect(storedToken!.tokenHash).not.toBe(result);
        });

        it("should not reveal whether an email exists", async () => {
            const result = await forgotPassword(
                "does-not-exist@example.com"
            );

            expect(result).toBeNull();
        });
    });

    describe("resetPassword", () => {
        it("should reset the password with a valid token", async () => {
            const resetToken =
                await forgotPassword(testUser.email);

            expect(resetToken).toBeDefined();

            await resetPassword(
                resetToken!,
                "NewSecurePassword123!"
            );

            const user = await prisma.user.findUnique({
                where: {
                    email: testUser.email,
                },
            });

            expect(user).not.toBeNull();

            const passwordMatches =
                await bcrypt.compare(
                    "NewSecurePassword123!",
                    user!.password
                );

            expect(passwordMatches).toBe(true);

            const oldPasswordMatches =
                await bcrypt.compare(
                    testUser.password,
                    user!.password
                );

            expect(oldPasswordMatches).toBe(false);
        });

        it("should delete the reset token after successful reset", async () => {
            const resetToken =
                await forgotPassword(testUser.email);

            await resetPassword(
                resetToken!,
                "AnotherSecurePassword123!"
            );

            const user = await prisma.user.findUnique({
                where: {
                    email: testUser.email,
                },
            });

            expect(user).not.toBeNull();

            const storedToken =
                await prisma.passwordResetToken.findFirst({
                    where: {
                        userId: user!.id,
                    },
                });

            expect(storedToken).toBeNull();
        });

        it("should reject an invalid reset token", async () => {
            await expect(
                resetPassword(
                    "invalid-token",
                    "NewSecurePassword123!"
                )
            ).rejects.toThrow(
                "Invalid or expired password reset token"
            );
        });

        it("should revoke all active sessions after password reset", async () => {
            // Login using the current password.
            // This creates an active refresh-token session.
            const currentPassword = "AnotherSecurePassword123!";

            const loginResult = await loginUser({
                email: testUser.email,
                password: currentPassword,
            });

            expect(loginResult.refreshToken).toBeDefined();

            const user = await prisma.user.findUnique({
                where: {
                    email: testUser.email,
                },
            });

            expect(user).not.toBeNull();

            const activeSessionsBeforeReset =
                await prisma.session.count({
                    where: {
                        userId: user!.id,
                        isRevoked: false,
                    },
                });

            expect(activeSessionsBeforeReset).toBeGreaterThan(0);

            // Create a password reset token.
            const resetToken =
                await forgotPassword(testUser.email);

            expect(resetToken).toBeDefined();

            // Reset password.
            await resetPassword(
                resetToken!,
                "FinalSecurePassword123!"
            );

            // Every active session must now be revoked.
            const activeSessionsAfterReset =
                await prisma.session.count({
                    where: {
                        userId: user!.id,
                        isRevoked: false,
                    },
                });

            expect(activeSessionsAfterReset).toBe(0);
        });
    });
});