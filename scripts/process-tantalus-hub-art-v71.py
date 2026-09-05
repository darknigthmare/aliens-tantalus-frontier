"""Build the ten commercial hub annex art packs for Tantalus Frontier V71.

Four original OpenAI ImageGen masters are kept untouched.  Each is an exact
row-major 5x2 board.  This deterministic processor splits the ten authored
cells, turns the RGB checker surrounding transparent layers into real alpha
with a border-connected flood fill, and emits one independent five-layer pack
per annex.

Run without arguments to build the 50 WebP files and their provenance report.
Run with ``--check`` to validate the existing release files without rewriting
anything.
"""

from __future__ import annotations

import argparse
from collections import deque
import hashlib
import json
from pathlib import Path
from typing import Any

from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat, features


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "assets/openai/sprites/frames/v71/hub-commercial"
OUTPUT_ROOT = ROOT / "assets/openai/hub/annexes/v71"
REPORT_PATH = OUTPUT_ROOT / "hub-commercial-art-report-v71.json"

COLUMNS = 5
ROWS = 2
BACKGROUND_SIZE = (1920, 720)
LAYER_SIZES = {
    "prop": (640, 512),
    "foreground": (1920, 720),
    "door": (384, 512),
}
LAYER_PADDING = {
    "prop": 32,
    "foreground": 24,
    "door": 24,
}
MASTER_FILES = {
    "background": "annex-backgrounds-master-openai-v71.png",
    "prop": "annex-props-master-openai-v71.png",
    "foreground": "annex-foregrounds-master-openai-v71.png",
    "door": "annex-doors-master-openai-v71.png",
}
BIOFORGE_BACKGROUND_FILE = "bioforge-access-background-neutral-openai-v71.png"
BIOFORGE_PROP_FILE = "bioforge-access-console-neutral-openai-v71.png"
BIOFORGE_DOOR_FILE = "bioforge-door-neutral-openai-v71.png"
BIOFORGE_STANDALONE_FILES = {
    "bioforge-background": BIOFORGE_BACKGROUND_FILE,
    "bioforge-prop": BIOFORGE_PROP_FILE,
    "bioforge-door": BIOFORGE_DOOR_FILE,
}

# This is the transcript contract.  Never alphabetize it: the source boards
# are authored in this exact row-major order.
ANNEXES: tuple[dict[str, str], ...] = (
    {
        "id": "arrival-airlock",
        "label": "Sas d'arrivée",
        "role": "arrivée, contrôle de pression et sas physique",
    },
    {
        "id": "logistics",
        "label": "Logistique",
        "role": "stockage, manutention et préparation matérielle",
    },
    {
        "id": "mire-archives",
        "label": "Archives / Palimpsest",
        "role": "bestiaire, rapports et replays historiques",
    },
    {
        "id": "synthetic-bay",
        "label": "Baie synthétique",
        "role": "maintenance et diagnostic des synthétiques",
    },
    {
        "id": "cctv",
        "label": "CCTV / Surveillance",
        "role": "vidéosurveillance et supervision du vaisseau",
    },
    {
        "id": "proving-ground",
        "label": "Terrain d'essai",
        "role": "essais contrôlés, entraînement et calibration",
    },
    {
        "id": "morgue",
        "label": "Morgue",
        "role": "autopsie, conservation et examen médico-légal",
    },
    {
        "id": "escape-pods",
        "label": "Capsules de sauvetage",
        "role": "évacuation et destruction d'urgence",
    },
    {
        "id": "durandal",
        "label": "Noyau Durandal Ω",
        "role": "IA de bord et guerre électronique",
    },
    {
        "id": "bioforge",
        "label": "Accès BIOFORGE isolé",
        "role": "accès étanche vers le niveau BIOFORGE séparé; cuves vides",
    },
)

