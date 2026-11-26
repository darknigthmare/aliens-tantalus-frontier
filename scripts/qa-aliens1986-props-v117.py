#!/usr/bin/env python3
"""Declared V117 prop fixtures using the real V116 renderer and PNGs.

This is a renderer inspection, not a campaign walkthrough. HTML and JavaScript
are embedded below so the source-controlled script is independently runnable.
"""
import argparse
import base64
import hashlib
import json
import subprocess
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

from playwright.sync_api import sync_playwright

FIXTURE_HTML = r'''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Aliens — contrôle de rendu des accessoires V117</title>
  <link rel="icon" href="data:,">
  <style>
    *{box-sizing:border-box}
    body{margin:0;background:#0e151b;color:#e4e9ed;font:15px/1.45 system-ui,sans-serif}
    main{max-width:1536px;margin:auto;padding:28px 30px}
    h1{font-size:29px;line-height:1.2;margin:5px 0 9px;font-weight:650}
    h2{font-size:19px;margin:25px 0 4px;font-weight:620}
    p{margin:5px 0;color:#b8c5ce}
    .eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#9dc8b3}
    .notice{max-width:1120px}
    .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-top:13px}
    .card{min-width:0;background:#18232c;border:1px solid #3a4b57;border-radius:8px;padding:12px}
    .card h3{font-size:15px;margin:0 0 3px;min-height:22px;color:#f0f3f5}
    .state{font:11px/1.4 ui-monospace,monospace;color:#9fb1bf;min-height:30px;overflow-wrap:anywhere}
    canvas{display:block;width:100%;height:auto;margin:9px 0;background-color:#202b34;background-image:linear-gradient(45deg,#2b3944 25%,transparent 25%),linear-gradient(-45deg,#2b3944 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2b3944 75%),linear-gradient(-45deg,transparent 75%,#2b3944 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0;border:1px solid #405360;border-radius:3px}
    .detail{font:11px/1.4 ui-monospace,monospace;color:#bbccd7;min-height:31px}
    .source{font-size:10px;color:#8195a4;margin-top:5px;overflow-wrap:anywhere}
    .summary{grid-column:span 2;background:#18232c;border:1px solid #3a4b57;border-radius:8px;padding:18px}
    .summary h3{font-size:17px;margin:0 0 11px}
    .summary p{font-size:13px;margin:8px 0}
    .ok{color:#9ed8b5}.warn{color:#f2c27a}
    #status{margin:13px 0 0;font-size:13px;color:#9dc8b3}
    footer{border-top:1px solid #344653;margin-top:22px;padding-top:13px;font-size:12px;color:#8da2b1}
    code{font:12px ui-monospace,monospace}
  </style>
</head>
<body>
<main>
  <div class="eyebrow">Aliens (1986) · fixture de présentation · lot V117</div>
  <h1>Sept variantes de décor dans le renderer V116</h1>
  <p class="notice">Les PNG et le renderer proviennent du checkout. Les positions, scènes et états ci-dessous sont des fixtures déclarées, séparées du jeu. Aucune session de campagne ni sauvegarde n’est modifiée.</p>
  <p class="notice">Le damier est le fond CSS du canvas : il révèle la transparence. Le grossissement commun des caisses permet de comparer leur socle, même lorsque le couvercle est relevé.</p>
  <div id="status">Chargement et contrôle des images…</div>
  <section><h2>Caisses · même projection et même grossissement ×3</h2>
    <p>Le renderer reçoit les états avant et après collecte ; ses dimensions cibles restent 76 × 44 unités.</p>
    <div class="grid" id="crates"></div>
  </section>
  <section><h2>Sas · surface existante et ouverture traversable</h2>
    <p>Dimensions de fixture identiques. Dans l’état ouvert, les restes du sas bréché sont limités aux montants.</p>
    <div class="grid" id="doors"></div>
  </section>
  <section><h2>Plateau Sulaco et contrôles de transparence</h2>
    <div class="grid" id="other"><div class="summary" id="summary"><h3>Mesures en attente</h3></div></div>
  </section>
  <footer id="provenance"></footer>
</main>
<script type="module" src="/fixture/fixture.mjs"></script>
</body>
</html>
'''

