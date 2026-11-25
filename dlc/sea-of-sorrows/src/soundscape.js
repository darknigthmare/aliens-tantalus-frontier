/* Procedural local audio and captions. Observes the game; never drives its simulation. */
(function(root){'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const DEFAULTS=Object.freeze({enabled:false,master:.55,ambience:.35,effects:.65,alerts:.65,captions:true});
const CUES=Object.freeze({
 pistol:{bus:'effects',text:'Départ de coup',freq:105,end:35,duration:.15,type:'sawtooth',noise:.12,gain:.14},
 ally:{bus:'effects',text:'Tir de Manning',freq:135,end:40,duration:.12,type:'triangle',noise:.12,gain:.13},
 foam:{bus:'effects',text:'Projection de mousse',freq:190,end:90,duration:.26,type:'sine',noise:.22,gain:.10},
 flame:{bus:'effects',text:'Souffle du lance-flammes',freq:70,end:42,duration:.21,type:'triangle',noise:.32,gain:.08},
 reload:{bus:'effects',text:'Changement de chargeur',freq:360,end:130,duration:.26,type:'triangle',noise:.07,gain:.10},
 dodge:{bus:'effects',text:'Appui d’esquive',freq:96,end:48,duration:.17,type:'sine',noise:.07,gain:.08},
 step:{bus:'effects',text:'Pas sur le sol',freq:96,end:42,duration:.10,type:'sine',noise:.09,gain:.055},
 wheels:{bus:'effects',text:'Roulement des brancards',freq:85,end:80,duration:.32,type:'triangle',noise:.07,gain:.045},
 impact:{bus:'effects',text:'Impact proche',freq:90,end:30,duration:.16,type:'triangle',noise:.15,gain:.10},
 hurt:{bus:'alerts',text:'Impact sur la combinaison',freq:160,end:70,duration:.28,type:'sine',noise:.09,gain:.13},
 windup:{bus:'alerts',text:'Mouvement d’attaque visible',freq:260,end:110,duration:.23,type:'triangle',noise:.11,gain:.08},
 work:{bus:'effects',text:'Intervention en cours',freq:92,end:85,duration:.30,type:'triangle',noise:.07,gain:.04},
 latch:{bus:'effects',text:'Mécanisme actionné',freq:220,end:60,duration:.26,type:'triangle',noise:.10,gain:.10},
 confirm:{bus:'alerts',text:'Confirmation de terrain',freq:490,end:660,duration:.17,type:'sine',noise:0,gain:.07},
 sensor:{bus:'alerts',text:'Signal du capteur',freq:720,end:490,duration:.24,type:'sine',noise:0,gain:.075},
 pursuit:{bus:'alerts',text:'Griffes derrière le seuil',freq:210,end:130,duration:.43,type:'triangle',noise:.13,gain:.075},
 warning:{bus:'alerts',text:'Mise en pression visible',freq:480,end:350,duration:.35,type:'sine',noise:0,gain:.07},
 steam:{bus:'effects',text:'Émission de vapeur visible',freq:75,end:65,duration:.35,type:'sine',noise:.28,gain:.05},
 gas:{bus:'effects',text:'Panache gazeux visible',freq:72,end:55,duration:.38,type:'sine',noise:.24,gain:.04},
 electric:{bus:'effects',text:'Arc électrique visible',freq:120,end:75,duration:.18,type:'sawtooth',noise:.18,gain:.07},
 low:{bus:'alerts',text:'Réserve vitale faible',freq:330,end:250,duration:.32,type:'sine',noise:0,gain:.065}
});
function preferences(v={}){const out={...DEFAULTS};if(!v||typeof v!=='object')return out;for(const k of Object.keys(out)){if(typeof out[k]==='boolean'){if(typeof v[k]==='boolean')out[k]=v[k];}else if(Number.isFinite(v[k]))out[k]=clamp(v[k],0,1);}return out;}
class CueBus{
 constructor(){this.reset();}
 reset(){this.room=null;this.lastTime=-1;this.previous=null;this.cooldowns=new Map();this.captions=[];this.pending=[];this.hazards=new Map();this.walk=0;this.work=null;}
 push(kind,time,{text,pan=0,key=kind,gap=.12}={}){
  const cue=Object.hasOwn(CUES,kind)?CUES[kind]:null;if(!cue||!Number.isFinite(time)||time<0)return false;
  if(time-(this.cooldowns.get(key)??-Infinity)<gap)return false;this.cooldowns.set(key,time);
  const c={kind,bus:cue.bus,time,pan:clamp(Number.isFinite(pan)?pan:0,-1,1),text:String(text||cue.text).slice(0,180)};
  this.pending.push(c);this.pending=this.pending.slice(-16);
  if(!this.captions.some(x=>x.kind===kind&&time-x.time<2.4)){this.captions.push(c);this.captions=this.captions.slice(-8);}return true;
 }
 sync(g){const t=g.state.stats.time;if(this.room!==g.room.id||t<this.lastTime){this.reset();this.room=g.room.id;}this.lastTime=t;return t;}
 event(e,g){
  const t=this.sync(g);if(!e||typeof e.type!=='string')return;
  const near=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&g.distance(g.p,p)<=520&&g.visible(g.p,p);
  const pan=p=>p&&Number.isFinite(p.x)?clamp((p.x-g.p.x)/600,-.75,.75):0;
  if(e.type==='room'){this.previous=null;this.captions=[];this.pending=[];return;}
  if(e.type==='shot'&&near(e.from))this.push(Object.hasOwn(CUES,e.weapon)?e.weapon:'pistol',t,{pan:pan(e.from),gap:.1});
  else if(e.type==='sound'&&['reload','dodge'].includes(e.text))this.push(e.text,t);
  else if(e.type==='damage')this.push('hurt',t,{gap:.5});
  else if(e.type==='windup'&&near(e))this.push('windup',t,{pan:pan(e),gap:.3});
  else if(['attack','hit','spark'].includes(e.type)&&near(e))this.push('impact',t,{pan:pan(e),gap:.18});
  else if(e.type==='sensor-signal')this.push('sensor',t,{text:e.text,key:'sensor-'+e.sensor,gap:1});
  else if(e.type==='pursuit-warning')this.push('pursuit',t,{text:e.text,gap:1.5});
  else if(e.type==='pursuit-arrival')this.push('pursuit',t,{text:e.text,gap:.5});
  else if(e.type==='storage')this.push('latch',t,{text:'Casier déverrouillé'});
  else if(e.type==='archive')this.push('confirm',t,{text:'Dossier consigné',gap:.5});
  else if(e.type==='saved'&&/cloison|panneau|Éclairage|éclairage|fermée|ouverte|rompue/i.test(e.text||''))this.push('latch',t,{text:e.text,gap:.4});
 }
 update(g){
  const t=this.sync(g),p=g.p,prev=this.previous;
  if(prev){
   const walked=g.distance(prev,p);if(walked<90&&walked>0.5){this.walk+=walked;if(this.walk>=48){this.walk%=48;this.push('step',t,{gap:.18});}}
   if(prev.hp>25&&p.hp<=25)this.push('low',t,{text:'État de la combinaison critique',gap:3});
   if(prev.filter>20&&p.filter<=20)this.push('low',t,{text:'Cartouche filtrante presque saturée',key:'filter-low',gap:3});
   if(g.state.rescue.active){for(const a of g.state.rescue.actors){const before=prev.actors?.find(b=>b.id===a.id);if(before&&g.distance(a,before)>0.5&&g.distance(g.p,a)<520&&g.visible(g.p,a)){this.push('wheels',t,{gap:.5});break;}}}
  }
  this.previous={x:p.x,z:p.z,hp:p.hp,filter:p.filter,actors:g.state.rescue.actors.map(a=>({id:a.id,x:a.x,z:a.z}))};
  if(g.activeWork){this.push('work',t,{text:g.activeWork.label||'Intervention en cours',gap:.8});}
  for(const h of g.room.hazards||[]){const phase=g.hazardStatus(h).phase,old=this.hazards.get(h.id);this.hazards.set(h.id,phase);
   if(phase!==old&&['active','warning'].includes(phase)&&g.distance(g.p,h)<520&&g.visible(g.p,h))this.push(phase==='warning'?'warning':({arc:'electric',electric:'electric',steam:'steam',gas:'gas'})[h.kind]||'steam',t,{text:h.label+(phase==='warning'?' — préavis visible':' — émission visible'),key:h.id+phase,gap:1});
  }
 }
 drain(){const a=this.pending;this.pending=[];return a;}
 captionsAt(time){return this.captions.filter(c=>time>=c.time&&time-c.time<3.8).sort((a,b)=>(a.bus==='alerts'?0:1)-(b.bus==='alerts'?0:1)||b.time-a.time).slice(0,2);}
}
/* Every voice disconnects after its envelope; deterministic noise does not use game RNG. */
function synth(ctx,dest,kind,{volume=1,pan=0,start=ctx.currentTime,onended}={}){
 const def=Object.hasOwn(CUES,kind)?CUES[kind]:null;if(!def)return null;const nodes=[],t=start,d=def.duration,envelope=ctx.createGain(),osc=ctx.createOscillator();nodes.push(envelope,osc);
 const gain=def.gain*clamp(volume,0,1);envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(gain,t+.009);envelope.gain.exponentialRampToValueAtTime(.00001,t+d);envelope.gain.setValueAtTime(0,t+d+.01);
 let output=envelope;if(ctx.createStereoPanner){const stereo=ctx.createStereoPanner();stereo.pan.value=clamp(pan,-1,1);envelope.connect(stereo);nodes.push(stereo);output=stereo;}output.connect(dest);
 osc.type=def.type;osc.frequency.setValueAtTime(def.freq,t);osc.frequency.exponentialRampToValueAtTime(def.end,t+d);osc.connect(envelope);osc.start(t);osc.stop(t+d+.012);
 let noise;
 if(def.noise>0){const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*(d+.02)),ctx.sampleRate),a=b.getChannelData(0);let seed=kind.split('').reduce((s,c)=>s+c.charCodeAt(0),117);for(let i=0;i<a.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;a[i]=(seed/4294967295*2-1)*def.noise;}
  noise=ctx.createBufferSource();noise.buffer=b;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=kind==='electric'?3000:1200;noise.connect(f);f.connect(envelope);nodes.push(noise,f);noise.start(t);noise.stop(t+d+.012);
 }
 let done=false;const cleanup=()=>{if(done)return;done=true;for(const n of nodes)try{n.disconnect();}catch(e){}if(onended)onended();};osc.onended=cleanup;
 return {stop(){try{osc.stop();noise?.stop();}catch(e){}cleanup();},nodes,duration:d};
}
class Mixer{
 constructor(options){this.options=preferences(options);this.ctx=null;this.buses={};this.voices=new Set();this.desired=false;this.pendingState=false;this.error=null;this.roomKind='';this.destroyed=false;}
 unlock(){
  if(this.ctx||this.destroyed)return;
  const A=root.AudioContext||root.webkitAudioContext;if(!A){this.error='Audio Web indisponible. Les légendes restent utilisables.';return;}
  try{this.ctx=new A();const c=this.ctx;this.master=c.createGain();this.master.gain.value=0;const limit=c.createDynamicsCompressor();limit.threshold.value=-10;limit.knee.value=10;limit.ratio.value=6;limit.attack.value=.003;limit.release.value=.15;this.master.connect(limit);limit.connect(c.destination);this.limit=limit;
   for(const id of ['ambience','effects','alerts']){this.buses[id]=c.createGain();this.buses[id].connect(this.master);}
   const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),a=b.getChannelData(0);let seed=911;for(let i=0;i<a.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;a[i]=(seed/4294967295-.5)*.25;}
   this.noise=c.createBufferSource();this.noise.buffer=b;this.noise.loop=true;this.filter=c.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=190;this.noise.connect(this.filter);this.filter.connect(this.buses.ambience);this.noise.start();
   this.hum=c.createOscillator();this.hum.type='sine';this.hum.frequency.value=43;this.humGain=c.createGain();this.humGain.gain.value=.016;this.hum.connect(this.humGain);this.humGain.connect(this.buses.ambience);this.hum.start();this.configure(this.options);this.reconcile();
  }catch(e){this.error='Le navigateur a refusé l’audio. Les légendes restent actives.';}
 }
 configure(p){this.options=preferences(p);if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.options.master*.75,t,.025);for(const b of Object.keys(this.buses))this.buses[b].gain.setTargetAtTime(this.options[b],t,.025);if(!this.options.enabled)this.stopVoices();this.reconcile();}
 set(on){this.desired=!!on&&this.options.enabled;if(!this.desired)this.stopVoices();this.reconcile();}
 reconcile(){if(!this.ctx||this.pendingState||this.destroyed)return;const on=this.desired&&this.options.enabled;
  if(on&&this.ctx.state==='suspended'||!on&&this.ctx.state==='running'){this.pendingState=true;Promise.resolve(on?this.ctx.resume():this.ctx.suspend()).catch(()=>{this.error='Activation audio refusée ; réactivez le son depuis Réglages.';this.desired=false;}).finally(()=>{this.pendingState=false;if(this.ctx&&(this.desired&&this.options.enabled)!==(this.ctx.state==='running'))this.reconcile();});}
 }
 scene(room){if(!this.ctx||this.roomKind===room.kind)return;this.roomKind=room.kind;const exterior=/sand|surface|exterior|storm/.test(room.kind),organic=/hive|organic|tube|ruin/.test(room.kind);const t=this.ctx.currentTime;this.filter.frequency.setTargetAtTime(exterior?550:organic?145:240,t,.6);this.hum.frequency.setTargetAtTime(organic?37:exterior?49:58,t,.6);}
 play(cue){if(!this.ctx||!this.desired||!this.options.enabled||this.ctx.state!=='running'||this.voices.size>=16)return false;const def=Object.hasOwn(CUES,cue.kind)?CUES[cue.kind]:null;if(!def||this.options.master===0||this.options[def.bus]===0)return false;let v;v=synth(this.ctx,this.buses[def.bus],cue.kind,{pan:cue.pan,onended:()=>this.voices.delete(v)});if(v)this.voices.add(v);return !!v;}
 stopVoices(){for(const v of this.voices)v.stop();this.voices.clear();}
 async dispose(){this.destroyed=true;this.stopVoices();if(!this.ctx)return;try{this.noise.stop();this.hum.stop();await this.ctx.close();}catch(e){}this.ctx=null;}
}
const API={CUES,DEFAULTS,preferences,CueBus,Mixer,synth};if(typeof module!=='undefined'&&module.exports)module.exports=API;root.SoSSoundscape=API;
})(typeof globalThis!=='undefined'?globalThis:this);
