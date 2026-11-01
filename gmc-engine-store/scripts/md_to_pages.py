#!/usr/bin/env python3
"""
Build brand, model and engine hub pages from the client's page markdown.

    python -I scripts/md_to_pages.py brand                 # Brand Pages.zip -> src/data/brandPage.json
    python -I scripts/md_to_pages.py model                 # Model Pages.zip -> src/data/modelPage.json
    python -I scripts/md_to_pages.py hub                   # Hub Pages.zip   -> src/data/hubPage.json
    python -I scripts/md_to_pages.py all                   # all three

Options
    --src PATH        the zip (or an unzipped folder) to read; default: "<Type> Pages.zip" in the repo root
    --hubs PATH       brand pages also read the hub zip to list each brand's engine families
                      (default: "Hub Pages.zip" in the repo root, if it is there)
    --out FILE        JSON file to write (default: the page type's file in src/data)
    --only TEXT       only files whose name contains TEXT (e.g. --only "BMW")
    --overwrite       replace entries that already exist (default: keep them; see below)
    --dry-run         parse and report, write nothing
    --report FILE     also write the full report as JSON

The pages are data-driven: each route renders whatever entry its JSON holds, so a page appears at its
URL as soon as its entry is written (no code changes). Every entry is built in exactly the shape of the
finished examples (Mercedes-Benz brand page, C-Class model page, OM651 hub) so the same components
render it.

Existing entries are kept unless --overwrite: the three finished examples were edited by hand and must
not be regenerated over.

Where the markdown has no data for a field, the script fills it from the site's own data (featured
units, engine photos and "from" prices come from the listing pages in src/data/listings) or from a
neutral default, and lists it in the report. Prices are only ever copied from the markdown or the
listings, never made up.

Links are written as their intended URL (e.g. /engines/ea888, /audi-engines/a4). The site's link
resolver (src/lib/links.ts) sends any link whose page does not exist yet to the nearest page that
does, so check with scripts/check_links.py after generating.

Inputs are the client zips (Brand Pages.zip, Model Pages.zip, Hub Pages.zip); they are not in the repo.
"""

import argparse
import json
import re
import sys
import unicodedata
import zipfile
from collections import Counter, OrderedDict
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
REPO = APP.parent
DATA = APP / "src" / "data"
PUBLIC = APP / "public"
SITE = "https://engined.co.uk"

TYPES = {
    "brand": ("Brand Pages.zip", "brandPage.json"),
    "model": ("Model Pages.zip", "modelPage.json"),
    "hub": ("Hub Pages.zip", "hubPage.json"),
}

# Brand display names and URL keys. Folder and file names in the zips vary ("Citreon", "Mercedes Benz",
# "LandRover", "Mini"), so every name is matched on its letters only.
BRANDS = {
    "audi": "Audi", "bmw": "BMW", "citroen": "Citroen", "citreon": "Citroen", "fiat": "Fiat",
    "honda": "Honda", "hyundai": "Hyundai", "jaguar": "Jaguar", "landrover": "Land Rover",
    "mercedesbenz": "Mercedes-Benz", "mercedes": "Mercedes-Benz", "mercedesamg": "Mercedes-Benz",
    "mg": "MG", "mini": "MINI", "mitsubishi": "Mitsubishi", "nissan": "Nissan", "peugeot": "Peugeot",
    "renault": "Renault", "seat": "SEAT", "suzuki": "Suzuki", "toyota": "Toyota", "vauxhall": "Vauxhall",
    "volkswagen": "Volkswagen", "vw": "Volkswagen", "volvo": "Volvo",
}
# image file key per brand where public/images/brands has a logo / car photo for it
IMAGE_KEY = {"Audi": "audi", "BMW": "bmw", "Jaguar": "jaguar", "Land Rover": "landrover",
             "Mercedes-Benz": "mercedes", "Volkswagen": "vw"}

TRUST_BRAND = [
    {"icon": "shield-check", "title": "12-Month Warranty", "subtitle": "Unlimited mileage on recon"},
    {"icon": "shield", "title": "Verified Fitment", "subtitle": "Checked by registration"},
    {"icon": "truck", "title": "UK Nationwide Delivery", "subtitle": "Fast & secure, 2–4 days"},
    {"icon": "returns", "title": "14-Day Returns", "subtitle": "Uninstalled, full refund"},
]
TRUST_HUB = [
    {"icon": "shield-check", "title": "Verified Fitment", "subtitle": "Checked by registration"},
    {"icon": "shield-check", "title": "12-Month Warranty", "subtitle": "On reconditioned units"},
    {"icon": "truck", "title": "UK Nationwide Delivery", "subtitle": "2-4 working days"},
    {"icon": "repeat", "title": "14-Day Returns", "subtitle": "Uninstalled, full refund"},
]
HOW_IT_WORKS = {"title": "How Buying Works", "steps": [
    {"number": 1, "icon": "search", "title": "Verify fit by reg", "description": "Enter your registration or browse to your model — we confirm the exact engine code your vehicle needs."},
    {"number": 2, "icon": "cart", "title": "Order at the fixed price", "description": "Choose used or reconditioned where both are available, then buy at the fixed price shown on the page."},
    {"number": 3, "icon": "truck", "title": "Dispatched with warranty", "description": "Your engine ships UK-wide with tracking, backed by warranty and a 14-day uninstalled return."}]}
# model hero: where the (up to) six engine cards sit, as on the C-Class page
CARD_POS = [
    {"top": 118, "left": 30, "width": 194, "rotate": -3, "z": 22},
    {"top": 52, "left": 244, "width": 222, "rotate": 0, "z": 26},
    {"top": 98, "left": 486, "width": 189, "rotate": 2, "z": 24},
    {"top": 168, "left": 695, "width": 183, "rotate": 4, "z": 21},
    {"top": 396, "left": 0, "width": 185, "rotate": -5, "z": 20},
    {"top": 440, "left": 715, "width": 183, "rotate": 5, "z": 20},
]
DISCLAIMER = ("Prices shown are current lowest listed prices and update as stock changes. "
              "The price on each listing is the price you pay — no hidden fees at checkout.")
ENGINE_IMG = "/images/listings/engine_trim.png"


# ======================================================================= markdown helpers

def unescape(t):
    """The exports escape markdown punctuation (\\# \\- \\< \\! \\_ ...) and wrap the page in a code fence."""
    t = re.sub(r"\\([\\`*_{}\[\]()#+\-.!<>|&~^=\"'])", r"\1", t)
    t = t.replace("‑", "-").replace(" ", " ")
    t = re.sub(r"^```\w*\s*$", "", t, flags=re.M)
    return unicodedata.normalize("NFC", t)


# prompt instructions left in the content: "90–150 chars:", "INTRO: 130–200 chars.", "(verbatim)", "H2 — "
INSTR = re.compile(r"^\s*(?:\(?\d+\s*[–-]\s*\d+\s*(?:chars?|characters|words)\)?[.:;,]?\s*)+", re.I)


def tidy(s):
    """Plain text: no markdown emphasis or links, no prompt instructions, no wrapping quotes."""
    s = s or ""
    s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"\*\*|__|`", "", s)
    s = re.sub(r"(?<![\w*])\*(?!\s)([^*]+)\*", r"\1", s)
    s = re.sub(r"^\s*(?:H[1-6]|P)\s*[—–:-]\s*", "", s)
    s = re.sub(r"\((?:verbatim|exact|optional)\)", "", s, flags=re.I)
    s = INSTR.sub("", s.strip())
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) > 1 and s[0] in "\"“'" and s[-1] in "\"”'":
        s = s[1:-1].strip()
    return s


def sections(t):
    """{name: body} for every <!-- SECTION:name --> ... block (a name used twice keeps both bodies)."""
    out = OrderedDict()
    for m in re.finditer(r"<!--\s*SECTION:([\w-]+)\s*-->(.*?)(?=<!--\s*/SECTION:\1\s*-->|<!--\s*SECTION:|\Z)", t, re.S):
        out[m.group(1)] = (out.get(m.group(1), "") + "\n" + m.group(2)).strip()
    return out


