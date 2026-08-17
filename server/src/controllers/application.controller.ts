// controllers/application.controller.ts
import { Request, Response, NextFunction } from "express";
import * as applicationService from "../services/application.service";
import { success } from "../utils/apiResponse";

export async function applyToJob(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(success(await applicationService.applyToJob(req.user!.id, req.params.id as string, req.body.coverLetter), "Application submitted")); } catch (err) { next(err); }
}
export async function getMyApplications(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await applicationService.getMyApplications(req.user!.id), "Applications fetched")); } catch (err) { next(err); }
}
export async function getJobApplications(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await applicationService.getJobApplications(req.user!.id, req.params.id as string), "Applicants fetched")); } catch (err) { next(err); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await applicationService.updateApplicationStatus(req.user!.id, req.params.id as string, req.params.applicationId as string, req.body.status);
        res.json(success(result, "Status updated"));
    } catch (err) { next(err); }
}

export async function getApplicationById(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result =
            await applicationService.getApplicationById(
                req.user!.id,
                req.params.id as string
            );

        res.json(
            success(
                result,
                "Application fetched"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function withdrawApplication(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result =
            await applicationService.withdrawApplication(
                req.user!.id,
                req.params.id as string
            );

        res.json(
            success(
                result,
                "Application withdrawn successfully"
            )
        );
    } catch (err) {
        next(err);
    }
}