#!/usr/bin/env node
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Renderer as NativeRenderer} from '../modules/aliens-1986/v114/preview/renderer.mjs';
import {createSession,currentWorld} from '../modules/aliens-1986/v114/src/operation-v114.mjs';
import {ROOMS} from '../modules/aliens-1986/v114/src/operation-scenes-v114.mjs';
import {installRasterRendererV116} from '../modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {installRasterPropsV118} from '../modules/aliens-1986/v118/raster-props-v118.mjs';
import {furnitureSelectionV119,installRasterFurnitureV119} from '../modules/aliens-1986/v119/raster-furniture-v119.mjs';

function frozen(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(frozen);Object.freeze(value);
  }
  return value;
}
const FIXTURES=[
  ['v106-medlab','bed-west','medlab-bed',160,74,42],
  ['v106-medlab','bed-east','medlab-bed',145,82,42],
  ['v106-medlab','med-cabinet','medlab-storage-cabinet',94,83,124],
  ['v109-reserve','service-locker','reserve-service-locker',110,91,128],
  ['v107-operations','ops-rack','operations-storage-rack',133,75,126],
  ['v114-sulaco-mess','v114-sulaco-mess-body-0','sulaco-mess-table',238,85,49],
  ['v107-operations','ops-table','operations-command-table',238,93,49],
];
const FURNITURE_IDS=[...new Set(FIXTURES.map(item=>item[2]))];
const ALL_IDS=[...FURNITURE_IDS,'meal-tray-food','combat-knife','operations-table-terminal',
  'sulaco-briefing-terminal','service-control-pedestal','medical-counter-terminal',
  'operations-console','newt-idle-right'];
const entry=(id)=>({id,path:'assets/test/'+id+'.png',width:1000,height:700,
  bbox:[20,20,980,680],pivot:[500,680],runtimeEligible:true});
const imageId=image=>image.src.split('/').at(-1).replace(/\.png$/,'');
const draws=renderer=>renderer.c.calls.filter(call=>call.kind==='image');

// Recording Canvas and synchronous/pending Image doubles. The real V114
// renderer, real scene definitions, V116 cache, V118 props and V119 extension
// execute here; this is a behavioral suite, not a pixel or browser assertion.
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
    drawImage(image,...args){calls.push({kind:'image',id:imageId(image),args,transform:[...transform],alpha:this.globalAlpha});},
    fillText(text,...args){calls.push({kind:'text',text,args});},
    measureText(text){return {width:String(text).length*6};},
    createLinearGradient(){return {addColorStop(){}};},
    createRadialGradient(){return {addColorStop(){}};},
    getStackDepth(){return stack.length;}
  };
  return new Proxy(object,{get(target,key){return key in target?target[key]:()=>{};}});
}

