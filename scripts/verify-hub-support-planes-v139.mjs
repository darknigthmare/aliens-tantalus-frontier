import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS } from '../src/hub-game.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubSupportPlanesV139, getHubLadderMountV139 } from '../src/hub-support-planes-v139.js';
import { getHubSpatialPlanV136, hubSpatialPlacementClearV136, drawHubSpatialLadderV136 } from '../src/hub-spatial-design-v136.js';
import { getHubInteractionPropBoundsV136 } from '../src/hub-prop-placements-v136.js';
import { getHubCirculationPlanV137, getHubCirculationSolidReservationsV138,
  drawHubCirculationV137, withHubCirculationV137 } from '../src/hub-circulation-v137.js';
import { getHubFrontFasciaV139, drawHubAuthoredLayerV133,
  withHubAuthoredCompositionV133 } from '../src/hub-authored-composition-v133.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);
const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137.map(room => ({ ...room, xStart: 0 }))];
function routes() {
  return [...HUB_DECKS.flatMap((deck, index) => {
    const geometry = buildHubTraversalGeometryV87(index);
    return geometry.platforms.map(platform => ({ platform, options: {
      ...geometry, room: deck.rooms.find(room => room.id === platform.roomId)
    } }));
  }), ...HUB_ANNEXES_V137.flatMap(annex => annex.platforms.filter(platform => platform.role !== 'floor')
    .map(platform => ({ platform, options: { room: { ...annex, xStart: 0 }, ladders: annex.ladders, centeredLadders: false } })))];
}
function canvas() {
  let depth = 0;
  const painted = [];
  const ctx = new Proxy({
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    fillRect(...bounds) { painted.push({ kind: 'fill', color: ctx.fillStyle, bounds }); },
    stroke() { painted.push({ kind: 'stroke', color: ctx.strokeStyle }); },
    drawImage() { painted.push({ kind: 'image' }); }
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  return { ctx, painted, balanced: () => assert.equal(depth, 0) };
}

test('34 whole frontal rooms and the one depth maintenance corridor share actual support lines without mixing presentation within a room', () => {
  assert.equal(rooms.length, 35);
  let frontal = 0, oblique = 0;
  for (const room of rooms) {
    const before = structuredClone(room), support = getHubSupportPlanesV139(room), spatial = getHubSpatialPlanV136(room);
    const depth = support.presentationMode === '2.5d' ? 24 : 0;
    depth ? oblique++ : frontal++;
    assert.equal(support.walkY, room.world?.floorY || 624);
    assert.equal(support.rearServiceY, support.walkY - depth);
    assert.equal(support.serviceDepthY, -depth); near(support.serviceDepthX, -depth * 19 / 12);
    assert.equal(spatial.planes.rearServiceY, support.rearServiceY);
    assert.equal(spatial.projection.dxPerY, depth ? 19 / 12 : 0);
    const disabled = getHubSpatialPlanV136(room, { depthEnabled: false });
    assert.equal(disabled.planes.rearServiceY, support.rearServiceY,'F7 must not move physical service groups');
    assert.deepEqual(disabled.projection,spatial.projection,'F7 must not convert only part of a room');
    const disabledSupport=getHubSupportPlanesV139(room,{depthEnabled:false});
    assert.equal(disabledSupport.deckDepth,support.deckDepth);assert.equal(disabledSupport.projectionDxPerY,support.projectionDxPerY);
    assert.deepEqual(room, before);
  }
  assert.equal(frontal, 34); assert.equal(oblique, 1);
  assert.equal(getHubSupportPlanesV139({ id: 'bridge', world: { floorY: 818 } }).rearServiceY, 818);
  assert.equal(getHubSupportPlanesV139({ id: 'maintenance-spine', world: { floorY: 818 } }).rearServiceY, 794);
});

test('all 45 native upper supports keep real feet on their back edge and extrude toward the visible floor', () => {
  const all = routes(); assert.equal(all.length, 45);
  for (const { platform, options } of all) {
    const before = structuredClone({ platform, options }), plan = getHubCirculationPlanV137(platform, options);
    assert.deepEqual(plan.supportLine, { from: [platform.x, platform.y], to: [platform.x + platform.w, platform.y], edge: 'native-rear-edge' });
    assert.equal(plan.footY, platform.y); assert.equal(plan.railY, platform.y);
    assert.equal(plan.depthY, plan.presentationMode === '2.5d' ? 8 : 0);
    if (plan.depthY) near(plan.depthDx / plan.depthY, 19 / 12); else assert.equal(plan.depthDx, 0);
    assert.ok(plan.topSurface.every(point => point[1] >= platform.y));
    for (const face of plan.frontFaces) {
      assert.equal(face.y + face.h, platform.y + platform.h);
      for (const opening of plan.openings) assert.ok(face.x + face.w - plan.depthDx <= opening.left + 1e-8
        || face.x - plan.depthDx >= opening.right - 1e-8, platform.id + ': front lip blocks a real ladder opening');
      for (const opening of plan.openings) if (opening.center >= platform.x + 22 && opening.center <= platform.x + platform.w - 22)
        assert.ok(face.x + face.w <= opening.center - 22 + 1e-8 || face.x >= opening.center + 22 - 1e-8,
          platform.id + ': extrusion hides the native adult at the ladder arrival');
    }
    assert.deepEqual({ platform, options }, before);
  }
});

test('rear wall consoles and every front lip stay outside the real ladder apertures', () => {
  for (const { platform, options } of routes()) {
    const plan = getHubCirculationPlanV137(platform, options);
    for (const opening of plan.openings) for (const support of plan.supports)
      assert.ok(support.x + 14 <= opening.left || support.x - 9 >= opening.right, platform.id + ': console crosses ladder bay');
    const reservations = getHubCirculationSolidReservationsV138(platform, options);
    assert.ok(reservations.every(bounds => bounds.y >= platform.y));
    assert.equal(reservations.filter(bounds => bounds.role === 'native-deck-face').length, plan.frontFaces.length);
  }
});

test('actual wrapper rendering puts rails before the actor and only interrupted front faces after the actor', () => {
  const subject = canvas(), geometry = buildHubTraversalGeometryV87(0), platform = geometry.platforms[0];
  class Base { drawPlayer() { subject.painted.push({ kind: 'actor' }); return 'native-actor'; } }
  const engine = new (withHubCirculationV137(Base))();
  Object.assign(engine, { state: { deck: 0 }, v51Platforms: [platform], v51Ladders: geometry.ladders, v51Vents: geometry.vents,
    player: { x: 158, y: 408, w: 44, h: 92 }, save: { positionX: 158, positionY: 408 } });
  const before = structuredClone(engine);
  engine.drawTraversalPlatform(subject.ctx, platform);
  assert.ok(subject.painted.some(paint => paint.kind === 'stroke' && paint.color === '#3c565a'));
  assert.ok(subject.painted.some(paint => paint.color === '#536d70'
    && paint.bounds.join(',') === [platform.x,platform.y,platform.w,1].join(',')));
  assert.ok(!subject.painted.some(paint => paint.color === '#23373d'));
  assert.equal(engine.drawPlayer(subject.ctx), 'native-actor');
  const actorIndex = subject.painted.findIndex(paint => paint.kind === 'actor');
  assert.ok(subject.painted.slice(actorIndex + 1).some(paint => paint.color === '#23373d'));
  assert.ok(!subject.painted.slice(actorIndex + 1).some(paint => paint.color === '#3c565a'));
  assert.deepEqual({ ...engine }, before); subject.balanced();
});

test('the two authored service-console fits clear their actual adult worktops without shrinking equipment or closing ladder bays',()=>{
  const all=routes();
  for(const id of ['briefing-low','lab-low']){
    const {platform,options}=all.find(entry=>entry.platform.id===id),plan=getHubCirculationPlanV137(platform,options);
    const service=getHubInteractionPropBoundsV136(options.room);
    assert.ok(service,id+': missing live native service bounds');
    for(const console of getHubCirculationSolidReservationsV138(platform,options).filter(bounds=>bounds.role==='native-deck-console'))
      assert.ok(!(console.x<service.x+service.w&&console.x+console.w>service.x&&console.y<service.y+service.h&&console.y+console.h>service.y),id);
    for(const support of plan.supports){
      assert.ok(support.bottom-support.top>=16);
      assert.ok(plan.openings.every(opening=>support.x+14<=opening.left||support.x-9>=opening.right));
    }
  }
});

test('all room foregrounds use a14px floor rim without rendering any baked ladder or inaccessible equipment pixels', () => {
  for (const room of rooms) {
    const subject = canvas(), before = structuredClone(room), model = getHubFrontFasciaV139(room);
    assert.equal(model.bounds.y, 706); assert.equal(model.bounds.h, 14);
    assert.ok(model.bounds.y > model.floorY + 4);
    drawHubAuthoredLayerV133(subject.ctx, { complete: true, naturalWidth: 1774, naturalHeight: 887 }, { phase: 'front' }, room);
    assert.ok(subject.painted.length > 0 && !subject.painted.some(paint => paint.kind === 'image'));
    assert.ok(subject.painted.every(paint => !paint.bounds || paint.bounds[1] >= model.bounds.y));
    assert.deepEqual(room, before); subject.balanced();
  }
});

test('the five native foreground service spans paint closed frontal covers without fake underfloor ladder rungs',()=>{
  const expected=['cryo-bay','life-support','quarantine','reactor','workshop'],found=[];
  for(let deck=0;deck<HUB_DECKS.length;deck++){
    const geometry=buildHubTraversalGeometryV87(deck);
    for(const occlusion of geometry.occluders.filter(entry=>entry.art==='foregroundPipes')){
      const room=HUB_DECKS[deck].rooms.find(room=>room.id===occlusion.roomId),subject=canvas(),before=structuredClone(geometry);
      class Base{}const engine=new(withHubAuthoredCompositionV133(Base))();engine.v51Occluders=[occlusion];
      engine.drawTraversalOcclusions(subject.ctx,'front');
      const floor=getHubSupportPlanesV139(room).walkY;
      assert.deepEqual(subject.painted.filter(paint=>paint.kind==='fill').map(paint=>paint.bounds),[
        [occlusion.x,floor+8,occlusion.w,16],[occlusion.x,floor+8,occlusion.w,2],[occlusion.x,floor+21,occlusion.w,3]
      ]);
      assert.ok(subject.painted.every(paint=>paint.kind==='fill'),'No open strokes, repeated uprights or bitmap ladders remain');
      assert.ok(subject.painted.every(paint=>paint.bounds[1]>=floor+8&&paint.bounds[1]+paint.bounds[3]<=floor+24));
      assert.deepEqual(geometry,before);subject.balanced();found.push(room.id);
    }
  }
  assert.deepEqual(found.sort(),expected);
});

test('the real floor accepts foot624 with a clearance margin, rejects foot627 and retains entrance exclusion distances', () => {
  const plan = { bounds: { x: 0, y: 186, w: 1000, h: 438 }, planes: { walkY: 624 },
    reservations: [{ x: 335, y: 500, w: 118, h: 124, role: 'ship-service-entrance' }] };
  const fitting = { x: 250, y: 524, w: 80, h: 100 };
  assert.equal(hubSpatialPlacementClearV136(fitting, plan, { margin: 3 }), true);
  assert.equal(hubSpatialPlacementClearV136({ ...fitting, y: 527 }, plan, { margin: 3 }), false);
  assert.equal(hubSpatialPlacementClearV136(fitting, plan, { margin: 6 }), false);
  assert.equal(hubSpatialPlacementClearV136({ ...fitting, x: 336 }, plan), false);
});

test('editor and active training foreground delegation remains native and never draws the ship fascia over its course', () => {
  class Base {
    drawModularRoomV56() { return 'editor-room'; }
    drawModularHangar() { return 'editor-hangar'; }
    drawAnnexForegroundV72() { return 'native-course'; }
    drawPlayer() { return 'native-player'; }
  }
  const Engine = withHubCirculationV137(withHubAuthoredCompositionV133(Base)), engine = new Engine(), subject = canvas();
  engine.editorPlaytest = true;
  assert.equal(engine.drawModularRoomV56(subject.ctx, rooms[0], 'front'), 'editor-room');
  assert.equal(engine.drawModularHangar(subject.ctx, rooms[0], 'front'), 'editor-hangar');
  assert.equal(engine.drawPlayer(subject.ctx), 'native-player');
  engine.editorPlaytest = false; engine.hubTrainingV132 = { active: true };
  assert.equal(engine.drawAnnexForegroundV72(subject.ctx, HUB_ANNEXES_V137[0], null), 'native-course');
  assert.equal(engine.drawHubCirculationFrontV139(subject.ctx), false);
  assert.equal(subject.painted.length, 0); subject.balanced();
});

test('all 47 native ladders paint and reserve the exact finite handhold grid above their unchanged physical landing',()=>{
  const ladders=[...HUB_DECKS.flatMap((deck,index)=>buildHubTraversalGeometryV87(index).ladders.map(ladder=>({
    ladder,room:deck.rooms.find(room=>room.id===ladder.roomId),centered:true
  }))),...HUB_ANNEXES_V137.flatMap(annex=>annex.ladders.map(ladder=>({ladder,room:{...annex,xStart:0},centered:false})))];
  assert.equal(ladders.length,47);
  for(const {ladder,room,centered} of ladders){
    const before=structuredClone(ladder),mount=getHubLadderMountV139(ladder,{centered}),subject=canvas();
    assert.equal(mount.railTop,ladder.top-88);
    assert.deepEqual(mount.rungs.filter(rung=>rung.index<0).map(rung=>rung.index),[-4,-3,-2,-1]);
    assert.equal(mount.rungBottom,mount.rungs.at(-1).y);
    assert.ok(mount.rungs.every(rung=>rung.y>=mount.railTop&&rung.y+6<=ladder.bottom));
    drawHubSpatialLadderV136(subject.ctx,ladder,{centered});
    assert.deepEqual(subject.painted.filter(paint=>paint.color==='#657f7d').map(paint=>paint.bounds),
      mount.rungs.map(rung=>[rung.x,rung.y,rung.w,3]));
    const reserve=getHubSpatialPlanV136(room,{ladders:[ladder]}).reservations.find(bounds=>bounds.role==='ladder-clearance');
    assert.equal(reserve.y,mount.visualBounds.y-20);
    assert.equal(reserve.y+reserve.h,mount.visualBounds.y+mount.visualBounds.h+20);
    assert.deepEqual(ladder,before);subject.balanced();
  }
});
