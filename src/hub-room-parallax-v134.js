import { resolveHubRoomFarArtV58 } from './hub-art-runtime-v58.js';
import { HUB_AUTHORED_COMPOSITIONS_V133, drawHubRoomPurposeV133 } from './hub-authored-composition-v133.js';
import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
import { HUB_DECKS } from './hub-game.js';
import { HUB_ENVIRONMENT_ATLAS_V134, getHubEnvironmentPanelV134 } from './hub-environment-atlas-v134.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { getHubSpatialPlanV136, hubSpatialPlacementClearV136 } from './hub-spatial-design-v136.js';
import { getHubRoomIdentityReservationsV137 } from './hub-room-identity-v137.js';
import { HUB_INTERIOR_WALL_ATLAS_V138 } from './hub-interior-wall-atlas-v138.js';
import { HUB_COMPARTMENT_SHELLS_V138, drawHubCompartmentShellV138, drawHubCompartmentBaseV138 } from './hub-compartment-shell-v138.js';
import { drawHubRoomBackgroundV168 } from './hub-room-backgrounds-v168.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const ready = image => image?.complete === true && image.naturalWidth > 0 && image.naturalHeight > 0;
const widthOf = room => finite(room?.profile?.worldWidth ?? room?.world?.width, 1280);
const floorOf = room => finite(room?.world?.floorY, 624);
const line = (ctx, points) => { ctx.beginPath(); for (const [index, point] of points.entries()) index ? ctx.lineTo(...point) : ctx.moveTo(...point); ctx.stroke(); };

/** These are visual planes, never another collider/map registry. Compact rooms
 * remain frontal; large reviewed compartments show three different depths.
 * Native PNG/WebP pixels are cropped/tiled with one isotropic scale. */
export const HUB_ROOM_PARALLAX_V134 = Object.freeze(Object.fromEntries(Object.keys(HUB_AUTHORED_COMPOSITIONS_V133).map(id => [id, Object.freeze({
  id, presentationMode: getHubRoomPresentationV119(id).presentationMode,
  nativeSource: resolveHubRoomFarArtV58(id)?.asset || null,
  planes: Object.freeze(['distant-native-wall', 'rear-shell', 'near-service-frame']),
  gameplayPlane: '2d', collidable: false, nativePolicy: 'isotropic-crop-and-repeat',
  sourceStatus: 'existing-native-wall-and-original-generated-rear-equipment'
})])));

export function getHubRoomParallaxPlanV134(room, cameraX = 0, { enabled = true, reducedMotion = false, clip = null } = {}) {
  const id = room?.id, contract = HUB_ROOM_PARALLAX_V134[id];
  if (!contract) return null;
  const x = finite(room.xStart), width = widthOf(room), floorY = floorOf(room);
  const bounds = clip || { x, y: 154, w: width, h: Math.max(0, floorY - 170) };
  const presentation = getHubRoomPresentationV119(room, enabled);
  const activeDepth = enabled && presentation.presentationMode === '2.5d' && !reducedMotion;
  // Camera is expressed in this room's world. Translation into another room
  // cancels exactly; accumulated deck distance can never change its image crop.
  const localEye = finite(cameraX) + 640 - (x + width / 2);
  const layers = [
    { id: 'distant-native-wall', factor: .095, maximumDrift: 72, opacity: .74 },
    { id: 'rear-shell', factor: .052, maximumDrift: 40, opacity: 1 },
    { id: 'near-service-frame', factor: .021, maximumDrift: 16, opacity: 1 }
  ].map(layer => ({ ...layer, factor: activeDepth ? layer.factor : 0,
    drift: activeDepth ? clamp(localEye * layer.factor, -layer.maximumDrift, layer.maximumDrift) : 0,
    collidable: false }));
  return { id, presentationMode: presentation.presentationMode, motion: activeDepth ? 'room-local-camera-parallax' : 'orthographic-stationary',
    bounds: { ...bounds }, floorY, roomWidth: width, localEye, layers, nativePolicy: contract.nativePolicy,
    gameplayPlane: '2d', collidable: false, originalGeometryPreserved: true };
}

