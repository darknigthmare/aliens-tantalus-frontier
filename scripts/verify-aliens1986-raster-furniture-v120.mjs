#!/usr/bin/env node
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Renderer as NativeRenderer} from '../modules/aliens-1986/v114/preview/renderer.mjs';
import {createSession,currentWorld} from '../modules/aliens-1986/v114/src/operation-v114.mjs';
import {ROOMS} from '../modules/aliens-1986/v114/src/operation-scenes-v114.mjs';
import {installRasterRendererV116} from '../modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {installRasterPropsV118} from '../modules/aliens-1986/v118/raster-props-v118.mjs';
import {installRasterFurnitureV119} from '../modules/aliens-1986/v119/raster-furniture-v119.mjs';
import {furnitureSelectionV120,installRasterFurnitureV120} from '../modules/aliens-1986/v120/raster-furniture-v120.mjs';

function frozen(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(frozen);Object.freeze(value);
  }
  return value;
}
const FIXTURES=[
  ['v109-reserve','medical-counter','reserve-medical-counter',188,90,67],
  ['v109-reserve','reserve-cabinet','utility-storage-cabinet',157,67,119],
  ['v112-workshop','optics-bench','optics-workbench',184,83,65],
  ['v112-workshop','optics-cabinet','utility-storage-cabinet',136,65,98],
  ['v106-hadley','service-rack','operations-storage-rack',94,62,130],
  ['v107-operations','ops-display','operations-display-bank',174,71,103],
];
const LEGACY_FIXTURES=[
  ['v106-medlab','bed-west','medlab-bed'],['v106-medlab','bed-east','medlab-bed'],
  ['v106-medlab','med-cabinet','medlab-storage-cabinet'],
  ['v109-reserve','service-locker','reserve-service-locker'],
  ['v107-operations','ops-rack','operations-storage-rack'],
  ['v107-operations','ops-table','operations-command-table'],
  ['v114-sulaco-mess','v114-sulaco-mess-body-0','sulaco-mess-table'],
];
const SUPPORTS=[
  ['v109-reserve','medical-counter','reserve-medical-counter','reserve-monitor','medical-counter-terminal'],
  ['v112-workshop','optics-bench','optics-workbench','optics-console','optics-calibration-terminal'],
];
const ALL_IDS=[...new Set([...FIXTURES.map(item=>item[2]),...LEGACY_FIXTURES.map(item=>item[2]),
  'meal-tray-food','combat-knife','operations-table-terminal','sulaco-briefing-terminal',
  'service-control-pedestal','medical-counter-terminal','optics-calibration-terminal',
  'operations-console','newt-idle-right'])];
const entry=id=>({
  id,path:'assets/test/'+id+'.png',width:1000,height:700,
  bbox:[20,20,980,680],pivot:[500,680],runtimeEligible:true,
  // Preserve the reused rack's measured shape in its independent test factory.
  ...(id==='operations-storage-rack'?{width:948,height:1659,bbox:[12,9,936,1648],pivot:[474,1648]}:{}),
});
const imageId=image=>image.src.split('/').at(-1).replace(/\.png$/,'');
const draws=renderer=>renderer.c.calls.filter(call=>call.kind==='image');
function matchesPlacement(call,fixture,world,camera) {
  if(call.kind!=='image'||fixture[0]!==world.scene.id||call.id!==fixture[2])return false;
  const body=world.scene.solids.find(item=>item.id===fixture[1]);
  return !!body&&Math.abs(call.transform[4]-(body.x+body.w/2-camera))<1e-8&&
    Math.abs(call.transform[5]-(265+(body.z+body.d)*.86))<1e-8;
}
const isV120Draw=(call,world,camera)=>FIXTURES.some(fixture=>matchesPlacement(call,fixture,world,camera));

