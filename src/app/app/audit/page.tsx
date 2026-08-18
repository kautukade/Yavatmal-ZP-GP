"use client";

import { useState } from "react";
import { useStore } from "@/services/store";
import { Badge, Card, EmptyState, PageHeader, Input } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";
import { fmtDateTime } from "@/utils/format";
import { History } from "lucide-react";

export default function AuditPage() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const logs = state.auditLogs.filter((l) => !q || `${l.actor} ${l.action} ${l.entity} ${l.entityId}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Audit Trail" titleMr="लेखापरीक्षण नोंद" subtitle="Every important action — actor, role, timestamp, status change. No hidden changes.">
        <DemoBadge />
      </PageHeader>
      <Card className="mb-4"><div className="p-3"><Input placeholder="Search audit log…" value={q} onChange={(e) => setQ(e.target.value)} /></div></Card>
      {logs.length === 0 ? (
        <EmptyState icon={<History className="h-8 w-8" />} title="No audit entries" />
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {logs.map((l) => (
              <div key={l.id} className="flex items-start gap-3 px-4 py-3">
                <History className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{l.action}{l.toStatus && <span className="text-slate-400"> → {l.toStatus}</span>}</p>
                  <p className="text-xs text-slate-400">{l.actor} ({l.actorRole.replace(/_/g, " ")}) · {l.entity} {l.entityId} · {fmtDateTime(l.ts)}</p>
                  {l.comment && <p className="text-xs italic text-slate-500">&ldquo;{l.comment}&rdquo;</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
