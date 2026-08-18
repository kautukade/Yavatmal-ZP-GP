"use client";

import { cn } from "@/utils/cn";
import { Badge } from "./primitives";
import { RagStatus, ragLabel, ragTone } from "@/utils/labels";
import { useStore } from "@/services/store";
import { SourceReference } from "@/types";
import { AlertTriangle, FlaskConical } from "lucide-react";

export type RefKind = "OFFICIAL_REFERENCE" | "DEMO_DATA" | "ILLUSTRATIVE_KPI" | "LIVE_DEMO_STATE" | "SIMULATED_INTEGRATION";

const REF_META: Record<RefKind, { label: string; tone: string }> = {
  OFFICIAL_REFERENCE: { label: "Official Reference", tone: "bg-brand-50 text-brand-700 ring-brand-600/20" },
  DEMO_DATA: { label: "Demo Data", tone: "bg-saffron-500/10 text-saffron-600 ring-saffron-500/30" },
  ILLUSTRATIVE_KPI: { label: "Illustrative KPI", tone: "bg-violet-50 text-violet-700 ring-violet-600/20" },
  LIVE_DEMO_STATE: { label: "Live Demo State", tone: "bg-teal-50 text-teal-700 ring-teal-600/20" },
  SIMULATED_INTEGRATION: { label: "Simulated / Not Connected", tone: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

export function RefBadge({ kind, className }: { kind: RefKind; className?: string }) {
  const m = REF_META[kind];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset", m.tone, className)}>
      {m.label}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-saffron-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-saffron-600 ring-1 ring-inset ring-saffron-500/30",
        className
      )}
    >
      <FlaskConical className="h-3 w-3" />
      Demo
    </span>
  );
}

export function Disclaimer({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-inset ring-amber-500/20", className)}>
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <span>{text ?? "Demonstration prototype. Not an official Government system. Contains mock/demo data."}</span>
    </div>
  );
}

export function RagPill({ status, showLabel = true }: { status: RagStatus; showLabel?: boolean }) {
  const { lang } = useStore();
  return (
    <Badge tone={ragTone[status]} dot>
      {showLabel ? ragLabel[status][lang] : status}
    </Badge>
  );
}

export function SourceRefTag({ source }: { source: SourceReference }) {
  return (
    <span className="inline-flex flex-col rounded-lg bg-slate-50 px-2.5 py-1.5 ring-1 ring-inset ring-slate-200">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Source System</span>
      <span className="text-xs font-medium text-slate-700">{source.system}</span>
      {source.referenceId && <span className="text-[11px] text-slate-500">{source.referenceId}</span>}
      <span className="mt-0.5 text-[10px] italic text-slate-400">Reference only — not connected to the Government system.</span>
    </span>
  );
}

/** Bilingual text helper */
export function useLang() {
  const { lang } = useStore();
  return {
    lang,
    t: (en: string, mr: string) => (lang === "mr" ? mr : en),
  };
}
