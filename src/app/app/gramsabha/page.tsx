"use client";

import { useAuth, useStore } from "@/services/store";
import { computeScope, inScope } from "@/permissions";
import { gpById } from "@/data/hierarchy";
import { Badge, Card, CardBody, EmptyState, PageHeader } from "@/components/ui/primitives";
import { DemoBadge, Disclaimer } from "@/components/ui/common";
import { fmtDate } from "@/utils/format";
import { CalendarClock, CheckCircle2, Users } from "lucide-react";

export default function GramSabhaPage() {
  const { state } = useStore();
  const { user } = useAuth();
  const scope = computeScope(user);
  const meetings = state.gramSabhaMeetings.filter((m) => inScope(scope, m));
  const gpIds = Array.from(new Set(meetings.map((m) => m.gpId)));

  return (
    <div>
      <PageHeader title="Gram Sabha Darpan" titleMr="ग्रामसभा दर्पण" subtitle="Meeting transparency & action-taken follow-through">
        <DemoBadge />
      </PageHeader>
      <div className="mb-4"><Disclaimer text="Demo concept — official Gram Sabha systems remain authoritative." /></div>

      {gpIds.length === 0 ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title="No Gram Sabha records in scope" />
      ) : (
        <div className="space-y-5">
          {gpIds.slice(0, 6).map((gpId) => {
            const upcoming = meetings.find((m) => m.gpId === gpId && m.type === "upcoming");
            const prev = meetings.find((m) => m.gpId === gpId && m.type === "previous");
            const decisions = state.gramSabhaDecisions.filter((d) => prev?.decisions.includes(d.id));
            return (
              <Card key={gpId}>
                <CardBody>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{gpById(gpId)?.name}</p>
                    <Badge tone="slate">{gpById(gpId)?.nameMr}</Badge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      {upcoming && (
                        <div className="rounded-lg bg-brand-50 p-3">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700"><CalendarClock className="h-3.5 w-3.5" /> Upcoming Meeting</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{fmtDate(upcoming.date)}</p>
                          <p className="text-xs text-slate-500">Notice: {fmtDate(upcoming.noticeDate)} · Quorum required {upcoming.quorumRequired}</p>
                          <p className="mt-1 text-xs text-slate-500">Invited: {upcoming.departmentsInvited.join(", ")}</p>
                        </div>
                      )}
                      {prev && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-600">Previous Meeting — {fmtDate(prev.date)}</p>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>Attendance: <b className="text-slate-700">{prev.attendance}</b></span>
                            <span>Quorum: <Badge tone={prev.quorumMet ? "green" : "red"}>{prev.quorumMet ? "Met" : "Not met"}</Badge></span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">Departments attended: {prev.departmentsAttended.length}/{prev.departmentsInvited.length}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-600">Decisions & Action-Taken</p>
                      <div className="space-y-2">
                        {decisions.map((d) => (
                          <div key={d.id} className="rounded-lg border border-slate-100 p-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-slate-800">{d.decision}</p>
                              <Badge tone={d.status === "COMPLETED" ? "green" : d.status === "IN_PROGRESS" ? "blue" : "amber"} dot>{d.status}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{d.actionTaken}</p>
                          </div>
                        ))}
                        {!decisions.length && <p className="text-xs text-slate-400">No recorded decisions.</p>}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
