import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_DECKS, HubGame as NativeHub, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as OpeningHub } from '../src/hub-opening-v88.js';
import { DROPSHIP_HANGAR_ART_V55 } from '../src/hub-art-runtime-v55.js';
import { resolveHubVehicleArtV58 } from '../src/hub-art-runtime-v58.js';
import { withHubTrainingV132 } from '../src/hub-training-v132.js';
import { withHubAuthoredCompositionV133 } from '../src/hub-authored-composition-v133.js';
import { withHubRoomParallaxV134 } from '../src/hub-room-parallax-v134.js';
import { withHubSpatialDesignV136, getHubSpatialPlanV136 } from '../src/hub-spatial-design-v136.js';
import { withHubRoomDressingV134 } from '../src/hub-room-dressing-v134.js';
import { withHubRoomLifeV136 } from '../src/hub-room-life-v136.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { withHubCirculationV137 } from '../src/hub-circulation-v137.js';
import { withHubRoomIdentityV137 } from '../src/hub-room-identity-v137.js';
import { withHubDestinationSignsV138 } from '../src/hub-destination-signage-runtime-v138.js';
import { getHubVehiclePlacementV136 } from '../src/hub-prop-placements-v136.js';
import { HUB_DROPSHIP_HANGAR_ART_V139 as art, getHubDropshipHangarPlacementV139 } from '../src/hub-dropship-hangar-art-v139.js';

const near = (a,b) => assert.ok(Math.abs(a-b)<1e-8,`${a} differs from ${b}`);
const deck = HUB_DECKS.findIndex(deck=>deck.rooms.some(room=>room.id===art.roomId));
const room = HUB_DECKS[deck].rooms.find(room=>room.id===art.roomId);
const actor = DROPSHIP_HANGAR_ART_V55.dropship;
const originalActor = structuredClone(actor);
const png = auditWeaponPngV120(fileURLToPath(new URL(`..${art.asset}`,import.meta.url)));
// Same decorators, base runtime and order as src/app.js.
const Engine = [withHubTrainingV132,withHubAuthoredCompositionV133,withHubRoomParallaxV134,
  withHubSpatialDesignV136,withHubRoomDressingV134,withHubRoomLifeV136,withHubNpcLifeV136,
  withHubCirculationV137,withHubRoomIdentityV137,withHubDestinationSignsV138]
  .reduce((Base,decorate)=>decorate(Base),OpeningHub);
function painter({loaded=true}={}) {
  const calls=[],image={src:art.asset,complete:loaded,naturalWidth:art.width,naturalHeight:art.height};
  const old={src:actor.asset,complete:true,naturalWidth:1024,naturalHeight:1024};
  const hub=Object.create(Engine.prototype);
  Object.assign(hub,{hubLifeImagesV136:new Map([[art.asset,image]]),hubArtImages:new Map(
    DROPSHIP_HANGAR_ART_V55.renderStack.filter(entry=>entry.asset).map(entry=>[entry.asset,entry===actor?old:
      {src:entry.asset,complete:true,naturalWidth:entry.sourceSize.width,naturalHeight:entry.sourceSize.height}])),
    animationTime:0,reducedMotion:true,nearestInteraction:()=>null,doorStates:[],v51Ladders:[],v51Platforms:[]});
  let saves=0,restores=0;
  const gradient={addColorStop(){}};
  const ctx=new Proxy({save(){saves++;},restore(){restores++;},
    drawImage(...args){calls.push(args);},createLinearGradient(){return gradient;}},
    {get:(object,key)=>key in object?object[key]:()=>{}});
  hub.drawModularHangar(ctx,room,'back');assert.equal(saves,restores);
  return {hub,image,old,calls,ctx};
}

test('the admitted original PNG has two independently measured level hard skids and inset opaque support tops',()=>{
  assert.equal(art.admitted,true);assert.equal(art.projection,'strict-side-elevation');
  assert.equal(png.sha256,art.sha256);assert.deepEqual([png.width,png.height],[2172,724]);
  assert.deepEqual(png.alphaBounds,[48,83,2124,641]);assert.equal(png.pixelEdits,false);
  assert.equal(png.edgeAlphaMax,1);
  for(const support of art.landingSupports){
    const x0=art.source.x+support.x0,x1=art.source.x+support.x1;
    let last=-1,count=0;
    for(let y=580;y<png.height;y++)for(let x=x0;x<x1;x++)if(png.pixelAlpha(x,y)>=192)last=y;
    for(let x=x0;x<x1;x++)if(png.pixelAlpha(x,last)>=192)count++;
    assert.equal(last,638,support.id);assert.equal(count,support.lastRowOpaquePixels,support.id);
    assert.equal(last+1-art.source.y,support.footSourceY);
  }
  assert.deepEqual(art.landingSupports.map(support=>support.lastRowOpaquePixels),[69,58]);
  for(const support of art.supports){
    const source=support.source;
    for(let x=source.x;x<source.x+source.w;x++)
      assert.ok(png.pixelAlpha(art.source.x+x,art.source.y+source.y)>=192,`${support.id} top misses painted source pixel ${x}`);
  }
});

