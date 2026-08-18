import {
  AppNotification,
  Asset,
  AuditLog,
  ConvergenceProject,
  DemoState,
  GramSabhaDecision,
  GramSabhaMeeting,
  Handover,
  InnovationChallenge,
  InnovationEntry,
  Obligation,
  ParticipationActivity,
  RepairTicket,
  SeasonalTask,
  ServiceApplication,
  UCFollowUp,
  VillageInstitution,
  Volunteer,
  RoleId,
  GpFile,
  Complaint,
  AdoptionRecord,
  ProcessExperiment,
} from "@/types";
import { BLOCKS, GPS, PILOT_GPS } from "./hierarchy";
import { USERS } from "./users";
import { getDistrictOperationalMetrics } from "@/utils/selectors";

export const DEMO_VERSION = 5;

// Deterministic date helper anchored to a fixed base so SSR == CSR.
const BASE = new Date("2026-08-17T00:00:00Z").getTime();
const DAY = 86400000;
export function d(offsetDays: number): string {
  return new Date(BASE + offsetDays * DAY).toISOString();
}
export function today() {
  return new Date(BASE).toISOString();
}

// Deterministic pseudo-random in [0,1) from an integer seed.
function rnd(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(rnd(seed) * arr.length)];
}

const PILOT_IDS = PILOT_GPS.map((g) => g.id);
const YAVATMAL = "b-yavatmal";

// ============================================================================
// OBLIGATIONS (PATHPURAVA)
// ============================================================================
const obligations: Obligation[] = [];

function tl(actor: string, role: RoleId, action: string, offset: number, extra?: Partial<{ fromStatus: string; toStatus: string; comment: string }>) {
  return {
    id: `tl-${Math.floor(rnd(offset * 7.7) * 1e9)}`,
    ts: d(offset),
    actor,
    actorRole: role,
    action,
    ...extra,
  };
}

// --- Flagship scenario: pre-monsoon inspection blocked by Technical Sanction across all 5 pilot GPs ---
PILOT_GPS.forEach((gp, i) => {
  const blocked = i < 4; // 4 of 5 blocked -> systemic
  obligations.push({
    id: `OBL-PM-${100 + i}`,
    title: "Complete pre-monsoon drainage & culvert inspection",
    titleMr: "पावसाळापूर्व नाले व मोरी तपासणी पूर्ण करा",
    description:
      "As per District Circular, all selected GPs must complete pre-monsoon inspection of drainage lines, culverts and vulnerable assets, and submit evidence before 15 May.",
    sourceType: "Circular",
    source: { system: "Government GR", referenceId: "ZP/YVT/PM-CIRC/2026/214", documentName: "Pre-Monsoon Readiness Circular", date: d(-40) },
    scope: "gp",
    districtId: "d-yvt",
    blockId: gp.blockId,
    gpId: gp.id,
    departmentId: "dept-engineering",
    responsibleRole: "gram_sevak",
    assignedUserId: gp.id === "gp-borgaon" ? "u-gramsevak" : gp.id === "gp-lohara" ? "u-gramsevak2" : undefined,
    createdOn: d(-38),
    dueDate: d(-4),
    priority: "HIGH",
    status: blocked ? "BLOCKED" : "UNDER_REVIEW",
    blockers: blocked
      ? [{ id: `blk-pm-${i}`, category: "Technical Sanction Pending", note: "Culvert repair estimate awaiting technical sanction from Sub-Division.", raisedBy: "Demo Gram Sevak", raisedOn: d(-12) }]
      : [],
    dependencyIds: [],
    lastActivity: d(blocked ? -6 : -2),
    evidence: blocked ? [] : [{ id: `ev-pm-${i}`, name: "inspection_photos.zip", type: "photo", uploadedBy: "Demo Gram Sevak (B)", uploadedOn: d(-3) }],
    reviewStatus: blocked ? undefined : "pending",
    escalationLevel: blocked ? 1 : 0,
    classification: "INTERNAL",
    publishedPublic: true,
    timeline: [
      tl("System (Aadesh-te-Kruti)", "sysadmin", "Obligation created from circular", -38, { toStatus: "NEW" }),
      tl("Demo Extension Officer", "extension_officer", "Assigned to GP", -37, { fromStatus: "NEW", toStatus: "ASSIGNED" }),
      ...(blocked
        ? [tl("Demo Gram Sevak", "gram_sevak", "Marked blocked", -12, { fromStatus: "IN_PROGRESS", toStatus: "BLOCKED", comment: "Technical sanction pending" })]
        : [tl("Demo Gram Sevak (B)", "gram_sevak", "Submitted for review", -3, { fromStatus: "IN_PROGRESS", toStatus: "UNDER_REVIEW" })]),
    ],
  });
});

// --- Other varied obligations across pilot GPs and blocks ---
const SOURCE_TYPES = [
  "Government Resolution", "Department Order", "Meeting Decision", "Gram Sabha Resolution",
  "Audit Para", "Utilisation Certificate Deadline", "Scheme Deadline", "Seasonal Duty",
] as const;
const SOURCE_SYSTEMS = ["eGramSwaraj", "AuditOnline", "SAMARTH", "Panchayat NIRNAY", "JJM", "ZPFMS", "Government GR"] as const;
const STATUSES = ["NEW", "ASSIGNED", "IN_PROGRESS", "WAITING", "BLOCKED", "UNDER_REVIEW", "RETURNED", "COMPLETED", "VERIFIED", "OVERDUE"] as const;
const BLOCKER_CATS = ["Technical Sanction Pending", "Fund Release Pending", "Other Department Pending", "Gram Sabha Required", "Material Pending", "Contractor Delay", "Staff Vacancy", "Document Pending"] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const TITLES: [string, string][] = [
  ["Submit Utilisation Certificate for 15th FC works", "१५ व्या वित्त आयोग कामांचे उपयोगिता प्रमाणपत्र सादर करा"],
  ["Rectify audit para on stock register", "साठा नोंदवही लेखापरीक्षण मुद्दा दुरुस्त करा"],
  ["Complete JJM tap connection verification", "जल जीवन मिशन नळ जोडणी पडताळणी पूर्ण करा"],
  ["Update village asset register in Gram Manchitra", "ग्राम मंचित्र मध्ये मालमत्ता नोंद अद्ययावत करा"],
  ["Action Gram Sabha resolution on street lighting", "पथदिवे ठरावावर कार्यवाही करा"],
  ["Prepare monsoon contingency plan", "पावसाळी आपत्कालीन आराखडा तयार करा"],
  ["Verify MGNREGA muster and work site", "मनरेगा हजेरी व कामाची पडताळणी करा"],
  ["Clear pendency in birth & death registration", "जन्म-मृत्यू नोंदणी प्रलंबितता निकाली काढा"],
  ["Submit swachhata drive completion report", "स्वच्छता मोहीम पूर्तता अहवाल सादर करा"],
  ["Reconcile property tax demand register", "मालमत्ता कर मागणी नोंदवही ताळमेळ करा"],
];

