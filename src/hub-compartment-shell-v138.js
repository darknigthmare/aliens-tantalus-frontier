import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
import { HUB_INTERIOR_WALL_ATLAS_V138, getHubInteriorWallCellV138 } from './hub-interior-wall-atlas-v138.js';
import { REFUGE_ARCHITECTURE_V87, REFUGE_PROPS_LAYOUT_V87, getRefugeApertureV87 } from './refuge-art-v87.js';

const finite = (value,fallback=0) => Number.isFinite(value)?value:fallback;
const clamp = (value,low,high) => Math.max(low,Math.min(high,value));
const ready = image => image?.complete===true&&image.naturalWidth>0&&image.naturalHeight>0;
const overlap = (a,b) => a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const freeze = value => {if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const line = (ctx,points) => {ctx.beginPath();points.forEach(([x,y],index)=>index?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
const room = (family,reason,sourcePolicy='original-wall-material') => ({family,reason,sourcePolicy,gameplayPlane:'2d',collidable:false,interactive:false});

/** A material and architectural job for every actual compartment. Flight
 * observation retains its existing native envelope and the dedicated refuge
 * keeps its own window-free crop layout and separately authored apertures. */
export const HUB_COMPARTMENT_SHELLS_V138 = freeze({
  bridge:room('command','navigation-watch','preserve-native-flight-envelope'),
  briefing:room('command','acoustic-planning-room'),
  'combat-information':room('command','tactical-signal-bays'),
  'cryo-bay':room('clinical','sealed-stasis-vault'),
  'crew-quarters':room('habitat','quiet-berth-compartment'),
  mess:room('habitat','shared-dining-compartment'),
  medical:room('clinical','clean-treatment-walls'),
  'science-lab':room('clinical','sealed-analysis-compartment'),
  quarantine:room('clinical','isolated-clean-wall'),
  armory:room('industrial','secured-equipment-compartment'),
  workshop:room('industrial','serviceable-workshop-walls'),
  'vehicle-bay':room('industrial','wide-vehicle-service-frame'),
  'dropship-hangar':room('industrial','native-flight-hangar','preserve-native-flight-envelope'),
  reactor:room('industrial','power-conversion-enclosure'),
  'life-support':room('industrial','air-processing-service-bays'),
  'sensor-array':room('command','signal-equipment-compartment'),
  'arrival-airlock':room('clinical','sealed-arrival-check'),
  logistics:room('cargo','reinforced-freight-enclosure'),
  'mire-archives':room('archive','physical-evidence-and-indexing'),
  'synthetic-bay':room('clinical','clean-component-maintenance'),
  cctv:room('command','security-recording-compartment'),
  'proving-ground':room('industrial','native-orthographic-range','preserve-native-training-wall'),
  morgue:room('clinical','washable-forensic-enclosure'),
  'escape-pods':room('cargo','reinforced-emergency-launch-compartment'),
  durandal:room('archive','computing-and-cooling-bays'),
  bioforge:room('clinical','sealed-biological-access'),
  'animal-care':room('habitat','closed-animal-habitat-wall'),
  'frontier-civil-counter':room('habitat','closed-civil-reception-wall'),
  'personal-refuge':room('habitat','authored-quiet-compartment','preserve-authored-refuge-apertures'),
  'flight-control-cockpit':room('command','native-pilot-observation','preserve-native-flight-envelope'),
  'galley-service':room('habitat','food-preparation-enclosure'),
  'sanitary-bay':room('clinical','washable-wet-service-wall'),
  'engine-room':room('industrial','mechanical-drive-service-enclosure'),
  'water-recycling':room('industrial','water-treatment-service-bays'),
  'maintenance-spine':room('industrial','longitudinal-service-spine')
});

const families=freeze({
  command:{ribRatio:1,style:'angled-command-bays',edge:'#41565e',shade:'#102128',services:2},
  habitat:{ribRatio:1,style:'quiet-horizontal-lining',edge:'#746f5c',shade:'#2b2b25',services:1},
  clinical:{ribRatio:.5,style:'sealed-washable-lining',edge:'#8b9487',shade:'#455049',services:1},
  industrial:{ribRatio:1,style:'vertical-service-stiffeners',edge:'#656854',shade:'#192421',services:3},
  cargo:{ribRatio:1,style:'reinforced-freight-bays',edge:'#72735a',shade:'#222c26',services:2},
  archive:{ribRatio:.5,style:'narrow-cooled-storage-bays',edge:'#4c6c63',shade:'#122925',services:2}
});

function intersect(a,b){const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),right=Math.min(a.x+a.w,b.x+b.w),bottom=Math.min(a.y+a.h,b.y+b.h);return right>x&&bottom>y?{x,y,w:right-x,h:bottom-y}:null;}
export function subtractHubShellAperturesV138(bounds,holes=[]) {
  let pieces=[{...bounds}];
  for(const hole of holes)pieces=pieces.flatMap(piece=>{
    const hit=intersect(piece,hole);if(!hit)return[piece];
    return [
      {x:piece.x,y:piece.y,w:piece.w,h:hit.y-piece.y},
      {x:piece.x,y:hit.y+hit.h,w:piece.w,h:piece.y+piece.h-hit.y-hit.h},
      {x:piece.x,y:hit.y,w:hit.x-piece.x,h:hit.h},
      {x:hit.x+hit.w,y:hit.y,w:piece.x+piece.w-hit.x-hit.w,h:hit.h}
    ].filter(b=>b.w>1e-8&&b.h>1e-8);
  });
  return pieces;
}

export function getHubCompartmentShellPlanV138(room,cameraX=0,{enabled=true,reducedMotion=false,clip=null,layers=null}={}) {
  const definition=Object.hasOwn(HUB_COMPARTMENT_SHELLS_V138,room?.id)?HUB_COMPARTMENT_SHELLS_V138[room.id]:null;if(!definition)return null;
  const start=finite(room.xStart),width=finite(room.profile?.worldWidth??room.world?.width,1280),floorY=finite(room.world?.floorY,624);
  const bounds=clip||{x:start,y:154,w:width,h:Math.max(0,floorY-170)};
  if(![bounds.x,bounds.y,bounds.w,bounds.h].every(Number.isFinite)||bounds.w<=0||bounds.h<=0)return null;
  const presentation=getHubRoomPresentationV119(room,enabled),active=enabled&&presentation.presentationMode==='2.5d'&&!reducedMotion;
  const eye=finite(cameraX)+640-(start+width/2);
  const depthPlanes=layers||[
    {id:'distant-native-wall',factor:.095,maximumDrift:72},
    {id:'rear-shell',factor:.052,maximumDrift:40},
    {id:'near-service-frame',factor:.021,maximumDrift:16}
  ].map(row=>({...row,factor:active?row.factor:0,drift:active?clamp(eye*row.factor,-row.maximumDrift,row.maximumDrift):0}));
  const refuge=definition.sourcePolicy==='preserve-authored-refuge-apertures';
  const apertures=refuge?REFUGE_PROPS_LAYOUT_V87.filter(prop=>prop.kind==='porthole').map(prop=>getRefugeApertureV87('porthole',prop)).map(b=>({...b,x:start+b.x})):[];
  const ceilingY=refuge?334:186,rearWallBaseY=floorY-58;
  const wallHeight=Math.max(0,Math.min(bounds.y+bounds.h,rearWallBaseY)-Math.max(bounds.y,ceilingY));
  if(wallHeight<=0)return null;
  const material=getHubInteriorWallCellV138(definition.family),materialScale=Math.min(1,wallHeight/material.source.h);
  const moduleWidth=material.source.w*materialScale;
  return {...definition,roomId:room.id,profile:families[definition.family],bounds:{...bounds},floorY,
    wallBounds:{x:start,y:Math.max(bounds.y,ceilingY),w:width,h:Math.max(0,Math.min(bounds.y+bounds.h,rearWallBaseY)-Math.max(bounds.y,ceilingY))},
    materialScale,moduleWidth,structuralStep:moduleWidth*families[definition.family].ribRatio,
    presentationMode:presentation.presentationMode,projection:presentation.presentationMode==='2.5d'?'parallel-oblique-depth-behind-fixed-gameplay':'orthographic',
    ceilingY,rearWallBaseY,apertures,paintRegions:subtractHubShellAperturesV138(bounds,apertures),layers:depthPlanes.map(row=>({...row,
      opacity:definition.sourcePolicy==='original-wall-material'||refuge?1:(row.opacity??1),collidable:false})),
    nativePolicy:'isotropic-crop-and-repeat',sourceStatus:'original-wall-materials-and-authored-architecture',originalGeometryPreserved:true};
}

/** Crop every partial edge in source space. Holes cut rectangles into further
 * native sub-crops, so an authored glass aperture is never painted over and
 * the render evidence describes the pixels that actually reached the canvas. */
export function getHubCompartmentWallTilesV138(image,source,area,{drift=0,scale=null,clip=area,holes=[]}={}) {
  if(!ready(image)||!source||!(source.w>0&&source.h>0)||!(area?.w>0&&area.h>0))return [];
  if(source.x<0||source.y<0||source.x+source.w>image.naturalWidth||source.y+source.h>image.naturalHeight)return [];
  const ratio=scale??Math.min(1,area.h/source.h);if(!(ratio>0&&ratio<=1))return [];
  const tileW=source.w*ratio,tileH=source.h*ratio,tiles=[];
  const phase=((drift%tileW)+tileW)%tileW;
  for(let y=area.y;y<area.y+area.h-1e-8;y+=tileH)for(let x=area.x+phase-tileW;x<area.x+area.w-1e-8;x+=tileW){
    const target=intersect({x,y,w:tileW,h:tileH},intersect(area,clip)||{x:0,y:0,w:0,h:0});if(!target)continue;
    for(const piece of subtractHubShellAperturesV138(target,holes))tiles.push({
      source:{x:source.x+(piece.x-x)/ratio,y:source.y+(piece.y-y)/ratio,w:piece.w/ratio,h:piece.h/ratio},
      target:piece,scaleX:ratio,scaleY:ratio,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight
    });
  }
  return tiles;
}

function drawStiffeners(ctx,plan) {
  const b=plan.wallBounds,p=plan.profile,drift=plan.layers[1].drift,step=plan.structuralStep;
  ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
  ctx.strokeStyle=p.edge;ctx.lineWidth=1;
  for(let x=b.x-step+drift;x<b.x+b.w+step;x+=step){
    if(plan.family==='clinical'){
      ctx.fillStyle='rgba(31,49,46,.22)';ctx.fillRect(x,b.y,5,b.h);
      ctx.fillStyle='rgba(173,186,166,.3)';ctx.fillRect(x+5,b.y,1,b.h);
    }else if(plan.family==='habitat'){
      ctx.fillStyle='rgba(35,39,32,.3)';ctx.fillRect(x,b.y,7,b.h);
      ctx.fillStyle='rgba(160,149,117,.22)';ctx.fillRect(x+6,b.y,1,b.h);
      ctx.strokeStyle=p.edge;line(ctx,[[x+8,b.y+28],[x+23,b.y+12],[x+step-23,b.y+12]]);
    }else if(plan.family==='cargo'){
      ctx.fillStyle='#26332c';ctx.fillRect(x,b.y,12,b.h);ctx.fillStyle='#67715c';ctx.fillRect(x+1,b.y,2,b.h);
      for(const y of [b.y+20,b.y+b.h-24]){ctx.fillStyle='#535e48';ctx.fillRect(x-5,y,22,8);ctx.fillStyle='#9b9b76';ctx.fillRect(x-1,y+3,2,2);ctx.fillRect(x+10,y+3,2,2);}
    }else if(plan.family==='archive'){
      ctx.fillStyle='#1b3731';ctx.fillRect(x,b.y,9,b.h);ctx.fillStyle='#537268';ctx.fillRect(x+2,b.y,1,b.h);
      for(let y=b.y+32;y<b.y+b.h-24;y+=28){ctx.fillStyle='#39564b';ctx.fillRect(x-3,y,15,3);}
    }else{
      ctx.fillStyle=plan.family==='command'?'#1e343c':'#26352d';ctx.fillRect(x,b.y,10,b.h);
      ctx.fillStyle=p.edge;ctx.fillRect(x+2,b.y,2,b.h);
      ctx.strokeStyle=p.edge;ctx.lineWidth=2;
      line(ctx,[[x+9,b.y+4],[x+29,b.y+22],[x+29,b.y+42]]);
      line(ctx,[[x+9,b.y+b.h-4],[x+29,b.y+b.h-22],[x+29,b.y+b.h-42]]);
    }
  }
  if(plan.family==='clinical'||plan.family==='habitat'){
    const y=b.y+b.h*(plan.family==='clinical'?.72:.68);ctx.fillStyle=plan.family==='clinical'?'#58695e':'#494d3f';ctx.fillRect(b.x,y,b.w,5);ctx.fillStyle=p.edge;ctx.fillRect(b.x,y,b.w,1);
  }
  ctx.restore();
}
function drawServiceFrame(ctx,plan) {
  const b=plan.bounds,top=Math.max(b.y+8,plan.ceilingY-8),p=plan.profile,drift=plan.layers[2].drift;
  ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.w,b.h);ctx.clip();
  ctx.fillStyle=p.shade;ctx.fillRect(b.x,b.y,b.w,Math.max(0,plan.ceilingY-b.y));
  for(let row=0;row<p.services;row++){
    ctx.strokeStyle=row===1?p.edge:plan.family==='clinical'?'#758476':'#3d5149';ctx.lineWidth=plan.family==='industrial'?5:3;
    line(ctx,[[b.x-40,top+row*9],[b.x+b.w+40,top+row*9]]);
  }
  for(let x=b.x+52+drift;x<b.x+b.w;x+=plan.moduleWidth){ctx.fillStyle=p.edge;ctx.fillRect(x,top-4,5,p.services*9+4);ctx.fillStyle=p.shade;ctx.fillRect(x-4,top+p.services*9,13,4);}
  ctx.restore();
}

export function drawHubCompartmentShellV138(ctx,room,image,cameraX=0,options={}) {
  const plan=getHubCompartmentShellPlanV138(room,cameraX,options);if(!plan||!ctx)return null;
  if(plan.sourcePolicy==='preserve-native-flight-envelope'||plan.sourcePolicy==='preserve-native-training-wall')return {...plan,handled:false};
  const refuge=plan.sourcePolicy==='preserve-authored-refuge-apertures';
  const native=refuge?options.originalWallImage:image;
  const validNative=ready(native)&&(refuge?native.naturalWidth===1536&&native.naturalHeight===1024:
    native.naturalWidth===HUB_INTERIOR_WALL_ATLAS_V138.width&&native.naturalHeight===HUB_INTERIOR_WALL_ATLAS_V138.height);
  const cell=getHubInteriorWallCellV138(plan.family),tiles=[];
  ctx.save();ctx.globalAlpha=1;ctx.beginPath();ctx.rect(plan.bounds.x,plan.bounds.y,plan.bounds.w,plan.bounds.h);ctx.clip();
  if(refuge){
    if(validNative)for(const layout of [REFUGE_ARCHITECTURE_V87.upperWall,REFUGE_ARCHITECTURE_V87.lowerWall]){
      const [x,y,right,bottom]=layout.source;
      tiles.push(...getHubCompartmentWallTilesV138(native,{x,y,w:right-x,h:bottom-y},{...layout.area,x:plan.bounds.x+layout.area.x},
        {scale:layout.scale,clip:plan.bounds,holes:plan.apertures}));
    }
  }else{
    // The admitted art has alpha up to254. This solid substrate is mandatory:
    // no old exterior or pixel from another background can leak through it.
    ctx.fillStyle=cell.backing;ctx.fillRect(plan.bounds.x,plan.bounds.y,plan.bounds.w,plan.bounds.h);
    if(validNative)tiles.push(...getHubCompartmentWallTilesV138(native,cell.source,plan.wallBounds,{drift:plan.layers[0].drift}));
  }
  for(const tile of tiles){const s=tile.source,t=tile.target;ctx.drawImage(native,s.x,s.y,s.w,s.h,t.x,t.y,t.w,t.h);}
  if(!refuge){drawStiffeners(ctx,plan);drawServiceFrame(ctx,plan);}
  ctx.restore();
  return {...plan,handled:true,asset:validNative?String(native.currentSrc||native.src||''):null,nativeReady:tiles.length>0,
    nativeTiles:tiles,solidBacking:refuge?'preserved-authored-window-free-wall':cell.backing,
    paintedSource:refuge?'preserved-refuge-wall-crops':HUB_INTERIOR_WALL_ATLAS_V138.asset,
    imageStatus:validNative?'loaded-and-painted':'structural-fallback-awaiting-native-image'};
}

/** Replaces the old complete habitat-wall draw made before the room renderer.
 * The upper service void is closed steel rather than a second row of windows.
 * The actual wall material is painted later at its world-space shell stage. */
export function drawHubCompartmentBaseV138(ctx,room,cameraX=0) {
  if(!ctx||!['animal-care','frontier-civil-counter'].includes(room?.id))return false;
  const start=finite(room.xStart),width=finite(room.world?.width,1280),floor=finite(room.world?.floorY,624);
  ctx.save();ctx.translate(-finite(cameraX),0);ctx.fillStyle='#0b161a';ctx.fillRect(start,0,width,floor);
  ctx.fillStyle='#16252a';ctx.fillRect(start,126,width,8);ctx.restore();return true;
}