FIXTURE_JS = r'''import {installRasterRendererV116} from '/modules/aliens-1986/v116/raster-renderer-v116.mjs';

const fixtureData=await (await fetch('/fixture/manifest.json')).json();
const entries=fixtureData.assets,assets=new Map(entries.map(a=>[a.id,a]));
const currentCalls=new Map(),originalDrawImage=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function(...args) {
  const id=this.canvas.dataset?.fixtureId;
  if(id && currentCalls.has(id)) {
    const image=args[0],m=this.getTransform();
    const crop=args.length===9?args.slice(1,5):[0,0,image.naturalWidth,image.naturalHeight];
    const destination=args.length===9?args.slice(5,9):args.length===5?args.slice(1,5):[args[1],args[2],image.naturalWidth,image.naturalHeight];
    const [x,y,w,h]=destination;
    const corners=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([px,py])=>({x:m.a*px+m.c*py+m.e,y:m.b*px+m.d*py+m.f}));
    const left=Math.min(...corners.map(p=>p.x)),right=Math.max(...corners.map(p=>p.x)),top=Math.min(...corners.map(p=>p.y)),bottom=Math.max(...corners.map(p=>p.y));
    currentCalls.get(id).push({
      path:new URL(image.currentSrc||image.src,document.baseURI).pathname.slice(1),
      naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,
      sourceCrop:crop,destination,transform:[m.a,m.b,m.c,m.d,m.e,m.f],
      canvasBounds:{left,top,right,bottom,width:right-left,height:bottom-top},
      globalAlpha:this.globalAlpha
    });
  }
  return originalDrawImage.apply(this,args);
};

class FixtureRenderer {
  constructor(context,session){this.c=context;this.session=session;this.fallbackProps=0;this.fallbackActors=0;this.originalDoors=0;}
  project(p){return {x:p.x,y:p.z};}
  prop(){this.fallbackProps++;}
  actor(){this.fallbackActors++;}
  door(){this.originalDoors++;}
}
installRasterRendererV116(FixtureRenderer,entries);

const gate={id:'qa-hatch',x:0,z:0,w:80,d:16,h:120};
const specs=[
  {id:'medical-closed',section:'crates',label:'Médicale · avant collecte',asset:'supply-case',kind:'prop',prop:{type:'supply',stockId:'medical-fixture'},collected:[],room:'v106-hadley',scale:3,origin:[175,210],state:'logistics.collected = [] · base V116'},
  {id:'medical-empty',section:'crates',label:'Médicale · après collecte',asset:'supply-case-medical-empty',kind:'prop',prop:{type:'supply',stockId:'medical-fixture'},collected:['medical-fixture'],room:'v106-hadley',scale:3,origin:[175,210],state:'logistics.collected = [medical-fixture]'},
  {id:'ammo-closed',section:'crates',label:'Munitions · avant collecte',asset:'supply-case-ammo-closed',kind:'prop',prop:{type:'supply',stockId:'ammo-fixture'},collected:[],room:'v106-hadley',scale:3,origin:[175,210],state:'logistics.collected = []'},
  {id:'ammo-empty',section:'crates',label:'Munitions · après collecte',asset:'supply-case-ammo-empty',kind:'prop',prop:{type:'supply',stockId:'ammo-fixture'},collected:['ammo-fixture'],room:'v106-hadley',scale:3,origin:[175,210],state:'logistics.collected = [ammo-fixture]'},
  {id:'damaged-closed',section:'doors',label:'Sas endommagé · fermé',asset:'door-leaf-damaged',kind:'hatch',structural:{hp:70,brace:0,breached:false},linkOpen:false,scale:1.75,origin:[105,215],state:'hp:70 · brace:0 · breached:false'},
  {id:'reinforced-closed',section:'doors',label:'Sas renforcé · fermé',asset:'door-leaf-reinforced',kind:'hatch',structural:{hp:70,brace:1,breached:false},linkOpen:false,scale:1.75,origin:[105,215],state:'hp:70 · brace:1 · breached:false'},
  {id:'breached-closed',section:'doors',label:'Sas bréché · surface seule',asset:'door-leaf-breached',kind:'hatch',structural:{hp:0,brace:0,breached:true},linkOpen:false,scale:1.75,origin:[105,215],state:'hp:0 · brace:0 · breached:true · fermé'},
  {id:'breached-open',section:'doors',label:'Sas bréché · ouvert',asset:'door-leaf-breached',kind:'hatch',structural:{hp:0,brace:0,breached:true},linkOpen:true,scale:1.75,origin:[105,215],state:'breached:true · linkOpen:true · montants'},
  {id:'meal-sulaco',section:'other',label:'Plateau · repas du Sulaco',asset:'meal-tray-food',kind:'prop',prop:{type:'meal'},collected:[],room:'v114-sulaco-mess',scale:3,origin:[175,170],state:'scene.id = v114-sulaco-mess'},
  {id:'intact-open',section:'other',label:'Sas intact · ouvert',asset:null,kind:'hatch',structural:{hp:100,brace:0,breached:false},linkOpen:true,scale:1.75,origin:[105,215],state:'breached:false · linkOpen:true · aucun battant'}
];

function addCard(spec) {
  const card=document.createElement('article');card.className='card';
  const heading=document.createElement('h3');heading.textContent=spec.label;card.append(heading);
  const state=document.createElement('div');state.className='state';state.textContent=spec.state;card.append(state);
  const canvas=document.createElement('canvas');canvas.width=350;canvas.height=270;canvas.dataset.fixtureId=spec.id;card.append(canvas);
  const detail=document.createElement('div');detail.className='detail';card.append(detail);
  const source=document.createElement('div');source.className='source';source.textContent=spec.asset?assets.get(spec.asset)?.path:'Aucune image attendue dans l’ouverture';card.append(source);
  const target=document.getElementById(spec.section);target.insertBefore(card,target.querySelector('.summary'));
  return {canvas,detail};
}

const fixtures=specs.map(spec=>{
  const {canvas,detail}=addCard(spec),context=canvas.getContext('2d',{willReadFrequently:true});
  const session={logistics:{collected:[...(spec.collected||[])]},action:null,engineering:{attacks:{}},arsenal:{selected:{}}};
  const world={scene:{id:spec.room||'v106-hadley',solids:[]},actors:[],circuits:{},doors:{}};
  const prop={...spec.prop,x:0,z:0},state={structural:spec.structural,linkOpen:spec.linkOpen};
  return {spec,canvas,context,detail,session,world,prop,state,renderer:new FixtureRenderer(context,session)};
});

function render(fixture) {
  const {spec,canvas,context,renderer,world,prop,state}=fixture;
  currentCalls.set(spec.id,[]);renderer.fallbackProps=0;
  context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,canvas.width,canvas.height);
  context.setTransform(spec.scale,0,0,spec.scale,...spec.origin);
  const before=JSON.stringify({session:renderer.session,world,prop,state,gate});
  if(spec.kind==='prop')renderer.prop(prop,world,{});
  else renderer.rasterHatchSurfaceV116(gate,state);
  fixture.unchanged=JSON.stringify({session:renderer.session,world,prop,state,gate})===before;
  context.setTransform(1,0,0,1,0,0);
}

function alphaRegion(context,rect) {
  const x=Math.max(0,Math.ceil(rect.x)),y=Math.max(0,Math.ceil(rect.y));
  const w=Math.min(context.canvas.width,Math.floor(rect.x+rect.width))-x,h=Math.min(context.canvas.height,Math.floor(rect.y+rect.height))-y;
  if(w<=0 || h<=0)throw new Error('The declared alpha sample has no visible canvas pixels.');
  const data=context.getImageData(x,y,w,h).data;
  let nontransparent=0,opaque=0,nearTransparent=0,maxAlpha=0;
  for(let i=3;i<data.length;i+=4){if(data[i]>0)nontransparent++;if(data[i]>=128)opaque++;if(data[i]<=1)nearTransparent++;maxAlpha=Math.max(maxAlpha,data[i]);}
  return {rectangle:{x,y,width:w,height:h},pixels:w*h,nontransparentPixels:nontransparent,opaquePixels:opaque,transparentFraction:1-nontransparent/(w*h),alphaAtMostOneFraction:nearTransparent/(w*h),maxAlpha};
}

function projectSourceRectangle(draw,rectangle) {
  const [l,t,r,b]=rectangle,[sx,sy,sw,sh]=draw.sourceCrop,[dx,dy,dw,dh]=draw.destination,[a,bb,c,d,e,f]=draw.transform;
  const visible=[Math.max(l,sx),Math.max(t,sy),Math.min(r,sx+sw),Math.min(b,sy+sh)];
  if(visible[2]<=visible[0] || visible[3]<=visible[1])throw new Error('The reviewed source opening is outside the raster crop.');
  const corners=[[visible[0],visible[1]],[visible[2],visible[1]],[visible[0],visible[3]],[visible[2],visible[3]]].map(([x,y])=>{
    const px=dx+(x-sx)*dw/sw,py=dy+(y-sy)*dh/sh;
    return {x:a*px+c*py+e,y:bb*px+d*py+f};
  });
  const x=Math.min(...corners.map(p=>p.x)),y=Math.min(...corners.map(p=>p.y));
  return {sourceRectangle:rectangle,visibleSourceRectangle:visible,sourceRectangleFullyVisible:visible.every((v,i)=>v===rectangle[i]),mapping:{sourceCrop:draw.sourceCrop,destination:draw.destination,transform:draw.transform},canvasRectangle:{x,y,width:Math.max(...corners.map(p=>p.x))-x,height:Math.max(...corners.map(p=>p.y))-y}};
}

function groundFootprint(fixture) {
  const {context,canvas,spec}=fixture,ground=Math.round(spec.origin[1]);
  const pixels=context.getImageData(0,ground-18,canvas.width,18).data,spans=[];
  let left=canvas.width,right=-1;
  for(let y=0;y<18;y++){
    let l=canvas.width,r=-1;
    for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>=128){l=Math.min(l,x);r=Math.max(r,x);}
    if(r>=l){spans.push(r-l+1);left=Math.min(left,l);right=Math.max(right,r);}
  }
  spans.sort((a,b)=>a-b);
  return {band:{top:ground-18,bottom:ground,height:18,alphaThreshold:128},unionWidthPx:right>=left?right-left+1:0,medianRowWidthPx:spans.length?spans[Math.floor(spans.length/2)]:0,nonemptyRows:spans.length,method:'Alpha >=128 in the final 18 canvas pixels above the common ground pivot; labels are outside this band.'};
}

try {
  const deadline=performance.now()+45000;
  let loaded=false;
  while(performance.now()<deadline) {
    for(const fixture of fixtures)render(fixture);
    if(fixtures.some(f=>f.renderer.rasterStatusV116().failed))throw new Error('A sprite failed to decode: '+JSON.stringify(fixtures.map(f=>({id:f.spec.id,status:f.renderer.rasterStatusV116()}))));
    loaded=fixtures.every(f=>{
      const status=f.renderer.rasterStatusV116();
      const drawing=f.spec.asset?currentCalls.get(f.spec.id).some(c=>c.path===assets.get(f.spec.asset).path):currentCalls.get(f.spec.id).length===0;
      return drawing && status.loaded===status.requested;
    });
    if(loaded)break;
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  if(!loaded)throw new Error('Timed out waiting for the expected real drawImage calls.');
  const records=fixtures.map(f=>{
    const {spec,renderer}=f,draws=currentCalls.get(spec.id);
    const record={id:spec.id,label:spec.label,declaredFixture:{kind:spec.kind,projection:'x -> x, z -> y (fixture screen plane, not campaign isometric camera)',scale:spec.scale,origin:spec.origin,sceneId:f.world.scene.id,prop:spec.kind==='prop'?f.prop:null,session:f.session,hatch:spec.kind==='hatch'?{box:gate,...f.state}:null},expectedAsset:spec.asset,draws,resourceStatus:renderer.rasterStatusV116(),stateUnchanged:f.unchanged,fallbackPropsFinalFrame:renderer.fallbackProps};
    if(spec.section==='crates')record.groundFootprint=groundFootprint(f);
    if(spec.kind==='hatch'){
      record.aperture=alphaRegion(f.context,{x:spec.origin[0]+2*spec.scale,y:spec.origin[1]+(-120+2)*spec.scale,width:76*spec.scale,height:132*spec.scale});
      if(spec.id==='breached-closed'){
        // This internal PNG rectangle was measured independently: 72,000 source
        // pixels, alpha 0..1. Follow the actual cover crop and drawing transform.
        const projected=projectSourceRectangle(draws[0],[300,250,700,430]);
        record.centerOpening={...projected,...alphaRegion(f.context,projected.canvasRectangle)};
      }
    }
    const bounds=draws[0]?.canvasBounds;
    f.detail.textContent=bounds?'PNG '+draws[0].naturalWidth+' × '+draws[0].naturalHeight+' · dessin '+bounds.width.toFixed(1)+' × '+bounds.height.toFixed(1)+' px':'0 drawImage · ouverture transparente';
    if(record.groundFootprint)f.detail.textContent+=' · socle '+record.groundFootprint.unionWidthPx+' px';
    return record;
  });
  const byId=new Map(records.map(r=>[r.id,r]));
  const scaleComparisons=[['Médicale','medical-closed','medical-empty'],['Munitions','ammo-closed','ammo-empty']].map(([label,closed,empty])=>{
    const a=byId.get(closed),b=byId.get(empty),ratio=b.groundFootprint.unionWidthPx/a.groundFootprint.unionWidthPx;
    return {label,closedFixture:closed,emptyFixture:empty,closedGroundWidthPx:a.groundFootprint.unionWidthPx,emptyGroundWidthPx:b.groundFootprint.unionWidthPx,emptyToClosedRatio:ratio,possibleLidShrink:ratio<.85,threshold:.85,thresholdIsDiagnostic:true};
  });
  const checks=[
    {name:'All seven new variant keys are drawn by the real renderer',pass:fixtureData.supplementIds.every(id=>records.some(r=>r.expectedAsset===id&&r.draws.some(d=>d.path===assets.get(id).path)))},
    {name:'Every expected image uses a successful real drawImage call',pass:records.every(r=>r.expectedAsset?r.draws.length===1&&r.draws[0].path===assets.get(r.expectedAsset).path:r.draws.length===0)},
    {name:'Decoded dimensions match the pinned manifest',pass:records.every(r=>r.draws.every(d=>{const a=entries.find(a=>a.path===d.path);return a&&d.naturalWidth===a.width&&d.naturalHeight===a.height;}))},
    {name:'No loader failure or final procedural fallback',pass:records.every(r=>r.resourceStatus.failed===0&&r.fallbackPropsFinalFrame===0)},
    {name:'Declared world, prop, session and hatch state stay unchanged',pass:records.every(r=>r.stateUnchanged)},
    {name:'The open breached hatch has no raster pixels in its traversable aperture',pass:byId.get('breached-open').aperture.nontransparentPixels===0},
    {name:'The open intact hatch has no raster pixels in its traversable aperture',pass:byId.get('intact-open').aperture.nontransparentPixels===0},
    {name:'The reviewed source opening remains transparent after the real crop and transform',pass:byId.get('breached-closed').centerOpening.sourceRectangleFullyVisible&&byId.get('breached-closed').centerOpening.opaquePixels===0&&byId.get('breached-closed').centerOpening.alphaAtMostOneFraction>=.99},
    {name:'Crate ground bands are measurable',pass:records.filter(r=>r.groundFootprint).every(r=>r.groundFootprint.unionWidthPx>0)}
  ];
  const warnings=scaleComparisons.filter(c=>c.possibleLidShrink).map(c=>c.label+': empty crate ground width is '+(c.emptyToClosedRatio*100).toFixed(1)+'% of the closed crate; inspect possible body shrink due to the lid.');
  const summary=document.getElementById('summary');summary.replaceChildren();
  const heading=document.createElement('h3');heading.textContent='Mesures du rendu réel';summary.append(heading);
  for(const comparison of scaleComparisons){
    const p=document.createElement('p');p.className=comparison.possibleLidShrink?'warn':'ok';
    p.textContent='Socle '+comparison.label.toLowerCase()+' : '+comparison.closedGroundWidthPx+' → '+comparison.emptyGroundWidthPx+' px ('+(comparison.emptyToClosedRatio*100).toFixed(1)+' %).';summary.append(p);
  }
  const p=document.createElement('p');p.textContent='Sas bréché ouvert : '+byId.get('breached-open').aperture.nontransparentPixels+' pixel de battant dans l’ouverture. Sas intact ouvert : '+byId.get('intact-open').aperture.nontransparentPixels+'.';summary.append(p);
  const q=document.createElement('p');q.textContent='Ouverture centrale de la surface bréchée : '+(byId.get('breached-closed').centerOpening.transparentFraction*100).toFixed(1)+' % transparente.';summary.append(q);
  const note=document.createElement('p');note.textContent='Le ratio de socle est un indicateur : il dépend aussi de la silhouette et du dessin en perspective. Les cycles animés, la fidélité 1:1 au film et le gameplay ne sont pas validés par cette scène.';summary.append(note);
  const ok=checks.every(c=>c.pass);
  document.getElementById('status').textContent=checks.filter(c=>c.pass).length+'/'+checks.length+' contrôles de rendu réussis · '+warnings.length+' alerte d’échelle · '+fixtureData.supplementIds.length+' nouvelles variantes visibles';
  document.getElementById('status').className=ok?'ok':'warn';
  document.getElementById('provenance').textContent='Renderer '+fixtureData.provenance.modules['modules/aliens-1986/v116/raster-renderer-v116.mjs'].slice(0,16)+'… · Loader '+fixtureData.provenance.modules['modules/aliens-1986/v116/sprite-loader-v116.mjs'].slice(0,16)+'… · Manifeste V117 '+fixtureData.provenance.supplementManifestSha256.slice(0,16)+'… · Projection de fixture déclarée, PNG et modules inchangés.';
  window.__QA_RESULT__={ok,kind:'declared-renderer-fixtures-not-gameplay',checks,scaleComparisons,visualWarnings:warnings,fixtures:records,limits:[
    'The scene directly calls the real V116 renderer with declared synthetic states; it is not a campaign walkthrough.',
    'Fixture projection maps world x/z to a screen plane for comparable inspection; campaign camera depth and composition are not tested.',
    'Each fixture uses the immutable V116 renderer and real manifest PNGs, while its world/session wrapper is a minimal test double.',
    'The crate footprint ratio is a diagnostic for visible body shrink, not a physical scale certification.',
    'Human review of the screenshot is still required; no film 1:1 fidelity or complete animation-cycle claim is made.'
  ]};
  window.__QA_READY__=true;
} catch(error) {
  document.getElementById('status').textContent='Échec : '+error.message;
  window.__QA_ERROR__=String(error.stack||error);
}
'''


