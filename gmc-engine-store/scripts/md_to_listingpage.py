#!/usr/bin/env python3
"""
GMC listing extractor.

Reads the listing markdown files (the "GMC-All-Listing-Pages" export, ~6k files,
one folder per brand, kept in listing-md/) and writes one slim JSON per listing:

  src/data/listings/<engineSlug>/<applicationSlug>.json

Shared copy (trust badges, warranty text, button labels ...) is NOT copied into
every file - it lives once in src/data/listingDefaults.json and is merged in by
src/lib/listing.ts. A listing JSON therefore only holds what the markdown says:
title, prices, stock text, fits-list, included / not-included, CTA, metas and the
spec values from the JSON-LD block, plus the 3-image gallery.

The files come in four layouts (bold labels, plain labels, "Price:"/"Image Alt:"
prose labels, and a v3 layout with notes and character counts mixed in). They all
share the same preset labels, so the parser normalises each line first and then
looks labels up case-insensitively.

Gallery rule (from the brief): every listing gets 3 images
  1. car front photo   (brand default pair)
  2. engine-bay photo  (brand default pair)
  3. the actual engine image - the bg-removed engine photo for this engine code,
     else the brand's stock engine image.
Brands that have no default car pair yet get a gallery made of engine images only
(reported by --report so the missing pairs are obvious).

Usage (from gmc-engine-store/):
  Drop markdown files into listing-md/<brand>/  (brand = the same folder names as the
  export: audi, bmw, jaguar, landrover, mercedez, mini, ...), then:

  python -I scripts/md_to_listingpage.py --dry-run            # report only
  python -I scripts/md_to_listingpage.py                      # write the pages
  python -I scripts/md_to_listingpage.py --brand bmw          # one brand
  python -I scripts/md_to_listingpage.py --zip <export.zip>   # read a zip instead
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import sys
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "listing-md"
DATA_OUT = ROOT / "src" / "data" / "listings"
PUBLIC = ROOT / "public"
# Folder of background-removed engine photos (not in git). Order: --engine-images, $GMC_ENGINE_IMAGES,
# <repo root>/engine-images, then an engine-images folder next to the repo.
ENGINE_IMAGES = next(
    (p for p in (ROOT.parent / "engine-images", ROOT.parent.parent / "engine-images") if p.exists()),
    ROOT.parent / "engine-images",
)
ENGINE_OUT = PUBLIC / "images" / "listings" / "engines"
DEFAULT_DIR = PUBLIC / "images" / "listings" / "default"

# folder name in the zip -> brand key / display name
BRANDS = {
    "audi": ("audi", "Audi"),
    "bmw": ("bmw", "BMW"),
    "jaguar": ("jaguar", "Jaguar"),
    "mercedez": ("mercedes", "Mercedes"),
    "mini": ("mini", "Mini"),
    "nissan": ("nissan", "Nissan"),
    "peugeot": ("peugeot", "Peugeot"),
    "renault": ("renault", "Renault"),
    "seat": ("seat", "Seat"),
    "suzuki": ("suzuki", "Suzuki"),
    "toyota": ("toyota", "Toyota"),
    "vauxhall": ("vauxhall", "Vauxhall"),
    "volkswagen": ("volkswagen", "Volkswagen"),
    "volvo": ("volvo", "Volvo"),
    "citroen": ("citroen", "Citroen"),
    "landrover": ("landrover", "Land Rover"),
}

# engine-images folders to search for each brand (the export groups some brands)
ENGINE_FOLDERS = {
    "audi": ["Audi"],
    "bmw": ["bmw"],
    "jaguar": ["Jaguar"],
    "mercedes": ["Mercedes"],
    "mini": ["Seat-to-Mini"],
    "seat": ["Seat-to-Mini"],
    "nissan": ["Mitsubishi-to-RollsRoyce"],
    "peugeot": ["Mitsubishi-to-RollsRoyce"],
    "renault": ["Mitsubishi-to-RollsRoyce"],
    "suzuki": ["Mitsubishi-to-RollsRoyce"],
    "toyota": ["Mitsubishi-to-RollsRoyce"],
    "vauxhall": ["Mitsubishi-to-RollsRoyce"],
    "volvo": ["Mitsubishi-to-RollsRoyce"],
    "volkswagen": ["Volkswagen"],
    "citroen": ["Citroen"],
    "landrover": ["Jaguar"],  # no Land Rover folder in engine-images
}

# ---------------------------------------------------------------- text helpers

SECTION_RE = re.compile(r"<!--\s*SECTION:([a-z\-]+)\s*-->(.*?)<!--\s*/SECTION:\1\s*-->", re.S)
FENCE_RE = re.compile(r"```json\s*(.*?)```", re.S)
POUND_RE = re.compile(r"£\s?[\d,]+(?:\.\d{2})?")


def clean(s):
    """Strip markdown noise from one value."""
    s = s.replace("�", "-").strip()
    s = re.sub(r"\*\*|__|`", "", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)  # [text](url) -> text
    return re.sub(r"\s+", " ", s).strip(" \t*_")


LABEL_ALIASES = {
    "meta_title": ["meta_title", "meta title"],
    "meta_desc": ["meta_desc", "meta description", "meta desc"],
    "canonical": ["canonical"],
    "og_title": ["og_title"],
    "og_desc": ["og_desc"],
    "og_image": ["og_image"],
    "h1": ["h1"],
    "sub": ["sub", "subhead", "subheading"],
    "price": ["price", "price \\(primary[^)]*\\)", "price \\(used[^)]*\\)", "price \\(recon[^)]*\\)"],
    "recon_price": ["recon_price", "price \\(secondary[^)]*\\)", "recon price", "reconditioned price"],
    "stock": ["stock_status", "stock status", "stock"],
    "buy": ["buy_button", "button"],
    "alt": ["img_alt", "image alt"],
    "intro": ["intro"],
    "cta_line": ["cta_line"],
    "cross_link": ["cross_link"],
    "sku": ["sku"],
}


def strip_notes(v):
    """Drop trailing '*(66 chars ...)*' style annotations the generator left in."""
    v = re.sub(r"\s*\*?\(\s*\d+\s*char[^)]*\)\*?\s*$", "", v)
    v = re.sub(r"\s*\*\([^)]*\)\*\s*$", "", v)
    return v


def label_value(text, key):
    """Value of the first `LABEL: value` line, tolerant of bold / bullets / (notes).

    The value may also sit on the following line(s), alone or inside a ``` fence."""
    names = "|".join(LABEL_ALIASES[key])
    m = re.search(
        r"^[ 	>#*_\-]*[*_]*(?:%s)[*_]*[ 	]*:[ 	]*[*_]*[ 	]*(.*?)[ 	]*$" % names,
        text,
        re.I | re.M,
    )
    if not m:
        return ""
    v = strip_notes(m.group(1).strip())
    if not clean(v):
        for line in text[m.end():].splitlines()[:6]:
            t = line.strip()
            if not t or t.startswith("```"):
                continue
            v = strip_notes(t)
            break
    return clean(v)


