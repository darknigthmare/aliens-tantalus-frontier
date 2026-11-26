import { CONTENT } from './content.js';
import { distance, ROOMS } from './engine.js';
import { isVacuum } from './life-support.js';
/** Readout, battery handling and perceptible sound cues. Optional audio playback
 * never changes acoustic simulation. Readout samples are intentionally transient.
 */
export const QUICK_ITEMS=[
 {id:'noise',name:'Leurre sonore',key:'G',icon:'noise',cost:'2 pièces · 1 pile',detail:'Détourne l’attention après le vol et l’amorçage.'},
 {id:'flare',name:'Fusée éclairante',key:'L',icon:'flare',cost:'1 pièce · 1 produit',detail:'Lumière et diversion. Sa présence ne vous protège pas.'},
 {id:'emp',name:'Bombe IEM',key:'X',icon:'emp',cost:'2 pièces · 2 piles',detail:'Neutralise temporairement les synthétiques proches de l’impact.'},
 {id:'medkit',name:'Trousse de soins',key:'H',icon:'medkit',cost:'1 pièce · 2 produits',detail:'Restaure 55 PV. Ne recharge ni l’air ni le détecteur.'}
];
const signalFinite=(value,base,min,max)=>typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):base;
export function freshSignals(){return{charge:100,silent:false,selected:'noise',stats:{scans:0,pings:0,swaps:0,dockCharges:0,drained:0}};}
export function cleanSignals(raw){const out=freshSignals();if(!raw||typeof raw!=='object')return out;
 out.charge=signalFinite(raw.charge,100,0,100);out.silent=raw.silent===true;
 if(QUICK_ITEMS.some(i=>i.id===raw.selected))out.selected=raw.selected;
 for(const k of Object.keys(out.stats))out.stats[k]=signalFinite(raw.stats?.[k],0,0,1e9);
 return out;
}
export class IsolationSignals{
 constructor(engine){this.engine=engine;this.reset();}
 get cfg(){return CONTENT.signals;}
 get state(){return this.engine.s.signals;}
 reset(){this.samples=new Map();this.echoes=[];this.clock=0;this.readoutRoom=null;this.wasActive=false;this.swap=null;this.swapLatched=false;this.cues=[];this.travel=new Map();this.lastImpact=0;this.everLow=false;}
 get range(){return this.cfg.interferenceRooms.includes(this.engine.s.room)?this.cfg.interferenceRange:this.cfg.range;}
 select(id){if(!QUICK_ITEMS.some(i=>i.id===id))return false;this.state.selected=id;return true;}
 useSelected(){const e=this.engine,s=e.s;if(e.paused||s.dead||s.ended||s.hidden||e.pendingHack||this.swap)return false;
 const id=this.state.selected,n=e.messages.at(-1);let ok=id==='medkit'?e.heal():e.deploy(id);
 if(!ok&&e.messages.at(-1)===n)e.message(s.inventory[id]<=0?'Aucun '+QUICK_ITEMS.find(i=>i.id===id).name.toLowerCase()+' en réserve.':id==='medkit'?'Santé complète.':'Attendez la fin du précédent lancer.','warning');return ok;
 }
 toggleSilent(){const e=this.engine;if(e.paused||e.s.dead||e.s.ended||!e.s.tools.tracker||e.pendingHack||this.swap)return false;this.state.silent=!this.state.silent;e.message(this.state.silent?'Détecteur · haut-parleur coupé. La mesure reste active.':'Détecteur · haut-parleur actif. Les bips portent à courte distance.');return true;}
 candidates(){const e=this.engine,s=e.s;const out=s.enemies.filter(n=>n.hp>0&&n.min<=s.chapter&&n.room===s.room).map(n=>({id:n.id,x:n.x,y:n.y,room:n.room}));
 for(const n of s.encounters.rescues)if(n.room===s.room&&!['sheltered','dead','hiding'].includes(n.status)&&s.chapter>=e.encounters.spec(n.id).min)out.push({id:'rescue:'+n.id,x:n.x,y:n.y,room:n.room});
 if(s.alien.active&&s.alien.room===s.room&&s.alien.mode!=='vent')out.push({id:'alien',x:s.alien.x,y:s.alien.y,room:s.room});return out;
 }
 tickSamples(dt){const s=this.engine.s,seen=new Set();for(const n of this.candidates()){
  seen.add(n.id);const old=this.samples.get(n.id);if(!old||old.room!==n.room)this.samples.set(n.id,{...n,travel:0});
  else{const d=distance(old,n);old.travel+=d<=Math.max(36,dt*650)?d:0;old.x=n.x;old.y=n.y;}
 }for(const id of this.samples.keys())if(!seen.has(id))this.samples.delete(id);
 }
 scan(){const e=this.engine,s=e.s,st=this.state;st.stats.scans++;
 for(const [id,n] of this.samples){if(n.travel>this.cfg.minimumTravel&&distance(s,n)<this.range){const dot={id,room:s.room,x:n.x,y:n.y,ttl:this.cfg.echoLife};const i=this.echoes.findIndex(d=>d.id===id);if(i>=0)this.echoes[i]=dot;else this.echoes.push(dot);}n.travel=0;}
 if(this.echoes.length&&!st.silent){st.stats.pings++;if(!isVacuum(s.room)){e.emitNoise(s.x,s.y,this.cfg.pingNoise);const a=s.alien;if(s.hidden&&a.active&&a.room===s.room&&a.mode!=='vent'&&e.heardAt(a,s,this.cfg.pingNoise,s.room))a.seenHide=s.hidden;}e.events.push({type:'scanner-ping',room:s.room,time:+s.time.toFixed(2)});}
 }
 update(dt,input){const e=this.engine,s=e.s,st=this.state;
 this.cues=this.cues.filter(c=>(c.ttl-=dt)>0);
 if(this.readoutRoom!==s.room){this.samples.clear();this.echoes=[];this.clock=0;this.readoutRoom=s.room;this.cues=[];}
 this.echoes=this.echoes.filter(d=>(d.ttl-=dt)>0);
 this.updateSwap(dt,input);
 const active=!!(!s.dead&&!s.ended&&input.tracker&&s.tools.tracker&&st.charge>0&&!this.swap&&!e.pendingHack&&!input.blockTools);
 s.tracker=active;
 if(active){st.charge=Math.max(0,st.charge-this.cfg.chargeRate*dt);this.tickSamples(dt);this.clock+=dt;
  if(this.clock>=this.cfg.interval){this.clock%=this.cfg.interval;this.scan();}
  if(st.charge<=20&&!this.everLow){e.message('Détecteur · pile faible. Y : remplacer ; banc de charge : recharger.','warning');this.everLow=true;}
  if(st.charge===0){st.stats.drained++;s.tracker=false;this.echoes=[];e.message('Détecteur hors tension. Aucun écho ne signifie pas que la pièce est vide.','warning');}
 }else{this.samples.clear();this.echoes=[];this.clock=0;}
 this.wasActive=active;if(st.charge>25)this.everLow=false;
 }
 updateSwap(dt,input){const e=this.engine,s=e.s;
 if(!input.swapBattery){this.swap=null;this.swapLatched=false;return;}
 if(this.swapLatched)return;
 const invalid=s.hidden||e.pendingHack||e.aim||input.blockTools||s.dead||s.ended||e.frameTravel>0||input.x||input.y||input.interact;
 if(invalid){this.swap=null;this.swapLatched=true;return;}
 if(!this.swap){
  if(!s.tools.tracker||this.state.charge>=100||s.inventory.battery<1){e.message(!s.tools.tracker?'Détecteur non obtenu.':this.state.charge>=100?'Pile du détecteur déjà pleine.':'Aucune pile de rechange.','warning');this.swapLatched=true;return;}
  this.swap={progress:0,room:s.room,x:s.x,y:s.y,damage:s.stats.damage};
 }
 if(this.swap.room!==s.room||distance(s,this.swap)>1||s.stats.damage!==this.swap.damage){this.swap=null;this.swapLatched=true;return;}
 this.swap.progress+=dt;
 if(this.swap.progress>=this.cfg.swapTime){if(s.inventory.battery>0&&this.state.charge<100){s.inventory.battery--;this.state.charge=Math.min(100,this.state.charge+this.cfg.swapCharge);this.state.stats.swaps++;e.message('Pile remplacée · '+Math.ceil(this.state.charge)+' % de charge.');e.events.push({type:'scanner-reload',room:s.room,time:+s.time.toFixed(2)});}this.swap=null;this.swapLatched=true;}
 }
 cancelHandling(){this.swap=null;this.swapLatched=true;this.engine.s.tracker=false;this.samples.clear();this.echoes=[];this.clock=0;}
 readout(){const s=this.engine.s;if(!s.tools.tracker||!s.tracker||this.state.charge<=0)return[];
 return this.echoes.filter(d=>d.room===s.room&&d.ttl>0&&distance(d,s)<this.range).map(d=>({dx:d.x-s.x,dy:d.y-s.y,distance:distance(d,s),ttl:d.ttl}));
 }
 targets(){const s=this.engine.s;return this.cfg.stations.filter(p=>p.room===s.room).map(p=>({...p,type:'signal-charge',hold:this.cfg.dockTime,label:'Recharger le détecteur · '+Math.ceil(this.state.charge)+' %'}));}
 recharge(target){const e=this.engine,s=e.s,p=this.cfg.stations.find(p=>p.id===target?.id&&p.room===s.room);
 if(!p||distance(s,p)>88||s.hidden||e.paused||s.dead||s.ended||e.pendingHack||this.swap)return false;
 if(!s.tools.tracker){e.message('Il vous faut le détecteur.','warning');return false;}
 if(this.state.charge>=100){e.message('Le détecteur est déjà chargé.');return false;}
 if((s.systems[s.room]?.mode||0)!==0){e.message('Banc hors tension. Rétablissez le circuit local en éclairage normal.','warning');return false;}
 this.state.charge=100;this.state.stats.dockCharges++;e.message('Détecteur rechargé. Aucune pile de rechange consommée.');e.emitNoise(s.x,s.y,.15);e.events.push({type:'scanner-dock',room:s.room,time:+s.time.toFixed(2)});return true;
 }
 /** These cues disclose no identity or exact distance; physical hearing is used. */
 hear(source,level,label){const e=this.engine,s=e.s;if(!source||!ROOMS[source.room]||isVacuum(source.room)||isVacuum(s.room))return false;
 if(!e.heardAt({room:s.room,x:s.x,y:s.y},source,level,source.room))return false;
 const side=source.room!==s.room?'DERRIÈRE UN SEUIL':Math.abs(source.x-s.x)<48?'TOUT PRÈS':source.x<s.x?'À GAUCHE':'À DROITE';
 const allowed=['Pas lourds','Pas mécaniques','Pas rapides','Grille métallique','Chocs sur une porte'];if(!allowed.includes(label))return false;
 const key=label+'|'+side,existing=this.cues.find(c=>c.key===key);
 if(existing){existing.ttl=2.8;return true;}
 const cue={key,label,side,ttl:2.8};this.cues.push(cue);this.cues=this.cues.slice(-3);
 e.events.push({type:'perceived-sound',label,side,room:s.room,time:+s.time.toFixed(2)});return true;
 }
 footsteps(actor,old){const key=actor.id||'alien',s=this.engine.s;
 if(!old||old.room!==actor.room)return;
 const d=distance(old,actor);if(d<.01||d>45)return;
 let t=(this.travel.get(key)||0)+d;const threshold=key==='alien'?100:120;
 if(t>=threshold){t%=threshold;this.hear(actor,key==='alien'?.65:actor.kind==='joe'?.5:.3,key==='alien'?'Pas lourds':actor.kind==='joe'?'Pas mécaniques':'Pas rapides');}this.travel.set(key,t);
 }
}
