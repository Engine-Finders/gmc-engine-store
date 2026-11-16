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
    <button type="button" onClick={onActivate} aria-label={`${card.code} engine`} className="group relative block w-full text-center outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050913]">
      <span className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500" style={{ opacity: isCenter ? 1 : 0.7, boxShadow: isCenter ? "0 0 34px -5px rgba(45,135,255,0.75), 0 22px 38px -16px rgba(0,0,0,0.85)" : "0 18px 32px -18px rgba(0,0,0,0.8)" }} />
      <span className="relative block min-h-[205px] overflow-hidden rounded-2xl border p-2.5 sm:min-h-[260px] sm:p-3" style={{ borderColor: isCenter ? "rgba(92,170,255,0.96)" : "rgba(92,154,235,0.58)", background: isCenter ? "linear-gradient(160deg, rgba(25,71,155,0.9) 0%, rgba(8,26,68,0.94) 55%, rgba(5,11,28,0.96) 100%)" : "linear-gradient(160deg, rgba(25,57,126,0.84) 0%, rgba(8,22,57,0.93) 58%, rgba(4,9,24,0.96) 100%)" }}>
        <span className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.16), transparent 34%), radial-gradient(90px 70px at 8% 0%, rgba(80,160,255,0.25), transparent 72%)" }} />
        <span className="relative block text-[23px] font-extrabold leading-none tracking-tight text-white sm:text-[31px] [text-shadow:0_2px_4px_rgba(0,0,0,0.55)]">{card.code}</span>
        <span className="relative mt-1 block truncate text-[10px] font-medium text-white/80 sm:text-[13px]">{card.name}</span>
        <span className="relative mt-2 flex h-[112px] items-center justify-center sm:mt-3 sm:h-[150px]"><img src={card.image} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.7)]" /></span>
        <span className="relative mt-2 block border-t border-white/20 pt-2 text-[10px] text-white/70 sm:mt-3 sm:text-[12px]">{card.priceFrom ? <>From <strong className="text-[14px] text-white sm:text-[17px]">{card.priceFrom}</strong></> : "Supplier-confirmed pricing"}</span>
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
            <div className="relative z-20 mt-4 h-[230px] sm:mt-0 sm:h-[286px] lg:h-[276px]"><div className="relative mx-auto h-full max-w-[720px]">
              {total > 1 && <><button type="button" onClick={() => step(-1)} aria-label="Previous engine" className="absolute -left-1 top-1/2 z-30 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-400/60 bg-primary-500/10 text-primary-300 backdrop-blur-xl transition-all hover:bg-primary-500/25 hover:text-white sm:left-0"><Icon name="chevron-left" className="h-4 w-4" /></button><button type="button" onClick={() => step(1)} aria-label="Next engine" className="absolute -right-1 top-1/2 z-30 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-400/60 bg-primary-500/10 text-primary-300 backdrop-blur-xl transition-all hover:bg-primary-500/25 hover:text-white sm:right-0"><Icon name="chevron-right" className="h-4 w-4" /></button></>}
              <div className="absolute inset-0 flex items-center justify-center">{cards.map((card, cardIndex) => { const forwardOffset = (cardIndex - center + total) % total; const offset = forwardOffset > total / 2 ? forwardOffset - total : forwardOffset; const distance = Math.abs(offset); const isCenter = offset === 0; const isSide = distance === 1; const visible = narrow ? distance <= 1 : distance <= 2; const xOffset = narrow ? offset * 116 : distance === 0 ? 0 : Math.sign(offset) * (distance === 1 ? 140 : 260); const yOffset = isCenter ? -5 : distance === 1 ? 7 : 14; const scale = isCenter ? 0.96 : distance === 1 ? 0.82 : 0.74; const opacity = visible ? (isCenter ? 1 : distance === 1 ? 0.86 : 0.62) : 0; const rotate = isCenter ? 0 : distance === 1 ? offset * -2 : offset * -1; const floatVars = { "--dur": `${7 + (cardIndex % 3) * 0.7}s`, "--delay": `${-(cardIndex % 3) * 1.2}s`, "--amp": isCenter ? "5px" : "7px" } as CSSProperties; return <motion.div key={card.code} initial={false} animate={{ x: xOffset, y: yOffset, scale, opacity, rotate }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }} className="absolute w-[126px] sm:w-[184px]" style={{ zIndex: isCenter ? 25 : isSide ? 15 : 10, pointerEvents: visible ? "auto" : "none" }}><div className="hero-float" style={floatVars}><EngineCard card={card} isCenter={isCenter} onActivate={() => isCenter ? window.location.assign(card.href) : setCenter(cardIndex)} /></div></motion.div>; })}</div>
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
