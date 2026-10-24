/** Original native pose capture, read-only presentation. The authoritative V153
 * bodies remain unchanged. These new painted frames are adaptations, not frame
 * copies, canonical motion capture, new hitboxes or a new combat ability. */
import { XENO_TRIALS_CAPTURE_ATLASES_V163 } from './xeno-trials-capture-data-v163.js';
import { getXenoTrialsFighterV96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsRenderMetricsV110 } from './xeno-trials-scale-v110.js';
import { getXenoTrialsRigV154, getXenoTrialsRigCueV154, getXenoTrialsRigMeshV154,
 sampleXenoTrialsRigV154, projectXenoTrialsMeshPointV157, xenoTrialsTriangleAreaV154 } from './xeno-trials-rig-v154.js';
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const XENO_TRIALS_CAPTURE_V163=freeze({id:'original-native-paired-floor-capture-v163',canonExact:false,
 fallSeconds:.44,recoverySeconds:.6,blendSeconds:.045,maxVisualRootOffset:210,
 targetCount:3,paintedFrames:27,attackerId:'prowler',taskIds:['ART153-03','ART153-04','ART153-05','ART153-11','ART153-12','ART153-18','ART153-19','ART153-25','ART153-26']});
freeze(XENO_TRIALS_CAPTURE_ATLASES_V163);
const clamp=(n,lo=0,hi=1)=>Math.max(lo,Math.min(hi,n));
const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const validPoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);
const ready=(image,source)=>image&&image.complete!==false&&(image.naturalWidth??image.width)===source.sourceWidth&&(image.naturalHeight??image.height)===source.sourceHeight;
const remembered=new WeakMap();
export function getXenoTrialsCaptureAtlasV163(definition,art){
 return XENO_TRIALS_CAPTURE_ATLASES_V163.find(a=>a.fighterId===definition?.id&&a.profileId===definition.profileId
  &&a.referencePath===art?.path&&a.profileId===art.id&&(!art.sha256||a.referenceSha256===art.sha256))||null;
}
export function getXenoTrialsCaptureAssetsV163(fighters){
 return [...new Set((fighters||[]).map(f=>getXenoTrialsCaptureAtlasV163(getXenoTrialsFighterV96(f.id),getXenoTrialsArtV96(f.id,f.variant))?.path).filter(Boolean))];
}
function worldPoint(rig,metrics,fighter,p){
 const flip=fighter.facing*rig.sourceFacing;
 return[fighter.x+(p[0]-metrics.pivotX*rig.sourceWidth)*metrics.width/rig.sourceWidth*flip,
  450-fighter.y+(p[1]-metrics.bottom*rig.sourceHeight)*metrics.height/rig.sourceHeight];
}
const nonfolding=(mesh,vertices)=>vertices.every(validPoint)&&mesh.triangles.every(ids=>xenoTrialsTriangleAreaV154(...ids.map(i=>vertices[i]))>=xenoTrialsTriangleAreaV154(...ids.map(i=>mesh.vertices[i].source))*.2);
function limbMeasures(rig,before,after){
 const measures=[];
 for(const bone of rig.bones.filter(b=>/^(upper|fore|hand)/.test(b.id))){
  const points=[before,after].map(frame=>[bone.pivot,bone.tip].map(p=>projectXenoTrialsMeshPointV157(rig,frame,p)));
  if(points.flat().some(p=>!validPoint(p)))return null;
  const [[a,b],[c,d]]=points,ratio=distance(c,d)/distance(a,b);
  const original=Math.atan2(b[1]-a[1],b[0]-a[0]),posed=Math.atan2(d[1]-c[1],d[0]-c[0]);
  const degrees=Math.abs(((posed-original+Math.PI*3)%(Math.PI*2))-Math.PI)*180/Math.PI;
  if(!Number.isFinite(ratio)||ratio<.8||ratio>1.25||degrees>18)return null;
  measures.push({id:bone.id,lengthRatio:ratio,degrees});
 }return measures;
}
function projectContacts(rig,frame){
 return Object.fromEntries(Object.entries(rig.contacts).map(([name,anchor])=>[name,projectXenoTrialsMeshPointV157(rig,frame,anchor.point)]));
}
/** Weight absorption before the real native leap; all four lower supports stay
 * fixed. No rigid rotation of the entire portrait and no added attack clock. */
