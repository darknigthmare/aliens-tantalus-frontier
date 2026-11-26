/** Raster presentation for the immutable Alien Isolation 0.8 renderer.
 * Reuses the original draw methods, world coordinates, depth sort, occlusion,
 * animation indices, mirroring, EVA checks and actor visibility.
 * No engine state, rules, collision data or save storage is written here.
 */
export const VISUAL_PACK_VERSION = '1.0.0';
const CHARACTER_POSES = Object.freeze({
  amanda: ['idle', 'walk', 'crouch', 'crouch-walk'], eva: ['idle', 'walk', 'crouch', 'crouch-walk'], marlow: ['idle', 'walk'],
  alien: ['idle', 'walk'], joe: ['idle', 'walk'], human: ['idle', 'walk'], facehugger: ['idle', 'walk'],
  nora: ['idle', 'walk', 'crouch', 'crouch-walk'], elias: ['idle', 'walk', 'crouch', 'crouch-walk'],
});
const UI_KEYS = new Set(['noise', 'flare', 'emp', 'medkit']);
const TOOL_NAMES = Object.freeze({tracker:'Détecteur de mouvements',torch:'Lampe torche',tuner:'Syntoniseur de sécurité',flame:'Lance-flammes'});
const installations = new WeakMap();
const cropCache = new WeakMap();
const assert = (value, message) => { if (!value) throw new Error(message); };
const keyFor = (kind, pose, frame) => kind === 'facehugger'
  ? 'characters/facehugger.svg' : `characters/${kind}_${pose}_${frame}.svg`;

export function validateVisualManifest(raw, content) {
  assert(raw && raw.schema === 1 && raw.module === 'alien-isolation' && raw.sourceVersion === '0.8.0' && raw.packVersion === '1.0.0', 'Unsupported visual manifest');
  assert(Array.isArray(raw.assets) && raw.assets.length <= 160, 'Invalid asset inventory');
  const ids = new Set();
  for (const asset of raw.assets) {
    assert(asset && /^[a-z0-9][a-z0-9_-]{0,79}$/.test(asset.id) && !ids.has(asset.id), 'Invalid or duplicate asset ID');
    assert(typeof asset.src === 'string' && /^\.?\/?[a-zA-Z0-9_./-]+\.png$/.test(asset.src)
      && !asset.src.startsWith('/') && !asset.src.split('/').includes('..'), 'Asset path must be a local PNG');
    assert(asset.facing === undefined || ['right', 'left'].includes(asset.facing), 'Unknown source facing');
    assert(asset.requireAlpha === undefined || typeof asset.requireAlpha === 'boolean', 'Invalid alpha requirement');
    ids.add(asset.id);
  }
  const props = new Set(content.rooms.flatMap(room => room.props.map(prop => prop.kind)));
  const propIds = new Map(content.rooms.flatMap(room => room.props.map(prop => [prop.id, prop.kind])));
  const names = new Set(content.characters.map(person => person.name));
  const bindings = raw.bindings || {};
  for (const type of ['characters', 'props', 'ui', 'portraits', 'tools']) {
    assert(bindings[type] === undefined || Array.isArray(bindings[type]), 'Invalid binding list: ' + type);
  }
  const used = new Set();
  for (const binding of bindings.characters || []) {
    assert(CHARACTER_POSES[binding.kind]?.includes(binding.pose), 'Unknown character role or pose');
    const moving = binding.pose === 'walk' || binding.pose === 'crouch-walk';
    assert(Array.isArray(binding.frames) && (moving ? [2, 8].includes(binding.frames.length) : binding.frames.length === 1)
      && new Set(binding.frames).size === binding.frames.length
      && binding.frames.every(id => ids.has(id)), 'Moving poses need two or eight distinct frames; still poses need one');
    const key = `${binding.kind}/${binding.pose}`;
    assert(!used.has(key), 'Duplicate character binding: ' + key); used.add(key);
    assert(binding.entityIds === undefined, 'V1 generic character bindings cannot impersonate specific story characters');
  }
  used.clear();
  for (const binding of bindings.props || []) {
    assert(props.has(binding.kind) && ids.has(binding.asset), 'Unknown prop role or asset');
    assert(!used.has(binding.kind), 'Duplicate prop binding: ' + binding.kind); used.add(binding.kind);
    assert(binding.openedAsset === undefined || ids.has(binding.openedAsset), 'Unknown opened prop asset');
    assert(binding.propIds === undefined || Array.isArray(binding.propIds) && binding.propIds.length
      && binding.propIds.every(id => propIds.get(id) === binding.kind), 'Specific prop IDs must match the declared kind');
  }
  used.clear();
  for (const binding of bindings.ui || []) {
    assert(UI_KEYS.has(binding.key) && ids.has(binding.asset), 'UI art may only depict implemented quick items');
    assert(!used.has(binding.key), 'Duplicate UI binding'); used.add(binding.key);
  }
  used.clear();
  for (const binding of bindings.tools || []) {
    assert(Object.hasOwn(TOOL_NAMES,binding.key) && ids.has(binding.asset), 'Tool art must match a real acquired tool');
    assert(!used.has(binding.key), 'Duplicate tool binding'); used.add(binding.key);
  }
  used.clear();
  for (const binding of bindings.portraits || []) {
    assert(names.has(binding.name) && ids.has(binding.asset), 'Portrait must match an existing character dossier');
    assert(!used.has(binding.name), 'Duplicate dossier portrait'); used.add(binding.name);
  }
  return raw;
}

