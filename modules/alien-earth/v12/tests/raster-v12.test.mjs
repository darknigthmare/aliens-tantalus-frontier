import test, {afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {EARTH_DATA} from '../src/alien-earth-data.js';
import {EarthEngine,blocked,newState} from '../src/alien-earth-core.js';
import {EarthRenderer} from '../src/alien-earth-renderer.js';
import {drawReferenceHumanV10,drawReferenceWeaponV10} from '../src/alien-earth-reference-art-v10.js';
import {drawReferenceHumanV11,drawReferenceWeaponV11,drawReferenceBackdropV11} from '../src/alien-earth-reference-art-v11.js';
import {
  EARTH_RASTER_ASSETS_V12 as ASSETS,EARTH_RASTER_PROP_OVERRIDES_V12 as OVERRIDES,
  resolveEarthRasterURLV12,preloadEarthRasterV12,getEarthRasterDiagnosticsV12,resetEarthRasterV12,
  getEarthRasterPlacementV12,getEarthRasterPropPlanV12,getEarthRasterBackdropPlanV12,
  selectEarthRasterHumanV12,selectEarthRasterCreatureV12,selectEarthRasterPropV12,
  isEarthRasterActionActiveV12,getEarthRasterPreviewPoseV12,
  drawEarthRasterHumanV12,drawEarthRasterCreatureV12,drawEarthRasterPropV12,drawEarthRasterBackdropV12
} from '../src/alien-earth-raster-v12.js';

const BASE='https://example.invalid/dlc/alien-earth/v12/index.html';
const room=EARTH_DATA.rooms.find(r=>r.id==='R18');
const diagnostic=id=>getEarthRasterDiagnosticsV12().assets.find(a=>a.id===id);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
afterEach(()=>resetEarthRasterV12());

// Real loader with an explicit Image double: completion, decode failure and
// dimensions are controlled independently. No network or DOM is simulated as
// a browser acceptance test; Chromium separately verifies actual PNG decoding.
function imageEnvironment(mode='loading'){
  const images=[],events=[];
  class ImageDouble{
    constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;images.push(this);}
    set src(value){
      this.url=value;this.id=value.split('/').at(-1).replace(/\.png$/,'');
      if(mode==='ready')this.finish();
      if(mode==='error')this.fail();
      if(mode==='wrong-size')this.finish(1,1);
    }
    finish(width=ASSETS[this.id].width,height=ASSETS[this.id].height){this.naturalWidth=width;this.naturalHeight=height;this.complete=true;this.onload?.();}
    fail(){this.complete=true;this.naturalWidth=0;this.naturalHeight=0;this.onerror?.();}
  }
  resetEarthRasterV12({ImageCtor:ImageDouble,baseURI:BASE,inline:{},notify:event=>events.push(event)});
  return {images,events};
}

// Canvas trace implements state and affine transforms, rather than treating
// save/restore/scale as no-ops. The production renderer runs on this context.
function canvasTrace({rejectImage=false}={}){
  const calls=[],stack=[];
  let state={globalAlpha:1,fillStyle:'#000',strokeStyle:'#000',lineWidth:1,globalCompositeOperation:'source-over',matrix:[1,0,0,1,0,0]};
  const record=(name,args)=>calls.push({name,args,alpha:state.globalAlpha,fill:state.fillStyle,stroke:state.strokeStyle,matrix:[...state.matrix]});
  const multiply=([aa,bb,cc,dd,ee,ff])=>{
    const [a,b,c,d,e,f]=state.matrix;
    state.matrix=[a*aa+c*bb,b*aa+d*bb,a*cc+c*dd,b*cc+d*dd,a*ee+c*ff+e,b*ee+d*ff+f];
  };
  const methods={
    save(){stack.push({...state,matrix:[...state.matrix]});record('save',[]);},
    restore(){assert.ok(stack.length,'unbalanced canvas restore');state=stack.pop();record('restore',[]);},
    translate(x,y){record('translate',[x,y]);multiply([1,0,0,1,x,y]);},
    scale(x,y){record('scale',[x,y]);multiply([x,0,0,y,0,0]);},
    rotate(a){record('rotate',[a]);multiply([Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]);},
    transform(...m){record('transform',m);multiply(m);},
    setTransform(...m){state.matrix=m;record('setTransform',m);},
    resetTransform(){state.matrix=[1,0,0,1,0,0];},
    drawImage(...args){if(rejectImage){record('drawImageRejected',args);throw new Error('decode/draw rejected');}record('drawImage',args);},
    createLinearGradient(){return {addColorStop(){}};},
    createRadialGradient(){return {addColorStop(){}};},
    measureText(text){return {width:String(text).length*6};},
    getLineDash(){return [];}
  };
  const c=new Proxy(methods,{
    get(target,key){if(key in target)return target[key];if(key in state)return state[key];return (...args)=>record(key,args);},
    set(target,key,value){state[key]=value;return true;}
  });
  return {c,calls,images:()=>calls.filter(call=>call.name==='drawImage'),depth:()=>stack.length};
}
const rendererFor=trace=>new EarthRenderer({getContext:()=>trace.c});
const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};

