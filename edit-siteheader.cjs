const fs = require("fs");

const file = "components/SiteHeader.tsx";
let s = fs.readFileSync(file, "utf8");

// 1) Insertar state mobileServicesOpen tras menuOpen
if (!s.includes("mobileServicesOpen")) {
  const needle = "const [menuOpen, setMenuOpen] = useState(false);";
  const idx = s.indexOf(needle);
  if (idx === -1) {
    console.error("NO ENCONTRADO:", needle);
    process.exit(1);
  }
  const insert = needle + "\n  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);";
  s = s.slice(0, idx) + insert + s.slice(idx + needle.length);
}

// 2) Reset al cambiar ruta: insertar tras setMenuOpen(false);
if (!s.includes("setMobileServicesOpen(false);")) {
  const needle = "setMenuOpen(false);";
  const idx = s.indexOf(needle);
  if (idx === -1) {
    console.error("NO ENCONTRADO:", needle);
    process.exit(1);
  }
  const insert = needle + "\n    setMobileServicesOpen(false);";
  s = s.slice(0, idx) + insert + s.slice(idx + needle.length);
}

fs.writeFileSync(file, s, "utf8");
console.log("OK editado:", file);
