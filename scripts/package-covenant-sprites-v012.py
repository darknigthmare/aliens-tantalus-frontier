#!/usr/bin/env python3
"""Package the immutable V011 originals plus the reviewed V012 continuation.

PNG bytes are copied and verified, never rewritten. Contact sheets are QA-only
derivatives. The offline catalogue includes a preview of the explicit walk cycle.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse
import hashlib
import importlib.util
import json
import shutil
import zipfile

LEGACY = Path(__file__).with_name('package-covenant-sprites-v011.py')
SPEC = importlib.util.spec_from_file_location('covenant_pack_v011', LEGACY)
OLD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(OLD)

WALK_PANEL = r'''<section class="walkpanel" aria-labelledby="walktitle">
<div><div class="eyebrow">Nouveau · 8 phases distinctes</div><h2 id="walktitle">Daniels · marche à bord</h2>
<p>Tenue de travail, mains libres. Le cycle est affiché avec les pivots et l’échelle du rendu. Les poses sont des reconstitutions générées ; elles ne reproduisent pas une animation filmée image par image.</p>
<nav aria-label="Contrôle du cycle"><button type="button" id="walkplay">Pause</button>
<label>Vitesse<select id="walkspeed"><option value="1">Normale</option><option value="0.5">Ralenti × 0,5</option><option value="0.25">Ralenti × 0,25</option></select></label>
<label>Phase<input id="walkphase" type="range" min="0" max="7" value="0" step="1"></label>
<label>Direction<select id="walkface"><option value="1">Droite</option><option value="-1">Gauche</option></select></label></nav>
<p id="walkstatus" role="status">Chargement des huit images…</p></div>
<canvas id="walkcanvas" width="480" height="620" aria-label="Aperçu du cycle de marche de Daniels"></canvas>
</section>'''

WALK_JS = r'''
const cycle=data.cycles?.[0], walkCanvas=el('walkcanvas'), wc=walkCanvas.getContext('2d');
let walkImages=[],walkReady=false,walkPlaying=true,walkClock=0,walkLast=performance.now(),walkIndex=0;
const walkRows=cycle?cycle.frames.map(id=>rows.find(row=>row.id===id)):[];
function drawWalk(){
 if(!walkReady)return;
 wc.clearRect(0,0,480,620);wc.strokeStyle='#81928b';wc.beginPath();wc.moveTo(25,570);wc.lineTo(455,570);wc.stroke();
 const row=walkRows[walkIndex],image=walkImages[walkIndex],b=row.alphaQA.bboxAbove32;
 const scale=row.logicalHeight/(b[3]-b[1])*4.3;
 wc.save();wc.translate(235,570);wc.scale(Number(el('walkface').value),1);
 wc.drawImage(image,b[0],b[1],b[2]-b[0],b[3]-b[1],(b[0]-row.anchor[0])*scale,(b[1]-row.anchor[1])*scale,(b[2]-b[0])*scale,(b[3]-b[1])*scale);wc.restore();
 el('walkstatus').textContent='Phase '+(walkIndex+1)+' / 8 · '+row.phaseName;el('walkphase').value=walkIndex;
}
if(walkRows.length===8&&walkRows.every(Boolean)){
 Promise.all(walkRows.map(row=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(row.id));image.src=row.file}))).then(images=>{walkImages=images;walkReady=true;drawWalk()}).catch(()=>{el('walkstatus').textContent='Une phase est indisponible : vérifiez que le dossier sprites accompagne ce catalogue.'});
}else{el('walkstatus').textContent='Cycle complet indisponible.'}
function walkTick(now){const delta=Math.max(0,Math.min((now-walkLast)/1000,.1));walkLast=now;
 if(walkReady&&walkPlaying){walkClock+=delta*Number(el('walkspeed').value);walkIndex=Math.floor(walkClock*cycle.angularFrequency/(2*Math.PI)*8)%8;drawWalk()}requestAnimationFrame(walkTick)}
el('walkplay').onclick=()=>{walkPlaying=!walkPlaying;el('walkplay').textContent=walkPlaying?'Pause':'Lecture'};
el('walkphase').oninput=()=>{walkPlaying=false;el('walkplay').textContent='Lecture';walkIndex=Number(el('walkphase').value);walkClock=(walkIndex+.01)/8*2*Math.PI/cycle.angularFrequency;drawWalk()};
el('walkface').onchange=drawWalk;requestAnimationFrame(walkTick);
'''

def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--ci-run-url',default='')
    parser.add_argument('--ci-conclusion',default='not-recorded')
    args=parser.parse_args()
    root=args.root
    sources=[root/'assets/openai/sprites/alien-covenant-v011/manifest.json',root/'assets/openai/sprites/alien-covenant-v012/manifest.json']
    manifests=[json.loads(path.read_text()) for path in sources]
    if hashlib.sha256(sources[0].read_bytes()).hexdigest()!='3bc1b0dc4c370ee39c6fd91ab500b236d2eab4b7e686279c131dd4b4451e4923':
        raise ValueError('The frozen V011 source manifest changed')
    runtime=json.loads((root/'dlc/covenant/sprites-v011.json').read_text())
    runtime_ids={a['id'] for a in runtime['assets']}
    provenance=json.loads((root/'docs/covenant/PROVENANCE_V012.json').read_text())
    dest=args.output/'ALIEN_COVENANT_SPRITES_V0.12'
    (dest/'sprites').mkdir(parents=True,exist_ok=True)
    (dest/'provenance').mkdir(exist_ok=True)
    qa=[];catalogue=[];hashes=[]
    names={**OLD.NAMES,'prop-identification':'Plaque d’identification de Shaw','prop-microscope':'Microscope de David',
        'prop-lander-tank-rack':'Réservoirs de l’atterrisseur · rack de trois cylindres',
        'prop-covenant-sail-winch':'Treuil de la voile du Covenant'}
    for index,manifest in enumerate(manifests):
        for entry in manifest['assets']:
            source=root/entry['path']
            record=OLD.alpha_qa(source,entry);qa.append(record)
            file='sprites/'+entry['id']+'.png'
            shutil.copyfile(source,dest/file)
            hashes.append(record['sha256']+'  '+file)
            identity=entry['id']
            name=names.get(identity,entry.get('label',identity))
            if identity.startswith('daniels-work-walk-'):
                name='Daniels · marche · phase '+identity.rsplit('-',1)[1]
            catalogue.append({**entry,**record,'name':name,'file':file,'runtime':identity in runtime_ids,
                'lot':'0.11' if index==0 else '0.12','category':entry.get('category','prop')})
        shutil.copyfile(sources[index],dest/'provenance'/('manifest-v011.json' if index==0 else 'manifest-v012.json'))
    if len(catalogue)!=len({a['id'] for a in catalogue}):
        raise ValueError('Duplicate sprite identity in cumulative pack')
    if not runtime_ids.issubset({a['id'] for a in catalogue}):
        raise ValueError('A runtime image is missing from the catalogue')
    catalogue.sort(key=lambda row:({'character':0,'character-animation':1,'creature':2,'prop':3,'vehicle':4,'biology':5}.get(row['category'],6),row['id']))
    combined={'schemaVersion':1,'dlc':'Alien: Covenant','version':'0.12-cumulative',
        'fidelityPolicy':manifests[1]['fidelityPolicy'],'assets':[a for m in manifests for a in m['assets']],
        'cycles':manifests[1]['cycles'],'blocked':manifests[1]['blockedCarriedForward'],
        'sourceManifests':[{'file':'provenance/'+p.name.replace('manifest','manifest-v011' if i==0 else 'manifest-v012'),
            'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for i,p in enumerate(sources)]}
    write_json(dest/'manifest.json',combined)
    write_json(dest/'coverage.json',provenance.get('coverage',{}))
    validation=dict(provenance.get('validation',{}))
    if args.ci_run_url:
        validation['githubActions']={'url':args.ci_run_url,'conclusion':args.ci_conclusion}
    write_json(dest/'QA.json',{'pngChecks':qa,'validation':validation,'originalPngBytesPreserved':True})
    shutil.copyfile(root/'dlc/covenant/sprites-v011.json',dest/'runtime-sprites.json')
    (dest/'SHA256SUMS.txt').write_text('\n'.join(hashes)+'\n')
    (dest/'README_FR.md').write_text((root/'docs/covenant/SPRITES_V012_STATUS.md').read_text())
    html=OLD.HTML.replace('0.11','0.12')
    html=html.replace(' profils humains',' poses humaines')
    html=html.replace('<main><nav','<main>'+WALK_PANEL+'<nav',1)
    html=html.replace('</style>','.walkpanel{display:grid;grid-template-columns:minmax(0,1fr) 480px;gap:28px;padding:25px 0 36px;margin-bottom:32px;border-bottom:1px solid var(--line)}#walkcanvas{width:100%;max-width:480px;background:var(--imagebg);border:1px solid var(--line);border-radius:5px}.walkpanel h2{font-size:30px;font-weight:500}.walkpanel nav{align-items:center}@media(max-width:900px){.walkpanel{grid-template-columns:1fr}#walkcanvas{margin:auto}}</style>',1)
    html=html.replace('<option value="character">Personnages</option>','<option value="character">Personnages</option><option value="character-animation">Phases animées</option>')
    html=html.replace('cats={character:"Personnage",','cats={"character-animation":"Animation",character:"Personnage",')
    html=html.replace('r.source||r.source_page||r.page||r.url','r.source||r.source_page||r.page||r.pageUrl||r.url||r.imageUrl')
    html=html.replace('d.append(node("h3","Portée"));','d.append(node("p","Lot "+row.lot+(row.instance?" · objet : "+row.instance:""),"small"));d.append(node("h3","Portée"));')
    html=html.replace('render();\n</script>',WALK_JS+'\nrender();\n</script>')
    data=json.dumps({'assets':catalogue,'cycles':manifests[1]['cycles']},ensure_ascii=False).replace('<','\\u003c')
    (dest/'index.html').write_text(html.replace('__DATA__',data))
    new_rows=[r for r in catalogue if r['lot']=='0.12']
    cols=4;cell_w=350;cell_h=460
    sheet=Image.new('RGB',(cols*cell_w,((len(new_rows)+cols-1)//cols)*cell_h),'#161d23')
    draw=ImageDraw.Draw(sheet)
    try:font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
    except OSError:font=ImageFont.load_default()
    for i,row in enumerate(new_rows):
        image=Image.open(dest/row['file']).convert('RGBA');image.thumbnail((cell_w-24,cell_h-55),Image.Resampling.LANCZOS)
        x=(i%cols)*cell_w+(cell_w-image.width)//2;y=(i//cols)*cell_h+12
        sheet.paste(image,(x,y),image)
        label=row['name']
        if len(label)>40:label=label[:37]+'…'
        draw.text(((i%cols)*cell_w+12,(i//cols)*cell_h+cell_h-36),label,fill='#eff3e8',font=font)
        draw.text(((i%cols)*cell_w+12,(i//cols)*cell_h+cell_h-18),row['id'],fill='#adbbb1',font=font)
    sheet.save(dest/'APERCU_NOUVEAUTES.jpg',quality=92)
    output=args.output/'ALIEN_COVENANT_SPRITES_V0.12.zip'
    with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=4) as archive:
        for file in sorted(dest.rglob('*')):
            if file.is_file():archive.write(file,arcname=str(file.relative_to(args.output)))
    with zipfile.ZipFile(output) as archive:
        if archive.testzip() is not None:raise ValueError('ZIP integrity check failed')
        for row in qa:
            raw=archive.read(dest.name+'/sprites/'+row['id']+'.png')
            if hashlib.sha256(raw).hexdigest()!=row['sha256']:raise ValueError('Archived original differs: '+row['id'])
    print(json.dumps({'zip':str(output),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
        'pngCount':len(qa),'newPngCount':len(new_rows),'runtimeCount':len(runtime_ids),
        'catalogueOnlyCount':len(qa)-len(runtime_ids),'allOriginalHashesVerified':True}))

if __name__=='__main__':main()
