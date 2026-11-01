"use client";

import Link from "next/link";
import Icon from "./Icon";
import SectionHeading from "./SectionHeading";
import brands from "@/data/brands.json";

type Brand = (typeof brands.brands)[number];

// Radiating, non-uniform illumination: brightest at the bottom-left, blue halo along the
// bottom, medium on the sides, weakest at the top. Soft blends, no hard circular halos.
function haze(glow: string, bright: string): string {
  return [
    `radial-gradient(52% 46% at 20% 94%, ${bright}9e 0%, transparent 68%)`, // bottom-left light source (strongest)
    `radial-gradient(94% 32% at 50% 106%, ${glow}66 0%, transparent 74%)`, // bottom edge halo
    `radial-gradient(30% 64% at -2% 58%, ${glow}4a 0%, transparent 72%)`, // left edge (medium)
    `radial-gradient(30% 58% at 102% 52%, ${glow}30 0%, transparent 74%)`, // right edge (medium)
    `radial-gradient(70% 26% at 50% -6%, ${glow}14 0%, transparent 80%)`, // top edge (weakest)
  ].join(", ");
}

// Luminous gradient border — brightest toward the bottom-left, fading up.
function borderGradient(glow: string, bright: string): string {
  return `linear-gradient(38deg, ${bright} 0%, ${glow} 40%, ${glow}55 72%, ${glow}1f 100%)`;
}

export default function BrowseByBrand({ data }: { data: typeof brands }) {
  const scrollToShop = () => {
    document.getElementById(data.allBrandsCard.targetId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-white pt-8 pb-10 lg:pt-10 lg:pb-12">
      <div className="max-w-content mx-auto px-3 lg:px-0 ">
        <SectionHeading title={data.sectionTitle} description={data.sectionDescription} linkText={data.viewAllText} linkHref={data.viewAllHref} />

        {/* Desktop: tall cards row */}
        <div className="mt-9 hidden lg:grid lg:grid-cols-7 lg:gap-5">
          {data.brands.map((brand: Brand) => (
            <Link key={brand.name} href={brand.href} className="group relative block h-[236px]">
              {/* radiating background haze */}
              <span aria-hidden className="pointer-events-none absolute -inset-4 rounded-[30px] blur-2xl opacity-80 transition-opacity duration-300 group-hover:opacity-100" style={{ background: haze(brand.glow, brand.glowBright) }} />
              {/* luminous gradient border */}
              <div className="relative h-full rounded-xl p-[1.5px] transition-transform duration-300 group-hover:-translate-y-1.5" style={{ background: borderGradient(brand.glow, brand.glowBright), boxShadow: `0 0 16px -2px ${brand.glow}b0` }}>
                <div className="relative h-full overflow-hidden rounded-[15px] bg-gradient-to-b from-navy-800 to-navy-950">
                  {/* inner bottom-left light source */}
                  <span className="pointer-events-none absolute left-0 bottom-0 h-3/5 w-2/3" style={{ background: `radial-gradient(72% 82% at 0% 100%, ${brand.glow}5c 0%, transparent 62%)` }} />
                  <div className="relative flex flex-col items-center pt-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={brand.logo} alt={`${brand.name} logo`} className="h-11 w-auto object-contain" />
                    <p className="mt-2.5 text-[13px] font-bold text-white text-center px-2 leading-tight">{brand.name}</p>
                    <p className="mt-1 text-[11px] text-white/55">{brand.engineCount} Engines</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.car} alt="" className="absolute bottom-7 left-0 w-full h-[84px] object-cover object-center" />
                  {/* right-side dark gradient so the arrow stands out */}
                  <span className="pointer-events-none absolute bottom-7 right-0 h-[84px] w-2/5 bg-gradient-to-l from-black/70 via-black/30 to-transparent" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.car} alt="" aria-hidden className="absolute bottom-0 left-0 w-full h-[22px] object-cover object-top scale-y-[-1] opacity-20" />
                  <span className="absolute bottom-3.5 right-3.5 text-white/85 group-hover:text-white group-hover:translate-x-0.5 transition-all drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                    <Icon name="arrow-right" className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          <button onClick={scrollToShop} className="group relative block h-[236px]">
            <div className="relative h-full rounded-xl overflow-hidden bg-gradient-to-b from-navy-800 to-navy-950 border border-white/10 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-primary-500/40 group-hover:shadow-card-hover flex flex-col items-center justify-center gap-3">
              <span className="text-white text-3xl tracking-widest leading-none">•••</span>
              <p className="text-[13px] font-bold text-white">{data.allBrandsCard.name}</p>
              <p className="text-[11px] text-white/55">{data.allBrandsCard.count}</p>
              <span className="absolute bottom-3.5 right-3.5 text-white/85 group-hover:text-white group-hover:translate-x-0.5 transition-all drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                <Icon name="arrow-right" className="w-4 h-4" />
              </span>
            </div>
          </button>
        </div>

        {/* Mobile: full-width horizontal cards */}
        <div className="mt-6 flex flex-col gap-4 lg:hidden">
          {data.brands.map((brand: Brand) => (
            <Link key={brand.name} href={brand.href} className="group relative block">
              <span aria-hidden className="pointer-events-none absolute -inset-3 rounded-[26px] blur-2xl opacity-80" style={{ background: haze(brand.glow, brand.glowBright) }} />
              <div className="relative rounded-xl p-[1.5px]" style={{ background: borderGradient(brand.glow, brand.glowBright), boxShadow: `0 0 14px -3px ${brand.glow}b0` }}>
                <div className="relative flex items-center h-[92px] overflow-hidden rounded-[15px] bg-gradient-to-r from-navy-800 to-navy-950 pl-5">
                  <span className="pointer-events-none absolute left-0 bottom-0 h-full w-1/3" style={{ background: `radial-gradient(80% 90% at 0% 100%, ${brand.glow}55 0%, transparent 60%)` }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.car} alt="" className="absolute right-0 bottom-0 h-full w-[46%] object-cover object-center" />
                  <span className="absolute right-[46%] top-0 h-full w-16 bg-gradient-to-l from-transparent to-navy-900" />
                  {/* right-side dark gradient so the arrow stands out */}
                  <span className="pointer-events-none absolute right-0 bottom-0 h-full w-[28%] bg-gradient-to-l from-black/70 via-black/30 to-transparent" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.logo} alt={`${brand.name} logo`} className="relative h-12 w-14 object-contain shrink-0" />
                  <div className="relative ml-3 min-w-0 max-w-[44%]">
                    <p className="text-[15px] font-bold text-white leading-tight">{brand.name}</p>
                    <p className="text-[12px] text-white/55">{brand.engineCount} Engines</p>
                  </div>
                  <span className="absolute right-3.5 bottom-2.5 z-40 text-white group-hover:text-white transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                    <Icon name="arrow-right" className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
          <button onClick={scrollToShop} className="group relative flex items-center h-[92px] rounded-xl overflow-hidden bg-gradient-to-r from-navy-800 to-navy-950 border border-white/10 px-5 gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-full border border-primary-400/50 text-white text-lg tracking-widest shrink-0">•••</span>
            <div className="text-left">
              <p className="text-[15px] font-bold text-white leading-tight">{data.allBrandsCard.name}</p>
              <p className="text-[12px] text-white/55">{data.allBrandsCard.count}</p>
            </div>
            <span className="ml-auto text-white/85 group-hover:text-white transition-colors">
              <Icon name="arrow-right" className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
