"use client";

import { useAuth, useStore } from "@/services/store";
import {
  forUser,
  obligationStats,
  assetStats,
  repairStats,
  systemicBlockers,
  blockSummaries,
  districtReadiness,
  getDistrictOperationalMetrics,
  topExecutiveItems,
} from "@/utils/selectors";
import { StatCard, Card, CardBody, CardHeader } from "@/components/ui/primitives";
import { Greeting, SectionCard, AttentionList, RagRow } from "@/components/dashboard/widgets";
import { RagPill, DemoBadge, RefBadge } from "@/components/ui/common";
import { BarChartMini, LineTrend, ChartLegend } from "@/components/ui/charts";
import { BLOCKS, DISTRICT_GP_REFERENCE, DEMO_GP_COUNT } from "@/data/hierarchy";
import { ProcessExperiment } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertOctagon,
  Building2,
  CheckCircle2,
  CloudRain,
  Gauge,
  HeartHandshake,
  Layers,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";

const IMPROVEMENT_TREND = [
  { name: "Mar", overdue: 120, readiness: 54 },
  { name: "Apr", overdue: 108, readiness: 61 },
  { name: "May", overdue: 96, readiness: 68 },
  { name: "Jun", overdue: 88, readiness: 74 },
  { name: "Jul", overdue: 79, readiness: 82 },
  { name: "Aug", overdue: 74, readiness: 86 },
];

