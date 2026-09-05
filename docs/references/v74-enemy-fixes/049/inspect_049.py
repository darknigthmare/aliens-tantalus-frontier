"""Read-only art audit; write only diagnostic files beside this script."""
from pathlib import Path
from io import BytesIO
import hashlib, json, subprocess
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PROFILE = 'enemy-049-wild-boar-host'
META = f'assets/openai/sprites/metadata/v66/{PROFILE}.json'
def sha(data): return hashlib.sha256(data).hexdigest()
def historical(path): return subprocess.check_output(['git', 'show', f'c9ea114:{path}'], cwd=ROOT)
meta_bytes = (ROOT / META).read_bytes()
meta = json.loads(meta_bytes)
old_meta = json.loads(historical(META))
atlas_bytes = (ROOT / meta['normalized']).read_bytes()
old_bytes = historical(meta['normalized'])
atlas = Image.open(BytesIO(atlas_bytes)).convert('RGBA')
old = Image.open(BytesIO(old_bytes)).convert('RGBA')
review = json.loads((HERE / 'scale-review.json').read_bytes())['profiles'][PROFILE]
clips = [c['id'] for c in meta['clips']]
cells, previous = [], []
frames, source_rows = [], []
for i, placement in enumerate(meta['placements']):
    x, y = i % 4 * 256, i // 4 * 256
    cell = atlas.crop((x, y, x+256, y+256))
    older = old.crop((x, y, x+256, y+256))
    cells.append(cell); previous.append(older)
    a = np.asarray(cell).astype(np.int16); alpha = a[:,:,3]
    ys,xs = np.where(alpha>0)
    guard = np.ones(alpha.shape, bool); guard[16:240,16:240] = False
    white = (alpha>=240)&np.all(a[:,:,:3]>=245,axis=2)
    interior = np.asarray(cell.getchannel('A').point(lambda a: 255 if a else 0).filter(ImageFilter.MinFilter(7))) > 0
    violet = (alpha>=16)&(~interior)&(a[:,:,0]>a[:,:,1]+15)&(a[:,:,2]>a[:,:,1]+15)&(np.minimum(a[:,:,0],a[:,:,2])>20)
    magenta = (alpha>0)&(a[:,:,0]>=190)&(a[:,:,2]>=190)&(a[:,:,1]<=60)&(np.abs(a[:,:,0]-a[:,:,2])<=32)&(np.minimum(a[:,:,0],a[:,:,2])-a[:,:,1]>=150)
    root_error = max(abs(placement['renderedAnchor'][j]-meta['pivot'][axis]) for j,axis in enumerate(('x','y')))
    frames.append({'index':i,'clip':placement['clip'],'pose':placement['clipFrame']+1,
      'sha256':sha(cell.tobytes()),'pixelIdenticalToV73':cell.tobytes()==older.tobytes(),
      'visibleBounds':[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)],
      'rootError':root_error,'sourceScale':placement['sourceScale'],'appliedScale':placement['appliedScale'],
      'guardPixels':int(np.count_nonzero((alpha>0)&guard)),
      'hiddenRgb':int(np.count_nonzero((alpha==0)&np.any(a[:,:,:3]!=0,axis=2))),
      'strictMagentaPixels':int(magenta.sum()),'outerVioletCandidates':int(violet.sum()),'whiteHighlightPixels':int(white.sum())})
for source in meta['sources']:
    path,clip = source['path'],source['clip']
    active = (ROOT/path).read_bytes()
    source_rows.append({'clip':clip,'sha256':sha(active),'metadataMatch':sha(active)==source['sha256'],
      'reviewMatch':sha(active)==review['sourceSha256ByClip'][clip], 'unchangedFromV73':active==historical(path)})
clip_checks = []
for ordinal, clip in enumerate(meta['clips']):
    local = Image.open(ROOT/clip['path']).convert('RGBA')
    expected = atlas.crop((0,ordinal*512,1024,(ordinal+1)*512))
    gif = Image.open(ROOT/clip['previewPath'])
    clip_checks.append({'clip':clip['id'],'pixelIdenticalToAtlas':local.tobytes()==expected.tobytes(),
      'fps':clip['fps'],'loop':clip['loop'],'previewFrames':gif.n_frames,'gifLoop':gif.info.get('loop')})
