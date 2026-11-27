#!/usr/bin/env python3
"""Package frozen V011–V014 and V016 originals with the four-format detailed bible.

Original PNG bytes stay unchanged. Contact sheets are labelled QA derivatives.
The offline catalogue can inspect each of the five independently scoped cycles.
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
    'walter-walk': 'Walter · marche à bord',
}
FROZEN_SOURCES = {
    'v011': '3bc1b0dc4c370ee39c6fd91ab500b236d2eab4b7e686279c131dd4b4451e4923',
    'v012': 'd29fb0343de8a7f7f5b97be995a3583d35c93e33df0272e92d42b38af97ef4e3',
    'v013': '5154d1c63b0f70c49bf45aa3ac4d26f00e3962214f58e999fa290fe580843788',
    'v014': '1fd31f3a6473e95fddb9e3e4dfc41a4938e7bde0454f072472b1f0a7f699e482',
    'v016': '6e166985008494e08f2b528368d0ffa53ae299f59634f91a7b0e9941df607c6a',
}
EXPECTED_TOTAL = 119
EXPECTED_RUNTIME = 72
EXPECTED_NEW = 16
EXPECTED_ANIMATION_IMAGES = 45
EXPECTED_COMPLETE_PHASES = 40
INCOMPLETE_DAVID_IDS = frozenset('david-walk-' + phase for phase in ('01', '02', '05', '06', '07'))
OPAQUE_IMAGES = frozenset({
    'background-planet4-lake', 'background-engineer-city',
    'background-juggernaut-deadforest', 'planet4-orbit'
})
BIBLE_FILES = tuple('BIBLE_COVENANT_V016.' + extension for extension in ('md', 'json', 'html', 'xlsx'))

WALK_PANEL = r'''<section class="walkpanel" aria-labelledby="walktitle">
<div><div class="eyebrow">__CYCLE_COUNT__ cycles · __PHASE_COUNT__ phases distinctes</div><h2 id="walktitle">Marche des personnages</h2>
<p>Choisissez un personnage pour examiner ses huit phases. Les pivots, les proportions et la cadence suivent le rendu du jeu. Walter possède une marche lente limitée à sa présence dans la salle de cryostase. Ces mouvements sont des reconstitutions générées, avec des écarts documentés dans chaque fiche.</p>
<p id="incomplete-walk-note" class="notice">Le catalogue contient 45 images d’animation : les 40 phases de ces cinq cycles complets et cinq nouvelles poses de David. Ces cinq poses de catalogue ne forment pas un cycle complet et restent exclues de ce lecteur.</p>
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
 const row=walkRows[walkIndex],image=walkImages[walkIndex],b=row.bboxAbove32;
 const scale=row.logicalHeight/(b[3]-b[1])*walkZoom;
 wc.save();wc.translate(235,570);wc.scale(Number(el('walkface').value),1);
 wc.drawImage(image,b[0],b[1],b[2]-b[0],b[3]-b[1],(b[0]-row.anchor[0])*scale,(b[1]-row.anchor[1])*scale,(b[2]-b[0])*scale,(b[3]-b[1])*scale);wc.restore();
 el('walkstatus').textContent='Phase '+(walkIndex+1)+' / 8 · '+row.phaseName;el('walkphase').value=walkIndex;
}
function selectWalk(id){
 const version=++walkLoadVersion;walkReady=false;walkImages=[];walkIndex=0;walkClock=0;walkLast=performance.now();
 wc.clearRect(0,0,480,620);cycle=cycles.find(item=>item.id===id);walkRows=cycle?cycle.frames.map(frame=>rows.find(row=>row.id===frame)):[];
 el('walkphase').value=0;el('walktitle').textContent=data.cycleNames[id]||'Marche des personnages';
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


def image_qa(path, entry):
    if entry['id'] not in OPAQUE_IMAGES:
        # Measure the actual recovered PNG pixels again; do not reuse an old QA flag.
        record = OLD.alpha_qa(path, entry)
        with Image.open(path) as original:
            if original.format != 'PNG':
                raise ValueError('The original must be a PNG: ' + entry['id'])
        for key in ('width', 'height', 'bytes', 'sha256'):
            expected = entry.get(key, entry.get('alphaQA', {}).get(key))
            if expected is not None and record[key] != expected:
                raise ValueError('Original ' + key + ' differs from the source manifest: ' + entry['id'])
        return {**record, 'imagePolicy': 'transparent-sprite',
                'measurementStatus': 'measured-from-original-pixels-for-v016-package',
                'alphaThreshold': 32, 'alphaComparison': '>='}
    if path.parent.name != 'alien-covenant-v014':
        raise ValueError('Opaque images are admitted only in the explicit V014 set')
    raw = path.read_bytes()
    sha256 = hashlib.sha256(raw).hexdigest()
    git_sha = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
    if git_sha != entry['gitBlobSha'] or sha256 != entry.get('sha256', entry.get('alphaQA', {}).get('sha256')):
        raise ValueError('Opaque original differs from its reviewed source: ' + entry['id'])
    with Image.open(path) as original:
        image = original.convert('RGBA')
        alpha = image.getchannel('A')
        if original.format != 'PNG' or alpha.getextrema() != (255, 255):
            raise ValueError('The explicit distant image must be a fully opaque PNG: ' + entry['id'])
        if image.size != (entry['width'], entry['height']) or len(raw) != entry['bytes']:
            raise ValueError('Opaque dimensions or bytes differ: ' + entry['id'])
        return {'id': entry['id'], 'gitBlobSha': git_sha, 'sha256': sha256,
                'bytes': len(raw), 'width': image.width, 'height': image.height,
                'alphaExtrema': [255, 255], 'alphaZero': 0,
                'edgeAlphaAbove16': 2 * image.width + 2 * image.height,
                'bboxAbove32': [0, 0, image.width, image.height],
                'imagePolicy': 'opaque-background', 'pass': True}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--ci-run-url', default='')
    parser.add_argument('--ci-conclusion', default='not-recorded')
    parser.add_argument('--ci-receipt', type=Path)
    args = parser.parse_args()
    root = args.root
    versions = ['v011', 'v012', 'v013', 'v014', 'v016']
    sources = [root/f'assets/openai/sprites/alien-covenant-{version}/manifest.json' for version in versions]
    manifests = [json.loads(path.read_text()) for path in sources]
    for version, source in zip(versions, sources):
        if not FROZEN_SOURCES[version] or hashlib.sha256(source.read_bytes()).hexdigest() != FROZEN_SOURCES[version]:
            raise ValueError('Frozen source manifest changed: '+version)
    runtime = json.loads((root/'dlc/covenant/sprites-v011.json').read_text())
    runtime_ids = {asset['id'] for asset in runtime['assets']}
    provenance_source = root/'docs/covenant/PROVENANCE_V016.json'
    provenance_raw = provenance_source.read_bytes()
    provenance = json.loads(provenance_raw)
    source_assets = [asset for manifest in manifests for asset in manifest['assets']]
    source_ids = {asset['id'] for asset in source_assets}
    new_ids = {asset['id'] for asset in manifests[-1]['assets']}
    if len(source_assets) != EXPECTED_TOTAL or len(source_ids) != EXPECTED_TOTAL:
        raise ValueError('V016 must contain exactly 119 unique original PNGs')
    if len(new_ids) != EXPECTED_NEW or len(manifests[-1]['assets']) != EXPECTED_NEW:
        raise ValueError('V016 must add exactly 16 unique original PNGs')
    if len(runtime_ids) != EXPECTED_RUNTIME or len(runtime['assets']) != EXPECTED_RUNTIME:
        raise ValueError('The preserved runtime must contain exactly 72 unique images')
    if new_ids & runtime_ids:
        raise ValueError('All sixteen V016 additions must remain catalogue-only')
    if len(source_ids - runtime_ids) != 47:
        raise ValueError('V016 must contain exactly 47 catalogue-only images')
    dest = args.output/'ALIEN_COVENANT_SPRITES_V0.16'
    (dest/'sprites').mkdir(parents=True, exist_ok=True)
    (dest/'provenance').mkdir(exist_ok=True)
    (dest/'bible').mkdir(exist_ok=True)
    qa, catalogue, hashes = [], [], []
    provenance_relative = 'provenance/PROVENANCE_V016.json'
    provenance_digest = hashlib.sha256(provenance_raw).hexdigest()
    shutil.copyfile(provenance_source, dest/provenance_relative)
    hashes.append(provenance_digest + '  ' + provenance_relative)
    names = {**OLD.NAMES, 'prop-identification':'Plaque d’identification de Shaw',
        'prop-microscope':'Microscope de David', 'prop-lander-tank-rack':'Réservoirs de l’atterrisseur · rack de trois cylindres',
        'prop-covenant-sail-winch':'Treuil de la voile du Covenant'}
    for version, source_manifest, manifest in zip(versions, sources, manifests):
        for entry in manifest['assets']:
            source = root/entry['path']
            record = image_qa(source, entry)
            qa.append(record)
            file = 'sprites/'+entry['id']+'.png'
            shutil.copyfile(source, dest/file)
            hashes.append(record['sha256']+'  '+file)
            identity = entry['id']
            name = entry.get('label') or entry.get('title') or names.get(identity, identity)
            for prefix, label in CYCLE_NAMES.items():
                if identity.startswith(prefix+'-'):
                    name = label+' · phase '+identity.rsplit('-',1)[1]
                    break
            catalogue.append({**entry, **record, 'name':name, 'file':file, 'runtime':identity in runtime_ids,
                'lot':'0.'+version[-2:], 'category':entry.get('category','prop')})
        relative_manifest = 'provenance/manifest-' + version + '.json'
        shutil.copyfile(source_manifest, dest/relative_manifest)
        hashes.append(FROZEN_SOURCES[version] + '  ' + relative_manifest)
    if len(catalogue) != len({row['id'] for row in catalogue}):
        raise ValueError('Duplicate sprite identity in cumulative pack')
    if not runtime_ids.issubset({row['id'] for row in catalogue}):
        raise ValueError('A runtime image is missing from the catalogue')
    if {row['id'] for row in qa if row['imagePolicy'] == 'opaque-background'} != OPAQUE_IMAGES:
        raise ValueError('The four explicitly reviewed opaque world images must be present')
    catalogue.sort(key=lambda row:({'character':0,'character-animation':1,'creature':2,'prop':3,'vehicle':4,'biology':5}.get(row['category'],6),row['id']))
    cycles = [cycle for manifest in manifests for cycle in manifest.get('cycles',[])]
    if len(cycles) != len({cycle['id'] for cycle in cycles}):
        raise ValueError('Duplicate cycle identity')
    if set(CYCLE_NAMES) != {cycle['id'] for cycle in cycles} or any(len(cycle['frames']) != 8 for cycle in cycles):
        raise ValueError('The four preserved player cycles and one Walter cycle must be complete')
    frame_ids = [frame for cycle in cycles for frame in cycle['frames']]
    animation_ids = {row['id'] for row in catalogue if row['category'] == 'character-animation'}
    if len(frame_ids) != EXPECTED_COMPLETE_PHASES or len(set(frame_ids)) != EXPECTED_COMPLETE_PHASES:
        raise ValueError('The five complete cycles must contain 40 distinct phases')
    if not set(frame_ids).issubset(animation_ids):
        raise ValueError('Every complete cycle phase must be an available animation PNG')
    if len(animation_ids) != EXPECTED_ANIMATION_IMAGES or animation_ids - set(frame_ids) != INCOMPLETE_DAVID_IDS:
        raise ValueError('The 45 animation images must be 40 complete-cycle phases plus five incomplete David poses')
    if INCOMPLETE_DAVID_IDS & runtime_ids:
        raise ValueError('Incomplete David poses cannot enter the runtime or complete-cycle player')
    summary = {
        'originalPngs': len(catalogue), 'newPngs': len(new_ids),
        'runtimePngs': len(runtime_ids), 'cataloguePngs': len(catalogue) - len(runtime_ids),
        'animationImages': len(animation_ids), 'completeCycles': len(cycles),
        'completeCyclePhases': len(frame_ids), 'incompleteDavidPoses': len(INCOMPLETE_DAVID_IDS),
        'certified1to1Images': 0,
    }
    bible_documents = []
    for name in BIBLE_FILES:
        source_file = root/'docs/covenant'/name
        raw = source_file.read_bytes()
        if not raw:
            raise ValueError('Empty bible document: ' + name)
        relative = 'bible/' + name
        shutil.copyfile(source_file, dest/relative)
        digest = hashlib.sha256(raw).hexdigest()
        bible_documents.append({'file': relative, 'bytes': len(raw), 'sha256': digest})
        hashes.append(digest + '  ' + relative)
    combined = {'schemaVersion':1, 'dlc':'Alien: Covenant', 'version':'0.16-cumulative',
        'fidelityPolicy':manifests[-1]['fidelityPolicy'], 'assets':[a for m in manifests for a in m['assets']],
        'cycles':cycles, 'blocked':manifests[-1]['blockedCarriedForward'], 'bibleDocuments':bible_documents,
        'summary':summary,
        'provenanceDocument':{'file':provenance_relative, 'sha256':provenance_digest, 'bytes':len(provenance_raw)},
        'incompleteCatalogueSequences':[{'id':'david-walk', 'expectedFrames':8,
            'suppliedFrames':sorted(INCOMPLETE_DAVID_IDS), 'runtimeEnabled':False,
            'previewEnabled':False, 'status':'incomplete-catalogue-only'}],
        'sourceManifests':[{'file':'provenance/manifest-'+version+'.json', 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
            for version, path in zip(versions, sources)]}
    write_json(dest/'manifest.json', combined)
    write_json(dest/'coverage.json', provenance.get('coverage',{}))
    validation = dict(provenance.get('validation',{}))
    if args.ci_run_url:
        validation['githubActions'] = {'url':args.ci_run_url,'conclusion':args.ci_conclusion}
    readme = (root/'docs/covenant/SPRITES_V016_STATUS.md').read_text()
    readme = readme.replace('(../../assets/openai/sprites/alien-covenant-v016/manifest.json)',
                            '(provenance/manifest-v016.json)')
    readme = readme.replace('(PROVENANCE_V016.json)', '(' + provenance_relative + ')')
    for name in BIBLE_FILES:
        readme = readme.replace('](' + name + ')', '](bible/' + name + ')')
    readme += '\n## Bible détaillée incluse\n\n'
    readme += 'La bible suit les personnages, lieux, armes, props, véhicules, vaisseaux, terrains et planètes, avec les preuves disponibles et les manquants encore ouverts.\n\n'
    readme += '\n'.join('- [' + name + '](bible/' + name + ')' for name in BIBLE_FILES) + '\n'
    if args.ci_receipt:
        receipt = json.loads(args.ci_receipt.read_text())
        if receipt.get('version') != '0.16.0' or not all(receipt.get(key) for key in ('conclusion', 'runUrl', 'commit')):
            raise ValueError('The attached CI receipt must identify this V016 release and its published commit')
        for relative in ('dlc/covenant/index.html', 'dlc/covenant/sprites-v011.json'):
            if receipt.get('servedCovenantSourceSha256', {}).get(relative) != hashlib.sha256((root/relative).read_bytes()).hexdigest():
                raise ValueError('The CI receipt does not cover the exact current runtime: ' + relative)
        for row in bible_documents:
            relative = 'docs/covenant/' + Path(row['file']).name
            if receipt.get('bibleDocumentSha256', {}).get(relative) != row['sha256']:
                raise ValueError('The CI receipt does not cover the exact current bible: ' + relative)
        (dest/'validation').mkdir(exist_ok=True)
        write_json(dest/'validation/CI_V016.json', receipt)
        validation['githubActions'] = {**receipt, 'receipt':'validation/CI_V016.json'}
        readme += '\n## Résultat CI joint à cette livraison\n\n'
        readme += f"Exécution [{receipt.get('conclusion','non renseigné')}]({receipt.get('runUrl','')}) sur le commit `{receipt.get('commit','')}`. Le reçu détaillé, les résultats et leur portée se trouvent dans `validation/CI_V016.json` et `QA.json`. Ce reçu concerne le workflow Covenant uniquement.\n"
    else:
        (dest/'validation/CI_V016.json').unlink(missing_ok=True)
    write_json(dest/'QA.json', {'pngChecks':qa, 'validation':validation, 'originalPngBytesPreserved':True,
        'opaqueImageIds':sorted(OPAQUE_IMAGES), 'bibleDocuments':bible_documents, 'summary':summary,
        'alphaValidation':'Measured again from the original PNG pixels during this packaging run; no PNG was edited.'})
    shutil.copyfile(root/'dlc/covenant/sprites-v011.json', dest/'runtime-sprites.json')
    (dest/'SHA256SUMS.txt').write_text('\n'.join(hashes)+'\n')
    (dest/'README_FR.md').write_text(readme)
    html = OLD.HTML.replace('0.11','0.16').replace(' profils humains',' poses humaines')
    checker_selector = 'body[data-bg=checker] .view,body[data-bg=checker] .fullimage'
    if checker_selector not in html:
        raise ValueError('Catalogue checker-background selector changed')
    html = html.replace(checker_selector, checker_selector+',body[data-bg=checker] #walkcanvas')
    panel = WALK_PANEL.replace('__CYCLE_COUNT__', str(len(cycles))).replace('__PHASE_COUNT__', str(sum(len(cycle['frames']) for cycle in cycles)))
    bible_links = '<section class="biblepanel" aria-labelledby="bibletitle"><h2 id="bibletitle">Bible détaillée du DLC</h2><p>Personnages, lieux, armes, accessoires, véhicules, vaisseaux, terrains et planètes : fiches, références, limites et manquants documentés.</p><nav aria-label="Formats de la bible"><a id="bible-open" href="bible/BIBLE_COVENANT_V016.html">Ouvrir la bible</a><a href="bible/BIBLE_COVENANT_V016.md">Texte Markdown</a><a href="bible/BIBLE_COVENANT_V016.xlsx">Classeur Excel</a><a href="bible/BIBLE_COVENANT_V016.json">Données JSON</a></nav></section>'
    html = html.replace('<main><nav','<main>'+bible_links+panel+'<nav',1)
    html = html.replace('</style>','.walkpanel{display:grid;grid-template-columns:minmax(0,1fr) 480px;gap:28px;padding:25px 0 36px;margin-bottom:32px;border-bottom:1px solid var(--line)}#walkcanvas{width:100%;max-width:480px;background:var(--imagebg);border:1px solid var(--line);border-radius:5px}.walkpanel h2{font-size:30px;font-weight:500}.walkpanel nav{align-items:center;flex-wrap:wrap}.walkpanel label{display:flex;flex-direction:column;gap:6px}@media(max-width:900px){.walkpanel{grid-template-columns:1fr}#walkcanvas{margin:auto}}</style>',1)
    html = html.replace('<option value="character">Personnages</option>','<option value="character">Personnages</option><option value="character-animation">Images d’animation</option>')
    html = html.replace('cats={character:"Personnage",','cats={"character-animation":"Animation",character:"Personnage",')
    old_refs = 'function refs(row){const all=[...(row.inputReferences||[]),...(row.sourcePages||[]).map(source=>({source}))];const seen=new Set();return all.map(r=>typeof r==="string"?r:r.source||r.source_page||r.page||r.url).filter(u=>typeof u==="string"&&/^https?:\\/\\//.test(u)&&!seen.has(u)&&seen.add(u))}'
    new_refs = 'function refs(row){const all=[...(row.inputReferences||[]),...(row.sourcePages||[]),...(row.sourceUrls||[])];const seen=new Set();return all.flatMap(r=>typeof r==="string"?[r]:[r.source,r.source_page,r.page,r.pageUrl,r.url,r.imageUrl]).filter(u=>typeof u==="string"&&/^https?:\\/\\//.test(u)&&!seen.has(u)&&seen.add(u))}'
    if old_refs not in html:
        raise ValueError('Catalogue reference renderer changed')
    html = html.replace(old_refs, new_refs)
    html = html.replace('d.append(node("h3","Limites documentées"));',
        'if(row.scope)d.append(node("p","Périmètre : "+row.scope));'
        'if(row.bibleRecordIds?.length)d.append(node("p","Fiches de la bible : "+row.bibleRecordIds.join(", "),"small"));'
        'if(row.incompleteCycle)d.append(node("p","Cycle incomplet : cinq poses fournies sur huit, catalogue uniquement ; ce lot ne figure pas dans le lecteur de cycles.","notice"));'
        'd.append(node("h3","Limites documentées"));')
    html = html.replace('rows.filter(r=>!r.runtime).length+" au catalogue"]',
        'rows.filter(r=>!r.runtime).length+" au catalogue",data.summary.animationImages+" images d’animation",'
        'data.summary.completeCycles+" cycles complets · "+data.summary.completeCyclePhases+" phases"]')
    html = html.replace('d.append(node("h3","Portée"));','d.append(node("p","Lot "+row.lot+(row.instance?" · objet : "+row.instance:""),"small"));d.append(node("h3","Portée"));')
    html = html.replace('if(row.rooms?.length)', 'if(row.actors?.length)d.append(node("p","Présence : "+row.actors.join(", ")));if(row.imagePolicy==="opaque-background")d.append(node("p","Image opaque de décor ou de référence, conservée dans son cadrage original."));if(row.rooms?.length)')
    category_js = '''Object.assign(cats,{background:"Paysage",environment:"Environnement",planet:"Planète",ship:"Vaisseau",weapon:"Arme",terrain:"Terrain"});
for(const category of [...new Set(rows.map(row=>row.category))]){if(![...el('category').options].some(option=>option.value===category)){const option=node('option',cats[category]||category);option.value=category;el('category').append(option)}}
'''
    html = html.replace('render();\n</script>',category_js+WALK_JS+'\nrender();\n</script>')
    data = json.dumps({'assets':catalogue,'cycles':cycles,'cycleNames':CYCLE_NAMES,'summary':summary},ensure_ascii=False).replace('<','\\u003c')
    (dest/'index.html').write_text(html.replace('__DATA__',data))
    new_rows = [row for row in catalogue if row['lot']=='0.16']
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
    output=args.output/'ALIEN_COVENANT_SPRITES_V0.16.zip'
    expected_files = [dest/name for name in ['APERCU_NOUVEAUTES.jpg','QA.json','README_FR.md',
        'SHA256SUMS.txt','coverage.json','index.html','manifest.json','runtime-sprites.json']]
    expected_files += [dest/'sprites'/(row['id']+'.png') for row in qa]
    expected_files += [dest/'provenance'/('manifest-'+version+'.json') for version in versions]
    expected_files.append(dest/provenance_relative)
    expected_files += [dest/'bible'/name for name in BIBLE_FILES]
    if args.ci_receipt:
        expected_files.append(dest/'validation/CI_V016.json')
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
        for version in versions:
            raw = archive.read(dest.name + '/provenance/manifest-' + version + '.json')
            if hashlib.sha256(raw).hexdigest() != FROZEN_SOURCES[version]:
                raise ValueError('Archived source manifest differs: ' + version)
        if hashlib.sha256(archive.read(dest.name + '/' + provenance_relative)).hexdigest() != provenance_digest:
            raise ValueError('Archived detailed provenance differs')
        for row in bible_documents:
            raw = archive.read(dest.name + '/' + row['file'])
            if hashlib.sha256(raw).hexdigest() != row['sha256'] or len(raw) != row['bytes']:
                raise ValueError('Archived bible differs: ' + row['file'])
    print(json.dumps({'zip':str(output),'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
        'pngCount':len(qa),'newPngCount':len(new_rows),'runtimeCount':len(runtime_ids),
        'catalogueOnlyCount':len(qa)-len(runtime_ids),'cycles':len(cycles),
        'opaqueImages':len(OPAQUE_IMAGES),'bibleFiles':len(bible_documents),
        'animationImages':len(animation_ids),'completeCyclePhases':len(frame_ids),
        'incompleteDavidPoses':len(INCOMPLETE_DAVID_IDS),'allOriginalHashesVerified':True}))


if __name__=='__main__':
    main()

