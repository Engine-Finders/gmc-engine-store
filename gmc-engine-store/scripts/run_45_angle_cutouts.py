#!/usr/bin/env python3
"""Process all 45-degree model images, validate them, and replace originals."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "public" / "images" / "models"
STAGING = ROOT / "tmp" / "45-angle-transparent"


def main() -> int:
    remover = ROOT / "scripts" / "remove_model_backgrounds.py"
    finalizer = ROOT / "scripts" / "replace_45_angle_cutouts.py"
    remove_command = [
        sys.executable,
        "-u",
        str(remover),
        "--input",
        str(INPUT),
        "--output",
        str(STAGING),
        "--model",
        "silueta",
        "--workers",
        "4",
        "--name-contains",
        "45-angle-front-view",
        "--subject-edge-radius",
        "3",
    ]
    completed = subprocess.run(remove_command, cwd=ROOT)
    if completed.returncode != 0:
        print("Background removal failed; originals were not replaced.", file=sys.stderr)
        return completed.returncode

    finalize_command = [
        sys.executable,
        str(finalizer),
        "--input",
        str(INPUT),
        "--staging",
        str(STAGING),
        "--apply",
    ]
    return subprocess.run(finalize_command, cwd=ROOT).returncode


if __name__ == "__main__":
    raise SystemExit(main())
