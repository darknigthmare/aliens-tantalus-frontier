#!/usr/bin/env python3
"""V121 real-renderer browser fixtures; prepared rooms are not a campaign run.

Images are decoded from their pinned original bytes. No image is rewritten.
Table contact tests use reviewed source-pixel tabletop polygons, not just boxes.
"""
import argparse
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

HISTORICAL_MANIFESTS = {
    'docs/development/aliens-1986-sprites-v116/manifest.json': 'b9213752445a01e293f44bccface374d3d3882e8ae071baefaa75bf04d589af6',
    'docs/development/aliens-1986-sprites-v117/manifest.json': '09df948f5ee55c2b9b2494924475b7113468edddfa4d803caaf1323ee4804a62',
    'docs/development/aliens-1986-sprites-v118/manifest.json': 'ba671cbbd67b8d16fe7b1173fb0f61240e05d0379431589b35a7a81dec963d9e',
    'docs/development/aliens-1986-sprites-v119/manifest.json': 'ea0eac131e69262aafb1a08398013b941d0cb028c831892752dd6a9ca3c19fb0',
    'docs/development/aliens-1986-sprites-v120/manifest.json': 'a9e47d98744b2ffe18199ef0e00bc9879379d66b442736d46031c6761ae89437',
}
CURRENT_MANIFEST = 'docs/development/aliens-1986-sprites-v121/manifest.json'
HISTORICAL_MODULES = {
    'modules/aliens-1986/v116/sprite-loader-v116.mjs': '8dd7974d0222294b0e013e06efdc74d76259927ae9890648b57b6fa4385cc7c5',
    'modules/aliens-1986/v116/raster-renderer-v116.mjs': '77d7315bbc4adb6ddb01c4493fc45daaed8beb73ba68efc3d1f88373a7d28170',
    'modules/aliens-1986/v118/raster-props-v118.mjs': 'dd17932bedfe1f457440f11d9f4e1fd9b87da19660177c2c210d1d85b3c3b31c',
    'modules/aliens-1986/v119/raster-furniture-v119.mjs': 'c6adb36868509894beb75e1f350b884f573543e3c55e840db6015322d4c01176',
    'modules/aliens-1986/v120/raster-furniture-v120.mjs': 'c725d9f7e40ab4f1f86609d69ccacfd94a9b8e28d5e704db5f721668846aec4b',
}
CURRENT_MODULE = 'modules/aliens-1986/v121/raster-furniture-v121.mjs'
IDS = ['hadley-service-generator', 'service-pump-unit', 'conduit-heat-exchanger', 'conduit-valve-plinth']
# These polygons mark the interior of the visible top plane. The front apron,
# legs, alpha bounds and transparent gaps are deliberately excluded. They were
# manually reviewed on these exact full-size images; any byte change is rejected.
TABLE_SURFACES = {
    'conduit-valve-plinth': {
        'sha256': '93d2d6ec1c727b96784672bf88bf32591c5287c27e53505a044af991a6e189ae',
        'polygon': [[130, 95], [1140, 95], [1170, 520], [105, 520]],
        'frontApronBottomY': 611,
    },
}

