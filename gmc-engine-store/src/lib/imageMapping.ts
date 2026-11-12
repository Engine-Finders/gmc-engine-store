import fs from "fs";
import path from "path";

/**
 * The public image collection is deliberately resolved on the server. Browsers
 * cannot enumerate /public, so all filename matching happens here and only the
 * final public URL is passed to client components.
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");
const MODEL_FALLBACK = "/images/models/Modelpage_car.png";
const ENGINE_FALLBACK = "/images/listings/engine.png";

type Asset = { url: string; name: string; normalized: string; compact: string };

const ASSET_CACHE = new Map<string, Asset[]>();
const MODEL_RESULT_CACHE = new Map<string, string>();
const ENGINE_RESULT_CACHE = new Map<string, string>();

const MODEL_FOLDER_BY_BRAND: Record<string, string> = {
  audi: "Audi",
  bmw: "bmw split",
  citroen: "Citreon",
  hyundai: "Hyundai",
  jaguar: "Jaguar",
  "land-rover": "LandRover-RangeRover",
  landrover: "LandRover-RangeRover",
  mercedes: "Mercedes",
  "mercedes-benz": "Mercedes",
  mini: "Mini",
  nissan: "Nissan",
  peugeot: "Peugeot",
  renault: "Renault",
  seat: "Seat",
  suzuki: "Suzuki",
  toyota: "Toyota",
  vauxhall: "Vauxhall",
  volkswagen: "Volkswagen",
  vw: "Volkswagen",
  volvo: "Volvo",
  fiat: "Fiat",
  honda: "Honda",
  mg: "MG",
  mitsubishi: "Mitsubishi",
};

/** Explicit representative choices. The resolver still verifies that the
 * chosen model exists in the correct brand folder before returning it. */
const BRAND_REPRESENTATIVES: Record<string, string[]> = {
  "mercedes-benz-engines": ["c-class", "e-class", "a-class"],
  "bmw-engines": ["3-series", "5-series", "x5"],
  "audi-engines": ["a4", "a3", "q5"],
  "citroen-engines": ["c3", "c4", "c1"],
  "hyundai-engines": ["i30", "tucson", "kona"],
  "jaguar-engines": ["xf", "f-pace", "xe"],
  "land-rover-engines": ["range-rover", "discovery", "defender"],
  "mini-engines": ["countryman", "hatch", "clubman"],
  "nissan-engines": ["qashqai", "x-trail", "juke"],
  "peugeot-engines": ["3008", "308", "208"],
  "renault-engines": ["clio", "megane", "captur"],
  "seat-engines": ["leon", "ibiza", "ateca"],
  "suzuki-engines": ["swift", "vitara", "jimny"],
  "toyota-engines": ["rav4", "corolla", "yaris"],
  "vauxhall-engines": ["astra", "corsa", "mokka"],
  "volkswagen-engines": ["golf", "passat", "tiguan"],
  "volvo-engines": ["xc60", "xc90", "s60"],
  "fiat-engines": ["500", "panda", "tipo"],
  // Honda's old representative image was visually dated; CR-V has current
  // 2024 assets and is a better brand-level representative.
  "honda-engines": ["cr-v", "civic", "accord"],
  "mg-engines": ["mg3", "zs", "hs"],
  "mitsubishi-engines": ["outlander", "asx", "l200"],
};

/** A few slugs do not use the same wording as the asset filenames. */
const MODEL_ALIASES: Record<string, string[]> = {
  "1-series": ["1 series"],
  "2-series": ["2 series"],
  "3-series": ["3 series"],
  "4-series": ["4 series"],
  "5-series": ["5 series"],
  "6-series": ["6 series"],
  "7-series": ["7 series"],
  "8-series": ["8 series"],
  "z-series": ["z4", "z series"],
  "c4-cactus": ["c4 cactus"],
  "c5-aircross": ["c5 aircross"],
  "c3-aircross": ["c3 aircross"],
  "c3-picasso": ["c3 picasso"],
  "discovery-sport": ["discovery sport"],
  "freelander-1": ["freelander 1", "freelander"],
  "freelander-2": ["freelander 2", "freelander"],
  "range-rover-evoque": ["evoque"],
  "range-rover-sport": ["range rover sport"],
  "range-rover-velar": ["velar"],
  "slk-slc": ["slk", "slc"],
  "amg-gt": ["amg gt"],
  "santa-fe": ["santa fe"],
  "land-cruiser": ["land cruiser"],
  "id-range": ["id 4", "id 7", "id range"],
  "t-roc": ["t roc"],
  "c-hr": ["c hr", "c-hr"],
  "s-cross": ["s cross"],
  "370z": ["370 z", "370z"],
};

