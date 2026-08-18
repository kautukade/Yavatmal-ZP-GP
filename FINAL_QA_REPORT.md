# Final QA Report — Government Demo v2.1

Date: demo build. Environment: Next.js 14 · TypeScript strict · Node LTS.

| Check | Result |
|---|---|
| `npm run build` | **PASS** — compiled successfully, 34 routes generated |
| `npm run typecheck` (`tsc --noEmit`) | **PASS** — no errors |
| `npm run lint` (`next lint`) | **PASS** — no warnings or errors |
| Runtime smoke test (production server) | **PASS** — all 31 tested routes return 200 |
| `npm run test:access` | **PASS — 80 / 80** |

## Access test breakdown (80 total)
| Category | Passed |
|---|---|
| Route tests | 24 / 24 |
| Action (capability) tests | 30 / 30 |
| Scope tests | 16 / 16 |
| Export scope tests | 4 / 4 |
| Auth tests | 6 / 6 |

Tests load the real `routeAccess.ts`, `capabilities.ts`, `permissions/index.ts`
(scope engine) and `SEED_USERS` — no duplicated permission logic.

## Workflow tests (manual)
| Workflow | Result |
|---|---|
| HP-018: VWSC report → Gram Sevak assign → JE repair/claim → verify → asset restored → BDO/Deputy CEO/CEO metrics + baseline-vs-current move → public status | **PASS** |
| PATHPURAVA: GR → Aadesh-te-Kruti approve → obligation → Gram Sevak block → BDO → Deputy CEO ADTHALA → CEO strategic; CEO cannot edit field evidence; Sysadmin cannot close | **PASS** |
| Complaint: Citizen submit → route → resolve → public status; Sysadmin cannot resolve | **PASS** |
| Participation: publish → citizen join → verify → aggregates update; Sysadmin cannot verify | **PASS** |
| Admin: create user → relogin works; disable → login rejected; role change persists | **PASS** |

## Feature status (truthful)
| Area | Status |
|---|---|
| Authentication | Client-side demo only, reads live `state.users`; disabled rejected |
| Route guards | Centralized; 403 page; never renders restricted content |
| Action permissions | Capability-gated across all modules |
| Scope engine | GP / block / department enforced independently; search + export + notifications scoped |
| PWA | Manifest + service worker + offline fallback + offline mutation queue — **PASS** |
| QR | **SIMULATED** — camera opens (BarcodeDetector/getUserMedia); asset picked from demo list |
| Evidence | **PERSISTENT LOCAL** for small images (data URL, survives refresh); PDFs metadata-only |
| Offline queue | Interactive local demo (SYNC_PENDING → SYNCED_DEMO) |
| CEO KPIs | Fully dynamic, severity-scored from live state |
| Process Improvement Lab | Manual + **live platform metric** binding |
| SMS / WhatsApp | Preview only — nothing sent |
| AI extraction (Aadesh-te-Kruti) | Simulated |
| Government integrations | **NONE ACTIVE** |

## Known limitations
- Frontend-only demo; state in browser `localStorage`; not multi-user; not secure.
- QR decoding is not wired to printed codes (camera opens, then demo selection).
- SMS/WhatsApp are previews; AI extraction is simulated.
- Large images / PDFs are stored as metadata only (image ≤ 700 KB persisted as data URL).
- No server, no database, no Government API — production would require all of the
  items on the in-app Production Readiness page.

## Verdict
All Definition-of-Done gates met: auth reads live users; disabled blocked; role/scope
changes persist; Citizen cannot mutate internal data; CEO has no field actions;
Sysadmin cannot alter operational outcomes; Innovation template gated; institution /
participation / complaint / seasonal actions gated; scope + search + export enforced;
80 access tests pass; build/lint/typecheck green; core four demo stories work.
