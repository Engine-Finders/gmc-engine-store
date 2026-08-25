# GMC Engine Store — Project Context (handoff)

Read this first in a new session. It captures state so you don't re-derive it.

## ▶ Current focus / next steps
_(Keep this section updated each session so a fresh chat knows exactly where to pick up.)_
- **Last session:** model page refined (hero rebuilt fluid, alternating section bands, mobile pass), site-wide glassmorphism rework, mobile fixes on brand + model heroes. All typecheck clean.
- **Open / unverified:** the glass effect on `BrandHero` + `HeroCarousel` cards may still be inert — see "Glassmorphism" below for the backdrop-root caveat. User was still unhappy with how transparent the cards look; this is the live thread.
- **Decisions pending from user:** (1) make shared Header/Footer theme-aware (light header in light mode) — currently they stay dark; (2) write `scripts/md_to_modelpage.py` (deprioritized); (3) real images to replace placeholders.
- **How to resume cheaply:** new chat → "Read gmc-engine-store/CONTEXT.md, then <one task>" → have me update this section when done.

## Design rules the client asked for (don't regress these)
- **Border radius on panels/cards: 10–14px.** Use `rounded-xl` (12px). `rounded-2xl`/`rounded-3xl` were swept out site-wide — it's a "serious site", the boss checks this.
- **Section rhythm:** brand page `pb-10 lg:pb-12`; model page uses `py-12 lg:py-14` (it has alternating background bands, so it needs symmetric padding).
- **Model page section bands alternate** two shades: base `bg-white dark:bg-[#070c18]`, alt `bg-[#f7f9fc] dark:bg-[#0a1120]`. Order: Hero(base) Featured(alt, light-only) EngineTable(base) PriceGuide(alt) UsedGenerations(base) Faqs(alt) Related(base) Cta(alt). If you tint a section, check its inner panel isn't the same colour.
- **`ModelFeatured` is light-only** — no `dark:` variants there by request.
- **Section headers with a logo/icon:** mark and title sit on one row (`flex items-center gap-3`); body copy goes *below* at the mark's left edge, not indented beside it.

## What this is
Next.js 14 (App Router) + Tailwind marketing site for "GMC Engine Store" (used/reconditioned car engines).
- Root: `e:/Job/gmc-engine-store` (run all commands from here).
- Dev server: `npm run dev` (usually **:3000**; 3001 sometimes). Build: `npm run build`.
- Designs live in sibling folders: `e:/Job/GMC Homepage UI`, `GMC Brandpage UI`, `GMC Modelpage UI`, and mockups `e:/Job/MOCKUP-01/02/03-*.md`.
- The user replaces placeholder images with real ones later — **don't obsess over image quality/exact photos**; follow the reference **layouts** strictly.

## Golden rules (learned from this project)
- **Strictly follow the reference design images** — don't build from memory. View the `Section *.png` files before building/refining a section.
- **All content comes from JSON** (`src/data/*.json`). Components are data-driven; text/prices/specs are never hardcoded.
- **Never run two Next processes against the same `.next`** (`npm run build` while `next dev` is live, or two dev servers). On Windows this throws `UNKNOWN errno -4094` on `.next/static/chunks/...`, because a rename against an open handle is a sharing violation. Fix: kill all `next` processes, `rm -rf .next`, restart one.
  - `.next` **used to be tracked in git** (141 files) which made this happen constantly — git/editor/AV held handles on the exact chunk files Next was replacing. Now untracked, with a proper `.gitignore`. Don't re-add it.
- Undefined Tailwind colors render invisible. Defined `ink` shades are **400,500,700,800,900** only — **no 100/200/300/600**. `text-ink-600` and `bg-ink-100` appear in older code and silently render nothing; several have been fixed, more may lurk. Grep for `ink-[1236]00` when touching a file.
- Consistent section spacing — see "Design rules" above (brand `pb-10 lg:pb-12`, model `py-12 lg:py-14`).
- **iOS inputs zoom the viewport on focus if `font-size < 16px`**, which pans the page and looks like a broken layout. Every reg input is `text-base sm:text-[13px]`. Keep ≥16px on mobile for any new input.
- Images with transparent padding are a recurring trap: `Modelpage_C.png` is 24% empty top/bottom, `Modelpage_C_light.png` is 0.9% bottom, the price-guide car is **70% empty**. Measure the alpha bbox before sizing/positioning — don't eyeball it.
- Don't put `mix-blend-mode: lighten` on a dark PNG over a dark bg: it keeps the *lighter* pixel, so bright rings/strokes punch straight through the artwork. These PNGs have real alpha; no blend mode needed.
- The user hand-edits/reformats files between turns (multiline classNames). Always re-read a file before editing; don't assume your last version is current.

