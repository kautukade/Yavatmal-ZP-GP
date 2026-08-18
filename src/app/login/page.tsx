"use client";

import { QUICK_SWITCH_ROLES, ROLES } from "@/data/roles";
import { useAuth, useStore } from "@/services/store";
import { Button, Card, Field, Input } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FlaskConical, KeyRound, Users } from "lucide-react";

export default function LoginPage() {
  const { login, loginAs, user } = useAuth();
  const { ready, state } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("gramsevak@demo.local");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [showAccounts, setShowAccounts] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/app");
  }, [ready, user, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.ok) router.push("/app");
    else if (res.reason === "disabled") setError("Your demo account has been disabled.");
    else setError("Invalid demo credentials. Password for all demo accounts is demo123.");
  };

  const quickLogin = (role: (typeof QUICK_SWITCH_ROLES)[number]) => {
    const target = state.users.find((u) => u.role === role && u.status !== "disabled");
    if (!target) { setError("No active demo account for this role."); return; }
    loginAs(role);
    router.push("/app");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg font-bold ring-1 ring-white/20">ZP</div>
          <div>
            <p className="text-base font-bold">Zilla Parishad Yavatmal</p>
            <p className="text-sm text-brand-200">Unified Panchayat Operations Platform</p>
          </div>
        </div>
        <div className="max-w-md text-white">
          <h1 className="text-3xl font-bold leading-tight">One platform. Village to district.</h1>
          <p className="mt-3 text-brand-100">
            Data flows upward. Instructions flow downward. Escalations flow upward. Permissions remain role-based. Government systems remain the source of truth.
          </p>
        </div>
        <p className="text-xs text-brand-200/80">Demonstration prototype · Not an official Government system · Mock data</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center bg-slate-50 px-4 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-teal-600 text-sm font-bold text-white">ZP</div>
              <p className="text-sm font-bold text-slate-800">ZP Yavatmal</p>
            </div>
            <DemoBadge />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="p-6">
              <div className="mb-5 flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900">Demo Login</h2>
              </div>
              <div className="mb-4 rounded-lg bg-saffron-500/10 px-3 py-2 text-xs font-medium text-saffron-700 ring-1 ring-inset ring-saffron-500/20">
                <FlaskConical className="mr-1 inline h-3.5 w-3.5" /> Demo Mode — No Government credentials are used.
              </div>

              <form onSubmit={submit} className="space-y-4">
                <Field label="Email">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="gramsevak@demo.local" />
                </Field>
                <Field label="Password" hint="Password for all demo accounts: demo123">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="demo123" />
                </Field>
                {error && <p className="text-xs text-rose-600">{error}</p>}
                <Button type="submit" className="w-full" size="lg">
                  Sign In <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <button onClick={() => setShowAccounts((s) => !s)} className="mt-4 w-full text-center text-xs font-medium text-brand-600 hover:underline">
                {showAccounts ? "Hide" : "Show"} Demo Accounts
              </button>
              {showAccounts && (
                <div className="mt-3 max-h-48 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-3 text-xs">
                  {state.users.map((u) => {
                    const disabled = u.status === "disabled";
                    return (
                      <button
                        key={u.id}
                        disabled={disabled}
                        onClick={() => { setEmail(u.email); setPassword("demo123"); }}
                        className={`flex w-full items-center justify-between rounded px-2 py-1 ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-white"}`}
                      >
                        <span className="font-mono text-slate-600">{u.email}</span>
                        <span className="flex items-center gap-1.5 text-slate-400">{ROLES[u.role].name}{disabled && <span className="rounded bg-rose-100 px-1 text-[10px] font-semibold text-rose-600">DISABLED</span>}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick role switcher */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-700">Quick Role Switcher</h3>
              <span className="text-xs text-slate-400">— one click to present</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {QUICK_SWITCH_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => quickLogin(r)}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-brand-300 hover:shadow-card"
                >
                  <span className="text-sm font-semibold text-slate-800">{ROLES[r].name}</span>
                  <span className="text-[11px] text-slate-400">{ROLES[r].nameMr}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            <Link href="/" className="hover:underline">← Back to home</Link> · <Link href="/public" className="hover:underline">Public Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
