"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { hasCapability } from "@/permissions/capabilities";
import { InnovationEntry } from "@/types";
import { Badge, Button, Card, CardBody, EmptyState, Modal, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/Tabs";
import { DemoBadge } from "@/components/ui/common";
import { Lightbulb, Sparkles, Trophy } from "lucide-react";
import { gpById } from "@/data/hierarchy";

export default function InnovationPage() {
  const [tab, setTab] = useState("library");
  const { state } = useStore();
  return (
    <div>
      <PageHeader title="Innovation" titleMr="नवोपक्रम" subtitle="Yashkatha Pratikruti (replication) & Abhinav Aavhan (challenge)">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4">
        <Tabs active={tab} onChange={setTab} tabs={[{ key: "library", label: "Replication Library", badge: state.innovations.length }, { key: "challenge", label: "Innovation Challenge" }]} />
      </div>
      {tab === "library" ? <LibraryTab /> : <ChallengeTab />}
    </div>
  );
}

function LibraryTab() {
  const { state, addObligation, addAudit } = useStore();
  const { user } = useAuth();
  const [selected, setSelected] = useState<InnovationEntry | null>(null);
  const [applied, setApplied] = useState<string | null>(null);
  const canTemplate = hasCapability(user, "CREATE_FROM_TEMPLATE");

  const applyTemplate = (e: InnovationEntry) => {
    if (!user) return;
    e.replicationChecklist.forEach((item, idx) => {
      const id = `OBL-TPL-${Math.floor(Math.random() * 9000 + 1000)}-${idx}`;
      addObligation({
        id, title: `[${e.title}] ${item}`, description: `Generated from innovation template: ${e.title}.`, sourceType: "Internal Review Decision",
        source: { system: "Internal Order", referenceId: `TPL/${e.id}`, date: new Date().toISOString() },
        scope: "gp", districtId: "d-yvt", blockId: user.blockId ?? "b-yavatmal", gpId: user.gpId ?? "gp-borgaon", departmentId: "dept-panchayat",
        responsibleRole: "gram_sevak", createdOn: new Date().toISOString(), dueDate: new Date(Date.now() + (idx + 3) * 86400000).toISOString(),
        priority: "MEDIUM", status: "ASSIGNED", blockers: [], lastActivity: new Date().toISOString(), evidence: [], escalationLevel: 0, classification: "INTERNAL",
        timeline: [{ id: `tl-${Date.now()}-${idx}`, ts: new Date().toISOString(), actor: user.name, actorRole: user.role, action: "Created from innovation template", toStatus: "ASSIGNED" }],
      });
    });
    addAudit({ actor: user.name, actorRole: user.role, action: `Used innovation template: ${e.title}`, entity: "Innovation", entityId: e.id });
    setApplied(e.id);
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      {applied && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">✓ Template applied — replication tasks were created in PATHPURAVA.</div>}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {state.innovations.map((e) => (
          <Card key={e.id}>
            <CardBody>
              <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /><p className="text-sm font-semibold text-slate-800">{e.title}</p></div>
              <p className="mt-2 text-xs text-slate-500"><b>Problem:</b> {e.problem}</p>
              <p className="mt-1 text-xs text-slate-500"><b>Outcome:</b> {e.outcome}</p>
              <div className="mt-2 flex flex-wrap gap-1"><Badge tone="teal">{e.timeframe}</Badge></div>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => setSelected(e)}>{canTemplate ? "View & Use as Template" : "View Replication Checklist"}</Button>
            </CardBody>
          </Card>
        ))}
      </div>
      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.title} wide>
          <div className="space-y-3 text-sm">
            <Sec label="Problem" v={selected.problem} />
            <Sec label="Solution" v={selected.solution} />
            <div><p className="text-xs font-semibold text-slate-500">Steps</p><ol className="mt-1 list-decimal space-y-0.5 pl-5 text-slate-600">{selected.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
            <div className="grid grid-cols-2 gap-3">
              <Sec label="Timeframe" v={selected.timeframe} />
              <Sec label="Resources" v={selected.resources} />
            </div>
            {selected.ruleReference && <Sec label="Rule / Reference" v={selected.ruleReference} />}
            {selected.obstacles && <Sec label="Obstacles" v={selected.obstacles} />}
            <Sec label="Outcome" v={selected.outcome} />
            <div><p className="text-xs font-semibold text-slate-500">Replication Checklist</p><ul className="mt-1 space-y-0.5 text-slate-600">{selected.replicationChecklist.map((c, i) => <li key={i}>☐ {c}</li>)}</ul></div>
            {canTemplate ? (
              <Button className="w-full" onClick={() => applyTemplate(selected)}><Sparkles className="h-4 w-4" /> Use as Template (creates tasks)</Button>
            ) : (
              <p className="text-center text-xs italic text-slate-400">Read-only — creating replication tasks requires an authorised operational role.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Sec({ label, v }: { label: string; v: string }) {
  return <div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="text-slate-600">{v}</p></div>;
}

function ChallengeTab() {
  const { state } = useStore();
  return (
    <div className="space-y-4">
      {state.challenges.map((c) => (
        <Card key={c.id}>
          <CardBody>
            <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /><p className="text-sm font-semibold text-slate-800">{c.title}</p><Badge tone="blue">{c.status}</Badge></div>
            <p className="mt-1 text-sm text-slate-600">{c.question}</p>
            <p className="mt-3 text-xs font-semibold text-slate-500">Submissions ({c.submissions.length})</p>
            <div className="mt-2 space-y-2">
              {c.submissions.map((s) => (
                <div key={s.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-800">{s.title}</p><Badge tone={s.stage === "selected" || s.stage === "pilot" ? "green" : s.stage === "shortlisted" ? "amber" : "slate"}>{s.stage}</Badge></div>
                  <p className="text-xs text-slate-500">{s.solution} — <span className="italic">expected: {s.expectedResult}</span></p>
                  <p className="mt-1 text-[11px] text-slate-400">by {s.by}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs italic text-slate-400">Public voting is not enabled in this demo.</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
