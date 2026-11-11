#!/usr/bin/env python3
"""Repair malformed generated internal hrefs without changing intended destinations.

The page generator should prevent these cases, but this repair is useful for JSON already
generated from older client exports. It only fixes:

* an Engined absolute URL accidentally prefixed with ``/engines/``;
* a brand-prefixed hub URL such as ``/engines/audi/ea111``.

Missing pages are deliberately not rewritten to fallback pages. That remains the job of
the runtime resolver in ``src/lib/links.ts`` until the missing page content is available.
"""

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

APP = Path(__file__).resolve().parents[1]
DATA = APP / "src" / "data"


def data_files():
    return sorted(DATA.rglob("*.json"))


def load_hubs():
    return set(json.loads((DATA / "hubPage.json").read_text(encoding="utf-8")))


def brand_prefixes():
    prefixes = set()
    brands = json.loads((DATA / "brandPage.json").read_text(encoding="utf-8"))
    for slug in brands:
        base = slug.removesuffix("-engines")
        prefixes.update({base, base.split("-")[0], base.replace("-", "")})
    return prefixes


def repair_href(href, hubs, brands):
    """Return a repaired href, or the original string when it is not a known defect."""
    nested = re.match(r"^/engines/(https?://[^/]+)(/engines/.*)$", href, re.I)
    if nested:
        parsed = urlparse(nested.group(1) + nested.group(2))
        if (parsed.hostname or "").lower().removeprefix("www.") == "engined.co.uk":
            return parsed.path.rstrip("/") or "/"

    match = re.fullmatch(r"/engines/([^/]+)/([^/]+)/?", href)
    if match and match.group(1).lower() in brands and match.group(2) in hubs:
        return f"/engines/{match.group(2)}"
    return href


def repair_text(text, hubs, brands):
    changed = 0

    def replace(match):
        nonlocal changed
        fixed = repair_href(match.group(2), hubs, brands)
        if fixed != match.group(2):
            changed += 1
        return match.group(1) + fixed + match.group(3)

    pattern = re.compile(r'("href"\s*:\s*")([^"]+)(")')
    return pattern.sub(replace, text), changed


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true", help="write repaired JSON files; otherwise report only")
    args = ap.parse_args()

    hubs = load_hubs()
    brands = brand_prefixes()
    total = 0
    files = 0
    for path in data_files():
        original = path.read_text(encoding="utf-8")
        repaired, changed = repair_text(original, hubs, brands)
        if not changed:
            continue
        files += 1
        total += changed
        action = "writing" if args.write else "would repair"
        print(f"{action} {changed} href(s): {path.relative_to(APP)}")
        if args.write:
            path.write_text(repaired, encoding="utf-8", newline="\n")

    verb = "repaired" if args.write else "found"
    print(f"{verb} {total} malformed href(s) in {files} file(s)")


if __name__ == "__main__":
    main()