export function sampleXenoTrialsPreparationV163(rig,frame,cue,reducedMotion=false){
 if(rig?.fighterId!=='prowler'||rig.profileId!=='castes-game_afe_prowler'||cue?.clip!=='windup'||!frame||reducedMotion)return frame;
 const mesh=getXenoTrialsRigMeshV154(rig);if(!mesh||frame.vertices.length!==mesh.vertices.length)return frame;
 const gain=Math.sin(Math.PI*clamp(cue.progress))**2;
 const vertices=frame.vertices.map((p,i)=>{const s=mesh.vertices[i].source,g=smooth((s[0]-350)/450)*(1-smooth((s[1]-550)/327))*gain;
  return[p[0]-18*g,p[1]+30*g];});
 if(!nonfolding(mesh,vertices))return frame;
 const next={...frame,vertices},contacts=projectContacts(rig,next);
 if(Object.values(contacts).some(p=>!validPoint(p)))return frame;
 return{...next,contacts,active:gain>1e-7||frame.active,animation:'original-native-weight-absorption-v163',
  preparationV163:{id:'prowler-four-support-anticipation-v163',taskId:'ART153-03',gain,sourceLoad:30*gain,canonExact:false,fullFloorPin:false}};
}
function activeRecord(match){
 if(match?.phase!=='active'||!Array.isArray(match.fighters))return null;
 const hold=match.grappleV153;
 if(hold){
  const attacker=match.fighters.find(f=>f.side===hold.attacker),target=match.fighters.find(f=>f.side===hold.target);
  if(!attacker||!target)return null;
  const direction=Math.sign(hold.targetX-hold.attackerX);
  if(![-1,1].includes(direction))return null;
  const r={grappleId:hold.id,round:match.round,attackerSide:hold.attacker,targetSide:hold.target,direction,
   attackerX:attacker.x,targetX:target.x,heldSeconds:Math.max(0,(match.tick-hold.bornTick)/120),escapeProgress:hold.escapeProgress,
   phase:'capture',recovery:0};
  remembered.set(match,r);return r;
 }
 const end=[...(match.events||[])].reverse().find(e=>e.type==='grapple-end-v153');
 const old=remembered.get(match),roundStart=[...(match.events||[])].reverse().find(e=>e.type==='round-start');
 if(!end||!old||old.grappleId!==end.grappleId||old.round!==match.round||(roundStart&&roundStart.id>end.id))return null;
 const seconds=(match.tick-end.tick)/120;
 if(seconds<0||seconds>=XENO_TRIALS_CAPTURE_V163.recoverySeconds)return null;
 // A new action immediately owns its drawing. Visual recovery cannot delay an
 // attack, hide a jump, survive death or enter the next round.
 const target=match.fighters.find(f=>f.side===old.targetSide),attacker=match.fighters.find(f=>f.side===old.attackerSide);
 if(!target||!attacker||target.hp<=0||attacker.hp<=0||target.y!==0||target.attack)return null;
 return{...old,phase:'recovery',recovery:seconds/XENO_TRIALS_CAPTURE_V163.recoverySeconds,releaseReason:end.reason};
}
function phaseFrames(record,reducedMotion){
 if(record.phase==='recovery'){
  // If contact is broken before the floor pose, unwind the actually reached
  // reception. Never invent a complete floor pin on an early interruption.
  if(record.heldSeconds<XENO_TRIALS_CAPTURE_V163.fallSeconds){
   const start=Math.min(2,Math.floor(record.heldSeconds/XENO_TRIALS_CAPTURE_V163.fallSeconds*4));
   return{index:record.recovery<.5?start:8,previous:null,mix:1};
  }
  const phase=record.recovery*4,index=Math.min(8,5+Math.floor(phase));
  return{index,previous:index===5?(record.escapeProgress>0?4:3):index-1,mix:reducedMotion?1:smooth((phase%1)/.25)};
 }
 if(reducedMotion)return{index:record.escapeProgress>0?4:3,previous:null,mix:1};
 const phase=record.heldSeconds/XENO_TRIALS_CAPTURE_V163.fallSeconds*4;
 if(phase>=3.4&&record.escapeProgress>0){
  const index=Math.floor(record.escapeProgress/18)%2===0?4:3;
  return{index,previous:index===4?3:4,mix:smooth((record.escapeProgress%18)/5)};
 }
 const index=phase<3?Math.floor(phase):record.escapeProgress>0?4:3;
 return{index,previous:index>0&&phase<3.4?index-1:null,mix:phase<3.4?smooth((phase%1)/.35):1};
}
function frameLayout(atlas,index,metrics,rootX,direction,ground){
 const frame=atlas.frames[index],s=metrics.visibleHeight/frame.staturePixels,[x0,y0,x1,y1]=frame.rect;
 const originX=rootX-direction*(x0+x1)/2*s,originY=ground-frame.supportY*s;
 const world=p=>[originX+direction*p[0]*s,originY+p[1]*s];
 return{index,frame,scale:s,originX,originY,direction,ground,rootX,contacts:Object.fromEntries(Object.entries(frame.contacts).map(([key,p])=>[key,world(p)])),
  bounds:{left:Math.min(world([x0,y0])[0],world([x1,y1])[0]),right:Math.max(world([x0,y0])[0],world([x1,y1])[0]),top:world([x0,y0])[1],bottom:world([x1,y1-1])[1]}};
}
/** A source-space cage for the two forward limbs. Its two influence fields are
 * sampled through the real textured triangles, so the receipt measures the
 * hand the renderer drew rather than an unattained IK target. Rear feet and
 * lower body remain fixed. A folded cage is refused, never partially painted. */
