"use client";

import { useAuth, useStore } from "@/services/store";
import { notificationsFor } from "@/utils/selectors";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";
import { fmtDateTime } from "@/utils/format";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare } from "lucide-react";

export default function NotificationsPage() {
  const { state, user, markNotificationRead } = useStore();
  const auth = useAuth();
  const router = useRouter();
  const notifs = notificationsFor(state, auth.user);
  return (
    <div>
      <PageHeader title="Notifications" titleMr="सूचना" subtitle="In-app notification centre with SMS preview">
        <DemoBadge />
      </PageHeader>
      {notifs.length === 0 ? (
        <EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications" />
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {notifs.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.read ? "bg-brand-50/40" : ""}`}>
                <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.read ? "bg-slate-300" : "bg-brand-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="text-sm text-slate-500">{n.body}</p>
                  {n.smsPreview && <p className="mt-1 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500"><MessageSquare className="h-3 w-3" /> SMS: {n.smsPreview}</p>}
                  <p className="mt-1 text-xs text-slate-400">{fmtDateTime(n.ts)} · {n.type.replace(/_/g, " ")}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => markNotificationRead(n.id)}>Mark read</Button>}
                  {n.link && <Button size="sm" variant="outline" onClick={() => { markNotificationRead(n.id); router.push(n.link!); }}>Open</Button>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
