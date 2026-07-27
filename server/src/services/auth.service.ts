import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ConflictError, UnauthorizedError } from "../utils/errors"; // match your existing error classes

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

function generateToken(user: {
    id: string;
    email: string;
    role: Role;
}) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN ?? "7d",
        }
    );
}

export async function registerUser(input: { name: string; email: string; password: string; role: Role }) {
    const email = input.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError("An account with this email already exists");

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await prisma.user.create({
        data: { name: input.name.trim(), email, password: passwordHash, role: input.role },
    });

    return {
        token: generateToken(user),
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
}

export async function loginUser(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    // same error for "no user" and "wrong password" — don't leak which one failed
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
        throw new UnauthorizedError("Invalid email or password");
    }

    return {
        token: generateToken(user),
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
}

export async function getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedError("User not found");
    return user;
}