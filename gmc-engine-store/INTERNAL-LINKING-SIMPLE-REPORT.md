# Internal Linking Fix Report

**Website:** GMC Engine Store  
**Date:** 11 November 2026  
**Purpose:** Explain which internal links were corrected, which pages were added, and which routes still need page content.

## 1. What was wrong before

There were three types of problems:

### A. Incorrect link paths

Some links had an external website address incorrectly placed inside an internal path. For example:

```text
/engines/https://engined.co.uk/engines/b57-bmw-3-4-series/
```

Some Audi engine links also had an unnecessary brand folder:

```text
/engines/audi/ea111
```

These paths could not reliably reach the correct engine page.

### B. Missing catalogue pages

Links already existed for these pages, but the pages themselves were not available:

```text
/brands
/engines
/guides
```

### C. Build/navigation crash

Some missing engine destinations caused an empty link value during the website build. This caused the build to fail with an error similar to:

```text
The prop href expects a string or object, but got undefined
```

## 2. What was corrected

### Incorrect links repaired: 81 total

#### Engine hub data — 68 links

File:

```text
src/data/hubPage.json
```

The links were corrected from the incorrect format:

```text
/engines/https://engined.co.uk/engines/<engine-page>/
```

to the correct internal format:

```text
/engines/<engine-page>
```

These repairs were made in the compatibility tables for the following engine groups:

```text
b57, m40d-m50d, n62, 200tdi, 508ps, puma-2-4-tdci,
m62, n13, h5ft, mr20dd, k14b-k15b, b20dth,
ecotec-family-0
```

#### Model data — 13 links

File:

```text
src/data/modelPage.json
```

The incorrect Audi paths were changed like this:

```text
/engines/audi/ea111  →  /engines/ea111
/engines/audi/ea113  →  /engines/ea113
/engines/audi/ea189  →  /engines/ea189
/engines/audi/ea288  →  /engines/ea288
/engines/audi/ea888  →  /engines/ea888
```

The affected model data was mainly for:

```text
A6 and Q7
```

## 3. Pages added

The following pages were added so existing navigation links now lead to real pages:

| Page | Purpose |
|---|---|
| `/brands` | Shows all available engine brands |
| `/engines` | Shows all available engine families |
| `/guides` | Shows the buying guides |
| `/guides/whats-included` | Buying guide page |
| `/guides/core-exchange` | Core-exchange guide page |

The new catalogue pages include links to:

- 21 brand pages
- 132 engine hub pages
- 2 buying guides

## 4. What is still missing

The remaining links are not incorrectly formatted. They point to pages that have not been created yet.

| Missing page type | Unique routes still missing | References in the site data |
|---|---:|---:|
| Engine hub pages | 547 | 1,374 |
| Listing/application pages | 361 | 781 |
| Model pages | 126 | 139 |
| About, warranty, delivery, returns, privacy and terms pages | 6 | 6 |
| **Total** | **1,040** | **2,300** |

Examples of missing engine pages:

```text
/engines/ep6-prince-thp
/engines/hybrid-valvematic-1-8-2-0
/engines/kappa
/engines/gamma
/engines/eb2-puretech-psa
```

Examples of missing listing/application pages:

```text
/engines/n52/bmw-all-models
/engines/ea211/vag-cross-brand
/engines/dv6/citroen-passenger
/engines/dv6/peugeot-passenger
```

Examples of missing model pages:

```text
/jaguar-engines/xe-xf
/mini-engines/mini
/audi-engines/all-audi
/bmw-engines/5-series-and-7-series
```

## 5. What happens to the missing routes now

The website does not send visitors to a broken 404 page. Until the correct page content is added, the link resolver sends the visitor to the nearest available fallback page.

The original intended URL is kept in the source data so it can automatically become the correct destination when the missing page is created.

## 6. Recommended next steps

1. Create the missing engine hub pages with the highest number of references first.
2. Create the listing/application pages connected to those engine hubs.
3. Create the missing model pages.
4. Add approved content for the six policy and company pages.
5. Re-run the full internal-link audit after the pages are added.

## 7. Final checks completed

- Website production build: **Passed**
- Incorrect source links remaining: **0**
- Normal link audit: **Passed**
- Full listing-page audit: **Passed**
- Broken rendered links: **0**
- Build/navigation crash caused by undefined links: **Fixed**

## 8. Cross-check of the remaining routes

The missing routes were checked against the actual page templates and all available JSON/data files in the project.

### Important result

The project has generic dynamic templates for engine hubs, listings and model pages. However, a generic template is not a complete page by itself. The template calls the matching JSON data, and returns a 404/not-found response when that data is missing.

Representative direct checks confirmed:

| URL tested | Result |
|---|---:|
| `/engines/ep6-prince-thp` | 404 — no hub data/page |
| `/engines/n52/bmw-all-models` | 404 — no listing data/page |
| `/jaguar-engines/xe-xf` | 404 — no model data/page |
| `/about` | 404 — no static page |
| `/engines/k9k` | 200 — page exists |
| `/engines/om651/mercedes-c-class-w204` | 200 — page exists |

### Related data that does exist elsewhere

- **7 missing engine hubs** have related listing folders/data, but no hub page JSON yet: `1-3-cdti`, `k-series-small`, `eb2`, `prince-n14-n18`, `m270`, `ingenium-2-0-diesel`, and `m52`.
- **244 missing listing routes** use an engine folder that exists, but the specific application JSON file is missing.
- **108 missing listing routes** use an existing engine hub, but there is no listing folder/data for that application.
- **126 missing model routes** are under existing brand pages, but the individual model JSON entries are missing.

### Routes requiring path review

Nine pending listing routes use an engine segment that is neither a known hub nor a known listing folder. These should be reviewed as possible incorrect paths before creating pages:

```text
/engines/toyota/valvematic-1-0-1-33
/engines/audi/3-0-tdi-v6
/engines/toyota/hybrid-valvematic-1-8-2-0
/engines/toyota/d-4d-1-4-2-0
/engines/audi/4-2-fsi-v8
/engines/audi/ea837
/engines/audi/4-0-tfsi-v8
/engines/m178/mercedes-amg-gt-r190
/engines/toyota/d-4d-2-2
```

These nine routes currently have no matching page or supporting engine folder in the project, so they should not be treated as confirmed pages until their correct engine path is approved.

## Supporting files

- `REPAIRED-INTERNAL-LINKS.csv` — exact list of the 81 corrected links.
- `PENDING-ENGINE-HUB-ROUTES.csv` — missing engine hub routes.
- `PENDING-LISTING-ROUTES.csv` — missing listing/application routes.
- `PENDING-MODEL-ROUTES.csv` — missing model routes.
- `PENDING-STATIC-ROUTES.csv` — missing company and policy routes.

