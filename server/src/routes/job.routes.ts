import { Router } from "express";

import * as jobController from "../controllers/job.controller";
import * as applicationController from "../controllers/application.controller";
import * as savedJobController from "../controllers/savedJob.controller";
import * as aiController from "../controllers/ai.controller";

import {
    authenticate,
    authorize,
} from "../middleware/auth";

import { validate } from "../middleware/validate";

import {
    applySchema,
    updateStatusSchema,
} from "../schemas/application.schema";

import {
    createJobSchema,
    updateJobSchema,
    jobQuerySchema,
    jobStatusSchema,
} from "../schemas/job.schema";

import {
    matchScoreSchema,
} from "../schemas/ai.schema";

const router = Router();

// ─────────────────────────────────────────────
// PUBLIC JOB DISCOVERY
// ─────────────────────────────────────────────

router.get(
    "/",
    validate(jobQuerySchema),
    jobController.listJobs
);

router.get(
    "/recruiter/mine",
    authenticate,
    authorize("RECRUITER"),
    jobController.getMyJobs
);

// ─────────────────────────────────────────────
// CANDIDATE SAVED JOBS
// IMPORTANT: before /:slug
// ─────────────────────────────────────────────

router.get(
    "/saved",
    authenticate,
    authorize("CANDIDATE"),
    savedJobController.getSavedJobs
);

// router.get(
//     "/recommended",
//     authenticate,
//     authorize("CANDIDATE"),
//     jobController.getRecommendedJobs
// );

// ─────────────────────────────────────────────
// RECRUITER JOB MANAGEMENT
// ─────────────────────────────────────────────

router.post(
    "/",
    authenticate,
    authorize("RECRUITER"),
    validate(createJobSchema),
    jobController.createJob
);

router.patch(
    "/:id/status",
    authenticate,
    authorize("RECRUITER"),
    validate(jobStatusSchema),
    jobController.setJobStatus
);

router.patch(
    "/:id",
    authenticate,
    authorize("RECRUITER"),
    validate(updateJobSchema),
    jobController.updateJob
);

// ─────────────────────────────────────────────
// SAVED JOB ACTIONS
// ─────────────────────────────────────────────

router.post(
    "/:id/save",
    authenticate,
    authorize("CANDIDATE"),
    savedJobController.saveJob
);

router.delete(
    "/:id/save",
    authenticate,
    authorize("CANDIDATE"),
    savedJobController.unsaveJob
);

router.get(
    "/:id/save",
    authenticate,
    authorize("CANDIDATE"),
    savedJobController.isJobSaved
);

// ─────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────

router.get(
    "/:id/applications",
    authenticate,
    authorize("RECRUITER"),
    applicationController.getJobApplications
);

router.post(
    "/:id/apply",
    authenticate,
    authorize("CANDIDATE"),
    validate(applySchema),
    applicationController.applyToJob
);

router.patch(
    "/:id/applications/:applicationId/status",
    authenticate,
    authorize("RECRUITER"),
    validate(updateStatusSchema),
    applicationController.updateStatus
);

// ─────────────────────────────────────────────
// AI
// ─────────────────────────────────────────────

router.post(
    "/:id/match-score",
    authenticate,
    authorize("CANDIDATE"),
    validate(matchScoreSchema),
    aiController.matchScore
);

// ─────────────────────────────────────────────
// PUBLIC JOB DETAIL
// MUST BE LAST
// ─────────────────────────────────────────────

router.get(
    "/:slug",
    jobController.getJobBySlug
);

export default router;