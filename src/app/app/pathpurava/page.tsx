"use client";

import { useMemo, useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { can } from "@/permissions";
import { hasCapability } from "@/permissions/capabilities";
import { forUser, systemicBlockers, getAccessibleHandovers, getAccessibleUcFollowUps, canAcceptHandover, canReviewHandover } from "@/utils/selectors";
import { BLOCKS, gpById, gpsInBlock } from "@/data/hierarchy";
import { Obligation, ObligationStatus, BlockerCategory } from "@/types";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/Tabs";
import { DemoBadge, Disclaimer, SourceRefTag } from "@/components/ui/common";
import { EvidencePicker } from "@/components/field/EvidencePicker";
import { OBLIGATION_STATUS, PRIORITY, Tone } from "@/utils/labels";
import { fmtDate, fmtDateTime, relTime } from "@/utils/format";
import {
  AlertOctagon,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  FileCheck2,
  Filter,
  KanbanSquare,
  List,
  Plus,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const KANBAN_COLS: ObligationStatus[] = ["ASSIGNED", "IN_PROGRESS", "BLOCKED", "UNDER_REVIEW", "VERIFIED"];

export default function PathpuravaPage() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const [tab, setTab] = useState("obligations");
  const scoped = forUser(state, user);
  const blockerCount = scoped.obligations.filter((o) => o.status === "BLOCKED").length;

  return (
    <div>
      <PageHeader title="PATHPURAVA" titleMr="पाठपुरावा" subtitle="Decision to Completion · District Execution & Compliance Layer">
        <DemoBadge />
      </PageHeader>

      <div className="mb-4">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { key: "obligations", label: "Obligations", badge: scoped.obligations.length },
            { key: "adthala", label: "ADTHALA — Blockers", badge: blockerCount },
            { key: "aadesh", label: "Aadesh-te-Kruti (AI)" },
            { key: "uc", label: "UC Follow-up" },
            { key: "handover", label: "HASTANTARAN" },
          ]}
        />
      </div>

      {tab === "obligations" && <ObligationsTab />}
      {tab === "adthala" && <AdthalaTab />}
      {tab === "aadesh" && <AadeshTab />}
      {tab === "uc" && <UcTab />}
      {tab === "handover" && <HandoverTab />}
    </div>
  );
}

