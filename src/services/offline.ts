// Pure offline-queue helpers shared by the store and the access-test suite.
import { OfflineMutation } from "@/types";

/** A mutation is queued for local demo sync only when the browser is offline. */
export const shouldQueue = (online: boolean) => !online;

/** Local "sync": mark all SYNC_PENDING entries as SYNCED_DEMO (no server). */
export function syncQueue(queue: OfflineMutation[]): OfflineMutation[] {
  return queue.map((m) => (m.status === "SYNC_PENDING" ? { ...m, status: "SYNCED_DEMO" } : m));
}

export function makeOfflineMutation(
  meta: Omit<OfflineMutation, "id" | "createdAt" | "status">,
  id: string,
  createdAt: string
): OfflineMutation {
  return { ...meta, id, createdAt, status: "SYNC_PENDING" };
}
