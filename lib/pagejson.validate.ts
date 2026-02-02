import type { PageJSON, PageSection } from "@/lib/pagejson.types";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asString(v: unknown, path: string): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`Invalid string at ${path}`);
  }
  return v;
}

function asStringOpt(v: unknown): string | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "string" || v.trim().length === 0) return undefined;
  return v;
}

function asArray(v: unknown, path: string): unknown[] {
  if (!Array.isArray(v)) throw new Error(`Invalid array at ${path}`);
  return v;
}

function asStringArrayOpt(v: unknown, path: string): string[] | undefined {
  if (v === undefined) return undefined;
  const arr = asArray(v, path);
  return arr.map((item, idx) => asString(item, `${path}[${idx}]`));
}

function asNumberOpt(v: unknown): number | undefined {
  if (v === undefined) return undefined;
  if (typeof v !== "number" || Number.isNaN(v)) return undefined;
  return v;
}

function validateSection(section: unknown, idx: number): PageSection {
  if (!isObject(section)) throw new Error(`Invalid section at sections[${idx}]`);
  const type = asString(section.type, `sections[${idx}].type`) as PageSection["type"];
  const id = asString(section.id, `sections[${idx}].id`);

  switch (type) {
    case "hero": {
      const headline = asString(section.headline, `sections[${idx}].headline`);
      const subheadline = asStringOpt(section.subheadline);

      let inlineGallery:
        | { images?: string[]; seed?: string; count?: number; altPrefix?: string }
        | undefined;
      if (section.inlineGallery !== undefined) {
        if (!isObject(section.inlineGallery)) throw new Error(`Invalid inlineGallery at sections[${idx}]`);
        const images = asStringArrayOpt(section.inlineGallery.images, `sections[${idx}].inlineGallery.images`);
        const seed = section.inlineGallery.seed === undefined ? undefined : asString(section.inlineGallery.seed, `sections[${idx}].inlineGallery.seed`);
        if (!images && !seed) throw new Error(`inlineGallery must include images[] or seed at sections[${idx}]`);
        inlineGallery = {
          images,
          seed,
          count: asNumberOpt(section.inlineGallery.count),
          altPrefix: asStringOpt(section.inlineGallery.altPrefix)
        };
      }

      if (!isObject(section.primaryCta)) throw new Error(`Invalid primaryCta at sections[${idx}]`);
      const primaryCta = {
        label: asString(section.primaryCta.label, `sections[${idx}].primaryCta.label`),
        href: asString(section.primaryCta.href, `sections[${idx}].primaryCta.href`)
      };
      let secondaryCta: { label: string; href: string } | undefined;
      if (section.secondaryCta !== undefined) {
        if (!isObject(section.secondaryCta)) throw new Error(`Invalid secondaryCta at sections[${idx}]`);
        secondaryCta = {
          label: asString(section.secondaryCta.label, `sections[${idx}].secondaryCta.label`),
          href: asString(section.secondaryCta.href, `sections[${idx}].secondaryCta.href`)
        };
      }
      let highlights: string[] | undefined;
      if (section.highlights !== undefined) {
        highlights = asArray(section.highlights, `sections[${idx}].highlights`).map((x, j) =>
          asString(x, `sections[${idx}].highlights[${j}]`)
        );
      }
      return { type, id, headline, subheadline, inlineGallery, primaryCta, secondaryCta, highlights };
    }

    case "services": {
      const title = asString(section.title, `sections[${idx}].title`);
      const subtitle = asStringOpt(section.subtitle);
      const itemsRaw = asArray(section.items, `sections[${idx}].items`);
      const items = itemsRaw.map((it, j) => {
        if (!isObject(it)) throw new Error(`Invalid item at sections[${idx}].items[${j}]`);
        const title = asString(it.title, `sections[${idx}].items[${j}].title`);
        const description = asString(it.description, `sections[${idx}].items[${j}].description`);
        const href = asStringOpt(it.href);
        let tags: string[] | undefined;
        if (it.tags !== undefined) {
          tags = asArray(it.tags, `sections[${idx}].items[${j}].tags`).map((t, k) =>
            asString(t, `sections[${idx}].items[${j}].tags[${k}]`)
          );
        }
        return { title, description, tags, href };
      });
      if (items.length === 0) throw new Error(`Empty items at sections[${idx}].items`);
      return { type, id, title, subtitle, items };
    }

    case "process": {
      const title = asString(section.title, `sections[${idx}].title`);
      const stepsRaw = asArray(section.steps, `sections[${idx}].steps`);
      const steps = stepsRaw.map((st, j) => {
        if (!isObject(st)) throw new Error(`Invalid step at sections[${idx}].steps[${j}]`);
        return {
          title: asString(st.title, `sections[${idx}].steps[${j}].title`),
          description: asString(st.description, `sections[${idx}].steps[${j}].description`)
        };
      });
      if (steps.length === 0) throw new Error(`Empty steps at sections[${idx}].steps`);
      return { type, id, title, steps };
    }

    case "gallery": {
      const title = asString(section.title, `sections[${idx}].title`);
      const imagesRaw = asArray(section.images, `sections[${idx}].images`);
      const images = imagesRaw.map((im, j) => {
        if (!isObject(im)) throw new Error(`Invalid image at sections[${idx}].images[${j}]`);
        return {
          src: asString(im.src, `sections[${idx}].images[${j}].src`),
          alt: asString(im.alt, `sections[${idx}].images[${j}].alt`)
        };
      });
      if (images.length === 0) throw new Error(`Empty images at sections[${idx}].images`);
      return { type, id, title, images };
    }

    case "testimonials": {
      const title = asString(section.title, `sections[${idx}].title`);
      const itemsRaw = asArray(section.items, `sections[${idx}].items`);
      const items = itemsRaw.map((it, j) => {
        if (!isObject(it)) throw new Error(`Invalid testimonial at sections[${idx}].items[${j}]`);
        return {
          name: asString(it.name, `sections[${idx}].items[${j}].name`),
          quote: asString(it.quote, `sections[${idx}].items[${j}].quote`)
        };
      });
      if (items.length === 0) throw new Error(`Empty items at sections[${idx}].items`);
      return { type, id, title, items };
    }

    case "faq": {
      const title = asString(section.title, `sections[${idx}].title`);
      const itemsRaw = asArray(section.items, `sections[${idx}].items`);
      const items = itemsRaw.map((it, j) => {
        if (!isObject(it)) throw new Error(`Invalid faq at sections[${idx}].items[${j}]`);
        return {
          q: asString(it.q, `sections[${idx}].items[${j}].q`),
          a: asString(it.a, `sections[${idx}].items[${j}].a`)
        };
      });
      if (items.length === 0) throw new Error(`Empty items at sections[${idx}].items`);
      return { type, id, title, items };
    }

    case "contact": {
      const title = asString(section.title, `sections[${idx}].title`);
      const subtitle = asStringOpt(section.subtitle);

      let whatsapp: { phoneE164: string; defaultMessage: string } | undefined;
      if (section.whatsapp !== undefined) {
        if (!isObject(section.whatsapp)) throw new Error(`Invalid whatsapp at sections[${idx}]`);
        whatsapp = {
          phoneE164: asString(section.whatsapp.phoneE164, `sections[${idx}].whatsapp.phoneE164`),
          defaultMessage: asString(section.whatsapp.defaultMessage, `sections[${idx}].whatsapp.defaultMessage`)
        };
      }



      let socialLinks: { platform: string; label: string; href: string }[] | undefined;
      if (section.socialLinks !== undefined) {
        if (!Array.isArray(section.socialLinks)) throw new Error(`Invalid socialLinks at sections[${idx}]`);
        socialLinks = section.socialLinks.map((l: any, j: number) => {
          if (!isObject(l)) throw new Error(`Invalid socialLinks[${j}] at sections[${idx}]`);
          return {
            platform: asStringOpt(l.platform) ?? "",
            label: asString(l.label, `sections[${idx}].socialLinks[${j}].label`),
            href: asString(l.href, `sections[${idx}].socialLinks[${j}].href`)
          };
        });
      }

      if (!isObject(section.fields)) throw new Error(`Invalid fields at sections[${idx}]`);
      const fields = {
        nameLabel: asString(section.fields.nameLabel, `sections[${idx}].fields.nameLabel`),
        phoneLabel: asString(section.fields.phoneLabel, `sections[${idx}].fields.phoneLabel`),
        emailLabel: asString(section.fields.emailLabel, `sections[${idx}].fields.emailLabel`),
        messageLabel: asString(section.fields.messageLabel, `sections[${idx}].fields.messageLabel`),
        consentLabel: asString(section.fields.consentLabel, `sections[${idx}].fields.consentLabel`)
      };
      const submitLabel = asString(section.submitLabel, `sections[${idx}].submitLabel`);
      return { type, id, title, subtitle, whatsapp, socialLinks, fields, submitLabel };
    }

    default:
      throw new Error(`Unsupported section type at sections[${idx}].type`);
  }
}

