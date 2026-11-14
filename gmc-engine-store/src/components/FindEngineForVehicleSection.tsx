"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "./Icon";
import type { HomepageBrand, HomepageDiscoveryData, HomepageModel } from "@/lib/homepageDiscovery";

const BMW_FEATURED_MODELS = ["1 Series", "3 Series", "5 Series", "X3", "X5"];

function brandInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function BrandMark({ brand, dark = false }: { brand: HomepageBrand; dark?: boolean }) {
  if (brand.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={brand.logo} alt={`${brand.name} logo`} className="h-9 w-12 object-contain sm:h-10" />;
  }

  return (
    <span className={`grid h-9 w-9 place-items-center rounded-full border text-[11px] font-extrabold sm:h-10 sm:w-10 ${dark ? "border-white/40 text-white" : "border-primary-300 text-primary-600"}`}>
      {brandInitials(brand.name)}
    </span>
  );
}

function featuredModels(brand: HomepageBrand): HomepageModel[] {
  if (brand.name === "BMW") {
    const preferred = BMW_FEATURED_MODELS.map((name) => brand.models.find((model) => model.name === name)).filter(Boolean) as HomepageModel[];
    if (preferred.length) return preferred;
  }

  return brand.models.slice(0, 5);
}

function ModelCard({ model }: { model: HomepageModel }) {
  return (
    <Link
      href={model.href}
      className="group flex min-h-[84px] items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-2 shadow-card transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover sm:min-h-[92px] sm:gap-2 sm:px-4 sm:py-3"
    >
      <span className="min-w-0 flex-1">
        <h3 className="text-[12px] font-extrabold leading-tight text-ink-900 sm:text-[15px]">{model.name}</h3>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={model.image} alt={`${model.name} vehicle`} className="h-11 w-[43%] object-contain object-center sm:h-14 sm:w-[56%]" loading="lazy" />
      <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-primary-600 transition group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
    </Link>
  );
}

export default function FindEngineForVehicleSection({ data }: { data: HomepageDiscoveryData }) {
  const primaryBrands = data.brands.filter((brand) => brand.isPrimary);
  const additionalBrands = data.brands.filter((brand) => !brand.isPrimary);
  const [selectedSlug, setSelectedSlug] = useState(primaryBrands[0]?.slug ?? data.brands[0]?.slug ?? "");
  const [showAdditional, setShowAdditional] = useState(false);
  const selected = data.brands.find((brand) => brand.slug === selectedSlug) ?? primaryBrands[0] ?? data.brands[0];
  const models = useMemo(() => (selected ? featuredModels(selected) : []), [selected]);

  if (!selected) return null;

  return (
    <section className="bg-[#f5f7fb] py-8 sm:py-10 lg:py-12" aria-labelledby="find-engine-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="find-engine-heading" className="text-[24px] font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-[30px] lg:text-[34px]">Find Replacement Engines For Your Vehicle</h2>
            <p className="mt-1.5 text-[13px] text-ink-600 sm:text-[14px]">Browse By Manufacturer And Model To Explore Compatible Engine Applications.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdditional((value) => !value)}
            aria-expanded={showAdditional}
            aria-controls="additional-brand-links"
            className="inline-flex shrink-0 items-center gap-2 pb-1 text-[13px] font-extrabold text-primary-700 hover:text-primary-600 sm:text-[14px]"
          >
            Explore All Brands
            <Icon name={showAdditional ? "chevron-up" : "chevron-down"} className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-6 lg:grid lg:grid-cols-7 lg:overflow-visible">
          {primaryBrands.map((brand) => {
            const active = brand.slug === selected.slug;
            return (
              <button
                key={brand.slug}
                type="button"
                onClick={() => setSelectedSlug(brand.slug)}
                aria-pressed={active}
                className={`flex min-w-[178px] shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-[13px] font-bold transition sm:min-w-[205px] sm:text-[14px] lg:min-w-0 ${active ? "border-navy-950 bg-[#071a34] text-white shadow-lg" : "border-line bg-white text-ink-900 hover:border-primary-300 hover:shadow-card"}`}
              >
                <BrandMark brand={brand} dark={active} />
                <span className="truncate">{brand.name}</span>
              </button>
            );
          })}
          {additionalBrands.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAdditional((value) => !value)}
              aria-label={showAdditional ? "Collapse Additional Brands" : "Expand Additional Brands"}
              aria-expanded={showAdditional}
              aria-controls="additional-brand-links"
              className="flex min-w-[40px] shrink-0 items-center justify-center rounded-xl border border-line bg-white px-2 py-2 text-primary-700 transition hover:border-primary-300 hover:shadow-card sm:min-w-[44px] sm:px-2.5 lg:min-w-0 lg:px-1.5"
            >
              <Icon name={showAdditional ? "chevron-up" : "chevron-down"} className="h-4 w-4" />
            </button>
          )}
        </div>

        {showAdditional && (
          <div id="additional-brand-links" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {additionalBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={brand.href}
                className="group flex min-w-0 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2.5 text-left text-sm font-bold text-ink-800 transition hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-700 hover:shadow-card"
              >
                <BrandMark brand={brand} />
                <span className="min-w-0 flex-1 truncate">{brand.name}</span>
                <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
              </Link>
            ))}
          </div>
        )}

        <div className={`mt-5 grid gap-3 lg:mt-6 lg:gap-4 ${models.length ? "lg:grid-cols-[1.08fr_0.92fr]" : "lg:grid-cols-1"}`}>
          <article className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[#071a34] p-5 text-white shadow-xl sm:min-h-[350px] sm:p-8 lg:min-h-[330px]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(7,26,52,.9),rgba(7,26,52,.42)),url('/images/homepage/cinematic-navy-studio.webp')] bg-cover bg-center" />
            <div className="relative z-10 flex min-h-[318px] flex-col items-center text-center lg:block lg:min-h-[274px] lg:max-w-[52%] lg:text-left">
              <div className="mb-3 flex items-center justify-center gap-2 lg:mb-5 lg:justify-start">
                <BrandMark brand={selected} dark />
                <span className="text-sm font-bold text-white/75">{selected.name}</span>
              </div>
              <h3 className="text-[22px] font-extrabold tracking-tight sm:text-[24px]">{selected.name} Engines</h3>
              <p className="mt-2 max-w-[300px] text-[13px] leading-5 text-white/80 sm:text-[14px] lg:max-w-md">{selected.description}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.image} alt={`${selected.name} vehicle`} className="relative order-3 mt-3 h-[118px] w-full object-contain object-bottom sm:h-[132px] lg:absolute lg:bottom-[-1.5rem] lg:right-[-92%] lg:mt-0 lg:h-[74%] lg:w-[118%]" />
              <Link href={selected.href} className="relative z-10 order-4 mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-white px-4 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-white hover:text-[#071a34] sm:text-[14px] lg:mt-6">
                View {selected.name} Engines
                <Icon name="arrow-right" className="h-5 w-5" />
              </Link>
            </div>
          </article>

          {models.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {models.map((model) => <ModelCard key={`${selected.slug}-${model.name}`} model={model} />)}
              <Link
                href={selected.modelPageHref}
                className="group col-span-2 flex min-h-[84px] items-center justify-between rounded-xl border border-line bg-white px-3 py-2 shadow-card transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card-hover sm:col-span-1 sm:min-h-[92px] sm:px-4 sm:py-3"
              >
                <h3 className="max-w-[150px] text-[13px] font-extrabold leading-tight text-ink-900 sm:text-[15px]">View All {selected.name} Models</h3>
                <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-primary-600 transition group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