test('raster module imports with DOM and Image access forbidden',()=>{
  const url=new URL('../src/alien-earth-raster-v12.js',import.meta.url).href;
  const code=`for(const key of ['document','Image'])Object.defineProperty(globalThis,key,{get(){throw new Error('top-level '+key);}});await import(${JSON.stringify(url)});console.log('dom-free');`;
  const run=spawnSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.match(run.stdout,/dom-free/);
});

test('every admitted PNG matches the independent manifest IDs, bytes and dimensions',()=>{
  const manifest=JSON.parse(readFileSync(new URL('../../../../docs/development/alien-earth-v12/manifest.json',import.meta.url)));
  assert.deepEqual(Object.keys(ASSETS).sort(),manifest.assets.map(asset=>asset.id).sort());
  for(const asset of Object.values(ASSETS)){
    const original=manifest.assets.find(a=>a.id===asset.id);assert.ok(original,asset.id);
    const bytes=readFileSync(new URL('../'+asset.path,import.meta.url));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16),asset.width);assert.equal(bytes.readUInt32BE(20),asset.height);
    assert.equal(bytes[24],8);assert.equal(bytes[25],6);
    assert.equal(bytes.length,original.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),original.sha256);
    assert.equal(asset.exact,false);assert.ok(Object.isFrozen(asset)&&Object.isFrozen(asset.source)&&Object.isFrozen(asset.pivot));
    const [x,y,w,h]=asset.source,[bx,by,bw,bh]=asset.bounds;
    assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=asset.width&&y+h<=asset.height,asset.id);
    assert.ok(x<=bx&&y<=by&&x+w>=bx+bw&&y+h>=by+bh,asset.id+' clipped visible content');
  }
});

test('relative URLs follow the document location and standalone inline data takes precedence',()=>{
  assert.equal(resolveEarthRasterURLV12('mcsx',{baseURI:BASE}),'https://example.invalid/dlc/alien-earth/v12/assets/raster-v12/mcsx.png');
  const inline='data:image/png;base64,aGVsbG8=';
  assert.equal(resolveEarthRasterURLV12('mcsx',{baseURI:'file:///offline/game.html',inline:{[ASSETS.mcsx.path]:inline}}),inline);
  assert.equal(resolveEarthRasterURLV12('mcsx',{baseURI:'invalid'}),null);
  for(const id of ['absent','constructor','__proto__'])assert.equal(resolveEarthRasterURLV12(id,{baseURI:BASE}),null);
});

test('missing browser image facilities preserve the real V10 weapon drawing',()=>{
  resetEarthRasterV12({ImageCtor:null,baseURI:BASE,inline:{}});
  const trace=canvasTrace();drawReferenceWeaponV10(trace.c,20,30,'mcsx');
  assert.equal(trace.images().length,0);assert.ok(trace.calls.some(c=>c.name==='roundRect'));
  assert.equal(diagnostic('mcsx').status,'unavailable');assert.equal(trace.depth(),0);
});