def money(s):
    m = POUND_RE.search(s or "")
    return re.sub(r"\s", "", m.group(0)) if m else ""


def money_full(p):
    """£1,670 -> £1,670.00 (matches the hand-built listing)."""
    if not p:
        return ""
    return p if "." in p else p + ".00"


def bullets(block):
    out = []
    for line in block.splitlines():
        m = re.match(r"^\s*(?:[-*•]|\d+[.)])\s+(.*\S)\s*$", line)
        if m:
            out.append(clean(m.group(1)))
            continue
        m = re.match(r"^\s*<li[^>]*>(.*?)(?:</li>)?\s*$", line, re.I)  # <ul><li> layout
        if m:
            out.append(clean(re.sub(r"<[^>]+>", "", m.group(1))))
    return out


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


# ------------------------------------------------------------------- the parser


def parse_sections(text):
    """Pair each closing marker with the NEAREST opening of the same name - some
    files mention '<!-- SECTION:x -->' in prose notes before the real block."""
    out = {}
    for m in re.finditer(r"<!--\s*/SECTION:([a-z\-]+)\s*-->", text):
        name = m.group(1)
        opens = list(re.finditer(r"<!--\s*SECTION:%s\s*-->" % re.escape(name), text[: m.start()]))
        if opens:
            out[name] = text[opens[-1].end() : m.start()]
    if "hero" not in out:
        # heading-style markers ("### SECTION:hero") with no closing tag: a section
        # runs to the next marker, a "## 3." heading, or the JSON-LD fence
        marks = list(re.finditer(r"^[ \t#*]*SECTION:[ \t]*([a-z\-]+)[^\n]*$", text, re.M))
        for i, mk in enumerate(marks):
            end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
            tail = re.search(r"^(?:#{1,3}[ \t]*(?:-+[ \t]*)?\d+\.|```json)", text[mk.end() : end], re.M)
            if tail:
                end = mk.end() + tail.start()
            out.setdefault(mk.group(1), text[mk.end() : end])
    return out


