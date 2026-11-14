"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Icon from "./Icon";
import { useQuoteModal } from "./quote/QuoteModal";
import type { HomepageDiscoveryData, HomepageEngineFamily } from "@/lib/homepageDiscovery";

function EngineFamilyCard({ family, onSelect }: { family: HomepageEngineFamily; onSelect: (family: HomepageEngineFamily) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(family)}
      className="group flex h-[162px] flex-col rounded-xl border border-white/60 bg-[#0a203e] p-3.5 text-left transition hover:-translate-y-1 hover:border-primary-400 hover:shadow-[0_16px_36px_rgba(0,0,0,0.22)] sm:h-[172px] sm:p-4"
      aria-label={`Explore applications for ${family.brand} ${family.code}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold uppercase tracking-wide text-white/90">{family.brand}</p>
          <h3 className="mt-0.5 text-[24px] font-extrabold tracking-tight text-primary-400 sm:text-[26px]">{family.code}</h3>
          <p className="mt-0.5 text-[13px] font-medium text-white/90">{[family.displacement, family.fuel].filter(Boolean).join(" ")}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={family.image} alt={`${family.brand} ${family.code} engine`} className="h-16 w-[48%] object-contain object-right sm:h-20" loading="lazy" />
      </div>
      <span className="mt-auto inline-flex items-center gap-2 pt-1 text-[13px] font-extrabold text-white">
        Explore Applications
        <Icon name="arrow-right" className="h-5 w-5 text-primary-400 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export default function KnowYourEngineCodeSection({ data }: { data: HomepageDiscoveryData }) {
  const { open } = useQuoteModal();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(
    () => data.engineFamilies.filter((family) => !normalizedQuery || family.code.toLowerCase().includes(normalizedQuery)),
    [data.engineFamilies, normalizedQuery],
  );
  const visibleFamilies = normalizedQuery ? matches : matches.slice(0, 4);

  function selectFamily(family: HomepageEngineFamily) {
    open({
      heading: "Find Your Replacement Engine",
      part: "Engine",
      note: `Selected engine family: ${family.brand} ${family.code}${family.displacement ? ` (${family.displacement}${family.fuel ? `, ${family.fuel}` : ""})` : ""}.`,
      engine: {
        brand: family.brand,
        code: family.code,
        displacement: family.displacement,
        fuel: family.fuel,
        image: family.image,
        href: family.href,
      },
    });
  }

  return (
    <section className="border-t-4 border-primary-500 bg-[#06172e] py-8 text-white sm:py-10 lg:py-12" aria-labelledby="engine-code-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-0">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="engine-code-heading" className="text-[24px] font-extrabold leading-[1.08] tracking-tight sm:text-[30px] lg:text-[34px]">Know Your Engine Code?</h2>
            <p className="mt-1.5 text-[13px] text-white/80 sm:text-[14px]">Know Your Engine Code? Explore The Engine Family, Then Select Your Model And Application.</p>
          </div>
          <Link href="/engines" className="hidden items-center gap-2 pb-1 text-[13px] font-extrabold text-white underline decoration-primary-400 underline-offset-4 hover:text-primary-300 sm:inline-flex sm:text-[14px]">
            All Engine Families
            <Icon name="arrow-right" className="h-5 w-5" />
          </Link>
        </div>

        <label htmlFor="engine-family-search" className="sr-only">Search Engine Code</label>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 text-ink-900 shadow-lg sm:mt-5 sm:px-5 sm:py-3">
          <Icon name="search" className="h-5 w-5 shrink-0 text-ink-500" />
          <input
            id="engine-family-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Engine Code, E.G. N47 Or OM651"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink-500 sm:text-[15px]"
          />
        </div>

        {matches.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleFamilies.map((family) => <EngineFamilyCard key={family.slug} family={family} onSelect={selectFamily} />)}
          </div>
        ) : (
          <p role="status" className="mt-5 rounded-xl border border-white/25 bg-white/5 px-4 py-7 text-center text-[13px] font-semibold text-white/85 sm:text-[14px]">
            No Engine Families Match That Code.
          </p>
        )}

        <p className="mt-4 text-[12px] italic leading-5 text-white/75 sm:text-[13px]">Engine Family Alone Does Not Confirm Fitment. Check Your Vehicle Specification Before Ordering.</p>
        <Link href="/engines" className="mt-4 inline-flex items-center gap-2 text-[13px] font-extrabold text-white underline decoration-primary-400 underline-offset-4 hover:text-primary-300 sm:hidden">
          All Engine Families
          <Icon name="arrow-right" className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

