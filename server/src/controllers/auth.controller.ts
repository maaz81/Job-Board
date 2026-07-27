import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { success } from "../utils/apiResponse";

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json(success(result, "Account created successfully"));
    } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await authService.loginUser(req.body);
        res.json(success(result, "Logged in successfully"));
    } catch (err) { next(err); }
}

export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new Error("Unauthorized");
        const user = await authService.getCurrentUser(req.user.id);
        res.json(success(user, "User fetched successfully"));
    } catch (err) { next(err); }
}