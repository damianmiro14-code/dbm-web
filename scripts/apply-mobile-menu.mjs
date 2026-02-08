import fs from "node:fs";

const path = "components/SiteHeader.tsx";
let s = fs.readFileSync(path, "utf8");

const marker = "{/* Mobile dropdown menu */}";
const start = s.indexOf(marker);
if (start < 0) { console.error("No marker"); process.exit(1); }

// Encuentra el fin del bloque: primera ocurrencia de ") : null}" después del marker
const end0 = s.indexOf(") : null}", start);
if (end0 < 0) { console.error("No end"); process.exit(1); }
const end = end0 + ") : null}".length;

const replacement = fs.readFileSync("scripts/_mobile_menu_replacement.txt", "utf8");

s = s.slice(0, start) + replacement + s.slice(end);

// Asegura el state
if (!s.includes("const [mobileServicesOpen, setMobileServicesOpen] = useState(false);")) {
  s = s.replace(
    "const [menuOpen, setMenuOpen] = useState(false);",
    "const [menuOpen, setMenuOpen] = useState(false);\n  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);"
  );
}

// Cierra acordeón al navegar
s = s.replace(
  "setMenuOpen(false);\n    setServicesOpen(false);",
  "setMenuOpen(false);\n    setMobileServicesOpen(false);\n    setServicesOpen(false);"
);

fs.writeFileSync(path, s, "utf8");
console.log("OK");
