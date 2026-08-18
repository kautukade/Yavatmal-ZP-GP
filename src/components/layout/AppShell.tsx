"use client";

import { useAuth, useStore } from "@/services/store";
import { mobileNavForRole, navForRole } from "@/data/nav";
import { Icon } from "@/components/ui/Icon";
import { DemoBadge, useLang } from "@/components/ui/common";
import { ViewAsRole } from "./ViewAsRole";
import { GlobalSearch } from "./GlobalSearch";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import { notificationsFor } from "@/utils/selectors";
import { blockById, gpById } from "@/data/hierarchy";
import { initials } from "@/utils/format";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, Search, X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, role, logout } = useAuth();
  const { state, ready, lang, setLang, markNotificationRead } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // Role-switch redirect is handled in ViewAsRole (redirect to role default).
  // Manual navigation to an unauthorized route intentionally shows the 403 guard.

  if (!ready || !user || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-400">Loading…</div>
      </div>
    );
  }

  const nav = navForRole(user.role);
  const mobileNav = mobileNavForRole(user.role);
  const groups: ("main" | "modules" | "system")[] = ["main", "modules", "system"];
  const groupLabels = { main: t("Workspace", "कार्यक्षेत्र"), modules: t("Modules", "विभाग"), system: t("System", "प्रणाली") };
  const notifs = notificationsFor(state, user);
  const unread = notifs.filter((n) => !n.read).length;

  const scopeText = user.gpId
    ? gpById(user.gpId)?.name
    : user.blockId
    ? `${blockById(user.blockId)?.name} Block`
    : user.districtId
    ? "Yavatmal District"
    : "System";

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-teal-600 text-sm font-bold text-white">
          ZP
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800">Zilla Parishad Yavatmal</p>
          <p className="truncate text-[11px] text-slate-400">Unified Panchayat Operations</p>
        </div>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {groups.map((g) => {
          const items = nav.filter((n) => n.group === g);
          if (!items.length) return null;
          return (
            <div key={g}>
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{groupLabels[g]}</p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.path || (item.path !== "/app" && pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.key}
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon name={item.icon} className={cn("h-4 w-4", active ? "text-brand-600" : "text-slate-400")} />
                      <span className="truncate">{lang === "mr" ? item.labelMr : item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: user.avatarColor ?? "#1f4e8f" }}>
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-[11px] text-slate-400">{lang === "mr" ? role.nameMr : role.name}</p>
          </div>
          <button onClick={logout} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{Sidebar}</aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "tween", duration: 0.25 }} className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden">
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-semibold text-slate-700">{scopeText}</span>
              <DemoBadge />
            </div>
            <div className="flex-1" />
            <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-50">
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("Search…", "शोधा…")}</span>
            </button>
            {/* Language toggle */}
            <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs">
              <button onClick={() => setLang("en")} className={cn("px-2 py-1.5 font-medium", lang === "en" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50")}>
                EN
              </button>
              <button onClick={() => setLang("mr")} className={cn("px-2 py-1.5 font-medium", lang === "mr" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50")}>
                मराठी
              </button>
            </div>
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen((o) => !o)} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                      <span className="text-sm font-semibold text-slate-700">{t("Notifications", "सूचना")}</span>
                      <Link href="/app/notifications" className="text-xs text-brand-600 hover:underline">{t("View all", "सर्व पहा")}</Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifs.length === 0 && <p className="px-4 py-6 text-center text-xs text-slate-400">{t("No notifications", "सूचना नाहीत")}</p>}
                      {notifs.slice(0, 6).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.link) router.push(n.link);
                            setNotifOpen(false);
                          }}
                          className={cn("flex w-full flex-col gap-0.5 border-b border-slate-50 px-4 py-2.5 text-left hover:bg-slate-50", !n.read && "bg-brand-50/40")}
                        >
                          <span className="text-xs font-semibold text-slate-800">{n.title}</span>
                          <span className="text-xs text-slate-500">{n.body}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <OfflineIndicator />
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:px-6 lg:pb-10">
          <RoleGuard>{children}</RoleGuard>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white lg:hidden">
        {mobileNav.map((item) => {
          const active = pathname === item.path || (item.path !== "/app" && pathname.startsWith(item.path));
          return (
            <Link key={item.key} href={item.path} className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium", active ? "text-brand-600" : "text-slate-400")}>
              <Icon name={item.icon} className="h-5 w-5" />
              <span className="truncate">{lang === "mr" ? item.labelMr : item.label}</span>
            </Link>
          );
        })}
      </nav>

      <ViewAsRole />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
