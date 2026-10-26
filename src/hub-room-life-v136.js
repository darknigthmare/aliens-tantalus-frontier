import { HUB_ROOM_DRESSING_V134, drawHubRoomDressingV134 } from './hub-room-dressing-v134.js';
import { getHubSpatialPlanV136, hubSpatialPlacementClearV136 } from './hub-spatial-design-v136.js';
import { getHubVehiclePlacementV136 } from './hub-prop-placements-v136.js';
import { resolveHubVehicleArtV58 } from './hub-art-runtime-v58.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { HUB_PROP_ATLAS_V136, getHubPropAtlasCellV136 } from './hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137 } from './hub-furnishing-atlas-v137.js';
import { HUB_ROOM_FURNISHING_V137, enrichHubRoomCompositionV137, drawHubFurnishingMountsV137 } from './hub-room-furnishing-v137.js';
import { HUB_FURNITURE_ATLAS_V139 } from './hub-furniture-atlas-v139.js';
import { HUB_SURFACE_DETAILS_ATLAS_V139 } from './hub-surface-details-atlas-v139.js';
import { HUB_FURNISHING_CONTACTS_V139, getHubFurnishingFootSourceV139, getHubFurnishingPlacementBoundsV139 } from './hub-furnishing-contact-v139.js';
import { getHubWorkstationDetailPlanV139, drawHubWorkstationDetailsV139 } from './hub-workstation-details-v139.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { getHubClinicalBayPlanV139, drawHubClinicalBayV139 } from './hub-clinical-bay-v139.js';
import { DROPSHIP_HANGAR_ART_V55 } from './hub-art-runtime-v55.js';
import { drawHubRearShellV133 } from './hub-authored-composition-v133.js';
import { HUB_DROPSHIP_HANGAR_ART_V139 } from './hub-dropship-hangar-art-v139.js';
import { getHubRoomServiceDetailPlanV165, drawHubRoomServiceDetailsV165 } from './hub-room-service-details-v165.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const ready = image => image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
const pack = (cell,x,y,w,role) => ({cell,x,y,w,role});
const room = (task,theme,supplies) => ({task,theme,supplies});

/** Each compact module has an authored task and wall socket. These are small
 * secondary supplies beside the actual service, never another fake console. */
