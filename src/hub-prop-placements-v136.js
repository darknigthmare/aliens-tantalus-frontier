import { getHubSupportPlanesV139 } from './hub-support-planes-v139.js';
import { HUB_FURNITURE_ATLAS_V139, getHubFurnitureCellV139 } from './hub-furniture-atlas-v139.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { getHubDropshipHangarPlacementV139 } from './hub-dropship-hangar-art-v139.js';

/** One physical size contract for the ship's existing equipment. The reference
 * is the 96.5px standing human; source images keep one uniform scale. Coordinates
 * returned here are world coordinates. No save data or room catalogue mutates. */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const bounds = value => value && [value.x,value.y,value.w,value.h].every(Number.isFinite) && value.w > 0 && value.h > 0;

export const HUB_PROP_HEIGHTS_V136 = freeze({
  bridge: 88, briefing: 54, 'combat-information': 88, 'cryo-bay': 82,
  'crew-quarters': 106, mess: 64, medical: 94, 'science-lab': 82,
  quarantine: 106, armory: 100, workshop: 80, 'vehicle-bay': 88,
  'dropship-hangar': 88, reactor: 112, 'life-support': 106, 'sensor-array': 88,
  'arrival-airlock': 108, logistics: 104, 'mire-archives': 96,
  'synthetic-bay': 108, cctv: 106, 'proving-ground': 104, morgue: 88,
  'escape-pods': 108, durandal: 108, bioforge: 108
});

export function getHubPropHeightV136(id, fallback = 96.5) {
  return finite(HUB_PROP_HEIGHTS_V136[id], fallback);
}

export function fitHubPropBoundsV136(source, { height, footY = 624, centerX } = {}) {
  if (!bounds(source)) return null;
  const h = Math.min(source.h, finite(height, source.h)), scale = h / source.h;
  if (!(h > 0) || !Number.isFinite(footY)) return null;
  const w = source.w * scale, center = finite(centerX, source.x + source.w / 2);
  return { x: center - w / 2, y: footY - h, w, h };
}

export function getHubInteractionPropBoundsV136(room) {
  room=getHubAnnexRuntimeGeometryV139(room);
  if(room?.propPlacementV139?.visible===false)return null;
  const source = room?.propPlacementV139?.renderBounds || room?.propRenderBounds || room?.station?.bounds;
  if (!bounds(source)) return null;
  // A measured native factory owns its real position. Refitting it here to the
  // old image height/624 line would separate the drawn feet and interaction.
  return { ...source };
}

export function getHubStationInteractionBoundsV136(room) {
  if(room?.propPlacementV139?.visible===false)return null;
  if(bounds(room?.propPlacementV139?.interactionBounds))return {...room.propPlacementV139.interactionBounds};
  const visible = getHubInteractionPropBoundsV136(room);
  if (!visible) return null;
  return { x: visible.x - 48, y: visible.y - 32, w: visible.w + 96, h: visible.h + 64 };
}

/** Map a physical support together with its visible prop. Collider source
 * proportions survive, including deliberately inset tops/feet. */
export function mapHubPropColliderV136(collider, original, target) {
  if (!bounds(collider) || !bounds(original) || !bounds(target)) return collider && { ...collider };
  const sx = target.w / original.w, sy = target.h / original.h;
  return { ...collider, x: target.x + (collider.x - original.x) * sx,
    y: target.y + (collider.y - original.y) * sy, w: collider.w * sx, h: collider.h * sy };
}

/** Measured alpha rectangles of unchanged legacy PNGs. Rectangles use native
 * image coordinates; all functional parts below use coordinates within crop. */
