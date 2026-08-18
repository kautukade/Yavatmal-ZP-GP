"use client";

import { useMemo, useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { can } from "@/permissions";
import { hasCapability } from "@/permissions/capabilities";
import { forUser } from "@/utils/selectors";
import { GPS, gpById } from "@/data/hierarchy";
import { Asset, AssetCondition, RepairStatus, RepairTicket } from "@/types";
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
import { ASSET_CONDITION, REPAIR_STATUS, Tone } from "@/utils/labels";
import { fmtDate, fmtDateTime, relTime } from "@/utils/format";
import {
  Camera,
  CheckCircle2,
  Droplets,
  MapPin,
  QrCode,
  Sprout,
  Wrench,
} from "lucide-react";

const REPAIR_FLOW: RepairStatus[] = ["REPORTED", "ASSIGNED", "INSPECTED", "REPAIR_IN_PROGRESS", "REPAIR_CLAIMED_COMPLETE", "VERIFICATION_PENDING", "VERIFIED", "CLOSED"];

export default function NigaaPage() {
  const [tab, setTab] = useState("assets");
  const { state, user } = { ...useStore(), user: useAuth().user };
  const scoped = forUser(state, user);
  const openRepairs = scoped.repairs.filter((r) => r.status !== "CLOSED" && r.status !== "VERIFIED").length;

  return (
    <div>
      <PageHeader title="NIGAA" titleMr="निगा" subtitle="Village Asset Functionality & Seasonal Readiness">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { key: "assets", label: "Assets", badge: scoped.assets.length },
            { key: "qr", label: "QR Asset Check" },
            { key: "repairs", label: "Repair Workflow", badge: openRepairs },
            { key: "plantation", label: "Plantation" },
          ]}
        />
      </div>
      {tab === "assets" && <AssetsTab />}
      {tab === "qr" && <QrTab />}
      {tab === "repairs" && <RepairsTab />}
      {tab === "plantation" && <PlantationTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
function conditionTone(c: AssetCondition): Tone {
  return ASSET_CONDITION[c].tone;
}

function AssetsTab() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const scoped = forUser(state, user);
  const [fCond, setFCond] = useState("");
  const [fType, setFType] = useState("");
  const [selected, setSelected] = useState<Asset | null>(null);
  const current = selected ? state.assets.find((a) => a.id === selected.id) ?? selected : null;

  const filtered = useMemo(
    () => scoped.assets.filter((a) => (!fCond || a.condition === fCond) && (!fType || a.type === fType)),
    [scoped.assets, fCond, fType]
  );
  const types = Array.from(new Set(scoped.assets.map((a) => a.type)));

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="flex flex-wrap items-center gap-2">
          <Select value={fCond} onChange={(e) => setFCond(e.target.value)} className="w-auto text-xs">
            <option value="">All conditions</option>
            {Object.entries(ASSET_CONDITION).map(([k, v]) => <option key={k} value={k}>{v.en}</option>)}
          </Select>
          <Select value={fType} onChange={(e) => setFType(e.target.value)} className="w-auto text-xs">
            <option value="">All types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </CardBody>
      </Card>
      {filtered.length === 0 ? (
        <EmptyState icon={<Wrench className="h-8 w-8" />} title="No assets in scope" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <button key={a.id} onClick={() => setSelected(a)} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-card transition-shadow hover:shadow-cardhover">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-slate-400">{a.code}</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{a.name}</p>
                </div>
                <Badge tone={conditionTone(a.condition)} dot>{ASSET_CONDITION[a.condition].en}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400">{a.type} · {gpById(a.gpId)?.name}</p>
              <p className="mt-1 text-xs text-slate-400">Last checked {relTime(a.lastChecked)}</p>
              {a.repeatedFailureCount > 1 && <Badge tone="red" className="mt-2">⟳ {a.repeatedFailureCount} repeat failures</Badge>}
            </button>
          ))}
        </div>
      )}
      {current && <AssetDrawer asset={current} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AssetDrawer({ asset: a, onClose }: { asset: Asset; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`${a.code} — ${a.name}`} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={conditionTone(a.condition)} dot>{ASSET_CONDITION[a.condition].en}</Badge>
          <Badge tone="slate">{a.type}</Badge>
          {a.publishedPublic && <Badge tone="teal">Public</Badge>}
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-3">
          <M label="GP" v={gpById(a.gpId)?.name ?? "—"} />
          <M label="Last checked" v={`${fmtDate(a.lastChecked)}`} />
          <M label="Checked by" v={a.checkedBy ?? "—"} />
          <M label="Next check" v={fmtDate(a.nextCheck)} />
          <M label="Repeat failures" v={String(a.repeatedFailureCount)} />
          <M label="GPS" v={a.gps ? `${a.gps.lat.toFixed(3)}, ${a.gps.lng.toFixed(3)}` : "—"} />
        </div>
        {a.govAssetRef && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Government Asset Reference</p>
            <SourceRefTag source={{ system: a.sourceSystem ?? "Gram Manchitra", referenceId: a.govAssetRef }} />
          </div>
        )}
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">Inspection History</p>
          {a.inspections.length ? (
            <div className="space-y-2 border-l-2 border-slate-100 pl-3">
              {[...a.inspections].reverse().map((ins) => (
                <div key={ins.id} className="relative text-xs">
                  <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-teal-400 ring-2 ring-white" />
                  <p className="font-medium text-slate-700">{ASSET_CONDITION[ins.condition].en}{ins.issueCategory && ` — ${ins.issueCategory}`}</p>
                  <p className="text-slate-400">{ins.by} · {fmtDateTime(ins.ts)}</p>
                  {ins.note && <p className="italic text-slate-500">&ldquo;{ins.note}&rdquo;</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No inspections recorded.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function M({ label, v }: { label: string; v: string }) {
  return <div><p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p><p className="font-medium text-slate-700">{v}</p></div>;
}

// ---------------------------------------------------------------------------
// QR ASSET CHECK — mobile-first simulated scanner
// ---------------------------------------------------------------------------
function QrTab() {
  const { state, user, updateAsset, addRepair, pushNotification, addAudit, queueIfOffline } = useStore();
  const auth = useAuth();
  const me = auth.user;
  const scoped = forUser(state, me);
  const canReport = hasCapability(me, "REPORT_ASSET_CONDITION");
  const [scanning, setScanning] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [cond, setCond] = useState<AssetCondition>("FUNCTIONAL");
  const [note, setNote] = useState("");
  const [issue, setIssue] = useState("");
  const [done, setDone] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [camMsg, setCamMsg] = useState("");

  const tryCamera = async () => {
    const BD = (typeof window !== "undefined" && (window as any).BarcodeDetector);
    if (!BD || !navigator?.mediaDevices?.getUserMedia) {
      setCamMsg("Camera scan unavailable on this device — using simulated demo asset.");
      if (scoped.assets[0]) pickAsset(scoped.assets[0]);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      // Camera opened — for the demo we immediately stop and fall back to a demo asset,
      // since demo QR codes are not printed. A production build would decode frames here.
      stream.getTracks().forEach((t) => t.stop());
      setCamMsg("Camera available. Demo QR codes are not printed — using a simulated demo asset.");
      if (scoped.assets[0]) pickAsset(scoped.assets[0]);
    } catch {
      setCamMsg("Camera permission denied — using simulated demo asset.");
      if (scoped.assets[0]) pickAsset(scoped.assets[0]);
    }
  };

  const pickAsset = (a: Asset) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setAsset(state.assets.find((x) => x.id === a.id) ?? a);
      setDone(false);
    }, 900);
  };

  const submit = () => {
    if (!asset || !me) return;
    const inspection = { id: `insp-${Date.now()}`, ts: new Date().toISOString(), by: me.name, byRole: me.role, condition: cond, note, issueCategory: issue || undefined, photo };
    const patch: Partial<Asset> = {
      condition: cond,
      lastChecked: new Date().toISOString(),
      checkedBy: me.name,
      inspections: [...asset.inspections, inspection],
      issue: cond === "NON_FUNCTIONAL" ? issue || "Reported non-functional" : asset.issue,
      repairRequired: cond === "NON_FUNCTIONAL",
      repeatedFailureCount: cond === "NON_FUNCTIONAL" ? asset.repeatedFailureCount + 1 : asset.repeatedFailureCount,
    };
    updateAsset(asset.id, patch, { actor: me.name, actorRole: me.role, action: `QR check: ${ASSET_CONDITION[cond].en}`, entity: "Asset", entityId: asset.id, toStatus: cond });

    // Offline demo queue: applied locally now, marked SYNCED_DEMO on reconnect.
    queueIfOffline({ entityType: "ASSET", entityId: asset.id, action: `QR check: ${ASSET_CONDITION[cond].en}`, userId: me.id });

    if (cond === "NON_FUNCTIONAL") {
      const rt: RepairTicket = {
        id: `RT-${Math.floor(Math.random() * 900 + 100)}`,
        assetId: asset.id, assetCode: asset.code, assetName: asset.name,
        districtId: asset.districtId, blockId: asset.blockId, gpId: asset.gpId,
        reportedBy: me.name, reportedOn: new Date().toISOString(), issue: issue || "Reported non-functional",
        priority: asset.type === "Hand Pump" || asset.type === "Borewell" || asset.type === "Water Tank" ? "HIGH" : "MEDIUM",
        status: "REPORTED", ageDays: 0,
        timeline: [{ id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: me.name, actorRole: me.role, action: "Reported via QR check", toStatus: "REPORTED" }],
      };
      addRepair(rt);
      pushNotification({ type: "repair_assigned", title: "New asset failure", body: `${asset.code} reported non-functional at ${gpById(asset.gpId)?.name}`, forRoles: ["gram_sevak", "je", "bdo"], gpId: asset.gpId, blockId: asset.blockId, link: "/app/nigaa", smsPreview: `ZP Yavatmal: ${asset.code} reported non-functional. Repair ticket created.` });
    }
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Disclaimer text="Uses the device camera (BarcodeDetector) where supported, with a reliable simulated fallback for the browser demo." />
      {!asset && !scanning && (
        <Card>
          <CardBody className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50"><QrCode className="h-10 w-10 text-brand-600" /></div>
            <p className="mt-3 text-sm font-semibold text-slate-800">Scan an asset QR</p>
            <p className="text-xs text-slate-400">Use the camera, or select an asset to simulate a scan</p>
            <Button className="mt-3" variant="outline" onClick={tryCamera}><Camera className="h-4 w-4" /> Try Camera Scan</Button>
            {camMsg && <p className="mt-2 text-xs text-amber-600">{camMsg}</p>}
            <p className="mt-4 text-xs font-medium text-slate-400">Or use Demo QR:</p>
            <div className="mt-2 space-y-1.5 text-left">
              {scoped.assets.slice(0, 6).map((a) => (
                <button key={a.id} onClick={() => pickAsset(a)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                  <span><span className="font-mono text-xs text-slate-400">{a.code}</span> · {a.name}</span>
                  <QrCode className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
      {scanning && (
        <Card><CardBody className="flex flex-col items-center py-10"><div className="relative h-40 w-40 overflow-hidden rounded-2xl bg-slate-900"><div className="absolute inset-x-0 top-0 h-0.5 animate-[scan_0.9s_ease-in-out_infinite] bg-teal-400" style={{ animation: "scanline 0.9s linear infinite" }} /><QrCode className="absolute inset-0 m-auto h-24 w-24 text-slate-600" /></div><p className="mt-4 text-sm text-slate-500">Scanning…</p></CardBody></Card>
      )}
      {asset && !done && (
        <Card>
          <CardBody>
            <p className="font-mono text-xs text-slate-400">{asset.code}</p>
            <p className="text-sm font-semibold text-slate-800">{asset.name}</p>
            <p className="text-xs text-slate-400">{gpById(asset.gpId)?.name} · currently {ASSET_CONDITION[asset.condition].en}</p>
            {!canReport ? (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-500">
                Field action available only to authorized operational roles (VWSC / Gram Sevak).
                <Button variant="outline" className="mt-2 w-full" onClick={() => setAsset(null)}>Back</Button>
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(["FUNCTIONAL", "PARTIALLY_FUNCTIONAL", "NON_FUNCTIONAL", "UNDER_REPAIR"] as AssetCondition[]).map((c) => (
                    <button key={c} onClick={() => setCond(c)} className={`rounded-lg border px-3 py-2 text-sm font-medium ${cond === c ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{ASSET_CONDITION[c].en}</button>
                  ))}
                </div>
                {(cond === "NON_FUNCTIONAL" || cond === "PARTIALLY_FUNCTIONAL") && (
                  <div className="mt-3"><Field label="Issue category"><Select value={issue} onChange={(e) => setIssue(e.target.value)}><option value="">Select…</option>{["No water discharge", "Broken platform", "Leaking pipeline", "Motor burnt", "Structure damaged", "Choked drain", "Other"].map((i) => <option key={i} value={i}>{i}</option>)}</Select></Field></div>
                )}
                <div className="mt-3"><Field label="Note"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Observation…" /></Field></div>
                <div className="mt-2"><EvidencePicker byName={me?.name ?? ""} byRole={me?.role} onAdd={(ev) => setPhoto(ev.name)} /></div>
                {photo && <p className="mt-1 text-xs text-teal-600">✓ Evidence attached: {photo}</p>}
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => setAsset(null)}>Back</Button>
                  <Button className="flex-1" onClick={submit}>Submit Check</Button>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}
      {done && asset && (
        <Card>
          <CardBody className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-slate-800">Check recorded for {asset.code}</p>
            <p className="text-xs text-slate-500">Condition set to {ASSET_CONDITION[cond].en}.{cond === "NON_FUNCTIONAL" && " A repair ticket was created and the Gram Sevak & JE were notified."}</p>
            <p className="mt-2 text-xs italic text-slate-400">This update now flows upward — BDO block counts and district aggregates reflect it.</p>
            <Button className="mt-3" variant="outline" onClick={() => { setAsset(null); setDone(false); setCond("FUNCTIONAL"); setNote(""); setIssue(""); setPhoto(undefined); setCamMsg(""); }}>Scan another</Button>
          </CardBody>
        </Card>
      )}
      <style>{`@keyframes scanline{0%{top:0}50%{top:100%}100%{top:0}}`}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// REPAIR WORKFLOW
// ---------------------------------------------------------------------------
function RepairsTab() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const scoped = forUser(state, user);
  const [selected, setSelected] = useState<RepairTicket | null>(null);
  const current = selected ? state.repairs.find((r) => r.id === selected.id) ?? selected : null;
  const repairs = [...scoped.repairs].sort((a, b) => REPAIR_FLOW.indexOf(a.status) - REPAIR_FLOW.indexOf(b.status));

  return (
    <div className="space-y-4">
      <Disclaimer text="Same user cannot verify their own high-priority repair. Every step is recorded in the audit history." />
      {repairs.length === 0 ? (
        <EmptyState icon={<Wrench className="h-8 w-8" />} title="No repair tickets in scope" />
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {repairs.map((r) => (
              <button key={r.id} onClick={() => setSelected(r)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{r.assetCode} — {r.issue}</p>
                  <p className="truncate text-xs text-slate-400">{r.id} · {gpById(r.gpId)?.name} · reported {relTime(r.reportedOn)}</p>
                </div>
                <Badge tone={r.priority === "HIGH" || r.priority === "CRITICAL" ? "red" : "slate"}>{r.priority}</Badge>
                <Badge tone={REPAIR_STATUS[r.status].tone} dot>{REPAIR_STATUS[r.status].en}</Badge>
              </button>
            ))}
          </div>
        </Card>
      )}
      {current && <RepairDrawer repair={current} onClose={() => setSelected(null)} />}
    </div>
  );
}

function RepairDrawer({ repair: r, onClose }: { repair: RepairTicket; onClose: () => void }) {
  const { updateRepair, updateAsset, pushNotification } = useStore();
  const { user } = useAuth();
  const me = user!;

  const advance = (to: RepairStatus, action: string, assetCond?: AssetCondition) => {
    const patch: Partial<RepairTicket> = {
      status: to,
      timeline: [...r.timeline, { id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: me.name, actorRole: me.role, action, fromStatus: r.status, toStatus: to }],
    };
    if (to === "ASSIGNED") { patch.assignedToRole = "je"; patch.assignedToUserId = "u-je"; }
    if (to === "REPAIR_CLAIMED_COMPLETE") patch.claimedCompleteBy = me.name;
    if (to === "VERIFIED") { patch.verifiedBy = me.name; patch.closedOn = new Date().toISOString(); }
    updateRepair(r.id, patch, { actor: me.name, actorRole: me.role, action, entity: "Repair", entityId: r.id, fromStatus: r.status, toStatus: to });
    if (assetCond) updateAsset(r.assetId, { condition: assetCond, lastChecked: new Date().toISOString(), checkedBy: me.name, repairRequired: assetCond === "NON_FUNCTIONAL" });
    if (to === "ASSIGNED") pushNotification({ type: "repair_assigned", title: "Repair assigned", body: `${r.assetCode} assigned to Junior Engineer`, forRoles: ["je"], link: "/app/nigaa" });
    if (to === "VERIFIED") pushNotification({ type: "repair_verified", title: "Repair verified", body: `${r.assetCode} repair verified & asset restored`, forRoles: ["gram_sevak", "bdo", "vwsc_member"], gpId: r.gpId, link: "/app/nigaa" });
  };

  const canUpdate = hasCapability(user, "UPDATE_REPAIR");
  const canClaim = hasCapability(user, "CLAIM_REPAIR_COMPLETE");
  const canAssign = hasCapability(user, "ASSIGN_REPAIR");
  const canVerify = hasCapability(user, "VERIFY_REPAIR");
  const canClose = hasCapability(user, "CLOSE_REPAIR") || canVerify;
  const selfVerifyBlocked = (r.priority === "HIGH" || r.priority === "CRITICAL") && r.claimedCompleteBy === me.name;

  return (
    <Modal open onClose={onClose} title={`${r.id} — ${r.assetCode}`} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={REPAIR_STATUS[r.status].tone} dot>{REPAIR_STATUS[r.status].en}</Badge>
          <Badge tone={r.priority === "HIGH" || r.priority === "CRITICAL" ? "red" : "slate"}>{r.priority}</Badge>
        </div>
        <p className="text-sm text-slate-600">{r.assetName} — <span className="font-medium">{r.issue}</span></p>

        {/* Workflow progress */}
        <div className="flex flex-wrap gap-1">
          {REPAIR_FLOW.map((st) => {
            const done = REPAIR_FLOW.indexOf(st) <= REPAIR_FLOW.indexOf(r.status);
            return <span key={st} className={`rounded px-2 py-0.5 text-[10px] font-medium ${done ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400"}`}>{REPAIR_STATUS[st].en}</span>;
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-3">
          <M label="GP" v={gpById(r.gpId)?.name ?? "—"} />
          <M label="Reported by" v={r.reportedBy} />
          <M label="Reported" v={fmtDate(r.reportedOn)} />
          <M label="Assigned to" v={r.assignedToRole?.toUpperCase() ?? "—"} />
          <M label="Claimed by" v={r.claimedCompleteBy ?? "—"} />
          <M label="Verified by" v={r.verifiedBy ?? "—"} />
        </div>

        {/* Timeline */}
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">Audit History</p>
          <div className="space-y-2 border-l-2 border-slate-100 pl-3">
            {r.timeline.map((t) => (
              <div key={t.id} className="relative text-xs">
                <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-brand-400 ring-2 ring-white" />
                <p className="font-medium text-slate-700">{t.action}</p>
                <p className="text-slate-400">{t.actor} · {t.actorRole.replace(/_/g, " ")} · {fmtDateTime(t.ts)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions — capability-gated */}
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
          {r.status === "REPORTED" && canAssign && <Button size="sm" onClick={() => advance("ASSIGNED", "Assigned to Junior Engineer", "UNDER_REPAIR")}>Assign to JE</Button>}
          {r.status === "ASSIGNED" && canUpdate && <Button size="sm" onClick={() => advance("INSPECTED", "Inspected on site")}>Mark Inspected</Button>}
          {r.status === "INSPECTED" && canUpdate && <Button size="sm" onClick={() => advance("REPAIR_IN_PROGRESS", "Repair started")}>Start Repair</Button>}
          {r.status === "REPAIR_IN_PROGRESS" && canClaim && <Button size="sm" variant="secondary" onClick={() => advance("REPAIR_CLAIMED_COMPLETE", "Repair claimed complete")}>Claim Complete</Button>}
          {r.status === "REPAIR_CLAIMED_COMPLETE" && canUpdate && <Button size="sm" variant="outline" onClick={() => advance("VERIFICATION_PENDING", "Sent for verification")}>Send for Verification</Button>}
          {(r.status === "VERIFICATION_PENDING" || r.status === "REPAIR_CLAIMED_COMPLETE") && canVerify && (
            selfVerifyBlocked ? (
              <p className="text-xs text-rose-600">You claimed this high-priority repair — a different officer must verify it.</p>
            ) : (
              <Button size="sm" onClick={() => advance("VERIFIED", "Verified & asset restored", "FUNCTIONAL")}><CheckCircle2 className="h-4 w-4" /> Verify Closure</Button>
            )
          )}
          {r.status === "VERIFIED" && canClose && <Button size="sm" variant="outline" onClick={() => advance("CLOSED", "Ticket closed")}>Close Ticket</Button>}
          {r.status === "CLOSED" && <Badge tone="green">Completed & closed</Badge>}
          {!canAssign && !canUpdate && !canClaim && !canVerify && r.status !== "CLOSED" && (
            <p className="text-xs italic text-slate-400">View only — repair actions are available to authorised operational roles.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// PLANTATION
// ---------------------------------------------------------------------------
function PlantationTab() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const scoped = forUser(state, user);
  const sites = scoped.assets.filter((a) => a.type === "Plantation Site");
  return (
    <div className="space-y-4">
      <Disclaimer text="Operational maintenance observation — demo. Not an official forestry / plantation register." />
      {sites.length === 0 ? (
        <EmptyState icon={<Sprout className="h-8 w-8" />} title="No plantation sites in scope" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((a) => {
            const survival = a.plantedCount ? Math.round(((a.survivingCount ?? 0) / a.plantedCount) * 100) : 0;
            return (
              <Card key={a.id}>
                <CardBody>
                  <div className="flex items-center gap-2"><Sprout className="h-4 w-4 text-teal-600" /><p className="text-sm font-semibold text-slate-800">{a.name}</p></div>
                  <p className="text-xs text-slate-400">{gpById(a.gpId)?.name}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-lg font-bold text-slate-800">{a.plantedCount}</p><p className="text-[10px] uppercase text-slate-400">Planted</p></div>
                    <div><p className="text-lg font-bold text-slate-800">{a.survivingCount}</p><p className="text-[10px] uppercase text-slate-400">Surviving</p></div>
                    <div><p className={`text-lg font-bold ${survival > 70 ? "text-emerald-600" : survival > 50 ? "text-amber-600" : "text-rose-600"}`}>{survival}%</p><p className="text-[10px] uppercase text-slate-400">Survival</p></div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Last survival check {relTime(a.lastSurvivalCheck)}</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
