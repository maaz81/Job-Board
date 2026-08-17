-- CreateIndex
CREATE INDEX "jobs_isActive_createdAt_idx" ON "jobs"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "jobs_isActive_isFeatured_createdAt_idx" ON "jobs"("isActive", "isFeatured", "createdAt");

-- CreateIndex
CREATE INDEX "jobs_type_experience_idx" ON "jobs"("type", "experience");

-- CreateIndex
CREATE INDEX "jobs_location_idx" ON "jobs"("location");

-- CreateIndex
CREATE INDEX "jobs_salaryMin_idx" ON "jobs"("salaryMin");

-- CreateIndex
CREATE INDEX "jobs_salaryMax_idx" ON "jobs"("salaryMax");

-- CreateIndex
CREATE INDEX "jobs_companyId_idx" ON "jobs"("companyId");

-- CreateIndex
CREATE INDEX "saved_jobs_userId_createdAt_idx" ON "saved_jobs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "saved_jobs_jobId_idx" ON "saved_jobs"("jobId");
