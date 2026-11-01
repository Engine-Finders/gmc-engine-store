"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import hero from "@/data/hero.json";

/* =========================================================
   Hero orbit

   The cards sit in SLOTS laid out round one tilted ring, like the
   design reference: a large hero card at the front, two front
   neighbours, two side cards and a back row. All cards move together,
   one slot at a time, along the ring: a smooth eased glide, then a
   short rest so the front card can be read. Because every card moves
   the same way at the same time, the gaps between them stay open and
   cards do not pile up on each other.

   - idle:    glide one slot, rest, glide again
   - hover:   the whole orbit eases to a stop (nothing jumps)
   - click 1: the clicked card travels to the front slot, straightens
              and becomes fully readable; everything else stops and dims
   - click 2: the focused card opens its engine page (a visible
              "View engine" pill shows the action)
   - drag:    drag the scene left / right to move through the slots;
              on release it settles on the nearest slot
   - resume:  click empty space, the Resume button, or press Escape

   All geometry is in "reference units": the design reference is a
   1030 x 610 scene with a 300px-wide front card. The scene scales that
   to whatever space the hero gives it (u = scale factor).

   SLOTS is a closed loop of 9 key positions. Any card count works: the
   cards are spread evenly round the loop and positions in between key
   slots are interpolated. 9 cards = one card per slot (best).

   Motion is one requestAnimationFrame loop writing transforms straight
   to the card elements, so React does not re-render per frame.
   ========================================================= */

type Card = {
  code: string;
  spec: string;
  condition: string;
  price: string;
  inStock: boolean;
  image: string;
  href: string;
};

const cards = hero.cards as Card[];
const N = cards.length;

const REF_W = 1030;
const REF_H = 610;
const CARD_W = 300; // front card is 300 x ~425 in reference units
const CX = 515; // horizontal centre of the layout

// Key slots, in travel order (front -> right side -> back row -> left side -> front).
// x is relative to CX, y is the card centre, s is the card scale, d is depth (z-order),
// rz follows the curve of the ring, b is brightness.
type Slot = { x: number; y: number; s: number; d: number; rz: number; b: number };
const SLOTS: Slot[] = [
  { x: 0, y: 280, s: 1.0, d: 9, rz: 0, b: 1 }, //        front (hero card)
  { x: 272, y: 440, s: 0.58, d: 8, rz: -6, b: 1 }, // front right
  { x: 420, y: 272, s: 0.46, d: 7, rz: 8, b: 0.96 }, //   right
  { x: 362, y: 96, s: 0.4, d: 5, rz: 0, b: 0.92 }, //     back right, outer
  { x: 214, y: 112, s: 0.43, d: 4, rz: 0, b: 0.92 }, //   back right, inner
  { x: -200, y: 112, s: 0.43, d: 4, rz: 0, b: 0.92 }, // back left, inner
  { x: -335, y: 96, s: 0.4, d: 5, rz: 0, b: 0.92 }, //   back left, outer (inward: the ring is lower on the left)
  { x: -420, y: 272, s: 0.46, d: 7, rz: -6, b: 0.96 }, // left
  { x: -272, y: 440, s: 0.58, d: 8, rz: 6, b: 1 }, // front left
];
// rz is chosen so no resting card edge sits at a shallow 1-5 degree angle (those show stair steps
// on 100%-scaling screens). With the -6 degree forward lean, vertical edges end up at rz + 6 and
// top / bottom edges at rz: so rz is 0, -6 (vertical edges exactly upright) or 6 and more.
const K = SLOTS.length;
const RING = { cx: CX, cy: 330, rx: 505, ry: 185, tilt: -2.5 };

const REST = 1.4; // seconds the cards rest between glides
const GLIDE = 1.05; // seconds one glide takes
const FOCUS_GLIDE = 0.9; // seconds per slot when a clicked card travels to the front

type Tween = { from: number; to: number; t: number; dur: number };

type Scene = {
  W: number;
  H: number;
  pos: number; // how many slots the loop has advanced (float)
  tween: Tween | null;
  rest: number;
  speed: number;
  dim: number;
  hover: boolean;
  dragging: boolean;
  sel: number | null;
  selAmt: number[];
};

