"""Read-only asset audit; writes diagnostics only alongside this script."""
import hashlib
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PROFILE = sys.argv[1]
assert PROFILE in ('enemy-054-albino-facehugger','enemy-055-albino-chestburster')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    metadata_path = ROOT / f'assets/openai/sprites/metadata/v66/{PROFILE}.json'
    metadata = json.loads(metadata_path.read_text(encoding='utf-8'))
    atlas_path = ROOT / metadata['normalized']
    before = sha(atlas_path)
    with Image.open(atlas_path) as original:
        atlas = original.convert('RGBA')
    contact = Image.new('RGB', (1024, 8 * 280), '#263139')
    draw = ImageDraw.Draw(contact)
    poses = []
    seen = set()
    for index, placement in enumerate(metadata['placements']):
        x, y = index % 4 * 256, index // 4 * 256
        frame = atlas.crop((x, y, x+256, y+256))
        a = np.array(frame).astype(np.int16)
        r, g, b, alpha = (a[..., i] for i in range(4))
        strict = (alpha >= 16) & (r > 160) & (b > 160) & (np.minimum(r,b) > g+35)
        # Diagnostic only: low-value violet may be reflected artwork or matte fringe.
        # Do not delete/recolor automatically on this broader detector.
        violet = (alpha >= 16) & (r > 70) & (b > 70) & (np.minimum(r,b) > g+35)
        visible = np.argwhere(alpha >= 16)
        bounds = [int(visible[:,1].min()), int(visible[:,0].min()), int(visible[:,1].max()+1), int(visible[:,0].max()+1)]
        digest = hashlib.sha256(frame.tobytes()).hexdigest()
        seen.add(digest)
        root_error = max(abs(placement['renderedAnchor'][i] - metadata['pivot'][axis]) for i,axis in enumerate(('x','y')))
        assert root_error < 1
        assert abs(placement['appliedScale'] - metadata['scale']*metadata['sourceScaleByClip'][placement['clip']]) < 1e-8
        assert not strict.any()
        assert not any(np.any(a[edge][:,3] >= 16) for edge in (0,-1))
        assert not np.any(a[:,0,3] >= 16) and not np.any(a[:,-1,3] >= 16)
        ys, xs = np.where(violet)
        poses.append({'clip':placement['clip'], 'pose':placement['clipFrame']+1, 'opaqueBoundsAlpha16':bounds,
            'opaqueHeightPx':bounds[3]-bounds[1], 'opaqueWidthPx':bounds[2]-bounds[0],
            'sourceLandmark':placement['sourceLandmark'], 'sourceAnchor':placement['sourceAnchor'],
            'renderedRootMaxErrorPx':root_error, 'sourceScale':placement['sourceScale'], 'appliedScale':placement['appliedScale'],
            'strictMagentaPixelCount':int(strict.sum()), 'lowValueVioletDiagnosticPixelCount':int(violet.sum()),
            'lowValueVioletBounds':None if not violet.any() else [int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)],
            'rgbaSha256':digest})
        cx, cy = index % 4 * 256, index // 4 * 280
        bg = Image.new('RGBA',(256,256),'#263139'); bg.alpha_composite(frame)
        contact.paste(bg.convert('RGB'),(cx,cy+24))
        draw.text((cx+8,cy+5),f"{placement['clip']} {placement['clipFrame']+1} | violet={int(violet.sum())}",fill='white')
        draw.line((cx+16,cy+264,cx+240,cy+264),fill='#496c5a')
        draw.line((cx+128,cy+257,cx+128,cy+272),fill='#cfad55')
    assert len(seen) == 32
    assert sha(atlas_path) == before == metadata['normalizedSha256']
    evidence = [{'path':str(p.relative_to(ROOT)).replace(chr(92),'/'), 'sha256':sha(p)} for p in [metadata_path,atlas_path,HERE/f'{PROFILE}.anchor-review.fragment.json',HERE/f'{PROFILE}.scale-review.fragment.json']]
    for c in ('idle','move','attack','death'):
        p=ROOT/f'assets/openai/sprites/frames/v66/batch-004/{PROFILE}/{c}.png'
        evidence.append({'path':str(p.relative_to(ROOT)).replace(chr(92),'/'),'sha256':sha(p)})
    output = {'profileId':PROFILE,'reviewedAt':'2026-09-05','artAccepted':False,'runtimeIntegratedByThisAudit':False,
        'sourcePixelsModified':0,'uniquePoses':len(seen),'grid':metadata['grid'],'pivot':metadata['pivot'],
        'scaleInterpretation':'single-final-pack-scale applied once to immutable source plus one measured clip factor',
        'packScale':metadata['scale'],'sourceScaleByClip':metadata['sourceScaleByClip'],
        'strictMagentaPixelCount':sum(p['strictMagentaPixelCount'] for p in poses),
        'lowValueVioletDiagnosticPixelCount':sum(p['lowValueVioletDiagnosticPixelCount'] for p in poses),
        'lowValueVioletInterpretation':'Broader diagnostic, not automatically removable pixels; visual review required. Does not contradict the narrower strict-magenta gate.',
        'evidence':evidence,'poses':poses}
    contact.save(HERE/f'{PROFILE}-normalized-contact.png')
    (HERE/f'{PROFILE}-normalized-metrics.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in output.items() if k != 'poses'},indent=2))


if __name__ == '__main__':
    main()
