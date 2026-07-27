import { PrismaClient } from "@prisma/client";
import { ConflictError } from "../utils/errors";
import { slugify } from "../utils/slugify";

const prisma = new PrismaClient();

export async function getMyCompany(userId: string) {
    return prisma.company.findUnique({ where: { userId } });
}

export async function createCompany(userId: string, input: { name: string; website?: string; description?: string; industry?: string; location?: string }) {
    const existing = await prisma.company.findUnique({ where: { userId } });
    if (existing) throw new ConflictError("You already have a company profile");

    const base = slugify(input.name);
    let slug = base;
    let n = 1;
    while (await prisma.company.findUnique({ where: { slug } })) slug = `${base}-${n++}`;

    return prisma.company.create({ data: { ...input, slug, userId } });
}