"use client";

import { Card, CardBody, PageHeader } from "@/components/ui/primitives";
import { DemoBadge, RefBadge } from "@/components/ui/common";
import { ArrowDown } from "lucide-react";

const GOV = ["eGramSwaraj", "ZPFMS / PFMS", "SAMARTH", "Gram Manchitra", "AuditOnline", "Panchayat NIRNAY", "Aaple Sarkar / ServicePlus", "JJM / WQMIS"];
const MODULES = ["PATHPURAVA", "NIGAA", "Seasonal", "Services", "Institutions", "Participation", "Convergence", "Innovation", "Transparency", "GP File Flow", "Complaint Routing", "Mahsul Sandhi", "Process Improvement"];
const VIEWS = ["Gram Panchayat", "Block", "District", "Public"];

export default function ArchitecturePage() {
  return (
    <div>
      <PageHeader title="System Architecture" titleMr="आर्किटेक्चर" subtitle="One operational experience layered on top of existing Government systems.">
        <DemoBadge />
      </PageHeader>

      <div className="space-y-1">
        <Card>
          <CardBody>
            <div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold text-slate-800">Existing Government Systems</p><RefBadge kind="OFFICIAL_REFERENCE" /></div>
            <p className="mb-3 text-xs text-slate-500">Remain the source of truth for their respective functions.</p>
            <div className="flex flex-wrap gap-2">{GOV.map((g) => <span key={g} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">{g}</span>)}</div>
            <p className="mt-2 text-xs italic text-slate-400">Reference only — the demo is not connected to these systems.</p>
          </CardBody>
        </Card>

        <div className="flex justify-center py-1"><div className="flex flex-col items-center text-slate-400"><ArrowDown className="h-5 w-5" /><span className="text-[10px]">references</span></div></div>

        <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
          <CardBody>
            <p className="text-center text-sm font-bold text-brand-800">UNIFIED PANCHAYAT OPERATIONS PLATFORM</p>
            <p className="mb-3 text-center text-xs text-slate-500">Shared auth · users · RBAC · data layer · navigation · audit · notifications · reports · evidence</p>
            <div className="flex flex-wrap justify-center gap-2">{MODULES.map((m) => <span key={m} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">{m}</span>)}</div>
          </CardBody>
        </Card>

        <div className="flex justify-center py-1"><div className="flex flex-col items-center text-slate-400"><ArrowDown className="h-5 w-5" /><span className="text-[10px]">role-appropriate views</span></div></div>

        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold text-slate-800">Role Views</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{VIEWS.map((v) => <div key={v} className="rounded-lg bg-teal-50 px-3 py-2 text-center text-sm font-medium text-teal-700 ring-1 ring-inset ring-teal-100">{v}</div>)}</div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-5 rounded-xl bg-slate-900 p-5 text-center">
        <p className="text-sm font-semibold text-white">One operational update can generate different role-appropriate information at every level.</p>
        <p className="mt-1 text-xs text-slate-400">Village-level users perform work · block officers see exceptions · Deputy CEOs see systemic bottlenecks · CEO sees strategic outcomes · citizens see only approved public transparency.</p>
      </div>
    </div>
  );
}
