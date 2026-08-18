import { BLOCKS, GPS, gpsInBlock } from "@/data/hierarchy";
import { computeScope, inScope, ScopeFilter } from "@/permissions";
import { hasCapability } from "@/permissions/capabilities";
import {
  Asset,
  BlockerCategory,
  DemoState,
  Obligation,
  OperationalMetrics,
  RepairTicket,
  User,
} from "@/types";
import { RagStatus } from "./labels";
import { daysFromToday, pct } from "./format";

// ---- Scoped views ----
export function scopedObligations(state: DemoState, scope: ScopeFilter): Obligation[] {
  return state.obligations.filter((o) => inScope(scope, o));
}
export function scopedAssets(state: DemoState, scope: ScopeFilter): Asset[] {
  return state.assets.filter((a) => inScope(scope, a));
}
export function scopedRepairs(state: DemoState, scope: ScopeFilter): RepairTicket[] {
  return state.repairs.filter((r) => inScope(scope, r));
}

export function forUser(state: DemoState, user: User | null) {
  const scope = computeScope(user);
  return {
    scope,
    obligations: scopedObligations(state, scope),
    assets: scopedAssets(state, scope),
    repairs: scopedRepairs(state, scope),
    seasonal: state.seasonalTasks.filter((t) => inScope(scope, t)),
    services: state.services.filter((s) => inScope(scope, s)),
    institutions: state.institutions.filter((i) => inScope(scope, i)),
    activities: state.activities.filter((a) => inScope(scope, a)),
    decisions: state.gramSabhaDecisions.filter((dd) =>
      inScope(scope, { ...dd, districtId: "d-yvt", blockId: undefined, gpId: undefined })
    ),
  };
}

// ---- Counts ----
export interface ObligationStats {
  total: number;
  active: number;
  overdue: number;
  blocked: number;
  underReview: number;
  completed: number;
  verified: number;
}

export function obligationStats(obs: Obligation[]): ObligationStats {
  return {
    total: obs.length,
    active: obs.filter((o) => ["NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"].includes(o.status)).length,
    overdue: obs.filter((o) => o.status === "OVERDUE").length,
    blocked: obs.filter((o) => o.status === "BLOCKED").length,
    underReview: obs.filter((o) => o.status === "UNDER_REVIEW").length,
    completed: obs.filter((o) => o.status === "COMPLETED").length,
    verified: obs.filter((o) => o.status === "VERIFIED").length,
  };
}

export function assetStats(assets: Asset[]) {
  return {
    total: assets.length,
    functional: assets.filter((a) => a.condition === "FUNCTIONAL").length,
    nonFunctional: assets.filter((a) => a.condition === "NON_FUNCTIONAL").length,
    underRepair: assets.filter((a) => a.condition === "UNDER_REPAIR").length,
    partial: assets.filter((a) => a.condition === "PARTIALLY_FUNCTIONAL").length,
    checkDue: assets.filter((a) => a.condition === "CHECK_DUE").length,
  };
}

export function repairStats(repairs: RepairTicket[]) {
  const open = repairs.filter((r) => r.status !== "CLOSED" && r.status !== "VERIFIED");
  const overdue = open.filter((r) => (r.ageDays ?? 0) > 30);
  return {
    total: repairs.length,
    open: open.length,
    overdue: overdue.length,
    verified: repairs.filter((r) => r.status === "VERIFIED" || r.status === "CLOSED").length,
    avgAge: open.length ? Math.round(open.reduce((s, r) => s + (r.ageDays ?? 0), 0) / open.length) : 0,
  };
}

// ---- Systemic blockers ----
export interface BlockerAgg {
  category: BlockerCategory;
  count: number;
  gpCount: number;
}

export function systemicBlockers(obs: Obligation[]): BlockerAgg[] {
  const map = new Map<BlockerCategory, { count: number; gps: Set<string> }>();
  obs.forEach((o) => {
    o.blockers
      .filter((b) => !b.resolved)
      .forEach((b) => {
        const e = map.get(b.category) ?? { count: 0, gps: new Set<string>() };
        e.count += 1;
        if (o.gpId) e.gps.add(o.gpId);
        map.set(b.category, e);
      });
  });
  return Array.from(map.entries())
    .map(([category, v]) => ({ category, count: v.count, gpCount: v.gps.size }))
    .sort((a, b) => b.count - a.count);
}

