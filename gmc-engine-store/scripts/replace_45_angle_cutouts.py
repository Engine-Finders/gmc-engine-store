#!/usr/bin/env python3
"""Validate and replace 45-degree model WEBPs with transparent PNGs.

This is intentionally a separate step from background removal. It validates
the complete staging set first, then moves the original WEBPs to a recoverable
backup folder before moving the PNGs into the original brand folders.
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image


NAME_MARKER = "45-angle-front-view"


def parse_args() -> argparse.Namespace:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=project_root / "public" / "images" / "models",
        help="Original model image root.",
    )
    parser.add_argument(
        "--staging",
        type=Path,
        default=project_root / "tmp" / "45-angle-transparent",
        help="Completed PNG staging root.",
    )
    parser.add_argument(
        "--backup",
        type=Path,
        default=project_root / "tmp" / "45-angle-webp-backup",
        help="Recoverable backup root for the old WEBPs.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Perform the replacement after validation; without this flag only validate.",
    )
    return parser.parse_args()


def originals(root: Path) -> list[Path]:
    paths: list[Path] = []
    for directory, _, filenames in os.walk(root):
        for name in filenames:
            path = Path(directory) / name
            if path.suffix.lower() == ".webp" and NAME_MARKER in path.stem.casefold():
                paths.append(path)
    return sorted(paths)


def validate(originals_list: list[Path], input_root: Path, staging_root: Path) -> list[str]:
    errors: list[str] = []
    for original in originals_list:
        relative = original.relative_to(input_root)
        staged = (staging_root / relative).with_suffix(".png")
        if not staged.exists():
            errors.append(f"missing staged output: {relative}")
            continue
        try:
            with Image.open(original) as source, Image.open(staged) as output:
                if output.mode != "RGBA":
                    errors.append(f"not RGBA: {relative} ({output.mode})")
                if output.size != source.size:
                    errors.append(f"dimension changed: {relative} ({source.size} -> {output.size})")
                alpha = np.asarray(output.getchannel("A"), dtype=np.uint8)
                if any(int(alpha[y, x]) != 0 for y, x in ((0, 0), (0, -1), (-1, 0), (-1, -1))):
                    errors.append(f"opaque corner remains: {relative}")
                if int((alpha == 0).sum()) == 0:
                    errors.append(f"no transparency detected: {relative}")
        except Exception as exc:
            errors.append(f"cannot validate {relative}: {exc}")
    return errors


def main() -> int:
    args = parse_args()
    input_root = args.input.resolve()
    staging_root = args.staging.resolve()
    backup_root = args.backup.resolve()
    source_files = originals(input_root)
    if not source_files:
        print(f"No {NAME_MARKER} WEBPs found under {input_root}", file=sys.stderr)
        return 2

    errors = validate(source_files, input_root, staging_root)
    print(f"Validated {len(source_files)} source files")
    if errors:
        print(f"Validation failed with {len(errors)} errors:", file=sys.stderr)
        for error in errors[:50]:
            print(f"- {error}", file=sys.stderr)
        if len(errors) > 50:
            print(f"- ... {len(errors) - 50} more", file=sys.stderr)
        return 1

    if not args.apply:
        print("Validation passed. Re-run with --apply to replace the originals.")
        return 0

    for original in source_files:
        relative = original.relative_to(input_root)
        staged = (staging_root / relative).with_suffix(".png")
        destination = original.with_suffix(".png")
        backup = backup_root / relative
        backup.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists():
            raise RuntimeError(f"Refusing to overwrite existing PNG: {destination}")
        shutil.move(str(original), str(backup))
        shutil.move(str(staged), str(destination))

    print(f"Replaced {len(source_files)} WEBPs with transparent PNGs")
    print(f"Original WEBPs backed up at {backup_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
