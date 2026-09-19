import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { SHIP_REFUGE_ANNEX_V87 as ROOM, REFUGE_STATIONS_V87, getRefugeInteractionV87 } from '../src/refuge-room-v87.js';
import { REFUGE_ART_V87 as ART, REFUGE_PROP_RECTS_V87 as RECTS, REFUGE_PROPS_LAYOUT_V87 as PROPS,
  REFUGE_HOLOGRAM_ANCHOR_V87, REFUGE_PORTRAIT_LABEL_V87, REFUGE_ARCHITECTURE_V87, REFUGE_GREETING_SECONDS_V87, getRefugePropBoundsV87, getRefugeApertureV87,
  isRefugeArtReadyV87, resolveRefugeHologramFrameV87, drawRefugeHologramV87, drawRefugePropV87, drawRefugeLayerV87 } from '../src/refuge-art-v87.js';
import { SHIP_ANIMAL_ANNEX_V87 } from '../src/ship-animal-habitat-v87.js';
import { buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HUB_TRAVERSAL_PROFILES_V60 } from '../src/hub-v51-runtime.js';
import { PLAYER_VISUAL_CONTRACT_V81, PLAYER_VISUAL_ASSETS_V81 } from '../src/player-visual-contract-v81.js';

const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-8, `${a} != ${b}`);
const overlaps = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const shape = value => Object.fromEntries(['x','y','w','h'].map(key => [key,value[key]]));
const image = role => ({ complete: true, src: ART[role].path, naturalWidth: ART[role].width, naturalHeight: ART[role].height });
const images = () => new Map(Object.keys(ART).map(role => [role,image(role)]));
const hubAt = (x = 444, feet = 624) => ({ player: { x: x-22,y: feet-92,w: 44,h: 92,alive: true }, currentAnnexV71: () => ({ id: ROOM.id }) });
function recorder() {
  const calls = [], values = {};
  const ctx = Object.fromEntries(['save','restore','translate','drawImage','beginPath','rect','clip','fillRect','fillText']
    .map(name => [name,(...args) => calls.push([name,...args])]));
  ctx.measureText = text => ({width:Array.from(String(text)).length*7});
  return { calls,ctx: new Proxy(ctx,{ set(target,key,value) { values[key] = value; calls.push(['set',key,value]); target[key] = value; return true; } }) };
}
function decode(bytes) {
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24],8); assert.equal(bytes[25],6); assert.equal(bytes[28],0);
  const chunks = []; let at = 8;
  while (at+12 <= bytes.length) { const size = bytes.readUInt32BE(at), type = bytes.toString('ascii',at+4,at+8);
    if (type === 'IDAT') chunks.push(bytes.subarray(at+8,at+8+size)); at += size+12; if (type === 'IEND') break; }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width*4, pixels = Buffer.alloc(stride*height);
  assert.equal(packed.length,(stride+1)*height);
  const paeth = (a,b,c) => { const p = a+b-c, da = Math.abs(p-a), db = Math.abs(p-b), dc = Math.abs(p-c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
  let source = 0;
  for (let y = 0; y < height; y++) { const filter = packed[source++]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) { const pos = y*stride+x, a = x >= 4 ? pixels[pos-4] : 0, b = y ? pixels[pos-stride] : 0;
      const c = y && x >= 4 ? pixels[pos-stride-4] : 0;
      pixels[pos] = (packed[source+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter]) & 255; }
    source += stride;
  }
  return { width,height,pixels };
}
function components({ width,height,pixels }) {
  const marked = new Uint8Array(width*height), queue = new Int32Array(width*height), found = [];
  for (let pos = 0; pos < marked.length; pos++) {
    if (marked[pos] || pixels[pos*4+3] <= 16) continue;
    let head = 0, tail = 1, left = width, right = 0, top = height, bottom = 0; queue[0] = pos; marked[pos] = 1;
    while (head < tail) {
      const current = queue[head++], x = current%width, y = Math.floor(current/width);
      left = Math.min(left,x); right = Math.max(right,x); top = Math.min(top,y); bottom = Math.max(bottom,y);
      for (const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        if (x+dx < 0 || x+dx >= width || y+dy < 0 || y+dy >= height) continue;
        const next = current+dy*width+dx;
        if (!marked[next] && pixels[next*4+3] > 16) { marked[next] = 1; queue[tail++] = next; }
      }
    }
    if (tail > 80) found.push({ x:left,y:top,w:right-left+1,h:bottom-top+1,count:tail });
  }
  return found;
}
const decoded = new Map();
async function asset(role) {
  if (!decoded.has(role)) decoded.set(role,(async () => {
    const bytes = await readFile(new URL('..'+ART[role].path,import.meta.url));
    if (ART[role].sha256) assert.equal(createHash('sha256').update(bytes).digest('hex'),ART[role].sha256,'Changed image requires a new alpha/pivot audit');
    const result = decode(bytes); assert.deepEqual([result.width,result.height],[ART[role].width,ART[role].height]); return result;
  })());
  return decoded.get(role);
}

