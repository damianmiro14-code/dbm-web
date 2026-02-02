import { rmSync } from "node:fs";

/**
 * Clean install artifacts to fix native/SWC mismatch issues on Windows.
 *
 * Run:
 *   npm run clean
 *   npm install
 */
for (const target of ["node_modules", ".next", "package-lock.json"]) {
  try {
    rmSync(target, { recursive: true, force: true });
  } catch {
    // ignore
  }
}