test('the real app decorator chain blits the original side crop once and projects both feet to 624 with one scale',()=>{
  const {hub,image,old,calls}=painter(),draws=calls.filter(call=>call[0]===image);
  assert.equal(draws.length,1);assert.equal(calls.some(call=>call[0]===old),false);
  const [drawn,sx,sy,sw,sh,x,y,w,h]=draws[0];assert.equal(drawn,image);
  assert.deepEqual([sx,sy,sw,sh],[48,83,2076,558]);near(w/sw,h/sh);
  near(x,room.xStart+150);near(x+w,room.xStart+870);assert.ok(h>193&&h<194);
  for(const support of art.landingSupports)near(y+support.footSourceY*h/sh,624);
  near(y+h,624+2*w/sw);
  const placement=hub.hubVehiclesRenderedV136.get(actor.id);
  assert.deepEqual({x,y,w,h},placement.renderBounds);
  assert.deepEqual(hub.getHubActorRenderBoundsV136(actor,room),placement.renderBounds);
  assert.deepEqual(placement,getHubVehiclePlacementV136(room,actor));
  // Rendering the hangar still paints its existing booth and electrical arc.
  for(const retained of [DROPSHIP_HANGAR_ART_V55.controlBooth,DROPSHIP_HANGAR_ART_V55.electricalHazard])
    assert.equal(calls.filter(call=>call[0].src===retained.asset).length,1);
  assert.deepEqual(actor,originalActor);
});

test('an unloaded side image cannot reintroduce the previous three-quarter aircraft',()=>{
  const {image,old,calls}=painter({loaded:false});
  assert.equal(calls.some(call=>call[0]===image||call[0]===old),false);
  assert.equal(calls.length,2);
});

test('native obstacle geometry, boarding interactions and dressing reservations consume the new silhouette',()=>{
  const placement=getHubDropshipHangarPlacementV139(room),physical=buildHubObstacleGeometryV87(deck).filter(part=>part.actorId===actor.id);
  assert.equal(physical.length,4);
  for(const [index,part] of physical.entries()){
    const expected=placement.collisionSegments[index];
    for(const key of ['x','y','w','h'])near(part[key],expected[key]);
    assert.equal(part.collisionMode,'one-way-top');assert.equal(part.physicalPlane,'rear');
    assert.ok(part.y>=placement.renderBounds.y&&part.y+part.h<=624+1e-8);
  }
  for(const gear of physical.filter(part=>part.role==='dropship-gear'))near(gear.y+gear.h,624);
  const subject={currentRoom:()=>room,player:{x:placement.renderBounds.x-16,y:532,w:44,h:92}};
  const interaction=NativeHub.prototype.nearestInteraction.call(subject);
  assert.equal(interaction.id,actor.id);assert.equal(interaction.action,'navigate:operations');
  assert.deepEqual(interaction.interactionBounds,placement.interactionBounds);
  subject.player.x=placement.renderBounds.x-100;assert.equal(NativeHub.prototype.nearestInteraction.call(subject),null);
  subject.player.x=placement.renderBounds.x+300;subject.player.y=280;
  assert.equal(NativeHub.prototype.nearestInteraction.call(subject),null,'The obsolete tall craft must not keep an invisible boarding zone');
  const reservation=getHubSpatialPlanV136(room).reservations.find(entry=>entry.role==='parked-vehicle');
  assert.ok(reservation);near(reservation.x,placement.renderBounds.x-12);
  near(reservation.y,placement.renderBounds.y-12);near(reservation.h,placement.renderBounds.h+24);
  assert.deepEqual(actor,originalActor);
});

test('the asset loader registers the unchanged original and editor/non-hangar calls delegate',()=>{
  class Base {drawModularHangar(...args){return args;} getSnapshot(){return {};}}
  const Wrapper=withHubRoomLifeV136(Base),hub=new Wrapper(),originalImage=globalThis.Image;
  try {
    globalThis.Image=class {set src(value){this.path=value;}};
    const image=hub.ensureHubLifeAssetsV136().get(art.asset);assert.equal(image.path,art.asset);
    assert.equal(hub.ensureHubLifeAssetsV136().get(art.asset),image);
  } finally {if(originalImage===undefined)delete globalThis.Image;else globalThis.Image=originalImage;}
  const ctx={};hub.editorPlaytest=true;assert.deepEqual(hub.drawModularHangar(ctx,room,'back'),[ctx,room,'back']);
  hub.editorPlaytest=false;assert.deepEqual(hub.drawModularHangar(ctx,room,'front'),[ctx,room,'front']);
  const bay=HUB_DECKS.flatMap(deck=>deck.rooms).find(room=>room.id==='vehicle-bay');
  assert.deepEqual(hub.drawModularHangar(ctx,bay,'back'),[ctx,bay,'back']);
  const apc=resolveHubVehicleArtV58(bay.id).vehicle,old=structuredClone(apc),placement=getHubVehiclePlacementV136(bay,apc);
  near(placement.renderBounds.w,360);near(placement.renderBounds.y+placement.renderBounds.h,624);
  near(placement.renderBounds.w/placement.renderBounds.h,apc.renderBounds.w/apc.renderBounds.h);
  assert.deepEqual(apc,old);assert.deepEqual(actor,originalActor);
  assert.ok(readFileSync(fileURLToPath(new URL('../src/app.js',import.meta.url)),'utf8').includes('withHubRoomDressingV134, withHubRoomLifeV136'));
});
