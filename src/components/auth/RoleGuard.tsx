"use client";

import { useAuth } from "@/services/store";
import { canAccessRoute } from "@/permissions/routeAccess";
import { useLang } from "@/components/ui/common";
import { Button, Card, CardBody } from "@/components/ui/primitives";
import { ROLES } from "@/data/roles";
import { usePathname, useRouter } from "next/navigation";
import { Lock, ShieldAlert } from "lucide-react";

/**
 * Centralized route guard. Renders the 403 page (never the restricted content)
 * when the current role is not permitted for the active route.
 */
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();

  if (!user || !role) return <>{children}</>; // AppShell handles the unauthenticated redirect

  const allowed = canAccessRoute(user.role, pathname);
  if (allowed) return <>{children}</>;

  const rule = pathname;
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-lg">
        <CardBody className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">403 — {t("Access Restricted", "प्रवेश प्रतिबंधित")}</h1>
          <p className="mt-2 text-sm text-slate-500">{t("You do not have permission to access this module.", "या विभागात प्रवेश करण्याची तुम्हाला परवानगी नाही.")}</p>
          <div className="mt-4 space-y-1 rounded-lg bg-slate-50 p-3 text-left text-sm">
            <p><span className="text-slate-400">{t("Your role", "तुमची भूमिका")}:</span> <span className="font-medium text-slate-700">{ROLES[user.role].name} · {ROLES[user.role].nameMr}</span></p>
            <p><span className="text-slate-400">{t("Requested module", "विनंती केलेला विभाग")}:</span> <span className="font-mono text-xs text-slate-700">{rule}</span></p>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button onClick={() => router.push("/app")}><ShieldAlert className="h-4 w-4" /> {t("Back to My Dashboard", "माझ्या डॅशबोर्डवर परत")}</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