## Screenshots (QA)
Chrome at `/c/Program Files/Google/Chrome/Application/chrome.exe`. Use CDP, not `--window-size` (that renders at ~504px and crops, giving false "overflow").
- `scripts/shot.js <port> <width> <out.png>` uses CDP `Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot captureBeyondViewport`.
- Headless Chrome defaults to `prefers-reduced-motion: reduce` — CSS animations look static in screenshots and (if the user's OS has reduce-motion on) for them too. Don't gate float/marquee on that media query; prefer JS `requestAnimationFrame` for scroll/marquee so it always runs.
- Asset extraction from low-res mockups: `scripts/extract.js` (sharp) — flood-fill bg removal (`cropBgRemove`, luminance < maxLum), connected-component line/speck removal, per-logo crop bounds.

## Glassmorphism (hero cards) — hard-won, read before touching
Reference implementation the user likes: `D:/VS/LogarithmWebsite` → `app/globals.css` `.glass-panel`
(`bg rgba(255,255,255,.03)` + `blur(16px)` + `1px rgba(255,255,255,.1)` border + `0 8px 32px rgba(0,0,0,.5)`).
Current recipe on all 4 card surfaces (`HeroOrbit`, `HeroCarousel`, `BrandHero`, `ModelHeroCarousel`):
`bg-white/[0.02]` + `backdrop-blur-lg` + `border-white/12` + `shadow-[0_8px_32px_rgba(0,0,0,0.5)]`.
Featured/centre card differs by **border glow only** — identical fill (user was explicit).

Things that killed the effect (all removed — don't reintroduce):
- **`backdrop-saturate`** — saturates the *backdrop*; over a navy hero it renders the card area as a more-saturated blue rectangle. This was the #1 "why is it blue" cause.
- **Big coloured bloom** `0 0 60px rgba(59,130,246,.85)` inside an `overflow-hidden` card = flat blue wash.
- **`blur-2xl`/24px** erases the backdrop so there's nothing to see through. 16px is the ceiling.
- **All-blue backdrop detail** — a blue field behind a transparent card just tints it blue. `.glass-field` in globals.css is deliberately mostly *neutral white* detail.
- **Nested `backdrop-filter`** (a blurred badge inside a blurred card) double-blurs and looks broken.

Sharpness ("cards look dull/soft"): `translateZ(0)`, `backface-visibility:hidden`, `preserve-3d` and
`will-change:transform` each pin a **fixed-resolution GPU texture** that is not re-rastered when a parent
`scale()` applies — `HeroOrbit` downscales its stage to 0.74, so everything got resampled. All removed.
Also removed `[filter:contrast()_saturate()]` from engine images (`filter` rasterizes the element itself).

**Still unresolved:** `backdrop-filter` may be inert on `BrandHero`/`HeroCarousel` cards — framer-motion puts
`transform`+`opacity` on an ancestor, which creates a *backdrop root*, so the filter sees nothing behind it.
Fixing means restructuring so the blurred surface isn't a descendant of the animated element.

`.glass-field` (globals.css) exists because `.hero-bg` is 700–900px gradients at 0.1–0.22 alpha —
blurring something that soft by 16px is a visual no-op. Keep its features small; widening them
removes the very detail the effect depends on. (User asked for the diagonal stripes to be removed.)

## Pages & architecture

### Home — `src/app/page.tsx`
Sections in `src/components/*`: Header, Hero (`HeroOrbit` desktop = click-to-focus glass orbit cards + `HeroCarousel` mobile coverflow), TrustBar (inside Hero), BrowseByBrand, FeaturedEngines, HowItWorks, ShopByBrand, InfoCards, PopularEngines, GmcAndFaq, CTA, Footer. Data: `hero.json`, `brands.json`, `engines.json`, `buyEngine.json`, `features.json`, etc. Theme: dark hero/header/footer + accent panels, light body. (Note: the user has reformatted several of these; re-read before editing.)

### Brand page — `src/app/[brandSlug]/page.tsx` (e.g. `/mercedes-benz-engines`)
Data: `src/data/brandPage.json` keyed by slug, **nested by section**. Helper: `src/lib/brand.ts` (`getBrandData`, `brandSlugs`). Components in `src/components/brand/`: BrandHero (scattered? no — 3-card carousel + car + orbit rings + straddling trust bar, fits viewport via `min-h-[calc(100svh-6rem)]`), BrandHowItWorks, BrandFeaturedEngines (desktop JS auto-scroll marquee + mobile coverflow), BrandShopByModel (10 + expand to 23, mobile h-scroll), BrandEngineFamilies (full-bleed dark band, mobile in-section scroll), BrandPriceGuide (desktop 2-col reference / mobile stacked), BrandUsedVsRecon, BrandAbout (logo+car watermarks, car hidden on mobile), BrandWarrantyDelivery (3-col: warranty | delivery | `uk_map.png`), BrandFaqs (all-open on desktop, accordion mobile), BrandCta. Home BrowseByBrand cards link here. Model cards inside BrandShopByModel link to `/mercedes-benz-engines/<model>`.

### Model page — `src/app/[brandSlug]/[modelSlug]/page.tsx` (e.g. `/mercedes-benz-engines/c-class`)  ← most recent work
**`ModelHero` is fully fluid — no scale breakpoints.** The visual is authored on a fixed **900x760 design
grid** (that's what `pos` in `modelPage.json` means), then rendered via container queries: the column is
`[container-type:size]`, the stage is `aspect-[900/760] w-[min(100cqw,118.421cqh)]` (a pure-CSS contain-fit),
and children use `pctX/pctY` (% of grid) + `cqw()` (px-on-grid → cqw) from `ModelHeroCarousel.tsx`.
Add positions in grid px and the helpers do the rest. A ladder of `scale-*` + `max-height` media queries
used to do this job and they fought each other — don't go back.
`EngineCard` + `cqw` live in **`ModelHeroCarousel.tsx`** (a client module) because the mobile coverflow needs
`"use client"` and importing back from `ModelHero` would be circular. `fluid={false}` switches the card to
plain px (no query container on mobile); `scale` multiplies those px; `uniform` drops the featured card's
larger metrics so every carousel slide matches.
Light/dark cars are two `<img>` toggled by `dark:hidden`/`hidden dark:block` with **different coords**, because
the two PNGs have very different alpha padding. Mobile shows no car (removed by request) — brand hero too.
Data: `src/data/modelPage.json` keyed by model slug (each has `brandSlug`). Helper: `src/lib/model.ts`. **Supports light + dark mode**: Tailwind `darkMode:"class"`; `src/components/model/ModelThemeShell.tsx` (client) wraps sections, persists theme to localStorage, floating sun/moon toggle; every model component uses `dark:` variants. Components in `src/components/model/`: ModelHero (logo + "C-Class / Engines for Sale — / Used & Reconditioned", scattered engine cards around car, reg form, trust bar), ModelFeatured (h-scroll), ModelEngineTable (client, generation tabs W203–W206 filter the ~52 rows), ModelPriceGuide (2000→2025 timeline + 4 gen cards), ModelUsedGenerations (2 panels: used/recon + through-generations timeline), ModelFaqs, ModelRelated, ModelCta.

### Engine hub page — `src/app/engines/[engineSlug]/page.tsx` (e.g. `/engines/om651`)  ← most recent work
Built from `MOCKUP-04-hub-page-om651.md` + `GMCHub/` references (Section 1/2/3 desktop, `Section *-mobile.png`,
`Section f-mobile light.png` for the light theme). Data: `src/data/hubPage.json` keyed by engine slug; helper
`src/lib/hub.ts` (`getHubData`, `hubSlugs`). Wrapped in `ModelThemeShell` (light + dark), so every component
carries `dark:` variants. Components in `src/components/hub/`:
- **HubHero** — `lg:h-[calc(100svh-69px)]` (69px = the sticky header's `h-[68px]` + border) flex column with a
  `min-h-0 flex-1` middle row, so the trust bar can't be pushed off-screen; falls back to auto height under
  `max-height:720px`. Engine (`engine.png`) + `podium.png` composite, **no CSS rings**. Right rail of 5 glass
  spec cards, side-by-side with the engine at *every* size — the mobile reference keeps that two-column block.
  The left column uses `display:contents` on mobile so its two halves order around the engine
  (title → engine+specs → quick specs/blurb/reg form), rejoining one column from `lg`.
- **HubApplications** — 8 unit cards: desktop snap-scroller with arrows inside a panel; mobile coverflow
  (centre + two peeking) with dots, same idea as `BrandFeaturedEngines`.
- **HubTables** — compatibility + prices panels, `lg:grid-cols-[1.12fr_1fr]`, stacked on mobile. Both tables
  live in `overflow-x-auto` + `min-w-*` containers; without that the 6-column table forces the whole *page* to
  scroll sideways and shifts the hero.
- **HubWhatYouGet** — heading above both panels (aligns their tops); included/not-included two-up on desktop,
  stacked with a `GlowRule` divider on mobile.
- **HubFaqs** — closed by default, independent; `lg:columns-2` (CSS columns, **not** grid) so opening one
  answer never stretches its neighbour. CTA box with the new `clipboard` icon follows.

## Data → page pipeline (Python)
`scripts/md_to_brandpage.py` parses `MOCKUP-02-*.md` → adds an entry to `brandPage.json` → the `[brandSlug]` route renders it (add JSON = new page). Usage: `python scripts/md_to_brandpage.py "../MOCKUP-XX.md"`. **A model-page equivalent (`md_to_modelpage.py`) is NOT yet written** — user deprioritized it. The MD has content but not images / hero torque figures / some prices; the script fills defaults and prints TODOs.

## Open items / caveats (model page)
- Model page **built and compiles**; not yet pixel-refined against references section-by-section (user will review).
- **Header & Footer are NOT theme-aware** — they stay dark on the model page. Reference shows a light header in light mode. Theming them is a global change (affects home/brand which want a dark header over dark hero) — do only if user asks; the clean approach is default `<html>` to dark + add `dark:` variants to Header/Footer + let each page set the html theme class.
- Model images are placeholders (`Brandpage.png`, existing engine pngs). `uk_map.png` is a real asset the user added; `UkMap.tsx` SVG fallback also exists.
- `md_to_modelpage.py` still to write (low priority).

## Memory
Persistent notes: `C:/Users/nafiz/.claude/projects/e--Job/memory/` (see `gmc-engine-store.md`, `MEMORY.md`).
