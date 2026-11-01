import fs from "fs";
import path from "path";
import brandPage from "@/data/brandPage.json";
import modelPage from "@/data/modelPage.json";
import hubPage from "@/data/hubPage.json";
import listingPage from "@/data/listingPage.json";
import { STATIC_FALLBACK, STATIC_PAGES, brandSlugFor } from "./slugs";

/**
 * Internal link resolver: every internal link on the site goes somewhere real, never to a 404.
 *
 * Links in the data JSON are written as the INTENDED URL (e.g. /engines/om642, /mercedes-benz-engines/e-class,
 * /audi-engines). At render time resolveHref() keeps a link whose page exists and otherwise sends it to the
 * nearest page that does:
 *
 *   /engines/<engine>/<app>   listing -> best-matching listing of that engine -> engine hub
 *   /engines/<engine>         hub -> best listing of that engine (a "-w204" style suffix picks the chassis)
 *                             -> the brand page that lists this engine -> home "featured engines"
 *   /<brand>-engines/<model>  model page -> hub of the engine that has most listings for the model
 *                             -> a listing for the model -> brand page ("shop by model") -> home brands
 *   /<brand>-engines          brand page -> home "shop by brand"
 *   anything in STATIC_FALLBACK (src/lib/slugs.ts) -> its stand-in
 *
 * Because it is worked out from the JSON on every build, a link starts pointing at the real page as soon as
 * that page's JSON is added. Never hand-edit a link to a fallback target: keep the intended URL in the data.
 * Check the whole site with scripts/check_links.py.
 */

const TWO_PART = /^\/?([^/]+)\/([^/]+)$/;

const brands = new Set(Object.keys(brandPage));
const hubs = new Set(Object.keys(hubPage));
const models = new Set((Object.values(modelPage) as { brandSlug: string; slug: string }[]).map((m) => `${m.brandSlug}/${m.slug}`));

/* ---------------------------------------------------------------- listings */

let listingIndex: Map<string, string[]> | null = null;

/** engine folder -> application slugs (extracted files plus the hand-built pages). */
function listings(): Map<string, string[]> {
  if (listingIndex) return listingIndex;
  const idx = new Map<string, string[]>();
  const dir = path.join(process.cwd(), "src", "data", "listings");
  try {
    for (const engine of fs.readdirSync(dir)) {
      try {
        const apps = fs
          .readdirSync(path.join(dir, engine))
          .filter((f) => f.endsWith(".json"))
          .map((f) => f.slice(0, -5));
        if (apps.length) idx.set(engine, apps.sort());
      } catch {
        /* not a folder */
      }
    }
  } catch {
    /* no extracted listings */
  }
  for (const d of Object.values(listingPage) as { engineSlug: string; applicationSlug: string }[]) {
    idx.set(d.engineSlug, [...(idx.get(d.engineSlug) ?? []), d.applicationSlug]);
  }
  listingIndex = idx;
  return idx;
}

/* ---------------------------------------------- engine -> brand (from brand pages) */

let engineBrand: Map<string, string> | null = null;