test('loading images fall back until their completion event, without duplicate requests',()=>{
  const env=imageEnvironment(),loading=canvasTrace();
  drawReferenceWeaponV10(loading.c,20,30,'mcsx');drawReferenceWeaponV10(loading.c,20,30,'mcsx');
  assert.equal(env.images.length,1);assert.equal(loading.images().length,0);assert.ok(loading.calls.some(c=>c.name==='roundRect'));
  assert.equal(diagnostic('mcsx').status,'loading');
  env.images[0].finish();const ready=canvasTrace();drawReferenceWeaponV10(ready.c,20,30,'mcsx');
  assert.equal(ready.images().length,1);assert.equal(ready.calls.some(c=>c.name==='roundRect'),false);
  assert.deepEqual(env.events,[{id:'mcsx',status:'ready',error:null}]);assert.equal(ready.depth(),0);
});

for(const mode of ['error','wrong-size'])test(mode+' PNG keeps the real V11 weapon fallback and caches the failure',()=>{
  const env=imageEnvironment(mode),trace=canvasTrace();
  drawReferenceWeaponV11(trace.c,0,0,'mcsx');drawReferenceWeaponV11(trace.c,0,0,'mcsx');
  assert.equal(trace.images().length,0);assert.ok(trace.calls.some(c=>c.name==='roundRect'));
  assert.equal(env.images.length,1);assert.equal(diagnostic('mcsx').status,'error');
  assert.equal(diagnostic('mcsx').error,mode==='error'?'image-load-failed':'unexpected-image-dimensions');assert.equal(trace.depth(),0);
});

test('drawImage rejection restores Canvas state and resumes the historical drawing',()=>{
  imageEnvironment('ready');const trace=canvasTrace({rejectImage:true});trace.c.globalAlpha=.34;
  drawReferenceWeaponV11(trace.c,71,84,'mcsx');
  assert.ok(trace.calls.some(c=>c.name==='drawImageRejected'));assert.ok(trace.calls.some(c=>c.name==='roundRect'));
  assert.equal(trace.c.globalAlpha,.34);assert.equal(trace.depth(),0);
  assert.equal(diagnostic('mcsx').error,'image-draw-failed');assert.equal(diagnostic('mcsx').draws,0);
});

test('preload reports all assets once and stale callbacks cannot corrupt a new loader',()=>{
  const count=Object.keys(ASSETS).length,old=imageEnvironment();preloadEarthRasterV12();preloadEarthRasterV12();assert.equal(old.images.length,count);
  const current=imageEnvironment('ready');preloadEarthRasterV12();old.images[0].fail();
  assert.equal(old.events.length,0);assert.equal(current.images.length,count);assert.equal(current.events.length,count);
  assert.ok(getEarthRasterDiagnosticsV12().assets.every(a=>a.status==='ready'));
  const copy=getEarthRasterDiagnosticsV12();copy.assets[0].status='forged';assert.equal(diagnostic(copy.assets[0].id).status,'ready');
});

test('cropped placement preserves uniform scale and maps the measured pivot to the same point when mirrored',()=>{
  imageEnvironment('ready');
  for(const facing of [-1,1]){
    const trace=canvasTrace();assert.equal(drawEarthRasterHumanV12(trace.c,153,507,'joe',{weapon:'mcsx',scale:.9,facing}),true);
    const draw=trace.images()[0],asset=ASSETS['joe-mcsx-idle'],p=diagnostic(asset.id).lastDraw;
    assert.equal(draw.args.length,9);assert.deepEqual(draw.args.slice(1,5),asset.source);
    close(p.width/p.sourceWidth,p.height/p.sourceHeight);close(p.visibleHeight,122*.9);
    const px=p.offsetX+(p.pivotX-p.sourceX)*p.factor,py=p.offsetY+(p.pivotY-p.sourceY)*p.factor;
    close(draw.matrix[0]*px+draw.matrix[2]*py+draw.matrix[4],153);
    close(draw.matrix[1]*px+draw.matrix[3]*py+draw.matrix[5],507);
    close(p.offsetY+(asset.bounds[1]+asset.bounds[3]-p.sourceY)*p.factor,0);
    assert.equal(trace.depth(),0);
  }
  for(const options of [{maxWidth:0},{maxWidth:NaN,maxHeight:10},{maxHeight:10,scale:-1},{maxHeight:10,facing:0},{maxHeight:10,x:Infinity}])assert.equal(getEarthRasterPlacementV12('mcsx',options),null);
  assert.equal(getEarthRasterPlacementV12('constructor',{maxHeight:10}),null);
});

