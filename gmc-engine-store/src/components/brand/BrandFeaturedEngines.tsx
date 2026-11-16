"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["featuredEngines"];
type Engine = Data["engines"][number];
type Condition = "All listings" | "Used engines" | "Reconditioned engines";

function conditionKey(condition: string) {
  return condition.toLowerCase().startsWith("re") ? "Reconditioned engines" : "Used engines";
}

function ListingCard({ engine }: { engine: Engine }) {
  const condition = conditionKey(engine.condition);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white">
      <div className="relative flex h-[155px] items-center justify-center bg-[#f5f8fc] p-3 sm:h-[175px]">
        <span className="absolute left-3 top-3 rounded-md bg-primary-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-primary-800">{condition.replace(" engines", "")}</span>
        <img src={engine.image} alt={`${engine.title} engine`} loading="lazy" className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-[14px] font-extrabold leading-snug text-ink-900">{engine.title.replace(/\s+—\s*$/, "")}</h3>
        <p className="mt-1 text-[11px] leading-snug text-ink-500">{engine.subtitle}</p>
        <p className="mt-3 text-[18px] font-extrabold text-ink-900">From {engine.price}</p>
        <Link href={engine.buyHref} className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-center text-[11px] font-bold leading-tight text-white transition hover:bg-primary-700">View engine &amp; request quotes <Icon name="arrow-right" className="h-4 w-4 shrink-0" /></Link>
      </div>
    </article>
  );
}

export default function BrandFeaturedEngines({ data, brand, brandSlug }: { data: Data; brand: string; brandSlug: string }) {
  const [condition, setCondition] = useState<Condition>("All listings");
  const filtered = useMemo(() => condition === "All listings" ? data.engines : data.engines.filter((engine) => conditionKey(engine.condition) === condition), [condition, data.engines]);

  return (
    <section id="replacement-engines" className="scroll-mt-20 bg-white py-9 sm:py-10">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">Explore {brand} replacement engine listings</h2>
            <p className="mt-1 text-[13px] text-ink-500">Choose an engine application, then request quotes from suitable UK suppliers.</p>
          </div>
          <Link href={`/${brandSlug}#replacement-engines`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary-700 underline underline-offset-4 hover:text-primary-600">View all listings <Icon name="arrow-right" className="h-4 w-4" /></Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Listing condition">
          {(["All listings", "Used engines", "Reconditioned engines"] as Condition[]).map((item) => <button key={item} type="button" role="tab" aria-selected={condition === item} onClick={() => setCondition(item)} className={`rounded-lg border px-4 py-2 text-[12px] font-bold transition ${condition === item ? "border-navy-900 bg-navy-900 text-white" : "border-line bg-white text-ink-700 hover:border-primary-300 hover:text-primary-700"}`}>{item}</button>)}
        </div>

        {filtered.length ? <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">{filtered.slice(0, 8).map((engine) => <ListingCard key={engine.id} engine={engine} />)}</div> : <div className="mt-5 rounded-xl border border-dashed border-line bg-[#f8fafc] px-4 py-8 text-center text-[13px] text-ink-500">No {condition.toLowerCase()} are currently published for this brand.</div>}
        <p className="mt-4 text-[11px] leading-relaxed text-ink-500">Illustrative starting prices. Your supplier confirms compatibility, availability, included components and the final quote. Prices vary by application and condition.</p>
      </div>
    </section>
  );
}
