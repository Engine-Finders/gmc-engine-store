# GMC Engine Store - Project Handover

One Next.js website for GMC, a UK seller of used and reconditioned car engines at fixed prices. A visitor finds an engine by brand, model or registration plate, opens a listing page and asks for a quote. About 5,800 of the listing pages are generated from a markdown export by a script.

Everything needed to build and run the site is in this repo. Environment variables are listed by **name only** (`gmc-engine-store/.env.example`); the values are in the Vercel project settings.

---

## 1. Overview

| Item | Value |
|---|---|
| Live domain | www.engined.co.uk (`engined.co.uk` redirects to `www`) |
| GitHub repo | [Engine-Finders/gmc-engine-store](https://github.com/Engine-Finders/gmc-engine-store), branch `main` |
| Repo layout | The Next.js app is in the **subfolder `gmc-engine-store/`**. The repo root also holds the design mockups (`MOCKUP-*.md`, used by `md_to_brandpage.py`), `HANDOVER.txt`, this file and a few reference images. Run every command from the app folder |
| Vercel | The Vercel project's **Root Directory must be `gmc-engine-store`**. A push to `main` deploys |
| Registrar and DNS | Namecheap (`dns1/dns2.registrar-servers.com`) |
| Mailbox | `leads@engined.co.uk`, hosted on StackCP (MX `mx.stackmail.com`; SPF, DKIM and DMARC records are set) |

`gmc-engine-store/CONTEXT.md` and `HANDOVER.txt` hold earlier design notes (design rules, glass-card notes, the Windows `.next` gotcha). Where they differ from this file, this file is current.

The garage sites (BMW, Mercedes, Jaguar, Land Rover) are separate projects; the GMC lead flow follows Land Rover's.

**Core flow:** a visitor lands on a brand, hub or listing page, types a plate into one of the registration boxes, and the site-wide quote pop-up opens with the vehicle looked up. They submit name, phone, email and postcode. The form posts to `/api/send-lead`, which emails `leads@engined.co.uk` through the shared PHP mail relay and, in parallel, saves the lead in the shared Supabase CRM.

---

## 2. Where things live

Paths are relative to the app folder `gmc-engine-store/`:

| Path | What it is |
|---|---|
| `src/app` | Routes (section 4), `api/send-lead`, `api/vrm`, `contact/page.tsx`, `layout.tsx`, `globals.css` |
| `src/components` | Home sections at the top level; `brand/`, `hub/`, `model/`, `listing/`, `quote/` for the page types and the lead form |
| `src/data` | JSON content: hand-built pages (`brandPage.json`, `modelPage.json`, `hubPage.json`, `listingPage.json`), shared copy (`listingDefaults.json`, `navigation.json`, `footer.json`, `contact.json`), home data, and `listings/` (generated) |
| `src/data/listings/<engine>/<application>.json` | 5,816 generated listing pages, one file each (about 25 MB) |
| `src/lib` | `listing.ts`, `brand.ts`, `hub.ts`, `model.ts`, `navMenu.ts`, `leads.ts`, `vrmLookup.ts`, `site.ts` |
| `public/images` | Every image the site uses: `brands`, `engines`, `hub`, `models`, `listings` (podium, engine placeholder, `default/` car photos, `engines/` engine photos) |
| `scripts` | See section 8 |
| `.vercelignore`, `.env.example`, `next.config.js` | Upload ignore list, variable names, Next config (file tracing for the listing JSON) |

---

## 3. Technology

| Area | Choice | Notes |
|---|---|---|
| Framework | Next.js 14.2.5 (App Router), React 18.3, TypeScript 5 | Older than the garage sites (Next 16, React 19) |
| Styling | Tailwind CSS 3.4, `darkMode: "class"` | Config is `tailwind.config.js`. The important modifier is a leading `!` here |
| Animation | framer-motion 12 | Carousels and hero cards only |
| Images | `<img>` and static png/webp | `sharp` is used by build-time scripts only |
| Font | Inter | Loaded from Google Fonts in `layout.tsx` |
| Server code | Route handlers `/api/send-lead` and `/api/vrm` | |
| Hosting | Vercel | |
| Mail | PHP relay on StackCP, `relay.mercedesgarage.uk` | Same relay as the garage sites. Vercel cannot use SMTP reliably |
| CRM | Supabase Edge Function | Same shared lead store as the garage sites |
| Tests | None | `npx tsc --noEmit` is the safety net. ESLint is not configured |

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

**Hand-built vs generated listings.** `lib/listing.ts: getListingData` first looks for a hand-built entry in `listingPage.json` (the W204 page, key `om651-mercedes-c-class-w204`). If none, it reads the slim file `src/data/listings/<engine>/<application>.json` and merges the shared copy from `listingDefaults.json`.

**Generated listing page:** `ListingHero` (gallery, spec cards, price options, quote buttons, registration box), `ListingAbout` plus "What's included", `ListingCompatible`, `ListingInfoCards` (warranty, other applications, why buy), `ListingFaqs`, `ListingCta`. Pages are wrapped in `ModelThemeShell` (light and dark).

**Static vs on demand.** Only the `om651` listings are pre-rendered (`generateStaticParams` in the listing route). Every other listing renders on first visit (`dynamicParams = true`) and reads its JSON from disk. `next.config.js` has `outputFileTracingIncludes` for the listing route so Vercel bundles `src/data/listings/**`; keep it, or generated listings return 404 in production.

**Navbar.** `Header.tsx` is a server wrapper that calls `lib/navMenu.ts` and passes the lists to `HeaderClient.tsx`. The Engines and Brands dropdowns are built from the keys of `hubPage.json` and `brandPage.json`, so the menu lists only pages that exist. Other links come from `navigation.json`. Check Fitment and the mobile search button open the quote pop-up.

**Theming.** Dark navy header, hero and footer with a light body. `ModelThemeShell` adds a light/dark toggle on model, hub and listing pages only. Client design rules: panel radius 10-14px (`rounded-xl`, not `2xl`/`3xl`); section rhythm `pb-10 lg:pb-12` on brand pages and `py-12 lg:py-14` on model pages.

**Tailwind colour trap.** Only these `ink` shades exist: 400, 500, 700, 800, 900. `text-ink-600`, `bg-ink-100` and similar render nothing; use 500 or 700. Some older components still use the undefined shades (grep `ink-[1236]00`).

### 4.1 Internal links and canonicals

**Rule: no internal link may 404.** Links in the JSON are written as the URL they are meant to reach, even when that page does not exist yet (`/engines/om642`, `/mercedes-benz-engines/e-class`, `/audi-engines`). `src/lib/links.ts` resolves every one of them at build time:

| Link to | Page exists | Page missing (nearest real page) |
|---|---|---|
| `/engines/<engine>/<app>` | the listing | best-matching listing of that engine, else the engine hub |
| `/engines/<engine>` (or `<engine>-w204` style) | the hub | best listing of that engine (the suffix picks the chassis), else the brand page that lists the engine |
| `/<brand>-engines/<model>` | the model page | hub of the engine with most listings for that model, else a listing of the model, else the brand page's "Shop by model" |
| `/<brand>-engines` | the brand page | home page "Shop by brand" |
| `/engines`, `/brands`, `/guides`, `/warranty`, `/delivery`, `/returns`, `/about`, `/privacy`, `/terms` | - | the stand-in in `STATIC_FALLBACK` in `src/lib/slugs.ts` |

When several listings fit, the brand and model of the page the link is on break the tie (a Mercedes page picks a Mercedes listing).

- **Where it runs:** `getBrandData`, `getModelData`, `getHubData` and `getListingData` return data with every `href`/`*Href` field resolved. Home sections resolve in `app/page.tsx` (client components get the resolved links as props) and in the server components that import their JSON (`ShopByBrand`, `InfoCards`, `PopularEngines`, `Footer`). Server components use `resolveHref()`; client components may only use `staticHref()` from `lib/slugs.ts` (the resolver reads the file system).
- **It updates itself.** Add a page's JSON and every link to that URL points at it on the next build. Never replace an intended URL in the data with its fallback.
- **Listing breadcrumbs** are Home > `<Brand> Engines` > model (when that model page exists) > `<CODE> Engine` > listing.
- **Canonicals** come from the route, not the JSON: `metadataBase` is `SITE_URL` (`https://www.engined.co.uk` unless `NEXT_PUBLIC_SITE_URL` is set) and each page sets its own path (`/`, `/<brand>`, `/<brand>/<model>`, `/engines/<engine>`, `/engines/<engine>/<app>`, `/contact`). The `seo.canonical` fields in the JSON are not used. A new page type must set `alternates.canonical` in its `generateMetadata`; the layout deliberately has none, or every page would inherit it.

**Building the remaining brand, model and hub pages.** The source markdown is in `Brand Pages.zip` (20 brands), `Model Pages.zip` (94 models) and `Hub Pages.zip` (151 engines); the zips are not in the repo, the owner has them. The Mercedes brand page, the C-Class model page, the OM651 hub and the OM651 listings are the finished examples to copy. Write a converter per page type (like `scripts/md_to_listingpage.py`; `scripts/md_to_brandpage.py` is a start for brands) that adds entries to the JSON. For the links to join up, keep these slugs:

- **Brand key** (`brandPage.json`): the brand name slugified plus `-engines`, e.g. `bmw-engines`, `land-rover-engines`, `mini-engines`, `seat-engines`. `brandSlugFor()` in `lib/slugs.ts` must give the same slug for the listing brand code; add a line to `BRAND_PAGE_SLUG` if it does not.
- **Model key** (`modelPage.json`): the model's slug as it appears in listing slugs after the brand code (`c-class` for `mercedes-c-class-w204-...`, `golf` for `volkswagen-golf-...`), with `brandSlug` set to the brand key. Listings of that model then show it in their breadcrumb.
- **Hub key** (`hubPage.json`): the listing folder name in `src/data/listings` (`om651`, `n47`, `bmw-m57`). Listings link to their hub only when the names match.
- **Links inside the data:** use the intended URL forms above; the resolver handles the rest.

**Checking.** With the site running, `python -I scripts/check_links.py` opens the home page, every brand, model and hub page, the hand-built listing and one listing per engine folder, follows every internal link once and checks every canonical. It exits non-zero on any 404 or wrong canonical. Use `--listings all` for every listing, `--base https://www.engined.co.uk` for the live site. Run it after adding pages and before pushing.

---

## 5. Listing extraction (markdown to pages)

`scripts/md_to_listingpage.py` turns the listing markdown export into the slim JSON files in `src/data/listings`.

```
cd gmc-engine-store
python -I scripts/md_to_listingpage.py --dry-run                  # report only
python -I scripts/md_to_listingpage.py                            # write pages
python -I scripts/md_to_listingpage.py --brand bmw                # one brand
python -I scripts/md_to_listingpage.py --zip <export.zip>         # read a zip instead of the folder
python -I scripts/md_to_listingpage.py --engine-images <folder>   # engine photos elsewhere (or set GMC_ENGINE_IMAGES)
python -I scripts/md_to_listingpage.py --dry-run --report out.json   # list every source problem
```

**Inputs (not stored in the repo).** The extractor and the image slicer need these folders; the site itself does not. The owner supplies them as one zip, `GMC-extractor-inputs.zip`: unzip it into the **repo root** and the three folders land in the paths below. The zip has a `README.txt` with the same steps.

| Folder | Put it at | Used for |
|---|---|---|
| `listing-md/<brand>/*.md` - the listing markdown | inside the app folder | the extractor |
| `engine-images/` - background-removed engine photos | repo root, or any folder given with `--engine-images` / `GMC_ENGINE_IMAGES` | the extractor copies the photos it needs to `public/images/listings/engines/` |
| `default_images/` - contact sheets of brand car photos | repo root | `slice_default_images.py` |

The extractor stops with a clear message if the engine photo folder is missing (it will not write pages with placeholder galleries). The generated output (`src/data/listings`, `public/images/listings`) is in git, so none of this is needed to build or edit the site.

- **Brand folders:** audi, bmw, citroen, jaguar, landrover, `mercedez` (sic), mini, nissan, peugeot, renault, seat, suzuki, toyota, vauxhall, volkswagen, volvo. Paste new markdown files into the right brand folder. A loose `.md` in the root is skipped. Windows cannot store `|` in file names, so unzipped names have it replaced by `-`.
- **Layouts handled:** bold labels, plain labels, `## H1:` headings, `<ul><li>` lists, "LIST:" plain lines, numbered lists, a whole-file JSON object and a fenced ```json block. A new layout shows up as "skipped" or as an empty field in the dry run; add support in the `parse_*` functions, not by editing the markdown.
- **Output:** one slim JSON per listing (title, price options, SKU, stock text, spec cards, fits list, included and not-included, CTA, SEO, gallery). Shared copy is not repeated per file; it lives in `listingDefaults.json`, so one edit changes every page.
- **URL:** the engine and application slugs come from the markdown's canonical URL (`/engines/<engine>/<application>`).
- **Gallery rule:** every listing gets 3 images: car front photo, engine-bay photo (a deterministic pick from the brand's default pair in `public/images/listings/default/`), then the actual engine image matched by engine code. With no usable engine image the neutral `engine.png` placeholder is used. Brands with no default pair get an engine-only gallery.
- **Trimmed vs padded engine PNGs:** the old `engine.png` has built-in padding; the engine webps are alpha-trimmed. Gallery items carry `trimmed`, and `ListingHero` and `ListingAbout` size them differently. Do not make them share one size.
- **About copy and FAQs:** the markdown has neither, so `lib/listing.ts` fills the templates in `listingDefaults.json` (`about`, `faqs`) with the brand, engine code, vehicle and part number. They are adapted from the hand-built W204 page.
- **Duplicate and clashing slugs:** identical duplicates are dropped; a reconditioned file that reuses its used twin's URL gets `-recon`; different content on the same URL gets `-2`.
- **Image slicing:** `scripts/slice_default_images.py` (needs `numpy` and `pillow`) cuts the brand contact sheets into `public/images/listings/default/<brand>-<n>-front|bay.webp` for BMW, Jaguar, Land Rover, Mercedes, Volkswagen and Audi.

**Current numbers:** 5,951 source files, 5,816 pages built. Files that do not build: 9 generator refusal notes, 14 with no price, 112 identical duplicates (`--dry-run --report` lists them).

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

The same `QuoteForm` serves the pop-up and `/contact`. Field ids take an `idPrefix` so two forms can be on screen at once. Every lead form must render `<LeadStatus lead={lead} />` (it carries the honeypot), and custom fields clear their own state on the form's `reset` event.

### 6.2 Payload and CRM mapping

Forms post `name, number, email, postcode, description, vehicle_vrm`, and when a plate was looked up `vehicle_brand, vehicle_series, year, engine_capacity, fuel_type, vehicle_part`. `lib/leads.ts: toCrmLeadPayload` maps them to the CRM's names (engine size converted from cc to litres, `vehicle_part` defaults to "Engine", `source` is the domain, `source_page` is the domain plus path without the query string). `year` is emailed but not mapped into the CRM.

### 6.3 Mail

- The route POSTs to `MAIL_RELAY_URL` with header `X-Relay-Secret`. The relay sends with PHP `mail()`. It is plain HTTP, protected by the shared secret.
- Sender and recipient are both `leads@engined.co.uk`; cc is `ef2crm@gmail.com`.
- The relay must accept `engined.co.uk` as a sender; a wrong sender domain makes it answer 502. Test through the real deployed form.
- DNS is at Namecheap: MX `mx.stackmail.com`; SPF `v=spf1 include:spf.stackmail.com a mx -all`; DKIM TXT on `s1._domainkey`; DMARC TXT `v=DMARC1; p=none`. Namecheap email forwarding is not used.

### 6.4 CRM (Supabase)

`SUPABASE_WEBHOOK_URL` is the shared receive-lead Edge Function and `SUPABASE_ANON_KEY` authenticates the call. A 409 means a duplicate within the function's window and counts as success. There is no `/leads` admin page on this site.

### 6.5 Vehicle-data (plate look-up) API

The browser calls the site's own `GET /api/vrm?vrm=<plate>` (`src/app/api/vrm/route.ts`), which calls the provider (`https://api.checkcardetails.co.uk/vehicledata/vehicleregistration`) with the key from the server-only `VRM_API_KEY`. The route only answers requests from the site's own pages, validates the plate, and rate-limits per IP (30 per 10 minutes per server instance). It returns make, model, year, engine size, fuel and colour. Without `VRM_API_KEY` it answers 503. Errors show as "Please enter a valid UK registration number."

### 6.6 Environment variable names

| Name | Used for |
|---|---|
| `MAIL_RELAY_URL`, `MAIL_RELAY_SECRET` | Mail relay endpoint and shared secret |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, `MAIL_TO_ADDRESS`, `MAIL_CC_ADDRESS` | Sender, recipient, cc |
| `SUPABASE_WEBHOOK_URL`, `SUPABASE_ANON_KEY` | CRM write |
| `VRM_API_KEY` | Plate look-up key (server only) |
| `NEXT_PUBLIC_SITE_URL` | Lead source domain (defaults to `https://engined.co.uk`) |
| `LEAD_SOURCE` | Optional override of the lead source domain |

Locally copy `.env.example` to `.env.local` (or use the `Env-local-files.zip` the owner supplies: unzip it in the folder that holds the cloned repos and it places `gmc-engine-store/gmc-engine-store/.env.local`). In production they are set in the Vercel project. Never commit `.env.local`.

---

## 7. Images and assets

- **All images the site uses are in `public/images`**, committed to git, including the generated listing galleries (`listings/default`, `listings/engines`).
- **Placeholders and shared art:** `public/images/listings/engine.png` and `engine_trim.png`, `podium.png`, `listing_about.png`.
- **Hub hero art:** `public/images/hub`; `scripts/cutout_hero.js` regenerates `hero_light_cut.png` / `hero_dark_cut.png` from `hero_light.png` / `hero_dark.png`.
- **Transparent padding trap:** many PNGs have large transparent margins (a model car is 24% empty top and bottom, the price-guide car 70%). Measure the alpha bounding box before sizing; do not eyeball it.
- **Blend modes:** do not put `mix-blend-mode: lighten` on a dark PNG over a dark background.
- **Glass cards:** `backdrop-filter` can be inert under a framer-motion ancestor (it becomes a backdrop root). `CONTEXT.md` has the full list of what to avoid.

---

## 8. Scripts, local development and deploying

```
cd gmc-engine-store          # the app folder, not the repo root
npm install                  # first time only
npm run dev                  # http://localhost:3000
npm run build
npx tsc --noEmit             # type check; keep clean
```

| Script | What it does |
|---|---|
| `scripts/md_to_listingpage.py` | Listing extractor (section 5) |
| `scripts/slice_default_images.py` | Slices the brand contact sheets into the default car photos |
| `scripts/check_links.py` | `python -I scripts/check_links.py [--base URL] [--listings N\|all]` finds internal links that do not return 200 and wrong canonicals (section 4.1) |
| `scripts/md_to_brandpage.py` | `python scripts/md_to_brandpage.py "../MOCKUP-02-brand-page-mercedes.md"` adds a brand page entry to `brandPage.json` from a mockup markdown file |
| `scripts/cutout_hero.js` | `node scripts/cutout_hero.js` re-cuts the hub hero artwork |
| `scripts/shot.js` | `node scripts/shot.js <chromeDebugPort> <width> <out.png>` takes a full-page screenshot through Chrome's debugging port |

- Never run two Next processes against the same `.next` (for example `npm run build` while `next dev` runs). On Windows it throws `UNKNOWN errno -4094`. Stop all `next` processes, delete `.next`, start one.
- iOS Safari zooms on any input under 16px. Keep inputs at `text-base` on mobile.
- Many files use CRLF. Scripts that edit files should read and write with `newline=''` and keep the endings.
- To change the generated listing copy, edit `listingDefaults.json`, not 5,800 files. Do not re-run the extractor blindly over hand-edited JSON; diff first. The hand-built W204 page is never touched by it.
- **Deploying:** push to `main`. The Vercel project's Root Directory is `gmc-engine-store`. `.vercelignore` keeps `listing-md`, `scripts`, zips, `.env*` and notes out of CLI uploads. For a CLI deploy use `vercel deploy --archive=tgz` (a plain upload sends about 6,000 files); do not use the CLI from inside the app folder once a Root Directory is set.
- After a deploy open the home page, a generated listing (for example `/engines/m43/bmw-3-series-e46-316i-saloon-1998-recon`) and `/contact`.

---

## 9. Current state

| Area | State |
|---|---|
| Home page | Built (hero, browse by brand, featured, how it works, shop by brand, info cards, popular, FAQ, CTA) |
| Brand pages | Only Mercedes-Benz exists; the home page links to six brands |
| Model pages | Only Mercedes C-Class |
| Engine hubs | Only OM651 |
| Listings | 1 hand-built (OM651 / W204) and 5,816 generated, covering all 16 brand folders |
| Quote flow | Pop-up, registration lookup, `/api/send-lead`, honeypot, `/contact` page |
| Navbar | Dropdowns built from existing pages, anchors to the home page sections, Contact page |

---

## 10. Conventions

- **Plain hyphens only** in visible text (no em or en dashes). The extracted markdown still contains some; the listing JSON keeps the source text as is.
- **Client wording** (prices, claims, counts, SKUs) comes from the markdown and is not edited in code.
- **Reference images beat spec text** when building pages from mockups.
- **Mobile first** unless told "desktop".
- **A new engine code or brand** in the markdown needs: an entry in `BRANDS` or `ENGINE_FOLDERS` in the extractor if it is a new folder, engine photos in the engine photo folder, and a default car pair sliced into `public/images/listings/default/`.
- **Brand folders are engine-maker families**, not car makes (the Peugeot folder contains Nissan 370Z listings, the Citroen folder Suzuki Vitara). Breadcrumbs use the folder's brand name.
- Do not send test leads to production without the owner's OK.

---

## 11. Open items

| Item | Detail |
|---|---|
| Lead delivery | Not tested with a real lead. Send one test lead and confirm it reaches `leads@engined.co.uk` and the CRM, and that the relay accepts the `engined.co.uk` sender |
| Contact details | `contact.json` `details` (phone, WhatsApp, email, address, hours) are empty, so the "Other ways to reach us" card is hidden. No GMC phone or address exists in the project |
| Missing static pages | Guides, Returns, About, Privacy, Terms, Delivery and Warranty have no pages; their links go to the stand-ins in `STATIC_FALLBACK` (home sections or `/contact`). Privacy and Terms pages are needed |
| Missing pages | Brand, model and hub pages exist for one brand each (Mercedes-Benz, C-Class, OM651); the rest come from the zips (section 4.1). Until then their links go to the nearest existing page |
| Images | About 1,190 listings have no car-photo pair (Citroen, Mini, Nissan, Peugeot, Renault, Seat, Suzuki, Toyota, Vauxhall, Volvo). About 790 use the neutral engine placeholder (Peugeot, Renault, Seat, Suzuki, Toyota, Vauxhall, Volvo have no engine photo) |
| Recon copy | The "what does reconditioned mean" FAQ and the recon About paragraph were written from the used wording and the recon lists; the business should read them |
| Sitemap and robots | There is no `sitemap.xml` or `robots.txt` yet |
| CRM year field | `year` is emailed but not mapped in `toCrmLeadPayload` |
| No leads admin | The garage sites' `/leads` page has not been ported |
| Header and footer theme | Both stay dark on the light model, hub and listing pages (the reference shows a light header) |
| Brand-folder naming | Whether breadcrumbs follow the folder name or the car make is an open question for the owner |
| Mail relay | Plain HTTP, protected by the shared secret only |
| Plate look-up key | The key used before `/api/vrm` was readable in the browser and in the source. It has not been rotated; only the provider's account owner can do that |

---

## 12. Day-one checklist

1. Get access to the GitHub repo, Vercel, Namecheap (DNS), StackCP (mailbox and relay), Supabase and the vehicle-data provider.
2. Clone the repo, `cd gmc-engine-store`, copy `.env.example` to `.env.local` and ask the owner for the values.
3. `npm install`, `npm run dev`, and click through: home, `/mercedes-benz-engines`, `/engines/om651`, the W204 listing, a generated listing such as `/engines/m43/bmw-3-series-e46-316i-saloon-1998-recon`, `/contact`, the navbar dropdowns, and the quote pop-up with a test plate.
4. Read in this order: this document, `src/lib/listing.ts`, `src/components/quote/QuoteForm.tsx`, `src/app/api/send-lead/route.ts`, `src/lib/leads.ts`, then `scripts/md_to_listingpage.py` if you will regenerate pages.
5. Make one small change, run `npx tsc --noEmit` and `npm run build`, push, and check the deployment.
6. Pick up the open items in section 11, starting with the lead delivery test.
