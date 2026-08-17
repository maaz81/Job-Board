// controllers/job.controller.ts
import { Request, Response, NextFunction } from "express";
import * as jobService from "../services/job.service";
import { success } from "../utils/apiResponse";
import * as recommendationService from "../services/recommendation.service";

export async function listJobs(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await jobService.listJobs(req.query as any), "Jobs fetched")); } catch (err) { next(err); }
}
export async function getJobBySlug(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await jobService.getJobBySlug(req.params.slug as string), "Job fetched")); } catch (err) { next(err); }
}
export async function getMyJobs(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await jobService.getMyJobs(req.user!.id), "Jobs fetched")); } catch (err) { next(err); }
}
export async function createJob(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(success(await jobService.createJob(req.user!.id, req.body), "Job posted")); } catch (err) { next(err); }
}
export async function setJobStatus(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await jobService.setJobStatus(req.user!.id, req.params.id as string, req.body.isActive), "Status updated")); } catch (err) { next(err); }
}

export async function updateJob(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const job = await jobService.updateJob(
            req.user!.id,
            req.params.id as string,
            req.body
        );

        res.json(
            success(
                job,
                "Job updated successfully"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function getRecommendedJobs(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result =
            await recommendationService.getRecommendedJobs(
                req.user!.id
            );

        res.json(
            success(
                result,
                "Recommended jobs fetched"
            )
        );
    } catch (err) {
        next(err);
    }
}