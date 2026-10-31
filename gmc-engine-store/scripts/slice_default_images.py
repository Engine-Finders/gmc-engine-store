#!/usr/bin/env python3
"""
Slice the brand contact sheets in ../default_images into single photos.

Each portrait sheet (Jaguar / Range Rover / Mercedes / VW / Audi) holds 3 rows
of [car front | engine bay] with a caption under each row. Output, per brand:

  public/images/listings/default/<brand>-<n>-front.webp   n = 1..3
  public/images/listings/default/<brand>-<n>-bay.webp

BMW has no sheet - its pair is the two loose photos (front + engine bay).

Usage (from gmc-engine-store/):  python -I scripts/slice_default_images.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "default_images"
OUT = ROOT / "public" / "images" / "listings" / "default"

# file stem suffix -> brand key used by the extractor
SHEETS = {
    "12.18.12 PM (1)": "jaguar",
    "12.18.12 PM (2)": "landrover",
    "12.18.12 PM (3)": "mercedes",
    "12.18.12 PM (4)": "volkswagen",
    "12.18.12 PM": "audi",
}
BMW_FRONT = "12.16.15 PM (1)"
BMW_BAY = "12.16.15 PM (2)"


if not SRC.exists():
    raise SystemExit(f"contact-sheet folder not found: {SRC}  (put the brand contact sheets in <repo root>/default_images)")


def find(suffix):
    hits = [p for p in SRC.glob("*.jpeg") if p.stem.endswith(suffix)]
    # "12.18.12 PM" is a suffix of the "(n)" names too: pick the shortest stem
    return sorted(hits, key=lambda p: len(p.stem))[0]


def save(im, name):
    im.convert("RGB").save(OUT / name, "WEBP", quality=85, method=6)


def split_sheet(path):
    img = Image.open(path).convert("RGB")
    g = np.asarray(img.convert("L")).astype(int)
    h, w = g.shape
    white = (g > 235).mean(axis=1)
    bands, start = [], None
    for y, v in enumerate(white):
        if v > 0.97 and start is None:
            start = y
        elif v <= 0.97 and start is not None:
            bands.append((start, y))
            start = None
    blocks, prev = [], 0
    for a, b in [x for x in bands if x[1] - x[0] >= 4] + [(h, h)]:
        if a - prev > 60:
            blocks.append((prev, a))
        prev = b
    rows = []
    for y0, y1 in blocks[:3]:
        cols = (g[y0:y1] > 235).mean(axis=0)
        gut = [x for x, v in enumerate(cols) if 0.2 * w < x < 0.8 * w and v > 0.97]
        mid = (gut[0] + gut[-1]) // 2
        rows.append((img.crop((0, y0, gut[0], y1)), img.crop((gut[-1] + 1, y0, w, y1))))
    return rows


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for suffix, brand in SHEETS.items():
        rows = split_sheet(find(suffix))
        for n, (front, bay) in enumerate(rows, 1):
            save(front, f"{brand}-{n}-front.webp")
            save(bay, f"{brand}-{n}-bay.webp")
        print(brand, len(rows), "pairs")
    save(Image.open(find(BMW_FRONT)), "bmw-1-front.webp")
    save(Image.open(find(BMW_BAY)), "bmw-1-bay.webp")
    print("bmw 1 pair")


if __name__ == "__main__":
    main()
