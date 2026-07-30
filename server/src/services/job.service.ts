import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/errors";
import { slugify } from "../utils/slugify";

export async function listJobs(filters: any) {
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 10);

    const where: Prisma.JobWhereInput = {
        isActive: true,
        ...(filters.search && {
            OR: [
                { title: { contains: filters.search, mode: "insensitive" } },
                { skills: { has: filters.search } },
            ],
        }),
        ...(filters.type && { type: filters.type as any }),
        ...(filters.experience && { experience: filters.experience as any }),
        ...(filters.isRemote !== undefined && { isRemote: filters.isRemote }),
        ...(filters.location && {
            location: {
                contains: filters.location,
                mode: "insensitive",
            },
        }),
    };

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
            orderBy: [
                { isFeatured: "desc" },
                { createdAt: "desc" },
            ],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.job.count({ where }),
    ]);

    return {
        jobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
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