// ---- RAG status ----
export interface RagReason {
  status: RagStatus;
  reasons: string[];
}

export function gpRag(state: DemoState, gpId: string): RagReason {
  const obs = state.obligations.filter((o) => o.gpId === gpId);
  const assets = state.assets.filter((a) => a.gpId === gpId);
  const overdue = obs.filter((o) => o.status === "OVERDUE").length;
  const blocked = obs.filter((o) => o.status === "BLOCKED").length;
  const critical = obs.filter((o) => o.priority === "CRITICAL" && o.status === "OVERDUE").length;
  const nonFunc = assets.filter((a) => a.condition === "NON_FUNCTIONAL").length;
  const reasons: string[] = [];
  let status: RagStatus = "GREEN";
  if (critical > 0 || overdue >= 3 || nonFunc >= 3) {
    status = "RED";
    if (critical > 0) reasons.push(`${critical} critical overdue`);
    if (overdue >= 3) reasons.push(`${overdue} overdue obligations`);
    if (nonFunc >= 3) reasons.push(`${nonFunc} non-functional assets`);
  } else if (overdue > 0 || blocked > 0 || nonFunc > 0) {
    status = "AMBER";
    if (overdue > 0) reasons.push(`${overdue} overdue`);
    if (blocked > 0) reasons.push(`${blocked} blocked`);
    if (nonFunc > 0) reasons.push(`${nonFunc} non-functional asset(s)`);
  } else {
    reasons.push("No critical overdue or asset failure");
  }
  return { status, reasons };
}

export function blockRag(state: DemoState, blockId: string): RagReason & { gps: { id: string; rag: RagReason }[] } {
  const gps = gpsInBlock(blockId);
  const gpRags = gps.map((g) => ({ id: g.id, rag: gpRag(state, g.id) }));
  const red = gpRags.filter((g) => g.rag.status === "RED").length;
  const amber = gpRags.filter((g) => g.rag.status === "AMBER").length;
  let status: RagStatus = "GREEN";
  const reasons: string[] = [];
  if (red > 0) {
    status = "RED";
    reasons.push(`${red} GP(s) critical`);
  } else if (amber > 0) {
    status = "AMBER";
    reasons.push(`${amber} GP(s) need attention`);
  } else {
    reasons.push("All GPs on track");
  }
  return { status, reasons, gps: gpRags };
}

// ---- Seasonal readiness % ----
export function readinessPct(state: DemoState, filter: { gpId?: string; blockId?: string }): number {
  let tasks = state.seasonalTasks;
  if (filter.gpId) tasks = tasks.filter((t) => t.gpId === filter.gpId);
  else if (filter.blockId) tasks = tasks.filter((t) => t.blockId === filter.blockId);
  if (!tasks.length) return 100;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return pct(done, tasks.length);
}

export function districtReadiness(state: DemoState): number {
  return readinessPct(state, {});
}

// ---- Block summaries (for BDO / district dashboards) ----
export interface BlockSummary {
  blockId: string;
  name: string;
  nameMr: string;
  rag: RagStatus;
  reasons: string[];
  gpCount: number;
  overdue: number;
  blocked: number;
  nonFunctional: number;
  readiness: number;
}

export function blockSummaries(state: DemoState, blockIds?: string[]): BlockSummary[] {
  const blocks = blockIds ? BLOCKS.filter((b) => blockIds.includes(b.id)) : BLOCKS;
  return blocks.map((b) => {
    const rag = blockRag(state, b.id);
    const obs = state.obligations.filter((o) => o.blockId === b.id);
    const assets = state.assets.filter((a) => a.blockId === b.id);
    return {
      blockId: b.id,
      name: b.name,
      nameMr: b.nameMr,
      rag: rag.status,
      reasons: rag.reasons,
      gpCount: b.demoIllustrativeGpCount,
      overdue: obs.filter((o) => o.status === "OVERDUE").length,
      blocked: obs.filter((o) => o.status === "BLOCKED").length,
      nonFunctional: assets.filter((a) => a.condition === "NON_FUNCTIONAL").length,
      readiness: readinessPct(state, { blockId: b.id }),
    };
  });
}

