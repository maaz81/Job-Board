import { z } from "zod";

export const createCompanySchema = z.object({
    name: z.string().trim().min(2).max(100),
    website: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
    description: z.string().trim().max(2000).optional(),
    industry: z.string().trim().optional(),
    location: z.string().trim().optional(),
});