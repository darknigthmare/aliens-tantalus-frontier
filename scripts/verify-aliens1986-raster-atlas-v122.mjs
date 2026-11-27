#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Renderer} from '../modules/aliens-1986/v114/preview/renderer.mjs';
import {createSession,currentWorld} from '../modules/aliens-1986/v114/src/operation-v114.mjs';
import {ROOMS} from '../modules/aliens-1986/v114/src/operation-scenes-v114.mjs';
import {LOCATIONS} from '../modules/aliens-1986/v114/src/fidelity-v114.mjs';
import {createSpriteStoreV116} from '../modules/aliens-1986/v116/sprite-loader-v116.mjs';
import {ATLAS_ASSETS_V122,atlasIllustrationsV122,atlasImageRectV122,installRasterAtlasV122} from '../modules/aliens-1986/v122/raster-atlas-v122.mjs';

// Independent integration contract. The fixtures use real cache/session code;
// DOM, image completion and Canvas calls are doubled, not claimed as pixels.
const CONTRACT=[
  ['sulaco-hangar','uss-sulaco','exteriors'],['sulaco-hangar','sulaco-deck-tile','environments'],
  ['jorden','jorden-survey-tractor','exteriors'],['processor-entry','atmosphere-processor-facade','environments'],
  ['hadley-main','hadley-colony-building','environments'],['hadley-main','hadley-colony-wall-panel','environments'],
  ['colony-exterior','hadley-colony-building','environments'],['colony-exterior','hadley-uplink-tower','environments'],
  ['gateway-medical','gateway-orbital-backdrop','environments'],['gateway-inquiry','gateway-orbital-backdrop','environments'],
  ['narcissus','narcissus-shuttle','exteriors'],
];
const IDS=[...new Set(CONTRACT.map(x=>x[1]))],LOCATION_IDS=[...new Set(CONTRACT.map(x=>x[0]))];
const fixtureEntry=(id,index)=>({id,path:`assets/dlc/aliens-1986/v122/${CONTRACT.find(x=>x[1]===id)[2]}/${id}.png`,
  width:index===1?1000:2000,height:index===1?2000:1000,bbox:index===1?[200,100,800,1900]:[100,100,1900,900],
  pivot:[0,0],runtimeEligible:true,category:'atlas',bboxStatus:'alpha128-measured'});
