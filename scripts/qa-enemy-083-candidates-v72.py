"""QA-only V72 candidate packaging; never changes production queues or assets."""
from pathlib import Path
import hashlib
import importlib.util
import json
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'assets/openai/sprites/frames/v72/enemy-083-albino-dust-runner'
OUT = FOLDER / 'qa-candidates'
spec = importlib.util.spec_from_file_location('candidate083_pipeline', Path(__file__).with_name('process-v66-enemy-batch.py'))
pipeline = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = pipeline
spec.loader.exec_module(pipeline)
OUT.mkdir(exist_ok=True)
clips = [('idle', 'idle-candidate.png', 6, True), ('move', 'move-candidate.png', 12, True), ('attack', 'attack-candidate.png', 12, False), ('death', 'death-final.png', 10, False)]
grid = {'columns': 4, 'rows': 2, 'cellWidth': 256, 'cellHeight': 256, 'guard': 16}
report = {'schema': 72, 'profileId': 'enemy-083-albino-dust-runner', 'status': 'candidate-only', 'canonExact': False, 'runtimeIntegrated': False,
          'requiredReviews': ['body-root-anchors', 'cross-clip-scale', 'reference-fidelity', 'motion-continuity'],
          'rejectedSource': 'death-candidate.png', 'rejectionReason': 'idle poses returned instead of requested death sequence',
          'safeCellReassignment': True, 'visualReview': {'identity': 'project-albino-quadruped-consistent-no-1to1-claim', 'idle': 'eight-alert-breathing-poses', 'move': 'subtle-motion-needs-run-cycle-review', 'attack': 'one-visible-extension-pounce-with-grounded-recovery', 'death': 'progressive-loss-of-support-and-terminal-prone-body'}, 'clips': []}
all_frames, all_reports = [], []
for clip, filename, fps, loop in clips:
    source_path = FOLDER / filename
    source = Image.open(source_path)
    entry = {'id': clip, 'source': source_path.relative_to(ROOT).as_posix(), 'sourceSha256': hashlib.sha256(source_path.read_bytes()).hexdigest(), 'sourceDimensions': list(source.size), 'reviewStatus': 'pending-visual-acceptance'}
    thumbnail = source.copy()
    thumbnail.thumbnail((1280, 960))
    thumbnail.save(OUT / f'{clip}-source-preview.webp', lossless=True, method=6)
    try:
        # Source inspection found tiny claw overhangs at regular cell edges.
        # The existing component proof permits only >90% ownership and bounded
        # spill; ambiguous ownership remains an error and no pixels are cut.
        frames, extraction = pipeline.split_source(source, clip, {'columns': 4, 'rows': 2, 'frameCount': 8}, True, True, True)
        atlas, placements = pipeline.normalize_frames(frames, extraction, grid, {'x': 128, 'y': 240}, remove_magenta_spill=True)
        qa = pipeline.validate_atlas(atlas, grid)
        destination = OUT / f'{clip}-unreviewed.webp'
        pipeline.save_lossless(atlas, destination)
        pipeline.save_preview(atlas, OUT / f'{clip}-unreviewed.gif', grid, fps, loop)
        entry.update({'technicalExtraction': 'pass', 'frameCount': len(frames), 'qa': qa, 'placements': placements,
                      'normalizedCandidate': destination.relative_to(ROOT).as_posix(), 'normalizedSha256': hashlib.sha256(destination.read_bytes()).hexdigest()})
        all_frames.extend(frames)
        all_reports.extend(extraction)
    except ValueError as error:
        entry.update({'technicalExtraction': 'blocked', 'reason': str(error), 'frameCount': 0})
    report['clips'].append(entry)
if len(all_frames) == 32:
    atlas, placements = pipeline.normalize_frames(all_frames, all_reports, {**grid, 'rows': 8}, {'x': 128, 'y': 240}, remove_magenta_spill=True)
    pipeline.save_lossless(atlas, OUT / 'all-unreviewed.webp')
    report['combinedCandidate'] = {'path': (OUT / 'all-unreviewed.webp').relative_to(ROOT).as_posix(), 'frameCount': 32, 'scaleStatus': 'single-common-scale-without-body-root-review'}
(OUT / 'candidate-qa.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'status': report['status'], 'runtimeIntegrated': False, 'clips': [{k: v for k, v in row.items() if k in ['id', 'technicalExtraction', 'reason', 'frameCount', 'sourceDimensions']} for row in report['clips']]}, ensure_ascii=False))