axes = {}
for clip in clips:
    lengths = [m['lengthPx'] for m in review['measurements'] if m['clip']==clip]
    median = float(np.median(lengths))
    axes[clip]={'sourceMedian':median,'residualFactor':meta['sourceScaleByClip'][clip],
      'oldAtlasAxis':median*old_meta['scale']*old_meta['sourceScaleByClip'][clip],
      'newAtlasAxis':median*meta['scale']*meta['sourceScaleByClip'][clip]}
result = {'schema':1,'profile':PROFILE,'baselineCommit':'c9ea114','atlasSha256':sha(atlas_bytes),
 'oldAtlasSha256':sha(old_bytes),'metadataSha256':sha(meta_bytes),
 'oldPackingScale':old_meta['scale'],'newPackingScale':meta['scale'],'oldSourceScales':old_meta['sourceScaleByClip'],
 'newSourceScales':meta['sourceScaleByClip'],'sourceChecks':source_rows,'clipChecks':clip_checks,
 'axes':axes,'frames':frames,'uniquePoses':len({f['sha256'] for f in frames}),
 'allFramesOneResidualFactor':all(abs(f['appliedScale']-meta['scale']*f['sourceScale'])<1e-8 for f in frames),
 'findings':meta['validation']['findings']}
(HERE/'diagnostics.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')

def contact(name, selected, labels, columns=4, light=False, ground=True):
    rows = (len(selected)+columns-1)//columns
    bg=(224,229,227,255) if light else (18,27,24,255)
    im=Image.new('RGBA',(columns*256,rows*280),bg); d=ImageDraw.Draw(im)
    for index,(cell,label) in enumerate(zip(selected,labels)):
        x,y=index%columns*256,index//columns*280
        im.alpha_composite(cell,(x,y+20))
        if ground: d.line((x+8,y+260,x+248,y+260),fill=(60,143,128,255))
        d.text((x+8,y+4),label,fill=(10,20,16,255) if light else (227,240,231,255))
    im.convert('RGB').save(HERE/name)

contact('current-32-dark.png',cells,[f'{f["clip"]} {f["pose"]}' for f in frames])
contact('current-32-light.png',cells,[f'{f["clip"]} {f["pose"]}' for f in frames],light=True)
contact('before-after-idle-attack.png',previous[:4]+cells[:4]+previous[16:20]+cells[16:20],
    [f'V73 idle {i+1}' for i in range(4)]+[f'V74 idle {i+1}' for i in range(4)]+
    [f'V73 attack {i+1}' for i in range(4)]+[f'V74 attack {i+1}' for i in range(4)])
contact('attack-current-eight.png',cells[16:24],[f'attack {i+1} / index {i}' for i in range(8)])
contact('death-current-eight.png',cells[24:32],[f'death {i+1} / index {i}' for i in range(8)])
contact('fringe-review-light.png',[cells[i].resize((768,768),Image.Resampling.NEAREST).crop((0,400,256,656)) for i in (0,8,16,28)],
    ['idle1 left edge x3','move1 left edge x3','attack1 left edge x3','death5 left edge x3'],light=True,ground=False)

marine=Image.open(ROOT/'assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png').convert('RGBA').crop((0,0,256,256))
world=Image.new('RGBA',(1000,280),(20,30,25,255)); draw=ImageDraw.Draw(world)
for j,render in enumerate((144,160,176)):
    x=20+j*330; ground=235
    for image,size,anchor,label in [(marine,(110,148),x+60,'Marine 110x148'),(cells[0],(render,render),x+220,f'Boar {render}x{render}')]:
        w,h=size
        world.alpha_composite(image.resize(size,Image.Resampling.LANCZOS),(round(anchor-w/2),round(ground-h*240/256)))
        draw.text((anchor-55,250),label,fill='white')
    draw.line((x,ground,x+305,ground),fill=(60,143,128,255))
world.convert('RGB').save(HERE/'world-size-proposals.png')
print('Marine visible native bounds:',marine.getbbox())
print(json.dumps({k:result[k] for k in ['atlasSha256','oldAtlasSha256','oldPackingScale','newPackingScale','newSourceScales','uniquePoses','allFramesOneResidualFactor','axes','sourceChecks','clipChecks','findings']},indent=2))
