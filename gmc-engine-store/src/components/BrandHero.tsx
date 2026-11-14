"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "./Icon";
import UkFlag from "./UkFlag";
import { useRegCheck } from "./quote/QuoteModal";
import type { BrandPageData } from "@/lib/brand";
import { staticHref } from "@/lib/slugs";

/* =========================================================
   TYPES
   ========================================================= */

type HeroData = BrandPageData["hero"];
type Card = HeroData["cards"][number];

/* =========================================================
   ENGINE CARD
   ========================================================= */

function EngineCard({
  card,
  isCenter,
  onActivate,
}: {
  card: Card;
  isCenter: boolean;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={`${card.code} engine`}
      className="group relative block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050913]"
    >
      {/* Same glass treatment as the homepage hero cards: a soft outer bloom,
          a deep navy glass fill, lit corners, and a fine vector-like rim. */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity: isCenter ? 1 : 0.52,
          boxShadow:
            "-10px 0 24px -8px rgba(56,136,255,0.5), 10px 0 24px -8px rgba(225,238,255,0.3), 0 20px 36px -14px rgba(56,136,255,0.5)",
        }}
      />

      <span
        className="relative block overflow-hidden rounded-2xl p-3"
        style={{
          background:
            "linear-gradient(160deg, rgba(34,70,150,0.72) 0%, rgba(12,26,64,0.8) 34%, rgba(5,10,26,0.86) 100%)",
          boxShadow:
            "inset 6px 0 12px -10px rgba(80,155,255,0.32), inset -6px 0 12px -10px rgba(240,247,255,0.26), 0 20px 36px -14px rgba(0,0,0,0.75)",
        }}
      >
        {/* Lit rim and corner bloom keep the small brand cards readable against the car. */}
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
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
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: [
              "radial-gradient(90px 80px at 0 0, rgba(80,150,255,0.55), transparent 70%)",
              "radial-gradient(90px 80px at 0 100%, rgba(80,150,255,0.5), transparent 70%)",
              "radial-gradient(90px 80px at 100% 0, rgba(235,244,255,0.4), transparent 70%)",
              "radial-gradient(90px 80px at 100% 100%, rgba(235,244,255,0.36), transparent 70%)",
            ].join(", "),
          }}
        />
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 22%, transparent 50%)" }}
        />

        <div className="relative flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-none tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
              {card.code}
            </p>
            <p className="mt-1 truncate text-[11px] text-white/85 [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
              {card.name}
            </p>
          </div>
          <Icon name="heart" className="h-4 w-4 shrink-0 text-white/80" />
        </div>

        <span className="relative mt-1.5 inline-block rounded-md bg-primary-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
          Engine family
        </span>

        {/* Fixed image zone prevents cards with different engine proportions from changing height. */}
        <div className="relative mt-1 flex h-[136px] items-center justify-center px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            alt=""
            draggable={false}
            className="h-full w-full object-contain [filter:drop-shadow(0_8px_10px_rgba(0,0,0,0.6))]"
          />
        </div>

        <div className="relative flex items-end justify-between border-t border-white/20 pt-2">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-primary-200/90">Specs</p>
            <p className="mt-0.5 truncate text-[10px] font-bold text-white">{card.ps}</p>
            <p className="truncate text-[10px] font-medium text-white/85">{card.nm}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-md border border-primary-200/35 bg-primary-400/15 px-1.5 py-1 text-[9px] font-bold leading-none text-white shadow-[0_0_10px_rgba(96,165,250,0.15)]">
              {card.years}
            </span>
            <Icon name="arrow-right" className="h-4 w-4 text-primary-100" />
          </div>
        </div>
      </span>
    </button>
  );
}

/* =========================================================
   BRAND HERO
   ========================================================= */

