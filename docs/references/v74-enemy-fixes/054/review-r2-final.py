"""Reproducible R2 diagnostic only; never overwrites active assets or reviews."""
import copy
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import statistics
import sys
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
OLD = ROOT / 'docs/references/v73-next50-audit/054-055'
PROFILE = 'enemy-054-albino-facehugger'
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('normalizer', ROOT / 'scripts/process-v66-enemy-batch.py')
normalizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normalizer)
SOURCE = ROOT / f'assets/openai/sprites/frames/v74/{PROFILE}/attack-clean-r2.png'
GRID = dict(cellWidth=256, cellHeight=256, columns=4, rows=8, guard=16)
PIVOT = dict(x=128, y=240)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def dump(name, data):
    (HERE / name).write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')

def reviews():
    anchors = json.loads((OLD / f'{PROFILE}.anchor-review.fragment.json').read_text())
    scales = json.loads((OLD / f'{PROFILE}.scale-review.fragment.json').read_text())
    a, s = anchors['profiles'][PROFILE], scales['profiles'][PROFILE]
    # Selected manually on the two enlarged source rows, not bbox inference.
    landmarks = [(286,361),(248,365),(242,354),(216,243),(256,188),(289,250),(253,309),(250,314)]
    frames = []
    for i, (x,y) in enumerate(landmarks):
        floor = 417 if i < 4 else 364
        frames.append(dict(frame=i, reviewed=True, anchor=[x,floor], landmark=[x,y], confidence='medium', uncertaintyPx=10,
            evidence=f'R2 attack pose {i+1}: visible ventral main-body hub where the proximal walking fingers join at ({x},{y}); excludes tail and finger tips. Vertical projection to neighbouring grounded row support plus extraction guard y={floor} preserves the launch/landing arc. Manual uncertainty +/-10 source pixels; no per-pose rescaling.'))
    a['clips']['attack'] = dict(sourceSha256=sha(SOURCE), sourceSize=[1774,887], frames=frames)
    a['method'] = 'V73 unchanged idle/move/death roots retained by source SHA. R2 attack roots manually remeasured: ventral main-body finger hub projected to grounded row plane y417/y364; not copied from the shifted V73 attack.'
    a['visualReview'] = 'R2 full source and both enlarged rows personally inspected; physical registration only. Other clips retain their independent V73 source-hash-bound reviews. Artistic acceptance is a separate decision.'
    a['evidencePaths'] = [p for p in a['evidencePaths'] if '-attack-' not in p] + ['docs/references/v74-enemy-fixes/054/attack-r2-root-review.jpg']
    old_measure = next(m for m in s['measurements'] if m['clip']=='attack')
    s['measurements'] = [m for m in s['measurements'] if m['clip'] != 'attack']
    for i, ends in [(0,[[221,346],[324,351]]),(7,[[180,302],[286,311]])]:
        m = copy.deepcopy(old_measure)
        m.update(frame=i, endpoints=ends, lengthPx=round(math.dist(*ends),6), note='R2 manually measured same dorsal main-body plate chord in low-rotation poses 1 and 8. Tail/fingers/ventral sac excluded; +/-5 source pixels per endpoint. Soft-tissue registration estimate, not a canon dimension.')
        s['measurements'].append(m)
    med = lambda clip: statistics.median(m['lengthPx'] for m in s['measurements'] if m['clip']==clip)
    s['sourceScaleByClip']['attack'] = round(med('idle') / med('attack'),6)
    s['sourceSha256ByClip']['attack'] = sha(SOURCE)
    s['evidencePaths'] = list(a['evidencePaths'])
    for document in (anchors,scales):
        document.update(acceptedAutomatically=0, diagnosticCandidate=True,
            artisticStatus='blocked-pose2-aperture-filled', runtimePromotionAllowed=False,
            sourceSubstitution='R2 path only in diagnostic; active V66 attack source is unchanged. Parent must explicitly replace the source before these proposed fragments can validate the active job.')
    dump('attack-r2-anchor-review.proposed.json', anchors)
    dump('attack-r2-scale-review.proposed.json', scales)
    return a,s

