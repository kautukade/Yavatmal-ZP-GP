"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/primitives";
import { Evidence } from "@/types";
import { Camera, FileText, Upload, X } from "lucide-react";

/**
 * Demo evidence picker: real file selection + preview + metadata.
 * Small images are kept as base64 in the demo store (browser only).
 */
export function EvidencePicker({ onAdd, byName, byRole }: { onAdd: (e: Evidence) => void; byName: string; byRole: any }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ name: string; size: number; type: string; dataUrl?: string } | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const IMG_MAX = 2 * 1024 * 1024; // 2 MB
  const PDF_MAX = 5 * 1024 * 1024; // 5 MB
  // Only images small enough for localStorage are persisted as a data URL.
  const PERSIST_MAX = 700_000;

  const pick = (file: File) => {
    setError("");
    const isImg = file.type.startsWith("image/");
    const isPdf = file.type.includes("pdf");
    if (isImg && file.size > IMG_MAX) { setError("Image too large for local demo storage (max 2 MB)."); return; }
    if (isPdf && file.size > PDF_MAX) { setError("PDF too large for local demo storage (max 5 MB)."); return; }
    if (isImg && file.size <= PERSIST_MAX) {
      const reader = new FileReader();
      reader.onload = () => setPreview({ name: file.name, size: file.size, type: file.type, dataUrl: reader.result as string });
      reader.readAsDataURL(file);
    } else {
      setPreview({ name: file.name, size: file.size, type: file.type });
    }
  };

  const add = () => {
    if (!preview) return;
    const persisted = !!preview.dataUrl;
    onAdd({
      id: `ev-${Date.now()}`,
      name: preview.name,
      type: preview.type.startsWith("image/") ? "photo" : preview.type.includes("pdf") ? "document" : "note",
      uploadedBy: byName,
      uploadedOn: new Date().toISOString(),
      note: note || `${(preview.size / 1024).toFixed(0)} KB · ${preview.type || "file"}`,
      dataUrl: preview.dataUrl,
      size: preview.size,
      mimeType: preview.type,
      storageMode: persisted ? "LOCAL_DEMO" : "METADATA_ONLY",
    });
    setPreview(null); setNote("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-3">
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
      {!preview ? (
        <div>
          <button onClick={() => inputRef.current?.click()} className="flex w-full items-center justify-center gap-2 py-2 text-xs text-slate-500 hover:text-brand-600">
            <Upload className="h-4 w-4" /> Select image or PDF (stored locally in demo browser only)
          </button>
          {error && <p className="text-center text-xs text-rose-600">{error}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {preview.dataUrl ? <img src={preview.dataUrl} alt="preview" className="h-14 w-14 rounded object-cover ring-1 ring-slate-200" /> : <div className="flex h-14 w-14 items-center justify-center rounded bg-slate-100"><FileText className="h-6 w-6 text-slate-400" /></div>}
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-700">{preview.name}</p><p className="text-xs text-slate-400">{(preview.size / 1024).toFixed(0)} KB · {preview.type || "file"} · {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p></div>
            <button onClick={() => setPreview(null)} className="rounded p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)…" className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs" />
          <Button size="sm" className="w-full" onClick={add}><Camera className="h-4 w-4" /> Attach Evidence</Button>
        </div>
      )}
    </div>
  );
}
