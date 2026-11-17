// Queen Mother's modular presentation. The ecosystem controller alone owns
// combat, physical bounds and persisted clocks. No draw call advances state.
const freeze = Object.freeze;
export const QUEEN_MOTHER_ART_IDS_V188 = freeze(['rest', 'action', 'arms']);
export const QUEEN_MOTHER_ART_V188 = freeze({
  rest: freeze({ path:'/assets/queen-mother/v188/adult-rest-anticipation.png', imageKey:'queen-mother-rest-v188',
    width:1254,height:1254,sha256:'f22750aa4da56bf7200087acc5fe727052da076c8ecaf8f61bde64a4ebc7eb72' }),
  // Its anatomical registration must also be present before kit admission.
  action: freeze({ path:'/assets/queen-mother/v188/adult-action-death.png', imageKey:'queen-mother-action-v188',
    width:1254,height:1254,sha256:'d4fe4d25f496f1245de056666c96851a7ca41fc9342e8ef1a0f88eb2713ce725' }),
  arms: freeze({ path:'/assets/queen-mother/v188/adult-arms.png', imageKey:'queen-mother-arms-v188',
    width:1254,height:1254,sha256:'d6e34554ffbb5a0b0a444c4e3f91d956691c8f3fd248ed99baa0481bd92bf593' })
});
const cell = index => freeze([index % 2 * 627, Math.floor(index / 2) * 627, 627, 627]);
export const QUEEN_MOTHER_ARMS_V188 = freeze(Object.fromEntries([
  ['large-near',0,[145,145],.12], ['large-far',1,[130,145],.115],
  ['small-near',2,[155,205],.085], ['small-far',3,[130,220],.085]
].map(([id,index,pivot,scale]) => [id,freeze({index,rect:cell(index),pivot:freeze(pivot),scale})])));
const limbPlacements = entries => freeze(Object.fromEntries(entries.map(([id,attach,angle]) =>
  [id,freeze({attach:freeze(attach),angle})])));
const liveArms = limbPlacements([
  ['large-near',[339,182],4], ['large-far',[344,184],-40],
  ['small-near',[370,251],50], ['small-far',[351,232],-20]
]);
const actionArms = freeze({
  emission:limbPlacements([
    ['large-near',[350,180],4],['large-far',[355,182],-40],
    ['small-near',[381,249],50],['small-far',[362,230],-20]
  ]),
  recovery:limbPlacements([
    ['large-near',[328,203],4],['large-far',[333,205],-40],
    ['small-near',[359,272],50],['small-far',[340,253],-20]
  ]),
  collapse:limbPlacements([
    ['large-near',[365,245],40],['large-far',[370,247],0],
    ['small-near',[400,285],90],['small-far',[385,265],20]
  ]),
  neutralized:limbPlacements([
    ['large-near',[370,410],95],['large-far',[375,412],110],
    ['small-near',[415,440],100],['small-far',[395,425],120]
  ])
});
const bodyFrame = (sourceId,index,pivot,referenceHeight,arms) => freeze({
  sourceId,index,rect:cell(index),pivot:freeze(pivot),referenceHeight,arms
});
export const QUEEN_MOTHER_POSES_V188 = freeze([
  'rest-0','rest-1','anticipation-early','anticipation-advanced','emission','recovery','collapse','neutralized'
]);
export const QUEEN_MOTHER_FRAMES_V188 = freeze({
  'rest-0':bodyFrame('rest',0,[272,609],593,liveArms),
  'rest-1':bodyFrame('rest',1,[272,609],593,liveArms),
  'anticipation-early':bodyFrame('rest',2,[272,609],593,liveArms),
  'anticipation-advanced':bodyFrame('rest',3,[272,609],593,liveArms),
  emission:bodyFrame('action',0,[272,614],593,actionArms.emission),
  recovery:bodyFrame('action',1,[272,614],593,actionArms.recovery),
  collapse:bodyFrame('action',2,[272,570],593,actionArms.collapse),
  neutralized:bodyFrame('action',3,[272,549],593,actionArms.neutralized)
});
export const QUEEN_MOTHER_PRESENTATION_V188 = freeze({
  referenceBodyHeight:210,windupSplit:.425,idleFramesPerSecond:2,
  emissionSeconds:.12,salvoSeconds:.32,collapseSeconds:.25,corpseSeconds:1.2,
  visualBoundsPadding:4,
  layerOrder:freeze(['large-far','small-far','body','large-near','small-near'])
});
const loading = new WeakMap(), salvos = new WeakMap();
const clock60 = value => Number.isFinite(value) ? ((value % 60) + 60) % 60 : null;