let oc = 200;
BLOCKS.forEach((b, bi) => {
  const gpsInB = GPS.filter((g) => g.blockId === b.id);
  const perBlock = b.id === YAVATMAL ? 8 : 3;
  for (let i = 0; i < perBlock; i++) {
    const s = oc * 3 + i * 11 + bi;
    const gp = pick(gpsInB, s);
    const status = pick([...STATUSES], s + 1);
    const isBlocked = status === "BLOCKED";
    const isDone = status === "COMPLETED" || status === "VERIFIED";
    const due = Math.floor(rnd(s + 2) * 60) - 30;
    const [title, titleMr] = TITLES[(oc + i) % TITLES.length];
    obligations.push({
      id: `OBL-${oc++}`,
      title,
      titleMr,
      description: "Obligation tracked from an authorised source. Government system remains the source of truth for the underlying record.",
      sourceType: pick([...SOURCE_TYPES], s + 3),
      source: { system: pick([...SOURCE_SYSTEMS], s + 4), referenceId: `REF/${b.name.slice(0, 3).toUpperCase()}/${1000 + oc}`, date: d(due - 20) },
      scope: "gp",
      districtId: "d-yvt",
      blockId: b.id,
      gpId: gp.id,
      departmentId: pick(["dept-water", "dept-engineering", "dept-mgnrega", "dept-health", "dept-panchayat"], s + 5),
      responsibleRole: "gram_sevak",
      createdOn: d(due - 25),
      dueDate: d(due),
      priority: pick([...PRIORITIES], s + 6),
      status: status === "OVERDUE" && due > 0 ? "IN_PROGRESS" : status,
      blockers: isBlocked ? [{ id: `blk-${oc}`, category: pick([...BLOCKER_CATS], s + 7), note: "Awaiting external clearance.", raisedBy: "Gram Sevak", raisedOn: d(due - 10) }] : [],
      lastActivity: d(Math.min(0, due + 2)),
      evidence: isDone ? [{ id: `ev-${oc}`, name: "completion_report.pdf", type: "document", uploadedBy: "Gram Sevak", uploadedOn: d(due + 1) }] : [],
      reviewStatus: status === "UNDER_REVIEW" ? "pending" : isDone ? "approved" : undefined,
      escalationLevel: isBlocked ? 1 : 0,
      completionDate: isDone ? d(due + 1) : undefined,
      classification: "INTERNAL",
      publishedPublic: isDone,
      timeline: [tl("Extension Officer", "extension_officer", "Assigned", due - 24, { toStatus: "ASSIGNED" })],
    });
  }
});

// Mark overdue: in-progress/assigned past due
obligations.forEach((o) => {
  const dueMs = new Date(o.dueDate).getTime();
  if (dueMs < BASE && ["ASSIGNED", "IN_PROGRESS", "WAITING", "NEW"].includes(o.status)) {
    o.status = "OVERDUE";
  }
});

// ============================================================================
// ASSETS (NIGAA)
// ============================================================================
const assets: Asset[] = [];
const ASSET_TYPES = ["Hand Pump", "Borewell", "Water Tank", "Pipeline", "Public Toilet", "Waste Facility", "Drainage Asset", "Streetlight", "Plantation Site", "School Facility"] as const;
const CONDITIONS = ["FUNCTIONAL", "FUNCTIONAL", "FUNCTIONAL", "PARTIALLY_FUNCTIONAL", "NON_FUNCTIONAL", "UNDER_REPAIR", "CHECK_DUE"] as const;

let ac = 1;
// Flagship asset: HP-018 in Borgaon (starts FUNCTIONAL for the demo workflow)
assets.push({
  id: "asset-hp018",
  code: "HP-018",
  name: "Hand Pump — Zilla Parishad School, Borgaon",
  type: "Hand Pump",
  govAssetRef: "GM/YVT/BOR/HP/018",
  sourceSystem: "Gram Manchitra",
  districtId: "d-yvt",
  blockId: "b-yavatmal",
  gpId: "gp-borgaon",
  condition: "FUNCTIONAL",
  lastChecked: d(-20),
  checkedBy: "Demo VWSC Member",
  nextCheck: d(10),
  gps: { lat: 20.388, lng: 78.121 },
  repeatedFailureCount: 1,
  classification: "PUBLIC",
  publishedPublic: true,
  inspections: [
    { id: "insp-hp018-1", ts: d(-20), by: "Demo VWSC Member", byRole: "vwsc_member", condition: "FUNCTIONAL", note: "Routine quarterly check — OK." },
  ],
});

PILOT_GPS.forEach((gp, gi) => {
  for (let i = 0; i < 8; i++) {
    const s = gi * 50 + i * 7 + 3;
    const type = ASSET_TYPES[(gi + i) % ASSET_TYPES.length];
    const cond = pick([...CONDITIONS], s);
    const isPlant = type === "Plantation Site";
    assets.push({
      id: `asset-${gp.id}-${i}`,
      code: `${type.slice(0, 2).toUpperCase()}-${100 + ac}`,
      name: `${type} #${ac} — ${gp.name}`,
      type,
      govAssetRef: `GM/YVT/${gp.name.slice(0, 3).toUpperCase()}/${1000 + ac}`,
      sourceSystem: pick(["Gram Manchitra", "eGramSwaraj", "JJM"], s + 1),
      districtId: "d-yvt",
      blockId: gp.blockId,
      gpId: gp.id,
      condition: cond,
      lastChecked: d(-Math.floor(rnd(s + 2) * 60)),
      checkedBy: pick(["Demo VWSC Member", "Demo Gram Sevak", "Demo Junior Engineer"], s + 3),
      nextCheck: d(Math.floor(rnd(s + 4) * 40)),
      gps: { lat: 20.3 + rnd(s + 5) * 0.4, lng: 78.0 + rnd(s + 6) * 0.4 },
      issue: cond === "NON_FUNCTIONAL" || cond === "UNDER_REPAIR" ? "Reported not working by field check." : undefined,
      repairRequired: cond === "NON_FUNCTIONAL",
      repeatedFailureCount: Math.floor(rnd(s + 7) * 3),
      classification: "PUBLIC",
      publishedPublic: true,
      plantedCount: isPlant ? 500 + Math.floor(rnd(s + 8) * 500) : undefined,
      survivingCount: isPlant ? 300 + Math.floor(rnd(s + 9) * 300) : undefined,
      lastSurvivalCheck: isPlant ? d(-15) : undefined,
      inspections: [{ id: `insp-${ac}`, ts: d(-Math.floor(rnd(s + 2) * 60)), by: "Field check", byRole: "vwsc_member", condition: cond }],
    });
    ac++;
  }
});

