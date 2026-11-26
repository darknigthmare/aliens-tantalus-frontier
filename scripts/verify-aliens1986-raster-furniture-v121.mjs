#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Renderer as NativeRenderer} from '../modules/aliens-1986/v114/preview/renderer.mjs';
import {createSession,currentWorld} from '../modules/aliens-1986/v114/src/operation-v114.mjs';
import {ROOMS} from '../modules/aliens-1986/v114/src/operation-scenes-v114.mjs';
import {validateSpriteEntriesV116} from '../modules/aliens-1986/v116/sprite-loader-v116.mjs';
import {installRasterRendererV116} from '../modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {installRasterPropsV118} from '../modules/aliens-1986/v118/raster-props-v118.mjs';
import {installRasterFurnitureV119} from '../modules/aliens-1986/v119/raster-furniture-v119.mjs';
import {installRasterFurnitureV120} from '../modules/aliens-1986/v120/raster-furniture-v120.mjs';
import {furnitureSelectionV121,installRasterFurnitureV121} from '../modules/aliens-1986/v121/raster-furniture-v121.mjs';

// Independent contracts from the preserved scene exports: room, body, image,
// x, z, width, depth, height. These are not read from the selector under test.
const PLACEMENTS=[
  ['v106-hadley','generator','hadley-service-generator',348,78,100,62,84],
  ['v107-service','pump-foundation','service-pump-unit',275,53,151,98,94],
  ['v112-conduit','exchanger-west','conduit-heat-exchanger',316,54,181,84,127],
  ['v112-conduit','exchanger-east','conduit-heat-exchanger',995,56,194,82,134],
  ['v112-conduit','valve-plinth','conduit-valve-plinth',368,286,125,65,73],
];
const LEGACY=[
  ['v106-medlab','bed-west','medlab-bed'],['v106-medlab','bed-east','medlab-bed'],
  ['v106-medlab','med-cabinet','medlab-storage-cabinet'],
  ['v109-reserve','service-locker','reserve-service-locker'],
  ['v107-operations','ops-rack','operations-storage-rack'],
  ['v107-operations','ops-table','operations-command-table'],
  ['v114-sulaco-mess','v114-sulaco-mess-body-0','sulaco-mess-table'],
  ['v109-reserve','medical-counter','reserve-medical-counter'],
  ['v109-reserve','reserve-cabinet','utility-storage-cabinet'],
  ['v112-workshop','optics-bench','optics-workbench'],
  ['v112-workshop','optics-cabinet','utility-storage-cabinet'],
  ['v106-hadley','service-rack','operations-storage-rack'],
  ['v107-operations','ops-display','operations-display-bank'],
];
const PRIOR_SUPPORT_IMAGES=['meal-tray-food','combat-knife','operations-table-terminal','medical-counter-terminal','optics-calibration-terminal'];
const NEW_IDS=[...new Set(PLACEMENTS.map(x=>x[2]))];
const FACTORY_IDS=[...new Set([...NEW_IDS,...LEGACY.map(x=>x[2]),...PRIOR_SUPPORT_IMAGES,
  'valve-indicator-panel','service-control-pedestal','sulaco-briefing-terminal',
  'operations-console','newt-idle-right','industrial-pipe','engineering-case-stocked'])];
const fixtureEntry=id=>({id,path:'assets/test/'+id+'.png',width:1000,height:700,
  bbox:[20,20,980,680],pivot:[500,680],runtimeEligible:true});
const imageId=image=>image.src.split('/').at(-1).replace(/\.png$/,'');
const draws=renderer=>renderer.c.calls.filter(x=>x.kind==='image');
function deepFreeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;}
function atBody(call,placement,world,camera){
  const [room,id,asset]=placement,body=world.scene.solids.find(x=>x.id===id);
  return !!body&&world.scene.id===room&&call.kind==='image'&&call.id===asset&&
    Math.abs(call.transform[4]-(body.x+body.w/2-camera))<1e-8&&
    Math.abs(call.transform[5]-(265+(body.z+body.d)*.86))<1e-8;
}
const isNewDraw=(call,world,camera)=>PLACEMENTS.some(p=>atBody(call,p,world,camera));