export function gpSummaries(state: DemoState, gpIds: string[]) {
  return gpIds.map((id) => {
    const gp = GPS.find((g) => g.id === id)!;
    const rag = gpRag(state, id);
    const obs = state.obligations.filter((o) => o.gpId === id);
    const assets = state.assets.filter((a) => a.gpId === id);
    return {
      gpId: id,
      name: gp?.name ?? id,
      nameMr: gp?.nameMr ?? "",
      rag: rag.status,
      reasons: rag.reasons,
      overdue: obs.filter((o) => o.status === "OVERDUE").length,
      blocked: obs.filter((o) => o.status === "BLOCKED").length,
      nonFunctional: assets.filter((a) => a.condition === "NON_FUNCTIONAL").length,
      readiness: readinessPct(state, { gpId: id }),
    };
  });
}

// ---- Notifications for a user ----
export function notificationsFor(state: DemoState, user: User | null) {
  if (!user) return [];
  const scope = computeScope(user);
  return state.notifications.filter((n) => {
    if (!n.forRoles.includes(user.role)) return false;
    if (n.forUserId && n.forUserId !== user.id) return false;
    // Respect scope: a notification tagged to a GP/block must be in the user's scope.
    if (n.gpId || n.blockId) {
      return inScope(scope, { districtId: "d-yvt", blockId: n.blockId, gpId: n.gpId });
    }
    return true;
  });
}

// ---- Live platform metrics for Process Improvement Lab ----
export const LIVE_METRIC_KEYS: { key: string; label: string; unit: string }[] = [
  { key: "OVERDUE_OBLIGATIONS", label: "Overdue obligations", unit: "count" },
  { key: "BLOCKED_OBLIGATIONS", label: "Blocked obligations", unit: "count" },
  { key: "NON_FUNCTIONAL_ASSETS", label: "Non-functional assets", unit: "count" },
  { key: "OPEN_REPAIRS", label: "Open repairs", unit: "count" },
  { key: "OVERDUE_REPAIRS", label: "Overdue repairs (>30d)", unit: "days-open" },
  { key: "SEASONAL_READINESS", label: "Seasonal readiness", unit: "%" },
  { key: "COMPLAINT_AVG_AGE", label: "Open complaints", unit: "count" },
  { key: "FILE_FLOW_PENDING", label: "Pending GP files", unit: "count" },
];

export function liveMetricValue(state: DemoState, key: string): number {
  const m = getDistrictOperationalMetrics(state);
  switch (key) {
    case "OVERDUE_OBLIGATIONS": return m.overdueObligations;
    case "BLOCKED_OBLIGATIONS": return m.blockedObligations;
    case "NON_FUNCTIONAL_ASSETS": return m.nonFunctionalAssets;
    case "OPEN_REPAIRS": return m.openRepairs;
    case "OVERDUE_REPAIRS": return m.overdueRepairs;
    case "SEASONAL_READINESS": return m.readinessPct;
    case "COMPLAINT_AVG_AGE": return (state.complaints ?? []).filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length;
    case "FILE_FLOW_PENDING": return (state.gpFiles ?? []).filter((f) => f.status !== "COMPLETED").length;
    default: return 0;
  }
}

// ---- Generic accessible-records filter (single source of truth) ----
export function getAccessibleRecords<T extends { districtId?: string; blockId?: string; gpId?: string; departmentId?: string; publishedPublic?: boolean; classification?: string }>(
  user: User | null,
  records: T[]
): T[] {
  const scope = computeScope(user);
  return records.filter((r) => inScope(scope, r));
}

