"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Card = ModelPageData["hero"]["cards"][number];

/** Adapter that gives model cards the same glass face as brand hero cards. */
export function EngineCard({
  card,
  isCenter = true,
  onActivate,
}: {
  card: Card;
  isCenter?: boolean;
  onActivate?: () => void;
}) {
  return (
    <button type="button" onClick={onActivate} aria-label={`${card.code} engine`} className="group relative block w-full text-center outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050913]">
      <span className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500" style={{ opacity: isCenter ? 1 : 0.7, boxShadow: isCenter ? "0 0 34px -5px rgba(45,135,255,0.75), 0 22px 38px -16px rgba(0,0,0,0.85)" : "0 18px 32px -18px rgba(0,0,0,0.8)" }} />
      <span className="relative block min-h-[205px] overflow-hidden rounded-2xl border p-2.5 sm:min-h-[250px] sm:p-3 lg:min-h-[230px]" style={{ borderColor: isCenter ? "rgba(92,170,255,0.96)" : "rgba(92,154,235,0.58)", background: isCenter ? "linear-gradient(160deg, rgba(25,71,155,0.9) 0%, rgba(8,26,68,0.94) 55%, rgba(5,11,28,0.96) 100%)" : "linear-gradient(160deg, rgba(25,57,126,0.84) 0%, rgba(8,22,57,0.93) 58%, rgba(4,9,24,0.96) 100%)" }}>
        <span className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.16), transparent 34%), radial-gradient(90px 70px at 8% 0%, rgba(80,160,255,0.25), transparent 72%)" }} />
        <span className="relative block text-[23px] font-extrabold leading-none tracking-tight text-white sm:text-[31px] [text-shadow:0_2px_4px_rgba(0,0,0,0.55)]">{card.code}</span>
        <span className="relative mt-1 block truncate text-[10px] font-medium text-white/80 sm:text-[13px]">{card.spec}</span>
        <span className="relative mt-2 flex h-[116px] items-center justify-center sm:mt-3 sm:h-[142px] lg:h-[124px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.image} alt="" draggable={false} className="h-full w-full scale-105 object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.7)]" />
        </span>
        <span className="relative mt-2 block border-t border-white/20 pt-2 text-[10px] font-semibold text-white/90 sm:mt-3 sm:text-[12px]">{card.priceFrom ? <>From <strong className="text-[14px] text-white sm:text-[17px]">{card.priceFrom}</strong></> : "Request A Quote"}</span>
      </span>
    </button>
  );
}

/**
 * The model hero uses the same three-card, auto-advancing rail as the brand
 * hero. Every card stays mounted so the next engine travels in from the side
 * instead of replacing the front card in place.
 */
export default function ModelHeroCarousel({ cards, desktop = false }: { cards: Card[]; desktop?: boolean }) {
  const total = cards.length;
  const featuredIndex = Math.max(0, cards.findIndex((c) => "featured" in c && c.featured));
  const [center, setCenter] = useState(featuredIndex);
  const dragX = useRef(0);
  const moved = useRef(0);
  const animLock = useRef(0);

  useEffect(() => {
    if (total <= 1) return;
    const id = window.setInterval(() => {
      setCenter((current) => (current + 1) % total);
    }, 4500);
    return () => window.clearInterval(id);
  }, [total]);

  const go = (dir: number) => {
    const now = Date.now();
    if (now - animLock.current < 500 || total <= 1) return;
    animLock.current = now;
    setCenter((current) => (current + dir + total) % total);
  };

  const onDown = (e: React.PointerEvent) => {
    dragX.current = e.clientX;
    moved.current = 0;
  };

  const onMove = (e: React.PointerEvent) => {
    if (dragX.current) moved.current = e.clientX - dragX.current;
  };

  const onUp = () => {
    if (moved.current < -50) go(1);
    else if (moved.current > 50) go(-1);
    dragX.current = 0;
    setTimeout(() => (moved.current = 0), 0);
  };

  return (
    <div className={desktop ? "absolute inset-x-0 top-[-8px] z-[60]" : "relative lg:hidden"}>
      <div
        className={`relative mx-auto ${desktop ? "h-[220px] max-w-[900px] overflow-visible" : "h-[288px] overflow-hidden"} select-none`}
        style={{ touchAction: "pan-y" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous engine"
          className="absolute left-0 top-1/2 z-[80] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-400/60 bg-primary-500/10 text-primary-300 backdrop-blur-xl transition-all hover:bg-primary-500/25 hover:text-white"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next engine"
          className="absolute right-0 top-1/2 z-[80] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-400/60 bg-primary-500/10 text-primary-300 backdrop-blur-xl transition-all hover:bg-primary-500/25 hover:text-white"
        >
          <Icon name="chevron-right" className="h-4 w-4" />
        </button>

        {cards.map((card, cardIdx) => {
          const forwardOffset = (cardIdx - center + total) % total;
          const offset = forwardOffset > total / 2 ? forwardOffset - total : forwardOffset;
          const distance = Math.abs(offset);
          const isCenter = offset === 0;
          const isSide = distance === 1;
          const xOffset = offset * (desktop ? 165 : 104);
          const yOffset = isCenter ? 0 : isSide ? 8 : 18;
          const scale = isCenter ? 1 : isSide ? 0.78 : 0.56;
          const opacity = isCenter ? 1 : isSide ? 0.72 : 0;
          const rotate = isCenter ? 0 : offset * 4;
          const floatVars = {
            ["--dur" as string]: `${7 + (cardIdx % 3) * 0.7}s`,
            ["--delay" as string]: `${-(cardIdx % 3) * 1.2}s`,
            ["--amp" as string]: isCenter ? "7px" : "9px",
          } as React.CSSProperties;

          return (
            <div
              key={card.code}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                zIndex: isCenter ? 70 : isSide ? 65 : 1,
                pointerEvents: isCenter || isSide ? "auto" : "none",
              }}
            >
              <motion.div
                initial={false}
                animate={{ x: xOffset, y: yOffset, scale, opacity, rotate }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="w-[126px] sm:w-[184px] lg:w-[198px]"
              >
                <div className="hero-float" style={floatVars}>
                  <EngineCard
                    card={card}
                    isCenter={isCenter}
                    onActivate={() => {
                      if (isCenter) {
                        window.location.assign(card.href);
                        return;
                      }
                      go(offset > 0 ? 1 : -1);
                    }}
                  />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {!desktop && (
        <div className="mt-1.5 flex items-center justify-center gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i > center ? 1 : i < center ? -1 : 0)}
              aria-label={`Go to engine ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${center === i ? "w-5 bg-primary-500" : "w-2 bg-ink-400/40 dark:bg-white/25"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