// A few assets in other blocks for aggregation
BLOCKS.filter((b) => b.id !== YAVATMAL).forEach((b, bi) => {
  const gp = GPS.find((g) => g.blockId === b.id)!;
  for (let i = 0; i < 2; i++) {
    const s = 500 + bi * 13 + i;
    const type = ASSET_TYPES[(bi + i) % ASSET_TYPES.length];
    const cond = pick([...CONDITIONS], s);
    assets.push({
      id: `asset-${b.id}-${i}`,
      code: `${type.slice(0, 2).toUpperCase()}-${300 + ac}`,
      name: `${type} — ${gp.name}`,
      type,
      districtId: "d-yvt",
      blockId: b.id,
      gpId: gp.id,
      condition: cond,
      lastChecked: d(-Math.floor(rnd(s) * 60)),
      repeatedFailureCount: 0,
      classification: "PUBLIC",
      publishedPublic: true,
      inspections: [],
    });
    ac++;
  }
});

// ============================================================================
// REPAIR TICKETS
// ============================================================================
const repairs: RepairTicket[] = [];
const REPAIR_STATUSES = ["REPORTED", "ASSIGNED", "INSPECTED", "REPAIR_IN_PROGRESS", "REPAIR_CLAIMED_COMPLETE", "VERIFICATION_PENDING", "VERIFIED", "CLOSED"] as const;
const nonFunc = assets.filter((a) => a.condition === "NON_FUNCTIONAL" || a.condition === "UNDER_REPAIR");
nonFunc.slice(0, 15).forEach((a, i) => {
  const s = i * 9 + 1;
  const st = pick([...REPAIR_STATUSES], s);
  const reported = -Math.floor(rnd(s + 1) * 45) - 3;
  repairs.push({
    id: `RT-${500 + i}`,
    assetId: a.id,
    assetCode: a.code,
    assetName: a.name,
    districtId: a.districtId,
    blockId: a.blockId,
    gpId: a.gpId,
    reportedBy: "Demo VWSC Member",
    reportedOn: d(reported),
    issue: pick(["No water discharge", "Broken platform", "Leaking pipeline", "Motor burnt", "Structure damaged", "Choked drain"], s + 2),
    priority: pick([...PRIORITIES], s + 3),
    status: st,
    assignedToRole: "je",
    assignedToUserId: "u-je",
    ageDays: Math.abs(reported),
    timeline: [tl("Demo VWSC Member", "vwsc_member", "Reported", reported, { toStatus: "REPORTED" })],
  });
});

// ============================================================================
// SEASONAL TASKS
// ============================================================================
const seasonalTasks: SeasonalTask[] = [];
const SEASON_TASKS: [string, string][] = [
  ["Water source checked & chlorinated", "पाणी स्रोत तपासणी व क्लोरीनेशन"],
  ["Drains cleared before monsoon", "पावसाळ्यापूर्वी नाले सफाई"],
  ["Tanker contingency reviewed", "टँकर आपत्कालीन नियोजन आढावा"],
  ["Vulnerable assets checked", "जोखीमग्रस्त मालमत्ता तपासणी"],
  ["Public toilets checked", "सार्वजनिक शौचालय तपासणी"],
  ["School repairs reviewed", "शाळा दुरुस्ती आढावा"],
  ["Plantation watering confirmed", "वृक्ष पाणी जबाबदारी निश्चित"],
  ["Waste collection points reviewed", "कचरा संकलन बिंदू आढावा"],
];
const CYCLES = ["PRE_SUMMER", "PRE_MONSOON", "MONSOON", "POST_MONSOON", "SANITATION_DRIVE", "SCHOOL_REOPENING"] as const;
let sc = 1;
PILOT_GPS.forEach((gp, gi) => {
  for (let i = 0; i < 5; i++) {
    const s = gi * 40 + i * 5 + 2;
    const [title, titleMr] = SEASON_TASKS[(gi + i) % SEASON_TASKS.length];
    const due = Math.floor(rnd(s) * 30) - 10;
    const st = pick(["PENDING", "IN_PROGRESS", "DONE", "DONE"] as const, s + 1);
    seasonalTasks.push({
      id: `SEA-${sc++}`,
      cycle: pick([...CYCLES], s + 2),
      title,
      titleMr,
      districtId: "d-yvt",
      blockId: gp.blockId,
      gpId: gp.id,
      assignedRole: pick(["gram_sevak", "vwsc_member", "je"] as RoleId[], s + 3),
      dueDate: d(due),
      status: due < 0 && st !== "DONE" ? "OVERDUE" : st,
      completedOn: st === "DONE" ? d(due - 1) : undefined,
    });
  }
});

