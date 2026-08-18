"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { computeScope, inScope } from "@/permissions";
import { gpById } from "@/data/hierarchy";
import { pct } from "@/utils/format";
import { Badge, Button, Card, CardBody, EmptyState, Modal, PageHeader, StatCard } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { SERVICE_STATUS } from "@/utils/labels";
import { fmtDate } from "@/utils/format";
import { ServiceApplication } from "@/types";
import { Clock, MessageCircle, MessageSquare, Send } from "lucide-react";

export default function ServicesPage() {
  const { state } = useStore();
  const { user } = useAuth();
  const scope = computeScope(user);
  const services = state.services.filter((s) => inScope(scope, s));
  const [preview, setPreview] = useState<ServiceApplication | null>(null);
  const [sent, setSent] = useState(false);

  const received = services.length;
  const completed = services.filter((s) => s.status === "COMPLETED").length;
  const overdue = services.filter((s) => s.overdue).length;
  const withinTarget = services.filter((s) => !s.overdue && s.status === "COMPLETED").length;
  const avgDays = services.length ? Math.round(services.reduce((a, s) => a + s.daysElapsed, 0) / services.length) : 0;

  return (
    <div>
      <PageHeader title="Seva Ghadyal" titleMr="सेवा घड्याळ" subtitle="Service Monitoring">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Actual Government service system integration is not enabled in the demo. Public board shows no personal details." /></div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Received" value={received} tone="blue" />
        <StatCard label="Completed" value={completed} tone="green" />
        <StatCard label="Within Target" value={withinTarget} tone="teal" />
        <StatCard label="Overdue" value={overdue} tone="red" />
        <StatCard label="Avg Days" value={avgDays} tone="amber" />
      </div>

      {services.length === 0 ? (
        <EmptyState icon={<Clock className="h-8 w-8" />} title="No service applications in scope" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">ID</th><th className="px-4 py-2.5">Service</th><th className="px-4 py-2.5">GP</th><th className="px-4 py-2.5">Stage</th><th className="px-4 py-2.5">Days</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className={`hover:bg-slate-50 ${s.overdue ? "bg-rose-50/30" : ""}`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{s.id}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{s.service}</td>
                    <td className="px-4 py-2.5 text-slate-500">{gpById(s.gpId)?.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{s.stage}</td>
                    <td className="px-4 py-2.5">{s.daysElapsed}{s.overdue && <span className="ml-1 text-xs text-rose-600">⚠</span>}</td>
                    <td className="px-4 py-2.5"><Badge tone={SERVICE_STATUS[s.status].tone} dot>{SERVICE_STATUS[s.status].en}</Badge></td>
                    <td className="px-4 py-2.5"><button onClick={() => setPreview(s)} className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"><MessageSquare className="h-3.5 w-3.5" /> preview</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {preview && (
        <Modal open onClose={() => { setPreview(null); setSent(false); }} title={`Communication Preview — ${preview.id}`}>
          <div className="space-y-4">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><MessageSquare className="h-3.5 w-3.5" /> SMS Preview</p>
              <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">ZP Yavatmal: Your demo application {preview.id} ({preview.service}) is {SERVICE_STATUS[preview.status].en}. Expected: {fmtDate(preview.expectedDate)}.</div>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp Preview</p>
              <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">*Demo Service {preview.id}*\nStatus: {SERVICE_STATUS[preview.status].en}\nExpected completion: {fmtDate(preview.expectedDate)}\n_ZP Yavatmal — demonstration message_</div>
            </div>
            {sent ? (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Demo only — no external message was actually sent.</div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSent(true)}><MessageSquare className="h-4 w-4" /> Send SMS</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setSent(true)}><Send className="h-4 w-4" /> Send WhatsApp</Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
