"use client";

import { useAuth, useStore } from "@/services/store";
import { forUser } from "@/utils/selectors";
import { gpById } from "@/data/hierarchy";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { fmtDate } from "@/utils/format";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const s = forUser(state, user);
  const evidence = s.obligations.flatMap((o) => o.evidence.map((e) => ({ ...e, obligation: o.title, gp: gpById(o.gpId)?.name, cls: o.classification })));
  return (
    <div>
      <PageHeader title="Documents / Evidence" titleMr="दस्तऐवज / पुरावे" subtitle="Evidence attached across obligations & assets">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Evidence upload is simulated in the demo. Restricted documents are never exposed publicly." /></div>
      {evidence.length === 0 ? (
        <EmptyState icon={<FileText className="h-8 w-8" />} title="No evidence in scope" subtitle="Evidence appears here as obligations progress." />
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {evidence.map((e, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <FileText className="h-5 w-5 text-teal-600" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{e.name}</p><p className="truncate text-xs text-slate-400">{e.obligation} · {e.gp} · uploaded by {e.uploadedBy} {fmtDate(e.uploadedOn)}</p></div>
                <Badge tone="slate">{e.type}</Badge>
                <Badge tone={e.cls === "RESTRICTED" ? "red" : e.cls === "INTERNAL" ? "amber" : "teal"}>{e.cls}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
