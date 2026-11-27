// Generated artwork supplements the existing Canvas renderer. Loading, absent
// or rejected images leave the historical drawing in charge of the same object.
// Source rectangles/pivots use original PNG pixels; the PNGs are never rewritten.
export const EARTH_RASTER_ASSETS_V12=Object.freeze({
  mcsx:Object.freeze({id:'mcsx',path:'assets/raster-v12/mcsx.png',width:1774,height:887,bounds:Object.freeze([34,51,1713,784]),source:Object.freeze([26,43,1729,800]),pivot:Object.freeze([540,390]),kind:'weapon',exact:false}),
  'species19-adult':Object.freeze({id:'species19-adult',path:'assets/raster-v12/species19-adult.png',width:2172,height:724,bounds:Object.freeze([73,80,2032,559]),source:Object.freeze([65,72,2048,575]),pivot:Object.freeze([1086,639]),kind:'creature',exact:false}),
  'joe-mcsx-idle':Object.freeze({id:'joe-mcsx-idle',path:'assets/raster-v12/joe-mcsx-idle.png',width:1024,height:1536,bounds:Object.freeze([198,24,650,1495]),source:Object.freeze([190,16,666,1511]),pivot:Object.freeze([462,1519]),kind:'human',includesWeapon:'mcsx',exact:false}),
  'arthur-idle':Object.freeze({id:'arthur-idle',path:'assets/raster-v12/arthur-idle.png',width:1024,height:1536,bounds:Object.freeze([301,11,404,1521]),source:Object.freeze([293,3,420,1533]),pivot:Object.freeze([506,1532]),kind:'human',exact:false}),
  'wendy-idle':Object.freeze({id:'wendy-idle',path:'assets/raster-v12/wendy-idle.png',width:1024,height:1536,bounds:Object.freeze([265,23,428,1494]),source:Object.freeze([257,15,444,1510]),pivot:Object.freeze([479,1517]),kind:'human',costumeChapter:2,exact:false}),
  'kirsh-idle':Object.freeze({id:'kirsh-idle',path:'assets/raster-v12/kirsh-idle.png',width:1024,height:1536,bounds:Object.freeze([276,24,436,1501]),source:Object.freeze([268,16,452,1517]),pivot:Object.freeze([488,1525]),kind:'human',exact:false}),
  'curly-idle':Object.freeze({id:'curly-idle',path:'assets/raster-v12/curly-idle.png',width:1024,height:1536,bounds:Object.freeze([285,20,420,1507]),source:Object.freeze([277,12,436,1523]),pivot:Object.freeze([485,1527]),kind:'human',costumeChapter:2,exact:false}),
  'nibs-idle':Object.freeze({id:'nibs-idle',path:'assets/raster-v12/nibs-idle.png',width:1024,height:1536,bounds:Object.freeze([286,19,399,1504]),source:Object.freeze([278,11,415,1520]),pivot:Object.freeze([478,1523]),kind:'human',costumeChapter:2,exact:false}),
  'zoo-cylinder':Object.freeze({id:'zoo-cylinder',path:'assets/raster-v12/zoo-cylinder.png',width:887,height:1774,bounds:Object.freeze([186,53,511,1640]),source:Object.freeze([178,45,527,1656]),pivot:Object.freeze([441.5,1693]),kind:'prop',exact:false}),
  'zoo-console':Object.freeze({id:'zoo-console',path:'assets/raster-v12/zoo-console.png',width:1536,height:1024,bounds:Object.freeze([407,49,762,910]),source:Object.freeze([399,41,778,926]),pivot:Object.freeze([788,959]),kind:'prop',exact:false}),
  'zoo-lab-table':Object.freeze({id:'zoo-lab-table',path:'assets/raster-v12/zoo-lab-table.png',width:1774,height:887,bounds:Object.freeze([41,146,1691,627]),source:Object.freeze([33,138,1707,643]),pivot:Object.freeze([886.5,773]),kind:'prop',exact:false}),
  'zoo-cabinet':Object.freeze({id:'zoo-cabinet',path:'assets/raster-v12/zoo-cabinet.png',width:1086,height:1448,bounds:Object.freeze([96,82,895,1306]),source:Object.freeze([88,74,911,1322]),pivot:Object.freeze([543.5,1388]),kind:'prop',exact:false}),
  'zoo-wall-light':Object.freeze({id:'zoo-wall-light',path:'assets/raster-v12/zoo-wall-light.png',width:1774,height:887,bounds:Object.freeze([115,134,1544,655]),source:Object.freeze([107,126,1560,671]),pivot:Object.freeze([887,789]),kind:'prop',exact:false}),
  'zoo-wall-light-off':Object.freeze({id:'zoo-wall-light-off',path:'assets/raster-v12/zoo-wall-light-off.png',width:1774,height:887,bounds:Object.freeze([113,131,1548,657]),source:Object.freeze([105,123,1564,673]),pivot:Object.freeze([887,788]),kind:'prop',variant:'unlit',exact:false}),
  'zoo-pipette':Object.freeze({id:'zoo-pipette',path:'assets/raster-v12/zoo-pipette.png',width:1024,height:1536,bounds:Object.freeze([310,63,378,1415]),source:Object.freeze([302,55,394,1431]),pivot:Object.freeze([499,1478]),kind:'prop',exact:false})
});