// ============================================================================
// SERVICE APPLICATIONS (SEVA GHADYAL)
// ============================================================================
const services: ServiceApplication[] = [];
const SERVICES: [string, string][] = [
  ["Birth Certificate", "जन्म दाखला"],
  ["Death Certificate", "मृत्यू दाखला"],
  ["Marriage Registration", "विवाह नोंदणी"],
  ["Property Tax Assessment", "मालमत्ता कर आकारणी"],
  ["Water Connection", "नळ जोडणी"],
  ["Trade / NOC Certificate", "व्यवसाय ना-हरकत दाखला"],
  ["Building Permission", "बांधकाम परवानगी"],
];
const SERVICE_STAGES = ["Application received", "Document verification", "Field inspection", "Desk approval", "Ready for issue"];
let svc = 1;
PILOT_GPS.forEach((gp, gi) => {
  for (let i = 0; i < 5; i++) {
    const s = gi * 30 + i * 4 + 5;
    const received = -Math.floor(rnd(s) * 25) - 2;
    const expected = received + 15;
    const status = pick(["RECEIVED", "IN_PROGRESS", "PENDING_DOCS", "COMPLETED", "COMPLETED"] as const, s + 1);
    const elapsed = Math.abs(received);
    const [service, serviceMr] = SERVICES[(gi + i) % SERVICES.length];
    services.push({
      id: `SVC-${svc++}`,
      service,
      serviceMr,
      citizenName: pick(["Demo Applicant 1", "Demo Applicant 2", "Demo Applicant 3", "Demo Applicant 4"], s + 2),
      districtId: "d-yvt",
      blockId: gp.blockId,
      gpId: gp.id,
      receivedDate: d(received),
      expectedDate: d(expected),
      stage: pick(SERVICE_STAGES, s + 3),
      responsibleDesk: "GP Front Desk",
      status,
      daysElapsed: elapsed,
      overdue: expected < 0 && status !== "COMPLETED",
      classification: "INTERNAL",
    });
  }
});

// ============================================================================
// GRAM SABHA
// ============================================================================
const gramSabhaDecisions: GramSabhaDecision[] = [];
const gramSabhaMeetings: GramSabhaMeeting[] = [];
const GS_DECISIONS: [string, string][] = [
  ["Install 12 new LED street lights on main road", "मुख्य रस्त्यावर १२ नवीन एलईडी पथदिवे बसवा"],
  ["Repair approach road to primary school", "प्राथमिक शाळेकडील रस्ता दुरुस्ती"],
  ["Clean and desilt village pond before monsoon", "पावसाळ्यापूर्वी गाव तलाव सफाई व गाळ काढणे"],
  ["Provide separate girls' toilet at school", "शाळेत मुलींसाठी स्वतंत्र स्वच्छतागृह"],
  ["Extend piped water supply to new ward", "नवीन वॉर्डला नळ पाणीपुरवठा विस्तार"],
  ["Set up waste segregation at community hall", "समाज मंदिरात कचरा वर्गीकरण व्यवस्था"],
  ["Sanction shed for weekly market", "आठवडी बाजारासाठी शेड मंजूर"],
  ["Repair anganwadi building roof", "अंगणवाडी छत दुरुस्ती"],
];
let dcx = 1;
PILOT_GPS.forEach((gp, gi) => {
  const decisionIds: string[] = [];
  for (let i = 0; i < 2; i++) {
    const s = gi * 20 + i * 3 + 1;
    const [decision, decisionMr] = GS_DECISIONS[(gi * 2 + i) % GS_DECISIONS.length];
    const st = pick(["PENDING", "IN_PROGRESS", "COMPLETED"] as const, s);
    const id = `GSD-${dcx++}`;
    decisionIds.push(id);
    gramSabhaDecisions.push({
      id,
      meetingId: `GSM-${gp.id}-prev`,
      decision,
      decisionMr,
      date: d(-60 + gi * 3),
      status: st,
      department: pick(["dept-water", "dept-engineering", "dept-panchayat"], s + 1),
      dueDate: d(20 + i * 10),
      completedDate: st === "COMPLETED" ? d(-10) : undefined,
      actionTaken: st === "COMPLETED" ? "Work completed and verified by GP." : st === "IN_PROGRESS" ? "Work under execution." : "Awaiting technical estimate.",
      classification: "PUBLIC",
      publishedPublic: true,
    });
  }
  gramSabhaMeetings.push({
    id: `GSM-${gp.id}-prev`,
    districtId: "d-yvt",
    blockId: gp.blockId,
    gpId: gp.id,
    type: "previous",
    date: d(-60 + gi * 3),
    noticeDate: d(-67 + gi * 3),
    attendance: 120 + gi * 15,
    quorumRequired: 100,
    quorumMet: true,
    departmentsInvited: ["Water & Sanitation", "Engineering", "Health"],
    departmentsAttended: gi % 2 === 0 ? ["Water & Sanitation", "Engineering"] : ["Water & Sanitation", "Engineering", "Health"],
    decisions: decisionIds,
  });
  gramSabhaMeetings.push({
    id: `GSM-${gp.id}-next`,
    districtId: "d-yvt",
    blockId: gp.blockId,
    gpId: gp.id,
    type: "upcoming",
    date: d(15 + gi * 2),
    noticeDate: d(8 + gi * 2),
    attendance: 0,
    quorumRequired: 100,
    quorumMet: false,
    departmentsInvited: ["Water & Sanitation", "Engineering", "Health", "Agriculture"],
    departmentsAttended: [],
    decisions: [],
  });
});

// ============================================================================
// INSTITUTIONS
// ============================================================================
const institutions: VillageInstitution[] = [];
const INST: { name: string; cat: any }[] = [
  { name: "Village Water & Sanitation Committee", cat: "VWSC" },
  { name: "Demo Self Help Group", cat: "SHG" },
  { name: "Village Organisation (UMED)", cat: "Village Organisation" },
  { name: "School Management Committee", cat: "School Management Committee" },
  { name: "Health & Sanitation Committee", cat: "Health/Sanitation Committee" },
  { name: "Yuva Mandal (Youth Group)", cat: "Youth Group" },
  { name: "Shetkari Gat (Farmer Group)", cat: "Farmer Group" },
];
let ix = 1;
PILOT_GPS.forEach((gp, gi) => {
  INST.forEach((inst, i) => {
    const s = gi * 15 + i * 2 + 1;
    const assigned = 2 + Math.floor(rnd(s) * 4);
    const completed = Math.floor(rnd(s + 1) * (assigned + 1));
    institutions.push({
      id: `INST-${ix++}`,
      name: `${inst.name} — ${gp.name}`,
      category: inst.cat,
      districtId: "d-yvt",
      blockId: gp.blockId,
      gpId: gp.id,
      chairContact: pick(["Demo Chairperson", "Demo Secretary", "Demo Convener"], s + 2),
      responsibility: inst.cat === "VWSC" ? "Quarterly water asset checks & sanitation readiness" : "Assigned community activities",
      lastMeeting: d(-Math.floor(rnd(s + 3) * 40)),
      nextMeeting: d(Math.floor(rnd(s + 4) * 30)),
      status: completed < assigned && rnd(s + 5) > 0.6 ? "attention" : "active",
      assignedTasks: assigned,
      completedTasks: completed,
    });
  });
});