HEADING_SECTIONS = [
    (r"faq", "faq"), (r"price guide|prices\b", "price-guide"), (r"used or recondition", "condition-guide"),
    (r"through the generations|history", "history"), (r"related", "related-cta"), (r"featured", "featured-listings"),
    (r"every engine|engines? fitted", "engine-table-header"), (r"compatib", "matrix-header"),
    (r"what you get", "condition-standards"), (r"^buy an? ", "applications-header"), (r"by model", "models"),
    (r"engine families", "hubs-header"), (r"^about ", "overview"), (r"warranty", "warranty-delivery"),
    (r"in under a minute|^find |^check ", "cta"), (r"for sale", "hero"),
]


def page_sections(t):
    """sections(), plus any section a file is missing (some have no or only closing markers) taken
    from its '## Heading' blocks, matched on the heading's wording."""
    secs = sections(t)
    parts = re.split(r"^(#{1,2}\s+.+)$", t, flags=re.M)
    for i in range(1, len(parts) - 1, 2):
        title = tidy(re.sub(r"^#+\s*", "", parts[i])).lower()
        body = re.split(r"<!--\s*/?SECTION:", parts[i + 1])[0]
        for pat, name in HEADING_SECTIONS:
            if re.search(pat, title):
                if name not in secs:
                    secs[name] = "## " + tidy(re.sub(r"^#+\s*", "", parts[i])) + "\n" + body
                break
    return secs


def pick(secs, *names):
    """Body of the first section whose name starts with one of names."""
    for n in names:
        for k, v in secs.items():
            if k == n or k.startswith(n):
                return v
    return ""


def kv(body, *keys):
    """Value of a 'KEY: value' / 'KEY — value' line (first key found)."""
    for k in keys:
        pat = re.escape(k).replace("_", "[_ ]")
        m = re.search(rf"^\s*\**{pat}\**(?:\s*\([^)]*\))?\s*(?::|—|–|-(?=\s))\s*(.*)$", body, re.M | re.I)
        if m:
            v = m.group(1).strip()
            if not v:  # value on the next non-empty line
                rest = body[m.end():].lstrip("\n")
                v = next((l.strip() for l in rest.splitlines() if l.strip()), "")
            v = re.split(r"\s+·\s+\**[A-Z][A-Z_]{2,}\**\s*:", v)[0]  # 'REG_LABEL: "X" · REG_BUTTON: "Y"'
            return tidy(v)
    return ""


def kv_all(body, key):
    pat = re.escape(key).replace("_", "[_ ]")
    return [m.group(1).strip() for m in re.finditer(rf"^\s*\**{pat}\**\s*:\s*(.+)$", body, re.M)]


def heading(body, level=2):
    m = re.search(rf"^#{{{level}}}\s+(.+)$", body, re.M)
    return tidy(m.group(1)) if m else ""


def any_heading(body):
    m = re.search(r"^#{1,3}\s+(.+)$", body, re.M)
    return tidy(m.group(1)) if m else ""


def subsections(body):
    """[(title, text)] for ### blocks."""
    parts = re.split(r"^###\s+(.+)$", body, flags=re.M)
    return [(tidy(parts[i]), parts[i + 1].strip()) for i in range(1, len(parts) - 1, 2)]


def paragraphs(text):
    """Prose paragraphs, leaving out KEY: lines, tables, comments and headings."""
    out, buf = [], []
    for l in text.splitlines():
        s = l.strip()
        skip = (not s or s.startswith(("|", "#", "<!--", "<", "---")) or re.match(r"^[A-Z][A-Z_ ]{1,30}\s*(?::|—)", s))
        if skip:
            if buf:
                out.append(tidy(" ".join(buf)))
                buf = []
            continue
        buf.append(s)
    if buf:
        out.append(tidy(" ".join(buf)))
    return [p for p in out if p]


def items(text):
    """Numbered or bulleted list items, or a ';'-separated sentence when there is no list."""
    found = [tidy(m.group(1)) for m in re.finditer(r"^\s*(?:\d+[.)]|[-*•])\s+(.+)$", text, re.M)]
    if not found:
        found = [tidy(x).rstrip(".") for p in paragraphs(text) for x in p.split(";") if tidy(x)]
        found = [x[:1].upper() + x[1:] for x in found if x]
    return found


def table(body):
    rows = [l.strip() for l in body.splitlines() if l.strip().startswith("|")]
    rows = [r for r in rows if not re.match(r"^\|[\s|:-]+\|?$", r)]
    cells = [[tidy(c) for c in r.strip("|").split("|")] for r in rows]
    return (cells[0], cells[1:]) if cells else ([], [])


def faqs(body):
    """Q/A pairs: '### Q1: q' / '**Q1: q**' / '### q?' followed by the answer."""
    out = []
    pat = re.compile(r"^(?:(?:#{2,4}\s*|\*\*)\s*(?:Q\d*\s*[:.)-]\s*)?|Q\d+\s*[:.)-]\s*)(.+?\?)\**\s*$", re.M)
    hits = list(pat.finditer(body))
    for i, m in enumerate(hits):
        end = hits[i + 1].start() if i + 1 < len(hits) else len(body)
        ans = " ".join(paragraphs(re.sub(r"^\s*A\s*\d*\s*:\s*", "", body[m.end():end], flags=re.M)))
        if ans:
            out.append({"q": tidy(m.group(1)), "a": ans})
    return out


def price(s):
    m = re.search(r"£\s?[\d,]+(?:\.\d\d)?", s or "")
    return m.group(0).replace(" ", "") if m else ""


def price_num(s):
    p = price(s)
    return float(p[1:].replace(",", "")) if p else None


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def letters(s):
    return re.sub(r"[^a-z]", "", slugify(s))


def brand_name(s):
    return BRANDS.get(letters(s))


def brand_slug(name):
    return f"{slugify(name)}-engines"


def years(s):
    m = re.search(r"((?:19|20)\d\d)\s*[–-]\s*((?:19|20)\d\d\+?|present|on|now|current)", s or "", re.I)
    return f"{m.group(1)}–{m.group(2)}" if m else ""


def link_target(s):
    m = re.search(r"\]\(([^)]+)\)", s or "")
    return m.group(1).strip() if m else ""


def engine_href(target):
    """Turn a markdown link target into an /engines/ URL ("audi-ea111" / ".../hubs/ea111/" -> /engines/ea111)."""
    t = re.sub(r"^https?://[^/]+", "", target).strip().strip("/")
    m = re.search(r"(?:^|/)(?:engines|hubs?)/(.+)$", t)
    t = m.group(1) if m else t.split("/")[-1]  # ".../brands/toyota/yaris/valvematic-1-0" -> the engine part
    parts = t.split("/")
    hub = parts[0]
    b = brand_name(hub.split("-")[0]) and hub.split("-")[0]
    if b and "-" in hub and not (APP / "src" / "data" / "listings" / hub).exists():
        hub = hub[len(b) + 1:]
    return "/engines/" + "/".join([hub] + parts[1:]) if hub else ""


def image_or(path, fallback):
    return path if (PUBLIC / path.lstrip("/")).exists() else fallback


# ======================================================================= inputs

def read_sources(src, only=None):
    """[(relative path parts, text)] for every page markdown file in a zip or folder."""
    out = []
    src = Path(src)
    if src.is_file():
        with zipfile.ZipFile(src) as z:
            for info in z.infolist():
                n = info.filename
                if not info.flag_bits & 0x800:  # name stored as UTF-8 without the flag (macOS zips): undo cp437
                    try:
                        n = n.encode("cp437").decode("utf-8")
                    except UnicodeError:
                        pass
                if n.endswith(".md") and "__MACOSX" not in n and not Path(n).name.startswith("._"):
                    out.append((Path(n).parts, z.read(info).decode("utf-8", "replace")))
    else:
        for p in sorted(src.rglob("*.md")):
            if "__MACOSX" not in p.parts and not p.name.startswith("._"):
                out.append((p.relative_to(src).parts, p.read_text(encoding="utf-8", errors="replace")))
    out = [(tuple(unicodedata.normalize("NFC", x) for x in parts), unescape(t)) for parts, t in out]
    if only:
        out = [x for x in out if only.lower() in "/".join(x[0]).lower()]
    return sorted(out)