export const HUB_NATIVE_PROP_SOURCES_V139=freeze({
  bridge:{crop:[5,10,229,153],footSourceY:143,surface:{x:8,y:88,w:210,h:4},workHeight:38},
  'combat-information':{crop:[10,10,205,178],footSourceY:167,surface:{x:12,y:111,w:171,h:5},workHeight:40},
  'cryo-bay':{crop:[10,10,231,121],footSourceY:111,interior:{x:28,y:19,w:138,h:47},capacity:'lying-adult',interiorLength:110},
  'crew-quarters':{crop:[10,10,218,160],footSourceY:149,interior:{x:68,y:76,w:115,h:48},capacity:'lying-adult',interiorLength:110},
  mess:{crop:[10,10,210,129],footSourceY:118,surface:{x:40,y:7,w:121,h:4},height:64},
  medical:{crop:[5,10,215,164],footSourceY:153,surface:{x:16,y:70,w:158,h:5},height:94},
  'science-lab':{crop:[10,10,213,154],footSourceY:143,surface:{x:12,y:84,w:179,h:5},workHeight:40,occupied:true},
  quarantine:{crop:[10,10,179,176],footSourceY:166,interior:{x:44,y:37,w:74,h:107},capacity:'standing-adult',interiorHeight:104},
  armory:{crop:[92,9,891,498],footSourceY:488,surface:{x:34,y:285,w:689,h:8},height:100,occupied:true},
  workshop:{crop:[7,10,222,165],footSourceY:154,surface:{x:12,y:82,w:189,h:5},workHeight:46,occupied:true},
  'vehicle-bay':{crop:[10,10,225,189],footSourceY:178,height:88},
  'dropship-hangar':{crop:[10,10,225,189],footSourceY:178,height:88},
  reactor:{crop:[10,5,176,195],footSourceY:190,height:112},
  'life-support':{crop:[7,10,216,169],footSourceY:158,height:106},
  'sensor-array':{crop:[10,10,205,178],footSourceY:167,surface:{x:12,y:111,w:171,h:5},workHeight:40}
});

/** Explicit wall/service bays clear the native climbing corridors. These are
 * room-local centers, not a scatter or a camera-dependent placement solver. */
export const HUB_NATIVE_PROP_SOCKETS_V139=freeze({
  bridge:900,briefing:500,'combat-information':527.75,'cryo-bay':880,armory:230,'vehicle-bay':1010,reactor:220,'sensor-array':240,
  mess:635,'science-lab':925
});

const furnitureFamily=freeze({medical:'medical-bed',mess:'dining-table',briefing:'dining-table',workshop:'workbench'});
const sourceRect=([x,y,right,bottom])=>({x,y,w:right-x,h:bottom-y});

/** Project an explicitly measured part inside an unchanged source crop. This
 * helper is also used by secondary workstations; it never infers a bare work
 * surface from image padding or erases equipment already painted on a top. */
export function projectHubNativePartV139(part,sourceSize,target){
  const sourceW=finite(sourceSize?.w,sourceSize?.width),sourceH=finite(sourceSize?.h,sourceSize?.height);
  if(!bounds(part)||!bounds(target)||!(sourceW>0&&sourceH>0))return null;
  const scaleX=target.w/sourceW,scaleY=target.h/sourceH;
  if(Math.abs(scaleX-scaleY)>1e-8)return null;
  return{x:target.x+part.x*scaleX,y:target.y+part.y*scaleY,w:part.w*scaleX,h:part.h*scaleY};
}

/** A native station's single source of rendering, physical supports and access.
 * centerX is room-local; every returned point/rectangle is a world coordinate.
 * artCell is an authoring/test override, never required by the normal factory. */
