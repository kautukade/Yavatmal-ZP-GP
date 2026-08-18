"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { ROLES, ROLE_LIST } from "@/data/roles";
import { BLOCKS, DEPARTMENTS, GPS, gpsInBlock, blockById, gpById, deptById } from "@/data/hierarchy";
import { RoleId, User } from "@/types";
import { normalizeUserScopeForRole, scopeRequirements, validateUserScope, userUpdateAuditEvents } from "@/permissions/userScope";
import { Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, Select } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { initials } from "@/utils/format";
import { Pencil, Plus, ShieldCheck, UserX } from "lucide-react";

export default function AdminPage() {
  const { state, update, addAudit, user } = useStore();
  const { role } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  if (role?.id !== "sysadmin") {
    return (
      <div>
        <PageHeader title="Users & Roles" subtitle="Administration" />
        <EmptyState icon={<ShieldCheck className="h-8 w-8" />} title="Restricted" subtitle="Only the System Administrator can manage users and roles." />
      </div>
    );
  }

  const toggle = (u: User) => {
    const next: User = { ...u, status: u.status === "disabled" ? "active" : "disabled" };
    update((d) => { const x = d.users.find((z) => z.id === u.id); if (x) x.status = next.status; });
    if (user) userUpdateAuditEvents(u, next).forEach((e) => addAudit({ actor: user.name, actorRole: user.role, entity: "User", entityId: u.id, ...e }));
  };

  const scopeText = (u: User) => {
    if (u.role === "sysadmin") return "System / config";
    if (u.assignedGpIds?.length) return `${u.assignedGpIds.length} GP(s) · ${blockById(u.blockId)?.name ?? ""}`;
    if (u.gpId) return `${gpById(u.gpId)?.name} · ${blockById(u.blockId)?.name}`;
    if (u.blockId) return `${blockById(u.blockId)?.name} Block`;
    if (u.departmentId) return `District · ${deptById(u.departmentId)?.name}`;
    if (u.districtId) return "District";
    return "—";
  };

  return (
    <div>
      <PageHeader title="Users & Roles" titleMr="वापरकर्ते व भूमिका" subtitle="Create, edit, disable — assign role / district / block / GP / department">
        <DemoBadge />
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add User</Button>
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Admin manages users & configuration but cannot silently change a verified operational outcome. Every change is audited." /></div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-2.5">User</th><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5">Role</th><th className="px-4 py-2.5">Scope</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5"></th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {state.users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: u.avatarColor ?? "#1f4e8f" }}>{initials(u.name)}</span><span className="font-medium text-slate-700">{u.name}</span></div></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{u.email}</td>
                  <td className="px-4 py-2.5 text-slate-600">{ROLES[u.role].name}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{scopeText(u)}</td>
                  <td className="px-4 py-2.5"><Badge tone={u.status === "disabled" ? "red" : "green"}>{u.status ?? "active"}</Badge></td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditing(u)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => toggle(u)}><UserX className="h-3.5 w-3.5" /> {u.status === "disabled" ? "Enable" : "Disable"}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showAdd && <UserEditor onClose={() => setShowAdd(false)} />}
      {editing && <UserEditor existing={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Role-aware create / edit drawer — uses centralized normalize + validate.
// ---------------------------------------------------------------------------
function UserEditor({ existing, onClose }: { existing?: User; onClose: () => void }) {
  const { update, addAudit, user } = useStore();
  const [draft, setDraft] = useState<User>(
    existing ?? { id: `u-${Date.now()}`, name: "", email: "", password: "demo123", role: "gram_sevak", districtId: "d-yvt", blockId: "b-yavatmal", gpId: "gp-borgaon", status: "active", avatarColor: "#1f4e8f" }
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const req = scopeRequirements(draft.role);
  const set = (patch: Partial<User>) => setDraft((d) => ({ ...d, ...patch }));

  const changeRole = (role: RoleId) => { setNotice(""); setDraft((d) => normalizeUserScopeForRole(d, role)); };
  const changeBlock = (blockId: string) => {
    const inBlock = gpsInBlock(blockId).map((g) => g.id);
    setDraft((d) => {
      // Extension Officer: changing block clears cross-block assigned GPs.
      const clearedAssigned = req.assignedGps && (d.assignedGpIds ?? []).some((id) => !inBlock.includes(id));
      if (clearedAssigned) setNotice("Assigned GPs were cleared because the block changed.");
      return {
        ...d,
        blockId,
        gpId: req.gp ? (d.gpId && inBlock.includes(d.gpId) ? d.gpId : inBlock[0]) : d.gpId,
        assignedGpIds: req.assignedGps ? (d.assignedGpIds ?? []).filter((id) => inBlock.includes(id)) : d.assignedGpIds,
      };
    });
  };
  const toggleAssigned = (gpId: string) => setDraft((d) => {
    const cur = d.assignedGpIds ?? [];
    return { ...d, assignedGpIds: cur.includes(gpId) ? cur.filter((x) => x !== gpId) : [...cur, gpId] };
  });

  const save = () => {
    const v = validateUserScope(draft);
    if (!v.ok) { setErrors(v.errors); return; }
    const before = existing;
    update((d) => {
      const idx = d.users.findIndex((z) => z.id === draft.id);
      if (idx >= 0) d.users[idx] = draft; else d.users.push(draft);
    });
    if (user) {
      // Single source of truth for user-change audit events (incl. status).
      userUpdateAuditEvents(before ?? null, draft).forEach((e) =>
        addAudit({ actor: user.name, actorRole: user.role, entity: "User", entityId: draft.id, ...e })
      );
    }
    onClose();
  };

  const blockGps = gpsInBlock(draft.blockId ?? "b-yavatmal");

  return (
    <Modal open onClose={onClose} title={existing ? `Edit User — ${existing.name}` : "Add User"} wide>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><Input value={draft.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="Email"><Input value={draft.email} onChange={(e) => set({ email: e.target.value })} placeholder="new@demo.local" /></Field>
        </div>
        <Field label="Role"><Select value={draft.role} onChange={(e) => changeRole(e.target.value as RoleId)}>{ROLE_LIST.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></Field>

        {req.district && (
          <Field label="District"><Select value={draft.districtId ?? "d-yvt"} onChange={(e) => set({ districtId: e.target.value })}><option value="d-yvt">Yavatmal</option></Select></Field>
        )}
        {req.block && (
          <Field label="Block"><Select value={draft.blockId ?? ""} onChange={(e) => changeBlock(e.target.value)}>{BLOCKS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field>
        )}
        {req.gp && (
          <Field label="Gram Panchayat"><Select value={draft.gpId ?? ""} onChange={(e) => set({ gpId: e.target.value })}>{blockGps.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</Select></Field>
        )}
        {req.department && (
          <Field label="Department"><Select value={draft.departmentId ?? ""} onChange={(e) => set({ departmentId: e.target.value })}><option value="">Select…</option>{DEPARTMENTS.map((dp) => <option key={dp.id} value={dp.id}>{dp.name}</option>)}</Select></Field>
        )}
        {req.assignedGps && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-600">Assigned Gram Panchayats {req.block && `(in ${blockById(draft.blockId)?.name})`}</p>
            <div className="flex flex-wrap gap-1.5">
              {gpsInBlock(draft.blockId ?? "b-yavatmal").map((g) => {
                const on = (draft.assignedGpIds ?? []).includes(g.id);
                return <button key={g.id} type="button" onClick={() => toggleAssigned(g.id)} className={`rounded-full px-2.5 py-1 text-xs font-medium ${on ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>{g.name}</button>;
              })}
            </div>
            {(draft.assignedGpIds ?? []).length === 0 && <p className="mt-1 text-xs text-amber-600">No GPs Assigned.</p>}
          </div>
        )}

        {existing && (
          <Field label="Status"><Select value={draft.status ?? "active"} onChange={(e) => set({ status: e.target.value as "active" | "disabled" })}><option value="active">Active</option><option value="disabled">Disabled</option></Select></Field>
        )}

        {notice && <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{notice}</div>}
        {errors.length > 0 && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"><ul className="list-disc pl-4">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
        )}
        <p className="text-xs text-slate-400">Default demo password: demo123. Changes take effect on the user's next login (and immediately if they are logged in).</p>
        <div className="flex justify-end gap-2 pt-1"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>{existing ? "Save Changes" : "Create User"}</Button></div>
      </div>
    </Modal>
  );
}
