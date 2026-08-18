"use client";

import { Badge, Card, PageHeader } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";

const MODULES: { name: string; status: string; tone: "green" | "amber" | "blue" | "slate" | "violet" }[] = [
  { name: "Authentication", status: "Live demo state (client-side only)", tone: "blue" },
  { name: "Admin User Assignment", status: "Live role + scope editing with audit", tone: "green" },
  { name: "Extension Scope", status: "Block-constrained GP assignment", tone: "green" },
  { name: "RBAC", status: "Demo-level route + action + scope enforcement", tone: "blue" },
  { name: "PATHPURAVA", status: "Interactive", tone: "green" },
  { name: "ADTHALA (Blocker Intelligence)", status: "Interactive", tone: "green" },
  { name: "HASTANTARAN (Handover)", status: "Scoped + designated incoming officer validation", tone: "green" },
  { name: "Aadesh-te-Kruti", status: "Simulated AI", tone: "violet" },
  { name: "UC Follow-Up", status: "GP / Block / District / Department scoped", tone: "amber" },
  { name: "GP File Flow", status: "Interactive Demo", tone: "green" },
  { name: "NIGAA (Assets)", status: "Interactive", tone: "green" },
  { name: "QR Asset Check", status: "Simulated (camera + demo selection)", tone: "amber" },
  { name: "Repair Workflow", status: "Interactive", tone: "green" },
  { name: "Seasonal Readiness", status: "Interactive", tone: "green" },
  { name: "Services (Seva Ghadyal)", status: "Simulated", tone: "amber" },
  { name: "Gram Sabha", status: "Demo", tone: "amber" },
  { name: "Institutions", status: "Interactive", tone: "green" },
  { name: "Participation (Shramsankalp)", status: "Interactive", tone: "green" },
  { name: "Innovation (Library + Challenge)", status: "Interactive", tone: "green" },
  { name: "Convergence", status: "Demo", tone: "amber" },
  { name: "Complaint Routing", status: "Interactive Demo", tone: "green" },
  { name: "Mahsul Sandhi (SAMARTH adoption)", status: "Adoption Demo", tone: "amber" },
  { name: "Process Improvement Lab", status: "Interactive Demo", tone: "green" },
  { name: "Aawaj Nond (Voice)", status: "Web Speech + fallback", tone: "blue" },
  { name: "Public Portal", status: "Interactive", tone: "green" },
  { name: "Evidence Upload", status: "Local demo storage (survives refresh)", tone: "blue" },
  { name: "Offline Queue", status: "Interactive local offline demo", tone: "green" },
  { name: "Open Data", status: "Demo CSV export", tone: "amber" },
  { name: "SMS / WhatsApp", status: "Preview only — nothing sent", tone: "slate" },
  { name: "Government APIs", status: "Not Connected", tone: "slate" },
];

export default function SystemStatusPage() {
  return (
    <div>
      <PageHeader title="Module Status" titleMr="विभाग स्थिती" subtitle="Transparent scope — what is interactive, simulated, or not connected.">
        <DemoBadge />
      </PageHeader>
      <Card>
        <div className="divide-y divide-slate-100">
          {MODULES.map((m) => (
            <div key={m.name} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm font-medium text-slate-700">{m.name}</span>
              <Badge tone={m.tone} dot>{m.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
      <p className="mt-4 text-xs italic text-slate-400">No live Government integration is active anywhere in this demo. Every mutation persists to the browser localStorage only.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card><div className="p-4"><p className="mb-2 text-sm font-semibold text-emerald-700">What is REAL in this demo?</p><ul className="space-y-1 text-xs text-slate-600"><li>• Navigation & role switching</li><li>• Role/scope-based access & guards</li><li>• Local operational workflows (PATHPURAVA, NIGAA, etc.)</li><li>• Local state changes & dashboards</li><li>• Live metric calculations & baseline-vs-current</li><li>• Local evidence storage & offline queue</li></ul></div></Card>
        <Card><div className="p-4"><p className="mb-2 text-sm font-semibold text-amber-700">What is SIMULATED?</p><ul className="space-y-1 text-xs text-slate-600"><li>• AI extraction (Aadesh-te-Kruti)</li><li>• QR decode (camera opens; asset picked from demo)</li><li>• SMS / WhatsApp delivery (preview only)</li><li>• Government data & references</li></ul></div></Card>
        <Card><div className="p-4"><p className="mb-2 text-sm font-semibold text-rose-700">What is NOT production?</p><ul className="space-y-1 text-xs text-slate-600"><li>• Authentication (client-side only)</li><li>• Database & server sync</li><li>• Server-enforced authorization</li><li>• Official Government integration</li><li>• Government hosting</li></ul></div></Card>
      </div>
    </div>
  );
}
