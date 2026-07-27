// routes/company.routes.ts
import { Router } from "express";
import * as companyController from "../controllers/company.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCompanySchema } from "../schemas/company.schema";

const router = Router();
router.get("/me", authenticate, authorize("RECRUITER"), companyController.getMyCompany);
router.post("/me", authenticate, authorize("RECRUITER"), validate(createCompanySchema), companyController.createCompany);
export default router;