// ============================================================================
// PARTICIPATION
// ============================================================================
const volunteers: Volunteer[] = [
  { id: "vol-akash", userId: "u-volunteer", name: "Demo Volunteer", skills: ["Labour", "Driving"], totalHours: 24, activitiesJoined: ["ACT-1"] },
  { id: "vol-1", name: "Demo Volunteer 1", skills: ["Labour"], totalHours: 12, activitiesJoined: ["ACT-1"] },
  { id: "vol-2", name: "Demo Volunteer 2", skills: ["Skill", "Masonry"], totalHours: 30, activitiesJoined: ["ACT-2"] },
  { id: "vol-3", name: "Demo Volunteer 3", skills: ["Equipment", "Tractor"], totalHours: 8, activitiesJoined: [] },
];
const activities: ParticipationActivity[] = [
  {
    id: "ACT-1",
    title: "Village Pond Cleaning Drive",
    titleMr: "गाव तलाव स्वच्छता मोहीम",
    districtId: "d-yvt",
    blockId: "b-yavatmal",
    gpId: "gp-borgaon",
    date: d(6),
    status: "OPEN",
    needsVolunteers: 30,
    registeredVolunteers: ["Demo Volunteer", "Demo Volunteer 1"],
    needs: ["30 volunteers", "2 tractor hours", "10 tools", "drinking water support"],
    contributionTypes: ["Labour", "Equipment", "Material", "Service"],
    classification: "PUBLIC",
    publishedPublic: true,
  },
  {
    id: "ACT-2",
    title: "Tree Plantation — School Compound",
    titleMr: "वृक्षारोपण — शाळा परिसर",
    districtId: "d-yvt",
    blockId: "b-yavatmal",
    gpId: "gp-lohara",
    date: d(-20),
    status: "COMPLETED",
    needsVolunteers: 25,
    registeredVolunteers: ["Demo Volunteer 2", "Demo Volunteer 3", "Demo Volunteer"],
    needs: ["25 volunteers", "200 saplings", "watering support"],
    contributionTypes: ["Labour", "Material"],
    verifiedHours: 180,
    impact: "200 saplings planted; 25 volunteers; watering roster assigned to Yuva Mandal.",
    classification: "PUBLIC",
    publishedPublic: true,
  },
  {
    id: "ACT-3",
    title: "Anganwadi Wall Painting",
    titleMr: "अंगणवाडी रंगरंगोटी",
    districtId: "d-yvt",
    blockId: "b-yavatmal",
    gpId: "gp-waghapur",
    date: d(12),
    status: "OPEN",
    needsVolunteers: 15,
    registeredVolunteers: [],
    needs: ["15 volunteers", "paint & brushes"],
    contributionTypes: ["Labour", "Skill", "Material"],
    classification: "PUBLIC",
    publishedPublic: true,
  },
  {
    id: "ACT-4",
    title: "Drain Cleaning Shramdaan",
    titleMr: "नाले सफाई श्रमदान",
    districtId: "d-yvt",
    blockId: "b-yavatmal",
    gpId: "gp-pimpalgaon",
    date: d(-5),
    status: "IN_PROGRESS",
    needsVolunteers: 20,
    registeredVolunteers: ["Demo Volunteer 1"],
    needs: ["20 volunteers", "desilting tools"],
    contributionTypes: ["Labour", "Equipment"],
    classification: "PUBLIC",
    publishedPublic: true,
  },
];

// ============================================================================
// INNOVATION
// ============================================================================
const innovations: InnovationEntry[] = [
  {
    id: "INN-1",
    title: "Community Chlorination Roster for Summer",
    problem: "Water sources not chlorinated consistently before summer leading to health risk.",
    solution: "VWSC-led weekly chlorination roster with photo evidence and SMS reminders.",
    steps: ["Map all water sources", "Assign VWSC members weekly", "Photo evidence on each visit", "GP reviews weekly"],
    responsibleRoles: ["vwsc_member", "gram_sevak"],
    timeframe: "2 weeks setup, ongoing",
    resources: "Chlorine tablets, register, phone camera",
    ruleReference: "JJM operational guidelines",
    obstacles: "Volunteer availability",
    outcome: "100% sources chlorinated weekly; zero waterborne complaints in pilot.",
    replicationChecklist: ["Source list ready", "Roster assigned", "Evidence workflow enabled", "Weekly review scheduled"],
  },
  {
    id: "INN-2",
    title: "QR-based Handpump Status Tracking",
    problem: "Non-functional handpumps not reported quickly.",
    solution: "QR sticker on each pump; anyone scans to report status instantly.",
    steps: ["Generate QR per asset", "Paste on asset", "Citizen/VWSC scans & reports", "Auto-ticket to JE"],
    responsibleRoles: ["je", "gram_sevak", "vwsc_member"],
    timeframe: "1 week",
    resources: "QR stickers, platform",
    outcome: "Repair reporting time reduced from 9 days to under 2 days.",
    replicationChecklist: ["QR codes printed", "Assets tagged", "Reporting tested", "JE routing enabled"],
  },
  {
    id: "INN-3",
    title: "Pre-Monsoon 10-Point Village Drill",
    problem: "Monsoon readiness incomplete and uneven across GPs.",
    solution: "Standard 10-point checklist executed by every GP with block dashboard tracking.",
    steps: ["Publish checklist", "Assign owners", "Weekly readiness %", "Block review"],
    responsibleRoles: ["gram_sevak", "bdo"],
    timeframe: "3 weeks",
    resources: "Checklist template",
    outcome: "Block readiness reached 92% vs 61% previous year.",
    replicationChecklist: ["Checklist adopted", "Owners assigned", "Tracking enabled"],
  },
  {
    id: "INN-4",
    title: "SHG-run Sanitation Micro-enterprise",
    problem: "Waste collection irregular; SHGs seeking income.",
    solution: "SHG contracted for door-to-door collection with user fee and GP oversight.",
    steps: ["Identify SHG", "Define route & fee", "GP MoU", "Monthly review"],
    responsibleRoles: ["shg_rep", "gram_sevak"],
    timeframe: "1 month",
    resources: "Collection cart, SHG",
    outcome: "Daily collection in 3 wards; SHG income generated.",
    replicationChecklist: ["SHG identified", "Route defined", "Oversight enabled"],
  },
  {
    id: "INN-5",
    title: "Officer Handover Digital Checklist",
    problem: "Continuity lost on transfers; pending matters dropped.",
    solution: "Auto-generated handover pack of open obligations, blockers, deadlines.",
    steps: ["Mark officer transferred", "System generates pack", "Incoming officer accepts", "Remarks recorded"],
    responsibleRoles: ["gram_sevak", "bdo"],
    timeframe: "Immediate",
    resources: "Platform only",
    outcome: "Zero dropped obligations across pilot transfers.",
    replicationChecklist: ["Handover enabled", "Acceptance workflow tested"],
  },
];

