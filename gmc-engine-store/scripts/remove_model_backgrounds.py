#!/usr/bin/env python3
"""Create transparent cut-outs from the model-car image library.

The model does the difficult part (separating the car from the scene). The
post-processing in this file is deliberately conservative and targets the
failure mode common in this library: a white or light-grey patch/shadow that
the segmenter leaves behind. It only removes pixels that are connected to the
image border and are close to the detected background colour, so white body
panels are not globally colour-keyed away.

Install:
    python -m pip install -r scripts/requirements-background-removal.txt

Example:
    python scripts/remove_model_backgrounds.py \
        --input public/images/models \
        --output public/images/models-transparent

The originals are never modified. Every output is a PNG so that the alpha
channel is retained, and the output has exactly the same width and height as
the source image.
"""

from __future__ import annotations

import argparse
import io
import multiprocessing as mp
import os
import sys
from collections import deque
from pathlib import Path
from typing import Iterable

import numpy as np
from PIL import Image, ImageFilter


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

_WORKER_SESSION = None
_WORKER_REMOVE = None


def parse_args() -> argparse.Namespace:
    project_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(
        description="Remove model-image backgrounds and save full-resolution transparent PNGs."
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=project_root / "public" / "images" / "models",
        help="Input folder; brand subfolders are preserved (default: public/images/models).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=project_root / "public" / "images" / "models-transparent",
        help="Output folder for PNG cut-outs (default: public/images/models-transparent).",
    )
    parser.add_argument(
        "--model",
        default="isnet-general-use",
        help=(
            "rembg model to use. isnet-general-use is the default; "
            "birefnet-general can be selected for higher-quality processing on a "
            "machine with enough disk/RAM."
        ),
    )
    parser.add_argument(
        "--background-tolerance",
        type=float,
        default=28.0,
        help="RGB distance treated as the solid background (default: 28).",
    )
    parser.add_argument(
        "--shadow-tolerance",
        type=float,
        default=92.0,
        help="RGB distance allowed for connected light shadows (default: 92).",
    )
    parser.add_argument(
        "--edge-size",
        type=int,
        default=8,
        help="Border width used to estimate the background colour (default: 8).",
    )
    parser.add_argument(
        "--subject-edge-radius",
        type=int,
        default=3,
        help=(
            "Keep low-alpha pixels only this many pixels from solid subject pixels "
            "(default: 3). Increase for softer edges."
        ),
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Number of CPU workers; 2 is a safe choice on an 8 GB machine (default: 1).",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Reprocess output files that already exist.",
    )
    parser.add_argument(
        "--name-contains",
        default="",
        help="Only process files whose basename contains this text (case-insensitive).",
    )
    return parser.parse_args()


def iter_images(root: Path, name_contains: str = "") -> Iterable[Path]:
    needle = name_contains.casefold()
    paths: list[Path] = []
    # os.walk handles the Windows filenames in this library more reliably
    # than pathlib.Path.rglob (which can silently skip some Unicode paths).
    for directory, _, filenames in os.walk(root):
        for name in filenames:
            path = Path(directory) / name
            if (
                path.suffix.lower() in IMAGE_EXTENSIONS
                and (not needle or needle in path.stem.casefold())
            ):
                paths.append(path)
    yield from sorted(paths)


def load_rembg():
    try:
        from rembg import new_session, remove
    except ImportError as exc:
        raise RuntimeError(
            "Missing background-removal dependencies. Run: "
            "python -m pip install -r scripts/requirements-background-removal.txt"
        ) from exc
    return new_session, remove