export function runFurnitureUnitChecksV119() {
  let checks=0;
  const oldImage=globalThis.Image,oldDocument=globalThis.document;
  const images=[],modes=new Map();
  const entries=ALL_IDS.map(entry);
  const makeSession=room=>createSession({mode:'inspection',roomId:room});
  function makeRenderer(selectedEntries=entries,{install=true}={}) {
    class Renderer extends NativeRenderer {
      box(body,palette){this.c.calls.push({kind:'native-box',id:body.id,alpha:this.c.globalAlpha});return super.box(body,palette);}
      prop(prop,world,palette){this.c.calls.push({kind:'native-prop',id:prop.id,alpha:this.c.globalAlpha});return super.prop(prop,world,palette);}
    }
    installRasterRendererV116(Renderer,selectedEntries);
    installRasterPropsV118(Renderer,selectedEntries);
    if(install)installRasterFurnitureV119(Renderer,selectedEntries);
    const c=recordingContext(),canvas={getContext:()=>c,width:0,height:0};
    const renderer=new Renderer(canvas);renderer.reducedMotion=true;
    return renderer;
  }
  function render(renderer,session) {
    renderer.c.calls.length=0;
    renderer.render(currentWorld(session),{session});
    assert.equal(renderer.c.getStackDepth(),0);
    return draws(renderer);
  }
  try {
    globalThis.document={baseURI:'https://example.invalid/dlc/aliens-1986/game.html'};
    globalThis.Image=class {
      constructor(){this.naturalWidth=1000;this.naturalHeight=700;this.complete=false;images.push(this);}
      set src(value){
        this._src=value;
        const mode=modes.get(imageId(this));
        if(mode==='pending')return;
        if(mode==='error'){this.onerror();return;}
        if(mode==='wrong-size')this.naturalHeight=699;
        this.onload();
      }
      get src(){return this._src;}
    };

    // Native scenes, rather than reduced copies, independently identify every
    // admitted object and ensure no unrelated box enters the allowlist.
    let selected=0;
    for(const scene of ROOMS)for(const body of scene.solids) {
      const expected=FIXTURES.find(item=>item[0]===scene.id&&item[1]===body.id);
      const result=furnitureSelectionV119(body,{scene});
      if(!expected){assert.equal(result,null,scene.id+'/'+body.id);continue;}
      const [room,id,asset,width,depth,height]=expected;
      assert.deepEqual([scene.id,body.id,body.w,body.d,body.h],[room,id,width,depth,height]);
      assert.deepEqual(result,{id:asset,width,height:height+depth*.86});selected++;
    }
    assert.equal(selected,7);checks++;

    // Real rendering order, native transforms and immutable worlds across
    // all four affected rooms. Original props and physical footprints remain.
    for(const room of new Set(FIXTURES.map(item=>item[0]))) {
      const session=frozen(makeSession(room)),world=currentWorld(session),renderer=makeRenderer();
      const before=JSON.stringify(session),output=render(renderer,session);
      const expected=FIXTURES.filter(item=>item[0]===room);
      assert.equal(output.filter(call=>FURNITURE_IDS.includes(call.id)).length,expected.length);
      for(const [,bodyId,id,width,depth,height] of expected) {
        const body=world.scene.solids.find(item=>item.id===bodyId);
        const x=body.x+body.w/2-renderer.camera,y=265+(body.z+body.d)*.86;
        const call=output.find(item=>item.id===id&&Math.abs(item.transform[4]-x)<1e-8);
        assert.ok(call,room+'/'+bodyId+' draws its own image');
        assert.deepEqual(call.transform,[1,0,0,1,x,y]);
        const scale=Math.min(width/960,(height+depth*.86)/660);
        assert.ok(Math.abs(call.args[6]-960*scale)<1e-8);
        assert.ok(Math.abs(call.args[7]-660*scale)<1e-8);
        assert.ok(Math.abs(call.args[6]/960-call.args[7]/660)<1e-12,'Scale is uniform');
        assert.equal(renderer.c.calls.some(item=>item.kind==='native-box'&&item.id===bodyId),false);
        checks++;
      }
      assert.equal(JSON.stringify(session),before,'Rendering must not mutate simulation/save state');
      assert.ok(renderer.c.calls.some(item=>item.kind==='native-box'),'Unrelated structural boxes still use V114');
      checks++;
    }

    // Reproduce the actual old ordering, then check that only the supported
    // table attachments move after their own surface at the same x/z/elevation.
    for(const [room,bodyId,asset,props] of [
      ['v114-sulaco-mess','v114-sulaco-mess-body-0','sulaco-mess-table',[
        ['v114-sulaco-mess-prop-0','meal-tray-food'],['v114-sulaco-mess-prop-1','combat-knife']]],
      ['v107-operations','ops-table','operations-command-table',[['ops-screen','operations-table-terminal']]],
    ]) {
      const session=frozen(makeSession(room)),world=currentWorld(session),prior=makeRenderer(entries,{install:false}),next=makeRenderer();
      render(prior,session);render(next,session);
      const nativeIndex=prior.c.calls.findIndex(item=>item.kind==='native-box'&&item.id===bodyId);
      const furnitureIndex=next.c.calls.findIndex(item=>item.kind==='image'&&item.id===asset);
      for(const [propId,propAsset] of props) {
        const oldIndex=prior.c.calls.findIndex(item=>item.kind==='image'&&item.id===propAsset);
        const newIndex=next.c.calls.findIndex(item=>item.kind==='image'&&item.id===propAsset);
        assert.ok(oldIndex>=0&&oldIndex<nativeIndex,'Baseline actually draws the prop before its support');
        assert.ok(newIndex>furnitureIndex,'New surface is drawn before its attachment');
        assert.equal(next.c.calls.filter(item=>item.kind==='image'&&item.id===propAsset).length,1);
        const prop=world.scene.props.find(item=>item.id===propId),call=next.c.calls[newIndex];
        assert.deepEqual(call.transform,[1,0,0,1,prop.x-next.camera,265+prop.z*.86-prop.elevation]);
        assert.equal(call.alpha,1);checks++;
      }
      const oldOther=prior.c.calls.filter(item=>item.kind==='image'&&!props.some(pair=>pair[1]===item.id));
      const newOther=next.c.calls.filter(item=>item.kind==='image'&&!FURNITURE_IDS.includes(item.id)&&!props.some(pair=>pair[1]===item.id));
      assert.deepEqual(newOther,oldOther,'Unrelated raster props retain their order and draw geometry');checks++;
    }

    // A person behind the table uses the existing body fade. The complete
    // supported assembly shares it; opaque attachments do not cover the person.
    {
      const session=makeSession('v107-operations'),player=session.team[0];
      player.x=500;player.z=70; // Explicit prepared presentation fixture.
      const renderer=makeRenderer();render(renderer,frozen(session));
      assert.equal(draws(renderer).find(item=>item.id==='operations-command-table').alpha,.23);
      assert.equal(draws(renderer).find(item=>item.id==='operations-table-terminal').alpha,.23);checks++;
    }

    // Different geometry/material, unknown or duplicate bodies and noncanonical
    // detached objects keep their native renderer even if their names collide.
    for(const mutate of [
      (body,scene)=>{body.w++;},(body,scene)=>{body.h++;},(body,scene)=>{body.d++;},
      (body,scene)=>{body.material='glass';},(body,scene)=>{body.visual='other-presentation';},
      (body,scene)=>{scene.id='another-room';},(body,scene)=>{scene.solids.push({...body});},
      (body,scene)=>{body.x=NaN;},
    ]) {
      const scene=structuredClone(ROOMS.find(item=>item.id==='v107-operations')),body=scene.solids.find(item=>item.id==='ops-table');
      mutate(body,scene);assert.equal(furnitureSelectionV119(body,{scene}),null);checks++;
    }
    {
      const scene=ROOMS.find(item=>item.id==='v107-operations'),body=scene.solids.find(item=>item.id==='ops-table');
      assert.equal(furnitureSelectionV119({...body},{scene}),null);
      assert.equal(furnitureSelectionV119(null,{scene}),null);
      assert.equal(furnitureSelectionV119(body,null),null);checks++;
    }

    // Missing and failed images preserve the existing box and prop drawing
    // order. Loading once cannot create a repeated request on every frame.
    for(const mode of ['pending','error','wrong-size','absent']) {
      const id='operations-command-table',session=frozen(makeSession('v107-operations'));
      if(mode!=='absent')modes.set(id,mode);
      const selectedEntries=mode==='absent'?entries.filter(item=>item.id!==id):entries;
      const renderer=makeRenderer(selectedEntries),start=images.length;
      render(renderer,session);render(renderer,session);
      assert.equal(draws(renderer).filter(item=>item.id===id).length,0);
      const boxIndex=renderer.c.calls.findIndex(item=>item.kind==='native-box'&&item.id==='ops-table');
      const propIndex=renderer.c.calls.findIndex(item=>item.kind==='image'&&item.id==='operations-table-terminal');
      assert.ok(propIndex>=0&&boxIndex>propIndex);
      const requested=images.slice(start).filter(image=>imageId(image)===id);
      assert.equal(requested.length,mode==='absent'?0:1);
      if(mode==='pending') {
        requested[0].onload();render(renderer,session);
        const tableIndex=renderer.c.calls.findIndex(item=>item.kind==='image'&&item.id===id);
        const readyPropIndex=renderer.c.calls.findIndex(item=>item.kind==='image'&&item.id==='operations-table-terminal');
        assert.ok(tableIndex>=0&&readyPropIndex>tableIndex);
      }
      modes.delete(id);checks++;
    }

    // Different support type, elevation or coordinates must not be queued merely
    // because its id resembles one of the three known table attachments.
    for(const mutate of [
      prop=>{prop.type='crate';},prop=>{prop.supportId='ops-rack';},
      prop=>{prop.elevation=999;},prop=>{prop.x=900;},prop=>{prop.z=300;},
      prop=>{prop.bodyId='ops-table';},prop=>{prop.id='unknown-table-prop';},
    ]) {
      const session=makeSession('v107-operations'),world=currentWorld(session),prop=world.scene.props.find(item=>item.id==='ops-screen');
      mutate(prop);
      const renderer=makeRenderer(),prior=makeRenderer(entries,{install:false});
      render(prior,frozen(session));render(renderer,session);
      const tableIndex=renderer.c.calls.findIndex(item=>item.kind==='image'&&item.id==='operations-command-table');
      const relevant=calls=>calls.filter(item=>item.kind==='native-prop'||item.kind==='image'&&!FURNITURE_IDS.includes(item.id));
      assert.ok(tableIndex>=0);
      assert.deepEqual(relevant(renderer.c.calls),relevant(prior.c.calls),'Invalid support leaves old prop order and geometry unchanged');
      assert.equal(renderer.c.getStackDepth(),0);checks++;
    }

    // One shared bounded cache services every installed presentation layer;
    // reinstalling the extension is inert and direct box calls stay native.
    {
      const session=frozen(makeSession('v107-operations')),renderer=makeRenderer();render(renderer,session);
      const shared=renderer.rasterSpritesV116,proto=renderer.constructor.prototype;
      const methods=[proto.render,proto.box,proto.prop];
      installRasterFurnitureV119(renderer.constructor,entries);
      assert.deepEqual([proto.render,proto.box,proto.prop],methods);
      const {extensionVersion,...status}=renderer.rasterStatusV119();
      assert.equal(extensionVersion,119);assert.deepEqual(status,renderer.rasterStatusV116());
      assert.equal(renderer.rasterSpritesV116,shared);
      renderer.c.calls.length=0;
      renderer.box(currentWorld(session).scene.solids.find(item=>item.id==='ops-table'),{wall:'#445544',trim:'#aabbcc',rust:'#887766'});
      assert.equal(draws(renderer).length,0);assert.equal(renderer.c.calls[0].kind,'native-box');checks++;
    }

    // Context survives nested render calls and is always removed after an
    // exception. A later direct box call must not inherit the previous room.
    {
      const world=currentWorld(makeSession('v107-operations')),table=world.scene.solids.find(item=>item.id==='ops-table'),prop=world.scene.props.find(item=>item.id==='ops-screen');
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
          if(!this.skip)this.box(table,{});
          return 'outer';
        }
      }
      installRasterFurnitureV119(MinimalRenderer,entries);
      const renderer=new MinimalRenderer();
      assert.equal(renderer.render(world,{nested:true}),'outer');
      assert.deepEqual(renderer.c.calls.filter(item=>['minimal-prop','image'].includes(item.kind)).map(item=>item.id),['operations-command-table','ops-screen']);checks++;
      renderer.c.calls.length=0;renderer.skip=true;
      assert.equal(renderer.render(world),'outer');
      assert.deepEqual(renderer.c.calls.map(item=>item.id),['ops-screen']);checks++;
      renderer.c.calls.length=0;renderer.fail=true;
      assert.throws(()=>renderer.render(world),/Prepared renderer failure/);
      renderer.box(table,{});
      assert.deepEqual(renderer.c.calls,[{kind:'minimal-box',id:'ops-table'}]);checks++;
    }
  } finally {
    if(oldImage===undefined)delete globalThis.Image;else globalThis.Image=oldImage;
    if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
  }
  return checks;
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  process.stdout.write(JSON.stringify({ok:true,unitChecks:runFurnitureUnitChecksV119(),version:119})+'\n');
}