// These are visual substitutions of existing Zoo objects, never new colliders.
// The foreground console, other cryo props/rooms and cargo remain unchanged.
export const EARTH_RASTER_PROP_OVERRIDES_V12=Object.freeze({
  'R18-0':Object.freeze({room:'R18',type:'cryo',asset:'zoo-cylinder',layout:'rack-three'}),
  'R18-4':Object.freeze({room:'R18',type:'cryo',asset:'zoo-cylinder',layout:'rack-three'}),
  'R18-wall1':Object.freeze({room:'R18',type:'wall-panel',asset:'zoo-console',layout:'wall'}),
  'R18-wall3':Object.freeze({room:'R18',type:'wall-panel',asset:'zoo-console',layout:'wall'}),
  'R18-wall0':Object.freeze({room:'R18',type:'wall-light',asset:'zoo-wall-light',offAsset:'zoo-wall-light-off',layout:'wall-light'}),
  'R18-wall2':Object.freeze({room:'R18',type:'wall-light',asset:'zoo-wall-light',offAsset:'zoo-wall-light-off',layout:'wall-light'}),
  'R18-wall4':Object.freeze({room:'R18',type:'wall-light',asset:'zoo-wall-light',offAsset:'zoo-wall-light-off',layout:'wall-light'}),
  'R18-island':Object.freeze({room:'R18',type:'console',asset:'zoo-lab-table',layout:'table'})
});

const earthRasterCacheV12=new Map(),earthRasterDrawsV12=new Map();
let earthRasterEnvironmentV12=null,earthRasterEpochV12=0;
const rasterOwnV12=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
const rasterAssetV12=id=>typeof id==='string'&&rasterOwnV12(EARTH_RASTER_ASSETS_V12,id)?EARTH_RASTER_ASSETS_V12[id]:null;

function earthRasterEnvironmentNowV12(){
  const override=earthRasterEnvironmentV12||{};
  return {
    ImageCtor:rasterOwnV12(override,'ImageCtor')?override.ImageCtor:globalThis.Image,
    baseURI:rasterOwnV12(override,'baseURI')?override.baseURI:globalThis.document?.baseURI,
    inline:rasterOwnV12(override,'inline')?override.inline:globalThis.EARTH_RASTER_INLINE_V12,
    notify:rasterOwnV12(override,'notify')?override.notify:null
  };
}

function notifyEarthRasterV12(record){
  const env=earthRasterEnvironmentNowV12(),detail={id:record.id,status:record.status,error:record.error||null};
  if(typeof env.notify==='function'){try{env.notify(detail);}catch{}return;}
  const doc=globalThis.document,EventCtor=globalThis.CustomEvent;
  if(typeof doc?.dispatchEvent==='function'&&typeof EventCtor==='function'){
    try{doc.dispatchEvent(new EventCtor('earth-raster-ready-v12',{detail}));}catch{}
  }
}

export function resolveEarthRasterURLV12(id,environment=earthRasterEnvironmentNowV12()){
  const asset=rasterAssetV12(id);if(!asset)return null;
  const inline=environment.inline?.[asset.path];
  if(typeof inline==='string'&&inline.startsWith('data:image/png;base64,'))return inline;
  if(typeof environment.baseURI!=='string'||!environment.baseURI)return null;
  try{return new URL(asset.path,environment.baseURI).href;}catch{return null;}
}

