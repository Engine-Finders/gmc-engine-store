import fs from "fs";
import path from "path";
import listingPage from "@/data/listingPage.json";
import defaults from "@/data/listingDefaults.json";
import { hubSlugs } from "@/lib/hub";

/**
 * Listing pages come from two places:
 *  - src/data/listingPage.json      hand-built, fully written pages (keyed <engine>-<application>)
 *  - src/data/listings/<engine>/<application>.json   slim files written by
 *    scripts/md_to_listingpage.py from the listing markdown export
 *
 * A slim file only holds what the markdown says; everything shared (trust badges,
 * warranty copy, button labels ...) is merged in from listingDefaults.json here, so
 * ~6,000 pages don't each carry their own copy of it.
 */

export type GalleryItem = {
  src: string;
  /** alpha-trimmed version for the thumbnail rail (engine PNGs only) */
  thumb?: string;
  /** "engine" = transparent cut-out, shown on the podium; "photo" = full-frame photo */
  kind: "engine" | "photo";
  /** alpha-trimmed engine photo (no built-in padding) - sized differently on the podium */
  trimmed?: boolean;
};

export type SpecCard = { icon: string; value: string; label: string; pos: { top: number; left: number; rotate: number } };

export type ListingPageData = {
  engineSlug: string;
  applicationSlug: string;
  seo: { title: string; description: string; canonical: string };
  breadcrumb: { label: string; href: string }[];
  hero: {
    warrantyBadge: string;
    sku: string;
    title: string;
    subtitle: string;
    options: { id: string; label: string; note: string; price: string; default?: boolean }[];
    warrantyNote: string;
    stockLabel: string;
    addToBasketText: string;
    checkCompatibilityText: string;
    regCheck: { countryFlag: string; placeholder: string; buttonText: string };
    fitmentNote: string;
    podiumImage: string;
    gallery: GalleryItem[];
    specCards: SpecCard[];
    trustBadges: { icon: string; title: string; subtitle: string }[];
  };
  about: { title: string; image: string; trimmed?: boolean; paragraphs: string[] };
  included: { title: string; includedTitle: string; included: string[]; excludedTitle: string; excluded: string[] };
  compatible: {
    title: string;
    intro: string;
    linkText?: string;
    linkHref?: string;
    /** hand-built pages carry a table ... */
    columns?: string[];
    rows?: { variant: string; chassis: string; body: string; years: string; power: string; turbo: string }[];
    /** ... extracted pages carry the markdown's plain fits-list */
    list?: string[];
    note?: string;
  };
  warranty: { title: string; paragraphs: string[] };
  otherApplications?: {
    title: string;
    items: { label: string; href: string }[];
    footerLinkText?: string;
    footerLinkHref?: string;
  };
  whyBuy: { title: string; items: string[] };
  faqs?: { title: string; items: { q: string; a: string }[] };
  cta?: { line: string; crossLink: string; crossHref: string; buyButton: string };
};

type Slim = {
  brand: string;
  brandName: string;
  engineSlug: string;
  applicationSlug: string;
  engineCode: string;
  condition: "used" | "recon";
  seo: ListingPageData["seo"];
  hero: {
    title: string;
    subtitle: string;
    sku: string;
    options: ListingPageData["hero"]["options"];
    stockLabel: string;
    imgAlt: string;
    specCards: { icon: string; value: string; label: string }[];
    gallery: GalleryItem[];
  };
  fits: { intro: string; list: string[] };
  included: { included: string[]; excluded: string[] };
  cta: { line: string; crossLink: string };
};

const LISTINGS_DIR = path.join(process.cwd(), "src", "data", "listings");

/* ------------------------------------------------------------------ helpers */

/** Floating spec-card slots: two columns, rows spread by how many cards there are. */
// (the prev/next arrows sit at ~54% height, so a 2-row layout keeps its lower row below them)
const ROW_TOPS: Record<number, number[]> = { 1: [20], 2: [10, 66], 3: [6, 33, 62] };

function placeSpecCards(cards: { icon: string; value: string; label: string }[]): SpecCard[] {
  const rows = Math.min(3, Math.max(1, Math.ceil(cards.length / 2)));
  const tops = ROW_TOPS[rows];
  return cards.slice(0, 6).map((c, i) => {
    const right = i % 2 === 1;
    const row = Math.floor(i / 2);
    const mid = rows === 3 && row === 1;
    return {
      ...c,
      pos: {
        top: tops[row],
        left: right ? (mid ? 78 : 75) : mid ? 0 : 3,
        rotate: (right ? 1 : -1) * (mid ? 3 : 4),
      },
    };
  });
}

function shortLabel(title: string): string {
  const i = title.search(/\s[—–-]\s/);
  return (i > -1 ? title.slice(i + 3) : title).trim();
}

function fill(t: string, v: Record<string, string>): string {
  return t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
}

