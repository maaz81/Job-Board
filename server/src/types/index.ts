import { Role, JobType, ExperienceLevel, ApplicationStatus } from '@prisma/client';

// ── Auth ─────────────────────────────────────────────────────────────────────

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: SafeUser;
};

// ── User ─────────────────────────────────────────────────────────────────────

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
  createdAt: Date;
};

// ── Job ──────────────────────────────────────────────────────────────────────

export type JobFilters = {
  search?: string;
  type?: JobType;
  experience?: ExperienceLevel;
  location?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  companyId?: string;
};

// ── Application ───────────────────────────────────────────────────────────────

export type ApplicationWithDetails = {
  id: string;
  status: ApplicationStatus;
  aiScore: number | null;
  aiFeedback: string | null;
  createdAt: Date;
  job: {
    id: string;
    title: string;
    company: { name: string; logo: string | null };
  };
  user: SafeUser;
};

// ── Query Params ──────────────────────────────────────────────────────────────

export type PaginationQuery = {
  page?: string;
  limit?: string;
};