def parse_h1(hero, text):
    v = label_value(hero, "h1")
    if v:
        return v
    m = re.search(r"<h1[^>]*>(.*?)</h1>", hero, re.S | re.I)
    if m:
        return clean(re.sub(r"<[^>]+>", "", m.group(1)))
    # bare "## H1" / "### H1" heading, title on the next line (maybe inside a fence)
    m = re.search(r"^[ 	#*]*H1[ 	*:]*$", hero, re.M)
    if m:
        for line in hero[m.end():].splitlines()[:6]:
            t = line.strip()
            if t and not t.startswith("```"):
                return clean(t)
    m = re.search(r"^[ 	#*]*H1[ 	]*[:—–-]*[ 	]*\**(.+?)\**[ 	]*$", hero, re.M)
    if m:
        return clean(m.group(1))
    # bare "## Title" heading
    m = re.search(r"^#{1,3}[ 	]+(?!H1)(.+?)[ 	]*$", hero, re.M)
    if m:
        return clean(m.group(1))
    return ""


def parse_sub(hero, title):
    v = label_value(hero, "sub")
    if v:
        return v
    m = re.search(r'<p[^>]*class="sub"[^>]*>(.*?)</p>', hero, re.S | re.I)
    if m:
        return clean(re.sub(r"<[^>]+>", "", m.group(1)))
    # plain sentence under the heading (prose layout)
    for line in hero.splitlines():
        c = clean(line)
        if not c or c.startswith(("#", "<!--", "<h1", "(", "*(")):
            continue
        if re.match(r"^(price|recon(?!ditioned)|stock|button|image|h1|buy|\[|\u00a3)", c, re.I):
            continue
        if c == title:
            continue
        if len(c) > 40:
            return c
    return ""


def parse_fits(sec):
    intro = label_value(sec, "intro")
    items = bullets(sec)
    if not items:
        # "LIST:" followed by plain lines, one vehicle per line
        m = re.search(r"^[ 	*]*(?:COMPATIBLE MODELS )?LIST[ 	*]*:?[ 	*]*(.*)$", sec, re.M | re.I)
        if m:
            if clean(m.group(1)):  # "LIST: item" on one line
                items.append(clean(m.group(1)))
            for line in sec[m.end():].splitlines():
                c = clean(line)
                if c.startswith(("<!--", "#")):
                    break
                if c and not c.startswith("("):
                    items.append(c)
    if not intro:
        for line in sec.splitlines():
            c = clean(line)
            if not c or c.startswith(("#", "<!--", "-", "LIST", "(", "*(")):
                continue
            if re.match(r"^(h2|intro|list)\b", c, re.I) and len(c) < 30:
                continue
            if len(c) > 30:
                intro = c
                break
    return intro, items


def parse_included(sec):
    """Split the bullets at the 'Not included' marker."""
    parts = re.split(r"^[ \t#*]*not[ \t]+included\**[ \t]*:?[ \t]*\**[ \t]*$", sec, flags=re.I | re.M)
    inc = bullets(parts[0])
    exc = bullets(parts[1]) if len(parts) > 1 else []
    return inc, exc


def parse_cta(sec):
    line = label_value(sec, "cta_line")
    if not line:
        for ln in sec.splitlines():
            c = clean(ln)
            if c and not re.match(r"^(button|buy_button|cross_link|←|<!--|\(|\*\()", c, re.I) and len(c) > 25:
                line = c
                break
    cross = label_value(sec, "cross_link")
    if not cross:
        m = re.search(r"←[^\n\]]*", sec)
        cross = clean(m.group(0)) if m else ""
    return line, cross


def walk_products(o):
    if isinstance(o, dict):
        if o.get("@type") == "Product":
            yield o
        for v in o.values():
            yield from walk_products(v)
    elif isinstance(o, list):
        for v in o:
            yield from walk_products(v)


