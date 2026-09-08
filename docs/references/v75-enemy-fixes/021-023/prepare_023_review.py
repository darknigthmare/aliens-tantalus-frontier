"""Materialize explicit per-profile physical reviews; never normalizes art."""
import copy
import hashlib
import json
import math
from pathlib import Path
from statistics import median
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
PROFILE='enemy-023-atarax-ripper'


def write_json(path,data):
    path.write_text(json.dumps(data,indent=2)+'\n',encoding='utf8',newline='\n')


def main():
    old=json.loads((ROOT/'docs/references/V66_BATCH_002_ANCHOR_REVIEW.json').read_text(encoding='utf8'))
    entry=copy.deepcopy(old['profiles'][PROFILE])
    points=json.loads((OUT/'023-manual-scale-points.json').read_text(encoding='utf8'))
    entry.update(reviewer='Codex next50_art_review V75',reviewedAt='2026-09-05',
        method='All 32 prior manually observed thoracic landmarks independently checked on the four unchanged active source boards and prior marked overlays. Horizontal body points retained; root Y is the observed planted-foot/resting-body support edge, exactly three transparent extraction-padding pixels above the former guarded root. Trim transparent padding is required, never fit each frame to its bounds. No aerial pose occurs in these four clips.',
        visualReview='Physical registration only. Alpha and final attack/loop review are documented separately; this review cannot promote the profile.')
    evidence=[]
    lengths={}
    measurements=[]
    for m in points['measurements']:
        length=math.dist(*m['endpoints'])
        lengths.setdefault(m['clip'],[]).append(length)
        measurements.append({**m,'lengthPx':round(length,6),'landmark':points['landmark'],'uncertaintyPx':points['uncertaintyPx'],'note':points['note']})
    for clip,data in entry['clips'].items():
        source=ROOT/f'assets/openai/sprites/frames/v66/batch-002/{PROFILE}/{clip}.png'
        assert hashlib.sha256(source.read_bytes()).hexdigest()==data['sourceSha256']
        with Image.open(source) as original:
            image=original.convert('RGB')
        draw=ImageDraw.Draw(image)
        for frame in data['frames']:
            frame['anchor'][1]-=3
            frame['uncertaintyPx']=14
            frame['evidence']='V75 independent reinspection: marked thorax remains on the same ribcage mass, not a tail or skull bound. Grounded sole/resting-body support is three source pixels above the old transparent extraction guard. New overlay shows the actual root without the former padding.'
            ox=round((frame['frame']%4)*image.width/4)
            oy=round((frame['frame']//4)*image.height/2)
            x,y=frame['landmark']; ax,ay=frame['anchor']
            draw.line((ox+x,oy+y,ox+ax,oy+ay),fill='#ffff60',width=2)
            draw.ellipse((ox+x-4,oy+y-4,ox+x+4,oy+y+4),outline='#ffff60',width=2)
            draw.line((ox+ax-20,oy+ay,ox+ax+20,oy+ay),fill='#50ff80',width=2)
            draw.text((ox+4,oy+4),f'{clip} {frame["frame"]+1}: root {ax},{ay}',fill='white',stroke_width=1,stroke_fill='black')
        for m in measurements:
            if m['clip']!=clip: continue
            ox=round((m['frame']%4)*image.width/4);oy=round((m['frame']//4)*image.height/2)
            (x1,y1),(x2,y2)=m['endpoints']
            draw.line((ox+x1,oy+y1,ox+x2,oy+y2),fill='#50ffff',width=2)
            for x,y in m['endpoints']:draw.ellipse((ox+x-4,oy+y-4,ox+x+4,oy+y+4),outline='#50ffff',width=2)
        destination=OUT/f'023-{clip}-physical-review.png'
        image.save(destination)
        evidence.append(destination.relative_to(ROOT).as_posix())
    entry['evidencePaths']=evidence+[ (OUT/'023-manual-scale-points.json').relative_to(ROOT).as_posix() ]
    document={'schema':1,'batchId':'batch-002','coordinates':'nominal-source-cell','profiles':{PROFILE:entry}}
    write_json(OUT/'023-anchor-review.json',document)
    baseline=median(lengths['idle'])
    scale={'status':'reviewed','reviewer':'Codex next50_art_review V75','reviewedAt':'2026-09-05',
        'note':points['note']+' One median correction per complete clip from active PNGs, applied once by the normalizer; no per-pose fitting.',
        'baselineClip':'idle','sourceScaleByClip':{c:round(baseline/median(v),6) for c,v in lengths.items()},
        'sourceSha256ByClip':{c:v['sourceSha256'] for c,v in entry['clips'].items()},
        'measurements':measurements,'evidencePaths':entry['evidencePaths']}
    write_json(OUT/'023-scale-review.json',{'schema':1,'batchId':'batch-002','coordinates':'nominal-source-cell','profiles':{PROFILE:scale}})
    print(json.dumps({'factors':scale['sourceScaleByClip'],'sourceMedianPx':{c:median(v) for c,v in lengths.items()}}))


if __name__=='__main__':main()
