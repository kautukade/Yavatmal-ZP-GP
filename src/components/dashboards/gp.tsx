"use client";

import { useAuth, useStore } from "@/services/store";
import { forUser, assetStats, obligationStats, readinessPct, gpRag } from "@/utils/selectors";
import { StatCard } from "@/components/ui/primitives";
import { Greeting, SectionCard, AttentionList, ReadinessMeter } from "@/components/dashboard/widgets";
import { RagPill } from "@/components/ui/common";
import { gpById } from "@/data/hierarchy";
import { relTime } from "@/utils/format";
import Link from "next/link";
import { AlertOctagon, CheckCircle2, CloudRain, HeartHandshake, Users, Wrench } from "lucide-react";

function useGpData() {
  const { state } = useStore();
  const { user } = useAuth();
  const s = forUser(state, user);
  const ostats = obligationStats(s.obligations);
  const astats = assetStats(s.assets);
  const readiness = readinessPct(state, { gpId: user?.gpId });
  const rag = gpRag(state, user?.gpId ?? "");
  const decisionsPending = state.gramSabhaDecisions.filter(
    (dcn) => state.gramSabhaMeetings.some((m) => m.gpId === user?.gpId && m.decisions.includes(dcn.id)) && dcn.status !== "COMPLETED"
  );
  const participation = s.activities.length;
  return { state, user, s, ostats, astats, readiness, rag, decisionsPending, participation };
}

// SARPANCH — polished elected leadership dashboard
export function SarpanchDashboard() {
  const { user, s, ostats, astats, readiness, rag, decisionsPending, participation } = useGpData();
  const attention = [...s.obligations.filter((o) => o.status === "OVERDUE" || o.status === "BLOCKED" || o.priority === "CRITICAL")].slice(0, 6);
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Greeting name={user?.name ?? ""} sub={`Sarpanch · ${gpById(user?.gpId)?.name}`} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">GP Status</span>
          <RagPill status={rag.status} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="GP Readiness" value={readiness} suffix="%" tone="green" icon={<CloudRain className="h-4 w-4" />} />
        <StatCard label="Pending Matters" value={ostats.active + ostats.overdue} tone="amber" icon={<AlertOctagon className="h-4 w-4" />} />
        <StatCard label="Non-functional Assets" value={astats.nonFunctional} tone="red" icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Gram Sabha Pending" value={decisionsPending.length} tone="violet" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Citizen Participation" value={participation} tone="teal" icon={<HeartHandshake className="h-4 w-4" />} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Top Attention Items" subtitle="What needs your leadership focus" icon={<AlertOctagon className="h-4 w-4" />}>
          <AttentionList items={attention.map((o) => ({ id: o.id, title: o.title, sub: `${o.id} · due ${relTime(o.dueDate)}`, tone: o.status === "BLOCKED" ? ("amber" as const) : ("red" as const), badge: o.status, href: "/app/pathpurava" }))} empty="No urgent items" />
        </SectionCard>
        <SectionCard title="Gram Sabha Decisions Pending" icon={<Users className="h-4 w-4" />} action={<Link href="/app/gramsabha" className="text-xs text-brand-600 hover:underline">Follow-through</Link>}>
          <AttentionList items={decisionsPending.map((dcn) => ({ id: dcn.id, title: dcn.decision, sub: dcn.actionTaken, tone: "violet" as const, badge: dcn.status, href: "/app/gramsabha" }))} empty="All decisions actioned" />
        </SectionCard>
      </div>
    </div>
  );
}

// UP-SARPANCH — GP executive oversight
export function UpSarpanchDashboard() {
  const { user, s, ostats, readiness, rag, participation } = useGpData();
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`Up-Sarpanch · ${gpById(user?.gpId)?.name}`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Readiness" value={readiness} suffix="%" tone="green" />
        <StatCard label="Attention Queue" value={ostats.overdue + ostats.blocked} tone="amber" icon={<AlertOctagon className="h-4 w-4" />} />
        <StatCard label="Under Review" value={ostats.underReview} tone="violet" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Participation" value={participation} tone="teal" icon={<HeartHandshake className="h-4 w-4" />} />
      </div>
      <SectionCard title="Attention Queue" subtitle="Local matters to review" icon={<AlertOctagon className="h-4 w-4" />}>
        <AttentionList items={s.obligations.filter((o) => ["OVERDUE", "BLOCKED", "UNDER_REVIEW"].includes(o.status)).slice(0, 8).map((o) => ({ id: o.id, title: o.title, sub: `${o.id} · due ${relTime(o.dueDate)}`, tone: o.status === "OVERDUE" ? ("red" as const) : ("amber" as const), badge: o.status, href: "/app/pathpurava" }))} empty="Queue is clear" />
      </SectionCard>
    </div>
  );
}

// GP MEMBER — read-oriented
export function GpMemberDashboard() {
  const { user, s, ostats, astats, readiness, rag } = useGpData();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Greeting name={user?.name ?? ""} sub={`GP Member · ${gpById(user?.gpId)?.name}`} />
        <RagPill status={rag.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Readiness" value={readiness} suffix="%" tone="green" />
        <StatCard label="Active Works" value={ostats.active} tone="blue" />
        <StatCard label="Completed" value={ostats.completed + ostats.verified} tone="teal" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Non-functional Assets" value={astats.nonFunctional} tone="red" icon={<Wrench className="h-4 w-4" />} />
      </div>
      <SectionCard title="GP Snapshot — Works & Action Status" icon={<CheckCircle2 className="h-4 w-4" />} action={<Link href="/app/transparency" className="text-xs text-brand-600 hover:underline">Public view</Link>}>
        <AttentionList items={s.obligations.slice(0, 8).map((o) => ({ id: o.id, title: o.title, sub: `${o.id} · ${o.status}`, tone: o.status === "VERIFIED" ? ("green" as const) : o.status === "OVERDUE" ? ("red" as const) : ("blue" as const), badge: o.status }))} />
      </SectionCard>
    </div>
  );
}