const challenges: InnovationChallenge[] = [
  {
    id: "CHL-1",
    title: "Summer Water Readiness Challenge 2026",
    question: "How can summer water readiness be improved in water-stressed GPs?",
    status: "REVIEW",
    createdBy: "Demo Deputy CEO",
    submissions: [
      { id: "sub-1", title: "Solar dual-pump backup", problem: "Power cuts stop pumping", solution: "Solar backup on critical pumps", expectedResult: "Uninterrupted supply", by: "Gram Sevak, Lohara", stage: "shortlisted" },
      { id: "sub-2", title: "Rooftop rain harvest at schools", problem: "Falling groundwater", solution: "Harvest structures at 12 schools", expectedResult: "Recharge + storage", by: "JE, Yavatmal", stage: "selected" },
      { id: "sub-3", title: "Community water budgeting", problem: "Over-use in early summer", solution: "Ward-level water budget board", expectedResult: "Rationing awareness", by: "SHG, Borgaon", stage: "submitted" },
    ],
  },
];

// ============================================================================
// HANDOVERS
// ============================================================================
const handovers: Handover[] = [
  {
    // Flagship pending handover for the primary Gram Sevak login (u-gramsevak,
    // gpId gp-borgaon) — they ARE the designated incoming officer and can accept.
    id: "HND-1",
    outgoingUserId: "u-departed-borgaon",
    outgoingName: "Outgoing Gram Sevak (departed)",
    incomingUserId: "u-gramsevak",
    incomingName: "Demo Gram Sevak",
    gpId: "gp-borgaon",
    blockId: "b-yavatmal",
    districtId: "d-yvt",
    reason: "transferred",
    status: "AWAITING_ACCEPTANCE",
    generatedOn: d(-2),
    openObligations: 6,
    overdueMatters: 2,
    activeBlockers: 3,
    pendingAudit: 1,
    pendingUC: 2,
    seasonalResponsibilities: 4,
    keyDecisions: ["Pond desilting (Gram Sabha)", "Street light installation pending sanction"],
    keyContacts: ["JE: Demo Junior Engineer", "Extension Officer: Demo Extension Officer"],
    nextDeadlines: ["Pre-monsoon inspection — 15 May", "UC for FC works — 30 May"],
    accepted: false,
  },
  {
    // Second pending handover for the Lohara sevak (u-gramsevak2, gpId gp-lohara).
    id: "HND-2",
    outgoingUserId: "u-departed-lohara",
    outgoingName: "Outgoing Gram Sevak (departed)",
    incomingUserId: "u-gramsevak2",
    incomingName: "Demo Gram Sevak (B)",
    gpId: "gp-lohara",
    blockId: "b-yavatmal",
    districtId: "d-yvt",
    reason: "long_leave",
    status: "AWAITING_ACCEPTANCE",
    generatedOn: d(-3),
    openObligations: 4,
    overdueMatters: 1,
    activeBlockers: 2,
    pendingAudit: 0,
    pendingUC: 1,
    seasonalResponsibilities: 3,
    keyDecisions: ["School toilet repair"],
    keyContacts: ["JE: Demo Junior Engineer"],
    nextDeadlines: ["Quarterly asset check"],
    accepted: false,
  },
];
// Additional ALREADY-ACCEPTED handovers across the remaining pilot GPs (history).
PILOT_GPS.slice(2).forEach((gp, i) => {
  handovers.push({
    id: `HND-${i + 3}`,
    outgoingUserId: `u-departed-${gp.id}`,
    outgoingName: pick(["Outgoing Officer 1", "Outgoing Officer 2", "Outgoing Officer 3"], i),
    incomingUserId: `u-incoming-${gp.id}`,
    incomingName: pick(["Accepted Officer 4", "Accepted Officer 5", "Accepted Officer 6"], i + 1),
    gpId: gp.id,
    blockId: gp.blockId,
    districtId: "d-yvt",
    reason: pick(["transferred", "long_leave", "reassigned"] as const, i),
    status: "ACCEPTED",
    generatedOn: d(-30 - i * 10),
    openObligations: 3 + i,
    overdueMatters: i,
    activeBlockers: 1 + (i % 2),
    pendingAudit: i % 2,
    pendingUC: 1,
    seasonalResponsibilities: 3,
    keyDecisions: ["Water supply extension", "School toilet repair"],
    keyContacts: ["JE: Demo Junior Engineer"],
    nextDeadlines: ["Quarterly asset check"],
    accepted: true,
    acceptedOn: d(-28 - i * 10),
    remarks: "Accepted with note on pending audit para.",
  });
});

// ============================================================================
// UC FOLLOW-UPS
// ============================================================================
const ucFollowUps: UCFollowUp[] = [];
const UC_DEPTS = ["dept-panchayat", "dept-water", "dept-mgnrega", "dept-engineering", "dept-health"] as const;
const UC_VIS = ["DEPARTMENT", "DEPARTMENT", "CROSS_DEPARTMENT", "DISTRICT_SHARED", "DEPARTMENT"] as const;
PILOT_GPS.forEach((gp, i) => {
  ucFollowUps.push({
    id: `UC-${i + 1}`,
    ucRef: `UC/FC15/${gp.name.slice(0, 3).toUpperCase()}/2026/${20 + i}`,
    scheme: pick(["15th Finance Commission", "JJM", "MGNREGA", "ZP Scheme"], i),
    gpId: gp.id,
    blockId: gp.blockId,
    districtId: "d-yvt",
    departmentId: UC_DEPTS[i % UC_DEPTS.length],
    visibilityScope: UC_VIS[i % UC_VIS.length],
    amountRef: `₹ ${(4 + i) * 1.5} Lakh (ref)`,
    dueDate: d(10 + i * 5),
    responsibleRole: "gram_sevak",
    status: pick(["PENDING", "IN_PROGRESS", "BLOCKED", "SUBMITTED"] as const, i + 3),
    blocker: i === 2 ? "Measurement book verification pending" : undefined,
    sourceSystem: "ZPFMS",
  });
});

