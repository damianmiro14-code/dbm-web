"use client";

/**
 * Sensitive quote/WhatsApp drafts survive navigation in this tab only.
 * Older persistent drafts are erased, never migrated to another long-lived store.
 */
const PREFIX = "p202a:";
function isOldKey(key: string): boolean {
  return key === "dbm_quote_draft_v1" ||
    key.startsWith("dbm_quick_draft:") || key.startsWith("dbm_spec_draft:");
}
export function purgeLegacyDrafts(): void {
  if (typeof window === "undefined") return;
  for (const area of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[area];
      const remove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && isOldKey(key)) remove.push(key);
      }
      for (const key of remove) storage.removeItem(key);
    } catch { /* storage unavailable: no fallback to persistent storage */ }
  }
}
export function sessionDraftGet(key: string): string | null {
  purgeLegacyDrafts();
  try { return window.sessionStorage.getItem(PREFIX + key); } catch { return null; }
}
export function sessionDraftSet(key: string, value: string): void {
  purgeLegacyDrafts();
  try { window.sessionStorage.setItem(PREFIX + key, value); } catch { /* not persisted */ }
}
export function sessionDraftRemove(key: string): void {
  purgeLegacyDrafts();
  try { window.sessionStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
}
