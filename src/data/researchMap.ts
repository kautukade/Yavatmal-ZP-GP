export type MappingStatus =
  | "IMPLEMENTED"
  | "MERGED"
  | "SIMULATED"
  | "VALIDATION_REQUIRED"
  | "GOVT_EQUIVALENT"
  | "DEFERRED";

export interface ResearchConcept {
  code: string;
  name: string;
  group: "Website" | "Software" | "Mobile";
  module: string;
  status: MappingStatus;
  note: string;
}

export const RESEARCH_CONCEPTS: ResearchConcept[] = [
  // ---- 10 Website concepts ----
  { code: "W1", name: "Purtata Phalak", group: "Website", module: "Public Transparency", status: "IMPLEMENTED", note: "Public compliance board." },
  { code: "W2", name: "Seva Ghadyal Public Board", group: "Website", module: "Services / Public Portal", status: "SIMULATED", note: "Aggregate service board; no personal data." },
  { code: "W3", name: "Yashkatha Pratikruti", group: "Website", module: "Innovation / Replication", status: "IMPLEMENTED", note: "Replication library with 'Use as Template'." },
  { code: "W4", name: "Shramdaan Sangam", group: "Website", module: "Participation", status: "IMPLEMENTED", note: "Public activity registration." },
  { code: "W5", name: "Gaon Tayari", group: "Website", module: "Seasonal / Public Readiness", status: "IMPLEMENTED", note: "Readiness % on public portal." },
  { code: "W6", name: "District Open Data", group: "Website", module: "Public Transparency / Open Data", status: "IMPLEMENTED", note: "Aggregate CSV export." },
  { code: "W7", name: "Gram Sabha Darpan", group: "Website", module: "Gram Sabha", status: "IMPLEMENTED", note: "Meeting & action-taken transparency." },
  { code: "W8", name: "Sanstha Darshak", group: "Website", module: "Institutions", status: "IMPLEMENTED", note: "Institution directory." },
  { code: "W9", name: "Abhinav Aavhan", group: "Website", module: "Innovation Challenge", status: "IMPLEMENTED", note: "District challenge." },
  { code: "W10", name: "Kar Jagruti", group: "Website", module: "Revenue Transparency", status: "SIMULATED", note: "Public revenue view; not a tax engine." },

  // ---- 15 Software concepts ----
  { code: "S1", name: "PATHPURAVA", group: "Software", module: "PATHPURAVA", status: "IMPLEMENTED", note: "Decision-to-completion tracking." },
  { code: "S2", name: "ADTHALA", group: "Software", module: "PATHPURAVA · Blockers", status: "IMPLEMENTED", note: "Blocker & dependency intelligence." },
  { code: "S3", name: "HASTANTARAN", group: "Software", module: "PATHPURAVA · Handover", status: "IMPLEMENTED", note: "Officer handover pack." },
  { code: "S4", name: "Seva Ghadyal SLA", group: "Software", module: "Services", status: "SIMULATED", note: "SLA monitoring demo." },
  { code: "S5", name: "Malmatta Dekhbhal", group: "Software", module: "NIGAA", status: "IMPLEMENTED", note: "Asset maintenance layer." },
  { code: "S6", name: "Abhisaran Naksha", group: "Software", module: "Convergence", status: "IMPLEMENTED", note: "Execution sequencing." },
  { code: "S7", name: "Sanstha Sakshamikaran", group: "Software", module: "Institutions Workspace", status: "IMPLEMENTED", note: "Institution operational workspace." },
  { code: "S8", name: "Hangami Sajjata", group: "Software", module: "Seasonal", status: "IMPLEMENTED", note: "Seasonal readiness cycles." },
  { code: "S9", name: "Audit Para Accelerator", group: "Software", module: "PATHPURAVA (referenced)", status: "GOVT_EQUIVALENT", note: "Not a separate product; audit obligations referenced in PATHPURAVA. AuditOnline is source of truth." },
  { code: "S10", name: "UC Tracker", group: "Software", module: "PATHPURAVA · UC Follow-up", status: "IMPLEMENTED", note: "Operational follow-up only." },
  { code: "S11", name: "GP File Flow", group: "Software", module: "GP File Flow", status: "IMPLEMENTED", note: "New module (v2). Not an eOffice replacement." },
  { code: "S12", name: "Mahsul Sandhi", group: "Software", module: "Mahsul Sandhi", status: "IMPLEMENTED", note: "New module (v2). SAMARTH adoption checklist, not a tax engine." },
  { code: "S13", name: "Process Improvement Lab", group: "Software", module: "Process Improvement Lab", status: "IMPLEMENTED", note: "New module (v2). Improvement measurement practice." },
  { code: "S14", name: "Complaint Routing", group: "Software", module: "Complaint Routing", status: "IMPLEMENTED", note: "New module (v2). Internal routing; external needs official coordination." },
  { code: "S15", name: "Fund Convergence View", group: "Software", module: "Convergence", status: "SIMULATED", note: "Read-only reference; official finance stays in Govt systems." },

  // ---- 10 Mobile concepts ----
  { code: "M1", name: "PATHPURAVA Mobile Inbox", group: "Mobile", module: "PATHPURAVA (responsive/PWA)", status: "IMPLEMENTED", note: "Responsive field view." },
  { code: "M2", name: "Aawaj Nond (Voice)", group: "Mobile", module: "Voice Status", status: "IMPLEMENTED", note: "New (v2). Web Speech + simulated fallback." },
  { code: "M3", name: "Seasonal Checklist", group: "Mobile", module: "Seasonal", status: "IMPLEMENTED", note: "Mobile seasonal view." },
  { code: "M4", name: "QR Asset Check", group: "Mobile", module: "NIGAA", status: "SIMULATED", note: "Camera opens (BarcodeDetector/getUserMedia) with simulated demo asset selection; decode not wired to printed codes." },
  { code: "M5", name: "Shramdaan Mobile Companion", group: "Mobile", module: "Participation", status: "IMPLEMENTED", note: "Responsive participation." },
  { code: "M6", name: "SHG Reporting", group: "Mobile", module: "Institutions", status: "GOVT_EQUIVALENT", note: "No UMED duplication; institution actions only." },
  { code: "M7", name: "Sarpanch Dashboard", group: "Mobile", module: "Sarpanch Dashboard", status: "IMPLEMENTED", note: "Responsive Sarpanch view." },
  { code: "M8", name: "SMS / WhatsApp", group: "Mobile", module: "Communication Preview", status: "SIMULATED", note: "Both SMS and WhatsApp preview screens; no real messages sent." },
  { code: "M9", name: "Offline Data Collection", group: "Mobile", module: "PWA / Offline Shell + Queue", status: "IMPLEMENTED", note: "Service worker shell + local offline mutation queue (SYNC_PENDING → SYNCED_DEMO). No Government server sync." },
  { code: "M10", name: "Handover Mobile View", group: "Mobile", module: "HASTANTARAN", status: "IMPLEMENTED", note: "Responsive handover view." },
];

export const STATUS_META: Record<MappingStatus, { label: string; tone: "green" | "blue" | "amber" | "violet" | "slate" | "red" }> = {
  IMPLEMENTED: { label: "Implemented as Module", tone: "green" },
  MERGED: { label: "Merged into Module", tone: "blue" },
  SIMULATED: { label: "Simulated", tone: "amber" },
  VALIDATION_REQUIRED: { label: "Validation Required", tone: "violet" },
  GOVT_EQUIVALENT: { label: "Govt Has Equivalent", tone: "slate" },
  DEFERRED: { label: "Deferred", tone: "red" },
};
