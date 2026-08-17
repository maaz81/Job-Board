import { prisma } from "../lib/prisma";
import {
    BadRequestError,
    NotFoundError,
} from "../utils/errors";

export async function saveJob(
    userId: string,
    jobId: string
) {
    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: {
            id: true,
            isActive: true,
        },
    });

    if (!job) {
        throw new NotFoundError("Job not found");
    }

    if (!job.isActive) {
        throw new BadRequestError(
            "Cannot save an inactive job"
        );
    }

    const existing = await prisma.savedJob.findUnique({
        where: {
            userId_jobId: {
                userId,
                jobId,
            },
        },
    });

    if (existing) {
        return {
            saved: true,
            alreadySaved: true,
            savedJob: existing,
        };
    }

    const savedJob = await prisma.savedJob.create({
        data: {
            userId,
            jobId,
        },
    });

    return {
        saved: true,
        alreadySaved: false,
        savedJob,
    };
}

export async function unsaveJob(
    userId: string,
    jobId: string
) {
    const existing = await prisma.savedJob.findUnique({
        where: {
            userId_jobId: {
                userId,
                jobId,
            },
        },
    });

    if (!existing) {
        return {
            saved: false,
            alreadyUnsaved: true,
        };
    }

    await prisma.savedJob.delete({
        where: {
            userId_jobId: {
                userId,
                jobId,
            },
        },
    });

    return {
        saved: false,
        alreadyUnsaved: false,
    };
}

export async function isJobSaved(
    userId: string,
    jobId: string
) {
    const savedJob = await prisma.savedJob.findUnique({
        where: {
            userId_jobId: {
                userId,
                jobId,
            },
        },
        select: {
            id: true,
            createdAt: true,
        },
    });

    return {
        saved: Boolean(savedJob),
        savedAt: savedJob?.createdAt ?? null,
    };
}

export async function getSavedJobs(
    userId: string,
    page = 1,
    limit = 10
) {
    const skip = (page - 1) * limit;

    const [savedJobs, total] = await Promise.all([
        prisma.savedJob.findMany({
            where: {
                userId,
                job: {
                    isActive: true,
                },
            },

            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                name: true,
                                logo: true,
                                slug: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },

            skip,
            take: limit,
        }),

        prisma.savedJob.count({
            where: {
                userId,
                job: {
                    isActive: true,
                },
            },
        }),
    ]);

    return {
        savedJobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}