"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "./Icon";
import { useRegCheck } from "./quote/QuoteModal";
import type { BrandPageData } from "@/lib/brand";

type HeroData = BrandPageData["hero"];
type Card = HeroData["cards"][number] & { priceFrom?: string };

function EngineCard({ card, isCenter, onActivate }: { card: Card; isCenter: boolean; onActivate: () => void }) {
  return (
    <button type="button" onClick={onActivate} aria-label={`${card.code} engine`} className="group relative block w-full text-center outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050913]">
      <span className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500" style={{ opacity: isCenter ? 1 : 0.7, boxShadow: isCenter ? "0 0 34px -5px rgba(45,135,255,0.75), 0 22px 38px -16px rgba(0,0,0,0.85)" : "0 18px 32px -18px rgba(0,0,0,0.8)" }} />
      <span className="relative block min-h-[205px] overflow-hidden rounded-2xl border p-2.5 sm:min-h-[250px] sm:p-3 lg:min-h-[230px]" style={{ borderColor: isCenter ? "rgba(92,170,255,0.96)" : "rgba(92,154,235,0.58)", background: isCenter ? "linear-gradient(160deg, rgba(25,71,155,0.9) 0%, rgba(8,26,68,0.94) 55%, rgba(5,11,28,0.96) 100%)" : "linear-gradient(160deg, rgba(25,57,126,0.84) 0%, rgba(8,22,57,0.93) 58%, rgba(4,9,24,0.96) 100%)" }}>
        <span className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.16), transparent 34%), radial-gradient(90px 70px at 8% 0%, rgba(80,160,255,0.25), transparent 72%)" }} />
        <span className="relative block text-[23px] font-extrabold leading-none tracking-tight text-white sm:text-[31px] [text-shadow:0_2px_4px_rgba(0,0,0,0.55)]">{card.code}</span>
        <span className="relative mt-1 block truncate text-[10px] font-medium text-white/80 sm:text-[13px]">{card.name}</span>
        <span className="relative mt-2 flex h-[116px] items-center justify-center sm:mt-3 sm:h-[142px] lg:h-[124px]"><img src={card.image} alt="" draggable={false} className="h-full w-full scale-105 object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.7)]" /></span>
        <span className="relative mt-2 block border-t border-white/20 pt-2 text-[10px] font-semibold text-white/90 sm:mt-3 sm:text-[12px]">{card.priceFrom ? <>From <strong className="text-[14px] text-white sm:text-[17px]">{card.priceFrom}</strong></> : "Request A Quote"}</span>
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
  return <div className="mt-8 border-t border-white/15 pt-5 lg:mt-2 lg:pt-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-white/15">{items.map((item) => <div key={item.title} className="flex items-start gap-3 lg:px-5 first:lg:pl-0"><Icon name={item.icon} className="mt-0.5 h-7 w-7 shrink-0 text-primary-400" /><div><p className="text-[13px] font-bold leading-tight text-white">{item.title}</p><p className="mt-1 text-[11px] leading-snug text-white/60">{item.subtitle}</p></div></div>)}</div></div>;
}

