"use client";

import {
  AppNotification,
  Asset,
  AuditLog,
  DemoState,
  Obligation,
  OfflineMutation,
  ParticipationActivity,
  RepairTicket,
  RoleId,
  SeasonalTask,
  User,
} from "@/types";
import { buildSeed, DEMO_VERSION, today } from "@/data/seed";
import { ROLES } from "@/data/roles";
import { authenticate, isActive, activeUserForRole, LoginResult } from "./auth";
import { shouldQueue, syncQueue, makeOfflineMutation } from "./offline";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const STATE_KEY = "yvt-demo-state";
const USER_KEY = "yvt-demo-user";
const LANG_KEY = "yvt-demo-lang";

export type Lang = "en" | "mr";
export type { LoginResult };

interface StoreContextValue {
  state: DemoState;
  user: User | null;
  lang: Lang;
  ready: boolean;
  setLang: (l: Lang) => void;
  login: (email: string, password: string) => LoginResult;
  loginAs: (role: RoleId) => void;
  viewAs: (role: RoleId) => void; // switch demo identity keeping same session flavor
  logout: () => void;
  update: (mutator: (draft: DemoState) => void) => void;
  resetDemo: () => void;
  // convenience mutators
  updateObligation: (id: string, patch: Partial<Obligation>, audit?: Omit<AuditLog, "id" | "ts">) => void;
  updateAsset: (id: string, patch: Partial<Asset>, audit?: Omit<AuditLog, "id" | "ts">) => void;
  updateRepair: (id: string, patch: Partial<RepairTicket>, audit?: Omit<AuditLog, "id" | "ts">) => void;
  addRepair: (r: RepairTicket) => void;
  addObligation: (o: Obligation) => void;
  updateSeasonal: (id: string, patch: Partial<SeasonalTask>) => void;
  updateActivity: (id: string, patch: Partial<ParticipationActivity>) => void;
  pushNotification: (n: Omit<AppNotification, "id" | "ts" | "read">) => void;
  markNotificationRead: (id: string) => void;
  addAudit: (a: Omit<AuditLog, "id" | "ts">) => void;
  enqueueOffline: (m: Omit<OfflineMutation, "id" | "createdAt" | "status">) => void;
  /** Enqueue a mutation ONLY when offline; returns true if it was queued. */
  queueIfOffline: (m: Omit<OfflineMutation, "id" | "createdAt" | "status">) => boolean;
  syncOfflineQueue: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

let counter = 1000;
function uid(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() => buildSeed());
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState;
        if (parsed.version === DEMO_VERSION) setState(parsed);
        else localStorage.setItem(STATE_KEY, JSON.stringify(buildSeed()));
      }
      const u = localStorage.getItem(USER_KEY);
      if (u) setUser(JSON.parse(u));
      const l = localStorage.getItem(LANG_KEY) as Lang | null;
      if (l) setLangState(l);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // Live ref so auth always reads the CURRENT persisted users, not a stale seed.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const persist = useCallback((s: DemoState) => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(s));
    } catch {
      /* ignore quota */
    }
  }, []);

  const update = useCallback(
    (mutator: (draft: DemoState) => void) => {
      setState((prev) => {
        const draft: DemoState = JSON.parse(JSON.stringify(prev));
        mutator(draft);
        persist(draft);
        return draft;
      });
    },
    [persist]
  );

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
  }, []);

  const setSessionUser = useCallback((u: User | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
      else localStorage.removeItem(USER_KEY);
    } catch {}
  }, []);

  const login = useCallback(
    (email: string, password: string): LoginResult => {
      const res = authenticate(stateRef.current.users, email, password);
      if (res.ok && res.user) setSessionUser(res.user);
      return res;
    },
    [setSessionUser]
  );

  const loginAs = useCallback(
    (role: RoleId) => {
      // Quick Role Switcher / View-as-Role reads the CURRENT users, active only.
      const found = activeUserForRole(stateRef.current.users, role);
      if (found) setSessionUser(found);
    },
    [setSessionUser]
  );

  const viewAs = loginAs;

  // Keep the session user's role/scope in sync when Admin edits state.users,
  // and log out if the current account is disabled or removed.
  useEffect(() => {
    if (!user) return;
    const fresh = state.users.find((u) => u.id === user.id);
    if (!fresh || !isActive(fresh)) { setSessionUser(null); return; }
    if (JSON.stringify(fresh) !== JSON.stringify(user)) setSessionUser(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.users]);

  const logout = useCallback(() => setSessionUser(null), [setSessionUser]);

  const resetDemo = useCallback(() => {
    const fresh = buildSeed();
    setState(fresh);
    persist(fresh);
  }, [persist]);

  const addAudit = useCallback(
    (a: Omit<AuditLog, "id" | "ts">) =>
      update((d) => {
        d.auditLogs.unshift({ ...a, id: uid("AL"), ts: today() });
      }),
    [update]
  );

  const enqueueOffline = useCallback(
    (m: Omit<OfflineMutation, "id" | "createdAt" | "status">) =>
      update((d) => {
        (d.offlineQueue ??= []).unshift(makeOfflineMutation(m, uid("OQ"), today()));
      }),
    [update]
  );

  const queueIfOffline = useCallback(
    (m: Omit<OfflineMutation, "id" | "createdAt" | "status">) => {
      const offline = shouldQueue(!(typeof navigator === "undefined" || navigator.onLine));
      if (offline) enqueueOffline(m);
      return offline;
    },
    [enqueueOffline]
  );

  const syncOfflineQueue = useCallback(
    () =>
      update((d) => {
        d.offlineQueue = syncQueue(d.offlineQueue ?? []);
      }),
    [update]
  );

  const pushNotification = useCallback(
    (n: Omit<AppNotification, "id" | "ts" | "read">) =>
      update((d) => {
        d.notifications.unshift({ ...n, id: uid("NT"), ts: today(), read: false });
      }),
    [update]
  );

  const markNotificationRead = useCallback(
    (id: string) =>
      update((d) => {
        const n = d.notifications.find((x) => x.id === id);
        if (n) n.read = true;
      }),
    [update]
  );

  const updateObligation = useCallback(
    (id: string, patch: Partial<Obligation>, audit?: Omit<AuditLog, "id" | "ts">) =>
      update((d) => {
        const o = d.obligations.find((x) => x.id === id);
        if (o) {
          Object.assign(o, patch);
          o.lastActivity = today();
        }
        if (audit) d.auditLogs.unshift({ ...audit, id: uid("AL"), ts: today() });
      }),
    [update]
  );

  const addObligation = useCallback(
    (o: Obligation) =>
      update((d) => {
        d.obligations.unshift(o);
      }),
    [update]
  );

  const updateAsset = useCallback(
    (id: string, patch: Partial<Asset>, audit?: Omit<AuditLog, "id" | "ts">) =>
      update((d) => {
        const a = d.assets.find((x) => x.id === id);
        if (a) Object.assign(a, patch);
        if (audit) d.auditLogs.unshift({ ...audit, id: uid("AL"), ts: today() });
      }),
    [update]
  );

  const updateRepair = useCallback(
    (id: string, patch: Partial<RepairTicket>, audit?: Omit<AuditLog, "id" | "ts">) =>
      update((d) => {
        const r = d.repairs.find((x) => x.id === id);
        if (r) Object.assign(r, patch);
        if (audit) d.auditLogs.unshift({ ...audit, id: uid("AL"), ts: today() });
      }),
    [update]
  );

  const addRepair = useCallback(
    (r: RepairTicket) =>
      update((d) => {
        d.repairs.unshift(r);
      }),
    [update]
  );

  const updateSeasonal = useCallback(
    (id: string, patch: Partial<SeasonalTask>) =>
      update((d) => {
        const t = d.seasonalTasks.find((x) => x.id === id);
        if (t) Object.assign(t, patch);
      }),
    [update]
  );

  const updateActivity = useCallback(
    (id: string, patch: Partial<ParticipationActivity>) =>
      update((d) => {
        const a = d.activities.find((x) => x.id === id);
        if (a) Object.assign(a, patch);
      }),
    [update]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      user,
      lang,
      ready,
      setLang,
      login,
      loginAs,
      viewAs,
      logout,
      update,
      resetDemo,
      updateObligation,
      updateAsset,
      updateRepair,
      addRepair,
      addObligation,
      updateSeasonal,
      updateActivity,
      pushNotification,
      markNotificationRead,
      addAudit,
      enqueueOffline,
      queueIfOffline,
      syncOfflineQueue,
    }),
    [state, user, lang, ready, setLang, login, loginAs, viewAs, logout, update, resetDemo, updateObligation, updateAsset, updateRepair, addRepair, addObligation, updateSeasonal, updateActivity, pushNotification, markNotificationRead, addAudit, enqueueOffline, queueIfOffline, syncOfflineQueue]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useAuth() {
  const { user, login, loginAs, logout, viewAs } = useStore();
  return { user, role: user ? ROLES[user.role] : null, login, loginAs, logout, viewAs };
}
