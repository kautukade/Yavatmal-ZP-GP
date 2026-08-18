# Changelog — Government Demo v2.1.1 (FINAL CANDIDATE)

Correctness patch over v2.1 FINAL. **No rebuild, no redesign, no new major
modules.** Every existing module, role, dashboard and page is preserved.

> Demo-level role-based access simulation with centralized permission enforcement.
> Frontend-only (browser localStorage); not multi-user; not server-secured; no
> Government API; not official Government authentication or hosting. Production must
> enforce authorization server-side.

---

## Fixed

### Admin — full user scope editing
- New role-aware **Edit User** drawer: role, district, block, Gram Panchayat,
  assigned GPs (Extension Officer), department, and active/disabled status.
- Centralized **`normalizeUserScopeForRole`** strips stale/incompatible scope on
  role change (e.g. Gram Sevak→CEO clears GP; CEO→Gram Sevak restores block+GP).
- **`validateUserScope`** blocks invalid combinations (Gram Sevak without GP, BDO
  without block, Department Head without department, Extension Officer with no GPs).
- Typed audit events: `USER_CREATED`, `USER_ROLE_CHANGED`, `USER_SCOPE_CHANGED`,
  `USER_DEPARTMENT_CHANGED`, `USER_ENABLED`, `USER_DISABLED` (actor, target,
  old→new, timestamp). Changes take effect on next login and immediately for a
  logged-in user (disabled → forced logout; role/scope → live refresh).

### Live users everywhere
- Extracted pure **`authenticate(users, email, password)`** (used by the store AND
  the test suite). Login page **Demo Accounts** list now renders from `state.users`
  (shows DISABLED, hides one-click login for disabled).
- **Quick Role Switcher** and floating **View-As-Role** select from live
  `state.users`, active-only; disabled/missing roles are shown as "No active demo
  account" and are not selectable.

### HASTANTARAN (handover) scope
- **`getAccessibleHandovers(user, handovers)`** scopes the list (GP / assigned GPs
  / block / district). New capabilities `VIEW_/CREATE_/ACCEPT_/REVIEW_HANDOVER`.
- **`canAcceptHandover`** requires `ACCEPT_HANDOVER` + in-scope GP + not already
  accepted + active user. GP-B Gram Sevak cannot accept a GP-A handover; Sysadmin
  and CEO cannot accept. Audit event `HANDOVER_ACCEPTED`.

### UC Follow-Up scope
- **`getAccessibleUcFollowUps(user, records)`** scopes by GP/block/district; new
  `VIEW_/UPDATE_/ESCALATE_/CLOSE_UC_FOLLOWUP` capabilities. Citizens cannot access
  the internal UC list; empty-state shown when out of scope.

### Offline queue coverage
- Centralized pure helpers in `services/offline.ts` (`shouldQueue`, `syncQueue`,
  `makeOfflineMutation`) used by the store's `queueIfOffline` / `syncOfflineQueue`.
- Offline demo mutations now cover **NIGAA** asset checks, **PATHPURAVA** status &
  blocker updates, and **Seasonal** task completion → `SYNC_PENDING`, becoming
  `SYNCED_DEMO` on reconnect ("local demo store only — no Government server").

### View-As-Role auto-redirect
- Switching to a role that can't access the current route redirects to that role's
  default (`roleDefaultRoute`: Citizen→/public, Sysadmin→/app/admin, else /app) —
  no 403 flash on an intentional demo switch. Manual URL typing to an unauthorized
  route still shows the 403 guard (the blanket AppShell redirect was removed).

### Department visibility hardening
- `inScope` no longer treats a missing `departmentId` as auto-visible to a
  department-scoped user. Untagged internal records are hidden unless
  `visibilityScope` is DISTRICT_SHARED / CROSS_DEPARTMENT / PUBLIC or the record is
  published public.

### Hierarchy count cleanup
- `Block.gpCount` renamed **`demoIllustrativeGpCount`** (illustrative only).
  Dashboards use `demoGpsLoaded()` / `DEMO_GP_COUNT`; official reference stays
  **1,201 GPs (OFFICIAL REFERENCE)**. No fabricated official block totals.

## Tests
- `npm run test:access` → **129 assertions, all passing**, in categories: ROUTE,
  ACTION, SCOPE, EXPORT, AUTH, ADMIN STATE, HANDOVER, UC, OFFLINE, ROLE SWITCH,
  DEPARTMENT — loading the real `authenticate`, `normalizeUserScopeForRole`,
  `validateUserScope`, `canAcceptHandover`, `getAccessibleHandovers`,
  `getAccessibleUcFollowUps`, offline helpers, scope engine, capabilities and
  route rules (no duplicated logic).

## Known limitations (unchanged)
Frontend-only demo; QR decode simulated (camera + demo selection); SMS/WhatsApp
previews only; AI extraction simulated; large/PDF evidence metadata-only; no
Government API connected. See the in-app Production Readiness page.
