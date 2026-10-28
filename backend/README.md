# RealEstate CRM - Backend

A real, modular backend for a multi-tenant real-estate CRM: leads, contacts, agents,
properties, deals, tasks, activities, Speed-to-Lead measurement, and integration points
for n8n, Facebook Lead Ads, and WhatsApp Cloud API.

Node.js + Express + PostgreSQL (Prisma) + Zod + JWT/bcrypt. REST API only - **no frontend
code lives here and none was touched.**

---

## 1. Architecture

```
backend/
  src/
    app.js                # Express app: middleware, routes, error handling
    server.js              # Entry point: DB connect, HTTP listen, graceful shutdown
    config/                 # env parsing (zod), Prisma client, pino logger
    routes/                 # thin route definitions per resource
    controllers/            # HTTP layer: req/res only, no business logic
    services/                # business logic (lead pipeline, assignment, speed-to-lead...)
    repositories/            # Prisma queries, always organization-scoped
    middleware/              # auth (JWT), RBAC, validation (zod), errors, API keys, rate limits
    validators/               # zod schemas per resource + shared enum lists
    integrations/
      n8n/                    # outbound webhook client (fire-and-forget, never blocks)
      whatsapp/                # WhatsAppService with pluggable providers (mock / Meta Cloud API)
      facebook/                # Graph API client + webhook signature verification
    utils/                    # ApiError, response helpers, phone normalization, pagination...
    docs/openapi.json         # lightweight OpenAPI spec served at /api/docs
  prisma/
    schema.prisma            # full data model (see below)
    seed.js                  # realistic demo data
  scripts/
    pg-local.js               # optional local PostgreSQL via `embedded-postgres` (no Docker/admin needed)
  tests/                      # Vitest + Supertest integration tests
```

Layering is strict: **routes -> controllers -> services -> repositories -> Prisma**.
Controllers never touch Prisma directly; repositories never contain business rules.
This keeps every layer independently testable and easy to extend towards a real SaaS
product (billing, per-organization settings, more integrations, etc.) without rewrites.

### Multi-tenant by design

Every business table (`User`, `Contact`, `Lead`, `Property`, `Deal`, `Task`, `Activity`,
`FacebookIntegration`, `FacebookLead`) has an `organizationId` column, and **every**
repository query is scoped by it. JWTs carry `organizationId`, and it is only ever taken
from the authenticated user or from a resolved API key - **never from client-supplied
request data** - so one office's data can never leak into another's. This is exercised by
an automated test (`tests/leads.test.js`, "enforces organization isolation").

---

## 2. Setup

### 2.1 Requirements

- Node.js 18+ (tested with Node 24)
- A PostgreSQL database, any of:
  - Your own local PostgreSQL / Docker container, **or**
  - A free cloud instance (Neon, Supabase, Railway...), **or**
  - The bundled zero-install option below (no Docker, no admin rights needed).

### 2.2 Install dependencies

```bash
cd backend
npm install
```

### 2.3 Configure environment

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` and generate real secrets for `JWT_SECRET`, `INTERNAL_API_KEY`,
`N8N_API_SECRET`. Every other integration variable (`N8N_LEAD_WEBHOOK_URL`,
`FACEBOOK_*`, `WHATSAPP_*`) can stay **empty in development** - the app automatically
falls back to logged mock behavior instead of crashing (see section 5).

### 2.4 PostgreSQL - don't have one installed? Use the bundled option

No Docker, no admin rights required - this runs a **real** Postgres binary from your
project folder:

```bash
npm run db:up      # first run downloads + initializes a local PostgreSQL, then starts it
```

It prints the exact `DATABASE_URL` to put in `.env` (defaults to
`postgresql://postgres:postgres@localhost:55432/realestate_crm?schema=public`).
Stop it any time with `npm run db:down`. Data persists in `backend/.pgdata` (gitignored)
between runs.

If you already have PostgreSQL (local, Docker, or cloud), skip this and just point
`DATABASE_URL` at it.

### 2.5 Run migrations and seed data

```bash
npm run db:generate    # prisma generate
npm run db:migrate     # prisma migrate dev
npm run db:seed        # prisma db seed
```

The seed creates:
- Organization **"RealEstate Demo Agency"**
- Users (password for all: `Password123!`):
  - `admin@demoagency.example.com` (ADMIN)
  - `manager@demoagency.example.com` (MANAGER)
  - `agent1@demoagency.example.com`, `agent2@demoagency.example.com` (AGENT)
- 10 contacts, 10 leads in a spread of statuses/response states (WAITING, OVERDUE,
  RESPONDED, WON, LOST, unassigned), 5 properties, 11 tasks, 4 deals.

### 2.6 Run the backend

```bash
npm run dev      # nodemon, auto-restart
# or
npm start        # plain node
```

