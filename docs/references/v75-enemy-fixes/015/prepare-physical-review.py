"""Prowler source-registered physical review. No source pixels are edited."""
import copy
import hashlib
import json
import math
from pathlib import Path
from statistics import median
from PIL import Image, ImageDraw

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
ID='enemy-015-prowler'
BASE=ROOT/'docs/references/V66_BATCH_002_ANCHORS_B.json'
PREFIX='docs/references/v75-enemy-fixes/015/'

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def dump(name,value): (HERE/name).write_text(json.dumps(value,indent=2)+'\n',encoding='utf-8')

def main():
    anchors=copy.deepcopy(json.loads(BASE.read_text())['profiles'][ID])
    # Same posterior cranial-rim tip -> anterior rostral plate rim, manually
    # selected on native-size cell grids. Jaws, legs and tail are excluded.
    points={
        'idle': [[[259,193],[395,242]],[[228,194],[360,245]]],
        'move': [[[278,212],[386,262]],[[285,228],[391,279]]],
        'attack': [[[278,244],[376,282]],[[261,279],[360,321]]],
        'death': [[[296,219],[409,264]],[[239,227],[348,272]]],
    }
    measurements=[];source_hashes={};evidence=[]
    anchors.update(profileId=ID,status='reviewed',reviewer='Codex /root/gameplay_audit_fix',reviewedAt='2026-09-05',reviewedPoseCount=32,
        method='32 individually observed ribcage roots retained and visually counterchecked on full sources. Airborne attack3/4 use row1 grounded plane384 (contacts384/381); attack5 uses row2 median support372 (landing/recovery368/372/379), not the bottom of an airborne foot or the previous row origin. No per-pose scale. Source-plane estimates retain +/-10px uncertainty and do not certify world-space path traversal.',
        visualReview='All four complete sources and the licensed NECA image personally inspected. Anatomy-driven ribcage roots, never tail bounds centre. Grounded roots from prior B measurements counterchecked; three airborne support estimates re-reviewed against their own row and retained in an explicit overlay.')
    for i in (2,3,4):
        f=anchors['clips']['attack']['frames'][i]
        floor=384 if i<4 else 372
        f.update(anchor=[f['landmark'][0],floor],reviewed=True,bodyLandmarkReviewed=True,supportPlaneReviewed=True,
            trajectoryCertified=False,supportPlane='reviewed-adjacent-row-support-estimate',
            evidence=f'Attack pose{i+1}: visible ribcage root {f["landmark"]}. Flight support y={floor} is projected from the same nominal row: '+
                ('preceding planted claws at guarded y384/381; source bottom is not used as a false airborne landing.' if i<4 else 'following planted landing/recovery at guarded y368/372/379, median372. Previous row plane384 would insert a false12px step between row origins.')+
                ' Estimate uncertainty +/-10source pixels. Positive authored clearance retained; world collision path and runtime motion require separate tests.')
    for clip,review in anchors['clips'].items():
        path=ROOT/review['sourcePath']
        assert sha(path)==review['sourceSha256']
        source_hashes[clip]=sha(path)
        evidence.append(PREFIX+clip+'-physical-review.jpg')
        for index,ends in enumerate(points[clip]):
            measurements.append(dict(clip=clip,frame=index,landmark='posterior cranial-rim tip to anterior rostral plate rim, excluding mandible and appendages',
                endpoints=ends,lengthPx=round(math.dist(*ends),6),endpointUncertaintyPx=5,
                note='Manual same rigid cranial shield chord in first two low-rotation poses; +/-5source pixels per endpoint. Source image grid displayed at native ratio. This is interclip registration, not a canonical body-size claim.'))
        with Image.open(path) as source:
            out=source.convert('RGB');d=ImageDraw.Draw(out)
            for f in review['frames']:
                i=f['frame'];ox=round(i%4*out.width/4);oy=round(i//4*out.height/2)
                x,y=f['landmark'];ax,ay=f['anchor']
                d.text((ox+8,oy+8),f'{clip} {i+1}:({x},{y})->({ax},{ay}) +/-10px',fill='white',stroke_width=1,stroke_fill='black')
                d.line((ox+x,oy+y,ox+ax,oy+ay),fill='yellow',width=2)
                d.ellipse((ox+x-5,oy+y-5,ox+x+5,oy+y+5),outline='yellow',width=2)
                d.line((ox+15,oy+ay,ox+425,oy+ay),fill='#70ff9e',width=2)
                if i<2:
                    (x0,y0),(x1,y1)=points[clip][i]
                    d.line((ox+x0,oy+y0,ox+x1,oy+y1),fill='cyan',width=2)
            out.save(HERE/(clip+'-physical-review.jpg'),quality=96)
        assert sha(path)==source_hashes[clip]
    anchors['evidencePaths']=evidence
    lengths={clip:median(m['lengthPx'] for m in measurements if m['clip']==clip) for clip in points}
    scale=dict(profileId=ID,status='reviewed',reviewer='Codex /root/gameplay_audit_fix',reviewedAt='2026-09-05',baselineClip='idle',
        sourceScaleByClip={clip:round(lengths['idle']/lengths[clip],6) for clip in points},sourceSha256ByClip=source_hashes,
        measurements=measurements,evidencePaths=evidence,
        note='Two manually measured same rigid cranial-rim chords per clip; factors are median idle length / median clip length. Apply exactly one clip correction and one shared pack scale. No per-pose rescale, no source repainting and no artistic acceptance. Ground height is not inferred from tail extent.')
    document=dict(schema=1,batchId='batch-002',coordinates='nominal-source-cell',acceptedAutomatically=0)
    dump('anchor-review.json',{**document,'profiles':{ID:anchors}})
    dump('scale-review.json',{**document,'profiles':{ID:scale}})
    print(json.dumps(dict(sourceSha256ByClip=source_hashes,medianLengths=lengths,sourceScaleByClip=scale['sourceScaleByClip'])))

if __name__=='__main__': main()
