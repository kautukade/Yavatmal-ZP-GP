"use client";

import { useAuth, useStore } from "@/services/store";
import { forUser, dueBuckets, assetStats, repairStats, notificationsFor } from "@/utils/selectors";
import { StatCard, Card, CardBody, Button } from "@/components/ui/primitives";
import { Greeting, SectionCard, ObligationRow, AttentionList, ReadinessMeter, GovNote } from "@/components/dashboard/widgets";
import { readinessPct } from "@/utils/selectors";
import { VoiceNote } from "@/components/field/VoiceNote";
import { gpById } from "@/data/hierarchy";
import { fmtDate, relTime } from "@/utils/format";
import { ASSET_CONDITION } from "@/utils/labels";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertOctagon,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CloudRain,
  Droplets,
  FilePlus2,
  HeartHandshake,
  Mic,
  QrCode,
  Upload,
  Wrench,
} from "lucide-react";

// ---------------------------------------------------------------------------
// GRAM SEVAK — the most important daily dashboard (mobile-first, few actions)
// ---------------------------------------------------------------------------
export function GramSevakDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const s = forUser(state, user);
  const buckets = dueBuckets(s.obligations);
  const astats = assetStats(s.assets);
  const rstats = repairStats(s.repairs);
  const gpName = gpById(user?.gpId)?.name ?? "";
  const readiness = readinessPct(state, { gpId: user?.gpId });
  const seasonalDue = s.seasonal.filter((t) => t.status !== "DONE").length;
  const servicePending = s.services.filter((sv) => sv.status !== "COMPLETED").length;

  const quickActions = [
    { label: "Add Status", icon: ClipboardList, href: "/app/pathpurava" },
    { label: "Report Blocker", icon: AlertOctagon, href: "/app/pathpurava" },
    { label: "Scan Asset", icon: QrCode, href: "/app/nigaa" },
    { label: "Add Evidence", icon: Upload, href: "/app/documents" },
    { label: "Complete Task", icon: CheckCircle2, href: "/app/my-work" },
  ];

  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`My Gram Panchayat · ${gpName}`} />

      {/* Today cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Due Today" value={buckets.dueToday.length} tone="blue" icon={<CalendarClock className="h-4 w-4" />} onClick={() => router.push("/app/my-work")} />
        <StatCard label="Overdue" value={buckets.overdue.length} tone="red" icon={<AlertOctagon className="h-4 w-4" />} onClick={() => router.push("/app/pathpurava")} />
        <StatCard label="Blocked" value={buckets.blocked.length} tone="amber" icon={<AlertOctagon className="h-4 w-4" />} onClick={() => router.push("/app/pathpurava")} />
        <StatCard label="Asset Checks" value={astats.checkDue + astats.nonFunctional} tone="teal" icon={<Wrench className="h-4 w-4" />} onClick={() => router.push("/app/nigaa")} />
        <StatCard label="Service Items" value={servicePending} tone="violet" icon={<ClipboardList className="h-4 w-4" />} onClick={() => router.push("/app/services")} />
        <StatCard label="Seasonal" value={seasonalDue} tone="teal" icon={<CloudRain className="h-4 w-4" />} onClick={() => router.push("/app/seasonal")} />
      </div>

      {/* Quick actions */}
      <Card>
        <CardBody className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center transition-colors hover:border-brand-200 hover:bg-brand-50">
              <a.icon className="h-5 w-5 text-brand-600" />
              <span className="text-[11px] font-medium leading-tight text-slate-700">{a.label}</span>
            </Link>
          ))}
          <VoiceNote trigger={(open) => (
            <button onClick={open} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center transition-colors hover:border-brand-200 hover:bg-brand-50">
              <Mic className="h-5 w-5 text-brand-600" />
              <span className="text-[11px] font-medium leading-tight text-slate-700">Voice Note</span>
            </button>
          )} />
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="My Work This Week" subtitle="Upcoming deadlines in the next 7 days" icon={<ClipboardList className="h-4 w-4" />} action={<Link href="/app/my-work" className="text-xs text-brand-600 hover:underline">View all</Link>}>
          <div className="space-y-0.5">
            {buckets.upcoming.length === 0 && buckets.dueToday.length === 0 ? (
              <AttentionList items={[]} empty="No work due this week" />
            ) : (
              [...buckets.dueToday, ...buckets.upcoming].slice(0, 6).map((o) => <ObligationRow key={o.id} o={o} />)
            )}
          </div>
        </SectionCard>

        <SectionCard title="Needs Follow-up" subtitle="Blocked & overdue matters" icon={<AlertOctagon className="h-4 w-4" />}>
          <AttentionList
            items={[...buckets.blocked, ...buckets.overdue].slice(0, 6).map((o) => ({
              id: o.id,
              title: o.title,
              sub: `${o.id} · ${o.blockers[0]?.category ?? "Overdue"} · due ${relTime(o.dueDate)}`,
              tone: o.status === "BLOCKED" ? ("amber" as const) : ("red" as const),
              badge: o.status === "BLOCKED" ? "Blocked" : "Overdue",
              href: "/app/pathpurava",
            }))}
            empty="No follow-ups pending"
          />
        </SectionCard>

        <SectionCard title="Repair Status" subtitle="Asset repair tickets" icon={<Wrench className="h-4 w-4" />} action={<Link href="/app/nigaa" className="text-xs text-brand-600 hover:underline">NIGAA</Link>}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-bold text-slate-800">{rstats.open}</p><p className="text-xs text-slate-400">Open</p></div>
            <div><p className="text-2xl font-bold text-rose-600">{rstats.overdue}</p><p className="text-xs text-slate-400">&gt; 30 days</p></div>
            <div><p className="text-2xl font-bold text-emerald-600">{rstats.verified}</p><p className="text-xs text-slate-400">Closed</p></div>
          </div>
          <div className="mt-3">
            <ReadinessMeter label="GP Seasonal Readiness" value={readiness} />
          </div>
          <GovNote />
        </SectionCard>

        <SectionCard title="Recent Notifications" icon={<CalendarClock className="h-4 w-4" />} action={<Link href="/app/notifications" className="text-xs text-brand-600 hover:underline">All</Link>}>
          <AttentionList
            items={notificationsFor(state, user).slice(0, 5).map((n) => ({ id: n.id, title: n.title, sub: n.body, tone: n.read ? ("slate" as const) : ("blue" as const), href: n.link }))}
            empty="No notifications"
          />
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GP STAFF
// ---------------------------------------------------------------------------
export function GpStaffDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const s = forUser(state, user);
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`Office support · ${gpById(user?.gpId)?.name}`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Service Intake" value={s.services.length} tone="blue" icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="Pending Docs" value={s.services.filter((x) => x.status === "PENDING_DOCS").length} tone="amber" icon={<Upload className="h-4 w-4" />} />
        <StatCard label="Evidence Queue" value={s.obligations.filter((o) => o.status === "UNDER_REVIEW").length} tone="violet" icon={<Upload className="h-4 w-4" />} />
        <StatCard label="Assigned Actions" value={s.obligations.filter((o) => o.status === "ASSIGNED").length} tone="teal" icon={<ListIcon />} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Service Intake" subtitle="Demo service applications at the front desk" icon={<ClipboardList className="h-4 w-4" />} action={<Link href="/app/services" className="text-xs text-brand-600 hover:underline">Seva Ghadyal</Link>}>
          <AttentionList items={s.services.slice(0, 6).map((sv) => ({ id: sv.id, title: sv.service, sub: `${sv.id} · ${sv.stage}`, tone: sv.overdue ? ("red" as const) : ("blue" as const), badge: sv.status.replace("_", " "), href: "/app/services" }))} />
        </SectionCard>
        <SectionCard title="Document / Evidence Queue" icon={<Upload className="h-4 w-4" />}>
          <AttentionList items={s.obligations.filter((o) => o.status === "UNDER_REVIEW").slice(0, 6).map((o) => ({ id: o.id, title: o.title, sub: o.id, tone: "violet" as const, badge: "Review", href: "/app/pathpurava" }))} empty="No documents awaiting" />
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// JE / Technical
// ---------------------------------------------------------------------------
export function JeDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  // JE sees repairs assigned to their role in their block
  const repairs = state.repairs.filter((r) => r.blockId === user?.blockId);
  const assigned = repairs.filter((r) => ["ASSIGNED", "INSPECTED", "REPAIR_IN_PROGRESS"].includes(r.status));
  const verifyPending = repairs.filter((r) => r.status === "REPAIR_CLAIMED_COMPLETE" || r.status === "VERIFICATION_PENDING");
  const assets = state.assets.filter((a) => a.blockId === user?.blockId);
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub="Technical inspections & repair execution" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Assigned Inspections" value={assigned.length} tone="blue" icon={<Wrench className="h-4 w-4" />} onClick={() => router.push("/app/nigaa")} />
        <StatCard label="Verification Pending" value={verifyPending.length} tone="violet" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => router.push("/app/nigaa")} />
        <StatCard label="Non-functional Assets" value={assets.filter((a) => a.condition === "NON_FUNCTIONAL").length} tone="red" icon={<AlertOctagon className="h-4 w-4" />} onClick={() => router.push("/app/nigaa")} />
        <StatCard label="Under Repair" value={assets.filter((a) => a.condition === "UNDER_REPAIR").length} tone="amber" icon={<Wrench className="h-4 w-4" />} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Repair Tickets" subtitle="Assigned to technical desk" icon={<Wrench className="h-4 w-4" />} action={<Link href="/app/nigaa" className="text-xs text-brand-600 hover:underline">Open NIGAA</Link>}>
          <AttentionList items={assigned.slice(0, 7).map((r) => ({ id: r.id, title: `${r.assetCode} — ${r.issue}`, sub: `${r.id} · ${gpById(r.gpId)?.name} · ${r.status.replace(/_/g, " ")}`, tone: "blue" as const, badge: r.priority, href: "/app/nigaa" }))} empty="No repairs assigned" />
        </SectionCard>
        <SectionCard title="Pending Closure Verification" icon={<CheckCircle2 className="h-4 w-4" />}>
          <AttentionList items={verifyPending.map((r) => ({ id: r.id, title: `${r.assetCode} — ${r.issue}`, sub: `${r.id} · claimed complete`, tone: "violet" as const, badge: "Verify", href: "/app/nigaa" }))} empty="Nothing to verify" />
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VWSC
// ---------------------------------------------------------------------------
export function VwscDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const waterAssets = state.assets.filter((a) => a.gpId === user?.gpId && ["Hand Pump", "Borewell", "Water Tank", "Pipeline", "Public Toilet"].includes(a.type));
  const dueChecks = waterAssets.filter((a) => a.condition === "CHECK_DUE");
  const failures = waterAssets.filter((a) => a.condition === "NON_FUNCTIONAL");
  const readiness = readinessPct(state, { gpId: user?.gpId });
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`Water & Sanitation Committee · ${gpById(user?.gpId)?.name}`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Assigned Assets" value={waterAssets.length} tone="teal" icon={<Droplets className="h-4 w-4" />} onClick={() => router.push("/app/nigaa")} />
        <StatCard label="Due Inspections" value={dueChecks.length} tone="amber" icon={<QrCode className="h-4 w-4" />} onClick={() => router.push("/app/nigaa")} />
        <StatCard label="Reported Failures" value={failures.length} tone="red" icon={<AlertOctagon className="h-4 w-4" />} onClick={() => router.push("/app/nigaa")} />
        <StatCard label="Readiness" value={readiness} suffix="%" tone="green" icon={<CloudRain className="h-4 w-4" />} />
      </div>
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Quick asset check</p>
            <Button onClick={() => router.push("/app/nigaa")} size="sm"><QrCode className="h-4 w-4" /> Scan QR</Button>
          </div>
          <p className="mt-1 text-xs text-slate-500">Scan an asset QR to record Functional / Partial / Non-functional with a photo and note.</p>
        </CardBody>
      </Card>
      <SectionCard title="Water & Sanitation Assets" subtitle="Your quarterly inspection responsibility" icon={<Droplets className="h-4 w-4" />}>
        <AttentionList items={waterAssets.slice(0, 8).map((a) => ({ id: a.id, title: `${a.code} — ${a.name}`, sub: `Last checked ${relTime(a.lastChecked)}`, tone: a.condition === "NON_FUNCTIONAL" ? ("red" as const) : a.condition === "CHECK_DUE" ? ("amber" as const) : ("green" as const), badge: ASSET_CONDITION[a.condition].en, href: "/app/nigaa" }))} />
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CITIZEN
// ---------------------------------------------------------------------------
export function CitizenDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const gpId = user?.gpId;
  const decisions = state.gramSabhaDecisions.filter((dcn) => state.gramSabhaMeetings.some((m) => m.gpId === gpId && m.decisions.includes(dcn.id)) && dcn.publishedPublic);
  const upcoming = state.gramSabhaMeetings.find((m) => m.gpId === gpId && m.type === "upcoming");
  const activities = state.activities.filter((a) => a.publishedPublic);
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`My Village · ${gpById(gpId)?.name}`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="My Applications" value={2} tone="blue" icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard label="My Participation" value={1} tone="teal" icon={<HeartHandshake className="h-4 w-4" />} />
        <StatCard label="Public Decisions" value={decisions.length} tone="violet" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Upcoming Gram Sabha" value={upcoming ? 1 : 0} tone="amber" icon={<CalendarClock className="h-4 w-4" />} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Public Decisions in My Village" icon={<CheckCircle2 className="h-4 w-4" />} action={<Link href="/app/transparency" className="text-xs text-brand-600 hover:underline">Transparency</Link>}>
          <AttentionList items={decisions.slice(0, 5).map((dcn) => ({ id: dcn.id, title: dcn.decision, sub: `${fmtDate(dcn.date)} · ${dcn.status}`, tone: dcn.status === "COMPLETED" ? ("green" as const) : ("amber" as const), badge: dcn.status }))} empty="No public decisions yet" />
        </SectionCard>
        <SectionCard title="Ways to Participate" subtitle="Approved community activities" icon={<HeartHandshake className="h-4 w-4" />} action={<Link href="/app/participation" className="text-xs text-brand-600 hover:underline">Participate</Link>}>
          <AttentionList items={activities.slice(0, 5).map((a) => ({ id: a.id, title: a.title, sub: `${fmtDate(a.date)} · needs ${a.needsVolunteers} volunteers`, tone: "teal" as const, badge: a.status, href: "/app/participation" }))} empty="No open activities" />
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GRAM SABHA MEMBER
// ---------------------------------------------------------------------------
export function GramSabhaMemberDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const gpId = user?.gpId;
  const upcoming = state.gramSabhaMeetings.find((m) => m.gpId === gpId && m.type === "upcoming");
  const prev = state.gramSabhaMeetings.find((m) => m.gpId === gpId && m.type === "previous");
  const decisions = state.gramSabhaDecisions.filter((dcn) => prev?.decisions.includes(dcn.id));
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub={`Gram Sabha Member · ${gpById(gpId)?.name}`} />
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Upcoming Meeting" icon={<CalendarClock className="h-4 w-4" />}>
          {upcoming ? (
            <div className="space-y-2 text-sm">
              <p className="text-lg font-bold text-slate-800">{fmtDate(upcoming.date)}</p>
              <p className="text-slate-500">Notice issued {fmtDate(upcoming.noticeDate)}</p>
              <p className="text-slate-500">Departments invited: {upcoming.departmentsInvited.join(", ")}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No upcoming meeting scheduled.</p>
          )}
        </SectionCard>
        <SectionCard title="Previous Decisions & Action Taken" icon={<CheckCircle2 className="h-4 w-4" />} action={<Link href="/app/gramsabha" className="text-xs text-brand-600 hover:underline">Gram Sabha Darpan</Link>}>
          <AttentionList items={decisions.map((dcn) => ({ id: dcn.id, title: dcn.decision, sub: dcn.actionTaken, tone: dcn.status === "COMPLETED" ? ("green" as const) : ("amber" as const), badge: dcn.status }))} empty="No decisions recorded" />
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VOLUNTEER
// ---------------------------------------------------------------------------
export function VolunteerDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const vol = state.volunteers.find((v) => v.userId === user?.id);
  const open = state.activities.filter((a) => a.status === "OPEN");
  const joined = state.activities.filter((a) => vol?.activitiesJoined.includes(a.id));
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub="Community volunteer" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Verified Hours" value={vol?.totalHours ?? 0} tone="teal" icon={<HeartHandshake className="h-4 w-4" />} />
        <StatCard label="Registered" value={joined.length} tone="blue" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Open Activities" value={open.length} tone="amber" icon={<CalendarClock className="h-4 w-4" />} />
        <StatCard label="Skills" value={vol?.skills.length ?? 0} tone="violet" icon={<ListIcon />} />
      </div>
      <SectionCard title="Upcoming Volunteer Activities" icon={<HeartHandshake className="h-4 w-4" />} action={<Link href="/app/participation" className="text-xs text-brand-600 hover:underline">Register</Link>}>
        <AttentionList items={open.map((a) => ({ id: a.id, title: a.title, sub: `${fmtDate(a.date)} · ${gpById(a.gpId)?.name}`, tone: "teal" as const, badge: `${a.registeredVolunteers.length}/${a.needsVolunteers}`, href: "/app/participation" }))} empty="No open activities" />
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHG REP
// ---------------------------------------------------------------------------
export function ShgDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  const activities = state.activities.filter((a) => a.gpId === user?.gpId);
  const inst = state.institutions.filter((i) => i.gpId === user?.gpId && i.category === "SHG");
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub="SHG / Community Group Representative" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Assigned Activities" value={activities.length} tone="blue" icon={<HeartHandshake className="h-4 w-4" />} />
        <StatCard label="Collaboration Requests" value={2} tone="amber" icon={<ListIcon />} />
        <StatCard label="SHG Responsibilities" value={inst.reduce((s, i) => s + i.assignedTasks, 0)} tone="teal" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>
      <SectionCard title="Contribution Opportunities" icon={<HeartHandshake className="h-4 w-4" />} action={<Link href="/app/participation" className="text-xs text-brand-600 hover:underline">View</Link>}>
        <AttentionList items={activities.map((a) => ({ id: a.id, title: a.title, sub: `${fmtDate(a.date)} · ${a.contributionTypes.join(", ")}`, tone: "teal" as const, badge: a.status, href: "/app/participation" }))} empty="No activities assigned" />
      </SectionCard>
    </div>
  );
}

function ListIcon() {
  return <ClipboardList className="h-4 w-4" />;
}