// ---- HASTANTARAN (handover) scope + accept validation ----
export function getAccessibleHandovers(user: User | null, handovers: DemoState["handovers"]) {
  if (!user) return [];
  if (!hasCapability(user, "VIEW_HANDOVER")) return [];
  const scope = computeScope(user);
  return handovers.filter((h) => inScope(scope, { districtId: h.districtId, blockId: h.blockId, gpId: h.gpId }));
}

export function canAcceptHandover(
  user: User | null,
  h: { gpId: string; blockId?: string; districtId?: string; accepted?: boolean; status?: string; incomingUserId?: string; outgoingUserId?: string }
): boolean {
  if (!user || user.status === "disabled") return false; // (1) active
  if (!hasCapability(user, "ACCEPT_HANDOVER")) return false; // (2) capability — Sysadmin/CEO/reviewers excluded
  if (h.accepted || (h.status && h.status !== "AWAITING_ACCEPTANCE")) return false; // (3) awaiting acceptance
  if (!h.incomingUserId) return false; // (5) designated incoming must exist
  if (h.incomingUserId !== user.id) return false; // (6) ONLY the designated incoming officer
  if (h.outgoingUserId && h.outgoingUserId === user.id) return false; // (8) not the outgoing officer
  if (user.gpId !== h.gpId) return false; // (4,7) current assignment matches the handover GP
  return true;
}

/** Supervisory review (BDO / Extension) — can view/review but never impersonate accept. */
export function canReviewHandover(user: User | null): boolean {
  return hasCapability(user, "REVIEW_HANDOVER");
}

// ---- UC follow-up scope ----
export function getAccessibleUcFollowUps(user: User | null, ucs: DemoState["ucFollowUps"]) {
  if (!user) return [];
  if (!hasCapability(user, "VIEW_UC_FOLLOWUP")) return [];
  const scope = computeScope(user);
  return ucs.filter((u) => inScope(scope, { districtId: u.districtId, blockId: u.blockId, gpId: u.gpId, departmentId: u.departmentId, visibilityScope: u.visibilityScope }));
}

// ---- Central operational metrics (used by all dashboards) ----
function metricsFrom(
  obs: Obligation[],
  assets: Asset[],
  repairs: RepairTicket[],
  readiness: number,
  participation: number
): OperationalMetrics {
  const os = obligationStats(obs);
  const as = assetStats(assets);
  const rs = repairStats(repairs);
  const done = os.completed + os.verified;
  const openAges = repairs.filter((r) => r.status !== "CLOSED" && r.status !== "VERIFIED").map((r) => r.ageDays ?? 0).sort((a, b) => a - b);
  const median = openAges.length ? openAges[Math.floor(openAges.length / 2)] : 0;
  return {
    activeObligations: os.active,
    overdueObligations: os.overdue,
    blockedObligations: os.blocked,
    completionPct: os.total ? Math.round((done / os.total) * 100) : 0,
    totalAssets: as.total,
    functionalAssets: as.functional,
    nonFunctionalAssets: as.nonFunctional,
    assetFunctionalityPct: as.total ? Math.round((as.functional / as.total) * 100) : 100,
    openRepairs: rs.open,
    overdueRepairs: rs.overdue,
    repairMedianAge: median,
    readinessPct: readiness,
    participation,
    systemicBlockerCount: systemicBlockers(obs).reduce((s, b) => s + b.count, 0),
  };
}

export function getDistrictOperationalMetrics(state: DemoState): OperationalMetrics {
  return metricsFrom(state.obligations, state.assets, state.repairs, districtReadiness(state), state.activities.length);
}
export function getBlockOperationalMetrics(state: DemoState, blockId: string): OperationalMetrics {
  return metricsFrom(
    state.obligations.filter((o) => o.blockId === blockId),
    state.assets.filter((a) => a.blockId === blockId),
    state.repairs.filter((r) => r.blockId === blockId),
    readinessPct(state, { blockId }),
    state.activities.filter((a) => a.blockId === blockId).length
  );
}
export function getGpOperationalMetrics(state: DemoState, gpId: string): OperationalMetrics {
  return metricsFrom(
    state.obligations.filter((o) => o.gpId === gpId),
    state.assets.filter((a) => a.gpId === gpId),
    state.repairs.filter((r) => r.gpId === gpId),
    readinessPct(state, { gpId }),
    state.activities.filter((a) => a.gpId === gpId).length
  );
}