def estimate_background_colour(rgb: np.ndarray, edge_size: int) -> np.ndarray:
    """Estimate a flat background colour from all four image borders."""
    height, width, _ = rgb.shape
    edge_size = max(1, min(edge_size, height // 2, width // 2))
    border = np.concatenate(
        (
            rgb[:edge_size].reshape(-1, 3),
            rgb[-edge_size:].reshape(-1, 3),
            rgb[:, :edge_size].reshape(-1, 3),
            rgb[:, -edge_size:].reshape(-1, 3),
        ),
        axis=0,
    )
    # The median is resistant to a car touching a small part of the border.
    return np.median(border, axis=0)


def border_connected(candidate: np.ndarray) -> np.ndarray:
    """Return only candidate pixels reachable from an image edge.

    A pure NumPy/Python flood fill avoids an OpenCV dependency and, importantly,
    prevents a colour-key from removing similarly coloured pixels in the car.
    """
    height, width = candidate.shape
    connected = np.zeros_like(candidate, dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def add(y: int, x: int) -> None:
        if candidate[y, x] and not connected[y, x]:
            connected[y, x] = True
            queue.append((y, x))

    for x in range(width):
        add(0, x)
        add(height - 1, x)
    for y in range(1, height - 1):
        add(y, 0)
        add(y, width - 1)

    while queue:
        y, x = queue.popleft()
        if y:
            add(y - 1, x)
        if y + 1 < height:
            add(y + 1, x)
        if x:
            add(y, x - 1)
        if x + 1 < width:
            add(y, x + 1)

    return connected


def dilate_mask(mask: np.ndarray, radius: int) -> np.ndarray:
    """Dilate a boolean mask without adding an OpenCV dependency."""
    if radius <= 0:
        return mask.copy()
    size = radius * 2 + 1
    mask_image = Image.fromarray((mask.astype(np.uint8) * 255), mode="L")
    return np.asarray(mask_image.filter(ImageFilter.MaxFilter(size)), dtype=np.uint8) > 0


def refine_alpha(
    source_rgb: np.ndarray,
    alpha: np.ndarray,
    *,
    background_tolerance: float,
    shadow_tolerance: float,
    edge_size: int,
    subject_edge_radius: int,
) -> np.ndarray:
    """Remove border-connected background and keep anti-aliased car edges."""
    background = estimate_background_colour(source_rgb, edge_size)
    distance = np.linalg.norm(source_rgb.astype(np.float32) - background, axis=2)

    # The first pass catches opaque white/coloured patches. The second pass
    # catches light-grey shadows, but only where the AI matte already considers
    # the pixel mostly background. This protects similarly coloured body panels.
    strict_candidate = distance <= background_tolerance
    soft_candidate = (distance <= shadow_tolerance) & (alpha < 220)

    remove_strict = border_connected(strict_candidate)
    remove_soft = border_connected(soft_candidate)
    remove = remove_strict | remove_soft

    refined = alpha.copy()
    refined[remove] = 0

    # Some source photos contain a dark floor shadow. It can be far from the
    # white border colour, so colour distance alone cannot identify it. Keep a
    # small anti-aliased edge around the solid car, then remove detached
    # low-alpha regions such as the shadow. Solid/opaque car pixels are never
    # touched by this pass.
    solid_subject = alpha >= 220
    edge_keep = dilate_mask(solid_subject, subject_edge_radius)
    detached_low_alpha = (alpha < 220) & ~edge_keep
    refined[detached_low_alpha] = 0

    # Fade only low-alpha pixels in the light-background band. This removes a
    # pale halo while preserving the original RGB pixels and the sharp car edge.
    fade_band = (distance > background_tolerance) & (distance < shadow_tolerance)
    low_alpha = alpha < 220
    if shadow_tolerance > background_tolerance:
        fade = np.clip(
            (distance - background_tolerance)
            / (shadow_tolerance - background_tolerance),
            0.0,
            1.0,
        )
        refined[fade_band & low_alpha] = np.minimum(
            refined[fade_band & low_alpha],
            np.rint(alpha[fade_band & low_alpha] * fade[fade_band & low_alpha]),
        ).astype(np.uint8)

    return refined.astype(np.uint8)


def remove_background(
    source_path: Path,
    destination_path: Path,
    *,
    session,
    remove_fn,
    background_tolerance: float,
    shadow_tolerance: float,
    edge_size: int,
    subject_edge_radius: int,
) -> None:
    with Image.open(source_path) as image:
        source = image.convert("RGB")

    # Keep the model's soft alpha and decontaminate edge colours. This is much
    # faster and more stable for a large batch than the older closed-form
    # alpha-matting solver, and the custom cleanup below handles the detached
    # light/dark shadow that caused the original white patch.
    result = remove_fn(
        source,
        session=session,
        alpha_matting=False,
        decontaminate=True,
        post_process_mask=False,
    )
    if isinstance(result, Image.Image):
        cutout = result.convert("RGBA")
    else:
        cutout = Image.open(io.BytesIO(result)).convert("RGBA")

    if cutout.size != source.size:
        raise RuntimeError(
            f"Background remover changed dimensions for {source_path.name}: "
            f"{source.size} -> {cutout.size}"
        )

    source_rgb = np.asarray(source, dtype=np.uint8)
    rgba = np.asarray(cutout, dtype=np.uint8).copy()
    rgba[:, :, 3] = refine_alpha(
        source_rgb,
        rgba[:, :, 3],
        background_tolerance=background_tolerance,
        shadow_tolerance=shadow_tolerance,
        edge_size=edge_size,
        subject_edge_radius=subject_edge_radius,
    )

    destination_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, mode="RGBA").save(
        destination_path,
        format="PNG",
        optimize=True,
    )


def process_one(
    source_path: Path,
    input_root: Path,
    output_root: Path,
    *,
    session,
    remove_fn,
    background_tolerance: float,
    shadow_tolerance: float,
    edge_size: int,
    subject_edge_radius: int,
    overwrite: bool,
) -> tuple[str, str, str, str]:
    """Process one file and return status, relative path, output path, error."""
    relative = source_path.relative_to(input_root)
    destination_path = (output_root / relative).with_suffix(".png")
    if destination_path.exists() and not overwrite:
        return "skipped", str(relative), str(destination_path), ""

    try:
        remove_background(
            source_path,
            destination_path,
            session=session,
            remove_fn=remove_fn,
            background_tolerance=background_tolerance,
            shadow_tolerance=shadow_tolerance,
            edge_size=edge_size,
            subject_edge_radius=subject_edge_radius,
        )
        return "processed", str(relative), str(destination_path), ""
    except Exception as exc:  # keep a large batch moving; report every failure
        return "failed", str(relative), str(destination_path), str(exc)


def init_worker(model_name: str) -> None:
    """Load one model session per spawned worker."""
    global _WORKER_SESSION, _WORKER_REMOVE
    new_session, _WORKER_REMOVE = load_rembg()
    _WORKER_SESSION = new_session(model_name)


def worker_task(task: tuple[str, str, str, tuple[float, float, int, int, bool]]) -> tuple[str, str, str, str]:
    source_path_str, input_root_str, output_root_str, options = task
    background_tolerance, shadow_tolerance, edge_size, subject_edge_radius, overwrite = options
    return process_one(
        Path(source_path_str),
        Path(input_root_str),
        Path(output_root_str),
        session=_WORKER_SESSION,
        remove_fn=_WORKER_REMOVE,
        background_tolerance=background_tolerance,
        shadow_tolerance=shadow_tolerance,
        edge_size=edge_size,
        subject_edge_radius=subject_edge_radius,
        overwrite=overwrite,
    )


def main() -> int:
    args = parse_args()
    if args.workers < 1:
        print("--workers must be at least 1.", file=sys.stderr)
        return 2

    input_root = args.input.resolve()
    output_root = args.output.resolve()
    if not input_root.exists():
        print(f"Input folder does not exist: {input_root}", file=sys.stderr)
        return 2
    if input_root == output_root:
        print("Refusing to use the same folder for --input and --output.", file=sys.stderr)
        return 2
    if args.background_tolerance < 0 or args.shadow_tolerance < args.background_tolerance:
        print(
            "--shadow-tolerance must be >= --background-tolerance, and both must be non-negative.",
            file=sys.stderr,
        )
        return 2

    files = list(iter_images(input_root, args.name_contains))
    if not files:
        print(f"No PNG/JPG/JPEG/WEBP images found under {input_root}", file=sys.stderr)
        return 2

    processed = 0
    skipped = 0
    failed = 0
    options = (
        args.background_tolerance,
        args.shadow_tolerance,
        args.edge_size,
        args.subject_edge_radius,
        args.overwrite,
    )

    if args.workers == 1:
        try:
            new_session, remove_fn = load_rembg()
            print(f"Loading rembg model: {args.model}")
            session = new_session(args.model)
        except Exception as exc:
            print(f"Could not load the background-removal model: {exc}", file=sys.stderr)
            return 1

        results = (
            process_one(
                source_path,
                input_root,
                output_root,
                session=session,
                remove_fn=remove_fn,
                background_tolerance=args.background_tolerance,
                shadow_tolerance=args.shadow_tolerance,
                edge_size=args.edge_size,
                subject_edge_radius=args.subject_edge_radius,
                overwrite=args.overwrite,
            )
            for source_path in files
        )
        for status, relative, destination, error in results:
            if status == "processed":
                processed += 1
                print(f"[{processed}/{len(files)}] {relative} -> {Path(destination).relative_to(output_root)}")
            elif status == "skipped":
                skipped += 1
            else:
                failed += 1
                print(f"FAILED {relative}: {error}", file=sys.stderr)
    else:
        worker_count = min(args.workers, len(files))
        print(f"Starting {worker_count} workers with model: {args.model}")
        tasks = ((str(path), str(input_root), str(output_root), options) for path in files)
        try:
            context = mp.get_context("spawn")
            with context.Pool(
                processes=worker_count,
                initializer=init_worker,
                initargs=(args.model,),
            ) as pool:
                for status, relative, destination, error in pool.imap_unordered(worker_task, tasks, chunksize=1):
                    if status == "processed":
                        processed += 1
                        print(f"[{processed}/{len(files)}] {relative} -> {Path(destination).relative_to(output_root)}")
                    elif status == "skipped":
                        skipped += 1
                    else:
                        failed += 1
                        print(f"FAILED {relative}: {error}", file=sys.stderr)
        except Exception as exc:
            print(f"Worker pool stopped: {exc}", file=sys.stderr)
            return 1

    print(f"Done. processed={processed}, skipped={skipped}, failed={failed}")
    print(f"Output: {output_root}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
