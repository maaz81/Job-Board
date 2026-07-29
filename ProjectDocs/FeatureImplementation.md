# JobSphere — Feature Implementation & Improvement Roadmap

> Performed as: Senior Full Stack Architect · Senior Frontend Engineer · Senior Backend Engineer · DevOps Engineer
>
> Based on direct codebase analysis. All recommendations are concrete and specific to this project.
> Standards baseline: Production-grade Full Stack applications in 2026.

---

## Table of Contents

1. [UI/UX Improvements](#1-uiux-improvements)
2. [Frontend Improvements](#2-frontend-improvements)
3. [Backend Improvements](#3-backend-improvements)
4. [API Improvements](#4-api-improvements)
5. [Authentication & Security](#5-authentication--security)
6. [Database Improvements](#6-database-improvements)
7. [DevOps Improvements](#7-devops-improvements)
8. [Performance Optimizations](#8-performance-optimizations)
9. [Accessibility](#9-accessibility)
10. [SEO](#10-seo)
11. [Testing Strategy](#11-testing-strategy)
12. [Code Quality](#12-code-quality)
13. [Production Readiness](#13-production-readiness)
14. [Must-Have Features](#14-must-have-features)
15. [Advanced Features](#15-advanced-features)
16. [Recruiter-Wow Features](#16-recruiter-wow-features)
17. [Resume Value](#17-resume-value)
18. [Implementation Priority](#18-implementation-priority)

---

## 1. UI/UX Improvements

### Build the Dashboard Page

The Dashboard at `/dashboard` currently renders a placeholder stub with "coming next" text. This is a critical page visible to all logged-in users.

**What to build:**
- **Candidate Dashboard:** Application pipeline view (Applied, Screening, Interview, Offer counts), recent applications with status badges, recommended jobs based on profile skills, AI resume score summary card
- **Recruiter Dashboard:** Jobs overview stats (active jobs, total applicants, total views), quick-action buttons (Post Job, View Applicants), recent applicant activity feed, top-performing job cards

**Implementation:** Reuse existing API data (`/jobs/recruiter/mine`, `/applications/mine`). No new endpoints needed for the basic version.

---

### Build the Profile Page

The Profile page at `/profile` is also a stub. This is the most critical user-facing page after the dashboard.

**What to build for Candidates:**
- Editable fields: headline, bio, location, website, LinkedIn, GitHub
- Skills input (tag-style chip selector)
- Work Experience section — Add/Edit/Delete entries with company, title, dates, description
- Education section — Add/Edit/Delete entries
- Resume upload (PDF) with Cloudflare R2/Supabase Storage
- Profile completeness progress bar (drives engagement)

**What to build for Recruiters:**
- Company profile editor (logo upload, description, industry, size, founded year, location)
- If company not yet created, show an onboarding CTA

**New endpoints needed:**
```
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
POST   /api/v1/users/profile/resume      (file upload)
GET    /api/v1/companies/me
POST   /api/v1/companies/me              (already exists)
PUT    /api/v1/companies/me              (needs adding)
```

---

### Improve Job Listings Page

Current: Basic list with simple filter pills and pagination.

**Improvements:**
- Sticky filter sidebar (desktop) / bottom sheet (mobile)
- Salary range slider filter
- Multi-select for job type and experience level
- Saved/bookmarked jobs toggle (toggle already has DB model `SavedJob` — just needs UI + API)
- Sort options: Most Recent, Most Relevant, Highest Salary, Most Views
- "X jobs found" result count above listing
- Empty state illustration (not just text)
- Skeleton loading cards during fetch

---

### Improve Job Detail Page

Current: Basic text-heavy layout.

**Improvements:**
- Company logo and name as a clickable link to a company profile page
- Similar jobs sidebar (jobs from same company or same skill set)
- Application deadline countdown banner
- One-click save/bookmark button (top-right of card)
- Share job button (copy link, LinkedIn share)
- Application status indicator for the current user (Applied | Not Applied)
- Resume upload directly in apply form (not just cover letter textarea)

---

### Application Tracking Board for Candidates

Currently candidates can only see a flat list of their applications at `/candidate/applications`.

**What to build:**
A Kanban-style board with columns: Applied | Screening | Interview | Offer | Rejected.

Each application card shows:
- Company logo and job title
- Date applied
- AI match score badge
- Quick action buttons (view job, withdraw)

This is a major UX differentiator for a job board.

---

### Applicant Management Page Improvements

The existing `JobApplicants.tsx` page exists but can be significantly enhanced.

**Improvements:**
- Filter applicants by status (dropdown)
- Sort by AI score, date applied, name
- Bulk status update (select multiple, change status)
- Applicant detail modal/drawer with full profile, resume link, cover letter
- Email applicant button (mailto: link)
- Notes field per application (field already exists in DB: `notes String?`)
- Export applicants as CSV

---

## 2. Frontend Improvements

### Implement Shared Design Tokens

Replace all `[#27272A]`, `[#111827]`, `[#F9FAFB]` arbitrary Tailwind values with the CSS custom properties already defined in `index.css`.

```ts
// Before
className="border border-[#27272A] bg-[#111827]/60 text-[#F9FAFB]"

// After (using tokens already defined in @theme)
className="border border-border bg-card/60 text-foreground"
```

This makes theming, dark/light mode toggling, and future design changes trivial.

---

### Add React Error Boundary

```tsx
// main.tsx
import { ErrorBoundary } from 'react-error-boundary';

function GlobalErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <QueryClientProvider client={queryClient}>
        ...
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
```

---

### Replace Null Loading State in ProtectedRoute

```tsx
// Before
if (isLoading) return null;

// After
if (isLoading) return <FullPageSpinner />;
```

---

### Add Notification/Toast for All Mutations

All mutations (apply to job, post job, update status) should show success/error toasts. Some already use sonner's `toast`, but it should be standardized across all mutations using React Query's `onSuccess`/`onError` callbacks.

---

### Implement Saved Jobs UI

The `SavedJob` model already exists in the database. The UI just needs:
- A heart/bookmark icon on JobCard
- `POST /api/v1/jobs/:id/save` and `DELETE /api/v1/jobs/:id/save` endpoints
- A "Saved Jobs" page/section in the candidate dashboard

---

### Add Proper Loading Skeletons

Replace Loader2 spinners with realistic skeleton loading cards that match the shape of the real content. This dramatically improves perceived performance.

```tsx
function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-5 animate-pulse">
      <div className="h-5 w-2/3 bg-zinc-800 rounded mb-3" />
      <div className="h-4 w-1/3 bg-zinc-800 rounded mb-4" />
      <div className="flex gap-2">
        {[1,2,3].map(i => <div key={i} className="h-6 w-16 bg-zinc-800 rounded-full" />)}
      </div>
    </div>
  );
}
```

---

### Fix Folder Structure Inconsistency

```
Before:
pages/candidate/     (lowercase)
pages/Register/      (top-level, not under Auth)

After:
pages/Candidate/     (PascalCase consistent)
pages/Auth/
  Login.tsx
  Register.tsx       (moved under Auth)
```

---

## 3. Backend Improvements

### Fix Multiple PrismaClient Instances (Critical)

This is the highest-priority backend fix. Replace all `const prisma = new PrismaClient()` in:
- `server/src/services/auth.service.ts`
- `server/src/services/application.service.ts`
- `server/src/services/job.service.ts`
- `server/src/controllers/ai.controller.ts`

With: `import { prisma } from '../config/db';`

---

### Add Graceful Shutdown

```ts
const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

async function shutdown() {
  console.log('Received shutdown signal');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000); // Force kill after 10s
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

---

### Add Profile & Company API Endpoints

Currently there are no PUT endpoints for updating a user profile or company. Both are needed for the Profile page to work.

```
PUT /api/v1/users/profile       → Update candidate profile
PUT /api/v1/companies/me        → Update company profile
POST /api/v1/users/avatar       → Upload avatar image
DELETE /api/v1/jobs/:id         → Delete a job posting
```

---

### Add SavedJobs Endpoints

```
POST   /api/v1/jobs/:id/save    → Save a job
DELETE /api/v1/jobs/:id/save    → Unsave a job
GET    /api/v1/jobs/saved       → List saved jobs
```

The `SavedJob` model already exists in the schema with `@@unique([userId, jobId])`.

---

### Consolidate AI Services

Delete `ai.service.ts` (dead code, wrong API key for wrong provider). Rename `openrouter.service.ts` to `ai.service.ts`. Remove the `@google/generative-ai` package.

```bash
npm uninstall @google/generative-ai
```

---

### Add Structured Logging with Pino

```ts
// server/src/config/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});
```

Replace all `console.log`/`console.error` with `logger.info`/`logger.error`.

---

### Add Pagination to All List Endpoints

Add `cursor`-based or `offset`-based pagination to:
- `getMyApplications`
- `getJobApplications`
- `getMyJobs`

Standard response shape:
```ts
{
  data: [...],
  pagination: { page, limit, total, totalPages, hasNext, hasPrev }
}
```

---

## 4. API Improvements

### Fix listJobs Type Safety

```ts
// schemas/job.schema.ts — export the type
export type JobQuery = z.infer<typeof jobQuerySchema>;

// job.service.ts — use the type
export async function listJobs(filters: JobQuery) { ... }

// job.controller.ts — pass typed data
const filters = req.query as JobQuery; // safe because validate middleware already ran
res.json(success(await jobService.listJobs(filters)));
```

---

### Fix ApplicationStatus Type

```ts
// application.service.ts
import { ApplicationStatus } from '@prisma/client';

export async function updateApplicationStatus(
  recruiterId: string,
  jobId: string,
  applicationId: string,
  status: ApplicationStatus  // strongly typed enum, not string
) {
  return prisma.application.update({
    where: { id: applicationId },
    data: { status },  // no 'as any' needed
  });
}
```

---

### Add Admin API Endpoints

Since the ADMIN role exists in the schema, implement a basic admin panel API:
```
GET  /api/v1/admin/users         → List all users
GET  /api/v1/admin/jobs          → All jobs (including inactive)
PATCH /api/v1/admin/jobs/:id     → Feature/unfeature a job
DELETE /api/v1/admin/users/:id   → Delete a user
GET  /api/v1/admin/stats         → Platform statistics
```

Protected by `authorize('ADMIN')` middleware.

---

### Standardize API Response Envelope

The `paginated()` response builder exists in `apiResponse.ts` but is never used. The `listJobs` service returns a custom shape. Standardize all paginated responses through the existing `paginated()` utility.

---

## 5. Authentication & Security

### Migrate to HttpOnly Cookie-Based Auth

This is the highest-priority security improvement.

**Server changes:**
```ts
// auth.service.ts
export async function loginUser(input, res) {
  // ... validate credentials
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh',
  });

  return { user: { id, name, email, role } };
}
```

**Client changes:**
- Remove all `localStorage.getItem('jobsphere_token')` calls
- Add `withCredentials: true` to the Axios client
- No manual Authorization header attachment

---

### Add Refresh Token Rotation

```prisma
// schema.prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("refresh_tokens")
}
```

```ts
// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh);
// POST /api/v1/auth/logout (server-side cookie clear + token revocation)
router.post('/logout', authenticate, authController.logout);
```

---

### Add Per-Route Auth Rate Limiting

```ts
// auth.routes.ts
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 5,                     // 5 attempts
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Too many attempts, try again in 1 minute' },
});

router.post('/login', strictLimiter, validate(loginSchema), authController.login);
router.post('/register', strictLimiter, validate(registerSchema), authController.register);
```

---

### Enforce Password Complexity

Add to `auth.schema.ts`:
```ts
password: z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[0-9]/, 'At least one number')
  .regex(/[^A-Za-z0-9]/, 'At least one special character'),
```

---

### Remove console.log Plaintext Password

```ts
// auth.ts — remove immediately
// console.log("Register payload:", payload); // REMOVE THIS
```

---

### Add CORS Preflight Hardening

```ts
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 6. Database Improvements

### Add Missing Indexes

```prisma
// schema.prisma — add to Job model
@@index([userId])
@@index([companyId])
@@index([isActive, createdAt])
@@index([isActive, isFeatured])
@@index([type])
@@index([experience])
@@index([isRemote])

// Application model
@@index([userId])
@@index([jobId])
@@index([status])

// RefreshToken model (new)
@@index([userId])
@@index([token])
```

---

### Convert Experience and Education to Relational Models

```prisma
model WorkExperience {
  id          String    @id @default(cuid())
  profileId   String
  company     String
  title       String
  startDate   DateTime
  endDate     DateTime?
  isCurrent   Boolean   @default(false)
  description String?
  createdAt   DateTime  @default(now())

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@index([profileId])
  @@map("work_experiences")
}

model Education {
  id          String    @id @default(cuid())
  profileId   String
  institution String
  degree      String
  field       String
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime  @default(now())

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@index([profileId])
  @@map("education")
}
```

---

### Add Soft Delete for Jobs

Instead of hard-deleting job postings (losing application history), implement soft delete:

```prisma
model Job {
  deletedAt DateTime?   // null = active, set = soft-deleted
  @@index([deletedAt])
}
```

Add `where: { deletedAt: null }` to all active job queries.

---

### Deduplicate View Counter

```ts
// Only count views from non-owners and deduplicate by userId or IP
export async function getJobBySlug(slug: string, viewerId?: string) {
  const job = await prisma.job.findUnique({ where: { slug }, include: { company: true } });
  if (!job) throw new NotFoundError("Job not found");

  // Only increment if viewer is not the job owner
  if (!viewerId || viewerId !== job.userId) {
    prisma.job.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});
  }

  return job;
}
```

---

## 7. DevOps Improvements

### Add Docker Support

**`server/Dockerfile`:**
```dockerfile
# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

**`docker-compose.yml` (root):**
```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: jobsphere
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  server:
    build: ./server
    ports: ["5000:5000"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/jobsphere
      NODE_ENV: development
    depends_on: [postgres]
    volumes: [./server/src:/app/src]

  client:
    build: ./client
    ports: ["5173:5173"]
    environment:
      VITE_API_URL: http://localhost:5000/api/v1
    volumes: [./client/src:/app/src]

volumes:
  postgres_data:
```

---

### Add CD Pipeline

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    needs: build   # Only deploy if CI passes
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### Add Render Build Command with Migrations

```
npm install --include=dev && npx prisma migrate deploy && npm run prisma:generate && npm run build
```

---

### Add Prettier and Husky

```bash
npm install -D prettier husky lint-staged
npx husky init
```

**`.prettierrc`:**
```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

**`package.json` (root `lint-staged` config):**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

---

### Add Environment Variable Validation at Startup

```ts
// server/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  CLIENT_URL: z.string().url(),
  OPENROUTER_API_KEY: z.string().min(1),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
```

---

## 8. Performance Optimizations

### Configure React Query staleTime

```ts
// client/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime: 1000 * 60 * 10,     // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

### Add API Response Caching Headers

```ts
// For public job listings — cache for 60 seconds
router.get('/', validate(jobQuerySchema), (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
}, jobController.listJobs);

// For individual job pages — cache for 5 minutes
router.get('/:slug', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
}, jobController.getJobBySlug);
```

---

### Add Redis for Job Listing Cache

```ts
// server/src/config/redis.ts
import { createClient } from 'redis';
export const redis = createClient({ url: env.REDIS_URL });
await redis.connect();

// job.service.ts
export async function listJobs(filters: JobQuery) {
  const cacheKey = `jobs:${JSON.stringify(filters)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await fetchJobsFromDB(filters);
  await redis.setEx(cacheKey, 60, JSON.stringify(result)); // 60s TTL
  return result;
}
```

---

### Migrate File Storage to Cloudflare R2 or Supabase Storage

```ts
// server/src/services/storage.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadFile(buffer: Buffer, key: string, mimeType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));
  return `${env.R2_PUBLIC_URL}/${key}`;
}
```

---

## 9. Accessibility

### Associate Form Errors to Inputs

```tsx
// Every form field pattern
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    {...register('email')}
    aria-describedby={errors.email ? 'email-error' : undefined}
    aria-invalid={!!errors.email}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-sm text-red-400 mt-1">
      {errors.email.message}
    </p>
  )}
</div>
```

---

### Add aria-label to Icon Buttons

```tsx
// Before
<button onClick={handleClose}><X className="h-4 w-4" /></button>

// After
<button onClick={handleClose} aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
</button>
```

---

### Add Skip to Content Link

```tsx
// MainLayout.tsx — first element
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 bg-primary text-white px-4 py-2 rounded"
>
  Skip to content
</a>

// Main content area
<main id="main-content">
  <Outlet />
</main>
```

---

### Ensure Keyboard Navigation Works

- All interactive elements should be reachable via Tab
- Dropdowns and modals should trap focus
- Escape key should close overlays

---

## 10. SEO

### Add Dynamic Meta Tags with react-helmet-async

```bash
npm install react-helmet-async
```

```tsx
// main.tsx
import { HelmetProvider } from 'react-helmet-async';

<HelmetProvider>
  <QueryClientProvider ...>
    <App />
  </QueryClientProvider>
</HelmetProvider>

// pages/Jobs/JobDetail.tsx
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>{job.title} at {job.company.name} | JobSphere</title>
  <meta name="description" content={`${job.type.replace('_',' ')} position at ${job.company.name} in ${job.location}. ${job.description.slice(0, 150)}...`} />
  <meta property="og:title" content={`${job.title} | JobSphere`} />
  <meta property="og:description" content={job.description.slice(0, 200)} />
  <meta property="og:type" content="website" />
</Helmet>
```

---

### Add JSON-LD JobPosting Structured Data

```tsx
// pages/Jobs/JobDetail.tsx
{job && (
  <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      "title": job.title,
      "description": job.description,
      "datePosted": job.createdAt,
      "validThrough": job.deadline,
      "employmentType": job.type.replace('_', ' '),
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company.name,
      },
      "jobLocation": {
        "@type": "Place",
        "address": { "addressLocality": job.location }
      },
      "baseSalary": job.salaryMin ? {
        "@type": "MonetaryAmount",
        "currency": job.currency,
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salaryMin,
          "maxValue": job.salaryMax,
          "unitText": "YEAR"
        }
      } : undefined
    })
  }} />
)}
```

This makes job listings appear directly in Google for Jobs, dramatically increasing organic traffic.

---

### Add Vite Prerendering for Static Pages

Use `vite-plugin-prerender` or migrate landing, jobs list, and job detail pages to SSG with `@vitejs/plugin-ssr` for search engine crawlability.

---

## 11. Testing Strategy

### Backend: Vitest + Supertest

```bash
cd server && npm install -D vitest supertest @types/supertest
```

**Priority test cases:**
```ts
// auth.service.test.ts
describe('registerUser', () => {
  it('creates a user with hashed password', ...)
  it('throws ConflictError if email already exists', ...)
})

describe('loginUser', () => {
  it('returns token on valid credentials', ...)
  it('throws UnauthorizedError on wrong password', ...)
  it('throws same error for missing user and wrong password', ...)
})

// job.service.test.ts
describe('createJob', () => {
  it('throws BadRequestError if company profile does not exist', ...)
  it('generates unique slug', ...)
})

// application.service.test.ts
describe('applyToJob', () => {
  it('throws ConflictError on duplicate application', ...)
  it('throws NotFoundError for inactive job', ...)
})
```

---

### Frontend: Vitest + React Testing Library

```bash
cd client && npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

**Priority test cases:**
```tsx
// ProtectedRoute.test.tsx
it('redirects to /login when not authenticated', ...)
it('renders children when authenticated', ...)
it('redirects when role not in allowedRoles', ...)

// JobCard.test.tsx
it('renders job title and company name', ...)
it('renders salary range when provided', ...)
it('renders Remote badge when isRemote=true', ...)
```

---

### E2E: Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

**Critical flow tests:**
```ts
// auth.spec.ts
test('user can register and login', ...)
test('invalid credentials show error message', ...)

// jobs.spec.ts
test('candidate can browse and filter jobs', ...)
test('candidate can apply to a job', ...)
test('recruiter can post a job', ...)
```

---

### Add Test Coverage to CI

```yaml
# .github/workflows/ci.yml — add to Server steps
- name: Test Server
  working-directory: server
  run: npm test -- --coverage

- name: Test Client
  working-directory: client
  run: npm test -- --coverage
```

---

## 12. Code Quality

### Fix All Multiple PrismaClient Instances

Priority #1. Replace `new PrismaClient()` in all 4 files with the singleton import.

### Remove console.log with Plaintext Password

Priority #1 (security). Remove `auth.ts:6` immediately.

### Delete Dead Code

- Remove 48 lines of commented-out code in `useAuth.tsx`
- Delete orphaned `ai.service.ts` (Gemini version)
- Remove orphaned `ai.routes.ts` file or register it properly

### Expand Controller Readability

```ts
// Before
export async function listJobs(req, res, next) {
  try { res.json(success(await jobService.listJobs(req.query as any))); } catch (err) { next(err); }
}

// After
export async function listJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = req.query as JobQuery;
    const result = await jobService.listJobs(filters);
    res.json(success(result, 'Jobs fetched'));
  } catch (err) {
    next(err);
  }
}
```

### Add .env.example File

```
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/jobsphere
JWT_SECRET=your-super-secret-key-at-least-32-characters
JWT_EXPIRES_IN=15m
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development

# AI
OPENROUTER_API_KEY=sk-or-...

# Optional
UPLOAD_DIR=./uploads
LOG_LEVEL=info
SENTRY_DSN=https://...
REDIS_URL=redis://localhost:6379
```

---

## 13. Production Readiness

### Implement Database Health Check

```ts
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});
```

### Add Sentry Error Tracking

```bash
npm install @sentry/node @sentry/react
```

```ts
// server/src/server.ts
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV, tracesSampleRate: 0.1 });
```

```tsx
// client/src/main.tsx
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, integrations: [Sentry.browserTracingIntegration()] });
```

### Add Graceful SIGTERM Shutdown

Detailed in Backend Improvements section above.

### Add prisma migrate deploy to Build Pipeline

Detailed in DevOps section above.

---

## 14. Must-Have Features

These are features expected in any professional job board in 2026. The absence of any of these would be a red flag in a recruiter review.

| Feature | Status | Priority |
|---|---|---|
| Complete Dashboard (not placeholder) | Missing | Must Implement |
| Complete Profile Page (not placeholder) | Missing | Must Implement |
| Resume Upload & Storage (S3/R2) | Missing | Must Implement |
| Edit/Update Profile | Missing | Must Implement |
| Edit/Update Company Profile | Missing | Must Implement |
| Delete Job Posting | Missing | Must Implement |
| Saved/Bookmarked Jobs | DB model exists, UI missing | Must Implement |
| Email Notifications (apply, status change) | Missing | Must Implement |
| Password Reset via Email | Missing | Must Implement |
| Application Withdrawal | Missing | Must Implement |
| Job Deadline Enforcement | Field exists, not enforced | Must Implement |
| HttpOnly Cookie Auth | Using localStorage | Must Implement |
| Refresh Token | Missing | Must Implement |
| Tests (any) | Zero tests | Must Implement |

---

## 15. Advanced Features

These features demonstrate senior-level engineering judgment and system design thinking.

### Real-Time Notifications with WebSockets

When a recruiter updates an applicant's status, send a real-time notification to the candidate.

```ts
// server — add Socket.IO
import { Server } from 'socket.io';
const io = new Server(server, { cors: { origin: env.CLIENT_URL } });

// Emit on status update
io.to(`user:${application.userId}`).emit('application:status-changed', {
  jobTitle: job.title,
  status: newStatus,
});
```

**Resume value:** Demonstrates knowledge of WebSocket protocols, real-time system design, event-driven architecture.

---

### AI-Powered Job Recommendations

Based on candidate's profile skills, recommend matching jobs using vector similarity or tag matching.

```ts
// GET /api/v1/jobs/recommended
export async function getRecommendedJobs(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return [];

  // Find jobs that overlap with candidate's skills
  return prisma.job.findMany({
    where: {
      isActive: true,
      skills: { hasSome: profile.skills },
    },
    orderBy: { isFeatured: 'desc' },
    take: 10,
  });
}
```

**Resume value:** Demonstrates AI/ML integration, recommendation system thinking, Prisma advanced queries.

---

### AI Cover Letter Generator

Add a new AI endpoint that generates a tailored cover letter from the candidate's profile + job description.

```ts
// POST /api/v1/ai/cover-letter
export async function generateCoverLetter(resumeText, job) {
  const prompt = `Write a professional cover letter for this candidate applying to ${job.title}...`;
  // ...
}
```

**Resume value:** Demonstrates practical LLM integration, prompt engineering, API design.

---

### Email Notification System with Resend or Nodemailer

```ts
// Events to notify:
// 1. Application received (to recruiter)
// 2. Application status changed (to candidate)
// 3. Password reset (to user)
// 4. Weekly job digest (to candidates)

import { Resend } from 'resend';
const resend = new Resend(env.RESEND_API_KEY);

export async function sendStatusChangeEmail(candidateEmail, jobTitle, newStatus) {
  await resend.emails.send({
    from: 'noreply@jobsphere.com',
    to: candidateEmail,
    subject: `Your application for ${jobTitle} has been updated`,
    html: statusChangeTemplate(jobTitle, newStatus),
  });
}
```

**Resume value:** Demonstrates transactional email integration, event-driven side effects, queue awareness.

---

### Application Analytics for Recruiters

```
GET /api/v1/jobs/:id/analytics
Response: {
  views: 523,
  applications: 47,
  conversionRate: 8.9%,
  applicationsByDay: [...],
  topSkillsAmongApplicants: [...],
  averageAiScore: 72
}
```

**Resume value:** Demonstrates data aggregation, analytics pipeline design, business intelligence thinking.

---

### Admin Panel with Platform Statistics

A full admin dashboard accessible only to ADMIN-role users:
- Total users, jobs, applications
- New signups per day/week
- Featured job management
- User suspension/deletion
- Revenue metrics (if paid plans added later)

**Resume value:** Demonstrates RBAC implementation, admin system design, multi-tenant thinking.

---

## 16. Recruiter-Wow Features

These features make this project stand out from the hundreds of generic CRUD job boards on GitHub and demonstrate real product thinking.

### AI Interview Preparation

After a candidate's application moves to "Interview" status, trigger an AI endpoint that generates:
- 5 technical interview questions based on the job requirements
- 3 behavioral questions
- Suggested answers for each

**Why it wows:** This is a practical, user-value-adding AI feature that most job boards don't have. It shows you understand how to use AI to solve real user problems, not just as a demo.

---

### Application Funnel Visualization

A visual chart (using Recharts or Chart.js) showing the recruiter's hiring funnel:
```
Applied (100%) → Screening (40%) → Interview (15%) → Offer (5%) → Hired (3%)
```

**Why it wows:** Shows data visualization skills, business metric thinking, and makes the recruiter dashboard genuinely useful.

---

### Skill Gap Analysis

After the AI scores a resume, provide a structured breakdown:
```json
{
  "score": 72,
  "matchedSkills": ["React", "TypeScript", "Node.js"],
  "missingSkills": ["GraphQL", "AWS"],
  "recommendation": "Strong candidate, missing cloud experience"
}
```

**Why it wows:** Shows AI prompt engineering sophistication beyond basic Q&A. Requires structured JSON output from LLMs, parsing, and meaningful UI rendering.

---

### Company Public Profile Pages

```
GET /company/:slug  → Public company page
```

Shows company logo, description, open jobs, size, industry, founded year. Creates internal linking, which is also an SEO win.

**Why it wows:** Shows you think about the full product experience, not just the API.

---

### Export Applications to CSV

```ts
// GET /api/v1/jobs/:id/applications/export
res.setHeader('Content-Type', 'text/csv');
res.setHeader('Content-Disposition', `attachment; filename="applicants-${jobId}.csv"`);
```

**Why it wows:** Simple to implement but extremely practical — recruiters actually need this. Demonstrates product empathy.

---

### Job Expiration and Auto-Deactivation

When `deadline` date passes, automatically deactivate the job via a cron job.

```ts
// server/src/cron/jobs.cron.ts
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  await prisma.job.updateMany({
    where: {
      deadline: { lt: new Date() },
      isActive: true,
    },
    data: { isActive: false },
  });
  logger.info('Expired jobs deactivated');
});
```

**Why it wows:** Shows you think about data lifecycle management, background processing, and automation — hallmarks of senior thinking.

---

## 17. Resume Value

### What Each Feature Demonstrates in an Interview

| Feature | Engineering Skills Demonstrated |
|---|---|
| HttpOnly Cookie Auth + Refresh Tokens | Web security fundamentals, JWT internals, CSRF/XSS understanding |
| Real-Time Notifications (WebSockets) | Protocol-level knowledge, real-time system design, event-driven architecture, Socket.IO |
| AI Integration (match score, cover letter) | LLM API integration, prompt engineering, structured output parsing |
| Docker + docker-compose | Containerization, environment reproducibility, DevOps fundamentals |
| GitHub Actions CI/CD | Automation thinking, pipeline design, deployment strategy |
| Prisma with proper indexing | Database performance, query optimization, ORM internals |
| Vitest + Playwright tests | Testing philosophy, TDD/BDD understanding, quality mindset |
| Pino structured logging | Observability, production operations thinking |
| Sentry error tracking | Monitoring, SRE mindset, production incident awareness |
| Redis caching | Distributed systems, cache invalidation, performance optimization |
| Email notifications (Resend) | Transactional systems, event-driven side effects, queue awareness |
| Admin panel with RBAC | Multi-role system design, authorization patterns |
| Application Kanban board | UI state management, drag-and-drop, complex component composition |
| Job analytics dashboard | Data aggregation, charting libraries, business metrics |
| CSV export | Data pipeline thinking, file generation, product empathy |
| S3/R2 file storage | Cloud services, object storage, upload pipelines |
| Graceful shutdown + health checks | Production reliability, SRE, load balancer integration |
| JSON-LD structured data | SEO fundamentals, semantic web, search engine optimization |

---

## 18. Implementation Priority

### Must Implement (Do These First — Project Is Incomplete Without Them)

- [ ] Fix multiple PrismaClient instances (critical production bug)
- [ ] Remove console.log plaintext password (security)
- [ ] Build Dashboard page (currently placeholder)
- [ ] Build Profile page (currently placeholder)
- [ ] Add queryClient.clear() on logout
- [ ] Add React Error Boundary
- [ ] Add loading skeleton instead of null in ProtectedRoute
- [ ] Add prisma migrate deploy to Render build command
- [ ] Add graceful SIGTERM handling
- [ ] Fix database health check to check DB connectivity
- [ ] Add database indexes to Job and Application models
- [ ] Delete dead code (commented-out useAuth, orphaned ai.service.ts)
- [ ] Add .env.example file
- [ ] Add at least basic service-layer unit tests

### Should Implement (Significantly Improve Quality and Credibility)

- [ ] Migrate auth to HttpOnly cookies
- [ ] Add refresh token rotation
- [ ] Per-route rate limiting on auth endpoints
- [ ] Password strength validation
- [ ] Docker + docker-compose
- [ ] CD pipeline (GitHub Actions → Render + Vercel)
- [ ] Structured logging with pino
- [ ] Sentry error tracking (client + server)
- [ ] Saved jobs UI (DB model already exists)
- [ ] Resume upload to Cloudflare R2 / Supabase Storage
- [ ] Dynamic meta tags with react-helmet-async
- [ ] JSON-LD JobPosting structured data
- [ ] React Query staleTime configuration
- [ ] ARIA improvements on forms
- [ ] Prettier + husky + lint-staged
- [ ] Edit Company Profile endpoint + UI
- [ ] Delete Job posting endpoint + UI
- [ ] Pagination on my-applications and job-applications endpoints
- [ ] Convert experience/education Json[] to relational models

### Nice to Have (Differentiators and Advanced Polish)

- [ ] Real-time notifications with Socket.IO
- [ ] Application Kanban board for candidates
- [ ] AI cover letter generator
- [ ] AI interview question generator
- [ ] Application analytics chart for recruiters
- [ ] Export applicants to CSV
- [ ] Admin panel with platform stats
- [ ] Email notifications via Resend
- [ ] Job expiration cron job
- [ ] Company public profile pages
- [ ] Redis caching for job listings
- [ ] Skill gap analysis in AI score
- [ ] Application funnel visualization
- [ ] Job salary filter (range slider)
- [ ] Playwright E2E tests for critical flows
- [ ] Soft delete for jobs
- [ ] Deduplicated view counter
- [ ] Skip-to-content accessibility link

---

*End of Feature Implementation Roadmap.*
