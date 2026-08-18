"use client";

import { QUICK_SWITCH_ROLES, ROLES } from "@/data/roles";
import { useAuth, useStore } from "@/services/store";
import { canAccessRoute } from "@/permissions/routeAccess";
import { roleDefaultRoute } from "@/permissions/userScope";
import { Eye, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { useLang } from "@/components/ui/common";

export function ViewAsRole() {
  const { user, viewAs } = useAuth();
  const { state } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  if (!user) return null;

  // Switch role and, if the current route is not allowed for the new role,
  // redirect to that role's default dashboard — no 403 flash on demo switch.
  const switchTo = (r: (typeof QUICK_SWITCH_ROLES)[number]) => {
    if (!state.users.some((u) => u.role === r && u.status !== "disabled")) return;
    viewAs(r);
    setOpen(false);
    if (!canAccessRoute(r, pathname)) router.push(roleDefaultRoute(r));
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-2 ring-white transition-transform hover:scale-105 sm:bottom-6"
      >
        <Eye className="h-4 w-4" />
        <span className="hidden sm:inline">{t("View as Role", "भूमिका बदला")}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end bg-slate-900/30 p-4 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            >
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">{t("View as Role", "भूमिका बदला")}</h3>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-4 text-xs text-slate-500">
                {t(
                  "The same underlying event appears differently to each role — demonstrating upward data flow.",
                  "एकच घटना प्रत्येक भूमिकेला वेगळी दिसते — माहिती वरच्या दिशेने प्रवाहित होते."
                )}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_SWITCH_ROLES.map((r) => {
                  const role = ROLES[r];
                  const active = user.role === r;
                  const hasAccount = state.users.some((u) => u.role === r && u.status !== "disabled");
                  return (
                    <button
                      key={r}
                      disabled={!hasAccount}
                      onClick={() => switchTo(r)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-3 text-left transition-colors",
                        !hasAccount ? "cursor-not-allowed border-slate-200 opacity-50" : active ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
                      )}
                    >
                      <span className="text-sm font-medium text-slate-800">{role.name}</span>
                      <span className="text-xs text-slate-400">{hasAccount ? role.nameMr : t("No active demo account", "सक्रिय खाते नाही")}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
