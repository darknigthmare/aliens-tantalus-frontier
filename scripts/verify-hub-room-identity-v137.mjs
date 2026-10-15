import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubShipConnectionsForSpaceV137 } from '../src/hub-ship-layout-v137.js';
import { enrichHubRoomCompositionV137, getHubRearEquipmentReservationsV137 } from '../src/hub-room-furnishing-v137.js';
import { SHIP_PORT_SERVICE_SIGNS_V137, SHIP_PORT_LIGHT_FITTINGS_V137 } from '../src/ship-port-room-v87.js';
import { HUB_ROOM_PRESENTATION_IDS_V119, getHubRoomPresentationV119 } from '../src/hub-room-presentation-v119.js';
import { HUB_AUTHORED_COMPOSITIONS_V133 } from '../src/hub-authored-composition-v133.js';
import { HUB_ROOM_PARALLAX_V134, getHubRoomParallaxPlanV134 } from '../src/hub-room-parallax-v134.js';
import { HUB_ROOM_IDENTITIES_V137, getHubRoomIdentityPlanV137, getHubRoomIdentityReservationsV137, getHubRoomServiceRoutePlanV137, getHubCockpitObservationPlanV137, getHubRoomServicePlaqueBoundsV137, getHubRoomFixedServiceFittingBoundsV137,
  drawHubRoomIdentityV137, withHubRoomIdentityV137 } from '../src/hub-room-identity-v137.js';
const rooms=[...HUB_DECKS.flatMap(deck=>deck.rooms),...HUB_ANNEXES_V137.map(room=>({...room,xStart:0}))];
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function host(){let depth=0;const images=[],fills=[],texts=[];const ctx=new Proxy({
  save(){depth++;},restore(){assert.ok(depth>0);depth--;},fillRect(...bounds){fills.push(bounds);},drawImage(...args){images.push(args);},fillText(text){texts.push(String(text));},
  createLinearGradient:()=>({addColorStop(){}})
},{get:(target,key)=>key in target?target[key]:()=>{}});return{ctx,images,fills,texts,balanced:()=>assert.equal(depth,0)};}

test('all 35 actual ship spaces have a reviewed purpose, identity, and honest visual projection',()=>{
  assert.equal(rooms.length,35);assert.equal(Object.keys(HUB_ROOM_IDENTITIES_V137).length,35);
  assert.equal(HUB_ROOM_PRESENTATION_IDS_V119.length,35);assert.equal(Object.keys(HUB_AUTHORED_COMPOSITIONS_V133).length,35);
  assert.equal(Object.keys(HUB_ROOM_PARALLAX_V134).length,35);
  for(const room of rooms){
    assert.ok(HUB_ROOM_IDENTITIES_V137[room.id],room.id);assert.ok(HUB_AUTHORED_COMPOSITIONS_V133[room.id],room.id);
    assert.notEqual(getHubRoomPresentationV119(room).depthProfile,'unreviewed',room.id);
    assert.ok(getHubRoomParallaxPlanV134(room,room.xStart));
  }
  for(const id of ['flight-control-cockpit','engine-room','maintenance-spine'])assert.equal(getHubRoomPresentationV119(id).presentationMode,'2.5d');
  for(const id of ['galley-service','sanitary-bay','water-recycling'])assert.equal(getHubRoomPresentationV119(id).presentationMode,'2d');
});

test('exterior apertures are confined to navigation and flight rooms; interiors have distinct service hardware',()=>{
  assert.deepEqual(Object.entries(HUB_ROOM_IDENTITIES_V137).filter(([,row])=>row.type==='exterior').map(([id])=>id).sort(),['bridge','dropship-hangar','flight-control-cockpit']);
  assert.ok(new Set(Object.values(HUB_ROOM_IDENTITIES_V137).map(row=>row.type)).size>=18);
  assert.equal(HUB_ROOM_IDENTITIES_V137.medical.type,'sterile-storage');
  assert.equal(HUB_ROOM_IDENTITIES_V137.mess.type,'serving-hatch');
  assert.equal(HUB_ROOM_IDENTITIES_V137['crew-quarters'].type,'personal-storage');
  assert.equal(HUB_ROOM_IDENTITIES_V137['water-recycling'].type,'water-treatment');
  assert.equal(HUB_ROOM_IDENTITIES_V137['sanitary-bay'].type,'wash-station');
  assert.equal(HUB_ROOM_IDENTITIES_V137['engine-room'].type,'engine-manifold');
});