function recordingContext(){
  const calls=[],stack=[];let translation=[0,0];
  return {calls,globalAlpha:1,
    save(){stack.push({translation:[...translation],alpha:this.globalAlpha});},
    restore(){const prior=stack.pop();assert.ok(prior,'Unbalanced atlas Canvas restore');translation=prior.translation;this.globalAlpha=prior.alpha;},
    translate(x,y){translation[0]+=x;translation[1]+=y;},
    clearRect(...args){calls.push({kind:'clear',args});},
    drawImage(image,...args){calls.push({kind:'image',id:image.src.split('/').at(-1).replace(/\.png$/,''),args,translation:[...translation],alpha:this.globalAlpha});},
    depth(){return stack.length;},
  };
}
class Element {
  constructor(tag,document){this.tagName=tag.toUpperCase();this.ownerDocument=document;this.children=[];this.parentNode=null;this.dataset={};this.style={};this.attributes={};this.hidden=false;this.textContent='';this.className='';if(tag==='canvas')this.context=recordingContext();}
  get isConnected(){return this.tagName==='BODY'||Boolean(this.parentNode?.isConnected);}
  append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
  insertBefore(node,before){if(!before){this.append(node);return;}node.remove();const index=this.children.indexOf(before);assert.notEqual(index,-1);node.parentNode=this;this.children.splice(index,0,node);}
  remove(){if(this.parentNode){const list=this.parentNode.children;list.splice(list.indexOf(this),1);this.parentNode=null;}}
  replaceChildren(...nodes){for(const node of [...this.children])node.remove();this.append(...nodes);}
  contains(node){return this===node||this.children.some(child=>child.contains(node));}
  closest(selector){if(selector==='[hidden]')return this.hidden?this:this.parentNode?.closest(selector)||null;throw new Error('Unexpected test selector: '+selector);}
  setAttribute(name,value){this.attributes[name]=String(value);}
  getContext(){return this.context;}
  querySelectorAll(selector){
    const matches=node=>selector==='.atlas-card[data-atlas-location]'?node.className.split(' ').includes('atlas-card')&&Object.hasOwn(node.dataset,'atlasLocation'):
      selector.startsWith('[data-')?Object.hasOwn(node.dataset,selector.slice(6,-1).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())):node.tagName===selector.toUpperCase();
    const result=[];function walk(node){for(const child of node.children){if(matches(child))result.push(child);walk(child);}}walk(this);return result;
  }
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function makeDOM(ids){
  const document={createElement(tag){return new Element(tag,this);}},body=document.createElement('body'),panel=document.createElement('section'),root=document.createElement('article');
  body.append(panel);panel.append(root);
  function card(id){const node=document.createElement('section'),heading=document.createElement('h3'),paragraph=document.createElement('p'),button=document.createElement('button');
    node.className='atlas-card';node.dataset.atlasLocation=id;heading.textContent='Existing heading '+id;paragraph.textContent='Existing status and reference '+id;button.dataset.visit='unchanged-room';button.onclick=()=>id;node.append(heading,paragraph,button);return node;}
  root.append(...ids.map(card));return {document,body,panel,root,card};
}
function scheduler(){
  let time=0,nextId=0;const pending=new Map(),all=[];
  return {pending,all,now:()=>time,requestFrame(fn){const id=++nextId;pending.set(id,fn);all.push(fn);return id;},cancelFrame(id){pending.delete(id);},
    step(ms=16){time+=ms;const callbacks=[...pending.values()];pending.clear();for(const fn of callbacks)fn(time);}};
}
function fixture(entries,ids=LOCATION_IDS,{pending=false,existing=false,maximumWaitMs=15000}={}) {
  const dom=makeDOM(ids),schedule=scheduler(),images=[],requested=[],metadata=new Map(entries.map(a=>[a.id,a]));
  class TestImage {
    set src(value){this.source=value;requested.push(value);images.push(this);if(!pending)this.finish();}
    get src(){return this.source;}
    finish({error=false,wrongDimensions=false}={}){if(error){this.onerror?.();return;}const id=this.src.split('/').at(-1).replace(/\.png$/,''),asset=metadata.get(id);this.naturalWidth=asset.width+(wrongDimensions?1:0);this.naturalHeight=asset.height;this.complete=true;this.onload?.();}
  }
  const storeOptions={baseURI:'https://atlas.invalid/dlc/aliens-1986/game.html',imageFactory:()=>new TestImage()},canvas=dom.document.createElement('canvas'),renderer=new Renderer(canvas);
  if(existing)renderer.rasterSpritesV116=createSpriteStoreV116(entries,storeOptions);
  const controller=installRasterAtlasV122(renderer,entries,{...schedule,maximumWaitMs,storeOptions});
  return {...dom,schedule,images,requested,renderer,controller,finishAll(options){for(const image of images)if(!image.complete)image.finish(options);}};
}
const draws=canvas=>canvas.context.calls.filter(c=>c.kind==='image');

