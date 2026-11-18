import brandPage from "@/data/brandPage.json";
import hubPage from "@/data/hubPage.json";
import { pageContext, resolveLinks } from "@/lib/links";
import { resolveBrandImages } from "@/lib/imageMapping";

// Types are inferred straight from the JSON so new pages/sections stay dynamic.
export type BrandPageData = (typeof brandPage)[keyof typeof brandPage];

export const brandSlugs = Object.keys(brandPage);

type AnyRecord = Record<string, any>;
type HubPrice = { used?: string; recon?: string };

// The supplied *-UPDATED.md handover files explicitly mark these brand
// prices as Request A Quote (or suppress numeric values). Keep that content
// authoritative for these pages. Brands without an updated handover keep the
// existing catalogue-backed price resolution below.
const UPDATED_CONTENT_PRICE_ROWS: Record<string, string[]> = {
  audi: ["EA888", "EA189", "EA288", "EA211", "EA837", "3.0 TDI V6", "EA113", "4.0 TFSI V8", "4.2 FSI V8", "EA111"],
  bmw: ["N47 (2.0d)", "M57 (3.0d)", "N20 (2.0T)", "N57 (3.0d)", "M54 (2.5/3.0)", "N52 (2.5/3.0)", "B47 (2.0d)", "B48 (2.0T)"],
  fiat: ["FIRE", "1.4 T-Jet", "0.9 TwinAir", "1.3 Multijet", "1.6 Multijet", "2.3 Multijet"],
  honda: ["L15B7", "P10A", "K20C", "L15 / L13", "R18 / R20", "LEB / LFA", "N16 / N22"],
  hyundai: ["Gamma 1.4/1.6 petrol", "R-series 2.0/2.2 CRDi", "Smartstream 1.5 T-GDI", "Smartstream 1.6 T-GDI", "U-II 1.6 CRDi", "Kappa 1.0/1.2 petrol", "Nu 1.8/2.0 petrol"],
  landrover: ["306DT / SDV6 3.0 V6 diesel", "Puma 2.4 TDCi", "Ingenium 2.0 diesel", "276DT 2.7 V6 diesel", "Freelander 2 2.2 diesel", "Td5 2.5 diesel", "Ingenium 3.0 diesel", "5.0 V8 petrol", "448PN 4.4 V8 petrol", "306PS 3.0 V6 supercharged petrol", "37L 3.9 V8 petrol"],
  mercedesbenz: ["OM651", "OM642", "M271", "OM646", "M272", "OM654", "M276", "M274 family"],
  mg: ["SAIC 1.5", "SAIC 1.0 turbo", "K-Series 1.4 / 1.6 / 1.8", "KV6", "BMW M47 diesel reference", "Other supported MG family"],
  mini: ["B37 1.5 diesel", "B38 1.5 petrol", "B47 2.0 diesel", "B48 2.0 petrol", "Prince N14/N18 1.6 turbo petrol", "Other supported MINI family"],
  mitsubishi: ["4N15", "4N14", "4B11", "4B12", "4D56", "4M41", "4B40"],
  nissan: ["YD25DDTi", "HR16DE", "VQ35/37", "MR16DDT", "MR20DD", "K9K", "R9M", "Energy TCe / H5Bt", "VR38DETT"],
  peugeot: ["DV6/DV5 1.6 diesel", "PureTech EB2/EB2F", "DW10 2.0 diesel", "Prince/EP6 1.6 THP", "1.6 HDi (DV6)"],
  renault: ["K9K 1.5 dCi", "R9M 1.6 dCi", "M9T 2.3 dCi biturbo", "Energy TCe", "SCe 1.0"],
};

const UPDATED_CONTENT_QUOTE_ONLY = new Set([
  ...Object.keys(UPDATED_CONTENT_PRICE_ROWS),
  "citroen",
  "seat",
  "suzuki",
  "toyota",
  "vauxhall",
  "volkswagen",
  "volvo",
]);

