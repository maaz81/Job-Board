import { PrismaClient } from "@prisma/client";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export async function applyToJob(userId: string, jobId: string, coverLetter?: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.isActive) throw new NotFoundError("Job not found or no longer accepting applications");

    const existing = await prisma.application.findUnique({ where: { userId_jobId: { userId, jobId } } });
    if (existing) throw new ConflictError("You've already applied to this job");

    return prisma.application.create({ data: { userId, jobId, coverLetter } });
}

export async function getMyApplications(userId: string) {
    return prisma.application.findMany({
        where: { userId },
        include: { job: { include: { company: { select: { name: true, logo: true, slug: true } } } } },
        orderBy: { createdAt: "desc" },
    });
}

export async function getJobApplications(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job not found");
    if (job.userId !== userId) throw new ForbiddenError("You don't own this job");

    return prisma.application.findMany({
        where: { jobId },
        include: { user: { select: { id: true, name: true, email: true, profile: true } } },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateApplicationStatus(recruiterId: string, jobId: string, applicationId: string, status: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job not found");
    if (job.userId !== recruiterId) throw new ForbiddenError("You don't own this job");

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application || application.jobId !== jobId) throw new NotFoundError("Application not found");

    return prisma.application.update({ where: { id: applicationId }, data: { status: status as any } });
}