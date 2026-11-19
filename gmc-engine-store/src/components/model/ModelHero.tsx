import Link from "next/link";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";
import { resolveHref } from "@/lib/links";
import { brandSlugFor } from "@/lib/slugs";
import ModelHeroCarousel from "./ModelHeroCarousel";

type Data = ModelPageData["hero"];

export default function ModelHero({ data, trustBadges }: { data: Data; trustBadges: Data["trustBadges"] }) {
  return (
    <section className="hero-bg relative overflow-hidden pb-5 text-white sm:pb-0">
      <div className="hero-dots pointer-events-none absolute inset-0 overflow-hidden" />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-2 pt-4 sm:px-6 lg:px-8 lg:pb-6 lg:pt-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/55">
          <Link href="/" className="transition-colors hover:text-white">Home</Link>
          <Icon name="chevron-right" className="h-3 w-3 opacity-60" />
          <Link href={resolveHref("/brands")} className="transition-colors hover:text-white">Brands</Link>
          <Icon name="chevron-right" className="h-3 w-3 opacity-60" />
          <Link href={resolveHref(`/${brandSlugFor(data.brand)}`)} className="transition-colors hover:text-white">{data.brand}</Link>
          <Icon name="chevron-right" className="h-3 w-3 opacity-60" />
          <span aria-current="page" className="text-white/85">{data.model} Engines</span>
        </nav>

        <div className="mt-3 grid grid-cols-1 items-center gap-2 sm:mt-6 lg:mt-8 lg:grid-cols-5 lg:gap-0">
          <div className="relative z-10 lg:col-span-2 lg:-translate-y-6">
            <div className="flex items-center gap-3 lg:gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.logo} alt="" draggable={false} className="h-11 w-11 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] lg:h-[60px] lg:w-[60px]" />
              <span className="text-[15px] font-semibold text-white/75">{data.brand}</span>
            </div>
            <h1 className="mt-1 text-[30px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-[46px]">
              <span className="block">{data.model}</span>
              <span className="mt-1 block text-[22px] sm:text-3xl lg:text-[30px]">{data.titleSuffix}</span>
              <span className="mt-1 block text-[26px] text-primary-400 sm:text-4xl lg:text-[46px]">{data.highlight}</span>
            </h1>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75 sm:text-[14px]">{data.description}</p>
            <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-white/55">{data.longDescription}</p>

            <form id="reg-check" className="relative mt-5 h-[54px] w-full max-w-[580px] overflow-hidden rounded-lg border border-primary-500/30 bg-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.65),0_0_30px_-14px_rgba(96,165,250,0.55)] lg:mt-6 lg:h-[60px]">
              <div className="relative flex h-full items-stretch">
                <span className="flex w-[46px] shrink-0 items-center justify-center bg-[#174bb6] text-[12px] font-extrabold tracking-wide text-white sm:w-[58px] sm:text-[13px]">{data.regCheck.countryFlag}</span>
                <label htmlFor="model-hero-reg" className="sr-only">Vehicle registration</label>
                <input id="model-hero-reg" type="text" placeholder={data.regCheck.placeholder} className="min-w-0 flex-1 bg-white px-2.5 text-[12px] font-semibold tracking-wide text-ink-700 outline-none placeholder:text-ink-500 sm:px-4 sm:text-[13px]" />
                <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap bg-[#174bb6] px-3 text-[11px] font-extrabold text-white transition-all duration-200 ease-out hover:bg-[#2058c7] hover:shadow-cta sm:gap-2 sm:px-6 sm:text-[14px]">
                  {data.regCheck.buttonText}
                  <Icon name="arrow-right" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="relative min-w-0 lg:col-span-3 lg:-translate-x-10">
            <div className="relative z-20 mt-0 hidden h-[218px] sm:h-[268px] lg:-translate-y-8 lg:block lg:h-[235px]">
              <div className="relative mx-auto h-full max-w-[900px]">
                <ModelHeroCarousel cards={data.cards} desktop />
              </div>
            </div>
            <div className="relative z-20 lg:hidden">
              <ModelHeroCarousel cards={data.cards} />
            </div>

            <div className="brand-hero-plate lg:-mt-12">
              <svg viewBox="0 0 1000 320" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 left-1/2 h-[96px] w-[96%] -translate-x-1/2 sm:h-[112px] sm:w-[92%] lg:h-[180px] lg:w-[96%]" fill="none" style={{ filter: "drop-shadow(0 0 5px rgba(72,150,255,0.95)) drop-shadow(0 0 16px rgba(37,99,235,0.72))", zIndex: 1 }}>
                <ellipse cx="500" cy="270" rx="450" ry="54" stroke="#67b1ff" strokeWidth="2.5" opacity="0.9" />
                <ellipse cx="500" cy="270" rx="350" ry="38" stroke="#83c2ff" strokeWidth="1.5" opacity="0.62" />
                <ellipse cx="500" cy="270" rx="220" ry="22" stroke="#8ecbff" strokeWidth="1.5" opacity="0.42" />
              </svg>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.carImage} alt={data.model} draggable={false} className="vehicle-cutout brand-hero-car pointer-events-none select-none" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15 pt-5 lg:mt-2 lg:pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/15">
            {trustBadges.map((badge) => (
              <div key={badge.title} className="flex items-start gap-3 lg:px-5 first:lg:pl-0">
                <Icon name={badge.icon} className="mt-0.5 h-7 w-7 shrink-0 text-primary-400" />
                <div>
                  <p className="text-[13px] font-bold leading-tight text-white">{badge.title}</p>
                  <p className="mt-1 text-[11px] leading-snug text-white/60">{badge.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