def schema_from(blocks):
    """Product block(s) -> dict(sku, props, conditions, prices)."""
    out = {"sku": "", "props": {}, "conditions": [], "prices": []}
    for b in walk_products(blocks):
        out["sku"] = out["sku"] or b.get("sku", "")
        for p in b.get("additionalProperty", []) or []:
            if isinstance(p, dict) and p.get("name"):
                out["props"].setdefault(p["name"], str(p.get("value", "")))
        offers = b.get("offers", [])
        for o in offers if isinstance(offers, list) else [offers]:
            if isinstance(o, dict):
                out["conditions"].append(str(o.get("itemCondition", "")).split("/")[-1])
                if o.get("price"):
                    out["prices"].append(str(o["price"]))
    return out


def parse_schema(text):
    blocks = []
    for raw in FENCE_RE.findall(text):
        try:
            blocks.append(json.loads(raw))
        except Exception:
            continue
    return schema_from(blocks)


def norm_keys(o):
    """lower-case + underscores so 'fits-these-vehicles' == 'FITS_THESE_VEHICLES'."""
    if isinstance(o, dict):
        return {re.sub(r"[^a-z0-9]+", "_", k.lower()).strip("_"): norm_keys(v) for k, v in o.items()}
    return o


def as_list(v):
    if isinstance(v, list):
        return [clean(str(x)) for x in v if clean(str(x))]
    return [clean(str(v))] if v and clean(str(v)) else []


def parse_json_layout(text, folder):
    """Layout where the whole file is one ```json object (metas / content / json_ld)."""
    m = re.search(r"```json\s*(.*?)```", text, re.S)
    body = m.group(1) if m else (text.strip() if text.lstrip().startswith("{") else "")  # or the file IS the object
    if '"hero"' not in body:
        return None
    try:
        raw = json.loads(body)
    except Exception:
        return None
    j = norm_keys(raw)
    metas = j.get("metas", {})
    content = j.get("content") or j.get("page_content") or {}
    hero = content.get("hero", {})
    fits = content.get("fits_these_vehicles", {})
    inc = content.get("included", {})
    cta = content.get("cta", {})
    d = {
        "folder": folder,
        "title": clean(str(hero.get("h1", ""))),
        "sub": clean(str(hero.get("sub", ""))),
        "price_used": money(str(hero.get("price", ""))),
        "price_recon": money(str(hero.get("recon_price", ""))),
        "stock": clean(str(hero.get("stock_status", ""))),
        "alt": clean(str(hero.get("img_alt", ""))),
        "canonical": clean(str(metas.get("canonical", ""))),
        "meta_title": clean(str(metas.get("meta_title", ""))),
        "meta_desc": clean(str(metas.get("meta_desc", ""))),
        "og_title": clean(str(metas.get("og_title", ""))),
        "og_desc": clean(str(metas.get("og_desc", ""))),
        "sku": "",
        "schema": schema_from(raw),
        "raw": text,
        "fits_intro": clean(str(fits.get("intro", ""))),
        "fits": as_list(fits.get("list", [])),
        "included": as_list(inc.get("included", [])),
        "excluded": as_list(inc.get("not_included", [])),
        "cta_line": clean(str(cta.get("cta_line", ""))),
        "cross_link": clean(str(cta.get("cross_link", ""))),
    }
    return d


STOCK_RE = re.compile(r"^[ \t>*_]*((?:in stock|prepared to order|made to order|out of stock|limited stock)[^\n*]*)", re.I | re.M)


def fallback_hero(d, hero):
    """Layouts with no PRICE:/STOCK_STATUS: labels - bare '**£4,515** - Used unit' lines."""
    if not d["stock"]:
        m = STOCK_RE.search(hero)
        d["stock"] = clean(m.group(1)) if m else ""
    if not d["alt"]:
        m = re.search(r"^[ \t>*_]*(?:IMG_ALT|Image alt)[*_]*[ \t]*:[*_]*[ \t]*(.+?)[ \t]*$", hero, re.I | re.M)
        d["alt"] = clean(m.group(1)) if m else ""
    if d["price_used"] or d["price_recon"]:
        return
    seen = []  # (amount, is_recon) in reading order
    for line in hero.splitlines():
        for amt in POUND_RE.findall(line):
            tail = line.split(amt, 1)[1][:40].lower()
            seen.append((re.sub(r"\s", "", amt), "recon" in tail))
    if not seen:
        return
    first_is_recon = seen[0][1] or ("recon" in d["title"].lower() and len(seen) == 1)
    if first_is_recon:
        d["price_recon"] = seen[0][0]
    else:
        d["price_used"] = seen[0][0]
    for amt, is_recon in seen[1:]:
        if is_recon and not d["price_recon"]:
            d["price_recon"] = amt
        elif not is_recon and not d["price_used"] and not first_is_recon:
            d["price_used"] = amt