Server listens on `http://localhost:3000` (or `PORT` from `.env`).

### 2.7 Run tests

Tests use a **separate** database so they never touch your dev data. Create it once:

```bash
cp .env.example .env.test   # then edit DATABASE_URL to point at a *different* database
# e.g. postgresql://postgres:postgres@localhost:55432/realestate_crm_test?schema=public
DATABASE_URL="<your test db url>" npx prisma migrate deploy
```

Then simply:

```bash
npm test
```

`NODE_ENV=test` makes the app load `.env.test` instead of `.env` (see
`src/config/env.js`), so dev and test data never mix.

### 2.8 Other useful commands

```bash
npm run db:studio     # Prisma Studio (visual DB browser)
npm run db:reset       # drop, re-create, re-migrate, re-seed
```

---

## 3. Data model

See `prisma/schema.prisma` for the authoritative source. Summary:

`Organization` -> `User` (ADMIN/MANAGER/AGENT), `Contact`, `Lead`, `Property`, `Deal`,
`Task`, `Activity`, `FacebookIntegration`, `FacebookLead`, `IntegrationLog`.

- **Contact** is unique per `(organizationId, phone)` - phone numbers are normalized
  (`src/utils/phone.js`) before lookup/storage, so the same person contacting through
  different channels always resolves to one Contact.
- **Lead** carries the full Speed-to-Lead timeline: `receivedAt`, `assignedAt`,
  `firstResponseAt`, `closedAt`, plus `responseStatus` (`WAITING` / `RESPONDED` /
  `OVERDUE`). Response time in minutes/seconds is always *derived* from these
  timestamps (`src/utils/responseTime.js`), never stored redundantly.
- **FacebookLead** deduplicates inbound Meta webhook events by a unique `leadgenId`.
- **IntegrationLog** records every n8n webhook dispatch and WhatsApp send attempt
  (success/failure, timestamp, event) so `/api/integrations/status` and `/api/integrations/logs`
  can report real history instead of inferring success from "a request was made."

---

## 4. The core business flow

```
POST /api/public/leads  (or POST /api/leads, or Facebook webhook)
        |
        v
normalize phone -> find-or-create Contact  (never duplicates)
        |
        v
create Lead (responseStatus = WAITING, receivedAt = now)
        |
        v
round-robin assign an active AGENT (or leave unassigned if none)
        |
        v
create FOLLOW_UP Task (due = receivedAt + LEAD_RESPONSE_SLA_MINUTES)
        |
        v
log LEAD_CREATED (+ TASK_CREATED / SYSTEM) Activity
        |
        v
notify n8n (best-effort - failures are logged, never block the request)
        |
        v
GET /api/leads shows it; GET /api/dashboard/summary counts it as "waiting"
        |
        v
if no response within SLA -> POST /api/internal/leads/check-overdue (n8n cron) -> OVERDUE
        |
        v
agent logs a CALL / outbound WHATSAPP / outbound EMAIL Activity
        |
        v
firstResponseAt is stamped, responseStatus -> RESPONDED, response time is now measurable
```

Every step of this is covered by integration tests (`tests/leads.test.js`,
`tests/speedToLead.test.js`, `tests/publicLead.test.js`).

---

## 5. Integrations - configured vs. mock mode

Nothing blocks on missing third-party credentials. Each integration reports its mode at
startup (server log) and behaves safely either way:

| Integration | Env vars | Without credentials | With credentials |
|---|---|---|---|
| **n8n** | `N8N_LEAD_WEBHOOK_URL`, `N8N_API_SECRET` | Webhook calls are skipped and logged; lead creation still succeeds | POSTs `lead.created` / `lead.responded` / `lead.overdue` events with `X-N8N-Secret` header |
| **WhatsApp** | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | `WhatsAppService` uses a **mock provider** that logs what would be sent | Real Meta WhatsApp Cloud API calls |
| **Facebook** | `FACEBOOK_APP_SECRET`, `FACEBOOK_ACCESS_TOKEN`, `FACEBOOK_VERIFY_TOKEN` | Graph API lead lookups return clearly-labeled mock data; webhook signature check is skipped | Real signature verification + real Graph API lead fetch |

### n8n wiring

1. In n8n, create a workflow with a **Webhook** trigger node - copy its URL into
   `N8N_LEAD_WEBHOOK_URL`.
2. Set `N8N_API_SECRET` to a random string; n8n can check the incoming
   `X-N8N-Secret` header against it (an "IF" node) before proceeding.
3. For the SLA sweep, add a **Cron** node (e.g. every 5 minutes) -> **HTTP Request**
   node: `POST {backend_url}/api/internal/leads/check-overdue` with header
   `X-Internal-Api-Key: <INTERNAL_API_KEY>`.