// Pixel/loading doubles only. Real V114 sessions and renderer plus all five
// presentation layers execute. Browser QA separately decodes the actual PNGs.
function recordingContext(){
  const calls=[],stack=[];let matrix=[1,0,0,1,0,0];
  const context={calls,globalAlpha:1,globalCompositeOperation:'source-over',
    save(){stack.push({alpha:this.globalAlpha,operation:this.globalCompositeOperation,matrix:[...matrix]});},
    restore(){const prior=stack.pop();assert.ok(prior,'Unbalanced Canvas restore');this.globalAlpha=prior.alpha;this.globalCompositeOperation=prior.operation;matrix=prior.matrix;},
    setTransform(...values){matrix=values;},
    translate(x,y){matrix[4]+=matrix[0]*x+matrix[2]*y;matrix[5]+=matrix[1]*x+matrix[3]*y;},
    scale(x,y){matrix[0]*=x;matrix[1]*=x;matrix[2]*=y;matrix[3]*=y;},
    rotate(angle){const [a,b,c,d]=matrix,cos=Math.cos(angle),sin=Math.sin(angle);matrix[0]=a*cos+c*sin;matrix[1]=b*cos+d*sin;matrix[2]=c*cos-a*sin;matrix[3]=d*cos-b*sin;},
    drawImage(image,...args){calls.push(typeof image.src==='string'?{kind:'image',id:imageId(image),args,transform:[...matrix],alpha:this.globalAlpha}:{kind:'canvas',width:image.width,height:image.height,args,transform:[...matrix],alpha:this.globalAlpha});},
    fillText(text,...args){calls.push({kind:'text',text,args});},
    measureText(text){return {width:String(text).length*6};},
    createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};},
    stackDepth(){return stack.length;},
  };
  return new Proxy(context,{get(target,key){return key in target?target[key]:()=>{};}});
}

