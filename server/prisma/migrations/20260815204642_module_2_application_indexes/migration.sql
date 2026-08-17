-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'WITHDRAWN';

-- CreateIndex
CREATE INDEX "applications_userId_createdAt_idx" ON "applications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "applications_jobId_status_idx" ON "applications"("jobId", "status");
