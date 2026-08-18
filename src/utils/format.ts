const BASE = new Date("2026-08-17T00:00:00Z").getTime();

export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const dt = new Date(iso);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(iso?: string): string {
  if (!iso) return "—";
  const dt = new Date(iso);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) +
    ", " + dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/** Days relative to demo "today" (2026-08-17). Negative = past. */
export function daysFromToday(iso?: string): number {
  if (!iso) return 0;
  return Math.round((new Date(iso).getTime() - BASE) / 86400000);
}

export function relTime(iso?: string): string {
  if (!iso) return "—";
  const dd = daysFromToday(iso);
  if (dd === 0) return "today";
  if (dd === -1) return "yesterday";
  if (dd === 1) return "tomorrow";
  if (dd < 0) return `${-dd} days ago`;
  return `in ${dd} days`;
}

export function isOverdue(iso?: string): boolean {
  return daysFromToday(iso) < 0;
}

export function pct(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 100);
}

export function initials(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
