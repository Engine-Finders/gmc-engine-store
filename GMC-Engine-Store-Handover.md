# GMC Engine Store - Project Handover

One Next.js website for GMC, a UK seller of used and reconditioned car engines at fixed prices. A visitor finds an engine by brand, model or registration plate, opens a listing page and asks for a quote. About 5,800 of those listing pages are generated from a markdown export by a script.

Environment variables are listed by **name only**. Values live in `.env.local` and in the Vercel project settings.

---

## 1. Overview

| Item | Value |
|---|---|
| Live domain | www.engined.co.uk (`engined.co.uk` redirects to `www`) |
| GitHub repo | [Engine-Finders/gmc-engine-store](https://github.com/Engine-Finders/gmc-engine-store), branch `main` |
| Repo layout | The Next.js app is in the **subfolder `gmc-engine-store/`** of the repo. The repo root also holds the design mockups (`MOCKUP-*.md`), `HANDOVER.txt` and a few reference images that are not part of the app. Run every command from the app folder |
| Vercel | Three projects build this repo (see section 9). The `hashir5/gmc-engine-store` project is the one the CLI deploys were made to |
| Registrar and DNS | Namecheap (`dns1/dns2.registrar-servers.com`) |
| Mailbox | `leads@engined.co.uk`, hosted on StackCP (MX `mx.stackmail.com`) |

- Older handover notes also exist: `HANDOVER.txt` (repo root) and `gmc-engine-store/CONTEXT.md` (design rules, glass-card notes, Windows `.next` gotcha). They pre-date the listing extractor, the lead flow and the contact page. This document wins where they disagree.
- The garage sites (BMW, Mercedes, Jaguar, Land Rover) are a separate family of projects. The GMC lead flow was copied from Land Rover. Its handover (`Garage-Sites-Handover.md`) is kept with the garage repos; ask the owner for a copy.

**Core flow:** a visitor lands on a brand, hub or listing page, types a plate into one of the registration boxes, and the site-wide quote pop-up opens with the vehicle looked up. They submit name, phone, email and postcode. The form posts to `/api/send-lead`, which emails `leads@engined.co.uk` through the shared PHP mail relay and, in parallel, saves the lead in the shared Supabase CRM.

---

## 2. Where things live

Paths are relative to the app folder `gmc-engine-store/`:

| Path | What it is |
|---|---|
| `src/app` | Routes (section 4), `api/send-lead/route.ts`, `contact/page.tsx`, `layout.tsx`, `globals.css` |
| `src/components` | Home sections at the top level; `brand/`, `hub/`, `model/`, `listing/`, `quote/` for the page types and the lead form |
| `src/data` | JSON content: hand-built pages (`brandPage.json`, `modelPage.json`, `hubPage.json`, `listingPage.json`), shared copy (`listingDefaults.json`, `navigation.json`, `footer.json`, `contact.json`), home data, and `listings/` (generated) |
| `src/data/listings/<engine>/<application>.json` | 5,816 generated listing pages, one file each. About 25 MB. Committed to git |
| `src/lib` | `listing.ts`, `brand.ts`, `hub.ts`, `model.ts`, `navMenu.ts`, `leads.ts`, `vrmLookup.ts`, `site.ts` |
| `public/images` | `brands`, `engines`, `hub`, `models`, `listings` (podium, engine placeholder, `default/` car photos, `engines/` engine photos) |
| `scripts` | `md_to_listingpage.py` (listing extractor), `slice_default_images.py`, `md_to_brandpage.py`, `shot.js` (screenshots), image helpers. Not run in production |
| `listing-md/<brand>/*.md` | The extractor's input: 5,951 listing markdown files. **Git-ignored and also ignored by Vercel.** Keep a local copy |
| `.vercelignore` | What the Vercel CLI uploads. It replaces `.gitignore` for uploads |
| `.env.example` | Variable names for the lead flow |

**Not in git** (ask the owner for copies; paths are relative to the repo root):

| Item | Where to put it | Used by |
|---|---|---|
| `engine-images/` - background-removed engine photos | repo root, or any folder passed with `--engine-images` or `GMC_ENGINE_IMAGES` | the extractor copies the photos it needs into `public/images/listings/engines/` |
| `default_images/` - contact sheets of brand car photos | repo root | `scripts/slice_default_images.py` |
| `gmc-engine-store/listing-md/<brand>/*.md` - the listing markdown | inside the app folder | the extractor |
| `GMC-All-Listing-Pages.zip` - the original export | anywhere | `--zip` (alternative to `listing-md`) |

The generated output (`src/data/listings`, `public/images/listings`) is in git, so the site builds without any of the above. They are only needed to regenerate pages.

---

## 3. Technology

| Area | Choice | Notes |
|---|---|---|
| Framework | Next.js 14.2.5 (App Router), React 18.3, TypeScript 5 | Older than the garage sites (Next 16, React 19) |
| Styling | Tailwind CSS 3.4, `darkMode: "class"` | Config is `tailwind.config.js`, not CSS-first. Important modifier is a leading `!` here, not trailing |
| Animation | framer-motion 12 | Carousels and hero cards only |
| Images | `<img>` and static png/webp | `sharp` is used by build-time scripts only |
| Font | Inter | Loaded from Google Fonts in `layout.tsx` |
| Server code | One route handler, `/api/send-lead` | |
| Hosting | Vercel | |
| Mail | PHP relay on StackCP, `relay.mercedesgarage.uk` | Same relay as the garage sites. Vercel cannot use SMTP reliably |
| CRM | Supabase Edge Function | Same shared lead store as the garage sites |
| Tests | None | `npx tsc --noEmit` is the main safety net. ESLint is not configured (`next lint` asks to set it up) |

There is no database, cart or checkout. "Add to basket" and "Buy it now" open the quote pop-up with the listing's title and SKU in the enquiry.

---

## 4. How the site is built

Pages are **data-driven**. A page type is a set of components; each page is one JSON entry keyed by its URL slug.

| Page type | URL | Components | Data |
|---|---|---|---|
| Home | `/` | top-level components in `src/components` | `hero.json`, `brands.json`, `engines.json`, `cta.json` and others |
| Brand | `/<brand-slug>` (only `mercedes-benz-engines` exists) | `components/brand` | `brandPage.json`, `lib/brand.ts` |
| Model | `/<brand-slug>/<model-slug>` (only `c-class`) | `components/model` | `modelPage.json`, `lib/model.ts` |
| Engine hub | `/engines/<engine>` (only `om651`) | `components/hub` | `hubPage.json`, `lib/hub.ts` |
| Listing | `/engines/<engine>/<application>` | `components/listing` | hand-built `listingPage.json` or generated `listings/**` through `lib/listing.ts` |
| Contact | `/contact` | `app/contact/page.tsx` | `contact.json` |

**Hand-built vs generated listings.** `lib/listing.ts: getListingData` first looks for a hand-built entry in `listingPage.json` (the W204 page, key `om651-mercedes-c-class-w204`). If none, it reads the slim file `src/data/listings/<engine>/<application>.json` and merges the shared copy from `listingDefaults.json`. The hand-built page is never touched by the extractor.

**Generated listing page:** `ListingHero` (gallery, spec cards, price options, quote buttons, registration box), `ListingAbout` plus "What's included", `ListingCompatible`, `ListingInfoCards` (warranty, other applications, why buy), `ListingFaqs`, `ListingCta`. Pages are wrapped in `ModelThemeShell` (light and dark).

**Static vs on demand.** Only the `om651` listings are pre-rendered (`generateStaticParams` in the listing route). Every other listing renders on first visit (`dynamicParams = true`), reading its JSON from disk. `next.config.js` has `outputFileTracingIncludes` for the listing route so Vercel bundles `src/data/listings/**`. Without it, production returns 404 for generated listings.

**Navbar.** `Header.tsx` is a server wrapper that calls `lib/navMenu.ts` and passes the lists to `HeaderClient.tsx`. The Engines and Brands dropdowns are built from the keys of `hubPage.json` and `brandPage.json`, so the menu only lists pages that exist. Other links come from `navigation.json`. Check Fitment and the mobile search button open the quote pop-up.

**Theming.** Dark navy header, hero and footer with a light body. `ModelThemeShell` adds a light/dark toggle on model, hub and listing pages only. Design rules from the client: panel radius 10-14px (`rounded-xl`, not `2xl`/`3xl`), section rhythm `pb-10 lg:pb-12` on brand pages, `py-12 lg:py-14` on model pages.

**Tailwind colour trap.** Only these `ink` shades exist: 400, 500, 700, 800, 900. `text-ink-600`, `bg-ink-100` and similar render nothing. Many older files still use them (grep `ink-[1236]00`). Use 500 or 700.

---

## 5. Listing extraction (markdown to pages)

`scripts/md_to_listingpage.py` turns the listing markdown export into the slim JSON files.

```
cd gmc-engine-store
python -I scripts/md_to_listingpage.py --dry-run                  # report only
python -I scripts/md_to_listingpage.py                            # write pages
python -I scripts/md_to_listingpage.py --brand bmw                # one brand
python -I scripts/md_to_listingpage.py --zip <export.zip>         # read a zip instead of the folder
python -I scripts/md_to_listingpage.py --engine-images <folder>   # engine photos elsewhere (or set GMC_ENGINE_IMAGES)
python -I scripts/md_to_listingpage.py --dry-run --report out.json   # list every source problem
```

- **Input:** `listing-md/<brand>/*.md`. The brand folder names match the export: audi, bmw, citroen, jaguar, landrover, `mercedez` (sic), mini, nissan, peugeot, renault, seat, suzuki, toyota, vauxhall, volkswagen, volvo. Paste new files into the right brand folder. A loose `.md` in the root is skipped. Windows cannot store `|` in file names, so the unzipped copies have it replaced by `-`.
- **Layouts handled:** the files come in several shapes (bold labels, plain labels, `## H1:` headings, `<ul><li>` lists, "LIST:" plain lines, numbered lists, a whole-file JSON object, and a fenced ```json block). The parser normalises each line and looks labels up case-insensitively. A new layout shows up as "skipped" or as an empty field in the dry run. Add support in `parse_*` rather than editing the markdown.
- **Output:** one slim JSON per listing (title, price options, SKU, stock text, spec cards, fits list, included and not-included, CTA, SEO, gallery). Shared copy is not repeated per file; it lives in `listingDefaults.json`.
- **URL:** the engine and application slugs come from the markdown's canonical URL (`/engines/<engine>/<application>`).
- **Gallery rule (from the brief):** every listing gets 3 images: car front photo, engine-bay photo (a deterministic pick from the brand's default pair in `public/images/listings/default/`), then the actual engine image from the `engine-images` folder (section 2). Images are matched by engine code; a brand-generic engine image is used only where one is marked generic. With no usable engine image the neutral `engine.png` placeholder is used. Brands with no default pair get an engine-only gallery.
- **Trimmed vs padded engine PNGs:** the old `engine.png` has built-in padding; the new engine webps are alpha-trimmed. Gallery items carry `trimmed`, and `ListingHero` and `ListingAbout` size them differently. Do not make them share one size.
- **About copy and FAQs:** the markdown has neither, so `lib/listing.ts` fills the templates in `listingDefaults.json` (`about`, `faqs`) with the brand, engine code, vehicle and part number. They are adapted from the hand-built W204 page; the questions that only apply to that car were left out. The recon variants were written fresh and need a business read.
- **Duplicate and clashing slugs:** identical duplicates are dropped; a reconditioned file that reuses its used twin's URL gets `-recon`; different content on the same URL gets `-2`. The slug in the file's own canonical then no longer matches the live URL.
- **Image slicing:** `scripts/slice_default_images.py` cuts the brand contact sheets in `default_images/` into `public/images/listings/default/<brand>-<n>-front|bay.webp`. It covers BMW, Jaguar, Land Rover, Mercedes, Volkswagen and Audi.

**Current numbers:** 5,951 source files, 5,816 pages built. Not built: 9 refusal notes, 14 files with no price, 112 identical duplicates. The full per-file list is in `GMC-Listing-Issues-Report.pdf` and `.csv` (not in git; regenerate the list any time with `--dry-run --report issues.json`).

---

## 6. Lead pipeline, APIs and integrations

### 6.1 Lead flow

| Step | What happens | Code |
|---|---|---|
| 1 | A registration box (home hero, brand hero, hub hero, listing hero, CTA bands) submits; the pop-up opens with the plate | `useRegCheck` in `components/quote/QuoteModal.tsx` |
| 2 | The pop-up (or the contact page) looks the plate up and shows make, model, year, engine size and fuel | `components/quote/QuoteForm.tsx`, `lib/vrmLookup.ts` |
| 3 | The visitor fills name, phone, email, postcode and an optional enquiry. A hidden honeypot catches bots | `QuoteForm`, `useLeadForm.tsx` (`LeadStatus`) |
| 4 | The form POSTs JSON to `/api/send-lead` with `page_url` and `lead_source` (`quote-popup` or `contact-page`) | `useLeadForm.tsx` |
| 5 | The route drops honeypot leads (fake success), requires an email or phone, then sends the email and the CRM post in parallel | `app/api/send-lead/route.ts` |
| 6 | Success if either channel works. 502 only if both fail. Failures go to `console.error` | same |

The same `QuoteForm` serves the pop-up and `/contact`, so both send the same payload. Field ids take an `idPrefix` so two forms can be on screen at once.

### 6.2 Payload and CRM mapping

Forms post `name, number, email, postcode, description, vehicle_vrm`, and when a plate was looked up `vehicle_brand, vehicle_series, year, engine_capacity, fuel_type, vehicle_part`. `lib/leads.ts: toCrmLeadPayload` maps them to the CRM's names (engine size converted from cc to litres, `vehicle_part` defaults to "Engine", `source` is the domain, `source_page` is the domain plus path without the query string). **Known gap, same as the garage sites:** `year` is emailed but not mapped into the CRM.

### 6.3 Mail

- The route POSTs to `MAIL_RELAY_URL` with header `X-Relay-Secret`. The relay sends with PHP `mail()`. It is plain HTTP, protected by the shared secret.
- Sender and recipient are both `leads@engined.co.uk`; cc is `ef2crm@gmail.com`, copied from the garage sites.
- The relay must accept `engined.co.uk` as a sender. A wrong sender domain makes it answer 502. **This has not been tested with a real lead yet.**
- DNS at Namecheap, all set: MX `mx.stackmail.com`; SPF `v=spf1 include:spf.stackmail.com a mx -all`; DKIM TXT on `s1._domainkey`; DMARC TXT `v=DMARC1; p=none`. Namecheap email forwarding (the old `eforward*` MX records) is gone, so any other `@engined.co.uk` forwarders no longer work.

### 6.4 CRM (Supabase)

`SUPABASE_WEBHOOK_URL` is the shared receive-lead Edge Function and `SUPABASE_ANON_KEY` authenticates the call. A 409 means a duplicate within the function's window and counts as success. There is no `/leads` admin page on this site yet (the garage sites have one).

### 6.5 Vehicle-data (plate look-up) API

The browser calls our own `GET /api/vrm?vrm=<plate>` (`src/app/api/vrm/route.ts`), which calls `https://api.checkcardetails.co.uk/vehicledata/vehicleregistration` with the key from the server-only `VRM_API_KEY`. The key is no longer in the browser bundle or the source. The route only answers calls from the site's own pages (`Sec-Fetch-Site` or `Referer`), validates the plate, and rate-limits per IP (30 per 10 minutes per server instance, a brake and not a guarantee). It returns only make, model, year, engine size, fuel and colour. Errors show as "Please enter a valid UK registration number." There is no vehicle photo matching on this site.

**The old key is still valid and is in the git history and in earlier deployed bundles.** Only the account owner at the provider can rotate it or limit it by domain (see section 13).

### 6.6 Environment variable names

| Name | Used for |
|---|---|
| `MAIL_RELAY_URL`, `MAIL_RELAY_SECRET` | Mail relay endpoint and shared secret |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, `MAIL_TO_ADDRESS`, `MAIL_CC_ADDRESS` | Sender, recipient, cc |
| `SUPABASE_WEBHOOK_URL`, `SUPABASE_ANON_KEY` | CRM write |
| `NEXT_PUBLIC_SITE_URL` | Lead source domain (defaults to `https://engined.co.uk`) |
| `LEAD_SOURCE` | Optional override of the lead source domain |
| `VRM_API_KEY` | Plate look-up key. Required, server only. Without it `/api/vrm` answers 503 |

Set in Production on the `hashir5/gmc-engine-store` Vercel project. If the live domain is served by another Vercel project, set them there as well.

---

## 7. Images and assets

- **Engine photos:** the extractor copies the webps it uses from the `engine-images` folder (section 2) into `public/images/listings/engines/`. They are already background-removed.
- **Car and bay photos:** `public/images/listings/default/`, one pair per brand and variant.
- **Placeholders and shared art:** `public/images/listings/engine.png` and `engine_trim.png`, `podium.png`, `listing_about.png`.
- **Brand logos, cars and hub art:** `public/images/brands`, `hub`, `models`, `engines`.
- **Transparent padding trap:** many PNGs have large transparent margins (a model car is 24% empty top and bottom, the price-guide car 70%). Measure the alpha bounding box before sizing; do not eyeball it.
- **Blend modes:** do not put `mix-blend-mode: lighten` on a dark PNG over a dark background.
- **Glass cards:** `backdrop-filter` can be inert under a framer-motion ancestor (it becomes a backdrop root). `CONTEXT.md` has the full list of what to avoid.

---

## 8. Local development

```
cd gmc-engine-store          # the app folder, not the git root
npm install                  # first time only
npm run dev                  # http://localhost:3000
npm run build
npx tsc --noEmit             # type check; keep clean
```

- Never run two Next processes against the same `.next` (for example `npm run build` while `next dev` runs). On Windows it throws `UNKNOWN errno -4094`. Stop all `next` processes, delete `.next`, start one.
- iOS Safari zooms on any input under 16px. Keep inputs at `text-base` on mobile.
- Many files use CRLF. Scripts that edit files should read and write with `newline=''` and keep the endings.
- Screenshots: `scripts/shot.js <chromeDebugPort> <width> <out.png>` drives Chrome through the debugging port.
- Edit pages through the JSON, not the components. To change the generated listings copy, edit `listingDefaults.json`, not 5,800 files.

---

## 9. Deploying

- **Git:** push to `main`. Three Vercel projects build this repo:
  - `hashir5/gmc-engine-store` (the one CLI deploys were made to). Its **Root Directory must be `gmc-engine-store`**, because the app is in a subfolder of the repo. With the default `.` the build fails with "Couldn't find any `pages` or `app` directory". Set it under Settings > Build and Deployment.
  - `gmc-engine-store` and `gmc-engine-store-l2ag` under `engine-finders-projects`, both built successfully from the same commits.
  - It is **not confirmed which project the domain `www.engined.co.uk` is attached to.** Check before relying on a push to update the site.
- **CLI deploy (works when Git is not an option):** from the app folder run
  `NODE_OPTIONS=--max-old-space-size=8192 vercel deploy --yes --archive=tgz`
  Without `--archive=tgz` the CLI uploads about 6,000 files; it ran out of memory and then hit the free plan's 5,000-files-per-day upload limit (`api-upload-free`). If the project's Root Directory is set, do not use the CLI from inside the app folder; use Git.
- **First CLI deploy of a project goes to Production.** Pass `--prod` or not deliberately.
- **After a deploy,** run `vercel ls` in the app folder: the newest Production row must be Ready. An older Error row is only history. Then open a generated listing, `/contact` and the home page.
- **`.vercelignore`** keeps `listing-md`, `scripts`, zips, reports, `.env*` and notes out of the upload. A `.vercelignore` replaces `.gitignore` for uploads, so keep the basics in it.
- Vercel's deployment protection redirects unauthenticated requests on `*.vercel.app` URLs to a login. The custom domain is public.

---

## 10. Current state

| Area | State |
|---|---|
| Home page | Built (hero, browse by brand, featured, how it works, shop by brand, info cards, popular, FAQ, CTA) |
| Brand pages | Only Mercedes-Benz exists; the home page links to six brands |
| Model pages | Only Mercedes C-Class |
| Engine hubs | Only OM651 |
| Listings | 1 hand-built (OM651 / W204) and 5,816 generated, covering all 16 brand folders |
| Quote flow | Pop-up, registration lookup, `/api/send-lead`, honeypot, `/contact` page |
| Navbar | Dropdowns built from existing pages, anchors to the home page sections, Contact page |
| Mail DNS | MX, SPF, DKIM, DMARC set for `engined.co.uk` |

---

## 11. Conventions and gotchas

- **Plain hyphens only** in visible text (no em or en dashes). The extracted markdown still contains some; the listing JSON keeps the source text as is.
- **Client wording** (prices, claims, counts, SKUs) comes from the markdown and is not edited in code.
- **Reference images beat spec text** when building pages from mockups.
- **Mobile first** unless someone says "desktop".
- **Every lead form** must render `<LeadStatus lead={lead} />` (it carries the honeypot), and any custom field must clear its own state on the form's `reset` event (`QuoteForm` does).
- **Do not run the extractor over the hand-built page.** It only writes `src/data/listings/**`. Do not re-run it blindly if people have hand-edited generated JSON; diff first.
- **A new engine code or brand** in the markdown needs: an entry in `BRANDS` or `ENGINE_FOLDERS` in the script if it is a new folder, engine photos in the `engine-images` folder (section 2), and a default car pair sliced into `public/images/listings/default/`.
- **Brand folders are engine-maker families**, not car makes. The Peugeot folder contains Nissan 370Z listings and the Citroen folder contains Suzuki Vitara. The breadcrumb uses the folder's brand name.
- **Canonicals in the markdown** use `engined.co.uk`; `layout.tsx` still has `https://example.com` as `metadataBase` and canonical. Fix before relying on SEO output.
- **Do not send test leads** to production without the owner's OK.

---

## 12. Recently completed

- Listing extractor with folder input, `--report`, parser support for all layouts seen so far, and 5,816 generated pages.
- Three-image gallery rule, engine and About image sizing for trimmed photos, default car pairs for six brands.
- About copy and FAQ templates from the W204 page.
- Lead flow ported from Land Rover: pop-up, registration lookup, `/api/send-lead`, honeypot, shared `QuoteForm`.
- Working navbar, `/contact` page, `.vercelignore`, file tracing for the listing data, mail DNS for `engined.co.uk`.
- Source-file issues report for the managers (PDF and CSV).

---

## 13. Known gaps, risks and open items

### Security (fix soon)

1. The vehicle-data API key was hard-coded in the browser code until the look-up moved to `/api/vrm`. New builds no longer expose it, but the old key is still valid and sits in git history and older deployments. Rotate it, or restrict it by domain, with the provider account owner.
2. The mail relay is plain HTTP, protected only by a shared secret.

### Functional

| Item | Detail |
|---|---|
| Lead delivery | Not tested with a real lead. Send one test lead and confirm it reaches `leads@engined.co.uk` and the CRM. Confirm the relay accepts `engined.co.uk` as sender |
| Which Vercel project is live | Not confirmed (section 9). The `hashir5` project needs Root Directory `gmc-engine-store` |
| Contact details | `contact.json` `details` (phone, WhatsApp, email, address, hours) are empty, so the "Other ways to reach us" card is hidden. No GMC phone or address exists in the project |
| Dead links | Footer links (Guides, Returns, About, Privacy, Terms, Delivery, Warranty, Contact) and the "All guides" link on the guides card still 404. Only `/contact` exists |
| Missing pages | Brand, model and hub pages exist for one brand each. The home page's brand cards for BMW, Jaguar, Land Rover, Audi and Volkswagen link to 404s, and generated listings link to a hub only when `hubPage.json` has that engine |
| Source problems | 135 files do not build and 695 more share a URL with another file. Details in the issues report |
| Images | About 1,190 listings have no car-photo pair (Citroen, Mini, Nissan, Peugeot, Renault, Seat, Suzuki, Toyota, Vauxhall, Volvo). About 790 listings use the neutral engine placeholder (Peugeot, Renault, Seat, Suzuki, Toyota, Vauxhall, Volvo have no engine photo) |
| Recon copy | The "what does reconditioned mean" FAQ and the recon About paragraph were written from the used wording and the recon lists; the business should read them |
| Canonical and `metadataBase` | `layout.tsx` points at `example.com`; there is no sitemap or robots file |
| CRM year field | `year` is emailed but not mapped in `toCrmLeadPayload` |
| Undefined `ink` shades | Older components use `ink-600`, `ink-200` and similar, which render nothing |
| No leads admin | The garage sites' `/leads` page has not been ported |
| ESLint | Not configured |
| Brand-folder naming | Whether breadcrumbs follow the folder name or the car make is an open question for the owner |
| Header and footer theme | Both stay dark on the light model, hub and listing pages (the reference shows a light header) |

---

## 14. Day-one checklist

1. Get access: the GitHub repo, the Vercel teams (`hashir` and `engine-finders-projects`), Namecheap (DNS), StackCP (mailbox and relay), Supabase, and the vehicle-data provider.
2. Get the `.env.local`, the `listing-md` folder, `engine-images` and `default_images` (none are in git; section 2).
3. `cd gmc-engine-store`, `npm install`, `npm run dev`, and click through: home, `/mercedes-benz-engines`, `/engines/om651`, the W204 listing, a generated listing such as `/engines/m43/bmw-3-series-e46-316i-saloon-1998-recon`, `/contact`, the navbar dropdowns, and the quote pop-up with a test plate.
4. Read in this order: this document, `src/lib/listing.ts`, `scripts/md_to_listingpage.py`, `src/components/quote/QuoteForm.tsx`, `src/app/api/send-lead/route.ts`, `src/lib/leads.ts`.
5. Run `python -I scripts/md_to_listingpage.py --dry-run` and compare with the numbers in section 5.
6. Make one small change, run `npx tsc --noEmit` and `npm run build`, then deploy and check `vercel ls`.
7. Pick up the open items in section 13 in this order: confirm which Vercel project serves the domain, send one test lead, fill in the contact details, fix the footer links, then the missing brand and hub pages.