function compact(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function priceAmount(value: unknown): number | undefined {
  const match = String(value ?? "").match(/£\s*([\d,]+(?:\.\d+)?)/);
  if (!match) return undefined;
  const amount = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function lowestPrice(values: unknown[]): string | undefined {
  return values
    .map((value) => ({ value: String(value ?? "").trim(), amount: priceAmount(value) }))
    .filter((item): item is { value: string; amount: number } => item.amount !== undefined)
    .sort((a, b) => a.amount - b.amount)[0]?.value;
}

function hubBrandMatches(brand: string, hubBrand: unknown): boolean {
  const pageBrand = compact(brand);
  const sourceBrand = compact(String(hubBrand ?? ""));
  if (!pageBrand || !sourceBrand) return false;
  if (pageBrand === sourceBrand || pageBrand.includes(sourceBrand) || sourceBrand.includes(pageBrand)) return true;
  return (pageBrand === "volkswagen" && sourceBrand === "vw") || (pageBrand === "mercedesbenz" && sourceBrand === "mercedes");
}

function identifierTerms(identifier: string): string[] {
  const raw = String(identifier);
  return [...new Set([raw, ...raw.split(/[^a-z0-9]+/i)].map(compact).filter((term) => term.length >= 3))];
}

function hubPricing(identifier: string, brand: string): HubPrice | undefined {
  const query = compact(identifier);
  if (!query) return undefined;

  const candidates = Object.entries(hubPage as Record<string, AnyRecord>)
    .map(([key, hub]) => {
      const keyValue = compact(key);
      const titleValue = compact(`${key} ${hub.hero?.titleLead ?? ""}`);
      const terms = identifierTerms(identifier);
      let score = 0;
      if (query === keyValue) score = 320;
      else if (keyValue.includes(query) || query.includes(keyValue)) score = 250;
      for (const term of terms) {
        if (keyValue.includes(term) || titleValue.includes(term)) score = Math.max(score, 150 + Math.min(term.length, 20));
      }
      const brandMatch = hubBrandMatches(brand, hub.hero?.brand);
      if (brandMatch) score += 50;
      return { hub, score, brandMatch };
    })
    .filter((candidate) => candidate.score > 0);

  if (!candidates.length) return undefined;
  const brandCandidates = candidates.filter((candidate) => candidate.brandMatch);
  const selected = (brandCandidates.length ? brandCandidates : candidates).sort((a, b) => b.score - a.score)[0]?.hub;
  if (!selected) return undefined;

  const rows = Array.isArray(selected.prices?.rows) ? selected.prices.rows : [];
  const units = Array.isArray(selected.applications?.units) ? selected.applications.units : [];
  const usedRows = rows.map((row: AnyRecord) => row.used);
  const reconRows = rows.map((row: AnyRecord) => row.recon);
  const usedUnits = units.filter((unit: AnyRecord) => !/recon/i.test(String(unit.condition ?? ""))).map((unit: AnyRecord) => unit.price);
  const reconUnits = units.filter((unit: AnyRecord) => /recon/i.test(String(unit.condition ?? ""))).map((unit: AnyRecord) => unit.price);

  const pricing = {
    used: lowestPrice([...usedRows, ...usedUnits]),
    recon: lowestPrice([...reconRows, ...reconUnits]),
  };
  return pricing.used || pricing.recon ? pricing : undefined;
}

function engineCodeFromValue(value: unknown): string {
  const text = String(value ?? "");
  const parts = text.split(/[?#]/)[0].split("/").filter(Boolean);
  const engineIndex = parts.indexOf("engines");
  return engineIndex >= 0 ? parts[engineIndex + 1] ?? text : text;
}

function hasUpdatedQuoteOnlyContent(brand: string): boolean {
  return UPDATED_CONTENT_QUOTE_ONLY.has(compact(brand));
}

function quoteRowsForContent(
  brand: string,
  families: AnyRecord[],
  existingRows: AnyRecord[],
): AnyRecord[] {
  const configuredFamilies = UPDATED_CONTENT_PRICE_ROWS[compact(brand)];
  const rows = configuredFamilies?.length
    ? configuredFamilies
    : existingRows.length
      ? existingRows.map((row) => row.family)
      : families.map((family) => family.code).filter(Boolean);
  const existingNotes = new Map(existingRows.map((row) => [compact(String(row.family ?? "")), row.note]));
  return rows.map((family) => ({
    family,
    used: "Request A Quote",
    recon: "Request A Quote",
    note: existingNotes.get(compact(String(family))) ?? "Confirm the exact engine code, application and supplier terms before purchase.",
  }));
}

function resolveBrandPrices<T extends AnyRecord>(data: T, brand: string): T {
  const families = Array.isArray(data.engineFamilies?.families) ? data.engineFamilies.families : [];
  const existingRows = Array.isArray(data.priceGuide?.rows) ? data.priceGuide.rows : [];
  const quoteOnly = hasUpdatedQuoteOnlyContent(brand);

  const priceRows = quoteOnly
    ? quoteRowsForContent(brand, families, existingRows)
    : existingRows.length
    ? existingRows.map((row: AnyRecord) => {
        const pricing = hubPricing(String(row.family ?? ""), brand);
        return pricing ? { ...row, used: pricing.used ?? row.used, recon: pricing.recon ?? row.recon } : row;
      })
    : families.flatMap((family: AnyRecord) => {
        const pricing = hubPricing(String(family.code ?? ""), brand);
        if (!pricing) return [];
        return [{
          family: family.code,
          used: pricing.used ?? "Request A Quote",
          recon: pricing.recon ?? "Request A Quote",
          note: "Indicative starting prices across matched applications. Confirm the exact engine and vehicle fitment with your supplier.",
        }];
      });

  const heroCards = Array.isArray(data.hero?.cards)
    ? data.hero.cards.map((card: AnyRecord) => {
        if (quoteOnly) {
          const { priceFrom: _priceFrom, ...withoutPrice } = card;
          return withoutPrice;
        }
        const pricing = hubPricing(String(card.code ?? card.name ?? ""), brand);
        const priceFrom = card.priceFrom ?? pricing?.used ?? pricing?.recon;
        return priceFrom ? { ...card, priceFrom } : card;
      })
    : data.hero?.cards;

  const featuredEngines = Array.isArray(data.featuredEngines?.engines)
    ? data.featuredEngines.engines.map((engine: AnyRecord) => {
        if (quoteOnly) return engine;
        const pricing = hubPricing(engineCodeFromValue(engine.buyHref ?? engine.href ?? engine.code ?? engine.title), brand);
        const recon = /recon/i.test(String(engine.condition ?? ""));
        const price = recon ? pricing?.recon ?? pricing?.used : pricing?.used ?? pricing?.recon;
        return price && /request\s+a\s+quote/i.test(String(engine.price ?? "")) ? { ...engine, price } : engine;
      })
    : data.featuredEngines?.engines;

  return {
    ...data,
    hero: { ...data.hero, cards: heroCards },
    featuredEngines: { ...data.featuredEngines, engines: featuredEngines },
    priceGuide: { ...data.priceGuide, rows: priceRows },
  } as T;
}

export function getBrandData(slug: string): BrandPageData | undefined {
  const data = (brandPage as Record<string, BrandPageData>)[slug];
  if (!data) return undefined;
  const linked = resolveLinks(data, pageContext(slug));
  const resolvedImages = resolveBrandImages(linked, slug);
  return resolveBrandPrices(resolvedImages, String(resolvedImages.hero?.brand ?? slug));
}