def root_overlay(a,s):
    out = Image.open(SOURCE).convert('RGB')
    draw = ImageDraw.Draw(out)
    for f in a['clips']['attack']['frames']:
        i=f['frame']; ox=round(i%4*out.width/4); oy=round(i//4*out.height/2)
        x,y=f['landmark']; ax,ay=f['anchor']
        draw.text((ox+8,oy+8),f'R2 pose {i+1}: ({x},{y}) -> ({ax},{ay}) +/-10px',fill='white',stroke_width=1,stroke_fill='black')
        draw.line((ox+x,oy+y,ox+ax,oy+ay),fill='yellow',width=2)
        draw.ellipse((ox+x-5,oy+y-5,ox+x+5,oy+y+5),outline='yellow',width=2)
        draw.line((ox+20,oy+ay,ox+420,oy+ay),fill='#70ff9e',width=2)
        for m in s['measurements']:
            if m['clip']!='attack' or m['frame']!=i: continue
            (x0,y0),(x1,y1)=m['endpoints']
            draw.line((ox+x0,oy+y0,ox+x1,oy+y1),fill='cyan',width=2)
    out.save(HERE/'attack-r2-root-review.jpg',quality=96)

def counts(cell):
    p=np.asarray(cell,dtype=np.int16); r,g,b,a=(p[...,i] for i in range(4))
    broad=(a>=16)&(r>70)&(b>70)&(np.minimum(r,b)>g+35)
    strict=(a>=16)&(r>160)&(b>160)&(np.minimum(r,b)>g+35)
    return dict(broadVioletPixels=int(broad.sum()),strictMagentaPixels=int(strict.sum()),opaqueBounds=list(cell.getchannel('A').getbbox()))

def frame(atlas,i):
    x,y=i%4*256,i//4*256
    return atlas.crop((x,y,x+256,y+256))

def alpha_holes(cell):
    mask=np.asarray(cell)[...,3]==0
    components=normalizer._pipeline.connected_components(mask)
    return [dict(area=c.area,bounds=[c.left,c.top,c.right,c.bottom]) for c in components
        if c.left>0 and c.top>0 and c.right<cell.width and c.bottom<cell.height]

def focus_evidence(old,new):
    roi=(140,205,178,241)
    out=Image.new('RGB',(912,900),'#142229');draw=ImageDraw.Draw(out)
    for i,atlas in enumerate((old,new)):
        cell=frame(atlas,17).crop(roi)
        for j,bg in enumerate(('#18282f','#e5e3da')):
            zoom=Image.alpha_composite(Image.new('RGBA',cell.size,bg),cell).resize((456,432),Image.Resampling.NEAREST)
            out.paste(zoom.convert('RGB'),(i*456,j*450+18))
            draw.text((i*456+8,j*450+3),('V73 final','R2 final despill')[i]+' / pose2 / x12',fill='white')
    out.save(HERE/'attack-r2-pose2-still-blocked.png')
    return dict(roi=list(roi),magnification=12,V73EnclosedZeroAlphaHoles=alpha_holes(frame(old,17)),
        R2EnclosedZeroAlphaHoles=alpha_holes(frame(new,17)),
        verdict='BLOCKED: formerly transparent finger gap is filled by opaque rose/ivory pixels; residual purple pixels remain. Visual inspection on dark/light backgrounds confirms this is not the requested empty aperture.')

def main():
    protected=[ROOT/f'assets/openai/sprites/frames/v66/batch-004/{PROFILE}/attack.png',
        OLD/f'{PROFILE}.anchor-review.fragment.json',OLD/f'{PROFILE}.scale-review.fragment.json']
    protected_hashes={str(p.relative_to(ROOT)):sha(p) for p in protected}
    a,s=reviews(); root_overlay(a,s)
    images=[]; reports=[]; roots=[]; source_hashes={}
    for clip in ('idle','move','attack','death'):
        source=SOURCE if clip=='attack' else ROOT/f'assets/openai/sprites/frames/v66/batch-004/{PROFILE}/{clip}.png'
        source_hashes[str(source.relative_to(ROOT))]=sha(source)
        assert sha(source)==a['clips'][clip]['sourceSha256']
        with Image.open(source) as image:
            cells,info=normalizer.split_source(image,clip,dict(columns=4,rows=2,frameCount=8),True,True,True)
        images.extend(cells); reports.extend(info); roots.extend(a['clips'][clip]['frames'])
    atlas,placements=normalizer.normalize_frames(images,reports,GRID,PIVOT,s['sourceScaleByClip'],roots,remove_magenta_spill=True)
    validation=normalizer.validate_atlas(atlas,GRID)
    output=HERE/'enemy-054-r2-diagnostic.webp'
    normalizer.save_lossless(atlas,output)
    # Compare final post-despill cells on both light and dark backgrounds.
    old_path=ROOT/f'assets/openai/sprites/enemies/v66/batch-004/{PROFILE}.webp'
    if not old_path.exists():
        found=list((ROOT/'assets/openai/sprites').rglob(f'{PROFILE}.webp'))
        assert len(found)==1,found
        old_path=found[0]
    old=Image.open(old_path).convert('RGBA')
    protected_hashes[str(old_path.relative_to(ROOT))]=sha(old_path)
    focus=focus_evidence(old,atlas)
    contact=Image.new('RGB',(1024,8*286),'#142027'); d=ImageDraw.Draw(contact)
    for i in range(8):
        for column,(label,source,bg) in enumerate([('V73',old,'#18282f'),('R2',atlas,'#18282f'),('V73',old,'#e5e3da'),('R2',atlas,'#e5e3da')]):
            cell=frame(source,i+16)
            canvas=Image.new('RGBA',(256,256),bg);canvas.alpha_composite(cell)
            contact.paste(canvas.convert('RGB'),(column*256,i*286+30))
            d.text((column*256+8,i*286+8),f'{label} attack {i+1}',fill='white')
    contact.save(HERE/'attack-r2-final-comparison.png')
    dump('attack-r2-final-diagnostics.json',dict(schema=1,diagnosticOnly=True,acceptedAutomatically=0,
        grid=GRID,pivot=PIVOT,sourceSha256=source_hashes,sourceScaleByClip=s['sourceScaleByClip'],
        atlasSha256=sha(output),activeAtlasSha256=sha(old_path),placements=placements,validation=validation,
        focusedVisualReview=focus,
        protectedActiveFilesSha256=protected_hashes,
        attackCounts=[dict(frame=i,V73=counts(frame(old,16+i)),R2=counts(frame(atlas,16+i))) for i in range(8)],
        note='Broad violet is a diagnostic including legitimate pink anatomy, never an automatic rejection or color-edit rule. Same production normalization, strict despill enabled; no threshold change and no active source replacement.'))
    for source,digest in source_hashes.items(): assert sha(ROOT/source)==digest
    for source,digest in protected_hashes.items(): assert sha(ROOT/source)==digest
    print(json.dumps(dict(atlasSha256=sha(output),packScale=placements[0]['scale'],sourceScaleByClip=s['sourceScaleByClip'],uniquePoses=validation['uniqueFrameCount'],attackCounts=[counts(frame(atlas,16+i)) for i in range(8)])))

if __name__=='__main__': main()
