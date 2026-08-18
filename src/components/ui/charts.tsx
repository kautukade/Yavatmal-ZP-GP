"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS = { fontSize: 11, fill: "#64748b" };
const GRID = "#e2e8f0";

export function BarChartMini({
  data,
  dataKey = "value",
  color = "#1f4e8f",
  height = 220,
  horizontal = false,
}: {
  data: { name: string; value: number; color?: string }[];
  dataKey?: string;
  color?: string;
  height?: number;
  horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 8, left: horizontal ? 8 : -16, bottom: 0 }}>
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={AXIS} width={130} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
          </>
        )}
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          cursor={{ fill: "rgba(31,78,143,0.06)" }}
        />
        <Bar dataKey={dataKey} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({
  data,
  color = "#199e8f",
  height = 220,
  lines,
}: {
  data: Record<string, any>[];
  color?: string;
  height?: number;
  lines?: { key: string; color: string; label: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <XAxis dataKey="name" tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        {lines && lines.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {(lines ?? [{ key: "value", color, label: "value" }]).map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  height = 220,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="85%" paddingAngle={2} stroke="none">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{total}</span>
        <span className="text-xs text-slate-400">Total</span>
      </div>
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
