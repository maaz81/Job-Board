import { z } from "zod";

export const applySchema = z.object({
    coverLetter: z.string().trim().max(3000).optional(),
});

export const updateStatusSchema = z.object({
    status: z.enum([
        "APPLIED",
        "SCREENING",
        "INTERVIEW",
        "OFFER",
        "HIRED",
        "REJECTED",
    ]),
});