function requestEarthRasterV12(id){
  const asset=rasterAssetV12(id);if(!asset)return null;
  if(earthRasterCacheV12.has(id))return earthRasterCacheV12.get(id);
  const env=earthRasterEnvironmentNowV12(),url=resolveEarthRasterURLV12(id,env);
  const record={id,path:asset.path,status:'unavailable',error:null,image:null,source:url?(url.startsWith('data:')?'inline':'relative'):null,epoch:earthRasterEpochV12};
  earthRasterCacheV12.set(id,record);
  if(typeof env.ImageCtor!=='function'||!url){record.error='image-environment-unavailable';return record;}
  try{
    const image=new env.ImageCtor();record.image=image;record.status='loading';
    image.onload=()=>{
      if(record.epoch!==earthRasterEpochV12)return;
      if(image.naturalWidth!==asset.width||image.naturalHeight!==asset.height){record.status='error';record.error='unexpected-image-dimensions';}
      else{record.status='ready';record.error=null;}
      notifyEarthRasterV12(record);
    };
    image.onerror=()=>{
      if(record.epoch!==earthRasterEpochV12)return;
      record.status='error';record.error='image-load-failed';notifyEarthRasterV12(record);
    };
    image.decoding='async';image.src=url;
  }catch{record.status='error';record.error='image-load-failed';notifyEarthRasterV12(record);}
  return record;
}

function readyEarthRasterV12(id){
  const item=requestEarthRasterV12(id),asset=rasterAssetV12(id);
  if(item?.status!=='ready'||!item.image?.complete||item.image.naturalWidth!==asset.width||item.image.naturalHeight!==asset.height)return null;
  return item;
}

export function preloadEarthRasterV12(){
  for(const id of Object.keys(EARTH_RASTER_ASSETS_V12))requestEarthRasterV12(id);
  return getEarthRasterDiagnosticsV12();
}

export function getEarthRasterDiagnosticsV12(){
  return {assets:Object.values(EARTH_RASTER_ASSETS_V12).map(asset=>{
    const item=earthRasterCacheV12.get(asset.id),draw=earthRasterDrawsV12.get(asset.id);
    return {id:asset.id,path:asset.path,status:item?.status||'not-requested',error:item?.error||null,source:item?.source||null,draws:draw?.count||0,lastDraw:draw?.last?{...draw.last}:null};
  })};
}

// Explicit injection supports loader/error tests without a DOM or world changes.
export function resetEarthRasterV12(environment=null){
  earthRasterEpochV12++;earthRasterEnvironmentV12=environment;
  earthRasterCacheV12.clear();earthRasterDrawsV12.clear();
}

export function getEarthRasterPlacementV12(id,{x=0,y=0,maxWidth=null,maxHeight=null,scale=1,facing=1}={}){
  const asset=rasterAssetV12(id);if(!asset)return null;
  if(![x,y,scale].every(Number.isFinite)||scale<=0||![-1,1].includes(facing))return null;
  if(maxWidth!==null&&(!Number.isFinite(maxWidth)||maxWidth<=0)||maxHeight!==null&&(!Number.isFinite(maxHeight)||maxHeight<=0))return null;
  if(maxWidth===null&&maxHeight===null)return null;
  const factor=Math.min(maxWidth===null?Infinity:maxWidth/asset.bounds[2],maxHeight===null?Infinity:maxHeight/asset.bounds[3])*scale;
  const [sourceX,sourceY,sourceWidth,sourceHeight]=asset.source;
  return {id,path:asset.path,x,y,facing,sourceX,sourceY,sourceWidth,sourceHeight,offsetX:(sourceX-asset.pivot[0])*factor,offsetY:(sourceY-asset.pivot[1])*factor,width:sourceWidth*factor,height:sourceHeight*factor,visibleWidth:asset.bounds[2]*factor,visibleHeight:asset.bounds[3]*factor,pivotX:asset.pivot[0],pivotY:asset.pivot[1],factor};
}

function drawEarthRasterImageV12(c,id,options,usage,underlay=null){
  const placement=getEarthRasterPlacementV12(id,options);if(!placement||typeof c?.drawImage!=='function')return false;
  const item=readyEarthRasterV12(id);if(!item)return false;
  let drawn=false;c.save();
  try{
    if(underlay)underlay(c);
    c.translate(placement.x,placement.y);c.scale(placement.facing,1);
    c.drawImage(item.image,placement.sourceX,placement.sourceY,placement.sourceWidth,placement.sourceHeight,placement.offsetX,placement.offsetY,placement.width,placement.height);drawn=true;
  }catch{item.status='error';item.error='image-draw-failed';notifyEarthRasterV12(item);}
  finally{c.restore();}
  if(!drawn)return false;
  const previous=earthRasterDrawsV12.get(id);
  earthRasterDrawsV12.set(id,{count:(previous?.count||0)+1,last:{usage,...placement}});
  return true;
}