function fit(W: number, H: number) {
  const u = Math.min(W / REF_W, H / REF_H);
  return { u, ox: (W - REF_W * u) / 2, oy: (H - REF_H * u) / 2 };
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mod = (a: number, n: number) => ((a % n) + n) % n;

// position on the slot loop for a float slot index (0 = front)
function sample(p: number): Slot {
  const k = mod(p, K);
  const i = Math.floor(k);
  const f = k - i;
  const A = SLOTS[i];
  const B = SLOTS[(i + 1) % K];
  const l = (a: number, b: number) => a + (b - a) * f;
  return { x: l(A.x, B.x), y: l(A.y, B.y), s: l(A.s, B.s), d: l(A.d, B.d), rz: l(A.rz, B.rz), b: l(A.b, B.b) };
}

// card i sits at loop position (i + pos) * K / N
const slotOf = (i: number, pos: number) => ((i + pos) * K) / N;

function Ring({ W, H }: { W: number; H: number }) {
  const { u, ox, oy } = fit(W, H);
  const cx = ox + RING.cx * u;
  const cy = oy + RING.cy * u;
  const rx = RING.rx * u;
  const ry = RING.ry * u;
  // the inner ring sits a little higher, as if it were further back
  const icy = cy - 10 * u;
  const irx = rx * 0.7;
  const iry = ry * 0.62;
  const dots = (ex: number, ey: number, erx: number, ery: number, angles: number[]) =>
    angles.map((a) => {
      const t = (a * Math.PI) / 180;
      return { x: ex + erx * Math.cos(t), y: ey + ery * Math.sin(t) };
    });
  // glowing nodes along each ring (angles in degrees, 90 = front); kept clear of the hero card
  const outerDots = dots(cx, cy, rx, ry, [20, 58, 122, 160, 196, 238, 302, 344]);
  const innerDots = dots(cx, icy, irx, iry, [10, 50, 130, 170, 215, 265, 325]);
  // Uneven light, like the reference: the main ring burns brighter where it curves round at its
  // far left and far right ends. [angle (0 = right end, 180 = left end), strength, reach]
  const HOT: [number, number, number][] = [
    [180, 0.85, 150],
    [0, 0.85, 150],
  ];
  const hotPts = dots(cx, cy, rx, ry, HOT.map((h) => h[0]));
  return (
    // No CSS animation here (the ring used to pulse its opacity): Chrome runs that on the GPU as its
    // own layer, and cards drawn over a GPU layer get pulled onto the GPU as bitmaps -> jagged edges.
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" fill="none" style={{ zIndex: 0, opacity: 0.75 }}>
      <defs>
        <linearGradient id="hero-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f9dff" stopOpacity="0.35" />
          <stop offset="0.55" stopColor="#4f9dff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#7cc0ff" stopOpacity="1" />
        </linearGradient>
        {HOT.map(([, strength, reach], i) => (
          <radialGradient key={i} id={`hero-ring-spot-${i}`} gradientUnits="userSpaceOnUse" cx={hotPts[i].x} cy={hotPts[i].y} r={reach * u}>
            <stop offset="0" stopColor="#e6f2ff" stopOpacity={strength} />
            <stop offset="0.35" stopColor="#60a5fa" stopOpacity={strength * 0.7} />
            <stop offset="1" stopColor="#2f7bff" stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="hero-ring-blur" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="hero-dot-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        {/* darkens the front stretch of the main ring, under the middle card, so the platform's
            light stands out there (a mask on the ring only, never on the cards) */}
        <radialGradient id="hero-ring-front" gradientUnits="userSpaceOnUse" cx={cx} cy={cy + ry} r={260 * u} gradientTransform={`translate(${cx} ${cy + ry}) scale(1 0.45) translate(${-cx} ${-(cy + ry)})`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.85" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.5" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <mask id="hero-ring-mask" maskUnits="userSpaceOnUse" x={-W} y={-H} width={3 * W} height={3 * H}>
          <rect x={-W} y={-H} width={3 * W} height={3 * H} fill="#fff" />
          <rect x={-W} y={-H} width={3 * W} height={3 * H} fill="url(#hero-ring-front)" />
        </mask>
      </defs>
      <g transform={`rotate(${RING.tilt} ${cx} ${cy})`}>
        {/* main ring (darker along its front, under the middle card) */}
        <g mask="url(#hero-ring-mask)">
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="#2f7bff" strokeWidth={12} opacity={0.45} filter="url(#hero-ring-blur)" />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="url(#hero-ring)" strokeWidth={2.2} />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="#d6ebff" strokeWidth={2} strokeLinecap="round" strokeDasharray="1 16" opacity={0.85} />
        </g>
        {/* main ring: brighter at its left and right ends, a soft bloom plus a bright core */}
        {HOT.map((_, i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={`url(#hero-ring-spot-${i})`} strokeWidth={18 * u} filter="url(#hero-ring-blur)" />
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={`url(#hero-ring-spot-${i})`} strokeWidth={Math.max(2, 3 * u)} />
          </g>
        ))}
        {/* inner ring */}
        <ellipse cx={cx} cy={icy} rx={irx} ry={iry} stroke="#2f7bff" strokeWidth={8} opacity={0.3} filter="url(#hero-ring-blur)" />
        <ellipse cx={cx} cy={icy} rx={irx} ry={iry} stroke="#4f9dff" strokeWidth={1.4} opacity={0.6} />
        <ellipse cx={cx} cy={icy} rx={irx} ry={iry} stroke="#cfe5ff" strokeWidth={1.8} strokeLinecap="round" strokeDasharray="1 12" opacity={0.7} />
        {/* glowing nodes on both rings */}
        {[...outerDots.map((d) => ({ ...d, r: 4.5 })), ...innerDots.map((d) => ({ ...d, r: 3 }))].map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r={d.r * 2.6 * u} fill="#3b82f6" opacity={0.75} filter="url(#hero-dot-glow)" />
            <circle cx={d.x} cy={d.y} r={d.r * u} fill="#e0efff" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* Glowing platform the front card stands on: a pool of light and one bright ring.
   Its own SVG so the ring pulse does not dim it. Its centre line sits just above the
   front card's bottom edge, so the card's base rests inside the rings. */
function Platform({ W, H }: { W: number; H: number }) {
  const { u, ox, oy } = fit(W, H);
  const px = ox + CX * u;
  const py = oy + (SLOTS[0].y + 190) * u;
  const ring = (rx: number, ry: number, glow: number, core: number) => (
    <g mask="url(#hero-pad-cut)">
      <ellipse cx={px} cy={py} rx={rx * u} ry={ry * u} stroke="#2f7bff" strokeWidth={glow * u} opacity={0.9} filter="url(#hero-pad-blur)" />
      <ellipse cx={px} cy={py} rx={rx * u} ry={ry * u} stroke="#7cc0ff" strokeWidth={core * u} />
      <ellipse cx={px} cy={py} rx={rx * u} ry={ry * u} stroke="#f0f7ff" strokeWidth={Math.max(1, core * 0.45 * u)} />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" fill="none" style={{ zIndex: 0 }}>
      <defs>
        <radialGradient id="hero-pad">
          <stop offset="0" stopColor="#dbeafe" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#3b82f6" stopOpacity="0.6" />
          <stop offset="1" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
        <filter id="hero-pad-blur" x="-20%" y="-150%" width="140%" height="400%">
          <feGaussianBlur stdDeviation={6 * u} />
        </filter>
        {/* The middle card hides the back half of the ring: a card-shaped hole that the animation loop
            keeps on the middle card (same transform) and fades with it. Ring only, never the cards. */}
        <mask id="hero-pad-cut" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect x={0} y={0} width={W} height={H} fill="#fff" />
          <rect data-pad-cut x={-CARD_W / 2} y={-200} width={CARD_W} height={400} rx={16} fill="#000" opacity={0} />
        </mask>
        <radialGradient id="hero-hot">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.35" stopColor="#bfdbfe" stopOpacity="0.85" />
          <stop offset="0.7" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
        {/* white along the front of the ring, fading to its normal blue towards the sides */}
        <radialGradient id="hero-ring-hot" gradientUnits="userSpaceOnUse" cx={px} cy={py + 40 * u} r={150 * u}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.5" stopColor="#e0efff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* pool of light under the card */}
      <ellipse cx={px} cy={py} rx={250 * u} ry={55 * u} fill="url(#hero-pad)" opacity={0.7} />
      {ring(205, 40, 16, 3.2)}
      {/* white-hot centre: the light is brightest straight below the card */}
      <ellipse cx={px} cy={py + 8 * u} rx={150 * u} ry={30 * u} fill="url(#hero-hot)" />
      {/* the front of the ring burns white where it passes under the card */}
      <g mask="url(#hero-pad-cut)">
        <ellipse cx={px} cy={py} rx={205 * u} ry={40 * u} stroke="url(#hero-ring-hot)" strokeWidth={4 * u} />
        <ellipse cx={px} cy={py} rx={205 * u} ry={40 * u} stroke="url(#hero-ring-hot)" strokeWidth={14 * u} filter="url(#hero-pad-blur)" />
      </g>
    </svg>
  );
}

/* White glow spilling over the front card's bottom edge, drawn ABOVE the cards: the light below is
   so bright it washes the card's base white. A plain soft gradient, no blend mode (a blend mode
   can push the cards under it onto the GPU as bitmaps). */
function PlatformFlare({ W, H }: { W: number; H: number }) {
  const { u, ox, oy } = fit(W, H);
  const px = ox + CX * u;
  const py = oy + (SLOTS[0].y + 203) * u; // the front card's bottom edge
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" fill="none" style={{ zIndex: 295 }}>
      <defs>
        <radialGradient id="hero-flare">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.3" stopColor="#dbeafe" stopOpacity="0.8" />
          <stop offset="0.65" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={px} cy={py} rx={170 * u} ry={26 * u} fill="url(#hero-flare)" opacity={0.55} />
      <ellipse cx={px} cy={py} rx={85 * u} ry={9 * u} fill="url(#hero-flare)" />
    </svg>
  );
}

// A card's moving parts, found once (not queried every frame), plus the last value written to each
// so unchanged values are never written again (every write makes the browser redraw the card).
type Parts = {
  el: HTMLElement;
  shade: HTMLElement | null;
  glow: HTMLElement | null;
  arrow: HTMLElement | null;
  pill: HTMLElement | null;
  frontRim: SVGSVGElement | null;
  h: number; // card height (measured once)
  last: Record<string, string>;
};

function cardParts(el: HTMLElement): Parts {
  const q = <T extends Element>(sel: string) => el.querySelector<T>(sel);
  return {
    el,
    shade: q("[data-shade]"),
    glow: q("[data-glow]"),
    arrow: q("[data-arrow]"),
    pill: q("[data-pill]"),
    frontRim: q("[data-front-rim]"),
    h: q<HTMLElement>("[data-card]")?.offsetHeight || 412,
    last: {},
  };
}

/** Write v only if it differs from the last value written under key; true if it was written. */
function put(c: Parts, key: string, v: string, apply: (v: string) => unknown): boolean {
  if (c.last[key] === v) return false;
  c.last[key] = v;
  apply(v);
  return true;
}

function OrbitCard({ card, index }: { card: Card; index: number }) {
  const reconditioned = card.condition === "Reconditioned";
  return (
    <div className="relative rounded-2xl" style={{ width: CARD_W }}>
      {/* outer bloom: blue LED ambience all the way round; its strength follows depth (set per frame) */}
      <span
        data-glow
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: "0 0 22px -2px rgba(59,130,246,0.55), -10px 0 24px -8px rgba(56,136,255,0.5), 10px 0 24px -8px rgba(225,238,255,0.3), 0 22px 40px -14px rgba(56,136,255,0.5)" }}
      />
      <div
        data-card={index}
        role="button"
        tabIndex={0}
        aria-label={`${card.code} engine`}
        className="relative cursor-pointer overflow-hidden rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        style={{
          background: "linear-gradient(160deg, rgba(34,70,150,0.5) 0%, rgba(12,26,64,0.6) 34%, rgba(5,10,26,0.7) 100%)",
          boxShadow: "inset 6px 0 12px -10px rgba(80,155,255,0.32), inset -6px 0 12px -10px rgba(240,247,255,0.26), 0 24px 44px -14px rgba(0,0,0,0.75)",
        }}
      >
        {/* No CSS mask or filter on the card or its edge layers: either one makes the browser draw that
            layer as a flat bitmap and then tilt it, which gives jagged edges. Edges are SVG strokes and
            plain gradients, drawn as vectors at the card's final angle. (The engine photo's drop shadow
            is fine: the photo is a bitmap anyway and the shadow is soft.) */}
        {/* inward corner glow: light spilling into the glass from each corner, with a tight bright
            glint right in the corner (left corners blue, right corners white) */}
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: [
              "radial-gradient(34px 34px at 0 0, rgba(150,200,255,0.7), transparent 70%)",
              "radial-gradient(34px 34px at 0 100%, rgba(120,185,255,0.65), transparent 70%)",
              "radial-gradient(34px 34px at 100% 0, rgba(255,255,255,0.6), transparent 70%)",
              "radial-gradient(34px 34px at 100% 100%, rgba(255,255,255,0.55), transparent 70%)",
              "radial-gradient(130px 110px at 0 0, rgba(80,150,255,0.55), transparent 70%)",
              "radial-gradient(130px 110px at 0 100%, rgba(80,150,255,0.5), transparent 70%)",
              "radial-gradient(130px 110px at 100% 0, rgba(235,244,255,0.4), transparent 70%)",
              "radial-gradient(130px 110px at 100% 100%, rgba(235,244,255,0.36), transparent 70%)",
            ].join(", "),
          }}
        />
        {/* glass sheen across the top-left */}
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 22%, transparent 50%)" }}
        />

        <div className="relative flex items-start justify-between px-6 pt-5">
          <div>
            <p className="text-[36px] font-extrabold leading-none tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">{card.code}</p>
            <p className="mt-2 text-[18px] text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">{card.spec}</p>
          </div>
          <span className="mt-1 grid place-items-center text-white/85">
            <Icon name="heart" className="h-6 w-6" />
          </span>
        </div>

        <div className="relative mt-3 px-6">
          <span className={`inline-block rounded-md px-3 py-1 text-[12px] font-bold uppercase tracking-wide ${reconditioned ? "bg-primary-600 text-white" : "bg-white/20 text-white"}`}>
            {card.condition}
          </span>
        </div>

        <div className="relative px-4 pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            alt=""
            className="mx-auto w-full object-contain [filter:drop-shadow(0_10px_14px_rgba(0,0,0,0.6))]"
            style={{ height: 170 }}
            draggable={false}
          />
        </div>

        <div className="relative flex items-end justify-between px-6 pb-6 pt-2">
          <div>
            <p className="text-[38px] font-extrabold leading-none text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">{card.price}</p>
            {card.inStock && (
              <span className="mt-2.5 inline-flex items-center gap-2 text-[17px] font-medium text-green-400">
                <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
                In stock
              </span>
            )}
          </div>
          <span data-arrow className="mb-1 grid place-items-center text-white/85">
            <Icon name="arrow-right" className="h-7 w-7" />
          </span>
          {/* focused card only: small pill in the arrow's corner, level with "In stock" */}
          <span data-pill className="pointer-events-none absolute bottom-6 right-5 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-primary-600 px-3 py-1.5 text-[12px] font-bold text-white opacity-0 shadow-cta">
            View engine
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </span>
        </div>
        {/* depth shade: darkens cards further back (replaces a brightness filter, see above) */}
        <span data-shade className="pointer-events-none absolute inset-0 rounded-2xl bg-black opacity-0" />
      </div>
      {/* rim light, blue on the left edge, white on the right. Outside the card's clip and soft on
          purpose: a thin bright core inside a faint wider band, centred on the card's edge. A crisp
          hard line at a slight angle shows stair steps on normal (100% scaling) screens; a soft edge
          doesn't. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`orbit-rim-${index}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5a9bff" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#5a9bff" stopOpacity="0.5" />
            <stop offset="0.6" stopColor="#cfe2ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#f0f7ff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="16" stroke={`url(#orbit-rim-${index})`} strokeWidth="5" opacity="0.3" />
        <rect width="100%" height="100%" rx="16" stroke={`url(#orbit-rim-${index})`} strokeWidth="1.5" />
      </svg>
      {/* front-card rim: a stronger, even blue line all the way round with a tight halo. The halo is
          layered plain strokes, not a blur filter (a blur is costly to redraw every frame), so it stays
          a line and doesn't spread. The middle spot always has it at full strength: it is fully on from
          halfway into the middle, so while cards glide the arriving card lights up as the leaving one dims. */}
      <svg data-front-rim className="pointer-events-none absolute inset-0 h-full w-full overflow-visible opacity-0" fill="none" aria-hidden="true">
        <rect width="100%" height="100%" rx="16" stroke="#3b8bff" strokeWidth="8" opacity="0.14" />
        <rect width="100%" height="100%" rx="16" stroke="#3b8bff" strokeWidth="5" opacity="0.3" />
        <rect width="100%" height="100%" rx="16" stroke="#5aa2ff" strokeWidth="2.5" />
        <rect width="100%" height="100%" rx="16" stroke="#cfe5ff" strokeWidth="0.8" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function HeroOrbit({ cardHrefs }: { cardHrefs: Record<string, string> }) {
  const router = useRouter();
  const sceneRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const parts = useRef<(Parts | null)[] | null>(null);
  const holeRef = useRef<SVGRectElement | null>(null);
  const S = useRef<Scene>({ W: REF_W, H: REF_H, pos: 0, tween: null, rest: 0, speed: 1, dim: 0, hover: false, dragging: false, sel: null, selAmt: cards.map(() => 0) });
  const press = useRef<{ x: number; target: EventTarget | null; moved: boolean; id: number } | null>(null);
  const [sel, setSelState] = useState<number | null>(null);
  const [dims, setDims] = useState({ W: REF_W, H: REF_H });

  // start a glide of the whole loop to `to`
  const glideTo = useCallback((to: number, dur: number) => {
    const s = S.current;
    s.tween = { from: s.pos, to, t: 0, dur: Math.max(0.35, dur) };
  }, []);

  const setSel = useCallback(
    (i: number | null) => {
      const s = S.current;
      s.sel = i;
      setSelState(i);
      if (i !== null) {
        // travel the shortest way round so card i lands in the front slot
        const base = -i;
        const to = base + N * Math.round((s.pos - base) / N);
        glideTo(to, FOCUS_GLIDE * Math.min(3, Math.abs(to - s.pos)));
      } else {
        // resume moves straight away: the pointer is still over the scene (it just clicked),
        // so drop the hover pause until it leaves and comes back
        s.hover = false;
        s.speed = 1;
        s.rest = REST;
      }
    },
    [glideTo],
  );

  // the scene fills whatever box the hero gives it
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth || REF_W;
      const H = el.clientHeight || REF_H;
      S.current.W = W;
      S.current.H = H;
      setDims({ W, H });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // hang every card so its centre sits on its slot point
  useEffect(() => {
    slotRefs.current.forEach((slot) => {
      const inner = slot?.firstElementChild as HTMLElement | null;
      if (inner) inner.style.marginTop = `${-inner.offsetHeight / 2}px`;
    });
  }, []);

  // the one animation loop
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // card heights can change once the web fonts load: find and measure the parts again then
    document.fonts?.ready.then(() => {
      parts.current = null;
    });
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = S.current;
      const { u, ox, oy } = fit(s.W, s.H);

      // hover eases the whole orbit to a stop; a focused card's own glide is never paused
      const wantMoving = !s.hover && !s.dragging && !reduce;
      s.speed += ((wantMoving ? 1 : 0) - s.speed) * Math.min(1, dt * 4);
      s.dim += ((s.sel !== null ? 1 : 0) - s.dim) * Math.min(1, dt * 5);

      if (!s.dragging) {
        const rate = s.sel !== null ? 1 : s.speed;
        if (s.tween) {
          const tw = s.tween;
          tw.t = Math.min(tw.dur, tw.t + dt * rate);
          s.pos = tw.from + (tw.to - tw.from) * easeInOut(tw.t / tw.dur);
          if (tw.t >= tw.dur) {
            s.pos = tw.to;
            s.tween = null;
            s.rest = 0;
          }
        } else if (s.sel === null) {
          s.rest += dt * rate;
          // positive pos moves every card one slot further round: front -> front right -> right ...
          if (s.rest >= REST) glideTo(Math.round(s.pos) + 1, GLIDE);
        }
      }

      // Performance: the cards are redrawn by the browser (not moved as GPU bitmaps) so their edges stay
      // smooth, which makes every change to them costly. So each card's parts are found and measured
      // once, and a value is only written when it changes: at rest nothing is redrawn.
      if (!parts.current) parts.current = slotRefs.current.map((el) => (el ? cardParts(el) : null));
      let best = -1; // the card most in the middle
      let bestF = 0;
      for (let i = 0; i < N; i++) {
        const c = parts.current[i];
        if (!c) continue;
        const p = sample(slotOf(i, s.pos));
        s.selAmt[i] += ((s.sel === i ? 1 : 0) - s.selAmt[i]) * Math.min(1, dt * 6);
        const a = s.selAmt[i];
        const flat = 1 - a; // the focused card straightens out to be fully readable
        const side = Math.max(-1, Math.min(1, p.x / 420));

        const x = ox + (CX + p.x) * u;
        const y = oy + p.y * u;
        const scale = p.s * (1 + 0.08 * a) * u;
        const rz = p.rz * flat; // follows the curve of the ring
        const sx = 1 - 0.06 * Math.abs(side) * flat; // side cards are a touch narrower (seen at an angle)
        const sk = -6 * flat; // shared forward lean

        // 2D transform only. Any 3D part (perspective / rotateX / rotateY) makes the GPU draw the card as
        // a flat bitmap and warp it, which leaves jagged, stair-stepped borders on the tilted cards. A 2D
        // transform is drawn directly at its final angle and size, with smooth anti-aliased edges.
        // Never hand the card to the GPU while it moves (will-change): the GPU would scale and tilt a
        // bitmap drawn at the old size and angle, which goes pixelated mid-glide.
        put(c, "t", `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(4)}) rotate(${rz.toFixed(2)}deg) skewX(${sk.toFixed(2)}deg) scaleX(${sx.toFixed(4)})`, (v) => (c.el.style.transform = v));

        // depth shading: a black layer inside the card, never a CSS filter (a filter makes the tilted
        // card jagged) and never opacity (cards must not turn see-through)
        const shade = a > 0.02 ? 1 : p.b * (1 - 0.18 * s.dim);
        put(c, "shade", (1 - shade).toFixed(2), (v) => c.shade && (c.shade.style.opacity = v));
        put(c, "z", String(Math.round(p.d * 10) + (a > 0.5 ? 200 : 0)), (v) => (c.el.style.zIndex = v));

        const front = Math.max(0, (p.s - 0.58) / 0.42); // 1 in the hero slot, 0 from the neighbours outwards
        put(c, "glow", Math.max(0.4 + 0.6 * front, a).toFixed(2), (v) => c.glow && (c.glow.style.opacity = v));
        put(c, "arrow", flat.toFixed(2), (v) => c.arrow && (c.arrow.style.opacity = v));
        put(c, "pill", a.toFixed(2), (v) => c.pill && (c.pill.style.opacity = v));
        // middle-card glow: full from halfway into the middle slot, so the middle is never without it
        put(c, "rim", Math.max(Math.min(1, front * 2), a).toFixed(2), (v) => c.frontRim && (c.frontRim.style.opacity = v));
        if (front > bestF) {
          bestF = front;
          best = i;
        }
      }

      // The middle card hides the back half of the platform ring: a card-shaped hole in the middle
      // slot's shape, its strength following how far a card has arrived (5% steps, so the platform -
      // which has large blurs - is redrawn only a few times per glide, not every frame).
      const hole = holeRef.current ?? (holeRef.current = sceneRef.current?.querySelector<SVGRectElement>("[data-pad-cut]") ?? null);
      if (hole && best >= 0) {
        const c = parts.current[best]!;
        const a0 = Math.round(s.selAmt[best] * 10) / 10;
        const shape = `translate(${(ox + CX * u).toFixed(2)} ${(oy + SLOTS[0].y * u).toFixed(2)}) scale(${((1 + 0.08 * a0) * u).toFixed(4)}) skewX(${(-6 * (1 - a0)).toFixed(2)})|${c.h}`;
        if (hole.dataset.shape !== shape) {
          hole.dataset.shape = shape;
          hole.setAttribute("transform", shape.split("|")[0]);
          hole.setAttribute("y", String(-c.h / 2));
          hole.setAttribute("height", String(c.h));
        }
        const op = (Math.round(bestF * 20) / 20).toFixed(2);
        if (hole.getAttribute("opacity") !== op) hole.setAttribute("opacity", op);
      }      // the scene stays hidden until every card has its first position (no stacked flash on load)
      if (sceneRef.current && sceneRef.current.style.opacity !== "1") sceneRef.current.style.opacity = "1";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [glideTo]);

  // Escape sends the focused engine back into orbit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && S.current.sel !== null) setSel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSel]);

  const activate = useCallback(
    (i: number) => {
      if (S.current.sel === i) router.push(cardHrefs[cards[i].code] ?? cards[i].href); // second click: open the engine
      else setSel(i); // first click: bring it to the front
    },
    [router, setSel, cardHrefs],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-ui]")) return;
    press.current = { x: e.clientX, target: e.target, moved: false, id: e.pointerId };
    sceneRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    if (!p.moved && Math.abs(dx) < 6) return;
    p.moved = true;
    const s = S.current;
    s.dragging = true;
    s.tween = null;
    p.x = e.clientX;
    // dragging right carries the front card towards the front-right slot; ~270px per slot
    s.pos += (dx / (270 * fit(s.W, s.H).u)) * (N / K);
  };

  const onPointerUp = () => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    sceneRef.current?.releasePointerCapture(p.id);
    const s = S.current;
    if (p.moved) {
      s.dragging = false;
      const to = Math.round(s.pos);
      if (s.sel !== null) {
        // stay in focus mode while browsing: focus whichever engine lands in front
        setSel(mod(-to, N));
      } else {
        glideTo(to, 0.6);
      }
      return;
    }
    const card = (p.target as HTMLElement | null)?.closest?.("[data-card]") as HTMLElement | null;
    if (card) activate(Number(card.dataset.card));
    else if (s.sel !== null) setSel(null); // empty space resumes
  };

  return (
    <div
      ref={sceneRef}
      className="absolute inset-0 touch-pan-y select-none opacity-0"
      style={{ cursor: sel === null ? "grab" : "default" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => (S.current.hover = true)}
      onPointerLeave={() => (S.current.hover = false)}
    >
      <Ring W={dims.W} H={dims.H} />
      <Platform W={dims.W} H={dims.H} />
      <PlatformFlare W={dims.W} H={dims.H} />
      {cards.map((card, i) => (
        <div
          key={card.code}
          ref={(el) => {
            slotRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 h-0 w-0"
          style={{ transformOrigin: "0 0" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              activate(i);
            }
          }}
        >
          <div style={{ marginLeft: -CARD_W / 2 }}>
            <OrbitCard card={card} index={i} />
          </div>
        </div>
      ))}

      <button
        type="button"
        data-ui
        onClick={() => setSel(null)}
        aria-label="Resume orbit"
        title="Resume orbit"
        className={`absolute bottom-1 left-1/2 z-[300] grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border border-white/25 bg-white/10 text-white shadow-[0_0_18px_-4px_rgba(90,160,255,0.8)] backdrop-blur transition-opacity duration-300 hover:bg-white/20 ${sel === null ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        {/* circular arrow: send the engine back into orbit */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 12a8 8 0 1 1-2.34-5.66" />
          <path d="M20 4v5h-5" />
        </svg>
      </button>
    </div>
  );
}
