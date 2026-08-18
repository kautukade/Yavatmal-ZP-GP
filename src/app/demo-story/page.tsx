"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/store";
import { ROLES } from "@/data/roles";
import { RoleId } from "@/types";
import { Badge, Button, Card, CardBody } from "@/components/ui/primitives";
import { DemoBadge } from "@/components/ui/common";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Play, RotateCcw, Sparkles } from "lucide-react";

interface Step { role: RoleId; action: string; detail: string; path: string; level: string }
interface Story { title: string; subtitle: string; steps: Step[] }

const STORIES: Story[] = [
  {
    title: "Story 1 — A broken handpump travels the hierarchy",
    subtitle: "The same issue, seen differently at every level. This single workflow proves the platform's value.",
    steps: [
      { role: "citizen", action: "Sees the public village page", detail: "Open the public portal — village snapshot, readiness, decisions, asset status.", path: "/public", level: "Public" },
      { role: "vwsc_member", action: "Reports handpump HP-018 not working", detail: "NIGAA → QR Asset Check → HP-018 → mark NON-FUNCTIONAL. A repair ticket is auto-created.", path: "/app/nigaa", level: "Village" },
      { role: "gram_sevak", action: "Receives the issue & assigns the JE", detail: "The failure appears on the Gram Sevak dashboard. Open the repair ticket, assign to the Junior Engineer.", path: "/app/nigaa", level: "GP" },
      { role: "je", action: "Inspects & repairs", detail: "JE marks Inspected → Start Repair → Claim Complete, then sends for verification.", path: "/app/nigaa", level: "GP" },
      { role: "bdo", action: "Sees a block exception", detail: "The BDO command centre lists the GP's non-functional water asset under exceptions.", path: "/app", level: "Block" },
      { role: "dyceo_panchayat", action: "Sees the systemic pattern", detail: "District command aggregates similar failures as a systemic bottleneck.", path: "/app", level: "Deputy CEO" },
      { role: "gram_sevak", action: "Verifies the repair closure", detail: "A different officer verifies the claimed repair (self-verify blocked for high priority). Asset returns FUNCTIONAL.", path: "/app/nigaa", level: "GP" },
      { role: "citizen", action: "Sees updated readiness", detail: "Public portal shows the asset restored — no separate reporting needed.", path: "/public", level: "Public" },
      { role: "ceo", action: "Sees improved outcome", detail: "CEO strategic screen: asset functionality and outcome figures improve (baseline vs current).", path: "/app", level: "CEO" },
    ],
  },
  {
    title: "Story 2 — A Government circular becomes tracked action",
    subtitle: "GR → PATHPURAVA → Gram Sevak → blocker → BDO → Deputy CEO → CEO.",
    steps: [
      { role: "extension_officer", action: "Selects a Government circular", detail: "PATHPURAVA → Aadesh-te-Kruti. A pre-monsoon circular loads for simulated AI extraction.", path: "/app/pathpurava", level: "Block" },
      { role: "extension_officer", action: "Approves AI-suggested obligations", detail: "Approve suggestions like 'complete pre-monsoon inspection by 15 May'. Obligations are created.", path: "/app/pathpurava", level: "Block" },
      { role: "gram_sevak", action: "Marks BLOCKED — Technical Sanction", detail: "Open the obligation and report a blocker: Technical Sanction Pending.", path: "/app/pathpurava", level: "GP" },
      { role: "bdo", action: "Sees the blocker", detail: "Block command shows it in the blocker-category chart.", path: "/app", level: "Block" },
      { role: "dyceo_panchayat", action: "Sees it across many GPs", detail: "ADTHALA: 'X obligations across Y GPs waiting for Technical Sanction.'", path: "/app/pathpurava", level: "Deputy CEO" },
      { role: "ceo", action: "Sees one strategic exception", detail: "CEO screen surfaces it in 'five things to know today'.", path: "/app", level: "CEO" },
    ],
  },
  {
    title: "Story 3 — Community participation",
    subtitle: "Approved activity → citizen joins → verified → aggregates update — no personal data upward.",
    steps: [
      { role: "gram_sevak", action: "Publishes an approved activity", detail: "The GP publishes the Village Pond Cleaning drive in Shramsankalp.", path: "/app/participation", level: "GP" },
      { role: "citizen", action: "Opens the public portal", detail: "Citizen sees the open activity and its needs on the public portal.", path: "/public", level: "Public" },
      { role: "volunteer", action: "Registers volunteer interest", detail: "Open Participation → activity → register with a contribution type & availability.", path: "/app/participation", level: "Public" },
      { role: "gram_sevak", action: "Validates participation", detail: "The organiser marks the activity completed and verifies hours.", path: "/app/participation", level: "GP" },
      { role: "bdo", action: "Sees participation summary", detail: "The block sees participation counts — not personal data.", path: "/app", level: "Block" },
      { role: "dyceo_panchayat", action: "Sees district participation aggregate", detail: "District command shows aggregate participation.", path: "/app", level: "Deputy CEO" },
      { role: "ceo", action: "Sees the outcome", detail: "CEO sees participation as an outcome indicator — no individual data.", path: "/app", level: "CEO" },
    ],
  },
  {
    title: "Story 4 — Complaint routing",
    subtitle: "Citizen complaint → classified & routed → resolved → public status.",
    steps: [
      { role: "citizen", action: "Files a streetlight complaint", detail: "Complaint Routing → New Complaint → 'Streetlight not working'. The engine suggests an authority.", path: "/app/complaint-routing", level: "Public" },
      { role: "gram_sevak", action: "Accepts & routes", detail: "The GP accepts the complaint and routes it to the responsible desk.", path: "/app/complaint-routing", level: "GP" },
      { role: "je", action: "Resolves the issue", detail: "The technical user progresses and resolves the complaint.", path: "/app/complaint-routing", level: "GP" },
      { role: "bdo", action: "Sees ageing only if delayed", detail: "The BDO sees complaint exceptions only when they age.", path: "/app", level: "Block" },
      { role: "citizen", action: "Sees resolved status", detail: "The public/citizen view shows the resolved status.", path: "/app/complaint-routing", level: "Public" },
    ],
  },
];