export default function BrandHero({
  data,
}: {
  data: HeroData;
}) {
  const cards = data.cards;
  const total = cards.length;

  const rc = useRegCheck();
  const [center, setCenter] = useState(0);

  // The card offset is a JS number, so it can't be a Tailwind breakpoint. On narrow
  // screens the sm: spacing pushes both side cards off-screen, so track the viewport.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* =======================================================
     AUTO ROTATION
     ======================================================= */

  useEffect(() => {
    if (total <= 1) return;

    const id = window.setInterval(() => {
      setCenter((current) => (current + 1) % total);
    }, 4500);

    return () => window.clearInterval(id);
  }, [total]);

  /* =======================================================
     CAROUSEL CONTROLS
     ======================================================= */

  const prev = () => {
    setCenter((current) => {
      return (current - 1 + total) % total;
    });
  };

  const next = () => {
    setCenter((current) => {
      return (current + 1) % total;
    });
  };

  /* =======================================================
     HERO
     ======================================================= */

  return (
    <section
      className="
        hero-bg
        relative
        pb-8
        sm:pb-0
        sm:min-h-[calc(100svh-10rem)]
        overflow-x-clip
      "
    >
      {/* ===================================================
          BACKGROUND DOTS
          =================================================== */}

      <div
        className="
          hero-dots
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      />

      {/* ===================================================
          BOTTOM BLUE GLOW
          =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          h-[55%]
          overflow-hidden
        "
        style={{
          background:
            "radial-gradient(70% 60% at 62% 100%, rgba(37,99,235,0.38) 0%, rgba(37,99,235,0.10) 42%, transparent 76%)",
        }}
      />

      {/* ===================================================
          MAIN CONTENT
          =================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          sm:min-h-[calc(100svh-10rem)]
          w-full
          max-w-content
          flex-col
          justify-start
          sm:justify-center
          px-4
          pb-2
          pt-1

          sm:px-6

          lg:px-8
          lg:pb-6
          lg:pt-2
        "
      >
        {/* =================================================
            BREADCRUMB
            ================================================= */}

        <nav
          className="
            hidden
            items-center
            gap-1.5
            text-[11px]
            font-semibold
            text-white/55
            sm:flex
          "
        >
          <Link
            href="/"
            className="transition-colors hover:text-white"
          >
            Home
          </Link>

          <Icon
            name="chevron-right"
            className="h-3 w-3 text-white/30"
          />

          <Link
            href={staticHref("/brands")}
            className="transition-colors hover:text-white"
          >
            Brands
          </Link>

          <Icon
            name="chevron-right"
            className="h-3 w-3 text-white/30"
          />

          <span className="text-white/85">
            {data.brand} Engines
          </span>
        </nav>

        {/* =================================================
            TWO COLUMN GRID
            ================================================= */}

        <div
          className="
            mt-1
            grid
            grid-cols-1
            items-center
            gap-6

            lg:mt-4
            lg:grid-cols-2
            lg:gap-8
          "
        >
          {/* =================================================
              LEFT
              ================================================= */}

          <div className="relative z-10">

            {/* Heading */}
            <h1
              className="
                text-[30px]
                font-extrabold
                leading-[1.05]
                tracking-tight
                text-white

                sm:text-4xl

                lg:text-[46px]
              "
            >
              <span className="flex items-center gap-3 lg:gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.logo}
                  alt={`${data.name} logo`}
                  draggable={false}
                  className="
                    h-11
                    w-11
                    object-contain
                    drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]

                    lg:h-[60px]
                    lg:w-[60px]
                  "
                />

                <span>{data.name}</span>
              </span>

              <span className="mt-1 block">
                {data.title}
              </span>
            </h1>

            {/* Highlight */}
            <p
              className="
                mt-1.5
                text-xl
                font-bold
                leading-tight
                text-primary-500

                sm:text-2xl

                lg:mt-2
                lg:text-[34px]
              "
            >
              {data.highlight}
            </p>

            {/* Description */}
            <p
              className="
                mt-3
                max-w-md
                text-[13px]
                leading-relaxed
                text-ink-400

                lg:mt-4
                lg:text-[14px]
              "
            >
              {data.description}
            </p>

            {/* =================================================
                REGISTRATION FORM
                ================================================= */}

            <form
              id="reg-check"
              onSubmit={rc.onSubmit}
              className="
                relative
                mt-5
                max-w-md
                overflow-hidden
                rounded-xl
                border
                border-white/15
                bg-white/[0.07]
                backdrop-blur-xl

                shadow-[
                  0_20px_50px_-20px_rgba(0,0,0,0.6),
                  0_0_30px_-14px_rgba(96,165,250,0.5),
                  inset_0_1px_0_rgba(255,255,255,0.16)
                ]

                lg:mt-6
              "
            >
              {/* Glass sheen */}
              <span
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  h-1/3
                  bg-gradient-to-b
                  from-white/[0.10]
                  to-transparent
                "
              />

              <div className="relative flex items-center">

                {/* UK */}
                <span
                  className="
                    flex
                    items-center
                    gap-1.5
                    self-stretch
                    rounded-l-xl
                    border-r
                    border-white/15
                    bg-white/10
                    px-2.5
                  "
                >
                  <UkFlag className="h-4 w-6 rounded-sm" />

                  <span
                    className="
                      text-[11px]
                      font-bold
                      text-white/85
                    "
                  >
                    {data.regCheck.countryFlag}
                  </span>
                </span>

                {/* Input */}
                <input
                  type="text"
                  placeholder={data.regCheck.placeholder}
                  value={rc.reg} onChange={rc.onChange} name="reg" autoComplete="off" aria-label="Vehicle registration"
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-3
                    py-2.5
                    text-base
                    sm:text-[13px]
                    font-semibold
                    tracking-wide
                    text-white
                    outline-none
                    placeholder:text-white/45
                  "
                />

                {/* Button */}
                <button
                  type="submit"
                  className="
                    shrink-0
                    self-stretch
                    rounded-r-xl
                    bg-primary-600
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition-all
                    duration-200
                    ease-out

                    hover:bg-primary-500
                    hover:shadow-cta

                    lg:px-5
                  "
                >
                  {data.regCheck.buttonText}
                </button>
              </div>
            </form>

            {/* Help link */}
            <Link
              href="#reg-check"
              className="
                mt-3
                inline-flex
                items-center
                gap-1.5
                text-[12px]
                font-semibold
                text-white/70
                transition-colors
                hover:text-white
              "
            >
              {data.regCheck.helpText}

              <Icon
                name="chevron-right"
                className="h-3 w-3"
              />
            </Link>
          </div>

          {/* =================================================
              RIGHT
              ================================================= */}

          <div
            className="
              relative
              min-w-0
            "
          >
            {/* =================================================
                ENGINE CARDS
                ================================================= */}

            <div
              className="
                relative
                z-20
                h-[248px]

                sm:h-[286px]

                lg:h-[276px]
              "
            >
              <div
                className="
                  relative
                  mx-auto
                  h-full
                  max-w-[560px]
                "
              >
                {/* Previous */}
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous engine"
                  className="
                    absolute
                    -left-1
                    top-1/2
                    z-30
                    grid
                    h-9
                    w-9
                    -translate-y-1/2
                    place-items-center
                    rounded-full
                    border
                    border-primary-400/60
                    bg-primary-500/10
                    text-primary-300
                    backdrop-blur-xl
                    transition-all

                    hover:bg-primary-500/25
                    hover:text-white

                    sm:left-0
                  "
                >
                  <Icon
                    name="chevron-left"
                    className="h-4 w-4"
                  />
                </button>

                {/* Next */}
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next engine"
                  className="
                    absolute
                    -right-1
                    top-1/2
                    z-30
                    grid
                    h-9
                    w-9
                    -translate-y-1/2
                    place-items-center
                    rounded-full
                    border
                    border-primary-400/60
                    bg-primary-500/10
                    text-primary-300
                    backdrop-blur-xl
                    transition-all

                    hover:bg-primary-500/25
                    hover:text-white

                    sm:right-0
                  "
                >
                  <Icon
                    name="chevron-right"
                    className="h-4 w-4"
                  />
                </button>

                {/* Cards */}
                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                  "
                >
                  {cards.map((card, cardIdx) => {
                    // Keep every card mounted, like the homepage orbit. When the
                    // center index changes, the incoming card travels from its
                    // existing side position into the front instead of being
                    // swapped directly into the center slot.
                    const forwardOffset = (cardIdx - center + total) % total;
                    const offset = forwardOffset > total / 2 ? forwardOffset - total : forwardOffset;
                    const distance = Math.abs(offset);
                    const isCenter = offset === 0;
                    const isSide = distance === 1;

                    const xOffset = offset * (narrow ? 148 : 190);
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
                      <motion.div
                        key={card.code}
                        initial={false}
                        animate={{
                          x: xOffset,
                          y: yOffset,
                          scale,
                          opacity,
                          rotate,
                        }}
                        transition={{
                          duration: 0.85,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute w-[150px] sm:w-[202px]"
                        style={{
                          zIndex: isCenter ? 25 : isSide ? 15 : 1,
                          pointerEvents: isCenter || isSide ? "auto" : "none",
                        }}
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

                              setCenter(cardIdx);
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* =================================================
                CAR + ORBIT RINGS
                ================================================= */}

            <div className="brand-hero-plate hidden lg:block">
              {/* Rings */}
              <svg
                viewBox="0 0 1000 320"
                preserveAspectRatio="xMidYMid meet"
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  left-1/2
                  h-[132px]
                  w-[106%]
                  -translate-x-1/2
                "
                fill="none"
                style={{
                  filter:
                    "drop-shadow(0 0 8px rgba(96,165,250,0.55))",
                  zIndex: 1,
                }}
              >
                <ellipse
                  cx="500"
                  cy="180"
                  rx="470"
                  ry="96"
                  stroke="#5aa0ff"
                  strokeWidth="2.5"
                  opacity="0.5"
                />

                <ellipse
                  cx="500"
                  cy="180"
                  rx="355"
                  ry="68"
                  stroke="#8ec0ff"
                  strokeWidth="1.5"
                  opacity="0.36"
                />

                <ellipse
                  cx="500"
                  cy="180"
                  rx="235"
                  ry="44"
                  stroke="#8ec0ff"
                  strokeWidth="1.5"
                  opacity="0.24"
                />
              </svg>

              {/* Car */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.carImage}
                alt={`${data.name} car`}
                draggable={false}
                className="vehicle-cutout brand-hero-car pointer-events-none hidden select-none lg:block"
                style={{
                  zIndex: 10,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TRUST BADGES

          The section bottom line passes through the vertical
          middle of this card.

                      HERO
          ──────────────────────────
             ┌─────────────────┐
             │ upper 50%       │
          ───│─────────────────│─── hero bottom
             │ lower 50%       │
             └─────────────────┘
                    NEXT SECTION

          translate-y-1/2 moves exactly half of the TrustBar
          below the Hero.

          z-[100] keeps it above both sections.
          ===================================================== */}

      {/* In normal flow on mobile: the straddling absolute position needs a fixed
          hero height to straddle, and without one it sat on top of the cards.
          From sm: up the hero is 100svh again, so the straddle is restored. */}
      <div
        className="
          relative
          mx-auto
          mt-3
          z-[100]
          w-full
          max-w-content
          px-4

          sm:absolute
          sm:bottom-0
          sm:left-1/2
          sm:mt-0
          sm:-translate-x-1/2
          sm:translate-y-1/2
          sm:px-6

          lg:px-8
        "
      >
        <div
          className="
            rounded-xl
            border
            border-line
            bg-white
            px-4
            py-3.5
            shadow-[0_18px_50px_-12px_rgba(0,0,0,0.25)]

            sm:px-5
            sm:py-4

            lg:px-7
          "
        >
          <div
            className="
              grid
              grid-cols-2
              gap-x-4
              gap-y-3

              lg:grid-cols-4
              lg:gap-y-0
              lg:divide-x
              lg:divide-line
            "
          >
            {data.trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5

                  lg:gap-3
                  lg:px-5

                  first:lg:pl-0
                "
              >
                {/* Icon */}
                <span
                  className="
                    grid
                    h-8
                    w-8
                    shrink-0
                    place-items-center
                    rounded-full
                    border
                    border-primary-200
                    bg-primary-50
                    text-primary-600

                    sm:h-9
                    sm:w-9
                  "
                >
                  <Icon
                    name={badge.icon}
                    className="h-4 w-4"
                  />
                </span>

                {/* Text */}
                <div className="min-w-0">
                  <p
                    className="
                      text-[12px]
                      font-bold
                      leading-tight
                      text-ink-900

                      sm:text-[13px]

                      lg:text-[14px]
                    "
                  >
                    {badge.title}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      leading-tight
                      text-ink-500

                      sm:text-[11px]

                      lg:text-[12px]
                    "
                  >
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