const ENGINE_OVERRIDES: Record<string, string[]> = {
  om651: ["/images/engines/hero-real-om651.webp", "/images/listings/engines/mercedes-om651-engine.webp"],
  om642: ["/images/engines/hero-real-om642.webp", "/images/engines/mercedes-om642-diesel-engine.webp"],
  om646: ["/images/engines/hero-real-om646.webp"],
  om654: ["/images/listings/engines/mercedes-om654-engine.webp"],
  m274: ["/images/engines/hero-real-m274.webp", "/images/listings/engines/mercedes-m274-engine-hero.webp"],
  m272: ["/images/listings/engines/mercedes-m272-engine-hero.webp"],
  m276: ["/images/listings/engines/mercedes-m276-engine-hero.webp"],
  m57: ["/images/engines/hero-real-m57.webp", "/images/listings/engines/bmw-m57-engine-hero.webp"],
  n47: ["/images/engines/hero-real-n47d20.webp", "/images/listings/engines/bmw-n47-engine-hero.webp"],
  b38: ["/images/listings/engines/bmw-b38-engine-hero.webp"],
  b47: ["/images/listings/engines/bmw-b47-engine-hero.webp"],
  b48: ["/images/listings/engines/bmw-b48-engine-hero.webp"],
  b57: ["/images/listings/engines/bmw-b57-engine-hero.webp"],
  b58: ["/images/listings/engines/bmw-b58-engine-hero.webp"],
  k9k: ["/images/engines/hero-real-k9k.webp", "/images/listings/engines/renault-k9k-dci-diesel-engine-hero.webp"],
  aj126: ["/images/engines/hero-real-aj126.webp", "/images/listings/engines/land-rover-jlr-aj126-engine-hero.webp"],
  aj133: ["/images/listings/engines/land-rover-jlr-aj133-engine-hero.webp"],
  "306dt": ["/images/engines/hero-real-306dt.webp"],
};

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compact(value: string): string {
  return normalize(value).replace(/[^a-z0-9]/g, "");
}

function pageBrandKey(brand: string): string {
  return normalize(brand.replace(/-engines$/, "")).replace(/ /g, "-");
}

function publicUrl(file: string): string {
  return `/${path.relative(PUBLIC_DIR, file).replace(/\\/g, "/")}`;
}

function modelCutoutUrl(url: string, variant?: "hero"): string {
  const variantParam = variant ? `&variant=${variant}` : "";
  return `/api/images/cutout?src=${encodeURIComponent(url)}${variantParam}`;
}

function readAssets(directory: string): Asset[] {
  const cached = ASSET_CACHE.get(directory);
  if (cached) return cached;
  try {
    const assets: Asset[] = [];
    const visit = (current: string) => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const file = path.join(current, entry.name);
        if (entry.name === ".DS_Store") continue;
        if (entry.isDirectory()) {
          visit(file);
          continue;
        }
        if (!entry.isFile()) continue;
        const n = normalize(entry.name);
        assets.push({ url: publicUrl(file), name: entry.name, normalized: n, compact: compact(entry.name) });
      }
    };
    visit(directory);
    ASSET_CACHE.set(directory, assets);
    return assets;
  } catch {
    ASSET_CACHE.set(directory, []);
    return [];
  }
}

