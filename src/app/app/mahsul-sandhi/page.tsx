"use client";

import { useAuth, useStore } from "@/services/store";
import { computeScope, inScope } from "@/permissions";
import { hasCapability } from "@/permissions/capabilities";
import { gpById } from "@/data/hierarchy";
import { AdoptionState } from "@/types";
import { Badge, Card, CardBody, EmptyState, PageHeader, Select } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer, useLang } from "@/components/ui/common";
import { IndianRupee } from "lucide-react";

const STATE_TONE: Record<AdoptionState, "slate" | "amber" | "green" | "red"> = {
  NOT_STARTED: "slate", IN_PROGRESS: "amber", ACTIVE: "green", NEEDS_SUPPORT: "red",
};
const STATE_LABEL: Record<AdoptionState, { en: string; mr: string }> = {
  NOT_STARTED: { en: "Not Started", mr: "सुरू नाही" },
  IN_PROGRESS: { en: "In Progress", mr: "प्रगतीपथावर" },
  ACTIVE: { en: "Active", mr: "कार्यरत" },
  NEEDS_SUPPORT: { en: "Needs Support", mr: "मदत आवश्यक" },
};
const NEXT: Record<AdoptionState, AdoptionState> = { NOT_STARTED: "IN_PROGRESS", IN_PROGRESS: "ACTIVE", ACTIVE: "NEEDS_SUPPORT", NEEDS_SUPPORT: "NOT_STARTED" };

export default function MahsulSandhiPage() {
  const { state, user, update, addAudit } = useStore();
  const auth = useAuth();
  const { lang } = useLang();
  const scope = computeScope(auth.user);
  const records = (state.adoption ?? []).filter((r) => inScope(scope, r));
  const canManage = hasCapability(auth.user, "MANAGE_ADOPTION");

  const cycle = (recId: string, key: string) => {
    update((d) => { const r = (d.adoption ?? []).find((x) => x.id === recId); const it = r?.items.find((i) => i.key === key); if (it) it.state = NEXT[it.state]; });
    if (user) addAudit({ actor: user.name, actorRole: user.role, action: `Updated adoption step ${key}`, entity: "Adoption", entityId: recId });
  };

  return (
    <div>
      <PageHeader title="Mahsul Sandhi" titleMr="महसूल संधी" subtitle="SAMARTH Adoption & Revenue Opportunity View">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Tax configuration, assessment, demand and collection remain in official Government systems (SAMARTH). This module only demonstrates adoption follow-up — it is not a tax engine." /></div>

      {records.length === 0 ? (
        <EmptyState icon={<IndianRupee className="h-8 w-8" />} title="No adoption records in scope" />
      ) : (
        <div className="space-y-4">
          {records.map((r) => {
            const active = r.items.filter((i) => i.state === "ACTIVE").length;
            const support = r.items.filter((i) => i.state === "NEEDS_SUPPORT" || i.state === "NOT_STARTED").length;
            return (
              <Card key={r.id}>
                <CardBody>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{gpById(r.gpId)?.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge tone="green">{active}/{r.items.length} active</Badge>
                      {support > 0 && <Badge tone="amber">{support} need support</Badge>}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {r.items.map((it) => (
                      <button key={it.key} disabled={!canManage} onClick={() => cycle(r.id, it.key)} className={`flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left text-sm ${canManage ? "hover:bg-slate-50" : ""}`}>
                        <span className="text-slate-700">{lang === "mr" ? it.labelMr : it.label}</span>
                        <Badge tone={STATE_TONE[it.state]} dot>{STATE_LABEL[it.state][lang]}</Badge>
                      </button>
                    ))}
                  </div>
                  {canManage && <p className="mt-2 text-xs text-slate-400">Click a step to cycle its adoption state (demo).</p>}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
