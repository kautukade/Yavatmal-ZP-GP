# Changelog — Government Demo 100% FINAL

Absolute final correctness & regression patch over v2.1.1. **No rebuild, no
redesign, no new features.** Four critical edge cases closed + full regression.

> "100% final" = all planned demo functionality and correctness gates are complete.
> It does **not** mean production Government-deployment ready. Frontend-only
> (browser localStorage); not multi-user; not server-secured; no Government API,
> authentication or hosting. Production must enforce authorization server-side.

---

## Critical Fix 1 — HASTANTARAN: only the designated incoming officer accepts
`canAcceptHandover` now requires ALL of: active user · `ACCEPT_HANDOVER` capability ·
status `AWAITING_ACCEPTANCE` · `incomingUserId` exists · **`incomingUserId === user.id`** ·
user is not the outgoing officer · `user.gpId === handover.gpId`. Added a handover
`status` (AWAITING_ACCEPTANCE → ACCEPTED). Seed made consistent: HND-1 incoming =
`u-gramsevak` (Borgaon), HND-2 incoming = `u-gramsevak2` (Lohara); history handovers
use distinct departed/incoming ids and are pre-ACCEPTED. UI shows **Accept Handover**
(designated incoming), **Review Handover** (BDO/Extension via `canReviewHandover`),
**Read Only — awaiting the designated incoming officer** (others). Audit
`HANDOVER_ACCEPTED` records handover/gp/incoming/outgoing/acceptedBy/from→to.

## Critical Fix 2 — Extension Officer block ↔ assigned-GP consistency
`validateAssignedGpsForBlock` (every assigned GP must be in the selected block) wired
into `validateUserScope`. `normalizeUserScopeForRole` filters assigned GPs to the
block. Admin block change **clears cross-block assigned GPs** with a notice; the
assigned-GP picker only lists GPs of the selected block. `inScope` now enforces
**block AND GP independently** and **derives a record's block from its GP**
(`getRecordBlockId`) — a stale cross-block assigned GP can never leak.

## Critical Fix 3 — Admin status-change auditing (all entry points)
Centralized **`userUpdateAuditEvents(oldUser, newUser)`** produces
`USER_ROLE_CHANGED`, `USER_SCOPE_CHANGED`, `USER_GP_ASSIGNMENT_CHANGED`,
`USER_DEPARTMENT_CHANGED`, `USER_DISABLED`, `USER_ENABLED`. Used by **both** the Edit
User drawer and the quick enable/disable toggle, so a status transition is always
audited (active→disabled and disabled→active) regardless of entry point.

## Critical Fix 4 — UC Follow-Up department scope
`UCFollowUp` gained `departmentId` + `visibilityScope`; seed tagged accordingly.
`getAccessibleUcFollowUps` passes department metadata through `inScope`, whose
department gate now honors `visibilityScope`: DEPARTMENT (matching dept only),
CROSS_DEPARTMENT / DISTRICT_SHARED / PUBLIC (shared), untagged internal hidden.

## Regression
Every role-sensitive mutation re-checked against the Access Matrix (PATHPURAVA,
NIGAA, repair, seasonal, institutions, participation, innovation template, complaint,
GP file flow, UC, handover, admin). CEO performs no field mutation; Sysadmin performs
no operational mutation; Public cannot see/export internal data. `ACCESS_MATRIX.md`
regenerated from source.

## Tests
`npm run test:access` → **173 assertions, all passing**, categories: ROUTE, ACTION,
SCOPE, EXPORT, AUTH, ADMIN, HANDOVER, UC, OFFLINE, ROLE SWITCH, DEPARTMENT, EDGE CASE,
WORKFLOW — importing the real implementation (`authenticate`,
`normalizeUserScopeForRole`, `validateUserScope`, `validateAssignedGpsForBlock`,
`userUpdateAuditEvents`, `canAcceptHandover`, `canReviewHandover`,
`getAccessibleHandovers`, `getAccessibleUcFollowUps`, `inScope`, `getRecordBlockId`,
offline helpers, capabilities, route rules, `roleDefaultRoute`).

## Known limitations (unchanged, honest)
Frontend-only demo; QR decode simulated (camera + demo selection); SMS/WhatsApp
previews only; AI extraction simulated; large/PDF evidence metadata-only; no
Government API connected.