test('REFUGE is a frozen original 1920x720 calm room with no combat, animal-care service or invented personal identity', () => {
  assert.equal(ROOM.id,'personal-refuge'); assert.equal(ROOM.parentDeck,'habitat'); assert.equal(ROOM.parentRoomId,'crew-quarters');
  assert.deepEqual([ROOM.world.width,ROOM.world.height,ROOM.world.floorY],[1920,720,624]);
  assert.equal(ROOM.station.action,'refuge:portrait'); assert.equal(ROOM.station.upgradeId,null);
  assert.equal(ROOM.combatDisabled,true); assert.equal(ROOM.normalHubCreaturesVisible,false);
  assert.equal(ROOM.isolatedLevelTarget,null); assert.equal(ROOM.props.length,8);
  assert.equal(ART.hologram.personalLikeness,false); assert.equal(ART.hologram.identity,'generic-feline-simulation');
  assert.equal(ART.hologram.coverage.fluidityCertified,false);
  const frozen = value => { if (value && typeof value === 'object') { assert.equal(Object.isFrozen(value),true); Object.values(value).forEach(frozen); } };
  frozen(ROOM); frozen(ART); frozen(REFUGE_STATIONS_V87);
  assert.equal(JSON.stringify(ROOM).includes('/morgue/'),false);
  assert.equal(JSON.stringify(ROOM).includes('ship-animal:care'),false);
});

test('quarters REFUGE door has a clear grounded marine lane distinct from animal-care, bunks and ladder capture zones', () => {
  assert.deepEqual(ROOM.parentDoorBounds,{x:380,y:520,w:118,h:104});
  assert.equal(overlaps(ROOM.parentDoorBounds,SHIP_ANIMAL_ANNEX_V87.parentDoorBounds),false);
  const solids = buildHubObstacleGeometryV87(1).filter(item => item.roomId === 'crew-quarters');
  assert.ok(solids.some(item => item.x === 809 && item.w === 174));
  const profile = HUB_TRAVERSAL_PROFILES_V60['crew-quarters'];
  const paintedDoor = getRefugePropBoundsV87('door',ROOM.parentDoorBounds);
  for (const collider of [...solids,...profile.platforms]) {
    assert.equal(overlaps(paintedDoor,collider),false,'door art must not cross the quarters platform');
  }
  for (let center = 350; center <= 498; center += 2) {
    const body = {x:center-22,y:532,w:44,h:92};
    for (const collider of [...solids,...profile.platforms]) assert.equal(overlaps(body,collider),false,JSON.stringify(collider));
    for (const ladder of profile.ladders) assert.ok(Math.abs(center-ladder.x) >= Math.max(46,ladder.w));
  }
  // Geometry is preserved, not silently removed to justify the new door.
  assert.ok(profile.platforms.some(platform => platform.x === 110 && platform.y === 500 && platform.w === 520));
});

