"use client";

import { useMemo, useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { computeScope, inScope } from "@/permissions";
import { hasCapability } from "@/permissions/capabilities";
import { gpById, gpsInBlock } from "@/data/hierarchy";
import { FileFlowStatus, GpFile } from "@/types";
import { Badge, Button, Card, CardBody, EmptyState, Field, Input, Modal, PageHeader, Select } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { fmtDate, relTime, daysFromToday } from "@/utils/format";
import { FileStack, Plus } from "lucide-react";

const STATUS_TONE: Record<FileFlowStatus, "slate" | "blue" | "amber" | "violet" | "green"> = {
  RECEIVED: "blue", UNDER_PROCESS: "blue", WAITING: "amber", FORWARD_PENDING: "violet", RETURNED: "amber", COMPLETED: "green",
};
const STATUS_MR: Record<FileFlowStatus, string> = {
  RECEIVED: "प्राप्त", UNDER_PROCESS: "प्रक्रियेत", WAITING: "प्रतीक्षेत", FORWARD_PENDING: "पुढे पाठवणे बाकी", RETURNED: "परत", COMPLETED: "पूर्ण",
};

export default function FileFlowPage() {
  const { state, user, update, addAudit } = useStore();
  const auth = useAuth();
  const scope = computeScope(auth.user);
  const files = (state.gpFiles ?? []).filter((f) => inScope(scope, f));
  const [selected, setSelected] = useState<GpFile | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const current = selected ? (state.gpFiles ?? []).find((f) => f.id === selected.id) ?? selected : null;
  const canManage = hasCapability(auth.user, "MANAGE_FILE_FLOW");

  // Sort oldest-pending first for block/district roles
  const sorted = useMemo(() => [...files].sort((a, b) => new Date(a.pendingSince).getTime() - new Date(b.pendingSince).getTime()), [files]);

  const advance = (f: GpFile, status: FileFlowStatus) => {
    update((d) => { const x = (d.gpFiles ?? []).find((z) => z.id === f.id); if (x) { x.status = status; x.pendingSince = new Date().toISOString(); } });
    if (user) addAudit({ actor: user.name, actorRole: user.role, action: `File ${f.id} → ${status}`, entity: "GpFile", entityId: f.id, toStatus: status });
  };

  return (
    <div>
      <PageHeader title="GP File Flow" titleMr="ग्रामपंचायत फाइल प्रवाह" subtitle="Operational visibility of local GP files & matters">
        <DemoBadge />
        {canManage && <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> New File</Button>}
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Operational demo only. Official file movement remains in authorized Government systems / eOffice where applicable." /></div>

      {sorted.length === 0 ? (
        <EmptyState icon={<FileStack className="h-8 w-8" />} title="No files in scope" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-2.5">File</th><th className="px-4 py-2.5">GP</th><th className="px-4 py-2.5">Desk</th><th className="px-4 py-2.5">Pending</th><th className="px-4 py-2.5">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((f) => {
                  const age = -daysFromToday(f.pendingSince);
                  return (
                    <tr key={f.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelected(f)}>
                      <td className="px-4 py-2.5"><p className="font-medium text-slate-700">{f.title}</p><p className="font-mono text-[11px] text-slate-400">{f.id}</p></td>
                      <td className="px-4 py-2.5 text-slate-500">{gpById(f.gpId)?.name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{f.currentDesk}</td>
                      <td className="px-4 py-2.5">{age > 20 ? <span className="text-rose-600 font-medium">{age}d</span> : <span className="text-slate-500">{age}d</span>}</td>
                      <td className="px-4 py-2.5"><Badge tone={STATUS_TONE[f.status]} dot>{f.status.replace(/_/g, " ")}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {current && (
        <Modal open onClose={() => setSelected(null)} title={`${current.id} — ${current.title}`} wide>
          <div className="space-y-4">
            <Badge tone={STATUS_TONE[current.status]} dot>{current.status.replace(/_/g, " ")}</Badge>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-3">
              <M label="GP" v={gpById(current.gpId)?.name ?? "—"} />
              <M label="Source" v={current.source} />
              <M label="Received" v={fmtDate(current.receivedDate)} />
              <M label="Current desk" v={current.currentDesk} />
              <M label="Current holder" v={current.currentHolder} />
              <M label="Pending since" v={relTime(current.pendingSince)} />
              <M label="Next action" v={current.nextAction} />
              <M label="Due" v={fmtDate(current.dueDate)} />
              <M label="Gov reference" v={current.govReference ?? "—"} />
            </div>
            {current.blocker && <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Blocker: {current.blocker}</div>}
            {canManage && current.status !== "COMPLETED" && (
              <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
                <Button size="sm" variant="outline" onClick={() => advance(current, "UNDER_PROCESS")}>Under Process</Button>
                <Button size="sm" variant="outline" onClick={() => advance(current, "FORWARD_PENDING")}>Forward Pending</Button>
                <Button size="sm" variant="outline" onClick={() => advance(current, "WAITING")}>Mark Waiting</Button>
                <Button size="sm" onClick={() => advance(current, "COMPLETED")}>Complete</Button>
              </div>
            )}
          </div>
        </Modal>
      )}
      {showAdd && <AddFileModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function M({ label, v }: { label: string; v: string }) {
  return <div><p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p><p className="font-medium text-slate-700">{v}</p></div>;
}

function AddFileModal({ onClose }: { onClose: () => void }) {
  const { update, addAudit, user } = useStore();
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("Citizen application");
  const gps = user?.blockId ? gpsInBlock(user.blockId) : [];
  const [gpId, setGpId] = useState(user?.gpId ?? gps[0]?.id ?? "");
  const save = () => {
    if (!title.trim()) return;
    const gp = gpById(gpId);
    const id = `FILE-${Math.floor(Math.random() * 900 + 100)}`;
    update((d) => { (d.gpFiles ??= []).unshift({ id, title, source, districtId: "d-yvt", blockId: gp?.blockId ?? user?.blockId ?? "b-yavatmal", gpId, receivedDate: new Date().toISOString(), currentDesk: "Front Desk", currentHolder: user?.name ?? "Demo Gram Sevak", pendingSince: new Date().toISOString(), nextAction: "Verify documents", dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), status: "RECEIVED" }); });
    if (user) addAudit({ actor: user.name, actorRole: user.role, action: `Created file ${id}`, entity: "GpFile", entityId: id, toStatus: "RECEIVED" });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="New GP File">
      <div className="space-y-3">
        <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Source"><Select value={source} onChange={(e) => setSource(e.target.value)}>{["Citizen application", "Block Office", "Government letter", "Gram Sabha"].map((x) => <option key={x}>{x}</option>)}</Select></Field>
        <Field label="Gram Panchayat"><Select value={gpId} onChange={(e) => setGpId(e.target.value)}>{gps.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
        <div className="flex justify-end gap-2 pt-1"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Create</Button></div>
      </div>
    </Modal>
  );
}
