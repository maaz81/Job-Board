// routes/application.routes.ts
import { Router } from "express";
import * as applicationController from "../controllers/application.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.get(
    "/mine",
    authenticate,
    authorize("CANDIDATE"),
    applicationController.getMyApplications
);
router.get(
    "/:id",
    authenticate,
    authorize("CANDIDATE"),
    applicationController.getApplicationById
);

router.patch(
    "/:id/withdraw",
    authenticate,
    authorize("CANDIDATE"),
    applicationController.withdrawApplication
);
export default router;