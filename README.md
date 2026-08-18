# Yavatmal Unified Panchayat Operations Platform — GOVERNMENT DEMO 100% FINAL CANDIDATE

> **"100% final"** means all planned demo functionality and correctness gates are
> complete (see `CHANGELOG_GOVERNMENT_DEMO_100_PERCENT_FINAL.md` and
> `FINAL_QA_REPORT_100_PERCENT.md`; `npm run test:access` → **173/173**). It does
> **NOT** mean production Government-deployment ready — this remains a frontend
> demonstration (browser localStorage; not multi-user; not server-secured; no
> Government API, authentication or hosting).

**Latest patch (100% FINAL):** HASTANTARAN accept restricted to the designated
incoming officer; Extension Officer block↔assigned-GP consistency (no cross-block
leak, block change clears stale GPs); all Admin status changes audited via any entry
point; UC Follow-Up department scope with `visibilityScope`.

---

# Yavatmal Unified Panchayat Operations Platform — Government Demo v2

**A Role-Based Digital Operations, Governance, Maintenance, Compliance and Participation Platform for Zilla Parishad Yavatmal.**

> ⚠️ **This is a WORKING DEMONSTRATION PROTOTYPE** for presentation and validation.
> It is **NOT** an official Government deployment. It makes **no** claim of Government
> approval, official integration, production authorization, or live access to any
> Government system. All data is **mock/demo** data. Existing Government systems
> (eGramSwaraj, AuditOnline, SAMARTH, Gram Manchitra, Aaple Sarkar, JJM, ZPFMS, etc.)
> remain the **source of truth**.

---

## What this is

One unified platform — not 35 separate apps — that gives every role from village to
district a **purpose-built** view of the same operational reality:

- **Data flows upward** — one update at the lowest authorised level automatically
  updates the relevant higher-level dashboards.
- **Instructions flow downward. Escalations flow upward. Permissions stay role-based.**
- **Government systems remain the source of truth** — this demo only adds an
  operational follow-through, maintenance and participation layer on top.

---

## Government Demo v2.1.1 — Final Candidate (latest)

Correctness patch over v2.1. See `CHANGELOG_GOVERNMENT_DEMO_V2_1_1.md` and
`FINAL_QA_REPORT_V2_1_1.md`.
- **Live admin user/scope editing** — role-aware Edit User drawer (role, district,
  block, GP, assigned GPs, department, status); centralized scope normalization +
  validation + typed audit; changes affect next login.
- **Live Demo Accounts list** — login list, Quick Switcher and View-As-Role read
  `state.users` (disabled shown/blocked).
- **Scoped HASTANTARAN** — handover list + accept gated by capability + GP scope +
  designated incoming officer; unrelated GP / Sysadmin / CEO cannot accept.
- **Scoped UC Follow-Up** — by GP / block / district.
- **Offline PATHPURAVA + Seasonal + NIGAA** — all queue `SYNC_PENDING` →
  `SYNCED_DEMO` on reconnect (local demo store only).
- **Safe role-switch redirect** — switching to a role that can't access the current
  route redirects to its default dashboard (manual URL typing still 403s).
- **Department visibility hardening** — untagged internal records are not
  auto-visible to department-scoped users.
- **`npm run test:access` → 129 assertions** across route/action/scope/export/auth/
  admin/handover/UC/offline/role-switch/department.

## Government Demo v2.1 — final hardening

Builds on v2. See `CHANGELOG_GOVERNMENT_DEMO_V2_1.md` and `FINAL_QA_REPORT.md`.
- **Authentication reads live `state.users`** — Admin-created users can log in,
  disabled users are rejected, role/scope changes persist across relogin.
- **Action-level capability enforcement** on every mutation (not just routes):
  CEO has no field actions; System Admin is not an operational superuser; Citizens
  cannot mutate internal data; Innovation "Use as Template", institution,
  participation, complaint, seasonal and QR actions are all capability-gated.
- **Scope engine hardened** — block/department enforced even when `gpId` is absent;
  global search, CSV export and notifications all use the same scope model.
- **Truthful features** — QR = camera + simulated selection; evidence persists small
  images locally (survives refresh); offline mutation queue; WhatsApp preview; CEO
  Top-5 fully dynamic; Process Lab live-metric binding; System Status "Demo Truth" panel.
- **`npm run test:access` → 80 assertions** (route / action / scope / export / auth).

## Government Demo v2 — what changed

This is an in-place upgrade of the v1 demo (no rebuild). Highlights:

- **Centralized route guards + capability model** — typing a restricted URL now
  shows a **403 — Access Restricted** page; it never renders restricted content.
  (`src/permissions/routeAccess.ts`, `capabilities.ts`, `components/auth/RoleGuard.tsx`.)
- **System Admin hardened** — `/app/admin` is `sysadmin`-only; admin cannot verify
  or silently alter operational outcomes; every admin action is audited.
- **Scoped everything** — one `getAccessibleRecords(user, records)` filter drives
  dashboards, search, lists, reports and exports.
