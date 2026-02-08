import fs from "node:fs";

const path = "components/SiteHeader.tsx";
let s = fs.readFileSync(path, "utf8");

const marker = "{/* Mobile dropdown menu */}";
const start = s.indexOf(marker);
if (start < 0) { console.error("ERROR: no marker"); process.exit(1); }

const containerIdx = s.indexOf("</Container>", start);
if (containerIdx < 0) { console.error("ERROR: no </Container> after menu"); process.exit(1); }

const end0 = s.lastIndexOf(") : null}", containerIdx);
if (end0 < 0 || end0 < start) { console.error("ERROR: no menu end"); process.exit(1); }
const end = end0 + ") : null}".length;

const replacement = fs.readFileSync("scripts/_mobile_menu_replacement.txt", "utf8");

// Reemplaza TODO el bloque del menú
s = s.slice(0, start) + replacement + s.slice(end);

// Asegura state
if (!s.includes("const [mobileServicesOpen, setMobileServicesOpen] = useState(false);")) {
  s = s.replace(
    "const [menuOpen, setMenuOpen] = useState(false);",
    "const [menuOpen, setMenuOpen] = useState(false);\n  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);"
  );
}

// Cierra acordeón al navegar (inserta justo tras setMenuOpen(false); si falta)
if (!s.includes("setMobileServicesOpen(false);")) {
  s = s.replace(
    /setMenuOpen\(false\);\r?\n(\s*)setServicesOpen\(false\);/,
    "setMenuOpen(false);\n$1setMobileServicesOpen(false);\n$1setServicesOpen(false);"
  );
}

fs.writeFileSync(path, s, "utf8");
console.log("OK");