function ownsSource(image,id) {
  const source=image?.currentSrc || image?.src, entry=QUEEN_MOTHER_ART_V188[id];
  if (!entry || typeof source !== 'string' || source.includes('\\')) return false;
  try {
    const declared=globalThis.location?.origin;
    const origin=declared && declared !== 'null' ? declared : 'https://queen-mother.invalid';
    const expected=new URL(entry.path,`${origin}/`), url=new URL(source,`${origin}/`);
    return (source===entry.path || source===expected.href) && ['http:','https:'].includes(url.protocol)
      && url.origin===expected.origin && url.pathname===entry.path && !url.search && !url.hash
      && !url.username && !url.password;
  } catch { return false; }
}
function validCell(rect,entry) {
  return Array.isArray(rect) && rect.length===4 && rect.every(Number.isFinite)
    && rect[0]>=0 && rect[1]>=0 && rect[2]>0 && rect[3]>0
    && rect[0]+rect[2]<=entry.width && rect[1]+rect[3]<=entry.height;
}
function validPoint(point) { return Array.isArray(point) && point.length===2 && point.every(Number.isFinite); }
function registeredSource(id) {
  const entry=QUEEN_MOTHER_ART_V188[id];
  if (!entry || !(entry.width>0) || !(entry.height>0)) return false;
  if (id==='arms') return Object.values(QUEEN_MOTHER_ARMS_V188).every(part=>validCell(part.rect,entry)
    && validPoint(part.pivot) && part.scale>0);
  const names=id==='rest' ? QUEEN_MOTHER_POSES_V188.slice(0,4) : QUEEN_MOTHER_POSES_V188.slice(4);
  return names.every(name=>{
    const frame=QUEEN_MOTHER_FRAMES_V188[name];
    return frame?.sourceId===id && validCell(frame.rect,entry) && validPoint(frame.pivot)
      && frame.referenceHeight>0 && Object.keys(QUEEN_MOTHER_ARMS_V188).every(key=>
        validPoint(frame.arms?.[key]?.attach) && Number.isFinite(frame.arms[key].angle));
  });
}
export function queenMotherSourceReadyV188(image,id) {
  const entry=QUEEN_MOTHER_ART_V188[id];
  return Boolean(registeredSource(id) && image?.complete && image.naturalWidth===entry.width
    && image.naturalHeight===entry.height && ownsSource(image,id));
}
export function queenMotherArtReadyV188(images) {
  return images instanceof Map && QUEEN_MOTHER_ART_IDS_V188.every(id=>
    queenMotherSourceReadyV188(images.get(QUEEN_MOTHER_ART_V188[id].imageKey),id));
}
/** Entry/reentry owns requests. Late callbacks settle only their own Image;
 * they cannot replace a newer request, mark a salvo or restore an actor. */
export function preloadQueenMotherArtV188(images,{ImageCtor=globalThis.Image}={}) {
  if (!(images instanceof Map) || typeof ImageCtor !== 'function') return;
  for (const id of QUEEN_MOTHER_ART_IDS_V188) {
    if (!registeredSource(id)) continue;
    const entry=QUEEN_MOTHER_ART_V188[id],prior=images.get(entry.imageKey);
    if (queenMotherSourceReadyV188(prior,id)
      || (prior && ownsSource(prior,id) && loading.get(prior)!=='error' && !prior.complete)) continue;
    let image; try { image=new ImageCtor(); } catch { continue; }
    images.set(entry.imageKey,image); loading.set(image,'loading'); image.decoding='async';
    const finish=state=>{
      if (loading.get(image)!=='loading') return;
      loading.set(image,state);
      image.removeEventListener?.('load',loaded); image.removeEventListener?.('error',failed);
      if (!image.addEventListener) { image.onload=null; image.onerror=null; }
    };
    const loaded=()=>finish(queenMotherSourceReadyV188(image,id)?'ready':'error'),failed=()=>finish('error');
    if (image.addEventListener) { image.addEventListener('load',loaded); image.addEventListener('error',failed); }
    else { image.onload=loaded; image.onerror=failed; }
    try { image.src=entry.path; } catch { failed(); }
    if (queenMotherSourceReadyV188(image,id)) loaded();
  }
}