4. From there, branch on `event` (`lead.created`, `lead.overdue`, `lead.responded`) to
   trigger WhatsApp templates, Slack pings, etc.

### Facebook Lead Ads

Real setup (once you have a Meta App + Page):
1. Subscribe your app's webhook to the `leadgen` field, verify with
   `FACEBOOK_VERIFY_TOKEN` (`GET /api/webhooks/facebook`).
2. Create a `FacebookIntegration` row mapping your Facebook `pageId` to your
   `organizationId` (via Prisma Studio or a future admin endpoint) so inbound webhooks
   know which tenant they belong to.
3. Meta calls `POST /api/webhooks/facebook`; the signature is verified with
   `FACEBOOK_APP_SECRET`, and the full lead is fetched from the Graph API using
   `FACEBOOK_ACCESS_TOKEN`.

Without any of that, you can still exercise the **entire** pipeline:

```bash
curl -X POST http://localhost:3000/api/webhooks/facebook/simulate \
  -H "Content-Type: application/json" \
  -H "X-Internal-Api-Key: <INTERNAL_API_KEY>" \
  -d '{
    "organizationId": "<an existing organization id>",
    "pageId": "demo-page",
    "fieldData": { "firstName": "Test", "phone": "0521112222", "email": "t@example.com", "city": "Tel Aviv" }
  }'
```

This creates a `FacebookLead` record and runs it through the exact same
Contact/Lead/Assignment/Task/Activity/n8n pipeline as any other lead source, and is
idempotent per `leadgenId` (redelivering the same event never creates a second lead).

### WhatsApp

Once `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are set, real messages send
through Meta's Cloud API. Test connectivity any time with:

```bash
curl -X POST http://localhost:3000/api/integrations/whatsapp/test \
  -H "Content-Type: application/json" -H "Authorization: Bearer <admin/manager JWT>" \
  -d '{"phone":"+972521234567","message":"Hello from the CRM"}'
```

---

## 6. Public lead form

Your marketing site posts directly to the CRM - no agent login required:

```bash
curl -X POST http://localhost:3000/api/public/leads \
  -H "Content-Type: application/json" \
  -H "x-public-api-key: <organization's publicApiKey>" \
  -d '{
    "firstName": "Daniel", "lastName": "Levi", "phone": "0521234567",
    "email": "daniel@gmail.com", "source": "WEBSITE", "interestType": "BUY",
    "propertyType": "APARTMENT", "city": "Herzliya", "budget": 4000000,
    "message": "Looking for 4 rooms"
  }'