export default function BrandHero({ data, carImages = [] }: { data: HeroData; carImages?: string[] }) {
  const cards = (data.cards as Card[]).slice(0, 5);
  const total = cards.length;
  const rc = useRegCheck();
  const [center, setCenter] = useState(0);
  const [carIndex, setCarIndex] = useState(0);
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

  const vehicles = [data.carImage, ...carImages.filter((image) => image && image !== data.carImage)].slice(0, 5);
  useEffect(() => {
    if (vehicles.length < 2) return;
    const timer = window.setInterval(() => setCarIndex((value) => (value + 1) % vehicles.length), 5200);
    return () => window.clearInterval(timer);
  }, [vehicles.length]);

  function step(direction: 1 | -1) { setCenter((value) => (value + direction + total) % total); }
  function stepVehicle(direction: 1 | -1) { setCarIndex((value) => (value + direction + vehicles.length) % vehicles.length); }

  return (
    <section className="hero-bg relative overflow-hidden pb-8 text-white sm:pb-0">
      <div className="hero-dots pointer-events-none absolute inset-0 overflow-hidden" />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-2 pt-4 sm:px-6 lg:px-8 lg:pb-6 lg:pt-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-semibold text-white/55"><Link href="/" className="transition-colors hover:text-white">Home</Link><span aria-hidden>/</span><Link href="/brands" className="transition-colors hover:text-white">Brands</Link><span aria-hidden>/</span><span aria-current="page" className="text-white/85">{data.brand}</span></nav>
        <div className="mt-3 grid grid-cols-1 items-center gap-2 sm:mt-6 lg:mt-8 lg:grid-cols-5 lg:gap-0">
          <div className="relative z-10 lg:col-span-2 lg:-translate-y-6">
            <h1 className="text-[30px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-[46px]"><span className="flex items-center gap-3 lg:gap-4"><img src={data.logo} alt={`${data.name} logo`} draggable={false} className="h-11 w-11 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] lg:h-[60px] lg:w-[60px]" /><span>{data.name}</span></span><span className="mt-1 block">{data.title}</span></h1>
            <p className="mt-3 text-[22px] font-bold leading-tight text-primary-400 sm:text-[26px]">{data.highlight}</p>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/75 sm:text-[14px]">{data.description}</p>
            <form id="reg-check" onSubmit={rc.onSubmit} className="relative mt-5 h-[54px] w-full max-w-[580px] overflow-hidden rounded-lg border border-primary-500/30 bg-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.65),0_0_30px_-14px_rgba(96,165,250,0.55)] lg:mt-6 lg:h-[60px]"><div className="relative flex h-full items-stretch"><span className="flex w-[46px] shrink-0 items-center justify-center bg-[#174bb6] text-[12px] font-extrabold tracking-wide text-white sm:w-[58px] sm:text-[13px]">{data.regCheck.countryFlag}</span><label htmlFor="brand-hero-reg" className="sr-only">Vehicle registration</label><input id="brand-hero-reg" type="text" placeholder={data.regCheck.placeholder} value={rc.reg} onChange={rc.onChange} name="reg" autoComplete="off" className="min-w-0 flex-1 bg-white px-2.5 text-[12px] font-semibold tracking-wide text-ink-700 outline-none placeholder:text-ink-500 sm:px-4 sm:text-[13px]" /><button type="submit" className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap bg-[#174bb6] px-3 text-[11px] font-extrabold text-white transition-all duration-200 ease-out hover:bg-[#2058c7] hover:shadow-cta sm:gap-2 sm:px-6 sm:text-[14px]"><span className="sm:hidden">Find engine</span><span className="hidden sm:inline">{data.regCheck.buttonText}</span><Icon name="arrow-right" className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button></div></form>
            <Link href="#shop-by-model" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 transition-colors hover:text-white">{data.regCheck.helpText}<Icon name="chevron-right" className="h-3 w-3" /></Link>
            <div className="mt-3 flex flex-nowrap items-center gap-x-2 whitespace-nowrap text-[9px] text-white/75 sm:gap-x-3 sm:text-[11px]"><span>UK suppliers</span><span aria-hidden>•</span><span>Indicative prices</span><span aria-hidden>•</span><span>Supplier-confirmed specification</span></div>
          </div>

          <div className="relative min-w-0 lg:col-span-3 lg:-translate-x-10">
            <div className="relative z-20 mt-0 h-[218px] sm:mt-0 sm:h-[268px] lg:-translate-y-8 lg:h-[235px]"><div className="relative mx-auto h-full max-w-[900px]">
              {total > 1 && <><button type="button" onClick={() => step(-1)} aria-label="Previous engine" className="absolute -left-1 top-1/2 z-30 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-400/60 bg-primary-500/10 text-primary-300 backdrop-blur-xl transition-all hover:bg-primary-500/25 hover:text-white sm:left-0"><Icon name="chevron-left" className="h-4 w-4" /></button><button type="button" onClick={() => step(1)} aria-label="Next engine" className="absolute -right-1 top-1/2 z-30 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-400/60 bg-primary-500/10 text-primary-300 backdrop-blur-xl transition-all hover:bg-primary-500/25 hover:text-white sm:right-0"><Icon name="chevron-right" className="h-4 w-4" /></button></>}
              <div className="absolute inset-0 flex items-center justify-center">{cards.map((card, cardIndex) => { const forwardOffset = (cardIndex - center + total) % total; const offset = forwardOffset > total / 2 ? forwardOffset - total : forwardOffset; const distance = Math.abs(offset); const isCenter = offset === 0; const isSide = distance === 1; const visible = narrow ? distance <= 1 : distance <= 2; const xOffset = narrow ? offset * 116 : distance === 0 ? 0 : Math.sign(offset) * (distance === 1 ? 165 : 305); const yOffset = isCenter ? -5 : distance === 1 ? 5 : 10; const scale = isCenter ? 0.96 : distance === 1 ? 0.82 : 0.74; const opacity = visible ? (isCenter ? 1 : distance === 1 ? 0.86 : 0.62) : 0; const rotate = isCenter ? 0 : distance === 1 ? offset * 2 : offset * 3; const floatVars = { "--dur": `${7 + (cardIndex % 3) * 0.7}s`, "--delay": `${-(cardIndex % 3) * 1.2}s`, "--amp": isCenter ? "5px" : "7px" } as CSSProperties; return <motion.div key={card.code} initial={false} animate={{ x: xOffset, y: yOffset, scale, opacity, rotate }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }} className="absolute w-[126px] sm:w-[184px] lg:w-[198px]" style={{ zIndex: isCenter ? 25 : isSide ? 15 : 10, pointerEvents: visible ? "auto" : "none" }}><div className="hero-float" style={floatVars}><EngineCard card={card} isCenter={isCenter} onActivate={() => isCenter ? window.location.assign(card.href) : setCenter(cardIndex)} /></div></motion.div>; })}</div>
            </div></div>
            <div className="brand-hero-plate lg:-mt-12"><svg viewBox="0 0 1000 320" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 left-1/2 h-[96px] w-[96%] -translate-x-1/2 sm:h-[112px] sm:w-[92%] lg:h-[180px] lg:w-[96%]" fill="none" style={{ filter: "drop-shadow(0 0 5px rgba(72,150,255,0.95)) drop-shadow(0 0 16px rgba(37,99,235,0.72))", zIndex: 1 }}><ellipse cx="500" cy="270" rx="450" ry="54" stroke="#67b1ff" strokeWidth="2.5" opacity="0.9" /><ellipse cx="500" cy="270" rx="350" ry="38" stroke="#83c2ff" strokeWidth="1.5" opacity="0.62" /><ellipse cx="500" cy="270" rx="220" ry="22" stroke="#8ecbff" strokeWidth="1.5" opacity="0.42" /></svg>{vehicles.length > 1 && <><button type="button" onClick={() => stepVehicle(-1)} aria-label="Previous vehicle image" className="absolute left-[8%] top-[58%] z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-300/70 bg-navy-900/70 text-primary-200 backdrop-blur transition hover:bg-primary-600 hover:text-white lg:left-[17%]"><Icon name="chevron-left" className="h-4 w-4" /></button><button type="button" onClick={() => stepVehicle(1)} aria-label="Next vehicle image" className="absolute right-[8%] top-[58%] z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-300/70 bg-navy-900/70 text-primary-200 backdrop-blur transition hover:bg-primary-600 hover:text-white lg:right-[17%]"><Icon name="chevron-right" className="h-4 w-4" /></button></>}<motion.div key={vehicles[carIndex] ?? data.carImage} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0" style={{ zIndex: 10 }}><img src={vehicles[carIndex] ?? data.carImage} alt={`${data.name} car`} draggable={false} className="vehicle-cutout brand-hero-car pointer-events-none select-none" /></motion.div></div>
            {vehicles.length > 1 && <div className="relative z-30 -mt-2 flex items-center justify-center gap-2"><span className="sr-only">Vehicle image controls</span>{vehicles.map((image, index) => <button key={image} type="button" onClick={() => setCarIndex(index)} aria-label={`Show vehicle image ${index + 1}`} aria-current={carIndex === index ? "true" : undefined} className={`h-2.5 w-2.5 rounded-full transition ${carIndex === index ? "bg-primary-500" : "bg-white/35 hover:bg-white/65"}`} />)}</div>}
            <p className="mt-2 text-center text-[10px] text-white/55">Indicative starting prices — supplier confirms final quote</p>
          </div>
        </div>
        <TrustStrip badges={data.trustBadges} />
      </div>
    </section>
  );
}