/** All three ecosystems use eco131-boss. Object membership rejects detached
 * probes and obsolete resume owners; no combat-phase-only restriction. */
export function isQueenMotherArtOwnerV188(engine,actor) {
  return Boolean(engine?.ecosystemActiveV131 && engine.ecosystemV131?.operationId==='queen-mother-song'
    && actor?.id==='eco131-boss' && actor.ecosystemActorV131?.id==='eco131-boss'
    && actor.ecosystemActorV131.role==='boss' && engine.enemies?.includes(actor)
    && engine.ecosystemActorV131?.('eco131-boss')===actor);
}
/** Called once after the native projectile loop. A no-op producer, a phase
 * reset and a shot withheld by insertion grace cannot create this cue.
 * Nothing is stored on the serializable actor. */
export function markQueenMotherSalvoV188(engine,actor,firstProjectile) {
  if (!isQueenMotherArtOwnerV188(engine,actor) || !actor.alive || !Number.isInteger(firstProjectile)
    || firstProjectile<0 || !Array.isArray(engine.hostileProjectiles)
    || !engine.hostileProjectiles.slice(firstProjectile).some(projectile=>projectile.ownerId===actor.id)) return false;
  // The outer insertion wrapper removes this owner's appended projectiles in
  // its finally block, after the ecosystem controller returns.
  if (engine.insertionGraceEnemyV188===actor) return false;
  const clock=clock60(actor.clock); if (clock===null) return false;
  salvos.set(actor,{engine,scene:engine.ecosystemV131,lastClock:clock,age:0}); return true;
}
/** The native update calls this just after advancing actor.clock, before stun,
 * visibility or missing-target early returns. Deletion prevents wrap replay. */
export function advanceQueenMotherSalvoV188(engine,actor,dt) {
  const cue=salvos.get(actor); if (!cue) return;
  if (!isQueenMotherArtOwnerV188(engine,actor) || cue.engine!==engine || cue.scene!==engine.ecosystemV131
    || !actor.alive) { salvos.delete(actor); return; }
  const clock=clock60(actor.clock),step=clock===null ? NaN : (clock-cue.lastClock+60)%60;
  if (dt===0 && step===0) return;
  if (!Number.isFinite(dt) || dt<=0 || dt>.1+1e-7 || !Number.isFinite(step) || Math.abs(step-dt)>1e-7) {
    salvos.delete(actor); return;
  }
  cue.age+=step; cue.lastClock=clock;
  if (cue.age>=QUEEN_MOTHER_PRESENTATION_V188.salvoSeconds-1e-9) salvos.delete(actor);
}
export function clearQueenMotherSalvoV188(actor) { salvos.delete(actor); }

export function queenMotherPoseV188(engine,actor) {
  if (!isQueenMotherArtOwnerV188(engine,actor)) return null;
  const timing=QUEEN_MOTHER_PRESENTATION_V188;
  if (!actor.alive) return !(actor.deathClock>0) ? null
    : actor.deathClock>timing.corpseSeconds-timing.collapseSeconds ? 'collapse' : 'neutralized';
  const cue=salvos.get(actor);
  if (cue?.engine===engine && cue.scene===engine.ecosystemV131 && cue.age>=0 && cue.age<timing.salvoSeconds)
    return cue.age<timing.emissionSeconds ? 'emission' : 'recovery';
  if (actor.windup>0) return actor.windup<timing.windupSplit ? 'anticipation-early' : 'anticipation-advanced';
  if (actor.hurtClock>0) return 'recovery';
  const clock=clock60(actor.clock) ?? 0;
  return !engine.accessibilityRuntime?.reducedMotion && Math.floor(clock*timing.idleFramesPerSecond)%2 ? 'rest-1' : 'rest-0';
}
function frameFit(actor,pose) {
  const frame=QUEEN_MOTHER_FRAMES_V188[pose];
  if (!frame || !actor || ![actor.x,actor.y,actor.w,actor.h].every(Number.isFinite) || actor.w<=0 || actor.h<=0) return null;
  return {pose,frame,x:actor.x+actor.w/2,y:actor.y+actor.h,facing:actor.facing<0?-1:1,
    bodyScale:actor.h/frame.referenceHeight,armRatio:actor.h/QUEEN_MOTHER_PRESENTATION_V188.referenceBodyHeight};
}
export function queenMotherFrameFitV188(engine,actor) { return frameFit(actor,queenMotherPoseV188(engine,actor)); }