def parse_listing(text, folder):
    """-> dict of raw extracted fields (empty strings when the file has none)."""
    text = text.replace(chr(13) + chr(10), chr(10)).replace(chr(13), chr(10))
    if text.lstrip().startswith(("```json", "{")):
        d = parse_json_layout(text, folder)
        if d:
            return d
    secs = parse_sections(text)
    hero = secs.get("hero", "")
    title = parse_h1(hero, text)
    d = {
        "folder": folder,
        "title": title,
        "sub": parse_sub(hero, title),
        "price_used": money(label_value(hero, "price")),
        "price_recon": money(label_value(hero, "recon_price")),
        "stock": label_value(hero, "stock"),
        "alt": label_value(hero, "alt"),
        "canonical": label_value(text, "canonical"),
        "meta_title": label_value(text, "meta_title"),
        "meta_desc": label_value(text, "meta_desc"),
        "og_title": label_value(text, "og_title"),
        "og_desc": label_value(text, "og_desc"),
        "sku": label_value(text, "sku"),
        "schema": parse_schema(text),
        "raw": text,
    }
    fallback_hero(d, hero)
    d["fits_intro"], d["fits"] = parse_fits(secs.get("fits-these-vehicles", ""))
    d["included"], d["excluded"] = parse_included(secs.get("included", ""))
    d["cta_line"], d["cross_link"] = parse_cta(secs.get("cta", ""))
    return d


# ---------------------------------------------------------- build the page JSON

CANON_RE = re.compile(r"/engines/([^/\s]+)/([^/\s]+)")


def slugs_from(d, filename):
    m = CANON_RE.search(d["canonical"] or "") or CANON_RE.search(d["raw"])
    if m:
        return m.group(1).lower(), m.group(2).lower().strip("/")
    return "", ""


def condition_of(d):
    t = (d["title"] + " " + d["meta_title"]).lower()
    conds = [c.lower() for c in d["schema"]["conditions"]]
    if "recon" in t or (conds and all("refurb" in c for c in conds)):
        return "recon"
    if "used" in t or any("used" in c for c in conds):
        return "used"
    return "recon" if d["price_recon"] and not d["price_used"] else "used"


def display_engine(engine_slug, d):
    """M43 / EA189 / B47 ... from the Engine Code property, else the slug."""
    code = d["schema"]["props"].get("Engine Code", "")
    code = re.sub(r"^(bmw|audi|mercedes|jaguar)[\s-]+", "", code, flags=re.I).strip()
    return (code or engine_slug).upper()


def spec_cards(d):
    p = d["schema"]["props"]
    want = [
        ("cog", "Engine Code", "Engine Code"),
        ("calendar", "Production Years", "Production Years"),
        ("car", "Chassis Codes Covered", "Compatible"),
        ("gauge", "Power Output", "Max Output"),
        ("fuel", "Fuel Type", "Fuel Type"),
        ("config", "Engine Variant", "Variant"),
    ]
    out = []
    for icon, key, label in want:
        v = p.get(key, "")
        if v:
            out.append({"icon": icon, "value": v, "label": label})
    return out


def build_options(d, cond):
    used, recon = d["price_used"], d["price_recon"]
    if cond == "recon":
        recon = recon or used
        used = ""
    opts = []
    if used:
        opts.append({"id": "used", "label": "Used — " + used, "note": "12-month warranty", "price": money_full(used)})
    if recon:
        opts.append({"id": "recon", "label": "Reconditioned — " + recon, "note": "12-month warranty", "price": money_full(recon)})
    if opts:
        opts[0]["default"] = True
    return opts


# ------------------------------------------------------------------ the images


