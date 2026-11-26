#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createSpriteStoreV116,validateSpriteEntriesV116} from '../modules/aliens-1986/v116/sprite-loader-v116.mjs';
import {humanAssetIdV116,creatureAssetIdV116,propSelectionV116,installRasterRendererV116} from '../modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {renderAliens1986RasterV116,parseAliens1986RegistryV116,V114_HTML_PATH,V114_HTML_SHA256,SUPPLEMENT_IDS_V117} from './derive-aliens1986-raster-v116.mjs';
import {runPropsUnitChecksV118} from './verify-aliens1986-raster-props-v118.mjs';

function entry(id,extra={}) {return {id,path:'assets/test/'+id+'.png',width:100,height:200,bbox:[10,20,90,190],pivot:[50,190],runtimeEligible:true,...extra};}
function contextSpy() {
  const calls=[],stack=[];
  return {calls,globalAlpha:.5,save(){stack.push(this.globalAlpha);calls.push(['save']);},restore(){this.globalAlpha=stack.pop();calls.push(['restore']);},
    translate(...a){calls.push(['translate',...a]);},scale(...a){calls.push(['scale',...a]);},
    drawImage(...a){calls.push(['drawImage',...a,this.globalAlpha]);},
    beginPath(){calls.push(['beginPath']);},ellipse(...a){calls.push(['ellipse',...a]);},fill(){},stroke(){},arc(...a){calls.push(['arc',...a]);},
    fillRect(...a){calls.push(['fillRect',...a]);},strokeRect(){},fillText(){},rect(...a){calls.push(['rect',...a]);},clip(){calls.push(['clip']);}
  };
}
function imageQueue() {const images=[];return {images,factory:()=>{const image={naturalWidth:100,naturalHeight:200,complete:false};images.push(image);return image;}};}
export function runPresentationUnitChecksV116() {
  let checks=0;
  for(const invalid of [
    [entry('one'),entry('one')],[entry('one',{path:'assets/../private.png'})],
    [entry('one',{path:'https://outside.invalid/a.png'})],[entry('one',{bbox:[0,0,101,200]})],
    [entry('one',{bbox:[30,20,20,190]})]
  ]) {assert.throws(()=>validateSpriteEntriesV116(invalid));checks++;}
  const q=imageQueue(),store=createSpriteStoreV116([entry('one')],{baseURI:'https://example.invalid/preview/dlc/aliens-1986/game.html',imageFactory:q.factory});
  assert.equal(store.get('missing'),null);assert.equal(q.images.length,0);
  assert.equal(store.get('one'),null);assert.equal(q.images[0].src,'https://example.invalid/preview/assets/test/one.png');
  store.get('one');assert.equal(q.images.length,1);q.images[0].onload();assert.ok(store.get('one'));checks++;
  const c=contextSpy();
  assert.equal(store.draw(c,'one',{x:50,y:300,width:40,height:85,flip:true,alpha:.4}),true);
  const draw=c.calls.find(a=>a[0]==='drawImage');
  assert.deepEqual(draw.slice(2,10),[10,20,80,170,-20,-85,40,85]);
  assert.equal(draw.at(-1),.2);assert.equal(c.globalAlpha,.5);assert.ok(c.calls.some(a=>a[0]==='scale'&&a[1]===-1&&a[2]===1));checks++;
  c.calls.length=0;store.draw(c,'one',{height:85,width:20});
  assert.equal(c.calls.find(a=>a[0]==='drawImage')[9],42.5);checks++;
  const failure=imageQueue(),failed=createSpriteStoreV116([entry('bad')],{baseURI:'https://example.invalid/dlc/aliens-1986/game.html',imageFactory:failure.factory});
  failed.get('bad');failure.images[0].naturalWidth=99;failure.images[0].onload();
  assert.equal(failed.get('bad'),null);assert.equal(failed.get('bad'),null);assert.equal(failure.images.length,1);assert.equal(failed.status().failed,1);checks++;
  const lruQ=imageQueue(),lru=createSpriteStoreV116([entry('one'),entry('two')],{baseURI:'https://example.invalid/dlc/aliens-1986/game.html',imageFactory:lruQ.factory,maximumDecoded:1});
  lru.get('one');lruQ.images[0].onload();lru.get('two');lruQ.images[1].onload();
  assert.equal(lru.status().decoded,1);assert.equal(lru.status().evicted,1);checks++;
  const pixels=new Uint8ClampedArray(100*200*4);
  for(let y=40;y<180;y++)for(let x=20;x<70;x++)pixels[(y*100+x)*4+3]=255;
  const measuredCanvas={width:0,height:0,getContext:()=>({drawImage(){},getImageData:()=>({data:pixels})})},measureQ=imageQueue();
  const measured=createSpriteStoreV116([entry('measure',{bbox:[0,0,100,200],pivot:[50,200],bboxStatus:'full-image-unmeasured'})],{baseURI:'https://example.invalid/dlc/aliens-1986/game.html',imageFactory:measureQ.factory,canvasFactory:()=>measuredCanvas});
  measured.get('measure');measureQ.images[0].onload();
  assert.deepEqual(measured.asset('measure').bbox,[20,40,70,180]);assert.deepEqual(measured.asset('measure').pivot,[45,180]);assert.equal(measured.status().measured,1);assert.equal(measuredCanvas.width,1);checks++;
  const world={scene:{id:'v106-hadley',solids:[]},actors:[],circuits:{},doors:{gate:{open:false}}};
  const lookup={has:id=>['ripley-idle-right','ripley-walk-right','ripley-interact-right','ripley-gateway','warrior-idle-right','warrior-death-right'].includes(id)};
  const ripley={id:'ripley',kind:'player',alive:true,x:160,z:30,route:[],facing:1,ammo:30};
  assert.equal(humanAssetIdV116(lookup,ripley,world,{}),'ripley-idle-right');
  assert.equal(humanAssetIdV116(lookup,{...ripley,route:[{x:10,z:10}]},world,{}),'ripley-walk-right');
  assert.equal(humanAssetIdV116(lookup,ripley,world,{action:{kind:'door'}}),'ripley-interact-right');
  assert.equal(humanAssetIdV116(lookup,{...ripley,alive:false},world,{}),null);
  assert.equal(creatureAssetIdV116(lookup,{role:'warrior',alive:false}),'warrior-death-right');checks++;
  assert.deepEqual(propSelectionV116({type:'supply',stockId:'medical-a'},world,{logistics:{collected:['medical-a']}}).ids,['supply-case-medical-empty']);
  assert.deepEqual(propSelectionV116({type:'armament-case',arsenalId:'a'},world,{arsenal:{collected:['a']}}).ids,['armament-case-open']);
  assert.equal(propSelectionV116({id:'service-crate',type:'crate'},{scene:{id:'v107-service'}},{}),null);
  assert.equal(propSelectionV116({type:'display'},{scene:{id:'v114-gateway-inquiry'}},{}),null);checks++;
  const previousImage=globalThis.Image,previousDocument=globalThis.document;
  try {
    globalThis.document={baseURI:'https://example.invalid/dlc/aliens-1986/game.html'};
    globalThis.Image=class {constructor(){this.naturalWidth=100;this.naturalHeight=200;this.complete=false;}set src(value){this._src=value;this.onload();}get src(){return this._src;}};
    class TestRenderer {
      constructor(){this.c=contextSpy();this.session={arsenal:{selected:{ripley:'pulse',newt:null}},engineering:{attacks:{}}};this.fallbackActors=0;this.fallbackProps=0;this.originalDoors=0;}
      project(p){return {x:p.x,y:100+p.z};}
      actor(){this.fallbackActors++;}
      prop(){this.fallbackProps++;}
      door(){this.originalDoors++;}
    }
    const entries=['ripley-idle-right','ripley-walk-right','ripley-interact-right','ripley-gateway','newt-idle-right','m41a-pulse-rifle','door-leaf','warrior-idle-right',...SUPPLEMENT_IDS_V117].map(id=>entry(id));
    entries.push(entry('warrior-death-right',{bbox:[10,120,90,190]}),entry('hicks-idle-right',{heldWeapon:true}));
    installRasterRendererV116(TestRenderer,entries,{fallbackWeapon:(c,...args)=>c.calls.push(['fallbackWeapon',...args])});
    const renderer=new TestRenderer(),before=JSON.stringify({world,ripley,session:renderer.session});
    renderer.actor(ripley,world);
    assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,2);assert.equal(renderer.fallbackActors,0);
    assert.equal(JSON.stringify({world,ripley,session:renderer.session}),before);checks++;
    const movingActor={...ripley,route:[]};
    renderer.c.calls.length=0;renderer.actor(movingActor,world);
    assert.match(renderer.c.calls.find(a=>a[0]==='drawImage')[1].src,/ripley-idle-right\.png$/);
    movingActor.x+=12;
    const movementSnapshot=JSON.stringify({actor:movingActor,world,session:renderer.session});
    renderer.c.calls.length=0;renderer.actor(movingActor,world);
    assert.match(renderer.c.calls.find(a=>a[0]==='drawImage')[1].src,/ripley-walk-right\.png$/);
    renderer.c.calls.length=0;renderer.actor(movingActor,world);
    assert.match(renderer.c.calls.find(a=>a[0]==='drawImage')[1].src,/ripley-idle-right\.png$/);
    assert.equal(JSON.stringify({actor:movingActor,world,session:renderer.session}),movementSnapshot);checks++;
    renderer.c.calls.length=0;renderer.actor({...ripley,id:'newt',kind:'escort'},world);
    const newtDraws=renderer.c.calls.filter(a=>a[0]==='drawImage');
    assert.equal(newtDraws.length,1);assert.equal(newtDraws[0][9],66);checks++;
    renderer.c.calls.length=0;renderer.actor(ripley,{...world,scene:{id:'v114-gateway-medical',solids:[]}});
    assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,1);
    assert.match(renderer.c.calls.find(a=>a[0]==='drawImage')[1].src,/ripley-gateway\.png$/);checks++;
    renderer.c.calls.length=0;renderer.session.action={kind:'door'};renderer.actor(ripley,world);
    assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,1);assert.match(renderer.c.calls.find(a=>a[0]==='drawImage')[1].src,/ripley-interact-right\.png$/);
    renderer.session.action=null;checks++;
    renderer.c.calls.length=0;renderer.actor({...ripley,id:'hicks',kind:'ally'},world);
    assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,1);assert.equal(renderer.c.calls.filter(a=>a[0]==='fallbackWeapon').length,0);checks++;
    renderer.c.calls.length=0;renderer.session.arsenal.selected.ripley='shotgun';renderer.actor(ripley,world);
    assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,1);assert.equal(renderer.c.calls.filter(a=>a[0]==='fallbackWeapon').length,1);renderer.session.arsenal.selected.ripley='pulse';checks++;
    renderer.c.calls.length=0;renderer.actor({...ripley,alive:false},world);
    assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,0);assert.equal(renderer.fallbackActors,1);checks++;
    renderer.c.calls.length=0;renderer.actor({id:'enemy',kind:'enemy',role:'warrior',alive:false,x:300,z:50},world);
    assert.ok(renderer.c.calls.find(a=>a[0]==='drawImage')[9]<60);checks++;
    renderer.c.calls.length=0;
    const gate={id:'gate',x:200,z:50,w:32,d:120,h:170};
    renderer.door(gate,world,{});
    assert.equal(renderer.originalDoors,1);assert.equal(renderer.c.calls.find(a=>a[0]==='drawImage')[8],28);
    renderer.c.calls.length=0;renderer.door(gate,{...world,doors:{gate:{open:true}}},{});
    assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,0);checks++;
    renderer.c.calls.length=0;
    assert.equal(renderer.rasterHatchSurfaceV116(gate,{linkOpen:true,structural:{breached:false}}),false);
    assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,0);
    renderer.rasterHatchSurfaceV116(gate,{linkOpen:true,structural:{breached:true}});
    assert.equal(renderer.c.calls.filter(a=>a[0]==='clip').length,1);
    assert.equal(renderer.c.calls.filter(a=>a[0]==='rect').length,2);
    assert.ok(renderer.c.calls.filter(a=>a[0]==='rect').every(a=>a[3]===5));checks++;
    // These are existing V114 state fields; the V117 supplement only supplies
    // the PNG keys that the unchanged V116 renderer already selects.
    for(const [id,structural] of [
      ['door-leaf-damaged',{hp:70,brace:0,breached:false}],
      ['door-leaf-reinforced',{hp:70,brace:1,breached:false}],
      ['door-leaf-breached',{hp:0,brace:0,breached:true}]
    ]) {
      renderer.c.calls.length=0;
      const state={linkOpen:false,structural},beforeState=JSON.stringify(state);
      assert.equal(renderer.rasterHatchSurfaceV116(gate,state),true);
      assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,1);
      assert.ok(renderer.c.calls.find(a=>a[0]==='drawImage')[1].src.endsWith('/'+id+'.png'));
      assert.equal(JSON.stringify(state),beforeState);checks++;
    }
    for(const [id,prop,room,collected] of [
      ['meal-tray-food',{type:'meal'},'v114-sulaco-mess',[]],
      ['supply-case-medical-empty',{type:'supply',stockId:'medical-a'},'v106-hadley',['medical-a']],
      ['supply-case-ammo-closed',{type:'supply',stockId:'ammo-a'},'v106-hadley',[]],
      ['supply-case-ammo-empty',{type:'supply',stockId:'ammo-a'},'v106-hadley',['ammo-a']]
    ]) {
      renderer.c.calls.length=0;renderer.session.logistics={collected};
      const sceneWorld={...world,scene:{id:room,solids:[]}},placed={...prop,x:240,z:60};
      const beforeState=JSON.stringify({prop:placed,world:sceneWorld,session:renderer.session});
      renderer.prop(placed,sceneWorld,{});
      assert.equal(renderer.fallbackProps,0);
      assert.equal(renderer.c.calls.filter(a=>a[0]==='drawImage').length,1);
      assert.ok(renderer.c.calls.find(a=>a[0]==='drawImage')[1].src.endsWith('/'+id+'.png'));
      assert.equal(JSON.stringify({prop:placed,world:sceneWorld,session:renderer.session}),beforeState);checks++;
    }
    assert.equal(renderer.rasterStatusV116().failed,0);
  } finally {
    if(previousImage===undefined)delete globalThis.Image;else globalThis.Image=previousImage;
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  }
  return checks;
}
export async function runPresentationChecksV116({root=process.cwd()}={}) {
  const v116Checks=runPresentationUnitChecksV116(),v118Checks=runPropsUnitChecksV118();
  const first=await renderAliens1986RasterV116({root}),second=await renderAliens1986RasterV116({root});
  assert.equal(first.html,second.html);assert.equal(first.sha256,second.sha256);
  const base=await readFile(resolve(root,V114_HTML_PATH),'utf8'),hash=x=>createHash('sha256').update(x).digest('hex');
  assert.equal(hash(base),V114_HTML_SHA256);assert.equal(hash(first.html),first.sha256);
  const before=parseAliens1986RegistryV116(base).registry,after=parseAliens1986RegistryV116(first.html).registry;
  const presentationOnly=new Set(['preview/renderer.mjs','preview/app.mjs','src/fidelity-v114.mjs']);
  for(const [key,entry] of Object.entries(before))if(!presentationOnly.has(key))assert.deepEqual(after[key],entry,'Unrelated V114 module changed: '+key);
  assert.match(first.html,/<meta name="aliens-raster-version" content="116">/);
  assert.match(first.html,/<meta name="aliens-raster-extension-version" content="118">/);
  assert.match(first.html,/<meta name="aliens-raster-asset-version" content="118">/);
  assert.equal(first.assetRevision,118);assert.equal(first.presentationExtensionRevision,118);
  assert.equal(first.assets.length,141);
  assert.equal(after['preview/renderer.mjs'].deps['../v118/raster-props-v118.mjs'],'v118/raster-props-v118.mjs');
  assert.deepEqual(after['v118/raster-props-v118.mjs'].deps,{'../v116/sprite-loader-v116.mjs':'v116/sprite-loader-v116.mjs'});
  const rendererSource=after['preview/renderer.mjs'].source;
  assert.ok(rendererSource.lastIndexOf('installRasterPropsV118(Renderer,')>rendererSource.lastIndexOf('installRasterRendererV116(Renderer,'));
  for(const sourcePath of ['v116/sprite-loader-v116.mjs','v116/raster-renderer-v116.mjs','v118/raster-props-v118.mjs']) {
    assert.equal(after[sourcePath].sha256,hash(await readFile(resolve(root,'modules/aliens-1986/'+sourcePath))));
  }
  assert.match(after['preview/app.mjs'].source,/aliens_1986_v114_fidelity_checkpoint/);
  assert.match(after['src/arsenal-v114.mjs'].source,/schema:114/);
  assert.ok(!after['v116/sprite-loader-v116.mjs'].source.includes('fetch('),'Runtime must not fetch a manifest.');
  return {ok:true,unitChecks:v116Checks+v118Checks,v116UnitChecks:v116Checks,v118UnitChecks:v118Checks,deterministic:true,immutableBase:true,saveSchema:114,rasterVersion:116,presentationExtensionRevision:118,assetRevision:first.assetRevision,assets:first.assets.length,sha256:first.sha256};
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  process.stdout.write(JSON.stringify(await runPresentationChecksV116())+'\n');
}
