"""Read sources; render diagnostic views only. Never publishes runtime art."""
import hashlib
import importlib.util
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('normalizer_v75_review', ROOT / 'scripts/process-v66-enemy-batch.py')
normalizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normalizer)
CLIPS = ('idle', 'move', 'attack', 'death')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    results = []
    for suffix in ('021-neuro-xeno-drone', '023-atarax-ripper'):
        profile = 'enemy-' + suffix
        meta_path = ROOT / f'assets/openai/sprites/metadata/v66/{profile}.json'
        meta = json.loads(meta_path.read_text(encoding='utf8'))
        frames, reports, anchors = [], [], []
        preserved = {}
        for source in meta['sources']:
            p = ROOT / source['path']
            preserved[source['path']] = digest(p)
            assert preserved[source['path']] == source['sha256']
            with Image.open(p) as original:
                extracted, extracted_reports = normalizer.split_source(original, source['clip'], {'columns':4,'rows':2,'frameCount':8}, True, True, True)
                frames.extend(extracted)
                reports.extend(extracted_reports)
                if suffix.startswith('023'):
                    # Native source pixels with coordinate grid, diagnostic only.
                    view = Image.new('RGB', (940, 520), '#101820')
                    draw = ImageDraw.Draw(view)
                    for i in range(2):
                        left = round(i * original.width / 4)
                        cell = original.crop((left, 0, round((i+1)*original.width/4), round(original.height/2))).convert('RGB')
                        view.paste(cell, (i*470, 38))
                        draw.text((i*470+4, 8), f'{source["clip"]} pose {i+1}; native coordinates', fill='white')
                        for x in range(0, 444, 20):
                            draw.line((i*470+x,38,i*470+x,482),fill='#555555',width=1)
                            draw.text((i*470+x,484),str(x),fill='white')
                        for y in range(0,444,20):
                            draw.line((i*470,38+y,i*470+444,38+y),fill='#555555',width=1)
                            draw.text((i*470+444,38+y),str(y),fill='white')
                    view.save(OUT / f'{profile}-{source["clip"]}-coordinates.png')
                    zoom = Image.new('RGB',(1000,520),'#101820')
                    zd = ImageDraw.Draw(zoom)
                    for i in range(2):
                        source_index = i+1 if source['clip']=='death' else i
                        left = round(source_index*original.width/4)
                        zd.text((i*500+4,4),f'{source["clip"]} source pose {source_index+1}',fill='white')
                        crop = original.crop((left+150,70,left+390,310)).convert('RGB').resize((480,480),Image.Resampling.NEAREST)
                        zoom.paste(crop,(i*500,20))
                        for x in range(150,391,20):
                            px=i*500+(x-150)*2
                            zd.line((px,20,px,500),fill='#555555')
                            zd.text((px,502),str(x),fill='white')
                        for y in range(70,311,20):
                            py=20+(y-70)*2
                            zd.line((i*500,py,i*500+480,py),fill='#555555')
                            zd.text((i*500+480,py),str(y),fill='white')
                    zoom.save(OUT/f'{profile}-{source["clip"]}-landmark-zoom.png')
        placements = meta['placements']
        for p in placements:
            anchors.append({'anchor':p['sourceAnchor'], 'landmark':p['sourceLandmark'], 'evidence':'Diagnostic reuse of prior coordinates, not a new signed review', 'confidence':'medium'})
        candidate, candidate_placements = normalizer.normalize_frames(frames,reports,meta['grid'],meta['pivot'],meta['sourceScaleByClip'],anchors,True)
        current = Image.open(ROOT / meta['normalized']).convert('RGBA')
        current_frames = normalizer.atlas_frames(current,meta['grid'])
        candidate_frames = normalizer.atlas_frames(candidate,meta['grid'])
        grid = Image.new('RGB',(1024,32*278),'#e5e7eb')
        draw = ImageDraw.Draw(grid)
        per_pose=[]
        for i,(old,new) in enumerate(zip(current_frames,candidate_frames)):
            for col,(frame,bg) in enumerate(((old,'#0a1118'),(new,'#0a1118'),(old,'#e5e7eb'),(new,'#e5e7eb'))):
                tile=Image.new('RGBA',(256,256),bg)
                tile.alpha_composite(frame)
                grid.paste(tile.convert('RGB'),(col*256,i*278+22))
            draw.text((5,i*278+3),f'{CLIPS[i//8]} {i%8+1}: current / strict-despill diagnostic / current-light / diagnostic-light',fill='black')
            per_pose.append({'index':i,'strictMagentaCurrent':int(normalizer.strict_magenta_spill_mask(np.array(old)).sum()),'strictMagentaDiagnostic':int(normalizer.strict_magenta_spill_mask(np.array(new)).sum())})
        # Split to keep every pose inspectable at native cell resolution.
        for c,clip in enumerate(CLIPS):
            grid.crop((0,c*8*278,1024,(c+1)*8*278)).save(OUT / f'{profile}-{clip}-alpha-comparison.png')
        for p,sha in preserved.items():
            assert digest(ROOT/p)==sha
        results.append({'profileId':profile,'sourcesPreserved':preserved,'currentAtlasSha256':digest(ROOT/meta['normalized']),'currentUniquePoses':len(set(hashlib.sha256(f.tobytes()).hexdigest() for f in current_frames)), 'poses':per_pose,'diagnosticValidation':normalizer.validate_atlas(candidate,meta['grid'])['findings'],'runtimePromotionAllowed':False})
    (OUT/'initial-diagnostics.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf8',newline='\n')
    print(json.dumps([{'profileId':r['profileId'],'unique':r['currentUniquePoses'],'strictMagentaBefore':sum(p['strictMagentaCurrent'] for p in r['poses']),'strictMagentaAfter':sum(p['strictMagentaDiagnostic'] for p in r['poses'])} for r in results]))


if __name__ == '__main__':
    main()