test('all wall fixtures fit real room bounds, stay above people, and reserve their visible surrounds',()=>{
  for(const room of rooms){
    const model=getHubRoomIdentityPlanV137(room),b=model.bounds,start=room.xStart||0,width=room.profile?.worldWidth||room.world.width;
    assert.ok(b,`${room.id}: missing clear wall socket`);assert.ok(b.w<=320&&b.h<=122,room.id);
    assert.ok(b.x>=start&&b.x+b.w<=start+width,room.id);assert.ok(b.y+b.h<=(room.id==='flight-control-cockpit'?520:496),room.id);
    assert.equal(model.collidable,false);assert.equal(model.interactive,false);assert.equal(model.gameplayPlane,'2d');
    const reservations=getHubRoomIdentityReservationsV137(room);assert.deepEqual(reservations.filter(row=>row.role==='room-system-fixture'),[{...model.frame,role:'room-system-fixture'}]);
    if(room.world){
      assert.ok(!overlap(b,room.station.bounds),room.id+' wall fixture hides the real station');
      for(const ladder of room.ladders||[])assert.ok(!overlap(b,{x:ladder.x,y:ladder.top,w:ladder.w,h:ladder.bottom-ladder.top}),room.id+' fixture crosses a ladder');
      for(const platform of room.platforms||[])if(platform.role!=='floor')assert.ok(!overlap(b,platform),room.id+' fixture crosses a deck');
    }
  }
});

test('camera movement never drags fixtures or interior equipment and reduced motion freezes exterior scenery',()=>{
  for(const room of rooms){
    const left=getHubRoomIdentityPlanV137(room,-10000),right=getHubRoomIdentityPlanV137(room,10000);
    assert.deepEqual(left.bounds,right.bounds);assert.deepEqual(left.frame,right.frame);
    if(left.type==='exterior'){assert.equal(left.distantDrift,-14);assert.equal(right.distantDrift,14);}
    else{assert.equal(left.distantDrift,0);assert.equal(right.distantDrift,0);}
    assert.equal(getHubRoomIdentityPlanV137(room,10000,{reducedMotion:true}).distantDrift,0);
    assert.equal(getHubRoomIdentityPlanV137(room,10000,{enabled:false}).distantDrift,0);
  }
});

test('rendering every identity balances the canvas, uses original geometry, and leaves physical state untouched',()=>{
  const browser=host();
  for(const room of rooms){
    const before=structuredClone(room),model=drawHubRoomIdentityV137(browser.ctx,room,320);
    assert.ok(model.bounds);assert.deepEqual(room,before);browser.balanced();
  }
  assert.equal(browser.images.length,0,'An interior bitmap must not become the view into space');
  assert.ok(browser.fills.length>500);assert.equal(drawHubRoomIdentityV137(browser.ctx,{id:'unknown'}),null);
});

test('an obstructed optional fixture is omitted rather than painted over a real access route',()=>{
  const room={id:'engine-room',xStart:0,world:{width:1280,floorY:624},platforms:[{x:0,y:240,w:1280,h:150,role:'catwalk'}]};
  const model=getHubRoomIdentityPlanV137(room);assert.equal(model.bounds,null);assert.equal(model.omitted,'no-clear-rear-wall-socket');
  assert.deepEqual(getHubRoomIdentityReservationsV137(room),[]);
});

test('wrapper rendering is idempotent, read-only, and preserves the native editor renderer',()=>{
  const browser=host();class Base{constructor(){this.camera={x:900};this.player={x:420,y:532};this.state={deck:0};}
    drawViewportParallax(){return 'native-editor';}getSnapshot(){return{physical:this.player};}}
  const Subject=withHubRoomIdentityV137(Base),hub=new Subject(),room=HUB_DECKS[0].rooms[0];
  assert.equal(withHubRoomIdentityV137(Subject),Subject);const physical=structuredClone({camera:hub.camera,player:hub.player,state:hub.state});
  hub.hubParallaxCameraOverrideV134=room.xStart;
  assert.ok(hub.drawViewportParallax(browser.ctx,room.viewport,null,room));browser.balanced();
  assert.deepEqual({camera:hub.camera,player:hub.player,state:hub.state},physical);
  const snapshot=hub.getSnapshot();assert.equal(snapshot.hubRoomIdentityV137.reviewedRooms,35);assert.equal(snapshot.hubRoomIdentityV137.rendered[0].distantDrift,0);
  snapshot.hubRoomIdentityV137.rendered[0].bounds.x=999;assert.equal(hub.hubRoomIdentityModelsV137.get('bridge').bounds.x,room.viewport.x);
  hub.editorPlaytest=true;assert.equal(hub.drawViewportParallax(browser.ctx,room.viewport,null,room),'native-editor');
});


