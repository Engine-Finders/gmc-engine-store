import type { BrandPageData } from "@/lib/brand";
import Icon from "../Icon";
import Link from "next/link";

type Data = BrandPageData["priceGuide"];

function PriceValue({ value }: { value?: string }) {
  const text = value || "—";
  if (/request\s+a\s+quote/i.test(text)) {
    return <Link href="#supplier-quote" className="font-normal text-ink-700 no-underline transition hover:text-ink-700">{text}</Link>;
  }
  return <>{text}</>;
}

function PriceTable({ data }: { data: Data }) {
  return (
    <div className="max-h-[300px] overflow-auto overscroll-auto rounded-xl border border-line lg:max-h-[286px]">
      <table className="min-w-[650px] w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-navy-900 text-white shadow-[0_2px_0_rgba(11,18,38,0.18)]">
          <tr>{data.columns.map((column) => <th key={column} className="px-4 py-3 text-[12px] font-bold">{column === "Note" ? "Application note" : column}</th>)}</tr>
        </thead>
        <tbody>
          {data.rows.map((row, index) => <tr key={row.family} className={index % 2 ? "bg-[#f5f7fb]" : "bg-white"}><td className="border-t border-line px-4 py-2.5 text-[12.5px] font-extrabold text-ink-900">{row.family}</td><td className="border-t border-line px-4 py-2.5 text-[12.5px] text-ink-700"><PriceValue value={row.used} /></td><td className="border-t border-line px-4 py-2.5 text-[12.5px] text-ink-700"><PriceValue value={row.recon} /></td><td className="border-t border-line px-4 py-2.5 text-[12px] text-ink-500">{row.note}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default function BrandPriceGuide({ data, brand }: { data: Data; brand: string }) {
  return (
    <section className="bg-[#f4f7fb] py-5 sm:py-8">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <h2 className="text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">{brand} replacement engine price guide</h2>
        <p className="mt-1.5 text-[13px] text-ink-500">{data.description} Your supplier confirms the final quote.</p>
        <div className="mt-4 grid gap-5 sm:mt-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.9fr)] lg:items-start">
          <PriceTable data={data} />
          <aside className="navy-panel flex flex-col rounded-xl p-5 text-white lg:h-[286px]">
            <div className="flex h-[132px] items-center justify-center sm:h-[148px]"><img src={data.image} alt={`${brand} replacement engine`} loading="lazy" className="h-full w-full object-contain" /></div>
            <div className="mt-auto pt-3"><div className="flex items-center gap-2"><Icon name="info" className="h-6 w-6 text-primary-400" /><h3 className="text-[19px] font-extrabold">Confirm your quote</h3></div>
            <p className="mt-2 text-[12px] leading-relaxed text-white/75">Ask what is included, whether fitting or delivery costs extra, and which supplier terms apply.</p>
            </div>
          </aside>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-500 sm:mt-4">{data.note} Specification, condition and service requirements affect the final quote.</p>
      </div>
    </section>
  );
}