const HIERARCHY = ["Public", "Village", "GP", "Block", "Deputy CEO", "CEO"];

export default function DemoStory() {
  const [storyIdx, setStoryIdx] = useState(0);
  const [step, setStep] = useState(0);
  const { loginAs } = useAuth();
  const router = useRouter();
  const current = STORIES[storyIdx];
  const s = current.steps[step];

  const act = () => { loginAs(s.role); router.push(s.path); };
  const selectStory = (i: number) => { setStoryIdx(i); setStep(0); };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-teal-600 text-sm font-bold text-white">ZP</div><p className="text-sm font-bold text-slate-800">Presentation Mode</p></Link>
          <div className="flex items-center gap-2"><Badge tone="violet">Demo Role Switcher</Badge><DemoBadge /></div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {STORIES.map((st, i) => (
            <button key={i} onClick={() => selectStory(i)} className={`rounded-lg px-3 py-2 text-xs font-medium ${storyIdx === i ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{`Story ${i + 1}`}</button>
          ))}
        </div>

        <div className="mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-teal-600" /><h1 className="text-xl font-bold text-slate-900">{current.title}</h1></div>
        <p className="mb-5 text-sm text-slate-500">{current.subtitle}</p>

        {/* Hierarchy visual with current level highlighted */}
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          {HIERARCHY.map((h, i) => (
            <span key={h} className="flex items-center gap-1.5">
              <span className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${s.level === h ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>{h}</span>
              {i < HIERARCHY.length - 1 && <span className="text-slate-300">→</span>}
            </span>
          ))}
        </div>

        {/* Step progress */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {current.steps.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`h-2 min-w-[20px] flex-1 rounded-full transition-colors ${i === step ? "bg-brand-600" : i < step ? "bg-teal-400" : "bg-slate-200"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${storyIdx}-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">{step + 1}</span>
                  <div><Badge tone="blue">{ROLES[s.role].name}</Badge><p className="mt-1 text-lg font-bold text-slate-900">{s.action}</p></div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{s.detail}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={act}><Play className="h-4 w-4" /> Login as {ROLES[s.role].name} & open</Button>
                  <Button variant="outline" onClick={() => router.push(s.path)}><ExternalLink className="h-4 w-4" /> Open Module</Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((x) => Math.max(0, x - 1))}><ArrowLeft className="h-4 w-4" /> Previous</Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Step {step + 1} / {current.steps.length}</span>
            <Button variant="ghost" size="sm" onClick={() => setStep(0)}><RotateCcw className="h-3.5 w-3.5" /> Reset Story</Button>
          </div>
          <Button disabled={step === current.steps.length - 1} onClick={() => setStep((x) => Math.min(current.steps.length - 1, x + 1))}>Next <ArrowRight className="h-4 w-4" /></Button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">Tip: use the floating <b>View as Role</b> button inside the app to switch roles live and watch the same record (e.g. HP-018) appear differently at each level.</p>
      </main>
    </div>
  );
}