class EngineImages:
    """Finds the bg-removed engine photo for an engine code / brand."""

    def __init__(self):
        self.files = defaultdict(list)  # folder -> [Path]
        if ENGINE_IMAGES.exists():
            for p in ENGINE_IMAGES.rglob("*.webp"):
                self.files[p.parent.name].append(p)
        self.stock_top = {p.name: p for p in ENGINE_IMAGES.glob("*.webp")} if ENGINE_IMAGES.exists() else {}

    def _score(self, name, code):
        """Higher = better match. Wants the code as a whole token plus 'engine'."""
        n = name.lower()
        if not re.search(r"(?<![a-z0-9])%s(?![a-z0-9])" % re.escape(code), n):
            return 0
        if "-vehicle" in n or "generation" in n or "model-hero" in n:
            return 1
        if n.endswith("-engine-hero.webp"):
            return 5
        if n.endswith("-engine.webp"):
            return 4
        return 2

    def pool(self, brand):
        """Candidate files for a brand. Land Rover shares the Jaguar folder - take only its own."""
        for folder in ENGINE_FOLDERS.get(brand, []):
            for p in self.files.get(folder, []):
                if brand == "landrover" and not p.name.lower().startswith("land-rover-"):
                    continue
                yield p

    def for_engine(self, brand, code):
        code = code.lower()
        best, best_s = None, 0
        for p in self.pool(brand):
            s = self._score(p.name, code)
            if s > best_s or (s == best_s and s and best and len(p.name) < len(best.name)):
                best, best_s = p, s
        return best if best_s >= 4 else None

    def brand_stock(self, brand):
        """Brand-level stock engine photo, only from explicit generic images:
        '<brand>-<brand>-engine-hero' (the garage sites' brand default), the top-level
        '<brand>-engine-1/2/3' set, or Land Rover's JLR compatibility hero. Anything else
        would be a model-specific engine (a Renault 19, an M-car ...) on the wrong listings,
        so the caller falls back to the neutral placeholder instead."""
        alias = {"volkswagen": "vw", "landrover": "land-rover", "mercedes": "mercedes-benz"}.get(brand, brand)
        wanted = {
            f"{brand}-{brand}-engine-hero.webp",
            f"{brand}-{alias}-engine-hero.webp",
            "land-rover-jaguar-land-rover-engine-compatibility-engine-hero.webp" if brand == "landrover" else "",
        } - {""}
        for p in self.pool(brand):
            if p.name.lower() in wanted:
                return p
        for name in (f"{brand}-engine-1.webp", f"{brand}-engine-2.webp", f"{brand}-engine-3.webp"):
            if name in self.stock_top:
                return self.stock_top[name]
        return None


def default_pair(brand, seed):
    """Pick one of the brand's default [front, bay] pairs, stable per listing."""
    pairs = sorted({p.name.rsplit("-", 2)[1] for p in DEFAULT_DIR.glob(f"{brand}-*-front.webp")})
    if not pairs:
        return None
    n = pairs[int(hashlib.md5(seed.encode()).hexdigest(), 16) % len(pairs)]
    return (f"/images/listings/default/{brand}-{n}-front.webp", f"/images/listings/default/{brand}-{n}-bay.webp")


def build_gallery(brand, engine_slug, seed, imgs, copied, stats):
    pair = default_pair(brand, seed)
    exact = imgs.for_engine(brand, engine_slug)
    engine = exact or imgs.brand_stock(brand)
    stats["engine_exact" if exact else ("engine_stock" if engine else "engine_generic")] += 1
    gallery = []
    if pair:
        gallery.append({"src": pair[0], "kind": "photo"})
        gallery.append({"src": pair[1], "kind": "photo"})
    else:
        stats["no_pair_" + brand] += 1
    if engine:
        copied[engine.name] = engine
        gallery.append({"src": f"/images/listings/engines/{engine.name}", "kind": "engine"})
    else:
        # neutral placeholder cut-out that already ships with the listing template
        gallery.append({"src": "/images/listings/engine.png", "thumb": "/images/listings/engine_trim.png", "kind": "engine"})
    return gallery


# ------------------------------------------------------------------------- main


