# Demo Presentation Guide (12 minutes)

> **Presenter note (say once up front):** All data is demo/mock data. Government
> systems remain the source of truth. No Government API is connected. The "offline
> sync" shown is local demo synchronization only.

## Exact 12-minute timed flow (presenter script)

> Password for every account is `demo123`. Use the Quick Role Switcher (login) and
> the floating **View as Role** button. Everything is mock/demo data.

| Time | Route · Role | Click | Say |
|---|---|---|---|
| 0:00–1:00 | `/public` · none | Select **Pilot GP A** | "Citizens see only approved public information — readiness, decisions, asset status. No personal data." |
| 1:00–2:00 | `/app/access-map` · any | Walk the ladder | "Village → Block → District. Visibility never implies edit rights — the CEO can't rewrite a Gram Sevak's evidence." |
| 2:00–5:00 | `/app/nigaa` · VWSC → Gram Sevak → JE → verifier | QR check HP-018 **NON-FUNCTIONAL** → assign JE → inspect/claim → a different officer verifies | "One field report auto-creates a repair ticket, moves through the workflow, and the same person can't verify their own high-priority repair." |
| 5:00–8:00 | `/app/pathpurava` · Extension → Gram Sevak → Deputy CEO | Aadesh-te-Kruti approve → Gram Sevak reports **Technical Sanction** blocker → ADTHALA tab | "A GR becomes tracked obligations; a village blocker aggregates into a district-wide systemic bottleneck." |
| 8:00–9:00 | `/app` · BDO | Show **GPs Needing Intervention** | "The block officer sees exceptions first, not every record." |
| 9:00–10:00 | `/app` · Deputy CEO | Top Systemic Bottlenecks | "Deputy CEO sees the pattern across blocks." |
| 10:00–11:00 | `/app` · CEO | Five things today + **Baseline vs Current** | "CEO sees five dynamic strategic items and measurable outcome change — driven by the field action we just did." |
| 11:00–12:00 | `/app/research-map` · any | Status counts | "All 35 research concepts consolidated into one platform — not 35 apps." |

**Do-not-overclaim during the meeting:** Aadesh-te-Kruti is *simulated AI*; QR is
*camera + simulated selection*; SMS/WhatsApp are *previews only*; Government APIs are
*not connected*. The in-app **System Status** page states this openly.

---

# Detailed step reference (10–15 minutes)

For presenting the **Yavatmal Unified Panchayat Operations Platform (Government
Demo v2)** to senior Zilla Parishad officers.

**Before you start:** `npm run dev` → open `http://localhost:3000`. Keep the
**Quick Role Switcher** (login page) and the floating **View as Role** button handy.
Password for every demo account is `demo123`. Everything is mock/demo data.

One sentence to open with:
> *"Existing Government systems remain the source of truth. This platform adds one
> operational experience on top — one update at the village level flows upward to
> block, district and CEO views, and only approved information is shown to the public."*

---

### 1 · Public Portal — what citizens see
- **Route:** `/public`  ·  **Role:** none (no login)
- **Do:** Select **Pilot GP A**. Point to Readiness, Decisions & Completion, Assets, Participate.
- **Say:** "Citizens see only approved, public information — no personal data, no internal notes."

### 2 · Role hierarchy & access
- **Route:** `/app/access-map` (login as any role first, e.g. Quick Switch **CEO**)
- **Do:** Walk the Public → Village → GP → Block → Deputy CEO → CEO ladder and the Can-View / Update / Review / Escalate / Admin columns.
- **Say:** "Visibility never implies edit rights. The CEO sees a GP result but cannot rewrite the Gram Sevak's evidence."

### 3 · VWSC reports a broken handpump (HP-018)
- **Route:** `/app/nigaa` → **QR Asset Check**  ·  **Role:** VWSC Member
- **Do:** "Try Camera Scan" (falls back to demo), pick **HP-018**, mark **NON-FUNCTIONAL**, add an issue + note, Submit.
- **Say:** "A repair ticket was created automatically and the Gram Sevak and JE were notified."

### 4 · Gram Sevak receives & assigns
- **View as Role → Gram Sevak.** Dashboard shows the new failure.
- **Do:** `/app/nigaa` → Repair Workflow → open the ticket → **Assign to JE**.

### 5 · JE repairs
- **View as Role → JE.** `/app/nigaa` → Repair Workflow → **Inspected → Start Repair → Claim Complete → Send for Verification**.
- **Say:** "The same person who claims a high-priority repair cannot verify it."

### 6 · BDO sees a block exception
- **View as Role → BDO.** `/app` — the GP appears under **GPs Needing Intervention**; note Oldest Pending Files & Complaint exceptions.

### 7 · Deputy CEO sees the systemic pattern
- **View as Role → Deputy CEO.** `/app` — **Top Systemic Bottlenecks**, Blocks Needing Attention, 1,201 (official) vs demo dataset.

### 8 · Verify → asset restored → CEO outcome
- **View as Role → Gram Sevak** (a different officer) → verify the repair → asset returns **Functional**.
- **View as Role → CEO.** `/app` — **Outcome Changes: Baseline vs Current** move (e.g. non-functional assets ↓). Show the dynamic **five things to know today**.
- **Say:** "One field action just changed the CEO's outcome figures — no repeated reporting."

### 9 · PATHPURAVA — a GR becomes tracked action
- **Route:** `/app/pathpurava` → **Aadesh-te-Kruti**  ·  **Role:** Extension Officer
- **Do:** Approve an AI-suggested obligation (note the "not official until approved" banner). Then **View as Role → Gram Sevak**, open it, **Report Blocker → Technical Sanction Pending**.
- **View as Role → Deputy CEO** → **ADTHALA** tab: "X obligations across Y GPs waiting for Technical Sanction."

### 10 · Shramdaan (community participation)
- **Route:** `/app/participation`  ·  **Role:** Gram Sevak / Citizen
- **Do:** Open the Pond Cleaning drive, register interest, mark completed. Show the public counter updating on `/public`.

### 11 · Research opportunity map
- **Route:** `/app/research-map`
- **Say:** "All 35 research concepts — 10 websites, 15 software, 10 mobile — consolidated into one platform, not 35 apps." Show the status counts.

### 12 · Production roadmap
- **Route:** `/app/production-readiness` and `/app/system-status`
- **Say:** "This is a validation demo. Here is exactly what production would require, and here is what is interactive vs simulated vs not connected."

---

**Fallback tip:** if a live click misbehaves, open **`/demo-story`** — Stories 1–4
walk the same flows step-by-step with one-click "Login as role & open" buttons and
a **Reset Story** control.
