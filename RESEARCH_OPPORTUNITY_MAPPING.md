# Research Opportunity → Unified Platform Mapping

All **35** research concepts (10 website, 15 software, 10 mobile) consolidated into **one** unified platform — deliberately **not** 35 separate products. Shared authentication, users, RBAC, data layer, navigation, audit, notifications, reports and evidence are reused across every module.

Generated from `src/data/researchMap.ts` (also rendered in-app at `/app/research-map`).

## Website concepts (10)

| # | Concept | Unified Module | Status | Notes (why merged / Govt overlap / demo / future) |
|---|---|---|---|---|
| W1 | Purtata Phalak | Public Transparency | Implemented as Module | Public compliance board. |
| W2 | Seva Ghadyal Public Board | Services / Public Portal | Simulated | Aggregate service board; no personal data. |
| W3 | Yashkatha Pratikruti | Innovation / Replication | Implemented as Module | Replication library with 'Use as Template'. |
| W4 | Shramdaan Sangam | Participation | Implemented as Module | Public activity registration. |
| W5 | Gaon Tayari | Seasonal / Public Readiness | Implemented as Module | Readiness % on public portal. |
| W6 | District Open Data | Public Transparency / Open Data | Implemented as Module | Aggregate CSV export. |
| W7 | Gram Sabha Darpan | Gram Sabha | Implemented as Module | Meeting & action-taken transparency. |
| W8 | Sanstha Darshak | Institutions | Implemented as Module | Institution directory. |
| W9 | Abhinav Aavhan | Innovation Challenge | Implemented as Module | District challenge. |
| W10 | Kar Jagruti | Revenue Transparency | Simulated | Public revenue view; not a tax engine. |

## Software concepts (15)

| # | Concept | Unified Module | Status | Notes (why merged / Govt overlap / demo / future) |
|---|---|---|---|---|
| S1 | PATHPURAVA | PATHPURAVA | Implemented as Module | Decision-to-completion tracking. |
| S2 | ADTHALA | PATHPURAVA · Blockers | Implemented as Module | Blocker & dependency intelligence. |
| S3 | HASTANTARAN | PATHPURAVA · Handover | Implemented as Module | Officer handover pack. |
| S4 | Seva Ghadyal SLA | Services | Simulated | SLA monitoring demo. |
| S5 | Malmatta Dekhbhal | NIGAA | Implemented as Module | Asset maintenance layer. |
| S6 | Abhisaran Naksha | Convergence | Implemented as Module | Execution sequencing. |
| S7 | Sanstha Sakshamikaran | Institutions Workspace | Implemented as Module | Institution operational workspace. |
| S8 | Hangami Sajjata | Seasonal | Implemented as Module | Seasonal readiness cycles. |
| S9 | Audit Para Accelerator | PATHPURAVA (referenced) | Govt Has Equivalent | Not a separate product; audit obligations referenced in PATHPURAVA. AuditOnline is source of truth. |
| S10 | UC Tracker | PATHPURAVA · UC Follow-up | Implemented as Module | Operational follow-up only. |
| S11 | GP File Flow | GP File Flow | Implemented as Module | New module (v2). Not an eOffice replacement. |
| S12 | Mahsul Sandhi | Mahsul Sandhi | Implemented as Module | New module (v2). SAMARTH adoption checklist, not a tax engine. |
| S13 | Process Improvement Lab | Process Improvement Lab | Implemented as Module | New module (v2). Improvement measurement practice. |
| S14 | Complaint Routing | Complaint Routing | Implemented as Module | New module (v2). Internal routing; external needs official coordination. |
| S15 | Fund Convergence View | Convergence | Simulated | Read-only reference; official finance stays in Govt systems. |

## Mobile concepts (10)

| # | Concept | Unified Module | Status | Notes (why merged / Govt overlap / demo / future) |
|---|---|---|---|---|
| M1 | PATHPURAVA Mobile Inbox | PATHPURAVA (responsive/PWA) | Implemented as Module | Responsive field view. |
| M2 | Aawaj Nond (Voice) | Voice Status | Implemented as Module | New (v2). Web Speech + simulated fallback. |
| M3 | Seasonal Checklist | Seasonal | Implemented as Module | Mobile seasonal view. |
| M4 | QR Asset Check | NIGAA | Implemented as Module | Camera + demo fallback. |
| M5 | Shramdaan Mobile Companion | Participation | Implemented as Module | Responsive participation. |
| M6 | SHG Reporting | Institutions | Govt Has Equivalent | No UMED duplication; institution actions only. |
| M7 | Sarpanch Dashboard | Sarpanch Dashboard | Implemented as Module | Responsive Sarpanch view. |
| M8 | SMS / WhatsApp | Communication Preview | Simulated | Preview channel; no real messages sent. |
| M9 | Offline Data Collection | PWA / Offline Shell | Implemented as Module | Shared offline shell; no separate app. |
| M10 | Handover Mobile View | HASTANTARAN | Implemented as Module | Responsive handover view. |

## Status legend

- **Implemented as Module** — 28 concept(s)
- **Merged into Module** — 0 concept(s)
- **Simulated** — 5 concept(s)
- **Validation Required** — 0 concept(s)
- **Govt Has Equivalent** — 2 concept(s)
- **Deferred** — 0 concept(s)

## Principle

Government systems remain the source of truth. Where a Government system already provides the capability (e.g. AuditOnline for audit records, UMED for SHGs), the platform references it rather than duplicating it. New v2 modules (GP File Flow, Complaint Routing, Mahsul Sandhi, Process Improvement Lab, Aawaj Nond) fill operational-follow-through gaps without replacing any statutory system.
