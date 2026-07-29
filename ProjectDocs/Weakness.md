# JobSphere — Full Project Audit & Weakness Report

> Performed as: Senior Full Stack Architect · Senior Frontend Engineer · Senior Backend Engineer · DevOps Engineer · Security Engineer · Technical Reviewer
>
> Standards baseline: Industry best practices as of 2026.

---

## Table of Contents

1. [Authentication & Security](#1-authentication--security)
2. [Backend Architecture](#2-backend-architecture)
3. [API Design](#3-api-design)
4. [Database Design](#4-database-design)
5. [Frontend Architecture](#5-frontend-architecture)
6. [State Management](#6-state-management)
7. [Error Handling](#7-error-handling)
8. [Type Safety](#8-type-safety)
9. [Code Quality & Organization](#9-code-quality--organization)
10. [Performance](#10-performance)
11. [DevOps & CI/CD](#11-devops--cicd)
12. [Logging & Monitoring](#12-logging--monitoring)
13. [Testing](#13-testing)
14. [Accessibility](#14-accessibility)
15. [SEO](#15-seo)
16. [Production Readiness](#16-production-readiness)
17. [Scalability](#17-scalability)

---

## 1. Authentication & Security

---

### 1.1 JWT Stored in localStorage

| Field | Detail |
|---|---|
| **Priority** | Critical |
| **Location** | `client/src/hooks/useAuth.tsx`, `client/src/api/client.ts` |

**Current Implementation:**
```ts
// useAuth.tsx
const [token, setToken] = useState(() => localStorage.getItem("jobsphere_token"));
// client.ts
const token = localStorage.getItem('jobsphere_token');
config.headers.Authorization = `Bearer ${token}`;
```

**Why It is a Weakness:**
localStorage is accessible to any JavaScript running on the page. A single XSS vulnerability — whether in your code, a dependency, or a browser extension — allows an attacker to steal the token. This is an XSS token theft attack and is the most common modern web auth exploit.

**Industry Standard:**
Store tokens in `HttpOnly; Secure; SameSite=Strict` cookies, which are completely inaccessible to JavaScript. Pair with a short-lived access token (15 min) and a long-lived refresh token in a separate HttpOnly cookie.

**Recommended Solution:**
- Server: Set `Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api`
- Client: Remove all localStorage token logic; rely on the browser to send cookies automatically
- Add CSRF protection (double-submit cookie pattern or SameSite=Strict enforced)

---

### 1.2 No Refresh Token Mechanism

| Field | Detail |
|---|---|
| **Priority** | Critical |
| **Location** | `server/src/services/auth.service.ts` |

**Current Implementation:**
A single long-lived JWT is issued. No refresh token exists. `jwt.sign({ id, email, role }, secret, { expiresIn: env.JWT_EXPIRES_IN })`.

**Why It is a Weakness:**
If `JWT_EXPIRES_IN` is set to a long duration (e.g. 7d, 30d), a stolen token is valid for the entire period with no way to revoke it. No token rotation, no session invalidation on logout, no revocation list.

**Industry Standard:**
Issue a short-lived access token (15 min) and a long-lived refresh token (7 days). On expiry, the client silently calls `POST /auth/refresh` to get a new access token.

**Recommended Solution:**
- Add `RefreshToken` model to Prisma schema (hashed token, userId, expiresAt, revoked)
- `POST /api/v1/auth/refresh` endpoint that validates and rotates the refresh token
- `POST /api/v1/auth/logout` that revokes the refresh token in the database

---

### 1.3 No Token Blacklisting / Revocation on Logout

| Field | Detail |
|---|---|
| **Priority** | Critical |
| **Location** | `client/src/hooks/useAuth.tsx` |

**Current Implementation:**
```ts
function logout() {
  localStorage.removeItem(TOKEN_KEY); // Only clears client-side
  setToken(null);
  setUser(null);
}
```

**Why It is a Weakness:**
Logout only removes the token from localStorage. The JWT remains valid on the server until expiry. Anyone with the copied token can still make authenticated API calls after logout.

**Recommended Solution:**
Server-side `POST /auth/logout` endpoint that revokes the refresh token. With HttpOnly cookies: clear cookies server-side on logout response.

---

### 1.4 Auth Route-Level Rate Limiting Missing

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/src/server.ts`, `server/src/routes/auth.routes.ts` |

**Current Implementation:**
Global rate limit of 100 requests per 15 minutes applies to ALL routes equally.

**Why It is a Weakness:**
A brute-force attack on `POST /auth/login` can make 100 attempts in 15 minutes — enough to crack common passwords.

**Recommended Solution:**
```ts
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: 'Too many auth attempts' });
router.post('/login', authLimiter, validate(loginSchema), authController.login);
```

---

### 1.5 Password Strength Not Enforced

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/src/schemas/auth.schema.ts` |

**Current Implementation:**
`password: z.string().min(8)` — only minimum length, no complexity requirements.

**Why It is a Weakness:**
`password12345678` passes. No uppercase, number, or special character requirements.

**Recommended Solution:**
```ts
password: z.string()
  .min(8)
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
```

---

### 1.6 ADMIN Role Defined but Never Enforced

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/prisma/schema.prisma` |

**Current Implementation:**
ADMIN role is defined in the Prisma enum but zero admin routes, middleware guards, or functionality exist.

**Why It is a Weakness:**
A user assigned ADMIN in the database has identical permissions to a CANDIDATE. The role is dead code.

---

### 1.7 console.log Leaking Plaintext Password in Production

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `client/src/api/auth.ts:6` |

**Current Implementation:**
`console.log("Register payload:", payload)` — this logs the registration payload including the user's plaintext password to the browser console.

**Why It is a Weakness:**
This is a direct data leak visible to anyone with DevTools open.

**Recommended Solution:**
Remove the `console.log` statement immediately.

---

### 1.8 No Input Sanitization (XSS Prevention)

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/src/server.ts`, all controllers |

**Current Implementation:**
User-provided content (job descriptions, cover letters, bios) is stored directly from `req.body` without HTML sanitization.

**Recommended Solution:**
Use `DOMPurify` on the frontend and `sanitize-html` on the backend for any HTML content.

---

## 2. Backend Architecture

---

### 2.1 Multiple PrismaClient Instances — Critical Connection Pool Bug

| Field | Detail |
|---|---|
| **Priority** | Critical |
| **Location** | `server/src/services/auth.service.ts:7`, `application.service.ts:4`, `job.service.ts:5`, `controllers/ai.controller.ts:7` |

**Current Implementation:**
Four separate `const prisma = new PrismaClient()` instantiations across services and controllers.

**Why It is a Weakness:**
Each `new PrismaClient()` creates a separate connection pool. With 4 instances opening 5-10 connections each, you exhaust your database connection limit rapidly. On free-tier PostgreSQL (Supabase/Railway limit: 20-100 connections), this is a critical production bug.

**Industry Standard:**
Single shared Prisma singleton instance imported everywhere.

**Recommended Solution:**
A correct singleton already exists at `server/src/config/db.ts`. Import `{ prisma }` from there in every service and controller. Remove all local `new PrismaClient()` instantiations.

---

### 2.2 AI Route Not Registered in server.ts

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/src/server.ts` |

**Current Implementation:**
`ai.routes.ts` is orphaned and never registered. The AI endpoint is embedded inside `job.routes.ts` instead.

**Why It is a Weakness:**
Architectural inconsistency. AI functionality buried under job routes with dead code left in server.ts.

---

### 2.3 Slug Generation Has TOCTOU Race Condition

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/src/services/job.service.ts:80-83` |

**Current Implementation:**
```ts
while (await prisma.job.findUnique({ where: { slug } })) slug = `${base}-${n++}`;
return prisma.job.create({ data: { ...input, slug } });
```

**Why It is a Weakness:**
Between checking uniqueness and creating the record, another concurrent request can claim the same slug — causing a unique constraint violation crash under load.

**Recommended Solution:**
Append a random suffix to eliminate the check entirely:
```ts
import { nanoid } from 'nanoid';
const slug = `${slugify(input.title)}-${nanoid(6)}`;
```

---

### 2.4 No Request Size Limit for AI Endpoint

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/src/controllers/ai.controller.ts` |

**Current Implementation:**
`resumeText` has no maximum length validation. A malicious user can send a multi-megabyte string, causing excessive AI token costs and DoS.

**Recommended Solution:**
`resumeText: z.string().min(50).max(10000, 'Resume text too long')`

---

### 2.5 ApplicationStatus Cast to `any`

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/services/application.service.ts:44` |

**Current Implementation:**
`data: { status: status as any }` — bypasses TypeScript enum safety for ApplicationStatus.

**Recommended Solution:**
Import and use the Prisma `ApplicationStatus` enum as the parameter type.

---

### 2.6 Two Competing AI Service Implementations

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/services/ai.service.ts`, `openrouter.service.ts` |

**Current Implementation:**
`ai.service.ts` uses Google Gemini with an OPENROUTER_API_KEY (wrong key, wrong provider). `openrouter.service.ts` uses OpenRouter. Controller uses OpenRouter service. `ai.service.ts` is dead code.

**Recommended Solution:**
Delete `ai.service.ts` and the `@google/generative-ai` dependency. Keep only `openrouter.service.ts` renamed to `ai.service.ts`.

---

## 3. API Design

---

### 3.1 Inconsistent Application Resource Routing

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/routes/job.routes.ts`, `applications.routes.ts` |

**Current Implementation:**
Applications are split: candidates apply via `/jobs/:id/apply`, fetch via `/applications/mine`, status via `/jobs/:id/applications/:id/status`. No consistent pattern.

**Recommended Solution:**
Consolidate under a single consistent RESTful pattern:
- `POST /api/v1/jobs/:jobId/applications` — Apply
- `GET /api/v1/jobs/:jobId/applications` — List applicants (recruiter)
- `PATCH /api/v1/jobs/:jobId/applications/:id` — Update status
- `GET /api/v1/applications/me` — My applications (candidate)

---

### 3.2 listJobs Passes Raw `req.query as any` Despite Having Schema Validation

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/controllers/job.controller.ts:7`, `job.service.ts:7` |

**Current Implementation:**
Zod validation parses `req.query`, but then `req.query as any` is passed to the service which accepts `filters: any`.

**Why It is a Weakness:**
The schema's type-safe output is discarded. All type protection is bypassed.

**Recommended Solution:**
Use `z.infer<typeof jobQuerySchema>` as the service parameter type and pass the validated query directly.

---

### 3.3 No Pagination on Critical List Endpoints

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/services/application.service.ts`, `job.service.ts` |

**Current Implementation:**
`getMyApplications`, `getJobApplications`, and `getMyJobs` return ALL records with no limit. A recruiter with 500 jobs causes a massive DB query.

---

## 4. Database Design

---

### 4.1 No Database Indexes on Foreign Keys and Query Columns

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/prisma/schema.prisma` |

**Current Implementation:**
`Job.userId`, `Job.companyId`, `Job.isActive`, `Job.isFeatured`, `Application.userId`, `Application.jobId` — none have indexes despite being used in every WHERE and ORDER BY clause.

**Why It is a Weakness:**
Every job listing query performs a full table scan. Response times degrade severely as data grows.

**Recommended Solution:**
```prisma
model Job {
  @@index([userId])
  @@index([companyId])
  @@index([isActive, isFeatured, createdAt])
  @@index([type, experience, isRemote])
}
model Application {
  @@index([userId])
  @@index([jobId])
  @@index([status])
}
```

---

### 4.2 Experience and Education Stored as Untyped Json[]

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/prisma/schema.prisma:80-81` |

**Current Implementation:**
`experience Json[]` and `education Json[]` in the Profile model — no schema enforcement, no queryability.

**Why It is a Weakness:**
Cannot query candidates by experience efficiently. No DB-level validation of the JSON structure.

**Recommended Solution:**
Separate `WorkExperience` and `Education` relational models.

---

### 4.3 View Counter Has No Deduplication

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/services/job.service.ts:64` |

**Current Implementation:**
Every API call to `getJobBySlug` increments `views` — including the recruiter viewing their own job and bots.

**Recommended Solution:**
Deduplicate by user ID or IP. Track only non-owner views.

---

### 4.4 Company is 1-to-1 with User — Structural Limitation

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/prisma/schema.prisma:92` |

**Current Implementation:**
`userId String @unique` forces exactly one company per recruiter. No multi-company management, no team recruiters.

---

## 5. Frontend Architecture

---

### 5.1 Dashboard and Profile Pages Are Placeholder Stubs Live in Production

| Field | Detail |
|---|---|
| **Priority** | Critical |
| **Location** | `client/src/pages/Dashboard/index.tsx`, `client/src/pages/Profile/index.tsx` |

**Current Implementation:**
Dashboard renders: `<p>Dashboard — coming next</p>`. Profile has similar stub content. Both are live in production and accessible to authenticated users.

---

### 5.2 Hardcoded Hex Color Values Throughout All Components

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | All page components |

**Current Implementation:**
`className="border border-[#27272A] bg-[#111827]/60 text-[#F9FAFB]"` repeated across hundreds of JSX elements despite design tokens being defined in `index.css`.

**Why It is a Weakness:**
Theming is impossible. UI consistency is fragile. Every color change requires a global find-and-replace.

**Recommended Solution:**
Use Tailwind semantic utility classes (`bg-card`, `text-muted`, `border-border`) that map to the CSS custom properties already defined.

---

### 5.3 48 Lines of Commented-Out Dead Code in useAuth.tsx

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `client/src/hooks/useAuth.tsx:1-48` |

**Recommended Solution:**
Delete dead code. Use Git history for recovery.

---

### 5.4 No React Error Boundary

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `client/src/main.tsx` |

**Current Implementation:**
No Error Boundary anywhere in the component tree. An unhandled runtime error crashes the entire app to a blank white screen.

**Recommended Solution:**
Wrap the app with `react-error-boundary`'s `ErrorBoundary` with a user-friendly fallback UI.

---

### 5.5 ProtectedRoute Returns null While Loading (Flash of Blank Content)

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `client/src/components/common/ProtectedRoute.tsx:9` |

**Current Implementation:**
`if (isLoading) return null;` — causes a flash of blank content on page load.

**Recommended Solution:**
Return a full-page loading spinner instead of null.

---

### 5.6 Inconsistent Page Folder Naming

| Field | Detail |
|---|---|
| **Priority** | Low |
| **Location** | `client/src/pages/` |

**Current Implementation:**
`Auth/`, `Dashboard/`, `Recruiter/` are PascalCase. `candidate/` is lowercase. `Register/` should be nested under `Auth/`.

---

## 6. State Management

---

### 6.1 React Query Cache Not Cleared on Explicit Logout

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `client/src/hooks/useAuth.tsx:86-90` |

**Current Implementation:**
`logout()` removes the token and resets state but does not call `queryClient.clear()`. Another user logging in could briefly see cached data from the previous session.

**Recommended Solution:**
Call `queryClient.clear()` inside the `logout()` function.

---

### 6.2 No React Query staleTime Configured

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `client/src/lib/queryClient.ts` |

**Current Implementation:**
Default `staleTime: 0` — every component mount triggers a background refetch. Jobs list refetches on every navigation.

**Recommended Solution:**
`defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } }` (5 minutes).

---

## 7. Error Handling

---

### 7.1 Prisma Error Handler Only Covers 2 of 20+ Error Codes

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/middleware/errorHandler.ts` |

**Current Implementation:**
Only P2002 (unique constraint) and P2025 (not found) are handled. P2003, P2014, P2016, and others return raw 500 errors.

**Recommended Solution:**
Use `PrismaClientKnownRequestError` with comprehensive code handling.

---

### 7.2 No Global Client-Side Error Handler for Non-401 Errors

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `client/src/api/client.ts` |

**Current Implementation:**
Axios interceptor only handles 401. All 500/503/network errors must be handled individually by each component.

**Recommended Solution:**
Configure `QueryCache.onError` in the QueryClient to show a global toast for unexpected errors.

---

## 8. Type Safety

---

### 8.1 Types Manually Duplicated Between Frontend and Backend

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `client/src/types/index.ts`, `server/src/schemas/*.ts` |

**Current Implementation:**
All entity types and enums are hand-written in the frontend `types/index.ts` and must be kept in sync manually with the Prisma schema.

**Why It is a Weakness:**
Schema changes will inevitably desync with frontend types, causing runtime bugs.

**Industry Standard:**
Auto-generate types from Prisma schema using `prisma-json-types-generator` or OpenAPI + `openapi-typescript`. Or use a Turborepo shared types package.

---

### 8.2 `as any` Used in 4+ Places

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `job.service.ts`, `application.service.ts`, `PostJob.tsx` |

**Current Implementation:**
`as any` type assertions disable TypeScript protection and cause CI lint failures.

---

## 9. Code Quality & Organization

---

### 9.1 Controllers Compressed to Single Lines

| Field | Detail |
|---|---|
| **Priority** | Low |
| **Location** | `server/src/controllers/job.controller.ts`, `application.controller.ts` |

Every controller method is a single unreadable line making debugging, extending, and logging impossible.

---

### 9.2 Orphaned AI Route File

| Field | Detail |
|---|---|
| **Priority** | Low |
| **Location** | `server/src/routes/ai.routes.ts` |

Defined but never imported or registered in `server.ts`.

---

### 9.3 No Prettier Configuration

| Field | Detail |
|---|---|
| **Priority** | Low |
| **Location** | Project-wide |

Server files mix single and double quotes. No `.prettierrc` or `husky` pre-commit formatting hook.

---

## 10. Performance

---

### 10.1 No Image Optimization Pipeline

| Field | Detail |
|---|---|
| **Priority** | Medium |

Company logos and avatars served as raw uncompressed images. No WebP conversion, no CDN, no resizing.

**Recommended Solution:**
Use Cloudinary or Supabase Storage with image transformation URLs.

---

### 10.2 No Cache-Control Headers on API Responses

| Field | Detail |
|---|---|
| **Priority** | Medium |

All API responses lack `Cache-Control` headers. Immutable job listings are re-fetched from the database on every request.

---

## 11. DevOps & CI/CD

---

### 11.1 TypeScript devDependencies Required at Build Time

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/package.json`, Render build config |

**Current Implementation:**
`typescript` and `@types/*` packages are in `devDependencies`. Render's default `npm install` skips them in production, causing TypeScript build failures.

**Industry Standard:**
Docker multi-stage build — compile in a builder stage, copy only `dist/` to production image with `npm ci --omit=dev`.

---

### 11.2 No Docker Support

| Field | Detail |
|---|---|
| **Priority** | High |

No `Dockerfile` or `docker-compose.yml`. Local setup is manual and differs from production.

---

### 11.3 No CD Pipeline

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `.github/workflows/` |

Only CI exists. No automated deployment to Vercel or Render trigger after CI passes on `main`.

---

### 11.4 prisma migrate deploy Not in Build Pipeline

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | Render build config |

Current build command does not run `prisma migrate deploy`. Schema changes are not applied to production automatically.

**Recommended Solution:**
Build command: `npm install --include=dev && npx prisma migrate deploy && npm run prisma:generate && npm run build`

---

## 12. Logging & Monitoring

---

### 12.1 Console-Only Logging — No Structured Logging

| Field | Detail |
|---|---|
| **Priority** | High |

`console.log`, `console.error`, and `console.warn` in production. No JSON log format, no log levels, no aggregation, no persistence.

**Recommended Solution:**
Replace with `pino` or `winston` outputting structured JSON. Ship to Logtail or Datadog.

---

### 12.2 No Error Tracking (Sentry)

| Field | Detail |
|---|---|
| **Priority** | High |

No alerting when new error classes appear in production. Errors only visible if you check Render logs manually.

**Recommended Solution:**
Add Sentry to both client and server.

---

### 12.3 Health Check Does Not Verify Database Connectivity

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/server.ts:50` |

`GET /health` only checks Express is running, not that the database is reachable.

**Recommended Solution:**
Add `await prisma.$queryRaw` SELECT 1 `` ` `` and return 503 if it fails.

---

## 13. Testing

---

### 13.1 Zero Tests — No Unit, Integration, or E2E Coverage

| Field | Detail |
|---|---|
| **Priority** | Critical |
| **Location** | Project-wide |

No test files, no testing framework configured anywhere in the project.

**Why It is a Weakness:**
Every refactor is done blindly. Auth and application logic regressions have no safety net.

**Recommended Solution:**
- Backend: Vitest + Supertest (API integration tests)
- Frontend: Vitest + React Testing Library
- E2E: Playwright (register, browse, apply critical path)
- Target: 70%+ service layer coverage

---

## 14. Accessibility

---

### 14.1 Form Error Messages Not Associated to Inputs via ARIA

| Field | Detail |
|---|---|
| **Priority** | Medium |

Error `<p>` tags have no `id` referenced by `aria-describedby` on their input. Screen readers cannot associate errors with fields.

---

### 14.2 Icon-Only Buttons Missing aria-label

| Field | Detail |
|---|---|
| **Priority** | Medium |

Icon-only interactive elements have no accessible label. Screen readers announce "button" with no context.

---

### 14.3 No Skip-to-Content Link

| Field | Detail |
|---|---|
| **Priority** | Low |

Required for WCAG 2.1 AA compliance. Keyboard users must tab through the full navbar on every page load.

---

## 15. SEO

---

### 15.1 No Dynamic Meta Tags or Page Titles

| Field | Detail |
|---|---|
| **Priority** | Medium |

Static `index.html` title. Job detail pages have no dynamic `<title>` or `<meta description>`.

**Recommended Solution:**
Use `react-helmet-async` for client-side meta tag management.

---

### 15.2 No JobPosting Structured Data (JSON-LD)

| Field | Detail |
|---|---|
| **Priority** | Medium |

Job detail pages have no `JobPosting` schema markup. The site is invisible in Google for Jobs.

---

### 15.3 Pure Client-Side SPA — Content Not Crawlable

| Field | Detail |
|---|---|
| **Priority** | Medium |

Search engines see an empty `<div id="root">`. All job listings are invisible to Google organic search.

**Recommended Solution:**
Migrate to Next.js or add Vite SSG prerendering for job listing pages.

---

## 16. Production Readiness

---

### 16.1 No Graceful SIGTERM Handling

| Field | Detail |
|---|---|
| **Priority** | High |
| **Location** | `server/src/server.ts` |

No `SIGTERM`/`SIGINT` signal handlers. When Render restarts the dyno, in-flight requests are immediately killed.

**Recommended Solution:**
```ts
const server = app.listen(env.PORT);
process.on('SIGTERM', () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
```

---

### 16.2 File Uploads Stored on Ephemeral Filesystem

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/server.ts:47` |

`express.static(env.UPLOAD_DIR)` stores files on Render's ephemeral disk. All uploads are deleted on every deploy.

**Recommended Solution:**
AWS S3, Cloudflare R2, or Supabase Storage for persistent object storage.

---

## 17. Scalability

---

### 17.1 No Redis Caching Layer

| Field | Detail |
|---|---|
| **Priority** | Medium |

Every request hits PostgreSQL directly. No caching for job listings, rate limiting state, or tokens.

---

### 17.2 In-Memory Rate Limiter Not Multi-Instance Safe

| Field | Detail |
|---|---|
| **Priority** | Medium |
| **Location** | `server/src/server.ts` |

`express-rate-limit` with default in-memory store. Horizontally scaled deployments (multiple instances) each maintain separate counters, defeating the rate limit.

**Recommended Solution:**
Use `rate-limit-redis` store for distributed rate limiting.

---

*End of Weakness Report — 37 weaknesses identified across 17 categories.*
