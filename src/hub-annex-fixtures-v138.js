import { fitHubBitmapV72 } from './hub-annex-art-layout-v72.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';

const freeze = value => {
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}
  return value;
};
const finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
const valid=b=>b&&[b.x,b.y,b.w,b.h].every(Number.isFinite)&&b.w>0&&b.h>0;
const ready=image=>image?.complete&&image.naturalWidth>0&&image.naturalHeight>0;
const rectangle=(x,y,right,bottom)=>({x,y,w:right-x,h:bottom-y});

/** Canonical legacy source pieces, shared by the renderer and clearance plan.
 * Existing V82 imports are re-exported by the native V71 runtime. */
export const HUB_ANNEX_MODULE_ART_V82=freeze({
  floor:'/assets/openai/metroidvania/props/floor-segment.png',
  catwalk:'/assets/openai/metroidvania/props/overhead-catwalk.png',
  ladder:'/assets/openai/metroidvania/props/wall-ladder.png',
  pipe:'/assets/openai/metroidvania/props/maintenance-pipe.png',
  provingWall:'/assets/openai/hub/proving-ground/v82/proving-ground-wall-v82.webp',
  provingCeiling:'/assets/openai/hub/proving-ground/v82/proving-ground-ceiling-beam-v82.png',
  crops:{catwalkDeck:[40,43,228,70],ladderLeft:[53,4,62,172],ladderRight:[100,4,109,172],
    ladderRung:[62,36,100,40],pipeBody:[43,4,107,178],pipeShaft:[49,34,99,120],
    ceilingRaceway:[4,4,186,29],wallScreen:[25,8,183,99],provingCeilingSolid:[11,141,1528,283]}
});
export const HUB_ANNEX_FIXTURE_STANDARD_V138=freeze({ceilingY:186,rearFloorY:600,walkY:624,
  crateAsset:'/assets/openai/metroidvania/props/supply-crates.png',crateSource:[4,4,171,156],
  nativeGeometry:'preserved',sourcePolicy:'measured-crops-without-image-edits'});

/** Native props retain their physical boxes. The whole pipe shaft is a visible
 * architectural fitting, even though only its lower body is a physical collider. */
