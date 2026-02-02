"use client";

/**
 * Storage helpers that gracefully fall back to sessionStorage when localStorage
 * is unavailable (e.g., some iOS Safari private modes) or throws.
 */

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function tryLocal<T>(fn: (s: Storage) => T): T | null {
  if (!hasWindow()) return null;
  try {
    return fn(window.localStorage);
  } catch {
    return null;
  }
}

function trySession<T>(fn: (s: Storage) => T): T | null {
  if (!hasWindow()) return null;
  try {
    return fn(window.sessionStorage);
  } catch {
    return null;
  }
}

export function storageGet(key: string): string | null {
  const a = tryLocal((s) => s.getItem(key));
  if (a !== null) return a;
  return trySession((s) => s.getItem(key));
}

export function storageSet(key: string, value: string): void {
  const ok = tryLocal((s) => {
    s.setItem(key, value);
    return true;
  });
  if (ok) return;
  trySession((s) => {
    s.setItem(key, value);
    return true;
  });
}

export function storageRemove(key: string): void {
  const ok = tryLocal((s) => {
    s.removeItem(key);
    return true;
  });
  if (ok) return;
  trySession((s) => {
    s.removeItem(key);
    return true;
  });
}
