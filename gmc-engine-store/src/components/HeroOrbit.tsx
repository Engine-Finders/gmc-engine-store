"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "./Icon";
import hero from "@/data/hero.json";

const FLOAT_DUR = [8, 7, 7.6, 6.6, 9, 8.4, 7.2];
const FLOAT_DELAY = [0, -2.5, -1.2, -3.6, -0.8, -4.2, -2];
const FLOAT_AMP = [16, 12, 13, 10, 11, 12, 13];

type Pos = { left: number; top: number; width: number; z: number; opacity?: number; rx?: number; ry?: number; rz?: number };
type Card = {
  code: string;
  spec: string;
  condition: string;
  price: string;
  inStock: boolean;
  image: string;
  href: string;
  featured: boolean;
  pos: Pos;
};

const cards = hero.cards as Card[];
const slots: Pos[] = cards.map((c) => c.pos);
const CENTER_SLOT = Math.max(0, cards.findIndex((c) => c.featured));

// Smooth, long, deliberate ease — cards need enough time that the user clearly sees the glide.
const slotTransition = {
  duration: 1.2,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

const tiltTransition = {
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

function HeroTrack() {
  return (
    <svg viewBox="0 0 700 520" className="hero-track pointer-events-none absolute inset-0 h-full w-full" style={{ filter: "drop-shadow(0 0 6px rgba(79,157,255,0.7))", zIndex: 0 }} fill="none">
      <g stroke="#5aa0ff" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 11" opacity="0.7">
        <ellipse cx="350" cy="312" rx="345" ry="160" />
        <ellipse cx="350" cy="298" rx="265" ry="112" />
        <ellipse cx="345" cy="278" rx="172" ry="64" />
      </g>
      <g fill="#8ec0ff">
        {[[34, 312], [124, 426], [340, 470], [588, 418], [692, 308], [588, 198], [340, 156], [124, 204], [100, 300], [620, 300]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 2} />
        ))}
      </g>
    </svg>
  );
}

