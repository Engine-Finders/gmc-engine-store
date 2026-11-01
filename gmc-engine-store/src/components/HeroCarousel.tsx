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

// All hero cards, rotated so the featured card starts in the middle with cards either side
const all = hero.cards as Card[];
const start = Math.max(0, all.findIndex((c) => c.featured));
const lead = Math.floor(all.length / 2);
const slides = all.map((_, i) => all[(start - lead + i + all.length) % all.length]);
const featuredIndex = lead;

// Same glass card as the desktop orbit: see-through navy glass, corners lit, blue left edge, white right edge.
function CardFace({ card, active }: { card: Card; active: boolean }) {
  const reconditioned = card.condition === "Reconditioned";
  return (
    <div className="relative">
      {/* outer bloom: blue on the left, white on the right; stronger on the centred card */}
      <span
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-500"
        style={{
          opacity: active ? 1 : 0.45,
          boxShadow: "-10px 0 24px -8px rgba(56,136,255,0.5), 10px 0 24px -8px rgba(225,238,255,0.3), 0 18px 34px -14px rgba(56,136,255,0.5)",
        }}
      />
      <div
        className="relative overflow-hidden rounded-xl p-3"
        style={{
          background: "linear-gradient(160deg, rgba(34,70,150,0.72) 0%, rgba(12,26,64,0.8) 34%, rgba(5,10,26,0.86) 100%)",
          boxShadow: "inset 6px 0 12px -10px rgba(80,155,255,0.32), inset -6px 0 12px -10px rgba(240,247,255,0.26), 0 20px 36px -14px rgba(0,0,0,0.75)",
        }}
      >
        {/* rim light: bright at the four corners, faint along the sides */}
        <span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            padding: 1.5,
            background: [
              "radial-gradient(50px 50px at 0 0, rgba(150,200,255,1), transparent 70%)",
              "radial-gradient(50px 50px at 0 100%, rgba(120,185,255,1), transparent 70%)",
              "radial-gradient(50px 50px at 100% 0, rgba(255,255,255,1), transparent 70%)",
              "radial-gradient(50px 50px at 100% 100%, rgba(255,255,255,1), transparent 70%)",
              "linear-gradient(90deg, rgba(70,140,255,0.6) 0%, rgba(90,150,255,0.22) 45%, rgba(200,225,255,0.25) 60%, rgba(240,247,255,0.65) 100%)",
            ].join(", "),
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          }}
        />
        {/* inward corner glow */}
        <span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: [
              "radial-gradient(90px 80px at 0 0, rgba(80,150,255,0.55), transparent 70%)",
              "radial-gradient(90px 80px at 0 100%, rgba(80,150,255,0.5), transparent 70%)",
              "radial-gradient(90px 80px at 100% 0, rgba(235,244,255,0.4), transparent 70%)",
              "radial-gradient(90px 80px at 100% 100%, rgba(235,244,255,0.36), transparent 70%)",
            ].join(", "),
          }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-lg font-extrabold text-white leading-none [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">{card.code}</p>
            <p className="mt-1 text-[11px] text-white/85">{card.spec}</p>
          </div>
          <Icon name="heart" className="w-4 h-4 text-white/80" />
        </div>
        <span className={`relative mt-1.5 inline-block rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${reconditioned ? "bg-primary-600 text-white" : "bg-white/20 text-white"}`}>
          {card.condition}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image} alt="" className="relative mx-auto my-2 h-[120px] w-auto object-contain [filter:drop-shadow(0_8px_10px_rgba(0,0,0,0.6))]" draggable={false} />
        <div className="relative flex items-end justify-between">
          <div>
            <p className="text-lg font-extrabold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">{card.price}</p>
            {card.inStock && (
              <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                In stock
              </span>
            )}
          </div>
          <Icon name="arrow-right" className="w-4 h-4 text-white/80" />
        </div>
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
          const opacity = abs === 0 ? 1 : abs === 1 ? 0.85 : 0;
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
                  <CardFace card={card} active={off === 0} />
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