export function runAtlasUnitChecksV122(){
  let checks=0;
  const check=(condition,message)=>{assert.ok(condition,message);checks++;};
  const equal=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);checks++;};
  const rejects=(callback,pattern)=>{assert.throws(callback,pattern);checks++;};
  const historical=Array.from({length:6},(_,i)=>JSON.parse(readFileSync(new URL(`../docs/development/aliens-1986-sprites-v${116+i}/manifest.json`,import.meta.url),'utf8')).assets).flat();
  const fresh=IDS.map(fixtureEntry),entries=[...historical,...fresh],original=JSON.stringify(entries),locationsBefore=JSON.stringify(LOCATIONS),roomsBefore=JSON.stringify(ROOMS);
  equal(historical.length,155,'All historical records are available to the shared cache.');
  equal(Object.keys(ATLAS_ASSETS_V122).sort(),[...IDS].sort(),'The runtime whitelist has only the agreed illustrations.');
  for(const locationId of LOCATION_IDS){
    const expected=CONTRACT.filter(x=>x[0]===locationId).map(x=>x[1]);
    equal(atlasIllustrationsV122(locationId).map(x=>x.id),expected,'Exact card mapping '+locationId);
    check(LOCATIONS.some(l=>l.id===locationId),'Card exists in the historical atlas: '+locationId);
  }
  for(const value of ['derelict','ops','sulaco-cryo','constructor','__proto__','toString',null,undefined])equal(atlasIllustrationsV122(value),[],'Unrelated or unillustrated keys cannot select an illustration.');
  check(Object.isFrozen(atlasIllustrationsV122('sulaco-hangar'))&&Object.isFrozen(ATLAS_ASSETS_V122['uss-sulaco']),'Selection records are immutable.');
  equal(atlasImageRectV122({bbox:[0,0,100,100]}),{sx:0,sy:0,sw:100,sh:100,dx:156,dy:16,dw:328,dh:328,scale:3.28},'Square geometry uses contain, not cover.');
  equal(atlasImageRectV122({bbox:[0,0,0,5]}),null,'Empty bounds are rejected.');
  equal(atlasImageRectV122({bbox:[0,0,10,5]},20,20,10),null,'An exhausted frame is rejected.');
  equal(atlasImageRectV122({bbox:[0,NaN,10,5]}),null,'Non-finite bounds are rejected.');
  rejects(()=>installRasterAtlasV122({},[fresh[0],fresh[0]]),/duplicate sprite id/);
  rejects(()=>installRasterAtlasV122({},[{...fresh[0],path:'assets/../outside.png'}]),/Invalid sprite path/);
  rejects(()=>installRasterAtlasV122(null,entries),/renderer instance/);
  rejects(()=>installRasterAtlasV122({},entries,{maximumWaitMs:0}),/deadline/);

  const f=fixture(entries),session=createSession({mode:'inspection',roomId:'v114-gateway-medical'});
  f.renderer.session=session;f.renderer.world=currentWorld(session);f.renderer.camera=127;
  const sessionBefore=JSON.stringify(session),worldBefore=JSON.stringify(f.renderer.world);
  equal(f.requested.length,0,'Installation requests no images.');
  equal(f.renderer.rasterSpritesV116,undefined,'Installation does not allocate a second image cache.');
  const initialButtons=f.root.querySelectorAll('button'),handlers=initialButtons.map(b=>b.onclick),paragraphs=f.root.querySelectorAll('p');
  let status=f.controller.enhance(f.root,'places');
  equal(status.ready,11,'Eleven placements use nine distinct images.');
  equal(f.root.querySelectorAll('figure').length,11,'Every target is augmented once.');
  equal(status.cache.requested,9,'Shared artwork has only one image request.');
  check(f.requested.every(url=>url.startsWith('https://atlas.invalid/assets/dlc/aliens-1986/v122/')),'All image requests stay at the expected same-origin prefix.');
  equal(f.root.querySelectorAll('button'),initialButtons,'Atlas augmentation creates no inspection destinations.');
  equal(initialButtons.map(b=>b.onclick),handlers,'Original inspection callbacks survive.');
  check(paragraphs.every(p=>p.textContent.startsWith('Existing status and reference ')),'Original reference and integration status text survives.');
  const figures=f.root.querySelectorAll('figure'),canvases=f.root.querySelectorAll('canvas');
  for(const canvas of canvases){
    const call=draws(canvas)[0],[sx,sy,sw,sh,dx,dy,dw,dh]=call.args;
    check(Math.abs(dw/sw-dh/sh)<1e-12&&dx+320>=16-1e-9&&dy+180>=16-1e-9&&dx+320+dw<=624+1e-9&&dy+180+dh<=344+1e-9,'Uniform fit stays inside the 16px inset.');
    check(sx>=0&&sy>=0&&canvas.context.depth()===0&&canvas.context.globalAlpha===1,'Drawing preserves Canvas state and the measured source rectangle.');
  }
  equal(f.controller.status().placements.map(p=>[p.locationId,p.assetId]),CONTRACT.map(x=>x.slice(0,2)),'Status reports actual placements in card order.');
  const drawCount=canvases.reduce((sum,c)=>sum+draws(c).length,0),cache=f.renderer.rasterSpritesV116;
  equal(installRasterAtlasV122(f.renderer,entries),f.controller,'Installation is idempotent.');
  f.controller.enhance(f.root,'places');
  equal(f.root.querySelectorAll('figure'),figures,'Repeated augmentation reuses existing figures.');
  equal(canvases.reduce((sum,c)=>sum+draws(c).length,0),drawCount,'Ready canvases are not repainted by repeated augmentation.');
  equal(f.renderer.rasterSpritesV116,cache,'The cache identity is stable.');
  equal(f.schedule.pending.size,0,'Ready illustrations do not leave a RAF loop.');
  equal(JSON.stringify(session),sessionBefore,'The real session and its checkpoint state are unchanged.');
  equal(JSON.stringify(f.renderer.world),worldBefore,'World actors, colliders and doors are unchanged.');
  equal(f.renderer.camera,127,'Atlas fitting never modifies the game camera.');
  equal(JSON.stringify(entries),original,'All 155 historical and new metadata records retain their bytes.');
  equal(JSON.stringify(LOCATIONS),locationsBefore,'No historical atlas location is added or changed.');
  equal(JSON.stringify(ROOMS),roomsBefore,'No playable room is added or changed.');

  const shared=fixture(entries,['gateway-medical','gateway-inquiry'],{existing:true}),sharedStore=shared.renderer.rasterSpritesV116;
  sharedStore.get(historical[0].id);shared.controller.enhance(shared.root);
  equal(shared.renderer.rasterSpritesV116,sharedStore,'An existing gameplay cache is reused.');
  equal(sharedStore.status().requested,2,'One historical image and one reused atlas image are decoded.');
  check(sharedStore.get(historical[0].id)!==null,'The pre-existing historical cache record survives.');

  const delayed=fixture(entries,['sulaco-hangar'],{pending:true});
  status=delayed.controller.enhance(delayed.root);
  equal([status.ready,status.pending,delayed.schedule.pending.size],[0,2,1],'Pending loads share one refresh loop.');
  check(delayed.root.querySelectorAll('canvas').every(c=>c.hidden&&c.style.display==='none'),'Unloaded canvases are hidden without hiding the cards.');
  delayed.panel.hidden=true;delayed.schedule.step();
  equal(delayed.schedule.pending.size,0,'Closing the panel stops the pending refresh loop.');
  check(!delayed.controller.status().active,'A hidden panel is inactive.');
  delayed.finishAll();delayed.panel.hidden=false;status=delayed.controller.enhance(delayed.root);
  equal([status.ready,status.cache.requested],[2,2],'Reopening uses completed requests without downloading again.');
  check(delayed.root.querySelectorAll('canvas').every(c=>!c.hidden&&c.style.display==='block'),'Loaded canvases become visible.');
  delayed.controller.enhance(delayed.root,'cast');
  equal([delayed.root.querySelectorAll('figure').length,delayed.schedule.pending.size],[0,0],'Another tab has neither figures nor RAF work.');

  const hidden=fixture(entries,['narcissus']);hidden.panel.hidden=true;hidden.controller.enhance(hidden.root);
  equal([hidden.requested.length,hidden.root.querySelectorAll('figure').length],[0,0],'A panel hidden at first render does not request assets.');
  const unrelated=fixture(entries,['ops']);unrelated.controller.enhance(unrelated.root);
  equal([unrelated.requested.length,unrelated.root.querySelectorAll('figure').length],[0,0],'An unrelated card does not allocate illustrations.');

  const search=fixture(entries,['gateway-medical'],{pending:true});search.controller.enhance(search.root);
  const oldCallback=search.schedule.all.at(-1),oldCanvas=search.root.querySelector('canvas');
  search.root.replaceChildren(search.card('jorden'));search.controller.enhance(search.root);oldCallback();
  check(search.controller.status().pendingFrame&&search.schedule.pending.size===1,'A stale callback cannot clear the new search generation.');
  search.finishAll();search.schedule.step();
  equal(draws(oldCanvas).length,0,'Detached search results are never painted.');
  equal(search.controller.status().placements.map(p=>[p.assetId,p.state]),[['jorden-survey-tractor','ready']],'Only the current search result completes.');
  const removed=fixture(entries,['narcissus'],{pending:true});removed.controller.enhance(removed.root);removed.root.replaceChildren();removed.schedule.step();
  equal([removed.schedule.pending.size,removed.controller.status().placements.length],[0,0],'Removed cards stop work even without a subsequent render call.');

  const missing=fixture(historical,['narcissus']);status=missing.controller.enhance(missing.root);
  equal([status.placements[0].state,missing.requested.length,missing.schedule.pending.size],['missing',0,0],'A missing catalog entry keeps the text fallback without a request.');
  const invalid=fixture([...historical,{...fresh.find(a=>a.id==='narcissus-shuttle'),path:'assets/another/narcissus-shuttle.png'}],['narcissus']);status=invalid.controller.enhance(invalid.root);
  equal([status.placements[0].state,invalid.requested.length],['invalid',0],'A familiar ID cannot authorize a different path.');
  const failure=fixture(entries,['narcissus'],{pending:true});failure.controller.enhance(failure.root);failure.finishAll({error:true});failure.schedule.step();
  equal([failure.controller.status().placements[0].state,failure.schedule.pending.size],['error',0],'Image errors settle to the existing-card fallback.');
  failure.controller.enhance(failure.root);
  equal(failure.requested.length,1,'A failed cache record cannot trigger a request storm.');
  const wrong=fixture(entries,['narcissus'],{pending:true});wrong.controller.enhance(wrong.root);wrong.finishAll({wrongDimensions:true});wrong.schedule.step();
  equal(wrong.controller.status().placements[0].state,'error','The shared loader rejects incorrect decoded dimensions.');
  const timeout=fixture(entries,['narcissus'],{pending:true,maximumWaitMs:5});timeout.controller.enhance(timeout.root);timeout.schedule.step(6);
  equal([timeout.controller.status().placements[0].state,timeout.schedule.pending.size],['timeout',0],'Unfinished requests have a bounded UI refresh lifetime.');
  timeout.finishAll();timeout.controller.enhance(timeout.root);
  equal([timeout.controller.status().ready,timeout.requested.length],[1,1],'A late load can display on reopening without invalidating the cache.');
  const noContext=fixture(entries,['narcissus'],{pending:true});noContext.controller.enhance(noContext.root);noContext.root.querySelector('canvas').context=null;noContext.finishAll();noContext.schedule.step();
  equal(noContext.controller.status().placements[0].state,'unavailable','A missing Canvas context keeps the card usable.');
  const dispose=fixture(entries,['narcissus'],{pending:true});dispose.controller.enhance(dispose.root);dispose.controller.dispose();dispose.controller.dispose();dispose.finishAll();dispose.schedule.step();
  equal([dispose.schedule.pending.size,dispose.root.querySelectorAll('figure').length,dispose.controller.status().active],[0,0,false],'Disposal is idempotent and removes pending work and owned figures.');
  equal(fresh.length,9,'The runtime contract contains nine unique illustrations for existing cards.');
  return checks;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const checks=runAtlasUnitChecksV122();process.stdout.write(JSON.stringify({ok:true,version:122,checks,placements:11,uniqueImages:9,cardCount:8,simulationUnchanged:true,verification:'DOM/image/Canvas-call doubles with real V114 session and V116 loader; no pixel or browser claim'})+'\n');
}
