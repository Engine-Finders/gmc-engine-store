"use client";

import Link from "next/link";
import Icon from "./Icon";
import { useQuoteModal } from "./quote/QuoteModal";

function UkMapOutline() {
  return (
    <svg viewBox="0 0 220 330" className="h-full w-full" aria-hidden="true">
      <path d="M110 10 139 24l-4 28 18 23-11 25 16 24-12 23 16 23-19 25 8 25-22 32-11 34-23-18-19 7-13-18 8-29-13-22 13-21-8-24 14-25-7-24 13-20-3-28 17-21Z" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" />
      <path d="m67 215-20 18-14 27 15 29 18-4 12-26-5-20 9-14Z" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" />
      {[{ x: 124, y: 78 }, { x: 113, y: 142 }, { x: 132, y: 205 }, { x: 99, y: 252 }].map((pin) => (
        <g key={`${pin.x}-${pin.y}`} transform={`translate(${pin.x} ${pin.y})`}>
          <path d="M0 22C-8 11-12 7-12 0a12 12 0 1 1 24 0c0 7-4 11-12 22Z" fill="#0f5bea" stroke="white" strokeWidth="3" />
          <circle cy="0" r="3.5" fill="white" />
        </g>
      ))}
    </svg>
  );
}

function SupplierWorkshopVisual() {
  return (
    <div>
      <div className="relative min-h-[250px] overflow-hidden rounded-[18px] bg-[#25364b] sm:min-h-[300px]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,18,35,.2),rgba(5,18,35,.8)),url('/images/listings/default/bmw-1-bay.webp')] bg-cover bg-center" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,#15283d)]" />
        <div className="absolute bottom-7 left-[9%] h-3 w-2/5 rounded-full bg-black/45 blur-md" />
        {/* Approved engine cutout layered over a workshop background to keep the engine identifiable. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/engines/hero-real-om651.webp" alt="Replacement engine in a workshop" className="absolute bottom-6 left-[5%] h-[66%] w-[58%] object-contain object-bottom drop-shadow-[0_18px_12px_rgba(0,0,0,.45)]" loading="lazy" />
        <div className="absolute right-[2%] top-[7%] h-[86%] w-[34%] opacity-90 sm:right-[5%] sm:w-[31%]">
          <UkMapOutline />
        </div>
        <div className="absolute bottom-4 right-3 flex max-w-[82%] items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-ink-900 shadow-xl sm:right-5 sm:max-w-[75%] sm:px-4 sm:py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary-200 bg-primary-50 text-primary-700"><Icon name="config" className="h-5 w-5" /></span>
          <span className="h-10 w-px bg-primary-200" />
          <span className="text-[11px] leading-tight sm:text-xs"><strong className="block text-[13px] font-extrabold sm:text-sm">Matched by engine specification</strong><span>Nearby suppliers prioritised</span></span>
        </div>
      </div>
      <p className="mt-2 text-[12px] italic text-white/70">Illustrative workshop image</p>
    </div>
  );
}

export default function SupplierNetworkSection() {
  const { open } = useQuoteModal();

  return (
    <section id="supplier-network" className="scroll-mt-24 bg-white pb-8 sm:pb-10 lg:pb-12" aria-labelledby="supplier-network-heading">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-5">
        <div className="overflow-hidden rounded-[24px] bg-[#071a34] p-4 text-white sm:p-6 lg:p-7">
          <div className="grid gap-6 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:gap-7">
            <div>
              <h2 id="supplier-network-heading" className="max-w-xl text-[24px] font-extrabold leading-[1.05] tracking-tight sm:text-[30px]">Connect With Verified UK Engine Suppliers</h2>
              <p className="mt-3 max-w-xl text-[13px] leading-5 text-white/85">Engined connects you with multiple UK engine suppliers. Our supplier checks cover Companies House registration and a physical business address.</p>
              <p className="mt-3 max-w-xl text-[13px] leading-5 text-white/85">Tell us your vehicle registration, postcode and what you need. We match your engine requirements with suitable suppliers, prioritising those near you and considering nationwide options when needed.</p>

              <div className="mt-4 flex flex-wrap gap-2" aria-label="Available service options">
                {['Supply only', 'Supply & fit', 'Engine rebuilds'].map((label) => <span key={label} className="rounded-lg border border-white/80 px-3.5 py-1.5 text-[12px] font-bold text-white">{label}</span>)}
              </div>
              <p className="mt-3 max-w-xl text-[13px] leading-5 text-white/85">Suppliers may offer an engine on a supply-only basis, supply and fit a replacement, or quote to rebuild your existing engine. You choose the supplier and agree the work directly with them.</p>

              <div className="mt-5 flex gap-3">
                <Icon name="lock" className="mt-1 h-6 w-6 shrink-0 text-white" />
                <span className="h-12 w-px bg-white/45" />
                <div>
                  <h3 className="text-[15px] font-extrabold">Your enquiry, shared selectively</h3>
                  <p className="mt-1 text-[13px] leading-5 text-white/80">Your name, contact details and vehicle requirements are shared with a small number of suppliers selected for your enquiry. Read our <Link href="/contact" className="font-semibold text-white underline underline-offset-2 hover:text-primary-300">Privacy Policy</Link> to understand how your information is used and shared.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <button type="button" onClick={() => open({ heading: "Find suitable engine suppliers", part: "Engine", requestService: true })} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 text-[14px] font-extrabold text-[#071a34] transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200">
                  Find suitable engine suppliers
                  <Icon name="arrow-right" className="h-5 w-5" />
                </button>
                <a href="#faq-match" className="text-[13px] font-bold text-white underline decoration-primary-400 underline-offset-4 hover:text-primary-300">How supplier matching works</a>
              </div>
            </div>

            <SupplierWorkshopVisual />
          </div>

          <div className="mt-5 border-t border-white/30 pt-3 text-[12px] italic leading-5 text-white/70">Supplier verification covers business details. It is not an Engined guarantee of engine condition, workmanship or service quality.</div>
        </div>
      </div>
    </section>
  );
}