BASE_MANIFEST = "docs/development/aliens-1986-sprites-v116/manifest.json"
SUPPLEMENT_MANIFEST = "docs/development/aliens-1986-sprites-v117/manifest.json"
BASE_SHA = "b9213752445a01e293f44bccface374d3d3882e8ae071baefaa75bf04d589af6"
SUPPLEMENT_SHA = "09df948f5ee55c2b9b2494924475b7113468edddfa4d803caaf1323ee4804a62"
MODULES = {
    "modules/aliens-1986/v116/sprite-loader-v116.mjs": "8dd7974d0222294b0e013e06efdc74d76259927ae9890648b57b6fa4385cc7c5",
    "modules/aliens-1986/v116/raster-renderer-v116.mjs": "77d7315bbc4adb6ddb01c4493fc45daaed8beb73ba68efc3d1f88373a7d28170",
}
SUPPLEMENT_IDS = [
    "door-leaf-damaged", "door-leaf-reinforced", "door-leaf-breached",
    "meal-tray-food", "supply-case-medical-empty",
    "supply-case-ammo-closed", "supply-case-ammo-empty",
]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def preflight(root):
    base_bytes = (root / BASE_MANIFEST).read_bytes()
    supplement_bytes = (root / SUPPLEMENT_MANIFEST).read_bytes()
    assert sha(base_bytes) == BASE_SHA, "V116 manifest changed"
    assert sha(supplement_bytes) == SUPPLEMENT_SHA, "V117 manifest changed"
    base, supplement = json.loads(base_bytes), json.loads(supplement_bytes)
    assert supplement["schema"] == "aliens1986-raster-supplement-v117"
    assert supplement["version"] == 117 and supplement["presentationVersion"] == 116
    assert supplement["baseManifest"] == {"path": BASE_MANIFEST, "sha256": BASE_SHA, "assetCount": 123}
    assert supplement["counts"] == {"base": 123, "added": 7, "total": 130}
    assert sorted(a["id"] for a in supplement["assets"]) == sorted(SUPPLEMENT_IDS)
    assets = base["assets"] + supplement["assets"]
    assert len(assets) == len({a["id"] for a in assets}) == len({a["path"] for a in assets}) == 130
    assert all(a["path"].startswith("assets/dlc/aliens-1986/v117/") for a in supplement["assets"])
    modules = {}
    routes = {}
    for name, expected in MODULES.items():
        content = (root / name).read_bytes()
        modules[name] = sha(content)
        assert modules[name] == expected, f"Unreviewed renderer source: {name}"
        routes["/" + name] = (content, "text/javascript; charset=utf-8")
    selected_ids = set(SUPPLEMENT_IDS + ["supply-case", "door-leaf"])
    selected = [a for a in assets if a["id"] in selected_ids]
    assert {a["id"] for a in selected} == selected_ids
    measured = []
    for asset in selected:
        path = root / asset["path"]
        assert path.is_file() and not path.is_symlink()
        assert path.resolve() == path and path.is_relative_to(root / "assets")
        data = path.read_bytes()
        assert sha(data) == asset["sha256"], f"Changed PNG: {asset['id']}"
        assert len(data) == asset["bytes"], f"Changed PNG size: {asset['id']}"
        assert data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR"
        width, height = int.from_bytes(data[16:20]), int.from_bytes(data[20:24])
        assert (width, height) == (asset["width"], asset["height"]), f"Dimension mismatch: {asset['id']}"
        measured.append({"id": asset["id"], "path": asset["path"], "sha256": sha(data),
                         "bytes": len(data), "width": width, "height": height,
                         "pngColorType": data[25], "manifestBounds": asset["bbox"],
                         "manifestBoundsStatus": asset["bboxStatus"]})
        routes["/" + asset["path"]] = (data, "image/png")
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=root, text=True).strip()
    payload = {
        "assets": assets, "supplementIds": SUPPLEMENT_IDS,
        "provenance": {
            "gitHeadAtRun": head, "baseManifestPath": BASE_MANIFEST, "baseManifestSha256": sha(base_bytes),
            "supplementManifestPath": SUPPLEMENT_MANIFEST, "supplementManifestSha256": sha(supplement_bytes),
            "modules": modules,
            "fixtureSources": {
                "script": sha(Path(__file__).read_bytes()),
                "embeddedHtml": sha(FIXTURE_HTML.encode()),
                "embeddedJavaScript": sha(FIXTURE_JS.encode()),
            },
            "realPngsVerified": measured,
        },
    }
    return payload, routes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, default=Path.cwd())
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--executable", type=Path, help="An already installed Chromium executable")
    args = parser.parse_args()
    root, output = args.source_root.resolve(), args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    data, routes, server, page, browser, context = None, {}, None, None, None, None
    execution = {"preflight": "not-started", "browser": "not-started", "assertionsProduced": False}
    report = {"ok": False, "kind": "declared-renderer-fixtures-not-gameplay", "checks": [], "execution": execution}
    missing_requests, network_failures, browser_errors, bad_responses = [], [], [], []

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args):
            pass

        def do_GET(self):
            path = unquote(urlsplit(self.path).path)
            if path not in routes:
                missing_requests.append(path)
                self.send_error(404)
                return
            body, mime = routes[path]
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

    try:
        execution["preflight"] = "running"
        data, routes = preflight(root)
        execution["preflight"] = "passed"
        routes.update({
            "/": (FIXTURE_HTML.encode(), "text/html; charset=utf-8"),
            "/fixture/index.html": (FIXTURE_HTML.encode(), "text/html; charset=utf-8"),
            "/fixture/fixture.mjs": (FIXTURE_JS.encode(), "text/javascript; charset=utf-8"),
            "/fixture/manifest.json": (json.dumps(data, ensure_ascii=False).encode(), "application/json; charset=utf-8"),
        })
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        with sync_playwright() as p:
            try:
                execution["browser"] = "launching"
                browser = p.chromium.launch(headless=True, executable_path=str(args.executable) if args.executable else None)
                context = browser.new_context(viewport={"width": 1600, "height": 1100}, device_scale_factor=1)
                page = context.new_page()
                execution["browser"] = "running"
                page.on("pageerror", lambda error: browser_errors.append(str(error)))
                page.on("console", lambda message: browser_errors.append(message.text) if message.type == "error" else None)
                page.on("requestfailed", lambda request: network_failures.append({"path": urlsplit(request.url).path, "failure": request.failure}))
                page.on("response", lambda response: bad_responses.append({"path": urlsplit(response.url).path, "status": response.status}) if response.status >= 400 else None)
                page.goto(f"http://127.0.0.1:{server.server_port}/fixture/index.html", wait_until="networkidle")
                page.wait_for_function("window.__QA_READY__ || window.__QA_ERROR__", timeout=60000)
                error = page.evaluate("window.__QA_ERROR__ || null")
                if error:
                    raise RuntimeError(error)
                report.update(page.evaluate("window.__QA_RESULT__"))
                execution["assertionsProduced"] = True
                report["browser"] = {"engine": "Chromium", "version": browser.version, "headless": True,
                                     "viewport": {"width": 1600, "height": 1100}, "deviceScaleFactor": 1}
                page.screenshot(path=str(output / "props-v117.png"), full_page=True)
                report["artifacts"] = {"screenshot": "props-v117.png", "screenshotSha256": sha((output / "props-v117.png").read_bytes())}
                inline_preview = page.screenshot(type="jpeg", quality=55, full_page=True)
                print("ALIENS_VISUAL_JPEG:04-props-v117:" + base64.b64encode(inline_preview).decode("ascii"), flush=True)
                execution["browser"] = "completed"
            except Exception:
                # Capture while the Playwright connection is still live. A
                # capture error is secondary and must not replace the cause.
                if page is not None and not page.is_closed():
                    try:
                        capture = output / "props-v117-error.png"
                        page.screenshot(path=str(capture), full_page=True, timeout=10000)
                        report["failureScreenshot"] = {"path": capture.name, "sha256": sha(capture.read_bytes())}
                    except Exception as capture_error:
                        report["captureError"] = str(capture_error)
                raise
            finally:
                for resource in (context, browser):
                    if resource is not None:
                        try:
                            resource.close()
                        except Exception as cleanup_error:
                            report.setdefault("cleanupErrors", []).append(str(cleanup_error))
    except Exception as error:
        report["ok"] = False
        report["error"] = str(error)
        report["errorType"] = type(error).__name__
        if execution["preflight"] == "running":
            execution["preflight"] = "failed"
        if execution["browser"] == "launching":
            execution["browser"] = "failed-to-launch"
        elif execution["browser"] == "running":
            execution["browser"] = "failed"
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()
    if execution["assertionsProduced"]:
        report["checks"].append({"name": "No failed resource or browser error",
                                 "pass": not (missing_requests or network_failures or bad_responses or browser_errors)})
    report["ok"] = bool(report["ok"] and all(check["pass"] for check in report["checks"]) and not report.get("error") and not report.get("cleanupErrors"))
    report["timestampUtc"] = datetime.now(timezone.utc).isoformat()
    report["provenance"] = data["provenance"] if data else {"inputsVerified": False}
    report["resourceEvidence"] = {"server404s": missing_requests, "requestFailures": network_failures,
                                  "httpErrors": bad_responses, "browserErrors": browser_errors}
    report["visualReviewRequired"] = True
    (output / "props-v117-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"ok": report["ok"], "checks": len(report["checks"]),
                      "passed": sum(check["pass"] for check in report["checks"]),
                      "visualWarnings": report.get("visualWarnings", []),
                      "screenshot": report.get("artifacts", {}).get("screenshot"),
                      "report": "props-v117-report.json", "execution": execution,
                      "error": report.get("error")}, ensure_ascii=False))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
