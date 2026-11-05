"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "./Icon";
import { brandLogoForName } from "@/lib/brandLogos";

type Brand = {
  name: string;
  logo: string;
  href: string;
};

type ShopByBrandData = {
  sectionTitle: string;
  sectionDescription?: string;
  brands: Brand[];
};

const INITIAL_BRANDS = 7;

function BrandMark({ brand }: { brand: Brand }) {
  const logo = brandLogoForName(brand.name) || brand.logo;

  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt={`${brand.name} logo`} className="max-h-10 sm:max-h-12 w-auto object-contain" />;
  }

  const initials = brand.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="grid place-items-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-primary-300 text-primary-600 text-[11px] sm:text-xs font-extrabold">
      {initials}
    </span>
  );
}

export default function ShopByBrandClient({ data }: { data: ShopByBrandData }) {
  const [expanded, setExpanded] = useState(false);
  const brands = data.brands.filter((brand) => brand.name !== "All brands");
  const visibleBrands = expanded ? brands : brands.slice(0, INITIAL_BRANDS);
  const actionLabel = expanded ? "Show fewer" : "All brands";

  return (
    <section id="shop-by-brand" className="bg-white pb-10 lg:pb-12 scroll-mt-20">
      <div className="max-w-content mx-auto px-3 lg:px-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight text-ink-900">{data.sectionTitle}</h2>
            {data.sectionDescription && <p className="mt-1.5 text-sm text-ink-500 max-w-2xl">{data.sectionDescription}</p>}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls="shop-by-brand-grid"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
          >
            {actionLabel}
            <Icon name={expanded ? "minus" : "plus"} className="w-4 h-4" />
          </button>
        </div>

        <div id="shop-by-brand-grid" className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {visibleBrands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="group flex items-center gap-2 sm:gap-3.5 rounded-xl border border-line bg-white px-2.5 sm:px-4 py-3 sm:py-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-card-hover hover:border-primary-200 min-w-0"
            >
              <span className="grid place-items-center w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                <BrandMark brand={brand} />
              </span>
              <span className="flex-1 min-w-0 text-[13px] sm:text-[15px] font-bold text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{brand.name}</span>
              <Icon name="arrow-right" className="w-4 h-4 text-ink-400 group-hover:text-primary-600 transition-colors shrink-0" />
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls="shop-by-brand-grid"
            className="group flex items-center gap-2 sm:gap-3.5 rounded-xl border border-line bg-white px-2.5 sm:px-4 py-3 sm:py-3.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-card-hover hover:border-primary-200 min-w-0 text-left"
          >
            <span className="grid place-items-center w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <span className="grid place-items-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-primary-300 text-primary-600">
                <Icon name={expanded ? "minus" : "plus"} className="w-5 h-5" />
              </span>
            </span>
            <span className="flex-1 min-w-0 text-[13px] sm:text-[15px] font-bold text-ink-900 whitespace-nowrap overflow-hidden text-ellipsis">{actionLabel}</span>
            <Icon name={expanded ? "chevron-up" : "arrow-right"} className="w-4 h-4 text-ink-400 group-hover:text-primary-600 transition-colors shrink-0" />
          </button>
        </div>
      </div>
    </section>
  );
}