export const HUB_ROOM_LIFE_V136 = freeze({
  bridge: room('watch-reference-and-navigation-spares','command',[pack('personal',270,392,106,'watch-reference'),pack('records',1042,450,108,'navigation-records')]),
  briefing: room('briefing-material-and-crew-notes','command',[pack('records',880,240,120,'briefing-folders'),pack('personal',560,250,90,'meeting-supplies')]),
  'combat-information': room('radio-service-and-signal-records','command',[pack('maintenance',1040,390,112,'radio-spares'),pack('records',650,328,96,'watch-records')]),
  'cryo-bay': room('stasis-monitoring-and-sterile-supply','clinical',[pack('sterile',780,240,116,'capsule-supplies'),pack('maintenance',870,240,90,'stasis-service-kit')]),
  'crew-quarters': room('personal-effects-and-berth-maintenance','habitat',[pack('personal',200,388,126,'personal-effects'),pack('personal',1070,390,104,'berth-effects')]),
  mess: room('meal-preparation-and-shared-tableware','habitat',[pack('galley',250,390,130,'clean-tableware'),pack('galley',940,376,118,'drink-supplies')]),
  medical: room('sterile-storage-and-bedside-care','clinical',[pack('sterile',600,394,126,'sterile-consumables'),pack('sterile',1050,378,114,'bedside-supplies')]),
  'science-lab': room('sample-preparation-and-analysis-records','clinical',[pack('sterile',190,398,112,'sample-preparation'),pack('records',1060,378,96,'analysis-records')]),
  quarantine: room('sealed-supply-and-decontamination','clinical',[pack('sterile',680,380,122,'sealed-consumables'),pack('maintenance',1050,380,104,'decontamination-tools')]),
  armory: room('armorer-tools-and-issue-records','industrial',[pack('maintenance',760,286,122,'armorer-tools'),pack('records',1000,320,104,'issue-records')]),
  workshop: room('repair-tools-and-bench-stock','industrial',[pack('maintenance',220,378,122,'repair-tools'),pack('maintenance',1060,394,108,'bench-stock')]),
  'vehicle-bay': room('vehicle-service-and-inspection-stock','industrial',[pack('maintenance',630,302,128,'inspection-tools'),pack('maintenance',1050,368,102,'vehicle-service-stock')]),
  'dropship-hangar': room('flight-support-and-safety-stock','industrial',[pack('maintenance',666,240,110,'ground-support-kit'),
    pack('records',750,240,80,'flight-checklists'),pack('maintenance',830,240,72,'gantry-service-tools')]),
  reactor: room('electrical-isolation-and-spare-fittings','industrial',[pack('maintenance',670,300,122,'isolation-tools'),pack('maintenance',1050,332,106,'reactor-fittings')]),
  'life-support': room('air-treatment-and-filter-service','industrial',[pack('maintenance',710,378,126,'filter-service-kit'),pack('sterile',1060,380,100,'air-circuit-supplies')]),
  'sensor-array': room('array-calibration-and-signal-records','command',[pack('maintenance',710,308,116,'calibration-tools'),pack('records',1060,340,106,'signal-records')]),
  'arrival-airlock': room('returning-crew-and-contamination-check','clinical',[pack('sterile',690,382,120,'decontamination-supply'),pack('personal',1530,378,112,'arrival-supplies')]),
  logistics: room('classified-freight-and-packing-materials','industrial',[pack('maintenance',340,535,124,'packing-tools'),pack('records',1140,370,118,'freight-manifests'),pack('maintenance',1060,535,100,'handling-supplies')]),
  'mire-archives': room('evidence-sorting-and-physical-records','command',[pack('records',810,384,132,'evidence-reference'),pack('records',1618,535,126,'physical-records')]),
  'synthetic-bay': room('diagnostic-tools-and-clean-components','clinical',[pack('maintenance',750,535,126,'diagnostic-tools'),pack('sterile',1210,535,108,'clean-components')]),
  cctv: room('watch-records-and-camera-service','command',[pack('records',1100,350,124,'watch-records'),pack('maintenance',1640,380,112,'camera-spares')]),
  'proving-ground': room('range-safety-and-protective-equipment','industrial',[pack('maintenance',650,382,122,'safety-equipment'),pack('records',1500,465,112,'range-checklists')]),
  morgue: room('forensic-consumables-and-identification-records','clinical',[pack('sterile',730,376,128,'forensic-consumables'),pack('records',850,376,114,'identification-records')]),
  'escape-pods': room('evacuation-checks-and-emergency-supply','industrial',[pack('sterile',575,535,126,'emergency-consumables'),pack('records',1710,386,116,'evacuation-checklists')]),
  durandal: room('computer-service-and-diagnostic-records','command',[pack('maintenance',1100,350,124,'computer-service-kit'),pack('records',1650,380,112,'diagnostic-records')]),
  bioforge: room('specimen-preparation-and-sterile-entry','clinical',[pack('sterile',740,376,126,'sterile-entry-supply'),pack('sterile',1730,388,108,'specimen-consumables')]),
  'animal-care': room('habitat-hygiene-and-feed-preparation','habitat',[pack('galley',230,390,118,'feed-preparation'),pack('sterile',1320,392,108,'habitat-hygiene'),pack('records',2240,392,108,'companion-welfare-records')]),
  'frontier-civil-counter': room('port-records-and-waiting-area','habitat',[pack('records',1070,382,122,'port-records'),pack('galley',2170,398,114,'waiting-area-supply')]),
  'personal-refuge': room('private-effects-and-reading-materials','habitat',[pack('personal',220,400,116,'private-effects'),pack('personal',1320,386,102,'reading-materials')])
});

export const HUB_SERVICE_PROP_ATLAS_V136 = HUB_PROP_ATLAS_V136;
const supplyCells=freeze({sterile:'sterile-cabinet',maintenance:'tool-board',records:'data-cabinet',
  personal:'personal-shelf',galley:'galley-rack'});