function OrbitCard({ card, pos, isCenter, floatIndex, onFocus }: { card: Card; pos: Pos; isCenter: boolean; floatIndex: number; onFocus: () => void }) {
  const reconditioned = card.condition === "Reconditioned";

  const tilt = isCenter
    ? { rx: 3, ry: -6, rz: 0 }
    : { rx: pos.rx ?? 0, ry: pos.ry ?? 0, rz: pos.rz ?? 0 };

  // Continuous float (keyframe) on a CSS-animated inner wrapper
  const floatStyle: React.CSSProperties = {
    "--dur": `${FLOAT_DUR[floatIndex % FLOAT_DUR.length]}s`,
    "--delay": `${FLOAT_DELAY[floatIndex % FLOAT_DELAY.length]}s`,
    "--amp": `${FLOAT_AMP[floatIndex % FLOAT_AMP.length]}px`,
    animationName: "heroFloat",
    animationDuration: "var(--dur)",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationDelay: "var(--delay)",
    // no will-change: it pins a fixed-resolution GPU texture, which the parent
    // scale() then resamples — same softening as translateZ(0)
  } as React.CSSProperties;

  const body = (
    <motion.div
      initial={false}
      animate={{
        rotateX: tilt.rx,
        rotateY: tilt.ry,
        rotateZ: tilt.rz,
      }}
      transition={tiltTransition}
      // NO translateZ(0) / backface-visibility / preserve-3d here: each of those
      // promotes the card to a fixed-resolution GPU texture that is NOT re-rastered
      // when the parent's scale() applies, so the whole card got resampled and went
      // soft. Without them the browser rasters at the final composited scale.
      className={`relative rounded-xl overflow-hidden border backdrop-blur-lg transition-shadow duration-300 ${
        /* identical fill on both — the ONLY difference is a thin glowing border */
        isCenter
          ? "border-[#6bb0ff] bg-white/[0.02] shadow-[0_0_0_1px_rgba(107,176,255,0.45),0_0_16px_-1px_rgba(107,176,255,0.6),0_8px_32px_rgba(0,0,0,0.5)]"
          : "border-white/12 bg-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.5)] group-hover:border-white/25"
      }`}
    >
      {/* glass sheen */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.05] to-transparent" />

      <div className={`relative flex items-start justify-between ${isCenter ? "px-4 pt-3.5" : "px-3 pt-2.5"}`}>
        <div>
          <p className={`font-extrabold text-white leading-none [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] ${isCenter ? "text-2xl" : "text-sm"}`}>{card.code}</p>
          <p className={`text-white/75 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] ${isCenter ? "text-xs mt-1.5" : "text-[9px] mt-1"}`}>{card.spec}</p>
        </div>
        <span className="grid place-items-center text-white/70">
          <Icon name="heart" className={isCenter ? "w-4 h-4" : "w-3 h-3"} />
        </span>
      </div>

      <div className={`relative ${isCenter ? "px-4 mt-2" : "px-3 mt-1.5"}`}>
        <span className={`inline-block rounded-md font-bold uppercase tracking-wide ${reconditioned ? "bg-primary-600 text-white" : "bg-white/15 text-white/90"} ${isCenter ? "px-2 py-1 text-[9px]" : "px-1.5 py-[3px] text-[8px]"}`}>
          {card.condition}
        </span>
      </div>

      <div className={`relative ${isCenter ? "px-3 pt-2 pb-1.5" : "px-2 pt-1.5"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.image} alt="" className="mx-auto w-full object-contain" style={{ height: isCenter ? 168 : pos.width * 0.6, imageRendering: "auto" }} draggable={false} />
      </div>

      <div className={`relative flex items-end justify-between ${isCenter ? "px-4 pb-4 pt-1" : "px-3 pb-3 pt-1"}`}>
        <div>
          <p className={`font-extrabold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] ${isCenter ? "text-2xl" : "text-sm"}`}>{card.price}</p>
          {card.inStock && (
            <span className={`mt-1 inline-flex items-center gap-1.5 text-green-400 ${isCenter ? "text-xs" : "text-[9px]"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              In stock
            </span>
          )}
        </div>
        <span className="grid place-items-center rounded-full text-white/70 group-hover:text-white transition-colors">
          <Icon name="arrow-right" className={isCenter ? "w-5 h-5" : "w-3.5 h-3.5"} />
        </span>
      </div>
    </motion.div>
  );

  // Slot wrapper: framer-motion animates x, y, width, opacity from the target slot position.
  // This motion.div is ALWAYS the same element type so React never unmounts it; only the
  // animate values change, which is what makes framer-motion actually animate.
  const slot = (
    <motion.div
      initial={false}
      animate={{
        x: pos.left,
        y: pos.top,
        width: pos.width,
        opacity: isCenter ? 1 : pos.opacity ?? 0.85,
      }}
      transition={slotTransition}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: isCenter ? 60 : pos.z,
      }}
    >
      <div style={floatStyle}>
        {isCenter ? (
          <Link href={card.href} aria-label={`${card.code} engine`} className="group block cursor-pointer">
            {body}
          </Link>
        ) : (
          <button type="button" onClick={onFocus} aria-label={`Focus ${card.code}`} className="group block cursor-pointer text-left bg-transparent border-0 p-0 w-full">
            {body}
          </button>
        )}
      </div>
    </motion.div>
  );

  return slot;
}

export default function HeroOrbit() {
  // assignment[slotIndex] = cardIndex; start with identity (featured already in center slot)
  const [assign, setAssign] = useState<number[]>(() => cards.map((_, i) => i));

  const focus = (cardIdx: number) =>
    setAssign((prev) => {
      const next = [...prev];
      const s = next.indexOf(cardIdx);
      const centerCard = next[CENTER_SLOT];
      next[CENTER_SLOT] = cardIdx;
      next[s] = centerCard;
      return next;
    });

  return (
    <div className="hidden lg:block relative h-[520px]">
      <div className="hero-dots absolute inset-0" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 origin-right scale-[0.74] xl:scale-[0.9]">
        <div className="relative h-[520px] w-[700px]" style={{ perspective: "1050px" }}>
          {/* colored light blobs so the glass cards have something to frost */}
          <HeroTrack />
          {cards.map((card, i) => {
            const slot = assign.indexOf(i);
            return <OrbitCard key={card.code} card={card} pos={slots[slot]} isCenter={slot === CENTER_SLOT} floatIndex={i} onFocus={() => focus(i)} />;
          })}
        </div>
      </div>
    </div>
  );
}