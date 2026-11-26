#!/usr/bin/env python3
"""Package the frozen V011/V012 originals and the reviewed V013 walk cycles.

Original PNG bytes stay unchanged. Contact sheets are labelled QA derivatives.
The offline catalogue can inspect each of the four independently scoped cycles.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import argparse
import hashlib
import importlib.util
import json
import shutil
import zipfile

PREVIOUS = Path(__file__).with_name('package-covenant-sprites-v012.py')
SPEC = importlib.util.spec_from_file_location('covenant_pack_v012', PREVIOUS)
PREV = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PREV)
OLD = PREV.OLD

CYCLE_NAMES = {
    'daniels-work-walk': 'Daniels · tenue de travail',
    'daniels-walk': 'Daniels · expédition',
    'daniels-eva-walk': 'Daniels · combinaison EVA',
    'david-young-walk': 'David · prologue',
}
FROZEN_SOURCES = {
    'v011': '3bc1b0dc4c370ee39c6fd91ab500b236d2eab4b7e686279c131dd4b4451e4923',
    'v012': 'd29fb0343de8a7f7f5b97be995a3583d35c93e33df0272e92d42b38af97ef4e3',
}

WALK_PANEL = r'''<section class="walkpanel" aria-labelledby="walktitle">
<div><div class="eyebrow">4 cycles · 32 phases distinctes</div><h2 id="walktitle">Marche des personnages jouables</h2>
<p>Choisissez une tenue pour examiner ses huit phases. Les pivots et les proportions suivent le rendu du jeu. Ces mouvements sont des reconstitutions générées, avec des écarts documentés dans chaque fiche.</p>
<nav aria-label="Contrôle du cycle"><label>Personnage<select id="walkcycle"></select></label>
<button type="button" id="walkplay">Pause</button>
<label>Vitesse<select id="walkspeed"><option value="1">Normale</option><option value="0.5">Ralenti × 0,5</option><option value="0.25">Ralenti × 0,25</option></select></label>
<label>Phase<input id="walkphase" type="range" min="0" max="7" value="0" step="1"></label>
<label>Direction<select id="walkface"><option value="1">Droite</option><option value="-1">Gauche</option></select></label></nav>
<p id="walkstatus" role="status">Chargement des huit images…</p></div>
<canvas id="walkcanvas" width="480" height="620" aria-label="Aperçu du cycle de marche sélectionné"></canvas>
</section>'''

WALK_JS = r'''
const cycles=data.cycles||[], walkCanvas=el('walkcanvas'), wc=walkCanvas.getContext('2d');
let cycle=cycles[0],walkRows=[],walkImages=[],walkReady=false,walkPlaying=true,walkClock=0,walkLast=performance.now(),walkIndex=0,walkLoadVersion=0,walkZoom=4.3;
for(const item of cycles){const option=document.createElement('option');option.value=item.id;option.textContent=data.cycleNames[item.id]||item.id;el('walkcycle').append(option)}
function drawWalk(){
 if(!walkReady)return;
 wc.clearRect(0,0,480,620);wc.strokeStyle='#81928b';wc.beginPath();wc.moveTo(25,570);wc.lineTo(455,570);wc.stroke();
 const row=walkRows[walkIndex],image=walkImages[walkIndex],b=row.alphaQA.bboxAbove32;
 const scale=row.logicalHeight/(b[3]-b[1])*walkZoom;
 wc.save();wc.translate(235,570);wc.scale(Number(el('walkface').value),1);
 wc.drawImage(image,b[0],b[1],b[2]-b[0],b[3]-b[1],(b[0]-row.anchor[0])*scale,(b[1]-row.anchor[1])*scale,(b[2]-b[0])*scale,(b[3]-b[1])*scale);wc.restore();
 el('walkstatus').textContent='Phase '+(walkIndex+1)+' / 8 · '+row.phaseName;el('walkphase').value=walkIndex;
}
function selectWalk(id){
 const version=++walkLoadVersion;walkReady=false;walkImages=[];walkIndex=0;walkClock=0;walkLast=performance.now();
 wc.clearRect(0,0,480,620);cycle=cycles.find(item=>item.id===id);walkRows=cycle?cycle.frames.map(frame=>rows.find(row=>row.id===frame)):[];
 el('walkphase').value=0;el('walktitle').textContent=data.cycleNames[id]||'Marche des personnages jouables';
 if(walkRows.length!==8||!walkRows.every(Boolean)){el('walkstatus').textContent='Cycle complet indisponible.';return}
 walkZoom=Math.min(4.3,525/Math.max(...walkRows.map(row=>row.logicalHeight)));
 el('walkstatus').textContent='Chargement des huit images…';
 Promise.all(walkRows.map(row=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(row.id));image.src=row.file}))).then(images=>{
  if(version!==walkLoadVersion)return;walkImages=images;walkReady=true;drawWalk();
 }).catch(()=>{if(version===walkLoadVersion)el('walkstatus').textContent='Une phase est indisponible : vérifiez que le dossier sprites accompagne ce catalogue.'});
}
function walkTick(now){const delta=Math.max(0,Math.min((now-walkLast)/1000,.1));walkLast=now;
 if(walkReady&&walkPlaying){walkClock+=delta*Number(el('walkspeed').value);walkIndex=Math.floor(walkClock*cycle.angularFrequency/(2*Math.PI)*8)%8;drawWalk()}requestAnimationFrame(walkTick)}
el('walkcycle').onchange=()=>selectWalk(el('walkcycle').value);
el('walkplay').onclick=()=>{walkPlaying=!walkPlaying;el('walkplay').textContent=walkPlaying?'Pause':'Lecture'};
el('walkphase').oninput=()=>{if(!cycle)return;walkPlaying=false;el('walkplay').textContent='Lecture';walkIndex=Number(el('walkphase').value);walkClock=(walkIndex+.01)/8*2*Math.PI/cycle.angularFrequency;drawWalk()};
el('walkface').onchange=drawWalk;if(cycle)selectWalk(cycle.id);requestAnimationFrame(walkTick);
'''

def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--ci-run-url', default='')
    parser.add_argument('--ci-conclusion', default='not-recorded')
    parser.add_argument('--ci-receipt', type=Path)
    args = parser.parse_args()
    root = args.root
    versions = ['v011', 'v012', 'v013']
    sources = [root/f'assets/openai/sprites/alien-covenant-{version}/manifest.json' for version in versions]
    manifests = [json.loads(path.read_text()) for path in sources]
    for version, source in zip(versions, sources):
        if version in FROZEN_SOURCES and hashlib.sha256(source.read_bytes()).hexdigest() != FROZEN_SOURCES[version]:
            raise ValueError('Frozen source manifest changed: '+version)
    runtime = json.loads((root/'dlc/covenant/sprites-v011.json').read_text())
    runtime_ids = {asset['id'] for asset in runtime['assets']}
    provenance = json.loads((root/'docs/covenant/PROVENANCE_V013.json').read_text())
    dest = args.output/'ALIEN_COVENANT_SPRITES_V0.13'
    (dest/'sprites').mkdir(parents=True, exist_ok=True)
    (dest/'provenance').mkdir(exist_ok=True)
    qa, catalogue, hashes = [], [], []
    names = {**OLD.NAMES, 'prop-identification':'Plaque d’identification de Shaw',
        'prop-microscope':'Microscope de David', 'prop-lander-tank-rack':'Réservoirs de l’atterrisseur · rack de trois cylindres',
        'prop-covenant-sail-winch':'Treuil de la voile du Covenant'}
    for version, source_manifest, manifest in zip(versions, sources, manifests):
        for entry in manifest['assets']:
            source = root/entry['path']
            record = OLD.alpha_qa(source, entry)
            qa.append(record)
            file = 'sprites/'+entry['id']+'.png'
            shutil.copyfile(source, dest/file)
            hashes.append(record['sha256']+'  '+file)
            identity = entry['id']
            name = names.get(identity, entry.get('label', identity))
            for prefix, label in CYCLE_NAMES.items():
                if identity.startswith(prefix+'-'):
                    name = label+' · phase '+identity.rsplit('-',1)[1]
                    break
            catalogue.append({**entry, **record, 'name':name, 'file':file, 'runtime':identity in runtime_ids,
                'lot':'0.'+version[-2:], 'category':entry.get('category','prop')})
        shutil.copyfile(source_manifest, dest/'provenance'/('manifest-'+version+'.json'))
    if len(catalogue) != len({row['id'] for row in catalogue}):
        raise ValueError('Duplicate sprite identity in cumulative pack')
    if not runtime_ids.issubset({row['id'] for row in catalogue}):
        raise ValueError('A runtime image is missing from the catalogue')
    catalogue.sort(key=lambda row:({'character':0,'character-animation':1,'creature':2,'prop':3,'vehicle':4,'biology':5}.get(row['category'],6),row['id']))
    cycles = [cycle for manifest in manifests for cycle in manifest.get('cycles',[])]
    if len(cycles) != len({cycle['id'] for cycle in cycles}):
        raise ValueError('Duplicate cycle identity')
    combined = {'schemaVersion':1, 'dlc':'Alien: Covenant', 'version':'0.13-cumulative',
        'fidelityPolicy':manifests[-1]['fidelityPolicy'], 'assets':[a for m in manifests for a in m['assets']],
        'cycles':cycles, 'blocked':manifests[-1]['blockedCarriedForward'],
        'sourceManifests':[{'file':'provenance/manifest-'+version+'.json', 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
            for version, path in zip(versions, sources)]}
    write_json(dest/'manifest.json', combined)
    write_json(dest/'coverage.json', provenance.get('coverage',{}))
    validation = dict(provenance.get('validation',{}))
    if args.ci_run_url:
        validation['githubActions'] = {'url':args.ci_run_url,'conclusion':args.ci_conclusion}
    readme = (root/'docs/covenant/SPRITES_V013_STATUS.md').read_text()
    if args.ci_receipt:
        receipt = json.loads(args.ci_receipt.read_text())
        (dest/'validation').mkdir(exist_ok=True)
        write_json(dest/'validation/CI_V013.json', receipt)
        validation['githubActions'] = {**receipt, 'receipt':'validation/CI_V013.json'}
        readme += '\n## Résultat CI joint à cette livraison\n\n'
        readme += f"Exécution [{receipt.get('conclusion','non renseigné')}]({receipt.get('runUrl','')}) sur le commit `{receipt.get('commit','')}`. Le reçu détaillé, les résultats et leur portée se trouvent dans `validation/CI_V013.json` et `QA.json`. Ce reçu concerne le workflow Covenant uniquement.\n"
    else:
        (dest/'validation/CI_V013.json').unlink(missing_ok=True)
    write_json(dest/'QA.json', {'pngChecks':qa, 'validation':validation, 'originalPngBytesPreserved':True})
    shutil.copyfile(root/'dlc/covenant/sprites-v011.json', dest/'runtime-sprites.json')
    (dest/'SHA256SUMS.txt').write_text('\n'.join(hashes)+'\n')
    (dest/'README_FR.md').write_text(readme)
    html = OLD.HTML.replace('0.11','0.13').replace(' profils humains',' poses humaines')
    checker_selector = 'body[data-bg=checker] .view,body[data-bg=checker] .fullimage'
    if checker_selector not in html:
        raise ValueError('Catalogue checker-background selector changed')
    html = html.replace(checker_selector, checker_selector+',body[data-bg=checker] #walkcanvas')
    html = html.replace('<main><nav','<main>'+WALK_PANEL+'<nav',1)
    html = html.replace('</style>','.walkpanel{display:grid;grid-template-columns:minmax(0,1fr) 480px;gap:28px;padding:25px 0 36px;margin-bottom:32px;border-bottom:1px solid var(--line)}#walkcanvas{width:100%;max-width:480px;background:var(--imagebg);border:1px solid var(--line);border-radius:5px}.walkpanel h2{font-size:30px;font-weight:500}.walkpanel nav{align-items:center;flex-wrap:wrap}.walkpanel label{display:flex;flex-direction:column;gap:6px}@media(max-width:900px){.walkpanel{grid-template-columns:1fr}#walkcanvas{margin:auto}}</style>',1)
    html = html.replace('<option value="character">Personnages</option>','<option value="character">Personnages</option><option value="character-animation">Phases animées</option>')
    html = html.replace('cats={character:"Personnage",','cats={"character-animation":"Animation",character:"Personnage",')
    html = html.replace('r.source||r.source_page||r.page||r.url','r.source||r.source_page||r.page||r.pageUrl||r.url||r.imageUrl')
    html = html.replace('d.append(node("h3","Portée"));','d.append(node("p","Lot "+row.lot+(row.instance?" · objet : "+row.instance:""),"small"));d.append(node("h3","Portée"));')
    html = html.replace('render();\n</script>',WALK_JS+'\nrender();\n</script>')
    data = json.dumps({'assets':catalogue,'cycles':cycles,'cycleNames':CYCLE_NAMES},ensure_ascii=False).replace('<','\\u003c')
    (dest/'index.html').write_text(html.replace('__DATA__',data))
    new_rows = [row for row in catalogue if row['lot']=='0.13']
    cols, cell_w, cell_h = 8, 300, 440
    sheet = Image.new('RGB',(cols*cell_w,((len(new_rows)+cols-1)//cols)*cell_h),'#161d23')
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
    except OSError:
        font = ImageFont.load_default()
    for i,row in enumerate(new_rows):
        image = Image.open(dest/row['file']).convert('RGBA')
        image.thumbnail((cell_w-24,cell_h-55),Image.Resampling.LANCZOS)
        x=(i%cols)*cell_w+(cell_w-image.width)//2
        y=(i//cols)*cell_h+12
        sheet.paste(image,(x,y),image)
        label=row['name']
        if len(label)>40:
            label=label[:37]+'…'
        draw.text(((i%cols)*cell_w+12,(i//cols)*cell_h+cell_h-36),label,fill='#eff3e8',font=font)
        draw.text(((i%cols)*cell_w+12,(i//cols)*cell_h+cell_h-18),row['id'],fill='#adbbb1',font=font)
    sheet.save(dest/'APERCU_NOUVEAUTES.jpg',quality=92)
    output=args.output/'ALIEN_COVENANT_SPRITES_V0.13.zip'
    expected_files = [dest/name for name in ['APERCU_NOUVEAUTES.jpg','QA.json','README_FR.md',
        'SHA256SUMS.txt','coverage.json','index.html','manifest.json','runtime-sprites.json']]
    expected_files += [dest/'sprites'/(row['id']+'.png') for row in qa]
    expected_files += [dest/'provenance'/('manifest-'+version+'.json') for version in versions]
    if args.ci_receipt:
        expected_files.append(dest/'validation/CI_V013.json')
    archive_names = {str(file.relative_to(args.output)) for file in expected_files}
    if len(archive_names) != len(expected_files):
        raise ValueError('Duplicate path in archive file list')
    with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=4) as archive:
        for file in sorted(expected_files):
            archive.write(file,arcname=str(file.relative_to(args.output)))
    with zipfile.ZipFile(output) as archive:
        if set(archive.namelist()) != archive_names:
            raise ValueError('Unexpected files in archive')
        if archive.testzip() is not None:
            raise ValueError('ZIP integrity check failed')
        for row in qa:
            raw=archive.read(dest.name+'/sprites/'+row['id']+'.png')
            if hashlib.sha256(raw).hexdigest()!=row['sha256']:
                raise ValueError('Archived original differs: '+row['id'])
    print(json.dumps({'zip':str(output),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
        'pngCount':len(qa),'newPngCount':len(new_rows),'runtimeCount':len(runtime_ids),
        'catalogueOnlyCount':len(qa)-len(runtime_ids),'cycles':len(cycles),'allOriginalHashesVerified':True}))


if __name__=='__main__':
    main()
