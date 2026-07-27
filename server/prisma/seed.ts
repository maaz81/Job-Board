import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash("password123", 10);

    const recruiter = await prisma.user.upsert({
        where: { email: "recruiter@demo.com" }, update: {},
        create: { name: "Alex Recruiter", email: "recruiter@demo.com", password: passwordHash, role: "RECRUITER" },
    });
    const candidate = await prisma.user.upsert({
        where: { email: "candidate@demo.com" }, update: {},
        create: { name: "Sam Candidate", email: "candidate@demo.com", password: passwordHash, role: "CANDIDATE" },
    });

    const company = await prisma.company.upsert({
        where: { userId: recruiter.id }, update: {},
        create: { userId: recruiter.id, name: "Acme Technologies", slug: "acme-technologies", industry: "SaaS", location: "Remote", description: "We build tools for modern teams." },
    });

    const jobs = [
        { title: "Senior Frontend Engineer", slug: "senior-frontend-engineer", description: "We're looking for a senior frontend engineer to lead development of our core product using React and TypeScript.", requirements: ["5+ years React", "Strong TypeScript"], responsibilities: ["Build UI components", "Mentor engineers"], skills: ["React", "TypeScript", "Tailwind"], type: "FULL_TIME" as const, experience: "SENIOR" as const, location: "Remote", isRemote: true, salaryMin: 120000, salaryMax: 160000, isFeatured: true },
        { title: "Backend Engineer (Node.js)", slug: "backend-engineer-nodejs", description: "Join our backend team building scalable APIs powering our hiring platform for thousands of users.", requirements: ["3+ years Node.js", "PostgreSQL experience"], responsibilities: ["Design APIs", "Own schema decisions"], skills: ["Node.js", "PostgreSQL", "Express"], type: "FULL_TIME" as const, experience: "MID" as const, location: "San Francisco, CA", isRemote: false, salaryMin: 100000, salaryMax: 140000 },
        { title: "Product Design Intern", slug: "product-design-intern", description: "Support our design team on UI/UX projects, gaining hands-on experience working with real users and shipping features.", requirements: ["Portfolio of design work", "Familiarity with Figma"], responsibilities: ["Assist with wireframes", "User research"], skills: ["Figma", "UI Design"], type: "INTERNSHIP" as const, experience: "ENTRY" as const, location: "Remote", isRemote: true },
    ];

    for (const job of jobs) {
        await prisma.job.upsert({ where: { slug: job.slug }, update: {}, create: { ...job, userId: recruiter.id, companyId: company.id } });
    }
    console.log("Seeded:", recruiter.email, candidate.email);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());