CHECKER_MIN_CHANNEL = 208
CHECKER_MAX_CHROMA = 34
MIN_LAYER_OCCUPIED_PIXELS = 256
MIN_LAYER_TRANSPARENT_RATIO = 0.02
FAR_BLUR_RADIUS = 7.0
FAR_BRIGHTNESS = 0.48
FAR_COLOR = 0.62


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def split_edges(length: int, parts: int) -> tuple[int, ...]:
    """Partition every source pixel once, including non-divisible dimensions."""

    edges = tuple(round(index * length / parts) for index in range(parts + 1))
    if edges[0] != 0 or edges[-1] != length or any(a >= b for a, b in zip(edges, edges[1:])):
        raise ValueError(f"Invalid {parts}-way partition for {length} pixels: {edges}")
    return edges


def source_cell_bounds(size: tuple[int, int], index: int) -> tuple[int, int, int, int]:
    if not 0 <= index < COLUMNS * ROWS:
        raise IndexError(index)
    width, height = size
    x_edges = split_edges(width, COLUMNS)
    y_edges = split_edges(height, ROWS)
    row, column = divmod(index, COLUMNS)
    return x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1]


def is_checker(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha < 16 or (
        min(red, green, blue) >= CHECKER_MIN_CHANNEL
        and max(red, green, blue) - min(red, green, blue) <= CHECKER_MAX_CHROMA
    )


def remove_border_checker(source: Image.Image) -> tuple[Image.Image, int]:
    """Remove border checker plus large enclosed checker regions.

    The generated masters are RGB, so transparency must not be inferred from
    every pale pixel globally: bright lamps and metal highlights are valid art.
    The first pass is restricted to a four-neighbour flood fill from the border.
    Some foreground frames completely enclose their transparent opening, so a
    second pass clears only large connected neutral components; small lamps and
    highlights remain authored content.
    """

    image = source.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    queue: deque[tuple[int, int]] = deque()
    visited = bytearray(width * height)

    def enqueue(x: int, y: int) -> None:
        offset = y * width + x
        if visited[offset]:
            return
        visited[offset] = 1
        if is_checker(pixels[x, y]):
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(1, height - 1):
        enqueue(0, y)
        enqueue(width - 1, y)

    removed = 0
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (0, 0, 0, 0)
        removed += 1
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    component_seen = bytearray(width * height)
    minimum_component = max(192, round(width * height * 0.0015))
    for start_y in range(height):
        for start_x in range(width):
            start_offset = start_y * width + start_x
            if component_seen[start_offset] or pixels[start_x, start_y][3] == 0:
                continue
            component_seen[start_offset] = 1
            if not is_checker(pixels[start_x, start_y]):
                continue
            component_queue: deque[tuple[int, int]] = deque([(start_x, start_y)])
            component: list[tuple[int, int]] = []
            while component_queue:
                x, y = component_queue.popleft()
                component.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    offset = ny * width + nx
                    if component_seen[offset]:
                        continue
                    component_seen[offset] = 1
                    if pixels[nx, ny][3] and is_checker(pixels[nx, ny]):
                        component_queue.append((nx, ny))
            if len(component) < minimum_component:
                continue
            for x, y in component:
                pixels[x, y] = (0, 0, 0, 0)
            removed += len(component)

    return image, removed


def clear_transparent_rgb(image: Image.Image) -> None:
    if image.mode != "RGBA":
        return
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0 and (red or green or blue):
                pixels[x, y] = (0, 0, 0, 0)


def alpha_metrics(image: Image.Image) -> dict[str, Any]:
    width, height = image.size
    pixels = width * height
    if "A" not in image.getbands():
        return {
            "hasAlpha": False,
            "transparentPixels": 0,
            "partialAlphaPixels": 0,
            "opaquePixels": pixels,
            "occupiedPixels": pixels,
            "transparentRatio": 0.0,
            "contentBounds": [0, 0, width, height],
            "hiddenRgbPixels": 0,
        }

    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    histogram = alpha.histogram()
    transparent = histogram[0]
    opaque = histogram[255]
    partial = sum(histogram[1:255])
    hidden_rgb = sum(
        1
        for red, green, blue, value in rgba.get_flattened_data()
        if value == 0 and (red or green or blue)
    )
    return {
        "hasAlpha": True,
        "transparentPixels": transparent,
        "partialAlphaPixels": partial,
        "opaquePixels": opaque,
        "occupiedPixels": pixels - transparent,
        "transparentRatio": round(transparent / pixels, 6),
        "contentBounds": list(alpha.getbbox() or ()),
        "hiddenRgbPixels": hidden_rgb,
    }


def crop_dark_frame(image: Image.Image) -> tuple[Image.Image, list[int]]:
    """Trim only narrow near-black atlas guards, never the room composition."""

    rgb = image.convert("RGB")
    width, height = rgb.size

    def row_mean(y: int) -> float:
        return ImageStat.Stat(rgb.crop((0, y, width, y + 1)).convert("L")).mean[0]

    def column_mean(x: int) -> float:
        return ImageStat.Stat(rgb.crop((x, 0, x + 1, height)).convert("L")).mean[0]

    left = 0
    right = width
    top = 0
    bottom = height
    max_x_trim = max(1, round(width * 0.06))
    max_y_trim = max(1, round(height * 0.08))
    while left < max_x_trim and column_mean(left) < 2.0:
        left += 1
    while right > width - max_x_trim and column_mean(right - 1) < 2.0:
        right -= 1
    while top < max_y_trim and row_mean(top) < 2.0:
        top += 1
    while bottom > height - max_y_trim and row_mean(bottom - 1) < 2.0:
        bottom -= 1
    if right - left < width * 0.75 or bottom - top < height * 0.75:
        return rgb, [0, 0, width, height]
    return rgb.crop((left, top, right, bottom)), [left, top, right, bottom]


def build_backgrounds(cell: Image.Image) -> tuple[Image.Image, Image.Image, list[int]]:
    trimmed, trim_bounds = crop_dark_frame(cell)
    mid = ImageOps.fit(
        trimmed,
        BACKGROUND_SIZE,
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.58),
    ).convert("RGB")
    far = mid.filter(ImageFilter.GaussianBlur(radius=FAR_BLUR_RADIUS))
    far = ImageEnhance.Color(far).enhance(FAR_COLOR)
    far = ImageEnhance.Brightness(far).enhance(FAR_BRIGHTNESS).convert("RGB")
    return far, mid, trim_bounds