export function selectEarthRasterWeaponV12(id){return id==='mcsx'?'mcsx':null;}
export function drawEarthRasterWeaponV12(c,x,y,id){
  const asset=selectEarthRasterWeaponV12(id);if(!asset)return false;
  return drawEarthRasterImageV12(c,asset,{x,y,maxWidth:79,maxHeight:40},'weapon:'+id);
}

export function selectEarthRasterHumanV12(role,pose={}){
  if(pose.raster===false||pose.moving||pose.acting||pose.crouching||pose.lowPassage||pose.carrying)return null;
  const weapon=pose.weapon??(role==='joe'?'mcsx':role==='morrow'?'wy-pistol':'none');
  if(role==='joe'&&weapon==='mcsx'&&pose.chapter!==6)return 'joe-mcsx-idle';
  if(role==='arthur'&&weapon==='none')return 'arthur-idle';
  if(role==='kirsh'&&weapon==='none')return 'kirsh-idle';
  if(['wendy','curly','nibs'].includes(role)&&weapon==='none'&&pose.chapter===2&&!pose.initial)return role+'-idle';
  return null;
}

export function isEarthRasterActionActiveV12(engine){
  return Boolean(engine?.hold||engine?.serviceAction||engine?.actionV3||engine?.reloadTime>0||engine?.fireCooldown>0||engine?.effects?.some(effect=>['blade-v10','arc-v10','resonance','push'].includes(effect.kind)));
}

// Catalogue-only preview of a documented costume; callers must not write this
// pose into an actor or save. Gameplay continues to use its actual chapter.
export function getEarthRasterPreviewPoseV12(role){
  if(!['wendy','curly','nibs'].includes(role)||!rasterAssetV12(role+'-idle'))return null;
  return {chapter:2,weapon:'none',initial:false,moving:false,acting:false,crouching:false,lowPassage:false,carrying:false};
}
export function drawEarthRasterHumanV12(c,x,y,role,pose={}){
  const asset=selectEarthRasterHumanV12(role,pose);if(!asset)return false;
  const scale=pose.scale??1;
  return drawEarthRasterImageV12(c,asset,{x,y,maxHeight:122,scale,facing:pose.facing===-1?-1:1},'human:'+role,ctx=>{
    ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(x,y+scale,25*scale,6*scale,0,0,Math.PI*2);ctx.fill();
  });
}

export function selectEarthRasterCreatureV12(enemy){return enemy?.kind==='tick'?'species19-adult':null;}
export function drawEarthRasterCreatureV12(c,x,y,enemy,time,scale=1){
  const asset=selectEarthRasterCreatureV12(enemy);if(!asset)return false;
  // Single ground presentation, not an invented gait or attack animation. The
  // renderer still adds live telegraphs, foam, stun and containment after this.
  return drawEarthRasterImageV12(c,asset,{x,y,maxWidth:78,maxHeight:42,scale,facing:enemy.facing===-1?-1:1},'creature:'+enemy.kind,ctx=>{
    ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(x,y,30*scale,6*scale,0,0,Math.PI*2);ctx.fill();
  });
}

export function selectEarthRasterPropV12(prop,room,powered=true){
  if(!prop?.id||!Array.isArray(room?.props)||!rasterOwnV12(EARTH_RASTER_PROP_OVERRIDES_V12,prop.id))return null;
  const rule=EARTH_RASTER_PROP_OVERRIDES_V12[prop.id];
  if(room.id!==rule.room||prop.type!==rule.type||!room.props.some(p=>p.id===prop.id&&p.type===prop.type))return null;
  return rule.offAsset&&powered===false?rule.offAsset:rule.asset;
}

