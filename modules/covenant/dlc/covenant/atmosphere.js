/* v0.8: deterministic fictional exposure model. NO biological/medical simulation.
 * The world, the handheld and the high-contrast outlines read the same fields.
 * Only the simulation advances timers; drawing never does. No enemy access here.
 */
(function(root){'use strict';
const clamp=(v,a,b)=>Number.isFinite(v)?Math.max(a,Math.min(b,v)):a;
const distance=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*510);
const defaults={rooms:[],sources:[],warningSeconds:.65,emissionSeconds:6.75,cooldownSeconds:14,windPeriod:32,exposureRate:28,coreDensity:.62,probes:[0,150,300]};
const defs=e=>e.data.atmosphere||defaults;
function fresh(e){return {version:1,sources:Object.fromEntries(defs(e).sources.map(s=>[s.id,{remaining:0,cooldown:0}])),activations:0,pulses:0};}
function sanitize(e,raw){const d=defs(e),s=fresh(e),life=d.warningSeconds+d.emissionSeconds;
 for(const source of d.sources){const v=raw?.sources?.[source.id],remaining=clamp(v?.remaining,0,life);s.sources[source.id]={remaining,cooldown:Math.max(remaining,clamp(v?.cooldown,0,d.cooldownSeconds))};}
 s.activations=Math.floor(clamp(raw?.activations,0,1e7));s.pulses=Math.floor(clamp(raw?.pulses,0,1e7));return s;
}
function wind(e,time=e.state.time){const d=defs(e),t=clamp(time,0,1e7),value=Math.sin(t*Math.PI*2/d.windPeriod);return {value,direction:value>.12?1:value<-.12?-1:0,strength:Math.abs(value),label:Math.abs(value)<.12?'Accalmie':value>0?'Vers la droite':'Vers la gauche'};}
function phase(e,source){const d=defs(e),s=e.state.atmosphere?.sources?.[source.id];if(!s||s.remaining<=0)return s?.cooldown>0?'settling':'quiet';return d.warningSeconds+d.emissionSeconds-s.remaining<d.warningSeconds-1e-8?'warning':'emitting';}
function fields(e,room=e.room){const d=defs(e),w=wind(e),out=[];
 for(const source of d.sources.filter(s=>s.room===room.id)){
  out.push({id:source.id+':core',source:source.id,kind:'core',x:source.x,z:source.z,rx:source.coreRX,rz:source.coreRZ,density:d.coreDensity,height:70,phase:phase(e,source)});
  const s=e.state.atmosphere?.sources?.[source.id],ph=phase(e,source);if(ph!=='emitting')continue;
  const age=d.warningSeconds+d.emissionSeconds-s.remaining-d.warningSeconds,u=clamp(age/d.emissionSeconds,0,1);
  // A compact ellipse whose entire interior is both rendered and dangerous.
  // It drifts with the current wind; its density fades to zero before it expires.
  const grow=clamp(age/1.1,0,1),fade=Math.min(1,(1-u)*3.2),rx=source.coreRX+(source.plumeRX-source.coreRX)*grow;
  out.push({id:source.id+':cloud',source:source.id,kind:'cloud',x:clamp(source.x+w.value*source.drift*grow,rx+30,room.width-rx-30),z:source.z,rx,rz:source.coreRZ+(source.plumeRZ-source.coreRZ)*grow,density:clamp((.5+grow*.5)*fade,0,1),height:155,phase:ph});
 }
 return out;
}
function densityAt(e,p=e.state.player,room=e.room){let density=0;
 for(const f of fields(e,room)){if((p.y||0)>=f.height)continue;const q=((p.x-f.x)/f.rx)**2+((p.z-f.z)/f.rz)**2;if(q<1)density=Math.max(density,f.density*(1-.45*q));}
 return clamp(density,0,1);
}
function rateAt(e,p=e.state.player,room=e.room){
 const old=room.props.some(o=>o.kind==='spore'&&Math.abs(p.x-o.x)<o.w/2+25&&Math.abs(p.z-o.z)<.15&&(p.y||0)<70)?40:0;
 return Math.max(old,densityAt(e,p,room)*defs(e).exposureRate);
}
function react(e,noise){const d=defs(e);let radius=0;
 if(noise.kind==='shot')radius=380;
 else if(noise.kind==='decoy')radius=160;
 else if(noise.kind==='step')radius=noise.radius>400?175:95;
 else if(noise.kind==='splash')radius=noise.radius>200?125:45;
 else if(noise.kind==='shove')radius=120;
 if(!radius||e.paused||e.dead||e.busy)return;
 for(const source of d.sources){if(source.room!==e.room.id||distance(source,noise)>radius||!e.lineClear(noise,source,45))continue;
  const s=e.state.atmosphere.sources[source.id];if(s.remaining>0||s.cooldown>0)continue;
  s.remaining=d.warningSeconds+d.emissionSeconds;s.cooldown=d.cooldownSeconds;e.state.atmosphere.pulses++;
  e.unlock('air-colonies');e.emit('sporeWarning','Le massif se contracte. Écartez-vous de la poussière.',{source:source.id});
 }
}
function tick(e,dt){const d=defs(e);for(const source of d.sources){const s=e.state.atmosphere.sources[source.id];s.remaining=Math.max(0,s.remaining-dt);s.cooldown=Math.max(0,s.cooldown-dt);}if(e.detector&&!e.done(d.unlockAction))e.detector=false;}
const methods={
 atmosphereWind(){return wind(this);},atmosphereFields(){return fields(this);},atmosphereRate(p=this.state.player){return rateAt(this,p);},atmospherePhase(source){return phase(this,source);},
 toggleDetector(){if(this.grip)return false;
  if(this.paused||this.dead||this.busy||this.networkSession||this.state.hidden||this.room.crawl||!this.grounded())return false;
  if(this.detector){this.stowDetector();return true;}
  if(!this.done(defs(this).unlockAction)){this.emit('hint','Le détecteur se trouve dans la lisière, après le balisage du champ.');return false;}
  this.cancelWork();this.cancelSurvey();this.healing=0;this.reloadTime=0;this.clearAim();this.detector=true;this.state.atmosphere.activations++;this.unlock('air-detector');this.unlock('air-access');this.emit('detector','Détecteur déployé. Le temps et les dangers continuent.');return true;
 },
 stowDetector(){if(!this.detector)return false;this.detector=false;return true;},
 detectorReadings(){if(!this.detector)return null;const p=this.state.player,d=defs(this);
  return {wind:wind(this),samples:d.probes.map(offset=>{const x=p.x+p.facing*offset,q={x,z:p.z,y:p.y},clear=x>=35&&x<=this.room.width-35&&(offset===0||this.lineClear(p,q,90));
   return {offset,x,z:p.z,clear,value:clear?Math.round(clamp(rateAt(this,q)/40*100,0,100)):null};}),exposure:this.state.exposure};
 }
};
const API={fresh,sanitize,wind,phase,fields,densityAt,rateAt,react,tick,methods};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.CovenantAtmosphere=API;
})(globalThis);