def threshold_bbox(image: Image.Image, threshold: int = 4) -> tuple[int, int, int, int] | None:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > threshold else 0)
    return mask.getbbox()


def compose_alpha_layer(
    cleaned: Image.Image,
    kind: str,
) -> tuple[Image.Image, dict[str, Any]]:
    bbox = threshold_bbox(cleaned)
    if not bbox:
        raise ValueError(f"Empty {kind} cell after checker cleanup")

    width, height = cleaned.size
    source_padding = min(32, max(6, round(min(width, height) * 0.025)))
    padded_bbox = (
        max(0, bbox[0] - source_padding),
        max(0, bbox[1] - source_padding),
        min(width, bbox[2] + source_padding),
        min(height, bbox[3] + source_padding),
    )
    cropped = cleaned.crop(padded_bbox)
    target_size = LAYER_SIZES[kind]
    target_padding = LAYER_PADDING[kind]
    available_width = target_size[0] - target_padding * 2
    available_height = target_size[1] - target_padding * 2
    scale = min(available_width / cropped.width, available_height / cropped.height)
    resized_size = (
        max(1, round(cropped.width * scale)),
        max(1, round(cropped.height * scale)),
    )
    resized = cropped.resize(resized_size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", target_size, (0, 0, 0, 0))
    x = (target_size[0] - resized.width) // 2
    y = target_size[1] - target_padding - resized.height
    canvas.alpha_composite(resized, (x, y))
    clear_transparent_rgb(canvas)
    metrics = alpha_metrics(canvas)
    if metrics["occupiedPixels"] < MIN_LAYER_OCCUPIED_PIXELS:
        raise ValueError(f"{kind} layer has too little authored content: {metrics['occupiedPixels']} pixels")
    if metrics["transparentRatio"] < MIN_LAYER_TRANSPARENT_RATIO:
        raise ValueError(f"{kind} layer did not retain a transparent surround")
    if metrics["hiddenRgbPixels"]:
        raise ValueError(f"{kind} layer contains RGB data under transparent pixels")
    return canvas, {
        "sourceContentBounds": list(bbox),
        "sourceCropWithPadding": list(padded_bbox),
        "sourcePadding": source_padding,
        "targetPadding": target_padding,
        "scale": round(scale, 6),
        "placement": [x, y, resized.width, resized.height],
    }


def save_webp(image: Image.Image, path: Path, *, alpha: bool) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    options: dict[str, Any] = {"format": "WEBP", "method": 6}
    if alpha:
        # Lossless alpha plus exact=True prevents the encoder from inventing
        # hidden RGB underneath fully transparent pixels.
        options.update({"lossless": True, "quality": 100, "exact": True})
    else:
        options.update({"lossless": False, "quality": 92})
    image.save(path, **options)


def output_record(
    path: Path,
    image: Image.Image,
    *,
    annex: dict[str, str],
    kind: str,
    source_path: Path,
    index: int | None,
    bounds: tuple[int, int, int, int],
    processing: dict[str, Any],
) -> dict[str, Any]:
    return {
        "annexId": annex["id"],
        "annexLabel": annex["label"],
        "kind": kind,
        "path": relative(path),
        "sha256": sha256(path),
        "dimensions": list(image.size),
        "mode": image.mode,
        "alpha": alpha_metrics(image),
        "source": relative(source_path),
        "sourceCell": ({
            "standalone": True,
            "bounds": list(bounds),
        } if index is None else {
            "index": index,
            "column": index % COLUMNS,
            "row": index // COLUMNS,
            "bounds": list(bounds),
        }),
        "processing": processing,
        "provenance": {
            "provider": "OpenAI ImageGen",
            "originalProjectAsset": True,
            "canonExact": False,
        },
    }


def source_record(kind: str, path: Path, image: Image.Image) -> dict[str, Any]:
    x_edges = split_edges(image.width, COLUMNS)
    y_edges = split_edges(image.height, ROWS)
    return {
        "kind": kind,
        "path": relative(path),
        "sha256": sha256(path),
        "format": image.format,
        "mode": image.mode,
        "dimensions": list(image.size),
        "grid": {
            "columns": COLUMNS,
            "rows": ROWS,
            "xEdges": list(x_edges),
            "yEdges": list(y_edges),
        },
    }


def load_masters() -> tuple[dict[str, Image.Image], list[dict[str, Any]]]:
    masters: dict[str, Image.Image] = {}
    records: list[dict[str, Any]] = []
    for kind, filename in MASTER_FILES.items():
        path = SOURCE_ROOT / filename
        if not path.is_file():
            raise FileNotFoundError(f"Missing OpenAI hub master: {path}")
        with Image.open(path) as source:
            if source.format != "PNG":
                raise ValueError(f"Expected PNG master, got {source.format}: {path}")
            source.load()
            if source.width < COLUMNS * 64 or source.height < ROWS * 64:
                raise ValueError(f"Master too small for an exact 5x2 split: {path} {source.size}")
            records.append(source_record(kind, path, source))
            masters[kind] = source.copy()
    for kind, filename in BIOFORGE_STANDALONE_FILES.items():
        path = SOURCE_ROOT / filename
        if not path.is_file():
            raise FileNotFoundError(f"Missing neutral BIOFORGE source: {path}")
        with Image.open(path) as source:
            if source.format != "PNG" or source.width < 128 or source.height < 128:
                raise ValueError(f"Invalid neutral BIOFORGE source: {path} {source.format} {source.size}")
            source.load()
            records.append({
                "kind": kind,
                "path": relative(path),
                "sha256": sha256(path),
                "format": source.format,
                "mode": source.mode,
                "dimensions": list(source.size),
                "standalone": True,
                "creatureVisible": False,
            })
            masters[kind] = source.copy()
    return masters, records


def generate() -> dict[str, Any]:
    if not features.check("webp"):
        raise RuntimeError("This Pillow build has no WebP support")
    masters, source_records = load_masters()
    outputs: list[dict[str, Any]] = []
    annex_records: list[dict[str, Any]] = []

    for index, annex in enumerate(ANNEXES):
        annex_dir = OUTPUT_ROOT / annex["id"]
        files: dict[str, str] = {}

        standalone_bioforge_background = annex["id"] == "bioforge"
        background_master = masters["bioforge-background"] if standalone_bioforge_background else masters["background"]
        background_source = SOURCE_ROOT / (BIOFORGE_BACKGROUND_FILE if standalone_bioforge_background else MASTER_FILES["background"])
        background_bounds = ((0, 0, background_master.width, background_master.height)
                             if standalone_bioforge_background
                             else source_cell_bounds(background_master.size, index))
        background_cell = background_master.copy() if standalone_bioforge_background else background_master.crop(background_bounds)
        far, mid, dark_trim = build_backgrounds(background_cell)
        for kind, image in (("far", far), ("mid", mid)):
            output = annex_dir / f"{kind}.webp"
            save_webp(image, output, alpha=False)
            processing = {
                "operation": "exact-5x2-cell + narrow-dark-frame-trim + cover-resize"
                if kind == "mid"
                else "derived-from-mid + gaussian-blur + desaturation + darkening",
                "darkFrameTrim": dark_trim,
                "target": list(BACKGROUND_SIZE),
            }
            if kind == "far":
                processing.update({
                    "derivedFrom": "mid.webp",
                    "gaussianBlurRadius": FAR_BLUR_RADIUS,
                    "brightness": FAR_BRIGHTNESS,
                    "color": FAR_COLOR,
                })
            outputs.append(output_record(
                output,
                image,
                annex=annex,
                kind=kind,
                source_path=background_source,
                index=None if standalone_bioforge_background else index,
                bounds=background_bounds,
                processing=processing,
            ))
            files[kind] = relative(output)

        for source_kind, output_kind in (("prop", "prop"), ("foreground", "foreground"), ("door", "door")):
            standalone_bioforge_layer = annex["id"] == "bioforge" and source_kind in {"prop", "door"}
            standalone_key = f"bioforge-{source_kind}"
            master = masters[standalone_key] if standalone_bioforge_layer else masters[source_kind]
            standalone_filename = BIOFORGE_STANDALONE_FILES.get(standalone_key)
            source_path = SOURCE_ROOT / (standalone_filename if standalone_bioforge_layer else MASTER_FILES[source_kind])
            bounds = (0, 0, master.width, master.height) if standalone_bioforge_layer else source_cell_bounds(master.size, index)
            cell = master.copy() if standalone_bioforge_layer else master.crop(bounds)
            cleaned, removed = remove_border_checker(cell)
            if removed < cell.width * cell.height * 0.01:
                raise ValueError(f"Checker flood fill removed too little in {source_kind} cell {annex['id']}")
            layer, composition = compose_alpha_layer(cleaned, output_kind)
            output = annex_dir / f"{output_kind}.webp"
            save_webp(layer, output, alpha=True)
            outputs.append(output_record(
                output,
                layer,
                annex=annex,
                kind=output_kind,
                source_path=source_path,
                index=None if standalone_bioforge_layer else index,
                bounds=bounds,
                processing={
                    "operation": (f"standalone-neutral-bioforge-{source_kind} + border-connected-RGB-checker-flood-fill + enclosed-checker-cleanup + bbox-padding"
                                  if standalone_bioforge_layer
                                  else "exact-5x2-cell + border-connected-RGB-checker-flood-fill + enclosed-checker-cleanup + bbox-padding"),
                    "checkerRemovedPixels": removed,
                    "checkerRemovedRatio": round(removed / (cell.width * cell.height), 6),
                    **composition,
                },
            ))
            files[output_kind] = relative(output)

        annex_records.append({
            **annex,
            "normalHubCreaturesVisible": False,
            "files": files,
        })

    report = {
        "schema": 71,
        "contractId": "tantalus-hub-commercial-annex-art-v71",
        "pipeline": "OpenAI ImageGen masters + deterministic exact 5x2 split + dedicated neutral BIOFORGE door + border-connected checker cleanup",
        "artProvider": "OpenAI ImageGen",
        "originalProjectAsset": True,
        "canonExact": False,
        "normalHubCreaturesVisible": False,
        "notes": {
            "bioforge": "Accès isolé vers un niveau séparé; les cuves du hub restent vides.",
            "archives": "Palimpsest couvre bestiaire, rapports et replays historiques.",
        },
        "grid": {
            "columns": COLUMNS,
            "rows": ROWS,
            "order": [annex["id"] for annex in ANNEXES],
        },
        "layerContract": {
            "far": {"dimensions": list(BACKGROUND_SIZE), "alpha": False, "derivedFrom": "mid"},
            "mid": {"dimensions": list(BACKGROUND_SIZE), "alpha": False},
            **{
                kind: {
                    "dimensions": list(size),
                    "alpha": True,
                    "padding": LAYER_PADDING[kind],
                }
                for kind, size in LAYER_SIZES.items()
            },
        },
        "provenance": {
            "provider": "OpenAI ImageGen",
            "kind": "original-project-art",
            "originalProjectAsset": True,
            "canonExact": False,
        },
        "sources": source_records,
        "annexes": annex_records,
        "outputs": outputs,
        "counts": {
            "annexes": len(annex_records),
            "layersPerAnnex": 5,
            "files": len(outputs),
        },
    }
    if len(outputs) != len(ANNEXES) * 5:
        raise RuntimeError(f"Expected 50 hub files, built {len(outputs)}")
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Built {len(outputs)} V71 hub assets and {relative(REPORT_PATH)}")
    return report


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def check() -> dict[str, Any]:
    """Validate the current 50-file release without changing any file."""

    require(REPORT_PATH.is_file(), f"Missing V71 hub report: {REPORT_PATH}")
    report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
    expected_order = [annex["id"] for annex in ANNEXES]
    expected_paths = {
        relative(OUTPUT_ROOT / annex_id / f"{kind}.webp")
        for annex_id in expected_order
        for kind in ("far", "mid", "prop", "foreground", "door")
    }

    require(report.get("schema") == 71, "Report schema must be 71")
    require(report.get("contractId") == "tantalus-hub-commercial-annex-art-v71", "Unexpected report contract")
    require(report.get("artProvider") == "OpenAI ImageGen", "OpenAI provenance is missing")
    require(report.get("originalProjectAsset") is True, "Assets must be marked as original project art")
    require(report.get("canonExact") is False, "canonExact must remain false")
    require(report.get("normalHubCreaturesVisible") is False, "Normal hub must contain no visible creature")
    require(report.get("grid", {}).get("order") == expected_order, "Annex board order drifted")
    require(report.get("counts") == {"annexes": 10, "layersPerAnnex": 5, "files": 50}, "Bad output counts")

    masters, current_sources = load_masters()
    del masters
    reported_sources = report.get("sources", [])
    require(len(reported_sources) == 7, "Report must track four OpenAI atlases and three neutral BIOFORGE sources")
    current_by_kind = {record["kind"]: record for record in current_sources}
    for record in reported_sources:
        current = current_by_kind.get(record.get("kind"))
        require(current is not None, f"Unknown source kind: {record.get('kind')}")
        require(record == current, f"Source master drifted: {record.get('path')}")

    annexes = report.get("annexes", [])
    require([record.get("id") for record in annexes] == expected_order, "Annex metadata order drifted")
    expected_labels = {annex["id"]: annex["label"] for annex in ANNEXES}
    for annex in annexes:
        require(annex.get("label") == expected_labels[annex["id"]], f"Label drift for {annex['id']}")
        require(annex.get("normalHubCreaturesVisible") is False, f"Creature policy drift for {annex['id']}")
        require(set(annex.get("files", {})) == {"far", "mid", "prop", "foreground", "door"}, f"Layer map incomplete for {annex['id']}")

    outputs = report.get("outputs", [])
    require(len(outputs) == 50, f"Expected 50 report outputs, got {len(outputs)}")
    require({record.get("path") for record in outputs} == expected_paths, "Report output inventory is not exact")
    records_by_annex: dict[str, dict[str, dict[str, Any]]] = {}
    seen_hashes: set[str] = set()
    for record in outputs:
        annex_id = record.get("annexId")
        kind = record.get("kind")
        require(annex_id in expected_order, f"Unknown annex output: {annex_id}")
        require(kind in {"far", "mid", "prop", "foreground", "door"}, f"Unknown hub layer: {kind}")
        require(record.get("annexLabel") == expected_labels[annex_id], f"Output label drift for {annex_id}")
        require(record.get("provenance") == {
            "provider": "OpenAI ImageGen",
            "originalProjectAsset": True,
            "canonExact": False,
        }, f"Output provenance drift for {record.get('path')}")
        path = ROOT / record["path"]
        try:
            path.resolve().relative_to(OUTPUT_ROOT.resolve())
        except ValueError as error:
            raise ValueError(f"Output escapes V71 hub directory: {record['path']}") from error
        require(path.is_file(), f"Missing hub output: {path}")
        require(sha256(path) == record.get("sha256"), f"SHA-256 mismatch: {record['path']}")
        seen_hashes.add(record["sha256"])
        with Image.open(path) as image:
            image.load()
            require(image.format == "WEBP", f"Not a WebP: {record['path']}")
            expected_size = BACKGROUND_SIZE if kind in {"far", "mid"} else LAYER_SIZES[kind]
            require(image.size == expected_size, f"Bad dimensions for {record['path']}: {image.size}")
            expected_mode = "RGB" if kind in {"far", "mid"} else "RGBA"
            require(image.mode == expected_mode, f"Bad mode for {record['path']}: {image.mode}")
            metrics = alpha_metrics(image)
            require(metrics == record.get("alpha"), f"Alpha report mismatch: {record['path']}")
            if kind in LAYER_SIZES:
                require(metrics["transparentRatio"] >= MIN_LAYER_TRANSPARENT_RATIO, f"Transparent surround missing: {record['path']}")
                require(metrics["occupiedPixels"] >= MIN_LAYER_OCCUPIED_PIXELS, f"Layer content missing: {record['path']}")
                require(metrics["partialAlphaPixels"] > 0, f"Antialiased alpha edge missing: {record['path']}")
                require(metrics["hiddenRgbPixels"] == 0, f"Hidden RGB found: {record['path']}")
        records_by_annex.setdefault(annex_id, {})[kind] = record

    require(len(seen_hashes) == 50, "Every hub layer must be an independent, visually distinct file")
    for annex_id, records in records_by_annex.items():
        require(set(records) == {"far", "mid", "prop", "foreground", "door"}, f"Five layers required for {annex_id}")
        with Image.open(ROOT / records["far"]["path"]) as far_image, Image.open(ROOT / records["mid"]["path"]) as mid_image:
            far_luma = ImageStat.Stat(far_image.convert("L")).mean[0]
            mid_luma = ImageStat.Stat(mid_image.convert("L")).mean[0]
            require(far_luma < mid_luma * 0.72, f"Far layer is not sufficiently dark for {annex_id}")

    print(f"Validated {len(outputs)} V71 hub assets without rewriting them")
    return report


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate the four sources, report and 50 existing outputs without writing",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        check() if args.check else generate()
    except (FileNotFoundError, OSError, RuntimeError, ValueError) as error:
        raise SystemExit(f"V71 hub art pipeline failed: {error}") from error


if __name__ == "__main__":
    main()