test('one unobstructed floor, bidirectional west entrance and all eight non-colliding modular props preserve traversal', () => {
  assert.deepEqual(ROOM.platforms,[{id:'personal-refuge-floor',x:0,y:624,w:1920,h:96,role:'floor'}]);
  assert.deepEqual(ROOM.colliders,[]); assert.deepEqual(ROOM.ladders,[]);
  assert.equal(ROOM.entranceLocalX,144); assert.equal(ROOM.entrance.bidirectional,true);
  const spawn = {x:ROOM.entranceLocalX+ROOM.entrance.w/2+30,y:532,w:44,h:92};
  assert.equal(spawn.x,233); assert.equal(getRefugeInteractionV87(hubAt(spawn.x+22)),null);
  for (const prop of PROPS) {
    assert.deepEqual(shape(prop),getRefugePropBoundsV87(prop.kind,prop)); assert.equal(prop.collidable,false);
    assert.ok(prop.x >= 0 && prop.y >= 0 && prop.x+prop.w <= 1920 && prop.y+prop.h <= 720);
  }
  for (let x = 144; x <= 1850; x += 2) assert.equal(ROOM.colliders.some(solid => overlaps({x,y:532,w:44,h:92},solid)),false);
});

test('five distinct physical station ranges work at floor level without intercepting the west exit', () => {
  assert.equal(REFUGE_STATIONS_V87.length,5);
  assert.deepEqual(REFUGE_STATIONS_V87.map(value => value.action),['refuge:portrait','refuge:terminal','refuge:light','refuge:hologram','refuge:contemplate']);
  for (const station of REFUGE_STATIONS_V87) {
    const hub = hubAt(station.centerX), before = structuredClone(hub.player);
    assert.equal(getRefugeInteractionV87(hub)?.action,station.action); assert.deepEqual(hub.player,before);
    assert.equal(getRefugeInteractionV87(hubAt(station.centerX,611)),null);
    assert.equal(getRefugeInteractionV87(hubAt(station.centerX,637)),null);
    for (const other of REFUGE_STATIONS_V87.filter(value => value !== station)) assert.ok(Math.abs(station.centerX-other.centerX) > station.range+other.range);
  }
  for (const x of [90,144,203,233,277,300,1921]) assert.equal(getRefugeInteractionV87(hubAt(x)),null);
});

test('dead, corrupt, unrelated, editor and transition poses cannot invoke a memorial station', () => {
  for (const patch of [{alive:false},{x:NaN},{y:Infinity},{w:0},{h:-1}]) {
    const hub = hubAt(); Object.assign(hub.player,patch); assert.equal(getRefugeInteractionV87(hub),null);
  }
  for (const patch of [{annexTransitionV71:{}},{editorPlaytest:true},{currentAnnexV71:()=>null,currentRoom:()=>({id:'crew-quarters'})}]) {
    assert.equal(getRefugeInteractionV87({...hubAt(),...patch}),null);
  }
  assert.equal(getRefugeInteractionV87(null),null);
});

test('all published art roles exist with their real PNG dimensions; two dedicated atlas hashes are pinned', async () => {
  for (const role of Object.keys(ART)) { await asset(role); assert.equal(ROOM.art[role],ART[role].path); }
  assert.equal(ROOM.artRoles.length,8);
  assert.equal(ART.prop.width,1774); assert.equal(ART.hologram.height,887);
});

