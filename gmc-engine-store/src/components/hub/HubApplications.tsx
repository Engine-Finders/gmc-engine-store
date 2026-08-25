"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import type { HubPageData } from "@/lib/hub";

type Data = HubPageData["applications"];
type Unit = Data["units"][number];

function UnitCard({ u, ctaText, fav, onFav }: { u: Unit; ctaText: string; fav: boolean; onFav: () => void }) {
  const recon = u.condition === "Reconditioned";
  return (
    <div className="group flex h-full flex-col rounded-xl border border-line dark:border-white/12 bg-white dark:bg-white/[0.03] p-2 pb-3 transition-all duration-300 hover:border-primary-400/70 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_14px_36px_-14px_rgba(8,16,32,0.35)]">
      {/* badge + heart float over the artwork instead of occupying their own row,
          so the full card width and height go to the engine */}
      <div className="relative z-10 -mb-6 flex items-start justify-between gap-2">
        <span className={`rounded-md px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${recon ? "bg-primary-600 text-white" : "bg-[#eef1f6] text-ink-600 dark:bg-white/10 dark:text-white/70"}`}>
          {u.condition}
        </span>
        <button type="button" onClick={onFav} aria-label="Save" className="shrink-0 text-ink-400 transition-colors hover:text-primary-600 dark:text-white/45">
          <Icon name="heart" className={`h-4 w-4 ${fav ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      {/* Bleeds past the card padding to every side. The source PNG is pre-trimmed
          to its alpha bounding box (engine_trim.png) — the untrimmed engine.png
          wastes ~27% of its width and ~16% of its height on transparency, which
          no CSS box size can compensate for. */}
      {/* pt clears the badge/heart row that floats above it — without it the top
          of the engine runs into the pill */}
      <div className="relative -mx-2 h-[168px] pt-9 sm:h-[186px] lg:h-[110px] lg:pt-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={u.image} alt={u.title} draggable={false} className="h-full w-full object-contain" />
      </div>

      <div className="mt-1 flex flex-1 flex-col text-center lg:text-left">
        <p className="text-[16px] font-bold leading-tight text-ink-900 dark:text-white lg:text-[15px]">{u.title}</p>
        <p className="mt-1 text-[12px] leading-snug text-ink-500 dark:text-white/60 lg:text-[11.5px]">{u.subtitle}</p>
        <p className="mt-auto pt-2 text-[21px] font-extrabold leading-none text-ink-900 dark:text-white lg:text-[20px]">{u.price}</p>
        <Link href={u.href} className="mt-2 inline-flex items-center justify-center gap-1.5 text-[13px] font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 lg:justify-start lg:text-[13px]">
          {ctaText}
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function HubApplications({ data }: { data: Data }) {
  const units = data.units;
  const n = units.length;

  const [favs, setFavs] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setFavs((p) => {
      const s = new Set(p);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  // Mobile — coverflow: one centred card with its neighbours peeking, stepped by
  // the arrows that overlay the active card's edges.
  const [center, setCenter] = useState(0);
  const step = (dir: 1 | -1) => setCenter((c) => (c + dir + n) % n);

  return (
    <section className="bg-white dark:bg-[#070c18] py-6 lg:py-7">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <div className="lg:rounded-xl lg:border lg:border-line lg:dark:border-white/10 lg:bg-[#f7f9fc] lg:dark:bg-white/[0.02] lg:p-6">
          <h2 className="text-[24px] font-bold leading-tight tracking-tight text-ink-900 dark:text-white sm:text-[28px] lg:text-[24px]">{data.title}</h2>
          <p className="mt-2 max-w-4xl text-[13.5px] leading-[1.7] text-ink-600 dark:text-white/65 lg:mt-1.5 lg:text-[13px]">{data.subtitle}</p>

          {/* -------- desktop: all 8 units in one row, no slider -------- */}
          <div className="mt-5 hidden grid-cols-8 items-stretch gap-3 lg:grid xl:gap-4">
            {units.map((u) => (
              <UnitCard key={u.id} u={u} ctaText={data.ctaText} fav={favs.has(u.id)} onFav={() => toggle(u.id)} />
            ))}
          </div>
        </div>

        {/* -------- mobile: swipeable coverflow with edge arrows -------- */}
        {/* No fixed stage height. Every card is absolutely positioned, so nothing
            was contributing height and the 450px guess left a big empty band under
            the cards. This invisible in-flow copy of the active card sizes the
            stage to exactly the card — no dead space, and no clipping if the copy
            wraps to more lines on a narrow phone. */}
        <div className="relative mt-3 lg:hidden">
          <div aria-hidden className="pointer-events-none invisible mx-auto w-[54vw] max-w-[250px]">
            <UnitCard u={units[center]} ctaText={data.ctaText} fav={false} onFav={() => {}} />
          </div>

          <div className="absolute inset-0 overflow-hidden">
            {units.map((u, i) => {
              const pos = (i - center + n) % n;
              const isCenter = pos === 0;
              const isRight = pos === 1;
              const isLeft = pos === n - 1;
              const visible = isCenter || isLeft || isRight;
              // 104% of a card's own width: the neighbours clear the active card's
              // edge (which spans ±50%) with a small gap, so they sit BESIDE it
              // and peek, instead of being stacked behind it
              const x = isCenter ? 0 : isRight ? 104 : -104;
              return (
                <div
                  key={u.id}
                  onClick={() => !isCenter && setCenter(i)}
                  // narrower card: it reads taller, and the space freed at the
                  // sides is what lets the neighbours actually show
                  className="absolute left-1/2 top-1/2 w-[54vw] max-w-[250px] cursor-pointer transition-all duration-500 ease-out"
                  style={{
                    transform: `translate(calc(-50% + ${x}%), -50%) scale(${isCenter ? 1 : 0.94})`,
                    zIndex: isCenter ? 30 : 20,
                    opacity: visible ? (isCenter ? 1 : 0.7) : 0,
                    pointerEvents: visible ? "auto" : "none",
                  }}
                >
                  <UnitCard u={u} ctaText={data.ctaText} fav={favs.has(u.id)} onFav={() => toggle(u.id)} />
                </div>
              );
            })}
          </div>

          {/* arrows sit over the active card's left/right edges */}
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous unit"
            className="absolute left-[calc(50%-27vw-14px)] top-1/2 z-40 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink-400/40 dark:border-white/25 bg-white/80 dark:bg-white/10 text-ink-700 dark:text-white backdrop-blur transition-colors hover:border-primary-400"
          >
            <Icon name="chevron-left" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next unit"
            className="absolute right-[calc(50%-27vw-14px)] top-1/2 z-40 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-ink-400/40 dark:border-white/25 bg-white/80 dark:bg-white/10 text-ink-700 dark:text-white backdrop-blur transition-colors hover:border-primary-400"
          >
            <Icon name="chevron-right" className="h-5 w-5" />
          </button>
        </div>

        {/* one dot per unit */}
        <div className="mt-3 flex items-center justify-center gap-2 lg:hidden">
          {units.map((_, i) => (
            <button
              key={i}
              onClick={() => setCenter(i)}
              aria-label={`Unit ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${center === i ? "bg-primary-600" : "bg-ink-400/45 dark:bg-white/25"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
