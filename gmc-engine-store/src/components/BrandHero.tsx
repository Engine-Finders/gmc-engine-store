"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "./Icon";
import UkFlag from "./UkFlag";
import { useRegCheck } from "./quote/QuoteModal";
import type { BrandPageData } from "@/lib/brand";

type HeroData = BrandPageData["hero"];
type Card = HeroData["cards"][number] & { priceFrom?: string };

function EngineCard({ card, isCenter, onActivate }: { card: Card; isCenter: boolean; onActivate: () => void }) {
  return (
    <button type="button" onClick={onActivate} aria-label={`${card.code} engine`} className="group relative block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050913]">
      <span className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500" style={{ opacity: isCenter ? 1 : 0.52, boxShadow: "-10px 0 24px -8px rgba(56,136,255,0.5), 10px 0 24px -8px rgba(225,238,255,0.3), 0 20px 36px -14px rgba(56,136,255,0.5)" }} />
      <span className="relative block overflow-hidden rounded-2xl p-3" style={{ background: "linear-gradient(160deg, rgba(34,70,150,0.72) 0%, rgba(12,26,64,0.8) 34%, rgba(5,10,26,0.86) 100%)", boxShadow: "inset 6px 0 12px -10px rgba(80,155,255,0.32), inset -6px 0 12px -10px rgba(240,247,255,0.26), 0 20px 36px -14px rgba(0,0,0,0.75)" }}>
        <span className="pointer-events-none absolute inset-0 rounded-2xl" style={{ padding: 1.5, background: ["radial-gradient(50px 50px at 0 0, rgba(150,200,255,1), transparent 70%)", "radial-gradient(50px 50px at 0 100%, rgba(120,185,255,1), transparent 70%)", "radial-gradient(50px 50px at 100% 0, rgba(255,255,255,1), transparent 70%)", "radial-gradient(50px 50px at 100% 100%, rgba(255,255,255,1), transparent 70%)", "linear-gradient(90deg, rgba(70,140,255,0.6) 0%, rgba(90,150,255,0.22) 45%, rgba(200,225,255,0.25) 60%, rgba(240,247,255,0.65) 100%)"].join(", "), WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)" }} />
        <span className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: ["radial-gradient(90px 80px at 0 0, rgba(80,150,255,0.55), transparent 70%)", "radial-gradient(90px 80px at 0 100%, rgba(80,150,255,0.5), transparent 70%)", "radial-gradient(90px 80px at 100% 0, rgba(235,244,255,0.4), transparent 70%)", "radial-gradient(90px 80px at 100% 100%, rgba(235,244,255,0.36), transparent 70%)"].join(", ") }} />
        <span className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 22%, transparent 50%)" }} />

        <div className="relative flex items-start justify-between"><div className="min-w-0"><p className="text-[15px] font-extrabold leading-none tracking-tight text-white sm:text-lg [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">{card.code}</p><p className="mt-1 truncate text-[9px] text-white/85 sm:text-[11px] [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">{card.name}</p></div><Icon name="heart" className="h-3.5 w-3.5 shrink-0 text-white/80 sm:h-4 sm:w-4" /></div>
        <span className="relative mt-1 inline-block rounded-md bg-primary-600 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-white sm:mt-1.5 sm:text-[8px]">Engine family</span>
        <div className="relative mt-1 flex h-[100px] items-center justify-center px-1 sm:h-[136px]"><img src={card.image} alt="" draggable={false} className="h-full w-full object-contain [filter:drop-shadow(0_8px_10px_rgba(0,0,0,0.6))]" /></div>
        <div className="relative flex items-end justify-between border-t border-white/20 pt-2"><div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.14em] text-primary-200/90">Specs</p><p className="mt-0.5 truncate text-[10px] font-bold text-white">{card.ps}</p><p className="truncate text-[10px] font-medium text-white/85">{card.nm}</p></div><div className="flex shrink-0 flex-col items-end gap-1"><span className="rounded-md border border-primary-200/35 bg-primary-400/15 px-1.5 py-1 text-[9px] font-bold leading-none text-white shadow-[0_0_10px_rgba(96,165,250,0.15)]">{card.priceFrom ? `From ${card.priceFrom}` : "Supplier pricing"}</span><Icon name="arrow-right" className="h-4 w-4 text-primary-100" /></div></div>
      </span>
    </button>
  );
}

