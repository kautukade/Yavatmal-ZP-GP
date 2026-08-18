"use client";

import { Card, CardBody, PageHeader } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { ShieldCheck } from "lucide-react";

const REQUIREMENTS = [
  ["Secure backend & database", "Server-side data store replacing localStorage; encrypted at rest."],
  ["Server-side authentication", "Official SSO / MFA if approved; no client-only auth."],
  ["Server-enforced RBAC", "Permissions enforced on the server, not only in the UI."],
  ["Encrypted storage & transport", "TLS everywhere; encryption of sensitive fields."],
  ["Government hosting decision", "Approved hosting (NIC / State Data Centre / approved cloud)."],
  ["Backups & audit retention", "Regular backups; tamper-evident audit log retention."],
  ["Incident logging & monitoring", "Centralised logging, alerting and monitoring."],
  ["DPDP / privacy review", "Data protection review; data minimisation; consent where needed."],
  ["Official API approvals", "Approved integration/MoU with each Government system."],
  ["Security testing", "VAPT / security review before any production use."],
];

export default function ProductionReadinessPage() {
  return (
    <div>
      <PageHeader title="Production Deployment Requirements" titleMr="उत्पादन सज्जता" subtitle="What a real production deployment would require — none of which this demo implements.">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4"><Disclaimer text="This is a frontend demonstration using browser localStorage. It is accurately described as demo-level role-based access simulation with centralized permission enforcement — NOT production-secure authentication or Government-grade RBAC." /></div>
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-teal-600" /><p className="text-sm font-semibold text-slate-800">Production would require:</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {REQUIREMENTS.map(([t, d]) => (
              <div key={t} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                <p className="text-sm font-medium text-slate-800">{t}</p>
                <p className="mt-0.5 text-xs text-slate-500">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs italic text-slate-400">Stating these honestly increases credibility: this demo is for workflow validation and senior-officer presentation. Production architecture will be built only after workflow validation.</p>
        </CardBody>
      </Card>
    </div>
  );
}