HTML = r'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aliens — mobilier V121</title><link rel="icon" href="data:,"><style>
*{box-sizing:border-box}body{margin:0;background:#0e191e;color:#e2ece9;font:15px/1.45 system-ui,sans-serif}main{width:1344px;margin:auto;padding:24px 30px}h1{font-size:28px;margin:0 0 12px}h2{font-size:21px;margin:25px 0 7px}h3{font-size:16px;margin:0 0 6px}p{color:#b0c2c5;margin:5px 0}.eyebrow{font-size:12px;letter-spacing:.1em;color:#94cbb0;text-transform:uppercase}canvas{display:block;border:1px solid #3f555d;background:#1c2c34}article{margin:18px 0;border:1px solid #3c555e;padding:12px;background:#14232a}.room{padding:0;border:0}.room canvas{width:1280px;height:720px}.room header{padding:12px 0}.details{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.details article{margin:0}.details canvas{width:560px;height:440px;max-width:100%}.small{font:11px/1.45 ui-monospace,monospace;color:#9fb5bb;overflow-wrap:anywhere}#status{padding:14px;border:1px solid #466b61;margin:18px 0}.ok{color:#a2dbbb}.warn{color:#f4c48a}.hidden{display:none}footer{font-size:11px;color:#98acb0;margin-top:25px}</style></head><body><main>
<div class="eyebrow">Aliens (1986) · fixtures de présentation V121</div><h1>Mobilier, supports et rendu de salle natif</h1>
<p>Trois salles préparées avec leurs véritables définitions et leur renderer complet. Les captures de salle sont à l’échelle native 1:1 pixel ; les détails ×2 viennent de ces mêmes rendus.</p>
<p>Aucun collider n’est modifié. Un quatrième état place explicitement Ripley derrière le socle de vanne du conduit pour contrôler l’atténuation. Ces fixtures ne constituent pas une campagne jouée ni une fidélité filmique certifiée.</p>
<div id="status">Décodage des PNG originaux…</div><section id="rooms"></section><h2>Cinq placements · détails du rendu complet ×2</h2><section id="details" class="details"></section>
<h2>Appuis du panneau de vanne sur les pixels du socle</h2><div id="contacts"></div><footer id="provenance"></footer>
</main><script type="module" src="/fixture/furniture.mjs"></script></body></html>'''

JS = r'''import {Renderer} from '/modules/aliens-1986/v114/preview/renderer.mjs';
import {createSession,currentWorld} from '/modules/aliens-1986/v114/src/operation-v114.mjs';
import {installRasterRendererV116} from '/modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {installRasterPropsV118} from '/modules/aliens-1986/v118/raster-props-v118.mjs';
import {installRasterFurnitureV119} from '/modules/aliens-1986/v119/raster-furniture-v119.mjs';
import {installRasterFurnitureV120} from '/modules/aliens-1986/v120/raster-furniture-v120.mjs';
import {installRasterFurnitureV121} from '/modules/aliens-1986/v121/raster-furniture-v121.mjs';

const payload=await(await fetch('/fixture/data.json')).json(),entries=payload.assets;
const assets=new Map(entries.map(a=>[a.id,a])),byPath=new Map(entries.map(a=>[a.path,a]));
const furnitureIds=payload.ids,calls=new Map(),originalDraw=CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage=function(...args){
  const fixture=this.canvas.dataset?.fixture;
  if(fixture&&calls.has(fixture)){
    const image=args[0],sourceUrl=image.currentSrc||image.src;
    // Hadley composites its native light mask from another canvas. It is a
    // rendering operation, not a PNG request or an unknown catalog image.
    if(!sourceUrl){
      calls.get(fixture).push({kind:'native-canvas',width:image.width,height:image.height,alpha:this.globalAlpha});
      return originalDraw.apply(this,args);
    }
    const path=new URL(sourceUrl,document.baseURI).pathname.slice(1),asset=byPath.get(path);
    const matrix=this.getTransform(),source=args.slice(1,5),destination=args.slice(5,9);
    const [x,y,w,h]=destination,corners=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([px,py])=>({x:matrix.a*px+matrix.c*py+matrix.e,y:matrix.b*px+matrix.d*py+matrix.f}));
    const bounds={left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))};
    calls.get(fixture).push({kind:'image',id:asset?.id||null,path,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,source,destination,transform:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],bounds,alpha:this.globalAlpha});
  }
  return originalDraw.apply(this,args);
};
function rendererClass(selected,extension){
  class FixtureRenderer extends Renderer{
    box(body,palette){const key=this.canvas.dataset.fixture;if(calls.has(key))calls.get(key).push({kind:'native-box',id:body.id,alpha:this.c.globalAlpha});return super.box(body,palette);}
  }
  installRasterRendererV116(FixtureRenderer,selected);installRasterPropsV118(FixtureRenderer,selected);
  installRasterFurnitureV119(FixtureRenderer,selected);installRasterFurnitureV120(FixtureRenderer,selected);
  if(extension)installRasterFurnitureV121(FixtureRenderer,selected);
  return FixtureRenderer;
}
const Candidate=rendererClass(entries,true),Baseline=rendererClass(entries,false),Unavailable=rendererClass(entries.filter(a=>!furnitureIds.includes(a.id)),true);
const placements=[
  {room:'v106-hadley',body:'generator',asset:'hadley-service-generator',label:'Hadley · générateur de service'},
  {room:'v107-service',body:'pump-foundation',asset:'service-pump-unit',label:'Maintenance · unité de pompage'},
  {room:'v112-conduit',body:'exchanger-west',asset:'conduit-heat-exchanger',label:'Conduit · échangeur ouest'},
  {room:'v112-conduit',body:'exchanger-east',asset:'conduit-heat-exchanger',label:'Conduit · échangeur est'},
  {room:'v112-conduit',body:'valve-plinth',asset:'conduit-valve-plinth',label:'Conduit · socle de vanne'},
];
const specs=[...new Set(placements.map(p=>p.room))].map(room=>({id:room,room,visible:true}));
specs.push({id:'conduit-occlusion',room:'v112-conduit',visible:true,occlusion:true},
  {id:'conduit-baseline',room:'v112-conduit',baseline:true},
  {id:'hadley-baseline',room:'v106-hadley',baseline:true},
  {id:'hadley-unavailable',room:'v106-hadley',unavailable:true});
function deepFreeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;}
const fixtures=specs.map(spec=>{
  const session=createSession({mode:'inspection',roomId:spec.room});
  if(spec.occlusion){session.team[0].x=430.5;session.team[0].z=256;}
  const world=currentWorld(session),canvas=document.createElement('canvas');canvas.dataset.fixture=spec.id;
  if(spec.visible){const node=document.createElement('article');node.className='room';node.id='room-'+spec.id;const header=document.createElement('header');const h=document.createElement('h2');h.textContent=world.scene.title+(spec.occlusion?' · acteur derrière le meuble':'');header.append(h);const p=document.createElement('p');p.className='small';p.textContent=spec.id+' · 1280 × 720 pixels natifs'+(spec.occlusion?' · fixture Ripley x430.5 / z256':' · session inspection native');header.append(p);node.append(header,canvas);document.querySelector('#rooms').append(node);}
  const Cls=spec.baseline?Baseline:spec.unavailable?Unavailable:Candidate,renderer=new Cls(canvas);renderer.reducedMotion=true;
  return {spec,world,session:deepFreeze(session),canvas,renderer};
});
function render(f){calls.set(f.spec.id,[]);const before=JSON.stringify(f.session);f.renderer.render(f.world,{session:f.session});f.unchanged=JSON.stringify(f.session)===before;}
function fixtureFor(id){return fixtures.find(f=>f.spec.id===id);}
function imageCalls(f){return calls.get(f.spec.id).filter(c=>c.kind==='image');}
function exactFurnitureDraw(f,placement){const b=f.world.scene.solids.find(b=>b.id===placement.body),x=b.x+b.w/2-f.renderer.camera;return imageCalls(f).find(c=>c.id===placement.asset&&Math.abs(c.transform[4]-x)<.001);}
function inside(point,polygon){let result=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [xi,yi]=polygon[i],[xj,yj]=polygon[j];if((yi>point[1])!==(yj>point[1])&&point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi)result=!result;}return result;}
function sourceToScreen(draw,[x,y]){const [sx,sy,sw,sh]=draw.source,[dx,dy,dw,dh]=draw.destination,[a,b,c,d,e,f]=draw.transform,px=dx+(x-sx)*dw/sw,py=dy+(y-sy)*dh/sh;return [a*px+c*py+e,b*px+d*py+f];}
function screenToSource(draw,[x,y]){const [a,b,c,d,e,f]=draw.transform,det=a*d-b*c,px=((x-e)*d-(y-f)*c)/det,py=((y-f)*a-(x-e)*b)/det;const [sx,sy,sw,sh]=draw.source,[dx,dy,dw,dh]=draw.destination;return [sx+(px-dx)*sw/dw,sy+(py-dy)*sh/dh];}
const sourcePixels=new Map();
function pixels(f,id){if(sourcePixels.has(id))return sourcePixels.get(id);const record=f.renderer.rasterSpritesV116.get(id),canvas=document.createElement('canvas');canvas.width=record.image.naturalWidth;canvas.height=record.image.naturalHeight;const c=canvas.getContext('2d',{willReadFrequently:true});originalDraw.call(c,record.image,0,0);const value={width:canvas.width,height:canvas.height,data:c.getImageData(0,0,canvas.width,canvas.height).data};sourcePixels.set(id,value);return value;}
function pixelAlpha(source,point){const x=Math.round(point[0]),y=Math.round(point[1]);return x>=0&&y>=0&&x<source.width&&y<source.height?source.data[(y*source.width+x)*4+3]:0;}
function supportContact(f,propId,tableAsset){
  const prop=f.world.scene.props.find(p=>p.id===propId),body=f.world.scene.solids.find(b=>b.id===prop.supportId);
  const propAsset='valve-indicator-panel';
  const all=calls.get(f.spec.id),draw=all.find(c=>c.kind==='image'&&c.id===propAsset),table=all.find(c=>c.kind==='image'&&c.id===tableAsset);
  const image=pixels(f,propAsset),asset=assets.get(propAsset),[left,top,right,bottom]=asset.bbox;
  // Sample the lower occupied contour across the terminal. A single lowest
  // row could contain only one small foot and miss its other contact points.
  const contour=[],bandTop=Math.max(top,bottom-Math.max(12,Math.ceil((bottom-top)*.03)));
  for(let x=left;x<right;x++)for(let y=bottom-1;y>=bandTop;y--){
    if(image.data[(y*image.width+x)*4+3]>=128){contour.push([x,y]);break;}
  }
  if(!contour.length)throw new Error('No actual contact alpha for '+propAsset);
  const points=[contour[0],contour[Math.floor(contour.length/2)],contour.at(-1)];
  const surface=payload.tableSurfaces[tableAsset],tablePixels=pixels(f,tableAsset);
  const contacts=points.map(point=>{const screen=sourceToScreen(draw,point),source=screenToSource(table,screen);return {propSource:point,screen,tableSource:source,insideTopPlane:inside(source,surface.polygon),tableAlpha:pixelAlpha(tablePixels,source)};});
  const nativeFoot=f.renderer.project(prop);nativeFoot.y-=prop.elevation;
  const apron=sourceToScreen(table,[(assets.get(tableAsset).bbox[0]+assets.get(tableAsset).bbox[2])/2,surface.frontApronBottomY]);
  const ground=f.renderer.project({x:body.x+body.w/2,z:body.z+body.d});
  return {roomId:f.world.scene.id,propId,propAsset,bodyId:body.id,tableAsset,propCoordinates:{x:prop.x,z:prop.z,elevation:prop.elevation},nativeFoot,contacts,
    order:{furnitureIndex:all.indexOf(table),propIndex:all.indexOf(draw),propCount:all.filter(c=>c.kind==='image'&&c.id===propAsset).length},
    sourceTopPlane:surface,frontApron:{screen:apron,heightAboveGround:ground.y-apron[1],nativeBodyHeight:body.h,difference:ground.y-apron[1]-body.h},
    method:'Left, median and right actual alpha>=128 pixels on the lower contour within the bottom 3% (at least 12 rows), mapped through real draw transforms into a reviewed tabletop polygon; tabletop pixels must also have alpha>=128. The front apron height is a separate diagnostic, not a support plane test.'};
}

