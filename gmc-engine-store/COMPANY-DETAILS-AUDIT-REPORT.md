# GMC Company Details Audit Report

**Audit date:** 13 November 2026  
**Project:** GMC Engine Store  
**Scope:** Local GMC project at `C:\Users\hp\Desktop\gmc-engine-store\gmc-engine-store`

## Executive result

No local occurrences were found for the legacy company name, the old address, or a literal UK phone number in the GMC project. No source files were changed as part of this audit.

The requested replacement details are also not present, which confirms that the replacement phase has not been applied locally.

## Search coverage

The read-only search covered:

- `src/` application code and all JSON content data
- `public/` assets and text-searchable project files
- scripts, configuration, environment-file key names, and project documentation
- existing `.next/` generated output and the project `init` artifact for the exact legacy terms

The dependency directory and Git internals were excluded from content findings because they are not site content.

## Findings

| Item checked | Search terms / source | Result |
|---|---|---|
| Legacy company name | `Engine Finders UK Ltd`, `Engine Finders`, `EngineFinders` | **0 occurrences** |
| Legacy address | `113 Park Road`, `Park Road` | **0 occurrences** |
| Legacy phone | UK phone-number patterns; phone/WhatsApp/tel fields | **No literal phone number found** |
| Replacement company name | `Prestige Auto Engineering Ltd` | **0 occurrences** |
| Replacement address | `Unit A5`, `Windsor Road Commercial Estate`, `Ramsden Heath`, `Billericay`, `CM11 1QE` | **0 occurrences** |
| Replacement company number | `17406830` | **0 occurrences** |

## Relevant current contact/branding surfaces

- `src/lib/site.ts:3-6` defines the live site URL, `GMC Engine Store` site name, and an optional `NEXT_PUBLIC_SITE_PHONE` environment variable.
- `src/data/contact.json:30-36` contains the contact detail fields. Phone, WhatsApp, email, address, and opening hours are currently empty.
- `src/app/contact/page.tsx:17-25` renders contact details only when those fields are populated.
- `src/data/footer.json:2-4` contains GMC footer branding and a generic compatibility disclaimer; it contains no legal company name, address, company number, or phone.
- `src/lib/slugs.ts:45-51` routes `/privacy` and `/terms` to fallbacks. There are no dedicated privacy-policy or terms page files in the current `src/app` tree.

## Important deployment note

The local `.env.local` file does not define a phone-related environment key, but `NEXT_PUBLIC_SITE_PHONE` can still be supplied by a hosting/deployment environment. The deployed GMC site should be checked separately before final sign-off.

## Conclusion

For this local GMC project, there is currently no old Engine Finders company name, `113 Park Road` address, or phone text to replace. The next phase should therefore verify the deployed environment and any external content source connected to GMC, then apply the new legal details only where an actual occurrence is found.

This report covers GMC only; it does not certify the separate Engines Market, Engine Code, or IBS projects.

## Second exhaustive verification

Requested follow-up audit completed after the initial report:

- Enumerated all 10 route page files in `src/app`.
- Checked all 5,842 JSON content files, including the approximately 5,800 listing records that render on demand.
- Confirmed the route data inventory: 21 brand pages, 185 model pages, 132 engine-hub pages, 5 guide records, and the listing data set.
- Ran a clean production build successfully. Next generated 467 static pages; 463 corresponding HTML files were written under `.next/server/app`.
- Searched the compiled output for exact and formatted variants of `Engine Finders`, `EngineFinders`, `113 Park Road`, `113 Park Rd`, `Park Road`, and `Park Rd`: **0 matches**.
- Searched compiled output for every supplied replacement detail: **0 matches**, as expected because no replacement has been applied.
- Confirmed generated HTML contains no `tel:`, `wa.me`, or `mailto:` contact links. The contact data remains empty, with only the optional `NEXT_PUBLIC_SITE_PHONE` environment hook in `src/lib/site.ts:6`.

The full second pass found no missed occurrence in any local GMC page source, content record, generated static page, or on-demand listing record.
