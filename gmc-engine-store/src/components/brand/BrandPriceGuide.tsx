import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["priceGuide"];

function PriceTable({ data, scroll }: { data: Data; scroll?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line ${scroll ? "overflow-x-auto" : ""}`}>
      <table className={`w-full text-left border-collapse ${scroll ? "min-w-[600px]" : ""}`}>
        <thead>
          <tr className="bg-[#f1f4f9]">
            {data.columns.map((c) => (
              <th key={c} className="px-4 py-3 text-[12px] font-bold text-ink-700 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={r.family} className={i % 2 ? "bg-[#fafbfd]" : "bg-white"}>
              <td className="px-4 py-3 text-[12.5px] font-semibold text-ink-900 whitespace-nowrap border-t border-line">{r.family}</td>
              <td className="px-4 py-3 text-[12.5px] text-ink-700 whitespace-nowrap border-t border-line">{r.used}</td>
              <td className="px-4 py-3 text-[12.5px] text-ink-700 whitespace-nowrap border-t border-line">{r.recon}</td>
              <td className="px-4 py-3 text-[12px] text-ink-500 border-t border-line">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoBox({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4 items-start">
      <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-primary-600 text-white text-[13px] font-bold italic">i</span>
      <p className="text-[12.5px] leading-relaxed text-ink-600">{text}</p>
    </div>
  );
}

function EngineCard({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div className={`navy-panel relative overflow-hidden rounded-xl border border-white/10 grid place-items-center min-h-[180px] p-4 ${className}`}>
      <div className="hero-dots absolute inset-0 opacity-30" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="relative w-[240px] max-w-full object-contain" />
    </div>
  );
}

export default function BrandPriceGuide({ data }: { data: Data }) {
  return (
    <section className="bg-white pb-10 lg:pb-12">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop — heading spans the row so the right column starts level with the
            table's top edge, and `items-stretch` + `flex-1` on the engine card makes
            it end flush with the table's bottom border. */}
        <div className="hidden lg:block">
          <h2 className="text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500 max-w-xl">{data.description}</p>
          <div className="mt-5 grid grid-cols-[1fr_360px] gap-8 items-stretch">
            <PriceTable data={data} />
            <div className="flex flex-col gap-4">
              <InfoBox text={data.note} />
              <EngineCard src={data.image} className="flex-1" />
            </div>
          </div>
        </div>

        {/* Mobile — stacked: title, description, image, table, info note */}
        <div className="lg:hidden">
          <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight text-ink-900">{data.title}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{data.description}</p>
          <div className="mt-6">
            <EngineCard src={data.image} />
          </div>
          <div className="mt-6">
            <PriceTable data={data} scroll />
          </div>
          <div className="mt-5">
            <InfoBox text={data.note} />
          </div>
        </div>
      </div>
    </section>
  );
}
