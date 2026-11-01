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
  { x: 0, y: 300, s: 1.0, d: 9, rz: 0, b: 1 }, //        front (hero card)
  { x: 272, y: 440, s: 0.58, d: 8, rz: -7, b: 1 }, // front right
  { x: 420, y: 272, s: 0.46, d: 7, rz: 8, b: 0.96 }, //   right
  { x: 362, y: 96, s: 0.4, d: 5, rz: 3, b: 0.92 }, //     back right, outer
  { x: 214, y: 112, s: 0.43, d: 4, rz: 2, b: 0.92 }, //   back right, inner
  { x: -214, y: 112, s: 0.43, d: 4, rz: -3, b: 0.92 }, // back left, inner
  { x: -362, y: 96, s: 0.4, d: 5, rz: -3, b: 0.92 }, //   back left, outer
  { x: -420, y: 272, s: 0.46, d: 7, rz: -5, b: 0.96 }, // left
  { x: -272, y: 440, s: 0.58, d: 8, rz: 5, b: 1 }, // front left
];
const K = SLOTS.length;
const RING = { cx: CX, cy: 330, rx: 470, ry: 178, tilt: -2.5 };

const REST = 1.7; // seconds the cards rest between glides
const GLIDE = 1.25; // seconds one glide takes
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
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="hero-track pointer-events-none absolute inset-0 h-full w-full" fill="none" style={{ zIndex: 0 }}>
      <defs>
        <linearGradient id="hero-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f9dff" stopOpacity="0.35" />
          <stop offset="0.55" stopColor="#4f9dff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#7cc0ff" stopOpacity="1" />
        </linearGradient>
        <filter id="hero-ring-blur" x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <g transform={`rotate(${RING.tilt} ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="#2f7bff" strokeWidth={12} opacity={0.45} filter="url(#hero-ring-blur)" />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="url(#hero-ring)" strokeWidth={2.2} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke="#d6ebff" strokeWidth={2} strokeLinecap="round" strokeDasharray="1 16" opacity={0.85} />
        <ellipse cx={cx} cy={cy - 8 * u} rx={rx * 0.72} ry={ry * 0.66} stroke="#5aa0ff" strokeWidth={1.5} strokeLinecap="round" strokeDasharray="1 12" opacity={0.35} />
      </g>
    </svg>
  );
}

function OrbitCard({ card, index }: { card: Card; index: number }) {
  const reconditioned = card.condition === "Reconditioned";
  return (
    <div className="relative" style={{ width: CARD_W }}>
      {/* outer bloom; its strength follows depth (set per frame) */}
      <span
        data-glow
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: "-10px 0 24px -8px rgba(56,136,255,0.5), 10px 0 24px -8px rgba(225,238,255,0.3), 0 22px 40px -14px rgba(56,136,255,0.5)" }}
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
        {/* rim light: bright at the four corners, faint along the sides;
            the left edge is blue, the right edge is white */}
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            padding: 2,
            background: [
              "radial-gradient(70px 70px at 0 0, rgba(150,200,255,1), transparent 70%)",
              "radial-gradient(70px 70px at 0 100%, rgba(120,185,255,1), transparent 70%)",
              "radial-gradient(70px 70px at 100% 0, rgba(255,255,255,1), transparent 70%)",
              "radial-gradient(70px 70px at 100% 100%, rgba(255,255,255,1), transparent 70%)",
              "linear-gradient(90deg, rgba(70,140,255,0.6) 0%, rgba(90,150,255,0.22) 45%, rgba(200,225,255,0.25) 60%, rgba(240,247,255,0.65) 100%)",
            ].join(", "),
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          }}
        />
        {/* inward corner glow: light spilling into the glass from each corner */}
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: [
              "radial-gradient(130px 110px at 0 0, rgba(80,150,255,0.55), transparent 70%)",
              "radial-gradient(130px 110px at 0 100%, rgba(80,150,255,0.5), transparent 70%)",
              "radial-gradient(130px 110px at 100% 0, rgba(235,244,255,0.4), transparent 70%)",
              "radial-gradient(130px 110px at 100% 100%, rgba(235,244,255,0.36), transparent 70%)",
            ].join(", "),
          }}
        />
        {/* glass sheen across the top-left */}
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.14] via-white/[0.02] to-transparent"
          style={{ maskImage: "linear-gradient(125deg, #000 0%, transparent 50%)", WebkitMaskImage: "linear-gradient(125deg, #000 0%, transparent 50%)" }}
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
            className="mx-auto w-full object-contain [filter:drop-shadow(0_10px_14px_rgba(0,0,0,0.6))_drop-shadow(0_0_14px_rgba(90,160,255,0.25))]"
            style={{ height: 200 }}
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
      </div>
    </div>
  );
}

export default function HeroOrbit() {
  const router = useRouter();
  const sceneRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
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

      for (let i = 0; i < N; i++) {
        const el = slotRefs.current[i];
        if (!el) continue;
        const p = sample(slotOf(i, s.pos));
        s.selAmt[i] += ((s.sel === i ? 1 : 0) - s.selAmt[i]) * Math.min(1, dt * 6);
        const a = s.selAmt[i];
        const flat = 1 - a; // the focused card straightens out to be fully readable
        const side = Math.max(-1, Math.min(1, p.x / 420));

        const x = ox + (CX + p.x) * u;
        const y = oy + p.y * u;
        const scale = p.s * (1 + 0.08 * a) * u;
        const rx = 10 * flat; // top leans back
        const ry = 16 * side * flat; // the edge facing the centre card is the nearer one
        const rz = p.rz * flat;
        const sk = -6 * flat; // shared forward lean

        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) skewX(${sk.toFixed(2)}deg)`;
        // depth shading uses brightness, not opacity, so cards never turn see-through
        const shade = a > 0.02 ? 1 : p.b * (1 - 0.18 * s.dim);
        el.style.filter = shade > 0.995 ? "none" : `brightness(${shade.toFixed(3)})`;
        el.style.zIndex = String(Math.round(p.d * 10) + (a > 0.5 ? 200 : 0));

        const front = Math.max(0, (p.s - 0.58) / 0.42); // 1 in the hero slot, 0 from the neighbours outwards
        const glow = el.querySelector<HTMLElement>("[data-glow]");
        const arrow = el.querySelector<HTMLElement>("[data-arrow]");
        const pill = el.querySelector<HTMLElement>("[data-pill]");
        if (glow) glow.style.opacity = Math.max(0.4 + 0.6 * front, a).toFixed(3);
        if (arrow) arrow.style.opacity = flat.toFixed(3);
        if (pill) pill.style.opacity = a.toFixed(3);
      }
      // the scene stays hidden until every card has its first position (no stacked flash on load)
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
      if (S.current.sel === i) router.push(cards[i].href); // second click: open the engine
      else setSel(i); // first click: bring it to the front
    },
    [router, setSel],
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
      className="absolute inset-0 touch-pan-y select-none opacity-0 transition-opacity duration-500"
      style={{ cursor: sel === null ? "grab" : "default" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => (S.current.hover = true)}
      onPointerLeave={() => (S.current.hover = false)}
    >
      <Ring W={dims.W} H={dims.H} />
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
