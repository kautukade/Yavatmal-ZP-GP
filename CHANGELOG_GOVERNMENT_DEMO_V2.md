# Changelog — Government Demo v2

Yavatmal Unified Panchayat Operations Platform. In-place upgrade of the existing
Next.js + TypeScript + Tailwind demo. **No rebuild** — architecture, PATHPURAVA,
NIGAA, Public Portal, the 26-role model, Presentation Mode and localStorage
persistence were all preserved.

> This remains a **demonstration prototype**. It is accurately described as a
> *demo-level role-based access simulation with centralized permission
> enforcement* — **not** production-secure authentication or Government-grade
> RBAC. No live Government integration is active.

---

## Critical bugs fixed

- **URL-typing bypass** — navigation previously only *hid* links by role; typing a
  restricted URL still rendered the page. Added centralized route guards so
  restricted content never renders; a professional **403 — Access Restricted**
  page shows the user's role and the requested module.
- **System Admin exposure** — `/app/admin` is now strictly `sysadmin`-only in demo
  logic; every admin mutation writes an audit log; admin cannot verify/alter
  operational outcomes.
- **Over-broad Citizen permission** — Citizen no longer holds a generic `CREATE`
  permission. Citizens can only view public data, submit participation and file
  complaints.
- **Hard-coded CEO metrics** — CEO/Deputy CEO now derive all figures from shared
  selectors over the live demo state; the "five things to know today" list is
  generated dynamically.
- **Fabricated block GP counts** — replaced the invented per-block totals with an
  honest split: **1,201 GPs (Official Reference)** vs **N GPs represented in the
  demo dataset (Demo Data)**.

## Access-control improvements

- `src/permissions/capabilities.ts` — centralized capability model (`hasCapability`)
  with ~40 fine-grained capabilities and per-role capability sets.
- `src/permissions/routeAccess.ts` — declarative route rules (`canAccessRoute`).
- `src/components/auth/RoleGuard.tsx` — 403 guard wired into the app shell.
- Role switch (**View as Role**) now redirects away from routes the new role can't access.
- `getAccessibleRecords(user, records)` — single scoped-record filter reused by
  dashboards, search, lists, reports and exports. Global search is scope-respecting.

## New modules

- **GP File Flow** (`/app/pathpurava/file-flow`) — operational file visibility;
  oldest-pending ageing for block/district. Not an eOffice replacement.
- **Complaint Routing** (`/app/complaint-routing`) — keyword routing engine →
  suggested authority; internal assign/forward; external needs official coordination.
- **Mahsul Sandhi** (`/app/mahsul-sandhi`) — SAMARTH adoption & revenue-opportunity
  checklist per GP. Not a tax engine.
- **Process Improvement Lab** (`/app/process-lab`) — baseline vs current improvement
  experiments; successful ones surface on the CEO/Deputy CEO dashboards.

## Dashboard changes

- **CEO** — dynamic Top-5; live District GP reference vs demo dataset; trends
  labelled *Illustrative Pilot Outcome Scenario*; **Outcome Changes = Baseline vs
  Current** computed from live state; Successful Process Improvements section.
- **Deputy CEO** — GP reference/demo coverage strip; trend labelled illustrative;
  Process Improvement Results section.
- **BDO** — "Demo GPs Loaded" (no fabricated scale claim); new sections: Oldest
  Pending Files, Complaint Routing Exceptions, SAMARTH Adoption Support.
- **Gram Sevak** — added **Record Voice Note** (Aawaj Nond) quick action.

## Dynamic KPI changes

- Central selectors: `getDistrictOperationalMetrics`, `getBlockOperationalMetrics`,
  `getGpOperationalMetrics`, `topExecutiveItems`.
- **Baseline snapshot** captured at seed time (`DemoState.baseline`); reset restores it.

## PWA changes

- `public/manifest.webmanifest`, generated SVG icons (`icon.svg`, `icon-maskable.svg`).
- `public/sw.js` service worker (shell cache, network-first navigation, offline
  fallback) registered in production via `ServiceWorkerRegister`.
- `public/offline.html` offline fallback; in-app **Offline Demo Mode** indicator with
  a "back online — local demo changes ready" state.

## Field capabilities

- **Aawaj Nond** voice status (Web Speech API where available, simulated transcript
  fallback) — proposes status/blocker/note/location and **requires confirmation**.
- **QR Asset Check** now attempts the device camera (BarcodeDetector/getUserMedia)
  with a reliable simulated fallback ("Camera scan unavailable — using simulated
  demo asset").
- **Evidence upload** works as a demo: real file selection + image preview +
  filename/size/timestamp metadata, stored locally in the browser.

## Demo-data changes

- All officer/participant names neutralized to **Demo <Role>** — no fictional
  problem is attached to a real named person.
- Pilot GPs renamed to **Pilot GP A–E** ("Illustrative Pilot Gram Panchayat").
- **Demo Data / Official Reference / Illustrative KPI / Live Demo State /
  Simulated Integration** badges added and applied.

## Presentation changes

- **Story 3 — Community Participation** and **Story 4 — Complaint Routing** added.
- Presentation Mode: story selector, step dots, **Reset Story**, hierarchy visual
  that highlights the current level, **Open Module** and one-click **Login as role**.
- New explainer pages: **Research Map**, **Role & Access Map**, **Architecture**,
  **Module Status**, **Production Readiness**.

## Testing

- `npm run test:access` — 33 programmatic access-control assertions (all pass),
  loading the real capability/route logic.
- `npm run typecheck` clean; `npm run build` succeeds (34 routes); runtime smoke
  test: all routes return 200.

## Known limitations

- Frontend-only; all state in browser `localStorage`. Not multi-user; not secure.
- QR camera decoding is not wired to printed demo codes — it opens the camera then
  falls back to a simulated asset.
- SMS/WhatsApp are previews only; nothing is sent.
- No Government API is connected anywhere.

## Production requirements

See the in-app **Production Readiness** page and README: secure backend & DB,
server-side auth (SSO/MFA if approved), server-enforced RBAC, encryption, approved
hosting, backups, audit retention, monitoring, DPDP/privacy review, official API
approvals, and security testing (VAPT) — none of which this demo implements.
