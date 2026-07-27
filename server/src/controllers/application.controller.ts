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