export function getHubAnnexFixturePlanV138(room){
  if(!room?.id)return null;
  const start=finite(room.xStart),floor=finite(room.world?.floorY,624),ceiling=186,props=[],structures=[],omitted=[];
  for(const prop of room.props||[]){
    if(!prop.asset||!valid(prop))continue;
    const target={x:start+prop.x,y:prop.y,w:prop.w,h:prop.h};
    if(['wall-service','navigation'].includes(prop.role)){
      // These identical radar displays never controlled an annex's own system.
      // Its service station and task-specific rear fixtures already do that.
      omitted.push({id:prop.id,role:prop.role,reason:'generic-radar-without-local-service-role'});continue;
    }
    let source=null,bounds=target;
    if(prop.role==='cargo'&&prop.asset===HUB_ANNEX_FIXTURE_STANDARD_V138.crateAsset){
      source=rectangle(...HUB_ANNEX_FIXTURE_STANDARD_V138.crateSource);
      bounds=fitHubBitmapV72(HUB_ANNEX_FIXTURE_STANDARD_V138.crateSource,target);
    }else if(prop.role==='ceiling-service'){
      if(room.id==='proving-ground'){omitted.push({id:prop.id,role:prop.role,reason:'dedicated-native-ceiling-beam'});continue;}
      source=rectangle(...HUB_ANNEX_MODULE_ART_V82.crops.ceilingRaceway);
      const h=target.w*source.h/source.w;bounds={...target,y:ceiling-h-4,h};
    }else if(Array.isArray(prop.source)&&prop.source.length===4){
      source=rectangle(...prop.source);
    }
    props.push({id:prop.id,role:prop.role,asset:prop.asset,source,target:bounds,
      declaredBounds:target,support:prop.role==='ceiling-service'?'ceiling-beam':prop.role==='cargo'?'native-floor':'authored-native-support',
      collidable:false,interactive:false});
  }
  for(const collider of room.colliders||[]){
    if(collider.role!=='structure'||!valid(collider))continue;
    const bodySource=rectangle(...HUB_ANNEX_MODULE_ART_V82.crops.pipeBody),shaftSource=rectangle(...HUB_ANNEX_MODULE_ART_V82.crops.pipeShaft);
    const scale=collider.h/bodySource.h,bodyWidth=bodySource.w*scale,shaftWidth=shaftSource.w*scale;
    const body={x:start+collider.x+(collider.w-bodyWidth)/2,y:collider.y,w:bodyWidth,h:collider.h};
    const shaft={x:start+collider.x+(collider.w-shaftWidth)/2,y:ceiling,w:shaftWidth,h:Math.max(0,collider.y-ceiling)};
    const tiles=[],step=shaftSource.h*scale;
    for(let y=shaft.y;y<shaft.y+shaft.h;y+=step){
      const h=Math.min(step,shaft.y+shaft.h-y);
      tiles.push({source:{...shaftSource,h:h/scale},target:{x:shaft.x,y,w:shaft.w,h}});
    }
    structures.push({id:collider.id,asset:HUB_ANNEX_MODULE_ART_V82.pipe,body,shaft,bodySource,tiles,
      nativeCollider:{...collider,x:start+collider.x},scale,ceilingAnchor:ceiling,collidable:false,interactive:false});
  }
  const reservations=[...props.map(prop=>({...prop.target,role:'native-fixture',sourceId:prop.id})),
    ...structures.flatMap(pipe=>[{...pipe.body,role:'native-structural-pipe-body',sourceId:pipe.id},
      ...(pipe.shaft.h>0?[{...pipe.shaft,role:'native-structural-pipe-shaft',sourceId:pipe.id}]:[])])];
  const legacyForeground=room.art?.alphaBounds?.foreground?{
    omitted:true,reason:'unattached-base-only-survives-the-native-floor-clip',
    source:rectangle(...room.art.alphaBounds.foreground),
    legacyTarget:{x:room.entranceSide==='west'?1620:48,y:444,w:240,h:212},
    legacyVisibleStrip:{x:room.entranceSide==='west'?1620:48,y:floor+4,w:240,h:Math.max(0,656-floor-4)}
  }:null;
  return{schema:138,roomId:room.id,ceilingY:ceiling,floorY:floor,props,structures,reservations,omitted,
    legacyForeground,sourceStatus:'native-crops-and-shared-actual-render-silhouettes',geometryPreserved:true};
}

export function drawHubAnnexFixturesV138(ctx,room,{images=new Map(),resolveDrawable=resolveSpriteDrawableV134}={}){
  const plan=getHubAnnexFixturePlanV138(room);if(!ctx||!plan)return null;
  const painted=[],missing=[];
  const draw=(id,asset,source,target)=>{
    const image=images.get(asset);if(!ready(image)){missing.push(id);return;}
    if(source)ctx.drawImage(resolveDrawable(image),source.x,source.y,source.w,source.h,target.x,target.y,target.w,target.h);
    else ctx.drawImage(resolveDrawable(image),target.x,target.y,target.w,target.h);
    painted.push({id,asset,source:source&&{...source},target:{...target}});
  };
  for(const prop of plan.props)draw(prop.id,prop.asset,prop.source,prop.target);
  for(const pipe of plan.structures){
    for(const [index,tile]of pipe.tiles.entries())draw(`${pipe.id}:shaft:${index}`,pipe.asset,tile.source,tile.target);
    draw(`${pipe.id}:body`,pipe.asset,pipe.bodySource,pipe.body);
  }
  return{schema:138,roomId:room.id,painted,missing:[...new Set(missing)],omitted:structuredClone(plan.omitted),
    reservations:structuredClone(plan.reservations),geometryPreserved:true};
}
