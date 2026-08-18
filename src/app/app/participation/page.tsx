"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { forUser } from "@/utils/selectors";
import { hasCapability } from "@/permissions/capabilities";
import { gpById } from "@/data/hierarchy";
import { ContributionType, ParticipationActivity } from "@/types";
import { Badge, Button, Card, CardBody, EmptyState, Field, Input, Modal, PageHeader, Select } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { fmtDate } from "@/utils/format";
import { CheckCircle2, HeartHandshake, Users } from "lucide-react";

export default function ParticipationPage() {
  const { state, user, updateActivity, pushNotification, addAudit } = useStore();
  const auth = useAuth();
  const scoped = forUser(state, auth.user);
  const [selected, setSelected] = useState<ParticipationActivity | null>(null);
  const current = selected ? state.activities.find((a) => a.id === selected.id) ?? selected : null;

  return (
    <div>
      <PageHeader title="Shramsankalp" titleMr="श्रमसंकल्प" subtitle="Community Participation & Shramdaan Sangam">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Cash contributions are not processed. Only recorded contribution — demo / subject to authorised government process." /></div>
      {scoped.activities.length === 0 ? (
        <EmptyState icon={<HeartHandshake className="h-8 w-8" />} title="No activities in scope" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scoped.activities.map((a) => (
            <Card key={a.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div><p className="text-sm font-semibold text-slate-800">{a.title}</p><p className="text-xs text-slate-400">{gpById(a.gpId)?.name} · {fmtDate(a.date)}</p></div>
                  <Badge tone={a.status === "OPEN" ? "teal" : a.status === "COMPLETED" ? "green" : "amber"}>{a.status}</Badge>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs"><span className="text-slate-500">Volunteers</span><span className="font-semibold text-slate-700">{a.registeredVolunteers.length}/{a.needsVolunteers}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, (a.registeredVolunteers.length / a.needsVolunteers) * 100)}%` }} /></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">{a.needs.map((n) => <span key={n} className="rounded bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-inset ring-slate-200">{n}</span>)}</div>
                <Button size="sm" className="mt-3 w-full" onClick={() => setSelected(a)}>View & Participate</Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
      {current && <ActivityModal activity={current} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ActivityModal({ activity: a, onClose }: { activity: ParticipationActivity; onClose: () => void }) {
  const { updateActivity, pushNotification, addAudit } = useStore();
  const { user } = useAuth();
  const [skill, setSkill] = useState<ContributionType>("Labour");
  const [avail, setAvail] = useState("Morning");
  const registered = user ? a.registeredVolunteers.includes(user.name) : false;
  const canRegister = hasCapability(user, "SUBMIT_PARTICIPATION");
  const canComplete = hasCapability(user, "COMPLETE_PARTICIPATION_ACTIVITY") || hasCapability(user, "VERIFY_PARTICIPATION");

  const register = () => {
    if (!user) return;
    updateActivity(a.id, { registeredVolunteers: [...a.registeredVolunteers, user.name] });
    addAudit({ actor: user.name, actorRole: user.role, action: `Registered for ${a.title} (${skill}, ${avail})`, entity: "Activity", entityId: a.id });
    pushNotification({ type: "volunteer_activity", title: "New volunteer registered", body: `${user.name} registered for ${a.title}`, forRoles: ["gram_sevak", "shg_rep"], gpId: a.gpId, link: "/app/participation" });
  };

  const complete = () => {
    if (!user) return;
    updateActivity(a.id, { status: "COMPLETED", verifiedHours: a.registeredVolunteers.length * 6, impact: `${a.registeredVolunteers.length} volunteers participated; activity completed.` });
    addAudit({ actor: user.name, actorRole: user.role, action: `Marked ${a.title} completed`, entity: "Activity", entityId: a.id, toStatus: "COMPLETED" });
  };

  const isOrganiser = canComplete;

  return (
    <Modal open onClose={onClose} title={a.title}>
      <div className="space-y-4">
        <div className="flex items-center gap-2"><Badge tone={a.status === "OPEN" ? "teal" : a.status === "COMPLETED" ? "green" : "amber"}>{a.status}</Badge><span className="text-xs text-slate-400">{gpById(a.gpId)?.name} · {fmtDate(a.date)}</span></div>
        <div>
          <p className="mb-1 text-xs font-semibold text-slate-500">Activity needs</p>
          <ul className="space-y-1 text-sm text-slate-600">{a.needs.map((n) => <li key={n} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-500" /> {n}</li>)}</ul>
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Users className="h-3.5 w-3.5" /> Registered ({a.registeredVolunteers.length}/{a.needsVolunteers})</p>
          <div className="flex flex-wrap gap-1.5">{a.registeredVolunteers.map((v) => <Badge key={v} tone="blue">{v}</Badge>)}{!a.registeredVolunteers.length && <span className="text-xs text-slate-400">No volunteers yet</span>}</div>
        </div>
        {a.impact && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><p className="font-semibold">Impact</p><p>{a.impact}</p>{a.verifiedHours ? <p className="mt-1 text-xs">Verified hours: {a.verifiedHours}</p> : null}</div>}
        {a.status === "OPEN" && !registered && canRegister && (
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-600">Register your interest</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Contribution"><Select value={skill} onChange={(e) => setSkill(e.target.value as ContributionType)}>{(["Labour", "Skill", "Material", "Equipment", "Service", "Non-cash Support"] as ContributionType[]).map((c) => <option key={c} value={c}>{c}</option>)}</Select></Field>
              <Field label="Availability"><Select value={avail} onChange={(e) => setAvail(e.target.value)}>{["Morning", "Afternoon", "Full day"].map((c) => <option key={c} value={c}>{c}</option>)}</Select></Field>
            </div>
            <Button className="mt-2 w-full" onClick={register}>Register to Participate</Button>
          </div>
        )}
        {registered && a.status === "OPEN" && <div className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">✓ You are registered for this activity.</div>}
        {isOrganiser && a.status !== "COMPLETED" && <Button variant="secondary" className="w-full" onClick={complete}>Mark Activity Completed (organiser)</Button>}
      </div>
    </Modal>
  );
}