// The original V134 carts sat in later annex door sockets. Give treatment
// rooms a bedside/preparation socket, replacing a loose stool or waste bin.
const trolleySockets=freeze({medical:604,'science-lab':600,quarantine:670});

const heightCaps = freeze({locker:106,'medical-cabinet':106,'equipment-rack':106,'radio-rack':110,
  'electrical-cabinet':112,'server-rack':112,'sample-fridge':106,'cold-storage':108,
  'archive-rack':108,'cargo-rack':108,'filter-stack':90,'drink-dispenser':92,
  'medical-cart':60,'lab-bench':70,galley:72,'tool-chest':62,'parts-bin':64,'chart-cart':46,
  case:30,chair:50,bench:36,stool:32,cylinder:76,bin:42,'cable-spool':42,'hose-reel':48,
  'tool-board':76,'document-rack':62,'specimen-cabinet':90,shelf:52,'sample-shelf':60,
  'filter-panel':76,valves:86,'capsule-readout':42,handset:44,'medical-sign':38,'warning-sign':42,
  clock:28,chronometers:36,vent:25,lamp:12,'cable-run':20});

// Explicit adjustments to existing fittings after native pipes and actual deck
// consoles gained shared silhouettes. They retain the original kind/material.
export const HUB_LEGACY_FIXTURE_PLACEMENTS_V138=freeze({
  'combat-information':[{kind:'chronometers',role:'tactical-reference',y:258}],
  'life-support':[{kind:'cylinder',sourceX:166,x:150},{kind:'filter-stack',x:400,height:70}],
  'arrival-airlock':[{kind:'vent',role:'airlock-controls',x:1540}],
  'proving-ground':[{kind:'tool-board',role:'range-protection-stock',x:1280}],
  bioforge:[{kind:'vent',role:'biological-services',x:1550}]
});

function wallTop(kind,height,plan) {
  const {ceilingY,walkY}=plan.planes;
  if(kind==='vent')return ceilingY+22;
  if(kind==='lamp')return ceilingY+5;
  if(['clock','chronometers'].includes(kind))return ceilingY+82;
  if(kind==='cable-run')return ceilingY+128;
  if(['medical-sign','warning-sign'].includes(kind))return Math.max(ceilingY+54,walkY-242);
  if(kind==='handset')return walkY-160-height;
  if(kind==='tool-board')return walkY-100-height;
  if(['shelf','sample-shelf','document-rack'].includes(kind))return walkY-158-height;
  return Math.max(ceilingY+56,walkY-168-height);
}

