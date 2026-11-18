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
  const steps = data.steps.slice(0, 3);

  return (
    <section className="bg-white py-5 sm:py-8">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-primary-700">How it works</p>
        <h2 className="mt-1 text-[24px] font-extrabold tracking-tight text-ink-900 sm:text-[28px]">{data.title || `How to get ${brand} engine quotes`}</h2>
        <ol className="mt-5 grid gap-4 md:mt-7 md:grid-cols-3 md:gap-5">
          {steps.map((step, index) => (
            <li key={step.number} className="relative rounded-xl border border-line bg-white p-4 shadow-[0_14px_32px_-24px_rgba(11,18,32,0.5)] sm:p-5">
              <div className="relative flex min-h-[104px] items-center justify-center">
                <span className="absolute left-0 top-0 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-600 text-[13px] font-extrabold text-white shadow-cta">{String(step.number).padStart(2, "0")}</span>
                <img src={illustrations[index]} alt="" aria-hidden loading="lazy" className="h-24 w-32 object-contain" />
              </div>
              {index < steps.length - 1 && <span aria-hidden className="absolute right-[-21px] top-10 z-10 hidden w-8 border-t-2 border-dotted border-primary-400 md:block" />}
              <h3 className="mt-4 text-[17px] font-extrabold leading-tight text-ink-900">{step.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{step.description}</p>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-col gap-4 sm:mt-7 sm:flex-row sm:items-center">
          <Link href="#supplier-quote" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-[13px] font-bold text-white transition hover:bg-primary-500">Get free engine quotes <Icon name="arrow-right" className="h-4 w-4" /></Link>
          <p className="border-l border-line pl-4 text-[12px] text-ink-500">Your enquiry is not an order. We share it with a small number of suitable suppliers.</p>
        </div>
      </div>
    </section>
  );
}
