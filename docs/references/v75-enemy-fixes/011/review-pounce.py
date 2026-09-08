"""V75 Lurker diagnostic: measured pounce candidate, never replaces active PNGs."""
import copy, hashlib, importlib.util, json, math, statistics, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
PROFILE='enemy-011-lurker'
sys.path.insert(0,str(ROOT/'scripts'))
spec=importlib.util.spec_from_file_location('v75_normalizer',ROOT/'scripts/process-v66-enemy-batch.py')
n=importlib.util.module_from_spec(spec);spec.loader.exec_module(n)
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(name,data): (HERE/name).write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8',newline='\n')
source=ROOT/f'assets/openai/sprites/frames/v75/{PROFILE}/attack-pounce-r1.png'
a=copy.deepcopy(json.loads((ROOT/'docs/references/V66_BATCH_002_ANCHOR_REVIEW.json').read_text())['profiles'][PROFILE])
s=copy.deepcopy(json.loads((ROOT/'docs/references/V66_BATCH_002_SCALE_REVIEW.json').read_text())['profiles'][PROFILE])
# Individually observed proximal rear-leg/pelvis joint ahead of tail base.
# Airborne poses are projected to the grounded neighbouring row plane, not snapped.
points=[(190,305),(199,300),(176,263),(168,231),(161,172),(160,213),(143,229),(165,235)]
a['clips']['attack']=dict(sourcePath=str(source.relative_to(ROOT)).replace('\\','/'),sourceSha256=sha(source),sourceSize=[1774,887],
 frames=[dict(frame=i,anchor=[x,366 if i<4 else 293],landmark=[x,y],reviewed=True,confidence='medium',uncertaintyPx=10,
 evidence=f'New R1 pose{i+1}: proximal hind-leg pelvis joint ({x},{y}) projected to grounded row support. Airborne poses3-5 retain clearance. Manual uncertainty +/-10 source pixels, not canon measurement.')
 for i,(x,y) in enumerate(points)])
s['measurements']=[m for m in s['measurements'] if m['clip']!='attack']
for i,ends in [(0,[[268,281],[363,313]]),(1,[[226,252],[322,289]]),(2,[[244,192],[340,222]])]:
 s['measurements'].append(dict(clip='attack',frame=i,endpoints=ends,lengthPx=round(math.dist(*ends),6),landmark='rigid-cranial-length',uncertaintyPx=5,
 note='R1 manually observed posterior smooth dome edge above neck to anterior rigid dome tip; jaw excluded, +/-5 source pixels.'))
s['sourceSha256ByClip']['attack']=sha(source)
s['medianLengthPxByClip']['attack']=statistics.median(m['lengthPx'] for m in s['measurements'] if m['clip']=='attack')
s['sourceScaleByClip']['attack']=round(s['medianLengthPxByClip']['idle']/s['medianLengthPxByClip']['attack'],6)
for review in (a,s):
 review.update(reviewer='Codex V75 root physical review',reviewedAt='2026-09-05')
 review['evidencePaths']=[p for p in review['evidencePaths'] if not p.endswith('attack.jpg')]+['docs/references/v75-enemy-fixes/011/attack-r1-root-scale.jpg']
a['method']='Unchanged idle/move/death source-hash-bound pelvis roots rechecked visually; new pounce roots manually observed and projected to row support y366/293 (visible contact row1 reaches363, row2 reaches290, plus3px extraction guard). Airborne3-5 are not foot-grounded.'
s['note']='Unchanged nine idle/move/death cranial measurements retained. Three new R1 rigid dome chords measure attack, excluding jaw and dorsal tubes. One final common packing scale only.'
for key,review in [('anchor',a),('scale',s)]:
 dump(f'{key}-review.proposed.json',dict(schema=1,batchId='batch-002',coordinates='nominal-source-cell',diagnosticCandidate=True,runtimePromotionAllowed=False,profiles={PROFILE:review}))
