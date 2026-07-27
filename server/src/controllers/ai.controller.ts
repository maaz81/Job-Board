import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { getResumeMatchScore } from "../services/openrouter.service";
import { success } from "../utils/apiResponse";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export async function matchScore(req: Request, res: Response, next: NextFunction) {
    try {
        const job = await prisma.job.findUnique({
            where: { id: String(req.params.id) },
        });

        if (!job) throw new NotFoundError("Job not found");

        const result = await getResumeMatchScore(req.body.resumeText, job);

        return res.json(success(result, "Resume analyzed"));
    } catch (err) {
        next(err);
    }
}