test('maintenance destination signs derive both real endpoints and explicitly name their different decks',()=>{
  const room=HUB_ANNEXES_V137.find(row=>row.id==='maintenance-spine'),route=getHubRoomServiceRoutePlanV137(room);
  const connections=getHubShipConnectionsForSpaceV137(room.id);assert.equal(route.routeSigns.length,2);
  assert.deepEqual(route.routeSigns.map(sign=>sign.label),['CAPTEURS · PONT TECHNIQUE','ATELIER · PONT INDUSTRIEL']);
  assert.deepEqual(route.routeSigns.map(sign=>sign.direction),['left','right']);
  for(const sign of route.routeSigns){
    const connection=connections.find(row=>row.id===sign.endpointId);assert.ok(connection);
    assert.equal(sign.destinationRoomId,connection.parentRoomId);assert.equal(sign.destinationDeckId,connection.parentDeck);
    assert.equal(sign.bounds.x+sign.bounds.w/2,connection.entranceLocalX);
    assert.ok(sign.frame.y+sign.frame.h<connection.annexDoorBounds.y+connection.annexDoorBounds.h-156,'Destination sign covers the visible portal');
    assert.equal(sign.transition,'native-service-deck-transition');assert.equal(sign.interactive,false);assert.equal(sign.collidable,false);
  }
  const shifted=getHubRoomServiceRoutePlanV137({...room,xStart:17000});
  assert.deepEqual(shifted.routeSigns.map(sign=>sign.bounds.x-17000),route.routeSigns.map(sign=>sign.bounds.x));
});

test('maintenance labels and closed service riser reserve their exact silhouettes without hiding furniture or inventing transport',()=>{
  const room={...HUB_ANNEXES_V137.find(row=>row.id==='maintenance-spine'),xStart:0},route=getHubRoomServiceRoutePlanV137(room);
  const reservations=getHubRoomIdentityReservationsV137(room),composition=enrichHubRoomCompositionV137(room);
  assert.equal(reservations.filter(row=>row.role==='service-destination-sign').length,2);
  assert.equal(route.closedServiceRisers.length,1);assert.equal(reservations.filter(row=>row.role==='closed-service-riser').length,2);
  for(const sign of route.routeSigns)for(const item of composition.items)assert.ok(!overlap(sign.frame,item),'Sign covers '+item.role);
  const riser=route.closedServiceRisers[0];assert.equal(riser.closed,true);assert.equal(riser.interactive,false);assert.equal(riser.collidable,false);
  assert.equal(riser.bounds.y+riser.bounds.h,566,'Closed riser is unsupported above the service plinth');
  for(const bounds of [riser.bounds,riser.returnBounds]){
    assert.ok(bounds.x>route.routeSigns[1].bounds.x&&bounds.x+bounds.w<room.world.width);
    for(const item of composition.items)assert.ok(!overlap(bounds,item),'Riser covers '+item.role);
    for(const sign of route.routeSigns)assert.ok(!overlap(bounds,sign.frame));
  }
  const browser=host(),before=structuredClone(room);drawHubRoomIdentityV137(browser.ctx,room,1000);browser.balanced();assert.deepEqual(room,before);
  for(const label of ['CAPTEURS','PONT TECHNIQUE','ATELIER','PONT INDUSTRIEL'])assert.ok(browser.texts.includes(label),label+' is absent from the real canvas renderer');
});


