#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {creatureAssetIdV116,installRasterRendererV116} from '../modules/aliens-1986/v116/raster-renderer-v116.mjs';
import {installRasterPropsV118,sentrySelectionV118} from '../modules/aliens-1986/v118/raster-props-v118.mjs';

const directions=[
  [0,'sentry-idle-right',false],[1,'sentry-aim-front-right',false],
  [2,'sentry-aim-front',false],[3,'sentry-aim-front-right',true],
  [4,'sentry-idle-right',true],[5,'sentry-aim-rear-right',true],
  [6,'sentry-aim-rear',false],[7,'sentry-aim-rear-right',false],
];
function context() {
  const calls=[],stack=[];
  return {calls,globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},
    translate(...args){calls.push(['translate',...args]);},scale(...args){calls.push(['scale',...args]);},
    drawImage(...args){calls.push(['drawImage',...args]);},fillText(){},
    beginPath(){},ellipse(){},fill(){},stroke(){},arc(){}};
}
const drawn=renderer=>renderer.c.calls.filter(call=>call[0]==='drawImage');
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

/** Exercises the historical selectors and loader against the actual V123
 * catalog. Browser QA separately verifies decoded native pixels and V114 draws. */
export async function runDirectionalUnitChecksV123({root=process.cwd()}={}) {
  const manifests=await Promise.all(Array.from({length:8},(_,i)=>readFile(resolve(root,`docs/development/aliens-1986-sprites-v${116+i}/manifest.json`),'utf8').then(JSON.parse)));
  const entries=manifests.flatMap(manifest=>manifest.assets),assets=new Map(entries.map(asset=>[asset.id,asset])),byPath=new Map(entries.map(asset=>[asset.path,asset]));
  const priorImage=globalThis.Image,priorDocument=globalThis.document,modes=new Map(),images=[];
  const world={scene:{id:'v106-sentry',solids:[]},actors:[],time:0,circuits:{},doors:{}};
  const sentry={id:'sentry-a',role:'sentry',kind:'ally',alive:true,x:500,z:220,ammo:100};
  const warrior={id:'fixture-warrior',role:'warrior',kind:'enemy',alive:true,x:500,z:220,facing:1,phase:'idle',route:[{x:600,z:220}]};
  let checks=0;
  function renderer(selected=entries) {
    class FixtureRenderer {
      constructor(){this.c=context();this.session={engineering:{attacks:{}}};this.fallbackActors=0;}
      project(point){return {x:point.x-70,y:265+point.z*.86};}
      actor(){this.fallbackActors++;}
      prop(){}
      door(){}
    }
    installRasterRendererV116(FixtureRenderer,selected);installRasterPropsV118(FixtureRenderer,selected);
    return new FixtureRenderer();
  }
  try {
    // Opaque image doubles preserve historical unmeasured manifest bounds.
    // The browser receipt measures the actual historical and new PNG alpha.
    globalThis.document={baseURI:'https://example.invalid/dlc/aliens-1986/game.html',createElement(){
      return {width:1,height:1,getContext(){return {drawImage(){},getImageData(_x,_y,width,height){
        return {data:new Uint8ClampedArray(width*height*4).fill(255)};
      }};}};
    }};
    globalThis.Image=class {
      set src(value){
        this._src=value;images.push(this);
        const asset=byPath.get(new URL(value).pathname.slice(1)),mode=modes.get(asset.id);
        this.naturalWidth=asset.width;this.naturalHeight=asset.height;
        if(mode==='pending')return;
        if(mode==='error'){this.onerror();return;}
        if(mode==='wrong-size')this.naturalWidth--;
        this.onload();
      }
      get src(){return this._src;}
    };
    const subject=renderer();
    for(const [sector,id,flip] of directions) {
      subject.session={tactics:{sentries:{'sentry-a':{angle:sector*Math.PI/4}}}};subject.c.calls.length=0;
      const before=JSON.stringify({sentry,world,session:subject.session});
      assert.equal(sentrySelectionV118(sentry,subject.session).id,id);subject.actor(sentry,world);
      const calls=drawn(subject),asset=assets.get(id);assert.equal(calls.length,1);
      assert.ok(calls[0][1].src.endsWith('/'+asset.path));assert.equal(subject.fallbackActors,0);
      assert.equal(subject.c.calls.some(call=>call[0]==='scale'&&call[1]===-1),flip);
      assert.deepEqual(calls[0].slice(2,6),[asset.bbox[0],asset.bbox[1],asset.bbox[2]-asset.bbox[0],asset.bbox[3]-asset.bbox[1]]);
      close(calls[0][9],75);close(calls[0][8]/calls[0][9],(asset.bbox[2]-asset.bbox[0])/(asset.bbox[3]-asset.bbox[1]));
      assert.equal(JSON.stringify({sentry,world,session:subject.session}),before);checks++;
    }
    subject.session={tactics:{sentries:{'sentry-a':{angle:0}}},action:{kind:'sentry-orient',id:'sentry-a',angle:Math.PI,elapsed:.5,duration:1}};
    subject.c.calls.length=0;subject.actor(sentry,world);assert.ok(drawn(subject)[0][1].src.endsWith('/sentry-aim-front.png'));checks++;

    for(const [changes,expected] of [
      [{},'warrior-walk-right'],[{facing:-1},'warrior-walk-right'],
      [{route:[]},'warrior-idle-right'],[{phase:'windup'},'warrior-attack-right'],
      [{alive:false},'warrior-death-right'],
    ]) {
      const actor={...warrior,...changes},before=JSON.stringify({actor,world});
      subject.session={engineering:{attacks:{}}};subject.c.calls.length=0;
      assert.equal(creatureAssetIdV116(subject.rasterSpritesV116,actor),expected);subject.actor(actor,world);
      const call=drawn(subject)[0],asset=assets.get(expected),base=assets.get('warrior-idle-right');
      assert.ok(call[1].src.endsWith('/'+asset.path));assert.equal(subject.fallbackActors,0);
      const scale=118/(base.bbox[3]-base.bbox[1])*Math.max(base.width,base.height)/Math.max(asset.width,asset.height);
      close(call[8],(asset.bbox[2]-asset.bbox[0])*scale);close(call[9],(asset.bbox[3]-asset.bbox[1])*scale);
      assert.equal(subject.c.calls.some(c=>c[0]==='scale'&&c[1]===-1),actor.facing<0);
      assert.equal(JSON.stringify({actor,world}),before);checks++;
    }
    for(const [id,actor,session] of [
      ['sentry-aim-front',sentry,{tactics:{sentries:{'sentry-a':{angle:Math.PI/2}}}}],
      ['warrior-walk-right',warrior,{engineering:{attacks:{}}}],
    ]) {
      for(const mode of ['pending','error','wrong-size']) {
        modes.set(id,mode);const delayed=renderer(),start=images.length;delayed.session=session;
        delayed.actor(actor,world);delayed.actor(actor,world);
        assert.equal(delayed.fallbackActors,2);assert.equal(drawn(delayed).length,0);assert.equal(images.length,start+1);
        if(mode==='pending') {
          images[start].onload();delayed.actor(actor,world);
          assert.equal(drawn(delayed).length,1);assert.equal(delayed.fallbackActors,2);
        } else assert.equal(delayed.rasterStatusV116().failed,1);
        modes.delete(id);checks++;
      }
    }
    const historical=renderer(entries.slice(0,164));historical.session={tactics:{sentries:{'sentry-a':{angle:Math.PI/2}}}};
    historical.actor(sentry,world);assert.equal(historical.fallbackActors,1);assert.equal(drawn(historical).length,0);checks++;
    historical.session={engineering:{attacks:{}}};historical.actor(warrior,world);
    assert.ok(drawn(historical)[0][1].src.endsWith('/'+assets.get('warrior-idle-right').path));checks++;
  } finally {
    if(priorImage===undefined)delete globalThis.Image;else globalThis.Image=priorImage;
    if(priorDocument===undefined)delete globalThis.document;else globalThis.document=priorDocument;
  }
  return checks;
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  process.stdout.write(JSON.stringify({ok:true,unitChecks:await runDirectionalUnitChecksV123(),version:123})+'\n');
}
