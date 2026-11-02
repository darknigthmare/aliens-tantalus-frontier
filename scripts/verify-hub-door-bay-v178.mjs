import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { HUB_ANNEX_ENTRANCES_V133 } from '../src/hub-navigation-layout-v133.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { getHubDoorFaceV142 } from '../src/hub-door-passage-v142.js';
import { getHubCirculationPlanV137, getHubCirculationSolidReservationsV138 } from '../src/hub-circulation-v137.js';
import { HubGame as ProductionHub } from '../src/hub-opening-v88.js';
import { createDefaultSave, migrateSave } from '../src/save.js';

// The fixture uses real production composition and physics with declared
// EventTarget/RAF/image-header/Canvas doubles; it is not Chromium or pixel QA.
const workshop = HUB_DECKS[2].rooms.find(room => room.id === 'workshop');
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-6, `${a} differs from ${b}`);
const advance = (hub,seconds,visit=()=>{}) => { for(let t=0;t<seconds-1e-9;t+=1/60){hub.update(Math.min(1/60,seconds-t));visit(hub.player);} };
function nativeHost() {
  const root = fileURLToPath(new URL('../', import.meta.url)), events = new EventTarget();
  for (const method of ['addEventListener', 'removeEventListener']) globalThis[method] = events[method].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(source) {
      this._src = source; let descriptor;
      try {
        descriptor = openSync(resolve(root, `.${new URL(source, 'http://fixture.invalid').pathname}`), 'r');
        const header = Buffer.alloc(32); readSync(descriptor, header, 0, 32, 0);
        if (header.subarray(1, 4).toString() === 'PNG') [this.naturalWidth, this.naturalHeight] = [header.readUInt32BE(16), header.readUInt32BE(20)];
        else if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8X') {
          this.naturalWidth = header.readUIntLE(24, 3) + 1; this.naturalHeight = header.readUIntLE(27, 3) + 1;
        }
      } catch {} finally { if (descriptor !== undefined) closeSync(descriptor); }
      queueMicrotask(() => { const event = new Event(this.naturalWidth ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw Error('Missing fixture image'); }
  };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false }); events.dispatchEvent(event);
  };
  return { canvas, key };
}


async function fixture(localX, y=532, resumedClimbing=false) {
  const browser=nativeHost(),raw=createDefaultSave();raw.needsPlayerCreationV84=false;
  Object.assign(raw.hub,{deck:2,roomId:'workshop',positionX:workshop.xStart+localX,positionY:y,climbing:resumedClimbing});
  const save=migrateSave(raw);
  const hub=new ProductionHub(browser.canvas,{onAction(){},onPersist(){},onStatus(){}});
  hub.start(save.hub,{routineContextV62:{save}});
  for(let i=0;i<8;i++)await Promise.resolve();
  return {...browser,hub,save};
}
function hold(subject,code,seconds){subject.key('keydown',code);advance(subject.hub,seconds);subject.key('keyup',code);advance(subject.hub,.1);}
function walk(subject,target){
  const code=target>subject.hub.player.x?'KeyD':'KeyA';subject.key('keydown',code);
  for(let step=0;step<1000&&Math.abs(target-subject.hub.player.x)>5;step++)subject.hub.update(1/60);
  subject.key('keyup',code);advance(subject.hub,.2);assert.ok(Math.abs(target-subject.hub.player.x)<30,`walk stopped at ${subject.hub.player.x}, target ${target}`);
}
function landing(hub,y){near(hub.player.y+hub.player.h,y);assert.equal(hub.player.climbing,false);assert.equal(hub.player.grounded,true);}

test('the complete paired DURANDAL doorway clears actual workshop deck collision, front steel and brackets',()=>{
  const annex=HUB_ANNEX_BY_ID_V137.durandal,entry=HUB_ANNEX_ENTRANCES_V133.durandal;
  const bounds={x:workshop.xStart+entry.centerX-annex.entrance.w/2,y:entry.bottom-annex.entrance.h,w:annex.entrance.w,h:annex.entrance.h};
  const local={x:annex.entranceLocalX-annex.entrance.w/2,y:annex.entrance.y,w:annex.entrance.w,h:annex.entrance.h};
  const before=structuredClone({annex,entry}),parentFace=getHubDoorFaceV142(bounds,local,annex.art.alphaBounds.door),localFace=getHubDoorFaceV142(local,bounds,annex.art.alphaBounds.door);
  assert.deepEqual(parentFace.pairedSize,localFace.pairedSize);near(parentFace.target.h,156);near(parentFace.target.y+parentFace.target.h,624);
  assert.ok(parentFace.opening.w>=44&&parentFace.opening.h>=92);
  const bay={x:parentFace.target.x-7,y:parentFace.target.y-7,w:parentFace.target.w+14,h:parentFace.target.h+14};
  const geometry=buildHubTraversalGeometryV87(2);
  for(const platform of geometry.platforms.filter(surface=>surface.roomId==='workshop')){
    assert.equal(overlap(platform,bay),false,platform.id+' collision crosses the whole door bay');
    const plan=getHubCirculationPlanV137(platform,{...geometry,room:workshop});
    assert.deepEqual(plan.sourceBounds,{x:platform.x,y:platform.y,w:platform.w,h:platform.h},'The painter must retain the complete live support');
    for(const steel of getHubCirculationSolidReservationsV138(platform,{...geometry,room:workshop}))
      assert.equal(overlap(steel,bay),false,platform.id+' '+steel.role+' crosses the paired face');
  }
  assert.deepEqual({annex,entry},before,'No door socket, crop, face size or pairing is changed');
});