function imageBounds(image, documentRef, requireAlpha = false) {
  // Weak edge pixels in generated cutouts must not determine the body's size.
  // This is a draw-time source rectangle; the original PNG bytes are untouched.
  const threshold = requireAlpha ? 127 : 16;
  if (cropCache.get(image)?.has(threshold)) return cropCache.get(image).get(threshold);
  const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
  assert(width > 0 && height > 0 && width <= 8192 && height <= 8192, 'Invalid raster dimensions');
  const ratio = Math.min(1, 768 / Math.max(width, height));
  const canvas = documentRef.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const context = canvas.getContext('2d', {willReadFrequently: true});
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let left = canvas.width, top = canvas.height, right = -1, bottom = -1, transparent = 0;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const alpha = pixels[(y * canvas.width + x) * 4 + 3];
    if (alpha < 8) transparent++;
    if (alpha > threshold) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  }
  assert(right >= left && bottom >= top, 'Empty image');
  assert(!requireAlpha || transparent > pixels.length / 4 * .01, 'PNG has no usable transparent background');
  const sx = width / canvas.width, sy = height / canvas.height;
  const result = {transparentRatio:transparent/(pixels.length/4),x: Math.max(0, left - 1) * sx, y: Math.max(0, top - 1) * sy,
    width: Math.min(canvas.width - Math.max(0, left - 1), right - left + 3) * sx,
    height: Math.min(canvas.height - Math.max(0, top - 1), bottom - top + 3) * sy};
  if (!cropCache.has(image)) cropCache.set(image, new Map());
  cropCache.get(image).set(threshold, result); return result;
}

function normalizeToReference(source, reference, documentRef, facing = 'right', preserveBodyHeight = false, bodyHeight) {
  const src = imageBounds(source, documentRef, true), target = imageBounds(reference, documentRef);
  const canvas = documentRef.createElement('canvas');
  canvas.width = reference.naturalWidth || reference.width;
  canvas.height = reference.naturalHeight || reference.height;
  const context = canvas.getContext('2d');
  // A wide stride must not make the person shorter. Character poses may use
  // the transparent horizontal margin of the original 256px frame; props stay
  // inside the original useful width as well as its height.
  const usableWidth = preserveBodyHeight ? canvas.width - 8 : target.width;
  const scale = Math.min(usableWidth / src.width, (bodyHeight || target.height) / src.height);
  const width = src.width * scale, height = src.height * scale;
  const x = target.x + (target.width - width) / 2, y = target.y + target.height - height;
  context.save();
  if (facing === 'left') {
    context.translate(x+width,y); context.scale(-1,1);
    context.drawImage(source,src.x,src.y,src.width,src.height,0,0,width,height);
  } else context.drawImage(source,src.x,src.y,src.width,src.height,x,y,width,height);
  context.restore();
  return canvas;
}

