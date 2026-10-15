import { HUB_SURFACE_DETAILS_ATLAS_V139, getHubSurfaceDetailCellV139 } from './hub-surface-details-atlas-v139.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';

const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
const valid=b=>b&&[b.x,b.y,b.w,b.h].every(Number.isFinite)&&b.w>0&&b.h>0;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const slot=(cell,hosts,fraction=.5)=>({cell,hosts:Array.isArray(hosts)?hosts:[hosts],fraction});
const profile=(purpose,slots=[],reason=null)=>({purpose,slots,reason,interactive:false,collidable:false});

/** Deliberate use of each compartment's work surfaces. An absent/occupied top
 * omits its detail explicitly; another empty wall is never invented as a host.
 * The three already busy flight/range/through-route spaces keep their access. */
export const HUB_WORKSTATION_DETAILS_V139=freeze({
  bridge:profile('navigation-watch',[slot('document-binders','native-service',.78)]),
  briefing:profile('briefing-reference',[slot('document-binders','native-service',.3)]),
  'combat-information':profile('watch-handover',[slot('document-binders','native-service',.82)]),
  'cryo-bay':profile('capsule-linen',[slot('folded-linen','stasis-clean-linen-cart')]),
  'crew-quarters':profile('personal-reading',[slot('book-and-mug','crew-bedside-table')]),
  mess:profile('shared-meal',[slot('meal-tray','native-service',.24),slot('meal-tray','native-service',.72)]),
  medical:profile('sterile-bedside-preparation',[slot('sterile-instrument-tray','clinical-preparation-counter',.28),slot('soap-towel-set','clinical-preparation-counter',.8)]),
  'science-lab':profile('sample-preparation',[slot('sample-tube-rack','sample-preparation-counter',.15),slot('sealed-specimen-set','sample-preparation-counter',.85)]),
  quarantine:profile('clean-entry',[slot('soap-towel-set','containment-clean-preparation')]),
  armory:profile('armorer-maintenance',[slot('tool-roll','armorer-service-chest')]),
  workshop:profile('repair-and-check',[slot('tool-roll','native-service',.3),slot('electronic-test-meter','native-service',.75)]),
  'vehicle-bay':profile('clear-inspection-bay',[],'The parked hull and its real inspection access remain clear.'),
  'dropship-hangar':profile('clear-boarding-bay',[],'Flight support remains on the existing gantry, outside the aircraft silhouette.'),
  reactor:profile('electrical-isolation',[slot('spare-fittings-tray','reactor-service-chest')]),
  'life-support':profile('filter-replacement',[slot('filter-cartridges','air-filter-service-counter')]),
  'sensor-array':profile('signal-calibration',[slot('electronic-test-meter','native-service',.78)]),
  'arrival-airlock':profile('clean-return',[slot('folded-linen','arrival-equipment-bench')]),
  logistics:profile('freight-handling',[slot('spare-fittings-tray','freight-packing-counter')]),
  'mire-archives':profile('physical-evidence',[slot('document-binders','evidence-sorting-cart')]),
  'synthetic-bay':profile('component-diagnosis',[slot('electronic-test-meter','synthetic-clean-preparation')]),
  cctv:profile('security-handover',[slot('document-binders','security-watch-desk')]),
  'proving-ground':profile('clear-live-range',[],'No loose details in the firing and loader routes.'),
  morgue:profile('forensic-preparation',[slot('sterile-instrument-tray','forensic-clean-preparation',.28),slot('soap-towel-set','forensic-clean-preparation',.8)]),
  'escape-pods':profile('evacuation-reference',[slot('document-binders','evacuation-ready-bench')]),
  durandal:profile('processor-service',[slot('electronic-test-meter','computer-service-chest')]),
  bioforge:profile('sealed-specimen-preparation',[slot('sealed-specimen-set','biological-clean-preparation')]),
  'animal-care':profile('habitat-hygiene',[slot('soap-towel-set','habitat-clean-preparation')]),
  'frontier-civil-counter':profile('civil-records',[slot('document-binders','civil-records-counter')]),
  'personal-refuge':profile('private-reading',[slot('book-and-mug','private-reading-table')]),
  'flight-control-cockpit':profile('clear-pilot-view',[],'The native forward instruments and observation bay remain uncluttered.'),
  'galley-service':profile('food-preparation',[slot('meal-tray','galley-preparation-counter',.25),slot('soap-towel-set','galley-preparation-counter',.8)]),
  'sanitary-bay':profile('clean-linen-and-handwash',[slot('folded-linen','sanitary-clean-linen-counter',.08),slot('soap-towel-set','sanitary-clean-linen-counter',.92)]),
  'engine-room':profile('mechanical-service',[slot('tool-roll','engine-service-chest')]),
  'water-recycling':profile('filter-service',[slot('filter-cartridges','water-service-chest')]),
  'maintenance-spine':profile('clear-oblique-service-route',[],'Only measured parallel-oblique procedural floor volumes belong in this compartment; no side-elevation detail bitmap is admitted.')
});