// ============================================================================
// CONVERGENCE
// ============================================================================
const convergence: ConvergenceProject[] = [
  {
    id: "CVG-1",
    title: "Village Water Work — Borgaon",
    gpId: "gp-borgaon",
    blockId: "b-yavatmal",
    districtId: "d-yvt",
    steps: [
      { order: 1, label: "Technical approval", status: "DONE" },
      { order: 2, label: "MGNREGA labour component", status: "DONE" },
      { order: 3, label: "Material approval", status: "WAITING", waitingOn: "Fund release", since: d(-14) },
      { order: 4, label: "Water department dependency", status: "PENDING" },
      { order: 5, label: "Completion", status: "PENDING" },
    ],
    fundSources: [
      { name: "15th Finance Commission", ref: "FC15/BOR/2026" },
      { name: "MGNREGA", ref: "NREGA/BOR/LAB/88" },
      { name: "JJM", ref: "JJM/BOR/2026" },
    ],
  },
  {
    id: "CVG-2",
    title: "School Sanitation Block — Lohara",
    gpId: "gp-lohara",
    blockId: "b-yavatmal",
    districtId: "d-yvt",
    steps: [
      { order: 1, label: "Technical approval", status: "DONE" },
      { order: 2, label: "Procurement", status: "IN_PROGRESS" },
      { order: 3, label: "Construction", status: "PENDING" },
      { order: 4, label: "Completion", status: "PENDING" },
    ],
    fundSources: [
      { name: "ZP Scheme", ref: "ZP/LOH/SAN/12" },
      { name: "CSR", ref: "CSR/EDU/2026/4" },
    ],
  },
];

// ============================================================================
// NOTIFICATIONS
// ============================================================================
const notifications: AppNotification[] = [
  { id: "NT-1", type: "overdue", title: "Obligation overdue", body: "Pre-monsoon inspection is overdue in 4 GPs.", ts: d(-1), read: false, forRoles: ["gram_sevak", "bdo", "dyceo_panchayat"], gpId: "gp-borgaon", link: "/app/pathpurava", smsPreview: "ZP Yavatmal: Pre-monsoon inspection overdue. Please update status." },
  { id: "NT-2", type: "blocker_escalated", title: "Systemic blocker rising", body: "Technical Sanction is blocking 4 pilot GPs on pre-monsoon works.", ts: d(-1), read: false, forRoles: ["dyceo_panchayat", "ceo"], link: "/app/pathpurava" },
  { id: "NT-3", type: "repair_assigned", title: "Repair assigned", body: "A repair ticket is awaiting your inspection.", ts: d(-2), read: false, forRoles: ["je"], link: "/app/nigaa" },
  { id: "NT-4", type: "handover_generated", title: "Handover ready", body: "Handover pack generated for Borgaon GP. Please accept.", ts: d(-2), read: false, forRoles: ["gram_sevak"], link: "/app/pathpurava" },
  { id: "NT-5", type: "volunteer_activity", title: "New Shramdaan activity", body: "Village Pond Cleaning Drive is open for registration.", ts: d(-3), read: true, forRoles: ["citizen", "volunteer"], link: "/public" },
  { id: "NT-6", type: "gramsabha_decision", title: "Gram Sabha follow-up due", body: "Street lighting decision pending action.", ts: d(-4), read: true, forRoles: ["sarpanch", "gram_sevak"], link: "/app/gramsabha" },
  { id: "NT-7", type: "seasonal_task_due", title: "Seasonal task due", body: "Drain clearing due before monsoon.", ts: d(-2), read: false, forRoles: ["gram_sevak", "vwsc_member"], link: "/app/seasonal" },
  { id: "NT-8", type: "review_requested", title: "Evidence awaiting review", body: "Lohara GP submitted pre-monsoon evidence for review.", ts: d(-3), read: false, forRoles: ["extension_officer", "bdo"], link: "/app/pathpurava" },
];

// ============================================================================
// AUDIT LOGS
// ============================================================================
const auditLogs: AuditLog[] = [
  { id: "AL-1", ts: d(-2), actor: "Demo Gram Sevak", actorRole: "gram_sevak", action: "Marked obligation blocked", entity: "Obligation", entityId: "OBL-PM-100", fromStatus: "IN_PROGRESS", toStatus: "BLOCKED", comment: "Technical sanction pending" },
  { id: "AL-2", ts: d(-3), actor: "Demo Gram Sevak (B)", actorRole: "gram_sevak", action: "Submitted evidence", entity: "Obligation", entityId: "OBL-PM-104", toStatus: "UNDER_REVIEW" },
  { id: "AL-3", ts: d(-2), actor: "System", actorRole: "sysadmin", action: "Generated handover pack", entity: "Handover", entityId: "HND-1" },
  { id: "AL-4", ts: d(-20), actor: "Demo VWSC Member", actorRole: "vwsc_member", action: "Inspected asset", entity: "Asset", entityId: "asset-hp018", toStatus: "FUNCTIONAL" },
];

// ============================================================================
// GP FILE FLOW
// ============================================================================
const gpFiles: GpFile[] = [];
const FILE_TITLES: [string, string][] = [
  ["Water supply extension proposal", "पाणीपुरवठा विस्तार प्रस्ताव"],
  ["Building permission application", "बांधकाम परवानगी अर्ज"],
  ["Grant sanction for community hall", "समाज मंदिर अनुदान मंजुरी"],
  ["Audit para compliance file", "लेखापरीक्षण अनुपालन फाईल"],
  ["Street light material indent", "पथदिवा साहित्य मागणी"],
  ["Scholarship verification file", "शिष्यवृत्ती पडताळणी फाईल"],
];
const DESKS = ["Front Desk", "Gram Sevak", "Technical (JE)", "Extension Officer", "Block Office"];
const FILE_STATUSES = ["RECEIVED", "UNDER_PROCESS", "WAITING", "FORWARD_PENDING", "RETURNED", "COMPLETED"] as const;
let fc = 1;
PILOT_GPS.forEach((gp, gi) => {
  for (let i = 0; i < 3; i++) {
    const s = gi * 17 + i * 4 + 2;
    const [title, titleMr] = FILE_TITLES[(gi + i) % FILE_TITLES.length];
    const received = -Math.floor(rnd(s) * 50) - 3;
    const st = pick([...FILE_STATUSES], s + 1);
    gpFiles.push({
      id: `FILE-${100 + fc++}`,
      title, titleMr, source: pick(["Citizen application", "Block Office", "Government letter", "Gram Sabha"], s + 2),
      districtId: "d-yvt", blockId: gp.blockId, gpId: gp.id,
      receivedDate: d(received), currentDesk: pick(DESKS, s + 3), currentHolder: pick(["Demo Gram Sevak", "Demo GP Staff", "Demo Junior Engineer"], s + 4),
      pendingSince: d(received + Math.floor(rnd(s + 5) * 10)), nextAction: pick(["Verify documents", "Forward to Block", "Prepare estimate", "Obtain approval", "Issue to citizen"], s + 6),
      dueDate: d(received + 30), status: st === "COMPLETED" && received > -10 ? "UNDER_PROCESS" : st,
      blocker: st === "WAITING" ? "Awaiting technical estimate" : undefined,
      govReference: rnd(s + 7) > 0.5 ? `eGramSwaraj/DEMO/${1000 + fc}` : undefined,
    });
  }
});