function normalizeSaveTerminal(source, reference, documentRef) {
  // The recovered save interaction is a non-solid service point, often in
  // front of the rear wall. An anchored service stand keeps its exact location
  // without inventing a wall that the unchanged collision model could cross.
  const canvas = documentRef.createElement('canvas');
  canvas.width = reference.naturalWidth || reference.width;
  canvas.height = reference.naturalHeight || reference.height;
  const c = canvas.getContext('2d'), src = imageBounds(source, documentRef, true);
  c.save(); c.scale(canvas.width / 256, canvas.height / 256);
  c.fillStyle = '#07130ed9'; c.beginPath(); c.ellipse(128, 235, 43, 8, 0, 0, Math.PI * 2); c.fill();
  const metal = c.createLinearGradient(112, 0, 144, 0);
  metal.addColorStop(0, '#1a2c29'); metal.addColorStop(.45, '#72817a'); metal.addColorStop(1, '#293c36');
  c.fillStyle = metal; c.fillRect(117, 114, 23, 120);
  c.fillStyle = '#465950'; c.fillRect(91, 230, 74, 8);
  c.strokeStyle = '#91a08a'; c.lineWidth = 1.5; c.strokeRect(91, 230, 74, 8);
  c.fillStyle = '#253a31'; c.beginPath(); c.roundRect(75, 42, 106, 141, 6); c.fill();
  c.strokeStyle = '#81907e'; c.stroke();
  for (const x of [81, 175]) for (const y of [48, 177]) {
    c.fillStyle = '#bec4a6'; c.fillRect(x - 1, y - 1, 2, 2);
  }
  const scale = Math.min(98 / src.width, 153 / src.height);
  const width = src.width * scale, height = src.height * scale;
  c.drawImage(source, src.x, src.y, src.width, src.height, 128 - width / 2, 46, width, height);
  c.restore(); return canvas;
}

function normalizeDeskTerminal(source, reference, documentRef) {
  // The PNG depicts only a CRT. Preserve the native keyboard, desk, feet and
  // shadow instead of replacing a supported workstation with a floating box.
  const canvas = documentRef.createElement('canvas');
  canvas.width = reference.naturalWidth || reference.width;
  canvas.height = reference.naturalHeight || reference.height;
  const c = canvas.getContext('2d'), src = imageBounds(source, documentRef, true);
  const scaleX = canvas.width / 256, scaleY = canvas.height / 256;
  // Rasterize the complete SVG once, then preserve its lower integer rows.
  // Cropping an SVG at a fractional source coordinate can resample the desk.
  const deskY = Math.round(166 * scaleY);
  c.drawImage(reference, 0, 0);
  c.clearRect(0, 0, canvas.width, deskY);
  c.save(); c.beginPath(); c.rect(0, 0, canvas.width, deskY); c.clip();
  c.scale(scaleX, scaleY);
  const scale = Math.min(124 / src.width, 112 / src.height);
  const width = src.width * scale, height = src.height * scale;
  c.drawImage(source, src.x, src.y, src.width, src.height, 118 - width / 2, 166 - height, width, height);
  c.restore(); return canvas;
}

function loadImage(url, ImageClass, timeout) {
  return new Promise((resolve, reject) => {
    const image = new ImageClass();
    const timer = setTimeout(() => { image.onload = image.onerror = null; reject(new Error('Image load timeout')); }, timeout);
    image.onload = () => { clearTimeout(timer); resolve(image); };
    image.onerror = () => { clearTimeout(timer); reject(new Error('Image could not load')); };
    image.src = url;
  });
}

