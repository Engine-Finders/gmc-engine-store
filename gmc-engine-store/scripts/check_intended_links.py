#!/usr/bin/env python3
"""Audit intended JSON links against the site's route inventory.

The runtime resolver intentionally keeps the intended URL in source data and falls back
when a page is not built yet. This audit therefore distinguishes malformed links, which
are failures, from missing-content links, which are reported as pending work.

Use ``--strict`` when all source content is expected to be present.
"""

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
DATA = APP / "src" / "data"
sys.path.insert(0, str(APP / "scripts"))

from repair_internal_links import brand_prefixes, data_files, repair_href
STATIC_PAGES = {
    "/",
    "/contact",
    "/brands",
    "/engines",
    "/guides",
    "/guides/whats-included",
    "/guides/core-exchange",
}
PLANNED_FALLBACKS = {"/about", "/privacy", "/terms", "/delivery", "/warranty", "/returns"}


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def normalize(path):
    return path.split("#", 1)[0].split("?", 1)[0].rstrip("/") or "/"


def inventory():
    brands = set(load("brandPage.json"))
    models = {
        f"{page['brandSlug']}/{page['slug']}"
        for page in load("modelPage.json").values()
        if page.get("brandSlug") and page.get("slug")
    }
    hubs = set(load("hubPage.json"))
    listings = defaultdict(set)
    for folder in (DATA / "listings").iterdir():
        if folder.is_dir():
            listings[folder.name].update(p.stem for p in folder.glob("*.json"))
    for page in load("listingPage.json").values():
        listings[page["engineSlug"]].add(page["applicationSlug"])
    return brands, models, hubs, listings


def exists(path, brands, models, hubs, listings):
    path = normalize(path)
    if path in STATIC_PAGES:
        return True
    if path in PLANNED_FALLBACKS:
        return False
    parts = [part for part in path.split("/") if part]
    if parts[:1] == ["engines"]:
        if len(parts) == 2:
            return parts[1] in hubs
        if len(parts) == 3:
            return parts[2] in listings.get(parts[1], set())
        return False
    if len(parts) == 1:
        return parts[0] in brands
    if len(parts) == 2:
        return "/".join(parts) in models
    return False


def collect(value, key, source, out):
    if isinstance(value, dict):
        for child_key, child in value.items():
            collect(child, child_key, source, out)
    elif isinstance(value, list):
        for child in value:
            collect(child, key, source, out)
    elif isinstance(value, str) and re.search(r"href$", key, re.I) and value.startswith("/") and not value.startswith("//"):
        out.append((source, value))


def category(path):
    path = normalize(path)
    if path in PLANNED_FALLBACKS:
        return "planned static page"
    parts = [part for part in path.split("/") if part]
    if parts[:1] == ["engines"] and len(parts) == 2:
        return "missing engine hub"
    if parts[:1] == ["engines"] and len(parts) == 3:
        return "missing listing/application"
    if len(parts) == 1:
        return "missing brand page"
    if len(parts) == 2:
        return "missing model page"
    return "other internal path"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--strict", action="store_true", help="also fail when intended pages are not built yet")
    args = ap.parse_args()

    brands, models, hubs, listings = inventory()
    refs = []
    for path in data_files():
        collect(json.loads(path.read_text(encoding="utf-8")), "", str(path.relative_to(APP)), refs)

    prefixes = brand_prefixes()
    malformed = [(source, href, repair_href(href, hubs, prefixes)) for source, href in refs]
    malformed = [row for row in malformed if row[1] != row[2]]
    missing = [(source, href) for source, href in refs if not exists(href, brands, models, hubs, listings)]

    print(f"audited {len(refs)} intended internal href(s)")
    print(f"malformed href(s): {len(malformed)}")
    print(f"pending destinations: {len(missing)} reference(s), {len({normalize(href) for _, href in missing})} unique route(s)")

    if malformed:
        print("\nMALFORMED")
        for source, href, fixed in malformed[:40]:
            print(f"  {source}: {href} -> {fixed}")

    counts = Counter(category(href) for _, href in missing)
    if counts:
        print("\nPENDING BY CATEGORY")
        for name, count in counts.most_common():
            print(f"  {name}: {count}")

        targets = defaultdict(int)
        for _, href in missing:
            targets[normalize(href)] += 1
        print("\nMOST REFERENCED PENDING TARGETS")
        for href, count in sorted(targets.items(), key=lambda item: (-item[1], item[0]))[:20]:
            print(f"  {count:4} {href}")

    problems = bool(malformed) or (args.strict and bool(missing))
    if problems:
        print("\nFAIL: intended-link audit found actionable problems")
        sys.exit(1)
    print("\nOK: no malformed intended links")


if __name__ == "__main__":
    main()
