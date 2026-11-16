"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { useQuoteModal } from "../quote/QuoteModal";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["engineFamilies"];
type Family = Data["families"][number] & { image?: string };
type Filter = "All engines" | "Diesel" | "Petrol" | "AMG";

function familyType(family: Family): Filter {
  const spec = family.spec.toLowerCase();
  if (spec.includes("amg")) return "AMG";
  if (spec.includes("petrol")) return "Petrol";
  return "Diesel";
}

function details(family: Family) {
  const parts = family.spec.split("·").map((part) => part.trim());
  const fuel = familyType(family) === "Petrol" || familyType(family) === "AMG" ? "Petrol" : "Diesel";
  return { displacement: parts[0] || family.spec, fuel };
}

function FamilyCard({ family, brand, onOpen, id }: { family: Family; brand: string; onOpen: () => void; id: string }) {
  const { displacement, fuel } = details(family);
  return (
    <button id={id} type="button" onClick={onOpen} className="group relative flex min-h-[136px] w-full items-center justify-between overflow-hidden rounded-xl border border-white/25 bg-white/[0.04] p-4 text-left transition hover:-translate-y-0.5 hover:border-primary-400/80 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
      <span className="relative z-10 min-w-0 pr-2">
        <span className="block text-[24px] font-extrabold leading-none tracking-tight text-white">{family.code}</span>
        <span className="mt-2 block text-[12px] font-semibold text-white/85">{displacement} {fuel}</span>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary-300">Explore applications <Icon name="arrow-right" className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
      </span>
      <img src={family.image || ""} alt={`${brand} ${family.code} engine`} className="pointer-events-none absolute right-[-20px] top-1/2 h-[120px] w-[58%] -translate-y-1/2 object-contain opacity-90 mix-blend-screen" />
    </button>
  );
}

export default function BrandEngineFamilies({ data, brand, brandSlug }: { data: Data; brand: string; brandSlug: string }) {
  const families = data.families as Family[];
  const [filter, setFilter] = useState<Filter>("All engines");
  const [search, setSearch] = useState("");
  const { open } = useQuoteModal();
  const searchActive = search.trim().length > 0;
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = families.filter((family) => {
      const filterMatch = filter === "All engines" || familyType(family) === filter;
      const searchMatch = !term || `${family.code} ${family.spec}`.toLowerCase().includes(term);
      return filterMatch && searchMatch;
    });
    return searchActive ? matches : matches.slice(0, 4);
  }, [families, filter, search, searchActive]);

  function openFamily(family: Family) {
    const { displacement, fuel } = details(family);
    open({
      heading: `Get quotes for your ${brand} ${family.code} engine`,
      engine: { brand, code: family.code, displacement, fuel, image: family.image, href: family.href },
      returnFocusId: `brand-family-${brandSlug}-${family.code.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    });
  }

  return (
    <section id="engine-families" className="scroll-mt-20 bg-white py-9 sm:py-10">
      <div className="navy-panel relative overflow-hidden border-y border-primary-500/70">
        <div className="hero-dots pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-content px-4 py-9 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[24px] font-extrabold tracking-tight text-white sm:text-[28px]">Explore {brand} engine families</h2>
              <p className="mt-1 max-w-2xl text-[13px] text-white/65">Browse diesel and petrol engine families, then explore the relevant applications.</p>
            </div>
            <Link href="/engines" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white underline underline-offset-4 hover:text-primary-300">View all engine families <Icon name="arrow-right" className="h-4 w-4" /></Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="relative block">
              <span className="sr-only">Search {brand} engine codes</span>
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search engine code or specification" className="w-full rounded-lg border border-white/15 bg-white/[0.08] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30" />
            </label>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={`${brand} engine family filters`}>
              {(["All engines", "Diesel", "Petrol", "AMG"] as Filter[]).map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={`rounded-lg border px-3.5 py-2 text-[12px] font-bold transition ${filter === item ? "border-primary-500 bg-primary-600 text-white" : "border-white/25 bg-white/[0.04] text-white/75 hover:border-primary-400 hover:text-white"}`}>{item}</button>)}
            </div>
          </div>

          {filtered.length ? <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">{filtered.map((family) => { const id = `brand-family-${brandSlug}-${family.code.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`; return <FamilyCard key={family.code} id={id} family={family} brand={brand} onOpen={() => openFamily(family)} />; })}</div> : <div className="mt-5 rounded-xl border border-dashed border-white/20 px-4 py-8 text-center text-[13px] text-white/65">No engine families match this search and filter. Clear the search to restore the featured families.</div>}
          <p className="mt-5 text-[11px] leading-relaxed text-white/60">{data.description} Engine family alone does not confirm fitment. Your supplier checks the exact specification before purchase.</p>
        </div>
      </div>
    </section>
  );
}
