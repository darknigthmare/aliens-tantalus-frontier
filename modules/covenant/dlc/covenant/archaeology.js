/* Original sanctuary annex. Pure state machine; the renderer never advances it.
 * Rings keep incomplete manual work. Draining/lifting are autonomous after the lever.
 * No new input key, remote control, inventory grant or main-story completion.
 */
(function(root){'use strict';
const clamp=(v,a,b)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
const distance=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*510);
const defs=e=>e.data.archaeology||{rings:[],rooms:[],water:[],workSeconds:1.2,drainSeconds:5.5,liftSeconds:3.2};
const fresh=e=>({version:1,rings:Object.fromEntries(defs(e).rings.map(r=>[r.id,{index:r.initial,progress:0}])),activated:false,elapsed:0,attempts:0});
function aligned(e,s=e.state.archaeology){return defs(e).rings.length===3&&defs(e).rings.every(r=>s.rings[r.id]?.index===r.target&&s.rings[r.id]?.progress===0);}
function sanitize(e,raw){
 const d=defs(e),s=fresh(e);
 for(const r of d.rings){const v=raw?.rings?.[r.id];s.rings[r.id]={index:Math.floor(clamp(v?.index,0,3)),progress:clamp(v?.progress,0,.999)};}
 s.activated=raw?.activated===true&&aligned(e,s);
 s.elapsed=s.activated?clamp(raw?.elapsed,0,d.drainSeconds+d.liftSeconds):0;
 s.attempts=Math.floor(clamp(raw?.attempts,0,10000));return s;
}
function status(e,s=e.state.archaeology){
 const d=defs(e);s=s||fresh(e);const water=s.activated?Math.max(0,1-s.elapsed/d.drainSeconds):1;
 const finished=s.activated&&s.elapsed>=d.drainSeconds+d.liftSeconds-1e-8;
 const gate=finished?1:s.activated?clamp((s.elapsed-d.drainSeconds)/d.liftSeconds,0,1):0;
 const phase=!s.activated?'idle':water>0?'draining':gate<1?'lifting':'open';
 return {phase,water,gate,open:gate>=1,aligned:aligned(e,s),elapsed:s.elapsed};
}
function blocked(e,room,x,z,y=0,state=e.state){
 const d=defs(e);if(!d.gate||status(e,state.archaeology).open)return false;
 return room.id===d.gate.from?x>d.gate.x-58:room.id===d.gate.to?x<d.gate.reverseX+58:false;
}
function safeResume(e,s){
 for(const subject of [{p:s.player,room:s.room},...Object.values(s.enemies||{}).filter(v=>v.alive).map(p=>({p,room:p.room}))]){
  const r=e.rooms.get(subject.room),p=subject.p;if(!blocked(e,r,p.x,p.z,0,s))continue;
  const origin=p.x;let found=false;
  for(let n=1;n<Math.ceil(r.width/15)&&!found;n++)for(const sign of [-1,1]){const x=clamp(origin+n*sign*15,40,r.width-40);if(!blocked(e,r,x,p.z,0,s)&&!e.collisionIn(r,x,p.z,0)){p.x=x;p.y=0;found=true;break;}}
  if(!found)throw new Error('Aucun point de reprise sûr devant la dalle.');
 }
}
function mechanics(e,dt){
 const d=defs(e),s=e.state.archaeology;if(!s.activated)return;
 const before=status(e).phase;
 s.elapsed=Math.min(d.drainSeconds+d.liftSeconds,s.elapsed+dt);
 const now=status(e).phase;
 if(now!==before){e.emit('hydraulics',now==='lifting'?'Le bassin s’est vidé. Les contrepoids soulèvent la dalle.':'La dalle est levée. Le passage du bassin est libre.',{phase:now});if(now==='open')e.unlock('water-cycle');}
}
function work(e,dt,moved){
 if(!e.rotating)return;const d=defs(e),r=d.rings.find(r=>r.id===e.rotating);
 if(!r||r.room!==e.room.id||distance(e.state.player,r)>112||moved||!e.grounded()||e.healing||e.reloadTime||e.scanning||e.work||e.isolating||e.state.hidden||e.networkSession){e.cancelArchaeology();return;}
 const v=e.state.archaeology.rings[r.id];v.progress=Math.min(1,v.progress+dt/d.workSeconds);
 if(v.progress>=1){v.index=(v.index+1)%4;v.progress=0;e.rotating=null;e.unlock('water-crowns');e.noise(r.x,r.z,420,'stone');e.emit('hydraulics',`Couronne ${r.ordinal} : ${d.symbols[v.index]}.`,{ring:r.id,index:v.index});}
}
function waterAt(e,p=e.state.player){const level=status(e).water;if(level<=.05||p.y>=65)return [];
 return defs(e).water.filter(h=>h.room===e.room.id&&Math.abs(p.x-h.x)<h.w/2&&Math.abs(p.z-h.z)<h.depth).map(h=>({...h,slow:1-.45*level,level}));
}
const methods={
 archaeologyStatus(){return status(this);},
 archaeologyControls(){const d=defs(this),s=this.state.archaeology;return [...(!s.activated?d.rings:[]).filter(r=>r.room===this.room.id).map(r=>({...r,type:'stone-ring',label:`Tourner la couronne ${r.ordinal} · ${d.symbols[s.rings[r.id].index]}`})),...(d.lever?.room===this.room.id?[{...d.lever,type:'sluice-lever',label:s.activated?'Déversoir engagé':'Abaisser le levier du déversoir'}]:[])];},
 nearestArchaeology(){return this.archaeologyControls().filter(r=>distance(this.state.player,r)<112&&this.lineClear(this.state.player,r,80)).sort((a,b)=>distance(this.state.player,a)-distance(this.state.player,b))[0]||null;},
 beginArchaeology(id=null){if(this.grip)return false;
  if(this.paused||this.dead||this.busy||this.state.hidden||this.networkSession||!this.grounded())return false;
  const n=this.nearestArchaeology();if(!n||(id&&id!==n.id)||this.rotating===n.id)return false;
  const s=this.state.archaeology;if(s.activated){this.emit('hint',status(this).open?'La dalle est déjà levée.':'Le mécanisme poursuit sa course.');return false;}
  if(n.type==='sluice-lever'){
   if(!aligned(this)){s.attempts=Math.min(10000,s.attempts+1);this.noise(n.x,n.z,520,'stone');this.emit('hydraulics','Le levier bute. Comparez les trois couronnes aux reliefs de l’aqueduc ; aucun réglage n’a été effacé.',{phase:'refused'});return false;}
   this.stowDetector();this.cancelWork();this.cancelSurvey();this.healing=0;this.reloadTime=0;s.activated=true;s.elapsed=0;this.unlock('water-cycle');this.noise(n.x,n.z,750,'sluice');this.emit('hydraulics','Le déversoir s’ouvre. La dalle restera fermée jusqu’à la fin de la vidange.',{phase:'draining'});return true;
  }
  this.stowDetector();this.cancelWork();this.cancelSurvey();this.healing=0;this.reloadTime=0;this.aim=null;this.rotating=n.id;this.noise(n.x,n.z,330,'stone');this.emit('hydraulics',`Rotation de la couronne ${n.ordinal}. Restez immobile.`,{ring:n.id});return true;
 },
 cancelArchaeology(){if(!this.rotating)return false;this.rotating=null;this.emit('hint','Rotation suspendue. Le cran engagé est conservé.');return true;}
};
const API={fresh,sanitize,status,aligned,blocked,safeResume,mechanics,work,waterAt,methods};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.CovenantArchaeology=API;
})(globalThis);