/** Engine codes each brand page links to (e.g. /engines/om642 on the Mercedes page -> om642 is Mercedes). */
function brandOfEngine(engine: string): string | undefined {
  if (!engineBrand) {
    engineBrand = new Map();
    for (const [slug, page] of Object.entries(brandPage)) {
      for (const m of JSON.stringify(page).matchAll(/"\/engines\/([a-z0-9-]+)/g)) {
        for (const base of bases(m[1])) if (!engineBrand.has(base)) engineBrand.set(base, slug);
      }
    }
  }
  for (const base of bases(engine)) {
    const b = engineBrand.get(base);
    if (b) return b;
  }
  return undefined;
}

/* ------------------------------------------------------------------ helpers */

const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/** "om642-w906" -> ["om642-w906", "om642"]: the engine code with any chassis suffix dropped. */
function bases(engine: string): string[] {
  const parts = engine.split("-");
  const out: string[] = [];
  for (let n = parts.length; n >= 1; n--) out.push(parts.slice(0, n).join("-"));
  return out;
}

/** Listing folders for an engine code: "m57" matches "m57", "bmw-m57", "bmw-m57-recon". */
function foldersFor(engine: string): string[] {
  const exact = [...listings().keys()].filter(
    (f) => f === engine || f === `${engine}-recon` || f.endsWith(`-${engine}`) || f.endsWith(`-${engine}-recon`),
  );
  if (exact.length) return exact;
  // a longer variant code: "n47d20" -> the "n47" folder
  return [...listings().keys()].filter((f) => f.length >= 3 && !f.includes("-") && engine.startsWith(f));
}

/**
 * Best listing in the folders. Hint words (from the link itself, e.g. "w204") decide; context words (the brand
 * and model of the page the link is on) break ties, then used before recon, then the shortest slug.
 */
function bestListing(folders: string[], hint: string[], context: string[] = []): { href: string; score: number } | null {
  const apps = folders.flatMap((f) => (listings().get(f) ?? []).map((app) => ({ f, app, words: new Set(tokens(app)) })));
  // words every listing of the engine shares (brand name, engine code) say nothing about which one fits
  const useful = (ws: string[]) => ws.filter((w) => apps.some((a) => !a.words.has(w)));
  const h = useful(hint);
  const c = useful(context);
  let best: { href: string; score: number; rank: number; recon: boolean; len: number } | null = null;
  for (const { f, app, words } of apps) {
    const score = h.filter((w) => words.has(w)).length;
    const rank = score * 100 + c.filter((w) => words.has(w)).length;
    const recon = f.endsWith("-recon") || app.includes("-recon");
    const cand = { href: `/engines/${f}/${app}`, score, rank, recon, len: app.length };
    if (
      !best ||
      cand.rank > best.rank ||
      (cand.rank === best.rank && Number(cand.recon) < Number(best.recon)) ||
      (cand.rank === best.rank && cand.recon === best.recon && cand.len < best.len)
    ) {
      best = cand;
    }
  }
  return best && { href: best.href, score: best.score };
}

/** Brand prefixes listing slugs use for a brand page: mercedes-benz-engines -> mercedes-benz, mercedes, mercedesbenz. */
function listingPrefixes(brandSlug: string): string[] {
  const base = brandSlug.replace(/-engines$/, "");
  return [...new Set([base, base.split("-")[0], base.replace(/-/g, "")])];
}

/** Model slug and its parts: "vito-v-class" -> vito-v-class, vito, v-class, vito-v, class. */
function modelVariants(model: string): string[] {
  const parts = model.split("-");
  const out = [model];
  for (let i = 1; i < parts.length; i++) out.push(parts.slice(0, i).join("-"), parts.slice(i).join("-"));
  return [...new Set(out)];
}

/* ------------------------------------------------------------------ resolvers */

function resolveBrand(slug: string): string {
  for (const c of [slug, `${slug}-engines`, brandSlugFor(slug)]) if (brands.has(c)) return `/${c}`;
  return STATIC_FALLBACK["/brands"];
}

function resolveModel(brandSlug: string, model: string): string {
  const brandHref = brands.has(brandSlug) ? `/${brandSlug}` : resolveBrand(brandSlug);
  if (model === "models") return brands.has(brandSlug) ? `${brandHref}#shop-by-model` : brandHref;

  // listings of this model, grouped by engine
  const starts = listingPrefixes(brandSlug).flatMap((p) => modelVariants(model).map((v) => `${p}-${v}-`));
  const byEngine = new Map<string, string[]>();
  for (const [engine, apps] of listings()) {
    const hits = apps.filter((a) => starts.some((s) => a.startsWith(s)));
    if (hits.length) byEngine.set(engine, hits);
  }
  if (byEngine.size) {
    const ranked = [...byEngine.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    const withHub = ranked.find(([engine]) => hubs.has(engine.replace(/-recon$/, "")));
    if (withHub) return `/engines/${withHub[0].replace(/-recon$/, "")}`;
    const [engine, apps] = ranked[0];
    return `/engines/${engine}/${apps.sort((a, b) => a.length - b.length)[0]}`;
  }
  return brands.has(brandSlug) ? `${brandHref}#shop-by-model` : brandHref;
}

/** Hub pages that cover several codes ("om612-om647", "m177-m178"), keyed by each of their codes. */
const hubAlias = new Map<string, string>();
for (const key of hubs) {
  const parts = key.split("-").filter((p) => /\d/.test(p) && p.length >= 3);
  if (parts.length > 1) for (const p of parts) if (!hubs.has(p) && !hubAlias.has(p)) hubAlias.set(p, key);
}

function resolveEngine(engine: string | undefined, app: string | undefined, context: string[]): string {
  if (!engine) return STATIC_FALLBACK["/engines"];
  const alias = hubAlias.get(engine);
  if (alias && !app) return `/engines/${alias}`;
  // no page context (e.g. the home page): use the brand whose page lists this engine
  const brand = brandOfEngine(engine);
  const ctx = context.length ? context : brand ? listingPrefixes(brand) : [];
  for (const base of bases(engine)) {
    const hint = [...tokens(engine.slice(base.length)), ...tokens(app ?? "")];
    const folders = foldersFor(base);
    if (hubs.has(base)) {
      const pick = hint.length ? bestListing(folders, hint, ctx) : null;
      return pick && pick.score > 0 ? pick.href : `/engines/${base}`;
    }
    const pick = folders.length ? bestListing(folders, hint, ctx) : null;
    if (pick) return pick.href;
  }
  return brand ? `/${brand}` : STATIC_FALLBACK["/engines"];
}

/* ------------------------------------------------------------------ exports */

/** Does this path (no query or hash) have a real page? */
export function pageExists(p: string): boolean {
  const pathOnly = p === "/" ? p : p.replace(/\/+$/, "");
  if (STATIC_PAGES.has(pathOnly)) return true;
  const seg = pathOnly.split("/").filter(Boolean);
  if (seg[0] === "engines") {
    if (seg.length === 2) return hubs.has(seg[1]);
    if (seg.length === 3) return (listings().get(seg[1]) ?? []).includes(seg[2]);
    return false;
  }
  if (seg.length === 1) return brands.has(seg[0]);
  if (seg.length === 2) return models.has(`${seg[0]}/${seg[1]}`);
  return false;
}

/**
 * The href to render for an intended internal link (external, hash-only and mailto/tel links pass through).
 * context: words describing the page the link is on (brand, model) - only used to break ties between listings.
 */
export function resolveHref(href: string, context: string[] = []): string {
  if (!href || !href.startsWith("/") || href.startsWith("//")) return href;
  const rawPath = href.match(/^[^?#]*/)?.[0] ?? "";
  const p = rawPath === "" || rawPath === "/" ? "/" : rawPath.replace(/\/+$/, "");
  if (pageExists(p)) return href;
  if (STATIC_FALLBACK[p]) return STATIC_FALLBACK[p];

  const seg = p.split("/").filter(Boolean);
  if (seg[0] === "guides") return STATIC_FALLBACK["/guides"];
  if (seg[0] === "engines") return resolveEngine(seg[1], seg[2], context);
  if (seg.length === 1) return resolveBrand(seg[0]);
  const two = p.match(TWO_PART);
  if (two) return resolveModel(two[1], two[2]);
  return "/";
}

/** Context words for a brand (and model) page: ("Mercedes-Benz", "c-class") -> mercedes, benz, mercedesbenz, c, class. */
export function pageContext(brand: string, model = ""): string[] {
  return [...new Set([...listingPrefixes(brandSlugFor(brand)).flatMap(tokens), ...tokens(model)])];
}

/** Deep copy of page data with every "*href" / "*Href" string resolved. */
export function resolveLinks<T>(data: T, context: string[] = []): T {
  const walk = (v: unknown, key = ""): unknown => {
    if (Array.isArray(v)) return v.map((x) => walk(x));
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, walk(x, k)]));
    }
    if (typeof v === "string" && /href$/i.test(key)) return resolveHref(v, context);
    return v;
  };
  return walk(data) as T;
}
