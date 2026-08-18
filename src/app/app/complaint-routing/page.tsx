"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { computeScope, inScope } from "@/permissions";
import { hasCapability } from "@/permissions/capabilities";
import { gpById, gpsInBlock } from "@/data/hierarchy";
import { Complaint, ComplaintAuthority, ComplaintStatus } from "@/types";
import { Badge, Button, Card, CardBody, EmptyState, Field, Input, Modal, PageHeader, Select, Textarea } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { fmtDate, fmtDateTime } from "@/utils/format";
import { Megaphone, Plus, Route } from "lucide-react";

// Simple keyword-based routing engine (demo).
const CATEGORY_ROUTING: { keywords: string[]; authority: ComplaintAuthority; external: boolean }[] = [
  { keywords: ["light", "streetlight", "electric", "power", "transformer", "msedcl"], authority: "External Department", external: true },
  { keywords: ["water", "tap", "pipeline", "handpump", "borewell", "tanker"], authority: "Water & Sanitation", external: false },
  { keywords: ["road", "culvert", "drain", "building", "construction"], authority: "Engineering", external: false },
  { keywords: ["garbage", "waste", "toilet", "sanitation", "clean"], authority: "Sanitation", external: false },
  { keywords: ["job", "mgnrega", "muster", "wage"], authority: "MGNREGA", external: false },
];
function route(text: string): { authority: ComplaintAuthority; external: boolean } {
  const t = text.toLowerCase();
  for (const r of CATEGORY_ROUTING) if (r.keywords.some((k) => t.includes(k))) return { authority: r.authority, external: r.external };
  return { authority: "Gram Panchayat", external: false };
}

const STATUS_TONE: Record<ComplaintStatus, "slate" | "blue" | "amber" | "violet" | "green" | "red"> = {
  RECEIVED: "blue", CLASSIFIED: "violet", ROUTED: "violet", ACCEPTED: "blue", IN_PROGRESS: "amber", RESOLVED: "green", CLOSED: "green",
};

