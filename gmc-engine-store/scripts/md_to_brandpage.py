#!/usr/bin/env python3
"""
Convert a GMC brand-page Markdown mockup (e.g. MOCKUP-02-brand-page-mercedes.md)
into an entry inside src/data/brandPage.json.

Usage:
    python scripts/md_to_brandpage.py "path/to/MOCKUP-XX-brand-page-<brand>.md"
    python scripts/md_to_brandpage.py file.md --slug bmw-engines

What it does
------------
The Markdown contains the *content* (titles, prices, specs, FAQs, table...).
This script parses those sections and writes them into brandPage.json in the exact
shape the React components expect. The page then appears at /<slug> with no code
changes, because src/app/[brandSlug]/page.tsx renders whatever is in the JSON.

What the Markdown does NOT contain (filled with sensible defaults; swap later in the
JSON or drop real files into /public/images):
  * engine / car / model images  -> DEFAULT_* placeholders below
  * hero-card PS / Nm torque figures -> left blank
  * per-family "From £" prices (only 8 are in the price table) -> cross-referenced
    from the price guide where the code matches, else "".
Everything the script guesses is printed as a TODO at the end.
"""

import json
import re
import sys
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "src" / "data" / "brandPage.json"

# ---- defaults for fields the Markdown has no data for -----------------------
DEFAULT_ENGINE_IMG = "/images/engines/mercedes-om642-diesel-engine.png"
DEFAULT_CAR_IMG = "/images/brands/Brandpage.png"
DEFAULT_LOGO = "/images/brands/logo-mercedes.png"
DEFAULT_WIREFRAME = "/images/engines/pop-om642.png"

SYMBOL_ICON = {"✓": "shield-check", "⊙": "shield", "▣": "truck", "↺": "returns"}
REG = {"placeholder": "ENTER REG NUMBER", "buttonText": "Find my engine",
       "countryFlag": "GB", "helpText": "How registration lookup works"}


# ---- tiny markdown helpers --------------------------------------------------
def split_sections(md):
    """Return list of {level, title, body} split on # / ## / ### headings."""
    out, cur = [], None
    for line in md.splitlines():
        m = re.match(r"^(#{1,3})\s+(.*)", line)
        if m:
            if cur:
                out.append(cur)
            cur = {"level": len(m.group(1)), "title": m.group(2).strip(), "lines": []}
        elif cur is not None:
            cur["lines"].append(line)
    if cur:
        out.append(cur)
    for s in out:
        s["body"] = "\n".join(s["lines"]).strip()
    return out


def bullets(body):
    """Lines that start with '- '."""
    return [re.sub(r"^\s*-\s+", "", l).strip() for l in body.splitlines()
            if re.match(r"^\s*-\s+", l)]


def paragraphs(body):
    """Non-list, non-empty text blocks."""
    paras, buf = [], []
    for l in body.splitlines():
        if re.match(r"^\s*[-|#]", l) or "`[" in l or l.strip().startswith("**Q"):
            continue
        if l.strip():
            buf.append(l.strip())
        elif buf:
            paras.append(" ".join(buf)); buf = []
    if buf:
        paras.append(" ".join(buf))
    return paras


def strip_md(s):
    return re.sub(r"\*\*|\*|`", "", s).strip()


def rel_url(u):
    """Turn 'https://example.com/mercedes-benz-engines/a-class/' into '/mercedes-benz-engines/a-class'."""
    u = re.sub(r"^https?://[^/]+", "", strip_md(u).strip())
    return u.rstrip("/") or "/"


def price_of(text):
    m = re.search(r"£[\d,]+", text)
    return m.group(0) if m else ""


# ---- per-section parsers ----------------------------------------------------
def find(sections, needle):
    needle = needle.lower()
    for s in sections:
        if needle in s["title"].lower():
            return s
    return None


