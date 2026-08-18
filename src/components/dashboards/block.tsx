"use client";

import { useAuth, useStore } from "@/services/store";
import {
  forUser,
  obligationStats,
  assetStats,
  repairStats,
  systemicBlockers,
  gpSummaries,
  readinessPct,
} from "@/utils/selectors";
import { StatCard, Card, CardBody, CardHeader, Button } from "@/components/ui/primitives";
import { Greeting, SectionCard, AttentionList, RagRow, ReadinessMeter } from "@/components/dashboard/widgets";
import { BarChartMini, DonutChart, ChartLegend } from "@/components/ui/charts";
import { gpsInBlock, gpById, blockById } from "@/data/hierarchy";
import { relTime } from "@/utils/format";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertOctagon, Building2, CheckCircle2, CloudRain, Layers, ShieldAlert, Wrench } from "lucide-react";

// ---------------------------------------------------------------------------
// BDO — main block command dashboard (exceptions first)
// ---------------------------------------------------------------------------
export function BdoDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const blockId = user?.blockId ?? "b-yavatmal";
  const gps = gpsInBlock(blockId);
  const summaries = gpSummaries(state, gps.map((g) => g.id));
  const s = forUser(state, user);
  const ostats = obligationStats(s.obligations);
  const astats = assetStats(s.assets);
  const rstats = repairStats(s.repairs);
  const blockers = systemicBlockers(s.obligations);
  const readiness = readinessPct(state, { blockId });

  const green = summaries.filter((x) => x.rag === "GREEN").length;
  const amber = summaries.filter((x) => x.rag === "AMBER").length;
  const red = summaries.filter((x) => x.rag === "RED").length;
  const needIntervention = summaries.filter((x) => x.rag !== "GREEN").sort((a, b) => (a.rag === "RED" ? -1 : 1));

  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`Block Operations Command · ${blockById(blockId)?.name} Panchayat Samiti`} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <StatCard label="Demo GPs Loaded" value={gps.length} tone="blue" icon={<Building2 className="h-4 w-4" />} hint={`${blockById(blockId)?.name} block · demo dataset`} />
        <StatCard label="Active Obligations" value={ostats.active} tone="blue" icon={<Layers className="h-4 w-4" />} />
        <StatCard label="Overdue" value={ostats.overdue} tone="red" icon={<AlertOctagon className="h-4 w-4" />} onClick={() => router.push("/app/pathpurava")} />
        <StatCard label="Blocked" value={ostats.blocked} tone="amber" icon={<ShieldAlert className="h-4 w-4" />} onClick={() => router.push("/app/pathpurava")} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Non-functional Assets" value={astats.nonFunctional} tone="red" icon={<Wrench className="h-4 w-4" />} onClick={() => router.push("/app/nigaa")} />
        <StatCard label="Repairs > 30 days" value={rstats.overdue} tone="amber" icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Seasonal Readiness" value={readiness} suffix="%" tone="green" icon={<CloudRain className="h-4 w-4" />} />
        <StatCard label="Service Pendency" value={s.services.filter((x) => x.status !== "COMPLETED").length} tone="violet" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {/* GP status distribution + blocker chart */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="GP Status" subtitle="Green / Amber / Red" icon={<Building2 className="h-4 w-4" />} />
          <CardBody>
            <DonutChart
              data={[
                { name: "On Track", value: green, color: "#10b981" },
                { name: "Attention", value: amber, color: "#f59e0b" },
                { name: "Critical", value: red, color: "#f43f5e" },
              ]}
            />
            <ChartLegend items={[{ label: "On Track", color: "#10b981" }, { label: "Attention", color: "#f59e0b" }, { label: "Critical", color: "#f43f5e" }]} />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Blocker Categories" subtitle="What is holding work back in this block" icon={<ShieldAlert className="h-4 w-4" />} />
          <CardBody>
            {blockers.length ? (
              <BarChartMini horizontal data={blockers.map((b) => ({ name: b.category, value: b.count, color: "#1f4e8f" }))} height={Math.max(180, blockers.length * 34)} />
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No active blockers.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Most important: GPs needing intervention */}
      <SectionCard title="GPs Needing Intervention" titleMr="लक्ष देण्याजोग्या ग्रामपंचायती" subtitle="Exceptions first — not every record" icon={<AlertOctagon className="h-4 w-4" />} action={<Link href="/app/reports" className="text-xs text-brand-600 hover:underline">Block report</Link>}>
        <div className="space-y-2">
          {needIntervention.length === 0 ? (
            <p className="py-6 text-center text-sm text-emerald-600">All GPs on track in this block.</p>
          ) : (
            needIntervention.map((g) => (
              <RagRow
                key={g.gpId}
                name={g.name}
                nameMr={g.nameMr}
                rag={g.rag}
                reasons={g.reasons}
                href="/app/pathpurava"
                metrics={[
                  { label: "Overdue", value: g.overdue },
                  { label: "Blocked", value: g.blocked },
                  { label: "Non-func", value: g.nonFunctional },
                  { label: "Ready", value: `${g.readiness}%` },
                ]}
              />
            ))
          )}
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Oldest Pending Files" subtitle="GP File Flow ageing" icon={<Building2 className="h-4 w-4" />} action={<Link href="/app/pathpurava/file-flow" className="text-xs text-brand-600 hover:underline">Open</Link>}>
          <AttentionList
            items={(state.gpFiles ?? []).filter((f) => f.blockId === blockId && f.status !== "COMPLETED").sort((a, b) => new Date(a.pendingSince).getTime() - new Date(b.pendingSince).getTime()).slice(0, 5).map((f) => ({ id: f.id, title: f.title, sub: `${f.id} · ${gpById(f.gpId)?.name} · ${f.currentDesk}`, tone: "amber" as const, badge: f.status.replace(/_/g, " "), href: "/app/pathpurava/file-flow" }))}
            empty="No pending files"
          />
        </SectionCard>
        <SectionCard title="Complaint Routing Exceptions" subtitle="Open / external complaints" icon={<ShieldAlert className="h-4 w-4" />} action={<Link href="/app/complaint-routing" className="text-xs text-brand-600 hover:underline">Open</Link>}>
          <AttentionList
            items={(state.complaints ?? []).filter((c) => c.blockId === blockId && c.status !== "RESOLVED" && c.status !== "CLOSED").slice(0, 5).map((c) => ({ id: c.id, title: c.category, sub: `${c.id} · ${gpById(c.gpId)?.name} · → ${c.suggestedAuthority}`, tone: c.isExternal ? ("red" as const) : ("amber" as const), badge: c.isExternal ? "External" : c.status, href: "/app/complaint-routing" }))}
            empty="No open complaints"
          />
        </SectionCard>
        <SectionCard title="SAMARTH Adoption Support" subtitle="GPs needing support" icon={<Building2 className="h-4 w-4" />} action={<Link href="/app/mahsul-sandhi" className="text-xs text-brand-600 hover:underline">Open</Link>}>
          <AttentionList
            items={(state.adoption ?? []).filter((a) => a.blockId === blockId && a.items.some((i) => i.state === "NEEDS_SUPPORT" || i.state === "NOT_STARTED")).slice(0, 5).map((a) => ({ id: a.id, title: gpById(a.gpId)?.name ?? a.gpId, sub: `${a.items.filter((i) => i.state === "ACTIVE").length}/${a.items.length} steps active`, tone: "amber" as const, badge: "Support", href: "/app/mahsul-sandhi" }))}
            empty="All GPs progressing"
          />
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EXTENSION OFFICER — review across assigned GPs
// ---------------------------------------------------------------------------
export function ExtensionOfficerDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const s = forUser(state, user);
  const gpIds = user?.assignedGpIds ?? [];
  const summaries = gpSummaries(state, gpIds);
  const awaitingReview = s.obligations.filter((o) => o.status === "UNDER_REVIEW");
  const overdue = s.obligations.filter((o) => o.status === "OVERDUE");
  const blockers = systemicBlockers(s.obligations);
  const handoverAlerts = state.handovers.filter((h) => gpIds.includes(h.gpId) && !h.accepted);
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`Extension Officer · ${gpIds.length} assigned GPs`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="GPs Assigned" value={gpIds.length} tone="blue" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Evidence to Review" value={awaitingReview.length} tone="violet" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => router.push("/app/pathpurava")} />
        <StatCard label="Overdue Obligations" value={overdue.length} tone="red" icon={<AlertOctagon className="h-4 w-4" />} onClick={() => router.push("/app/pathpurava")} />
        <StatCard label="Handover Alerts" value={handoverAlerts.length} tone="amber" icon={<ShieldAlert className="h-4 w-4" />} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Evidence Awaiting Review" subtitle="Review · Return · Verify · Escalate" icon={<CheckCircle2 className="h-4 w-4" />}>
          <AttentionList items={awaitingReview.slice(0, 7).map((o) => ({ id: o.id, title: o.title, sub: `${o.id} · ${gpById(o.gpId)?.name}`, tone: "violet" as const, badge: "Review", href: "/app/pathpurava" }))} empty="No evidence pending" />
        </SectionCard>
        <SectionCard title="Repeated Blockers" subtitle="Patterns across your GPs" icon={<ShieldAlert className="h-4 w-4" />}>
          <AttentionList items={blockers.map((b) => ({ id: b.category, title: b.category, sub: `${b.count} obligations across ${b.gpCount} GP(s)`, tone: "amber" as const, badge: String(b.count) }))} empty="No repeated blockers" />
        </SectionCard>
      </div>
      <SectionCard title="GPs Requiring Attention" icon={<AlertOctagon className="h-4 w-4" />}>
        <div className="space-y-2">
          {summaries.filter((g) => g.rag !== "GREEN").map((g) => (
            <RagRow key={g.gpId} name={g.name} nameMr={g.nameMr} rag={g.rag} reasons={g.reasons} href="/app/pathpurava" metrics={[{ label: "Overdue", value: g.overdue }, { label: "Blocked", value: g.blocked }, { label: "Ready", value: `${g.readiness}%` }]} />
          ))}
          {summaries.every((g) => g.rag === "GREEN") && <p className="py-6 text-center text-sm text-emerald-600">All assigned GPs on track.</p>}
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ASSISTANT BDO
// ---------------------------------------------------------------------------
export function AbdoDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const s = forUser(state, user);
  const escalations = s.obligations.filter((o) => o.escalationLevel >= 1);
  const exceptions = gpSummaries(state, gpsInBlock(user?.blockId ?? "b-yavatmal").map((g) => g.id)).filter((g) => g.rag !== "GREEN");
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub="Assistant Block Development Officer" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Delegated Reviews" value={s.obligations.filter((o) => o.status === "UNDER_REVIEW").length} tone="violet" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="GP Exceptions" value={exceptions.length} tone="amber" icon={<AlertOctagon className="h-4 w-4" />} />
        <StatCard label="Pending Escalations" value={escalations.length} tone="red" icon={<ShieldAlert className="h-4 w-4" />} />
        <StatCard label="Readiness" value={readinessPct(state, { blockId: user?.blockId })} suffix="%" tone="green" />
      </div>
      <SectionCard title="GP Exceptions & Escalations" icon={<AlertOctagon className="h-4 w-4" />}>
        <div className="space-y-2">
          {exceptions.map((g) => (
            <RagRow key={g.gpId} name={g.name} nameMr={g.nameMr} rag={g.rag} reasons={g.reasons} href="/app/pathpurava" metrics={[{ label: "Overdue", value: g.overdue }, { label: "Blocked", value: g.blocked }]} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BLOCK DEPARTMENT OFFICER — department-scoped
// ---------------------------------------------------------------------------
export function BlockDeptOfficerDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const dept = user?.departmentId;
  const obs = state.obligations.filter((o) => o.blockId === user?.blockId && o.departmentId === dept);
  const ostats = obligationStats(obs);
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`Block Department Officer · ${dept?.replace("dept-", "").toUpperCase()}`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Dept Obligations" value={ostats.total} tone="blue" icon={<Layers className="h-4 w-4" />} />
        <StatCard label="Overdue" value={ostats.overdue} tone="red" icon={<AlertOctagon className="h-4 w-4" />} />
        <StatCard label="Blocked" value={ostats.blocked} tone="amber" icon={<ShieldAlert className="h-4 w-4" />} />
        <StatCard label="Completed" value={ostats.completed + ostats.verified} tone="teal" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>
      <SectionCard title="Department Items" subtitle={`Only ${dept?.replace("dept-", "")} related matters`} icon={<Layers className="h-4 w-4" />}>
        <AttentionList items={obs.slice(0, 10).map((o) => ({ id: o.id, title: o.title, sub: `${o.id} · ${gpById(o.gpId)?.name} · ${o.status}`, tone: o.status === "OVERDUE" ? ("red" as const) : ("blue" as const), badge: o.status, href: "/app/pathpurava" }))} empty="No department items" />
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Elected block roles (read-oriented): PS Member, Up-Sabhapati, Sabhapati
// ---------------------------------------------------------------------------
export function BlockElectedDashboard({ title }: { title: string }) {
  const { state } = useStore();
  const { user } = useAuth();
  const blockId = user?.blockId ?? "b-yavatmal";
  const summaries = gpSummaries(state, gpsInBlock(blockId).map((g) => g.id));
  const readiness = readinessPct(state, { blockId });
  const completed = state.obligations.filter((o) => o.blockId === blockId && (o.status === "COMPLETED" || o.status === "VERIFIED")).length;
  const participation = state.activities.filter((a) => a.blockId === blockId).length;
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`${title} · ${blockById(blockId)?.name} Panchayat Samiti`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Block Readiness" value={readiness} suffix="%" tone="green" icon={<CloudRain className="h-4 w-4" />} />
        <StatCard label="GPs Tracked" value={summaries.length} tone="blue" icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Public Outcomes" value={completed} tone="teal" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Participation" value={participation} tone="violet" />
      </div>
      <SectionCard title="GP Progress & Public Outcomes" subtitle="Read-oriented elected oversight" icon={<Building2 className="h-4 w-4" />} action={<Link href="/app/transparency" className="text-xs text-brand-600 hover:underline">Public board</Link>}>
        <div className="space-y-2">
          {summaries.map((g) => (
            <RagRow key={g.gpId} name={g.name} nameMr={g.nameMr} rag={g.rag} reasons={g.reasons} metrics={[{ label: "Ready", value: `${g.readiness}%` }, { label: "Overdue", value: g.overdue }]} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
