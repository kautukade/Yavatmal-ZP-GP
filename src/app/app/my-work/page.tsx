"use client";

import { useAuth, useStore } from "@/services/store";
import { forUser, dueBuckets } from "@/utils/selectors";
import { Card, PageHeader, StatCard } from "@/components/ui/primitives";
import { SectionCard, ObligationRow } from "@/components/dashboard/widgets";
import { DemoBadge } from "@/components/ui/common";
import { AlertOctagon, CalendarClock, CheckCircle2, ShieldAlert } from "lucide-react";

export default function MyWorkPage() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const s = forUser(state, user);
  const mine = user?.gpId ? s.obligations.filter((o) => o.gpId === user.gpId) : s.obligations;
  const b = dueBuckets(mine);
  return (
    <div>
      <PageHeader title="My Work" titleMr="माझे काम" subtitle="Your assigned obligations and deadlines">
        <DemoBadge />
      </PageHeader>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Due Today" value={b.dueToday.length} tone="blue" icon={<CalendarClock className="h-4 w-4" />} />
        <StatCard label="Overdue" value={b.overdue.length} tone="red" icon={<AlertOctagon className="h-4 w-4" />} />
        <StatCard label="Blocked" value={b.blocked.length} tone="amber" icon={<ShieldAlert className="h-4 w-4" />} />
        <StatCard label="This Week" value={b.upcoming.length} tone="teal" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Due Today & This Week" icon={<CalendarClock className="h-4 w-4" />}>
          <div className="space-y-0.5">{[...b.dueToday, ...b.upcoming].map((o) => <ObligationRow key={o.id} o={o} />)}{![...b.dueToday, ...b.upcoming].length && <p className="py-6 text-center text-sm text-slate-400">Nothing due this week.</p>}</div>
        </SectionCard>
        <SectionCard title="Needs Follow-up" icon={<AlertOctagon className="h-4 w-4" />}>
          <div className="space-y-0.5">{[...b.blocked, ...b.overdue].map((o) => <ObligationRow key={o.id} o={o} />)}{![...b.blocked, ...b.overdue].length && <p className="py-6 text-center text-sm text-emerald-600">No follow-ups pending.</p>}</div>
        </SectionCard>
      </div>
    </div>
  );
}
