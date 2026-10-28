# ESTATEFLOW - Frontend

Production-oriented React frontend for the ESTATEFLOW real-estate CRM. Talks only to the
real backend API in `../backend` - no mock business data, no hardcoded leads/deals/metrics.

Hebrew, RTL throughout, built with React 19 + Vite + Tailwind CSS v4 + TanStack Query +
React Hook Form/Zod + Recharts + Lucide icons.

## Setup

```bash
npm install
cp .env.example .env     # VITE_API_BASE_URL - defaults to http://localhost:3000/api
npm run dev               # http://localhost:5173
```

The backend (`../backend`) must be running and seeded - see its README. The dev server
also proxies `/api/*` to `http://localhost:3000` (see `vite.config.js`), so a relative
`VITE_API_BASE_URL=/api` works too if you prefer not to hardcode a host.

```bash
npm run build     # production build -> dist/
npm run preview    # serve the production build locally
npm run lint        # oxlint
```

## Architecture

```
src/
  lib/            # apiClient (axios + auth header + 401 handling), enums, formatting,
                    status-color mapping, zod validation schemas
  context/         # AuthContext (session, login/register/logout, current user+org)
  routes/          # ProtectedRoute
  hooks/           # one file per resource - TanStack Query hooks (useLeads, useContacts,
                    useProperties, useDeals, useTasks, useActivities, useUsers,
                    useIntegrations, useDashboard, useReports...)
  components/
    shell/          # Sidebar, Topbar, Logo, AppShell
    ui/             # Button, Card, Modal, SidePanel, DataTable, StatusBadge, EmptyState,
                      ErrorState, LoadingSkeleton, Pagination, ConfirmDialog...
    leads/ contacts/ properties/ deals/ tasks/ activities/ automations/ settings/
  pages/           # one per route
```

Every list/detail screen follows the same pattern: a TanStack Query hook fetches real data
from `/api/*`, mutations invalidate the relevant query keys so the UI updates immediately
after a create/update/delete, and loading/error/empty states are explicit (no skeleton that
silently hides a failed fetch).

## Notes on data honesty (per the project brief)

- Dashboard trend/KPI numbers with no reliable "previous period" endpoint simply omit the
  trend arrow rather than inventing a percentage.
- The Automations page reflects the backend's real `/api/integrations/status` and
  `/api/integrations/logs` - an integration shows "טרם חובר" (not connected) until its
  credentials are configured, and "last execution" is only shown once a real attempt has
  been logged. Nothing is marked successful just because a button was clicked.
- Property cards show a neutral placeholder - the backend `Property` model has no image
  field yet, so no photo is invented.
- Reports/trend charts that aggregate client-side are capped at the backend's 100-row page
  size; the UI says so explicitly when a result set is truncated, rather than silently
  under-reporting.

## Known limitations

- No dedicated backend aggregation endpoints for reports/trends yet - the Reports and
  Dashboard chart compute from `/api/leads` and `/api/deals` client-side, which is fine at
  MVP data volumes but should move server-side if an office exceeds ~100 leads/deals in a
  reporting window.
- Deal Kanban drag-and-drop uses native HTML5 DnD (no extra dependency) - it reverts the
  card and shows an error banner if the backend PATCH fails.
- No real-time push; the app relies on TanStack Query polling/refetch-on-focus, matching
  what the backend exposes today.