def parse(md, slug_override=None):
    sec = split_sections(md)
    todos = []

    # --- SEO + slug (from the "# PAGE:" section) ---
    page = next((s for s in sec if s["title"].startswith("PAGE:")), None)
    seo_title = page["title"][5:].strip() if page else ""
    meta = re.search(r"\*\*Meta description:\*\*\s*(.+)", page["body"]) if page else None
    canon = re.search(r"\*\*Canonical:\*\*\s*\S*?/([a-z0-9-]+)/?", page["body"]) if page else None
    slug = slug_override or (canon.group(1) if canon else "brand-engines")

    # --- HERO (the level-1 heading that is the brand title) ---
    h1 = next((s for s in sec if s["level"] == 1
               and not s["title"].startswith("PAGE:")
               and not s["title"].startswith("[")), None)
    name, title, highlight = "", "Engines for Sale", "Used & Reconditioned"
    description = ""
    trust = []
    if h1:
        raw = strip_md(h1["title"])
        highlight = raw.split("—")[-1].strip() if "—" in raw else highlight
        left = raw.split("—")[0].strip()
        # "Mercedes-Benz Engines for Sale" -> name "Mercedes-Benz", title "Engines for Sale"
        mm = re.match(r"(.*?)\s+(Engines?.*)$", left)
        if mm:
            name, title = mm.group(1).strip(), mm.group(2).strip()
        else:
            name = left
        paras = paragraphs(h1["body"])
        description = paras[0] if paras else ""
        for b in bullets(h1["body"]):
            parts = [p.strip() for p in b.split("|")]
            if len(parts) >= 3:
                trust.append({"icon": SYMBOL_ICON.get(parts[0], "shield"),
                              "title": strip_md(parts[1]), "subtitle": strip_md(parts[2])})

    # --- FEATURED ENGINES ---
    featured = []
    fs = find(sec, "Featured")
    fsub = ""
    if fs:
        fsub = (paragraphs(fs["body"]) or [""])[0]
        for i, b in enumerate(bullets(fs["body"])):
            p = [x.strip() for x in b.split("|")]
            if len(p) < 4:
                continue
            cond = p[1]
            titl = strip_md(p[2])
            t, _, sub = titl.partition("—")
            featured.append({
                "id": f"{slug}-feat-{i}", "condition": cond,
                "title": (t.strip() + " —") if sub else t.strip(),
                "subtitle": sub.strip(), "price": price_of(p[3]),
                "stockLabel": strip_md(p[4]) if len(p) > 4 else "In stock — ready to ship",
                "image": DEFAULT_ENGINE_IMG, "buyHref": f"/engines/{slug}-{i}"})

    # --- SHOP BY MODEL ---
    models = []
    ms = find(sec, "by Model")
    msub = ""
    view_all = "View all models"
    if ms:
        msub = (paragraphs(ms["body"]) or [""])[0]
        for b in bullets(ms["body"]):
            label, _, url = b.partition("→")
            label = strip_md(label)
            parts = [x.strip() for x in label.split("|")]
            nm = parts[0]
            chassis, fams = "", ""
            if len(parts) > 1:
                cf = [x.strip() for x in parts[1].split("·")]
                chassis = cf[0] if cf else ""
                fams = cf[1] if len(cf) > 1 else ""
            models.append({"name": nm, "chassis": chassis, "families": fams,
                           "image": DEFAULT_CAR_IMG, "href": rel_url(url)})

    # --- ENGINE FAMILIES ---
    families = []
    es = find(sec, "Engine Families")
    fam_desc = ""
    if es:
        fam_desc = (paragraphs(es["body"]) or [""])[0]
        for b in bullets(es["body"]):
            label, _, url = b.partition("→")
            parts = [x.strip() for x in strip_md(label).split("|")]
            code = parts[0]
            spec = parts[1] if len(parts) > 1 else ""
            families.append({"code": code, "spec": spec, "priceFrom": "",
                             "href": rel_url(url)})

    # --- PRICE GUIDE (markdown table) ---
    price = {"title": "", "description": "", "columns": [], "rows": [], "note": "",
             "image": DEFAULT_ENGINE_IMG}
    ps = find(sec, "Price Guide")
    if ps:
        price["title"] = strip_md(ps["title"])
        pr = paragraphs(ps["body"])
        price["description"] = pr[0] if pr else ""
        price["note"] = pr[-1] if len(pr) > 1 else ""
        rows = [l for l in ps["body"].splitlines() if l.strip().startswith("|")]
        rows = [r for r in rows if not re.match(r"^\|[\s|:-]+\|$", r.strip())]
        if rows:
            header = [c.strip() for c in rows[0].strip("|").split("|")]
            price["columns"] = header
            for r in rows[1:]:
                cells = [c.strip() for c in r.strip("|").split("|")]
                if len(cells) >= 4:
                    price["rows"].append({"family": cells[0], "used": cells[1],
                                          "recon": cells[2], "note": cells[3]})

    # cross-reference family "From" price from the price table (used-from column)
    for fam in families:
        base = fam["code"].split()[0].split("/")[0].strip()
        for row in price["rows"]:
            if row["family"].split()[0].startswith(base):
                fam["priceFrom"] = row["used"]
                break

    # --- USED vs RECONDITIONED ---
    uvr = {"title": "", "options": []}
    us = find(sec, "Used or Reconditioned")
    if us:
        uvr["title"] = strip_md(us["title"])
        for b in bullets(us["body"]):
            head, _, rest = b.partition("|")
            uvr["options"].append({
                "icon": "shield-check" if "recond" in head.lower() else "car",
                "title": strip_md(head),
                "paragraphs": [x.strip() for x in re.split(r"(?<=\.)\s{2,}|\. ", strip_md(rest)) if x.strip()][:1]
                or [strip_md(rest)]})
        # keep full text as one paragraph if the split was too aggressive
        for b, opt in zip(bullets(us["body"]), uvr["options"]):
            opt["paragraphs"] = [strip_md(b.partition("|")[2]).strip()]

    # --- ABOUT ---
    about = {"title": "", "logo": DEFAULT_LOGO, "carImage": DEFAULT_CAR_IMG, "paragraphs": []}
    ab = find(sec, "About ")
    if ab:
        about["title"] = strip_md(ab["title"])
        about["paragraphs"] = paragraphs(ab["body"])

    # --- WARRANTY & DELIVERY ---
    wd = {"title": "", "items": []}
    ws = find(sec, "Warranty & Delivery")
    if ws:
        wd["title"] = strip_md(ws["title"])
        for b in bullets(ws["body"]):
            head, _, rest = b.partition("|")
            wd["items"].append({"icon": "truck" if "deliver" in head.lower() else "shield-check",
                                "title": strip_md(head), "paragraphs": [strip_md(rest).strip()]})

    # --- FAQS (Q:/A: pairs) ---
    faqs = {"title": "", "subtitle": "Answers to the most common questions about buying from GMC.",
            "items": [], "whyBuy": {"title": "Why buy from GMC?", "items": [
                {"icon": "shield", "title": "Verified Fitment", "description": "Every engine is verified by registration so you get the exact engine that fits."},
                {"icon": "shield-check", "title": "12-Month Warranty", "description": "Reconditioned engines include 12-month, unlimited-mileage warranty."},
                {"icon": "truck", "title": "UK Nationwide Delivery", "description": "Fast & secure kerbside pallet delivery, typically 2–4 working days."},
                {"icon": "lock", "title": "Secure Checkout", "description": "Safe online payments with encrypted checkout and fraud protection."}]}}
    qs = find(sec, "FAQ")
    if qs:
        faqs["title"] = strip_md(qs["title"])
        pairs = re.findall(r"\*\*Q:\s*(.+?)\*\*\s*\n+A:\s*(.+)", qs["body"])
        for q, a in pairs:
            faqs["items"].append({"q": q.strip(), "a": a.strip()})

    # --- CTA (the "Find ..." section near the end) ---
    cta = {"title": "Find the right engine", "highlight": "in under a minute",
           "description": "", "placeholder": REG["placeholder"], "buttonText": REG["buttonText"],
           "countryFlag": "GB", "carImage": DEFAULT_CAR_IMG,
           "badges": [{"icon": "check-circle", "text": "Verified by Registration"},
                      {"icon": "check-circle", "text": "UK Delivery"},
                      {"icon": "check-circle", "text": "Warranty Included"}]}
    cs = find(sec, "Find the right") or find(sec, "under a minute")
    if cs:
        raw = strip_md(cs["title"])
        cta["title"], cta["highlight"] = (raw.rsplit(" ", 3)[0], " ".join(raw.rsplit(" ", 3)[1:])) \
            if len(raw.split()) > 4 else (raw, cta["highlight"])
        pr = paragraphs(cs["body"])
        cta["description"] = pr[0] if pr else ""

    # --- assemble ---
    entry = {
        "slug": slug,
        "seo": {"title": seo_title, "description": meta.group(1).strip() if meta else ""},
        "hero": {"brand": name, "name": name, "logo": DEFAULT_LOGO, "title": title,
                 "highlight": highlight, "description": description, "carImage": DEFAULT_CAR_IMG,
                 "regCheck": REG, "trustBadges": trust or [
                     {"icon": "shield-check", "title": "12-Month Warranty", "subtitle": "Unlimited mileage on recon"}],
                 "cards": [  # built from the first engine families — PS/Nm need manual figures
                     {"code": f["code"], "name": f["spec"].split("·")[0].strip(),
                      "ps": "", "nm": "", "years": (re.search(r"\d{4}[–-][\w]+", f["spec"]) or [""])[0]
                      if re.search(r"\d{4}", f["spec"]) else "",
                      "image": DEFAULT_ENGINE_IMG, "href": f["href"]}
                     for f in families[:6]]},
        "howItWorks": {"title": "How Buying Works", "steps": [
            {"number": 1, "icon": "search", "title": "Verify fit by reg", "description": "Enter your registration or browse to your model — we confirm the exact engine code your vehicle needs."},
            {"number": 2, "icon": "cart", "title": "Order at the fixed price", "description": "Choose used or reconditioned where both are available, then buy at the fixed price shown on the page."},
            {"number": 3, "icon": "truck", "title": "Dispatched with warranty", "description": "Your engine ships UK-wide with tracking, backed by warranty and a 14-day uninstalled return."}]},
        "featuredEngines": {"title": strip_md(fs["title"]) if fs else "Featured Engines in Stock",
                            "subtitle": fsub, "viewAllText": "See all engines", "viewAllHref": "/engines",
                            "buyButtonText": "Buy it now", "engines": featured},
        "shopByModel": {"title": strip_md(ms["title"]) if ms else "Shop by Model", "subtitle": msub,
                        "viewAllText": f"View all {len(models)} models", "viewAllHref": f"/{slug}/models",
                        "allModelsLabel": "View all models", "allModelsCount": f"{len(models)} models available",
                        "models": models[:9]},
        "engineFamilies": {"title": strip_md(es["title"]) if es else "All Engine Families",
                           "description": fam_desc, "image": DEFAULT_WIREFRAME, "families": families},
        "priceGuide": price,
        "usedVsRecon": uvr,
        "about": about,
        "warrantyDelivery": wd,
        "faqs": faqs,
        "cta": cta,
    }

    # collect TODOs for anything guessed
    if not any(c["ps"] for c in entry["hero"]["cards"]):
        todos.append("hero.cards[].ps / nm — torque figures are not in the MD; fill manually.")
    todos.append("Images use placeholders (engine/car/model/wireframe) — swap the *image / *Image paths for real assets.")
    if any(not f["priceFrom"] for f in families):
        todos.append("Some engineFamilies[].priceFrom had no match in the price table — fill the blanks.")

    return slug, entry, todos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("md", help="path to the brand-page markdown mockup")
    ap.add_argument("--slug", help="override the URL slug (default: from Canonical)")
    ap.add_argument("--json", default=str(JSON_PATH), help="brandPage.json path")
    args = ap.parse_args()

    md = Path(args.md).read_text(encoding="utf-8")
    slug, entry, todos = parse(md, args.slug)

    jpath = Path(args.json)
    data = json.loads(jpath.read_text(encoding="utf-8")) if jpath.exists() else {}
    data[slug] = entry
    jpath.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    try:
        shown = jpath.relative_to(ROOT)
    except ValueError:
        shown = jpath
    print(f"OK: wrote entry '{slug}' to {shown}")
    print(f"  page will render at  /{slug}")
    print(f"  featured: {len(entry['featuredEngines']['engines'])}  "
          f"models: {len(entry['shopByModel']['models'])}  "
          f"families: {len(entry['engineFamilies']['families'])}  "
          f"faqs: {len(entry['faqs']['items'])}")
    if todos:
        print("\n  TODO (auto-filled defaults to review):")
        for t in todos:
            print("   -", t)


if __name__ == "__main__":
    main()
