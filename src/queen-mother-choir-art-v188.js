// Original Tantalus appearance for the three existing Choir targets. This
// presentation assigns no caste and changes no combat, physics or save data.
const freeze = Object.freeze;
export const QUEEN_MOTHER_CHOIR_ART_V188 = freeze({
  path:'/assets/queen-mother/v188/choirs-original.png',imageKey:'queen-mother-choir-art-v188',
  width:1254,height:1254,cellSize:627,
  sha256:'2284ad37841fa32c1c09b3351c26e9636b5e60df8dd4b5c51cfd397cca4e5db8'
});
export const QUEEN_MOTHER_CHOIR_PRESENTATION_V188 = freeze({
  referenceBodyHeight:90,referenceSourceHeight:525,idleFramesPerSecond:1,
  corpseSeconds:1.2,visualBoundsPadding:4,calibrationStatus:'reviewed-static-placement',
  calibrationSha256:'404c963f4be3ea9a35539e936ea8c24706ce1d31cfc198f52b197f7037af0083'
});
// A structural base junction projected to each support line, not a pelvis or
// alpha-box centre. The near-frontal source and all four complete cells share
// one scale; the contracted and neutralized shapes remain naturally lower.
export const QUEEN_MOTHER_CHOIR_FRAMES_V188 = freeze([
  ['presence-a',[327,592]],['presence-b',[303,592]],
  ['reaction',[327,566]],['neutralized',[303,566]]
].map(([name,pivot],index)=>freeze({
  index,name,rect:freeze([index%2*627,Math.floor(index/2)*627,627,627]),pivot:freeze(pivot)
})));
const loading = new WeakMap();
const clock60 = value => Number.isFinite(value) ? ((value%60)+60)%60 : 0;

function ownsSource(image) {
  const source=image?.currentSrc || image?.src,entry=QUEEN_MOTHER_CHOIR_ART_V188;
  if (typeof source!=='string' || source.includes('\\')) return false;
  try {
    const declared=globalThis.location?.origin;
    const origin=declared && declared!=='null' ? declared : 'https://queen-mother-choir.invalid';
    const expected=new URL(entry.path,`${origin}/`),url=new URL(source,`${origin}/`);
    return (source===entry.path || source===expected.href) && ['http:','https:'].includes(url.protocol)
      && url.origin===expected.origin && url.pathname===entry.path && !url.search && !url.hash
      && !url.username && !url.password;
  } catch { return false; }
}
function registeredFrames() {
  const entry=QUEEN_MOTHER_CHOIR_ART_V188;
  return QUEEN_MOTHER_CHOIR_FRAMES_V188.length===4 && QUEEN_MOTHER_CHOIR_FRAMES_V188.every((frame,index)=>
    frame.index===index && frame.rect.length===4 && frame.rect.every(Number.isFinite)
    && frame.rect[0]>=0 && frame.rect[1]>=0 && frame.rect[2]===627 && frame.rect[3]===627
    && frame.rect[0]+frame.rect[2]<=entry.width && frame.rect[1]+frame.rect[3]<=entry.height
    && frame.pivot.length===2 && frame.pivot.every(Number.isFinite));
}
export function queenMotherChoirSourceReadyV188(image) {
  const entry=QUEEN_MOTHER_CHOIR_ART_V188;
  return Boolean(registeredFrames() && image?.complete && image.naturalWidth===entry.width
    && image.naturalHeight===entry.height && ownsSource(image));
}
export function queenMotherChoirArtReadyV188(images) {
  return images instanceof Map && queenMotherChoirSourceReadyV188(images.get(QUEEN_MOTHER_CHOIR_ART_V188.imageKey));
}
/** Entry and successful resume own the complete, independent Choir source.
 * Late callbacks settle only their own image. Drawing never loads an asset. */
export function preloadQueenMotherChoirArtV188(images,{ImageCtor=globalThis.Image}={}) {
  if (!(images instanceof Map) || typeof ImageCtor!=='function' || !registeredFrames()) return;
  const entry=QUEEN_MOTHER_CHOIR_ART_V188,prior=images.get(entry.imageKey);
  if (queenMotherChoirSourceReadyV188(prior)
    || (prior && ownsSource(prior) && loading.get(prior)!=='error' && !prior.complete)) return;
  let image;try { image=new ImageCtor(); } catch { return; }
  images.set(entry.imageKey,image);loading.set(image,'loading');image.decoding='async';
  const finish=state=>{
    if (loading.get(image)!=='loading') return;
    loading.set(image,state);image.removeEventListener?.('load',loaded);image.removeEventListener?.('error',failed);
    if (!image.addEventListener) { image.onload=null;image.onerror=null; }
  };
  const loaded=()=>finish(queenMotherChoirSourceReadyV188(image)?'ready':'error'),failed=()=>finish('error');
  if (image.addEventListener) { image.addEventListener('load',loaded);image.addEventListener('error',failed); }
  else { image.onload=loaded;image.onerror=failed; }
  try { image.src=entry.path; } catch { failed(); }
  if (queenMotherChoirSourceReadyV188(image)) loaded();
}

