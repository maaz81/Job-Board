import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2).max(60),
    email: z.string().trim().email(),
    password: z.string().min(8),
    role: z.enum(["CANDIDATE", "RECRUITER"]),
});

export const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address"),
});

export const resetPasswordSchema = z.object({
    token: z
        .string()
        .min(1, "Reset token is required"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters"),
});