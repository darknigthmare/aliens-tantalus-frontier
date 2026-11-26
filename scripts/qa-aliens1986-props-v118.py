#!/usr/bin/env python3
"""Declared V118 fixtures: real V114 projection/supports and V116+V118 renderers.

The room definitions and PNGs are real, but sessions and orientation samples are
declared test states. This inspection is not a campaign or interaction journey.
"""
import argparse
import base64
import hashlib
import json
import re
import subprocess
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

from playwright.sync_api import sync_playwright

FIXTURE_HTML = r'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aliens — accessoires et orientations V118</title><link rel="icon" href="data:,">
<style>
*{box-sizing:border-box}body{margin:0;background:#10171d;color:#edf1ee;font:15px/1.45 system-ui,sans-serif}
main{max-width:1540px;margin:auto;padding:28px}h1{font-size:29px;margin:6px 0 10px}h2{font-size:21px;margin:25px 0 5px}
p{color:#b2c2c6;margin:6px 0}.eyebrow{color:#9dccaf;font-size:12px;letter-spacing:.1em;text-transform:uppercase}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-top:15px}.angles{grid-template-columns:repeat(4,minmax(0,1fr))}
.card{background:#1a252d;border:1px solid #3b515a;border-radius:7px;padding:12px;min-width:0}
h3{font-size:16px;margin:0 0 4px}.state,.detail,.source{font:11px/1.4 ui-monospace,monospace;overflow-wrap:anywhere}.state{color:#9daeb5;min-height:33px}.detail{color:#b8cdce;min-height:32px}.source{color:#78919d;font-size:10px;margin-top:5px}
canvas{display:block;width:100%;height:auto;margin:8px 0;border:1px solid #3c525d;background-color:#202c34;background-image:linear-gradient(45deg,#2a3a44 25%,transparent 25%),linear-gradient(-45deg,#2a3a44 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a3a44 75%),linear-gradient(-45deg,transparent 75%,#2a3a44 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0}
.ok{color:#a6d8b9}.warn{color:#f1c48b}#summary{margin-top:18px;padding:15px;border:1px solid #435c61;border-radius:7px}footer{font-size:11px;color:#8198a1;margin-top:20px;overflow-wrap:anywhere}
</style></head><body><main>
<div class="eyebrow">Aliens (1986) · présentation V118 · fixtures déclarées</div>
<h1>Accessoires sur leurs supports et orientations de sentinelle</h1>
<p>Images réelles, projection et supports V114 réels, renderers V116 et V118 réels. Les états de collecte et les angles sont injectés dans des fixtures ; aucun parcours de campagne n’est revendiqué.</p>
<p>Les cartes agrandissent les objets ×2 ou ×3. Les grands supports peuvent dépasser leur cadre ; chaque PNG contrôlé doit rester entièrement visible.</p>
<div id="status">Chargement des images…</div>
<h2>Accessoires · positions et élévations du jeu</h2><p>Le coffret vide réutilise le PNG V117. Les quatre potelets partagent un seul nouveau sprite.</p><section id="props" class="grid"></section>
<h2>Sentinelle · huit directions contrôlées et un état de rotation</h2><p>Sept directions utilisent des PNG statiques, avec des miroirs à gauche. La vue frontale refusée par le générateur garde le dessin procédural V114. Aucun cycle animé complet n’est revendiqué.</p><section id="angles" class="grid angles"></section>
<div id="summary"></div><footer id="provenance"></footer>
</main><script type="module" src="/fixture/fixture.mjs"></script></body></html>'''

FIXTURE_JS = r'''import {Renderer} from '/modules/aliens-1986/v114/preview/renderer.mjs';
import {ROOMS} from '/modules/aliens-1986/v114/src/operation-scenes-v114.mjs';
import {installRasterRendererV116} from '/modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {installRasterPropsV118} from '/modules/aliens-1986/v118/raster-props-v118.mjs';

const data=await (await fetch('/fixture/manifest.json')).json(),entries=data.assets,assets=new Map(entries.map(a=>[a.id,a]));
const calls=new Map(),originalDraw=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function(...args){
  const id=this.canvas.dataset?.fixtureId;
  if(id&&calls.has(id)){
    const image=args[0],m=this.getTransform();
    const crop=args.length===9?args.slice(1,5):[0,0,image.naturalWidth,image.naturalHeight];
    const destination=args.length===9?args.slice(5,9):args.length===5?args.slice(1,5):[args[1],args[2],image.naturalWidth,image.naturalHeight];
    const [x,y,w,h]=destination,corners=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([px,py])=>({x:m.a*px+m.c*py+m.e,y:m.b*px+m.d*py+m.f}));
    const left=Math.min(...corners.map(p=>p.x)),right=Math.max(...corners.map(p=>p.x)),top=Math.min(...corners.map(p=>p.y)),bottom=Math.max(...corners.map(p=>p.y));
    calls.get(id).push({path:new URL(image.currentSrc||image.src,document.baseURI).pathname.slice(1),naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,sourceCrop:crop,destination,transform:[m.a,m.b,m.c,m.d,m.e,m.f],canvasBounds:{left,top,right,bottom,width:right-left,height:bottom-top},globalAlpha:this.globalAlpha,flipped:m.a<0});
  }
  return originalDraw.apply(this,args);
};
class FixtureRenderer extends Renderer {
  constructor(canvas,session){super(canvas);canvas.width=420;canvas.height=310;this.session=session;this.fallbackProps=0;this.fallbackActors=0;}
  prop(...args){this.fallbackProps++;return super.prop(...args);}
  actor(...args){this.fallbackActors++;return super.actor(...args);}
}
installRasterRendererV116(FixtureRenderer,entries);
installRasterPropsV118(FixtureRenderer,entries);
const propSpecs=[
  {id:'engineering-full',label:'Renforts · trois plaques',room:'v107-service',prop:'service-crate',asset:'engineering-case-stocked',collected:false},
  {id:'engineering-empty',label:'Renforts · après collecte',room:'v107-service',prop:'service-crate',asset:'supply-case-ammo-empty',collected:true},
  {id:'gateway-display',label:'Gateway · projection murale',room:'v114-gateway-inquiry',prop:'v114-gateway-inquiry-prop-1',asset:'gateway-inquiry-display',offsetY:-80},
  {id:'quay-pedestal',label:'Quai · colonne de commande',room:'v109-logistics',prop:'quay-console',asset:'service-control-pedestal'},
  {id:'reserve-pedestal',label:'Réserve · potelet',room:'v109-reserve',prop:'reserve-switch',asset:'service-control-pedestal'},
  {id:'optics-pedestal',label:'Atelier · colonne de service',room:'v112-workshop',prop:'optics-control',asset:'service-control-pedestal'},
  {id:'conduit-pedestal',label:'Conduite · colonne de commande',room:'v112-conduit',prop:'conduit-control',asset:'service-control-pedestal'},
  {id:'medical-terminal',label:'Terminal · comptoir médical',room:'v109-reserve',prop:'reserve-monitor',asset:'medical-counter-terminal',support:'medical-counter',elevation:67},
  {id:'optics-terminal',label:'Terminal · banc de calibration',room:'v112-workshop',prop:'optics-console',asset:'optics-calibration-terminal',support:'optics-bench',elevation:65},
  {id:'valve-panel',label:'Indicateur · socle de vanne',room:'v112-conduit',prop:'valve-indicator',asset:'valve-indicator-panel',support:'valve-plinth',elevation:73},
  {id:'sulaco-terminal',label:'Sulaco · table de briefing',room:'v114-sulaco-mess',prop:'v114-sulaco-mess-prop-2',asset:'sulaco-briefing-terminal',support:'v114-sulaco-mess-body-1',elevation:49},
  {id:'operations-terminal',label:'Operations · table centrale',room:'v107-operations',prop:'ops-screen',asset:'operations-table-terminal',support:'ops-table',elevation:49},
];
const angles=[
  ['right','Profil droit',0,'sentry-idle-right',false],
  ['front-right','Avant droit',Math.PI/4,'sentry-aim-front-right',false],
  ['front','Face · secours V114',Math.PI/2,null,false],
  ['front-left','Avant gauche',3*Math.PI/4,'sentry-aim-front-right',true],
  ['left','Profil gauche',Math.PI,'sentry-idle-right',true],
  ['rear-left','Arrière gauche',5*Math.PI/4,'sentry-aim-rear-right',true],
  ['rear','Dos',3*Math.PI/2,'sentry-aim-rear',false],
  ['rear-right','Arrière droit',7*Math.PI/4,'sentry-aim-rear-right',false],
].map(([id,label,angle,asset,flip])=>({id:'sentry-'+id,label,angle,asset,flip,kind:'actor',room:'v106-sentry'}));
angles.push({id:'sentry-turn',label:'Rotation · milieu de 0° → 90°',angle:0,asset:'sentry-aim-front-right',flip:false,kind:'actor',room:'v106-sentry',turn:{kind:'sentry-orient',id:'sentry-a',angle:Math.PI/2,elapsed:.5,duration:1}});
const specs=[...propSpecs.map(s=>({...s,kind:'prop'})),...angles];
function card(spec){
  const node=document.createElement('article');node.className='card';
  const h=document.createElement('h3');h.textContent=spec.label;node.append(h);
  const state=document.createElement('div');state.className='state';state.textContent=spec.kind==='prop'?spec.room+' · '+spec.prop:spec.room+' · angle '+(spec.angle*180/Math.PI).toFixed(0)+'°'+(spec.turn?' · action à 50 %':'');node.append(state);
  const canvas=document.createElement('canvas');canvas.dataset.fixtureId=spec.id;node.append(canvas);
  const detail=document.createElement('div');detail.className='detail';node.append(detail);
  const source=document.createElement('div');source.className='source';source.textContent=spec.asset?assets.get(spec.asset).path:'Vue frontale absente après refus · dessin procédural V114';node.append(source);
  document.getElementById(spec.kind==='prop'?'props':'angles').append(node);return {canvas,detail};
}
const palette={wall:'#52665c',trim:'#adc1aa',rust:'#aa8b59',light:'#bad3b1'};
const fixtures=specs.map(spec=>{
  const scene=structuredClone(ROOMS.find(s=>s.id===spec.room));if(!scene)throw new Error('Missing real room '+spec.room);
  const prop=spec.kind==='prop'?scene.props.find(p=>p.id===spec.prop):null;if(spec.kind==='prop'&&!prop)throw new Error('Missing real prop '+spec.prop);
  const sourceActor=spec.kind==='actor'?scene.actors.find(a=>a.id==='sentry-a'):null;
  if(spec.kind==='actor'&&!sourceActor)throw new Error('Missing real sentry-a');
  const actor=sourceActor?{...structuredClone(sourceActor),alive:true,ammo:100}:null;
  const session={engineering:{collected:!!spec.collected,attacks:{}},logistics:{collected:[],alarms:{}},arsenal:{selected:{},collected:[]},beacons:{collected:false},tactics:{sentries:actor?{[actor.id]:{angle:spec.angle}}:{}},action:spec.turn?structuredClone(spec.turn):null};
  const world={scene,actors:actor?[actor]:[],time:0,circuits:{},doors:{}};
  const {canvas,detail}=card(spec),renderer=new FixtureRenderer(canvas,session),context=renderer.c;
  const anchor=prop||actor;renderer.camera=anchor.x;
  const body=prop?.bodyId?scene.solids.find(b=>b.id===prop.bodyId):null;
  const projected=renderer.project(body?{x:prop.x,z:body.z+body.d}:anchor);
  const groundY=projected.y-(prop?.elevation||0)+(spec.offsetY||0);
  const support=prop?scene.solids.find(b=>b.id===(prop.supportId||prop.bodyId)):null;
  const scale=spec.kind==='actor'?3:2,origin=[210,spec.kind==='actor'?270:170];
  return {spec,world,prop,actor,support,session,renderer,canvas,context,detail,groundY,projected,scale,origin};
});
function render(f){
  const {spec,context:c,canvas,renderer,scale,origin,groundY}=f;
  calls.set(spec.id,[]);renderer.fallbackProps=0;renderer.fallbackActors=0;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);
  c.setTransform(scale,0,0,scale,origin[0],origin[1]-groundY*scale);
  const before=JSON.stringify({world:f.world,session:f.session,prop:f.prop,actor:f.actor});
  if(f.support)renderer.box(f.support,palette);
  if(spec.kind==='prop')renderer.prop(f.prop,f.world,palette);else renderer.actor(f.actor,f.world);
  f.unchanged=JSON.stringify({world:f.world,session:f.session,prop:f.prop,actor:f.actor})===before;
  c.setTransform(1,0,0,1,0,0);
}
function footBand(f){
  // Only the PNG is re-drawn to an empty analysis canvas. This avoids counting
  // the real support or V116 shadow as part of the engineering/sentry image.
  const a=assets.get(f.spec.asset),draw=calls.get(f.spec.id)[0],canvas=document.createElement('canvas');canvas.width=f.canvas.width;canvas.height=f.canvas.height;
  const c=canvas.getContext('2d',{willReadFrequently:true}),image=f.renderer.rasterSpritesV116.get(f.spec.asset).image;
  c.setTransform(...draw.transform);originalDraw.call(c,image,...draw.sourceCrop,...draw.destination);c.setTransform(1,0,0,1,0,0);
  const y=Math.max(0,Math.floor(f.origin[1])-12),pixels=c.getImageData(0,y,canvas.width,12).data;
  let left=canvas.width,right=-1;for(let row=0;row<12;row++)for(let x=0;x<canvas.width;x++)if(pixels[(row*canvas.width+x)*4+3]>=128){left=Math.min(left,x);right=Math.max(right,x);}
  return {widthPx:right>=left?right-left+1:0,leftPx:left,rightPx:right,bandTop:y,bandHeight:12,alphaThreshold:128,method:'PNG only, real draw crop/transform, final 12 pixels above projected pivot; excludes supports/shadows.'};
}
try{
  for(const f of fixtures){render(f);f.firstFrameFallbacks=f.renderer.fallbackProps+f.renderer.fallbackActors;}
  const deadline=performance.now()+45000;let loaded=false;
  while(performance.now()<deadline){
    for(const f of fixtures)render(f);
    if(fixtures.some(f=>f.renderer.rasterStatusV116().failed))throw new Error('A requested real PNG failed to decode');
    loaded=fixtures.every(f=>f.spec.asset?calls.get(f.spec.id).some(c=>c.path===assets.get(f.spec.asset).path):calls.get(f.spec.id).length===0&&f.renderer.fallbackActors===1);if(loaded)break;
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  if(!loaded)throw new Error('Timed out waiting for real V118 drawing');
  const records=fixtures.map(f=>{
    const draw=calls.get(f.spec.id)[0],bounds=draw?.canvasBounds;
    f.detail.textContent=bounds?'PNG '+draw.naturalWidth+' × '+draw.naturalHeight+' · dessin '+bounds.width.toFixed(1)+' × '+bounds.height.toFixed(1)+' px · base y='+bounds.bottom.toFixed(1)+(draw.flipped?' · miroir':''):'0 drawImage · un appel du dessin procédural V114';
    const r={id:f.spec.id,kind:f.spec.kind,expectedAsset:f.spec.asset,expectedFlip:!!f.spec.flip,sceneId:f.world.scene.id,prop:f.prop,actor:f.actor,support:f.support,session:f.session,scale:f.scale,origin:f.origin,projectedAnchor:f.projected,expectedWorldGroundY:f.groundY,draws:calls.get(f.spec.id),stateUnchanged:f.unchanged,firstFrameFallbacks:f.firstFrameFallbacks,finalFallbacks:f.renderer.fallbackProps+f.renderer.fallbackActors,resourceStatus:f.renderer.rasterStatusV116()};
    if(f.spec.asset&&(f.spec.id.startsWith('engineering-')||f.spec.kind==='actor'))r.footBand=footBand(f);
    return r;
  });
  const byId=new Map(records.map(r=>[r.id,r]));
  const full=byId.get('engineering-full'),empty=byId.get('engineering-empty'),stockRatio=full.footBand.widthPx/empty.footBand.widthPx;
  const checks=[
    {name:'All eleven new PNGs are drawn by the installed V118 renderer',pass:data.supplementIds.every(id=>records.some(r=>r.expectedAsset===id&&r.draws.some(d=>d.path===assets.get(id).path)))},
    {name:'Every available placement and angle uses its independent expected PNG',pass:records.every(r=>r.expectedAsset?r.draws.length===1&&r.draws[0].path===assets.get(r.expectedAsset).path:r.draws.length===0)},
    {name:'Decoded PNG dimensions match their pinned records',pass:records.every(r=>r.draws.every(d=>{const a=assets.get(r.expectedAsset);return d.naturalWidth===a.width&&d.naturalHeight===a.height;}))},
    {name:'Only the unavailable frontal view falls back, with no loader errors',pass:records.every(r=>r.finalFallbacks===(r.expectedAsset?0:1)&&r.resourceStatus.failed===0)},
    {name:'The real room definitions and declared session states are unchanged',pass:records.every(r=>r.stateUnchanged)},
    {name:'Every sprite is fully visible in its inspection canvas',pass:records.every(r=>r.draws.every(d=>{const b=d.canvasBounds;return b.left>=-.1&&b.top>=-.1&&b.right<=420.1&&b.bottom<=310.1;}))},
    {name:'Bottom pivots stay on the declared projected support/ground line',pass:records.every(r=>r.draws.every(d=>Math.abs(d.canvasBounds.bottom-r.origin[1])<1))},
    {name:'Five table terminals keep their real support identities and heights',pass:propSpecs.filter(s=>s.support).every(s=>{const r=byId.get(s.id);return r.support?.id===s.support&&r.prop.elevation===s.elevation&&r.support.h===s.elevation;})},
    {name:'Four real pedestal placements use the shared compact control',pass:['quay-pedestal','reserve-pedestal','optics-pedestal','conduit-pedestal'].every(id=>byId.get(id).draws[0].path===assets.get('service-control-pedestal').path)},
    {name:'Collected engineering stock reuses the unchanged V117 empty PNG',pass:empty.session.engineering.collected&&empty.draws[0].path==='assets/dlc/aliens-1986/v117/props/supply-case-ammo-empty.png'&&!full.session.engineering.collected},
    {name:'Gateway display is raised 80 world units above its wall anchor',pass:Math.abs(byId.get('gateway-display').projectedAnchor.y-byId.get('gateway-display').expectedWorldGroundY-80)<.001},
    {name:'All seven raster directions preserve the expected mirror convention',pass:records.filter(r=>r.kind==='actor'&&r.expectedAsset).every(r=>r.draws[0].flipped===r.expectedFlip)},
    {name:'The missing frontal PNG preserves the original V114 sentry renderer',pass:byId.get('sentry-front').draws.length===0&&byId.get('sentry-front').finalFallbacks===1},
    {name:'Half of the existing 0 to 90 degree turn selects the front-right image',pass:byId.get('sentry-turn').draws[0].path===assets.get('sentry-aim-front-right').path},
    {name:'Engineering and sentry PNG feet have measurable alpha pixels',pass:records.filter(r=>r.footBand).every(r=>r.footBand.widthPx>0)},
  ];
  const warnings=[];if(stockRatio<.85||stockRatio>1.18)warnings.push('Engineering full/empty ground-width ratio '+stockRatio.toFixed(3)+' requires visual inspection.');
  const ok=checks.every(c=>c.pass);
  document.getElementById('status').textContent=checks.filter(c=>c.pass).length+'/'+checks.length+' contrôles · '+records.length+' états visibles · '+warnings.length+' alerte de proportion';
  document.getElementById('status').className=ok?'ok':'warn';
  document.getElementById('summary').textContent='Coffret plein/vide : socles '+full.footBand.widthPx+' / '+empty.footBand.widthPx+' px. Sept directions utilisent les PNG ; la direction frontale conserve le rendu V114. Les pivots des images et du milieu de rotation sont contrôlés. Revue humaine requise ; ni film 1:1, ni animation complète, ni parcours de campagne certifiés.';
  document.getElementById('provenance').textContent='Manifeste V118 '+data.provenance.supplementManifestSha256+' · module V118 '+data.provenance.modules['modules/aliens-1986/v118/raster-props-v118.mjs'];
  window.__QA_RESULT__={ok,kind:'declared-real-renderer-fixtures-not-gameplay',checks,visualWarnings:warnings,engineeringScale:{stockedFootPx:full.footBand.widthPx,emptyFootPx:empty.footBand.widthPx,stockedToEmptyRatio:stockRatio},fixtures:records,limits:['Real room/support/projection sources are used with synthetic session states; this is not a campaign journey.','The large procedural supports may extend beyond their inspection cards; tested PNG bounds must be fully visible.','Seven directions use static views and mirrors; the unavailable frontal image retains the V114 procedural drawing. This is not a continuous rotation animation.','The ground-width ratio is a diagnostic and does not certify film dimensions.','Source and screenshot visual inspection are distinct from exact film fidelity.']};
  window.__QA_READY__=true;
}catch(error){document.getElementById('status').textContent='Échec : '+error.message;window.__QA_ERROR__=String(error.stack||error);}
'''

MANIFESTS = {
    'docs/development/aliens-1986-sprites-v116/manifest.json': 'b9213752445a01e293f44bccface374d3d3882e8ae071baefaa75bf04d589af6',
    'docs/development/aliens-1986-sprites-v117/manifest.json': '09df948f5ee55c2b9b2494924475b7113468edddfa4d803caaf1323ee4804a62',
    'docs/development/aliens-1986-sprites-v118/manifest.json': 'ba671cbbd67b8d16fe7b1173fb0f61240e05d0379431589b35a7a81dec963d9e',
}
MODULE_PINS = {
    'modules/aliens-1986/v116/sprite-loader-v116.mjs': '8dd7974d0222294b0e013e06efdc74d76259927ae9890648b57b6fa4385cc7c5',
    'modules/aliens-1986/v116/raster-renderer-v116.mjs': '77d7315bbc4adb6ddb01c4493fc45daaed8beb73ba68efc3d1f88373a7d28170',
    'modules/aliens-1986/v118/raster-props-v118.mjs': 'dd17932bedfe1f457440f11d9f4e1fd9b87da19660177c2c210d1d85b3c3b31c',
}
SUPPLEMENT_IDS = ['engineering-case-stocked', 'gateway-inquiry-display', 'service-control-pedestal',
                  'medical-counter-terminal', 'optics-calibration-terminal', 'valve-indicator-panel',
                  'sulaco-briefing-terminal', 'operations-table-terminal', 'sentry-aim-front-right',
                  'sentry-aim-rear-right', 'sentry-aim-rear']


def sha(data):
    return hashlib.sha256(data).hexdigest()


def preflight(root):
    manifests = []
    for name, expected in MANIFESTS.items():
        blob = (root / name).read_bytes()
        assert sha(blob) == expected, f'Unreviewed manifest: {name}'
        manifests.append(json.loads(blob))
    current = manifests[-1]
    assert current['schema'] == 'aliens1986-raster-supplement-v118'
    assert current['version'] == current['presentationVersion'] == 118
    assert current['counts'] == {'base': 130, 'added': 11, 'total': 141}
    assert sorted(a['id'] for a in current['assets']) == sorted(SUPPLEMENT_IDS)
    assets = [a for manifest in manifests for a in manifest['assets']]
    assert len(assets) == len({a['id'] for a in assets}) == len({a['path'] for a in assets}) == 141
    recovery_blob = (root / 'modules/aliens-1986/RECOVERY_MANIFEST.json').read_bytes()
    assert sha(recovery_blob) == '5bfb37cc785657a11e62fe1ca0b92093e2b8b5bd0935fb0bf2cedd0f87da0acd'
    recovery = {f['path']: f['sha256'] for f in json.loads(recovery_blob)['files']}
    routes, modules = {}, {}
    pending = [root / p for p in [*MODULE_PINS, 'modules/aliens-1986/v114/preview/renderer.mjs',
                                  'modules/aliens-1986/v114/src/operation-scenes-v114.mjs']]
    while pending:
        path = pending.pop().resolve()
        name = path.relative_to(root).as_posix()
        if name in modules:
            continue
        assert path.is_file() and not path.is_symlink() and path.suffix == '.mjs'
        blob = path.read_bytes()
        if name.startswith('modules/aliens-1986/v114/'):
            expected = recovery[name.removeprefix('modules/aliens-1986/v114/')]
        else:
            expected = MODULE_PINS[name]
        assert sha(blob) == expected, f'Unreviewed renderer dependency: {name}'
        modules[name] = sha(blob)
        routes['/' + name] = (blob, 'text/javascript; charset=utf-8')
        for relative in re.findall(r'''(?:from\s*|import\s*)['"](\.[^'"]+)['"]''', blob.decode()):
            pending.append(path.parent / relative)
    # During the first frame, V118 delegates pending terminals to V116, whose
    # existing operations-console image must also be served and verified.
    selected_ids = set(SUPPLEMENT_IDS + ['supply-case-ammo-empty', 'sentry-idle-right', 'operations-console'])
    selected = [a for a in assets if a['id'] in selected_ids]
    assert {a['id'] for a in selected} == selected_ids
    verified = []
    for a in selected:
        path = root / a['path']
        assert path.is_file() and not path.is_symlink() and path.resolve() == path
        assert path.is_relative_to(root / 'assets')
        blob = path.read_bytes()
        assert sha(blob) == a['sha256'] and len(blob) == a['bytes'], f'Changed PNG: {a["id"]}'
        assert blob[:8] == b'\x89PNG\r\n\x1a\n' and blob[12:16] == b'IHDR'
        width, height = int.from_bytes(blob[16:20]), int.from_bytes(blob[20:24])
        assert (width, height) == (a['width'], a['height'])
        verified.append({'id': a['id'], 'path': a['path'], 'sha256': sha(blob), 'bytes': len(blob),
                         'width': width, 'height': height, 'pngColorType': blob[25], 'bbox': a['bbox'], 'pivot': a['pivot']})
        routes['/' + a['path']] = (blob, 'image/png')
    return {'assets': assets, 'supplementIds': SUPPLEMENT_IDS, 'provenance': {
        'gitHeadAtRun': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
        'manifestHashes': MANIFESTS, 'supplementManifestSha256': list(MANIFESTS.values())[-1],
        'modules': modules, 'realPngsVerified': verified,
        'fixtureSources': {'script': sha(Path(__file__).read_bytes()), 'embeddedHtml': sha(FIXTURE_HTML.encode()),
                           'embeddedJavaScript': sha(FIXTURE_JS.encode())}}}, routes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, default=Path.cwd())
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--executable', type=Path)
    parser.add_argument('--preflight-only', action='store_true', help='Verify source bytes only; does not run browser assertions')
    args = parser.parse_args()
    root, output = args.source_root.resolve(), args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    payload, routes, server, page, browser, context = None, {}, None, None, None, None
    execution = {'preflight': 'not-started', 'browser': 'not-started', 'assertionsProduced': False}
    report = {'ok': False, 'kind': 'declared-real-renderer-fixtures-not-gameplay', 'checks': [], 'execution': execution}
    missing, network, errors, bad = [], [], [], []

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args):
            pass

        def do_GET(self):
            path = unquote(urlsplit(self.path).path)
            if path not in routes:
                missing.append(path)
                self.send_error(404)
                return
            body, mime = routes[path]
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(body)

    try:
        execution['preflight'] = 'running'
        payload, routes = preflight(root)
        execution['preflight'] = 'passed'
        if args.preflight_only:
            execution['browser'] = 'explicitly-not-run'
        else:
            routes.update({'/': (FIXTURE_HTML.encode(), 'text/html; charset=utf-8'),
                           '/fixture/index.html': (FIXTURE_HTML.encode(), 'text/html; charset=utf-8'),
                           '/fixture/fixture.mjs': (FIXTURE_JS.encode(), 'text/javascript; charset=utf-8'),
                           '/fixture/manifest.json': (json.dumps(payload).encode(), 'application/json; charset=utf-8')})
            server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
            threading.Thread(target=server.serve_forever, daemon=True).start()
            with sync_playwright() as p:
                try:
                    execution['browser'] = 'launching'
                    browser = p.chromium.launch(headless=True, executable_path=str(args.executable) if args.executable else None)
                    context = browser.new_context(viewport={'width': 1600, 'height': 1100}, device_scale_factor=1)
                    page = context.new_page()
                    execution['browser'] = 'running'
                    page.on('pageerror', lambda error: errors.append(str(error)))
                    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
                    page.on('requestfailed', lambda request: network.append({'path': urlsplit(request.url).path, 'failure': request.failure}))
                    page.on('response', lambda response: bad.append({'path': urlsplit(response.url).path, 'status': response.status}) if response.status >= 400 else None)
                    page.goto(f'http://127.0.0.1:{server.server_port}/fixture/index.html', wait_until='networkidle')
                    page.wait_for_function('window.__QA_READY__ || window.__QA_ERROR__', timeout=60000)
                    error = page.evaluate('window.__QA_ERROR__ || null')
                    if error:
                        raise RuntimeError(error)
                    report.update(page.evaluate('window.__QA_RESULT__'))
                    execution['assertionsProduced'] = True
                    report['browser'] = {'engine': 'Chromium', 'version': browser.version, 'headless': True}
                    page.screenshot(path=str(output / 'props-v118.png'), full_page=True)
                    report['artifacts'] = {'screenshot': 'props-v118.png', 'screenshotSha256': sha((output / 'props-v118.png').read_bytes())}
                    preview = page.screenshot(type='jpeg', quality=55, full_page=True)
                    print('ALIENS_VISUAL_JPEG:05-props-v118:' + base64.b64encode(preview).decode('ascii'), flush=True)
                    execution['browser'] = 'completed'
                except Exception:
                    if page is not None and not page.is_closed():
                        try:
                            capture = output / 'props-v118-error.png'
                            page.screenshot(path=str(capture), full_page=True, timeout=10000)
                            report['failureScreenshot'] = {'path': capture.name, 'sha256': sha(capture.read_bytes())}
                        except Exception as capture_error:
                            report['captureError'] = str(capture_error)
                    raise
                finally:
                    for resource in (context, browser):
                        if resource is not None:
                            try:
                                resource.close()
                            except Exception as cleanup_error:
                                report.setdefault('cleanupErrors', []).append(str(cleanup_error))
    except Exception as error:
        report['error'] = str(error)
        report['errorType'] = type(error).__name__
        report['ok'] = False
        if execution['preflight'] == 'running':
            execution['preflight'] = 'failed'
        if execution['browser'] == 'launching':
            execution['browser'] = 'failed-to-launch'
        elif execution['browser'] == 'running':
            execution['browser'] = 'failed'
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()
    if execution['assertionsProduced']:
        report['checks'].append({'name': 'No failed resource or browser error', 'pass': not (missing or network or errors or bad)})
    report['ok'] = bool(report['ok'] and execution['assertionsProduced'] and all(c['pass'] for c in report['checks']) and not report.get('error') and not report.get('cleanupErrors'))
    report['timestampUtc'] = datetime.now(timezone.utc).isoformat()
    report['provenance'] = payload['provenance'] if payload else {'inputsVerified': False}
    report['resourceEvidence'] = {'server404s': missing, 'requestFailures': network, 'httpErrors': bad, 'browserErrors': errors}
    report['visualReviewRequired'] = True
    (output / 'props-v118-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'ok': report['ok'], 'checks': len(report['checks']), 'passed': sum(c['pass'] for c in report['checks']),
                      'visualWarnings': report.get('visualWarnings', []), 'report': 'props-v118-report.json',
                      'execution': execution, 'error': report.get('error')}, ensure_ascii=False))
    if args.preflight_only:
        return 0 if execution['preflight'] == 'passed' and not report.get('error') else 1
    return 0 if report['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
