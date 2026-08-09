import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";

type CookieHeader = string | string[];

function getCookies(
    headers: Record<string, unknown>
): string[] {
    const value = headers["set-cookie"] as CookieHeader | undefined;

    if (!value) {
        return [];
    }

    return Array.isArray(value)
        ? value
        : [value];
}

describe("Authentication API", () => {
    const email = `api-test-${Date.now()}@example.com`;
    const password = "Password123!";

    let accessCookie: string;
    let refreshCookie: string;

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email,
            },
        });

        await prisma.$disconnect();
    });

    describe("POST /api/v1/auth/register", () => {
        it("should register a user", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "API Test User",
                    email,
                    password,
                    role: "CANDIDATE",
                });

            expect(response.status).toBe(201);

            expect(response.body.success).toBe(true);

            expect(response.body.data.user).toMatchObject({
                email,
                role: "CANDIDATE",
            });

            expect(response.headers["set-cookie"]).toBeDefined();

            const cookies = getCookies(response.headers);

            expect(
                cookies.some((cookie: string) =>
                    cookie.startsWith("accessToken=")
                )
            ).toBe(true);

            expect(
                cookies.some((cookie: string) =>
                    cookie.startsWith("refreshToken=")
                )
            ).toBe(true);
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should login successfully", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email,
                    password,
                });

            expect(response.status).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.data.user.email).toBe(
                email
            );

            const cookies = getCookies(response.headers);

            expect(cookies).toBeDefined();

            accessCookie = cookies.find(
                (cookie: string) =>
                    cookie.startsWith("accessToken=")
            )!;

            refreshCookie = cookies.find(
                (cookie: string) =>
                    cookie.startsWith("refreshToken=")
            )!;

            expect(accessCookie).toBeDefined();
            expect(refreshCookie).toBeDefined();
        });

        it("should reject invalid credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email,
                    password: "WrongPassword123!",
                });

            expect(response.status).toBe(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/v1/auth/me", () => {
        it("should return the authenticated user", async () => {
            const response = await request(app)
                .get("/api/v1/auth/me")
                .set("Cookie", accessCookie);

            expect(response.status).toBe(200);

            expect(response.body.success).toBe(true);

            expect(response.body.data).toMatchObject({
                email,
                role: "CANDIDATE",
            });
        });

        it("should reject unauthenticated requests", async () => {
            const response = await request(app)
                .get("/api/v1/auth/me");

            expect(response.status).toBe(401);
        });
    });

    describe("POST /api/v1/auth/refresh", () => {
        it("should refresh the access token", async () => {
            const response = await request(app)
                .post("/api/v1/auth/refresh")
                .set("Cookie", refreshCookie);

            expect(response.status).toBe(200);

            expect(response.body.success).toBe(true);

            const cookies = getCookies(response.headers);

            expect(cookies).toBeDefined();

            expect(
                cookies.some((cookie: string) =>
                    cookie.startsWith("accessToken=")
                )
            ).toBe(true);

            expect(
                cookies.some((cookie: string) =>
                    cookie.startsWith("refreshToken=")
                )
            ).toBe(true);
        });
    });

    describe("POST /api/v1/auth/logout", () => {
        it("should logout successfully", async () => {
            const response = await request(app)
                .post("/api/v1/auth/logout")
                .set("Cookie", refreshCookie);

            expect(response.status).toBe(200);

            expect(response.body.success).toBe(true);
        });
    });
});