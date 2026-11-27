/* Low passages and physical rotor isolation. Pure simulation, no DOM. */
(function(root){'use strict';
const clamp=(n,a,b)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
const distance=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*510);
const defs=e=>e.data.maintenance?.fans||[];
const fresh=e=>({version:1,fans:Object.fromEntries(defs(e).map(f=>[f.id,{isolated:false,spin:1,angle:0,progress:0}]))});
function sanitize(e,raw){const s=fresh(e);for(const f of defs(e)){const a=raw?.fans?.[f.id],v=s.fans[f.id];v.isolated=a?.isolated===true;v.spin=v.isolated?clamp(a?.spin,0,1):1;v.progress=v.isolated?1:clamp(a?.progress,0,.999);v.angle=clamp(a?.angle,0,Math.PI*2);}return s;}
function blocked(e,room,x,z,y=0,state=e.state){return defs(e).some(f=>f.room===room.id&&(state.maintenance?.fans[f.id]?.spin??1)>.08&&Math.abs(x-f.x)<f.halfWidth+19&&Math.abs(z-f.z)<.18);}
function safeResume(e,s){
 const subjects=[{p:s.player,room:s.room},...Object.values(s.enemies||{}).filter(v=>v.alive).map(p=>({p,room:p.room}))];
 for(const subject of subjects){const r=e.rooms.get(subject.room),p=subject.p;if(!blocked(e,r,p.x,p.z,0,s))continue;const origin=p.x;let safe=false;
  for(let i=1;i<r.width/15&&!safe;i++)for(const sign of [-1,1]){const x=clamp(origin+sign*i*15,40,r.width-40);if(!blocked(e,r,x,p.z,0,s)&&!e.collisionIn(r,x,p.z,0)){p.x=x;p.y=0;safe=true;break;}}
  if(!safe)throw new Error('Aucun emplacement sûr hors du rotor.');
 }
}
function mechanics(e,dt){for(const f of defs(e)){const v=e.state.maintenance.fans[f.id];if(v.isolated)v.spin=Math.max(0,v.spin-dt/(e.data.maintenance?.spinDownSeconds||2.4));v.angle=(v.angle+v.spin*dt*12)%(Math.PI*2);}}
function work(e,dt,moved){if(!e.isolating)return;const f=defs(e).find(f=>f.id===e.isolating.fan),panel=f?.panels.find(p=>p.id===e.isolating.panel);
 if(!f||f.room!==e.room.id||!panel||distance(e.state.player,panel)>105||moved||!e.grounded()){e.cancelIsolation();return;}
 const v=e.state.maintenance.fans[f.id];v.progress=Math.min(1,v.progress+dt/(e.data.maintenance?.isolationSeconds||1.8));
 if(v.progress>=1){v.isolated=true;e.isolating=null;e.unlock('fan-isolation');e.unlock(f.codex);e.noise(panel.x,panel.z,530,'isolate');e.emit('isolation','Circuit consigné. Attendez l’arrêt complet du rotor.',{fan:f.id});}}
const methods={
 getMaintenanceFans(room=this.room){return defs(this).filter(f=>f.room===room.id);},
 nearestIsolation(){const p=this.state.player;return this.getMaintenanceFans().flatMap(f=>this.state.maintenance.fans[f.id].isolated?[]:f.panels.map(panel=>({...panel,fan:f.id,label:'Consigner · '+f.name,type:'isolation'}))).filter(a=>distance(p,a)<105&&this.lineClear(p,a,80)).sort((a,b)=>distance(p,a)-distance(p,b))[0]||null;},
 beginIsolation(id=null){if(this.grip)return false;if(this.paused||this.dead||this.busy||this.state.hidden||this.networkSession||!this.grounded())return false;const p=this.nearestIsolation();if(!p||(id&&id!==p.fan)||this.isolating?.fan===p.fan)return false;
  this.stowDetector();this.cancelWork();this.cancelSurvey();this.healing=0;this.reloadTime=0;this.aim=null;this.isolating={fan:p.fan,panel:p.id};this.noise(p.x,p.z,480,'isolate');this.emit('isolation','Consignation en cours. Restez immobile au sectionneur.',{fan:p.fan});return true;},
 cancelIsolation(){if(!this.isolating)return false;this.isolating=null;this.emit('hint','Consignation interrompue. Le réglage est conservé.');return true;},
 maintenanceStatus(){const fans=this.getMaintenanceFans();if(!fans.length)return null;const near=fans.slice().sort((a,b)=>distance(a,this.state.player)-distance(b,this.state.player))[0],s=this.state.maintenance.fans[near.id];return {id:near.id,name:near.name,isolated:s.isolated,spin:s.spin,open:s.spin<=.08,progress:s.progress};}
};
const API={fresh,sanitize,blocked,safeResume,mechanics,work,methods};if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.CovenantMaintenance=API;
})(globalThis);