try{
  for(const f of fixtures)render(f);
  const deadline=performance.now()+45000;
  while(true){
    for(const f of fixtures)render(f);
    const ready=fixtures.every(f=>{const s=f.renderer.rasterStatusV116();if(s.failed)throw new Error('Image decode error in '+f.spec.id+': '+JSON.stringify(s.errors));return s.requested>0&&s.loaded===s.requested;});
    if(ready)break;if(performance.now()>deadline)throw new Error('Timed out loading real image resources');await new Promise(r=>setTimeout(r,50));
  }
  // Observe one settled frame after every layer has had a chance to request its fallback.
  for(const f of fixtures)render(f);
  const records=placements.map(p=>{
    const f=fixtureFor(p.room),body=f.world.scene.solids.find(b=>b.id===p.body),draw=exactFurnitureDraw(f,p);
    if(!draw)throw new Error('Missing raster furniture '+p.room+'/'+p.body);
    const ground=f.renderer.project({x:body.x+body.w/2,z:body.z+body.d}),rear=f.renderer.project({x:body.x,z:body.z}),height=body.h+ground.y-rear.y;
    const node=document.createElement('article'),title=document.createElement('h3');title.textContent=p.label;node.append(title);
    const canvas=document.createElement('canvas');canvas.width=560;canvas.height=440;const c=canvas.getContext('2d');
    const crop={x:ground.x-140,y:ground.y-205,w:280,h:220};originalDraw.call(c,f.canvas,crop.x,crop.y,crop.w,crop.h,0,0,560,440);
    node.append(canvas);const note=document.createElement('p');note.className='small';note.textContent=p.body+' · image '+(draw.bounds.right-draw.bounds.left).toFixed(2)+' × '+(draw.bounds.bottom-draw.bounds.top).toFixed(2)+' / enveloppe '+body.w+' × '+height.toFixed(2)+' · pieds y='+ground.y.toFixed(2);node.append(note);document.querySelector('#details').append(node);
    return {...p,body:structuredClone(body),draw,expectedGround:ground,nativeEnvelope:{width:body.w,height},imageFootprint:{width:draw.bounds.right-draw.bounds.left,height:draw.bounds.bottom-draw.bounds.top},detailCrop:crop};
  });
  const contacts=[supportContact(fixtureFor('v112-conduit'),'valve-indicator','conduit-valve-plinth')];
  for(const contact of contacts){const p=document.createElement('p');p.className='small';p.textContent=contact.propId+' · appuis sur le plateau : '+contact.contacts.map(c=>c.insideTopPlane&&c.tableAlpha>=128?'valide':'HORS SURFACE').join(' / ')+' · bord inférieur tablier : '+contact.frontApron.heightAboveGround.toFixed(2)+' unités / corps '+contact.frontApron.nativeBodyHeight+' · écart '+contact.frontApron.difference.toFixed(2);document.querySelector('#contacts').append(p);}
  const baseline=fixtureFor('hadley-baseline').canvas.getContext('2d').getImageData(0,0,1280,720).data,unavailable=fixtureFor('hadley-unavailable').canvas.getContext('2d').getImageData(0,0,1280,720).data;
  let pixelDifferences=0;for(let i=0;i<baseline.length;i++)if(baseline[i]!==unavailable[i])pixelDifferences++;
  const occlusion=fixtureFor('conduit-occlusion'),occludedDraws=imageCalls(occlusion);
  const alphaContext=occlusion.canvas.getContext('2d');
  alphaContext.save();alphaContext.globalAlpha=.23;
  const expectedOcclusionAlpha=alphaContext.globalAlpha;
  alphaContext.restore();
  const checks=[
    {name:'Five exact industrial bodies use four images, including one shared exchanger',pass:records.length===5&&new Set(records.map(r=>r.asset)).size===4},
    {name:'Real decoded dimensions match source manifests',pass:fixtures.every(f=>imageCalls(f).every(c=>{const a=assets.get(c.id);return a&&c.naturalWidth===a.width&&c.naturalHeight===a.height;}))},
    {name:'Furniture uses one uniform scale within each native envelope',pass:records.every(r=>Math.abs(r.draw.destination[2]/r.draw.source[2]-r.draw.destination[3]/r.draw.source[3])<1e-9&&r.imageFootprint.width<=r.nativeEnvelope.width+.01&&r.imageFootprint.height<=r.nativeEnvelope.height+.01)},
    {name:'Furniture keeps the native center/front-ground anchors',pass:records.every(r=>Math.abs(r.draw.transform[4]-r.expectedGround.x)<.001&&Math.abs(r.draw.bounds.bottom-r.expectedGround.y)<.001)},
    {name:'No furniture PNG is clipped by a native room canvas',pass:records.every(r=>r.draw.bounds.left>=0&&r.draw.bounds.top>=0&&r.draw.bounds.right<=1280&&r.draw.bounds.bottom<=720)},
    {name:'The valve panel follows its own plinth exactly once',pass:contacts.every(c=>c.order.propCount===1&&c.order.furnitureIndex<c.order.propIndex)},
    {name:'Every measured prop contact lies inside the actual source tabletop polygon',pass:contacts.every(c=>c.contacts.every(p=>p.insideTopPlane))},
    {name:'Every contact rests on opaque pixels of the original tabletop',pass:contacts.every(c=>c.contacts.every(p=>p.tableAlpha>=128))},
    {name:'Supported prop pivots preserve physical x/z/elevation',pass:contacts.every(c=>{const f=fixtureFor(c.roomId),d=imageCalls(f).find(d=>d.id===c.propAsset);return c.propCoordinates.elevation===f.world.scene.solids.find(b=>b.id===c.bodyId).h&&Math.abs(d.transform[4]-c.nativeFoot.x)<.001&&Math.abs(d.transform[5]-c.nativeFoot.y)<.001;})},
    {name:'Native occlusion alpha applies to plinth and attached valve panel',pass:['conduit-valve-plinth','valve-indicator-panel'].every(id=>Math.abs(occludedDraws.find(d=>d.id===id)?.alpha-expectedOcclusionAlpha)<.001)},
    {name:'No scene, collider, support, actor or save state changed during rendering',pass:fixtures.every(f=>f.unchanged)},
    {name:'Unavailable V121 furniture gives an exact baseline pixel fallback',pass:pixelDifferences===0},
    {name:'Five admitted bodies no longer draw their native box surface',pass:records.every(r=>!calls.get(r.room).some(c=>c.kind==='native-box'&&c.id===r.body.id))},
    {name:'Unrelated structural boxes remain on the native renderer',pass:fixtures.filter(f=>f.spec.visible).every(f=>calls.get(f.spec.id).some(c=>c.kind==='native-box'))},
    {name:'All requested images finish decoding without errors',pass:fixtures.every(f=>{const s=f.renderer.rasterStatusV116();return s.failed===0&&s.loaded===s.requested;})},
    {name:'Actual V120 plinth-panel ordering defect is reproduced in the baseline',pass:contacts.every(c=>{const f=fixtureFor('conduit-baseline'),events=calls.get(f.spec.id),propIndex=events.findIndex(e=>e.kind==='image'&&e.id===c.propAsset),bodyIndex=events.findIndex(e=>e.kind==='native-box'&&e.id===c.bodyId);return propIndex>=0&&bodyIndex>propIndex;})},
  ];
  const warnings=records.filter(r=>r.imageFootprint.width/r.nativeEnvelope.width<.9||r.imageFootprint.height/r.nativeEnvelope.height<.9).map(r=>r.label+': silhouette '+r.imageFootprint.width.toFixed(2)+' × '+r.imageFootprint.height.toFixed(2)+' dans '+r.nativeEnvelope.width+' × '+r.nativeEnvelope.height.toFixed(2)+'. Le volume physique reste inchangé.');
  for(const c of contacts)if(Math.abs(c.frontApron.difference)>5&&!warnings.some(w=>w.startsWith(c.tableAsset+':')))warnings.push(c.tableAsset+': bord inférieur du tablier décalé de '+c.frontApron.difference.toFixed(2)+' unités par rapport à la hauteur du corps ; les appuis sont validés séparément sur le plateau réel.');
  const ok=checks.every(c=>c.pass);document.querySelector('#status').textContent=checks.filter(c=>c.pass).length+'/'+checks.length+' contrôles · '+records.length+' placements · '+contacts.length+' appuis · '+warnings.length+' observations de proportions';document.querySelector('#status').className=ok?'ok':'warn';
  document.querySelector('#provenance').textContent='Manifeste V121 : '+payload.provenance.manifestHashes[payload.currentManifest]+' · source renderer V121 : '+payload.provenance.modules[payload.currentModule];
  window.__QA_RESULT__={ok,kind:'declared-real-renderer-fixtures-not-gameplay',checks,placements:records,contacts,visualWarnings:warnings,fallbackComparison:{channelsCompared:baseline.length,differingChannels:pixelDifferences},fixtures:fixtures.map(f=>({id:f.spec.id,roomId:f.world.scene.id,preparedOcclusion:!!f.spec.occlusion,baseline:!!f.spec.baseline,unavailable:!!f.spec.unavailable,stateUnchanged:f.unchanged,resourceStatus:f.renderer.rasterStatusV116(),drawCalls:calls.get(f.spec.id)})),limits:['Prepared inspection rooms and one explicit occlusion pose are used; this is not a campaign journey.','The screenshots show the real full renderer at 1280x720; enlarged details copy those exact canvas pixels.','Tabletop polygons are manually reviewed against the exact pinned PNGs and describe their visible pixels, not film measurements.','Uniform fitting preserves source aspect ratios and leaves some native collision envelopes larger than the rendered silhouette.','The original semi-opaque generated alpha is preserved; this does not certify a perfect cutout.','No exact film fidelity or completed furniture interaction system is claimed.']};window.__QA_READY__=true;
}catch(error){document.querySelector('#status').textContent='Échec : '+error.message;window.__QA_ERROR__=String(error.stack||error);}
'''


def sha(blob):
    return hashlib.sha256(blob).hexdigest()


def preflight(root):
    manifest_hashes, manifests = {}, []
    for name in [*HISTORICAL_MANIFESTS, CURRENT_MANIFEST]:
        blob = (root / name).read_bytes()
        digest = sha(blob)
        if name in HISTORICAL_MANIFESTS:
            assert digest == HISTORICAL_MANIFESTS[name], f'Historical manifest changed: {name}'
        manifest_hashes[name] = digest
        manifests.append(json.loads(blob))
    current = manifests[-1]
    assert current['version'] == current['presentationVersion'] == 121
    assert current['counts'] == {'base': 151, 'added': 4, 'total': 155}
    assert sorted(a['id'] for a in current['assets']) == sorted(IDS)
    assets = [a for manifest in manifests for a in manifest['assets']]
    assert len(assets) == len({a['id'] for a in assets}) == len({a['path'] for a in assets}) == 155
    for asset in current['assets']:
        if asset['id'] in TABLE_SURFACES:
            assert asset['sha256'] == TABLE_SURFACES[asset['id']]['sha256'], 'Unreviewed tabletop pixels'
    recovery_blob = (root / 'modules/aliens-1986/RECOVERY_MANIFEST.json').read_bytes()
    assert sha(recovery_blob) == '5bfb37cc785657a11e62fe1ca0b92093e2b8b5bd0935fb0bf2cedd0f87da0acd'
    recovery = {f['path']: f['sha256'] for f in json.loads(recovery_blob)['files']}
    routes, modules = {}, {}
    pending = [root / name for name in [*HISTORICAL_MODULES, CURRENT_MODULE,
               'modules/aliens-1986/v114/preview/renderer.mjs', 'modules/aliens-1986/v114/src/operation-v114.mjs']]
    while pending:
        path = pending.pop().resolve()
        name = path.relative_to(root).as_posix()
        if name in modules:
            continue
        assert path.is_file() and not path.is_symlink() and path.suffix == '.mjs'
        blob = path.read_bytes()
        digest = sha(blob)
        if name.startswith('modules/aliens-1986/v114/'):
            assert digest == recovery[name.removeprefix('modules/aliens-1986/v114/')], f'Historical source changed: {name}'
        elif name in HISTORICAL_MODULES:
            assert digest == HISTORICAL_MODULES[name], f'Historical module changed: {name}'
        else:
            assert name == CURRENT_MODULE, f'Unexpected dependency: {name}'
        modules[name] = digest
        routes['/' + name] = (blob, 'text/javascript; charset=utf-8')
        for relative in re.findall(r'''(?:from\s*|import\s*)['"](\.[^'"]+)['"]''', blob.decode()):
            pending.append(path.parent / relative)
    verified = []
    for asset in assets:
        path = root / asset['path']
        assert path.is_file() and not path.is_symlink() and path.resolve() == path and path.is_relative_to(root / 'assets')
        blob = path.read_bytes()
        assert len(blob) == asset['bytes'] and sha(blob) == asset['sha256'], f'Changed PNG: {asset["id"]}'
        assert blob[:8] == b'\x89PNG\r\n\x1a\n' and blob[12:16] == b'IHDR'
        assert (int.from_bytes(blob[16:20]), int.from_bytes(blob[20:24])) == (asset['width'], asset['height'])
        routes['/' + asset['path']] = (path, 'image/png')  # Serve lazily; do not retain all decoded/source bytes in Python.
        verified.append({'id': asset['id'], 'path': asset['path'], 'sha256': asset['sha256'], 'bytes': len(blob)})
    provenance = {'gitHeadAtRun': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
                  'manifestHashes': manifest_hashes, 'modules': modules, 'pngsVerified': verified,
                  'fixtureSources': {'script': sha(Path(__file__).read_bytes()), 'html': sha(HTML.encode()), 'javascript': sha(JS.encode())}}
    return {'assets': assets, 'ids': IDS, 'currentManifest': CURRENT_MANIFEST, 'currentModule': CURRENT_MODULE,
            'tableSurfaces': TABLE_SURFACES, 'provenance': provenance}, routes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-root', type=Path, default=Path.cwd())
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--executable', type=Path)
    parser.add_argument('--preflight-only', action='store_true')
    args = parser.parse_args()
    root, output = args.source_root.resolve(), args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    execution = {'preflight': 'not-started', 'browser': 'not-started', 'assertionsProduced': False}
    report = {'ok': False, 'checks': [], 'execution': execution, 'kind': 'declared-real-renderer-fixtures-not-gameplay'}
    payload, routes, server, browser, context, page = None, {}, None, None, None, None
    missing, requests, errors, http_errors = [], [], [], []

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
            if isinstance(body, Path):
                body = body.read_bytes()
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
            routes.update({'/fixture/index.html': (HTML.encode(), 'text/html; charset=utf-8'),
                           '/fixture/furniture.mjs': (JS.encode(), 'text/javascript; charset=utf-8'),
                           '/fixture/data.json': (json.dumps(payload).encode(), 'application/json; charset=utf-8')})
            server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
            threading.Thread(target=server.serve_forever, daemon=True).start()
            with sync_playwright() as p:
                try:
                    execution['browser'] = 'launching'
                    browser = p.chromium.launch(headless=True, executable_path=str(args.executable) if args.executable else None)
                    context = browser.new_context(viewport={'width': 1420, 'height': 1000}, device_scale_factor=1)
                    page = context.new_page()
                    execution['browser'] = 'running'
                    page.on('pageerror', lambda error: errors.append(str(error)))
                    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
                    page.on('requestfailed', lambda request: requests.append({'path': urlsplit(request.url).path, 'error': request.failure}))
                    page.on('response', lambda response: http_errors.append({'path': urlsplit(response.url).path, 'status': response.status}) if response.status >= 400 else None)
                    page.goto(f'http://127.0.0.1:{server.server_port}/fixture/index.html', wait_until='networkidle')
                    page.wait_for_function('window.__QA_READY__ || window.__QA_ERROR__', timeout=60000)
                    error = page.evaluate('window.__QA_ERROR__ || null')
                    if error:
                        raise RuntimeError(error)
                    report.update(page.evaluate('window.__QA_RESULT__'))
                    execution['assertionsProduced'] = True
                    report['browser'] = {'engine': 'Chromium', 'version': browser.version, 'headless': True}
                    artifacts = []
                    for selector, name in [('#rooms', 'furniture-v121-native-rooms.png'), ('#details', 'furniture-v121-details.png')]:
                        path = output / name
                        page.locator(selector).screenshot(path=str(path))
                        artifacts.append({'path': name, 'sha256': sha(path.read_bytes())})
                    report['artifacts'] = artifacts
                    execution['browser'] = 'completed'
                except Exception:
                    if page is not None and not page.is_closed():
                        try:
                            capture = output / 'furniture-v121-error.png'
                            page.screenshot(path=str(capture), full_page=True, timeout=10000)
                            report['failureScreenshot'] = {'path': capture.name, 'sha256': sha(capture.read_bytes())}
                        except Exception as error:
                            report['captureError'] = str(error)
                    raise
                finally:
                    for resource in (context, browser):
                        if resource is not None:
                            resource.close()
    except Exception as error:
        report.update({'ok': False, 'error': str(error), 'errorType': type(error).__name__})
        if execution['preflight'] == 'running':
            execution['preflight'] = 'failed'
        if execution['browser'] in ('running', 'launching'):
            execution['browser'] = 'failed'
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()
    if execution['assertionsProduced']:
        report['checks'].append({'name': 'No failed resource or browser error', 'pass': not (missing or requests or errors or http_errors)})
        expected = {**payload['provenance']['manifestHashes'], **payload['provenance']['modules'],
                    **{item['path']: item['sha256'] for item in payload['provenance']['pngsVerified']}}
        changed = [name for name, digest in expected.items() if sha((root / name).read_bytes()) != digest]
        report['checks'].append({'name': 'All verified source bytes stayed unchanged throughout the run', 'pass': not changed})
        report['sourcesChangedDuringRun'] = changed
    report['ok'] = bool(report['ok'] and execution['assertionsProduced'] and all(c['pass'] for c in report['checks']) and not report.get('error'))
    report['timestampUtc'] = datetime.now(timezone.utc).isoformat()
    report['provenance'] = payload['provenance'] if payload else {'inputsVerified': False}
    report['resourceEvidence'] = {'server404s': missing, 'requestFailures': requests, 'browserErrors': errors, 'httpErrors': http_errors}
    report['visualReviewRequired'] = True
    name = 'furniture-v121-preflight.json' if args.preflight_only else 'furniture-v121-report.json'
    (output / name).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'ok': report['ok'], 'passed': sum(c['pass'] for c in report['checks']), 'checks': len(report['checks']),
                      'execution': execution, 'report': str(output / name), 'error': report.get('error'), 'warnings': report.get('visualWarnings', [])}, ensure_ascii=False))
    if args.preflight_only:
        return 0 if execution['preflight'] == 'passed' and not report.get('error') else 1
    return 0 if report['ok'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
