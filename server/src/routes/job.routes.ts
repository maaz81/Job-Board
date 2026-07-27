// routes/job.routes.ts
import { Router } from "express";
import * as jobController from "../controllers/job.controller";
import * as applicationController from "../controllers/application.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createJobSchema, jobQuerySchema, jobStatusSchema } from "../schemas/job.schema";
import { applySchema } from "../schemas/application.schema";
import * as aiController from "../controllers/ai.controller"; import { matchScoreSchema } from "../schemas/ai.schema";

const router = Router();

router.get("/", validate(jobQuerySchema), jobController.listJobs);
router.get("/recruiter/mine", authenticate, authorize("RECRUITER"), jobController.getMyJobs);
router.get("/:slug", jobController.getJobBySlug);

router.post("/", authenticate, authorize("RECRUITER"), validate(createJobSchema), jobController.createJob);
router.patch("/:id/status", authenticate, authorize("RECRUITER"), validate(jobStatusSchema), jobController.setJobStatus);
router.get("/:id/applications", authenticate, authorize("RECRUITER"), applicationController.getJobApplications);
router.post("/:id/apply", authenticate, authorize("CANDIDATE"), validate(applySchema), applicationController.applyToJob);

router.post("/:id/match-score", authenticate, authorize("CANDIDATE"), validate(matchScoreSchema), aiController.matchScore);

export default router;