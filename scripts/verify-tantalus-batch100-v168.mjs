import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { getHubRoomLifePlanV136, drawHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { HUB_ROOM_BATCH_DETAILS_V168, HUB_BATCH_SECTORS_V168,
  getHubRoomBatchDetailPlanV168, drawHubRoomBatchDetailsV168 } from '../src/hub-room-batch-details-v168.js';
import { HUB_PROP_ATLAS_V136 } from '../src/hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137 } from '../src/hub-furnishing-atlas-v137.js';

const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137.map(getHubAnnexRuntimeGeometryV139)];
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const ctx = () => {
  let depth=0;const draws=[];
  return new Proxy({draws, save(){depth++;},restore(){assert.ok(depth>0);depth--;},
    drawImage(...args){draws.push(args);},balanced(){assert.equal(depth,0);},
    measureText(text){return{width:text.length*6};}}, {get:(object,key)=>key in object?object[key]:()=>{}});
};
const images = new Map([HUB_PROP_ATLAS_V136,HUB_FURNISHING_ATLAS_V137].map(atlas => [atlas.asset,
  {complete:true,naturalWidth:atlas.width,naturalHeight:atlas.height,src:atlas.asset}]));

test('batch100 is exactly four authored25-installation sectors covering every existing ship compartment', () => {
  assert.equal(HUB_ROOM_BATCH_DETAILS_V168.length,100);
  assert.equal(new Set(HUB_ROOM_BATCH_DETAILS_V168.map(item=>item.id)).size,100);
  assert.equal(rooms.length,35);
  assert.deepEqual([...new Set(HUB_ROOM_BATCH_DETAILS_V168.map(item=>item.roomId))].sort(),rooms.map(room=>room.id).sort());
  assert.ok(new Set(HUB_ROOM_BATCH_DETAILS_V168.map(item=>item.kind)).size>=30);
  const ledger=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/batch100-v168.json',import.meta.url)));
  assert.equal(ledger.installations,100);assert.equal(ledger.rooms,35);
  assert.deepEqual(ledger.entries,HUB_ROOM_BATCH_DETAILS_V168);
  for(const entries of Object.values(HUB_BATCH_SECTORS_V168)){
    assert.equal(entries.length,25);assert.ok(new Set(entries.map(item=>item.kind)).size>=8);
    for(const item of entries){assert.equal(item.mount,'rear-wall');assert.ok(item.purpose.length>8);assert.ok(item.note.length>10);}
  }
});

test('all100 real composition placements are admitted without touching native props, clinical surfaces or route reservations', () => {
  let admitted=0;
  for(const room of rooms){
    const before=JSON.stringify(room),composition=getHubRoomLifePlanV136(room),plan=composition.batchDetailsV168;
    assert.ok(plan,room.id);assert.equal(plan.omitted.length,0,JSON.stringify(plan.omitted));
    assert.ok(plan.items.length>=2&&plan.items.length<=4,room.id);admitted+=plan.items.length;
    assert.equal(plan.projection,composition.spatial.projection.kind);
    assert.equal(plan.projectionDxPerY,composition.spatial.projection.dxPerY);
    assert.equal(plan.interactive,false);assert.equal(plan.collidable,false);
    const reserved=[...composition.spatial.reservations,...composition.items,
      ...composition.workstationDetailsV139.items.map(item=>item.target),
      ...(composition.clinicalBayV139?.parts||[]).map(part=>part.bounds),
      ...(composition.serviceDetailsV165?.items||[]).map(item=>item.clearanceBounds)].filter(Boolean);
    for(const item of plan.items){
      assert.equal(item.support,'flush-rear-wall');assert.ok(item.bounds.y+item.bounds.h<=510);
      assert.ok(reserved.every(b=>!overlap(item.clearanceBounds,b)),item.id);
      assert.ok(plan.items.every(other=>other===item||!overlap(item.clearanceBounds,other.clearanceBounds)),item.id);
    }
    assert.equal(JSON.stringify(room),before);
  }
  assert.equal(admitted,100);
});

test('the real painter draws every admitted silhouette, keeps atlas aspect and records unavailable images as pending', () => {
  let total=0,bitmapDraws=0;
  for(const room of rooms){
    const composition=getHubRoomLifePlanV136(room),canvas=ctx(),before=JSON.stringify(composition.batchDetailsV168);
    const report=drawHubRoomBatchDetailsV168(canvas,composition.batchDetailsV168,{images});
    total+=report.painted.length;assert.equal(report.pending.length,0);assert.equal(report.omitted.length,0);
    for(const draw of canvas.draws){const [,sx,sy,sw,sh,x,y,w,h]=draw;assert.ok(sx>=0&&sy>=0&&x>=0&&y>=0);
      assert.ok(Math.abs(w/sw-h/sh)<1e-10);assert.ok(w<=sw&&h<=sh);bitmapDraws++;}
    canvas.balanced();assert.equal(JSON.stringify(composition.batchDetailsV168),before);
    const empty=ctx(),missing=drawHubRoomBatchDetailsV168(empty,composition.batchDetailsV168);
    assert.equal(missing.pending.length+missing.painted.length,report.painted.length);empty.balanced();
    const actual=drawHubRoomLifeV136(ctx(),room,{images});assert.ok(actual.batchDetailsV168);
    assert.deepEqual(actual.batchDetailsV168.painted.map(item=>item.id),report.painted.map(item=>item.id));
  }
  assert.equal(total,100);assert.ok(bitmapDraws>=10);
});

test('bad wall placements and duplicate or unsupported installations are omitted explicitly without relocation', () => {
  const room=rooms.find(r=>r.id==='briefing'),composition=getHubRoomLifePlanV136(room);
  const source=HUB_ROOM_BATCH_DETAILS_V168.find(item=>item.roomId===room.id),start=composition.spatial.bounds.x;
  const reserved=composition.spatial.reservations.find(b=>b.w>40&&b.h>24);
  assert.ok(reserved);
  const variants=[{...source,id:'bad-floor',bounds:{...source.bounds,y:550}},
    {...source,id:'bad-existing',bounds:{x:reserved.x-start,y:reserved.y,w:60,h:40}},
    {...source,id:'bad-kind',kind:'unreviewed-furniture'},source,{...source}];
  const before=JSON.stringify(variants),plan=getHubRoomBatchDetailPlanV168(room,composition,{entries:variants});
  assert.equal(plan.items.length,1);assert.equal(plan.items[0].id,source.id);assert.equal(plan.omitted.length,4);
  assert.deepEqual(plan.items[0].bounds,{...source.bounds,x:start+source.bounds.x});
  assert.equal(JSON.stringify(variants),before);
});
