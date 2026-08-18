"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { computeScope, inScope } from "@/permissions";
import { hasCapability } from "@/permissions/capabilities";
import { gpById } from "@/data/hierarchy";
import { VillageInstitution } from "@/types";
import { Badge, Button, Card, CardBody, EmptyState, Modal, PageHeader } from "@/components/ui/primitives";
import { Progress } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { fmtDate, pct } from "@/utils/format";
import { Building2, CheckCircle2 } from "lucide-react";

export default function InstitutionsPage() {
  const { state, update, addAudit } = useStore();
  const { user } = useAuth();
  const scope = computeScope(user);
  const insts = state.institutions.filter((i) => inScope(scope, i));
  const [selected, setSelected] = useState<VillageInstitution | null>(null);
  const current = selected ? state.institutions.find((i) => i.id === selected.id) ?? selected : null;
  const [cat, setCat] = useState("");
  const cats = Array.from(new Set(insts.map((i) => i.category)));
  const filtered = cat ? insts.filter((i) => i.category === cat) : insts;

  return (
    <div>
      <PageHeader title="Sanstha Darshak" titleMr="संस्था दर्शक" subtitle="Village Institution Directory & Operational Workspace">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Does not duplicate full UMED or other official registers. Performance reflects actual assigned activity — not a vanity score." /></div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <button onClick={() => setCat("")} className={`rounded-full px-3 py-1 text-xs font-medium ${!cat ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>All</button>
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-xs font-medium ${cat === c ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>{c}</button>)}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Building2 className="h-8 w-8" />} title="No institutions in scope" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <Card key={i.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div><p className="text-sm font-semibold text-slate-800">{i.name}</p><p className="text-xs text-slate-400">{i.category} · {gpById(i.gpId)?.name}</p></div>
                  <Badge tone={i.status === "attention" ? "amber" : "green"} dot>{i.status}</Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500">{i.responsibility}</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs"><span className="text-slate-500">Assigned activity completion</span><span className="font-semibold text-slate-700">{i.completedTasks}/{i.assignedTasks}</span></div>
                  <Progress value={pct(i.completedTasks, i.assignedTasks)} tone={pct(i.completedTasks, i.assignedTasks) > 70 ? "green" : "amber"} />
                </div>
                <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => setSelected(i)}>Open Workspace</Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {current && <InstModal inst={current} onClose={() => setSelected(null)} />}
    </div>
  );
}

function InstModal({ inst: i, onClose }: { inst: VillageInstitution; onClose: () => void }) {
  const { update, addAudit } = useStore();
  const { user } = useAuth();
  const canAct = hasCapability(user, "SUBMIT_INSTITUTION_ACTIVITY") || hasCapability(user, "REVIEW_INSTITUTION_ACTIVITY");
  const markInspected = () => {
    update((d) => { const x = d.institutions.find((z) => z.id === i.id); if (x && x.completedTasks < x.assignedTasks) x.completedTasks += 1; });
    if (user) addAudit({ actor: user.name, actorRole: user.role, action: `Submitted evidence for ${i.name}`, entity: "Institution", entityId: i.id });
  };
  return (
    <Modal open onClose={onClose} title={i.name}>
      <div className="space-y-3">
        <div className="flex items-center gap-2"><Badge tone="slate">{i.category}</Badge><span className="text-xs text-slate-400">{gpById(i.gpId)?.name}</span></div>
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div><p className="text-[10px] uppercase text-slate-400">Chair / Contact</p><p className="font-medium text-slate-700">{i.chairContact}</p></div>
          <div><p className="text-[10px] uppercase text-slate-400">Last meeting</p><p className="font-medium text-slate-700">{fmtDate(i.lastMeeting)}</p></div>
          <div><p className="text-[10px] uppercase text-slate-400">Next meeting</p><p className="font-medium text-slate-700">{fmtDate(i.nextMeeting)}</p></div>
          <div><p className="text-[10px] uppercase text-slate-400">Responsibility</p><p className="font-medium text-slate-700">{i.responsibility}</p></div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-600">Assigned Work</p>
          <p className="text-sm text-slate-700">{i.category === "VWSC" ? "Quarterly Water Asset Check" : "Assigned community activity"} — {i.completedTasks}/{i.assignedTasks} completed</p>
          <div className="mt-2 flex gap-2">
            {canAct ? (
              <Button size="sm" onClick={markInspected}><CheckCircle2 className="h-4 w-4" /> Mark Inspected & Submit Evidence</Button>
            ) : (
              <p className="text-xs italic text-slate-400">Read-only — submission available to the assigned institution / reviewing officer.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