/** Exact current target and recorded index. Ownership survives the final
 * target's death and the immediate transition to mother-1; it is not an AI
 * phase gate. Other ecosystems and old resume objects remain excluded. */
export function isQueenMotherChoirArtOwnerV188(engine,actor) {
  const state=engine?.ecosystemV131,descriptor=actor?.ecosystemActorV131,id=actor?.id;
  const match=typeof id==='string' && /^eco131-target-([0-2])$/.exec(id);
  if (!engine?.ecosystemActiveV131 || state?.operationId!=='queen-mother-song' || !match
    || descriptor?.id!==id || descriptor?.role!=='target' || descriptor.targetIndex!==Number(match[1])
    || descriptor.caste!=null || !engine.enemies?.includes(actor) || engine.ecosystemActorV131?.(id)!==actor) return false;
  return Boolean(state.actors?.some(record=>record.id===id && record.role==='target' && record.caste==null
    && record.targetIndex===descriptor.targetIndex && record.x===descriptor.x && record.floorY===descriptor.floorY));
}
export function queenMotherChoirPoseV188(engine,actor) {
  if (!isQueenMotherChoirArtOwnerV188(engine,actor)) return null;
  if (!actor.alive) return actor.deathClock>0 ? 3 : null;
  // Only the already-native incoming-hit clock selects this reaction. No
  // contact, windup, influence, projectile or private replay cue is invented.
  if (actor.hurtClock>0) return 2;
  return engine.accessibilityRuntime?.reducedMotion ? 0
    : Math.floor(clock60(actor.clock)*QUEEN_MOTHER_CHOIR_PRESENTATION_V188.idleFramesPerSecond)%2;
}
function frameFit(actor,index) {
  const frame=QUEEN_MOTHER_CHOIR_FRAMES_V188[index];
  if (!frame || !actor || ![actor.x,actor.y,actor.w,actor.h].every(Number.isFinite) || actor.w<=0 || actor.h<=0) return null;
  return {index,frame,x:actor.x+actor.w/2,y:actor.y+actor.h,facing:actor.facing<0?-1:1,
    scale:actor.h/QUEEN_MOTHER_CHOIR_PRESENTATION_V188.referenceSourceHeight};
}
export function queenMotherChoirFrameFitV188(engine,actor) { return frameFit(actor,queenMotherChoirPoseV188(engine,actor)); }

/** Body only. The native name, health bar and target warning stay above it
 * outside the body transform. Drawing has no gameplay or loading side effect. */
export function drawQueenMotherChoirArtV188(ctx,images,engine,actor) {
  if (!isQueenMotherChoirArtOwnerV188(engine,actor) || !queenMotherChoirArtReadyV188(images)) return false;
  const fit=queenMotherChoirFrameFitV188(engine,actor);if (!fit) return false;
  ctx.save();
  try {
    ctx.globalAlpha=!actor.alive ? .3 : actor.actionPhase===1 ? .35 : 1;
    ctx.translate(fit.x,fit.y);ctx.scale(fit.facing*fit.scale,fit.scale);
    const {frame}=fit;
    ctx.drawImage(images.get(QUEEN_MOTHER_CHOIR_ART_V188.imageKey),...frame.rect,-frame.pivot[0],-frame.pivot[1],627,627);
  } finally { ctx.restore(); }
  return true;
}
/** Full cells, both facings and all four states form a conservative envelope.
 * It may extend scene visibility only, never collisions or damage geometry. */
export function queenMotherChoirVisualBoundsV188(actor) {
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  for (const frame of QUEEN_MOTHER_CHOIR_FRAMES_V188) {
    const fit=frameFit(actor,frame.index);if (!fit) return null;
    for (const [x,y] of [[0,0],[627,0],[0,627],[627,627]]) {
      const dx=(x-frame.pivot[0])*fit.scale,dy=(y-frame.pivot[1])*fit.scale;
      left=Math.min(left,fit.x-dx,fit.x+dx);right=Math.max(right,fit.x-dx,fit.x+dx);
      top=Math.min(top,fit.y+dy);bottom=Math.max(bottom,fit.y+dy);
    }
  }
  left=Math.min(left,actor.x-10);right=Math.max(right,actor.x+actor.w);top=Math.min(top,actor.y-25);bottom=Math.max(bottom,actor.y+actor.h);
  const pad=QUEEN_MOTHER_CHOIR_PRESENTATION_V188.visualBoundsPadding;
  return {x:left-pad,y:top-pad,w:right-left+2*pad,h:bottom-top+2*pad};
}
