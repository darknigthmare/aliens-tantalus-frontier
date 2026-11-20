// A declared visual adaptation of the ecosystem guard role. This module never
// assigns a Praetorian caste/profile or changes combat, physical bounds or saves.
const freeze = Object.freeze;
export const QUEEN_MOTHER_GUARD_ART_V188 = freeze({
  path:'/assets/openai/sprites/normalized/enemies/xenomorph-praetorian-action-sheet.png',
  imageKey:'queen-mother-guard-art-v188',width:1024,height:1024,cellSize:256,
  sha256:'f4c778139b8018952bbd5c27c2fbd57449310b6ef973803750173e8ba769ecda'
});
export const QUEEN_MOTHER_GUARD_PRESENTATION_V188 = freeze({
  referenceBodyHeight:70,referenceSourceHeight:161,idleFramesPerSecond:4,
  walkPixelsPerFrame:7.2,impactSeconds:.1,recoverySplitSeconds:.2,contactSeconds:.3,
  corpseSeconds:1.2,deathFramesPerSecond:7,visualBoundsPadding:4,
  calibrationStatus:'reviewed-static-placement',
  calibrationSha256:'9cc9a53966ba7c7e3e56d108aa340f5a52467e728db850c45824b32369ddb426'
});
// Reviewed anatomical X projected onto the support line; the pelvis is not
// locked vertically. One source scale is shared by every complete cell. Static
// registration is separate from the native transition and scene review.
const sourcePivots = [
  [149,240],[146,240],[148,240],[148,240],
  [145,240],[159,240],[164,240],[166,240],
  [143,240],[114,240],[115,240],[145,240],
  [134,240],[129,240],[126,240],[119,240]
];
export const QUEEN_MOTHER_GUARD_FRAMES_V188 = freeze(sourcePivots.map((pivot,index)=>freeze({
  index,rect:freeze([index%4*256,Math.floor(index/4)*256,256,256]),pivot:freeze(pivot)
})));
const loading = new WeakMap(), contacts = new WeakMap(), movement = new WeakMap();
const clock60 = value => Number.isFinite(value) ? ((value%60)+60)%60 : null;
const sameOwner = (cue,engine) => Boolean(cue && cue.engine===engine && cue.scene===engine?.ecosystemV131);

function ownsSource(image) {
  const source=image?.currentSrc || image?.src, entry=QUEEN_MOTHER_GUARD_ART_V188;
  if (typeof source!=='string' || source.includes('\\')) return false;
  try {
    const declared=globalThis.location?.origin;
    const origin=declared && declared!=='null' ? declared : 'https://queen-mother-guard.invalid';
    const expected=new URL(entry.path,`${origin}/`),url=new URL(source,`${origin}/`);
    return (source===entry.path || source===expected.href) && ['http:','https:'].includes(url.protocol)
      && url.origin===expected.origin && url.pathname===entry.path && !url.search && !url.hash
      && !url.username && !url.password;
  } catch { return false; }
}
function registeredFrames() {
  const entry=QUEEN_MOTHER_GUARD_ART_V188;
  return QUEEN_MOTHER_GUARD_FRAMES_V188.length===16 && QUEEN_MOTHER_GUARD_FRAMES_V188.every((frame,index)=>
    frame.index===index && frame.rect.length===4 && frame.rect.every(Number.isFinite)
    && frame.rect[0]>=0 && frame.rect[1]>=0 && frame.rect[2]===256 && frame.rect[3]===256
    && frame.rect[0]+frame.rect[2]<=entry.width && frame.rect[1]+frame.rect[3]<=entry.height
    && frame.pivot.length===2 && frame.pivot.every(Number.isFinite));
}
export function queenMotherGuardSourceReadyV188(image) {
  const entry=QUEEN_MOTHER_GUARD_ART_V188;
  return Boolean(registeredFrames() && image?.complete && image.naturalWidth===entry.width
    && image.naturalHeight===entry.height && ownsSource(image));
}
export function queenMotherGuardArtReadyV188(images) {
  return images instanceof Map && queenMotherGuardSourceReadyV188(images.get(QUEEN_MOTHER_GUARD_ART_V188.imageKey));
}
/** Entry and successful resume own the single full-atlas request. Late image
 * callbacks settle their own image only; rendering never starts a request. */
