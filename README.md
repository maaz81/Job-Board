# JobSphere AI
> AI-Powered Hiring Platform for Modern Teams

A full-stack job board with JWT authentication, role-based access, and an AI-powered resume match scoring feature built on the Gemini API.

**Live app:** [your-vercel-url-here]
**Demo accounts:**
- Recruiter — `recruiter@demo.com` / `password123`
- Candidate — `candidate@demo.com` / `password123`

---

## Tech Stack

| Layer      | Tech                                                                 |
|------------|-----------------------------------------------------------------------|
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, TanStack Query, React Hook Form, Zod |
| Backend    | Node.js, Express.js, TypeScript, Prisma ORM                          |
| Database   | PostgreSQL (Neon)                                                     |
| AI         | Google Gemini API                                                     |
| Auth       | JWT (Role-based: Candidate / Recruiter)                              |
| Deployment | Vercel (Frontend) + Render (Backend)                                  |

---

## Features

**Authentication**
- Register/login with role selection (Candidate or Recruiter)
- JWT-based sessions, protected routes by role

**Recruiter**
- Company profile setup
- Post, view, and open/close job listings
- View applicant counts per job

**Candidate**
- Browse jobs with search, type, and experience-level filters
- View job details and apply with an optional cover note
- Track application status
- Get an AI-generated resume match score (0–100) with feedback for any job

**AI**
| Feature             | Description                                                        |
|----------------------|---------------------------------------------------------------------|
| Resume Match Score   | Candidate pastes resume text on a job's detail page and gets a 0–100 score plus short feedback on fit, generated via Gemini |

---

## Project Structure

```text
job-board/
├── client/
│   ├── src/
│   │   ├── api/              # Axios API modules
│   │   ├── components/       # UI, layout, jobs, common components
│   │   ├── hooks/            # Custom React hooks (including Auth Context)
│   │   ├── lib/              # Utilities and helper functions
│   │   ├── pages/            # Auth, Jobs, Recruiter, Candidate pages
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/           # Database & environment configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Auth, validation & error handling
│   │   ├── routes/           # Express routes
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── README.md
└── package.json              # (if using a root workspace)
```

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon recommended)
- Google Gemini API key

### Server
```bash
cd server
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npx prisma migrate dev
npx prisma db seed      # optional — creates demo recruiter/candidate + sample jobs
npm run dev
# → http://localhost:5000
```

### Client
```bash
cd client
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm run dev
# → http://localhost:5173
```

---

## Roles

| Role      | Capabilities                                                  |
|-----------|-----------------------------------------------------------------|
| Candidate | Browse and search jobs, apply, get AI resume match scores, track application status |
| Recruiter | Set up company profile, post and manage job listings, view applicant counts |

---

## Future Improvements

Scoped out to prioritize a fully working core loop within the assignment's time limit:
- Admin role and dashboard
- Additional AI features: resume feedback, AI cover letter generation, interview question generator, candidate summaries for recruiters
- Google OAuth, refresh tokens, forgot password / email verification
- Saved jobs / bookmarks, job editing after posting, recruiter applicant-review UI
- Redis caching, real-time notifications (Socket.io)
- Automated test suite (Vitest/Supertest) and CI/CD pipeline
