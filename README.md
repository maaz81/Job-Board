# JobSphere AI

> AI-Powered Hiring Platform for Modern Teams

A production-quality, full-stack job board with intelligent AI features including resume matching, feedback, cover letter generation, and interview question generation.

---

## Tech Stack

| Layer      | Tech                                                                 |
|------------|----------------------------------------------------------------------|
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Framer Motion |
| Backend    | Node.js, Express.js, TypeScript, Prisma ORM                         |
| Database   | PostgreSQL (Neon)                                                    |
| AI         | Google Gemini API                                                    |
| Auth       | JWT (Role-based: Candidate / Recruiter / Admin)                     |
| Deployment | Vercel (Frontend) + Render (Backend)                                 |

---

## Project Structure

```
job-board/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── api/         # Axios API modules
│   │   ├── components/  # UI, layout, common components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utils, query client
│   │   ├── pages/       # Route pages
│   │   └── types/       # TypeScript types
│   └── ...
└── server/          # Express + TypeScript backend
    ├── prisma/          # Prisma schema + migrations
    └── src/
        ├── config/      # DB, env config
        ├── controllers/ # Route handlers
        ├── middleware/  # Auth, validation, errors
        ├── routes/      # Express routers
        ├── services/    # Business logic
        ├── types/       # TypeScript types
        └── utils/       # Helpers
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL (or Neon account)
- Google Gemini API key

### Client

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

### Server

```bash
cd server
npm install
cp .env.example .env   # Fill in your values
npx prisma migrate dev
npm run dev
# → http://localhost:3000
```

---

## AI Features

| Feature                | Description                                         |
|------------------------|-----------------------------------------------------|
| Resume Match Score     | AI scores resume against job description (0–100)    |
| Resume Feedback        | Section-by-section feedback with improvement tips  |
| AI Cover Letter        | Personalized cover letter generation               |
| Interview Questions    | Role-specific interview question bank              |
| Candidate Summary      | AI summary of candidate profile for recruiters     |

---

## Roles

| Role      | Capabilities                                         |
|-----------|------------------------------------------------------|
| Candidate | Browse jobs, apply, use AI tools, manage profile     |
| Recruiter | Post jobs, review applications, view AI scores       |
| Admin     | Full access, manage users and content                |