export function preloadQueenMotherGuardArtV188(images,{ImageCtor=globalThis.Image}={}) {
  if (!(images instanceof Map) || typeof ImageCtor!=='function' || !registeredFrames()) return;
  const entry=QUEEN_MOTHER_GUARD_ART_V188,prior=images.get(entry.imageKey);
  if (queenMotherGuardSourceReadyV188(prior)
    || (prior && ownsSource(prior) && loading.get(prior)!=='error' && !prior.complete)) return;
  let image; try { image=new ImageCtor(); } catch { return; }
  images.set(entry.imageKey,image);loading.set(image,'loading');image.decoding='async';
  const finish=state=>{
    if (loading.get(image)!=='loading') return;
    loading.set(image,state);image.removeEventListener?.('load',loaded);image.removeEventListener?.('error',failed);
    if (!image.addEventListener) { image.onload=null;image.onerror=null; }
  };
  const loaded=()=>finish(queenMotherGuardSourceReadyV188(image)?'ready':'error'),failed=()=>finish('error');
  if (image.addEventListener) { image.addEventListener('load',loaded);image.addEventListener('error',failed); }
  else { image.onload=loaded;image.onerror=failed; }
  try { image.src=entry.path; } catch { failed(); }
  if (queenMotherGuardSourceReadyV188(image)) loaded();
}

/** Current object + scene + recorded guard descriptor. Other ecosystems reuse
 * these IDs; a catalogue name or a detached old resume object grants nothing. */
export function isQueenMotherGuardArtOwnerV188(engine,actor) {
  const state=engine?.ecosystemV131,descriptor=actor?.ecosystemActorV131,id=actor?.id;
  if (!engine?.ecosystemActiveV131 || state?.operationId!=='queen-mother-song'
    || descriptor?.id!==id || descriptor?.role!=='guard' || descriptor.caste!=null
    || !engine.enemies?.includes(actor) || engine.ecosystemActorV131?.(id)!==actor) return false;
  const initial=/^eco131-guard-[0-5]$/.test(id),wave=/^eco131-wave-(boss-phase-[234]|beacon-[012])-([01])$/.exec(id);
  if (!initial && (!wave || !state.journal?.includes(`wave-${wave[1]}`))) return false;
  return Boolean(state.actors?.some(record=>record.id===id && record.role==='guard' && record.caste==null
    && record.x===descriptor.x && record.floorY===descriptor.floorY));
}

/** Called only after the real native damagePlayer contact returns. No native
 * animation event, cooldown reset or retained insertion hit can create a cue. */
export function markQueenMotherGuardContactV188(engine,actor,acceptedDamage) {
  if (!isQueenMotherGuardArtOwnerV188(engine,actor) || !actor.alive
    || !Number.isFinite(acceptedDamage) || acceptedDamage<=0) return false;
  const clock=clock60(actor.clock);if (clock===null) return false;
  contacts.set(actor,{engine,scene:engine.ecosystemV131,lastClock:clock,age:0});return true;
}
/** Run after native clock advancement and before any AI early return. The
 * transient dies here even off screen; modulo-60 never recreates it. */
export function advanceQueenMotherGuardContactV188(engine,actor,dt) {
  const cue=contacts.get(actor);if (!cue) return;
  if (!isQueenMotherGuardArtOwnerV188(engine,actor) || !sameOwner(cue,engine) || !actor.alive) {
    contacts.delete(actor);return;
  }
  const clock=clock60(actor.clock),step=clock===null ? NaN : (clock-cue.lastClock+60)%60;
  if (dt===0 && step===0) return;
  if (!Number.isFinite(dt) || dt<=0 || dt>.1+1e-7 || !Number.isFinite(step) || Math.abs(step-dt)>1e-7) {
    contacts.delete(actor);return;
  }
  cue.age+=step;cue.lastClock=clock;
  if (cue.age>=QUEEN_MOTHER_GUARD_PRESENTATION_V188.contactSeconds-1e-9) contacts.delete(actor);
}

/** The final production GameEngine captures this before all updateEnemy
 * wrappers and observes after they return, including grace/depth rollbacks. */
export function beginQueenMotherGuardStepV188(engine,actor,delta) {
  if (!isQueenMotherGuardArtOwnerV188(engine,actor) || !actor.alive || !engine.running || engine.paused
    || engine.enemyAtlasLoadingPausedV65 || engine.userCasteLoadingV88 || engine.mission?.state!=='active') return null;
  return {engine,scene:engine.ecosystemV131,x:actor.x,y:actor.y,clock:clock60(actor.clock),dt:Math.min(delta,.1)};
}
export function finishQueenMotherGuardStepV188(engine,actor,before) {
  if (!before || !sameOwner(before,engine) || !isQueenMotherGuardArtOwnerV188(engine,actor) || !actor.alive) return;
  const clock=clock60(actor.clock),dt=before.dt;
  const step=clock===null || before.clock===null ? NaN : (clock-before.clock+60)%60;
  if (dt===0 && step===0 && actor.x===before.x && actor.y===before.y) return;
  if (!Number.isFinite(dt) || dt<=0 || dt>.1+1e-7 || !Number.isFinite(step) || Math.abs(step-dt)>1e-7
    || !Number.isFinite(actor.x) || !Number.isFinite(before.x) || actor.y!==before.y) {
    movement.delete(actor);return;
  }
  const dx=Math.abs(actor.x-before.x),moved=dx>1e-7 && dx<=72*dt+1e-6;
  const prior=movement.get(actor),travel=sameOwner(prior,engine) ? prior.travel : 0;
  const cycle=4*QUEEN_MOTHER_GUARD_PRESENTATION_V188.walkPixelsPerFrame;
  movement.set(actor,{engine,scene:engine.ecosystemV131,moving:moved,travel:(travel+(moved?dx:0))%cycle});
}
export function clearQueenMotherGuardPresentationV188(actor) { contacts.delete(actor);movement.delete(actor); }