/** Tile a native source band at architectural height, never to room width.
 * Partial edge tiles are cropped in source space. Scaling is isotropic and at
 * most 1x; wide annexes gain more bays rather than inflated blurry furniture. */
export function getHubNativeWallTilesV134(image, bounds, drift = 0, { sourceBand = [.04, .72], overscan = 72 } = {}) {
  if (!ready(image) || !bounds || !(bounds.w > 0 && bounds.h > 0)) return [];
  const naturalWidth = image.naturalWidth, naturalHeight = image.naturalHeight;
  const sourceY = clamp(sourceBand[0], 0, .99) * naturalHeight;
  const sourceHeight = Math.max(1, Math.min(naturalHeight - sourceY, (sourceBand[1] - sourceBand[0]) * naturalHeight));
  const scale = Math.min(1, bounds.h / sourceHeight), tileW = naturalWidth * scale, tileH = sourceHeight * scale;
  const start = bounds.x - overscan + drift, end = bounds.x + bounds.w + overscan;
  const rows = Math.ceil(bounds.h / tileH), columns = Math.ceil((end - start) / tileW) + 1;
  const tiles = [];
  for (let row = 0; row < rows; row++) for (let column = -1; column < columns; column++) {
    const x = start + column * tileW, y = bounds.y + row * tileH;
    if (x + tileW <= bounds.x || x >= bounds.x + bounds.w || y >= bounds.y + bounds.h) continue;
    const left = Math.max(bounds.x, x), right = Math.min(bounds.x + bounds.w, x + tileW);
    const height = Math.min(tileH, bounds.y + bounds.h - y);
    tiles.push({ source: { x: (left - x) / scale, y: sourceY, w: (right - left) / scale, h: height / scale },
      target: { x: left, y, w: right - left, h: height }, scaleX: scale, scaleY: scale,
      naturalWidth, naturalHeight, nativeRatio: naturalWidth / naturalHeight });
  }
  return tiles;
}

