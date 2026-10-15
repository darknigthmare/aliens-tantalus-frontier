import { getHubSupportPlanesV139 } from './hub-support-planes-v139.js';
const bounds = entry => entry && ({x:entry.x,y:entry.y,w:entry.w,h:entry.h});
const finiteBounds = value => value && [value.x,value.y,value.w,value.h].every(Number.isFinite) && value.w>0 && value.h>0;

/** A real clinical group around the admitted side-view bed. The wall lining,
 * task light and headwall service rail are passive architecture behind the bed;
 * the visible long side stays open for bedside care. No floor frame or action. */
export function getHubClinicalBayArchitectureV139(room) {
  if(room?.id!=='medical')return null;
  const placement=room.propPlacementV139,bed=placement?.renderBounds,mattress=placement?.usefulSurface;
  if(!finiteBounds(bed)||mattress?.kind!=='mattress')return null;
  const supportY=getHubSupportPlanesV139(room).rearServiceY;
  const wall={x:bed.x-12,y:bed.y-60,w:bed.w+24,h:supportY-bed.y+60};
  const light={x:bed.x+8,y:bed.y-46,w:bed.w-16,h:6};
  const rail={x:bed.x+12,y:bed.y-23,w:bed.w-24,h:12};
  const feed={x:bed.x+bed.w-4,y:rail.y+rail.h,w:3,h:mattress.supportY-rail.y-rail.h};
  return {bed:{...bed},mattress:{...mattress.bounds},supportY,
    parts:[{id:'clinical-clean-wall-lining',kind:'wall-lining',bounds:wall},
      {id:'clinical-bed-task-light',kind:'task-light',bounds:light},
      {id:'clinical-headwall-utility-rail',kind:'service-rail',bounds:rail},
      {id:'clinical-bed-head-feed',kind:'closed-service-feed',bounds:feed}],
    // Only the painted upper headwall is new exclusion. The admitted bed owns
    // its existing native-service footprint; no broad approach box is added.
    reservations:[{x:wall.x,y:wall.y,w:wall.w,h:bed.y-wall.y,role:'clinical-upper-headwall',
      sourceId:'clinical-clean-wall-lining',plane:'rear-wall',collidable:false,interactive:false}]};
}

export function getHubClinicalBayReservationsV139(room) {
  return getHubClinicalBayArchitectureV139(room)?.reservations||[];
}

export function getHubClinicalBayPlanV139(room,composition) {
  const architecture=composition&&getHubClinicalBayArchitectureV139(room);if(!architecture)return null;
  const find=role=>composition.items.find(entry=>entry.role===role);
  const preparation=find('clinical-preparation-counter'),trolley=find('mobile-bedside-preparation'),wash=find('clinical-handwash'),stock=find('bedside-sterile-cabinet');
  if(![preparation,trolley,wash,stock].every(Boolean))return null;
  const {bed}=architecture,group=[bed,bounds(preparation),bounds(trolley),bounds(wash),bounds(stock),architecture.parts[0].bounds];
  const left=Math.min(...group.map(b=>b.x)),top=Math.min(...group.map(b=>b.y));
  return {schema:139,roomId:room.id,purpose:'side-access-treatment-bay',projection:'strict-side-elevation',...architecture,
    bounds:{x:left,y:top,w:Math.max(...group.map(b=>b.x+b.w))-left,h:Math.max(...group.map(b=>b.y+b.h))-top},
    preparation:{role:preparation.role,bounds:bounds(preparation)},trolley:{role:trolley.role,bounds:bounds(trolley)},
    hygiene:{role:wash.role,bounds:bounds(wash)},sterileStock:{role:stock.role,bounds:bounds(stock)},
    access:{side:'visible-long-side',bounds:{x:bed.x,y:composition.floorY-44,w:bed.w,h:44},obstructingFrame:false},
    sourceStatus:'derived-from-actual-bed-and-authored-clinical-furnishings',collidable:false,interactive:false};
}

export function drawHubClinicalBayV139(ctx,plan) {
  if(!ctx||!plan)return null;
  ctx.save();
  for(const part of plan.parts){
    const {x,y,w,h}=part.bounds;
    if(part.kind==='wall-lining'){
      ctx.fillStyle='#344a4d';ctx.fillRect(x,y,w,h);
      ctx.fillStyle='#5f7671';ctx.fillRect(x,y,w,2);ctx.fillRect(x,y,2,h);ctx.fillRect(x+w-2,y,2,h);
      ctx.fillStyle='#405958';for(const sx of [x+w/3,x+w*2/3])ctx.fillRect(sx,y+3,1,h-3);
      ctx.fillStyle='#759087';for(const bx of [x+5,x+w-6])for(const by of [y+6,y+h-12])ctx.fillRect(bx,by,1,2);
    }else if(part.kind==='task-light'){
      ctx.fillStyle='#172f33';ctx.fillRect(x-2,y-2,w+4,h+4);ctx.fillStyle='#bfd2bb';ctx.fillRect(x,y,w,h);
      ctx.fillStyle='#6e8a7b';ctx.fillRect(x+2,y+h-1,w-4,1);
    }else if(part.kind==='service-rail'){
      ctx.fillStyle='#718983';ctx.fillRect(x,y,w,h);ctx.fillStyle='#1e393d';ctx.fillRect(x+2,y+2,w-4,h-4);
      for(const [fraction,color]of [[.15,'#88b3a7'],[.40,'#b4ac79'],[.65,'#6ba0b0']]){
        const sx=x+w*fraction;ctx.fillStyle='#a1afa1';ctx.fillRect(sx,y+3,6,6);ctx.fillStyle=color;ctx.fillRect(sx+1,y+4,4,4);
      }
    }else{
      ctx.fillStyle='#263f43';ctx.fillRect(x-1,y,w+2,h);ctx.fillStyle='#81968b';ctx.fillRect(x,y,w,h);
      ctx.fillStyle='#516e65';for(let sy=y+7;sy<y+h-3;sy+=20)ctx.fillRect(x-2,sy,w+4,2);
    }
  }
  ctx.restore();return {...plan,paintedPartIds:plan.parts.map(part=>part.id)};
}