test('idle Joe is one complete sprite with no second weapon, including V11 delegation',()=>{
  imageEnvironment('ready');const trace=canvasTrace();drawReferenceHumanV11(trace.c,150,500,'joe',{weapon:'mcsx',chapter:1});
  assert.deepEqual(trace.images().map(c=>c.args[0].id),['joe-mcsx-idle']);
  assert.equal(diagnostic('mcsx').draws,0);assert.equal(trace.depth(),0);
});

test('V10 hands and moving Joe keep their body animation while using the MCS-X weapon hook',()=>{
  imageEnvironment('ready');
  for(const draw of [drawReferenceHumanV10,drawReferenceHumanV11]){
    const trace=canvasTrace();draw(trace.c,150,500,'joe',{weapon:'mcsx',chapter:1,moving:true,time:.13});
    assert.deepEqual(trace.images().map(c=>c.args[0].id),['mcsx']);assert.ok(trace.calls.some(c=>c.name==='lineTo'));
    assert.equal(trace.depth(),0);
  }
});

test('Joe pose, costume and secondary-weapon exclusions use the actual vector fallback',()=>{
  imageEnvironment('ready');
  const cases=[
    [{crouching:true},['mcsx']],[{lowPassage:true},[]],[{carrying:true},[]],
    [{chapter:6},['mcsx']],[{weapon:'maxim9'},[]],[{weapon:'none'},[]],[{raster:false},['mcsx']],[{acting:true},['mcsx']]
  ];
  for(const [change,images] of cases){
    const pose={weapon:'mcsx',chapter:1,...change},trace=canvasTrace();
    assert.equal(selectEarthRasterHumanV12('joe',pose),null);drawReferenceHumanV11(trace.c,0,0,'joe',pose);
    assert.deepEqual(trace.images().map(c=>c.args[0].id),images);assert.ok(trace.calls.some(c=>c.name==='roundRect'));
    assert.equal(trace.depth(),0);
  }
});

test('Arthur has a healthy idle sprite and preserves the existing moving and armed poses',()=>{
  imageEnvironment('ready');const idle=canvasTrace();drawReferenceHumanV11(idle.c,0,0,'arthur',{weapon:'none'});
  assert.deepEqual(idle.images().map(c=>c.args[0].id),['arthur-idle']);
  for(const pose of [{moving:true},{crouching:true},{lowPassage:true},{carrying:true},{raster:false},{weapon:'mcsx'}]){
    assert.equal(selectEarthRasterHumanV12('arthur',pose),null);
  }
});

test('Wendy rescue costume is admitted only in its chapter, empty-handed and at rest',()=>{
  imageEnvironment('ready');
  const pose={chapter:2,weapon:'none',initial:false};
  const trace=canvasTrace();drawReferenceHumanV11(trace.c,150,500,'wendy',pose);
  assert.deepEqual(trace.images().map(c=>c.args[0].id),['wendy-idle']);
  for(const change of [{chapter:0},{chapter:1},{chapter:3},{initial:true},{weapon:'cutter'},{weapon:'cutter',cutterIntact:false},{moving:true},{acting:true},{crouching:true},{carrying:true},{lowPassage:true}]){
    const next={...pose,...change},fallback=canvasTrace();assert.equal(selectEarthRasterHumanV12('wendy',next),null);
    drawReferenceHumanV11(fallback.c,0,0,'wendy',next);assert.equal(fallback.images().length,0);assert.ok(fallback.calls.some(c=>c.name==='roundRect'));
  }
});

test('catalogue rescue preview selects a compatible pose without overriding gameplay defaults',()=>{
  for(const role of ['wendy','curly','nibs']){
    const pose=getEarthRasterPreviewPoseV12(role);assert.equal(pose.chapter,2);assert.equal(pose.weapon,'none');
    assert.equal(selectEarthRasterHumanV12(role,pose),role+'-idle');assert.equal(selectEarthRasterHumanV12(role,{chapter:0,weapon:'none'}),null);
    pose.chapter=0;assert.equal(getEarthRasterPreviewPoseV12(role).chapter,2);
  }
  for(const role of ['joe','arthur','kirsh','unknown'])assert.equal(getEarthRasterPreviewPoseV12(role),null);
});

