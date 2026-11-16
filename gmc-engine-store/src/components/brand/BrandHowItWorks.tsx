import Link from "next/link";
import Icon from "../Icon";
import type { BrandPageData } from "@/lib/brand";

type Data = BrandPageData["howItWorks"];

const illustrations = [
  "/images/homepage/how-it-works/how-it-works-listing.png",
  "/images/homepage/how-it-works/how-it-works-quotes.png",
  "/images/homepage/how-it-works/how-it-works-supplier.png",
];

export default function BrandHowItWorks({ data, brand }: { data: Data; brand: string }) {
  const steps = [
    { number: "01", title: "Find your engine", description: `Browse by model or engine code, or enter your registration. Choose supply only, supply and fit, or an engine rebuild.` },
    { number: "02", title: "Receive supplier quotes", description: `We match your ${brand} engine requirements first, prioritising nearby suppliers and nationwide options where needed.` },
    { number: "03", title: "Choose your supplier", description: "Compare the specification, final price and terms. Arrange your purchase or service directly with your chosen supplier." },
  ];

  return (
    <section className="bg-white py-9 sm:py-10">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-primary-700">How it works</p>
        <h2 className="mt-1 text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">How to get {brand} engine quotes</h2>
        <ol className="mt-7 grid gap-7 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.number} className="relative text-center md:text-left">
              <div className="flex items-center gap-3 md:flex-col md:items-start">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-600 text-[13px] font-extrabold text-white">{step.number}</span>
                <div className="flex h-[90px] flex-1 items-center justify-center rounded-lg bg-[#f5f8fc] md:mt-3 md:h-[112px] md:w-full">
                  <img src={illustrations[index]} alt="" aria-hidden loading="lazy" className="h-[74px] max-w-[150px] object-contain md:h-[94px]" />
                </div>
              </div>
              {index < 2 && <span aria-hidden className="absolute right-[-22px] top-[66px] hidden w-8 border-t-2 border-dotted border-primary-400 md:block" />}
              <h3 className="mt-4 text-[17px] font-extrabold text-ink-900">{step.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link href="#supplier-quote" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-[13px] font-bold text-white transition hover:bg-primary-500">Get free engine quotes <Icon name="arrow-right" className="h-4 w-4" /></Link>
          <p className="border-l border-line pl-4 text-[12px] text-ink-500">Your enquiry is not an order. We share it with a small number of suitable suppliers.</p>
        </div>
      </div>
    </section>
  );
}
