"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Icon from "../Icon";
import HeroEngineCard from "../HeroEngineCard";
import type { ModelPageData } from "@/lib/model";

type Card = ModelPageData["hero"]["cards"][number];

/** Adapter that gives model cards the same glass face as brand hero cards. */
export function EngineCard({
  card,
  isCenter = true,
  onActivate,
  desktop = false,
}: {
  card: Card;
  isCenter?: boolean;
  onActivate?: () => void;
  desktop?: boolean;
}) {
  return (
    <HeroEngineCard
      card={{
        code: card.code,
        subtitle: card.spec,
        badge: card.condition,
        image: card.image,
        href: card.href,
        price: card.priceFrom,
        inStock: card.inStock,
      }}
      isCenter={isCenter}
      onActivate={onActivate}
      tone="light"
      compact
    />
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
    <div className={desktop ? "absolute inset-x-0 top-0 z-[60]" : "relative lg:hidden"}>
      <div
        className={`relative mx-auto ${desktop ? "h-[248px] max-w-[560px] overflow-visible" : "h-[288px] overflow-hidden"} select-none`}
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
          const xOffset = offset * (desktop ? 190 : 148);
          const yOffset = isCenter ? 0 : isSide ? 8 : 18;
          const scale = isCenter ? 1 : isSide ? 0.78 : 0.56;
          const opacity = isCenter ? 1 : isSide ? 0.72 : 0;
          const rotate = isCenter ? 0 : offset * -6;
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
                className="w-[150px] sm:w-[202px]"
              >
                <div className="hero-float" style={floatVars}>
                  <EngineCard
                    card={card}
                    isCenter={isCenter}
                    desktop={desktop}
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