test('Kirsh, Curly and Nibs use distinct ready sprites only for compatible idle costumes',()=>{
  imageEnvironment('ready');
  for(const role of ['kirsh','curly','nibs']){
    const pose={chapter:2,weapon:'none'},trace=canvasTrace();drawReferenceHumanV11(trace.c,150,500,role,pose);
    assert.deepEqual(trace.images().map(c=>c.args[0].id),[role+'-idle']);assert.equal(trace.depth(),0);
    for(const change of [{moving:true},{acting:true},{crouching:true},{lowPassage:true},{carrying:true},{weapon:'mcsx'},{raster:false}])assert.equal(selectEarthRasterHumanV12(role,{...pose,...change}),null);
  }
  for(const chapter of [0,1,3,4,5,6,7])for(const role of ['curly','nibs'])assert.equal(selectEarthRasterHumanV12(role,{chapter,weapon:'none'}),null);
  assert.equal(selectEarthRasterHumanV12('kirsh',{chapter:0,weapon:'none'}),'kirsh-idle');
});

test('Nibs keeps the rescue palette in loading and moving fallbacks without recoloring other chapters',()=>{
  resetEarthRasterV12({ImageCtor:null,baseURI:BASE,inline:{}});
  for(const moving of [false,true]){
    const trace=canvasTrace();drawReferenceHumanV11(trace.c,0,0,'nibs',{chapter:2,weapon:'none',moving});
    assert.ok(trace.calls.some(c=>c.name==='roundRect'&&c.args[0]===-18&&c.args[1]===-87&&c.fill==='#7b8280'));
  }
  const original=canvasTrace();drawReferenceHumanV11(original.c,0,0,'nibs',{chapter:0,weapon:'none',moving:true});
  assert.ok(original.calls.some(c=>c.name==='roundRect'&&c.args[0]===-18&&c.args[1]===-87&&c.fill==='#795947'));
});

test('actual rescue player reaches Wendy idle and falls back during actions or a selected cutter',()=>{
  imageEnvironment('ready');const state=newState();state.chapter=2;state.room='R09';state.visited=['R09'];
  state.completed=EARTH_DATA.chapters.slice(0,2).flatMap(c=>c.goals);
  const engine=new EarthEngine(state),draw=()=>{const trace=canvasTrace();rendererFor(trace).draw(engine,0);return trace;};
  assert.equal(engine.character.id,'wendy');assert.equal(engine.weaponId,'none');
  assert.equal(draw().images().filter(c=>c.args[0].id==='wendy-idle').length,1);
  engine.fireCooldown=.2;assert.equal(draw().images().filter(c=>c.args[0].id==='wendy-idle').length,0);
  engine.fireCooldown=0;engine.gear.observedCutter=true;engine.state.completed.push('AE-58');engine.gear.selected='cutter';
  assert.equal(engine.weaponId,'cutter');const cutter=draw();assert.equal(cutter.images().filter(c=>c.args[0].id==='wendy-idle').length,0);
  assert.ok(cutter.calls.some(c=>c.name==='lineTo'&&c.args[0]===43&&c.args[1]===-99),'visible cutter was masked');
  assert.equal(isEarthRasterActionActiveV12({}),false);
  for(const active of [{hold:{}},{serviceAction:{}},{actionV3:{}},{reloadTime:.1},{fireCooldown:.1},{effects:[{kind:'resonance'}]}])assert.equal(isEarthRasterActionActiveV12(active),true);
});

test('prop admission is exactly the eight existing Zoo IDs, never a generic type replacement',()=>{
  const selected=EARTH_DATA.rooms.flatMap(r=>r.props.filter(p=>selectEarthRasterPropV12(p,r)).map(p=>p.id));
  assert.deepEqual(selected.sort(),['R18-0','R18-4','R18-island','R18-wall0','R18-wall1','R18-wall2','R18-wall3','R18-wall4'].sort());
  const prop=room.props.find(p=>p.id==='R18-0');
  assert.equal(selectEarthRasterPropV12(prop,{...room,id:'R17'}),null);
  assert.equal(selectEarthRasterPropV12(prop,{...room,props:[]}),null);
  assert.equal(selectEarthRasterPropV12({...prop,type:'cargo'},room),null);
  assert.equal(selectEarthRasterPropV12({type:'console',x:490,w:40},room),null);
  assert.equal(selectEarthRasterPropV12({id:'constructor',type:'cryo'},room),null);
});