// ============================================================================
// COMPLAINT ROUTING
// ============================================================================
const complaints: Complaint[] = [
  {
    id: "CMP-101", category: "Street light not working", description: "Street light near school pole not working for a week.",
    districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", citizenName: "Demo Citizen",
    suggestedAuthority: "Engineering", isExternal: false, status: "ROUTED", createdOn: d(-4),
    timeline: [tl("Demo Citizen", "citizen", "Complaint received", -4, { toStatus: "RECEIVED" }), tl("System", "sysadmin", "Classified & routed to Engineering", -4, { toStatus: "ROUTED" })],
  },
  {
    id: "CMP-102", category: "Drinking water shortage", description: "Irregular water supply in ward 3.",
    districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-lohara", citizenName: "Demo Citizen",
    suggestedAuthority: "Water & Sanitation", isExternal: false, status: "IN_PROGRESS", createdOn: d(-8),
    timeline: [tl("Demo Citizen", "citizen", "Complaint received", -8, { toStatus: "RECEIVED" }), tl("Demo Gram Sevak", "gram_sevak", "Accepted", -7, { toStatus: "ACCEPTED" })],
  },
  {
    id: "CMP-103", category: "Power transformer issue", description: "Frequent power cuts affecting water pump.",
    districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-waghapur", citizenName: "Demo Citizen",
    suggestedAuthority: "External Department", isExternal: true, status: "CLASSIFIED", createdOn: d(-2),
    timeline: [tl("Demo Citizen", "citizen", "Complaint received", -2, { toStatus: "RECEIVED" })],
  },
];

// ============================================================================
// MAHSUL SANDHI — SAMARTH adoption
// ============================================================================
const ADOPTION_ITEMS: [string, string, string][] = [
  ["prop_register", "Property register configured", "मालमत्ता नोंदवही तयार"],
  ["tax_categories", "Tax categories configured", "कर प्रवर्ग निश्चित"],
  ["taxpayer_records", "Taxpayer records prepared", "करदाता नोंदी तयार"],
  ["demand", "Demand generation started", "मागणी निर्मिती सुरू"],
  ["collection", "Collection workflow activated", "वसुली प्रक्रिया सुरू"],
  ["training", "SAMARTH training completed", "SAMARTH प्रशिक्षण पूर्ण"],
  ["gis", "Gram Manchitra assessment used", "ग्राम मंचित्र मूल्यांकन"],
  ["public_page", "Public Kar Jagruti page enabled", "कर जागृती पान सुरू"],
];
const ADOPTION_STATES = ["NOT_STARTED", "IN_PROGRESS", "ACTIVE", "NEEDS_SUPPORT"] as const;
const adoption: AdoptionRecord[] = PILOT_GPS.map((gp, gi) => ({
  id: `ADOPT-${gi + 1}`, gpId: gp.id, blockId: gp.blockId, districtId: "d-yvt",
  items: ADOPTION_ITEMS.map(([key, label, labelMr], i) => ({ key, label, labelMr, state: pick([...ADOPTION_STATES], gi * 11 + i * 3 + 1) })),
}));

// ============================================================================
// PROCESS IMPROVEMENT LAB
// ============================================================================
const experiments: ProcessExperiment[] = [
  { id: "EXP-1", experiment: "Weekly PATHPURAVA exception digest", problem: "Block review status compilation takes too long.", baselineMetric: "Compilation time", baselineValue: 180, intervention: "Use weekly exception digest instead of manual compilation.", startDate: d(-40), endDate: d(-10), currentValue: 45, unit: "minutes", owner: "Demo BDO", ownerRole: "bdo", status: "COMPLETED", evidence: "Time log comparison over 30 days." },
  { id: "EXP-2", experiment: "QR-first repair reporting", problem: "Repair closure time high.", baselineMetric: "Repair median age", baselineValue: 18, intervention: "QR reporting + auto-ticket to JE.", startDate: d(-35), endDate: d(-5), currentValue: 8, unit: "days", owner: "Demo Junior Engineer", ownerRole: "je", status: "COMPLETED", evidence: "Repair ticket ageing report." },
  { id: "EXP-3", experiment: "UC follow-up reminder cadence", problem: "UC follow-up time slow.", baselineMetric: "UC follow-up time", baselineValue: 22, intervention: "Automated reminder 10 days before due.", startDate: d(-8), currentValue: 22, unit: "days", owner: "Demo Extension Officer", ownerRole: "extension_officer", status: "RUNNING" },
];

// ============================================================================
// ASSEMBLE
// ============================================================================
export function buildSeed(): DemoState {
  const state: DemoState = {
    version: DEMO_VERSION,
    obligations,
    assets,
    repairs,
    seasonalTasks,
    services,
    gramSabhaMeetings,
    gramSabhaDecisions,
    institutions,
    volunteers,
    activities,
    innovations,
    challenges,
    handovers,
    notifications,
    auditLogs,
    ucFollowUps,
    convergence,
    users: USERS,
    gpFiles,
    complaints,
    adoption,
    experiments,
  };
  // Baseline snapshot captured at seed time — CEO "outcome changes" compare
  // this baseline to the live demo state as officers make changes.
  state.baseline = getDistrictOperationalMetrics(state);
  return state;
}