/** Dynamic CEO "five things to know today" — severity-scored, fully derived
 *  from the live demo state. No hard-coded alerts. */
export function topExecutiveItems(state: DemoState): { text: string; tone: "red" | "amber" | "violet"; score: number }[] {
  const m = getDistrictOperationalMetrics(state);
  const blockers = systemicBlockers(state.obligations);
  const blocks = blockSummaries(state);
  const items: { text: string; tone: "red" | "amber" | "violet"; score: number }[] = [];

  const criticalOverdue = state.obligations.filter((o) => o.priority === "CRITICAL" && o.status === "OVERDUE").length;
  if (criticalOverdue > 0) items.push({ text: `${criticalOverdue} critical-priority obligation(s) are overdue.`, tone: "red", score: 5 * criticalOverdue });

  const ts = blockers.find((b) => b.category.includes("Technical"));
  if (ts) items.push({ text: `Technical Sanction is blocking ${ts.count} obligation(s) across ${ts.gpCount} GP(s).`, tone: "amber", score: 3 + ts.count });

  if (m.overdueRepairs > 0) items.push({ text: `${m.overdueRepairs} repair(s) have remained open more than 30 days.`, tone: "amber", score: 4 * m.overdueRepairs });

  const lowReadiness = blocks.filter((b) => b.readiness < 70);
  if (m.readinessPct < 80) items.push({ text: `Seasonal readiness is ${m.readinessPct}% — below the 80% target${lowReadiness.length ? ` (${lowReadiness.length} block(s) lagging)` : ""}.`, tone: "red", score: (80 - m.readinessPct) });

  if (m.overdueObligations > 0) items.push({ text: `${m.overdueObligations} obligation(s) are overdue across the district.`, tone: "red", score: 2 + Math.min(20, m.overdueObligations) });

  const redBlocks = blocks.filter((b) => b.rag === "RED");
  if (redBlocks.length) items.push({ text: `${redBlocks.length} block(s) show critical exceptions requiring intervention.`, tone: "red", score: 4 * redBlocks.length });

  if (m.nonFunctionalAssets >= 3) items.push({ text: `${m.nonFunctionalAssets} non-functional assets — water/civic functionality needs attention.`, tone: "amber", score: 2 + m.nonFunctionalAssets });

  // Cross-department dependency — derived, only shown when it actually exists.
  const crossDept = state.obligations.filter((o) => o.blockers.some((b) => !b.resolved && b.category === "Other Department Pending") || o.escalationLevel >= 2).length;
  if (crossDept > 0) items.push({ text: `${crossDept} cross-department dependency/escalation(s) pending review.`, tone: "violet", score: 3 + crossDept });

  const openComplaints = (state.complaints ?? []).filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED").length;
  if (openComplaints > 0) items.push({ text: `${openComplaints} complaint(s) open in routing.`, tone: "amber", score: 2 });

  return items.sort((a, b) => b.score - a.score).slice(0, 5);
}

// ---- Dashboard due-today for gram sevak ----
export function dueBuckets(obs: Obligation[]) {
  const dueToday = obs.filter((o) => daysFromToday(o.dueDate) === 0 && !["COMPLETED", "VERIFIED", "CANCELLED"].includes(o.status));
  const overdue = obs.filter((o) => o.status === "OVERDUE");
  const blocked = obs.filter((o) => o.status === "BLOCKED");
  const upcoming = obs
    .filter((o) => {
      const dd = daysFromToday(o.dueDate);
      return dd > 0 && dd <= 7 && !["COMPLETED", "VERIFIED"].includes(o.status);
    })
    .sort((a, b) => daysFromToday(a.dueDate) - daysFromToday(b.dueDate));
  return { dueToday, overdue, blocked, upcoming };
}
