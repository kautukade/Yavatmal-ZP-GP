"use client";

import { Badge, Card, CardBody, PageHeader } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";
import { ArrowDown, Check, X } from "lucide-react";

interface Level {
  name: string;
  nameMr: string;
  scope: string;
  view: string;
  update: boolean;
  review: boolean;
  escalate: boolean;
  admin: boolean;
}

const LEVELS: Level[] = [
  { name: "Public / Citizen", nameMr: "नागरिक", scope: "Published public data only", view: "Public", update: false, review: false, escalate: false, admin: false },
  { name: "Village Institution (VWSC/SHG)", nameMr: "ग्राम संस्था", scope: "Assigned GP", view: "GP (assigned)", update: true, review: false, escalate: false, admin: false },
  { name: "Gram Panchayat (Sevak/Staff/Sarpanch)", nameMr: "ग्रामपंचायत", scope: "Own GP", view: "GP", update: true, review: false, escalate: true, admin: false },
  { name: "Extension / Block Officer", nameMr: "विस्तार / गट", scope: "Assigned GPs / Block", view: "Block", update: false, review: true, escalate: true, admin: false },
  { name: "BDO", nameMr: "गटविकास अधिकारी", scope: "Own Block", view: "Block", update: false, review: true, escalate: true, admin: false },
  { name: "Deputy CEO / Dept Head", nameMr: "उप मुख्य कार्यकारी अधिकारी", scope: "District (+department)", view: "District", update: false, review: true, escalate: true, admin: false },
  { name: "Additional CEO", nameMr: "अतिरिक्त मुख्य कार्यकारी अधिकारी", scope: "District executive", view: "District", update: false, review: true, escalate: true, admin: false },
  { name: "CEO", nameMr: "मुख्य कार्यकारी अधिकारी", scope: "District strategic", view: "District (strategic)", update: false, review: false, escalate: false, admin: false },
  { name: "System Administrator", nameMr: "प्रणाली प्रशासक", scope: "Configuration only", view: "Config", update: false, review: false, escalate: false, admin: true },
];

function YN({ v }: { v: boolean }) {
  return v ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <X className="mx-auto h-4 w-4 text-slate-300" />;
}

export default function AccessMapPage() {
  return (
    <div>
      <PageHeader title="Village-to-District Role & Access Map" titleMr="भूमिका व प्रवेश नकाशा" subtitle="Who can see and do what — data flows upward, permissions stay role-based.">
        <DemoBadge />
      </PageHeader>

      <div className="mb-5 flex flex-col items-center gap-1">
        {["Public", "Village Institution", "Gram Panchayat", "Extension / Block", "BDO", "Deputy CEO", "Additional CEO", "CEO"].map((n, i, arr) => (
          <div key={n} className="flex flex-col items-center">
            <span className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-100">{n}</span>
            {i < arr.length - 1 && <ArrowDown className="my-0.5 h-4 w-4 text-slate-300" />}
          </div>
        ))}
        <p className="mt-2 text-xs text-slate-400">Escalations & data flow upward · instructions flow downward</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-2.5 text-left">Level</th><th className="px-4 py-2.5 text-left">Data Scope</th><th className="px-4 py-2.5 text-left">Can View</th><th className="px-4 py-2.5">Update</th><th className="px-4 py-2.5">Review</th><th className="px-4 py-2.5">Escalate</th><th className="px-4 py-2.5">Admin</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LEVELS.map((l) => (
                <tr key={l.name} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5"><p className="font-medium text-slate-700">{l.name}</p><p className="text-[11px] text-slate-400">{l.nameMr}</p></td>
                  <td className="px-4 py-2.5 text-slate-600">{l.scope}</td>
                  <td className="px-4 py-2.5"><Badge tone="blue">{l.view}</Badge></td>
                  <td className="px-4 py-2.5"><YN v={l.update} /></td>
                  <td className="px-4 py-2.5"><YN v={l.review} /></td>
                  <td className="px-4 py-2.5"><YN v={l.escalate} /></td>
                  <td className="px-4 py-2.5"><YN v={l.admin} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-4 text-xs italic text-slate-400">Visibility never implies edit rights. A CEO can see a GP result but cannot rewrite the original Gram Sevak evidence; the System Administrator manages configuration but cannot silently change a verified operational outcome.</p>
    </div>
  );
}