test('real prop renderer retains depth, occlusion, full supports and all collision answers',()=>{
  imageEnvironment('ready');const frozenRoom=freeze(structuredClone(room)),before=JSON.stringify(frozenRoom);
  const points=[];for(let x=60;x<room.width;x+=43)for(let z=25;z<=225;z+=25)points.push([x,z]);
  const collisions=points.map(([x,z])=>blocked(frozenRoom,x,z));
  for(const id of Object.keys(OVERRIDES)){
    const prop=frozenRoom.props.find(p=>p.id===id),trace=canvasTrace(),renderer=rendererFor(trace);
    renderer.camera=prop.x-300;const engine=freeze({room:frozenRoom,player:{x:prop.x+prop.w/2,z:-1},powered:true});
    renderer.prop(prop,engine);
    assert.equal(trace.images().length,prop.type==='cryo'?3:id==='R18-island'?2:1,id);
    assert.ok(trace.images().every(c=>c.alpha===.34),id+' lost occlusion');
    assert.equal(trace.c.globalAlpha,1);assert.equal(trace.depth(),0);
    const plan=getEarthRasterPropPlanV12(prop,frozenRoom,{x:300,y:renderer.foot(prop.z)});
    assert.ok(trace.calls.some(c=>c.name==='fillRect'&&c.args.every((value,i)=>value===[plan.support.x,plan.support.y,plan.support.w,plan.support.h][i])),id+' support missing');
    if(prop.type==='wall-panel')assert.equal(trace.images()[0].matrix[5],267);
    else if(prop.type==='wall-light')assert.equal(trace.images()[0].matrix[5],245);
    else{close(plan.support.y,renderer.foot(prop.z)-prop.h);close(plan.support.h,prop.h+prop.d*.9);assert.equal(plan.support.w,prop.w);}
  }
  assert.equal(JSON.stringify(frozenRoom),before);
  assert.deepEqual(points.map(([x,z])=>blocked(frozenRoom,x,z)),collisions);
});

test('a corrupt or pending prop PNG leaves the historical prop silhouette and no raster support',()=>{
  const prop=room.props.find(p=>p.id==='R18-0');
  const render=()=>{const trace=canvasTrace();rendererFor(trace).prop(prop,{room,player:{x:0,z:125},powered:true});return trace;};
  resetEarthRasterV12({ImageCtor:null,baseURI:BASE,inline:{}});const baseline=render().calls;
  for(const mode of ['loading','error','wrong-size']){
    imageEnvironment(mode);const trace=render();assert.equal(trace.images().length,0);assert.deepEqual(trace.calls,baseline,mode);assert.equal(trace.depth(),0);
  }
});

test('Zoo cabinet occupies a clear wall band and its backdrop hook cannot add a collider',()=>{
  imageEnvironment('ready');const frozenRoom=freeze(structuredClone(room)),before=JSON.stringify(frozenRoom);
  const plan=getEarthRasterBackdropPlanV12(frozenRoom,40),trace=canvasTrace();
  assert.ok(plan.support.y>214&&plan.support.y+plan.support.h<304);assert.ok(plan.support.x+40>=400&&plan.support.x+plan.support.w+40<=500);
  drawReferenceBackdropV11({c:trace.c,camera:40},{room:frozenRoom});
  assert.deepEqual(trace.images().map(c=>c.args[0].id),['zoo-cabinet']);assert.equal(trace.images()[0].matrix[4],410);
  assert.equal(drawEarthRasterBackdropV12(trace.c,{...frozenRoom,id:'R17'},40),false);
  assert.equal(getEarthRasterBackdropPlanV12({...frozenRoom,setDressing:'cryo'},40),null);
  assert.equal(JSON.stringify(frozenRoom),before);assert.equal(trace.depth(),0);
});

