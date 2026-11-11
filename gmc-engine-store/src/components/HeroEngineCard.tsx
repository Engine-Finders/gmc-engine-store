"use client";

import Link from "next/link";
import Icon from "./Icon";

export type HeroEngineCardData = {
  code: string;
  subtitle: string;
  image: string;
  href: string;
  badge?: string;
  ps?: string;
  nm?: string;
  years?: string;
  price?: string;
  inStock?: boolean;
};

type Props = {
  card: HeroEngineCardData;
  isCenter?: boolean;
  onActivate?: () => void;
  tone?: "dark" | "light";
  compact?: boolean;
};

/** Shared glass engine card used by brand and model hero carousels. */
export default function HeroEngineCard({ card, isCenter = true, onActivate, tone = "dark", compact = false }: Props) {
  const hasFamilySpecs = Boolean(card.ps || card.nm || card.years);
  const badge = card.badge ?? (hasFamilySpecs ? "Engine family" : "Featured engine");
  const isLight = tone === "light";

  const surface = (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity: isCenter ? 1 : 0.52,
          boxShadow: isLight
            ? "-8px 0 24px -10px rgba(37,99,235,0.22), 8px 0 24px -10px rgba(148,163,184,0.2), 0 20px 36px -14px rgba(15,23,42,0.16)"
            : "-10px 0 24px -8px rgba(56,136,255,0.5), 10px 0 24px -8px rgba(225,238,255,0.3), 0 20px 36px -14px rgba(56,136,255,0.5)",
        }}
      />

      <span
        className={`relative block overflow-hidden rounded-2xl ${compact ? "p-2.5" : "p-3"} ${isLight ? "border border-white/85 backdrop-blur-xl" : ""}`}
        style={{
          background: isLight
            ? "linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(249,252,255,0.84) 48%, rgba(234,242,255,0.72) 100%)"
            : "linear-gradient(160deg, rgba(34,70,150,0.72) 0%, rgba(12,26,64,0.8) 34%, rgba(5,10,26,0.86) 100%)",
          boxShadow: isLight
            ? "inset 0 1px 0 rgba(255,255,255,0.95), inset 8px 0 18px -14px rgba(96,165,250,0.45), inset -8px 0 18px -14px rgba(148,163,184,0.22), 0 18px 32px -18px rgba(15,23,42,0.25)"
            : "inset 6px 0 12px -10px rgba(80,155,255,0.32), inset -6px 0 12px -10px rgba(240,247,255,0.26), 0 20px 36px -14px rgba(0,0,0,0.75)",
          backdropFilter: isLight ? "blur(18px) saturate(1.2)" : undefined,
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            padding: 1.5,
            background: [
              isLight
                ? "radial-gradient(50px 50px at 0 0, rgba(96,165,250,0.75), transparent 70%)"
                : "radial-gradient(50px 50px at 0 0, rgba(150,200,255,1), transparent 70%)",
              isLight
                ? "radial-gradient(50px 50px at 0 100%, rgba(147,197,253,0.6), transparent 70%)"
                : "radial-gradient(50px 50px at 0 100%, rgba(120,185,255,1), transparent 70%)",
              isLight
                ? "radial-gradient(50px 50px at 100% 0, rgba(255,255,255,0.95), transparent 70%)"
                : "radial-gradient(50px 50px at 100% 0, rgba(255,255,255,1), transparent 70%)",
              isLight
                ? "radial-gradient(50px 50px at 100% 100%, rgba(191,219,254,0.75), transparent 70%)"
                : "radial-gradient(50px 50px at 100% 100%, rgba(255,255,255,1), transparent 70%)",
              isLight
                ? "linear-gradient(90deg, rgba(96,165,250,0.75) 0%, rgba(147,197,253,0.22) 45%, rgba(191,219,254,0.28) 60%, rgba(255,255,255,0.8) 100%)"
                : "linear-gradient(90deg, rgba(70,140,255,0.6) 0%, rgba(90,150,255,0.22) 45%, rgba(200,225,255,0.25) 60%, rgba(240,247,255,0.65) 100%)",
            ].join(", "),
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
          }}
        />
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: [
              isLight
                ? "radial-gradient(90px 80px at 0 0, rgba(96,165,250,0.16), transparent 70%)"
                : "radial-gradient(90px 80px at 0 0, rgba(80,150,255,0.55), transparent 70%)",
              isLight
                ? "radial-gradient(90px 80px at 0 100%, rgba(147,197,253,0.14), transparent 70%)"
                : "radial-gradient(90px 80px at 0 100%, rgba(80,150,255,0.5), transparent 70%)",
              isLight
                ? "radial-gradient(90px 80px at 100% 0, rgba(255,255,255,0.7), transparent 70%)"
                : "radial-gradient(90px 80px at 100% 0, rgba(235,244,255,0.4), transparent 70%)",
              isLight
                ? "radial-gradient(90px 80px at 100% 100%, rgba(219,234,254,0.35), transparent 70%)"
                : "radial-gradient(90px 80px at 100% 100%, rgba(235,244,255,0.36), transparent 70%)",
            ].join(", "),
          }}
        />
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: isLight ? "linear-gradient(125deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.18) 24%, transparent 52%)" : "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 22%, transparent 50%)" }}
        />

        <div className="relative flex items-start justify-between">
          <div className="min-w-0">
            <p className={`text-lg font-extrabold leading-none tracking-tight ${isLight ? "text-ink-900" : "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"}`}>
              {card.code}
            </p>
            <p className={`mt-1 truncate text-[11px] ${isLight ? "text-ink-500" : "text-white/85 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]"}`}>
              {card.subtitle}
            </p>
          </div>
          <Icon name="heart" className={`h-4 w-4 shrink-0 ${isLight ? "text-ink-400" : "text-white/80"}`} />
        </div>

        <span className={`relative mt-1.5 inline-block rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${isLight ? "bg-primary-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.24)]" : "bg-primary-600 text-white"}`}>
          {badge}
        </span>

        <div className={`relative mt-1 flex ${compact ? "h-[108px]" : "h-[136px]"} items-center justify-center px-1`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            alt=""
            draggable={false}
            className={`h-full w-full object-contain ${isLight ? "[filter:drop-shadow(0_8px_10px_rgba(15,23,42,0.22))]" : "[filter:drop-shadow(0_8px_10px_rgba(0,0,0,0.6))]"}`}
          />
        </div>

        {hasFamilySpecs ? (
          <div className={`relative flex items-end justify-between border-t pt-2 ${isLight ? "border-slate-200/80" : "border-white/20"}`}>
            <div className="min-w-0">
              <p className={`text-[8px] font-bold uppercase tracking-[0.14em] ${isLight ? "text-primary-600" : "text-primary-200/90"}`}>Specs</p>
              <p className={`mt-0.5 truncate text-[10px] font-bold ${isLight ? "text-ink-900" : "text-white"}`}>{card.ps}</p>
              <p className={`truncate text-[10px] font-medium ${isLight ? "text-ink-500" : "text-white/85"}`}>{card.nm}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={`rounded-md border px-1.5 py-1 text-[9px] font-bold leading-none shadow-[0_0_10px_rgba(96,165,250,0.15)] ${isLight ? "border-primary-200 bg-primary-50 text-primary-700" : "border-primary-200/35 bg-primary-400/15 text-white"}`}>
                {card.years}
              </span>
              <Icon name="arrow-right" className={`h-4 w-4 ${isLight ? "text-primary-600" : "text-primary-100"}`} />
            </div>
          </div>
        ) : (
          <div className={`relative flex items-end justify-between border-t pt-2 ${isLight ? "border-slate-200/80" : "border-white/20"}`}>
            <div className="min-w-0">
              <p className={`text-[8px] font-bold uppercase tracking-[0.14em] ${isLight ? "text-primary-600" : "text-primary-200/90"}`}>From</p>
              <p className={`mt-0.5 truncate text-[15px] font-extrabold leading-none ${isLight ? "text-ink-900" : "text-white"}`}>{card.price}</p>
              {card.inStock && (
                <span className={`mt-1 inline-flex items-center gap-1 text-[9px] font-semibold ${isLight ? "text-emerald-600" : "text-green-300"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full shadow-[0_0_6px_rgba(74,222,128,0.8)] ${isLight ? "bg-emerald-500" : "bg-green-300"}`} />
                  In stock
                </span>
              )}
            </div>
            <Icon name="arrow-right" className={`h-4 w-4 ${isLight ? "text-primary-600" : "text-primary-100"}`} />
          </div>
        )}
      </span>
    </>
  );

  if (onActivate) {
    return (
      <button
        type="button"
        onClick={onActivate}
        aria-label={`${card.code} engine`}
        className="group relative block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050913]"
      >
        {surface}
      </button>
    );
  }

  return (
    <Link
      href={card.href}
      aria-label={`${card.code} engine`}
      className="group relative block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050913]"
    >
      {surface}
    </Link>
  );
}