function addInventoryArt(api, portraits, tools, documentRef, report) {
  const container = documentRef.getElementById('modalBody');
  if (!container || !portraits.size && !tools.size) return () => {};
  const refresh = () => {
    for (const card of container.querySelectorAll('#codexCards .codex-card')) {
      const name = card.querySelector('h3')?.textContent.trim(), source = portraits.get(name);
      if (!source || card.querySelector('[data-isolation-portrait]')) continue;
      const picture = documentRef.createElement('img');
      picture.dataset.isolationPortrait = name; picture.alt = name;
      picture.src = source.src; picture.loading = 'lazy'; picture.decoding = 'async';
      picture.style.cssText = 'display:block;width:100%;height:230px;object-fit:contain;object-position:center bottom;margin:0 0 16px';
      card.prepend(picture); report.portraitsDisplayed.add(name);
    }
    const systems=container.querySelector('.equipment-systems');
    if(systems) for(const [key,image] of tools) {
      if(!api.engine.s.tools[key]||systems.querySelector('[data-isolation-tool="'+key+'"]'))continue;
      const card=documentRef.createElement('article');card.className='codex-card';card.dataset.isolationTool=key;
      const heading=documentRef.createElement('h3');heading.textContent=TOOL_NAMES[key];
      const picture=documentRef.createElement('img');picture.src=image.src;picture.alt=TOOL_NAMES[key];picture.decoding='async';
      picture.style.cssText='display:block;width:100%;height:180px;object-fit:contain;margin:0 0 12px';
      const status=documentRef.createElement('p');status.textContent='Équipement acquis';
      card.append(picture,heading,status);systems.append(card);report.toolsDisplayed.add(key);
    }
  };
  const observer = new MutationObserver(refresh);
  observer.observe(container, {childList:true, subtree:true}); refresh();
  return () => { observer.disconnect(); for (const image of container.querySelectorAll('[data-isolation-portrait],[data-isolation-tool]')) image.remove(); };
}

