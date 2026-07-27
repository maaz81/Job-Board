import { z } from "zod";
export const matchScoreSchema = z.object({
    body: z.object({ resumeText: z.string().trim().min(50, "Paste at least 50 characters of your resume") }),
});