"""Review-only audit of two real Lurker attack ImageGen candidates.

Reads unchanged copied originals. Writes only docs/references/v82-lurker-attack.
No runtime asset, V66 manifest, acceptance flag, pose scale or pivot is changed.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs/references/v82-lurker-attack"
SOURCES = {
    "r1": {
        "file": "lurker-attack-r1-original.png",
        "sha256": "64f6814174ed151e63962570e9ce08d7f1543e0fba04483ee4e0680b2eec5a2c",
        "generationId": "exec-32b0e2ac-6430-4ebb-87b5-de50c9dfe273",
        "visualFinding": "Rejected: cell boundaries cut the silhouettes of poses 2, 3 and 4. Pose 4 contacts its left cell edge, while its right edge retains 6 px clearance; the original broad right-edge suspicion is refined by measured bounds.",
    },
    "r2": {
        "file": "lurker-attack-r2-original.png",
        "sha256": "1e857a7166c7ee72f523a950c0ca0b3dafecd4e303a3b30182f1fd8112032c4d",
        "generationId": "exec-1b07d3b9-8bf1-4d2f-be41-a7d309410c15",
        "visualFinding": "Candidate: eight legible isolated poses and a visible leap. Recovery poses 6-8 retain 35-37 px clearance above the fixed source extent guide, versus 0-1 px initially; physical registration remains unresolved. Whole-profile identity, rigid scale and runtime cadence remain unverified.",
    },
}
FONT = ImageFont.load_default()


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def bbox(mask: np.ndarray) -> list[int] | None:
    ys, xs = np.where(mask)
    return [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1] if xs.size else None


def edge_counts(mask: np.ndarray) -> dict[str, int]:
    return {"left": int(mask[:, 0].sum()), "top": int(mask[0].sum()),
            "right": int(mask[:, -1].sum()), "bottom": int(mask[-1].sum())}


def audit_source(key: str, spec: dict) -> tuple[dict, list[Image.Image]]:
    source_path = OUTPUT / "source-receipts" / spec["file"]
    if digest(source_path) != spec["sha256"]:
        raise ValueError(f"Original source hash changed: {source_path}")
    source = Image.open(source_path).convert("RGBA")
    if source.size != (1774, 887):
        raise ValueError(f"Unexpected 4x2 source dimensions: {source.size}")
    pixels = np.asarray(source)
    x_edges = [round(i * source.width / 4) for i in range(5)]
    y_edges = [round(i * source.height / 2) for i in range(3)]
    cells, records = [], []
    for index in range(8):
        col, row = index % 4, index // 4
        rect = [x_edges[col], y_edges[row], x_edges[col + 1], y_edges[row + 1]]
        cell = source.crop(rect)
        rgba = np.asarray(cell)
        alpha = rgba[..., 3]
        content = bbox(alpha >= 16)
        border = edge_counts(alpha >= 16)
        width, height = cell.size
        records.append({
            "pose": index + 1,
            "sourceRect": rect,
            "cellSize": [width, height],
            "alphaBoundsGt0": bbox(alpha > 0),
            "alphaBoundsGe16": content,
            "alphaBoundsGe128": bbox(alpha >= 128),
            "foregroundPixelsGe16": int((alpha >= 16).sum()),
            "semiTransparentPixels": int(((alpha > 0) & (alpha < 255)).sum()),
            "borderPixelsGe16": border,
            "borderPixelsGe128": edge_counts(alpha >= 128),
            "cellBoundaryContact": any(border.values()),
            "clearancePx": None if content is None else {
                "left": content[0], "top": content[1],
                "right": width - content[2], "bottom": height - content[3],
            },
            "rgbaSha256": hashlib.sha256(rgba.tobytes()).hexdigest(),
        })
        # Pad the rounded 443/444 px cells, never crop to the actor bounds.
        nominal = Image.new("RGBA", (444, 444))
        nominal.alpha_composite(cell, (0, 0))
        cells.append(nominal)
    nonempty = [record for record in records if record["alphaBoundsGe16"]]
    guide_y = max(record["alphaBoundsGe16"][3] - 1 for record in nonempty)
    for record in nonempty:
        record["lowestAlphaPixelY"] = record["alphaBoundsGe16"][3] - 1
        record["clearanceAboveFixedGuidePx"] = guide_y - record["lowestAlphaPixelY"]
    contacts = [record["pose"] for record in records if record["cellBoundaryContact"]]
    return {
        "candidate": key,
        "sourcePath": relative(source_path),
        "sourceSha256": spec["sha256"],
        "generationId": spec["generationId"],
        "sourceSize": list(source.size),
        "sourceBytes": source_path.stat().st_size,
        "sourceAlphaExtrema": [int(pixels[..., 3].min()), int(pixels[..., 3].max())],
        "transparentPixelPercent": round(float((pixels[..., 3] == 0).mean()) * 100, 4),
        "grid": [4, 2], "gridXEdges": x_edges, "gridYEdges": y_edges,
        "poseCount": len(nonempty),
        "uniqueRgbaPoseCount": len({record["rgbaSha256"] for record in records}),
        "cellBoundaryContactPoses": contacts,
        "technicalCellIsolationPass": len(nonempty) == 8 and not contacts,
        "fixedDiagnosticGuideY": guide_y,
        "guideMeaning": "Lowest alpha extent among all eight cells, NOT a measured anatomical foot/root or certified physical floor.",
        "previewRegistration": "Nominal 444x444 cell origin fixed for every pose. No per-pose translation, rescale, foot alignment or fabricated in-between frames.",
        "registrationReview": {
            "initialClearancePx": records[0].get("clearanceAboveFixedGuidePx"),
            "finalClearancePx": records[-1].get("clearanceAboveFixedGuidePx"),
            "interpretation": "Different lower extents are preserved as authored. A nonzero recovery offset requires an anatomical body-root and physical landing review; it is not silently repaired by grounding every frame.",
            "physicalRootCalibrated": False,
        },
        "visualFinding": spec["visualFinding"],
        "status": "rejected-visual-cutoff" if key == "r1" else "technical-reject-cell-contact" if contacts else "attack-candidate-pending-whole-profile-review",
        "accepted": False, "runtimeIntegrated": False, "canonExact": False,
        "frames": records,
    }, cells


def paint_cell(cell: Image.Image, record: dict, guide_y: int, size: int) -> Image.Image:
    canvas = Image.new("RGB", (444, 444), (17, 24, 29))
    canvas.paste(cell, (0, 0), cell)
    draw = ImageDraw.Draw(canvas)
    draw.line((0, guide_y, 443, guide_y), fill=(96, 133, 111), width=1)
    bounds = record["alphaBoundsGe16"]
    if bounds:
        x, y, right, bottom = bounds
        draw.rectangle((x, y, right - 1, bottom - 1), outline=(240, 145, 65), width=1)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def previews(record: dict, cells: list[Image.Image]) -> list[dict]:
    key, cell_size, label_height, header = record["candidate"], 240, 26, 58
    contact = Image.new("RGB", (cell_size * 4, (cell_size + label_height) * 2 + header), (12, 18, 24))
    draw = ImageDraw.Draw(contact)
    draw.text((12, 8), f"LURKER ATTACK V82 {key.upper()} / SOURCE-CELL REVIEW / NOT ACCEPTED", font=FONT, fill=(225, 235, 243))
    draw.text((12, 29), "Fixed cell origin and scale. Orange = alpha bounds. Green = fixed extent guide, not a foot anchor.", font=FONT, fill=(178, 192, 201))
    gif_frames = []
    for index, cell in enumerate(cells):
        pose = record["frames"][index]
        x, y = (index % 4) * cell_size, header + (index // 4) * (cell_size + label_height)
        contact.paste(paint_cell(cell, pose, record["fixedDiagnosticGuideY"], cell_size), (x, y + label_height))
        message = f"POSE {index + 1} / border {'CONTACT' if pose['cellBoundaryContact'] else 'clear'} / dy {pose.get('clearanceAboveFixedGuidePx', '?')}"
        draw.text((x + 6, y + 6), message, font=FONT, fill=(255, 126, 106) if pose["cellBoundaryContact"] else (199, 222, 207))
        frame = Image.new("RGB", (360, 416), (12, 18, 24))
        frame.paste(paint_cell(cell, pose, record["fixedDiagnosticGuideY"], 336), (12, 48))
        frame_draw = ImageDraw.Draw(frame)
        frame_draw.text((10, 9), f"LURKER {key.upper()} / {index + 1}/8 / REVIEW ONLY", font=FONT, fill=(225, 235, 243))
        frame_draw.text((10, 27), "Fixed origin / no foot recentering", font=FONT, fill=(173, 193, 205))
        frame_draw.text((10, 395), "Timing provisional / attack not runtime approved", font=FONT, fill=(194, 176, 145))
        gif_frames.append(frame.convert("P", palette=Image.Palette.ADAPTIVE, colors=256))
    contact_path = OUTPUT / f"lurker-attack-{key}-contact.jpg"
    gif_path = OUTPUT / f"lurker-attack-{key}-fixed-cell-review.gif"
    contact.save(contact_path, quality=91, subsampling=0)
    gif_frames[0].save(gif_path, save_all=True, append_images=gif_frames[1:], duration=[150, 120, 90, 90, 100, 120, 170, 550], loop=0, disposal=2, optimize=False)
    return [{"path": relative(path), "sha256": digest(path), "bytes": path.stat().st_size} for path in (contact_path, gif_path)]


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    candidates = []
    for key, spec in SOURCES.items():
        record, cells = audit_source(key, spec)
        record["diagnosticEvidence"] = previews(record, cells)
        candidates.append(record)
    report = {
        "schema": 1, "release": "v82", "kind": "lurker-attack-candidate-review-only",
        "sourcePixelsModified": 0, "normalizationPerformed": False,
        "runtimeIntegrated": False, "accepted": False, "canonExact": False,
        "referenceTransfer": "Official Lurker reference visually consulted, but ImageGen could not read its local attachment because of an ACL error. These successful calls used a descriptive prompt; no image-conditioned or 1:1 fidelity is claimed.",
        "reviewLimits": ["Only attack candidates, not an accepted complete enemy profile.", "Eight distinct cell images do not prove anatomical identity, scale coherence or animation quality.", "Fixed-cell GIF preserves authored leap height; no grounded per-frame normalization was applied.", "Alpha bounds and border contacts do not prove all silhouettes are anatomically complete."],
        "generator": {"path": relative(Path(__file__).resolve()), "sha256": digest(Path(__file__))},
        "candidates": candidates,
    }
    (OUTPUT / "technical-audit.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    lines = ["# Lurker V82 — revue des candidats d'attaque", "", "Deux vraies sorties ImageGen conservées sans retouche. Aucun profil accepté ni intégré au runtime.", "", "| Candidat | Poses | Contacts de bord alpha ≥16 | Décision |", "| --- | ---: | --- | --- |"]
    for candidate in candidates:
        lines.append(f"| {candidate['candidate'].upper()} | {candidate['poseCount']}/8 | {candidate['cellBoundaryContactPoses']} | {candidate['status']} |")
    lines += ["", "R1 : les silhouettes touchent les frontières des cellules 2, 3 et 4. La pose 4 touche son bord gauche ; son bord droit conserve 6 px de marge. La mesure précise ainsi le soupçon visuel initial de débordement à droite. La planche reste rejetée pour défaut d'isolation des poses.", "", "R2 : candidat uniquement. Les huit cellules sont isolées, mais les poses de récupération 6–8 restent 35–37 px au-dessus de la ligne initiale de référence, contre 0–1 px pour les poses 1–2. Le bond atteint 97 px de dégagement en pose 4. Ces décalages ne sont pas supprimés : la racine anatomique, l'atterrissage, l'identité face aux autres clips et la calibration de taille restent à contrôler.", "", "Les sources sont RGBA 1774×887 en grille 4×2. Les GIF utilisent une cellule nominale fixe 444×444, complétée d'au plus un pixel transparent selon l'arrondi de grille. Aucune pose n'est déplacée, agrandie ou recalée par ses pieds : la garde au sol pendant le bond reste celle de la source. La ligne verte représente seulement l'étendue alpha la plus basse de la planche, pas une racine anatomique validée.", "", "Le rythme des GIF sert à la revue : il ne valide pas le timing runtime, et leur répétition est un moyen d'inspection. Aucune image intermédiaire n'est inventée.", "", "La référence officielle a été consultée visuellement mais n'a pas pu être lue par ImageGen à cause d'une erreur ACL. Les appels réussis étaient descriptifs. Fidélité 1:1 et conditionnement par cette image ne sont pas revendiqués.", "", "Preuves : `technical-audit.json`, `source-receipts/`, les deux contacts JPEG et les deux GIF à origine fixe. Aucune donnée V66 ni aucun asset runtime n'est modifié.", ""]
    (OUTPUT / "technical-review.md").write_text("\n".join(lines), encoding="utf-8", newline="\n")
    print(json.dumps({"candidates": [{"id": candidate["candidate"], "poseCount": candidate["poseCount"], "borderContacts": candidate["cellBoundaryContactPoses"], "status": candidate["status"]} for candidate in candidates], "accepted": False, "runtimeIntegrated": False}, indent=2))


if __name__ == "__main__":
    main()
