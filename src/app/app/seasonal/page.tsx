"use client";

import { useAuth, useStore } from "@/services/store";
import { inScope, computeScope, can } from "@/permissions";
import { hasCapability } from "@/permissions/capabilities";
import { readinessPct, blockSummaries } from "@/utils/selectors";
import { gpById, PILOT_GPS } from "@/data/hierarchy";
import { Badge, Button, Card, CardBody, EmptyState, PageHeader } from "@/components/ui/primitives";
import { ReadinessMeter } from "@/components/dashboard/widgets";
import { DemoBadge } from "@/components/ui/common";
import { CYCLE_LABEL, SEASONAL_STATUS } from "@/utils/labels";
import { fmtDate, relTime } from "@/utils/format";
import { CloudRain } from "lucide-react";

export default function SeasonalPage() {
  const { state, user, updateSeasonal, addAudit, queueIfOffline } = useStore();
  const auth = useAuth();
  const scope = computeScope(auth.user);
  const tasks = state.seasonalTasks.filter((t) => inScope(scope, t));
  const canEdit = hasCapability(auth.user, "SUBMIT_SEASONAL_CHECK");

  const cycles = Array.from(new Set(tasks.map((t) => t.cycle)));
  const districtReadiness = readinessPct(state, {});
  const isDistrict = auth.role?.scope === "district";
  const blocks = isDistrict ? blockSummaries(state) : [];

  const markDone = (id: string) => {
    updateSeasonal(id, { status: "DONE", completedOn: new Date().toISOString() });
    if (auth.user) {
      addAudit({ actor: auth.user.name, actorRole: auth.user.role, action: "Completed seasonal task", entity: "SeasonalTask", entityId: id, toStatus: "DONE" });
      queueIfOffline({ entityType: "SEASONAL_TASK", entityId: id, action: "UPDATE_TASK: DONE", userId: auth.user.id });
    }
  };

  return (
    <div>
      <PageHeader title="Hangami Sajjata" titleMr="हंगामी सज्जता" subtitle="Seasonal Readiness Cycles">
        <DemoBadge />
      </PageHeader>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card><CardBody><ReadinessMeter label="District Readiness" value={districtReadiness} /></CardBody></Card>
        {auth.user?.blockId && <Card><CardBody><ReadinessMeter label="Block Readiness" value={readinessPct(state, { blockId: auth.user.blockId })} tone="blue" /></CardBody></Card>}
        {auth.user?.gpId && <Card><CardBody><ReadinessMeter label="GP Readiness" value={readinessPct(state, { gpId: auth.user.gpId })} tone="green" /></CardBody></Card>}
      </div>

      {isDistrict && (
        <Card className="mb-5">
          <CardBody>
            <p className="mb-3 text-sm font-semibold text-slate-800">Block Readiness Overview</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {blocks.map((b) => <ReadinessMeter key={b.blockId} label={b.name} value={b.readiness} tone={b.readiness > 80 ? "green" : b.readiness > 60 ? "amber" : "red"} />)}
            </div>
          </CardBody>
        </Card>
      )}

      {tasks.length === 0 ? (
        <EmptyState icon={<CloudRain className="h-8 w-8" />} title="No seasonal tasks in scope" />
      ) : (
        <div className="space-y-5">
          {cycles.map((cycle) => {
            const ct = tasks.filter((t) => t.cycle === cycle);
            return (
              <Card key={cycle}>
                <CardBody>
                  <div className="mb-3 flex items-center gap-2">
                    <Badge tone={CYCLE_LABEL[cycle]?.tone ?? "slate"}>{CYCLE_LABEL[cycle]?.en ?? cycle}</Badge>
                    <span className="text-xs text-slate-400">{ct.filter((t) => t.status === "DONE").length}/{ct.length} done</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {ct.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">{t.title}</p>
                          <p className="text-xs text-slate-400">{gpById(t.gpId)?.name} · {t.assignedRole.replace(/_/g, " ")} · due {relTime(t.dueDate)}</p>
                        </div>
                        <Badge tone={SEASONAL_STATUS[t.status].tone} dot>{SEASONAL_STATUS[t.status].en}</Badge>
                        {canEdit && t.status !== "DONE" && auth.user?.gpId === t.gpId && <Button size="sm" variant="outline" onClick={() => markDone(t.id)}>Mark Done</Button>}
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