function drawRearShell(ctx, model, accent) {
  const { bounds: b, layers } = model, offset = layers[1].drift;
  const unit = model.presentationMode === '2.5d' ? 312 : 236;
  const height = Math.min(264, b.h - 24), y = b.y + 10;
  ctx.save(); ctx.translate(offset, 0);
  for (let x = b.x - unit; x < b.x + b.w + unit; x += unit) {
    ctx.fillStyle = 'rgba(7,20,24,.38)'; ctx.fillRect(x + 34, y + 35, unit - 74, height - 56);
    ctx.strokeStyle = 'rgba(60,84,89,.65)'; ctx.lineWidth = 3;
    // A frontal room keeps frontal wall sections even when its native flight
    // or range wall bypasses the material shell. Only the wholly oblique
    // maintenance room may use depth returns.
    if (model.presentationMode === '2.5d') {
      line(ctx, [[x+25,y+30],[x+42,y+10],[x+unit-45,y+10],[x+unit-27,y+30]]);
      line(ctx, [[x+25,y+30],[x+25,y+height-12],[x+42,y+height],[x+unit-45,y+height],[x+unit-27,y+height-12],[x+unit-27,y+30]]);
    } else {
      line(ctx, [[x+25,y+10],[x+unit-27,y+10],[x+unit-27,y+height],[x+25,y+height],[x+25,y+10]]);
      line(ctx, [[x+30,y+15],[x+unit-32,y+15]]);
    }
    ctx.strokeStyle = 'rgba(12,30,34,.75)'; ctx.lineWidth = 8;
    line(ctx, [[x+12,y],[x+12,y+height+10]]);
    ctx.fillStyle = '#344c50'; ctx.fillRect(x+9,y+20,6,19); ctx.fillRect(x+9,y+height-28,6,19);
    ctx.fillStyle = accent; ctx.globalAlpha = .46; ctx.fillRect(x+60,y+18,60,2); ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawNearServices(ctx, model, accent) {
  const { bounds: b, layers } = model, offset = layers[2].drift;
  ctx.save(); ctx.translate(offset, 0);
  // Pipes and brackets occupy the ceiling band and wall sides. There is no
  // opaque foreground across the human lane, console or ladder geometry.
  const top = b.y + 13;
  ctx.strokeStyle = '#22393d'; ctx.lineWidth = 6;
  for (let row = 0; row < 2; row++) line(ctx, [[b.x-60,top+row*13],[b.x+b.w+60,top+row*13]]);
  ctx.strokeStyle = '#51666a'; ctx.lineWidth = 1;
  for (let row = 0; row < 2; row++) line(ctx, [[b.x-60,top+row*13-2],[b.x+b.w+60,top+row*13-2]]);
  for (let x = b.x + 72; x < b.x + b.w; x += 288) {
    ctx.fillStyle = '#2b4246'; ctx.fillRect(x,top-7,6,41); ctx.fillRect(x-5,top+28,16,5);
    ctx.fillStyle = '#112a2d'; ctx.fillRect(x+40,top+44,66,20);
    ctx.strokeStyle = '#3c5a5e'; ctx.lineWidth = 2; ctx.strokeRect(x+40,top+44,66,20);
    ctx.fillStyle = accent; ctx.globalAlpha = .55; ctx.fillRect(x+47,top+49,20,2); ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function getHubRearEquipmentLayoutV134(room, model, atlasImage, options = {}) {
  const panel=getHubEnvironmentPanelV134(room);
  if(!panel || !ready(atlasImage) || atlasImage.naturalWidth!==HUB_ENVIRONMENT_ATLAS_V134.width || atlasImage.naturalHeight!==HUB_ENVIRONMENT_ATLAS_V134.height)return [];
  const b=model.bounds, source=panel.source, maximum=b.w>=1920?2:1;
  // These source panels are equipment fronts, not a whole extra room. Keep
  // their cabinet height close to one Marine, then mount them on a wall bay
  // above the human lane instead of doubling the interactive station below.
  const baseScale=Math.min(1,300/source.w,112/source.h,(b.h-28)/source.h);
  const rearFootY=Math.min(b.y+b.h-10,room.id==='personal-refuge'?500:426);
  const spatial=getHubSpatialPlanV136(room,options), chosen=[];
  const identityReservations=getHubRoomIdentityReservationsV137(room,options);
  const coversIdentity=target=>identityReservations.some(b=>target.x<b.x+b.w&&target.x+target.w>b.x&&target.y<b.y+b.h&&target.y+target.h>b.y);
  const preferred=maximum===2?[.25,.75,.42,.58,.16,.84]:[.55,.3,.74,.43,.2,.82];
  const candidates=[...preferred,...Array.from({length:13},(_,index)=>.2+index*.05)];
  for(const fraction of candidates){
    if(chosen.length>=maximum)break;
    const index=chosen.length,scale=baseScale*(index===1?.92:1),w=source.w*scale,h=source.h*scale;
    const socketBounds={x:b.x+b.w*fraction-w/2,y:rearFootY-h,w,h};
    const target={...socketBounds,x:socketBounds.x+model.layers[1].drift};
    // Reserve the entire drift envelope: a cabinet may not slide through a
    // viewport, ladder, portal or neighbouring bay as the camera moves.
    const envelope={...socketBounds,x:socketBounds.x-40,w:socketBounds.w+80};
    if(!hubSpatialPlacementClearV136(envelope,spatial)||coversIdentity(envelope)||chosen.some(p=>target.x<p.target.x+p.target.w+24&&target.x+target.w>p.target.x-24))continue;
    chosen.push({ id:panel.id,asset:HUB_ENVIRONMENT_ATLAS_V134.asset,source:{...source},
    target,socketBounds,driftEnvelope:envelope,scaleX:scale,scaleY:scale,
    // The generated art contains no room labels or textual UI. Mirroring only
    // the second equipment bay varies pipe/rack silhouettes without touching
    // actual doors, interactable props, characters, or the room's signage.
    mirrored:index===1,
    nativeWidth:HUB_ENVIRONMENT_ATLAS_V134.width,nativeHeight:HUB_ENVIRONMENT_ATLAS_V134.height,
    plane:'rear-equipment',support:'wall-mounted-bay',collidable:false,interactive:false,exact:false,sourceStatus:HUB_ENVIRONMENT_ATLAS_V134.sourceStatus});
  }
  return chosen;
}

export function drawHubRoomParallaxV134(ctx, room, image, cameraX = 0, options = {}) {
  const model = getHubRoomParallaxPlanV134(room, cameraX, options);
  if (!model || !ctx) return null;
  const b = model.bounds, accent = HUB_AUTHORED_COMPOSITIONS_V133[room.id].accent;
  ctx.save(); ctx.beginPath(); ctx.rect(b.x,b.y,b.w,b.h); ctx.clip();
  const shell=options.wallAtlasImage||room.id==='personal-refuge'
    ? drawHubCompartmentShellV138(ctx,room,options.wallAtlasImage,cameraX,{...options,clip:b,layers:model.layers,originalWallImage:image}) : null;
  if(shell?.handled){
    model.nativeTiles=shell.nativeTiles;model.asset=shell.asset;model.nativeReady=shell.nativeReady;model.layers=shell.layers;
  }else{
    ctx.fillStyle='#0b181c';ctx.fillRect(b.x,b.y,b.w,b.h);
    model.nativeTiles=getHubNativeWallTilesV134(image,b,model.layers[0].drift,options);
    model.asset=ready(image)?String(image.currentSrc||image.src||''):null;model.nativeReady=model.nativeTiles.length>0;
    ctx.globalAlpha=model.layers[0].opacity;
    for(const {source:s,target:t}of model.nativeTiles)ctx.drawImage(image,s.x,s.y,s.w,s.h,t.x,t.y,t.w,t.h);
    ctx.globalAlpha=1;drawRearShell(ctx,model,accent);
  }
  model.compartmentShellV138=shell?{...shell,nativeTiles:model.nativeTiles,nativeReady:model.nativeReady,asset:model.asset}:null;
  model.roomBackgroundV168=drawHubRoomBackgroundV168(ctx,room,model,{...options,shell});
  model.equipmentPanels=getHubRearEquipmentLayoutV134(room,model,options.atlasImage,options);
  for(const {source:s,target:t,mirrored} of model.equipmentPanels){
    const drawable=resolveSpriteDrawableV134(options.atlasImage);
    if(mirrored){ctx.save();ctx.translate(t.x+t.w,t.y);ctx.scale(-1,1);ctx.drawImage(drawable,s.x,s.y,s.w,s.h,0,0,t.w,t.h);ctx.restore();}
    else ctx.drawImage(drawable,s.x,s.y,s.w,s.h,t.x,t.y,t.w,t.h);
    // A shallow socket and two fastening feet make the wall mounting explicit.
    ctx.strokeStyle='#344b4e';ctx.lineWidth=2;ctx.strokeRect(t.x-3,t.y-3,t.w+6,t.h+6);
    ctx.fillStyle='#5a6e6b';for(const x of [t.x+10,t.x+t.w-14])ctx.fillRect(x,t.y+t.h+2,4,6);
  }
  if(!shell?.handled)drawNearServices(ctx,model,accent);
  const shade = ctx.createLinearGradient(0,b.y,0,b.y+b.h);
  shade.addColorStop(0,'rgba(3,12,16,.08)'); shade.addColorStop(.58,'rgba(3,12,16,.02)'); shade.addColorStop(1,'rgba(4,14,18,.46)');
  ctx.fillStyle=shade;for(const region of shell?.paintRegions||[b])ctx.fillRect(region.x,region.y,region.w,region.h);
  ctx.restore(); return model;
}

export function withHubRoomParallaxV134(Base) {
  if (Base.hubRoomParallaxV134) return Base;
  return class HubRoomParallaxV134 extends Base {
    static hubRoomParallaxV134 = true;
    recordHubParallaxV134(model, context) {
      if (!model) return false;
      this.hubParallaxModelsV134 ||= new Map();
      this.hubParallaxModelsV134.set(`${context}:${model.id}`, { ...model, context });
      return true;
    }
    getHubEnvironmentAtlasImageV134() {
      if(!this.hubEnvironmentAtlasImageV134 && typeof globalThis.Image==='function') {
        const image=new Image();image.decoding='async';image.src=HUB_ENVIRONMENT_ATLAS_V134.asset;
        this.hubEnvironmentAtlasImageV134=image;
      }
      return this.hubEnvironmentAtlasImageV134 || null;
    }
    getHubCompartmentWallAtlasImageV138() {
      if(!this.hubCompartmentWallAtlasImageV138&&typeof globalThis.Image==='function'){
        const image=new Image();image.decoding='async';image.src=HUB_INTERIOR_WALL_ATLAS_V138.asset;
        this.hubCompartmentWallAtlasImageV138=image;
      }
      return this.hubCompartmentWallAtlasImageV138||null;
    }
    drawHubCompartmentBaseV138(ctx,room,{cameraX=0}={}) {
      return this.editorPlaytest?false:drawHubCompartmentBaseV138(ctx,room,cameraX);
    }
    drawHubRoomFarV58(ctx,room) {
      if (this.editorPlaytest) return super.drawHubRoomFarV58(ctx,room);
      const layer = resolveHubRoomFarArtV58(room.id);
      if (!layer) return super.drawHubRoomFarV58(ctx,room);
      return this.recordHubParallaxV134(drawHubRoomParallaxV134(ctx,room,this.roomLayerImages?.get(layer.asset),this.hubParallaxCameraOverrideV134 ?? this.camera?.x,
        {enabled:this.depthPresentationV116,reducedMotion:this.reducedMotion,atlasImage:this.getHubEnvironmentAtlasImageV134(),wallAtlasImage:this.getHubCompartmentWallAtlasImageV138(),
          doors:this.doorStates,ladders:this.v51Ladders,platforms:this.v51Platforms}), 'room');
    }
    drawAnnexLayerV71(ctx,image,factor,alpha) {
      if (this.editorPlaytest) return super.drawAnnexLayerV71(ctx,image,factor,alpha);
      // The native far and giant old MID no longer overwrite each other. Their
      // replacement is inserted once, immediately before real world geometry.
      return false;
    }
    drawAnnexGeometryV71(ctx,annex) {
      if (!this.editorPlaytest && annex) {
        const images = this.ensureAnnexAssetsV71(annex.id), room = {...annex,xStart:0};
        const wall = annex.id === 'proving-ground' ? this.annexModularImagesV72?.get('/assets/openai/hub/proving-ground/v82/proving-ground-wall-v82.webp') : images.get('far');
        // REFUGE already owns a compact authored 290px compartment. Its
        // overhead remains stationary; only its rear wall is refined here.
        const clip = annex.id === 'personal-refuge' ? {x:0,y:334,w:annex.world.width,h:270} : null;
        this.recordHubParallaxV134(drawHubRoomParallaxV134(ctx,room,wall,this.annexCameraV71?.x,
          {enabled:this.depthPresentationV116,reducedMotion:this.reducedMotion,clip,atlasImage:this.getHubEnvironmentAtlasImageV134(),wallAtlasImage:this.getHubCompartmentWallAtlasImageV138(),
            ladders:annex.ladders,platforms:annex.platforms}), 'annex');
        this.drawHubSpatialRearV136?.(ctx,room);
        this.drawHubRoomIdentityV137?.(ctx,room,{ladders:annex.ladders,platforms:annex.platforms});
      }
      return super.drawAnnexGeometryV71(ctx,annex);
    }
    drawSecurityFeedV132() {
      // A CCTV thumbnail uses its own room camera rather than the position of
      // the person watching it. This temporary value belongs to rendering only.
      if (!this.hubTrainingContactV132?.('cctv')) return super.drawSecurityFeedV132();
      const selected=this.getHubTrainingCommandsV132?.().selectedFeed;
      const room=HUB_DECKS[selected?.deckIndex]?.rooms.find(row=>row.id===selected?.id);
      if (!room) return super.drawSecurityFeedV132();
      const previous=this.hubParallaxCameraOverrideV134;
      this.hubParallaxCameraOverrideV134=room.xStart;
      try { return super.drawSecurityFeedV132(); }
      finally { this.hubParallaxCameraOverrideV134=previous; }
    }
    draw() {
      const result = super.draw();
      if (!this.editorPlaytest && this.hubTrainingV132?.active && this.ctx && this.player) {
        const state = this.hubTrainingV132.course, camera = clamp((state.mounted ? state.loader.x : this.player.x)-420,0,1320),ctx=this.ctx;
        ctx.save(); ctx.translate(-camera,0);
        const room={id:'proving-ground',xStart:0,world:{width:2600,floorY:624}};
        const wall=this.annexModularImagesV72?.get('/assets/openai/hub/proving-ground/v82/proving-ground-wall-v82.webp');
        this.recordHubParallaxV134(drawHubRoomParallaxV134(ctx,room,wall,camera,{enabled:this.depthPresentationV116,reducedMotion:this.reducedMotion,
          clip:{x:0,y:132,w:2600,h:238},atlasImage:this.getHubEnvironmentAtlasImageV134(),wallAtlasImage:this.getHubCompartmentWallAtlasImageV138()}),'loader-training');
        // Keep the original course label above its maximum physical load y386.
        const purposeRoom={...room,xStart:camera,profile:{worldWidth:1280}};
        if(typeof this.drawHubRoomPurposeV133==='function')this.drawHubRoomPurposeV133(ctx,purposeRoom,{top:148});
        else drawHubRoomPurposeV133(ctx,purposeRoom,{top:148});
        ctx.restore();
      }
      return result;
    }
    getSnapshot() {
      const snapshot=super.getSnapshot(), current=this.currentAnnexV71?.() || this.currentRoom?.();
      const context=this.hubTrainingV132?.active?'loader-training':this.isAnnexActiveV71?.()?'annex':'room';
      const id=context==='loader-training'?'proving-ground':current?.id;
      const model=this.hubParallaxModelsV134?.get(`${context}:${id}`) || null;
      return {...snapshot,hubCompartmentShellV138:{active:!this.editorPlaytest,reviewedRooms:Object.keys(HUB_COMPARTMENT_SHELLS_V138).length,
        current:model?.compartmentShellV138||null,gameplayPlane:'2d',sourceStatus:'original-wall-materials-preserved-flight-envelopes-and-refuge-apertures'},hubRoomParallaxV134:{active:!this.editorPlaytest,reviewedRooms:Object.keys(HUB_ROOM_PARALLAX_V134).length,
        layeredRooms:Object.values(HUB_ROOM_PARALLAX_V134).filter(row=>row.presentationMode==='2.5d').length,
        orthographicRooms:Object.values(HUB_ROOM_PARALLAX_V134).filter(row=>row.presentationMode==='2d').length,
        current:model,gameplayPlane:'2d',coordinates:'preserved',sourceStatus:'existing-native-wall-and-original-generated-rear-equipment'}};
    }
  };
}