export async function installIsolationRasterPresentation(api, manifest, {
  manifestURL, documentRef = globalThis.document, ImageClass = globalThis.Image, timeout = 15000,
} = {}) {
  assert(api?.renderer && api?.CONTENT?.meta.version === '0.8.0', 'Isolation 0.8 runtime is required');
  if (installations.has(api.renderer)) return installations.get(api.renderer);
  validateVisualManifest(manifest, api.CONTENT);
  const base = new URL(manifestURL || './manifest.json', documentRef.baseURI);
  const report = {version:VISUAL_PACK_VERSION, loaded:[], failed:[], characters:[], props:[], ui:[], portraits:[],
    renderedProps:new Set(), renderedCharacters:new Set(), renderedProjectiles:new Set(), portraitsDisplayed:new Set(), toolsDisplayed:new Set(),tools:[]};
  const loaded = new Map(), specs = new Map(manifest.assets.map(asset => [asset.id, asset]));
  await api.renderer.ready;
  await Promise.all(manifest.assets.map(async asset => {
    try {
      const url = new URL(asset.src, base);
      assert(url.origin === base.origin && url.pathname.startsWith(new URL('./', base).pathname), 'Asset escaped the visual pack');
      const image = await loadImage(url.href, ImageClass, timeout);
      imageBounds(image, documentRef, asset.requireAlpha !== false);
      loaded.set(asset.id, image); report.loaded.push(asset.id);
    } catch (error) { report.failed.push({id:asset.id, reason:String(error.message || error)}); }
  }));
  const renderer = api.renderer, originals = new Map(), replacements = new Map(), propReplacements = new Map(),characterReplacements=new Map(),projectileImages=new Map();
  const remember = key => { if (!originals.has(key)) originals.set(key, renderer.images[key]); return originals.get(key); };
  for (const binding of manifest.bindings?.characters || []) {
    if (!binding.frames.every(id => loaded.has(id))) continue;
    const originalPose=binding.pose.startsWith('crouch')?'crouch':'walk';
    const baseReference = remember(keyFor(binding.kind, originalPose, 0));
    if (!baseReference) { report.failed.push({id:binding.kind+'/'+binding.pose,reason:'Original role sprite is absent'}); continue; }
    try {
      // All supplied frames in one pose use a common body height. A compact
      // passing step must not grow taller than the wider stride next to it.
      const target=imageBounds(baseReference,documentRef),usableWidth=(baseReference.naturalWidth||baseReference.width)-8;
      const bodyHeight=Math.min(target.height,...binding.frames.map(id=>{
        const bounds=imageBounds(loaded.get(id),documentRef,true);return usableWidth*bounds.height/bounds.width;
      }));
      const frames=binding.frames.map(id=>normalizeToReference(loaded.get(id),baseReference,documentRef,specs.get(id).facing||'right',true,bodyHeight));
      characterReplacements.set(binding.kind+'/'+binding.pose,frames);
      report.characters.push({kind:binding.kind,pose:binding.pose,providedFrames:frames.length});
    } catch (error) { report.failed.push({id:binding.kind+'/'+binding.pose,reason:String(error.message || error)}); }
  }
  for (const binding of manifest.bindings?.props || []) {
    const reference = remember('props/'+binding.kind+'.svg');
    if (!reference || !loaded.has(binding.asset)) continue;
    try {
      const main = binding.kind === 'save'
        ? normalizeSaveTerminal(loaded.get(binding.asset), reference, documentRef)
        : binding.kind === 'terminal'
        ? normalizeDeskTerminal(loaded.get(binding.asset), reference, documentRef)
        : normalizeToReference(loaded.get(binding.asset), reference, documentRef);
      const opened = binding.openedAsset && loaded.has(binding.openedAsset)
        ? normalizeToReference(loaded.get(binding.openedAsset), reference, documentRef) : null;
      propReplacements.set(binding.kind, {binding, main, opened}); report.props.push(binding.kind);
    } catch (error) { report.failed.push({id:binding.kind,reason:String(error.message || error)}); }
  }
  for (const binding of manifest.bindings?.ui || []) {
    if (!loaded.has(binding.asset)) continue;
    const key = 'ui/'+binding.key+'.svg';
    if (remember(key)) { replacements.set(key, loaded.get(binding.asset)); report.ui.push(binding.key); }
    if (['noise', 'flare', 'emp'].includes(binding.key)) {
      try {
        const image = loaded.get(binding.asset), bounds = imageBounds(image, documentRef, true);
        const scale = Math.min(14 / bounds.width, 10 / bounds.height);
        projectileImages.set(binding.key, {image, bounds, width:bounds.width * scale, height:bounds.height * scale});
      } catch (error) { report.failed.push({id:'projectile/'+binding.key, reason:String(error.message || error)}); }
    }
  }
  // Commit the complete prepared image bank in one synchronous turn. Failed
  // individual assets leave their original SVG available and visible.
  for (const [key, image] of replacements) renderer.images[key] = image;
  const originalCharacter=renderer.character, motion=new WeakMap();
  const characterWithRasterPresentation=function(entity,kind){
    const engine=this.engine,s=engine.s,contact=kind==='nora'||kind==='elias';
    if(kind==='alien'&&entity.mode==='vent')return originalCharacter.call(this,entity,kind);
    const previous=motion.get(entity),delta=previous&&previous.room===s.room?Math.hypot(entity.x-previous.x,entity.y-previous.y):0;
    const moving=engine.paused?previous?.moving===true:entity===s?engine.frameTravel>.001:delta>.001;
    const travelled=entity===s?s.stats.distance:(previous?.travelled||0)+(delta<100?delta:0);
    const low=kind==='amanda'?s.crouched:contact&&(entity.careful||entity.lowPose);
    const role=kind==='amanda'&&engine.room.exterior?'eva':kind;
    const pose=low?(moving?'crouch-walk':'crouch'):(moving?'walk':'idle');
    motion.set(entity,{x:entity.x,y:entity.y,room:s.room,travelled,moving});
    const frames=characterReplacements.get(role+'/'+pose);
    if(!frames)return originalCharacter.call(this,entity,kind);
    const originalFrame=kind==='amanda'?Math.floor(s.stats.distance/23)%8:contact?(entity.stepDistance>0?Math.floor(entity.travelled/23)%8:0):Math.floor(s.time*(kind==='alien'?7:4))%8;
    const key=keyFor(role,low?'crouch':'walk',originalFrame),before=this.images[key];
    if(!before)return originalCharacter.call(this,entity,kind);
    this.images[key]=frames[moving?Math.floor(travelled/23)%frames.length:0];
    try{report.renderedCharacters.add(role+'/'+pose);return originalCharacter.call(this,entity,kind);}
    finally{this.images[key]=before;}
  };
  renderer.character = characterWithRasterPresentation;
  const originalProp = renderer.prop;
  const propWithRasterPresentation = function(prop) {
    const prepared = propReplacements.get(prop.kind);
    if (!prepared || prepared.binding.propIds && !prepared.binding.propIds.includes(prop.id)) return originalProp.call(this, prop);
    const s = this.engine.s;
    const opened = s.opened.includes(prop.id) || prop.interactive === 'supply' && this.engine.refuges.collected(prop.part);
    const image = opened ? prepared.opened : prepared.main;
    if (!image) return originalProp.call(this, prop);
    const key = 'props/'+prop.kind+'.svg', before = this.images[key];
    this.images[key] = image;
    try { report.renderedProps.add(prop.kind); return originalProp.call(this, prop); }
    finally { this.images[key] = before; }
  };
  renderer.prop = propWithRasterPresentation;
  const originalFlightObjects = renderer.flightObjects;
  const flightObjectsWithRasterPresentation = function() {
    const objects = this.engine.s.projectiles.filter(object => object.room === this.engine.s.room);
    if (!objects.some(object => projectileImages.has(object.kind))) return originalFlightObjects.call(this);
    // Frozen 0.8 draws each projectile body with two rect() calls. Scope their
    // replacement to this draw only: native projection, rotation, shadow and
    // fuse ring remain inside the original method, with no copied physics.
    const originalRect = this.rect;
    let index = 0, replaced = false;
    this.rect = function(x, y, width, height, ...style) {
      if (x === -5 && y === -4 && width === 10 && height === 8) {
        const object = objects[index], prepared = object && projectileImages.get(object.kind);
        replaced = !!prepared;
        if (prepared) {
          const {image, bounds:b, width:w, height:h} = prepared;
          this.c.drawImage(image, b.x, b.y, b.width, b.height, -w / 2, -h / 2, w, h);
          report.renderedProjectiles.add(object.kind); return;
        }
      } else if (x === -3 && y === -2 && width === 6 && height === 2) {
        index++; if (replaced) { replaced = false; return; }
      }
      return originalRect.call(this, x, y, width, height, ...style);
    };
    try { return originalFlightObjects.call(this); }
    finally { this.rect = originalRect; }
  };
  renderer.flightObjects = flightObjectsWithRasterPresentation;
  api.quickControls?.ready();
  const portraits = new Map();
  for (const binding of manifest.bindings?.portraits || []) if (loaded.has(binding.asset)) {
    portraits.set(binding.name, loaded.get(binding.asset)); report.portraits.push(binding.name);
  }
  const tools=new Map();
  for(const binding of manifest.bindings?.tools||[])if(loaded.has(binding.asset)){tools.set(binding.key,loaded.get(binding.asset));report.tools.push(binding.key);}
  const removePortraits = addInventoryArt(api, portraits, tools, documentRef, report);
  const result = Object.freeze({
    version:VISUAL_PACK_VERSION,
    snapshot:() => ({...report,loaded:[...report.loaded],failed:report.failed.map(row=>({...row})),
      characters:report.characters.map(row=>({...row})), props:[...report.props], ui:[...report.ui],
      portraits:[...report.portraits], tools:[...report.tools],
      renderedProps:[...report.renderedProps],renderedCharacters:[...report.renderedCharacters],renderedProjectiles:[...report.renderedProjectiles],portraitsDisplayed:[...report.portraitsDisplayed],toolsDisplayed:[...report.toolsDisplayed]}),
    uninstall:() => {
      for (const [key, value] of originals) renderer.images[key] = value;
      if (renderer.prop === propWithRasterPresentation) renderer.prop = originalProp;
      if (renderer.character === characterWithRasterPresentation) renderer.character = originalCharacter;
      if (renderer.flightObjects === flightObjectsWithRasterPresentation) renderer.flightObjects = originalFlightObjects;
      removePortraits(); api.quickControls?.ready(); installations.delete(renderer);
    },
  });
  installations.set(renderer, result); return result;
}

// This module is injected only into the derived runtime. The recovered game and
// its immutable source corpus retain their original bytes.
if(typeof window!=='undefined'&&typeof document!=='undefined'){
  document.body.dataset.visualPack='loading';
  try{
    const manifestURL=new URL('./manifest.json',import.meta.url);
    const response=await fetch(manifestURL);
    if(!response.ok)throw new Error('Visual manifest could not load');
    const result=await installIsolationRasterPresentation(window.__isolation,await response.json(),{manifestURL});
    window.__isolationVisualV1=result;
    document.body.dataset.visualPack=result.snapshot().failed.length?'partial':'ready';
  }catch(error){
    document.body.dataset.visualPack='failed';
    window.__isolationVisualV1=Object.freeze({version:VISUAL_PACK_VERSION,snapshot:()=>({failed:[{id:'manifest',reason:String(error.message||error)}]})});
    console.warn('Isolation visual pack: original presentation retained.',error.message);
  }
}
