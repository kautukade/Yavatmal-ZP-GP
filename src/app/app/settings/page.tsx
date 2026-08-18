"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { fmtDateTime } from "@/utils/format";
import { ROLES } from "@/data/roles";
import { blockById, gpById } from "@/data/hierarchy";
import { Badge, Button, Card, CardBody, Modal, PageHeader } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";
import { initials } from "@/utils/format";
import { AlertTriangle, Globe, RefreshCw, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const { user, role } = useAuth();
  const { lang, setLang, resetDemo, state, syncOfflineQueue } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [reset, setReset] = useState(false);

  if (!user || !role) return null;

  return (
    <div>
      <PageHeader title="Settings" titleMr="सेटिंग्ज" subtitle="Profile, language and demo configuration">
        <DemoBadge />
      </PageHeader>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-semibold text-slate-800">Profile</p>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: user.avatarColor ?? "#1f4e8f" }}>{initials(user.name)}</span>
              <div><p className="font-medium text-slate-800">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Role" value={`${role.name} · ${role.nameMr}`} />
              <Row label="Scope" value={role.scope} />
              <Row label="GP" value={gpById(user.gpId)?.name ?? "—"} />
              <Row label="Block" value={blockById(user.blockId)?.name ?? "—"} />
            </div>
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold text-slate-500">Permissions</p>
              <div className="flex flex-wrap gap-1">{role.permissions.map((p) => <Badge key={p} tone="blue">{p}</Badge>)}</div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardBody>
              <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800"><Globe className="h-4 w-4" /> Language</p>
              <div className="flex gap-2">
                <Button variant={lang === "en" ? "primary" : "outline"} onClick={() => setLang("en")}>English</Button>
                <Button variant={lang === "mr" ? "primary" : "outline"} onClick={() => setLang("mr")}>मराठी</Button>
              </div>
            </CardBody>
          </Card>

          {role.id === "sysadmin" && (
            <Card className="border-rose-200">
              <CardBody>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-rose-700"><RefreshCw className="h-4 w-4" /> Reset Demo Data</p>
                <p className="text-xs text-slate-500">Restores all seed data. Any demo changes you made (obligations, asset checks, repairs, registrations) will be cleared.</p>
                <Button variant="danger" className="mt-3" onClick={() => setConfirm(true)}>Reset Demo Data</Button>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody>
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800"><RefreshCw className="h-4 w-4 text-amber-600" /> Offline Queue</p>
                {(state.offlineQueue ?? []).some((m) => m.status === "SYNC_PENDING") && <Button size="sm" variant="outline" onClick={syncOfflineQueue}>Sync now (demo)</Button>}
              </div>
              {(state.offlineQueue ?? []).length === 0 ? (
                <p className="text-xs text-slate-400">No queued offline mutations. Go offline and record an asset check to see items here.</p>
              ) : (
                <div className="space-y-1.5">
                  {(state.offlineQueue ?? []).slice(0, 8).map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
                      <span className="text-slate-600">{m.action} · {m.entityType} {m.entityId}</span>
                      <span className={m.status === "SYNC_PENDING" ? "font-semibold text-amber-600" : "font-semibold text-emerald-600"}>{m.status.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs italic text-slate-400">Synced to local demo store only — no Government server connected.</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800"><ShieldCheck className="h-4 w-4 text-teal-600" /> About this demo</p>
              <p className="text-xs text-slate-500">Demonstration prototype for research and field validation. Not an official Government system. Contains mock/demo data. Government systems remain the source of truth.</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset demo data?">
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4" /> This restores all seed data and cannot be undone.</div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { resetDemo(); setConfirm(false); setReset(true); }}>Yes, reset</Button>
          </div>
        </div>
      </Modal>
      <Modal open={reset} onClose={() => setReset(false)} title="Demo reset complete">
        <p className="text-sm text-slate-600">All seed data has been restored.</p>
        <div className="mt-4 flex justify-end"><Button onClick={() => setReset(false)}>Done</Button></div>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-400">{label}</span><span className="font-medium text-slate-700">{value}</span></div>;
}