export function runFurnitureUnitChecksV121(){
  let checks=0;
  const previousImage=globalThis.Image,previousDocument=globalThis.document;
  const entries=FACTORY_IDS.map(fixtureEntry),assets=new Map(entries.map(x=>[x.id,x]));
  const images=[],modes=new Map();
  const sessionFor=room=>createSession({mode:'inspection',roomId:room});
  function makeRenderer(selected=entries,extension=true){
    class FixtureRenderer extends NativeRenderer{
      box(body,palette){this.c.calls.push({kind:'native-box',id:body.id,alpha:this.c.globalAlpha});return super.box(body,palette);}
      prop(prop,world,palette){this.c.calls.push({kind:'native-prop',id:prop.id,alpha:this.c.globalAlpha});return super.prop(prop,world,palette);}
    }
    installRasterRendererV116(FixtureRenderer,selected);installRasterPropsV118(FixtureRenderer,selected);
    installRasterFurnitureV119(FixtureRenderer,selected);installRasterFurnitureV120(FixtureRenderer,selected);
    if(extension)installRasterFurnitureV121(FixtureRenderer,selected);
    const c=recordingContext(),renderer=new FixtureRenderer({getContext:()=>c,width:0,height:0});renderer.reducedMotion=true;return renderer;
  }
  function render(renderer,session){
    renderer.c.calls.length=0;const before=JSON.stringify(session);
    renderer.render(currentWorld(session),{session});
    assert.equal(renderer.c.stackDepth(),0);assert.equal(JSON.stringify(session),before,'Presentation mutated simulation/save state');
    return draws(renderer);
  }
  try{
    globalThis.document={baseURI:'https://example.invalid/dlc/aliens-1986/game.html',createElement(tag){assert.equal(tag,'canvas');const c=recordingContext();return {width:0,height:0,getContext:()=>c};}};
    globalThis.Image=class{
      constructor(){this.complete=false;images.push(this);}
      set src(value){this._src=value;const id=imageId(this),asset=assets.get(id),mode=modes.get(id);assert.ok(asset,'Unknown factory image '+id);
        this.naturalWidth=asset.width;this.naturalHeight=asset.height;
        if(mode==='pending')return;if(mode==='error'){this.onerror();return;}
        if(mode==='wrong-size')this.naturalWidth--;this.onload();}
      get src(){return this._src;}
    };

    // Check the entire real historical registry without pretending to decode
    // its 53 unmeasured legacy images with a pixel double.
    const historical=[116,117,118,119,120].flatMap(v=>JSON.parse(readFileSync(new URL('../docs/development/aliens-1986-sprites-v'+v+'/manifest.json',import.meta.url),'utf8')).assets);
    assert.equal(historical.length,151);assert.equal(new Set(historical.map(x=>x.id)).size,151);
    const catalog=deepFreeze([...historical,...NEW_IDS.map(fixtureEntry)]),beforeCatalog=JSON.stringify(catalog),catalogRenderer=makeRenderer(catalog);
    const initial=catalogRenderer.rasterStatusV121(),sharedCatalog=catalogRenderer.rasterSpritesV116;
    assert.equal(initial.requested,0);
    for(const expected of validateSpriteEntriesV116(historical))assert.deepEqual(sharedCatalog.asset(expected.id),expected);
    for(const v of [118,119,120,121]){const {extensionVersion,...status}=catalogRenderer['rasterStatusV'+v]();assert.equal(extensionVersion,v);assert.deepEqual(status,catalogRenderer.rasterStatusV116());}
    assert.equal(catalogRenderer.rasterSpritesV116,sharedCatalog);assert.equal(JSON.stringify(catalog),beforeCatalog);checks++;

    let admitted=0;
    for(const scene of ROOMS)for(const body of scene.solids){
      const expected=PLACEMENTS.find(p=>p[0]===scene.id&&p[1]===body.id),selection=furnitureSelectionV121(body,{scene});
      if(!expected){assert.equal(selection,null,scene.id+'/'+body.id);continue;}
      const [,id,asset,x,z,w,d,h]=expected;
      assert.deepEqual([body.id,body.x,body.z,body.w,body.d,body.h],[id,x,z,w,d,h]);
      assert.equal(body.material,undefined);assert.equal(body.visual,undefined);
      assert.deepEqual(selection,{id:asset,width:w,height:h+d*.86});admitted++;
    }
    assert.equal(admitted,5);checks++;

    for(const room of new Set(PLACEMENTS.map(x=>x[0]))){
      const session=deepFreeze(sessionFor(room)),world=currentWorld(session),renderer=makeRenderer(),output=render(renderer,session);
      const expected=PLACEMENTS.filter(p=>p[0]===room);
      assert.equal(output.filter(x=>isNewDraw(x,world,renderer.camera)).length,expected.length);
      for(const p of expected){
        const [,bodyId,id,,,w,d,h]=p,body=world.scene.solids.find(x=>x.id===bodyId),matches=output.filter(x=>atBody(x,p,world,renderer.camera));
        assert.equal(matches.length,1,room+'/'+bodyId);const call=matches[0],asset=assets.get(id),[l,t,r,b]=asset.bbox,bw=r-l,bh=b-t,s=Math.min(w/bw,(h+d*.86)/bh);
        assert.deepEqual(call.transform,[1,0,0,1,body.x+body.w/2-renderer.camera,265+(body.z+body.d)*.86]);
        assert.ok(Math.abs(call.args[6]-bw*s)<1e-8&&Math.abs(call.args[7]-bh*s)<1e-8);
        assert.ok(Math.abs(call.args[6]/bw-call.args[7]/bh)<1e-12);
        assert.ok(Math.abs(call.args[4]+call.args[6]/2)<1e-8&&Math.abs(call.args[5]+call.args[7])<1e-8);
        assert.equal(renderer.c.calls.some(x=>x.kind==='native-box'&&x.id===bodyId),false);checks++;
      }
      assert.ok(renderer.c.calls.some(x=>x.kind==='native-box'),'Structural boxes remain native');checks++;
    }

    // Reproduce the actual V120 support-order defect, then verify the one
    // deferred panel without altering its physical coordinates or other props.
    {
      const session=deepFreeze(sessionFor('v112-conduit')),world=currentWorld(session),prior=makeRenderer(entries,false),next=makeRenderer();
      render(prior,session);render(next,session);
      const index=(renderer,kind,id)=>renderer.c.calls.findIndex(x=>x.kind===kind&&x.id===id);
      assert.ok(index(prior,'image','valve-indicator-panel')<index(prior,'native-box','valve-plinth'));
      assert.ok(index(next,'image','valve-indicator-panel')>index(next,'image','conduit-valve-plinth'));
      const panel=draws(next).filter(x=>x.id==='valve-indicator-panel');assert.equal(panel.length,1);
      assert.deepEqual(panel[0].transform,[1,0,0,1,431-next.camera,265+316*.86-73]);assert.equal(panel[0].alpha,1);
      assert.deepEqual(draws(next).filter(x=>x.id!=='valve-indicator-panel'&&!isNewDraw(x,world,next.camera)),draws(prior).filter(x=>x.id!=='valve-indicator-panel'));checks++;
    }
    {
      const session=sessionFor('v112-conduit');session.team[0].x=430.5;session.team[0].z=256;
      const renderer=makeRenderer();render(renderer,deepFreeze(session));
      for(const id of ['conduit-valve-plinth','valve-indicator-panel'])assert.equal(draws(renderer).find(x=>x.id===id).alpha,.23);checks++;
    }

    let preserved=0;
    for(const room of new Set(LEGACY.map(x=>x[0]))){
      const session=deepFreeze(sessionFor(room)),world=currentWorld(session),prior=makeRenderer(entries,false),next=makeRenderer();render(prior,session);render(next,session);
      for(const p of LEGACY.filter(x=>x[0]===room)){
        const old=draws(prior).filter(x=>atBody(x,p,world,prior.camera)),current=draws(next).filter(x=>atBody(x,p,world,next.camera));
        assert.equal(current.length,1);assert.deepEqual(current,old);preserved++;
      }
      for(const id of PRIOR_SUPPORT_IMAGES)assert.deepEqual(draws(next).filter(x=>x.id===id),draws(prior).filter(x=>x.id===id));checks++;
    }
    assert.equal(preserved,13);

    for(const mutate of [
      b=>b.w++,b=>b.d++,b=>b.h++,b=>{b.material='metal';},b=>{b.material=null;},
      b=>{b.visual='other';},b=>{b.visual=null;},b=>{b.visual=false;},b=>{b.id='unlisted';},
      b=>{b.x=NaN;},b=>{b.z=Infinity;},(b,s)=>{s.id='other-room';},
      (b,s)=>{s.solids.push({...b});},(b,s)=>{s.solids.push(b);},
    ]){
      const scene=structuredClone(ROOMS.find(x=>x.id==='v112-conduit')),body=scene.solids.find(x=>x.id==='valve-plinth');mutate(body,scene);
      assert.equal(furnitureSelectionV121(body,{scene}),null);checks++;
    }
    {
      const scene=ROOMS.find(x=>x.id==='v112-conduit'),body=scene.solids.find(x=>x.id==='valve-plinth');
      assert.equal(furnitureSelectionV121({...body},{scene}),null);assert.equal(furnitureSelectionV121(null,{scene}),null);assert.equal(furnitureSelectionV121(body,null),null);checks++;
    }

    // Each of the four resources can fail independently. The shared exchanger
    // must still request once and recover at BOTH native body anchors.
    for(const id of NEW_IDS)for(const mode of ['pending','error','wrong-size','absent']){
      const placements=PLACEMENTS.filter(x=>x[2]===id),room=placements[0][0],session=deepFreeze(sessionFor(room));
      if(mode!=='absent')modes.set(id,mode);
      const selected=mode==='absent'?entries.filter(x=>x.id!==id):entries,renderer=makeRenderer(selected),start=images.length;
      render(renderer,session);render(renderer,session);assert.equal(draws(renderer).filter(x=>x.id===id).length,0);
      for(const [,bodyId] of placements)assert.ok(renderer.c.calls.some(x=>x.kind==='native-box'&&x.id===bodyId));
      if(id==='conduit-valve-plinth')assert.ok(renderer.c.calls.findIndex(x=>x.kind==='image'&&x.id==='valve-indicator-panel')<renderer.c.calls.findIndex(x=>x.kind==='native-box'&&x.id==='valve-plinth'));
      const requested=images.slice(start).filter(x=>imageId(x)===id);assert.equal(requested.length,mode==='absent'?0:1);
      if(mode==='pending'){
        requested[0].onload();render(renderer,session);assert.equal(draws(renderer).filter(x=>x.id===id).length,placements.length);
        if(id==='conduit-valve-plinth')assert.ok(renderer.c.calls.findIndex(x=>x.kind==='image'&&x.id==='valve-indicator-panel')>renderer.c.calls.findIndex(x=>x.kind==='image'&&x.id===id));
      }
      modes.delete(id);checks++;
    }
    for(const mutate of [
      p=>{p.type='crate';},p=>{p.supportId='exchanger-west';},p=>{p.elevation=72;},
      p=>{p.x=200;},p=>{p.z=100;},p=>{p.bodyId='valve-plinth';},p=>{p.id='unlisted-panel';},
      (p,w)=>{w.scene.props.push({...p});},(p,w)=>{w.scene.props.push(p);},
    ]){
      const session=sessionFor('v112-conduit'),world=currentWorld(session),prop=world.scene.props.find(x=>x.id==='valve-indicator');mutate(prop,world);deepFreeze(session);
      const prior=makeRenderer(entries,false),next=makeRenderer();render(prior,session);render(next,session);
      const relevant=(renderer)=>renderer.c.calls.filter(x=>x.kind==='native-prop'||x.kind==='image'&&!isNewDraw(x,world,renderer.camera));
      assert.deepEqual(relevant(next),relevant(prior),'An invalid/ambiguous support keeps its previous rendering path');checks++;
    }

    {
      const renderer=makeRenderer(),start=images.length;
      for(const room of ['v112-conduit','v106-hadley','v112-conduit'])render(renderer,deepFreeze(sessionFor(room)));
      assert.equal(draws(renderer).filter(x=>x.id==='conduit-heat-exchanger').length,2);
      assert.equal(images.slice(start).filter(x=>imageId(x)==='conduit-heat-exchanger').length,1);
      const cache=renderer.rasterSpritesV116,prototype=renderer.constructor.prototype,methods=[prototype.render,prototype.box,prototype.prop];
      installRasterFurnitureV121(renderer.constructor,entries);assert.deepEqual([prototype.render,prototype.box,prototype.prop],methods);
      for(const version of [118,119,120,121]){const {extensionVersion,...status}=renderer['rasterStatusV'+version]();assert.equal(extensionVersion,version);assert.deepEqual(status,renderer.rasterStatusV116());}
      assert.equal(renderer.rasterSpritesV116,cache);
      renderer.c.calls.length=0;renderer.box(currentWorld(sessionFor('v112-conduit')).scene.solids.find(x=>x.id==='valve-plinth'),{wall:'#445544',trim:'#aabbcc',rust:'#887766'});
      assert.equal(draws(renderer).length,0);assert.equal(renderer.c.calls[0].kind,'native-box');checks++;
    }
    // Nested contexts, omitted bodies and exceptions must not leak a queued
    // valve panel into a different render; the V119/V120 decorators also run.
    {
      const world=currentWorld(sessionFor('v112-conduit')),body=world.scene.solids.find(x=>x.id==='valve-plinth'),prop=world.scene.props.find(x=>x.id==='valve-indicator');
      class MinimalRenderer{
        constructor(){this.c=recordingContext();this.fail=false;this.skip=false;}
        project(p){return {x:p.x,y:265+p.z*.86};}
        prop(p){this.c.calls.push({kind:'minimal-prop',id:p.id});}
        box(b){this.c.calls.push({kind:'minimal-box',id:b.id});}
        render(value,{nested=false}={}){if(nested)this.render({scene:{id:'unrelated',solids:[],props:[]}});if(value!==world)return 'inner';this.prop(prop,value,{});if(this.fail)throw new Error('Prepared render failure');if(!this.skip)this.box(body,{});return 'outer';}
      }
      installRasterFurnitureV119(MinimalRenderer,entries);installRasterFurnitureV120(MinimalRenderer,entries);installRasterFurnitureV121(MinimalRenderer,entries);
      const renderer=new MinimalRenderer();assert.equal(renderer.render(world,{nested:true}),'outer');
      assert.deepEqual(renderer.c.calls.filter(x=>['image','minimal-prop'].includes(x.kind)).map(x=>x.id),['conduit-valve-plinth','valve-indicator']);checks++;
      renderer.c.calls.length=0;renderer.skip=true;assert.equal(renderer.render(world),'outer');assert.deepEqual(renderer.c.calls.map(x=>x.id),['valve-indicator']);checks++;
      renderer.c.calls.length=0;renderer.fail=true;assert.throws(()=>renderer.render(world),/Prepared render failure/);renderer.box(body,{});assert.deepEqual(renderer.c.calls,[{kind:'minimal-box',id:'valve-plinth'}]);checks++;
    }
  }finally{
    if(previousImage===undefined)delete globalThis.Image;else globalThis.Image=previousImage;
    if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;
  }
  return checks;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  process.stdout.write(JSON.stringify({ok:true,unitChecks:runFurnitureUnitChecksV121(),version:121})+'\n');
}
