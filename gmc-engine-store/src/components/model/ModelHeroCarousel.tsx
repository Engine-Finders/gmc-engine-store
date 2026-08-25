"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { ModelPageData } from "@/lib/model";

type Card = ModelPageData["hero"]["cards"][number];

const GRID_W = 900;
/** px on the 900-wide design grid -> container-query width units */
export const cqw = (px: number) => `${((px / GRID_W) * 100).toFixed(3)}cqw`;

/**
 * `fluid` cards live on the desktop container-query stage and size themselves in
 * cqw. Outside that stage (the mobile carousel) there is no query container, so
 * cqw would resolve against the viewport — those cards use plain px instead.
 */
export function EngineCard({ card, fluid = true, scale = 1, uniform = false }: { card: Card; fluid?: boolean; scale?: number; uniform?: boolean }) {
  const recon = card.condition === "Reconditioned";
  const featured = "featured" in card && card.featured;
  // `uniform` keeps the featured card's highlight styling but drops its larger
  // metrics, so every slide in the carousel is the same size.
  const big = featured && !uniform;
  // `scale` only applies to px mode — it grows the whole card together, since
  // widening a fixed-px card alone just adds empty space around its contents.
  const u = fluid ? cqw : (px: number) => `${Math.round(px * scale * 10) / 10}px`;
  const s = big
    ? { pad: u(18), padTop: u(15), padBottom: u(13), code: u(21), spec: u(12.5), badge: u(10), badgeX: u(9), badgeY: u(2.5), img: u(132), imgY: u(7), price: u(21) }
    : { pad: u(13), padTop: u(11), padBottom: u(11), code: u(16), spec: u(10), badge: u(9), badgeX: u(7), badgeY: u(3), img: u(104), imgY: u(6), price: u(16) };
  return (
    <Link
      href={card.href}
      style={{ borderRadius: u(16), paddingLeft: s.pad, paddingRight: s.pad, paddingTop: s.padTop, paddingBottom: s.padBottom }}
      className={`group relative block overflow-hidden border backdrop-blur-lg transition-all duration-300 ${
        /* identical fill — the featured card is marked by a thin glowing border only */
        featured
          ? "border-[#6bb0ff] bg-white/55 dark:bg-white/[0.02] shadow-[0_0_0_1px_rgba(107,176,255,0.45),0_0_16px_-1px_rgba(107,176,255,0.6),0_8px_32px_rgba(0,0,0,0.16)] dark:shadow-[0_0_0_1px_rgba(107,176,255,0.45),0_0_16px_-1px_rgba(107,176,255,0.6),0_8px_32px_rgba(0,0,0,0.5)]"
          : "border-line dark:border-white/12 bg-white/55 dark:bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.14)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:-translate-y-1 dark:hover:border-white/25"
      }`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 dark:from-white/[0.05] to-transparent" />
      <p style={{ fontSize: s.code }} className="relative font-extrabold text-ink-900 dark:text-white leading-none">{card.code}</p>
      <p style={{ fontSize: s.spec, marginTop: u(4) }} className="relative text-ink-500 dark:text-white/60 leading-tight">{card.spec}</p>
      <span
        style={{ fontSize: s.badge, marginTop: u(6), paddingInline: s.badgeX, paddingBlock: s.badgeY, borderRadius: u(6) }}
        className={`relative inline-block font-bold uppercase tracking-wide leading-none ${recon ? "bg-primary-600 text-white" : "bg-ink-400/25 dark:bg-white/15 text-ink-700 dark:text-white/80"}`}
      >
        {card.condition}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={card.image} alt="" style={{ height: s.img, marginBlock: s.imgY }} className="relative mx-auto w-auto object-contain" draggable={false} />
      <div className="relative flex items-end justify-between">
        <div>
          <p style={{ fontSize: s.price }} className="font-extrabold text-ink-900 dark:text-white leading-none">From {card.priceFrom}</p>
          {card.inStock && (
            <span style={{ fontSize: u(10), marginTop: u(5), gap: u(4) }} className="inline-flex items-center text-green-600 dark:text-green-400 leading-none">
              <span style={{ height: u(6), width: u(6) }} className="shrink-0 rounded-full bg-green-500" /> In stock
            </span>
          )}
        </div>
        {/* Icon takes no `style`, so the fluid size lives on a wrapper */}
        <span style={{ height: u(14), width: u(14) }} className="block shrink-0 text-ink-400 dark:text-white/50">
          <Icon name="chevron-right" className="h-full w-full" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Mobile coverflow, same mechanics as the home hero's HeroCarousel: one focused
 * card centred, neighbours scaled down / tilted outward / faded, drag or tap a
 * neighbour to advance one step.
 */
export default function ModelHeroCarousel({ cards }: { cards: Card[] }) {
  const featuredIndex = Math.max(0, cards.findIndex((c) => "featured" in c && c.featured));
  const [center, setCenter] = useState(featuredIndex);
  const dragX = useRef(0);
  const moved = useRef(0);
  const animLock = useRef(0);

  const clamp = (n: number) => Math.max(0, Math.min(cards.length - 1, n));
  const go = (dir: number) => {
    const now = Date.now();
    if (now - animLock.current < 500) return; // ignore input mid-animation
    animLock.current = now;
    setCenter((c) => clamp(c + dir));
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
    <div className="lg:hidden">
      <div
        className="relative h-[288px] select-none overflow-hidden"
        style={{ perspective: "1100px", touchAction: "pan-y" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        {cards.map((card, i) => {
          const off = i - center;
          const abs = Math.abs(off);
          const shift = off * 62; // % of card width
          const rotate = Math.max(-2, Math.min(2, off)) * 34; // side cards tilt outward
          const scale = off === 0 ? 1 : abs === 1 ? 0.8 : 0.62;
          const style: React.CSSProperties = {
            transform: `translate(calc(-50% + ${shift}%), -50%) rotateY(${rotate}deg) scale(${scale})`,
            zIndex: 30 - abs * 10,
            opacity: abs === 0 ? 1 : abs === 1 ? 0.7 : 0,
            pointerEvents: abs <= 1 ? "auto" : "none",
          };
          const guardClick = (e: React.MouseEvent) => {
            if (Math.abs(moved.current) > 8) {
              e.preventDefault();
              return;
            }
            if (off !== 0) {
              e.preventDefault();
              go(i > center ? 1 : -1); // always a single step, never a jump
            }
          };
          return (
            <div
              key={card.code}
              className="absolute left-1/2 top-1/2 w-[60vw] max-w-[232px] transition-all duration-500 ease-out"
              style={style}
              onClickCapture={guardClick}
            >
              <EngineCard card={card} fluid={false} scale={1.3} uniform />
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