export function getHubNativePropPlacementV139({id,xStart=0,centerX,walkY=624,asset,
  sourceSize,sourceBounds=null,renderHeight,collider=null,artCell=undefined}={}){
  if(!id||!asset||!(sourceSize?.width>0&&sourceSize?.height>0))return null;
  const planes=getHubSupportPlanesV139({id,world:{floorY:walkY}});
  const view=planes.presentationMode==='2.5d'?'parallel-oblique':'strict-side';
  // Every native prop follows the projection selected for its whole room.
  // A frontal bitmap is never silently admitted as an oblique alternative.
  const family=furnitureFamily[id],cellId=family?`${family}-${view==='strict-side'?'side':'oblique'}`:null;
  const cell=artCell===undefined?(cellId&&getHubFurnitureCellV139(cellId)):artCell;
  const measured=HUB_NATIVE_PROP_SOURCES_V139[id]||{};
  const source=cell?.source?{...cell.source}:Array.isArray(sourceBounds)?sourceRect(sourceBounds):
    measured.crop?sourceRect(measured.crop):{x:0,y:0,w:sourceSize.width,h:sourceSize.height};
  if(!bounds(source))return null;
  const footSourceY=finite(cell?.footSourceY,finite(measured.footSourceY,source.h));
  const rawSurface=cell?.usefulSurfaceSource||measured.surface;
  const surfaceSource=rawSurface?.bounds||rawSurface;
  const capacitySource=cell?.interiorSource||measured.interior;
  const sourceExtent={w:source.w,h:source.h};
  let scale=finite(measured.height,finite(renderHeight,getHubPropHeightV136(id)))/source.h;
  let sizing={criterion:'measured-visible-height'};
  if(cell&&id==='medical'&&bounds(surfaceSource)){
    scale=118/surfaceSource.w;sizing={criterion:'adult-mattress-length',target:118};
  }else if(cell&&['mess','briefing'].includes(id)&&bounds(surfaceSource)&&footSourceY>surfaceSource.y){
    const workHeight=id==='briefing'?52:40;
    scale=workHeight/(footSourceY-surfaceSource.y);sizing={criterion:id==='briefing'?'standing-planning-worktop-height':'dining-worktop-height',target:workHeight};
  }else if(bounds(capacitySource)&&measured.capacity==='standing-adult'){
    scale=measured.interiorHeight/capacitySource.h;sizing={criterion:'standing-clear-interior',target:measured.interiorHeight};
  }else if(bounds(capacitySource)&&measured.capacity==='lying-adult'){
    scale=measured.interiorLength/capacitySource.w;sizing={criterion:'lying-clear-interior',target:measured.interiorLength};
  }else if(bounds(surfaceSource)&&measured.workHeight&&footSourceY>surfaceSource.y){
    scale=measured.workHeight/(footSourceY-surfaceSource.y);sizing={criterion:'useful-worktop-height',target:measured.workHeight};
  }
  if(!(scale>0&&Number.isFinite(scale)))return null;
  const localCenter=finite(HUB_NATIVE_PROP_SOCKETS_V139[id],finite(centerX,640));
  const worldCenter=finite(xStart)+localCenter;
  const renderBounds={x:worldCenter-source.w*scale/2,y:planes.rearServiceY-footSourceY*scale,w:source.w*scale,h:source.h*scale};
  const usefulBounds=projectHubNativePartV139(surfaceSource,sourceExtent,renderBounds);
  const inspectionX=usefulBounds?usefulBounds.x+usefulBounds.w/2:worldCenter;
  const usefulSurface=usefulBounds?{id:`${id}-useful-surface`,kind:id==='medical'?'mattress':
    ['bridge','combat-information','sensor-array'].includes(id)?'console':'worktop',bounds:usefulBounds,
    supportY:usefulBounds.y,side:id==='medical'?'visible-long-side':'visible-front',
    source:{...surfaceSource},occupied:measured.occupied&&!cell?[{...usefulBounds}]:
      (cell?.occupiedSource||[]).map(part=>projectHubNativePartV139(part,sourceExtent,renderBounds)).filter(Boolean)}:null;
  const interiorBounds=projectHubNativePartV139(capacitySource,sourceExtent,renderBounds);
  const supportTop=usefulSurface?.supportY??renderBounds.y;
  const collisionWidth=Math.min(finite(collider?.width,renderBounds.w),usefulBounds?.w??renderBounds.w);
  const collisionX=usefulBounds?usefulBounds.x+(usefulBounds.w-collisionWidth)/2:inspectionX-collisionWidth/2;
  const colliders=collider?[{x:collisionX,y:supportTop,w:collisionWidth,
    h:Math.max(1,planes.rearServiceY-supportTop),collisionMode:'one-way-top',physicalPlane:'rear'}]:[];
  const interactionBounds={x:renderBounds.x-48,y:renderBounds.y-32,w:renderBounds.w+96,
    h:Math.max(renderBounds.h,walkY-renderBounds.y)+64};
  const attachmentSockets={
    operator:{x:usefulBounds?usefulBounds.x+usefulBounds.w/2:inspectionX,y:walkY},
    wallMount:{x:worldCenter,y:renderBounds.y+Math.min(18,renderBounds.h*.2)},
    service:{x:id==='medical'?renderBounds.x+renderBounds.w-8:renderBounds.x+8,y:usefulSurface?.supportY??renderBounds.y+renderBounds.h*.5}
  };
  const footprint={x:renderBounds.x,y:planes.rearServiceY-1,w:renderBounds.w,h:1,
    supportY:planes.rearServiceY,plane:'rear-service',depthDx:planes.serviceDepthX,depthDy:planes.serviceDepthY};
  const visible=!['vehicle-bay','dropship-hangar'].includes(id);
  const artProjection=cell?.projection||'measured-legacy-front-elevation';
  const artReady=view==='strict-side'?(!cellId||artProjection==='strict-side-elevation'):
    !!cell&&artProjection==='parallel-oblique';
  return{schema:139,roomId:id,asset:cell?(cell.asset||HUB_FURNITURE_ATLAS_V139.asset):asset,source,cellId:cell?.id||null,renderBounds,
    visible,omittedReason:visible?null:id==='vehicle-bay'?'replaced-by-native-vehicle-inspection':'replaced-by-native-dropship-inspection',
    interactionBounds:visible?interactionBounds:null,colliders:visible?colliders:[],usefulSurface:visible?usefulSurface:null,
    attachmentSockets,footprint,interiorBounds,inspectionX,
    view,artProjection,supportPlanes:planes,
    opaqueFoot:{x0:renderBounds.x,x1:renderBounds.x+renderBounds.w,y:planes.rearServiceY,sourceY:footSourceY},
    tableHeight:usefulSurface?planes.rearServiceY-usefulSurface.supportY:null,sizing:{...sizing,scale},
    sourceStatus:cell?'original-separated-furniture':'measured-original-native-crop',
    artReady,capacity:measured.capacity||null,
    functionalRole:id==='briefing'?'tactical-standing-planning-table':id==='medical'?'clinical-treatment-bed':
      id==='mess'?'shared-dining-table':id==='workshop'?'repair-workbench':`${id}-service-station`};
}

