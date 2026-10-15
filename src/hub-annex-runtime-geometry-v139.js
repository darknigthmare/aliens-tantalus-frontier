import { getHubSupportPlanesV139 } from './hub-support-planes-v139.js';
import { HUB_ANNEX_STATION_ATLAS_V139, getHubAnnexStationCellV139 } from './hub-annex-station-atlas-v139.js';

/** Runtime views replace the ten legacy station illustrations together with
 * their bound prop, physical top and interaction bounds. The registry remains
 * the historical source; its access, cargo and architectural geometry survive. */
export const HUB_ANNEX_STATION_IDS_V139=Object.freeze([
  'arrival-airlock','logistics','mire-archives','synthetic-bay','cctv',
  'proving-ground','morgue','escape-pods','durandal','bioforge'
]);
const reviewed=new Set(HUB_ANNEX_STATION_IDS_V139),cache=new WeakMap();
const valid=b=>b&&['x','y','w','h'].every(key=>Number.isFinite(b[key]))&&b.w>0&&b.h>0;
const sameBounds=(a,b)=>valid(a)&&valid(b)&&['x','y','w','h'].every(key=>Math.abs(a[key]-b[key])<1e-8);
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const rect=b=>({x:b.x,y:b.y,w:b.w,h:b.h});

export function getHubAnnexRuntimeGeometryV139(annex){
  if(!annex||typeof annex!=='object'||!reviewed.has(annex.id)||annex.kind!=='physical-annex')return annex;
  if(cache.has(annex))return cache.get(annex);
  // Preserve copied runtime views and opaque future descriptors. A caller may
  // add xStart for world translation without applying another image/layout fit.
  if(annex.annexRuntimeGeometryV139)return annex;
  const cell=getHubAnnexStationCellV139(annex.id),bounds=annex.station?.bounds;
  if(!HUB_ANNEX_STATION_ATLAS_V139.admitted||!cell||!valid(cell.source)||!valid(bounds)
    ||!Array.isArray(annex.props)||!Array.isArray(annex.colliders))return annex;
  const support=getHubSupportPlanesV139(annex);
  if(support.presentationMode!=='2d'||Math.abs(bounds.y+bounds.h-support.walkY)>1e-8
    ||!Number.isFinite(cell.footSourceY)||cell.footSourceY<=0||cell.footSourceY>cell.source.h)return annex;
  const stationId=annex.id+'-station',propId=annex.id+'-prop-console',colliderId=annex.id+'-collider-station';
  const prop=annex.props.find(entry=>entry.id===propId),collider=annex.colliders.find(entry=>entry.id===colliderId);
  if(annex.station.id!==stationId||!prop||prop.role!=='console'||prop.artRole!=='prop'||!sameBounds(prop,bounds)
    ||!collider||collider.role!=='station'||collider.collisionMode!=='one-way-top'||!sameBounds(collider,bounds))return annex;
  const source=cell.source,scale=Math.min(bounds.w/source.w,bounds.h/source.h);
  const renderBounds={x:bounds.x+(bounds.w-source.w*scale)/2,
    y:support.walkY-cell.footSourceY*scale,w:source.w*scale,h:source.h*scale};
  const transform=b=>({x:renderBounds.x+b.x*scale,y:renderBounds.y+b.y*scale,w:b.w*scale,h:b.h*scale});
  const top=cell.collisionTopSource;
  if(!top||![top.x,top.y,top.w].every(Number.isFinite)||!(top.w>0))return annex;
  const physicalTop=transform({...top,h:1}),physicalBounds={x:physicalTop.x,y:physicalTop.y,w:physicalTop.w,h:support.walkY-physicalTop.y};
  if(!valid(physicalBounds)||physicalBounds.h>bounds.h+1e-8)return annex;
  const surfaceSource=cell.usefulSurfaceSource;
  const usefulSurface=surfaceSource?{
    id:annex.id+'-useful-surface',kind:surfaceSource.kind||'worktop',bounds:transform(surfaceSource),
    supportY:renderBounds.y+surfaceSource.y*scale,side:'visible-front',source:{...surfaceSource},occupied:[]
  }:null;
  if(cell.minimumUsableLength&&(!usefulSurface||usefulSurface.bounds.w+1e-8<cell.minimumUsableLength))return annex;
  const runtimeCollider=Object.freeze({...collider,...physicalBounds});
  const footprint={x:physicalBounds.x,y:support.walkY-1,w:physicalBounds.w,h:1,
    supportY:support.walkY,plane:'rear-service',depthDx:0,depthDy:0};
  const placement=freeze({schema:139,roomId:annex.id,asset:HUB_ANNEX_STATION_ATLAS_V139.asset,
    cellId:cell.id,source:{...source},sourceBounds:rect(bounds),renderBounds,
    supportY:support.walkY,footSourceY:cell.footSourceY,scale,
    physicalBounds,physicalFootprint:footprint,footprint,
    interactionBounds:{x:renderBounds.x-72,y:renderBounds.y-34,w:renderBounds.w+144,h:renderBounds.h+62},
    interactionPolicy:'native-station-bounds-with-horizontal72-and-vertical34-28-margin',
    colliders:[runtimeCollider],usefulSurface,usefulSurfaces:usefulSurface?[usefulSurface]:[],
    capacity:cell.capacity||null,capacitySources:surfaceSource?{
      source:{...surfaceSource},minimumUsableLength:cell.minimumUsableLength||null,
      usefulLength:usefulSurface.bounds.w,usefulHeight:support.walkY-usefulSurface.supportY
    }:null,
    opaqueFoot:{x0:physicalBounds.x,x1:physicalBounds.x+physicalBounds.w,y:support.walkY,sourceY:cell.footSourceY},
    view:'strict-side',artProjection:cell.projection,sourceStatus:'reviewed-original-frontal-annex-stations',
    registryPreserved:true,coordinatePolicy:'station-art-prop-collision-and-interaction-together'});
  const runtime=Object.freeze({...annex,
    station:Object.freeze({...annex.station,bounds:Object.freeze({...bounds,...renderBounds})}),
    props:Object.freeze(annex.props.map(entry=>entry===prop?Object.freeze({...entry,...renderBounds}):entry)),
    colliders:Object.freeze(annex.colliders.map(entry=>entry===collider?runtimeCollider:entry)),
    art:Object.freeze({...annex.art,prop:placement.asset,alphaBounds:Object.freeze({...annex.art.alphaBounds,
      prop:Object.freeze([source.x,source.y,source.x+source.w,source.y+source.h])})}),
    propPlacementV139:placement,
    annexRuntimeGeometryV139:freeze({schema:139,registryPreserved:true,artReplaced:true,
      physicalStationRelocated:true,stationId,sourceSupportY:bounds.y+bounds.h,
      targetSupportY:support.walkY,deltaY:renderBounds.y-bounds.y,sourceBounds:rect(bounds),
      movedPropIds:[propId],movedColliderIds:[colliderId],replacedStationCount:1,
      floorPreserved:true,doorsPreserved:true,cargoPreserved:true,structuresPreserved:true,
      coordinatePolicy:placement.coordinatePolicy})
  });
  if(Object.isFrozen(annex))cache.set(annex,runtime);
  cache.set(runtime,runtime);return runtime;
}