test('eight measured prop crops each contain one complete real silhouette, two guard pixels, and no adjacent object', async () => {
  const actual = await asset('prop'), parts = components(actual); assert.equal(parts.length,8);
  for (const [kind,[l,t,r,b]] of Object.entries(RECTS)) {
    const crop = {x:l,y:t,w:r-l,h:b-t}, inside = parts.filter(part => overlaps(crop,part));
    assert.equal(inside.length,1,kind); const part = inside[0];
    assert.ok(part.x >= l+2 && part.y >= t+2 && part.x+part.w <= r-2 && part.y+part.h <= b-2,kind);
    assert.ok(part.count > 25000,kind+' must be authored bitmap content');
    const target = getRefugePropBoundsV87(kind,{x:100,width:118,bottom:624});
    near(target.w/target.h,crop.w/crop.h); near(target.y+target.h,624);
  }
});

test('portrait and porthole openings are transparent with distinct hardware around the aperture', async () => {
  const actual = await asset('prop');
  for (const kind of ['portrait','porthole']) {
    const [l,t,r,b] = RECTS[kind], bounds = getRefugeApertureV87(kind,{x:l,width:r-l,bottom:b});
    let transparent = 0, count = 0;
    for (let y = Math.ceil(bounds.y+12); y < bounds.y+bounds.h-12; y++) for (let x = Math.ceil(bounds.x+12); x < bounds.x+bounds.w-12; x++) {
      count++; if (actual.pixels[(y*actual.width+x)*4+3] <= 16) transparent++;
    }
    assert.ok(transparent/count > .98,kind); assert.ok(bounds.x > l && bounds.y > t);
  }
});

test('32 holographic crops contain separate complete silhouettes, no nominal-cell clipping and stable paw anchors', async () => {
  const actual = await asset('hologram'), parts = components(actual); assert.equal(parts.length,32);
  for (const frame of ART.hologram.frames) {
    const inside = parts.filter(part => overlaps(frame,part)); assert.equal(inside.length,1,'frame '+frame.index);
    const part = inside[0];
    assert.ok(part.x >= frame.x+2 && part.y >= frame.y+2 && part.x+part.w <= frame.x+frame.w-2 && part.y+part.h <= frame.y+frame.h-2);
    assert.ok(frame.pivotX > 0 && frame.pivotX < frame.w && frame.pivotY > 0 && frame.pivotY < frame.h);
    assert.ok(frame.h*ART.hologram.worldScale < 50,'human92px remains taller than the hologram');
    const {ctx,calls} = recorder();
    const row = Math.floor(frame.index/8), pos = frame.index%8;
    const options = row === 0 ? {time:pos/2} : row === 1 ? {time:6+pos/4} : row === 2 ? {time:8+pos/4} : {time:0,greetingRemaining:2-pos/4};
    assert.equal(drawRefugeHologramV87(ctx,image('hologram'),options),true);
    const draw = calls.find(call => call[0] === 'drawImage'); assert.deepEqual(draw.slice(2,6),[frame.x,frame.y,frame.w,frame.h]);
    near(draw[6]+frame.pivotX*.16,0); near(draw[7]+frame.pivotY*.16,0);
    assert.deepEqual(calls.find(call => call[0] === 'translate'),['translate',REFUGE_HOLOGRAM_ANCHOR_V87.x,REFUGE_HOLOGRAM_ANCHOR_V87.y]);
  }
});

test('idle, tail, blink and two-second non-looping greeting use real poses; reduced motion stays on idle0', () => {
  assert.equal(REFUGE_GREETING_SECONDS_V87,2);
  assert.equal(resolveRefugeHologramFrameV87({time:6}).clipId,'tail');
  assert.equal(resolveRefugeHologramFrameV87({time:8}).clipId,'blink');
  assert.equal(resolveRefugeHologramFrameV87({time:0,greetingRemaining:2}).index,24);
  assert.equal(resolveRefugeHologramFrameV87({time:0,greetingRemaining:.01}).index,31);
  assert.equal(resolveRefugeHologramFrameV87({time:6,greetingRemaining:0}).clipId,'tail');
  assert.equal(resolveRefugeHologramFrameV87({time:9,greetingRemaining:1,reducedMotion:true}).index,0);
  for (const bad of [{time:NaN},{time:-1},{time:Infinity},{time:Number.MAX_SAFE_INTEGER},{greetingRemaining:-1},{greetingRemaining:NaN},{reducedMotion:'yes'}]) assert.equal(resolveRefugeHologramFrameV87(bad),null);
});

