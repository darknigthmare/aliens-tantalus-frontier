import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { HUB_INTERIOR_WALL_ATLAS_V138 as atlas } from '../src/hub-interior-wall-atlas-v138.js';
import { REFUGE_ARCHITECTURE_V87, REFUGE_PROPS_LAYOUT_V87, getRefugeApertureV87 } from '../src/refuge-art-v87.js';
import { HUB_COMPARTMENT_SHELLS_V138, getHubCompartmentShellPlanV138, getHubCompartmentWallTilesV138,
  subtractHubShellAperturesV138, drawHubCompartmentShellV138, drawHubCompartmentBaseV138 } from '../src/hub-compartment-shell-v138.js';
import { drawHubRoomParallaxV134, withHubRoomParallaxV134 } from '../src/hub-room-parallax-v134.js';
import { getHubRoomProjectionV139 } from '../src/hub-room-projection-v139.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const rooms=[...HUB_DECKS.flatMap(deck=>deck.rooms),...HUB_ANNEXES_V137.map(row=>({...row,xStart:0}))];
const newWalls=rooms.filter(room=>HUB_COMPARTMENT_SHELLS_V138[room.id].sourcePolicy==='original-wall-material');
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const image=path=>{const bytes=readFileSync(root+path.replace(/^\//,''));assert.equal(bytes.subarray(1,4).toString(),'PNG');
  return {complete:true,naturalWidth:bytes.readUInt32BE(16),naturalHeight:bytes.readUInt32BE(20),src:path};};
const native=image(atlas.asset),refugeImage=image('/assets/openai/ship-animals/v87/habitat-wall.png');
function canvas(){let depth=0;const calls=[],ctx=new Proxy({globalAlpha:1,
  save(){depth++;calls.push({kind:'save'});},restore(){assert.ok(depth>0);depth--;calls.push({kind:'restore'});},
  fillRect(x,y,w,h){calls.push({kind:'fill',bounds:{x,y,w,h},color:this.fillStyle,alpha:this.globalAlpha});},
  drawImage(asset,sx,sy,sw,sh,x,y,w,h){calls.push({kind:'image',asset:asset.src,source:{x:sx,y:sy,w:sw,h:sh},target:{x,y,w,h},alpha:this.globalAlpha});},
  createLinearGradient:()=>({addColorStop(){}})
},{get:(target,key)=>key in target?target[key]:()=>{}});return{ctx,calls,balanced:()=>assert.equal(depth,0)};}

test('all 35 ship compartments have deliberate wall architecture and preserve the four dedicated flight/training envelopes',()=>{
  assert.equal(rooms.length,35);assert.equal(Object.keys(HUB_COMPARTMENT_SHELLS_V138).length,35);assert.equal(newWalls.length,30);
  assert.deepEqual([...new Set(Object.values(HUB_COMPARTMENT_SHELLS_V138).map(row=>row.family))].sort(),Object.keys(atlas.cells).sort());
  for(const room of rooms){const plan=getHubCompartmentShellPlanV138(room);assert.ok(plan,room.id);assert.ok(plan.wallBounds.h>0);assert.equal(plan.gameplayPlane,'2d');assert.equal(plan.originalGeometryPreserved,true);assert.equal(plan.collidable,false);assert.equal(plan.interactive,false);}
  assert.equal(rooms.filter(room=>getHubCompartmentShellPlanV138(room).presentationMode==='2d').length,34);
  assert.deepEqual(rooms.filter(room=>getHubCompartmentShellPlanV138(room).presentationMode==='2.5d').map(room=>room.id),['maintenance-spine']);
  for(const id of ['bridge','dropship-hangar','flight-control-cockpit','proving-ground']){
    const room=rooms.find(room=>room.id===id),browser=canvas(),model=drawHubCompartmentShellV138(browser.ctx,room,native);
    assert.equal(model.handled,false);assert.equal(browser.calls.length,0);
  }
  assert.equal(getHubCompartmentShellPlanV138({id:'__proto__'}),null);assert.equal(getHubCompartmentShellPlanV138({id:'unknown'}),null);
  assert.equal(getHubCompartmentShellPlanV138(rooms[0],0,{clip:{x:0,y:0,w:1280,h:0}}),null);
});

test('native material crops stay inside their own cell, preserve aspect, cap scale, and cover the architectural wall at every drift',()=>{
  for(const room of newWalls){const plan=getHubCompartmentShellPlanV138(room),cell=atlas.cells[plan.family],area=plan.wallBounds;
    for(const drift of [-72,0,72]){
      const tiles=getHubCompartmentWallTilesV138(native,cell.source,area,{drift});assert.ok(tiles.length,room.id);
      for(const tile of tiles){const s=tile.source,t=tile.target;assert.ok(s.x>=cell.source.x-1e-6&&s.y>=cell.source.y-1e-6&&s.x+s.w<=cell.source.x+cell.source.w+1e-6&&s.y+s.h<=cell.source.y+cell.source.h+1e-6);
        assert.ok(Math.abs(t.w/s.w-t.h/s.h)<1e-10);assert.ok(tile.scaleX>0&&tile.scaleX<=1);assert.equal(tile.scaleX,tile.scaleY);
        assert.ok(t.x>=area.x&&t.y>=area.y&&t.x+t.w<=area.x+area.w+1e-6&&t.y+t.h<=area.y+area.h+1e-6);}
      assert.ok(Math.abs(tiles.reduce((sum,tile)=>sum+tile.target.w*tile.target.h,0)-area.w*area.h)<1e-5);
    }
  }
});

test('material rendering paints an opaque substrate before admitted RGBA pixels and reports exactly the source rectangles drawn',()=>{
  for(const room of newWalls){const browser=canvas(),before=structuredClone(room),model=drawHubCompartmentShellV138(browser.ctx,room,native,320);browser.balanced();
    const firstImage=browser.calls.findIndex(call=>call.kind==='image'),firstFill=browser.calls.find(call=>call.kind==='fill');
    assert.ok(firstImage>=0);assert.equal(firstFill.color,atlas.cells[model.family].backing);assert.equal(firstFill.alpha,1);assert.deepEqual(firstFill.bounds,model.bounds);
    assert.ok(browser.calls.indexOf(firstFill)<firstImage);assert.equal(model.nativeReady,true);assert.equal(model.asset,atlas.asset);assert.equal(model.imageStatus,'loaded-and-painted');assert.equal(model.layers[0].opacity,1);
    const painted=browser.calls.filter(call=>call.kind==='image');assert.equal(painted.length,model.nativeTiles.length);
    for(let index=0;index<painted.length;index++){assert.equal(painted[index].asset,atlas.asset);assert.deepEqual(painted[index].source,model.nativeTiles[index].source);assert.deepEqual(painted[index].target,model.nativeTiles[index].target);}
    assert.deepEqual(room,before);
  }
});

test('missing wall pixels leave a closed structural fallback and cannot claim a native image was painted',()=>{
  const room=rooms.find(room=>room.id==='medical');
  for(const pending of [null,{complete:false,naturalWidth:1536,naturalHeight:1024},{complete:true,naturalWidth:0,naturalHeight:0}]){
    const browser=canvas(),model=drawHubCompartmentShellV138(browser.ctx,room,pending);browser.balanced();
    assert.equal(model.nativeReady,false);assert.equal(model.asset,null);assert.deepEqual(model.nativeTiles,[]);assert.ok(model.solidBacking);assert.ok(!browser.calls.some(call=>call.kind==='image'));
  }
});

test('aperture subtraction removes only real holes and keeps all remaining rectangles disjoint',()=>{
  const bounds={x:0,y:0,w:200,h:100},holes=[{x:20,y:20,w:40,h:30},{x:150,y:30,w:20,h:40}];
  const pieces=subtractHubShellAperturesV138(bounds,holes);
  assert.equal(pieces.reduce((sum,b)=>sum+b.w*b.h,0),20000-1200-800);
  for(let i=0;i<pieces.length;i++){for(const hole of holes)assert.ok(!overlap(pieces[i],hole));for(let j=i+1;j<pieces.length;j++)assert.ok(!overlap(pieces[i],pieces[j]));}
});

test('the refuge repaints only its original window-free wall crops and leaves both real exterior apertures untouched',()=>{
  const room=rooms.find(room=>room.id==='personal-refuge'),clip={x:0,y:334,w:room.world.width,h:270},browser=canvas();
  const model=drawHubRoomParallaxV134(browser.ctx,room,refugeImage,0,{clip,wallAtlasImage:native});browser.balanced();
  const shell=model.compartmentShellV138,holes=REFUGE_PROPS_LAYOUT_V87.filter(prop=>prop.kind==='porthole').map(prop=>getRefugeApertureV87('porthole',prop));
  assert.equal(shell.sourcePolicy,'preserve-authored-refuge-apertures');assert.equal(shell.nativeReady,true);assert.equal(shell.asset,refugeImage.src);assert.deepEqual(shell.apertures,holes);
  assert.ok(shell.nativeTiles.length>0);
  for(const tile of shell.nativeTiles){assert.ok(tile.source.y>=REFUGE_ARCHITECTURE_V87.upperWall.source[1]);for(const hole of holes)assert.ok(!overlap(tile.target,hole),'Native wall covers authored space view');}
  for(const call of browser.calls)if(call.kind==='image'||call.kind==='fill')for(const hole of holes)assert.ok(!overlap(call.target||call.bounds,hole),'A shell or gradient repainted the real glass');
});

test('only maintenance uses three moving depth layers and F7 freezes motion without changing shell projection or physical positions',()=>{
  for(const room of rooms){const start=room.xStart||0,width=room.profile?.worldWidth||room.world.width,center=start+width/2-640;
    const a=getHubCompartmentShellPlanV138(room,center),b=getHubCompartmentShellPlanV138(room,center+300);
    assert.deepEqual(a.wallBounds,b.wallBounds);assert.equal(a.layers.length,3);
    if(a.presentationMode==='2.5d'){const moves=b.layers.map((row,index)=>row.drift-a.layers[index].drift);assert.ok(moves[0]>moves[1]&&moves[1]>moves[2]&&moves[2]>0);}
    else assert.ok(b.layers.every(row=>row.drift===0));
    const geometry=structuredClone({station:room.station,colliders:room.colliders,ladders:room.ladders,platforms:room.platforms});
    for(const options of [{enabled:false},{reducedMotion:true}]){
      const still=getHubCompartmentShellPlanV138(room,center+300,options);
      assert.ok(still.layers.every(row=>row.drift===0&&row.factor===0));
      assert.equal(still.presentationMode,b.presentationMode);assert.equal(still.presentationMode,getHubRoomProjectionV139(room).mode);
      for(const key of ['projection','floorY','ceilingY','rearWallBaseY','materialScale','moduleWidth','structuralStep','bounds','wallBounds','apertures','paintRegions'])assert.deepEqual(still[key],b[key],`${room.id}: F7 changed ${key}`);
      assert.deepEqual({station:room.station,colliders:room.colliders,ladders:room.ladders,platforms:room.platforms},geometry);
    }
  }
});

test('port and animal reception suppress the old window-baked full wall before the world shell is painted',()=>{
  for(const id of ['animal-care','frontier-civil-counter']){const room=rooms.find(room=>room.id===id),browser=canvas();
    assert.equal(drawHubCompartmentBaseV138(browser.ctx,room,420),true);browser.balanced();assert.ok(browser.calls.some(call=>call.kind==='fill'&&call.bounds.y===0&&call.bounds.h===624));assert.ok(!browser.calls.some(call=>call.kind==='image'));
  }
  assert.equal(drawHubCompartmentBaseV138(canvas().ctx,rooms.find(room=>room.id==='medical')),false);
});

test('the runtime loads the admitted material once, waits for real image dimensions, and publishes only painted evidence',()=>{
  const previous=globalThis.Image;let loads=0;
  class NativeImage {constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}set src(path){this.path=path;loads++;}get src(){return this.path;}
    finish(){const loaded=image(this.path);this.complete=loaded.complete;this.naturalWidth=loaded.naturalWidth;this.naturalHeight=loaded.naturalHeight;}}
  globalThis.Image=NativeImage;
  try{
    class Base{getSnapshot(){return{};}}
    const Subject=withHubRoomParallaxV134(Base),hub=new Subject(),loaded=hub.getHubCompartmentWallAtlasImageV138();
    assert.equal(loaded.src,atlas.asset);assert.equal(loads,1);assert.equal(hub.getHubCompartmentWallAtlasImageV138(),loaded);assert.equal(loads,1);
    const room=rooms.find(room=>room.id==='medical'),browser=canvas();
    const pending=drawHubRoomParallaxV134(browser.ctx,room,null,0,{wallAtlasImage:loaded});assert.equal(pending.nativeReady,false);assert.ok(!browser.calls.some(call=>call.kind==='image'));
    loaded.finish();const drawn=drawHubRoomParallaxV134(browser.ctx,room,null,0,{wallAtlasImage:loaded});assert.equal(drawn.nativeReady,true);assert.equal(drawn.asset,atlas.asset);assert.ok(drawn.nativeTiles.length>0);assert.equal(loads,1);assert.equal(hub.getHubCompartmentWallAtlasImageV138(),loaded);browser.balanced();
    hub.editorPlaytest=true;assert.equal(hub.drawHubCompartmentBaseV138(browser.ctx,rooms.find(room=>room.id==='animal-care')),false);
  }finally{globalThis.Image=previous;}
});
