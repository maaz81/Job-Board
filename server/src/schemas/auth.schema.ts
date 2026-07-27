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