test('identity and dimensions guards refuse other sheets, wrong role, incomplete image and corrupt prop sizes', () => {
  assert.equal(isRefugeArtReadyV87('prop',image('prop')),true);
  assert.equal(isRefugeArtReadyV87('hologram',image('prop')),false);
  for (const patch of [{complete:false},{naturalWidth:1775},{naturalHeight:888},{currentSrc:'/wrong.png'},{src:''}]) assert.equal(isRefugeArtReadyV87('prop',{...image('prop'),...patch}),false);
  assert.equal(isRefugeArtReadyV87('__proto__',image('prop')),false);
  for (const bounds of [{x:NaN,width:118,bottom:624},{x:0,width:0,bottom:624},{x:0,width:118,bottom:Infinity},{x:0,y:0,w:-1,h:4}]) assert.equal(getRefugePropBoundsV87('door',bounds),null);
  assert.equal(getRefugePropBoundsV87('unknown',{x:0,width:1,bottom:2}),null);
  const target = getRefugePropBoundsV87('door',ROOM.parentDoorBounds);
  near(target.w/target.h,(1709-1397)/(836-464)); near(target.y+target.h,624);
});

test('far/world/front renderer contract keeps modular crops, independent clipped parallax and foreground below player feet', () => {
  const {ctx,calls} = recorder(); const loaded = images();
  assert.equal(drawRefugeLayerV87(ctx,loaded,{layer:'far',cameraX:640,time:1}),true);
  assert.deepEqual(calls.find(call => call[0] === 'translate'),['translate',-640,0]);
  assert.equal(calls.filter(call => call[0] === 'clip').length,2);
  assert.equal(calls.filter(call => call[0] === 'drawImage' && call[1].src === ART.stars.path).length,2);
  calls.length = 0; assert.equal(drawRefugeLayerV87(ctx,loaded,{layer:'decor',cameraX:640,time:1}),true);
  assert.equal(calls.some(call => call[0] === 'translate' && call[1] === -640),false,'caller already transforms world layers');
  assert.equal(calls.filter(call => call[0] === 'drawImage' && call[1].src === ART.prop.path).length,8);
  assert.equal(calls.filter(call => call[0] === 'drawImage' && call[1].src === ART.hologram.path).length,1);
  assert.ok(calls.some(call => call[0] === 'fillText' && call[1].includes('SIMULATION FÉLINE')));
  calls.length = 0; assert.equal(drawRefugeLayerV87(ctx,loaded,{layer:'front'}),true);
  for (const call of calls.filter(call => call[0] === 'drawImage')) assert.ok(call[7] > 624);
});

