import { prisma } from "../lib/prisma";

function normalize(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s.-]/g, "");
}

function calculateSkillScore(
    candidateSkills: string[],
    jobSkills: string[]
) {
    if (!candidateSkills.length || !jobSkills.length) {
        return 0;
    }

    const candidateSet = new Set(
        candidateSkills.map(normalize)
    );

    const matchedSkills = jobSkills.filter((skill) =>
        candidateSet.has(normalize(skill))
    );

    return Math.round(
        (matchedSkills.length / jobSkills.length) * 100
    );
}

function calculateExperienceScore(
    candidateExperience: string | undefined,
    jobExperience: string
) {
    if (!candidateExperience) {
        return 0;
    }

    return normalize(candidateExperience) ===
        normalize(jobExperience)
        ? 100
        : 50;
}

function calculateLocationScore(
    candidateLocation: string | undefined,
    jobLocation: string,
    isRemote: boolean
) {
    if (isRemote) {
        return 100;
    }

    if (!candidateLocation) {
        return 0;
    }

    return normalize(candidateLocation) ===
        normalize(jobLocation)
        ? 100
        : 0;
}

export async function getRecommendedJobs(
    userId: string,
    limit = 10
) {
    const profile = await prisma.profile.findUnique({
        where: {
            userId,
        },
        select: {
            skills: true,
            location: true,
            experience: true,
        },
    });

    if (!profile) {
        return {
            jobs: [],
            reason: "Complete your profile to receive job recommendations",
        };
    }

    const jobs = await prisma.job.findMany({
        where: {
            isActive: true,
        },
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
            {
                isFeatured: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
        take: 100,
    });

    const candidateExperience =
        Array.isArray(profile.experience) &&
            profile.experience.length > 0
            ? String(
                (profile.experience[0] as Record<string, unknown>)
                    ?.level ?? ""
            )
            : undefined;

    const scoredJobs = jobs.map((job) => {
        const skillScore = calculateSkillScore(
            profile.skills,
            job.skills
        );

        const experienceScore =
            calculateExperienceScore(
                candidateExperience,
                job.experience
            );

        const locationScore =
            calculateLocationScore(
                profile.location ?? undefined,
                job.location,
                job.isRemote
            );

        const recommendationScore = Math.round(
            skillScore * 0.6 +
            experienceScore * 0.25 +
            locationScore * 0.15
        );

        return {
            ...job,
            recommendationScore,
        };
    });

    scoredJobs.sort(
        (a, b) =>
            b.recommendationScore -
            a.recommendationScore
    );

    return {
        jobs: scoredJobs.slice(0, limit),
    };
}