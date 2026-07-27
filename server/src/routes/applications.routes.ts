// routes/application.routes.ts
import { Router } from "express";
import * as applicationController from "../controllers/application.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.get("/mine", authenticate, authorize("CANDIDATE"), applicationController.getMyApplications);
export default router;