function listDir(engineSlug: string): string[] {
  try {
    return fs.readdirSync(path.join(LISTINGS_DIR, engineSlug)).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
}

function readSlim(engineSlug: string, applicationSlug: string): Slim | undefined {
  try {
    return JSON.parse(fs.readFileSync(path.join(LISTINGS_DIR, engineSlug, `${applicationSlug}.json`), "utf8"));
  } catch {
    return undefined;
  }
}

/** A few sibling listings of the same engine, nearest-by-name first. */
function siblings(engineSlug: string, applicationSlug: string, n = 4) {
  const files = listDir(engineSlug).map((f) => f.replace(/\.json$/, ""));
  const at = Math.max(0, files.indexOf(applicationSlug));
  const near = files
    .map((f, i) => ({ f, d: Math.abs(i - at) }))
    .filter((x) => x.f !== applicationSlug)
    .sort((a, b) => a.d - b.d)
    .slice(0, n);
  return near
    .map(({ f }) => {
      const s = readSlim(engineSlug, f);
      return s ? { label: s.fits.list[0] ?? shortLabel(s.hero.title), href: `/engines/${engineSlug}/${f}` } : null;
    })
    .filter((x): x is { label: string; href: string } => x !== null);
}

/* --------------------------------------------------------------------- merge */

function fromSlim(s: Slim): ListingPageData {
  const hub = hubSlugs.includes(s.engineSlug);
  const hubHref = hub ? `/engines/${s.engineSlug}` : "";
  const gallery: GalleryItem[] = s.hero.gallery.length
    ? s.hero.gallery.map((g) => ({ ...g, trimmed: g.src.startsWith("/images/listings/engines/") }))
    : [{ src: "/images/listings/engine.png", thumb: "/images/listings/engine_trim.png", kind: "engine" }];
  const engineItem = gallery.find((g) => g.kind === "engine" && g.trimmed);
  const engineImg = engineItem?.src ?? defaults.aboutFallbackImage;
  const subtitle = s.hero.subtitle || s.fits.list[0] || "";
  const others = siblings(s.engineSlug, s.applicationSlug);
  const recon = s.condition === "recon";
  const vars = {
    brand: s.brandName,
    code: s.engineCode,
    vehicle: shortLabel(s.hero.title),
    sku: s.hero.sku.replace(/^SKU:\s*/i, ""),
    fits: s.fits.list.join("; "),
  };
  const f = defaults.faqs;
  const hist = recon ? f.historyRecon : f.historyUsed;

  return {
    engineSlug: s.engineSlug,
    applicationSlug: s.applicationSlug,
    seo: s.seo,
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Engines", href: "/engines" },
      { label: `${s.brandName} Engines`, href: "" },
      { label: `${s.engineCode} Engine`, href: hubHref },
      { label: shortLabel(s.hero.title), href: "" },
    ],
    hero: {
      warrantyBadge: defaults.warrantyBadge,
      sku: s.hero.sku,
      title: s.hero.title,
      subtitle,
      options: s.hero.options,
      warrantyNote: defaults.warrantyNote,
      stockLabel: s.hero.stockLabel,
      addToBasketText: defaults.addToBasketText,
      checkCompatibilityText: defaults.checkCompatibilityText,
      regCheck: defaults.regCheck,
      fitmentNote: defaults.fitmentNote,
      podiumImage: defaults.podiumImage,
      gallery,
      specCards: placeSpecCards(s.hero.specCards),
      trustBadges: defaults.trustBadges,
    },
    // the markdown has no "about" copy or FAQs: both come from the hand-built page, as templates
    about: {
      title: defaults.about.title,
      image: engineImg,
      trimmed: Boolean(engineItem),
      paragraphs: [defaults.about.intro, recon ? defaults.about.recon : defaults.about.used].map((t) => fill(t, vars)),
    },
    included: { ...defaults.included, included: s.included.included, excluded: s.included.excluded },
    compatible: {
      title: defaults.compatible.title,
      intro: s.fits.intro,
      ...(hub ? { linkText: `${s.engineCode} engine guide.`, linkHref: hubHref } : {}),
      list: s.fits.list,
    },
    warranty: defaults.warranty,
    otherApplications: others.length
      ? {
          title: `${defaults.otherApplications.titlePrefix} ${s.engineCode} ${defaults.otherApplications.titleSuffix}`,
          items: others,
          ...(hub
            ? {
                footerLinkText: defaults.otherApplications.footerLinkText.replace("{code}", s.engineCode),
                footerLinkHref: hubHref,
              }
            : {}),
        }
      : undefined,
    whyBuy: defaults.whyBuy,
    faqs: {
      title: fill(f.title, vars),
      items: [f.fit, f.refund, hist].map((x) => ({ q: fill(x.q, vars), a: fill(x.a, vars) })),
    },
    cta: {
      line: s.cta.line,
      crossLink: s.cta.crossLink || `← Back to all ${s.engineCode} engines`,
      crossHref: hubHref || "/engines",
      buyButton: defaults.buyButton,
    },
  };
}

/** Hand-built pages keep their text; only the gallery is normalised to the new shape. */
function fromLegacy(d: (typeof listingPage)[keyof typeof listingPage]): ListingPageData {
  const h = d.hero;
  const gallery: GalleryItem[] = h.gallery.map((src, i) => ({ src, thumb: h.thumbnails?.[i], kind: "engine" }));
  return { ...(d as unknown as ListingPageData), hero: { ...(h as unknown as ListingPageData["hero"]), gallery } };
}

/* ------------------------------------------------------------------- exports */

/** Routes are /engines/<engineSlug>/<applicationSlug>. */
export function getListingData(engineSlug: string, applicationSlug: string): ListingPageData | undefined {
  const hand = (listingPage as Record<string, (typeof listingPage)[keyof typeof listingPage]>)[`${engineSlug}-${applicationSlug}`];
  if (hand) return fromLegacy(hand);
  const slim = readSlim(engineSlug, applicationSlug);
  return slim ? fromSlim(slim) : undefined;
}

/** Hand-built pages plus every extracted file. */
export function listingParams() {
  const out: { engineSlug: string; applicationSlug: string }[] = Object.values(listingPage).map((d) => ({
    engineSlug: d.engineSlug,
    applicationSlug: d.applicationSlug,
  }));
  try {
    for (const engine of fs.readdirSync(LISTINGS_DIR)) {
      for (const f of listDir(engine)) out.push({ engineSlug: engine, applicationSlug: f.replace(/\.json$/, "") });
    }
  } catch {
    /* no extracted listings yet */
  }
  return out;
}