export function validatePageJSON(raw: unknown): PageJSON {
  if (!isObject(raw)) throw new Error("Invalid PageJSON: not an object");
  if (!isObject(raw.meta)) throw new Error("Invalid PageJSON: missing meta");

  const meta = {
    locale: asString(raw.meta.locale, "meta.locale"),
    slug: asString(raw.meta.slug, "meta.slug"),
    title: asString(raw.meta.title, "meta.title"),
    description: asString(raw.meta.description, "meta.description"),
    ogImage: asStringOpt(raw.meta.ogImage)
  };

  let business = undefined as any;
  if (raw.business !== undefined) {
    if (!isObject(raw.business)) throw new Error("Invalid PageJSON: business must be an object");
    if (!isObject(raw.business.address)) throw new Error("Invalid PageJSON: business.address must be an object");

    business = {
      name: asString(raw.business.name, "business.name"),
      phone: asString(raw.business.phone, "business.phone"),
      email: asString(raw.business.email, "business.email"),
      address: {
        street: asString(raw.business.address.street, "business.address.street"),
        city: asString(raw.business.address.city, "business.address.city"),
        region: asString(raw.business.address.region, "business.address.region"),
        postalCode: asString(raw.business.address.postalCode, "business.address.postalCode"),
        country: asString(raw.business.address.country, "business.address.country")
      },
      areaServed: asString(raw.business.areaServed, "business.areaServed"),
      openingHours: asArray(raw.business.openingHours, "business.openingHours").map((x, i) =>
        asString(x, `business.openingHours[${i}]`)
      ),
      googleProfileUrl: asStringOpt(raw.business.googleProfileUrl),
      mapsUrl: asStringOpt(raw.business.mapsUrl)
    };
  }

  const sectionsRaw = asArray(raw.sections, "sections");
  if (sectionsRaw.length === 0) throw new Error("Invalid PageJSON: sections cannot be empty");
  const sections = sectionsRaw.map(validateSection);

  return { meta, business, sections };
}
