"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Eye,
  FlaskConical,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const GOV_SYSTEMS = [
  "eGramSwaraj",
  "AuditOnline",
  "SAMARTH",
  "Gram Manchitra",
  "Aaple Sarkar",
  "Panchayat NIRNAY",
  "JJM",
  "ZPFMS",
];

const PILLARS = [
  { icon: MapPin, title: "Village Operations", desc: "Gram Sevak daily workspace — obligations, assets, seasonal readiness, services.", tone: "from-brand-500 to-brand-700" },
  { icon: Building2, title: "Block Monitoring", desc: "BDO command centre surfacing GP exceptions, blockers and readiness first.", tone: "from-teal-500 to-teal-700" },
  { icon: LayoutDashboard, title: "District Command", desc: "Deputy CEO & CEO see systemic bottlenecks and strategic outcomes.", tone: "from-brand-700 to-slate-800" },
  { icon: Eye, title: "Public Transparency", desc: "Citizens see only approved public status, decisions and participation.", tone: "from-saffron-500 to-saffron-600" },
];

const FLOW = [
  { role: "VWSC", text: "Handpump not working" },
  { role: "Gram Sevak", text: "Repair required" },
  { role: "JE", text: "Repair in progress" },
  { role: "BDO", text: "1 GP: critical water failure" },
  { role: "Deputy CEO", text: "17 similar failures district-wide" },
  { role: "CEO", text: "Water readiness needs attention" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-teal-600 text-sm font-bold text-white">ZP</div>
            <div>
              <p className="text-sm font-bold text-slate-800">Zilla Parishad Yavatmal</p>
              <p className="text-[11px] text-slate-400">Unified Panchayat Operations Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/public" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:block">
              Public Portal
            </Link>
            <Link href="/login" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
              Demo Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-teal-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-saffron-600 ring-1 ring-inset ring-saffron-500/30">
              <FlaskConical className="h-3.5 w-3.5" /> Demonstration Prototype
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              One Operational View from <span className="text-brand-700">Village to District</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Unified role-based demonstration for Panchayat operations, maintenance, follow-through and participation — from Gram Panchayat daily work up to CEO strategic command.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
                Explore the Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/demo-story" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Sparkles className="h-4 w-4 text-teal-600" /> Presentation Mode
              </Link>
              <Link href="/public" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Eye className="h-4 w-4 text-saffron-600" /> Public Portal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <div className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${p.tone} p-2.5 text-white`}>
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">{p.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The differentiator: same issue travels the hierarchy */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">The same issue, seen differently at every level</h2>
            <p className="mt-2 text-sm text-slate-500">One update at the lowest authorised level flows upward — no repeated reporting at GP, Block and District.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((f, i) => (
              <motion.div
                key={f.role}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{f.role}</p>
                  <p className="text-sm font-medium text-slate-800">&ldquo;{f.text}&rdquo;</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Source of truth */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-teal-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Existing Government Systems Remain the Source of Truth</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                This platform does not replace statutory systems. It provides one unified operational experience while planning, accounting, payments, assets, taxation and citizen services stay in their official systems.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {GOV_SYSTEMS.map((s) => (
              <span key={s} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs italic text-slate-400">Reference only — the demo is not connected to any Government system. No official logos are used.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 py-8 text-slate-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Zilla Parishad Yavatmal — Unified Panchayat Operations Platform</p>
              <p className="mt-1 text-xs text-slate-400">Maharashtra · Demonstration prototype</p>
            </div>
            <div className="flex gap-4 text-xs">
              <Link href="/login" className="hover:text-white">Demo Login</Link>
              <Link href="/public" className="hover:text-white">Public Portal</Link>
              <Link href="/demo-story" className="hover:text-white">Presentation</Link>
            </div>
          </div>
          <p className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Demonstration prototype for research and field validation. It is not an official Government system and contains mock/demo data. Do not treat any content as Government-approved or production-authorised.
          </p>
        </div>
      </footer>
    </div>
  );
}