overlay=Image.open(source).convert('RGB');d=ImageDraw.Draw(overlay)
for f in a['clips']['attack']['frames']:
 i=f['frame'];ox=round(i%4*1774/4);oy=round(i//4*887/2);x,y=f['landmark'];ay=f['anchor'][1]
 d.line((ox+x,oy+y,ox+x,oy+ay),fill='yellow',width=2)
 d.ellipse((ox+x-4,oy+y-4,ox+x+4,oy+y+4),outline='yellow',width=2)
 d.line((ox+10,oy+ay,ox+433,oy+ay),fill='#70ff9e',width=2)
for m in s['measurements']:
 if m['clip']!='attack': continue
 i=m['frame'];ox=round(i%4*1774/4);oy=round(i//4*887/2);(x,y),(u,v)=m['endpoints']
 d.line((ox+x,oy+y,ox+u,oy+v),fill='cyan',width=2)
overlay.save(HERE/'attack-r1-root-scale.jpg',quality=96)
images=[];reports=[];roots=[]
for clip in ('idle','move','attack','death'):
 path=source if clip=='attack' else ROOT/f'assets/openai/sprites/frames/v66/batch-002/{PROFILE}/{clip}.png'
 assert sha(path)==a['clips'][clip]['sourceSha256']
 with Image.open(path) as im: cells,info=n.split_source(im,clip,dict(columns=4,rows=2,frameCount=8),True,True,True)
 images.extend(cells);reports.extend(info);roots.extend(a['clips'][clip]['frames'])
grid=dict(columns=4,rows=8,cellWidth=256,cellHeight=256,guard=16);pivot=dict(x=128,y=240)
for cell,report,root in zip(images,reports,roots):
 bottom=report['sourceBounds'][1]+cell.getchannel('A').getbbox()[3]
 if bottom>root['anchor'][1]: print('PIXELS_BELOW_ROOT',report['clip'],report['clipFrame'],bottom,root['anchor'])
atlas,placements=n.normalize_frames(images,reports,grid,pivot,s['sourceScaleByClip'],roots,remove_magenta_spill=True,trim_transparent_padding=True)
validation=n.validate_atlas(atlas,grid)
n.save_lossless(atlas,HERE/'lurker-r1-diagnostic.webp')
stats=[]
for bg,label in [('#17252d','dark'),('#e7e5dc','light')]:
 contact=Image.new('RGB',(1024,8*278),bg);draw=ImageDraw.Draw(contact)
 for i in range(32):
  x=i%4*256;y=i//4*256;cell=atlas.crop((x,y,x+256,y+256))
  canvas=Image.new('RGBA',(256,256),bg);canvas.alpha_composite(cell)
  contact.paste(canvas.convert('RGB'),(x,i//4*278+22))
  draw.text((x+8,i//4*278+3),f"{placements[i]['clip']} {i%8+1}",fill='white' if label=='dark' else 'black')
  if label=='dark':
   pix=np.asarray(cell,dtype=np.int16);r,g,b,alpha=(pix[...,j] for j in range(4))
   broad=(alpha>=16)&(r>70)&(b>70)&(np.minimum(r,b)>g+35)
   stats.append(dict(frame=i,bounds=cell.getchannel('A').getbbox(),broadVioletDiagnostic=int(broad.sum())))
 contact.save(HERE/f'lurker-r1-{label}.jpg',quality=96)
dump('lurker-r1-diagnostics.json',dict(schema=1,candidateOnly=True,accepted=False,atlasSha256=sha(HERE/'lurker-r1-diagnostic.webp'),
 sourceSha256=sha(source),packScale=placements[0]['scale'],sourceScaleByClip=s['sourceScaleByClip'],placements=placements,validation=validation,frames=stats))
print(json.dumps(dict(validation=validation,attackFactor=s['sourceScaleByClip']['attack'],broadVioletDiagnostic=sum(f['broadVioletDiagnostic'] for f in stats))))
