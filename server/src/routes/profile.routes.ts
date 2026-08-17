import { Router } from "express";

import * as profileController
    from "../controllers/profile.controller";

import {
    authenticate,
    authorize,
} from "../middleware/auth";

import { validate } from "../middleware/validate";

import {
    updateProfileSchema,
} from "../schemas/profile.schema";

const router = Router();

router.get(
    "/me",
    authenticate,
    authorize("CANDIDATE"),
    profileController.getMyProfile
);

router.patch(
    "/me",
    authenticate,
    authorize("CANDIDATE"),
    validate(updateProfileSchema),
    profileController.updateMyProfile
);

export default router;