export function queenMotherGuardPoseV188(engine,actor) {
  if (!isQueenMotherGuardArtOwnerV188(engine,actor)) return null;
  const timing=QUEEN_MOTHER_GUARD_PRESENTATION_V188;
  if (!actor.alive) {
    if (!(actor.deathClock>0)) return null;
    const elapsed=Math.max(0,timing.corpseSeconds-actor.deathClock);
    return 12+Math.min(3,Math.floor(elapsed*timing.deathFramesPerSecond+1e-9));
  }
  const cue=contacts.get(actor);
  if (sameOwner(cue,engine) && cue.age>=0 && cue.age<timing.contactSeconds) {
    return cue.age<timing.impactSeconds ? 9 : cue.age<timing.recoverySplitSeconds ? 10 : 11;
  }
  if (actor.windup>0) return 8;
  const walk=movement.get(actor),reduced=engine.accessibilityRuntime?.reducedMotion;
  if (sameOwner(walk,engine) && walk.moving) return reduced ? 4 : 4+Math.floor(walk.travel/timing.walkPixelsPerFrame+1e-9)%4;
  // There is no separate hurt row in this atlas. Native hit effects remain
  // responsible for that feedback; the death row is never claimed as a hurt.
  return reduced ? 0 : Math.floor((clock60(actor.clock)??0)*timing.idleFramesPerSecond)%4;
}
function frameFit(actor,index) {
  const frame=QUEEN_MOTHER_GUARD_FRAMES_V188[index];
  if (!frame || !actor || ![actor.x,actor.y,actor.w,actor.h].every(Number.isFinite) || actor.w<=0 || actor.h<=0) return null;
  return {index,frame,x:actor.x+actor.w/2,y:actor.y+actor.h,facing:actor.facing<0?-1:1,
    scale:actor.h/QUEEN_MOTHER_GUARD_PRESENTATION_V188.referenceSourceHeight};
}
export function queenMotherGuardFrameFitV188(engine,actor) { return frameFit(actor,queenMotherGuardPoseV188(engine,actor)); }

/** Body only; native names, health and the guard's ellipse warning stay in
 * the ecosystem renderer above it. Draw is read-only and has no loader. */
export function drawQueenMotherGuardArtV188(ctx,images,engine,actor) {
  if (!isQueenMotherGuardArtOwnerV188(engine,actor) || !queenMotherGuardArtReadyV188(images)) return false;
  const fit=queenMotherGuardFrameFitV188(engine,actor);if (!fit) return false;
  ctx.save();
  try {
    ctx.globalAlpha=!actor.alive ? .3 : actor.actionPhase===1 ? .35 : 1;
    ctx.translate(fit.x,fit.y);ctx.scale(fit.facing*fit.scale,fit.scale);
    const {frame}=fit;
    ctx.drawImage(images.get(QUEEN_MOTHER_GUARD_ART_V188.imageKey),...frame.rect,-frame.pivot[0],-frame.pivot[1],256,256);
  } finally { ctx.restore(); }
  return true;
}
/** All cells and both facings, conservatively. It only extends visibility;
 * no pixel envelope is ever used as a collision or an attack rectangle. */
export function queenMotherGuardVisualBoundsV188(actor) {
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  for (const frame of QUEEN_MOTHER_GUARD_FRAMES_V188) {
    const fit=frameFit(actor,frame.index);if (!fit) return null;
    for (const [x,y] of [[0,0],[256,0],[0,256],[256,256]]) {
      const dx=(x-frame.pivot[0])*fit.scale,dy=(y-frame.pivot[1])*fit.scale;
      left=Math.min(left,fit.x-dx,fit.x+dx);right=Math.max(right,fit.x-dx,fit.x+dx);
      top=Math.min(top,fit.y+dy);bottom=Math.max(bottom,fit.y+dy);
    }
  }
  left=Math.min(left,actor.x-10);right=Math.max(right,actor.x+actor.w);top=Math.min(top,actor.y-25);bottom=Math.max(bottom,actor.y+actor.h);
  const pad=QUEEN_MOTHER_GUARD_PRESENTATION_V188.visualBoundsPadding;
  return {x:left-pad,y:top-pad,w:right-left+2*pad,h:bottom-top+2*pad};
}
