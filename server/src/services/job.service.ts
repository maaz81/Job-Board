import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors";
import { slugify } from "../utils/slugify";
import { getCache, setCache } from "../utils/cache";

export async function listJobs(filters: any) {
    const cacheKey = `jobs:${JSON.stringify(filters)}`;

    const cached = await getCache<{
        jobs: unknown[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>(cacheKey);

    if (cached) {
        return cached;
    }
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 10);

    const search = filters.search?.trim();

    const where: Prisma.JobWhereInput = {
        isActive: true,

        ...(search && {
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    location: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    skills: {
                        has: search,
                    },
                },
            ],
        }),

        ...(filters.type && {
            type: filters.type,
        }),

        ...(filters.experience && {
            experience: filters.experience,
        }),

        ...(filters.isRemote !== undefined && {
            isRemote: filters.isRemote,
        }),

        ...(filters.location && {
            location: {
                contains: filters.location,
                mode: "insensitive",
            },
        }),

        ...(filters.salaryMin !== undefined && {
            salaryMax: {
                gte: Number(filters.salaryMin),
            },
        }),

        ...(filters.salaryMax !== undefined && {
            salaryMin: {
                lte: Number(filters.salaryMax),
            },
        }),
    };

    let orderBy: Prisma.JobOrderByWithRelationInput[];

    switch (filters.sort) {
        case "oldest":
            orderBy = [
                { createdAt: "asc" },
            ];
            break;

        case "salary-high":
            orderBy = [
                { salaryMax: "desc" },
                { createdAt: "desc" },
            ];
            break;

        case "salary-low":
            orderBy = [
                { salaryMin: "asc" },
                { createdAt: "desc" },
            ];
            break;

        case "newest":
        default:
            orderBy = [
                { isFeatured: "desc" },
                { createdAt: "desc" },
            ];
    }

    const [jobs, total] = await Promise.all([
        prisma.job.findMany({
            where,

            include: {
                company: {
                    select: {
                        name: true,
                        logo: true,
                        slug: true,
                    },
                },
            },

            orderBy,

            skip: (page - 1) * limit,
            take: limit,
        }),

        prisma.job.count({ where }),
    ]);

    const result = {
        jobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    await setCache(cacheKey, result, 60);

    return result;
}

export async function getJobBySlug(slug: string) {
    const job = await prisma.job.findUnique({ where: { slug }, include: { company: true } });
    if (!job) throw new NotFoundError("Job not found");
    prisma.job.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => { });
    return job;
}

export async function getMyJobs(userId: string) {
    return prisma.job.findMany({
        where: { userId },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
    });
}

export async function createJob(userId: string, input: any) {
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) throw new BadRequestError("Create your company profile before posting a job");

    const base = slugify(input.title);
    let slug = base;
    let n = 1;
    while (await prisma.job.findUnique({ where: { slug } })) slug = `${base}-${n++}`;

    return prisma.job.create({ data: { ...input, slug, userId, companyId: company.id } });
}

export async function setJobStatus(userId: string, jobId: string, isActive: boolean) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job not found");
    if (job.userId !== userId) throw new ForbiddenError("You don't own this job");
    return prisma.job.update({ where: { id: jobId }, data: { isActive } });
}

export async function updateJob(
    userId: string,
    jobId: string,
    input: any
) {
    const job = await prisma.job.findUnique({
        where: {
            id: jobId,
        },
    });

    if (!job) {
        throw new NotFoundError("Job not found");
    }

    if (job.userId !== userId) {
        throw new ForbiddenError(
            "You don't own this job"
        );
    }

    return prisma.job.update({
        where: {
            id: jobId,
        },
        data: input,
    });
}