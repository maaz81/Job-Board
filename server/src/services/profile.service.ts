import {
    BadRequestError,
    NotFoundError,
} from "../utils/errors";
import { prisma } from "../lib/prisma";

export async function getMyProfile(
    userId: string
) {
    let profile = await prisma.profile.findUnique({
        where: {
            userId,
        },
    });

    if (!profile) {
        profile = await prisma.profile.create({
            data: {
                userId,
                skills: [],
                experience: [],
                education: [],
            },
        });
    }

    return profile;
}

export async function updateMyProfile(
    userId: string,
    input: any
) {
    const profile = await prisma.profile.upsert({
        where: {
            userId,
        },

        create: {
            userId,
            ...input,
            skills: input.skills ?? [],
            experience: input.experience ?? [],
            education: input.education ?? [],
        },

        update: input,
    });

    return profile;
}