def build_page(d, brand_key, brand_name, filename, imgs, copied, stats):
    engine_slug, app_slug = slugs_from(d, filename)
    if not engine_slug or not app_slug:
        return None, "no canonical slugs"
    if not d["title"]:
        return None, "no H1"
    cond = condition_of(d)
    options = build_options(d, cond)
    if not options:
        # the price only appears in the meta description / schema
        price = money(d["meta_desc"]) or (money("£" + d["schema"]["prices"][0]) if d["schema"]["prices"] else "")
        if price:
            d["price_recon" if cond == "recon" else "price_used"] = price
            options = build_options(d, cond)
    if not options:
        return None, "no price"
    code = display_engine(engine_slug, d)
    sku = d["sku"] or d["schema"]["sku"] or f"{code}-{cond.upper()}-{app_slug}".upper()
    page = {
        "brand": brand_key,
        "brandName": brand_name,
        "engineSlug": engine_slug,
        "applicationSlug": app_slug,
        "engineCode": code,
        "condition": cond,
        "seo": {
            "title": d["meta_title"] or d["title"],
            "description": d["meta_desc"],
            "canonical": d["canonical"],
        },
        "hero": {
            "title": d["title"],
            "subtitle": d["sub"],
            "sku": "SKU: " + sku,
            "options": options,
            "stockLabel": d["stock"] or "In stock — ready to ship",
            "imgAlt": d["alt"] or d["title"],
            "specCards": spec_cards(d),
            "gallery": build_gallery(brand_key, engine_slug, engine_slug + "/" + app_slug, imgs, copied, stats),
        },
        "fits": {"intro": d["fits_intro"], "list": d["fits"]},
        "included": {"included": d["included"], "excluded": d["excluded"]},
        "cta": {"line": d["cta_line"], "crossLink": d["cross_link"]},
    }
    return page, ""


def diagnose(text, why):
    """One line saying what is wrong with a file that cannot become a page."""
    t = text.strip()
    first = re.sub(r"\s+", " ", re.sub(r"[*#`>|]+", " ", t[:260])).strip()
    if why == "no price":
        if "REFERENCE ONLY" in text:
            return "Source row is marked 'REFERENCE ONLY - no pricing': both Used and Recon prices are blank."
        return "No Used or Recon price anywhere in the file."
    if re.search(r"cannot generate|can't|STOP", t[:400], re.I):
        return "Not a listing: the generator stopped and wrote a refusal note instead. Starts: " + first[:150]
    return "No H1 title found. Starts: " + first[:150]