function pairedCaptor(rig,frame,metrics,fighter,targets){
 const mesh=getXenoTrialsRigMeshV154(rig),keys=['handNear','handFar'],anchors=keys.map(k=>rig.contacts[k].point);
 const basis=mesh.vertices.map(({source:[x,y]})=>anchors.map(([cx,cy])=>Math.exp(-(((x-cx)/210)**2+((y-cy)/265)**2))*smooth((x-860)/130)*smooth((y-610)/180)));
 const fields=[0,1].map(axis=>({...frame,vertices:basis.map(v=>[v[axis],0])}));
 const A=anchors.map(p=>fields.map(f=>projectXenoTrialsMeshPointV157(rig,f,p)?.[0]));
 if(A.flat().some(v=>!Number.isFinite(v)))return frame;
 const determinant=A[0][0]*A[1][1]-A[0][1]*A[1][0];if(Math.abs(determinant)<.01)return frame;
 const flip=fighter.facing*rig.sourceFacing,sx=metrics.width/rig.sourceWidth,sy=metrics.height/rig.sourceHeight;
 const desired=targets.map((p,i)=>{const now=projectXenoTrialsMeshPointV157(rig,frame,anchors[i]),world=worldPoint(rig,metrics,fighter,now);
  return[(p[0]-world[0])/(sx*flip),(p[1]-world[1])/sy];});
 if(desired.some(p=>Math.hypot(p[0]*sx,p[1]*sy)>24))return frame;
 const coefficients=[0,1].map(axis=>[(desired[0][axis]*A[1][1]-desired[1][axis]*A[0][1])/determinant,
  (A[0][0]*desired[1][axis]-A[1][0]*desired[0][axis])/determinant]);
 for(const gain of [1,.75,.5,.25]){
  const vertices=frame.vertices.map((p,i)=>p.map((v,axis)=>v+gain*(basis[i][0]*coefficients[axis][0]+basis[i][1]*coefficients[axis][1])));
  if(!nonfolding(mesh,vertices))continue;
  const next={...frame,vertices},contacts=projectContacts(rig,next);
  if(Object.values(contacts).some(p=>!validPoint(p)))continue;
  const limbs=limbMeasures(rig,frame,next);if(!limbs)continue;
  return{...next,contacts,active:true,animation:'original-native-paired-restraint-v163',pairedPinV163:{gain,limbs,canonExact:false}};
 }
 return frame;
}
export function getXenoTrialsCaptureViewV163(match,images,reducedMotion=false){
 const record=activeRecord(match);if(!record)return null;
 const attacker=match.fighters.find(f=>f.side===record.attackerSide),target=match.fighters.find(f=>f.side===record.targetSide);
 if(attacker?.id!=='prowler'||target?.hp<=0||attacker.hp<=0||record.phase==='capture'&&attacker.y!==0||target.y!==0)return null;
 const art=getXenoTrialsArtV96(target.id,target.variant),atlas=getXenoTrialsCaptureAtlasV163(getXenoTrialsFighterV96(target.id),art);
 if(!atlas||!ready(images?.get(atlas.path),atlas))return null;
 const attackerArt=getXenoTrialsArtV96(attacker.id,attacker.variant),rig=getXenoTrialsRigV154(getXenoTrialsFighterV96(attacker.id),attackerArt);
 if(!rig||!ready(images?.get(rig.path),rig))return null;
 const cue=getXenoTrialsRigCueV154(rig,match,attacker)||{clip:'release',progress:record.recovery,elapsed:record.recovery*.6,role:'captor'};
 const base=sampleXenoTrialsRigV154(rig,cue,reducedMotion);if(!base)return null;
 const native=getXenoTrialsRenderMetricsV110(target.id,target.variant),attackerMetrics=getXenoTrialsRenderMetricsV110(attacker.id,attacker.variant);
 const anchorFighter=record.phase==='recovery'?{...attacker,x:record.attackerX,y:0,facing:record.direction}:attacker;
 const hands=['handNear','handFar'].map(key=>worldPoint(rig,attackerMetrics,anchorFighter,projectXenoTrialsMeshPointV157(rig,base,rig.contacts[key].point)));
 const frames=phaseFrames(record,reducedMotion),ground=450-target.y;
 // Keep the torso alongside the two forward claws. Offset belongs solely to
 // this drawing and is disclosed separately from the unchanged engine root.
 const pin=frameLayout(atlas,frames.index,native,0,record.direction,ground);
 const pinPoints=pin.frame.fullFloorPin?[pin.contacts.pinNear,pin.contacts.pinFar]:null;
 const fixedPin=frameLayout(atlas,3,native,0,record.direction,ground),anchorPoints=pinPoints||[fixedPin.contacts.pinNear,fixedPin.contacts.pinFar];
 const pairedRoot=(hands[0][0]+hands[1][0]-anchorPoints[0][0]-anchorPoints[1][0])/2;
 const fallGain=reducedMotion?1:smooth(record.heldSeconds/XENO_TRIALS_CAPTURE_V163.fallSeconds);
 const pairGain=fallGain*(record.phase==='recovery'?1-smooth(record.recovery):1);
 const rootOffset=clamp(pairedRoot-target.x,-XENO_TRIALS_CAPTURE_V163.maxVisualRootOffset,XENO_TRIALS_CAPTURE_V163.maxVisualRootOffset)*pairGain;
 const layout=frameLayout(atlas,frames.index,native,target.x+rootOffset,record.direction,ground);
 const previous=frames.previous===null?null:frameLayout(atlas,frames.previous,native,target.x+rootOffset,record.direction,ground);
 const targetContacts=layout.frame.fullFloorPin?[layout.contacts.pinNear,layout.contacts.pinFar]:null;
 let captorPose=targetContacts&&record.phase==='capture'?pairedCaptor(rig,base,attackerMetrics,attacker,targetContacts):base,captorRecovery=false;
 // Returning the held forelimbs to the native release pose uses only V153's
 // existing .25s recovery. The captive may continue its own .6s visual rise;
 // a new Prowler action always owns its rendering as soon as it is accepted.
 if(record.phase==='recovery'&&!reducedMotion&&!attacker.attack&&attacker.y===0&&record.recovery*.6<.25&&record.heldSeconds>=XENO_TRIALS_CAPTURE_V163.fallSeconds){
  const heldCue={clip:record.escapeProgress>0?'struggle':'restraint',progress:clamp(record.escapeProgress/72),elapsed:record.heldSeconds,role:'captor'};
  const heldBase=sampleXenoTrialsRigV154(rig,heldCue),heldFrame=phaseFrames({...record,phase:'capture'},false).index;
  const heldHands=['handNear','handFar'].map(key=>worldPoint(rig,attackerMetrics,anchorFighter,projectXenoTrialsMeshPointV157(rig,heldBase,rig.contacts[key].point)));
  const neutral=frameLayout(atlas,heldFrame,native,0,record.direction,ground);
  const root=(heldHands[0][0]+heldHands[1][0]-neutral.contacts.pinNear[0]-neutral.contacts.pinFar[0])/2;
  const heldLayout=frameLayout(atlas,heldFrame,native,record.targetX+clamp(root-record.targetX,-210,210),record.direction,ground);
  const heldPose=pairedCaptor(rig,heldBase,attackerMetrics,anchorFighter,[heldLayout.contacts.pinNear,heldLayout.contacts.pinFar]);
  const gain=1-smooth(record.recovery*.6/.25),vertices=base.vertices.map((p,i)=>p.map((v,axis)=>v*(1-gain)+heldPose.vertices[i][axis]*gain));
  if(nonfolding(getXenoTrialsRigMeshV154(rig),vertices)){
   captorPose={...base,vertices,active:true,animation:'original-native-paired-release-v163',pairedReleaseV163:{gain,seconds:record.recovery*.6,duration:.25,canonExact:false}};
   captorPose.contacts=projectContacts(rig,captorPose);captorRecovery=true;
  }
 }
 const actualHands=['handNear','handFar'].map(key=>worldPoint(rig,attackerMetrics,attacker,projectXenoTrialsMeshPointV157(rig,captorPose,rig.contacts[key].point)));
 const gaps=targetContacts&&record.phase==='capture'?actualHands.map((p,i)=>distance(p,targetContacts[i])):[];
 return{record,atlas,layout,previous,mix:frames.mix,attacker,target,rig,captorPose,captorRecovery,attackerMetrics,rootOffset,actualHands,gaps,
  fullFloorPin:layout.frame.fullFloorPin,pairedContacts:record.phase==='capture'&&layout.frame.fullFloorPin&&frames.mix>=.999&&gaps.every(v=>v<=8),
  canonExact:false,sourceStatus:'new-original-native-art-not-canonical-reference'};
}
export function getXenoTrialsCaptureReceiptV163(view,role){
 if(!view)return null;
 return{id:XENO_TRIALS_CAPTURE_V163.id,role,grappleId:view.record.grappleId,phase:view.record.phase,
  frameId:view.layout.frame.id,frameIndex:view.layout.index,seconds:view.record.heldSeconds,recovery:view.record.recovery,
  blendPreviousFrame:view.previous?.frame.id||null,blendMix:view.mix,escapeProgress:view.record.escapeProgress,
  displayedFrameId:view.previous&&view.mix<.5?view.previous.frame.id:view.layout.frame.id,
  drawnFrames:[...(view.previous&&view.mix<1?[{id:view.previous.frame.id,alpha:1-view.mix,contacts:view.previous.contacts}]:[]),
   ...(view.previous&&view.mix<=0?[]:[{id:view.layout.frame.id,alpha:view.previous?view.mix:1,contacts:view.layout.contacts}])],
  targetId:view.target.id,attackerId:view.attacker.id,taskIds:role==='captor'?['ART153-04','ART153-05']:view.atlas.taskIds,
  sourcePath:view.atlas.path,sourceSha256:view.atlas.sourceSha256,referencePath:view.atlas.referencePath,
  canonExact:false,fullFloorPin:view.fullFloorPin,pairedContacts:view.pairedContacts,contactGaps:[...view.gaps],
  contacts:{...(view.previous&&view.mix<.5?view.previous.contacts:view.layout.contacts),...(view.record.phase==='capture'||view.captorRecovery?{captorHandNear:view.actualHands[0],captorHandFar:view.actualHands[1]}:{})},
  ...(view.captorRecovery?{captorRelease:view.captorPose.pairedReleaseV163}:{}),
  direction:view.record.direction,visualRootOffset:view.rootOffset,engineRoot:view.target.x,visualRoot:view.layout.rootX,
  bounds:{...view.layout.bounds},floor:view.layout.ground,supportY:view.layout.frame.supportY,scale:view.layout.scale,
  engineBodiesUnchanged:true,referenceStatus:view.sourceStatus,statureMethod:view.layout.frame.statureMethod};
}
export function drawXenoTrialsCaptureTargetV163(ctx,image,view){
 if(!view||!ready(image,view.atlas)||typeof ctx?.drawImage!=='function')return null;
 const paint=(layout,alpha)=>{if(alpha<=0)return;const[x0,y0,x1,y1]=layout.frame.rect;
  ctx.save();try{ctx.globalAlpha*=alpha;ctx.translate(layout.originX,layout.originY);ctx.scale(layout.direction*layout.scale,layout.scale);
   ctx.drawImage(image,x0,y0,x1-x0,y1-y0,x0,y0,x1-x0,y1-y0);
  }finally{ctx.restore();}};
 // Very short transitions between actual articulated poses, never a rigidly
 // rotated portrait. Stable hold/resistance paint one opaque frame only.
 if(view.previous&&view.mix<1)paint(view.previous,1-view.mix);
 paint(view.layout,view.previous?view.mix:1);
 return{rigId:'capture-atlas-v163-'+view.target.id,clip:view.record.phase==='recovery'?'release':view.record.escapeProgress>0?'struggle':'restraint',
  drawn:true,animation:'original-native-nine-pose-capture-v163',sourcePath:view.atlas.path,sourceSha256:view.atlas.sourceSha256,
  contacts:{...view.layout.contacts,head:view.layout.contacts.neck},canonExact:false,captureV163:getXenoTrialsCaptureReceiptV163(view,'captive')};
}