export function getHubRoomLifePlanV136(room,options={}) {
  room=getHubAnnexRuntimeGeometryV139(room);
  const definition=HUB_ROOM_LIFE_V136[room?.id],original=HUB_ROOM_DRESSING_V134[room?.id];
  const complete=composition=>{
    if(!composition)return composition;
    const detailed={...composition,workstationDetailsV139:getHubWorkstationDetailPlanV139(room,composition),clinicalBayV139:getHubClinicalBayPlanV139(room,composition)};
    return {...detailed,serviceDetailsV165:getHubRoomServiceDetailPlanV165(room,detailed)};
  };
  if(!definition||!original)return complete(enrichHubRoomCompositionV137(room,null,options));
  // The background pass precedes drawTraversal: decks remain in front of wall
  // equipment. Reserve entrances and climbing corridors, rather than deleting
  // all scenery from behind a long, transparent maintenance deck.
  const spatial=getHubSpatialPlanV136(room,{...options,platforms:[]}),start=spatial.bounds.x,items=[],legacyOmissionsV138=[];
  const accept=entry=>hubSpatialPlacementClearV136(getHubFurnishingPlacementBoundsV139(entry),spatial,{margin:3})&&!items.some(existing=>overlap(existing,entry));
  const recordOmission=entry=>legacyOmissionsV138.push({kind:entry.kind,role:entry.role,
    bounds:{x:entry.x,y:entry.y,w:entry.w,h:entry.h},reason:'native-clearance-or-existing-task-equipment',
    reservations:spatial.reservations.filter(reservation=>overlap(entry,reservation)).map(reservation=>reservation.role)});
  const supplies=[];
  for(const originalSupply of definition.supplies){
    const supply={...originalSupply,...options.legacySupplyOverrides?.[originalSupply.role]};
    const cell=getHubPropAtlasCellV136(supplyCells[supply.cell]);
    if(!cell)continue;
    const width=Math.min(supply.w,cell.width),height=width*cell.source.h/cell.source.w;
    const entry={kind:'bitmap',cell:cell.id,x:start+supply.x-width/2,
      y:Math.max(spatial.planes.ceilingY+54,supply.y),w:width,h:height,role:supply.role,
      support:'rear-wall',plane:'rear',collidable:false,interactive:false,
      asset:HUB_SERVICE_PROP_ATLAS_V136.asset,source:{...cell.source},
      perspective:spatial.projection.kind,projectionDxPerY:spatial.projection.dxPerY};
    if(accept(entry)){items.push(entry);supplies.push(entry);}else recordOmission(entry);
  }
  for(const source of original.items){
    if(source.kind==='medical-cart'){
      const footSourceY=getHubFurnishingFootSourceV139(136,getHubPropAtlasCellV136('medical-trolley'));
      const cell=getHubPropAtlasCellV136('medical-trolley'),entry={...source,kind:'bitmap',cell:cell.id,
        asset:HUB_SERVICE_PROP_ATLAS_V136.asset,source:{...cell.source},w:cell.width,h:cell.height,
        x:start+finite(trolleySockets[room.id],source.x+source.w/2)-cell.width/2,y:spatial.planes.rearServiceY-footSourceY*cell.width/cell.source.w,
        footSourceYV139:footSourceY,contactYV139:spatial.planes.rearServiceY,
        perspective:spatial.projection.kind,projectionDxPerY:spatial.projection.dxPerY};
      if(accept(entry))items.push(entry);else recordOmission(entry);
      continue;
    }
    const adjusted=HUB_LEGACY_FIXTURE_PLACEMENTS_V138[room.id]?.find(entry=>entry.kind===source.kind
      &&(!entry.role||entry.role===source.role)&&(entry.sourceX==null||entry.sourceX===source.x));
    const nativeContact=source.kind==='bitmap'&&HUB_FURNISHING_CONTACTS_V139.assets[source.asset];
    const height=adjusted?.height??(nativeContact?nativeContact.sourceHeight*nativeContact.capacityScale:
      source.kind==='bitmap'?Math.min(source.h,106):Math.min(source.h,heightCaps[source.kind]||source.h));
    const scale=height/source.h,width=source.w*scale;
    const entry={...source,x:start+(adjusted?.x??source.x+source.w/2)-width/2,w:width,h:height,
      y:source.support==='rear-floor'?spatial.planes.rearServiceY-(nativeContact?nativeContact.footSourceY*height/nativeContact.sourceHeight:height):adjusted?.y??wallTop(source.kind,height,spatial),
      ...(source.support==='rear-floor'?{contactYV139:spatial.planes.rearServiceY,
        ...(nativeContact?{footSourceYV139:nativeContact.footSourceY,nativeSourceHeightV139:nativeContact.sourceHeight}:{} )}:{}),
      perspective:spatial.projection.kind,projectionDxPerY:spatial.projection.dxPerY};
    if(accept(entry))items.push(entry);else recordOmission(entry);
  }
  return complete(enrichHubRoomCompositionV137(room,{schema:136,roomId:room.id,task:definition.task,theme:definition.theme,accent:original.accent,
    start,width:spatial.bounds.w,floorY:spatial.planes.walkY,top:spatial.planes.ceilingY,
    items,supplies,spatial,legacyOmissionsV138,sourceStatus:'existing-equipment-rescaled-and-original-small-supplies',
    collidable:false,interactive:false,gameplayPlane:'2d'},options));
}

