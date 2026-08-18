"use client";

import { useAuth, useStore } from "@/services/store";
import { computeScope, inScope } from "@/permissions";
import { gpById } from "@/data/hierarchy";
import { Badge, Card, CardBody, EmptyState, PageHeader } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { relTime } from "@/utils/format";
import { CheckCircle2, Circle, GitMerge, Loader2, PauseCircle } from "lucide-react";

const STEP_ICON = {
  DONE: { icon: CheckCircle2, cls: "text-emerald-500" },
  IN_PROGRESS: { icon: Loader2, cls: "text-brand-500" },
  WAITING: { icon: PauseCircle, cls: "text-amber-500" },
  PENDING: { icon: Circle, cls: "text-slate-300" },
};

export default function ConvergencePage() {
  const { state } = useStore();
  const { user } = useAuth();
  const scope = computeScope(user);
  const projects = state.convergence.filter((p) => inScope(scope, p));
  return (
    <div>
      <PageHeader title="Convergence" titleMr="समन्वय" subtitle="Execution sequencing & fund convergence view">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Not a GPDP planning tool. Execution sequencing only. Official financial data remains in respective Government systems." /></div>

      {projects.length === 0 ? (
        <EmptyState icon={<GitMerge className="h-8 w-8" />} title="No convergence projects in scope" />
      ) : (
        <div className="space-y-5">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardBody>
                <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                <p className="text-xs text-slate-400">{gpById(p.gpId)?.name}</p>
                <div className="mt-4 space-y-3">
                  {p.steps.map((s, idx) => {
                    const Ico = STEP_ICON[s.status].icon;
                    return (
                      <div key={s.order} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <Ico className={`h-5 w-5 ${STEP_ICON[s.status].cls}`} />
                          {idx < p.steps.length - 1 && <span className="my-0.5 h-6 w-px bg-slate-200" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <p className="text-sm font-medium text-slate-800">Step {s.order}: {s.label}</p>
                          <div className="flex items-center gap-2">
                            <Badge tone={s.status === "DONE" ? "green" : s.status === "IN_PROGRESS" ? "blue" : s.status === "WAITING" ? "amber" : "slate"}>{s.status.replace("_", " ")}</Badge>
                            {s.waitingOn && <span className="text-xs text-amber-600">Waiting on {s.waitingOn} since {relTime(s.since)}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <p className="mb-1.5 text-xs font-semibold text-slate-500">Fund Convergence (read-only reference)</p>
                  <div className="flex flex-wrap gap-2">
                    {p.fundSources.map((f) => (
                      <span key={f.ref} className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-200"><b>{f.name}</b> · {f.ref}</span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs italic text-slate-400">Official financial data remains in respective Government systems.</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