// ---------------------------------------------------------------------------
// DEPUTY CEO — District Panchayat Operations Command Centre
// ---------------------------------------------------------------------------
export function DyCeoPanchayatDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const s = forUser(state, user);
  const ostats = obligationStats(s.obligations);
  const astats = assetStats(s.assets);
  const rstats = repairStats(s.repairs);
  const blockers = systemicBlockers(s.obligations);
  const summaries = blockSummaries(state);
  const readiness = districtReadiness(state);
  const attention = summaries.filter((b) => b.rag !== "GREEN").sort((a) => (a.rag === "RED" ? -1 : 1));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Greeting name={user?.name ?? ""} sub="District Panchayat Operations Command Centre · Yavatmal" />
        <DemoBadge />
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><span className="text-sm font-semibold text-slate-700">16 Panchayat Samitis</span><span className="text-xs text-slate-400">·</span><span className="text-xl font-bold text-slate-900">{DISTRICT_GP_REFERENCE.toLocaleString("en-IN")}</span><span className="text-xs text-slate-500">GPs</span><RefBadge kind="OFFICIAL_REFERENCE" /></div>
          <div className="flex items-center gap-2"><span className="text-xs text-slate-500">Demo dataset coverage:</span><span className="text-xl font-bold text-slate-900">{DEMO_GP_COUNT}</span><span className="text-xs text-slate-500">GPs loaded</span><RefBadge kind="DEMO_DATA" /></div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Panchayat Samitis" value={16} tone="blue" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="District Readiness" value={readiness} suffix="%" tone="green" icon={<CloudRain className="h-4 w-4" />} />
        <StatCard label="Active Obligations" value={ostats.active} tone="blue" icon={<Layers className="h-4 w-4" />} />
        <StatCard label="Overdue" value={ostats.overdue} tone="red" icon={<AlertOctagon className="h-4 w-4" />} onClick={() => router.push("/app/pathpurava")} />
        <StatCard label="Blocked" value={ostats.blocked} tone="amber" icon={<ShieldAlert className="h-4 w-4" />} />
        <StatCard label="Repair Backlog" value={rstats.open} tone="amber" icon={<Wrench className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Top Systemic Bottlenecks" titleMr="प्रमुख अडथळे" subtitle="Aggregated across the district" icon={<ShieldAlert className="h-4 w-4" />}>
          {blockers.length ? (
            <div className="space-y-2.5">
              {blockers.slice(0, 6).map((b) => (
                <div key={b.category} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{b.category}</span>
                  <span className="rounded-md bg-rose-50 px-2 py-0.5 text-sm font-bold text-rose-600">{b.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No systemic blockers.</p>
          )}
          <p className="mt-3 text-xs italic text-slate-400">These are surfaced for intervention — the platform does not take autonomous decisions.</p>
        </SectionCard>

        <Card className="lg:col-span-2">
          <CardHeader title="District Improvement Trend" subtitle="Illustrative pilot outcome scenario" icon={<TrendingUp className="h-4 w-4" />} action={<RefBadge kind="ILLUSTRATIVE_KPI" />} />
          <CardBody>
            <LineTrend
              data={IMPROVEMENT_TREND}
              lines={[
                { key: "overdue", color: "#f43f5e", label: "Overdue obligations" },
                { key: "readiness", color: "#199e8f", label: "Readiness %" },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      <SectionCard title="Blocks Needing Attention" titleMr="लक्ष देण्याजोगे गट" subtitle="This week's exceptions" icon={<AlertOctagon className="h-4 w-4" />} action={<Link href="/app/reports" className="text-xs text-brand-600 hover:underline">District report</Link>}>
        <div className="space-y-2">
          {attention.length === 0 ? (
            <p className="py-6 text-center text-sm text-emerald-600">All blocks on track.</p>
          ) : (
            attention.map((b) => (
              <RagRow
                key={b.blockId}
                name={b.name}
                nameMr={b.nameMr}
                rag={b.rag}
                reasons={b.reasons}
                metrics={[
                  { label: "Overdue", value: b.overdue },
                  { label: "Blocked", value: b.blocked },
                  { label: "Non-func", value: b.nonFunctional },
                  { label: "Ready", value: `${b.readiness}%` },
                ]}
              />
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard title="Recommended Interventions" subtitle="Suggested — for authorised decision" icon={<Sparkles className="h-4 w-4" />}>
        <AttentionList
          items={[
            { id: "r1", title: "Fast-track Technical Sanction cell for pre-monsoon works", sub: `${blockers.find((b) => b.category.includes("Technical"))?.count ?? 0} obligations waiting`, tone: "amber", badge: "Blocker" },
            { id: "r2", title: "Deploy repair contingency for non-functional water assets", sub: `${astats.nonFunctional} non-functional assets`, tone: "red", badge: "Assets" },
            { id: "r3", title: "Review GPs with repeated overdue obligations", sub: `${attention.length} blocks flagged`, tone: "amber", badge: "Blocks" },
          ]}
        />
      </SectionCard>

      {(state.experiments ?? []).filter((e) => e.status === "COMPLETED").length > 0 && (
        <SectionCard title="Process Improvement Results" subtitle="Validated operational improvements" icon={<TrendingUp className="h-4 w-4" />} action={<Link href="/app/process-lab" className="text-xs text-brand-600 hover:underline">Open Lab</Link>}>
          <AttentionList items={(state.experiments ?? []).filter((e) => e.status === "COMPLETED").map((e) => ({ id: e.id, title: e.experiment, sub: `${e.baselineMetric}: ${e.baselineValue} → ${e.currentValue} ${e.unit}`, tone: "green" as const, badge: "Improved" }))} />
        </SectionCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DEPUTY CEO / DEPT HEAD — department-filtered
// ---------------------------------------------------------------------------
export function DyCeoDeptHeadDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const dept = user?.departmentId ?? "dept-water";
  const obs = state.obligations.filter((o) => o.departmentId === dept);
  const assets = state.assets.filter((a) => ["Hand Pump", "Borewell", "Water Tank", "Pipeline"].includes(a.type));
  const astats = assetStats(assets);
  const rstats = repairStats(state.repairs.filter((r) => state.assets.find((a) => a.id === r.assetId && ["Hand Pump", "Borewell", "Water Tank", "Pipeline"].includes(a.type))));
  const byBlock = BLOCKS.map((b) => ({ name: b.name, value: obs.filter((o) => o.blockId === b.id && o.status === "OVERDUE").length })).filter((x) => x.value > 0);
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`District Department Command · ${dept.replace("dept-", "").toUpperCase()}`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Asset Condition (Functional)" value={astats.functional} tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Non-functional" value={astats.nonFunctional} tone="red" icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Repair Backlog" value={rstats.open} tone="amber" icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Open Dependencies" value={obs.filter((o) => o.status === "BLOCKED").length} tone="violet" icon={<ShieldAlert className="h-4 w-4" />} />
      </div>
      <Card>
        <CardHeader title="Block Comparison — Overdue in Department" icon={<Building2 className="h-4 w-4" />} />
        <CardBody>{byBlock.length ? <BarChartMini data={byBlock} /> : <p className="py-8 text-center text-sm text-slate-400">No overdue items in this department.</p>}</CardBody>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ADDITIONAL CEO — cross-department executive
// ---------------------------------------------------------------------------
export function AdditionalCeoDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const s = forUser(state, user);
  const blockers = systemicBlockers(s.obligations);
  const escalated = s.obligations.filter((o) => o.escalationLevel >= 1);
  const summaries = blockSummaries(state).filter((b) => b.rag !== "GREEN");
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub="Additional CEO · Cross-department executive view" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Escalated Matters" value={escalated.length} tone="red" icon={<ShieldAlert className="h-4 w-4" />} />
        <StatCard label="Cross-dept Blockers" value={blockers.length} tone="amber" icon={<Layers className="h-4 w-4" />} />
        <StatCard label="Blocks Flagged" value={summaries.length} tone="amber" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="District Readiness" value={districtReadiness(state)} suffix="%" tone="green" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Cross-department Blockers" icon={<Layers className="h-4 w-4" />}>
          <AttentionList items={blockers.map((b) => ({ id: b.category, title: b.category, sub: `${b.count} obligations · ${b.gpCount} GPs`, tone: "amber" as const, badge: String(b.count) }))} />
        </SectionCard>
        <SectionCard title="Departmental Exceptions" icon={<AlertOctagon className="h-4 w-4" />}>
          <div className="space-y-2">
            {summaries.map((b) => (
              <RagRow key={b.blockId} name={b.name} rag={b.rag} reasons={b.reasons} metrics={[{ label: "Overdue", value: b.overdue }, { label: "Blocked", value: b.blocked }]} />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CEO — Strategic Command (the five things to know today)
// ---------------------------------------------------------------------------
export function CeoDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const s = forUser(state, user);
  const ostats = obligationStats(s.obligations);
  const astats = assetStats(s.assets);
  const rstats = repairStats(s.repairs);
  const blockers = systemicBlockers(s.obligations);
  const summaries = blockSummaries(state);
  const readiness = districtReadiness(state);
  const metrics = getDistrictOperationalMetrics(state);
  const baseline = state.baseline ?? metrics;
  const health = Math.round((readiness + (100 - Math.min(100, ostats.overdue)) + (astats.total ? (astats.functional / astats.total) * 100 : 100)) / 3);
  const topFive = topExecutiveItems(state).map((t, i) => ({ n: i + 1, ...t }));
  const doneExperiments = (state.experiments ?? []).filter((e) => e.status === "COMPLETED");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Greeting name={user?.name ?? ""} sub="CEO Strategic Command · Zilla Parishad Yavatmal" />
        <DemoBadge />
      </div>

      {/* What are the five things I need to know today */}
      <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50 to-white">
        <CardHeader title="What are the five things I need to know today?" icon={<Sparkles className="h-4 w-4" />} />
        <CardBody>
          <div className="space-y-2">
            {topFive.map((t) => (
              <div key={t.n} className="flex items-center gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-100">
                <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.tone === "red" ? "bg-rose-500" : t.tone === "amber" ? "bg-amber-500" : "bg-violet-500"}`}>{t.n}</span>
                <span className="text-sm font-medium text-slate-800">{t.text}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Operational Health" value={health} suffix="%" tone={health > 75 ? "green" : health > 55 ? "amber" : "red"} icon={<Gauge className="h-4 w-4" />} />
        <StatCard label="Readiness" value={readiness} suffix="%" tone="green" icon={<CloudRain className="h-4 w-4" />} />
        <StatCard label="Overdue" value={ostats.overdue} tone="red" icon={<AlertOctagon className="h-4 w-4" />} />
        <StatCard label="Asset Functionality" value={astats.total ? Math.round((astats.functional / astats.total) * 100) : 100} suffix="%" tone="teal" icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Service Performance" value={metrics.completionPct} suffix="%" tone="blue" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Participation" value={state.activities.length} tone="violet" icon={<HeartHandshake className="h-4 w-4" />} />
      </div>

      {/* GP reference vs demo dataset */}
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><span className="text-2xl font-bold text-slate-900">{DISTRICT_GP_REFERENCE.toLocaleString("en-IN")}</span><span className="text-sm text-slate-500">Gram Panchayats</span><RefBadge kind="OFFICIAL_REFERENCE" /></div>
          <div className="flex items-center gap-2"><span className="text-2xl font-bold text-slate-900">{DEMO_GP_COUNT}</span><span className="text-sm text-slate-500">represented in demo dataset</span><RefBadge kind="DEMO_DATA" /></div>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Monthly Improvement Scenario" subtitle="Illustrative pilot outcome scenario" icon={<Building2 className="h-4 w-4" />} action={<RefBadge kind="ILLUSTRATIVE_KPI" />} />
          <CardBody>
            <LineTrend data={IMPROVEMENT_TREND} lines={[{ key: "overdue", color: "#f43f5e", label: "Overdue" }, { key: "readiness", color: "#199e8f", label: "Readiness %" }]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Top Systemic Blockers" icon={<ShieldAlert className="h-4 w-4" />} action={<RefBadge kind="LIVE_DEMO_STATE" />} />
          <CardBody>
            {blockers.length ? <BarChartMini horizontal data={blockers.slice(0, 6).map((b) => ({ name: b.category, value: b.count, color: "#1a3f73" }))} height={Math.max(160, blockers.length * 30)} /> : <p className="py-8 text-center text-sm text-slate-400">No systemic blockers.</p>}
          </CardBody>
        </Card>
      </div>

      {/* Outcome changes — baseline vs current live demo state */}
      <SectionCard title="Outcome Changes — Baseline vs Current" titleMr="निष्पत्ती बदल" subtitle="Computed from the live demo state against the seeded baseline snapshot" icon={<TrendingDown className="h-4 w-4" />} action={<RefBadge kind="LIVE_DEMO_STATE" />}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OutcomeCard label="Non-functional Assets" from={baseline.nonFunctionalAssets} to={metrics.nonFunctionalAssets} lowerBetter />
          <OutcomeCard label="Overdue Obligations" from={baseline.overdueObligations} to={metrics.overdueObligations} lowerBetter />
          <OutcomeCard label="Open Repairs" from={baseline.openRepairs} to={metrics.openRepairs} lowerBetter />
          <OutcomeCard label="Readiness %" from={baseline.readinessPct} to={metrics.readinessPct} suffix="%" />
        </div>
        <p className="mt-3 text-xs italic text-slate-400">Make changes anywhere in the demo (e.g. verify a repair) and these outcome figures move — proving upward data flow.</p>
      </SectionCard>

      {/* Successful process improvements */}
      {doneExperiments.length > 0 && (
        <SectionCard title="Successful Process Improvements" subtitle="From the Process Improvement Lab" icon={<TrendingUp className="h-4 w-4" />} action={<Link href="/app/process-lab" className="text-xs text-brand-600 hover:underline">Open Lab</Link>}>
          <div className="grid gap-3 sm:grid-cols-3">
            {doneExperiments.map((e: ProcessExperiment) => (
              <div key={e.id} className="rounded-xl border border-slate-100 bg-emerald-50/40 p-3">
                <p className="text-sm font-medium text-slate-800">{e.experiment}</p>
                <p className="mt-1 text-xs text-slate-500">{e.baselineMetric}: <span className="text-slate-400 line-through">{e.baselineValue}{e.unit === "%" ? "%" : ` ${e.unit}`}</span> → <span className="font-bold text-emerald-600">{e.currentValue}{e.unit === "%" ? "%" : ` ${e.unit}`}</span></p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function OutcomeCard({ label, from, to, suffix = "", lowerBetter }: { label: string; from: number; to: number; suffix?: string; lowerBetter?: boolean }) {
  const improved = lowerBetter ? to < from : to > from;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-lg text-slate-400 line-through">{from}{suffix}</span>
        <span className={`text-xl font-bold ${improved ? "text-emerald-600" : to === from ? "text-slate-800" : "text-rose-600"}`}>→ {to}{suffix}</span>
        {to !== from && (improved ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ZP elected roles (read-oriented)
// ---------------------------------------------------------------------------
export function ZpElectedDashboard({ title }: { title: string }) {
  const { state } = useStore();
  const { user } = useAuth();
  const summaries = blockSummaries(state);
  const readiness = districtReadiness(state);
  const completed = state.obligations.filter((o) => o.status === "COMPLETED" || o.status === "VERIFIED").length;
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`${title} · Zilla Parishad Yavatmal`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="District Readiness" value={readiness} suffix="%" tone="green" icon={<CloudRain className="h-4 w-4" />} />
        <StatCard label="Panchayat Samitis" value={16} tone="blue" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Public Outcomes" value={completed} tone="teal" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Participation" value={state.activities.length} tone="violet" icon={<HeartHandshake className="h-4 w-4" />} />
      </div>
      <SectionCard title="Panchayat Samiti Comparison" subtitle="Approved district outcomes (read-only)" icon={<Building2 className="h-4 w-4" />} action={<Link href="/app/transparency" className="text-xs text-brand-600 hover:underline">Public board</Link>}>
        <div className="space-y-2">
          {summaries.slice(0, 8).map((b) => (
            <RagRow key={b.blockId} name={b.name} nameMr={b.nameMr} rag={b.rag} reasons={b.reasons} metrics={[{ label: "Ready", value: `${b.readiness}%` }, { label: "Outcomes", value: b.overdue === 0 ? "On track" : `${b.overdue} pend` }]} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
