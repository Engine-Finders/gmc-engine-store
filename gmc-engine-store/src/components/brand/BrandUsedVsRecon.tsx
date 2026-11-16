import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["usedVsRecon"];

const checklists = [
  ["Donor mileage and history", "Testing and included components", "Supplier warranty and terms"],
  ["Work completed and parts replaced", "Testing and supplied components", "Supplier warranty and terms"],
];

export default function BrandUsedVsRecon({ data, brand }: { data: Data; brand: string }) {
  const isMercedes = brand.toLowerCase().includes("mercedes");
  const generatedImages = [
    "/images/brand-page/mercedes-used-engine-workshop-v2.png",
    "/images/brand-page/mercedes-reconditioned-engine-workshop-v2.png",
  ];

  return (
    <section className="bg-white py-9 sm:py-10">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <h2 className="text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">Used or reconditioned {brand} replacement engines?</h2>
        <p className="mt-1 text-[13px] text-ink-500">Compare the options, then confirm the engine condition and scope with your supplier.</p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {data.options.slice(0, 2).map((option, index) => {
            const image = isMercedes ? generatedImages[index] : ((option as typeof option & { image?: string }).image || "/images/listings/engine.png");
            return <article key={option.title} className="overflow-hidden rounded-xl border border-line bg-white"><div className="h-[190px] bg-[#eef2f7] sm:h-[220px]"><img src={image} alt={`${option.title} representative`} loading="lazy" className="h-full w-full object-cover" /></div><div className="p-4 sm:p-5"><p className="text-[11px] font-extrabold uppercase tracking-wide text-primary-700">{index === 0 ? "Used engine" : "Reconditioned engine"}</p><h3 className="mt-1 text-[20px] font-extrabold leading-tight text-ink-900">{index === 0 ? "Previously fitted. Check its history." : "Rebuilt. Confirm the work completed."}</h3><p className="mt-2 text-[13px] leading-relaxed text-ink-500">{option.paragraphs[0]}</p><ul className="mt-4 divide-y divide-line">{checklists[index].map((item) => <li key={item} className="flex items-center gap-2 py-2 text-[12px] text-ink-700"><Icon name="check-circle" className="h-5 w-5 shrink-0 text-primary-600" />{item}</li>)}</ul></div></article>;
          })}
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-navy-900 px-4 py-3 text-[12px] font-semibold leading-relaxed text-white"><Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" />Warranty, delivery, returns and refunds depend on your chosen supplier. Confirm all terms before purchasing or authorising work.</div>
      </div>
    </section>
  );
}
