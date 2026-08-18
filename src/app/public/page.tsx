"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/services/store";
import { BLOCKS, GPS, gpsInBlock, gpById } from "@/data/hierarchy";
import { readinessPct } from "@/utils/selectors";
import { Badge, Card, CardBody } from "@/components/ui/primitives";
import { DemoBadge, useLang } from "@/components/ui/common";
import { ASSET_CONDITION } from "@/utils/labels";
import { fmtDate } from "@/utils/format";
import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  CloudRain,
  Droplets,
  HeartHandshake,
  Lightbulb,
  MapPin,
  Users,
} from "lucide-react";

export default function PublicPortal() {
  const { state, lang, setLang } = useStore();
  const { t } = useLang();
  const [blockId, setBlockId] = useState("b-yavatmal");
  const [gpId, setGpId] = useState("gp-borgaon");
  const gps = gpsInBlock(blockId);
  const gp = gpById(gpId);

  const readiness = readinessPct(state, { gpId });
  const decisions = state.gramSabhaDecisions.filter((d) => d.publishedPublic && state.gramSabhaMeetings.some((m) => m.gpId === gpId && m.decisions.includes(d.id)));
  const assets = state.assets.filter((a) => a.gpId === gpId && a.publishedPublic);
  const nonFunc = assets.filter((a) => a.condition === "NON_FUNCTIONAL" || a.condition === "UNDER_REPAIR");
  const activities = state.activities.filter((a) => a.publishedPublic && (a.gpId === gpId || a.blockId === blockId));
  const upcoming = state.gramSabhaMeetings.find((m) => m.gpId === gpId && m.type === "upcoming");
  const services = state.services.filter((s) => s.gpId === gpId);
  const svcStats = { received: services.length, completed: services.filter((s) => s.status === "COMPLETED").length, overdue: services.filter((s) => s.overdue).length };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-teal-600 text-sm font-bold text-white">ZP</div>
            <div><p className="text-sm font-bold text-slate-800">{t("ZP Yavatmal — Public Portal", "जि.प. यवतमाळ — नागरिक पोर्टल")}</p><p className="text-[11px] text-slate-400">{t("Village transparency", "गाव पारदर्शकता")}</p></div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs">
              <button onClick={() => setLang("en")} className={`px-2 py-1.5 font-medium ${lang === "en" ? "bg-brand-600 text-white" : "text-slate-500"}`}>EN</button>
              <button onClick={() => setLang("mr")} className={`px-2 py-1.5 font-medium ${lang === "mr" ? "bg-brand-600 text-white" : "text-slate-500"}`}>मराठी</button>
            </div>
            <Link href="/login" className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700">{t("Officer Login", "अधिकारी लॉगिन")}</Link>
          </div>
        </div>
      </header>

      {/* Hero + village select */}
      <section className="border-b border-slate-100 bg-gradient-to-br from-brand-50 to-teal-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-2"><DemoBadge /><span className="text-xs text-slate-500">{t("Approved public information only", "फक्त मंजूर सार्वजनिक माहिती")}</span></div>
          <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-slate-900"><MapPin className="h-6 w-6 text-brand-600" /> {t("Select My Village", "माझे गाव निवडा")}</h1>
          <div className="mt-4 flex flex-wrap gap-3">
            <select value={blockId} onChange={(e) => { setBlockId(e.target.value); const g = gpsInBlock(e.target.value)[0]; if (g) setGpId(g.id); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              {BLOCKS.map((b) => <option key={b.id} value={b.id}>{lang === "mr" ? b.nameMr : b.name}</option>)}
            </select>
            <select value={gpId} onChange={(e) => setGpId(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              {gps.map((g) => <option key={g.id} value={g.id}>{lang === "mr" ? g.nameMr : g.name}</option>)}
            </select>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {/* Village snapshot */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Snapshot icon={<CloudRain className="h-5 w-5" />} label={t("Readiness", "सज्जता")} value={`${readiness}%`} tone="teal" />
          <Snapshot icon={<CheckCircle2 className="h-5 w-5" />} label={t("Public Decisions", "सार्वजनिक निर्णय")} value={String(decisions.length)} tone="blue" />
          <Snapshot icon={<Droplets className="h-5 w-5" />} label={t("Assets Under Repair", "दुरुस्तीतील मालमत्ता")} value={String(nonFunc.length)} tone="amber" />
          <Snapshot icon={<Clock className="h-5 w-5" />} label={t("Services (this GP)", "सेवा")} value={`${svcStats.completed}/${svcStats.received}`} tone="violet" />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PublicCard icon={<CheckCircle2 className="h-4 w-4" />} title={t("Decisions & Completion", "निर्णय व पूर्तता")}>
            {decisions.length ? decisions.map((d) => (
              <Row key={d.id} title={lang === "mr" && d.decisionMr ? d.decisionMr : d.decision} sub={`${fmtDate(d.date)}`} badge={d.status} tone={d.status === "COMPLETED" ? "green" : "amber"} />
            )) : <Empty text={t("No published decisions", "मंजूर निर्णय नाहीत")} />}
          </PublicCard>

          <PublicCard icon={<CloudRain className="h-4 w-4" />} title={t("Readiness & Assets", "सज्जता व मालमत्ता")}>
            {assets.slice(0, 6).map((a) => (
              <Row key={a.id} title={`${a.code} — ${a.name}`} sub={a.type} badge={ASSET_CONDITION[a.condition][lang]} tone={a.condition === "FUNCTIONAL" ? "green" : a.condition === "NON_FUNCTIONAL" ? "red" : "amber"} />
            ))}
            {!assets.length && <Empty text={t("No public assets", "सार्वजनिक मालमत्ता नाहीत")} />}
          </PublicCard>

          <PublicCard icon={<Clock className="h-4 w-4" />} title={t("Public Services", "सार्वजनिक सेवा")}>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat n={svcStats.received} l={t("Received", "प्राप्त")} />
              <Stat n={svcStats.completed} l={t("Completed", "पूर्ण")} />
              <Stat n={svcStats.overdue} l={t("Overdue", "मुदतबाह्य")} tone="red" />
            </div>
            <p className="mt-3 text-xs italic text-slate-400">{t("No personal details are shown. Government service system integration not enabled in demo.", "वैयक्तिक तपशील दाखवले जात नाहीत.")}</p>
          </PublicCard>

          <PublicCard icon={<Users className="h-4 w-4" />} title={t("Gram Sabha", "ग्रामसभा")}>
            {upcoming ? (
              <div className="rounded-lg bg-brand-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700"><CalendarClock className="h-3.5 w-3.5" /> {t("Upcoming Meeting", "आगामी सभा")}</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{fmtDate(upcoming.date)}</p>
                <p className="text-xs text-slate-500">{t("Notice issued", "सूचना दिली")}: {fmtDate(upcoming.noticeDate)}</p>
              </div>
            ) : <Empty text={t("No upcoming meeting", "आगामी सभा नाही")} />}
          </PublicCard>

          <PublicCard icon={<HeartHandshake className="h-4 w-4" />} title={t("Participate / Shramdaan", "सहभाग / श्रमदान")}>
            {activities.length ? activities.map((a) => (
              <Row key={a.id} title={lang === "mr" && a.titleMr ? a.titleMr : a.title} sub={`${fmtDate(a.date)} · ${a.registeredVolunteers.length}/${a.needsVolunteers}`} badge={a.status} tone="teal" />
            )) : <Empty text={t("No open activities", "सुरू उपक्रम नाहीत")} />}
            <Link href="/login" className="mt-2 block text-center text-xs font-medium text-brand-600 hover:underline">{t("Login to register", "नोंदणीसाठी लॉगिन करा")}</Link>
          </PublicCard>

          <PublicCard icon={<Lightbulb className="h-4 w-4" />} title={t("Innovations", "नवोपक्रम")}>
            {state.innovations.slice(0, 4).map((i) => (
              <Row key={i.id} title={i.title} sub={i.outcome} />
            ))}
          </PublicCard>
        </div>

        {/* Notices */}
        <PublicCard icon={<Bell className="h-4 w-4" />} title={t("Notices", "सूचना")}>
          {state.notifications.filter((n) => n.forRoles.includes("citizen") || n.forRoles.includes("volunteer")).map((n) => (
            <Row key={n.id} title={n.title} sub={n.body} />
          ))}
        </PublicCard>
      </main>

      <footer className="border-t border-slate-200 bg-slate-900 py-6 text-center text-xs text-slate-400">
        {t(
          "Demonstration prototype for research and field validation. Not an official Government system. Contains mock/demo data.",
          "संशोधन व क्षेत्र प्रमाणीकरणासाठी प्रात्यक्षिक नमुना. अधिकृत शासकीय प्रणाली नाही. नमुना माहिती."
        )}
      </footer>
    </div>
  );
}

function Snapshot({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <Card><CardBody><div className="flex items-center justify-between"><span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span><span className="text-teal-600">{icon}</span></div><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></CardBody></Card>
  );
}
function PublicCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card><CardBody><p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="text-brand-600">{icon}</span> {title}</p><div className="space-y-1.5">{children}</div></CardBody></Card>
  );
}
function Row({ title, sub, badge, tone }: { title: string; sub?: string; badge?: string; tone?: any }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-50 py-2 last:border-0">
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{title}</p>{sub && <p className="truncate text-xs text-slate-400">{sub}</p>}</div>
      {badge && <Badge tone={tone ?? "slate"}>{badge}</Badge>}
    </div>
  );
}
function Stat({ n, l, tone }: { n: number; l: string; tone?: string }) {
  return <div><p className={`text-2xl font-bold ${tone === "red" ? "text-rose-600" : "text-slate-800"}`}>{n}</p><p className="text-xs text-slate-400">{l}</p></div>;
}
function Empty({ text }: { text: string }) {
  return <p className="py-4 text-center text-xs text-slate-400">{text}</p>;
}
