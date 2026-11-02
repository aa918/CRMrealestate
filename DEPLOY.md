# Deploying ESTATEFLOW live

Two free services, both connected directly to this GitHub repo — no server
management, auto-deploys on every push to `main`.

- **Render** — hosts the backend (Node/Express) *and* the PostgreSQL database
- **Vercel** — hosts the frontend (static build)

## 1. Backend + Database (Render)

1. Go to **[render.com](https://render.com)** → sign in with GitHub.
2. **New +** → **Blueprint**.
3. Select the `CRMrealestate` repo. Render reads `render.yaml` at the repo
   root automatically and shows a preview: one **PostgreSQL database**
   (`estateflow-db`) and one **Web Service** (`estateflow-backend`).
4. Click **Apply**. Render provisions the database, builds the backend
   (`npm install && prisma generate && prisma migrate deploy`), and starts it.
   Secrets (`JWT_SECRET`, `INTERNAL_API_KEY`, etc.) are auto-generated —
   you don't need to type anything.
5. Wait for the deploy to go green, then copy the backend's public URL from
   the Render dashboard (looks like `https://estateflow-backend.onrender.com`).
6. **Seed demo data (one time):** open the `estateflow-backend` service →
   **Shell** tab → run:
   ```
   npm run db:seed
   ```

> **Free tier notes:** the web service spins down after 15 minutes idle — the
> first request after that takes ~30-60s to wake up (then it's instant). The
> free Postgres database expires after 90 days; Render will email you before
> that happens, and you can upgrade or recreate it.

## 2. Frontend (Vercel)

1. Go to **[vercel.com](https://vercel.com)** → sign in with GitHub.
2. **Add New...** → **Project** → import the `CRMrealestate` repo.
3. **Root Directory:** click Edit, select `frontend`. Framework preset
   (Vite) is detected automatically.
4. Add one environment variable:
   - `VITE_API_BASE_URL` = `https://<your-render-backend-url>/api`
     (the URL from step 1.5, with `/api` appended)
5. **Deploy.** Copy the resulting URL (e.g. `https://crmrealestate.vercel.app`).

## 3. Connect them (required)

The backend blocks cross-origin requests by default in production. Go back
to Render → `estateflow-backend` → **Environment** → set:

- `CORS_ORIGINS` = `https://<your-vercel-url>` (no trailing slash)

Save — Render redeploys automatically. That's it, the two services can now
talk to each other.

## 4. Verify

- `https://<render-url>/api/health` → `{"status":"ok","database":"connected"}`
- `https://<vercel-url>` → login page loads; log in with
  `admin@demoagency.example.com` / `Password123!` and confirm real seeded
  data shows up on the dashboard.

## 5. Update the repo link

GitHub repo → **About** (gear icon) → **Website** → paste the Vercel URL →
Save.