// Pure plans expose physical support, wall/floor anchors and camera placement.
// Nothing here rewrites a world coordinate, collider, interaction, or save.
export function getEarthRasterPropPlanV12(prop,room,{x=prop?.x,y=0,w=prop?.w,h=prop?.h,powered=true}={}){
  const asset=selectEarthRasterPropV12(prop,room,powered);if(!asset)return null;
  const depth=prop.d??0;
  if(![x,y,w,h,depth].every(Number.isFinite)||w<=0||h<=0||depth<0)return null;
  const rule=EARTH_RASTER_PROP_OVERRIDES_V12[prop.id];
  if(rule.layout==='wall')return {id:prop.id,asset,layout:'wall',support:{x,y:210,w,h:57},sprites:[{x:x+w*.5,y:267,maxWidth:w-4,maxHeight:57}]};
  if(rule.layout==='wall-light')return {id:prop.id,asset,layout:'wall-light',lightOn:powered!==false,support:{x,y:221,w,h:25},sprites:[{x:x+w*.5,y:245,maxWidth:w-3,maxHeight:28}]};
  if(rule.layout==='rack-three')return {id:prop.id,asset,layout:rule.layout,support:{x,y:y-h,w,h:h+depth*.9},sprites:[0,1,2].map(index=>({x:x+w*(index+.5)/3,y:y-7,maxWidth:w/3-5,maxHeight:h-13}))};
  if(rule.layout==='table'){
    const sprite={x:x+w*.5,y,maxWidth:w,maxHeight:h},table=getEarthRasterPlacementV12(asset,sprite);
    // Point (464,240) lies on the visible stainless top of the actual table PNG.
    // The pipette includes its own stand; its bottom rests on that source point.
    const detail={asset:'zoo-pipette',surfaceSource:[464,240],x:table.x+(464-table.pivotX)*table.factor,y:table.y+(240-table.pivotY)*table.factor,maxWidth:18,maxHeight:34};
    return {id:prop.id,asset,layout:'table',support:{x,y:y-h,w,h:h+depth*.9},sprites:[sprite],details:[detail]};
  }
  return null;
}

function drawEarthRasterSupportV12(c,support){
  c.fillStyle='#243630';c.fillRect(support.x,support.y,support.w,support.h);
  c.strokeStyle='#849083';c.lineWidth=2;c.strokeRect(support.x+.5,support.y+.5,support.w-1,support.h-1);
}

export function drawEarthRasterPropV12(c,prop,x,y,w,h,engine){
  // R18 is natively dark. A distinct unlit PNG preserves its actual power
  // state without a tint, a painted-over emitter or a gameplay-state override.
  const plan=getEarthRasterPropPlanV12(prop,engine?.room,{x,y,w,h,powered:Boolean(engine?.powered)});
  if(!plan||typeof c?.drawImage!=='function'||!readyEarthRasterV12(plan.asset))return false;
  c.save();
  try{
    drawEarthRasterSupportV12(c,plan.support);
    if(plan.layout==='wall-light'&&plan.lightOn){
      const glow=c.createRadialGradient(x+w*.5,233,0,x+w*.5,233,90);
      glow.addColorStop(0,'#c7d8de15');glow.addColorStop(1,'#c7d8de00');c.fillStyle=glow;c.fillRect(x-65,175,w+130,160);
    }
    if(plan.layout==='rack-three'||plan.layout==='table'){
      c.fillStyle=plan.layout==='table'?'#304039':'#48584c';c.fillRect(x,y-6,w,(prop.d??0)*.9+6);
      c.fillStyle='#849083';c.fillRect(x,y-6,w,3);
      if(plan.layout==='table'){
        const front=y+(prop.d??0)*.9;
        c.fillStyle='#172b26';for(let row=y+4;row<front-5;row+=8)c.fillRect(x+5,row,w-10,2);
        c.fillRect(x,front-4,w,4);c.fillStyle='#627468';c.fillRect(x,y-3,4,front-y-1);c.fillRect(x+w-4,y-3,4,front-y-1);
      }
    }
    if(!plan.sprites.every(sprite=>drawEarthRasterImageV12(c,plan.asset,sprite,'prop:'+prop.id)))return false;
    // A failed optional detail never removes the table; a failed table never
    // leaves a detail suspended in the air over its historical fallback.
    for(const detail of plan.details||[])drawEarthRasterImageV12(c,detail.asset,detail,'prop-detail:'+prop.id);
    return true;
  }finally{c.restore();}
}

export function getEarthRasterBackdropPlanV12(room,camera=0){
  if(room?.id!=='R18'||room.setDressing!=='zoo'||!Number.isFinite(camera))return null;
  // Keep clear of the raised Zoo room sign (x230..460, y146..214), the panel at
  // x530 and every threshold. This wall detail deliberately has no collider.
  return {id:'R18-wall-cabinet-v12',asset:'zoo-cabinet',support:{x:425-camera,y:233,w:50,h:69},sprite:{x:450-camera,y:300,maxWidth:48,maxHeight:65}};
}

export function drawEarthRasterBackdropV12(c,room,camera=0){
  const plan=getEarthRasterBackdropPlanV12(room,camera);
  if(!plan||plan.support.x+plan.support.w<0||plan.support.x>1280)return false;
  return drawEarthRasterImageV12(c,plan.asset,plan.sprite,'backdrop:'+plan.id,ctx=>drawEarthRasterSupportV12(ctx,plan.support));
}
