export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE" | "REMOTE";

export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";

export type ApplicationStatus = "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
  createdAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  resumeUrl: string | null;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

// ── Company ───────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  founded: number | null;
}

// ── Job ───────────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  type: JobType;
  experience: ExperienceLevel;
  location: string;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  company: Pick<Company, "name" | "logo" | "slug">;
  _count?: { applications: number };
}

// ── Application ───────────────────────────────────────────────────────────────

export interface Application {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  aiScore: number | null;
  createdAt: string;
  job: Job;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

// ── API ───────────────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedJobs {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Filters ───────────────────────────────────────────────────────────────────

export interface JobFilters {
  search?: string;
  type?: JobType;
  experience?: ExperienceLevel;
  location?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
}

// ── AI ────────────────────────────────────────────────────────────────────────

export interface ResumeMatchResult {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export interface ResumeFeedback {
  overall: string;
  sections: Array<{
    section: string;
    feedback: string;
    score: number;
  }>;
  suggestions: string[];
}

export interface CoverLetterResult {
  coverLetter: string;
}

export interface InterviewQuestionsResult {
  questions: Array<{
    category: string;
    question: string;
    difficulty: "Easy" | "Medium" | "Hard";
  }>;
}

export interface Applicant {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeUrl: string | null;
  aiScore: number | null;
  aiFeedback: string | null;
  createdAt: string;
  user: {
    id: string; name: string; email: string;
    profile: { headline: string | null; bio: string | null; location: string | null; website: string | null; linkedin: string | null; github: string | null; skills: string[] } | null;
  };
}