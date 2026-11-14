# GMC Engine Store — Internal Linking Audit Report

**Audit date:** 11 November 2026  
**Project:** `gmc-engine-store`  
**Guidance used:** `GMC-Internal-Linking-Guide.pdf`

## Executive summary

The malformed internal-link defects have been repaired and the route-backed catalogue pages have been added. The production build and both link-checking scopes now pass.

The audit distinguishes two different conditions:

1. **Malformed links** — incorrect URL construction. These were repaired.
2. **Pending destinations** — valid intended URLs whose page content/routes do not exist yet. These were not rewritten to arbitrary fallback pages, in accordance with the manager’s guideline.

## 1. Links repaired

### `src/data/hubPage.json` — 68 repairs

All 68 repairs were in `compatibility.rows[*].href` and changed this malformed pattern:

```text
/engines/https://engined.co.uk/engines/<target>/
```

to the correct internal path:

```text
/engines/<target>
```

| Hub data key | Repaired rows |
|---|---:|
| `b57` | 8 |
| `m40d-m50d` | 9 |
| `n62` | 4 |
| `200tdi` | 6 |
| `508ps` | 8 |
| `puma-2-4-tdci` | 1 |
| `m62` | 1 |
| `n13` | 10 |
| `h5ft` | 4 |
| `mr20dd` | 3 |
| `k14b-k15b` | 3 |
| `b20dth` | 2 |
| `ecotec-family-0` | 9 |
| **Total** | **68** |

### `src/data/modelPage.json` — 13 repairs

These defects were brand-prefixed engine paths such as:

```text
/engines/audi/ea111
```

They were normalized to the site convention:

```text
/engines/ea111
```

| Model data key | Locations | Repaired rows |
|---|---|---:|
| `a6` | `hero.cards[*].href`, `engineTable.rows[*].href` | 11 |
| `q7` | `hero.cards[*].href`, `engineTable.rows[*].href` | 2 |
| **Total** |  | **13** |

### Repair safeguards added

- [repair_internal_links.py](scripts/repair_internal_links.py) repairs only the two confirmed malformed patterns.
- [md_to_pages.py](scripts/md_to_pages.py) now normalizes Engined absolute URLs and known brand-prefixed engine paths during generation.
- Missing pages are deliberately not rewritten in the source JSON.
- [check_intended_links.py](scripts/check_intended_links.py) confirms malformed intended links remain at **0**.

The exact 81 before/after records are in [REPAIRED-INTERNAL-LINKS.csv](REPAIRED-INTERNAL-LINKS.csv), including each JSON location.

## 2. Internal-link destinations added or activated

The following real route destinations were added so existing navigation and footer links no longer depend on home-page fallbacks:

| Route | What was added | Internal links exposed |
|---|---|---:|
| `/brands` | Brand catalogue page | 21 brand links |
| `/engines` | Engine-family catalogue page | 132 engine-hub links |
| `/guides` | Buying-guides index page | 2 guide links |
| `/guides/whats-included` | Guide detail page | — |
| `/guides/core-exchange` | Guide detail page | — |

Related route registration and fallback updates are in [slugs.ts](src/lib/slugs.ts) and [links.ts](src/lib/links.ts). The resolver was also corrected so an unresolved engine path cannot produce an undefined `<Link>` target.

## 3. Routes still pending

The following are not malformed URL strings. They are intended internal destinations for which the corresponding page content is not currently present in the route inventory.

| Category | References | Unique routes | Current state | Required action |
|---|---:|---:|---|---|
| Missing engine hub | 1,374 | 547 | Resolver fallback may be used | Add approved hub JSON/pages |
| Missing listing/application | 781 | 361 | Resolver fallback may be used | Add listing JSON/pages |
| Missing model page | 139 | 126 | Resolver fallback may be used | Add approved model JSON/pages |
| Planned static page | 6 | 6 | Intentional fallback | Create approved About, Warranty, Delivery, Returns, Privacy and Terms pages |
| **Total** | **2,300** | **1,040** |  |  |

### Highest-priority missing engine hubs

These have the greatest number of source references and should be handled first:

