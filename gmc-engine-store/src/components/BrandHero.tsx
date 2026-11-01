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
      className={`
        group
        relative
        block
        w-full
        overflow-hidden
        rounded-xl
        border
        text-left
        backdrop-blur-lg
        transition-all
        duration-300

        ${
          /* iOS-style glass: near-transparent fill + moderate blur so the
             backdrop stays readable THROUGH the card. The old version used a
             0_0_60px blue bloom that washed over the surface and 24px blur that
             erased the background — that reads as flat faded blue, not glass. */
          /* identical fill — the featured card is marked by a thin glowing border only */
          isCenter
            ? `
              border-[#6bb0ff]
              bg-white/[0.02]
              shadow-[
                0_0_0_1px_rgba(107,176,255,0.45),
                0_0_16px_-1px_rgba(107,176,255,0.6),
                0_8px_32px_rgba(0,0,0,0.5)
              ]
            `
            : `
              border-white/12
              bg-white/[0.02]
              shadow-[0_8px_32px_rgba(0,0,0,0.5)]
              hover:border-white/25
            `
        }
      `}
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
          from-white/[0.05]
          to-transparent
        "
      />

      {/* Engine image */}
      <div className="relative px-3.5 pt-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.image}
          alt=""
          draggable={false}
          className="
            mx-auto
            max-h-[142px]
            w-full
            object-contain
          "
        />
      </div>

      {/* Engine information */}
      <div className="relative px-3.5 pb-3.5 pt-1.5">
        <p
          className="
            text-[15px]
            font-extrabold
            leading-none
            text-white
            [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]
          "
        >
          {card.code}
        </p>

        <p
          className="
            mt-1
            text-[11px]
            text-white/70
            [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]
          "
        >
          {card.name}
        </p>

        <div
          className="
            mt-2
            space-y-0.5
            text-[10px]
            font-medium
            leading-snug
            text-white/55
            [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]
          "
        >
          <p>{card.ps}</p>
          <p>{card.nm}</p>
          <p>{card.years}</p>
        </div>
      </div>
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
  const [paused, setPaused] = useState(false);

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
    if (paused || total <= 1) return;

    const id = window.setInterval(() => {
      setCenter((current) => (current + 1) % total);
    }, 4500);

    return () => window.clearInterval(id);
  }, [paused, total]);

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

  const slotAt = (offset: number) => {
    return (center + offset + total) % total;
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
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* =================================================
                ENGINE CARDS
                ================================================= */}

            <div
              className="
                relative
                z-20
                h-[272px]

                sm:h-[322px]

                lg:h-[312px]
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
                    justify-center mb-6
                  "
                >
                  {[-1, 0, 1].map((offset) => {
                    const cardIdx = slotAt(offset);
                    const card = cards[cardIdx];

                    const isCenter = offset === 0;

                    // portrait cards: narrower than before, and the image below is
                    // taller, so each card reads as ~3:4 rather than landscape
                    const widthClass = isCenter
                      ? "w-[150px] sm:w-[202px]"
                      : "w-[118px] sm:w-[164px]";

                    // sm+: (202+164)/2 = 183, so 214 leaves a real gap between
                    // neighbours. Narrow: 132 keeps all three inside a 390px screen
                    // (side cards render at scale .86, so they sit just clear of centre).
                    const xOffset = isCenter
                      ? 0
                      : offset * (narrow ? 132 : 214);

                    const yOffset = isCenter
                      ? 0
                      : 14;

                    return (
                      <motion.div
                        key={`slot-${offset}`}
                        initial={false}
                        animate={{
                          x: xOffset,
                          y: yOffset,
                          scale: isCenter ? 1 : 0.86,
                          opacity: isCenter ? 1 : 0.72,
                        }}
                        transition={{
                          duration: 0.7,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`
                          absolute
                          ${widthClass}
                        `}
                        style={{
                          zIndex: isCenter ? 25 : 15,
                        }}
                      >
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
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* =================================================
                CAR + ORBIT RINGS
                ================================================= */}

            <div
  className="
    relative
    isolate
    hidden
    lg:block

    lg:mt-0
    lg:h-[168px]
  "
>
              {/* Rings */}
              <svg
                viewBox="0 0 1000 320"
                preserveAspectRatio="xMidYMid meet"
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  left-1/2
                  h-[160px]
                  w-[118%]
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
                className="
                  pointer-events-none
                  absolute
                  bottom-0
                  left-1/2
                  hidden
                  lg:block
                  -translate-x-1/2
                  select-none
                  object-contain
                  object-bottom
                "
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