// Recording doubles for pixels and loading only. The actual V114 Renderer,
// real inspection sessions and all four presentation layers execute unchanged.
// These checks do not claim browser execution or an image-quality assessment.
function recordingContext() {
  const calls=[],stack=[];
  let transform=[1,0,0,1,0,0];
  const object={calls,globalAlpha:1,globalCompositeOperation:'source-over',
    save(){stack.push({alpha:this.globalAlpha,composite:this.globalCompositeOperation,transform:[...transform]});},
    restore(){const prior=stack.pop();assert.ok(prior,'Canvas restore without matching save');this.globalAlpha=prior.alpha;this.globalCompositeOperation=prior.composite;transform=prior.transform;},
    setTransform(...values){transform=values;},
    translate(x,y){transform[4]+=transform[0]*x+transform[2]*y;transform[5]+=transform[1]*x+transform[3]*y;},
    scale(x,y){transform[0]*=x;transform[1]*=x;transform[2]*=y;transform[3]*=y;},
    rotate(angle){const [a,b,c,d]=transform,cos=Math.cos(angle),sin=Math.sin(angle);transform[0]=a*cos+c*sin;transform[1]=b*cos+d*sin;transform[2]=c*cos-a*sin;transform[3]=d*cos-b*sin;},
    drawImage(image,...args){
      if(typeof image.src==='string')calls.push({kind:'image',id:imageId(image),args,transform:[...transform],alpha:this.globalAlpha});
      else calls.push({kind:'canvas',width:image.width,height:image.height,args,transform:[...transform],alpha:this.globalAlpha});
    },
    fillText(text,...args){calls.push({kind:'text',text,args});},
    measureText(text){return {width:String(text).length*6};},
    createLinearGradient(){return {addColorStop(){}};},
    createRadialGradient(){return {addColorStop(){}};},
    getStackDepth(){return stack.length;}
  };
  return new Proxy(object,{get(target,key){return key in target?target[key]:()=>{};}});
}