export default function ComplaintRoutingPage() {
  const { state, user, update, addAudit } = useStore();
  const auth = useAuth();
  const scope = computeScope(auth.user);
  const complaints = (state.complaints ?? []).filter((c) => inScope(scope, c));
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const current = selected ? (state.complaints ?? []).find((c) => c.id === selected.id) ?? selected : null;
  const canRoute = hasCapability(auth.user, "ROUTE_COMPLAINT");
  const canSubmit = hasCapability(auth.user, "SUBMIT_COMPLAINT");

  const advance = (c: Complaint, status: ComplaintStatus, action: string) => {
    update((d) => { const x = (d.complaints ?? []).find((z) => z.id === c.id); if (x) { x.status = status; x.timeline.push({ id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user!.name, actorRole: user!.role, action, toStatus: status }); } });
    if (user) addAudit({ actor: user.name, actorRole: user.role, action: `Complaint ${c.id}: ${action}`, entity: "Complaint", entityId: c.id, toStatus: status });
  };

  return (
    <div>
      <PageHeader title="Complaint Routing" titleMr="तक्रार मार्गक्रमण" subtitle="Classify and route citizen complaints to the right authority">
        <DemoBadge />
        {canSubmit && <Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New Complaint</Button>}
      </PageHeader>
      <div className="mb-4"><Disclaimer text="External department coordination (electricity, PWD, etc.) requires an authorized Government process / official integration. The platform does not control external agencies." /></div>

      {complaints.length === 0 ? (
        <EmptyState icon={<Megaphone className="h-8 w-8" />} title="No complaints in scope" />
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{c.category}</p><p className="truncate text-xs text-slate-400">{c.id} · {gpById(c.gpId)?.name} · → {c.suggestedAuthority}</p></div>
                {c.isExternal && <Badge tone="red">External</Badge>}
                <Badge tone={STATUS_TONE[c.status]} dot>{c.status.replace(/_/g, " ")}</Badge>
              </button>
            ))}
          </div>
        </Card>
      )}

      {current && (
        <Modal open onClose={() => setSelected(null)} title={`${current.id} — ${current.category}`} wide>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2"><Badge tone={STATUS_TONE[current.status]} dot>{current.status.replace(/_/g, " ")}</Badge>{current.isExternal && <Badge tone="red">External department</Badge>}</div>
            <p className="text-sm text-slate-600">{current.description}</p>
            <div className="rounded-lg bg-slate-50 p-3 text-sm"><span className="text-slate-400">Suggested responsible authority:</span> <span className="font-semibold text-slate-800">{current.suggestedAuthority}</span></div>
            {current.isExternal && <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">External coordination requires authorized Government process / official integration.</div>}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500">Timeline</p>
              <div className="space-y-2 border-l-2 border-slate-100 pl-3">
                {current.timeline.map((t) => (<div key={t.id} className="relative text-xs"><span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-brand-400 ring-2 ring-white" /><p className="font-medium text-slate-700">{t.action}</p><p className="text-slate-400">{t.actor} · {fmtDateTime(t.ts)}</p></div>))}
              </div>
            </div>
            {canRoute && current.status !== "RESOLVED" && current.status !== "CLOSED" && !current.isExternal && (
              <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
                {current.status === "CLASSIFIED" && <Button size="sm" onClick={() => advance(current, "ROUTED", "Routed to authority")}>Route</Button>}
                {(current.status === "ROUTED" || current.status === "RECEIVED") && <Button size="sm" onClick={() => advance(current, "ACCEPTED", "Accepted")}>Accept</Button>}
                {current.status === "ACCEPTED" && <Button size="sm" onClick={() => advance(current, "IN_PROGRESS", "Action in progress")}>Start Action</Button>}
                {current.status === "IN_PROGRESS" && <Button size="sm" variant="secondary" onClick={() => advance(current, "RESOLVED", "Resolved")}>Resolve</Button>}
              </div>
            )}
          </div>
        </Modal>
      )}
      {showNew && <NewComplaintModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewComplaintModal({ onClose }: { onClose: () => void }) {
  const { update, addAudit, user } = useStore();
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const gps = user?.blockId ? gpsInBlock(user.blockId) : [];
  const [gpId, setGpId] = useState(user?.gpId ?? gps[0]?.id ?? "gp-borgaon");
  const routed = route(`${category} ${desc}`);
  const save = () => {
    if (!category.trim()) return;
    const gp = gpById(gpId);
    const id = `CMP-${Math.floor(Math.random() * 900 + 100)}`;
    update((d) => { (d.complaints ??= []).unshift({ id, category, description: desc || category, districtId: "d-yvt", blockId: gp?.blockId ?? "b-yavatmal", gpId, citizenName: user?.name ?? "Demo Citizen", suggestedAuthority: routed.authority, isExternal: routed.external, status: "CLASSIFIED", createdOn: new Date().toISOString(), timeline: [{ id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user?.name ?? "Demo Citizen", actorRole: user?.role ?? "citizen", action: `Received & classified → ${routed.authority}`, toStatus: "CLASSIFIED" }] }); });
    if (user) addAudit({ actor: user.name, actorRole: user.role, action: `Filed complaint ${id}`, entity: "Complaint", entityId: id, toStatus: "CLASSIFIED" });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="New Complaint">
      <div className="space-y-3">
        <Field label="Category / Subject"><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Streetlight not working" /></Field>
        <Field label="Description"><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <Field label="Village"><Select value={gpId} onChange={(e) => setGpId(e.target.value)}>{gps.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
        <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm"><Route className="mr-1 inline h-3.5 w-3.5 text-brand-600" /> Suggested authority: <b>{routed.authority}</b>{routed.external && " (external — needs official coordination)"}</div>
        <div className="flex justify-end gap-2 pt-1"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Submit Complaint</Button></div>
      </div>
    </Modal>
  );
}
