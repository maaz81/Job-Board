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

export const updateJobSchema = z
    .object({
        title: z.string().trim().min(3).max(120).optional(),

        description: z
            .string()
            .trim()
            .min(50, "Description should be at least 50 characters")
            .optional(),

        requirements: z
            .array(z.string().trim().min(1))
            .min(1, "Add at least one requirement")
            .optional(),

        responsibilities: z
            .array(z.string().trim().min(1))
            .min(1, "Add at least one responsibility")
            .optional(),

        skills: z
            .array(z.string().trim().min(1))
            .min(1, "Add at least one skill")
            .optional(),

        type: z.enum(JOB_TYPES).optional(),

        experience: z.enum(EXPERIENCE_LEVELS).optional(),

        location: z.string().trim().min(2).optional(),

        isRemote: z.boolean().optional(),

        salaryMin: z.number().int().positive().optional(),

        salaryMax: z.number().int().positive().optional(),
    })
    .refine(
        (data) => {
            if (
                data.salaryMin !== undefined &&
                data.salaryMax !== undefined
            ) {
                return data.salaryMin <= data.salaryMax;
            }

            return true;
        },
        {
            message: "Minimum salary can't exceed maximum salary",
            path: ["salaryMax"],
        }
    );

export const jobQuerySchema = z.object({
    search: z
        .string()
        .trim()
        .max(100)
        .optional(),

    type: z
        .enum([
            "FULL_TIME",
            "PART_TIME",
            "CONTRACT",
            "INTERNSHIP",
            "FREELANCE",
            "REMOTE",
        ])
        .optional(),

    experience: z
        .enum([
            "ENTRY",
            "MID",
            "SENIOR",
            "LEAD",
            "EXECUTIVE",
        ])
        .optional(),

    isRemote: z
        .string()
        .optional()
        .transform((value) => {
            if (value === undefined) return undefined;
            if (value === "true") return true;
            if (value === "false") return false;
            return undefined;
        }),

    location: z
        .string()
        .trim()
        .max(100)
        .optional(),

    salaryMin: z
        .coerce
        .number()
        .int()
        .min(0)
        .optional(),

    salaryMax: z
        .coerce
        .number()
        .int()
        .min(0)
        .optional(),

    sort: z
        .enum([
            "newest",
            "oldest",
            "salary-high",
            "salary-low",
        ])
        .default("newest"),

    page: z
        .coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(10),
})
    .refine(
        (data) =>
            data.salaryMin === undefined ||
            data.salaryMax === undefined ||
            data.salaryMin <= data.salaryMax,
        {
            message: "salaryMin cannot be greater than salaryMax",
            path: ["salaryMin"],
        }
    );

export const jobStatusSchema = z.object({
    isActive: z.boolean(),
});