def iter_sources(args):
    """Yield (brand folder, file name, text) from --zip, else from the listing-md folder."""
    if args.zip:
        z = zipfile.ZipFile(args.zip)
        for name in sorted(z.namelist()):
            parts = name.split("/")
            if name.startswith("__MACOSX") or not name.endswith(".md") or len(parts) < 3:
                continue
            if args.brand and parts[1].lower() != args.brand.lower():
                continue
            yield parts[1], parts[-1], z.read(name).decode("utf-8", "replace")
        return
    src = Path(args.src)
    if not src.is_dir():
        sys.exit(f"source folder not found: {src}")
    for f in sorted(src.rglob("*.md")):
        rel = f.relative_to(src).parts
        if "__MACOSX" in rel:
            continue
        if len(rel) < 2:  # a loose .md in the root has no brand folder
            print(f"  ignored (put it inside a brand folder, e.g. {src.name}/bmw/): {f.name}")
            continue
        if args.brand and rel[0].lower() != args.brand.lower():
            continue
        yield rel[0], f.name, f.read_text(encoding="utf-8", errors="replace")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=str(SOURCE_DIR), help="folder of <brand>/*.md files (default: listing-md/)")
    ap.add_argument("--zip", help="read an export zip instead of the folder")
    ap.add_argument("--brand")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--report", help="write every source problem (skipped files, duplicates, content gaps) to this JSON file")
    ap.add_argument("--engine-images", help="folder of engine photos (default: $GMC_ENGINE_IMAGES or <repo root>/engine-images)")
    args = ap.parse_args()
    global ENGINE_IMAGES
    override = args.engine_images or os.environ.get("GMC_ENGINE_IMAGES")
    if override:
        ENGINE_IMAGES = Path(override)

    imgs = EngineImages()
    copied, stats = {}, Counter()
    skipped = defaultdict(list)
    diag = {}  # source label -> what is wrong with a skipped file
    built = []  # (source label, page)
    n = 0
    for folder, filename, text in iter_sources(args):
        if args.limit and n >= args.limit:
            break
        n += 1
        key = BRANDS.get(folder.lower())
        if not key:
            skipped["unknown brand folder"].append(f"{folder}/{filename}")
            continue
        d = parse_listing(text, folder)
        page, why = build_page(d, key[0], key[1], filename, imgs, copied, stats)
        if not page:
            skipped[why].append(f"{folder}/{filename}")
            diag[f"{folder}/{filename}"] = diagnose(text, why)
            continue
        built.append((f"{folder}/{filename}", page))

    # Slug collisions. Two files can carry the SAME canonical slug yet be a used and a
    # reconditioned listing (the generator reused the slug): give the recon one a
    # '-recon' suffix. Same slug AND same content is a plain duplicate file: drop it.
    pages, dup, renamed, variants = {}, [], [], []
    groups = defaultdict(list)
    for label, page in built:
        groups[(page["engineSlug"], page["applicationSlug"])].append((label, page))
    for (eng, app), items in groups.items():
        if len(items) > 1:
            for label, page in items:
                if page["condition"] == "recon" and not app.endswith("-recon"):
                    page["applicationSlug"] = app + "-recon"
                    page["seo"]["canonical"] = page["seo"]["canonical"].replace(app, app + "-recon")
                    renamed.append(label)
        for label, page in items:
            k = (page["engineSlug"], page["applicationSlug"])
            sig = (page["hero"]["title"], tuple(o["price"] for o in page["hero"]["options"]), tuple(page["fits"]["list"]))
            if k in pages and pages[k][1] == sig:
                dup.append((label, pages[k][0]))
                continue
            while k in pages:  # genuinely different content on the same slug
                variants.append((label, pages[k][0]))
                k = (k[0], k[1] + "-2")
                page["applicationSlug"] = k[1]
            pages[k] = (label, sig, page)
    pages = {k: v[2] for k, v in pages.items()}

    print(f"files read: {n}   pages built: {len(pages)}   recon slugs suffixed: {len(renamed)}   identical duplicates dropped: {len(dup)}")
    for why, lst in skipped.items():
        print(f"  skipped - {why}: {len(lst)}  e.g. {lst[:2]}")
    print("  engine image tiers:", {k: v for k, v in stats.items() if k.startswith("engine")})
    miss = {k[8:]: v for k, v in stats.items() if k.startswith("no_pair_")}
    print("  brands with no default car pair (gallery = engine only):", miss)
    for field in ("subtitle", "imgAlt"):
        print(f"  empty hero.{field}:", sum(1 for p in pages.values() if not p["hero"][field]))
    print("  empty fits list:", sum(1 for p in pages.values() if not p["fits"]["list"]),
          "  empty included:", sum(1 for p in pages.values() if not p["included"]["included"]),
          "  empty cta:", sum(1 for p in pages.values() if not p["cta"]["line"]),
          "  no spec cards:", sum(1 for p in pages.values() if not p["hero"]["specCards"]),
          "  both prices:", sum(1 for p in pages.values() if len(p["hero"]["options"]) == 2))
    for a, b in dup[:3]:
        print("  dup e.g.", a, "==", b)

    if args.report:
        gaps = defaultdict(list)
        for label, page in built:
            if not page["fits"]["list"]:
                gaps["empty fits list"].append(label)
            if not page["included"]["included"]:
                gaps["empty included list"].append(label)
            if not page["hero"]["subtitle"]:
                gaps["no subtitle"].append(label)
            if not page["hero"]["specCards"]:
                gaps["no spec data"].append(label)
        json.dump(
            {
                "files": n,
                "built": len(pages),
                "skipped": {k: [{"file": f, "detail": diag.get(f, "")} for f in v] for k, v in skipped.items()},
                "duplicates": [{"file": a, "same_as": b} for a, b in dup],
                "same_slug_different_content": [{"file": a, "clashes_with": b} for a, b in variants],
                "recon_reusing_used_slug": renamed,
                "gaps": gaps,
            },
            open(args.report, "w", encoding="utf-8"),
            ensure_ascii=False,
            indent=1,
        )
        print("report written to", args.report)

    if args.dry_run:
        return
    DATA_OUT.mkdir(parents=True, exist_ok=True)
    for (eng, app), page in pages.items():
        out = DATA_OUT / eng
        out.mkdir(exist_ok=True)
        (out / f"{app}.json").write_text(json.dumps(page, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    ENGINE_OUT.mkdir(parents=True, exist_ok=True)
    for name, src in copied.items():
        shutil.copyfile(src, ENGINE_OUT / name)
    print(f"wrote {len(pages)} JSON files to {DATA_OUT} and copied {len(copied)} engine images")


if __name__ == "__main__":
    main()
