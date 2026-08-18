"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/services/store";
import { useLang } from "@/components/ui/common";
import { CloudOff, RefreshCw } from "lucide-react";

/**
 * Offline demo indicator + local sync. Because there is no backend, "sync" means
 * marking queued local mutations SYNCED_DEMO when the app is active again.
 */
export function OfflineIndicator() {
  const { state, syncOfflineQueue } = useStore();
  const [offline, setOffline] = useState(false);
  const [reconnected, setReconnected] = useState(false);
  const { t } = useLang();
  const pending = (state.offlineQueue ?? []).filter((m) => m.status === "SYNC_PENDING").length;

  useEffect(() => {
    const on = () => {
      setOffline(false);
      syncOfflineQueue();
      setReconnected(true);
      setTimeout(() => setReconnected(false), 5000);
    };
    const off = () => setOffline(true);
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [syncOfflineQueue]);

  if (offline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-white">
        <CloudOff className="h-3.5 w-3.5" /> {t("Offline Demo Mode — local changes continue.", "ऑफलाइन डेमो — स्थानिक बदल सुरू राहतील.")}
        {pending > 0 && <span className="rounded-full bg-white/25 px-2 py-0.5">{pending} {t("Pending Local Sync", "स्थानिक सिंक बाकी")}</span>}
      </div>
    );
  }
  if (reconnected) {
    return (
      <div className="flex items-center justify-center gap-2 bg-teal-600 px-4 py-1.5 text-xs font-medium text-white">
        <RefreshCw className="h-3.5 w-3.5" /> {t("Back online — local demo changes synced to the local demo store only (no Government server).", "पुन्हा ऑनलाइन — स्थानिक डेमो स्टोअरमध्ये सिंक.")}
      </div>
    );
  }
  return null;
}