export function getHubRoomLifeMotionV136(time=0,{reducedMotion=false}={}) {
  const t=finite(time);
  return { lamp:reducedMotion?.70:.70+Math.sin(t*.8)*.025,
    status:reducedMotion?.65:.65+Math.sin(t*1.6)*.06,
    trace:reducedMotion?0:((t*.22)%1+1)%1,static:reducedMotion };
}

function drawFixtureDetails(ctx,composition,motion) {
  for(const entry of composition.items){
    if(entry.kind==='bitmap')continue;
    const {x,y,w,h}=entry;
    // Fine fasteners, surface wear and a short service strip share the actual
    // object bounds. Nothing floats independently in the pedestrian lane.
    ctx.fillStyle='#91a39a';ctx.globalAlpha=.48;
    for(const [bx,by] of [[x+4,y+8],[x+w-8,y+8],[x+4,y+h-8],[x+w-8,y+h-8]])ctx.fillRect(bx,by,1,1);
    ctx.fillStyle='#182d30';ctx.globalAlpha=.52;ctx.fillRect(x+w*.25,y+h*.7,Math.max(4,w*.18),1);
    if(['radio-rack','server-rack','capsule-readout'].includes(entry.kind)){
      ctx.globalAlpha=motion.status;ctx.fillStyle=composition.accent;
      ctx.fillRect(x+w*.72,y+h*.26,2,2);ctx.fillRect(x+w*.72,y+h*.41,2,2);
      if(entry.kind==='capsule-readout')ctx.fillRect(x+w*(.24+motion.trace*.36),y+h*.49,2,2);
    }
    if(entry.kind==='lamp'){
      ctx.globalAlpha=motion.lamp;ctx.fillStyle=composition.accent;ctx.fillRect(x+6,y+4,w-12,2);
    }
  }
  ctx.globalAlpha=1;
}

export function drawHubRoomLifeV136(ctx,room,{images=new Map(),time=0,reducedMotion=false,...options}={}) {
  const composition=getHubRoomLifePlanV136(room,options);
  if(!ctx||!composition)return null;
  const serviceDetails=drawHubRoomServiceDetailsV165(ctx,composition.serviceDetailsV165,{time,reducedMotion});
  const clinicalBay=drawHubClinicalBayV139(ctx,composition.clinicalBayV139);
  drawHubFurnishingMountsV137(ctx,composition);
  const rendered=drawHubRoomDressingV134(ctx,room,{images,composition});
  const paintedRoles=new Set(rendered.items.map(entry=>entry.role));
  const detailPlan={...composition.workstationDetailsV139,items:composition.workstationDetailsV139.items.filter(item=>item.hostType==='native'||paintedRoles.has(item.hostRole))};
  const surfaceDetails=drawHubWorkstationDetailsV139(ctx,detailPlan,{images,hostType:'furnishing'});
  const missingHostDetails=composition.workstationDetailsV139.items.filter(item=>item.hostType==='furnishing'&&!paintedRoles.has(item.hostRole)).map(item=>item.role);
  ctx.save();ctx.beginPath();ctx.rect(composition.start+112,composition.top,composition.width-224,composition.floorY-composition.top);ctx.clip();
  const motion=getHubRoomLifeMotionV136(time,{reducedMotion});drawFixtureDetails(ctx,composition,motion);ctx.restore();
  return {schema:composition.schema,roomId:room.id,task:composition.task,theme:composition.theme,
    planes:{...composition.spatial.planes},projection:{...composition.spatial.projection},
    items:rendered.items.map(entry=>({...entry,motif:composition.task})),supplies:composition.supplies.map(entry=>({role:entry.role,cell:entry.cell,bounds:{x:entry.x,y:entry.y,w:entry.w,h:entry.h}})),
    reservations:structuredClone(composition.spatial.reservations),preservedCriticalSpaces:true,
    legacyOmissionsV138:structuredClone(composition.legacyOmissionsV138),
    collidable:false,interactive:false,motion,sourceStatus:composition.sourceStatus,clinicalBayV139:clinicalBay,serviceDetailsV165:serviceDetails,
    workstationDetailsV139:{plan:composition.workstationDetailsV139,surfaces:composition.workstationDetailsV139.surfaces,
      omitted:composition.workstationDetailsV139.omitted,painted:surfaceDetails?.painted||[],pending:[...surfaceDetails?.pending||[],...missingHostDetails]},
    furnishingV137:composition.furnishingV137?{...structuredClone(composition.furnishingV137),
      paintedRoles:composition.furnishingV137.added.filter(entry=>paintedRoles.has(entry.role)).map(entry=>entry.role),
      pendingImageRoles:composition.furnishingV137.added.filter(entry=>!paintedRoles.has(entry.role)).map(entry=>entry.role)}:null};
}

