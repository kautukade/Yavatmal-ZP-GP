"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { forUser, obligationStats, assetStats, repairStats, systemicBlockers, blockSummaries, getAccessibleRecords } from "@/utils/selectors";
import { Badge, Button, Card, CardBody, PageHeader, Select } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";
import { gpById } from "@/data/hierarchy";
import { Download, Printer } from "lucide-react";

const REPORTS = [
  "GP Operational Summary", "Block Exception Report", "District Exception Report", "Asset Functionality Report",
  "Repair Ageing Report", "Seasonal Readiness Report", "Obligation Completion Report", "Blocker Analysis",
  "Officer Handover Report", "Gram Sabha Follow-Up Report", "Participation Report", "Service Pendency Report",
];

export default function ReportsPage() {
  const { state, user } = { ...useStore(), user: useAuth().user };
  const [report, setReport] = useState(REPORTS[0]);
  const scoped = forUser(state, user);
  const rows = buildReport(report, scoped, state, user);

  const csv = () => {
    const data = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${report.replace(/\s+/g, "_")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Reports" titleMr="अहवाल" subtitle="Demo reports — print or CSV export">
        <DemoBadge />
      </PageHeader>
      <Card className="mb-4 no-print">
        <CardBody className="flex flex-wrap items-center gap-3">
          <Select value={report} onChange={(e) => setReport(e.target.value)} className="w-auto">{REPORTS.map((r) => <option key={r} value={r}>{r}</option>)}</Select>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
            <Button size="sm" onClick={csv}><Download className="h-4 w-4" /> CSV</Button>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h2 className="mb-1 text-lg font-bold text-slate-900">{report}</h2>
          <p className="mb-4 text-xs text-slate-400">Zilla Parishad Yavatmal · Unified Panchayat Operations Platform · Demo</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr>{rows[0]?.map((h, i) => <th key={i} className="px-3 py-2">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="px-3 py-2 text-slate-700">{c}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs italic text-slate-400">Demonstration prototype. Government systems remain the source of truth.</p>
        </CardBody>
      </Card>
    </div>
  );
}

function buildReport(report: string, scoped: ReturnType<typeof forUser>, state: any, user: any): (string | number)[][] {
  // District-wide aggregates are restricted to district/system roles; block/GP
  // roles only export their own block — exports never bypass the scope model.
  const scopeLevel = user ? (["dyceo_panchayat", "dyceo_dept_head", "additional_ceo", "ceo", "zp_member", "zp_vice_president", "zp_president", "sysadmin"].includes(user.role) ? "district" : user.blockId ? "block" : "gp") : "gp";
  const scopedBlocks = () => {
    const all = blockSummaries(state);
    return scopeLevel === "district" ? all : all.filter((b) => b.blockId === user?.blockId);
  };
  switch (report) {
    case "Blocker Analysis": {
      const b = systemicBlockers(scoped.obligations);
      return [["Blocker Category", "Count", "GPs affected"], ...b.map((x) => [x.category, x.count, x.gpCount])];
    }
    case "Asset Functionality Report": {
      const a = assetStats(scoped.assets);
      return [["Condition", "Count"], ["Functional", a.functional], ["Partially Functional", a.partial], ["Non-functional", a.nonFunctional], ["Under Repair", a.underRepair], ["Check Due", a.checkDue]];
    }
    case "Repair Ageing Report":
      return [["Ticket", "Asset", "GP", "Status", "Age (days)"], ...scoped.repairs.map((r: any) => [r.id, r.assetCode, gpById(r.gpId)?.name ?? "", r.status, r.ageDays ?? 0])];
    case "Block Exception Report":
    case "District Exception Report":
      return [["Block", "Status", "Overdue", "Blocked", "Non-func", "Readiness %"], ...scopedBlocks().map((b) => [b.name, b.rag, b.overdue, b.blocked, b.nonFunctional, b.readiness])];
    case "Obligation Completion Report": {
      const s = obligationStats(scoped.obligations);
      return [["Metric", "Count"], ["Total", s.total], ["Active", s.active], ["Overdue", s.overdue], ["Blocked", s.blocked], ["Under Review", s.underReview], ["Completed", s.completed], ["Verified", s.verified]];
    }
    case "Participation Report":
      return [["Activity", "Registered", "Needed", "Status"], ...scoped.activities.map((a: any) => [a.title, a.registeredVolunteers.length, a.needsVolunteers, a.status])];
    case "Service Pendency Report":
      return [["Service ID", "Service", "GP", "Days", "Status", "Overdue"], ...scoped.services.map((s: any) => [s.id, s.service, gpById(s.gpId)?.name ?? "", s.daysElapsed, s.status, s.overdue ? "Yes" : "No"])];
    case "Officer Handover Report":
      return [["GP", "Reason", "Open", "Overdue", "Blockers", "Accepted"], ...getAccessibleRecords(user, state.handovers).map((h: any) => [gpById(h.gpId)?.name ?? "", h.reason, h.openObligations, h.overdueMatters, h.activeBlockers, h.accepted ? "Yes" : "No"])];
    case "Gram Sabha Follow-Up Report":
      return [["Decision", "Status", "Action Taken"], ...state.gramSabhaDecisions.map((d: any) => [d.decision, d.status, d.actionTaken ?? ""])];
    case "Seasonal Readiness Report":
      return [["GP", "Cycle", "Task", "Status"], ...scoped.seasonal.map((t: any) => [gpById(t.gpId)?.name ?? "", t.cycle, t.title, t.status])];
    default:
      return [["Obligation", "GP", "Status", "Priority", "Due"], ...scoped.obligations.slice(0, 40).map((o) => [o.title, gpById(o.gpId)?.name ?? "", o.status, o.priority, o.dueDate.slice(0, 10)])];
  }
}