// ===========================================================================
// OBLIGATIONS TAB
// ===========================================================================
function ObligationsTab() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const scoped = forUser(state, user);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [selected, setSelected] = useState<Obligation | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [fStatus, setFStatus] = useState("");
  const [fBlock, setFBlock] = useState("");
  const [fPriority, setFPriority] = useState("");

  const filtered = useMemo(() => {
    return scoped.obligations.filter((o) => {
      if (fStatus && o.status !== fStatus) return false;
      if (fBlock && o.blockId !== fBlock) return false;
      if (fPriority && o.priority !== fPriority) return false;
      return true;
    });
  }, [scoped.obligations, fStatus, fBlock, fPriority]);

  const current = selected ? state.obligations.find((o) => o.id === selected.id) ?? selected : null;
  const canCreate = hasCapability(user, "CREATE_OBLIGATION");

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="w-auto text-xs">
              <option value="">All statuses</option>
              {Object.entries(OBLIGATION_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.en}</option>
              ))}
            </Select>
            <Select value={fBlock} onChange={(e) => setFBlock(e.target.value)} className="w-auto text-xs">
              <option value="">All blocks</option>
              {BLOCKS.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
            <Select value={fPriority} onChange={(e) => setFPriority(e.target.value)} className="w-auto text-xs">
              <option value="">All priorities</option>
              {Object.entries(PRIORITY).map(([k, v]) => (
                <option key={k} value={k}>{v.en}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-slate-200">
              <button onClick={() => setView("list")} className={`px-2.5 py-1.5 ${view === "list" ? "bg-brand-600 text-white" : "text-slate-500"}`}><List className="h-4 w-4" /></button>
              <button onClick={() => setView("kanban")} className={`px-2.5 py-1.5 ${view === "kanban" ? "bg-brand-600 text-white" : "text-slate-500"}`}><KanbanSquare className="h-4 w-4" /></button>
            </div>
            {canCreate && <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add</Button>}
          </div>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileCheck2 className="h-8 w-8" />} title="No obligations in scope" subtitle="Adjust filters or add a new obligation." />
      ) : view === "list" ? (
        <Card>
          <div className="divide-y divide-slate-100">
            {filtered.map((o) => (
              <button key={o.id} onClick={() => setSelected(o)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{o.title}</p>
                  <p className="truncate text-xs text-slate-400">{o.id} · {gpById(o.gpId)?.name ?? "—"} · {o.sourceType} · due {relTime(o.dueDate)}</p>
                </div>
                {o.blockers.filter((b) => !b.resolved).length > 0 && <Badge tone="amber">{o.blockers.filter((b) => !b.resolved)[0].category}</Badge>}
                <Badge tone={PRIORITY[o.priority].tone as Tone}>{o.priority}</Badge>
                <Badge tone={OBLIGATION_STATUS[o.status].tone} dot>{OBLIGATION_STATUS[o.status].en}</Badge>
                <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {KANBAN_COLS.map((col) => {
            const items = filtered.filter((o) => o.status === col);
            return (
              <div key={col} className="rounded-xl bg-slate-100/60 p-2">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-600">{OBLIGATION_STATUS[col].en}</span>
                  <span className="rounded-full bg-white px-1.5 text-[10px] font-bold text-slate-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((o) => (
                    <button key={o.id} onClick={() => setSelected(o)} className="w-full rounded-lg bg-white p-2.5 text-left shadow-sm ring-1 ring-slate-100 hover:ring-brand-200">
                      <p className="line-clamp-2 text-xs font-medium text-slate-800">{o.title}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{gpById(o.gpId)?.name}</p>
                      <div className="mt-1.5 flex items-center gap-1">
                        <Badge tone={PRIORITY[o.priority].tone as Tone}>{o.priority}</Badge>
                      </div>
                    </button>
                  ))}
                  {!items.length && <p className="px-1 py-3 text-center text-[11px] text-slate-400">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {current && <ObligationDrawer obligation={current} onClose={() => setSelected(null)} />}
      {showAdd && <AddObligationModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

// ---- Detail drawer with permission-gated workflow actions ----
function ObligationDrawer({ obligation: o, onClose }: { obligation: Obligation; onClose: () => void }) {
  const { updateObligation, pushNotification, queueIfOffline } = useStore();
  const { user, role } = useAuth();
  const [comment, setComment] = useState("");
  const [blockerCat, setBlockerCat] = useState<BlockerCategory>("Technical Sanction Pending");

  const addTimeline = (action: string, toStatus?: ObligationStatus, extra?: string) => {
    const patch: Partial<Obligation> = {};
    if (toStatus) patch.status = toStatus;
    patch.timeline = [
      ...o.timeline,
      { id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user!.name, actorRole: user!.role, action, fromStatus: o.status, toStatus, comment: extra ?? (comment || undefined) },
    ];
    updateObligation(o.id, patch, { actor: user!.name, actorRole: user!.role, action, entity: "Obligation", entityId: o.id, fromStatus: o.status, toStatus, comment: extra ?? comment });
    queueIfOffline({ entityType: "OBLIGATION", entityId: o.id, action: `UPDATE_STATUS: ${action}`, userId: user!.id });
    setComment("");
  };

  const isOwnerGp = user?.gpId === o.gpId;
  const canWork = hasCapability(user, "UPDATE_OWN_OBLIGATION", { gpId: o.gpId }) && isOwnerGp;
  const canReview = hasCapability(user, "REVIEW_OBLIGATION");
  const canEscalate = hasCapability(user, "ESCALATE_OBLIGATION");
  const canVerify = hasCapability(user, "VERIFY_OBLIGATION");
  const activeBlockers = o.blockers.filter((b) => !b.resolved);

  return (
    <Modal open onClose={onClose} title={`${o.id} — ${o.title}`} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={OBLIGATION_STATUS[o.status].tone} dot>{OBLIGATION_STATUS[o.status].en}</Badge>
          <Badge tone={PRIORITY[o.priority].tone as Tone}>{PRIORITY[o.priority].en} priority</Badge>
          <Badge tone="slate">{o.sourceType}</Badge>
          {o.escalationLevel > 0 && <Badge tone="red">Escalated L{o.escalationLevel}</Badge>}
        </div>

        <p className="text-sm text-slate-600">{o.description}</p>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-3">
          <Meta label="GP / Scope" value={gpById(o.gpId)?.name ?? o.scope} />
          <Meta label="Responsible" value={o.responsibleRole.replace(/_/g, " ")} />
          <Meta label="Due" value={`${fmtDate(o.dueDate)} (${relTime(o.dueDate)})`} />
          <Meta label="Created" value={fmtDate(o.createdOn)} />
          <Meta label="Department" value={o.departmentId?.replace("dept-", "") ?? "—"} />
          <Meta label="Classification" value={o.classification} />
        </div>

        <div><p className="mb-1 text-xs font-semibold text-slate-500">Source Reference</p><SourceRefTag source={o.source} /></div>

        {activeBlockers.length > 0 && (
          <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-inset ring-amber-500/20">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-800"><ShieldAlert className="h-3.5 w-3.5" /> Active Blockers</p>
            {activeBlockers.map((b) => (
              <div key={b.id} className="text-sm text-amber-900">
                <span className="font-medium">{b.category}</span> — {b.note} <span className="text-xs text-amber-700">(raised {relTime(b.raisedOn)})</span>
              </div>
            ))}
          </div>
        )}

        {o.evidence.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Evidence</p>
            <div className="flex flex-wrap items-center gap-2">
              {o.evidence.map((e) => e.dataUrl ? (
                <span key={e.id} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 p-1 pr-2 text-xs text-teal-700 ring-1 ring-inset ring-teal-500/20"><img src={e.dataUrl} alt={e.name} className="h-8 w-8 rounded object-cover" /> {e.name}</span>
              ) : (
                <span key={e.id} className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs text-teal-700 ring-1 ring-inset ring-teal-500/20">{e.name} · {e.type}{e.storageMode === "METADATA_ONLY" ? " · metadata" : ""}</span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">Activity Timeline</p>
          <div className="space-y-2 border-l-2 border-slate-100 pl-3">
            {o.timeline.map((t) => (
              <div key={t.id} className="relative text-xs">
                <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-brand-400 ring-2 ring-white" />
                <p className="font-medium text-slate-700">{t.action}{t.toStatus && <span className="text-slate-400"> → {OBLIGATION_STATUS[t.toStatus as ObligationStatus]?.en ?? t.toStatus}</span>}</p>
                <p className="text-slate-400">{t.actor} · {t.actorRole.replace(/_/g, " ")} · {fmtDateTime(t.ts)}</p>
                {t.comment && <p className="italic text-slate-500">&ldquo;{t.comment}&rdquo;</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Evidence upload (GP owner) */}
        {canWork && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Add Evidence</p>
            <EvidencePicker byName={user!.name} byRole={user!.role} onAdd={(ev) => updateObligation(o.id, { evidence: [...o.evidence, ev], timeline: [...o.timeline, { id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user!.name, actorRole: user!.role, action: `Evidence submitted: ${ev.name}` }] }, { actor: user!.name, actorRole: user!.role, action: `Submitted evidence: ${ev.name}`, entity: "Obligation", entityId: o.id })} />
          </div>
        )}

        {/* Actions */}
        {(canWork || canReview || canEscalate || canVerify) && (
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-600">Actions {role && <span className="text-slate-400">— as {role.name}</span>}</p>
            <Textarea placeholder="Add a comment (optional)…" value={comment} onChange={(e) => setComment(e.target.value)} className="mb-2" />
            <div className="flex flex-wrap gap-2">
              {canWork && o.status !== "IN_PROGRESS" && o.status !== "COMPLETED" && o.status !== "VERIFIED" && (
                <Button size="sm" variant="outline" onClick={() => addTimeline("Marked in progress", "IN_PROGRESS")}>Add Status: In Progress</Button>
              )}
              {canWork && o.status !== "BLOCKED" && (
                <div className="flex items-center gap-1">
                  <Select value={blockerCat} onChange={(e) => setBlockerCat(e.target.value as BlockerCategory)} className="w-auto text-xs">
                    {(["Technical Sanction Pending", "Fund Release Pending", "Other Department Pending", "Gram Sabha Required", "Material Pending", "Contractor Delay", "Staff Vacancy", "Document Pending", "Field Verification Pending", "Procurement Pending", "Other"] as BlockerCategory[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => {
                    updateObligation(o.id, { status: "BLOCKED", blockers: [...o.blockers, { id: `blk-${Date.now()}`, category: blockerCat, note: comment || "Blocker reported", raisedBy: user!.name, raisedOn: new Date().toISOString() }], timeline: [...o.timeline, { id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user!.name, actorRole: user!.role, action: "Reported blocker", fromStatus: o.status, toStatus: "BLOCKED", comment: blockerCat }] }, { actor: user!.name, actorRole: user!.role, action: `Reported blocker: ${blockerCat}`, entity: "Obligation", entityId: o.id, toStatus: "BLOCKED" });
                    pushNotification({ type: "blocker_escalated", title: "Blocker reported", body: `${blockerCat} on ${o.id}`, forRoles: ["bdo", "extension_officer", "dyceo_panchayat"], gpId: o.gpId, blockId: o.blockId, link: "/app/pathpurava" });
                    queueIfOffline({ entityType: "OBLIGATION", entityId: o.id, action: `UPDATE_BLOCKER: ${blockerCat}`, userId: user!.id });
                    setComment("");
                  }}>Report Blocker</Button>
                </div>
              )}
              {canWork && o.status === "BLOCKED" && (
                <Button size="sm" variant="outline" onClick={() => addTimeline("Blocker resolved, resumed", "IN_PROGRESS")}>Resolve Blocker</Button>
              )}
              {canWork && (o.status === "IN_PROGRESS" || o.status === "BLOCKED" || o.status === "RETURNED") && (
                <Button size="sm" variant="secondary" onClick={() => { addTimeline("Submitted for review", "UNDER_REVIEW"); pushNotification({ type: "review_requested", title: "Evidence submitted", body: `${o.id} submitted for review`, forRoles: ["extension_officer", "bdo"], gpId: o.gpId, link: "/app/pathpurava" }); }}>Submit for Review</Button>
              )}
              {canVerify && o.status === "UNDER_REVIEW" && (
                <Button size="sm" onClick={() => addTimeline("Verified", "VERIFIED")}><CheckCircle2 className="h-4 w-4" /> Verify</Button>
              )}
              {canReview && o.status === "UNDER_REVIEW" && (
                <Button size="sm" variant="outline" onClick={() => addTimeline("Returned for correction", "RETURNED")}>Return</Button>
              )}
              {canEscalate && o.escalationLevel < 2 && (
                <Button size="sm" variant="danger" onClick={() => { updateObligation(o.id, { escalationLevel: o.escalationLevel + 1, timeline: [...o.timeline, { id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user!.name, actorRole: user!.role, action: `Escalated to level ${o.escalationLevel + 1}`, comment }] }, { actor: user!.name, actorRole: user!.role, action: "Escalated", entity: "Obligation", entityId: o.id }); setComment(""); }}><AlertOctagon className="h-4 w-4" /> Escalate</Button>
              )}
            </div>
          </div>
        )}
        <p className="text-xs italic text-slate-400">Visibility does not grant edit rights. Higher roles can review, but the original GP evidence cannot be silently overwritten.</p>
      </div>
    </Modal>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value}</p>
    </div>
  );
}

function AddObligationModal({ onClose }: { onClose: () => void }) {
  const { addObligation, addAudit } = useStore();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const gps = user?.blockId ? gpsInBlock(user.blockId) : [];
  const [gpId, setGpId] = useState(user?.gpId ?? gps[0]?.id ?? "");

  const submit = () => {
    if (!title.trim()) return;
    const gp = gpById(gpId);
    const id = `OBL-${Math.floor(Math.random() * 9000 + 1000)}`;
    addObligation({
      id, title, titleMr: "", description: desc || "Manually added obligation.", sourceType: "Internal Review Decision",
      source: { system: "Internal Order", referenceId: `INT/${id}`, date: new Date().toISOString() },
      scope: "gp", districtId: "d-yvt", blockId: gp?.blockId ?? user?.blockId, gpId, departmentId: "dept-panchayat",
      responsibleRole: "gram_sevak", assignedUserId: user?.id, createdOn: new Date().toISOString(), dueDate: due ? new Date(due).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
      priority: priority as any, status: "ASSIGNED", blockers: [], lastActivity: new Date().toISOString(), evidence: [], escalationLevel: 0, classification: "INTERNAL",
      timeline: [{ id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user!.name, actorRole: user!.role, action: "Obligation created", toStatus: "ASSIGNED" }],
    });
    addAudit({ actor: user!.name, actorRole: user!.role, action: "Created obligation", entity: "Obligation", entityId: id, toStatus: "ASSIGNED" });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Add Obligation">
      <div className="space-y-3">
        <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Complete drain clearing" /></Field>
        <Field label="Description"><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gram Panchayat">
            <Select value={gpId} onChange={(e) => setGpId(e.target.value)}>
              {gps.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {Object.keys(PRIORITY).map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Due date"><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Create Obligation</Button>
        </div>
      </div>
    </Modal>
  );
}

// ===========================================================================
// ADTHALA — blocker & dependency intelligence
// ===========================================================================
function AdthalaTab() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const scoped = forUser(state, user);
  const blockers = systemicBlockers(scoped.obligations);
  const total = blockers.reduce((s, b) => s + b.count, 0);
  return (
    <div className="space-y-4">
      <Disclaimer text="ADTHALA surfaces systemic blockers so leadership can intervene. It does not resolve them autonomously." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-800">Blocker Categories</p>
            <p className="mb-3 text-xs text-slate-400">{total} active blockers in your scope</p>
            <div className="space-y-2">
              {blockers.map((b) => (
                <div key={b.category} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="truncate text-slate-700">{b.category}</span>
                      <span className="font-semibold text-slate-800">{b.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-rose-400" style={{ width: `${total ? (b.count / blockers[0].count) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <Badge tone="amber">{b.gpCount} GP</Badge>
                </div>
              ))}
              {!blockers.length && <p className="py-6 text-center text-sm text-emerald-600">No active blockers in scope.</p>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-800">Systemic Insight</p>
            <p className="mb-3 text-xs text-slate-400">Repeated blockers across GPs</p>
            <div className="space-y-3">
              {blockers.slice(0, 4).map((b) => (
                <div key={b.category} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-800">{b.count} obligations across {b.gpCount} GP(s) are waiting for <span className="text-rose-600">{b.category}</span>.</p>
                  <p className="mt-1 text-xs text-slate-400">Surface to {b.gpCount > 2 ? "Deputy CEO / CEO" : "BDO"} for intervention.</p>
                </div>
              ))}
              {!blockers.length && <EmptyState title="No systemic blockers" />}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ===========================================================================
// AADESH-TE-KRUTI — simulated AI extraction
// ===========================================================================
const MOCK_GR = {
  name: "GR — पावसाळापूर्व सज्जता परिपत्रक 2026",
  ref: "ZP/YVT/PM-CIRC/2026/214",
  text: "सर्व निवडक ग्रामपंचायतींनी १५ मे पूर्वी पावसाळापूर्व नाले व मोरी तपासणी पूर्ण करावी आणि पुरावा सादर करावा. तांत्रिक मंजुरी आवश्यक असल्यास उपविभागाकडे प्रस्ताव पाठवावा.",
  suggestions: [
    { action: "Complete pre-monsoon drainage & culvert inspection", role: "Gram Sevak", deadline: "15 May 2026", office: "All selected GPs", source: "सर्व निवडक ग्रामपंचायतींनी १५ मे पूर्वी पावसाळापूर्व नाले व मोरी तपासणी पूर्ण करावी", confidence: 0.94 },
    { action: "Submit inspection evidence to Extension Officer", role: "Gram Sevak", deadline: "15 May 2026", office: "GP → Block", source: "पुरावा सादर करावा", confidence: 0.88 },
    { action: "Send technical sanction proposal to Sub-Division", role: "Junior Engineer", deadline: "10 May 2026", office: "Sub-Division", source: "तांत्रिक मंजुरी आवश्यक असल्यास उपविभागाकडे प्रस्ताव पाठवावा", confidence: 0.79 },
  ],
};

function AadeshTab() {
  const { addObligation, addAudit } = useStore();
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Record<number, "pending" | "approved" | "rejected">>({});
  const canApprove = hasCapability(user, "REVIEW_OBLIGATION") || hasCapability(user, "CREATE_OBLIGATION");

  const approve = (i: number) => {
    const s = MOCK_GR.suggestions[i];
    const id = `OBL-AI-${Math.floor(Math.random() * 900 + 100)}`;
    addObligation({
      id, title: s.action, description: `Extracted from ${MOCK_GR.name}. ${s.source}`, sourceType: "Circular",
      source: { system: "Government GR", referenceId: MOCK_GR.ref, documentName: MOCK_GR.name, date: new Date().toISOString() },
      scope: "gp", districtId: "d-yvt", blockId: user?.blockId ?? "b-yavatmal", gpId: user?.gpId ?? "gp-borgaon", departmentId: "dept-engineering",
      responsibleRole: "gram_sevak", createdOn: new Date().toISOString(), dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      priority: "HIGH", status: "ASSIGNED", blockers: [], lastActivity: new Date().toISOString(), evidence: [], escalationLevel: 0, classification: "INTERNAL", publishedPublic: true,
      timeline: [{ id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user!.name, actorRole: user!.role, action: "Approved AI extraction → obligation created", toStatus: "ASSIGNED" }],
    });
    addAudit({ actor: user!.name, actorRole: user!.role, action: "Approved AI-suggested obligation", entity: "Obligation", entityId: id });
    setStatuses((p) => ({ ...p, [i]: "approved" }));
  };

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50/40">
        <CardBody className="flex items-start gap-3">
          <Bot className="mt-0.5 h-5 w-5 text-brand-600" />
          <div>
            <p className="text-sm font-semibold text-slate-800">AI suggestions are not official until approved by an authorised officer.</p>
            <p className="text-xs text-slate-500">This is a simulated extraction. No real AI API is used in the demo.</p>
          </div>
        </CardBody>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <p className="text-sm font-semibold text-slate-800">{MOCK_GR.name}</p>
            <p className="text-xs text-slate-400">{MOCK_GR.ref}</p>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{MOCK_GR.text}</div>
            <p className="mt-2 text-xs italic text-slate-400">Source citation shown against each suggestion below.</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800"><Sparkles className="h-4 w-4 text-brand-600" /> AI Suggested Obligations</p>
            <div className="space-y-3">
              {MOCK_GR.suggestions.map((s, i) => {
                const st = statuses[i] ?? "pending";
                return (
                  <div key={i} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{s.action}</p>
                      <Badge tone={s.confidence > 0.9 ? "green" : s.confidence > 0.8 ? "amber" : "slate"}>{Math.round(s.confidence * 100)}%</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Responsible: {s.role} · Deadline: {s.deadline} · Office: {s.office}</p>
                    <p className="mt-1 rounded bg-slate-50 px-2 py-1 text-[11px] italic text-slate-500">&ldquo;{s.source}&rdquo;</p>
                    {st === "pending" ? (
                      canApprove ? (
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" onClick={() => approve(i)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => setStatuses((p) => ({ ...p, [i]: "approved" }))}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => setStatuses((p) => ({ ...p, [i]: "rejected" }))}>Reject</Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs italic text-slate-400">Approval available only to authorised review/operational roles.</p>
                      )
                    ) : (
                      <Badge tone={st === "approved" ? "green" : "slate"} className="mt-2">{st === "approved" ? "Approved → obligation created" : "Rejected"}</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ===========================================================================
// UC FOLLOW-UP
// ===========================================================================
function UcTab() {
  const { state } = useStore();
  const { user } = useAuth();
  const ucs = getAccessibleUcFollowUps(user, state.ucFollowUps);
  return (
    <div className="space-y-4">
      <Disclaimer text="Financial source of truth remains the Government system (ZPFMS/eGramSwaraj). This is scoped operational follow-up only." />
      {ucs.length === 0 ? (
        <EmptyState icon={<FileCheck2 className="h-8 w-8" />} title="No UC follow-ups in your scope" />
      ) : (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">UC Reference</th><th className="px-4 py-2.5">Scheme</th><th className="px-4 py-2.5">GP</th><th className="px-4 py-2.5">Amount (ref)</th><th className="px-4 py-2.5">Due</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ucs.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{u.ucRef}</td>
                  <td className="px-4 py-2.5">{u.scheme}</td>
                  <td className="px-4 py-2.5">{gpById(u.gpId)?.name}</td>
                  <td className="px-4 py-2.5">{u.amountRef}</td>
                  <td className="px-4 py-2.5">{fmtDate(u.dueDate)}</td>
                  <td className="px-4 py-2.5"><Badge tone={u.status === "BLOCKED" ? "red" : u.status === "SUBMITTED" ? "green" : "amber"}>{u.status}</Badge></td>
                  <td className="px-4 py-2.5 text-xs text-slate-400">{u.sourceSystem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}

// ===========================================================================
// HASTANTARAN — officer handover
// ===========================================================================
function HandoverTab() {
  const { state, update, addAudit } = useStore();
  const { user } = useAuth();
  const [remarks, setRemarks] = useState("");
  const handovers = getAccessibleHandovers(user, state.handovers);
  const accept = (h: (typeof handovers)[number]) => {
    if (!canAcceptHandover(user, h)) return;
    update((d) => {
      const x = d.handovers.find((z) => z.id === h.id);
      if (x) { x.accepted = true; x.status = "ACCEPTED"; x.acceptedOn = new Date().toISOString(); x.remarks = remarks || "Accepted."; x.incomingName = user!.name; }
    });
    addAudit({ actor: user!.name, actorRole: user!.role, action: `HANDOVER_ACCEPTED — ${gpById(h.gpId)?.name}`, entity: "Handover", entityId: h.id, fromStatus: "AWAITING_ACCEPTANCE", toStatus: "ACCEPTED", comment: `incoming=${h.incomingUserId}; outgoing=${h.outgoingUserId}` });
    setRemarks("");
  };
  const reviewer = canReviewHandover(user);
  return (
    <div className="space-y-4">
      <Disclaimer text="HASTANTARAN generates a continuity pack when an officer is transferred, on long leave or reassigned. Scoped to your GPs/block/district; only the designated incoming officer can accept." />
      {handovers.length === 0 && <EmptyState icon={<FileCheck2 className="h-8 w-8" />} title="No handovers in your scope" />}
      <div className="grid gap-4 lg:grid-cols-2">
        {handovers.map((h) => (
          <Card key={h.id}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{gpById(h.gpId)?.name} — {h.reason.replace("_", " ")}</p>
                  <p className="text-xs text-slate-400">{h.outgoingName} → {h.incomingName ?? "Incoming officer"} · {fmtDate(h.generatedOn)}</p>
                </div>
                <Badge tone={h.accepted ? "green" : "amber"}>{h.accepted ? "Accepted" : "Pending"}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[["Open", h.openObligations], ["Overdue", h.overdueMatters], ["Blockers", h.activeBlockers], ["Audit", h.pendingAudit], ["UC", h.pendingUC], ["Seasonal", h.seasonalResponsibilities]].map(([l, v]) => (
                  <div key={l as string} className="rounded-lg bg-slate-50 py-2"><p className="text-lg font-bold text-slate-800">{v as number}</p><p className="text-[10px] uppercase text-slate-400">{l as string}</p></div>
                ))}
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p><span className="font-semibold">Key decisions:</span> {h.keyDecisions.join("; ")}</p>
                <p><span className="font-semibold">Next deadlines:</span> {h.nextDeadlines.join("; ")}</p>
                <p><span className="font-semibold">Key contacts:</span> {h.keyContacts.join("; ")}</p>
              </div>
              {!h.accepted && canAcceptHandover(user, h) ? (
                <div className="mt-3">
                  <Input placeholder="Acknowledgement remarks…" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="mb-2" />
                  <Button size="sm" onClick={() => accept(h)}><CheckCircle2 className="h-4 w-4" /> Accept Handover</Button>
                </div>
              ) : !h.accepted && reviewer ? (
                <p className="mt-3 rounded bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-500">Review Handover — supervisory review only (cannot accept on the incoming officer's behalf).</p>
              ) : !h.accepted ? (
                <p className="mt-3 rounded bg-slate-50 px-2 py-1.5 text-xs text-slate-500">Read Only — awaiting the designated incoming officer.</p>
              ) : null}
              {h.accepted && h.remarks && <p className="mt-3 rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Accepted {fmtDate(h.acceptedOn)} — &ldquo;{h.remarks}&rdquo;</p>}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
