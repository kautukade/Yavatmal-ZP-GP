"use client";

import { useState } from "react";
import { useStore } from "@/services/store";
import { BLOCKS, GPS, gpsInBlock, gpById } from "@/data/hierarchy";
import { Badge, Card, CardBody, EmptyState, PageHeader, Select, Button } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/Tabs";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { readinessPct } from "@/utils/selectors";
import { fmtDate } from "@/utils/format";
import { Download, Eye, IndianRupee } from "lucide-react";

export default function TransparencyPage() {
  const [tab, setTab] = useState("board");
  return (
    <div>
      <PageHeader title="Public Transparency" titleMr="पारदर्शकता" subtitle="Purtata Phalak · Kar Jagruti · Open Data">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4">
        <Tabs active={tab} onChange={setTab} tabs={[{ key: "board", label: "Purtata Phalak" }, { key: "revenue", label: "Kar Jagruti" }, { key: "opendata", label: "Open Data" }]} />
      </div>
      {tab === "board" && <ComplianceBoard />}
      {tab === "revenue" && <RevenueTab />}
      {tab === "opendata" && <OpenDataTab />}
    </div>
  );
}

function ComplianceBoard() {
  const { state } = useStore();
  const [blockId, setBlockId] = useState("b-yavatmal");
  const [gpId, setGpId] = useState("gp-borgaon");
  const gps = gpsInBlock(blockId);

  const decisions = state.gramSabhaDecisions.filter((d) => d.publishedPublic && state.gramSabhaMeetings.some((m) => m.gpId === gpId && m.decisions.includes(d.id)));
  const obs = state.obligations.filter((o) => o.gpId === gpId && o.publishedPublic);

  return (
    <div className="space-y-4">
      <Disclaimer text="Public board shows only approved public records. No confidential documents, beneficiary personal data or internal comments are shown." />
      <Card>
        <CardBody className="flex flex-wrap items-end gap-3">
          <div><p className="mb-1 text-xs text-slate-500">Block</p><Select value={blockId} onChange={(e) => { setBlockId(e.target.value); const g = gpsInBlock(e.target.value)[0]; if (g) setGpId(g.id); }} className="w-48">{BLOCKS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></div>
          <div><p className="mb-1 text-xs text-slate-500">Gram Panchayat</p><Select value={gpId} onChange={(e) => setGpId(e.target.value)} className="w-48">{gps.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></div>
          <div className="ml-auto flex items-center gap-2 text-sm"><span className="text-slate-500">Readiness</span><Badge tone="green">{readinessPct(state, { gpId })}%</Badge></div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="mb-3 text-sm font-semibold text-slate-800">Approved Public Records — {gpById(gpId)?.name}</p>
          {decisions.length === 0 && obs.length === 0 ? (
            <EmptyState icon={<Eye className="h-8 w-8" />} title="No published records for this GP" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Decision / Work</th><th className="px-3 py-2">Department</th><th className="px-3 py-2">Due</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Completion</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {decisions.map((d) => (
                    <tr key={d.id}><td className="px-3 py-2 font-medium text-slate-700">{d.decision}</td><td className="px-3 py-2 text-slate-500">{d.department?.replace("dept-", "")}</td><td className="px-3 py-2 text-slate-500">{fmtDate(d.dueDate)}</td><td className="px-3 py-2"><Badge tone={d.status === "COMPLETED" ? "green" : "amber"}>{d.status}</Badge></td><td className="px-3 py-2 text-slate-500">{d.completedDate ? fmtDate(d.completedDate) : "—"}</td></tr>
                  ))}
                  {obs.map((o) => (
                    <tr key={o.id}><td className="px-3 py-2 font-medium text-slate-700">{o.title}</td><td className="px-3 py-2 text-slate-500">{o.departmentId?.replace("dept-", "")}</td><td className="px-3 py-2 text-slate-500">{fmtDate(o.dueDate)}</td><td className="px-3 py-2"><Badge tone={o.status === "VERIFIED" || o.status === "COMPLETED" ? "green" : o.status === "BLOCKED" ? "amber" : "blue"}>{o.status}</Badge></td><td className="px-3 py-2 text-slate-500">{o.completionDate ? fmtDate(o.completionDate) : "—"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function RevenueTab() {
  return (
    <div className="space-y-4">
      <Disclaimer text="Tax configuration, demand and collection remain in Government systems. This shows public revenue transparency only, from demo values." />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Property Tax Demand (ref)", value: "₹ 42.6 L", sub: "Official revenue system reference" },
          { label: "Collection (ref)", value: "₹ 31.4 L", sub: "73% of demand" },
          { label: "Visible Local Use", value: "8 works", sub: "Funded from local revenue" },
        ].map((c) => (
          <Card key={c.label}><CardBody><div className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-teal-600" /><p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p></div><p className="mt-1 text-2xl font-bold text-slate-800">{c.value}</p><p className="text-xs text-slate-400">{c.sub}</p></CardBody></Card>
        ))}
      </div>
      <Card><CardBody>
        <p className="mb-2 text-sm font-semibold text-slate-800">Public Benefit — where local revenue is visible</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {["Street lighting maintenance", "Water supply operation", "Sanitation & waste collection", "Village road minor repairs"].map((b) => (
            <div key={b} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{b}</div>
          ))}
        </div>
      </CardBody></Card>
    </div>
  );
}

function OpenDataTab() {
  const { state } = useStore();
  const download = (name: string, rows: (string | number)[][]) => {
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };
  const datasets = [
    { name: "gp_readiness.csv", label: "GP Readiness", build: () => [["GP", "Readiness %"], ...GPS.filter((g) => g.isPilot).map((g) => [g.name, readinessPct(state, { gpId: g.id })])] },
    { name: "asset_conditions.csv", label: "Asset Condition Counts", build: () => { const m: Record<string, number> = {}; state.assets.forEach((a) => (m[a.condition] = (m[a.condition] ?? 0) + 1)); return [["Condition", "Count"], ...Object.entries(m)]; } },
    { name: "obligations_aggregate.csv", label: "Aggregate Obligations", build: () => { const m: Record<string, number> = {}; state.obligations.forEach((o) => (m[o.status] = (m[o.status] ?? 0) + 1)); return [["Status", "Count"], ...Object.entries(m)]; } },
    { name: "service_pendency.csv", label: "Service Pendency", build: () => { const m: Record<string, number> = {}; state.services.forEach((s) => (m[s.status] = (m[s.status] ?? 0) + 1)); return [["Status", "Count"], ...Object.entries(m)]; } },
    { name: "participation.csv", label: "Participation Statistics", build: () => [["Activity", "Registered", "Needed", "Status"], ...state.activities.map((a) => [a.title, a.registeredVolunteers.length, a.needsVolunteers, a.status])] },
  ];
  return (
    <div className="space-y-4">
      <Disclaimer text="Public approved aggregate data only. No personal data is exported." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {datasets.map((d) => (
          <Card key={d.name}><CardBody className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-800">{d.label}</p><p className="text-xs text-slate-400">{d.name}</p></div><Button size="sm" variant="outline" onClick={() => download(d.name, d.build())}><Download className="h-4 w-4" /> CSV</Button></CardBody></Card>
        ))}
      </div>
    </div>
  );
}
