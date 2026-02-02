import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envLocal = path.join(root, ".env.local");
const envExample = path.join(root, ".env.example");

try {
  if (fs.existsSync(envLocal)) process.exit(0);
  if (!fs.existsSync(envExample)) process.exit(0);

  fs.copyFileSync(envExample, envLocal);
  // Keep output minimal (Windows-friendly).
  console.log("Created .env.local from .env.example. Update ADMIN_PASSWORD before using /admin.");
} catch (err) {
  // Do not fail install.
  console.warn("Postinstall: could not create .env.local:", err?.message ?? String(err));
}
