"use client";

import { useState } from "react";
import { RESEARCH_CONCEPTS, STATUS_META } from "@/data/researchMap";
import { Badge, Card, CardBody, PageHeader } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";

export default function ResearchMapPage() {
  const [group, setGroup] = useState<string>("");
  const groups: ("Website" | "Software" | "Mobile")[] = ["Website", "Software", "Mobile"];
  const filtered = group ? RESEARCH_CONCEPTS.filter((c) => c.group === group) : RESEARCH_CONCEPTS;

  return (
    <div>
      <PageHeader title="Research Opportunity → Unified Platform Mapping" titleMr="संशोधन नकाशा" subtitle="All 35 research concepts, consolidated into one platform — not 35 separate products.">
        <DemoBadge />
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setGroup("")} className={`rounded-full px-3 py-1 text-xs font-medium ${!group ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>All 35</button>
        {groups.map((g) => (
          <button key={g} onClick={() => setGroup(g)} className={`rounded-full px-3 py-1 text-xs font-medium ${group === g ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            {g} ({RESEARCH_CONCEPTS.filter((c) => c.group === g).length})
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((k) => (
          <div key={k} className="rounded-lg border border-slate-100 bg-white p-2 text-center">
            <p className="text-lg font-bold text-slate-800">{RESEARCH_CONCEPTS.filter((c) => c.status === k).length}</p>
            <p className="text-[10px] leading-tight text-slate-400">{STATUS_META[k].label}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-2.5">#</th><th className="px-4 py-2.5">Concept</th><th className="px-4 py-2.5">Group</th><th className="px-4 py-2.5">Unified Module</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Note</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.code} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{c.code}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">{c.name}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{c.group}</td>
                  <td className="px-4 py-2.5 text-slate-600">{c.module}</td>
                  <td className="px-4 py-2.5"><Badge tone={STATUS_META[c.status].tone}>{STATUS_META[c.status].label}</Badge></td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-4 text-xs italic text-slate-400">Consolidation principle: shared authentication, users, RBAC, data layer, navigation, audit, notifications, reports and evidence — reused across every module.</p>
    </div>
  );
}
