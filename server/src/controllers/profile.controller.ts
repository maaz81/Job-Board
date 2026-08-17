import {
    Request,
    Response,
    NextFunction,
} from "express";

import * as profileService from "../services/profile.service";
import { success } from "../utils/apiResponse";

export async function getMyProfile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await profileService.getMyProfile(
            req.user!.id
        );

        res.json(
            success(
                result,
                "Profile fetched"
            )
        );
    } catch (err) {
        next(err);
    }
}

export async function updateMyProfile(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const result = await profileService.updateMyProfile(
            req.user!.id,
            req.body
        );

        res.json(
            success(
                result,
                "Profile updated successfully"
            )
        );
    } catch (err) {
        next(err);
    }
}