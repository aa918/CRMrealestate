# ESTATEFLOW — Real Estate CRM

A real, working CRM for real-estate agency offices — leads, contacts, properties, deals
and tasks in one place, built around **Speed to Lead**: knowing the moment a lead comes
in, who it's assigned to, when the agent first responded, and whether it's about to
breach SLA.

Hebrew, RTL, multi-tenant (each agency's data is fully isolated), with honest automation
status (nothing is shown as "connected" or "sent" unless it actually happened).

## Structure

```
backend/    Node.js + Express + PostgreSQL (Prisma) REST API
frontend/   React + Vite + Tailwind CRM interface
```

Each half has its own detailed README — read those for setup, architecture and the full
API reference:

- [`backend/README.md`](backend/README.md)
- [`frontend/README.md`](frontend/README.md)

## Quickstart

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env            # fill in DATABASE_URL and the secrets
npm run db:up                    # optional: local PostgreSQL, no Docker needed
npm run db:migrate
npm run db:seed
npm run dev                      # http://localhost:3000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                      # http://localhost:5173
```

Log in with the seeded demo account: `admin@demoagency.example.com` / `Password123!`.

## What it does

A lead comes in (public web form, Facebook Lead Ads, or entered manually) → the
contact is matched or created (no duplicates) → an agent is auto-assigned
(round-robin) → a follow-up task is created → the event fires to n8n for further
automation → the lead shows up as "waiting" with a live response-time clock → if an
agent doesn't log a real response (call / outbound WhatsApp / outbound email) before
the SLA window closes, it flips to "overdue" → once they do, the response time is
measured and recorded.

That whole pipeline, plus properties, a deals pipeline (Kanban), tasks/calendar, and a
dashboard/reports layer built entirely on real data, is what this repo implements.

## Stack

**Backend:** Node.js, Express, PostgreSQL, Prisma, Zod, JWT + bcrypt, Vitest.
**Frontend:** React, Vite, Tailwind CSS v4, TanStack Query, React Hook Form + Zod,
Recharts, Lucide icons.

## Status

Backend: 35 automated tests passing. Frontend: builds clean, verified end-to-end in a
real browser (login → create a lead → auto-assignment → response tracking, no console
or network errors). See the two sub-READMEs for exact test/verification details and
known limitations.