function itemSurface(entry){
  if(entry.usefulSurfaceV139)return{...entry.usefulSurfaceV139,hostRole:entry.role,hostType:'furnishing',hostBounds:{x:entry.x,y:entry.y,w:entry.w,h:entry.h}};
  if(entry.kind==='bitmap')return null;
  const depth=entry.projectionDxPerY===0?0:Math.min(7,entry.h*.23,entry.w*.23/(19/12)),dx=depth*19/12;
  let y=entry.y+depth,left=entry.x+dx+4,width=entry.w-dx-8,occupied=[];
  if(['bench','stool'].includes(entry.kind)){y=entry.y+10;left=entry.x+3;width=entry.w-6;}
  else if(entry.kind==='lab-bench'&&entry.cleanSurfaceV139){y=entry.y+30;left=entry.x+3;width=entry.w-6;}
  else if(!['work-counter','tool-chest','parts-bin','filter-stack','radio-rack','electrical-cabinet','medical-cabinet','sample-fridge','locker','server-rack','archive-rack','cargo-rack'].includes(entry.kind))return null;
  if(!(width>0))return null;
  return{id:`${entry.role}-useful-surface`,kind:'worktop',bounds:{x:left,y,w:width,h:Math.max(1,depth)},supportY:y,
    side:'visible-front',occupied,hostRole:entry.role,hostType:'furnishing',hostBounds:{x:entry.x,y:entry.y,w:entry.w,h:entry.h},
    sourceStatus:'actual-canvas-surface-geometry'};
}

/** Rich measured native surfaces and the exact tops drawn by our own small
 * furnishings are the only admitted hosts. A mattress is not a worktop. */
export function getHubWorkstationSurfacesV139(room,composition,{nativePlacement=room?.propPlacementV139}={}){
  const surfaces=[];
  const nativeSurfaces=nativePlacement?.usefulSurfaces||[nativePlacement?.usefulSurface];
  for(const surface of nativeSurfaces)if(valid(surface?.bounds)&&Number.isFinite(surface.supportY)&&surface.kind!=='mattress')surfaces.push({
    ...surface,bounds:{...surface.bounds},occupied:(surface.occupied||[]).map(b=>({...b})),hostRole:'native-service',hostType:'native',
    hostBounds:nativePlacement.renderBounds&&{...nativePlacement.renderBounds},sourceStatus:'measured-native-useful-surface'
  });
  for(const entry of composition?.items||[]){const surface=itemSurface(entry);if(surface&&surface.kind!=='mattress'&&valid(surface.bounds))surfaces.push(surface);}
  return surfaces;
}

export function getHubWorkstationDetailPlanV139(room,composition,options={}){
  const definition=HUB_WORKSTATION_DETAILS_V139[room?.id];if(!definition)return null;
  const surfaces=getHubWorkstationSurfacesV139(room,composition,options),items=[],omitted=[];
  for(const [index,request]of definition.slots.entries()){
    const role=`${room.id}-surface-${request.cell}-${index}`,cell=getHubSurfaceDetailCellV139(request.cell);
    const surface=surfaces.find(surface=>request.hosts.includes(surface.hostRole));
    if(!cell||!surface){omitted.push({role,cell:request.cell,reason:cell?'no-declared-useful-surface':'unknown-detail-cell'});continue;}
    const scale=Math.min(1,cell.width/cell.source.w,(surface.bounds.w-4)/cell.source.w);
    if(!(scale>0)){omitted.push({role,cell:cell.id,reason:'surface-too-narrow'});continue;}
    const w=cell.source.w*scale,h=cell.source.h*scale;
    const center=surface.bounds.x+w/2+Math.max(0,surface.bounds.w-w)*request.fraction;
    const target={x:center-w/2,y:surface.supportY-cell.footSourceY*scale,w,h};
    const occupied=[...(surface.occupied||[]),...items.filter(item=>item.surfaceId===surface.id).map(item=>item.target)];
    const otherFurniture=(composition?.items||[]).filter(entry=>entry.role!==surface.hostRole);
    const exclusions=(composition?.spatial?.reservations||[]).filter(entry=>
      !(surface.hostType==='native'&&entry.role==='native-service'));
    const collision=occupied.some(bounds=>overlap(target,bounds))||otherFurniture.some(bounds=>overlap(target,bounds))
      ||exclusions.some(bounds=>overlap(target,bounds));
    if(collision){omitted.push({role,cell:cell.id,surfaceId:surface.id,reason:'occupied-useful-surface'});continue;}
    items.push({role,cell:cell.id,asset:HUB_SURFACE_DETAILS_ATLAS_V139.asset,source:{...cell.source},target,scaleX:scale,scaleY:scale,
      sourceFootY:cell.footSourceY,contactY:target.y+cell.footSourceY*scale,supportY:surface.supportY,
      surfaceId:surface.id,hostRole:surface.hostRole,hostType:surface.hostType,plane:'supported-surface',interactive:false,collidable:false});
  }
  return{schema:139,roomId:room.id,purpose:definition.purpose,reason:definition.reason,surfaces,items,omitted,
    maximumDetailsPerHost:2,sourceStatus:'original-details-on-measured-useful-surfaces',interactive:false,collidable:false};
}

export function drawHubWorkstationDetailsV139(ctx,plan,{images=new Map(),hostType=null,resolveDrawable=resolveSpriteDrawableV134}={}){
  if(!ctx||!plan)return null;
  const painted=[],pending=[];ctx.save();ctx.globalAlpha=1;
  for(const item of plan.items){
    if(hostType&&item.hostType!==hostType)continue;
    const image=images.get(item.asset),s=item.source,t=item.target;
    if(!image?.complete||image.naturalWidth!==HUB_SURFACE_DETAILS_ATLAS_V139.width||image.naturalHeight!==HUB_SURFACE_DETAILS_ATLAS_V139.height){pending.push(item.role);continue;}
    ctx.drawImage(resolveDrawable(image),s.x,s.y,s.w,s.h,t.x,t.y,t.w,t.h);painted.push({...item});
  }
  ctx.restore();return{schema:139,roomId:plan.roomId,painted,pending,omitted:structuredClone(plan.omitted),
    sourceStatus:'actual-paint-calls-from-unchanged-detail-atlas',interactive:false,collidable:false};
}
