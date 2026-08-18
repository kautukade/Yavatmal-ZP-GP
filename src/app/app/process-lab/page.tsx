"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { ProcessExperiment } from "@/types";
import { Badge, Button, Card, CardBody, EmptyState, Field, Input, Modal, PageHeader, Select, Textarea } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { LIVE_METRIC_KEYS, liveMetricValue } from "@/utils/selectors";
import { fmtDate, pct } from "@/utils/format";
import { FlaskConical, Plus, TrendingDown, TrendingUp } from "lucide-react";

export default function ProcessLabPage() {
  const { state, user, update, addAudit } = useStore();
  const experiments = state.experiments ?? [];
  const [showNew, setShowNew] = useState(false);

  const complete = (e: ProcessExperiment) => {
    update((d) => { const x = (d.experiments ?? []).find((z) => z.id === e.id); if (x) { x.status = "COMPLETED"; x.endDate = new Date().toISOString(); } });
    if (user) addAudit({ actor: user.name, actorRole: user.role, action: `Completed experiment ${e.id}`, entity: "Experiment", entityId: e.id, toStatus: "COMPLETED" });
  };

  return (
    <div>
      <PageHeader title="Process Improvement Lab" titleMr="प्रक्रिया सुधार प्रयोगशाळा" subtitle="Measure operational improvements using data already captured">
        <DemoBadge />
        <Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New Experiment</Button>
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Uses operational data already captured in the demo. Baseline vs current comparison only — not a separate software product." /></div>

      {experiments.length === 0 ? (
        <EmptyState icon={<FlaskConical className="h-8 w-8" />} title="No experiments yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {experiments.map((e) => {
            const currentValue = e.metricSource === "LIVE" && e.liveMetricKey ? liveMetricValue(state, e.liveMetricKey) : e.currentValue;
            const improved = currentValue < e.baselineValue;
            const change = e.baselineValue ? Math.round(((e.baselineValue - currentValue) / e.baselineValue) * 100) : 0;
            return (
              <Card key={e.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2"><p className="text-sm font-semibold text-slate-800">{e.experiment}</p>{e.metricSource === "LIVE" && <Badge tone="teal">Live metric</Badge>}</div>
                    <Badge tone={e.status === "COMPLETED" ? "green" : e.status === "RUNNING" ? "blue" : "slate"}>{e.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{e.owner} · {e.ownerRole.replace(/_/g, " ")}</p>
                  <p className="mt-2 text-sm text-slate-600"><b>Problem:</b> {e.problem}</p>
                  <p className="mt-1 text-sm text-slate-600"><b>Intervention:</b> {e.intervention}</p>
                  <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <div><p className="text-[10px] uppercase text-slate-400">{e.baselineMetric}</p><p className="text-sm"><span className="text-slate-400 line-through">{e.baselineValue} {e.unit}</span> <span className={`font-bold ${improved ? "text-emerald-600" : "text-slate-800"}`}>→ {currentValue} {e.unit}</span></p></div>
                    {e.status === "COMPLETED" && change > 0 && <Badge tone="green">{change}% {improved ? "reduction" : "change"}</Badge>}
                    {improved ? <TrendingDown className="ml-auto h-5 w-5 text-emerald-500" /> : <TrendingUp className="ml-auto h-5 w-5 text-slate-400" />}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Started {fmtDate(e.startDate)}{e.endDate ? ` · ended ${fmtDate(e.endDate)}` : ""}{e.evidence ? ` · evidence: ${e.evidence}` : ""}</p>
                  {e.status === "RUNNING" && <Button size="sm" variant="outline" className="mt-3" onClick={() => complete(e)}>Mark Completed</Button>}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
      {showNew && <NewExperimentModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewExperimentModal({ onClose }: { onClose: () => void }) {
  const { update, addAudit, user, state } = useStore();
  const [f, setF] = useState({ experiment: "", problem: "", baselineMetric: "", baselineValue: "", intervention: "", currentValue: "", unit: "minutes", liveKey: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const isLive = !!f.liveKey;
  const save = () => {
    if (!f.experiment.trim() || !user) return;
    const id = `EXP-${Math.floor(Math.random() * 900 + 100)}`;
    const liveMeta = LIVE_METRIC_KEYS.find((k) => k.key === f.liveKey);
    const baseVal = isLive ? liveMetricValue(state, f.liveKey) : Number(f.baselineValue) || 0;
    update((d) => {
      (d.experiments ??= []).unshift({
        id, experiment: f.experiment, problem: f.problem,
        baselineMetric: isLive ? liveMeta!.label : f.baselineMetric || "Metric",
        baselineValue: baseVal, intervention: f.intervention, startDate: new Date().toISOString(),
        currentValue: isLive ? baseVal : Number(f.currentValue) || baseVal,
        unit: isLive ? liveMeta!.unit : f.unit, owner: user.name, ownerRole: user.role, status: "RUNNING",
        metricSource: isLive ? "LIVE" : "MANUAL", liveMetricKey: isLive ? f.liveKey : undefined,
      });
    });
    addAudit({ actor: user.name, actorRole: user.role, action: `Created experiment ${id}${isLive ? " (live metric)" : ""}`, entity: "Experiment", entityId: id });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="New Improvement Experiment">
      <div className="space-y-3">
        <Field label="Experiment"><Input value={f.experiment} onChange={(e) => set("experiment", e.target.value)} placeholder="e.g. Weekly exception digest" /></Field>
        <Field label="Problem"><Textarea value={f.problem} onChange={(e) => set("problem", e.target.value)} /></Field>
        <Field label="Intervention"><Textarea value={f.intervention} onChange={(e) => set("intervention", e.target.value)} /></Field>
        <Field label="Metric source" hint="Live metrics auto-calculate the current value from the platform state.">
          <Select value={f.liveKey} onChange={(e) => set("liveKey", e.target.value)}>
            <option value="">Manual metric</option>
            {LIVE_METRIC_KEYS.map((k) => <option key={k.key} value={k.key}>Live · {k.label}</option>)}
          </Select>
        </Field>
        {isLive ? (
          <div className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">Baseline snapshot: <b>{liveMetricValue(state, f.liveKey)}</b>. Current value updates live as the demo changes.</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Metric"><Input value={f.baselineMetric} onChange={(e) => set("baselineMetric", e.target.value)} placeholder="Time" /></Field>
              <Field label="Baseline"><Input type="number" value={f.baselineValue} onChange={(e) => set("baselineValue", e.target.value)} /></Field>
              <Field label="Unit"><Input value={f.unit} onChange={(e) => set("unit", e.target.value)} /></Field>
            </div>
            <Field label="Current value (optional)"><Input type="number" value={f.currentValue} onChange={(e) => set("currentValue", e.target.value)} /></Field>
          </>
        )}
        <div className="flex justify-end gap-2 pt-1"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Create</Button></div>
      </div>
    </Modal>
  );
}
