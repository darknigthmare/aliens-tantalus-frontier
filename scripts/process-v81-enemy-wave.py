#!/usr/bin/env python3
"""Normalize/check only the reviewed Crusher and Spitter V81 wave."""
from __future__ import annotations

import argparse
import copy
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / "docs/references/V66_ENEMY_BATCH_QUEUE.json"
PROFILE_IDS = ("enemy-009-crusher", "enemy-010-spitter")

SPECS = {
    "enemy-009-crusher": {
        "anchor": "docs/references/V81_ENEMY_009_ANCHOR_REVIEW.json",
        "scale": None,
        "allowCellReassignment": False,
    },
    "enemy-010-spitter": {
        "anchor": "docs/references/V81_ENEMY_010_ANCHOR_REVIEW.json",
        "scale": "docs/references/V81_ENEMY_010_SCALE_REVIEW.json",
        "allowCellReassignment": True,
    },
}


def load_v66_pipeline():
    path = ROOT / "scripts/process-v66-enemy-batch.py"
    spec = importlib.util.spec_from_file_location("process_v66_enemy_batch", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load the V66 normalizer")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def v81_job(source: dict) -> dict:
    job = copy.deepcopy(source)
    profile_id = job["profileId"]
    job["normalizationRelease"] = "v81"
    job["normalizationScript"] = "scripts/process-v81-enemy-wave.py"
    job["normalizedPath"] = f"assets/openai/sprites/normalized/enemy-profiles-v81/{profile_id}.webp"
    job["metadataPath"] = f"assets/openai/sprites/metadata/v81/{profile_id}.json"
    job["previewPath"] = f"assets/openai/sprites/previews/v81/{profile_id}/all.gif"
    for clip in job["clips"]:
        clip["normalizedPath"] = f"assets/openai/sprites/normalized/enemy-clips-v81/{profile_id}/{clip['id']}.webp"
        clip["previewPath"] = f"assets/openai/sprites/previews/v81/{profile_id}/{clip['id']}.gif"
    return job


def selected_jobs(profile_id: str | None) -> list[dict]:
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))
    wanted = {profile_id} if profile_id else set(PROFILE_IDS)
    jobs = [v81_job(job) for job in queue["jobs"] if job.get("profileId") in wanted]
    if {job["profileId"] for job in jobs} != wanted:
        raise ValueError("V81 profile selection does not match the immutable V66 queue")
    return jobs


def run(job: dict, check: bool) -> dict:
    pipeline = load_v66_pipeline()
    options = SPECS[job["profileId"]]
    if check:
        return pipeline.check_profile(
            job,
            root=ROOT,
            remove_enclosed_magenta_matte=True,
            remove_enclosed_magenta_aa_fringe=True,
            remove_magenta_spill=True,
            anchor_review=options["anchor"],
            scale_review=options["scale"],
            trim_transparent_padding=True,
        )
    return pipeline.process_profile(
        job,
        root=ROOT,
        allow_cell_reassignment=options["allowCellReassignment"],
        remove_enclosed_magenta_matte=True,
        remove_enclosed_magenta_aa_fringe=True,
        remove_magenta_spill=True,
        anchor_review=options["anchor"],
        scale_review=options["scale"],
        trim_transparent_padding=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", choices=PROFILE_IDS)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    jobs = selected_jobs(args.profile)
    if args.dry_run:
        print(json.dumps({"release": "v81", "jobs": [{
            "profileId": job["profileId"], "sources": [clip["sourcePath"] for clip in job["clips"]],
            "normalized": job["normalizedPath"], "metadata": job["metadataPath"], **SPECS[job["profileId"]]
        } for job in jobs]}, indent=2))
        return
    results = [run(job, args.check) for job in jobs]
    print(json.dumps({
        "release": "v81",
        "mode": "check" if args.check else "normalize",
        "profiles": len(results),
        "poses": sum(result["frameCount"] for result in results),
        "acceptedAutomatically": 0,
        "results": [{
            "profileId": result["profileId"],
            "path": result["normalized"],
            "findings": result["validation"]["findings"],
        } for result in results],
    }, indent=2))


if __name__ == "__main__":
    main()