export function getHubVehiclePlacementV136(room, actor) {
  if (!room || !actor || !bounds(actor.renderBounds)) return null;
  if (actor.id === 'dropship-hangar-ud4l') return getHubDropshipHangarPlacementV139(room);
  const start = finite(room.xStart), original = { ...actor.renderBounds, x: start + actor.renderBounds.x };
  let target;
  if (actor.id === 'vehicle-bay-m577-apc') {
    // The freight door occupies x360. A separate inspection socket between
    // x454 and x814 keeps the vehicle, maintenance lift and door readable.
    const w = 360, h = original.h * w / original.w;
    target = { x: start + 450, y: 624 - h, w, h };
  } else return null;
  const convert = value => value && mapHubPropColliderV136({ ...value, x: start + value.x }, original, target);
  const collisionBounds = convert(actor.collisionBounds);
  const collisionSegments = (actor.collisionSegments || []).map(convert);
  // The interaction hugs the actual object, with an accessible approach on
  // both sides. It remains a rear support, never a horizontal roadblock.
  const interactionBounds = { x: target.x - 32, y: Math.max(400,target.y - 24),
    w: target.w + 64, h: 624 - Math.max(400,target.y - 24) };
  return { schema: 136, actorId: actor.id, renderBounds: target, collisionBounds,
    collisionSegments, interactionBounds, sourceRenderBounds: original,
    scaleX: target.w / original.w, scaleY: target.h / original.h,
    physicalPlane: 'rear', collisionMode: 'one-way-top' };
}
