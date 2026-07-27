// controllers/company.controller.ts
import { Request, Response, NextFunction } from "express";
import * as companyService from "../services/company.service";
import { success } from "../utils/apiResponse";

export async function getMyCompany(req: Request, res: Response, next: NextFunction) {
    try { res.json(success(await companyService.getMyCompany(req.user!.id), "Company fetched")); } catch (err) { next(err); }
}
export async function createCompany(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(success(await companyService.createCompany(req.user!.id, req.body), "Company created")); } catch (err) { next(err); }
}