```

Every `Organization` gets a unique `publicApiKey` at creation time (see the `register`
response, or query it in Prisma Studio). The client **never** supplies `organizationId` -
it is derived entirely from the key, so a public form can never inject a lead into
someone else's tenant. `PUBLIC_LEAD_API_KEY` in `.env` is only a development fallback
that resolves to the first organization in the database.

---

## 7. API reference

All authenticated endpoints require `Authorization: Bearer <JWT>`. All responses share
one shape:

```jsonc
// success
{ "success": true, "data": ... }
// success + pagination
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 150, "pages": 8 } }
// error
{ "success": false, "error": { "code": "SOME_CODE", "message": "Human readable message" } }
```

Browse the full interactive spec at **`GET /api/docs`** once the server is running.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | DB connectivity check |
| POST | `/api/auth/register` | Creates a new Organization + its first ADMIN |
| POST | `/api/auth/login` | Returns a JWT |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/users` | ADMIN/MANAGER only for list/create |
| GET/PATCH | `/api/users/:id` | Self-service profile update, or admin/manager |
| GET/POST | `/api/contacts` | search, phone, email, pagination |
| GET/PATCH/DELETE | `/api/contacts/:id` | DELETE is ADMIN/MANAGER only (cascades to the contact's leads/deals) |
| GET | `/api/contacts/:id/activities` | |
| GET/POST | `/api/leads` | filters: status, source, assignedUserId, contactId, city, responseStatus, date range; search by name/phone/email; sort by receivedAt/createdAt/budget |
| GET/PATCH/DELETE | `/api/leads/:id` | AGENT role is scoped to their own assigned leads; DELETE is ADMIN/MANAGER only |
| GET/POST | `/api/properties` | filters: city, transactionType, propertyType, status, priceMin/Max, bedrooms |
| GET/PATCH/DELETE | `/api/properties/:id` | DELETE is ADMIN/MANAGER only |
| GET/POST | `/api/deals` | filters: stage, ownerId, contactId, leadId; WON/LOST syncs the linked Lead automatically |
| GET/PATCH/DELETE | `/api/deals/:id` | AGENT role scoped to deals they own; DELETE is ADMIN/MANAGER only |
| GET/POST | `/api/tasks` | filters: assignedUserId, leadId, contactId, status, type, priority, due date range, overdue |
| GET | `/api/tasks/today` | |
| GET/PATCH/DELETE | `/api/tasks/:id` | DELETE is ADMIN/MANAGER only (agents cancel their own via `PATCH status=CANCELLED`) |
| GET/POST | `/api/activities` | creating a response-type activity can trigger Speed-to-Lead |
| GET | `/api/dashboard/summary` | KPI counters (see below) |
| GET | `/api/dashboard/recent-leads` | |
| GET | `/api/dashboard/response-performance` | avg/median response time, SLA hit rate |
| POST | `/api/public/leads` | public website form intake (`x-public-api-key`) |
| GET/POST | `/api/webhooks/facebook` | Meta subscription verify / lead webhook |
| POST | `/api/webhooks/facebook/simulate` | dev-only, needs `X-Internal-Api-Key` |
| POST | `/api/internal/leads/check-overdue` | SLA sweep, needs `X-Internal-Api-Key`, meant for n8n Cron |
| GET | `/api/integrations/status` | real configured/last-execution state per integration (n8n/WhatsApp/Facebook) - backs the frontend Automations page |
| GET | `/api/integrations/logs` | recent `IntegrationLog` entries (n8n + WhatsApp send attempts), paginated |
| POST | `/api/integrations/whatsapp/test` | ADMIN/MANAGER only |

`dashboard/summary` returns: `newLeadsToday`, `waitingLeads`, `overdueLeads`,
`respondedToday`, `openDeals`, `wonDealsThisMonth`, `tasksDueToday`, `overdueTasks`,
`averageResponseTimeMinutes`.

---

## 8. Security

- Passwords hashed with **bcrypt** (never returned to any client, in any endpoint).
- **JWT** (`userId`, `organizationId`, `role`) verified on every protected route;
  the current user is re-loaded from the DB on each request so a deactivated account's
  token stops working immediately.
- Basic **RBAC**: `requireRole()` gates admin-only endpoints; `scopeForUser()` restricts
  AGENT queries to records assigned/owned by them (extensible for finer-grained rules
  later).
- **helmet**, configurable **CORS** allowlist (`CORS_ORIGINS`), and rate limiting on
  login, the public lead endpoint, and webhooks.
- Webhook/server-to-server auth: `INTERNAL_API_KEY` (internal jobs), `N8N_API_SECRET`
  (n8n calling us is not required, but we send it when calling n8n), Facebook
  `X-Hub-Signature-256` HMAC verification, and per-organization `publicApiKey` for the
  public lead form.
- All Zod validation failures return `400` with a clear `{ code, message, details }`
  shape; unexpected errors return a generic message in production (no stack traces).
- No secrets are hardcoded - everything sensitive comes from environment variables
  (`.env.example` documents every one).

---

## 9. Tests

`npm test` runs Vitest + Supertest against a real Postgres test database (see 2.7).
**35 tests across 8 files**, covering: health check, register/login/me, unauthorized
access, contact creation + duplicate-phone prevention + search/pagination, the full lead
creation pipeline (contact/assignment/task/activity), duplicate-contact prevention through
the Leads API, lead listing/filtering, **organization isolation**, Speed-to-Lead
(first-response detection, inbound messages not counted, no overwrite on a second
response, SLA -> OVERDUE via the internal endpoint), public lead intake (API key required,
organizationId can't be spoofed, validation errors), the `leadId`/`contactId` filters on
Tasks/Deals/Leads, RBAC on destructive actions (AGENT forbidden from deleting
leads/contacts), and the `/api/integrations/status` + `/api/integrations/logs` endpoints
(never fabricate success - unconfigured integrations report no history).

---

## 10. What's next for a Frontend

This backend is ready to support:

1. **Login/session screen** - `POST /api/auth/login`, store the JWT, `GET /api/auth/me`.
2. **Dashboard** - `GET /api/dashboard/summary`, `/recent-leads`, `/response-performance`.
   The Speed-to-Lead KPIs are the headline widgets.
3. **Leads inbox** - `GET /api/leads` with filters/sort/pagination; a lead detail view
   backed by `GET /api/leads/:id` + `GET /api/contacts/:id/activities`; a big "Log
   activity" action (`POST /api/activities`) that visibly flips WAITING -> RESPONDED.
4. **Tasks** - `GET /api/tasks/today` as a daily worklist; `PATCH /api/tasks/:id` to
   complete.
5. **Contacts, Properties, Deals** - standard CRUD screens against their REST resources.
6. **Team/settings screen** (ADMIN/MANAGER) - manage users (`/api/users`), and surface
   each organization's `publicApiKey` for embedding the website lead form.

Everything needed for a SaaS launch beyond that (billing, deeper AI features, more
channels) plugs into this same layered architecture without restructuring it.
