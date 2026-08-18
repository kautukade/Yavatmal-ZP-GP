"use client";

import { useState } from "react";
import { useAuth, useStore } from "@/services/store";
import { Badge, Button, Modal, Select, Textarea } from "@/components/ui/primitives";
import { gpById } from "@/data/hierarchy";
import { BlockerCategory, ObligationStatus } from "@/types";
import { AlertTriangle, Mic, MicOff } from "lucide-react";

const DEMO_TRANSCRIPTS = [
  "Pilot GP A madhla handpump electricity approval mule pending aahe.",
  "Drain cleaning kaam पूर्ण झाले aahe, evidence upload keli.",
  "Water tank repair साठी fund अजून उपलब्ध नाही.",
];

function parse(text: string): { status: ObligationStatus; blocker?: BlockerCategory; note: string } {
  const t = text.toLowerCase();
  let status: ObligationStatus = "IN_PROGRESS";
  let blocker: BlockerCategory | undefined;
  if (/(pending|blocked|अडथळा|नाही|awaiting)/.test(t)) status = "BLOCKED";
  if (/(पूर्ण|complete|done|झाले)/.test(t)) status = "COMPLETED";
  if (/(electricity|power|वीज|transformer)/.test(t)) blocker = "Other Department Pending";
  else if (/(fund|निधी|payment)/.test(t)) blocker = "Fund Release Pending";
  else if (/(technical|तांत्रिक|sanction|approval)/.test(t)) blocker = "Technical Sanction Pending";
  else if (status === "BLOCKED") blocker = "Other";
  return { status, blocker, note: text };
}

export function VoiceNote({ trigger }: { trigger?: (open: () => void) => React.ReactNode }) {
  const { user, addObligation, addAudit, pushNotification } = useStore();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [simulated, setSimulated] = useState(false);

  const start = () => {
    setTranscript("");
    const SR = (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) as any;
    if (!SR) { simulate(); return; }
    try {
      const rec = new SR();
      rec.lang = "mr-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setListening(true);
      rec.onresult = (e: any) => { setTranscript(e.results[0][0].transcript); setListening(false); };
      rec.onerror = () => { setListening(false); simulate(); };
      rec.onend = () => setListening(false);
      rec.start();
    } catch { simulate(); }
  };

  const simulate = () => {
    setSimulated(true);
    setListening(true);
    setTimeout(() => {
      const idx = Math.floor((Date.now() / 1000) % DEMO_TRANSCRIPTS.length);
      setTranscript(DEMO_TRANSCRIPTS[idx]);
      setListening(false);
    }, 1200);
  };

  const parsed = transcript ? parse(transcript) : null;

  const confirm = () => {
    if (!user || !parsed) return;
    const id = `OBL-VN-${Math.floor(Math.random() * 900 + 100)}`;
    addObligation({
      id, title: `Voice-reported status — ${parsed.status.replace(/_/g, " ")}`, description: `Recorded via Aawaj Nond: "${parsed.note}"`,
      sourceType: "Internal Review Decision", source: { system: "Internal Order", referenceId: `VOICE/${id}`, date: new Date().toISOString() },
      scope: "gp", districtId: "d-yvt", blockId: user.blockId ?? "b-yavatmal", gpId: user.gpId ?? "gp-borgaon", departmentId: "dept-panchayat",
      responsibleRole: "gram_sevak", assignedUserId: user.id, createdOn: new Date().toISOString(), dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      priority: parsed.status === "BLOCKED" ? "HIGH" : "MEDIUM", status: parsed.status,
      blockers: parsed.blocker ? [{ id: `blk-${Date.now()}`, category: parsed.blocker, note: parsed.note, raisedBy: user.name, raisedOn: new Date().toISOString() }] : [],
      lastActivity: new Date().toISOString(), evidence: [], escalationLevel: parsed.status === "BLOCKED" ? 1 : 0, classification: "INTERNAL",
      timeline: [{ id: `tl-${Date.now()}`, ts: new Date().toISOString(), actor: user.name, actorRole: user.role, action: "Created from voice note (confirmed)", toStatus: parsed.status }],
    });
    addAudit({ actor: user.name, actorRole: user.role, action: "Confirmed voice note → obligation", entity: "Obligation", entityId: id, toStatus: parsed.status });
    if (parsed.blocker) pushNotification({ type: "blocker_escalated", title: "Blocker (voice-reported)", body: `${parsed.blocker} at ${gpById(user.gpId)?.name}`, forRoles: ["bdo", "extension_officer"], gpId: user.gpId, link: "/app/pathpurava" });
    reset();
  };

  const reset = () => { setOpen(false); setTranscript(""); setSimulated(false); setListening(false); };

  return (
    <>
      {trigger ? trigger(() => setOpen(true)) : (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Mic className="h-4 w-4" /> आवाज नोंद</Button>
      )}
      <Modal open={open} onClose={reset} title="आवाज नोंद — Voice Status (Demo)">
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5" /> Voice interpretation is a demo aid. Please verify before submission — voice never changes a record without confirmation.</div>
          <div className="flex flex-col items-center py-4">
            <button onClick={start} className={`flex h-20 w-20 items-center justify-center rounded-full ${listening ? "animate-pulse bg-rose-500" : "bg-brand-600"} text-white shadow-lg`}>
              {listening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </button>
            <p className="mt-3 text-sm text-slate-500">{listening ? "Listening…" : transcript ? "Tap to record again" : "Tap to speak (Marathi/English)"}</p>
            {simulated && <Badge tone="slate" className="mt-2">Web Speech unavailable — simulated transcript</Badge>}
          </div>
          {transcript && parsed && (
            <div className="space-y-3 rounded-xl border border-slate-200 p-3">
              <div><p className="text-xs font-semibold text-slate-500">Transcript</p><Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} /></div>
              <p className="text-xs font-semibold text-slate-500">AI-proposed interpretation (verify)</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded bg-slate-50 px-2 py-1.5"><span className="text-slate-400">Status:</span> <b>{parsed.status.replace(/_/g, " ")}</b></div>
                <div className="rounded bg-slate-50 px-2 py-1.5"><span className="text-slate-400">Blocker:</span> <b>{parsed.blocker ?? "—"}</b></div>
                <div className="col-span-2 rounded bg-slate-50 px-2 py-1.5"><span className="text-slate-400">Location:</span> <b>{gpById(user?.gpId)?.name ?? "—"}</b></div>
              </div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={reset}>Cancel</Button><Button onClick={confirm}>Confirm & Save</Button></div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
