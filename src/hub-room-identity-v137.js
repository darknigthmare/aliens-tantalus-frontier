import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
import { getHubShipConnectionsForSpaceV137 } from './hub-ship-layout-v137.js';
import { SHIP_PORT_SERVICE_SIGNS_V137, SHIP_PORT_LIGHT_FITTINGS_V137 } from './ship-port-room-v87.js';
import { getHubAnnexFixturePlanV138 } from './hub-annex-fixtures-v138.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const valid = bounds => bounds && [bounds.x,bounds.y,bounds.w,bounds.h].every(Number.isFinite) && bounds.w > 0 && bounds.h > 0;
const freeze = value => { if(value && typeof value==='object' && !Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);} return value; };
const line = (ctx, points) => {ctx.beginPath();points.forEach(([x,y],index)=>index?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
const identity = (type, system, color='#84a7a5') => ({type,system,color,plane:'rear-wall',interactive:false,collidable:false});

/** Closed rear-wall fixtures describe what each compartment does. A window
 * exists only where an exterior observation role is plausible. Equipment
 * never gains an interaction or changes the underlying traversal geometry. */
export const HUB_ROOM_IDENTITIES_V137 = freeze({
  bridge:identity('exterior','navigation-watch','#8db7c8'),
  briefing:identity('planning-board','operation-planning','#b8bd91'),
  'combat-information':identity('communications','tactical-radio','#85bcaf'),
  'cryo-bay':identity('manifold','stasis-coolant','#97bcc5'),
  'crew-quarters':identity('personal-storage','berth-storage','#b7a88a'),
  mess:identity('serving-hatch','meal-service','#baaa86'),
  medical:identity('sterile-storage','clinical-consumables','#a0c7ba'),
  'science-lab':identity('sample-storage','analysis-samples','#a3bdcb'),
  quarantine:identity('sealed-observation','isolation-status','#b8ad83'),
  armory:identity('secured-rack','secured-armorer-parts','#b5ac8a'),
  workshop:identity('tool-board','repair-hand-tools','#b7a97d'),
  'vehicle-bay':identity('manifold','hydraulic-service','#a8b294'),
  'dropship-hangar':identity('exterior','flight-observation','#8cb1bd'),
  reactor:identity('power-bus','electrical-distribution','#b6b080'),
  'life-support':identity('air-filters','air-treatment','#91b39c'),
  'sensor-array':identity('communications','array-signal-routing','#91b5c3'),
  'arrival-airlock':identity('manifold','decontamination-water','#9fb6b8'),
  logistics:identity('freight-storage','classified-freight','#b7aa83'),
  'mire-archives':identity('records','physical-evidence','#92b7c0'),
  'synthetic-bay':identity('diagnostics','synthetic-diagnostics','#a5bab9'),
  cctv:identity('communications','camera-routing','#93b79c'),
  'proving-ground':identity('secured-rack','range-safety-equipment','#b6ab82'),
  morgue:identity('cold-storage','forensic-storage','#9fb7b2'),
  'escape-pods':identity('secured-rack','evacuation-supplies','#bdb08e'),
  durandal:identity('compute-rack','computation-service','#9fadc4'),
  bioforge:identity('sample-storage','sealed-biological-samples','#a6b78b'),
  'animal-care':identity('sterile-storage','habitat-hygiene','#9fb592'),
  'frontier-civil-counter':identity('records','port-records','#bbae92'),
  'personal-refuge':identity('personal-storage','private-effects','#a8b4a2'),
  'flight-control-cockpit':identity('exterior','pilot-observation','#8cb6c6'),
  'galley-service':identity('serving-hatch','food-preparation','#c0b086'),
  'sanitary-bay':identity('wash-station','crew-hygiene','#a4c3b8'),
  'engine-room':identity('engine-manifold','mechanical-transmission','#b5ad84'),
  'water-recycling':identity('water-treatment','water-treatment','#8db6af'),
  'maintenance-spine':identity('cable-distribution','technical-distribution','#9caf9a')
});

/** Signs name the real destination of each service transition. The east
 * connection changes decks through the native transition; the closed riser
 * beside it is passive steelwork, never a lift or a second transport system. */
export function getHubRoomServiceRoutePlanV137(room) {
  if(room?.id!=='maintenance-spine')return {routeSigns:[],closedServiceRisers:[]};
  const start=finite(room.xStart),floor=finite(room.world?.floorY,624);
  const destinations={'sensor-array':{name:'CAPTEURS',deck:'PONT TECHNIQUE'},workshop:{name:'ATELIER',deck:'PONT INDUSTRIEL'}};
  const routeSigns=getHubShipConnectionsForSpaceV137(room.id).map(connection=>{
    const destination=destinations[connection.parentRoomId];
    if(!destination)return null;
    const bounds={x:start+connection.entranceLocalX-96,y:connection.annexDoorBounds.y-18,w:192,h:42};
    return {endpointId:connection.id,destinationRoomId:connection.parentRoomId,destinationDeckId:connection.parentDeck,
      destination:destination.name,deckLabel:destination.deck,label:`${destination.name} · ${destination.deck}`,
      direction:connection.entranceSide==='west'?'left':'right',bounds,
      frame:{x:bounds.x-3,y:bounds.y-3,w:bounds.w+6,h:bounds.h+6},
      support:'rear-wall-above-service-portal',transition:'native-service-deck-transition',interactive:false,collidable:false};
  }).filter(Boolean);
  const east=getHubShipConnectionsForSpaceV137(room.id).find(connection=>connection.entranceSide==='east');
  const eastSign=east&&routeSigns.find(sign=>sign.endpointId===east.id);
  const riserTop=eastSign?Math.max(186,eastSign.frame.y+eastSign.frame.h+12):floor-58;
  const closedServiceRisers=east&&riserTop<floor-58?[{id:'maintenance-east-closed-riser',
    bounds:{x:start+east.annexDoorBounds.x+east.annexDoorBounds.w+49,y:riserTop,w:22,h:floor-58-riserTop},
    returnBounds:{x:start+east.annexDoorBounds.x+east.annexDoorBounds.w+19,y:riserTop,w:52,h:22},
    support:'rear-wall-to-service-plinth',closed:true,interactive:false,collidable:false}]:[];
  return {routeSigns,closedServiceRisers};
}

/** These bounds come from the same descriptors used by the live service
 * sign renderer. They remain local to the civil compartment until translated
 * once into its render world, rather than duplicated as another set of magic
 * exclusion rectangles in the identity/furnishing layers. */
export function getHubRoomServicePlaqueBoundsV137(room) {
  if(room?.id!=='frontier-civil-counter')return [];
  const start=finite(room.xStart);
  return SHIP_PORT_SERVICE_SIGNS_V137.map(sign=>({...sign.bounds,x:start+sign.bounds.x,sourceId:sign.id}));
}

export function getHubRoomFixedServiceFittingBoundsV137(room) {
  if(room?.id!=='frontier-civil-counter')return [];
  const start=finite(room.xStart);
  return SHIP_PORT_LIGHT_FITTINGS_V137.map(fitting=>({...fitting.bounds,x:start+fitting.bounds.x,sourceId:fitting.id}));
}

function localObstacles(room,options) {
  const start=finite(room.xStart),width=finite(room.profile?.worldWidth??room.world?.width,1280),floor=finite(room.world?.floorY,624);
  const obstacles=[
    {x:start,y:150,w:130,h:floor-150},{x:start+width-130,y:150,w:130,h:floor-150},
    {x:start+width/2-142,y:180,w:284,h:58}
  ];
  const reserve=b=>{if(valid(b))obstacles.push({...b,x:b.x-12,y:b.y-12,w:b.w+24,h:b.h+24});};
  reserve(room.station?.bounds);reserve(room.propRenderBounds);
  for(const plaque of getHubRoomServicePlaqueBoundsV137(room))reserve(plaque);
  for(const fitting of getHubRoomFixedServiceFittingBoundsV137(room))reserve(fitting);
  const fixtures=getHubAnnexFixturePlanV138(room);
  for(const bounds of fixtures?.reservations||[])reserve(bounds);
  const entrance=room.entrance;
  if(entrance)reserve({x:start+room.entranceLocalX-entrance.w/2,y:entrance.y,w:entrance.w,h:entrance.h});
  for(const ladder of options.ladders||room.ladders||[]){
    const w=finite(ladder.w,52),left=ladder.x-(room.world?0:w/2);
    reserve({x:left,y:ladder.top,w,h:ladder.bottom-ladder.top});
  }
  for(const p of options.platforms||room.platforms||[])if(p.role!=='floor'&&p.type!=='floor')reserve(p);
  return obstacles;
}

/** The native pilot seat faces right. Its observation aperture belongs in
 * front of that seat, above the dashboard, rather than in the first free bay
 * somewhere else in the room. These are distances from the real station and
 * foot rail, so changing the station moves its observation bay coherently. */
export function getHubCockpitObservationPlanV137(room) {
  if(room?.id!=='flight-control-cockpit'||!valid(room.station?.bounds))return null;
  const start=finite(room.xStart),width=finite(room.world?.width,1280),floor=finite(room.world?.floorY,624);
  const seat={...room.station.bounds,x:start+room.station.bounds.x},facing=1;
  const seatFrontX=seat.x+seat.w,bounds={x:seatFrontX+64,y:floor-214,w:210,h:110};
  if(bounds.x+bounds.w>start+width-40)return null;
  return {stationId:room.station.id,stationBounds:seat,seatFacing:facing,
    orientationSource:'native-right-facing-cockpit-seat',seatFrontX,bounds,
    support:'forward-pilot-observation-bay',interactive:false,collidable:false};
}

/** Pure world-space planning. Cameras affect an exterior's far scenery only;
 * moving the ship/deck origin translates every physical fixture identically. */
export function getHubRoomIdentityPlanV137(room,cameraX=0,options={}) {
  const definition=HUB_ROOM_IDENTITIES_V137[room?.id];if(!definition)return null;
  const routes=getHubRoomServiceRoutePlanV137(room),cockpitObservation=getHubCockpitObservationPlanV137(room);
  const start=finite(room.xStart),width=finite(room.profile?.worldWidth??room.world?.width,1280),floor=finite(room.world?.floorY,624);
  let bounds=cockpitObservation?{...cockpitObservation.bounds}:valid(room.viewport)?{...room.viewport}:null;
  if(!bounds&&room.id!=='flight-control-cockpit'){
    const compact=room.id==='personal-refuge',w=definition.type==='exterior'?320:224,h=compact?68:104;
    const obstacles=localObstacles(room,options),y=compact?386:258;
    // Civil records belong in the clear bay immediately before the shelter
    // sign. Keep the middle lamp/instrument bay free rather than consuming it
    // with the first generic socket and forcing cabinets onto fixed lamps.
    const shelterSign=getHubRoomServicePlaqueBoundsV137(room).find(sign=>sign.sourceId==='port-shelter-service-sign');
    const candidates=[...(shelterSign?[{x:shelterSign.x-64-w,y,w,h}]:[]),
      ...[.28,.72,.42,.58,.2,.8,.36,.64].map(fraction=>({x:start+width*fraction-w/2,y,w,h}))];
    for(const candidate of candidates){
      if(candidate.x<start+130||candidate.x+w>start+width-130||candidate.y+h>floor-128)continue;
      if(!obstacles.some(obstacle=>overlap(candidate,obstacle))){bounds=candidate;break;}
    }
  }
  if(!bounds)return {...definition,...routes,roomId:room.id,bounds:null,omitted:'no-clear-rear-wall-socket',sourceStatus:'original-project-wall-fixtures'};
  const presentation=getHubRoomPresentationV119(room,options.enabled!==false);
  const active=definition.type==='exterior'&&presentation.presentationMode==='2.5d'&&!options.reducedMotion;
  const eye=finite(cameraX)+640-(start+width/2),drift=active?clamp(eye*.018,-14,14):0;
  return {...definition,...routes,cockpitObservation,roomId:room.id,bounds,frame:{x:bounds.x-5,y:bounds.y-5,w:bounds.w+10,h:bounds.h+10},
    projection:'orthographic-wall-mount',roomPresentationMode:presentation.presentationMode,
    distantDrift:drift,sourceStatus:'original-project-wall-fixtures',gameplayPlane:'2d'};
}

export function getHubRoomIdentityReservationsV137(room,options={}) {
  const model=getHubRoomIdentityPlanV137(room,0,options);if(!model)return [];
  return [
    ...(model.bounds?[{...model.frame,role:'room-system-fixture'}]:[]),
    ...getHubRoomServicePlaqueBoundsV137(room).map(({sourceId,...bounds})=>({
      x:bounds.x-8,y:bounds.y-8,w:bounds.w+16,h:bounds.h+16,role:'native-service-plaque',sourceId,sourceBounds:bounds
    })),
    ...getHubRoomFixedServiceFittingBoundsV137(room).map(({sourceId,...bounds})=>({
      x:bounds.x-8,y:bounds.y-8,w:bounds.w+16,h:bounds.h+16,role:'native-service-light',sourceId,sourceBounds:bounds
    })),
    ...model.routeSigns.map(sign=>({...sign.frame,role:'service-destination-sign'})),
    ...model.closedServiceRisers.flatMap(riser=>[riser.bounds,riser.returnBounds].map(bounds=>({...bounds,role:'closed-service-riser'})))
  ];
}

function frame(ctx,b,color) {
  ctx.fillStyle='#23373a';ctx.fillRect(b.x-5,b.y-5,b.w+10,b.h+10);
  ctx.fillStyle='#6a7e7b';ctx.fillRect(b.x-5,b.y-5,b.w+10,2);
  ctx.fillStyle='#0a191d';ctx.fillRect(b.x,b.y,b.w,b.h);
  ctx.strokeStyle='#41595c';ctx.lineWidth=2;ctx.strokeRect(b.x-3,b.y-3,b.w+6,b.h+6);
  ctx.fillStyle=color;ctx.fillRect(b.x+8,b.y-2,Math.min(42,b.w/4),1);
  ctx.fillStyle='#8c9a8d';for(const x of [b.x-2,b.x+b.w+1])for(const y of [b.y-2,b.y+b.h+1])ctx.fillRect(x,y,1,1);
}
function cabinet(ctx,x,y,w,h,color,rows=2) {
  ctx.fillStyle='#253b3d';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#647a75';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  for(let index=0;index<rows;index++){
    const top=y+index*h/rows;ctx.fillStyle='#192e32';ctx.fillRect(x+3,top+3,w-6,h/rows-5);
    ctx.strokeStyle='#465f61';line(ctx,[[x+3,top+3],[x+w-3,top+3]]);
    ctx.fillStyle=color;ctx.fillRect(x+w-10,top+h/rows/2,5,2);
  }
}
function pipe(ctx,points,color='#586f70',width=5){ctx.strokeStyle='#132a2f';ctx.lineWidth=width+3;line(ctx,points);ctx.strokeStyle=color;ctx.lineWidth=width;line(ctx,points);ctx.strokeStyle='#81968b';ctx.lineWidth=1;line(ctx,points);}
function gauge(ctx,x,y,r,color){ctx.fillStyle='#13272a';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6d827d';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=1;line(ctx,[[x-r*.55,y+r*.15],[x+r*.42,y-r*.4]]);}
function shelves(ctx,b,type,color) {
  const columns=type==='personal-storage'?3:4,cell=(b.w-20)/columns;
  ctx.fillStyle='#1c3032';ctx.fillRect(b.x+6,b.y+6,b.w-12,b.h-12);
  for(let index=0;index<columns;index++){
    const x=b.x+10+index*cell;
    if(type==='cold-storage'||type==='secured-rack'){cabinet(ctx,x,b.y+9,cell-5,b.h-18,color,type==='cold-storage'?2:1);continue;}
    for(let row=0;row<2;row++){
      const y=b.y+10+row*(b.h-18)/2,h=(b.h-18)/2-3;
      ctx.fillStyle='#435758';ctx.fillRect(x,y+h,cell-5,3);ctx.fillStyle='#0c1f24';ctx.fillRect(x,y,2,h);
      if(type==='records'){
        for(let f=0;f<4;f++){ctx.fillStyle=['#6c7564','#8b8b70','#536b67','#7c7862'][f];ctx.fillRect(x+5+f*(cell-14)/4,y+6,(cell-14)/4-2,h-7);}
      }else if(type==='sterile-storage'||type==='sample-storage'){
        for(let f=0;f<3;f++){const xx=x+6+f*(cell-12)/3;ctx.fillStyle=type==='sample-storage'?'#456b63':'#9da99c';ctx.fillRect(xx,y+9,Math.max(4,(cell-16)/3-3),h-10);ctx.fillStyle=color;ctx.fillRect(xx+1,y+5,Math.max(3,(cell-16)/3-5),4);}
      }else{
        ctx.fillStyle=index%2?'#75775e':'#5f7166';ctx.fillRect(x+6,y+8,cell-19,h-9);ctx.fillStyle='#a6a78c';ctx.fillRect(x+10,y+13,Math.min(14,cell-26),2);
      }
    }
  }
}
function machinery(ctx,b,type,color) {
  const cy=b.y+b.h*.54;
  if(type==='air-filters'){
    for(let index=0;index<4;index++){const x=b.x+10+index*(b.w-20)/4;cabinet(ctx,x,b.y+8,(b.w-28)/4,b.h-16,color,1);ctx.strokeStyle='#6b8077';ctx.lineWidth=1;for(let y=b.y+20;y<b.y+b.h-12;y+=7)line(ctx,[[x+5,y],[x+(b.w-28)/4-5,y]]);}
  }else if(type==='power-bus'||type==='cable-distribution'){
    for(let row=0;row<3;row++)pipe(ctx,[[b.x+12,b.y+18+row*22],[b.x+b.w-14,b.y+18+row*22]],row===1?'#8b8c67':'#566d6d',type==='power-bus'?7:4);
    for(let index=0;index<4;index++){const x=b.x+24+index*(b.w-48)/3;ctx.fillStyle='#243f42';ctx.fillRect(x-4,b.y+9,8,b.h-18);ctx.fillStyle=color;ctx.fillRect(x-3,b.y+12,6,4);}
  }else{
    pipe(ctx,[[b.x+12,b.y+15],[b.x+b.w-12,b.y+15]],'#597f7c',5);pipe(ctx,[[b.x+12,b.y+b.h-13],[b.x+b.w-12,b.y+b.h-13]],'#586c70',5);
    for(let index=0;index<3;index++){
      const x=b.x+34+index*(b.w-68)/2;pipe(ctx,[[x,b.y+15],[x,b.y+b.h-13]],'#536e6e',type==='engine-manifold'?11:6);
      if(type==='water-treatment'){cabinet(ctx,x-18,cy-19,36,42,color,1);gauge(ctx,x,cy-27,7,color);}
      else{gauge(ctx,x,cy,type==='engine-manifold'?19:13,color);ctx.strokeStyle='#79938c';ctx.lineWidth=2;line(ctx,[[x-10,cy],[x+10,cy]]);line(ctx,[[x,cy-10],[x,cy+10]]);}
    }
  }
}
function equipment(ctx,b,type,color) {
  if(['personal-storage','sterile-storage','sample-storage','freight-storage','records','cold-storage','secured-rack'].includes(type))return shelves(ctx,b,type,color);
  if(['manifold','engine-manifold','water-treatment','air-filters','power-bus','cable-distribution'].includes(type))return machinery(ctx,b,type,color);
  if(type==='serving-hatch'){
    ctx.fillStyle='#263c3d';ctx.fillRect(b.x+8,b.y+7,b.w-16,b.h-18);ctx.fillStyle='#0e2326';ctx.fillRect(b.x+14,b.y+12,b.w-28,b.h-31);
    for(let index=0;index<5;index++){const x=b.x+24+index*(b.w-52)/5;ctx.fillStyle=index%2?'#929781':'#a1a38b';ctx.fillRect(x,b.y+b.h-44,Math.min(24,(b.w-52)/5-5),22);ctx.fillStyle='#727f72';ctx.fillRect(x-2,b.y+b.h-24,Math.min(28,(b.w-52)/5-1),3);}
    ctx.fillStyle='#75877f';ctx.fillRect(b.x+4,b.y+b.h-14,b.w-8,6);ctx.fillStyle='#30494b';ctx.fillRect(b.x+12,b.y+b.h-8,b.w-24,4);return;
  }
  if(type==='wash-station'){
    ctx.fillStyle='#5d7772';ctx.fillRect(b.x+12,b.y+b.h-31,b.w-24,18);ctx.fillStyle='#1d373d';ctx.fillRect(b.x+21,b.y+b.h-28,b.w-42,10);
    for(let index=0;index<2;index++){const x=b.x+b.w*(index?.7:.3);pipe(ctx,[[x,b.y+b.h-31],[x,b.y+b.h-58],[x+13,b.y+b.h-58],[x+13,b.y+b.h-49]],'#87968b',3);cabinet(ctx,x-27,b.y+8,45,25,color,1);}return;
  }
  if(type==='tool-board'){
    ctx.fillStyle='#334948';ctx.fillRect(b.x+8,b.y+8,b.w-16,b.h-16);ctx.fillStyle='#728278';
    for(let row=0;row<4;row++)for(let column=0;column<12;column++)ctx.fillRect(b.x+15+column*(b.w-30)/12,b.y+15+row*(b.h-30)/4,1,1);
    for(let index=0;index<6;index++){const x=b.x+25+index*(b.w-50)/5;ctx.strokeStyle=index%2?'#899185':'#617e78';ctx.lineWidth=4;line(ctx,[[x,b.y+26],[x,b.y+b.h-24]]);ctx.strokeStyle='#a4a58c';ctx.lineWidth=2;line(ctx,[[x-5,b.y+21],[x,b.y+27],[x+5,b.y+21]]);}return;
  }
  if(type==='planning-board'){
    ctx.fillStyle='#344b47';ctx.fillRect(b.x+8,b.y+8,b.w-16,b.h-16);ctx.strokeStyle='#6f8878';ctx.lineWidth=1;
    for(let row=0;row<4;row++)line(ctx,[[b.x+14,b.y+18+row*20],[b.x+b.w-14,b.y+18+row*20]]);
    line(ctx,[[b.x+23,b.y+b.h-24],[b.x+b.w*.34,b.y+29],[b.x+b.w*.67,b.y+b.h-34],[b.x+b.w-23,b.y+20]]);
    for(const [x,y] of [[.16,.63],[.34,.3],[.67,.65],[.86,.27]]){ctx.fillStyle=color;ctx.fillRect(b.x+b.w*x-3,b.y+b.h*y-3,6,6);}return;
  }
  if(type==='sealed-observation'){
    ctx.fillStyle='#1c353b';ctx.fillRect(b.x+8,b.y+8,b.w-16,b.h-16);ctx.strokeStyle='#465e61';ctx.lineWidth=5;line(ctx,[[b.x+b.w*.5,b.y+8],[b.x+b.w*.5,b.y+b.h-8]]);
    ctx.fillStyle='#60766e';ctx.fillRect(b.x+20,b.y+b.h-27,b.w-40,7);ctx.fillStyle='rgba(114,173,171,.1)';ctx.fillRect(b.x+10,b.y+10,b.w-20,b.h*.27);return;
  }
  // Routing and diagnostics are small physical rack units, not giant screens.
  const columns=type==='compute-rack'?4:3,w=(b.w-26)/columns;
  for(let index=0;index<columns;index++){
    const x=b.x+9+index*(w+3);cabinet(ctx,x,b.y+8,w,b.h-16,color,type==='compute-rack'?4:3);
    for(let row=0;row<3;row++){ctx.fillStyle='#75988b';ctx.fillRect(x+6,b.y+17+row*(b.h-22)/3,3,2);ctx.fillStyle='#364e50';ctx.fillRect(x+13,b.y+17+row*(b.h-22)/3,Math.max(6,w-25),2);}
    if(type==='diagnostics'){ctx.strokeStyle=color;ctx.lineWidth=1;line(ctx,[[x+7,cy(b)-3],[x+w*.35,cy(b)-12],[x+w*.62,cy(b)+5],[x+w-7,cy(b)-6]]);}
  }
}
const cy = bounds => bounds.y+bounds.h/2;

function exterior(ctx,b,drift,color) {
  const sky=ctx.createLinearGradient(0,b.y,0,b.y+b.h);sky.addColorStop(0,'#0c222e');sky.addColorStop(1,'#07151f');ctx.fillStyle=sky;ctx.fillRect(b.x,b.y,b.w,b.h);
  // Authored distant points and a cropped atmospheric limb; none is an
  // enlarged interior bitmap or a promise of an accessible exterior route.
  for(let index=0;index<38;index++){
    const x=b.x+((index*71+23)%Math.ceil(b.w+40))-20-drift,y=b.y+((index*37+11)%Math.ceil(b.h));
    ctx.fillStyle=index%4?'#587180':'#a5b9ba';ctx.fillRect(x,y,index%9?1:2,1);
  }
  ctx.strokeStyle='rgba(90,140,156,.4)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(b.x+b.w*.83-drift*.4,b.y+b.h*2.2,b.h*1.7,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
  ctx.fillStyle='rgba(136,179,178,.07)';ctx.fillRect(b.x,b.y,b.w,b.h*.32);
  if(b.w>=280){ctx.fillStyle='#2d454a';ctx.fillRect(b.x+b.w*.52-3,b.y,6,b.h);ctx.fillStyle=color;ctx.globalAlpha=.28;ctx.fillRect(b.x+b.w*.52-3,b.y,1,b.h);ctx.globalAlpha=1;}
}

function drawServiceRoutes(ctx,model) {
  for(const riser of model.closedServiceRisers){
    ctx.fillStyle='#253d40';for(const b of [riser.bounds,riser.returnBounds])ctx.fillRect(b.x,b.y,b.w,b.h);
    const b=riser.bounds;ctx.strokeStyle='#4d6969';ctx.lineWidth=2;
    line(ctx,[[b.x,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h],[b.x+b.w,b.y]]);
    for(let y=b.y+38;y<b.y+b.h;y+=84){ctx.fillStyle='#435e5f';ctx.fillRect(b.x-3,y,b.w+6,6);ctx.fillStyle='#94a397';ctx.fillRect(b.x+2,y+2,2,2);ctx.fillRect(b.x+b.w-4,y+2,2,2);}
    ctx.fillStyle='#50696a';ctx.fillRect(b.x-4,b.y+b.h-5,b.w+8,5);
  }
  for(const sign of model.routeSigns){
    const b=sign.bounds;ctx.fillStyle='#152b30';ctx.fillRect(b.x-3,b.y-3,b.w+6,b.h+6);
    ctx.strokeStyle='#637e78';ctx.lineWidth=1;ctx.strokeRect(b.x-2.5,b.y-2.5,b.w+5,b.h+5);
    ctx.fillStyle='#b7cfba';ctx.textAlign='center';ctx.font='700 11px ui-monospace, monospace';
    ctx.fillText(sign.destination,b.x+b.w/2,b.y+15,b.w-56);
    ctx.font='10px ui-monospace, monospace';ctx.fillStyle='#91ada3';ctx.fillText(sign.deckLabel,b.x+b.w/2,b.y+32,b.w-48);
    const arrowX=sign.direction==='left'?b.x+15:b.x+b.w-15,dy=sign.direction==='left'?1:-1,y=b.y+21;
    ctx.strokeStyle='#b7cfba';ctx.lineWidth=2;
    line(ctx,[[arrowX+dy*13,y],[arrowX,y],[arrowX+dy*6,y-6]]);line(ctx,[[arrowX,y],[arrowX+dy*6,y+6]]);
  }
}

export function drawHubRoomIdentityV137(ctx,room,cameraX=0,options={}) {
  const model=getHubRoomIdentityPlanV137(room,cameraX,options);if(!ctx||!model?.bounds)return model;
  const b=model.bounds;ctx.save();frame(ctx,b,model.color);ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
  if(model.type==='exterior')exterior(ctx,b,model.distantDrift,model.color);else equipment(ctx,b,model.type,model.color);
  ctx.restore();drawServiceRoutes(ctx,model);ctx.restore();return model;
}

export function withHubRoomIdentityV137(Base) {
  if(Base.hubRoomIdentityV137)return Base;
  return class HubRoomIdentityV137 extends Base {
    static hubRoomIdentityV137=true;
    draw() {
      this.hubRenderedServiceSignsV137=new Map();
      return super.draw();
    }
    hasRenderedHubServiceSignV137(endpointId) {
      return Boolean(endpointId&&this.hubRenderedServiceSignsV137?.has(endpointId));
    }
    drawHubRoomIdentityV137(ctx,room,options={}) {
      if(this.editorPlaytest)return null;
      const camera=room.world?this.annexCameraV71?.x:this.hubParallaxCameraOverrideV134??this.camera?.x;
      const result=drawHubRoomIdentityV137(ctx,room,camera,{enabled:this.depthPresentationV116,reducedMotion:this.reducedMotion,...options});
      if(ctx&&result?.bounds){
        this.hubRenderedServiceSignsV137 ||= new Map();
        for(const sign of result.routeSigns)this.hubRenderedServiceSignsV137.set(sign.endpointId,{roomId:room.id,bounds:{...sign.bounds}});
      }
      this.hubRoomIdentityModelsV137 ||= new Map();if(result)this.hubRoomIdentityModelsV137.set(room.id,result);return result;
    }
    drawViewportParallax(ctx,viewport,image,room=null) {
      if(this.editorPlaytest||!HUB_ROOM_IDENTITIES_V137[room?.id])return super.drawViewportParallax(ctx,viewport,image,room);
      return this.drawHubRoomIdentityV137(ctx,{...room,viewport});
    }
    getSnapshot() {
      return {...super.getSnapshot(),hubRoomIdentityV137:{active:!this.editorPlaytest,reviewedRooms:Object.keys(HUB_ROOM_IDENTITIES_V137).length,
        gameplayPlane:'2d',interactive:false,collidable:false,sourceStatus:'original-project-wall-fixtures',
        rendered:structuredClone([...this.hubRoomIdentityModelsV137?.values()||[]])}};
    }
  };
}
