"use client";

import { Badge, Card, CardBody, CardHeader, EmptyState, InfoTip, Progress } from "@/components/ui/primitives";
import { RagPill } from "@/components/ui/common";
import { Obligation } from "@/types";
import { OBLIGATION_STATUS, PRIORITY, RagStatus, Tone } from "@/utils/labels";
import { fmtDate, relTime } from "@/utils/format";
import { gpById } from "@/data/hierarchy";
import { useStore } from "@/services/store";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Greeting({ name, sub }: { name: string; sub?: string }) {
  const hour = 9; // deterministic for demo
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return (
    <div>
      <p className="text-sm text-slate-500">{greet},</p>
      <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{name}</h1>
      {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}

export function SectionCard({
  title,
  titleMr,
  subtitle,
  action,
  children,
  icon,
}: {
  title: string;
  titleMr?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} titleMr={titleMr} subtitle={subtitle} action={action} icon={icon} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export function ObligationRow({ o, href = "/app/pathpurava" }: { o: Obligation; href?: string }) {
  const { lang } = useStore();
  const st = OBLIGATION_STATUS[o.status];
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{lang === "mr" && o.titleMr ? o.titleMr : o.title}</p>
        <p className="truncate text-xs text-slate-400">
          {o.id} · {gpById(o.gpId)?.name ?? "—"} · due {relTime(o.dueDate)}
        </p>
      </div>
      <Badge tone={PRIORITY[o.priority].tone as Tone}>{PRIORITY[o.priority][lang]}</Badge>
      <Badge tone={st.tone} dot>
        {st[lang]}
      </Badge>
    </Link>
  );
}

export function AttentionList({ items, empty }: { items: { id: string; title: string; sub?: string; tone?: Tone; badge?: string; href?: string }[]; empty?: string }) {
  if (!items.length) return <EmptyState title={empty ?? "Nothing needs attention"} subtitle="You're all caught up." />;
  return (
    <div className="divide-y divide-slate-50">
      {items.map((it) => {
        const inner = (
          <div className="flex items-center gap-3 py-2.5">
            <span className={`h-2 w-2 flex-shrink-0 rounded-full ${it.tone === "red" ? "bg-rose-500" : it.tone === "amber" ? "bg-amber-500" : "bg-brand-500"}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{it.title}</p>
              {it.sub && <p className="truncate text-xs text-slate-400">{it.sub}</p>}
            </div>
            {it.badge && <Badge tone={it.tone ?? "slate"}>{it.badge}</Badge>}
            {it.href && <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-slate-300" />}
          </div>
        );
        return it.href ? (
          <Link key={it.id} href={it.href} className="block hover:bg-slate-50">
            {inner}
          </Link>
        ) : (
          <div key={it.id}>{inner}</div>
        );
      })}
    </div>
  );
}

export function RagRow({
  name,
  nameMr,
  rag,
  reasons,
  metrics,
  href,
}: {
  name: string;
  nameMr?: string;
  rag: RagStatus;
  reasons: string[];
  metrics: { label: string; value: number | string }[];
  href?: string;
}) {
  const inner = (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <RagPill status={rag} showLabel={false} />
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {name} {nameMr && <span className="font-normal text-slate-400">{nameMr}</span>}
          </p>
          <p className="flex items-center gap-1 text-xs text-slate-400">
            {reasons.join(" · ")}
            <InfoTip text={`Status is ${rag} because: ${reasons.join("; ")}.`} />
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-sm font-bold text-slate-800">{m.value}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function ReadinessMeter({ label, value, tone = "teal" }: { label: string; value: number; tone?: Tone }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{value}%</span>
      </div>
      <Progress value={value} tone={tone} />
    </div>
  );
}

export function GovNote() {
  return (
    <p className="mt-2 text-xs italic text-slate-400">
      Government systems remain the source of truth. This demo shows operational follow-through only.
    </p>
  );
}