- **Dynamic executive metrics** — CEO/Deputy CEO derive all figures from the live
  demo state; **Baseline vs Current** outcome changes; dynamic "five things today".
- **Honest counts** — **1,201 GPs (Official Reference)** vs **N GPs in the demo
  dataset (Demo Data)**; reference/demo/illustrative/live-state/simulated badges.
- **New modules** — GP File Flow, Complaint Routing, Mahsul Sandhi (SAMARTH
  adoption), Process Improvement Lab.
- **Field capabilities** — Aawaj Nond (voice status, Web Speech + fallback), QR
  camera with reliable fallback, working demo evidence upload (preview + metadata).
- **PWA** — manifest, service worker, offline fallback + Offline Demo Mode indicator.
- **Presentation** — Stories 3 & 4 added; Research Map, Role & Access Map,
  Architecture, Module Status, Production Readiness explainer pages.
- **Demo-data integrity** — neutral **Demo <Role>** names; **Pilot GP A–E**.

Companion docs: `CHANGELOG_GOVERNMENT_DEMO_V2.md`, `DEMO_PRESENTATION_GUIDE.md`,
`ACCESS_MATRIX.md`, `RESEARCH_OPPORTUNITY_MAPPING.md`.

## Quick start (Windows — beginner friendly)

1. **Install Node.js LTS** from <https://nodejs.org> (choose the **LTS** version and
   accept the default options during installation).
2. **Extract the project** ZIP to a folder, e.g. `C:\yavatmal-zp-gp`.
3. **Open the folder** in File Explorer.
4. Hold **Shift**, right-click inside the folder, and choose
   **"Open PowerShell window here"** (or "Open in Terminal").
5. In the PowerShell window, type each command and press **Enter**:

   ```powershell
   npm install
   npm run dev
   ```

6. Open your browser to **<http://localhost:3000>**

To stop the server, click the PowerShell window and press **Ctrl + C**.

### macOS / Linux

```bash
npm install
npm run dev
```

The app runs with **no backend, no API keys, and no paid services**. All demo
changes persist in your browser via `localStorage`.

---

## Demo login accounts

Open **<http://localhost:3000/login>**. The password for **every** account is:

```
demo123
```

| Email | Role |
|---|---|
| `citizen@demo.local` | Public Citizen |
| `gramsabha@demo.local` | Gram Sabha Member |
| `volunteer@demo.local` | Volunteer / Shramdaan |
| `shg@demo.local` | SHG / Community Group Rep |
| `vwsc@demo.local` | VWSC Member |
| `gpmember@demo.local` | Gram Panchayat Member |
| `upsarpanch@demo.local` | Up-Sarpanch |
| `sarpanch@demo.local` | Sarpanch |
| `gpstaff@demo.local` | Gram Panchayat Staff |
| `gramsevak@demo.local` | **Gram Sevak (main daily workspace)** |
| `je@demo.local` | Junior Engineer / Technical |
| `extension@demo.local` | Extension Officer |
| `abdo@demo.local` | Assistant BDO |
| `psmember@demo.local` | Panchayat Samiti Member |
| `upsabhapati@demo.local` | Up-Sabhapati |
| `sabhapati@demo.local` | Sabhapati |
| `bdo@demo.local` | **Block Development Officer (block command)** |
| `blockdept@demo.local` | Block Department Officer |
| `dyceo@demo.local` | **Deputy CEO – Panchayat (district command)** |
| `dyceodept@demo.local` | Deputy CEO / Department Head |
| `additionalceo@demo.local` | Additional CEO |
| `zpmember@demo.local` | Zilla Parishad Member |
| `zpvp@demo.local` | ZP Vice-President |
| `zppresident@demo.local` | ZP President |
| `ceo@demo.local` | **CEO – Strategic Command** |
| `admin@demo.local` | System Administrator |

> **Demo authentication only. Do not use these credentials in production.** All
> account holders are neutral demo identities (e.g. "Demo CEO", "Demo Gram Sevak").

**Quick Role Switcher** — on the login page, click any role card to log in instantly
(no typing). Inside the app, use the floating **"View as Role"** button to switch
identities live and watch the same event appear differently at each level.

---

## Where to look first (presentation guide)

- **`/`** — Landing page.
- **`/public`** — Citizen-first public portal (no login). Select a village.
- **`/demo-story`** — **Presentation Mode.** Four guided stories with one-click
  "login as this role & open" buttons, a hierarchy visual and Reset Story:
  1. A broken handpump (HP-018) travels VWSC → Gram Sevak → JE → BDO → Deputy CEO → CEO → Public.
  2. A Government circular becomes tracked action via Aadesh-te-Kruti, hits a Technical-Sanction blocker, surfaces up.
  3. Community participation — activity published → citizen joins → verified → aggregates update.
  4. Complaint routing — citizen complaint → classified & routed → resolved → public status.
- **Explainer pages:** `/app/architecture`, `/app/access-map`, `/app/research-map`,
  `/app/system-status`, `/app/production-readiness`.