test('Zoo lamp swaps real lit/unlit PNGs at the same wall anchor and removes the glow without power',()=>{
  imageEnvironment('ready');const prop=room.props.find(p=>p.id==='R18-wall0');
  const lit=canvasTrace(),renderer=rendererFor(lit);renderer.prop(prop,{room,player:{x:0,z:125},powered:true});
  assert.deepEqual(lit.images().map(c=>c.args[0].id),['zoo-wall-light']);
  const placement=diagnostic('zoo-wall-light').lastDraw;close(placement.visibleWidth,52);
  const visibleCenter=placement.y+placement.offsetY+(ASSETS['zoo-wall-light'].bounds[1]-placement.sourceY+ASSETS['zoo-wall-light'].bounds[3]/2)*placement.factor;
  assert.ok(Math.abs(visibleCenter-233)<2,'lamp moved away from its original wall center');
  const dark=canvasTrace();rendererFor(dark).prop(prop,{room,player:{x:0,z:125},powered:false});
  assert.deepEqual(dark.images().map(c=>c.args[0].id),['zoo-wall-light-off']);assert.equal(dark.depth(),0);
  const off=diagnostic('zoo-wall-light-off').lastDraw;close(off.x,placement.x);close(off.y,placement.y);close(off.visibleWidth,placement.visibleWidth);
  assert.ok(Math.abs(off.visibleHeight-placement.visibleHeight)<.1);
  assert.equal(dark.calls.some(c=>c.name==='fillRect'&&c.args[1]===175&&c.args[3]===160),false,'unlit lamp retained the halo');
});

test('an unavailable unlit lamp falls back to the unlit Canvas, never to the ready lit PNG',()=>{
  const env=imageEnvironment();preloadEarthRasterV12();env.images.find(i=>i.id==='zoo-wall-light').finish();
  const prop=room.props.find(p=>p.id==='R18-wall0'),render=()=>{const trace=canvasTrace();rendererFor(trace).prop(prop,{room,player:{x:0,z:125},powered:false});return trace;};
  const loading=render();assert.equal(loading.images().length,0);assert.ok(loading.calls.some(c=>c.name==='roundRect'&&c.fill==='#304846'));
  env.images.find(i=>i.id==='zoo-wall-light-off').fail();const failed=render();assert.equal(failed.images().length,0);
  assert.equal(diagnostic('zoo-wall-light').draws,0);assert.equal(failed.depth(),0);
});

test('native R18 actually draws the unlit variant while keeping its real power and world state unchanged',()=>{
  imageEnvironment('ready');const state=newState();state.chapter=4;state.room='R18';state.visited=['R18'];state.completed=EARTH_DATA.chapters.slice(0,4).flatMap(c=>c.goals);
  const engine=new EarthEngine(state),before=JSON.stringify(engine.state),trace=canvasTrace();assert.equal(engine.powered,false);
  rendererFor(trace).draw(engine,0);
  assert.ok(trace.images().some(c=>c.args[0].id==='zoo-wall-light-off'));
  assert.equal(trace.images().some(c=>c.args[0].id==='zoo-wall-light'),false);
  assert.equal(engine.powered,false);assert.equal(JSON.stringify(engine.state),before);assert.equal(trace.depth(),0);
});

