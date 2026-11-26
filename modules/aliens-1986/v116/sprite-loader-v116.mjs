/* Raster presentation only. No gameplay state, timers or network manifests. */
const isFiniteNumber = n => typeof n === 'number' && Number.isFinite(n);
export function validateSpriteEntriesV116(entries) {
  if (!Array.isArray(entries)) throw new TypeError('Sprite entries must be an array.');
  const ids = new Set();
  return Object.freeze(entries.filter(a => a.runtimeEligible !== false).map(a => {
    if (!a || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.id || '') || ids.has(a.id)) throw new Error('Invalid or duplicate sprite id.');
    ids.add(a.id);
    if (typeof a.path !== 'string' || !/^assets\/[a-zA-Z0-9/_-]+\.png$/.test(a.path) || a.path.includes('..')) throw new Error('Invalid sprite path: ' + a.id);
    if (![a.width,a.height].every(n => Number.isSafeInteger(n) && n > 0)) throw new Error('Invalid sprite dimensions: ' + a.id);
    const b = a.bbox;
    if (!Array.isArray(b) || b.length !== 4 || !b.every(isFiniteNumber) || b[0] < 0 || b[1] < 0 || b[2] > a.width || b[3] > a.height || b[2] <= b[0] || b[3] <= b[1]) throw new Error('Invalid sprite bounds: ' + a.id);
    const pivot = a.pivot || [(b[0]+b[2])/2,b[3]];
    if (!Array.isArray(pivot) || pivot.length !== 2 || !pivot.every(isFiniteNumber)) throw new Error('Invalid sprite pivot: ' + a.id);
    return Object.freeze({id:a.id,path:a.path,width:a.width,height:a.height,bbox:Object.freeze([...b]),pivot:Object.freeze([...pivot]),category:String(a.category || ''),pose:String(a.pose || ''),heldWeapon:a.heldWeapon === true,bboxStatus:a.bboxStatus === 'full-image-unmeasured'?'full-image-unmeasured':'alpha128-measured'});
  }));
}
export function createSpriteStoreV116(entries, {
  baseURI = globalThis.document?.baseURI,
  imageFactory = () => new globalThis.Image(),
  canvasFactory = () => typeof globalThis.OffscreenCanvas === 'function'?new globalThis.OffscreenCanvas(1,1):globalThis.document.createElement('canvas'),
  maximumDecoded = 36
} = {}) {
  const records = validateSpriteEntriesV116(entries);
  if (!baseURI) throw new Error('A document base URI is required for raster assets.');
  if (!Number.isSafeInteger(maximumDecoded) || maximumDecoded < 1) throw new Error('Invalid raster cache size.');
  const base = new URL(baseURI), assets = new Map(records.map(a => [a.id,a])), cache = new Map(), used = new Set(), errors = new Map();
  let clock = 0, requested = 0, loaded = 0, draws = 0, evicted = 0, measured = 0;
  function measure(asset,image) {
    if (asset.bboxStatus !== 'full-image-unmeasured') return asset;
    const canvas=canvasFactory();canvas.width=asset.width;canvas.height=asset.height;
    try {
      const context=canvas.getContext('2d',{willReadFrequently:true});
      if (!context) throw new Error('Cannot measure raster alpha bounds.');
      context.drawImage(image,0,0);
      const pixels=context.getImageData(0,0,asset.width,asset.height).data;
      let l=asset.width,t=asset.height,r=0,b=0;
      for (let y=0;y<asset.height;y++) for(let x=0;x<asset.width;x++) {
        if(pixels[(y*asset.width+x)*4+3]<128)continue;
        l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x+1);b=Math.max(b,y+1);
      }
      if (r<=l || b<=t) throw new Error('Sprite has no visible alpha bounds.');
      measured++;
      return Object.freeze({...asset,bbox:Object.freeze([l,t,r,b]),pivot:Object.freeze([(l+r)/2,b]),bboxStatus:'alpha128-measured'});
    } finally {canvas.width=1;canvas.height=1;}
  }
  function trim(except) {
    const ready = [...cache.entries()].filter(([,r]) => r.state === 'ready');
    if (ready.length <= maximumDecoded) return;
    ready.sort((a,b) => a[1].touched-b[1].touched);
    let excess = ready.length-maximumDecoded;
    for (const [id] of ready) {
      if (excess > 0 && id !== except) { cache.delete(id); evicted++; excess--; }
    }
  }
  function request(id) {
    const asset = assets.get(id);
    if (!asset) return null;
    let record = cache.get(id);
    if (record) { record.touched = ++clock; return record; }
    if (errors.has(id)) return null;
    record = {asset,image:null,state:'loading',touched:++clock};
    cache.set(id,record); requested++;
    function fail(reason) {
      if (record.state !== 'loading') return;
      record.state = 'failed'; record.image = null; errors.set(id,String(reason));
    }
    try {
      const url = new URL('../../' + asset.path,base);
      if (url.origin !== base.origin) throw new Error('Sprite URL escaped document origin.');
      const image = imageFactory();
      record.image = image; image.decoding = 'async';
      image.onload = () => {
        if (record.state !== 'loading') return;
        const width = image.naturalWidth || image.width, height = image.naturalHeight || image.height;
        if (width !== asset.width || height !== asset.height) { fail('Decoded dimensions disagree with manifest.'); return; }
        try {record.asset=measure(asset,image);} catch(error) {fail(error.message || error);return;}
        record.state = 'ready'; record.touched = ++clock; loaded++;
        trim(id);
      };
      image.onerror = () => fail('Image could not be decoded.');
      image.src = url.href;
      if (image.complete && (image.naturalWidth || image.width)) image.onload();
    } catch (error) { fail(error.message || error); }
    return record;
  }
  function get(id) { const record = request(id); return record?.state === 'ready' ? record : null; }
  function mark(id) { used.add(id); draws++; }
  function draw(context,id,options = {}) {
    const record = get(id);
    if (!record) return false;
    const {asset,image} = record, [l,t,r,b] = asset.bbox, bw=r-l,bh=b-t;
    const {x=0,y=0,flip=false,alpha=1} = options;
    let scale;
    if (isFiniteNumber(options.height) && options.height > 0) scale=options.height/bh;
    if (isFiniteNumber(options.width) && options.width > 0) scale=scale===undefined?options.width/bw:Math.min(scale,options.width/bw);
    if (!isFiniteNumber(scale) || scale <= 0) return false;
    const pivot = options.pivot || asset.pivot;
    context.save();
    context.globalAlpha *= Math.max(0,Math.min(1,alpha));
    context.translate(x,y);
    if (flip) context.scale(-1,1);
    context.drawImage(image,l,t,bw,bh,(l-pivot[0])*scale,(t-pivot[1])*scale,bw*scale,bh*scale);
    context.restore(); mark(id); return true;
  }
  function surface(context,id,{x,y,width,height,alpha=1} = {}) {
    const record = get(id);
    if (!record || ![x,y,width,height].every(isFiniteNumber) || width <= 0 || height <= 0) return false;
    const {asset,image} = record, [l,t,r,b] = asset.bbox, bw=r-l,bh=b-t, scale=Math.max(width/bw,height/bh), sw=width/scale,sh=height/scale;
    context.save(); context.globalAlpha *= Math.max(0,Math.min(1,alpha));
    context.drawImage(image,l+(bw-sw)/2,t+(bh-sh)/2,sw,sh,x,y,width,height);
    context.restore(); mark(id); return true;
  }
  return Object.freeze({
    has:id=>assets.has(id),asset:id=>cache.get(id)?.asset||assets.get(id)||null,get,draw,surface,
    status:()=>({version:116,requested,loaded,failed:errors.size,draws,evicted,measured,decoded:[...cache.values()].filter(r=>r.state==='ready').length,used:[...used].sort(),errors:Object.fromEntries(errors)})
  });
}