export function runFurnitureUnitChecksV120() {
  let checks=0;
  const oldImage=globalThis.Image,oldDocument=globalThis.document;
  const images=[],modes=new Map(),entries=ALL_IDS.map(entry),assets=new Map(entries.map(asset=>[asset.id,asset]));
  const makeSession=room=>createSession({mode:'inspection',roomId:room});
  function makeRenderer(selectedEntries=entries,{install=true}={}) {
    class Renderer extends NativeRenderer {
      box(body,palette){this.c.calls.push({kind:'native-box',id:body.id,alpha:this.c.globalAlpha});return super.box(body,palette);}
      prop(prop,world,palette){this.c.calls.push({kind:'native-prop',id:prop.id,alpha:this.c.globalAlpha});return super.prop(prop,world,palette);}
    }
    installRasterRendererV116(Renderer,selectedEntries);
    installRasterPropsV118(Renderer,selectedEntries);
    installRasterFurnitureV119(Renderer,selectedEntries);
    if(install)installRasterFurnitureV120(Renderer,selectedEntries);
    const c=recordingContext(),canvas={getContext:()=>c,width:0,height:0};
    const renderer=new Renderer(canvas);renderer.reducedMotion=true;
    return renderer;
  }
  function render(renderer,session) {
    renderer.c.calls.length=0;
    const before=JSON.stringify(session);
    renderer.render(currentWorld(session),{session});
    assert.equal(renderer.c.getStackDepth(),0);
    assert.equal(JSON.stringify(session),before,'Rendering must not mutate simulation/save state');
    return draws(renderer);
  }
  try {
    globalThis.document={baseURI:'https://example.invalid/dlc/aliens-1986/game.html',createElement(tag){
      assert.equal(tag,'canvas');const c=recordingContext();return {width:0,height:0,getContext:()=>c};
    }};
    globalThis.Image=class {
      constructor(){this.complete=false;images.push(this);}
      set src(value){
        this._src=value;
        const asset=assets.get(imageId(this)),mode=modes.get(imageId(this));
        this.naturalWidth=asset.width;this.naturalHeight=asset.height;
        if(mode==='pending')return;
        if(mode==='error'){this.onerror();return;}
        if(mode==='wrong-size')this.naturalHeight--;
        this.onload();
      }
      get src(){return this._src;}
    };

    // Native definitions independently enumerate all six admitted bodies.
    // A shared PNG id is never permission to replace a different body.
    let selected=0;
    for(const scene of ROOMS)for(const body of scene.solids) {
      const expected=FIXTURES.find(item=>item[0]===scene.id&&item[1]===body.id);
      const result=furnitureSelectionV120(body,{scene});
      if(!expected){assert.equal(result,null,scene.id+'/'+body.id);continue;}
      const [room,id,asset,width,depth,height]=expected;
      assert.deepEqual([scene.id,body.id,body.w,body.d,body.h],[room,id,width,depth,height]);
      assert.equal(body.material,undefined);assert.equal(body.visual,undefined);
      assert.deepEqual(result,{id:asset,width,height:height+depth*.86});selected++;
    }
    assert.equal(selected,6);checks++;

    for(const room of new Set(FIXTURES.map(item=>item[0]))) {
      const session=frozen(makeSession(room)),world=currentWorld(session),renderer=makeRenderer(),output=render(renderer,session);
      const expected=FIXTURES.filter(item=>item[0]===room);
      assert.equal(output.filter(call=>isV120Draw(call,world,renderer.camera)).length,expected.length);
      for(const fixture of expected) {
        const [,bodyId,id,width,depth,height]=fixture,body=world.scene.solids.find(item=>item.id===bodyId);
        const matches=output.filter(item=>matchesPlacement(item,fixture,world,renderer.camera));
        assert.equal(matches.length,1,room+'/'+bodyId+' must draw once at its own anchor');
        const call=matches[0],asset=assets.get(id),[left,top,right,bottom]=asset.bbox,bw=right-left,bh=bottom-top;
        const scale=Math.min(width/bw,(height+depth*.86)/bh);
        assert.deepEqual(call.transform,[1,0,0,1,body.x+body.w/2-renderer.camera,265+(body.z+body.d)*.86]);
        assert.ok(Math.abs(call.args[6]-bw*scale)<1e-8);
        assert.ok(Math.abs(call.args[7]-bh*scale)<1e-8);
        assert.ok(Math.abs(call.args[6]/bw-call.args[7]/bh)<1e-12);
        assert.ok(Math.abs(call.args[4]+call.args[6]/2)<1e-8,'Front-ground pivot centered');
        assert.ok(Math.abs(call.args[5]+call.args[7])<1e-8,'Front-ground pivot on floor');
        assert.equal(renderer.c.calls.some(item=>item.kind==='native-box'&&item.id===bodyId),false);checks++;
      }
      assert.ok(renderer.c.calls.some(item=>item.kind==='native-box'),'Structural boxes remain V114');checks++;
    }

    // Demonstrate the genuine V119 baseline defect for both untouched supports.
    for(const [room,bodyId,asset,propId,propAsset] of SUPPORTS) {
      const session=frozen(makeSession(room)),world=currentWorld(session),prior=makeRenderer(entries,{install:false}),next=makeRenderer();
      render(prior,session);render(next,session);
      const nativeIndex=prior.c.calls.findIndex(item=>item.kind==='native-box'&&item.id===bodyId);
      const oldPropIndex=prior.c.calls.findIndex(item=>item.kind==='image'&&item.id===propAsset);
      const furnitureIndex=next.c.calls.findIndex(item=>item.kind==='image'&&item.id===asset);
      const newPropIndex=next.c.calls.findIndex(item=>item.kind==='image'&&item.id===propAsset);
      assert.ok(oldPropIndex>=0&&oldPropIndex<nativeIndex,'Baseline draws terminal before support');
      assert.ok(newPropIndex>furnitureIndex,'V120 draws terminal after its own surface');
      assert.equal(next.c.calls.filter(item=>item.kind==='image'&&item.id===propAsset).length,1);
      const prop=world.scene.props.find(item=>item.id===propId),call=next.c.calls[newPropIndex];
      assert.deepEqual(call.transform,[1,0,0,1,prop.x-next.camera,265+prop.z*.86-prop.elevation]);
      assert.equal(call.alpha,1);checks++;
      const oldOther=draws(prior).filter(item=>item.id!==propAsset);
      const newOther=draws(next).filter(item=>item.id!==propAsset&&!isV120Draw(item,world,next.camera));
      assert.deepEqual(newOther,oldOther,'Unrelated images keep their order and geometry');checks++;
    }

    for(const [room,bodyId,asset,,propAsset] of SUPPORTS) {
      const session=makeSession(room),body=currentWorld(session).scene.solids.find(item=>item.id===bodyId);
      session.team[0].x=body.x+body.w/2;session.team[0].z=body.z-30; // Explicit occlusion fixture.
      const renderer=makeRenderer();render(renderer,frozen(session));
      assert.equal(draws(renderer).find(item=>item.id===asset).alpha,.23);
      assert.equal(draws(renderer).find(item=>item.id===propAsset).alpha,.23);checks++;
    }

    // The seven original V119 placements and all three original table props
    // retain their image, transform and inherited alpha with V120 installed.
    for(const room of new Set(LEGACY_FIXTURES.map(item=>item[0]))) {
      const session=frozen(makeSession(room)),world=currentWorld(session),prior=makeRenderer(entries,{install:false}),next=makeRenderer();
      render(prior,session);render(next,session);
      for(const fixture of LEGACY_FIXTURES.filter(item=>item[0]===room)) {
        const previous=draws(prior).filter(item=>matchesPlacement(item,fixture,world,prior.camera));
        const current=draws(next).filter(item=>matchesPlacement(item,fixture,world,next.camera));
        assert.equal(current.length,1);assert.deepEqual(current,previous);
      }
      for(const propId of ['meal-tray-food','combat-knife','operations-table-terminal']) {
        assert.deepEqual(draws(next).filter(item=>item.id===propId),draws(prior).filter(item=>item.id===propId));
      }
      checks++;
    }

    for(const mutate of [
      body=>{body.w++;},body=>{body.h++;},body=>{body.d++;},body=>{body.material='metal';},
      body=>{body.visual='other';},body=>{body.visual=null;},body=>{body.visual=false;},
      (body,scene)=>{scene.id='another-room';},(body,scene)=>{scene.solids.push({...body});},
      body=>{body.x=NaN;},body=>{body.z=Infinity;},
    ]) {
      const scene=structuredClone(ROOMS.find(item=>item.id==='v109-reserve')),body=scene.solids.find(item=>item.id==='medical-counter');
      mutate(body,scene);assert.equal(furnitureSelectionV120(body,{scene}),null);checks++;
    }
    {
      const scene=ROOMS.find(item=>item.id==='v109-reserve'),body=scene.solids.find(item=>item.id==='medical-counter');
      assert.equal(furnitureSelectionV120({...body},{scene}),null);
      assert.equal(furnitureSelectionV120(null,{scene}),null);
      assert.equal(furnitureSelectionV120(body,null),null);checks++;
    }

    // New and reused images both retain the native path if unavailable.
    for(const [room,bodyId,id,propAsset] of [
      ['v109-reserve','medical-counter','reserve-medical-counter','medical-counter-terminal'],
      ['v106-hadley','service-rack','operations-storage-rack',null],
    ])for(const mode of ['pending','error','wrong-size','absent']) {
      const session=frozen(makeSession(room));
      if(mode!=='absent')modes.set(id,mode);
      const selectedEntries=mode==='absent'?entries.filter(item=>item.id!==id):entries;
      const renderer=makeRenderer(selectedEntries),start=images.length;
      render(renderer,session);render(renderer,session);
      assert.equal(draws(renderer).filter(item=>item.id===id).length,0);
      const boxIndex=renderer.c.calls.findIndex(item=>item.kind==='native-box'&&item.id===bodyId);
      assert.ok(boxIndex>=0);
      if(propAsset)assert.ok(renderer.c.calls.findIndex(item=>item.kind==='image'&&item.id===propAsset)<boxIndex);
      const requested=images.slice(start).filter(image=>imageId(image)===id);
      assert.equal(requested.length,mode==='absent'?0:1);
      if(mode==='pending'){
        requested[0].onload();render(renderer,session);
        const bodyIndex=renderer.c.calls.findIndex(item=>item.kind==='image'&&item.id===id);
        assert.ok(bodyIndex>=0);
        if(propAsset)assert.ok(renderer.c.calls.findIndex(item=>item.kind==='image'&&item.id===propAsset)>bodyIndex);
      }
      modes.delete(id);checks++;
    }

    for(const mutate of [
      prop=>{prop.type='crate';},prop=>{prop.supportId='reserve-cabinet';},
      prop=>{prop.elevation=999;},prop=>{prop.x=100;},prop=>{prop.z=300;},
      prop=>{prop.bodyId='medical-counter';},prop=>{prop.id='unknown-terminal';},
    ]) {
      const session=makeSession('v109-reserve'),world=currentWorld(session),prop=world.scene.props.find(item=>item.id==='reserve-monitor');
      mutate(prop);frozen(session);
      const renderer=makeRenderer(),prior=makeRenderer(entries,{install:false});
      render(prior,session);render(renderer,session);
      const relevant=(calls,camera)=>calls.filter(item=>item.kind==='native-prop'||item.kind==='image'&&!isV120Draw(item,world,camera));
      assert.deepEqual(relevant(renderer.c.calls,renderer.camera),relevant(prior.c.calls,prior.camera),'Unsupported terminal keeps its old path');checks++;
    }

    // Shared cabinet and reused rack load once across their distinct rooms.
    for(const [id,rooms] of [
      ['utility-storage-cabinet',['v109-reserve','v112-workshop']],
      ['operations-storage-rack',['v106-hadley','v107-operations']],
    ]) {
      const renderer=makeRenderer(),start=images.length;
      for(const room of rooms){render(renderer,frozen(makeSession(room)));assert.equal(draws(renderer).filter(item=>item.id===id).length,1);}
      assert.equal(images.slice(start).filter(image=>imageId(image)===id).length,1);checks++;
    }

    {
      const renderer=makeRenderer(),session=frozen(makeSession('v109-reserve'));render(renderer,session);
      const shared=renderer.rasterSpritesV116,proto=renderer.constructor.prototype,methods=[proto.render,proto.box,proto.prop];
      installRasterFurnitureV120(renderer.constructor,entries);
      assert.deepEqual([proto.render,proto.box,proto.prop],methods);
      for(const version of [118,119,120]){
        const {extensionVersion,...status}=renderer['rasterStatusV'+version]();
        assert.equal(extensionVersion,version);assert.deepEqual(status,renderer.rasterStatusV116());
      }
      assert.equal(renderer.rasterSpritesV116,shared);
      renderer.c.calls.length=0;
      renderer.box(currentWorld(session).scene.solids.find(item=>item.id==='medical-counter'),{wall:'#445544',trim:'#aabbcc',rust:'#887766'});
      assert.equal(draws(renderer).length,0);assert.equal(renderer.c.calls[0].kind,'native-box');checks++;
    }

    // Both extension contexts survive nested render calls and clean up on
    // exceptions. A renderer that omits a body still receives its queued prop.
    {
      const world=currentWorld(makeSession('v109-reserve')),body=world.scene.solids.find(item=>item.id==='medical-counter'),prop=world.scene.props.find(item=>item.id==='reserve-monitor');
      class MinimalRenderer {
        constructor(){this.c=recordingContext();this.fail=false;this.skip=false;}
        project(point){return {x:point.x,y:265+point.z*.86};}
        prop(item){this.c.calls.push({kind:'minimal-prop',id:item.id});}
        box(item){this.c.calls.push({kind:'minimal-box',id:item.id});}
        render(value,{nested=false}={}){
          if(nested)this.render({scene:{id:'unrelated',solids:[],props:[]}});
          if(value!==world)return 'inner';
          this.prop(prop,value,{});
          if(this.fail)throw new Error('Prepared renderer failure');
          if(!this.skip)this.box(body,{});
          return 'outer';
        }
      }
      installRasterFurnitureV119(MinimalRenderer,entries);installRasterFurnitureV120(MinimalRenderer,entries);
      const renderer=new MinimalRenderer();
      assert.equal(renderer.render(world,{nested:true}),'outer');
      assert.deepEqual(renderer.c.calls.filter(item=>['minimal-prop','image'].includes(item.kind)).map(item=>item.id),['reserve-medical-counter','reserve-monitor']);checks++;
      renderer.c.calls.length=0;renderer.skip=true;
      assert.equal(renderer.render(world),'outer');assert.deepEqual(renderer.c.calls.map(item=>item.id),['reserve-monitor']);checks++;
      renderer.c.calls.length=0;renderer.fail=true;
      assert.throws(()=>renderer.render(world),/Prepared renderer failure/);
      renderer.box(body,{});
      assert.deepEqual(renderer.c.calls,[{kind:'minimal-box',id:'medical-counter'}]);checks++;
    }
  } finally {
    if(oldImage===undefined)delete globalThis.Image;else globalThis.Image=oldImage;
    if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
  }
  return checks;
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  process.stdout.write(JSON.stringify({ok:true,unitChecks:runFurnitureUnitChecksV120(),version:120})+'\n');
}