function TrustStrip({ badges: _badges }: { badges: HeroData["trustBadges"] }) {
  const items = [
    { icon: "shield-check", title: "Verified UK businesses", subtitle: "Companies House registration and address checked." },
    { icon: "cog", title: "Engine-specific matching", subtitle: "Your supplier confirms the exact engine specification." },
    { icon: "pin", title: "Local & nationwide suppliers", subtitle: "Nearby suppliers prioritised where suitable." },
    { icon: "wrench", title: "Choose your service", subtitle: "Supply only, supply and fit, or rebuild your engine." },
  ];
  return <div className="mt-8 border-t border-white/15 pt-5 lg:mt-9 lg:pt-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/15">{items.map((item) => <div key={item.title} className="flex items-start gap-3 lg:px-5 first:lg:pl-0"><Icon name={item.icon} className="mt-0.5 h-7 w-7 shrink-0 text-primary-400" /><div><p className="text-[13px] font-bold leading-tight text-white">{item.title}</p><p className="mt-1 text-[11px] leading-snug text-white/60">{item.subtitle}</p></div></div>)}</div></div>;
}

export default function BrandHero({ data }: { data: HeroData }) {
  const cards = (data.cards as Card[]).slice(0, 5);
  const total = cards.length;
  const rc = useRegCheck();
  const [center, setCenter] = useState(0);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    const timer = window.setInterval(() => setCenter((value) => (value + 1) % total), 4500);
    return () => window.clearInterval(timer);
  }, [total]);

  function step(direction: 1 | -1) { setCenter((value) => (value + direction + total) % total); }

  return (
    <section className="hero-bg relative overflow-hidden pb-8 text-white sm:pb-0">
      <div className="hero-dots pointer-events-none absolute inset-0 overflow-hidden" />
      <div className="relative z-10 mx-auto w-full max-w-content px-4 pb-2 pt-4 sm:px-6 lg:px-8 lg:pb-6 lg:pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-semibold text-white/55"><Link href="/" className="transition-colors hover:text-white">Home</Link><span aria-hidden>/</span><Link href="/brands" className="transition-colors hover:text-white">Brands</Link><span aria-hidden>/</span><span aria-current="page" className="text-white/85">{data.brand}</span></nav>
        <div className="mt-6 grid grid-cols-1 items-center gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-8">
          <div className="relative z-10">
            <h1 className="text-[30px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-[46px]"><span className="flex items-center gap-3 lg:gap-4"><img src={data.logo} alt={`${data.name} logo`} draggable={false} className="h-11 w-11 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] lg:h-[60px] lg:w-[60px]" /><span>{data.name}</span></span><span className="mt-1 block">{data.title}</span></h1>
            <p className="mt-3 text-[22px] font-bold leading-tight text-primary-400 sm:text-[26px]">{data.highlight}</p>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75 sm:text-[14px]">{data.description}</p>
            <form id="reg-check" onSubmit={rc.onSubmit} className="relative mt-5 max-w-md overflow-hidden rounded-xl border border-white/15 bg-white/[0.07] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6),0_0_30px_-14px_rgba(96,165,250,0.5),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl lg:mt-6"><span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.10] to-transparent" /><div className="relative flex items-center"><span className="flex shrink-0 items-center gap-1.5 self-stretch rounded-l-xl border-r border-white/15 bg-white/10 px-2.5"><UkFlag className="h-4 w-6 rounded-sm" /><span className="text-[11px] font-bold text-white/85">{data.regCheck.countryFlag}</span></span><label htmlFor="brand-hero-reg" className="sr-only">Vehicle registration</label><input id="brand-hero-reg" type="text" placeholder={data.regCheck.placeholder} value={rc.reg} onChange={rc.onChange} name="reg" autoComplete="off" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base font-semibold tracking-wide text-white outline-none placeholder:text-white/45 sm:text-[13px]" /><button type="submit" className="shrink-0 self-stretch rounded-r-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 ease-out hover:bg-primary-500 hover:shadow-cta lg:px-5">{data.regCheck.buttonText}</button></div></form>
            <Link href="#shop-by-model" className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 transition-colors hover:text-white">{data.regCheck.helpText}<Icon name="chevron-right" className="h-3 w-3" /></Link>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/55"><span>UK suppliers</span><span aria-hidden>•</span><span>Indicative prices</span><span aria-hidden>•</span><span>Supplier-confirmed specification</span></div>
          </div>

          <div className="relative min-w-0">
            <div className="relative z-20 mt-4 h-[220px] sm:mt-0 sm:h-[286px] lg:h-[276px]"><div className="relative mx-auto h-full max-w-[560px]">
              {total > 1 && <><button type="button" onClick={() => step(-1)} aria-label="Previous engine" className="absolute -left-1 top-1/2 z-30 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-400/60 bg-primary-500/10 text-primary-300 backdrop-blur-xl transition-all hover:bg-primary-500/25 hover:text-white sm:left-0"><Icon name="chevron-left" className="h-4 w-4" /></button><button type="button" onClick={() => step(1)} aria-label="Next engine" className="absolute -right-1 top-1/2 z-30 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-400/60 bg-primary-500/10 text-primary-300 backdrop-blur-xl transition-all hover:bg-primary-500/25 hover:text-white sm:right-0"><Icon name="chevron-right" className="h-4 w-4" /></button></>}
              <div className="absolute inset-0 flex items-center justify-center">{cards.map((card, cardIndex) => { const forwardOffset = (cardIndex - center + total) % total; const offset = forwardOffset > total / 2 ? forwardOffset - total : forwardOffset; const distance = Math.abs(offset); const isCenter = offset === 0; const isSide = distance === 1; const xOffset = offset * (narrow ? 120 : 190); const yOffset = isCenter ? -4 : isSide ? 2 : 12; const scale = isCenter ? 0.96 : isSide ? 0.74 : 0.54; const opacity = isCenter ? 1 : isSide ? 0.72 : 0; const rotate = isCenter ? 0 : offset * -6; const floatVars = { "--dur": `${7 + (cardIndex % 3) * 0.7}s`, "--delay": `${-(cardIndex % 3) * 1.2}s`, "--amp": isCenter ? "5px" : "7px" } as CSSProperties; return <motion.div key={card.code} initial={false} animate={{ x: xOffset, y: yOffset, scale, opacity, rotate }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }} className="absolute w-[126px] sm:w-[202px]" style={{ zIndex: isCenter ? 25 : isSide ? 15 : 1, pointerEvents: isCenter || isSide ? "auto" : "none" }}><div className="hero-float" style={floatVars}><EngineCard card={card} isCenter={isCenter} onActivate={() => isCenter ? window.location.assign(card.href) : setCenter(cardIndex)} /></div></motion.div>; })}</div>
            </div></div>
            <div className="brand-hero-plate"><svg viewBox="0 0 1000 320" preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute bottom-0 left-1/2 h-[132px] w-[106%] -translate-x-1/2" fill="none" style={{ filter: "drop-shadow(0 0 8px rgba(96,165,250,0.55))", zIndex: 1 }}><ellipse cx="500" cy="180" rx="470" ry="96" stroke="#5aa0ff" strokeWidth="2.5" opacity="0.5" /><ellipse cx="500" cy="180" rx="355" ry="68" stroke="#8ec0ff" strokeWidth="1.5" opacity="0.36" /><ellipse cx="500" cy="180" rx="235" ry="44" stroke="#8ec0ff" strokeWidth="1.5" opacity="0.24" /></svg><img src={data.carImage} alt={`${data.name} car`} draggable={false} className="vehicle-cutout brand-hero-car pointer-events-none select-none" style={{ zIndex: 10 }} /></div>
            {total > 1 && <div className="relative z-30 -mt-2 flex items-center justify-center gap-2"><span className="sr-only">Engine preview controls</span>{cards.map((card, index) => <button key={card.code} type="button" onClick={() => setCenter(index)} aria-label={`Show ${card.code}`} aria-current={center === index ? "true" : undefined} className={`h-2.5 w-2.5 rounded-full transition ${center === index ? "bg-primary-500" : "bg-white/35 hover:bg-white/65"}`} />)}</div>}
            <p className="mt-2 text-center text-[10px] text-white/55">Indicative starting prices — supplier confirms final quote</p>
          </div>
        </div>
        <TrustStrip badges={data.trustBadges} />
      </div>
    </section>
  );
}
