"use client";

import Icon from "./Icon";
import { useQuoteModal } from "./quote/QuoteModal";

type ServiceChoice = "Supply-only engine" | "Supply and fit" | "Engine rebuild";

const cards: Array<{
  title: string;
  description: string;
  cta: string;
  service: ServiceChoice;
  image: string;
  alt: string;
}> = [
  {
    title: "Supply-Only Replacement Engines",
    description: "Buy the engine from your chosen supplier and arrange fitting separately. Confirm exactly which components are included and agree delivery or collection with the supplier.",
    cta: "Explore supply-only engines",
    service: "Supply-only engine",
    image: "/images/homepage/buying-essentials/buying-supply-only.png",
    alt: "Replacement engine ready for supply",
  },
  {
    title: "Replacement Engines Supplied And Fitted",
    description: "Request an engine and fitting labour in one supplier quote. Confirm the installation scope, additional parts and workshop arrangements before agreeing the work.",
    cta: "Request supply-and-fit quotes",
    service: "Supply and fit",
    image: "/images/homepage/buying-essentials/buying-supply-and-fit.png",
    alt: "Engine bay in a workshop",
  },
  {
    title: "Rebuild Your Existing Engine",
    description: "Ask suitable suppliers about rebuilding the engine you already own. The workshop assesses the work required and confirms its quotation and arrangements with you.",
    cta: "Request engine rebuild quotes",
    service: "Engine rebuild",
    image: "/images/homepage/buying-essentials/buying-rebuild.png",
    alt: "Engine ready for workshop assessment",
  },
];

function ServiceImage({ card }: { card: (typeof cards)[number] }) {
  return (
    <div className="relative aspect-[10/7] overflow-hidden bg-[#dfe7ef]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={card.image} alt={card.alt} className="relative h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

function ServiceOptionCard({ card }: { card: (typeof cards)[number] }) {
  const { open } = useQuoteModal();

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <ServiceImage card={card} />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary-600">Service Option</p>
        <h3 className="mt-2 text-[17px] font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[18px]">{card.title}</h3>
        <p className="mt-2 text-[13px] leading-5 text-ink-700">{card.description}</p>
        <button type="button" onClick={() => open({ heading: card.cta, part: "Engine", requestService: true, service: card.service, note: `Preferred service: ${card.service}.` })} className="mt-auto inline-flex items-center gap-2 pt-4 text-left text-[13px] font-extrabold text-primary-700 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100">
          {card.cta}
          <Icon name="arrow-right" className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

export default function BuyingEssentialsSection() {
  return (
    <section id="buying-essentials" className="scroll-mt-24 bg-[#f4f7fb] py-8 sm:py-10 lg:py-12" aria-labelledby="buying-essentials-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-0">
        <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-primary-600">Buying essentials</p>
        <h2 id="buying-essentials-heading" className="mt-2.5 max-w-4xl text-[24px] font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-[30px] lg:text-[34px]">Choose Supply-Only, Supply And Fit, Or An Engine Rebuild</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {cards.map((card) => <ServiceOptionCard key={card.title} card={card} />)}
        </div>
        <p className="mt-4 text-[12px] leading-5 text-ink-700">Warranty, delivery, returns and refunds are determined by your chosen supplier. Confirm the applicable terms before purchasing or authorising work. Engined does not supply engines, carry out services or arbitrate disputes between buyers and suppliers.</p>
      </div>
    </section>
  );
}
