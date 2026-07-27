import { z } from "zod";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "REMOTE"] as const;
const EXPERIENCE_LEVELS = ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"] as const;

export const createJobSchema = z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().min(50, "Description should be at least 50 characters"),
    requirements: z.array(z.string().trim().min(1)).min(1, "Add at least one requirement"),
    responsibilities: z.array(z.string().trim().min(1)).min(1, "Add at least one responsibility"),
    skills: z.array(z.string().trim().min(1)).min(1, "Add at least one skill"),
    type: z.enum(JOB_TYPES),
    experience: z.enum(EXPERIENCE_LEVELS),
    location: z.string().trim().min(2),
    isRemote: z.boolean().default(false),
    salaryMin: z.number().int().positive().optional(),
    salaryMax: z.number().int().positive().optional(),
}).refine(
    (d) => !d.salaryMin || !d.salaryMax || d.salaryMin <= d.salaryMax,
    { message: "Minimum salary can't exceed maximum salary", path: ["salaryMax"] }
);

export const jobQuerySchema = z.object({
    search: z.string().trim().optional(),
    type: z.enum(JOB_TYPES).optional(),
    experience: z.enum(EXPERIENCE_LEVELS).optional(),
    isRemote: z.coerce.boolean().optional(),
    location: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const jobStatusSchema = z.object({
    isActive: z.boolean(),
});