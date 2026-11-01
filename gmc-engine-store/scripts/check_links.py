#!/usr/bin/env python3
"""
Check that no internal link 404s and every page has the right canonical tag.

Run it against a running site (dev server, `npm run start`, or the live domain):

    python scripts/check_links.py                                  # http://localhost:3000
    python scripts/check_links.py --base https://engined.co.uk
    python scripts/check_links.py --listings 5                     # 5 listing pages per engine (default 1)
    python scripts/check_links.py --listings all                   # every listing page (slow)

It opens the home page, every brand / model / engine hub page in src/data, the hand-built listing and
N listing pages per engine folder, collects every internal <a href> on them, requests each target once
and reports:
  * links that do not return 200 (with the pages they appear on)
  * pages whose <link rel="canonical"> is missing or is not https://engined.co.uk/<path>

Exit code 1 if anything is wrong, so it can gate a deploy.
"""

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

APP = Path(__file__).resolve().parents[1]
DATA = APP / "src" / "data"
SITE = "https://engined.co.uk"


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs, self.canonical = [], None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "a" and a.get("href"):
            self.hrefs.append(a["href"])
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "gmc-link-check"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:  # connection refused, timeout ...
        return f"error: {e}", ""


def seed_paths(per_engine):
    paths = ["/", "/contact"]
    load = lambda name: json.loads((DATA / name).read_text(encoding="utf-8"))
    paths += [f"/{slug}" for slug in load("brandPage.json")]
    paths += [f"/{m['brandSlug']}/{m['slug']}" for m in load("modelPage.json").values()]
    paths += [f"/engines/{slug}" for slug in load("hubPage.json")]
    paths += [f"/engines/{d['engineSlug']}/{d['applicationSlug']}" for d in load("listingPage.json").values()]
    for folder in sorted((DATA / "listings").iterdir()):
        files = sorted(folder.glob("*.json"))
        if per_engine != "all":
            files = files[: int(per_engine)]
        paths += [f"/engines/{folder.name}/{f.stem}" for f in files]
    return paths


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--base", default="http://localhost:3000")
    ap.add_argument("--listings", default="1", help="listing pages to open per engine folder, or 'all'")
    ap.add_argument("--workers", type=int, default=6)
    args = ap.parse_args()
    base = args.base.rstrip("/")
    host = urlparse(base).netloc

    pages = seed_paths(args.listings)
    print(f"opening {len(pages)} pages on {base} ...")
    with ThreadPoolExecutor(args.workers) as pool:
        results = list(pool.map(lambda p: (p, *fetch(base + p)), pages))

    problems = 0
    found = {}  # target path -> set of pages it appears on
    for path, status, html in results:
        if status != 200:
            print(f"  PAGE {status}: {path}")
            problems += 1
            continue
        parser = Links()
        parser.feed(html)
        want = SITE + ("" if path == "/" else path)
        if parser.canonical not in (want, want + "/") and not (path == "/" and parser.canonical == SITE + "/"):
            print(f"  CANONICAL {path}: {parser.canonical!r} (expected {want})")
            problems += 1
        for href in parser.hrefs:
            u = urlparse(urljoin(base + path, href))
            if u.netloc != host or u.scheme not in ("http", "https"):
                continue
            target = u.path or "/"
            found.setdefault(target, set()).add(path)

    print(f"checking {len(found)} distinct internal link targets ...")
    with ThreadPoolExecutor(args.workers) as pool:
        statuses = dict(pool.map(lambda t: (t, fetch(base + t)[0]), sorted(found)))
    for target, status in sorted(statuses.items()):
        if status != 200:
            problems += 1
            on = sorted(found[target])
            print(f"  LINK {status}: {target}  <- {', '.join(on[:3])}{' ...' if len(on) > 3 else ''}")

    print("OK: no broken internal links, canonicals correct" if not problems else f"{problems} problem(s)")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