class Listings:
    """The listing pages (src/data/listings/<engine folder>/<application>.json), for real featured units,
    engine photos and 'from' prices."""

    def __init__(self):
        self.rows = []
        for f in sorted((DATA / "listings").glob("*/*.json")):
            try:
                d = json.loads(f.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                continue
            hero = d.get("hero") or {}
            opts = hero.get("options") or []
            opt = next((o for o in opts if o.get("default")), opts[0] if opts else {})
            img = next((g["src"] for g in hero.get("gallery") or [] if g.get("kind") == "engine"), "")
            self.rows.append({
                "folder": f.parent.name, "app": f.stem, "brand": letters(d.get("brandName") or d.get("brand") or ""),
                "code": d.get("engineCode") or "", "recon": (d.get("condition") or "").startswith("recon"),
                "title": hero.get("title") or "", "price": price(opt.get("price") or ""),
                "stock": hero.get("stockLabel") or "In stock — ready to ship", "image": img,
            })
        self.folders = {r["folder"] for r in self.rows}

    def folders_for(self, code):
        """Listing folders of an engine code: 'm57' -> m57, bmw-m57, bmw-m57-recon."""
        c = slugify(code)
        return {f for f in self.folders if f == c or f == c + "-recon" or f.endswith("-" + c) or f.endswith("-" + c + "-recon")}

    def of(self, brand=None, code=None, model=None):
        rs = self.rows
        if brand:
            b = letters(brand)
            rs = [r for r in rs if r["brand"] == b or (b == "mercedesbenz" and r["brand"] == "mercedes")]
        if code:
            fs = self.folders_for(code)
            rs = [r for r in rs if r["folder"] in fs]
        if model:
            m = slugify(model)
            rs = [r for r in rs if re.search(rf"(^|-){re.escape(m)}(-|$)", r["app"])]
        return rs

    def cheapest(self, rs, recon=None):
        ps = [price_num(r["price"]) for r in rs if r["price"] and (recon is None or r["recon"] == recon)]
        return f"£{min(ps):,.0f}" if ps else ""

    def image(self, rs):
        return next((r["image"] for r in rs if r["image"]), "") or ENGINE_IMG


def unit(r, brand):
    """A featured-engine card for one listing."""
    title = r["title"]
    head, _, tail = title.partition("—")
    return {
        "id": r["app"], "condition": "Reconditioned" if r["recon"] else "Used",
        "title": f"{brand} {r['code']} Engine —".replace("  ", " "),
        "subtitle": tidy(tail) or tidy(head),
        "price": r["price"], "stockLabel": r["stock"], "image": r["image"] or ENGINE_IMG,
        "buyHref": f"/engines/{r['folder']}/{r['app']}",
    }


def featured_units(rs, brand, limit):
    """Up to `limit` units, one per engine before repeating, used before recon."""
    rs = sorted(rs, key=lambda r: (r["recon"], price_num(r["price"]) or 1e9))
    seen, first, rest = set(), [], []
    for r in rs:
        (rest if r["folder"] in seen else first).append(r)
        seen.add(r["folder"])
    return [unit(r, brand) for r in (first + rest)[:limit] if r["price"]]


# ======================================================================= hub files (also used by brand pages)

CODE_RE = re.compile(r"\b([A-Z]{0,4}\d{2,4}[A-Z]{0,4}\d?|[A-Z]{2,}-?[A-Z]*\d+[A-Z\d]*|TU-SERIES|[A-Z]{2,}[ -]series)\b", re.I)


def hub_identity(parts, text):
    """(brand name, engine code shown on the page, URL slug) for a hub markdown file."""
    folder = parts[-2] if len(parts) > 1 else ""
    stem = Path(parts[-1]).stem
    brand = brand_name(folder) or brand_name(stem.split()[0]) or folder
    secs = page_sections(text)
    canon = kv(text, "CANONICAL")
    m = re.search(r"/engines/([a-z0-9-]+)/?", canon)
    # the code is the first word of the file name after the brand words ("Mercedes-Benz OM651 2.1 CDI")
    words = re.split(r"\s+", re.sub(r"\(.*?\)", " ", stem))
    while words and (brand_name(words[0]) or letters(words[0]) in ("amg", "benz", "land", "rover", "jlr")):
        words = words[1:]
    first = words[0] if words else stem
    if "-" in stem.split()[0] and brand_name(stem.split("-")[0]) and len(stem.split()) == 1:
        first = stem.split("-", 1)[1]  # "BMW-N47"
    code = re.split(r"[_/]", first)[0].strip(" -") or first
    slug = m.group(1) if m else slugify(code)
    if not m:
        # prefer a slug that has listings: "tu-series" not "tu"
        pass
    return brand, code.upper() if re.search(r"\d", code) else code, slug, secs


SPEC_LABELS = [("displacement", r"DISPLACEMENT"), ("fuel", r"FUEL"), ("config", r"CYLINDERS?"),
               ("years", r"YEARS?"), ("apps", r"CONFIGURATIONS?")]


def norm_spec(out):
    cc = re.search(r"([\d,]{3,6})\s*cc", out["displacement"])
    if cc and "·" not in out["displacement"] and "/" not in out["displacement"]:
        out["displacement"] = cc.group(1).replace(",", "") + "cc"
    out["years"] = (years(out["years"]) or out["years"]).replace("–", "-")
    out["fuel"] = re.sub(r"^fuel\s*:?\s*", "", out["fuel"], flags=re.I)
    if out["config"].isdigit():
        out["config"] = f"{out['config']}-Cylinder"
    return out


def spec_fields(text):
    """Displacement / fuel / cylinders / years / configuration from the hero spec, in any of the formats
    the files use: 'DISPLACEMENT: 1.5L · FUEL: Diesel ...' (inline or as a list), a header line
    'DISPLACEMENT · FUEL · ...' with the values on the next line, or a bare 'SPEC FIELDS: 2.1 L · Diesel ...'."""
    hero = pick(page_sections(text), "hero") or text
    out = {k: "" for k, _ in SPEC_LABELS}
    for k, lab in SPEC_LABELS:
        m = re.search(rf"\b{lab}\s*:\s*([^·|\n]+)", hero, re.I)
        if m:
            out[k] = tidy(m.group(1))
    if any(out.values()):
        return norm_spec(out)
    lines = [l.strip() for l in hero.splitlines() if l.strip()]
    for i, l in enumerate(lines[:-1]):
        heads = [h.strip().upper() for h in re.split(r"·|\|", tidy(l))]
        if sum(any(re.fullmatch(lab, h) for _, lab in SPEC_LABELS) for h in heads) >= 3:
            vals = [tidy(v) for v in re.split(r"·|\|", lines[i + 1])]
            for h, v in zip(heads, vals):
                for k, lab in SPEC_LABELS:
                    if re.fullmatch(lab, h):
                        out[k] = v
            return norm_spec(out)
    raw = kv(text, "SPEC FIELDS", "SPEC_FIELDS", "SPECIFICATIONS", "SPECS", "SPEC")
    if not raw:  # an unlabelled line: "2.7L · Diesel · V6 · 2004–2010 · Longitudinal"
        raw = next((tidy(l) for l in lines if l.count("·") >= 2 and re.search(r"diesel|petrol|hybrid", l, re.I) and years(l)), "")
    toks = [t.strip() for t in re.split(r"·|\|", raw) if t.strip()]
    for t in toks:
        lo = t.lower()
        if not out["displacement"] and re.search(r"\d\s*(?:l\b|cc|litre)", lo):
            cc = re.search(r"([\d,]{3,6})\s*cc", t)
            out["displacement"] = (cc.group(1).replace(",", "") + "cc") if cc else t
        elif not out["fuel"] and re.search(r"diesel|petrol|hybrid|electric|gasoline", lo):
            out["fuel"] = t.title() if len(t) < 20 else t
        elif not out["years"] and years(t):
            out["years"] = years(t).replace("–", "-")
        elif not out["config"] and re.search(r"inline|v\d|i\d|cyl|flat|boxer|w\d", lo):
            out["config"] = t
        elif not out["apps"]:
            out["apps"] = t
    return norm_spec(out)


def lead_text(body):
    """A hero's description when it has no SUB key: its first prose paragraph ("Fits ...")."""
    paras = [p for p in paragraphs(re.sub(r"^#{1,3}\s.*$", "", body, flags=re.M))
             if not re.match(r"(also known|from\s+£|img|image alt|specifications|spec fields|displacement)", p, re.I)]
    return next((p for p in paras if p.lower().startswith("fits")), paras[0] if paras else "")


def also_known(text):
    v = kv(text, "ALSO_KNOWN", "ALSO KNOWN")
    if not v:
        m = re.search(r"^\W*Also known as\W*[:—-]\s*(.+)$", text, re.M | re.I)
        v = tidy(m.group(1)) if m else ""
    v = re.sub(r"^also known as\s*:?\s*", "", v, flags=re.I)
    return f"Also known as: {v}" if v else ""


def from_price(text):
    v = price(kv(text, "FROM_PRICE", "FROM PRICE"))
    if not v:
        m = re.search(r"^\W*From\s+(£[\d,]+)", pick(page_sections(text), "hero") or text, re.M)
        v = m.group(1) if m else ""
    return v


def hub_summary(parts, text, ls):
    """What a brand page needs about one hub: code, spec line, from price, URL."""
    brand, code, slug, secs = hub_identity(parts, text)
    sp = spec_fields(text)
    spec = " · ".join(x for x in [sp["displacement"], sp["fuel"], sp["years"].replace("-", "–")] if x)
    frm = from_price(text) or ls.cheapest(ls.of(brand=brand, code=slug)) or ls.cheapest(ls.of(code=slug))
    tab = "Diesel" if "diesel" in sp["fuel"].lower() else "Petrol" if "petrol" in sp["fuel"].lower() else ""
    return {"brand": brand, "code": code, "slug": slug, "spec": spec, "priceFrom": frm, "tab": tab}


# ======================================================================= brand pages

def build_brand(parts, text, ls, hubs_by_brand):
    rep = []
    secs = page_sections(text)
    hero = pick(secs, "hero")
    h = heading(hero) or any_heading(text)
    name = brand_name(Path(parts[-1]).stem) or Path(parts[-1]).stem
    slug = brand_slug(name)
    lead, _, hl = h.partition("—")
    key = IMAGE_KEY.get(name)
    logo = f"/images/brands/logo-{key}.png" if key else "/images/brands/Brand_logo.png"
    if not key:
        rep.append("no brand logo / car photo in public/images/brands: generic images used")
    reg_label = kv(text, "REG_LABEL") or "ENTER REG NUMBER"
    reg_button = kv(text, "REG_BUTTON") or "Find my engine"

    # engine families: the page's own hub cards, else this brand's hub files, else its price table
    fam = []
    for blk in re.split(r"\n(?=\s*HUB\s*:)", pick(secs, "hub-cards")):
        code = kv(blk, "HUB")
        if code:
            code = re.sub(r"\s+(hub|family)$", "", code, flags=re.I)
            href = re.sub(r"^https?://[^/]+", "", kv(blk, "SLUG")).rstrip("/") or f"/engines/{slugify(code.split('/')[0])}"
            spec = kv(blk, "SPEC").replace(" - ", "–")
            fam.append({"code": code, "spec": spec, "priceFrom": price(kv(blk, "FROM_PRICE")), "href": href})
    if not fam:
        for hb in hubs_by_brand.get(name, []):
            fam.append({"code": hb["code"], "spec": hb["spec"], "priceFrom": hb["priceFrom"], "href": f"/engines/{hb['slug']}"})
    pg = pick(secs, "price-guide")
    cols, rows = table(pg)
    if not fam:
        for r in rows:
            code = r[0].split()[0] if r else ""
            if code:
                fam.append({"code": r[0], "spec": r[3] if len(r) > 3 else "", "priceFrom": price(r[1]) or price(r[2] if len(r) > 2 else ""),
                            "href": f"/engines/{slugify(re.split(r'[ /]', r[0])[0])}"})
        if fam:
            rep.append("engine families taken from the price table (no hub cards or hub files for this brand)")
    if not fam:
        rep.append("no engine families found")
    for f in fam:
        if not f["priceFrom"]:
            f["priceFrom"] = ls.cheapest(ls.of(brand=name, code=f["href"].rsplit("/", 1)[-1]))

    hs = pick(secs, "hubs-header")
    models = []
    for line in kv_all(pick(secs, "models"), "MODEL"):
        p = [tidy(x) for x in line.split("|")]
        if not p[0]:
            continue
        target = p[3] if len(p) > 3 else p[0]
        mslug = slugify(target.strip("/").split("/")[-1])
        for pre in sorted({slugify(name), letters(name), slugify(name).split("-")[0]}, key=len, reverse=True):
            if mslug.startswith(pre + "-"):
                mslug = mslug[len(pre) + 1:]
                break
        models.append({"name": re.sub(r"\s*\((?:see|\+)[^)]*\)", "", p[0]).strip(), "chassis": p[1].replace("-", " – ") if len(p) > 1 else "",
                       "families": p[2] if len(p) > 2 else "", "image": "/images/brands/Brandpage_car.png", "href": f"/{slug}/{mslug}"})
    if not models:
        rep.append("no MODEL lines")

    feat_sec = pick(secs, "featured")
    units = featured_units(ls.of(brand=name), name, 8)
    if not units:
        rep.append("no listings for this brand: featured engines empty")

    cond = pick(secs, "condition-guide")
    opts = []
    for t, body in subsections(cond):
        rec = "recon" in t.lower()
        opts.append({"icon": "shield-check" if rec else "car", "title": t, "paragraphs": paragraphs(body)})
    over = pick(secs, "overview")
    wd = pick(secs, "warranty-delivery")
    fq = pick(secs, "faq")
    cta = pick(secs, "cta")
    cta_h = heading(cta) or kv(cta, "CTA_H2")
    cta_t, cta_hl = cta_h, ""
    m = re.match(r"(.*?)\s+(in under a minute.*)$", cta_h, re.I)
    if m:
        cta_t, cta_hl = m.group(1), m.group(2)
    short = name.split("-")[0] if name == "Mercedes-Benz" else name

    entry = {
        "slug": slug,
        "seo": {"title": kv(text, "META_TITLE") or f"{name} Engines for Sale | Used & Reconditioned",
                "description": kv(text, "META_DESC")},
        "hero": {
            "brand": name, "name": name, "logo": logo, "title": tidy(re.sub(rf"^{re.escape(name)}\s*", "", lead, flags=re.I)) or "Engines for Sale",
            "highlight": tidy(hl) or "Used & Reconditioned", "description": kv(hero, "SUB") or (paragraphs(hero) or [""])[0],
            "carImage": f"/images/brands/car-{key}.png" if key else "/images/brands/Brandpage.png",
            "regCheck": {"placeholder": reg_label, "buttonText": reg_button, "countryFlag": "GB", "helpText": "How registration lookup works"},
            "trustBadges": TRUST_BRAND,
            "cards": [{"code": f["code"], "name": " ".join(x.strip() for x in f["spec"].split("·") if x.strip() and not years(x)), "ps": "", "nm": "",
                       "years": years(f["spec"]).replace("–", " – "),
                       "image": ls.image(ls.of(code=f["href"].rsplit("/", 1)[-1])), "href": f["href"]} for f in fam[:6]],
        },
        "howItWorks": HOW_IT_WORKS,
        "featuredEngines": {"title": heading(feat_sec) or f"Featured {name} Engines in Stock", "subtitle": kv(feat_sec, "INTRO") or (paragraphs(feat_sec) or [""])[0],
                            "viewAllText": "See all engines", "viewAllHref": "/engines", "buyButtonText": "Buy it now", "engines": units},
        "shopByModel": {"title": heading(pick(secs, "models")) or f"Shop {name} Engines by Model", "subtitle": kv(pick(secs, "models"), "INTRO"),
                        "viewAllText": f"View all {len(models)} models", "viewAllHref": f"/{slug}#shop-by-model",
                        "allModelsLabel": "View all models", "allModelsCount": f"{len(models)} models available", "models": models},
        "engineFamilies": {"title": heading(hs) or f"All {name} Engine Families", "description": kv(hs, "INTRO"),
                           "image": "/images/engines/pop-om642.png", "families": fam},
        "priceGuide": {"title": heading(pg) or f"{name} Engine Price Guide", "description": kv(pg, "INTRO") or (paragraphs(pg) or [""])[0],
                       "columns": cols or ["Engine family", "Used from", "Reconditioned from", "Note"],
                       "rows": [{"family": r[0], "used": r[1] if len(r) > 1 else "", "recon": r[2] if len(r) > 2 else "", "note": r[3] if len(r) > 3 else ""} for r in rows],
                       "note": kv(pg, "DISCLAIMER") or DISCLAIMER, "image": "/images/engines/mercedes-om642-diesel-engine.png"},
        "usedVsRecon": {"title": heading(cond) or f"Used or Reconditioned — Which {name} Engine to Buy?", "options": opts},
        "about": {"title": heading(over) or f"About {name} Engines", "logo": logo, "carImage": "/images/brands/Brandpage_about.png",
                  "paragraphs": paragraphs(re.sub(r"^##\s.*$", "", over, flags=re.M))},
        "warrantyDelivery": {"title": heading(wd) or f"Warranty & Delivery on {name} Engines",
                             "items": [{"icon": "truck" if "deliver" in t.lower() else "shield-check", "title": t, "paragraphs": paragraphs(b)} for t, b in subsections(wd)]},
        "faqs": {"title": heading(fq) or f"{name} Engine Buying FAQs",
                 "subtitle": f"Answers to the most common questions about buying a {short} engine from GMC.",
                 "items": faqs(fq),
                 "whyBuy": {"title": f"Why buy {short} engines from GMC?", "items": [
                     {"icon": "shield", "title": "Verified Fitment", "description": f"Every engine is verified by registration so you get the exact engine that fits your {short}."},
                     {"icon": "shield-check", "title": "12-Month Warranty", "description": "Reconditioned engines include 12-month, unlimited-mileage warranty. Used engines have stated terms."},
                     {"icon": "truck", "title": "UK Nationwide Delivery", "description": "Fast & secure kerbside pallet delivery anywhere on the UK mainland, typically 2–4 working days."},
                     {"icon": "lock", "title": "Secure Checkout", "description": "Safe online payments with encrypted checkout and fraud protection for your peace of mind."}]}},
        "cta": {"title": cta_t or f"Find the right {name} engine", "highlight": cta_hl or "in under a minute",
                "description": kv(cta, "P", "CTA_P") or (paragraphs(cta) or [""])[0],
                "placeholder": reg_label, "buttonText": reg_button, "countryFlag": "GB", "carImage": "/images/brands/Brandpage_cta.png",
                "badges": [{"icon": "check-circle", "text": "Verified by Registration"}, {"icon": "check-circle", "text": "UK Delivery"},
                           {"icon": "check-circle", "text": "Warranty Included"}]},
    }
    for path, v in [("seo.description", entry["seo"]["description"]), ("hero.description", entry["hero"]["description"]),
                    ("usedVsRecon", opts), ("about", entry["about"]["paragraphs"]), ("warrantyDelivery", entry["warrantyDelivery"]["items"]),
                    ("faqs", entry["faqs"]["items"]), ("priceGuide rows", rows)]:
        if not v:
            rep.append(f"{path}: not found in the markdown")
    rep.append("hero cards: PS / Nm figures are not in the markdown (left blank)")
    return slug, entry, rep


# ======================================================================= model pages

def model_identity(parts, text):
    folder = parts[-2] if len(parts) > 1 else ""
    stem = Path(parts[-1]).stem
    brand = brand_name(folder) or brand_name(stem.split()[0]) or folder
    words = stem.split()
    while words and (brand_name(words[0]) or letters(words[0]) in ("benz", "land", "rover")):
        words = words[1:]
    model = " ".join(words) or stem
    return brand, model


def generation_blocks(body):
    """[(gen code, years, block text)] from 'GENERATION n of m: CODE (...) (years)' or '### CODE' headings."""
    pat = re.compile(r"^\**\s*(?:#+\s*)?GENERATION\s+\d+\s+of\s+\d+\s*[:—-]\s*(.+?)\**\s*$|^#{3,4}\s+(.+)$", re.M | re.I)
    hits = list(pat.finditer(body))
    out = [("", body[:hits[0].start()])] if hits else []  # rows before the first heading have no generation yet
    for i, m in enumerate(hits):
        label = tidy(m.group(1) or m.group(2))
        end = hits[i + 1].start() if i + 1 < len(hits) else len(body)
        out.append((label, body[m.end():end]))
    return out


def gen_code(label):
    """'B6 (Typ 8E) (2000-2004) — 2 rows' -> ('B6', '2000–2004')."""
    yrs = years(label)
    code = re.split(r"\s*[(·|—–]\s*|\s+-\s+", label)[0].strip()
    return code, yrs


def tab_gens(text):
    """Generations from the tabs line, in any of its forms: 'TABS: B6 (Typ 8E) · 2000-2004 | B7 ...',
    'TABS: 8L · 2000-2003 · 8P · 2003-2013', or a bare '**T2000 · 2004–2010** · **T3000 · ...**'."""
    raw = kv(text, "TABS")
    if not raw:
        m = re.search(r"^\s*\*\*[^*\n]+\*\*(?:\s*·\s*\*\*[^*\n]+\*\*)+\s*$", text, re.M)
        raw = tidy(m.group(0)) if m else ""
    if "|" in raw:
        return [gen_code(t) for t in raw.split("|") if t.strip()]
    toks = [t.strip() for t in raw.split("·") if t.strip()]
    out = []
    for t in toks:
        if years(t) and out and not out[-1][1] and not re.search(r"[A-Za-z]{2}", re.sub(r"present|on|now|current", "", t, flags=re.I)):
            out[-1] = (out[-1][0], years(t))  # a bare year range belongs to the code before it
        else:
            out.append(gen_code(t))
    return [g for g in out if g[0]]


def engine_rows(text):
    """Engine table rows, by generation, from 'ROW: a | b | ...' lines or markdown tables whose first
    column is 'Variant', under 'GENERATION n of m: CODE (years)' or '### CODE (years)' headings."""
    gens, rows = [], []
    for label, block in generation_blocks(text) or [("", text)]:
        g, y = gen_code(label) if label else ("", "")
        # ROW lines are always: variant | code | hub link | fuel | years | output
        std = {"variant": 0, "code": 1, "link": 2, "fuel": 3, "years": 4, "output": 5}
        cells = [([x.strip() for x in l.split("|")], std) for l in kv_all(block, "ROW")]
        cols = None
        for l in block.splitlines():
            s = l.strip()
            if not s.startswith("|"):
                cols = None
                continue
            p = [x.strip() for x in s.strip("|").split("|")]
            if re.match(r"^\|[\s|:-]+\|?$", s):
                continue
            if re.match(r"variant", tidy(p[0]), re.I):  # header row: map the columns by their names
                cols = {}
                for i, h in enumerate(tidy(x).lower() for x in p):
                    for k, pat in (("code", r"code"), ("link", r"hub|link|page"), ("fuel", r"fuel"),
                                   ("years", r"year"), ("output", r"output|ps|power")):
                        if k not in cols and re.search(pat, h):
                            cols[k] = i
                            break
                cols["variant"] = 0
                continue
            if cols is not None:
                cells.append((p, cols))
        found = 0
        dash = lambda s: "" if tidy(s) in ("—", "-", "–") else tidy(s)
        for p, c in cells:
            get = lambda k: p[c[k]] if k in c and c[k] < len(p) else ""
            if len(p) < 3 or not tidy(p[0]):
                continue
            target = link_target(get("link"))
            href = engine_href(target) if target else ""
            rows.append({"gen": g, "variant": tidy(p[0]), "code": dash(get("code")),
                         "page": tidy(get("link")) if href else "Hub pending", "href": href,
                         "fuel": dash(get("fuel")), "years": dash(get("years")).replace("-", "–"),
                         "output": dash(get("output"))})
            found += 1
        if found and g and g not in [x[0] for x in gens]:
            gens.append((g, y))
    return gens, rows


def build_model(parts, text, ls, hub_index):
    rep = []
    brand, model = model_identity(parts, text)
    bslug = brand_slug(brand)
    slug = slugify(model)
    secs = page_sections(text)
    if not sections(text):
        rep.append("no SECTION markers: sections found by their headings")
    hero = pick(secs, "hero") or text
    h = heading(hero) or any_heading(text)
    lead, _, hl = h.partition("—")
    key = IMAGE_KEY.get(brand)
    logo = f"/images/brands/logo-{key}.png" if key else "/images/brands/Brand_logo.png"

    # engine table: rows under each generation heading; the tabs line supplies the generations' years
    hdr = pick(secs, "engine-table-header", "engine-table")
    gens, rows = engine_rows(text)
    tabs = tab_gens(hdr or text)
    tab_years = {g: y for g, y in tabs}
    gens = [(g, y or tab_years.get(g, "")) for g, y in gens]
    if not gens:
        gens = tabs
    # rows not under a generation heading: put each in the generation whose years contain its start year
    for r in rows:
        if not r["gen"]:
            y0 = re.search(r"(?:19|20)\d\d", r["years"])
            for g, y in gens:
                ys = re.findall(r"(?:19|20)\d\d", y)
                if y0 and ys and int(ys[0]) <= int(y0.group(0)) <= (int(ys[1]) if len(ys) > 1 else 2100):
                    r["gen"] = g
                    break
    gens = [(g, y) for g, y in gens if any(r["gen"] == g for r in rows)] or gens
    if not rows:
        rep.append("engine table: no ROW lines found")
    gen_codes = [g for g, _ in gens if g]
    # engine families on the page: one per engine page link (several variant codes share a family),
    # named after the link ("Ecotec Family 0 engines" -> "Ecotec Family 0"), else the code itself
    fam_of = lambda r: (re.sub(r"\s+engines?$", "", r["page"], flags=re.I) if r["href"] else r["code"])
    codes = list(OrderedDict.fromkeys(fam_of(r) for r in rows if fam_of(r)))

    mine = ls.of(brand=brand, model=slug)
    units = featured_units(mine, brand, 16)
    if not units:
        rep.append("no listings match this model: featured engines empty")

    cards = []
    for i, c in enumerate(codes[:6]):
        r0 = next(r for r in rows if fam_of(r) == c)
        hub = r0["href"].split("/")[2] if r0["href"] else slugify(c)
        rs = ls.of(brand=brand, code=hub) or ls.of(code=hub)
        cards.append({"code": c, "spec": f"{r0['variant']} {r0['fuel']}".strip(),
                      "condition": "Used" if any(not r["recon"] for r in rs) or not rs else "Reconditioned",
                      "priceFrom": ls.cheapest(rs), "image": ls.image(rs), "inStock": bool(rs),
                      "href": r0["href"] or f"/engines/{slugify(c)}", "pos": CARD_POS[i]})
    if cards:  # the big centre card of the hero (the second position, as on the C-Class page)
        cards[1 if len(cards) > 1 else 0]["featured"] = True

    pg = pick(secs, "price-guide")
    pcols, prows = table(pg)
    gyears = {g: y for g, y in gens}
    pgens = []
    for i, g in enumerate(gen_codes):
        grs = [r for r in rows if r["gen"] == g]
        tbl_row = next((r for r in prows if r and g.lower() in r[0].lower()), None)
        frm = (price(tbl_row[1]) or price(" ".join(tbl_row[1:]))) if tbl_row else ""
        fam = list(OrderedDict.fromkeys(fam_of(r) for r in grs if fam_of(r)))
        pgens.append({"code": g, "years": gyears.get(g, ""), "variants": len(grs), "families": len(fam), "priceFrom": frm,
                      "route": (fam[0] + (" " + grs[0]["fuel"].lower() if grs and grs[0]["fuel"] else "")) if fam else "",
                      "image": "/images/models/Modelpage_car2.png" if i % 2 == 0 else "/images/models/Modelpage_car.png"})
    if pgens:  # highlight the generation with the most variants
        max(pgens, key=lambda x: x["variants"])["current"] = True
    allyears = re.findall(r"(?:19|20)\d\d", " ".join(gyears.values()))

    hist = pick(secs, "history")
    subs = subsections(hist)
    sentences = re.split(r"(?<=[.!?])\s+", " ".join(paragraphs(re.sub(r"^##\s.*$", "", hist, flags=re.M))))
    gitems = []
    for i, g in enumerate(gen_codes):
        sub = next((b for t, b in subs if g.lower() in t.lower()), None)
        txt = " ".join(paragraphs(sub)) if sub else " ".join(s for s in sentences if re.search(rf"\b{re.escape(g)}\b", s))
        gitems.append({"code": g, "years": gyears.get(g, ""), "image": "/images/models/Modelpage_car2.png", "text": txt})
    if hist and gitems and not any(x["text"] for x in gitems):
        # the history names no generation codes ("the second generation arrived in 2018"); it runs in
        # order, so give each generation an equal run of consecutive sentences
        sents = [s for s in sentences if s]
        n = len(gitems)
        for i, it in enumerate(gitems):
            it["text"] = " ".join(sents[round(i * len(sents) / n):round((i + 1) * len(sents) / n)])
        rep.append("history names no generation codes: its sentences were shared out in order (check)")

    cond = pick(secs, "condition-guide")
    rel = pick(secs, "related")
    related = []
    # 'RELATED: A · B · All X Engines → /brands/x', the same line without the key, or a list of links
    raw = kv(rel, "RELATED") or kv(text, "RELATED")
    if not raw:
        raw = next((l for l in rel.splitlines() if l.count("·") >= 1 and not re.match(r"\s*[A-Z_]{3,}\s*:", l)), "")
    parts_rel = re.split(r"\s*·\s*", raw) if raw else items(rel.split("###")[0])
    for part in parts_rel:
        nm = tidy(re.sub(r"\(.*?\)", "", part.split("→")[0])).strip()
        nm = re.sub(r"\s+Engines?$", "", nm)
        if not nm or len(nm) > 40:
            continue
        if nm.lower().startswith("all "):
            related.append({"name": f"{nm} Engines" if not nm.lower().endswith("engines") else nm, "href": f"/{bslug}", "all": True})
            continue
        words = nm.split()
        other = brand_name(words[0]) or (len(words) > 1 and brand_name(" ".join(words[:2])))
        rb = other or brand
        mname = " ".join(words[(2 if other and not brand_name(words[0]) else 1):] if other else words) or nm
        related.append({"name": f"{mname} Engines" if rb == brand else f"{rb} {mname} Engines",
                        "href": f"/{brand_slug(rb)}/{slugify(mname)}"})
    if related and not any(r.get("all") for r in related):
        related.append({"name": f"All {brand} Engines", "href": f"/{bslug}", "all": True})

    fq = pick(secs, "faq")
    cta_body = rel or pick(secs, "cta")
    hero_paras = [p for p in paragraphs(re.sub(r"^#{1,3}\s.*$", "", hero, flags=re.M)) if not re.match(r"(img|image alt)", p, re.I)]
    entry = {
        "slug": slug, "brandSlug": bslug,
        "seo": {"title": kv(text, "META_TITLE") or f"{brand} {model} Engines for Sale | Used & Reconditioned", "description": kv(text, "META_DESC")},
        "hero": {
            "brand": brand, "model": model, "logo": logo,
            "titleSuffix": (tidy(re.sub(rf"^{re.escape(brand)}\s+{re.escape(model)}\s*", "", lead, flags=re.I)) or "Engines for Sale") + " —",
            "highlight": tidy(hl) or "Used & Reconditioned",
            "description": kv(hero, "SUB") or (hero_paras[0] if hero_paras else ""),
            "longDescription": kv(hero, "LEDE") or (hero_paras[1] if len(hero_paras) > 1 else ""),
            "carImage": "/images/models/Modelpage_car.png", "carImageLight": "/images/models/Modelpage_car.png",
            "regCheck": {"placeholder": kv(text, "REG_LABEL") or "ENTER REG NUMBER", "buttonText": kv(text, "REG_BUTTON") or "Find my engine", "countryFlag": "GB"},
            "trustBadges": TRUST_BRAND, "cards": cards,
        },
        "featured": {"title": heading(pick(secs, "featured")) or f"Featured {model} Engines in Stock",
                     "subtitle": kv(pick(secs, "featured"), "INTRO"), "viewAllText": "View all engines", "viewAllHref": "/engines",
                     "buyButtonText": "Buy it now", "engines": units},
        "engineTable": {"title": heading(hdr) or f"Every Engine Fitted to the {brand} {model}", "subtitle": kv(hdr, "INTRO"),
                        "generations": ["All Generations"] + gen_codes,
                        "columns": ["Variant", "Engine code", "Engine page", "Fuel", "Years", "Output"],
                        "viewAllText": f"View all {len(codes)} engine families", "viewAllHref": "#engine-families", "rows": rows},
        "priceGuide": {"title": heading(pg) or f"{model} Engine Price Guide by Generation", "subtitle": kv(pg, "INTRO"),
                       "note": kv(pg, "DISCLAIMER") or DISCLAIMER,
                       "rangeStart": min(allyears) if allyears else "", "rangeEnd": max(allyears) if allyears else "", "generations": pgens},
        "usedVsRecon": {"title": heading(cond) or f"Used or Reconditioned — Which {model} Engine to Buy?",
                        "options": [{"icon": "shield-check" if "recon" in t.lower() else "car", "title": t, "text": " ".join(paragraphs(b))} for t, b in subsections(cond)]},
        "generations": {"title": heading(hist) or f"{model} Engines Through the Generations", "items": gitems},
        "faqs": {"title": heading(fq) or f"{model} Engine Buying FAQs", "items": faqs(fq)},
        "related": {"title": heading(rel) or f"Related {brand} Models", "models": related},
        "cta": {"title": kv(cta_body, "CTA_H2") or heading(cta_body, 3) or f"Find the right {model} engine in under a minute",
                "description": kv(cta_body, "CTA_P") or next((p for p in paragraphs(cta_body.split("###", 1)[-1]) if "·" not in p and not p.startswith(("-", "*")) and len(p) > 40), ""),
                "buttonText": kv(cta_body, "CTA_BUTTON", "BUTTON") or "Check Fitment by Reg",
                "buttonHref": "#reg-check", "image": "/images/engines/pop-om642.png"},
    }
    for path, v in [("seo.description", entry["seo"]["description"]), ("hero.description", entry["hero"]["description"]),
                    ("faqs", entry["faqs"]["items"]), ("usedVsRecon", entry["usedVsRecon"]["options"]), ("generations", gen_codes)]:
        if not v:
            rep.append(f"{path}: not found in the markdown")
    if not any(g["priceFrom"] for g in pgens):
        rep.append("price guide: no prices in the markdown (generation 'from' prices left blank)")
    if not key:
        rep.append("no brand logo in public/images/brands: generic logo used")
    rep.append("hero car image: generic model photo used")
    return slug, entry, rep


# ======================================================================= hub pages

def build_hub(parts, text, ls):
    rep = []
    brand, code, slug, secs = hub_identity(parts, text)
    bslug = brand_slug(brand)
    hero = pick(secs, "hero")
    h = heading(hero, 2) or heading(text, 1)
    # "BMW B37 Engine — 1.5L Turbodiesel — Used & Reconditioned for Sale": the highlight is the last part
    lead, _, rest = h.rpartition("—") if "—" in h else (h, "", "")
    lead = lead.replace(" — ", " ")
    hl = tidy(rest)
    tail = ""
    m = re.match(r"(.*?)(\s+for Sale.*)$", hl, re.I)
    if m:
        hl, tail = m.group(1), m.group(2)
    sp = spec_fields(text)
    folders = ls.folders_for(slug)
    if not folders:  # a combined page ("m40d-m50d"): the listings of each of its codes
        for c in re.split(r"[-_/ ]", slug + " " + code.lower()):
            if len(c) >= 2:
                folders |= ls.folders_for(c)
    mine = [r for r in ls.rows if r["folder"] in folders]
    if not folders:
        rep.append(f"no listing folder for '{slug}': unit links will fall back to the nearest page")
    key = IMAGE_KEY.get(brand)

    # application cards
    units = []
    for line in kv_all(text, "CARD"):
        p = [x.strip() for x in line.split("|")]
        if len(p) < 4:
            continue
        target = re.sub(r"^/?engines/", "", tidy(p[1]).strip("/"))
        # "om651/mercedes-c-class" is engine/unit; a bare "ea211-seat-compact" is a unit of this engine
        href = f"/engines/{target}" if "/" in target else (f"/engines/{slug}/{target}" if target else f"/engines/{slug}")
        sub = tidy(p[4]) if len(p) > 4 and not p[4].upper().startswith("ALT") else ""
        units.append({"id": target.split("/")[-1] or slugify(p[0]), "condition": tidy(p[2]), "title": tidy(p[0]), "subtitle": sub,
                      "price": price(p[3]) or (f"£{int(tidy(p[3])):,}" if tidy(p[3]).isdigit() else tidy(p[3])), "image": ls.image(mine), "href": href})
    if not units and mine:
        rep.append("no CARD lines: application cards built from the listings")
        units = [{"id": u["id"], "condition": u["condition"], "title": u["subtitle"], "subtitle": "", "price": u["price"],
                  "image": u["image"], "href": u["buyHref"]} for u in featured_units(mine, brand, 12)]
    if not units:
        rep.append("no application cards (no CARD lines and no listings)")

    # compatibility rows
    crow = []
    for line in kv_all(text, "ROW"):
        p = [x.strip() for x in line.split("|")]
        if len(p) < 4:
            continue
        target = link_target(line)
        crow.append({"model": tidy(p[0]), "chassis": tidy(p[1]), "variants": tidy(p[2]) if len(p) > 2 else "",
                     "years": tidy(p[3]) if len(p) > 3 else "", "config": tidy(p[4]) if len(p) > 4 else "",
                     "linkText": "View unit", "href": target if target.startswith("/") else (f"/engines/{target}" if target else f"/engines/{slug}")})
    if not crow:  # the matrix as markdown table(s), one per brand in some files
        mx = "\n".join(v for k, v in secs.items() if k.startswith(("matrix", "compatibility")))
        for line in mx.splitlines():
            s = line.strip()
            if not s.startswith("|") or re.match(r"^\|[\s|:-]+\|?$", s):
                continue
            p = [x.strip() for x in s.strip("|").split("|")]
            if len(p) < 4 or tidy(p[0]).lower() in ("model", "vehicle", "application"):
                continue
            target = link_target(s)
            crow.append({"model": tidy(p[0]), "chassis": tidy(p[1]), "variants": tidy(p[2]), "years": tidy(p[3]),
                         "config": tidy(p[4]) if len(p) > 5 else "", "linkText": "View unit",
                         "href": target if target.startswith("/") else (f"/engines/{target}" if target else f"/engines/{slug}")})
    if not crow:
        rep.append("compatibility matrix: no ROW lines")

    pg = pick(secs, "price-guide")
    pcols, prows = table(pg)
    prices = [{"application": r[0], "used": r[1] if len(r) > 1 else "", "recon": r[2] if len(r) > 2 else ""} for r in prows if r and r[0]]
    if not prices:
        rep.append("price table: none in the markdown")

    cs = pick(secs, "condition-standards")
    subs = subsections(cs)
    inc = next((b for t, b in subs if "includ" in t.lower() and "not" not in t.lower()), "")
    exc = next((b for t, b in subs if "not" in t.lower() or "exclud" in t.lower()), "")
    aside = next((b for t, b in subs if "used or" in t.lower() or "recondition" in t.lower()), "")
    inc_items = items(inc)
    fq = pick(secs, "faq")
    cta = pick(secs, "cta")
    an = "an" if re.match(r"[aeiofhlmnrsx]", code.lower()) and code[:1].upper() in "AEIOFHLMNRSX" else "a"
    apps_n = len({r["model"] for r in crow})
    quick = [{"icon": "cog", "value": sp["displacement"], "label": "Displacement"},
             {"icon": "fuel", "value": sp["fuel"], "label": "Fuel"},
             {"icon": "calendar", "value": sp["years"], "label": "Production"}]

    entry = {
        "engineSlug": slug,
        "seo": {"title": kv(text, "META_TITLE") or f"{brand} {code} Engine for Sale | Used & Reconditioned",
                "description": kv(text, "META_DESC"), "canonical": f"{SITE}/engines/{slug}"},
        "breadcrumb": [{"label": "Home", "href": "/"}, {"label": "Engines", "href": "/engines"},
                       {"label": f"{brand} Engines", "href": f"/{bslug}"}, {"label": f"{code} Engine"}],
        "hero": {
            "brand": brand, "brandLogo": f"/images/brands/logo-{key}.png" if key else "/images/brands/Brand_logo.png",
            "titleLead": (tidy(lead) or f"{brand} {code} Engine") + " -", "titleHighlight": hl or "Used & Reconditioned",
            "titleTail": tail or " for Sale", "alsoKnownAs": also_known(text),
            "description": kv(hero, "SUB") or lead_text(hero),
            "heroImage": "/images/hub/hero_dark_cut.png", "heroImageLight": "/images/hub/hero_light_cut.png",
            "quickSpecs": quick,
            "specCards": quick + [{"icon": "config", "value": sp["config"], "label": "Configuration"},
                                  {"icon": "box", "value": "Multiple" if apps_n > 1 else (crow[0]["model"] if crow else sp["apps"]), "label": "Applications"}],
            "regCheck": {"countryFlag": "GB", "placeholder": "ENTER REG NUMBER", "buttonText": "Check fit"},
            "microTrust": ["Exact model match", "Engine code confirmed", "100% secure"],
            "trustBadges": TRUST_HUB,
        },
        "applications": {"title": heading(pick(secs, "applications-header")) or f"Buy {an} {code} Engine for Your Vehicle",
                         "subtitle": kv(pick(secs, "applications-header"), "INTRO"), "ctaText": "View unit", "units": units},
        "compatibility": {"title": heading(pick(secs, "matrix-header")) or f"Full {code} Compatibility",
                          "intro": kv(pick(secs, "matrix-header"), "INTRO"),
                          "columns": ["Model", "Chassis", "Variants", "Years", "Config.", "Unit page"],
                          "note": "Confirm your exact spec with the registration checker above.", "rows": crow},
        "prices": {"title": heading(pg) or f"{code} Engine Prices", "intro": kv(pg, "INTRO"),
                   "columns": ["Application", "Used from", "Reconditioned from"], "note": kv(pg, "DISCLAIMER") or DISCLAIMER, "rows": prices},
        "whatYouGet": {"titleLead": f"What You Get with {an} ", "titleHighlight": code, "titleTail": " Engine",
                       "includedTitle": "What's included:", "includedBody": "; ".join(i.rstrip(".") for i in inc_items) + ("." if inc_items else ""),
                       "excludedTitle": "Not included:", "excluded": items(exc),
                       "asideTitle": "Used or reconditioned?", "asideBody": " ".join(paragraphs(aside))},
        "faqs": {"title": heading(fq) or f"{code} Engine Buying FAQs",
                 "subtitle": f"Everything you need to know before you buy the right {code} engine for your vehicle.", "items": faqs(fq)},
        "cta": {"title": kv(cta, "CTA_H2") or heading(cta) or f"Find your {code} engine in under a minute", "body": kv(cta, "CTA_P"),
                "buttonText": kv(cta, "CTA_BUTTON") or "Check Fitment by Reg", "buttonHref": "#reg-check"},
    }
    for path, v in [("seo.description", entry["seo"]["description"]), ("hero.description", entry["hero"]["description"]),
                    ("spec line", sp["displacement"] or sp["fuel"]), ("faqs", entry["faqs"]["items"]),
                    ("what's included", inc_items)]:
        if not v:
            rep.append(f"{path}: not found in the markdown")
    if not key:
        rep.append("no brand logo in public/images/brands: generic logo used")
    return slug, entry, rep


# ======================================================================= driver

def renderable(kind, entry):
    """Brand and model heroes show one engine card at a time and need at least one; a hub page needs at
    least one application unit to sell."""
    if kind in ("brand", "model"):
        return bool(entry["hero"]["cards"])
    return bool(entry["applications"]["units"])


def run(kind, args, ls):
    zip_name, json_name = TYPES[kind]
    src = Path(args.src) if args.src and args.type != "all" else REPO / zip_name
    if not src.exists():
        sys.exit(f"{kind}: source not found: {src} (pass --src)")
    files = read_sources(src, args.only)
    out_path = Path(args.out) if args.out and args.type != "all" else DATA / json_name
    data = json.loads(out_path.read_text(encoding="utf-8")) if out_path.exists() else {}
    keep = set(data)

    hubs_by_brand, hub_index = {}, {}
    if kind in ("brand", "model"):
        hsrc = Path(args.hubs) if args.hubs else REPO / TYPES["hub"][0]
        if hsrc.exists():
            for parts, t in read_sources(hsrc):
                hs = hub_summary(parts, t, ls)
                hubs_by_brand.setdefault(hs["brand"], []).append(hs)
                hub_index.setdefault(hs["slug"], hs)
        elif kind == "brand":
            print(f"  (no hub zip at {hsrc}: brands without hub cards fall back to their price table)")

    report, made, skipped, built = [], {}, [], []
    for parts, text in files:
        name = "/".join(parts[-2:])
        try:
            if kind == "brand":
                slug, entry, rep = build_brand(parts, text, ls, hubs_by_brand)
            elif kind == "model":
                slug, entry, rep = build_model(parts, text, ls, hub_index)
            else:
                slug, entry, rep = build_hub(parts, text, ls)
        except Exception as e:  # one bad file must not stop the batch
            report.append({"file": name, "slug": "", "status": "ERROR", "notes": [f"{type(e).__name__}: {e}"]})
            continue
        built.append((name, slug, entry, rep))

    # Several files can describe the same page: a shared engine has a hub file under each brand that
    # uses it (EA888: Audi, SEAT, VW). One page per URL: the most complete file wins, the rest are listed.
    best = {}
    for name, slug, entry, rep in built:
        size = len(json.dumps(entry, ensure_ascii=False))
        if slug not in best or size > best[slug][1]:
            best[slug] = (name, size)
    for name, slug, entry, rep in built:
        status = "new"
        if not renderable(kind, entry):
            rep.insert(0, "NOT WRITTEN: nothing to sell on it (no engines / no priced units in the markdown and no "
                          "listings), so the page cannot render; links to it go to the nearest page instead")
            status = "skipped"
        elif best[slug][0] != name:
            rep.insert(0, f"same page as {best[slug][0]} (more complete, used instead): this file was not written")
            status = "duplicate"
        elif slug in keep and not args.overwrite:
            status = "kept existing"
            skipped.append(slug)
        else:
            if slug in keep:
                status = "overwritten"
            data[slug] = entry
            made[slug] = name
        report.append({"file": name, "slug": slug, "status": status, "notes": rep})

    print(f"\n=== {kind} pages: {len(files)} files from {src.name}")
    for r in report:
        flag = "!" if r["status"] == "ERROR" else " "
        print(f" {flag} {r['status']:<13} {r['slug'] or '-':<34} {r['file']}")
        for n in r["notes"]:
            print(f"      - {n}")
    counts = Counter(r["status"] for r in report)
    print(f"  {dict(counts)}")
    if skipped:
        print(f"  kept (already in {json_name}, pass --overwrite to replace): {', '.join(skipped)}")
    if not args.dry_run:
        out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"  wrote {len(made)} entries to {out_path}")
    return report


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("type", choices=["brand", "model", "hub", "all"])
    ap.add_argument("--src")
    ap.add_argument("--hubs")
    ap.add_argument("--out")
    ap.add_argument("--only")
    ap.add_argument("--overwrite", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--report")
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ls = Listings()
    kinds = ["hub", "brand", "model"] if args.type == "all" else [args.type]
    full = {k: run(k, args, ls) for k in kinds}
    if args.report:
        Path(args.report).write_text(json.dumps(full, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\nreport written to {args.report}")


if __name__ == "__main__":
    main()
