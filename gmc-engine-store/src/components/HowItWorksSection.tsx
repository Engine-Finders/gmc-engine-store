"use client";

import Icon from "./Icon";
import { useQuoteModal } from "./quote/QuoteModal";

const steps: Array<{
  number: string;
  title: string;
  description: string;
  image: string;
}> = [
  {
    number: "01",
    title: "Choose Your Engine Listing",
    description: "Browse by vehicle or engine code. Add your registration, postcode and preferred service so we can identify suitable suppliers.",
    image: "/images/homepage/how-it-works/how-it-works-listing.png",
  },
  {
    number: "02",
    title: "Receive Supplier Quotes",
    description: "We match your engine requirements first, prioritise nearby suppliers and include nationwide options where needed. A small number of suitable suppliers can contact you with quotes.",
    image: "/images/homepage/how-it-works/how-it-works-quotes.png",
  },
  {
    number: "03",
    title: "Choose Your Supplier",
    description: "Compare the final price, engine specification and service terms. Agree payment, delivery or workshop arrangements directly with your chosen supplier.",
    image: "/images/homepage/how-it-works/how-it-works-supplier.png",
  },
];

function HowItWorksStep({ step, index }: { step: (typeof steps)[number]; index: number }) {
  return (
    <li className="relative text-center lg:text-left">
      {index < steps.length - 1 && (
        <span aria-hidden="true" className="absolute left-[calc(100%_-_1.2rem)] top-[3.25rem] hidden w-[calc(2.4rem)] border-t-2 border-dotted border-primary-300 lg:block" />
      )}
      <div className="flex min-h-[112px] items-start justify-center gap-3 sm:gap-4 lg:justify-start">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-600 text-sm font-extrabold text-white shadow-cta sm:h-12 sm:w-12">{step.number}</span>
        <div className="h-[96px] min-w-0 flex-1 sm:h-[108px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={step.image} alt="" className="h-full w-full object-contain object-center lg:object-left" loading="lazy" />
        </div>
      </div>
      <h3 className="mt-3 text-[17px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[18px]">{step.title}</h3>
      <p className="mt-1.5 text-[13px] leading-5 text-ink-700">{step.description}</p>
    </li>
  );
}

export default function HowItWorksSection() {
  const { open } = useQuoteModal();

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white py-8 sm:py-10 lg:py-12" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-0">
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-primary-600">How It Works</p>
        <h2 id="how-it-works-heading" className="mt-2.5 max-w-4xl text-[24px] font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-[30px] lg:text-[34px]">How To Find And Order Your Replacement Engine</h2>

        <ol className="mt-7 grid gap-7 lg:grid-cols-3 lg:gap-6">
          {steps.map((step, index) => <HowItWorksStep key={step.number} step={step} index={index} />)}
        </ol>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <button
            type="button"
            onClick={() => open({ heading: "Find replacement engine suppliers for your vehicle", part: "Engine", requestService: true, note: "I would like to request replacement engine quotes." })}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-[14px] font-extrabold text-white shadow-cta transition hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200"
          >
            Request replacement engine quotes
            <Icon name="arrow-right" className="h-5 w-5" />
          </button>
          <span aria-hidden="true" className="hidden h-10 w-px bg-line sm:block" />
          <p className="max-w-2xl text-[13px] leading-5 text-ink-700">Submitting an enquiry does not place an order. Any purchase or service agreement is made directly with the supplier.</p>
        </div>
      </div>
    </section>
  );
}