---

## Fully interactive (persisted to `localStorage`)

- **NIGAA → QR Asset Check** — scan an asset, mark condition; a `NON_FUNCTIONAL`
  reading auto-creates a repair ticket and notifies the Gram Sevak & JE.
- **NIGAA → Repair Workflow** — REPORTED → ASSIGNED → INSPECTED → IN PROGRESS →
  CLAIMED COMPLETE → VERIFICATION → VERIFIED → CLOSED, with role gating
  (a user cannot verify their own high-priority repair). Restores the asset.
- **PATHPURAVA** — obligations list/kanban, detail drawer with workflow actions
  (status, report blocker, submit, verify/return, escalate), Add Obligation.
- **PATHPURAVA → Aadesh-te-Kruti** — simulated AI extraction from a Marathi GR;
  approve suggestions to create obligations.
- **PATHPURAVA → HASTANTARAN** — officer handover; accept a handover pack.
- **Shramsankalp (Participation)** — register for the Pond Cleaning drive; organisers
  complete activities.
- **Innovation Library → Use as Template** — generates replication tasks.
- **GP File Flow** — file ageing & desk movement (v2).
- **Complaint Routing** — file → classify → route → resolve (v2).
- **Mahsul Sandhi** — SAMARTH adoption checklist per GP (v2).
- **Process Improvement Lab** — baseline vs current experiments (v2).
- **Aawaj Nond** — voice status with confirmation (v2); **QR camera** with fallback;
  **evidence upload** with preview + metadata (v2).
- **Seasonal, Institutions, Admin (users), Settings (Reset Demo Data)** — all mutate
  the shared demo state.
- Every action writes to the **Audit Trail** and, where relevant, the **Notification
  Centre** (with SMS preview).

## Simulated / read-only demo modules

- **Seva Ghadyal** (service monitoring), **Kar Jagruti** (revenue transparency),
  **Fund Convergence** view, **UC Follow-up** — reference/read views. These
  deliberately do **not** implement accounting, tax, payments, or official
  service-system integration. Each carries a clear "source of truth remains the
  Government system" note.

## Not connected

- **Government APIs** (eGramSwaraj, ZPFMS/PFMS, SAMARTH, Gram Manchitra, AuditOnline,
  Panchayat NIRNAY, Aaple Sarkar/ServicePlus, JJM/WQMIS) — **reference only, not
  connected**. **SMS/WhatsApp** — preview only, nothing is sent.

## Requires a production backend (not in this demo)

Server-side auth, database, server-enforced RBAC, encryption, approved hosting,
backups, audit retention, monitoring, DPDP/privacy review, official API approvals,
and security testing. See `/app/production-readiness`.

**No real Government integration is active anywhere in this demo.**

---

## Demo hierarchy

- **State:** Maharashtra → **District:** Yavatmal
- **16 Panchayat Samitis (blocks).** District reference: **1,201 Gram Panchayats
  (Official Reference)**. The demo loads **N GPs (Demo Data)** — the dashboards show
  both figures separately and never fabricate counts to force a total.
- **Pilot block:** Yavatmal, with **5 fully-populated illustrative pilot GPs**
  (**Pilot GP A–E**) plus demo GPs across all blocks. The data model scales to
  1,201 GPs without redesign.

---

## Tech stack

- **Next.js 14** (App Router) · **TypeScript (strict)** · **Tailwind CSS**
- **Recharts** (charts) · **Framer Motion** (subtle animation) · **Lucide** (icons)
- Client-side **TypeScript seed data** + **React context** store, persisted to
  **`localStorage`**. No backend, no external API, no API keys.

## Project structure

```
src/
  app/                 # routes: landing, login, /app/*, /public, /demo-story
  components/
    ui/                # Card, Badge, Button, StatCard, charts, Tabs, ...
    layout/            # AppShell (sidebar, topbar, mobile nav), ViewAsRole, search
    dashboard/         # shared dashboard widgets
    dashboards/        # 26 purpose-built role dashboards + registry
  data/                # roles, hierarchy (16 blocks), users, seed data
  permissions/         # RBAC: scope + can() + edit-vs-view separation
  services/            # localStorage-backed store + auth context
  types/               # all domain model interfaces
  utils/               # labels (EN/मराठी), formatting, selectors
```

## Scripts

```bash
npm run dev          # start development server on http://localhost:3000
npm run build        # production build
npm run start        # run the production build
npm run lint         # lint
npm run typecheck    # TypeScript strict typecheck (tsc --noEmit)
npm run test:access  # 173 programmatic access-control assertions (13 categories)
```

---

## Accessibility & languages

- English primary, with **मराठी** labels and an **EN / मराठी** toggle in the header.
- Keyboard focus styles, sufficient contrast, status shown by **icon + colour + text**
  (never colour alone), large tap targets, and confirmation dialogs for major actions.

---

## Disclaimer

Demonstration prototype for research and field validation. It is not an official
Government system and contains mock/demo data. No official Government logos are used.
