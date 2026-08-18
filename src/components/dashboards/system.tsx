"use client";

import { useAuth, useStore } from "@/services/store";
import { StatCard } from "@/components/ui/primitives";
import { Greeting, SectionCard, AttentionList } from "@/components/dashboard/widgets";
import { fmtDateTime } from "@/utils/format";
import { ROLES } from "@/data/roles";
import Link from "next/link";
import { Database, ShieldCheck, Users, History } from "lucide-react";

export function SysadminDashboard() {
  const { state } = useStore();
  const { user } = useAuth();
  return (
    <div className="space-y-5">
      <Greeting name={user?.name ?? ""} sub="System Administration · Demo configuration & technical audit" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Users" value={state.users.length} tone="blue" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Roles" value={Object.keys(ROLES).length} tone="teal" icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Records" value={state.obligations.length + state.assets.length + state.repairs.length} tone="violet" icon={<Database className="h-4 w-4" />} />
        <StatCard label="Audit Entries" value={state.auditLogs.length} tone="amber" icon={<History className="h-4 w-4" />} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="Administration" subtitle="Manage users, roles and demo data" icon={<ShieldCheck className="h-4 w-4" />} action={<Link href="/app/admin" className="text-xs text-brand-600 hover:underline">Open Admin</Link>}>
          <AttentionList
            items={[
              { id: "a1", title: "Users & Roles", sub: "Create, disable, assign role/GP/block/department", tone: "blue", href: "/app/admin" },
              { id: "a2", title: "Master data & configuration", sub: "Blocks, GPs, departments (demo)", tone: "blue", href: "/app/admin" },
              { id: "a3", title: "Reset demo data", sub: "Restore all seed data", tone: "amber", href: "/app/settings" },
            ]}
          />
          <p className="mt-3 text-xs italic text-slate-400">Admin cannot silently change a verified Government outcome.</p>
        </SectionCard>
        <SectionCard title="Recent Technical Audit Log" icon={<History className="h-4 w-4" />} action={<Link href="/app/audit" className="text-xs text-brand-600 hover:underline">Full trail</Link>}>
          <AttentionList items={state.auditLogs.slice(0, 6).map((a) => ({ id: a.id, title: `${a.action} — ${a.entity} ${a.entityId}`, sub: `${a.actor} · ${fmtDateTime(a.ts)}`, tone: "slate" as const }))} empty="No audit entries" />
        </SectionCard>
      </div>
    </div>
  );
}
