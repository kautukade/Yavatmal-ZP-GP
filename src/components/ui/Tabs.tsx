"use client";

import { cn } from "@/utils/cn";
import { useState } from "react";

export interface TabDef {
  key: string;
  label: string;
  labelMr?: string;
  badge?: number;
}

export function Tabs({ tabs, active, onChange }: { tabs: TabDef[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
            active === t.key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          {t.label}
          {t.badge !== undefined && t.badge > 0 && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{t.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function useTabs(initial: string) {
  const [active, setActive] = useState(initial);
  return { active, setActive };
}