test('the right-facing pilot seat, forward dashboard, and observation window form one coherent cockpit station',()=>{
  const room={...HUB_ANNEXES_V137.find(row=>row.id==='flight-control-cockpit'),xStart:0};
  const model=getHubRoomIdentityPlanV137(room),observation=getHubCockpitObservationPlanV137(room),seat=room.station.bounds;
  const composition=enrichHubRoomCompositionV137(room),console=composition.items.find(item=>item.role==='pilot-forward-instrument-console');
  assert.ok(console,'The native pilot dashboard was rejected by the scenery reservations');
  assert.equal(observation.seatFacing,1);assert.equal(observation.orientationSource,'native-right-facing-cockpit-seat');
  assert.equal(observation.stationId,room.station.id);assert.deepEqual(model.bounds,observation.bounds);
  assert.ok(model.bounds.x>seat.x+seat.w,'The observation aperture is behind the right-facing seat');
  assert.ok(model.bounds.x-seat.x-seat.w<=96,'The observation bay is detached from the pilot station');
  assert.ok(console.x>seat.x+seat.w&&console.x-seat.x-seat.w<36,'The dashboard is outside the seated pilot reach');
  assert.ok(console.x+console.w>model.bounds.x,'The dashboard is detached from the forward aperture');
  assert.ok(model.bounds.y+model.bounds.h<console.y&&console.y-model.bounds.y-model.bounds.h<=16,'The window must sit just above the dashboard');
  assert.ok(!composition.items.some(item=>overlap(item,model.frame)),'An independent prop covers the pilot aperture');
  const shifted=getHubCockpitObservationPlanV137({...room,xStart:12000});
  assert.equal(shifted.bounds.x-observation.bounds.x,12000);assert.equal(shifted.stationBounds.x-observation.stationBounds.x,12000);
  assert.equal(getHubCockpitObservationPlanV137({...room,station:null}),null,'Missing seat must not create an arbitrary window');
});


test('civil reception identity and furnishings reserve both real service plaques without covering signage or rear equipment',()=>{
  const room={...HUB_ANNEXES_V137.find(row=>row.id==='frontier-civil-counter'),xStart:0};
  const model=getHubRoomIdentityPlanV137(room),plaques=getHubRoomServicePlaqueBoundsV137(room),reservations=getHubRoomIdentityReservationsV137(room);
  assert.equal(plaques.length,2);assert.equal(plaques.length,SHIP_PORT_SERVICE_SIGNS_V137.length);
  const protectedSigns=reservations.filter(row=>row.role==='native-service-plaque');assert.equal(protectedSigns.length,2);
  const composition=enrichHubRoomCompositionV137(room);
  for(const sign of SHIP_PORT_SERVICE_SIGNS_V137){
    const actual=plaques.find(row=>row.sourceId===sign.id),reservation=protectedSigns.find(row=>row.sourceId===sign.id);
    const {sourceId,...actualBounds}=actual;assert.equal(sourceId,sign.id);assert.deepEqual(actualBounds,sign.bounds);assert.deepEqual(reservation.sourceBounds,sign.bounds);
    assert.ok(reservation.x<=actual.x-8&&reservation.y<=actual.y-8&&reservation.x+reservation.w>=actual.x+actual.w+8&&reservation.y+reservation.h>=actual.y+actual.h+8);
    assert.ok(!overlap(model.frame,reservation),sign.title+' is hidden by the records niche');
    for(const item of composition.items)assert.ok(!overlap(item,reservation),sign.title+' is hidden by '+item.role);
  }
  const equipment=getHubRearEquipmentReservationsV137(room);assert.equal(equipment.length,2,'Clear instrument bays were needlessly erased to fit the civil records');
  for(const panel of equipment)assert.ok(!overlap(model.frame,panel),'The moved records niche overlaps rear instruments');
  const lights=getHubRoomFixedServiceFittingBoundsV137(room);assert.equal(lights.length,SHIP_PORT_LIGHT_FITTINGS_V137.length);
  for(const fitting of SHIP_PORT_LIGHT_FITTINGS_V137){
    const actual=lights.find(row=>row.sourceId===fitting.id),{sourceId,...bounds}=actual;assert.equal(sourceId,fitting.id);assert.deepEqual(bounds,fitting.bounds);
    const reservation=reservations.find(row=>row.role==='native-service-light'&&row.sourceId===fitting.id);assert.ok(reservation);assert.deepEqual(reservation.sourceBounds,bounds);
    assert.ok(!overlap(model.frame,reservation),'Records niche covers a native light fitting');
    for(const panel of equipment)assert.ok(!overlap(panel,bounds),'Rear instruments cover a native light fitting');
    for(const item of composition.items)assert.ok(!overlap(item,reservation),'Furnishing covers a native light fitting');
  }
  const shifted=getHubRoomServicePlaqueBoundsV137({...room,xStart:8000});
  assert.deepEqual(shifted.map(row=>row.x-8000),plaques.map(row=>row.x));
});