| References | Intended route | Source area |
|---:|---|---|
| 36 | `/engines/ep6-prince-thp` | `modelPage.json` |
| 26 | `/engines/hybrid-valvematic-1-8-2-0` | `modelPage.json` |
| 19 | `/engines/kappa` | `brandPage.json`, `modelPage.json` |
| 17 | `/engines/gamma` | `brandPage.json`, `modelPage.json` |
| 16 | `/engines/eb2-puretech-psa` | `hubPage.json` |
| 16 | `/engines/puretech-eb2-city-compact` | `hubPage.json` |
| 15 | `/engines/u-ii-1-6-crdi` | `modelPage.json` |
| 14 | `/engines/puretech` | `modelPage.json` |
| 13 | `/engines/ea837` | `modelPage.json` |
| 13 | `/engines/ep6-peugeot-citroen-turbo` | `hubPage.json` |

### Highest-priority missing listing/application routes

| References | Intended route | Source area |
|---:|---|---|
| 17 | `/engines/n52/bmw-all-models` | `hubPage.json` |
| 16 | `/engines/ea211/vag-cross-brand` | `hubPage.json` |
| 12 | `/engines/dv6/citroen-passenger` | `hubPage.json` |
| 10 | `/engines/dv6/peugeot-passenger` | `hubPage.json` |
| 10 | `/engines/ea211/vw-passenger` | `hubPage.json` |
| 9 | `/engines/b58/b58-compact-performance` | `hubPage.json` |
| 9 | `/engines/ea839/ea839-audi-a6-a7-a8-q7-q8` | `hubPage.json` |
| 9 | `/engines/toyota/valvematic-1-0-1-33` | `modelPage.json` |
| 8 | `/engines/dv6/volvo-mazda` | `hubPage.json` |
| 8 | `/engines/m264/mercedes-longitudinal` | `hubPage.json` |

### Highest-priority missing model pages

| References | Intended route |
|---:|---|
| 3 | `/jaguar-engines/xe-xf` |
| 3 | `/mini-engines/mini` |
| 2 | `/audi-engines/all-audi` |
| 2 | `/bmw-engines/5-series-and-7-series` |
| 2 | `/mercedes-benz-engines/cla-gla` |
| 2 | `/nissan-engines/nv400` |
| 2 | `/nissan-engines/primastar` |
| 2 | `/renault-engines/all-renault` |
| 2 | `/toyota-engines/gr86` |
| 2 | `/toyota-engines/yaris-cross` |
| 2 | `/volkswagen-engines/skoda-superb` |

### Planned static pages

These currently have intentional fallback mappings from `footer.json`:

```text
/about     /delivery     /privacy
/returns   /terms        /warranty
```

They should only be converted to direct pages after approved copy is available; legal and policy content should not be invented during link repair.

### Complete route-level inventory

The complete list of pending unique routes is split into machine-readable files so it can be assigned directly to content/page-generation work:

- [PENDING-ENGINE-HUB-ROUTES.csv](PENDING-ENGINE-HUB-ROUTES.csv) — 547 routes
- [PENDING-LISTING-ROUTES.csv](PENDING-LISTING-ROUTES.csv) — 361 routes
- [PENDING-MODEL-ROUTES.csv](PENDING-MODEL-ROUTES.csv) — 126 routes
- [PENDING-STATIC-ROUTES.csv](PENDING-STATIC-ROUTES.csv) — 6 routes

Each CSV contains the intended route, the number of source references, and the source JSON file(s) that reference it.

## 4. Verification results

- `npm run build` — passed; 467 static pages generated.
- `python -I scripts/check_intended_links.py` — passed; 7,075 intended internal hrefs audited, 0 malformed.
- `python -I scripts/check_links.py --base http://localhost:3100 --workers 20` — passed; 499 pages and 2,610 targets.
- `python -I scripts/check_links.py --base http://localhost:3100 --listings all --workers 32` — passed; 6,162 pages and 6,162 targets.

## 5. Recommended completion plan

1. Create the highest-reference engine hubs first.
2. Add the listing/application pages linked from those hubs.
3. Add the missing model pages and validate their engine references.
4. Obtain approved copy for the six planned static pages.
5. Run the intended-link audit with `--strict` once the content backlog is complete.
6. Keep the production build and full listing audit in the deployment checklist.

