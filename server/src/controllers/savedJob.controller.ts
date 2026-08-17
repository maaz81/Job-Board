import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as savedJobService from "../services/savedJob.service";
import { success } from "../utils/apiResponse";

export async function saveJob(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await savedJobService.saveJob(
            req.user!.id,
            req.params.id as string
        );

        res.status(201).json(
            success(result, "Job saved successfully")
        );
    } catch (err) {
        next(err);
    }
}

export async function unsaveJob(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await savedJobService.unsaveJob(
            req.user!.id,
            req.params.id as string
        );

        res.json(
            success(result, "Job removed from saved jobs")
        );
    } catch (err) {
        next(err);
    }
}

export async function isJobSaved(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await savedJobService.isJobSaved(
            req.user!.id,
            req.params.id as string
        );

        res.json(
            success(result, "Saved job status fetched")
        );
    } catch (err) {
        next(err);
    }
}

export async function getSavedJobs(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        const result =
            await savedJobService.getSavedJobs(
                req.user!.id,
                page,
                limit
            );

        res.json(
            success(result, "Saved jobs fetched")
        );
    } catch (err) {
        next(err);
    }
}