function exists(url: string): boolean {
  return fs.existsSync(path.join(PUBLIC_DIR, url.replace(/^\//, "")));
}

function modelFolder(brand: string): string | undefined {
  const key = pageBrandKey(brand);
  return MODEL_FOLDER_BY_BRAND[key] ?? MODEL_FOLDER_BY_BRAND[key.replace(/-/g, "")];
}

function modelSearchTerms(modelSlug: string, modelName?: string): string[] {
  const key = normalize(modelSlug).replace(/ /g, "-");
  return [...new Set([modelSlug, modelName ?? "", key.replace(/-/g, " "), ...(MODEL_ALIASES[key] ?? [])].filter(Boolean).map(normalize))];
}

function viewScore(asset: Asset): number {
  if (asset.normalized.includes("45 angle front view")) return 40;
  if (asset.normalized.includes("front view")) return 30;
  if (asset.normalized.includes("flat side view")) return 20;
  if (asset.normalized.includes("back view")) return 10;
  return 0;
}

function latestYear(asset: Asset): number {
  const years = asset.name.match(/(?:19|20)\d{2}/g)?.map(Number) ?? [];
  return Math.max(0, ...years);
}

function findModelAsset(brand: string, modelSlug: string, modelName?: string, preferLatest = false): string | undefined {
  const cacheKey = `${pageBrandKey(brand)}|${modelSlug}|${modelName ?? ""}|${preferLatest ? "latest" : "stable"}`;
  const cached = MODEL_RESULT_CACHE.get(cacheKey);
  if (cached) return cached === MODEL_FALLBACK ? undefined : cached;
  const folder = modelFolder(brand);
  if (!folder) {
    MODEL_RESULT_CACHE.set(cacheKey, MODEL_FALLBACK);
    return undefined;
  }
  const files = readAssets(path.join(PUBLIC_DIR, "images", "models", folder)).filter((asset) =>
    /(?:45 angle front view|front view|flat side view|back view)/.test(asset.normalized),
  );
  const terms = modelSearchTerms(modelSlug, modelName);
  const candidates = files
    .map((asset) => {
      let matchScore = 0;
      for (const term of terms) {
        if (asset.normalized.includes(term)) matchScore = Math.max(matchScore, 200 + term.length * 3);
        const tokens = term.split(" ").filter((token) => token.length > 1);
        if (tokens.length > 1 && tokens.every((token) => asset.normalized.includes(token))) matchScore = Math.max(matchScore, 120 + tokens.length * 4);
      }
      return { asset, matchScore, viewScore: viewScore(asset), year: latestYear(asset), duplicate: asset.name.includes("(1)") ? 1 : 0 };
    })
    .filter((item) => item.matchScore > 0)
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        (preferLatest ? b.year - a.year : 0) ||
        b.viewScore - a.viewScore ||
        a.duplicate - b.duplicate ||
        a.asset.url.localeCompare(b.asset.url),
    );
  const result = candidates[0]?.asset.url;
  MODEL_RESULT_CACHE.set(cacheKey, result ?? MODEL_FALLBACK);
  return result;
}

export function modelImageFor(brand: string, modelSlug: string, modelName?: string, variant: "default" | "hero" = "default"): string {
  return modelCutoutUrl(
    findModelAsset(brand, modelSlug, modelName) ?? MODEL_FALLBACK,
    variant === "hero" ? "hero" : undefined,
  );
}

export function brandImageFor(brand: string, variant: "default" | "hero" = "default"): string {
  const brandKey = pageBrandKey(brand);
  const hints = BRAND_REPRESENTATIVES[brandKey] ?? BRAND_REPRESENTATIVES[`${brandKey}-engines`] ?? [];
  for (const hint of hints) {
    const image = findModelAsset(brandKey, hint, hint, true);
    if (image) return modelCutoutUrl(image, variant === "hero" ? "hero" : undefined);
  }

  // A brand page can exist before a model page is authored. In that case use
  // the first deterministic 45-degree asset from that brand folder only.
  const folder = modelFolder(brandKey);
  if (folder) {
    const first = readAssets(path.join(PUBLIC_DIR, "images", "models", folder))
      .filter((asset) => asset.normalized.includes("45 angle front view"))
      .sort((a, b) => latestYear(b) - latestYear(a) || a.url.localeCompare(b.url))[0];
    if (first) return modelCutoutUrl(first.url, variant === "hero" ? "hero" : undefined);
  }
  return modelCutoutUrl(MODEL_FALLBACK, variant === "hero" ? "hero" : undefined);
}

function engineKeys(identifier: string): string[] {
  const value = normalize(identifier);
  const parts = value.split(" ").filter(Boolean);
  const codes = parts.filter((part) => /[a-z]/.test(part) && /\d/.test(part));
  const compactValue = compact(identifier);
  return [...new Set([value, compactValue, ...parts, ...codes, ...codes.map((code) => code.replace(/^(om|m|b|n|aj|ea|dv|k|r)/, "$1"))])];
}

const GENERIC_ENGINE_TOKENS = new Set(["v6", "v8", "v10", "v12", "tdi", "fsi", "tfsi", "tsi", "cdi", "dci", "hdi", "mpi", "gdi", "crdi", "cdti"]);

// The engine archive also contains editorial/model artwork. Those files live
// beside real engine cutouts, so a loose code or brand match can otherwise put
// a vehicle photo inside an engine card.
const NON_ENGINE_ASSET_PATTERN = /(vehicle|model[- ]?hero|generation|reliability|common[- ]?problems|application[- ]?(?:vehicle|identification)|ownership|identification|badge|history|dossier|route|question|request|versus|comparison|model[- ]?year)/;

function isLikelyEngineAsset(asset: Asset): boolean {
  if (NON_ENGINE_ASSET_PATTERN.test(asset.normalized)) return false;
  if (asset.url.includes("/images/listings/engines/")) return true;
  return /(engine|motor|powertrain|hero[- ]?real|^hero[- ]|^fe[- ]|^pop[- ])/i.test(asset.normalized);
}

function assetMatchesTerm(asset: Asset, term: string): boolean {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return false;
  const normalizedPath = normalize(asset.url);
  const pathTokens = normalizedPath.split(" ").filter(Boolean);
  return normalizedTerm.includes(" ") ? normalizedPath.includes(normalizedTerm) : pathTokens.includes(normalizedTerm);
}

function engineAssets(): Asset[] {
  const cached = ASSET_CACHE.get("__engine-assets__");
  if (cached) return cached;
  const assets = [
    ...readAssets(path.join(PUBLIC_DIR, "images", "engines")),
    ...readAssets(path.join(PUBLIC_DIR, "images", "listings", "engines")),
  ];
  ASSET_CACHE.set("__engine-assets__", assets);
  return assets;
}

function engineBrandTerms(brand?: string): string[] {
  if (!brand) return [];
  const key = pageBrandKey(brand);
  const aliases: Record<string, string[]> = {
    volkswagen: ["volkswagen", "vw"],
    "land-rover": ["land rover", "landrover"],
    "mercedes-benz": ["mercedes", "mercedes benz"],
  };
  return [...new Set([
    key,
    key.replace(/-/g, ""),
    key.split("-")[0],
    ...(aliases[key] ?? []),
  ].filter(Boolean).map(normalize))];
}

function brandEngineFallbacks(brand?: string): string[] {
  const key = pageBrandKey(brand ?? "");
  const names = key === "mercedes-benz"
    ? ["mercedes"]
    : key === "land-rover"
      ? ["land-rover", "range-rover"]
      : [key];
  return [...new Set(names.flatMap((name) => [1, 2, 3].map((variant) => `/images/engines/${name}-engine-${variant}.webp`)))].filter(exists);
}

function stableIndex(value: string, length: number): number {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return length ? hash % length : 0;
}

function findEngineAsset(identifier: string, brand?: string): string | undefined {
  const cacheKey = `${normalize(identifier)}|${brand ?? ""}`;
  const cached = ENGINE_RESULT_CACHE.get(cacheKey);
  if (cached) return cached === ENGINE_FALLBACK ? undefined : cached;
  const keys = engineKeys(identifier);
  // Do not use trim/configuration words such as V10 or TDI as engine IDs. A
  // generic V10 asset (for example a Dodge Viper image) must never be selected
  // for an Audi or Mercedes card just because its title contains "V10".
  const primaryKeys = keys.filter((key) => /[a-z]/.test(key) && /\d/.test(key) && key.length >= 3 && !GENERIC_ENGINE_TOKENS.has(key));
  const overrideKeys = primaryKeys.map(compact);
  for (const key of overrideKeys) {
    const override = ENGINE_OVERRIDES[key]?.find(exists);
    if (override) {
      ENGINE_RESULT_CACHE.set(cacheKey, override);
      return override;
    }
  }

  const brandTerms = engineBrandTerms(brand);
  const candidates = engineAssets()
    .filter(isLikelyEngineAsset)
    .map((asset) => {
      const codeMatch = primaryKeys.some((key) => asset.normalized.split(" ").includes(normalize(key)));
      if (!codeMatch) return { asset, score: -1 };
      let score = 100;
      if (asset.url.includes("/images/engines/hero-real-")) score += 50;
      else if (asset.url.includes("/images/listings/engines/")) score += 40;
      else if (asset.url.includes("/images/engines/hero-")) score += 30;
      else if (asset.url.includes("/images/engines/fe-")) score += 20;
      else if (asset.url.includes("/images/engines/pop-")) score += 10;
      if (brandTerms.some((term) => assetMatchesTerm(asset, term))) score += 20;
      return { asset, score };
    })
    .filter((item) => item.score >= 100)
    .sort((a, b) => b.score - a.score || a.asset.url.localeCompare(b.asset.url));
  const result = candidates[0]?.asset.url;
  if (result) {
    ENGINE_RESULT_CACHE.set(cacheKey, result);
    return result;
  }

  // If there is no code-specific asset yet, keep the card relevant to its brand
  // instead of falling back to the old generic/Mercedes engine image. This is
  // especially important for extracted brand and model feature cards whose
  // listing image may not have the engine code in its filename.
  const brandFallback = brandEngineFallbacks(brand)[stableIndex(identifier, brandEngineFallbacks(brand).length)]
    ?? engineAssets()
    .filter(isLikelyEngineAsset)
    .filter((asset) => brandTerms.some((term) => assetMatchesTerm(asset, term)))
    .map((asset) => {
      let score = 0;
      if (asset.url.includes("/images/listings/engines/")) score += 100;
      if (asset.normalized.includes("engine")) score += 25;
      if (asset.normalized.includes("hero")) score += 10;
      if (brandTerms.some((term) => assetMatchesTerm(asset, term))) score += 20;
      return { asset, score };
    })
    .sort((a, b) => b.score - a.score || a.asset.url.localeCompare(b.asset.url))[0]?.asset.url;
  const fallback = brandFallback ?? ENGINE_FALLBACK;
  ENGINE_RESULT_CACHE.set(cacheKey, fallback);
  return brandFallback;
}

export function engineImageFor(identifier: string, brand?: string): string {
  return findEngineAsset(identifier, brand) ?? ENGINE_FALLBACK;
}

function slugify(value: string): string {
  return normalize(value).replace(/ /g, "-");
}

function modelFromHref(href: unknown, fallbackName: string): string {
  if (typeof href === "string") {
    const parts = href.split(/[?#]/)[0].split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] !== "engines") return parts[1];
  }
  return slugify(fallbackName);
}

function engineFromHref(href: unknown): string {
  if (typeof href !== "string") return "";
  const parts = href.split(/[?#]/)[0].split("/").filter(Boolean);
  const engines = parts.indexOf("engines");
  return engines >= 0 ? parts[engines + 1] ?? "" : "";
}

function cardIdentifier(card: Record<string, unknown>): string {
  const hrefEngine = engineFromHref(card.buyHref ?? card.href);
  return String(
    card.code ??
      card.engineCode ??
      card.engineSlug ??
      card.slug ??
      (hrefEngine || card.id || card.title || card.name || ""),
  );
}

function engineCards<T extends Record<string, unknown>>(cards: T[] | undefined, brand?: string): T[] | undefined {
  return cards?.map((card) => ({ ...card, image: engineImageFor(cardIdentifier(card), brand) }));
}

export function resolveBrandImages<T extends Record<string, any>>(data: T, brandSlug: string): T {
  const brand = data.hero?.brand ?? brandSlug;
  const representative = brandImageFor(brandSlug);
  const heroRepresentative = brandImageFor(brandSlug, "hero");
  const firstFamilyCode = data.engineFamilies?.families?.[0]?.code ?? data.hero?.cards?.[0]?.code ?? brand;
  return {
    ...data,
    hero: {
      ...data.hero,
      carImage: heroRepresentative,
      cards: engineCards(data.hero?.cards, brand),
    },
    featuredEngines: {
      ...data.featuredEngines,
      engines: engineCards(data.featuredEngines?.engines, brand),
    },
    shopByModel: {
      ...data.shopByModel,
      models: data.shopByModel?.models?.map((model: Record<string, unknown>) => ({
        ...model,
        image: modelImageFor(brandSlug, modelFromHref(model.href, String(model.name ?? "")), String(model.name ?? "")),
      })),
    },
    engineFamilies: {
      ...data.engineFamilies,
      image: engineImageFor(firstFamilyCode, brand),
    },
    priceGuide: {
      ...data.priceGuide,
      image: engineImageFor(firstFamilyCode, brand),
    },
    about: { ...data.about, carImage: representative },
    cta: { ...data.cta, carImage: heroRepresentative },
  } as T;
}

export function resolveModelImages<T extends Record<string, any>>(data: T, brandSlug: string, modelSlug: string): T {
  const brand = data.hero?.brand ?? brandSlug;
  const modelImage = modelImageFor(brandSlug, modelSlug, data.hero?.model);
  const heroModelImage = modelImageFor(brandSlug, modelSlug, data.hero?.model, "hero");
  return {
    ...data,
    hero: {
      ...data.hero,
      carImage: heroModelImage,
      carImageLight: heroModelImage,
      cards: engineCards(data.hero?.cards, brand),
    },
    featured: {
      ...data.featured,
      engines: engineCards(data.featured?.engines, brand),
    },
    priceGuide: {
      ...data.priceGuide,
      generations: data.priceGuide?.generations?.map((generation: Record<string, unknown>) => ({ ...generation, image: modelImage })),
    },
    generations: {
      ...data.generations,
      items: data.generations?.items?.map((generation: Record<string, unknown>) => ({ ...generation, image: modelImage })),
    },
    cta: { ...data.cta, image: modelImage },
  } as T;
}

export function resolveHubImages<T extends Record<string, any>>(data: T, engineSlug: string): T {
  const engineImage = engineImageFor(engineSlug, data.hero?.brand);
  return {
    ...data,
    hero: { ...data.hero, heroImage: engineImage, heroImageLight: engineImage },
    applications: {
      ...data.applications,
      units: data.applications?.units?.map((unit: Record<string, unknown>) => ({ ...unit, image: engineImage })),
    },
  } as T;
}

export function resolveListingImages<T extends Record<string, any>>(data: T, engineSlug: string): T {
  const engineImage = engineImageFor(engineSlug);
  return {
    ...data,
    hero: {
      ...data.hero,
      gallery: data.hero?.gallery?.map((item: Record<string, unknown>) =>
        item.kind === "engine" ? { ...item, src: engineImage, thumb: engineImage, trimmed: false } : item,
      ),
    },
    about: { ...data.about, image: engineImage, trimmed: false },
  } as T;
}

export function resolveEngineCollection<T extends Record<string, any>>(data: T, brand?: string): T {
  return { ...data, engines: engineCards(data.engines, brand) } as T;
}

export function resolveBrandCollection<T extends Record<string, any>>(data: T): T {
  return {
    ...data,
    brands: data.brands?.map((brand: Record<string, unknown>) => ({
      ...brand,
      car: brandImageFor(String(brand.href ?? brand.name ?? "").split("/").filter(Boolean)[0] || slugify(String(brand.name ?? ""))),
    })),
  } as T;
}
