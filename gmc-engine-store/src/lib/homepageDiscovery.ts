import brandPage from "@/data/brandPage.json";
import hubPage from "@/data/hubPage.json";
import { brandLogoForName } from "@/lib/brandLogos";
import { brandImageFor, engineImageFor, resolveBrandImages } from "@/lib/imageMapping";
import { resolveHref, resolveLinks } from "@/lib/links";

const PRIMARY_BRAND_SLUGS = [
  "bmw-engines",
  "mercedes-benz-engines",
  "land-rover-engines",
  "jaguar-engines",
  "audi-engines",
  "volkswagen-engines",
] as const;

export type HomepageModel = {
  name: string;
  image: string;
  href: string;
};

export type HomepageBrand = {
  slug: string;
  name: string;
  logo: string;
  image: string;
  href: string;
  description: string;
  modelPageHref: string;
  models: HomepageModel[];
  isPrimary: boolean;
};

export type HomepageEngineFamily = {
  slug: string;
  code: string;
  brand: string;
  displacement: string;
  fuel: string;
  image: string;
  href: string;
};

export type HomepageDiscoveryData = {
  brands: HomepageBrand[];
  engineFamilies: HomepageEngineFamily[];
};

type JsonRecord = Record<string, any>;

function specValue(specs: JsonRecord[], label: string): string {
  return String(specs.find((spec) => String(spec.label).toLowerCase() === label.toLowerCase())?.value ?? "");
}

function brandRecord(slug: string, raw: JsonRecord): HomepageBrand {
  const isPrimary = PRIMARY_BRAND_SLUGS.includes(slug as (typeof PRIMARY_BRAND_SLUGS)[number]);
  const linked = resolveLinks(raw);
  const resolved = isPrimary ? resolveBrandImages(linked, slug) : linked;
  const name = String(raw.hero?.brand ?? slug.replace(/-engines$/, ""));
  const modelSource = (resolved.shopByModel?.models ?? []) as JsonRecord[];

  return {
    slug,
    name,
    logo: brandLogoForName(name) || String(raw.hero?.logo ?? ""),
    image: isPrimary ? String(resolved.hero?.carImage ?? brandImageFor(slug)) : brandImageFor(slug),
    href: resolveHref(`/${slug}`),
    description: `Explore ${name} models and engine families to find the right starting point for your enquiry.`,
    modelPageHref: String(resolved.shopByModel?.viewAllHref ?? `/${slug}#shop-by-model`),
    models: isPrimary
      ? modelSource
          .map((model) => ({
            name: String(model.name ?? ""),
            image: String(model.image ?? ""),
            href: resolveHref(String(model.href ?? "")),
          }))
          .filter((model) => model.name && model.href)
      : [],
    isPrimary,
  };
}

function engineFamilyRecord(slug: string, raw: JsonRecord): HomepageEngineFamily {
  const brand = String(raw.hero?.brand ?? "");
  const specs = (raw.hero?.quickSpecs ?? []) as JsonRecord[];

  return {
    slug,
    code: String(raw.engineSlug ?? slug).toUpperCase(),
    brand,
    displacement: specValue(specs, "Displacement"),
    fuel: specValue(specs, "Fuel"),
    image: engineImageFor(slug, brand),
    href: resolveHref(`/engines/${slug}`),
  };
}

export function getHomepageDiscoveryData(): HomepageDiscoveryData {
  const brands = Object.entries(brandPage as Record<string, JsonRecord>)
    .map(([slug, raw]) => brandRecord(slug, raw))
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      if (a.isPrimary && b.isPrimary) {
        return PRIMARY_BRAND_SLUGS.indexOf(a.slug as (typeof PRIMARY_BRAND_SLUGS)[number]) - PRIMARY_BRAND_SLUGS.indexOf(b.slug as (typeof PRIMARY_BRAND_SLUGS)[number]);
      }
      return a.name.localeCompare(b.name);
    });

  const engineFamilies = Object.entries(hubPage as Record<string, JsonRecord>).map(([slug, raw]) => engineFamilyRecord(slug, raw));

  return { brands, engineFamilies };
}

