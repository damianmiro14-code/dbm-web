import { promises as fs } from "fs";
import path from "path";

const IMAGE_EXT_RE = /\.(jpe?g|png|webp)$/i;

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listImages(dir) {
  if (!(await exists(dir))) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE_EXT_RE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, "es"));
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function readJson(p) {
  const txt = await fs.readFile(p, "utf8");
  return JSON.parse(txt);
}

async function writeJson(p, obj) {
  const txt = JSON.stringify(obj, null, 2) + "\n";
  await fs.writeFile(p, txt, "utf8");
}

function pickAltFromPage(page, i) {
  const hero = Array.isArray(page?.sections) ? page.sections.find((s) => s?.type === "hero") : null;
  const base = (hero && typeof hero.headline === "string" && hero.headline.trim())
    ? hero.headline.trim()
    : (typeof page?.meta?.title === "string" ? page.meta.title : "DBM");
  return `${base} — foto ${i}`;
}

async function main() {
  const packPathRaw = process.argv[2];
  if (!packPathRaw) {
    console.error("Uso: node scripts/import-photo-pack.mjs <ruta-a-PACK-FOTOS>");
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const packPath = path.resolve(packPathRaw);

  // 1) HERO
  {
    const heroDir = path.join(packPath, "hero");
    const heroImgs = await listImages(heroDir);
    if (heroImgs.length) {
      const src = path.join(heroDir, heroImgs[0]);
      const ext = path.extname(heroImgs[0]).toLowerCase();
      const dest = path.join(projectRoot, "public", "images", "hero", `inicio-escalera-azul${ext}`);
      await copyFile(src, dest);
      console.log(`✅ Hero copiado: ${path.relative(projectRoot, dest)}`);
    } else {
      console.log("ℹ️ Hero: no se encontraron imágenes en PACK-FOTOS/hero");
    }
  }

  // 2) SERVICIOS (3 fotos por servicio -> gallery section)
  {
    const servicesDir = path.join(packPath, "servicios");
    if (await exists(servicesDir)) {
      const serviceFolders = (await fs.readdir(servicesDir, { withFileTypes: true }))
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort((a, b) => a.localeCompare(b, "es"));

      for (const slug of serviceFolders) {
        const folder = path.join(servicesDir, slug);
        const imgs = await listImages(folder);
        if (!imgs.length) continue;

        const jsonPath = path.join(projectRoot, "content", "es", "services", `${slug}.json`);
        if (!(await exists(jsonPath))) {
          console.log(`⚠️ Servicio sin JSON: ${slug} (no existe ${path.relative(projectRoot, jsonPath)})`);
          continue;
        }

        const page = await readJson(jsonPath);
        const picked = imgs.slice(0, 3);
        const publicPaths = [];

        for (let i = 0; i < picked.length; i++) {
          const name = picked[i];
          const ext = path.extname(name).toLowerCase();
          const dest = path.join(projectRoot, "public", "images", "services", slug, `${String(i + 1).padStart(2, "0")}${ext}`);
          await copyFile(path.join(folder, name), dest);
          publicPaths.push(`/images/services/${slug}/${path.basename(dest)}`);
        }

        if (!Array.isArray(page.sections)) page.sections = [];
        let gallery = page.sections.find((s) => s?.type === "gallery");
        if (!gallery) {
          gallery = {
            type: "gallery",
            id: "galeria",
            title: "Trabajos relacionados",
            images: []
          };
          page.sections.push(gallery);
        }

        gallery.images = publicPaths.map((src, idx) => ({ src, alt: pickAltFromPage(page, idx + 1) }));

        await writeJson(jsonPath, page);
        console.log(`✅ Servicio actualizado: ${slug} (${publicPaths.length} fotos)`);
      }
    } else {
      console.log("ℹ️ Servicios: no existe PACK-FOTOS/servicios");
    }
  }

  // 3) TRABAJOS (9 o 12 fotos -> /trabajos hero inlineGallery)
  {
    const worksDir = path.join(packPath, "trabajos");
    const imgs = await listImages(worksDir);
    if (imgs.length) {
      const picked = imgs.slice(0, 12); // admite 9 o 12; si hay 12 las usa.

      const publicPaths = [];
      for (let i = 0; i < picked.length; i++) {
        const name = picked[i];
        const ext = path.extname(name).toLowerCase();
        const dest = path.join(projectRoot, "public", "images", "trabajos", "featured", `${String(i + 1).padStart(2, "0")}${ext}`);
        await copyFile(path.join(worksDir, name), dest);
        publicPaths.push(`/images/trabajos/featured/${path.basename(dest)}`);
      }

      const trabajosPath = path.join(projectRoot, "content", "es", "trabajos.json");
      if (await exists(trabajosPath)) {
        const page = await readJson(trabajosPath);
        if (!Array.isArray(page.sections)) page.sections = [];
        let hero = page.sections.find((s) => s?.type === "hero");
        if (!hero) {
          hero = { type: "hero", id: "hero", headline: "Trabajos", primaryCta: { label: "Pedir presupuesto", href: "#contacto" } };
          page.sections.unshift(hero);
        }
        hero.inlineGallery = hero.inlineGallery ?? {};
        hero.inlineGallery.images = publicPaths;
        hero.inlineGallery.count = publicPaths.length;
        hero.inlineGallery.altPrefix = hero.inlineGallery.altPrefix ?? "Trabajos";

        await writeJson(trabajosPath, page);
        console.log(`✅ /trabajos actualizado: ${publicPaths.length} fotos`);
      } else {
        console.log("⚠️ No existe content/es/trabajos.json");
      }
    } else {
      console.log("ℹ️ Trabajos: no se encontraron imágenes en PACK-FOTOS/trabajos");
    }
  }

  console.log("\nListo. Si algo quedó sin actualizar, revisa los avisos ⚠️.");
}

main().catch((e) => {
  console.error("\n❌ Error:", e);
  process.exit(1);
});
