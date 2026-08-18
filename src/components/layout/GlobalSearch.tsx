"use client";

import { Modal, Input } from "@/components/ui/primitives";
import { useAuth, useStore } from "@/services/store";
import { forUser } from "@/utils/selectors";
import { blockById, gpById } from "@/data/hierarchy";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore();
  const { user } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    if (!q.trim() || !user) return [];
    const term = q.toLowerCase();
    const scoped = forUser(state, user);
    const out: { label: string; sub: string; path: string }[] = [];
    scoped.obligations.forEach((o) => {
      if (o.id.toLowerCase().includes(term) || o.title.toLowerCase().includes(term))
        out.push({ label: `${o.id} — ${o.title}`, sub: `Obligation · ${gpById(o.gpId)?.name ?? ""}`, path: "/app/pathpurava" });
    });
    scoped.assets.forEach((a) => {
      if (a.code.toLowerCase().includes(term) || a.name.toLowerCase().includes(term))
        out.push({ label: `${a.code} — ${a.name}`, sub: `Asset · ${gpById(a.gpId)?.name ?? ""}`, path: "/app/nigaa" });
    });
    scoped.repairs.forEach((r) => {
      if (r.id.toLowerCase().includes(term) || r.assetCode.toLowerCase().includes(term))
        out.push({ label: `${r.id} — ${r.assetName}`, sub: `Repair`, path: "/app/nigaa" });
    });
    scoped.services.forEach((s) => {
      if (s.id.toLowerCase().includes(term) || s.service.toLowerCase().includes(term))
        out.push({ label: `${s.id} — ${s.service}`, sub: "Service", path: "/app/services" });
    });
    scoped.institutions.forEach((i) => {
      if (i.name.toLowerCase().includes(term)) out.push({ label: i.name, sub: "Institution", path: "/app/institutions" });
    });
    return out.slice(0, 12);
  }, [q, state, user]);

  return (
    <Modal open={open} onClose={onClose} title="Global Search">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          autoFocus
          placeholder="Search GP, obligation, asset, repair, service…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
        {results.length === 0 && q && <p className="py-6 text-center text-sm text-slate-400">No matches in your scope.</p>}
        {results.map((r, i) => (
          <button
            key={i}
            onClick={() => {
              router.push(r.path);
              onClose();
              setQ("");
            }}
            className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-slate-50"
          >
            <span className="text-sm font-medium text-slate-800">{r.label}</span>
            <span className="text-xs text-slate-400">{r.sub}</span>
          </button>
        ))}
        {!q && <p className="py-6 text-center text-xs text-slate-400">Results are scoped to your role and area.</p>}
      </div>
    </Modal>
  );
}