/** Body only. Native names, HP bar and anticipation strokes remain owned by
 * the caller and are drawn after this entire modular composition. */
export function drawQueenMotherArtV188(ctx,images,engine,actor) {
  if (!isQueenMotherArtOwnerV188(engine,actor) || !queenMotherArtReadyV188(images)) return false;
  const fit=queenMotherFrameFitV188(engine,actor); if (!fit) return false;
  const {frame}=fit;
  ctx.save();
  try {
    ctx.globalAlpha=!actor.alive ? .3 : actor.actionPhase===1 ? .35 : 1;
    ctx.translate(fit.x,fit.y); ctx.scale(fit.facing,1);
    for (const id of QUEEN_MOTHER_PRESENTATION_V188.layerOrder) {
      ctx.save();
      try {
        if (id==='body') {
          ctx.scale(fit.bodyScale,fit.bodyScale);
          ctx.drawImage(images.get(QUEEN_MOTHER_ART_V188[frame.sourceId].imageKey),...frame.rect,
            -frame.pivot[0],-frame.pivot[1],frame.rect[2],frame.rect[3]);
        } else {
          const part=QUEEN_MOTHER_ARMS_V188[id], placement=frame.arms[id],scale=part.scale*fit.armRatio;
          ctx.translate((placement.attach[0]-frame.pivot[0])*fit.bodyScale,(placement.attach[1]-frame.pivot[1])*fit.bodyScale);
          ctx.rotate(placement.angle*Math.PI/180); ctx.scale(scale,scale);
          ctx.drawImage(images.get(QUEEN_MOTHER_ART_V188.arms.imageKey),...part.rect,-part.pivot[0],-part.pivot[1],part.rect[2],part.rect[3]);
        }
      } finally { ctx.restore(); }
    }
  } finally { ctx.restore(); }
  return true;
}
/** Union of full source cells in every pose and both facings. This is a
 * conservative visibility envelope, never a collision or damage rectangle. */
export function queenMotherVisualBoundsV188(actor) {
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  const add=(fit,x,y)=>{
    left=Math.min(left,fit.x+x,fit.x-x); right=Math.max(right,fit.x+x,fit.x-x);
    top=Math.min(top,fit.y+y); bottom=Math.max(bottom,fit.y+y);
  };
  for (const pose of QUEEN_MOTHER_POSES_V188) {
    const fit=frameFit(actor,pose); if (!fit) return null;
    const {frame}=fit;
    for (const [x,y] of [[0,0],[627,0],[0,627],[627,627]]) {
      add(fit,(x-frame.pivot[0])*fit.bodyScale,(y-frame.pivot[1])*fit.bodyScale);
      for (const [id,part] of Object.entries(QUEEN_MOTHER_ARMS_V188)) {
        const placement=frame.arms[id],angle=placement.angle*Math.PI/180,scale=part.scale*fit.armRatio;
        const px=(x-part.pivot[0])*scale,py=(y-part.pivot[1])*scale;
        add(fit,(placement.attach[0]-frame.pivot[0])*fit.bodyScale+Math.cos(angle)*px-Math.sin(angle)*py,
          (placement.attach[1]-frame.pivot[1])*fit.bodyScale+Math.sin(angle)*px+Math.cos(angle)*py);
      }
    }
  }
  // Native unmirrored name/bar and the warning fit within this extra margin.
  left=Math.min(left,actor.x-10); right=Math.max(right,actor.x+actor.w);
  top=Math.min(top,actor.y-25); bottom=Math.max(bottom,actor.y+actor.h);
  const pad=QUEEN_MOTHER_PRESENTATION_V188.visualBoundsPadding;
  return {x:left-pad,y:top-pad,w:right-left+pad*2,h:bottom-top+pad*2};
}
