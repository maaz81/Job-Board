import { z } from "zod";

const experienceSchema = z.object({
    company: z.string().trim().max(150),
    role: z.string().trim().max(150),
    location: z.string().trim().max(150).optional(),
    startDate: z.string().trim().max(50).optional(),
    endDate: z.string().trim().max(50).optional(),
    description: z.string().trim().max(2000).optional(),
});

const educationSchema = z.object({
    institution: z.string().trim().max(200),
    degree: z.string().trim().max(150),
    field: z.string().trim().max(150).optional(),
    startDate: z.string().trim().max(50).optional(),
    endDate: z.string().trim().max(50).optional(),
});

export const updateProfileSchema = z.object({
    headline: z.string().trim().max(150).optional(),

    bio: z.string().trim().max(2000).optional(),

    location: z.string().trim().max(150).optional(),

    website: z.string().url().max(500).optional(),

    linkedin: z.string().url().max(500).optional(),

    github: z.string().url().max(500).optional(),

    skills: z
        .array(
            z.string()
                .trim()
                .min(1)
                .max(100)
        )
        .max(50)
        .optional(),

    experience: z
        .array(experienceSchema)
        .max(20)
        .optional(),

    education: z
        .array(educationSchema)
        .max(20)
        .optional(),
});