test('pipette stand rests on the actual table surface, inherits occlusion and cannot outlive a failed table',()=>{
  const prop=room.props.find(p=>p.id==='R18-island'),y=411+prop.z*1.08;
  imageEnvironment('ready');const trace=canvasTrace();rendererFor(trace).prop(prop,{room,player:{x:700,z:50},powered:true});
  assert.deepEqual(trace.images().map(c=>c.args[0].id),['zoo-lab-table','zoo-pipette']);
  assert.ok(trace.images().every(c=>c.alpha===.34));
  const table=diagnostic('zoo-lab-table').lastDraw,detail=diagnostic('zoo-pipette').lastDraw;
  const pixelX=table.pivotX+(detail.x-table.x)/table.factor,pixelY=table.pivotY+(detail.y-table.y)/table.factor;
  assert.ok(pixelX>200&&pixelX<1570&&pixelY>146&&pixelY<300,'stand is outside the stainless tabletop');
  close(detail.offsetY+(ASSETS['zoo-pipette'].bounds[1]+ASSETS['zoo-pipette'].bounds[3]-detail.sourceY)*detail.factor,0);
  const shifted=getEarthRasterPropPlanV12(prop,room,{x:prop.x-300,y}).details[0];close(shifted.x,detail.x-300);close(shifted.y,detail.y);
  const pending=imageEnvironment();preloadEarthRasterV12();pending.images.find(i=>i.id==='zoo-pipette').finish();
  const noTable=canvasTrace();rendererFor(noTable).prop(prop,{room,player:{x:0,z:125},powered:true});assert.equal(noTable.images().length,0);
  pending.images.find(i=>i.id==='zoo-lab-table').fail();const failed=canvasTrace();rendererFor(failed).prop(prop,{room,player:{x:0,z:125},powered:true});assert.equal(failed.images().length,0);
  const missingDetail=imageEnvironment();preloadEarthRasterV12();missingDetail.images.find(i=>i.id==='zoo-lab-table').finish();missingDetail.images.find(i=>i.id==='zoo-pipette').fail();
  const tableOnly=canvasTrace();rendererFor(tableOnly).prop(prop,{room,player:{x:0,z:125},powered:true});assert.deepEqual(tableOnly.images().map(c=>c.args[0].id),['zoo-lab-table']);
});

test('Zoo room sign stays readable above both the rack and cabinet without moving any world object',()=>{
  imageEnvironment('ready');const state=newState();state.chapter=4;state.room='R18';state.visited=['R18'];state.completed=EARTH_DATA.chapters.slice(0,4).flatMap(c=>c.goals);
  const engine=new EarthEngine(state),before=JSON.stringify(engine.room),trace=canvasTrace();rendererFor(trace).backdrop(engine);
  const label=trace.calls.find(c=>c.name==='fillText'&&c.args[0]===room.title.toUpperCase());assert.ok(label);assert.equal(label.args[2],193);
  assert.ok(trace.calls.some(c=>c.name==='roundRect'&&c.args[0]===230&&c.args[1]===146&&c.args[2]===230&&c.args[3]===68));
  assert.equal(JSON.stringify(engine.room),before);
});

test('the real full renderer keeps infected Arthur vectorial and tick telegraph, foam and stun overlays',()=>{
  imageEnvironment('ready');const engine=new EarthEngine();
  engine.enemies=[
    {id:'qa-tick',kind:'tick',x:500,z:125,hp:80,mode:'windup',facing:-1,stun:1,target:{x:120,z:125}},
    {id:'qa-eye',kind:'eye_host',x:650,z:125,hp:80,mode:'observing',facing:1,stun:0}
  ];
  engine.gear.foamUntil['qa-tick']=engine.state.playSeconds+10;
  const before=JSON.stringify(engine.state),trace=canvasTrace();rendererFor(trace).draw(engine,0);
  assert.deepEqual(trace.images().map(c=>c.args[0].id),['species19-adult']);
  assert.ok(trace.calls.some(c=>c.name==='fillText'&&c.args[0]==='!'));
  assert.ok(trace.calls.some(c=>c.name==='fillText'&&c.args[0]==='MOUSSE'));
  assert.ok(trace.calls.some(c=>c.name==='arc'&&c.args[2]===9&&c.stroke==='#92ccc5'));
  assert.ok(trace.calls.some(c=>c.name==='ellipse'&&c.args[0]===-7&&c.args[1]===-101),'infected eye overlay missing');
  assert.equal(diagnostic('arthur-idle').draws,0);assert.equal(JSON.stringify(engine.state),before);assert.equal(trace.depth(),0);
});

test('creature admission does not introduce raster xenomorphs or replace other species',()=>{
  imageEnvironment('ready');
  for(const kind of ['xeno_maginot','xeno_neverland','facehugger','fly','orchid','eye_caged','eye_host']){
    const trace=canvasTrace();assert.equal(selectEarthRasterCreatureV12({kind}),null);
    assert.equal(drawEarthRasterCreatureV12(trace.c,0,0,{kind},0,1),false);assert.equal(trace.calls.length,0);
  }
});
