import fs from "node:fs";

const path = "components/SiteHeader.tsx";
let s = fs.readFileSync(path, "utf8");

const marker = "{/* Mobile dropdown menu */}";
const start = s.indexOf(marker);
if (start < 0) { console.error("ERROR: no encuentro el marcador del menú"); process.exit(1); }

const end0 = s.indexOf(") : null}", start);
if (end0 < 0) { console.error("ERROR: no encuentro el cierre ') : null}' del menú"); process.exit(1); }
const end = end0 + ") : null}".length;

let menuBlock = s.slice(start, end);

// Sube z-index del overlay del menú (si existe z-[90]/z-[900])
menuBlock = menuBlock.replace('z-[90]"', 'z-[9000]"');
menuBlock = menuBlock.replace('z-[900]"', 'z-[9000]"');

// Quita el bloque del menú de dentro del header
s = s.slice(0, start) + s.slice(end);

// Inserta el bloque justo después de </header> (fuera del stacking context del header)
const headerClose = "</header>";
const hc = s.indexOf(headerClose);
if (hc < 0) { console.error("ERROR: no encuentro </header>"); process.exit(1); }

const insertAt = hc + headerClose.length;
s = s.slice(0, insertAt) + "\n\n        " + menuBlock + "\n" + s.slice(insertAt);

fs.writeFileSync(path, s, "utf8");
console.log("OK");