export function withHubRoomLifeV136(Base) {
  if(Base.hubRoomLifeV136)return Base;
  return class HubRoomLifeV136 extends Base{
    static hubRoomLifeV136=true;
    getHubActorRenderBoundsV136(actor,room){return getHubVehiclePlacementV136(room,actor)?.renderBounds||null;}
    drawModularHangar(ctx,room,phase){
      if(this.editorPlaytest||room?.id!==HUB_DROPSHIP_HANGAR_ART_V139.roomId||phase!=='back')return super.drawModularHangar(ctx,room,phase);
      if(!this.drawHubSpatialRearV136?.(ctx,room))drawHubRearShellV133(ctx,room);
      ctx.save();ctx.beginPath();ctx.rect(room.xStart,0,room.profile?.worldWidth||1280,720);ctx.clip();
      for(const entry of DROPSHIP_HANGAR_ART_V55.renderStack){
        if(entry.phase!=='back'||entry.kind==='visual-layer'||!entry.asset)continue;
        const dropship=entry.id===HUB_DROPSHIP_HANGAR_ART_V139.actorId;
        const placement=dropship?getHubVehiclePlacementV136(room,entry):null;
        const image=dropship?this.ensureHubLifeAssetsV136().get(placement.asset):this.hubArtImages?.get(entry.asset);
        if(!ready(image))continue;
        const target=placement?.renderBounds||{...entry.renderBounds,x:room.xStart+entry.renderBounds.x};
        const source=dropship?placement.source:entry.sourceCrop;
        ctx.save();
        if(entry.kind==='station-prop'&&this.nearestInteraction()?.id===entry.id){ctx.shadowColor='rgba(226,203,121,.62)';ctx.shadowBlur=8;}
        if(entry.kind==='electrical')ctx.globalAlpha=this.reducedMotion?.78:Math.max(.38,Math.min(.94,.64+Math.sin(this.animationTime*13)*.22));
        ctx.drawImage(resolveSpriteDrawableV134(image),source.x,source.y,source.w,source.h,target.x,target.y,target.w,target.h);ctx.restore();
        if(dropship){this.hubVehiclesRenderedV136||=new Map();this.hubVehiclesRenderedV136.set(entry.id,placement);}
      }
      ctx.restore();return true;
    }
    drawVehicleBayActorV58(ctx,room){
      if(this.editorPlaytest)return super.drawVehicleBayActorV58(ctx,room);
      const actor=resolveHubVehicleArtV58(room.id)?.vehicle,placement=getHubVehiclePlacementV136(room,actor);
      if(!placement)return super.drawVehicleBayActorV58(ctx,room);
      const image=this.vehicleArtImages?.get(actor.asset);if(!ready(image))return;
      const source=actor.sourceOpaqueBounds,target=placement.renderBounds;
      ctx.save();
      if(this.nearestInteraction()?.id===actor.id){ctx.shadowColor='rgba(126,211,153,.36)';ctx.shadowBlur=5;}
      ctx.drawImage(resolveSpriteDrawableV134(image),source.x+actor.sourceCell.column*actor.sheet.cellWidth,
        source.y+actor.sourceCell.row*actor.sheet.cellHeight,source.w,source.h,target.x,target.y,target.w,target.h);ctx.restore();
      this.hubVehiclesRenderedV136||=new Map();this.hubVehiclesRenderedV136.set(actor.id,placement);
    }
    ensureHubLifeAssetsV136(){
      if(!this.hubLifeImagesV136){
        this.hubLifeImagesV136=new Map(this.propImages||[]);
        if(typeof globalThis.Image==='function'){
          for(const asset of [HUB_SERVICE_PROP_ATLAS_V136.asset,HUB_FURNISHING_ATLAS_V137.asset,HUB_FURNITURE_ATLAS_V139.asset,HUB_SURFACE_DETAILS_ATLAS_V139.asset,HUB_DROPSHIP_HANGAR_ART_V139.asset]){
            const image=new Image();image.decoding='async';image.src=asset;this.hubLifeImagesV136.set(asset,image);
          }
        }
      }
      return this.hubLifeImagesV136;
    }
    drawHubRoomDressingV136(ctx,room){
      if(this.editorPlaytest)return null;
      const options={images:this.ensureHubLifeAssetsV136(),time:this.animationTime,reducedMotion:this.reducedMotion,
        doors:room.world?[]:this.doorStates||[],ladders:room.world?room.ladders||[]:this.v51Ladders||[],
        vents:room.world?room.vents||[]:this.v51Vents||[],
        platforms:room.world?room.platforms||[]:(this.v51Platforms||[]).filter(p=>p.x<room.xEnd&&p.x+p.w>room.xStart)};
      const report=drawHubRoomLifeV136(ctx,room,options);
      if(report){this.hubRoomLifeRenderedV136||=new Map();this.hubRoomLifeRenderedV136.set(room.id,report);
        this.hubWorkstationDetailPlansV139||=new Map();this.hubWorkstationDetailPlansV139.set(room.id,report.workstationDetailsV139.plan);}
      return report;
    }
    drawInteractionProp(ctx,room){
      const result=super.drawInteractionProp(ctx,room);
      if(!this.editorPlaytest)this.drawHubWorkstationSurfaceDetailsV139(ctx,room);
      return result;
    }
    drawHubWorkstationSurfaceDetailsV139(ctx,room){
      if(this.editorPlaytest||!room?.id)return null;
      const plan=this.hubWorkstationDetailPlansV139?.get(room.id);if(!plan)return null;
      const asset=room.propPlacementV139?.asset||room.prop;
      const hostImage=room.world?this.ensureAnnexAssetsV71?.(room.id)?.get('prop'):this.propImages?.get(asset);
      const report=ready(hostImage)?drawHubWorkstationDetailsV139(ctx,plan,{images:this.ensureHubLifeAssetsV136(),hostType:'native'}):
        {schema:139,roomId:room.id,painted:[],pending:plan.items.filter(item=>item.hostType==='native').map(item=>item.role),hostReady:false};
      this.hubNativeWorkstationDetailsV139||=new Map();this.hubNativeWorkstationDetailsV139.set(room.id,report);return report;
    }
    getSnapshot(){
      const current=this.currentAnnexV71?.()||this.currentRoom?.(),rendered=this.editorPlaytest?[]:structuredClone([...this.hubRoomLifeRenderedV136?.values()||[]].map(entry=>{
        const native=this.hubNativeWorkstationDetailsV139?.get(entry.roomId),details=entry.workstationDetailsV139;
        return{...entry,workstationDetailsV139:details&&{...details,
          painted:[...details.painted,...native?.painted||[]],pending:[...details.pending,...native?.pending||[]]}};
      }));
      return {...super.getSnapshot(),hubRoomLifeV136:{active:!this.editorPlaytest,rooms:Object.keys(HUB_ROOM_FURNISHING_V137).length,
        current:rendered.find(entry=>entry.roomId===current?.id)||null,rendered,
        vehicles:this.editorPlaytest?[]:structuredClone([...this.hubVehiclesRenderedV136?.values()||[]]),
        nativeFixtures:this.editorPlaytest?[]:structuredClone([...this.annexFixturesRenderedV138?.values()||[]]),
        nativeSurfaceDetailsV139:this.editorPlaytest?[]:structuredClone([...this.hubNativeWorkstationDetailsV139?.values()||[]]),
        sourceStatus:'authored-task-groups-and-original-separated-ship-furnishings',collidable:false,interactive:false}};
    }
  };
}