test('a historical workshop landing pose above DURANDAL falls continuously to the real floor, without an invisible old deck',async()=>{
  const subject=await fixture(360-22,500-92),hub=subject.hub;
  try{
    near(hub.player.y+hub.player.h,500);const beforeX=hub.player.x;let previous=hub.player.y,maxStep=0;
    advance(hub,1,player=>{assert.ok(player.y>=previous-1e-6,'No upward snap is allowed');maxStep=Math.max(maxStep,player.y-previous);previous=player.y;});
    landing(hub,624);near(hub.player.x,beforeX);assert.ok(maxStep<20,'Restore must use native gravity, not a position rewrite');
    assert.equal(hub.player.w,44);assert.equal(hub.player.h,92);assert.equal(hub.player.health,100);
  }finally{hub.stop();}
});

for(const pose of [{name:'old west low deck',localX:200,y:408,climbing:false},
  {name:'old floor ladder',localX:250-22,y:460,climbing:true}]){
  test(`migrated Save at the ${pose.name} resumes at the same position and releases stale climbing through native gravity`,async()=>{
    const subject=await fixture(pose.localX,pose.y,pose.climbing),hub=subject.hub;
    try{
      near(hub.player.x,workshop.xStart+pose.localX);near(hub.player.y,pose.y);
      assert.equal(hub.player.climbing,false);assert.equal(hub.player.grounded,false);
      const before={x:hub.player.x,resources:structuredClone(subject.save.galaxy.resources),clock:structuredClone(subject.save.clock)};
      let previous=hub.player.y,maxStep=0;
      advance(hub,1,player=>{near(player.x,before.x);assert.equal(player.climbing,false);assert.ok(player.y>=previous-1e-6);
        maxStep=Math.max(maxStep,player.y-previous);previous=player.y;});
      landing(hub,624);assert.ok(maxStep<20,'No instant move to the replacement ladder or floor is allowed');
      assert.deepEqual(subject.save.galaxy.resources,before.resources);assert.deepEqual(subject.save.clock,before.clock);
    }finally{hub.stop();}
  });
}

test('native workshop controls climb both connected service decks, approach the retained vent, return and traverse DURANDAL both ways',async()=>{
  const subject=await fixture(360-22),hub=subject.hub,resources=structuredClone(subject.save.galaxy.resources);
  const geometry=buildHubTraversalGeometryV87(2),low=geometry.platforms.find(p=>p.id==='workshop-low'),high=geometry.platforms.find(p=>p.id==='workshop-high');
  const floor=geometry.ladders.find(l=>l.id==='workshop-floor'),tier=geometry.ladders.find(l=>l.id==='workshop-tier'),vent=geometry.vents.find(v=>v.id==='workshop-vent');
  try{
    walk(subject,floor.x-22);hold(subject,'KeyW',1.2);landing(hub,low.y);
    walk(subject,tier.x-22);hold(subject,'KeyW',1.2);landing(hub,high.y);
    // Standing bodies stop at the solid hatch edge. Its real C approach is
    // reachable; this route does not claim to enter the separate duct level.
    walk(subject,vent.x-hub.player.w-2);landing(hub,high.y);assert.equal(hub.nearbyCrawlVentV138()?.id,vent.id);
    walk(subject,tier.x-22);hold(subject,'KeyS',1.2);landing(hub,low.y);
    walk(subject,floor.x-22);hold(subject,'KeyS',1.2);landing(hub,624);
    walk(subject,workshop.xStart+360-22);landing(hub,624);assert.equal(hub.nearestParentAnnexDoorV71()?.annexId,'durandal');
    const origin={x:hub.player.x,y:hub.player.y},pair=hub.hubDoorPairV142(HUB_ANNEX_BY_ID_V137.durandal);
    const sourceOffset=origin.x+hub.player.w/2-(pair.parent.opening.x+pair.parent.opening.w/2);
    subject.key('keydown','KeyE');subject.key('keyup','KeyE');advance(hub,1.2);assert.equal(hub.currentAnnexV71()?.id,'durandal');landing(hub,624);
    const arrived=hub.player.x+hub.player.w/2-(pair.local.opening.x+pair.local.opening.w/2);
    near(arrived,sourceOffset);
    subject.key('keydown','KeyE');subject.key('keyup','KeyE');advance(hub,1.2);assert.equal(hub.currentAnnexV71(),null);landing(hub,624);
    near(hub.player.x,origin.x);near(hub.player.y,origin.y);assert.deepEqual(subject.save.galaxy.resources,resources);assert.equal(hub.player.health,100);
  }finally{hub.stop();}
});
