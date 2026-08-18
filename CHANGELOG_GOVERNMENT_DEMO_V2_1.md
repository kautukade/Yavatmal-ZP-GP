# Changelog — Government Demo v2.1 (FINAL)

Final hardening pass over Government Demo v2. **No rebuild** — every v2 module,
role, dashboard, page and the PWA shell were preserved. This release fixes
authentication, enforces action-level permissions, tightens the scope engine, and
makes simulated features truthful.

> Demo-level role-based access simulation with centralized permission enforcement.
> **Not** production-secure authentication or Government-grade RBAC. No live
> Government integration is active. Production must enforce authorization
> server-side.

---

## 1. Authentication (critical fix)
- **Login now reads the current `state.users`, not the static seed.** A live
  `stateRef` backs `login` / `loginAs` / `viewAs`.
- New **`SEED_USERS`** = immutable defaults; `state.users` = editable; RESET DEMO
  restores `state.users` from `SEED_USERS`.
- **Disabled users are rejected** with "Your demo account has been disabled."
  (`login` returns `{ ok, reason: "invalid" | "disabled" }`).
- **Admin edits persist and take effect on next login** — role/GP/block/department
  changes flow through; a sync effect also refreshes the live session user and logs
  out an account that is disabled or removed mid-session.
- Quick Role Switcher and View-as-Role select from current `state.users`, active only.

## 2. Action-level capability enforcement
Every mutation is gated by `hasCapability(user, capability[, resource])`, not just
routes:
- **PATHPURAVA** — create (`CREATE_OBLIGATION`), update-own (`UPDATE_OWN_OBLIGATION`
  with GP match), review/return, verify (`VERIFY_OBLIGATION`), escalate; Aadesh-te-Kruti
  approval requires review/create capability.
- **NIGAA** — QR "Submit Check" requires `REPORT_ASSET_CONDITION` (hidden otherwise
  with an explanation); repair actions gated by `ASSIGN_REPAIR` / `UPDATE_REPAIR` /
  `CLAIM_REPAIR_COMPLETE` / `VERIFY_REPAIR` / `CLOSE_REPAIR`; self-verify of a
  high-priority repair still blocked.
- **Innovation** — "Use as Template" requires `CREATE_FROM_TEMPLATE`; read-only roles
  see "View Replication Checklist" only.
- **Institutions** — submit/review gated (`SUBMIT_INSTITUTION_ACTIVITY` /
  `REVIEW_INSTITUTION_ACTIVITY`).
- **Participation** — register (`SUBMIT_PARTICIPATION`), complete
  (`COMPLETE_PARTICIPATION_ACTIVITY`/`VERIFY_PARTICIPATION`).
- **Complaint** — submit (`SUBMIT_COMPLAINT`), route/resolve (`ROUTE_COMPLAINT`).
- **Seasonal** — mark done requires `SUBMIT_SEASONAL_CHECK`.
- **CEO is view-only** — no field actions anywhere. **System Admin is not an
  operational superuser** — no create/verify/complete capabilities.

## 3. Scope engine
- Each dimension enforced independently; a record with **no gpId is no longer
  auto-visible** — the block gate still applies (fixes Extension Officer / BDO
  cross-block leakage). Department mismatch hides the record.
- **Global search**, **report/CSV export** and **notifications** all route through
  the same scope model (`getAccessibleRecords` / `inScope`). District/block-wide
  reports are limited to district/system roles; block/GP roles export only their block.

## 4. Truthful feature labelling
- **QR** relabelled **Simulated (camera + demo selection)** — the camera opens via
  BarcodeDetector/getUserMedia but decoding is not wired to printed codes; Research
  Map (M4) and System Status updated accordingly.
- **Evidence upload persists** small images as data URLs in the demo store
  (survives refresh); limits: image 2 MB, PDF 5 MB; `storageMode` LOCAL_DEMO /
  METADATA_ONLY.
- **Offline mutation queue** (`OfflineMutation`) — offline asset checks apply
  locally and enqueue `SYNC_PENDING`; on reconnect they become `SYNCED_DEMO`
  ("local demo store only — no Government server"). Viewer in Settings; count in the
  offline indicator.
- **WhatsApp preview** added beside SMS in Services; "Send" shows "Demo only — no
  external message was sent."
- **CEO Top-5 fully dynamic** — severity-scored from live state; the hard-coded
  "1 cross-department escalation" line was removed (now derived, shown only when > 0).
- **Process Improvement Lab** — experiments can bind a **live platform metric**
  (overdue obligations, non-functional assets, open repairs, readiness, etc.) whose
  current value auto-calculates from state; manual mode retained.
- **System Status** gained a **Demo Truth panel** (Real / Simulated / Not production).

## 5. Testing
- `npm run test:access` expanded to **80 assertions** across ROUTE / ACTION /
  SCOPE / EXPORT / AUTH categories, loading the real `routeAccess`, `capabilities`,
  `permissions/index` and `SEED_USERS` — no duplicated permission logic.
- `ACCESS_MATRIX.md` regenerated from source with an **Operational Mutation Rights**
  column.

## Known limitations
- Frontend-only; browser `localStorage`; not multi-user; not secure.
- QR decode simulated; SMS/WhatsApp previews only; AI extraction simulated.
- No Government API connected. Evidence for large/PDF files is metadata-only.

## Production requirements
Unchanged from v2 — see the in-app **Production Readiness** page: secure backend &
DB, server-side auth (SSO/MFA if approved), server-enforced RBAC, encryption,
approved hosting, backups, audit retention, monitoring, DPDP/privacy review, official
API approvals, and security testing.