test('only decoded local raster data can fill the portrait; no network image, inherited date or fabricated photograph is drawn', () => {
  const loaded = images(), {ctx,calls} = recorder();
  const photo = {complete:true,naturalWidth:600,naturalHeight:400,src:'data:image/jpeg;base64,local'};
  const personal = {name:'Souvenir choisi',dedication:'Texte privé',lightOn:false,photoImage:photo};
  const before = structuredClone(personal);
  drawRefugeLayerV87(ctx,loaded,{layer:'decor',personal});
  assert.equal(calls.filter(call => call[0] === 'drawImage' && call[1] === photo).length,1);
  assert.ok(calls.some(call => call[0] === 'set' && call[1] === 'filter' && call[2].includes('brightness(0.25)')));
  assert.deepEqual(personal,before);
  for (const src of ['https://example.com/private-photo.png','data:image/svg+xml;base64,svg','blob:remote']) {
    calls.length = 0; const remote = {...photo,src}; drawRefugeLayerV87(ctx,loaded,{layer:'decor',personal:{photoImage:remote}});
    assert.equal(calls.some(call => call[0] === 'drawImage' && call[1] === remote),false);
  }
  calls.length = 0;
  drawRefugeLayerV87(ctx,loaded,{layer:'decor',personal:{name:'Un nom personnel très long qui ne doit pas déborder'}});
  const caption = calls.find(call => call[0] === 'fillText' && call[2] === REFUGE_PORTRAIT_LABEL_V87.x);
  assert.equal(caption[3],485); assert.equal(caption[4],176); assert.ok(caption[1].endsWith('…'));
  assert.ok(ctx.measureText(caption[1]).width <= 176);
  const portrait = PROPS.find(prop => prop.kind === 'portrait'), library = PROPS.find(prop => prop.kind === 'library');
  const labelBounds = {x:caption[2]-88,y:caption[3]-11,w:176,h:11};
  assert.equal(overlaps(labelBounds,portrait),false); assert.equal(overlaps(labelBounds,library),false);
  const marineBounds = {x:444-48,y:527.5,w:96,h:96.5};
  assert.equal(overlaps(labelBounds,marineBounds),false);
  const hologramCaption = calls.find(call => call[0] === 'fillText' && call[1] === 'SIMULATION FÉLINE GÉNÉRIQUE');
  assert.equal(hologramCaption[3],512); assert.ok(hologramCaption[3] < marineBounds.y);
});

test('missing or invalid art is not substituted with another identity or a rectangle prop', () => {
  const {ctx,calls} = recorder();
  assert.equal(drawRefugePropV87(ctx,image('hologram'),'portrait',{x:0,width:100,bottom:100}),false);
  assert.equal(drawRefugeHologramV87(ctx,image('prop'),{}),false);
  assert.equal(drawRefugeLayerV87(ctx,new Map(),{layer:'decor'}),false);
  assert.equal(calls.some(call => call[0] === 'drawImage' || call[0] === 'fillRect'),false);
  assert.equal(drawRefugeLayerV87(ctx,images(),{layer:'invalid'}),false);
  assert.equal(drawRefugeLayerV87(ctx,images(),{layer:'far',cameraX:NaN}),false);
});

test('furniture and feline scale are measured against the real 96.5px visible idle Marine, not the 128px padded cell', async () => {
  const player = decode(await readFile(new URL('..'+PLAYER_VISUAL_ASSETS_V81[0].path,import.meta.url)));
  const scale = PLAYER_VISUAL_CONTRACT_V81.surfaces.hub.height/PLAYER_VISUAL_CONTRACT_V81.source.cellHeight;
  let min = 256, max = 0;
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) if (player.pixels[(y*player.width+x)*4+3] > 16) { min = Math.min(min,y); max = Math.max(max,y); }
  const visibleHeight = (max-min+1)*scale; near(visibleHeight,96.5);
  const terminal = PROPS.find(prop => prop.kind === 'terminal'), bench = PROPS.find(prop => prop.kind === 'bench');
  const cushion = PROPS.find(prop => prop.kind === 'cushion'), light = PROPS.find(prop => prop.kind === 'light');
  const portrait = PROPS.find(prop => prop.kind === 'portrait'), library = PROPS.find(prop => prop.kind === 'library');
  near(portrait.y+portrait.h,595); near(portrait.y+portrait.h/2,545.3522388059701);
  near(library.w,110); near(library.y+library.h,594); assert.ok(library.h/visibleHeight > .95 && library.h/visibleHeight < 1.05);
  assert.deepEqual(ROOM.station.bounds,shape(portrait));
  assert.ok(terminal.h/visibleHeight > .85 && terminal.h/visibleHeight < .95);
  assert.ok(bench.h/visibleHeight > .55 && bench.h/visibleHeight < .65);
  for (const frame of ART.hologram.frames) assert.ok(frame.h*ART.hologram.worldScale/visibleHeight > .29 && frame.h*ART.hologram.worldScale/visibleHeight < .34);
  near(light.y+light.h,624); near(cushion.y+cushion.h,624);
  assert.ok(REFUGE_HOLOGRAM_ANCHOR_V87.y > cushion.y && REFUGE_HOLOGRAM_ANCHOR_V87.y < 624);
  assert.ok(ROOM.parentDoorBounds.h > visibleHeight && ROOM.parentDoorBounds.h > 92);
  assert.deepEqual(shape(ROOM.entrance),{x:144,y:520,w:118,h:104});
  near(getRefugePropBoundsV87('door',ROOM.parentDoorBounds).h,getRefugePropBoundsV87('door',ROOM.entrance).h);
});

