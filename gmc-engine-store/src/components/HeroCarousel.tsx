"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";
import hero from "@/data/hero.json";

type Card = {
  code: string;
  spec: string;
  condition: string;
  price: string;
  inStock: boolean;
  image: string;
  href: string;
  featured: boolean;
  bg?: string;
};

const FLOAT_DUR = [7, 8, 7.5, 6.6, 8.4];
const FLOAT_DELAY = [0, -2, -1, -3, -4];

// Curated mobile slides (featured centered), still sourced from JSON
const ORDER = ["N47D20", "AJ126", "OM651", "M274", "306DT"];
const slides = ORDER.map((code) => (hero.cards as Card[]).find((c) => c.code === code)!).filter(Boolean);
const featuredIndex = slides.findIndex((c) => c.featured);

function CardFace({ card }: { card: Card }) {
  const featured = card.featured;
  const reconditioned = card.condition === "Reconditioned";
  return (
    <div
      className={`relative rounded-xl border overflow-hidden p-3 bg-white/[0.02] backdrop-blur-lg ${
        featured
          ? "border-[#5aa0ff] shadow-[0_0_0_1px_rgba(107,176,255,0.45),0_0_16px_-1px_rgba(107,176,255,0.6),0_8px_32px_rgba(0,0,0,0.5)]"
          : "border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      }`}
    >
      {/* top inner sheen for glass feel */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.05] to-transparent" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-lg font-extrabold text-white leading-none [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">{card.code}</p>
          <p className="mt-1 text-[11px] text-white/70">{card.spec}</p>
        </div>
        <Icon name="heart" className="w-4 h-4 text-white/75" />
      </div>
      <span className={`relative mt-1.5 inline-block rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${reconditioned ? "bg-primary-600 text-white" : "bg-white/15 text-white"}`}>
        {card.condition}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={card.image} alt="" className="relative mx-auto my-2 h-[120px] w-auto object-contain" draggable={false} />
      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-lg font-extrabold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">{card.price}</p>
          {card.inStock && (
            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              In stock
            </span>
          )}
        </div>
        <Icon name="arrow-right" className="w-4 h-4 text-white/75" />
      </div>
    </div>
  );
}

export default function HeroCarousel() {
  const [center, setCenter] = useState(featuredIndex);
  const dragX = useRef(0);
  const moved = useRef(0);
  const animLock = useRef(0);

  const clamp = (n: number) => Math.max(0, Math.min(slides.length - 1, n));
  const go = (dir: number) => {
    const now = Date.now();
    if (now - animLock.current < 500) return; // ignore inputs while a single-card move is animating
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
    // keep moved for the click guard, reset shortly after
    setTimeout(() => (moved.current = 0), 0);
  };

  return (
    <div className="lg:hidden">
      <div
        className="relative h-[290px] overflow-hidden select-none"
        style={{ perspective: "1100px", touchAction: "pan-y" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        {slides.map((card, i) => {
          const off = i - center;
          const abs = Math.abs(off);
          const shift = off * 62; // % of card width
          const rotate = Math.max(-2, Math.min(2, off)) * 34; // side cards tilt outward
          const scale = off === 0 ? 1 : abs === 1 ? 0.8 : 0.62;
          const opacity = abs === 0 ? 1 : abs === 1 ? 0.7 : 0;
          const style: React.CSSProperties = {
            transform: `translate(calc(-50% + ${shift}%), -50%) rotateY(${rotate}deg) scale(${scale})`,
            zIndex: 30 - abs * 10,
            opacity,
            pointerEvents: abs <= 1 ? "auto" : "none",
          };
          const floatVars = {
            ["--dur" as string]: `${FLOAT_DUR[i % FLOAT_DUR.length]}s`,
            ["--delay" as string]: `${FLOAT_DELAY[i % FLOAT_DELAY.length]}s`,
            ["--amp" as string]: "8px",
          } as React.CSSProperties;

          const guardClick = (e: React.MouseEvent) => {
            if (Math.abs(moved.current) > 8) {
              e.preventDefault();
              return;
            }
            if (off !== 0) {
              e.preventDefault();
              // Always move a single step toward the clicked card, never jump.
              go(i > center ? 1 : -1);
            }
          };

          return (
            <div key={card.code} className="absolute left-1/2 top-1/2 w-[60vw] max-w-[250px] transition-all duration-500 ease-out" style={style}>
              <div className="hero-float" style={floatVars}>
                <Link href={card.href} aria-label={`${card.code} engine`} className="block" draggable={false} onClick={guardClick}>
                  <CardFace card={card} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i > center ? 1 : i < center ? -1 : 0)} aria-label={`Go to slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${center === i ? "w-5 bg-primary-500" : "w-2 bg-white/25"}`} />
        ))}
      </div>
    </div>
  );
}