test('modular architecture has a72.45px ceiling, human-scale panels, unobscured windows and enough clearance for the real maximum jump', async () => {
  const { ceiling,service,upperWall,lowerWall } = REFUGE_ARCHITECTURE_V87;
  near(ceiling.area.h,72.45); near(ceiling.area.y+ceiling.area.h,334);
  assert.ok((624-ceiling.bottom)/96.5 < 3.01);
  near(service.area.y+service.area.h,ceiling.area.y);
  near(upperWall.area.y+upperWall.area.h,lowerWall.area.y); near(lowerWall.area.y+lowerWall.area.h,624);
  for (const prop of PROPS) assert.equal(overlaps(ceiling.area,prop),false,prop.id+' must not be covered by the new ceiling');
  const windows = PROPS.filter(prop => prop.kind === 'porthole');
  near(windows[0].y+windows[0].h,510); near(windows[1].y+windows[1].h,550);
  assert.ok(windows.every(prop => prop.y > ceiling.bottom+8));
  const text = await readFile(new URL('../src/hub-v71-runtime.js',import.meta.url),'utf8');
  const gravity = Number(text.match(/const GRAVITY = (\d+)/)[1]), jumpSpeed = Number(text.match(/const JUMP_SPEED = (\d+)/)[1]);
  const maximumRise = jumpSpeed**2/(2*gravity);
  const wholeSpriteTop = 624-PLAYER_VISUAL_CONTRACT_V81.surfaces.hub.height*PLAYER_VISUAL_CONTRACT_V81.pivot.y/256;
  assert.ok(wholeSpriteTop-maximumRise > ceiling.bottom+50,'even the padded sprite never enters the ceiling at jump apex');
  const {ctx,calls} = recorder(), loaded = images();
  drawRefugeLayerV87(ctx,loaded,{layer:'far'});
  const wallTiles = calls.filter(call => call[0] === 'drawImage' && call[1].src === ART.far.path);
  assert.ok(wallTiles.length > 12,'separate scaled wall panels replace the old stretched image');
  for (const draw of wallTiles) {
    near(draw[8]/draw[4],.375); near(draw[9]/draw[5],.375);
    assert.ok(draw[8] <= 576 && draw[9] <= 138.75);
    assert.ok(draw[6] >= 0 && draw[7] >= 0 && draw[6]+draw[8] <= 1920.001 && draw[7]+draw[9] <= 624.001);
  }
  assert.ok(calls.some(call => call[0] === 'set' && call[1] === 'filter' && call[2].includes('brightness(0.23)')));
  calls.length = 0; drawRefugeLayerV87(ctx,loaded,{layer:'decor'});
  const ceilingTiles = calls.filter(call => call[0] === 'drawImage' && call[1].src === ART.overhead.path);
  assert.equal(ceilingTiles.length,4);
  for (const draw of ceilingTiles) { near(draw[8]/draw[4],.35); near(draw[9]/draw[5],.35); near(draw[7]+draw[9],334); }
  assert.equal(calls.some(call => call[0] === 'fillText' && call[1] === 'VUE APAISANTE SIMULÉE'),false,'no redundant caption through the lowered window');
});
