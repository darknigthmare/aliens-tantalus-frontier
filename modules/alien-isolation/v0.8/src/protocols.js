import { CONTENT } from './content.js';
/** Original playable interpretations, not the commercial game's mission scripts.
 * Ceiling travel is abstracted but timed on a declared graph. World interactions
 * never set the alien directly to the destination of the mission objective.
 */
const limits=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
export function freshProtocols(){return{
 gemini:{stage:'idle',pulse:0,segment:null,remaining:0,closing:0,crossings:0},
 samuels:{status:'idle',heat:0,order:[],mistakes:0,relief:0,overloads:0},
 anesidora:{status:'idle',remaining:0,stabilized:false,cues:[],elapsed:0},
};}
export function ductRoute(from,to,state){
 if(from===to)return[];
 const q=[from],seen=new Set(q),prev=new Map();
 for(let i=0;i<q.length;i++)for(const d of CONTENT.ducts||[]){
  if(d.min>state.chapter||(d.deny&&state.flags[d.deny]))continue;
  const dest=d.a===q[i]?d.b:d.b===q[i]?d.a:null;if(!dest||seen.has(dest))continue;
  seen.add(dest);prev.set(dest,{from:q[i],to:dest,id:d.id,seconds:d.seconds});
  if(dest===to){const out=[];let n=to;while(n!==from){const p=prev.get(n);out.push(p);n=p.from;}return out.reverse();}q.push(dest);
 }return null;
}
export function cleanProtocols(raw,state){
 const p=freshProtocols(),g=raw?.gemini,m=raw?.samuels,n=raw?.anesidora;
 const allowed=['idle','ready','luring','closing','contained','detached'];
 if(g&&allowed.includes(g.stage)){
  p.gemini.stage=g.stage;p.gemini.pulse=limits(g.pulse,0,2);p.gemini.closing=limits(g.closing,0,4);p.gemini.crossings=Math.floor(limits(g.crossings,0,1e5));
  const d=CONTENT.ducts.find(x=>x.id===g.segment?.id);
  if(d&&[d.a,d.b].includes(g.segment.from)&&[d.a,d.b].includes(g.segment.to)&&g.segment.from!==g.segment.to&&g.segment.from===state.alien.room){p.gemini.segment={id:d.id,from:g.segment.from,to:g.segment.to,seconds:d.seconds};p.gemini.remaining=limits(g.remaining,0,d.seconds);}
 }else if(state.flags.detached)p.gemini.stage='detached';else if(state.flags.lure)p.gemini.stage='luring';else if(state.flags.gemini)p.gemini.stage='ready';
 if(state.flags.detached)p.gemini.stage='detached';
 // A forged or inconsistent closed state cannot imprison a creature in another room.
 if(['closing','contained'].includes(p.gemini.stage)&&(state.alien.room!=='g_lab'||!state.alien.active||state.alien.mode==='vent'))p.gemini.stage='luring';
 if(m){p.samuels.status=['idle','active','complete'].includes(m.status)?m.status:'idle';p.samuels.heat=limits(m.heat,0,100);p.samuels.relief=limits(m.relief,0,15);p.samuels.mistakes=Math.floor(limits(m.mistakes,0,1e5));p.samuels.overloads=Math.floor(limits(m.overloads,0,1e5));}
 p.samuels.order=CONTENT.goals.filter(x=>['C12_02','C12_03','C12_04'].includes(x.id)&&state.completed.includes(x.id)).map(x=>x.id);
 if(state.flags.samuels)p.samuels.status='complete';else if(p.samuels.order.length)p.samuels.status='active';
 if(n){p.anesidora.status=['idle','active','escaped','failed'].includes(n.status)?n.status:'idle';p.anesidora.remaining=limits(n.remaining,0,240);p.anesidora.elapsed=limits(n.elapsed,0,1e8);p.anesidora.stabilized=n.stabilized===true;p.anesidora.cues=Array.isArray(n.cues)?n.cues.filter(x=>[90,45,15].includes(x)):[];}
 if(state.completed.includes('C15_03')){p.anesidora.status='escaped';state.flags.anesidoraEscaped=true;}
 else if(state.flags.anesidora&&(!n||n.status==='idle')){p.anesidora.status='active';p.anesidora.remaining={recit:180,survie:125,cauchemar:100}[state.difficulty];}
 if(p.anesidora.status==='failed'){state.dead=true;state.health=0;}
 return p;
}
export class IsolationProtocols{
 constructor(engine){this.e=engine;}
 get s(){return this.e.s;}get p(){return this.s.protocols;}
 event(type,details={}){this.e.events.push({type,time:+this.s.time.toFixed(2),...details});}
 moduleLocked(id){return ['closing','contained','detached'].includes(this.p.gemini.stage)&&CONTENT.links.some(l=>l.id===id&&(['g_lab','g_hazard'].includes(l.a)||['g_lab','g_hazard'].includes(l.b)));}
 controlsAlien(){return !!this.p.gemini.segment||['closing','contained'].includes(this.p.gemini.stage);}
 beforeGoal(g){
  if(g.flag==='detached'){
   const p=this.p.gemini,a=this.s.alien;
   if(p.stage==='contained'){if(a.active&&a.room==='g_lab'&&a.mode!=='vent')return true;p.stage='luring';}
   if(p.stage==='closing'){this.e.message(`Fermeture des clapets · ${Math.ceil(p.closing)} s. Maintenez la zone libre.`);return false;}
   if(!this.s.flags.lure||!a.active||a.room!=='g_lab'||a.mode==='vent'||p.segment){this.e.message('Capteur KG-348 : aucun contact au sol. Le leurre reste actif. Attendez la présence dans le module.','warning');return false;}
   p.stage='closing';p.closing=4;a.travel=null;a.destination=null;
   this.event('containment-start',{alienRoom:a.room,x:a.x,y:a.y});this.e.message('Contact au sol confirmé. Portes et clapets se ferment : quatre secondes.','warning');return false;
  }
  if(g.flag==='anesidoraEscaped'&&this.p.anesidora.status==='failed')return false;
  return true;
 }
 onGoal(g){
  const p=this.p,s=this.s;
  if(g.flag==='gemini'){p.gemini.stage='ready';this.event('gemini-armed',{alienRoom:s.alien.room,x:s.alien.x,y:s.alien.y});}
  if(g.flag==='lure'){p.gemini.stage='luring';p.gemini.pulse=0;this.event('gemini-lure',{alienRoom:s.alien.room});}
  if(g.flag==='detached'){p.gemini.stage='detached';p.gemini.segment=null;s.alien.active=false;this.event('module-detached',{alienRoom:s.alien.room});}
  if(['C12_02','C12_03','C12_04'].includes(g.id)){
   p.samuels.order.push(g.id);p.samuels.status=g.id==='C12_04'?'complete':'active';p.samuels.heat=g.id==='C12_02'?25:g.id==='C12_03'?Math.max(0,p.samuels.heat-12):0;
   this.event('circuit-isolated',{id:g.id,order:[...p.samuels.order]});
  }
  if(g.flag==='anesidora'){
   Object.assign(p.anesidora,{status:'active',remaining:{recit:180,survie:125,cauchemar:100}[s.difficulty],elapsed:0,stabilized:false,cues:[]});
   this.event('anesidora-overload',{seconds:p.anesidora.remaining});this.e.message('SURCHARGE · Rejoignez la navette. Le circuit de refroidissement peut gagner 40 secondes.','danger');
  }
  if(g.flag==='anesidoraEscaped'){p.anesidora.status='escaped';this.event('anesidora-escaped',{remaining:+p.anesidora.remaining.toFixed(2)});}
 }
 extraTargets(){
  const e=this.e,s=this.s,out=[];
  if(s.room==='a_samuels'&&s.chapter===11&&!s.flags.samuels){
   for(const g of CONTENT.goals.filter(g=>['C12_02','C12_03','C12_04'].includes(g.id)))if(e.goal?.id!==g.id&&!s.completed.includes(g.id))out.push({...g,type:'circuit',hold:1.1,label:'Disjoncteur '+g.label.split(' · ')[0].replace('Isoler ','')});
  }
  return out;
 }
 wrongCircuit(t){
  if(!this.extraTargets().some(x=>x.id===t.id)||this.p.samuels.relief>10)return false;
  const m=this.p.samuels;m.mistakes++;m.heat=Math.min(99,m.heat+22);m.relief=Math.max(m.relief,4);
  this.e.emitNoise(this.s.x,this.s.y,1.3);this.event('circuit-wrong',{id:t.id});this.e.message('Mauvais circuit. Protection réarmée, température en hausse. Ordre : D-01, C-02, P-03.','warning');return false;
 }
 relief(){const p=this.p.samuels;if(p.relief>0){this.e.message(`Purge thermique en récupération · ${Math.ceil(p.relief)} s.`);return false;}p.heat=Math.max(0,p.heat-32);p.relief=15;this.event('thermal-relief');this.e.message('Purge thermique : température réduite. Les disjoncteurs restent dans leur état actuel.');return true;}
 onOptional(task){if(task.protocol!=='coolant')return;const n=this.p.anesidora;if(n.status==='active'&&!n.stabilized){n.stabilized=true;n.remaining+=40;this.event('coolant-stabilized',{remaining:+n.remaining.toFixed(2)});}}
 hazardPhase(h){const n=this.p.anesidora;if(n.status!=='active'||h.disabledByCooling&&n.stabilized)return'off';const t=(n.elapsed+h.offset)%h.period;return t<h.warning?'warning':t<h.warning+h.on?'on':'off';}
 update(dt){this.gemini(dt);this.samuels(dt);this.anesidora(dt);}
 gemini(dt){
  const e=this.e,s=this.s,p=this.p.gemini,a=s.alien;
  if(p.stage==='closing'){
   if(a.room!=='g_lab'||!a.active||a.mode==='vent'){p.stage='luring';p.closing=0;this.event('containment-aborted');return;}
   this.containedMotion(dt);p.closing=Math.max(0,p.closing-dt);
   if(p.closing===0){p.stage='contained';a.memory=null;a.travel=null;a.mode='patrol';this.event('containment-verified',{room:a.room,x:a.x,y:a.y});e.message('KG-348 confiné. Présence confirmée, portes et clapets fermés. E au poste pour séparer le module.','warning');}
   return;
  }
  if(p.stage==='contained'){
   // Creature remains inside its sealed volume, not removed before detachment.
   this.containedMotion(dt);return;
  }
  if(p.stage!=='luring'||!a.active)return;
  p.pulse-=dt;
  if(a.room==='g_lab'){
   p.segment=null;
   if(p.pulse<=0){p.pulse=1.3;e.emitNoise(1184,318,2.1,'g_lab');}
   return;
  }
  if(a.mode==='vent'){
   if(!p.segment){const rr=ductRoute(a.room,'g_lab',s);if(!rr?.length)return;p.segment=rr[0];p.remaining=p.segment.seconds;a.memory=null;a.travel=null;this.event('duct-departure',{...p.segment});}
   p.remaining=Math.max(0,p.remaining-dt);a.timer=8;
   if(p.remaining===0){
    const segment=p.segment,room=CONTENT.rooms.find(r=>r.id===segment.to),v=room.vents[0];
    a.lastRoom=a.room;a.room=segment.to;a.x=v.x;a.y=v.y;a.memory=null;a.destination=null;e.enemyPaths.delete('alien');p.crossings++;p.segment=null;
    this.event('duct-arrival',{...segment,room:a.room});
    if(a.room==='g_lab'){a.timer=3;a.cue=false;a.groundTime=0;e.message('Capteur KG-348 : vibrations au plafond. Attendez que le contact descende au sol.','warning');}
   }
  }else if(a.mode!=='chase'){
   // Fixed station machinery guides the creature to a local grille; no player position is used.
   a.mode='retreat';a.timer=0;a.memory=null;a.travel=null;
  }
 }
 containedMotion(dt){
  const a=this.s.alien;if(a.room!=='g_lab'||!a.active||a.mode==='vent')return;
  const targets=[{x:1184,y:350},{x:750,y:350},{x:1140,y:184}];
  if(!a.destination||a.destination.room!=='g_lab'||Math.hypot(a.x-a.destination.x,a.y-a.destination.y)<32){
   const i=(a.containmentIndex||0)%targets.length;a.destination={room:'g_lab',...targets[i]};a.containmentIndex=(i+1)%targets.length;
  }
  a.travel=null;a.memory=null;a.mode='patrol';this.e.enemyMove(a,a.destination,96,dt);this.s.stats.alienSteps++;
 }
 samuels(dt){const m=this.p.samuels;m.relief=Math.max(0,m.relief-dt);if(m.status!=='active')return;m.heat=Math.min(100,m.heat+dt*.5);if(m.heat>=100){m.heat=62;m.overloads++;this.event('thermal-overload');if(this.s.room==='a_samuels')this.e.damage(14,'Surtension de l’interface');this.e.message('Protection thermique déclenchée. Utilisez la purge près du casier puis reprenez le circuit demandé.','warning');}}
 anesidora(dt){const e=this.e,s=this.s,n=this.p.anesidora;if(n.status!=='active')return;n.remaining=Math.max(0,n.remaining-dt);n.elapsed+=dt;
  for(const mark of [90,45,15])if(n.remaining<=mark&&!n.cues.includes(mark)){n.cues.push(mark);e.message(`Anesidora · ${mark} secondes avant la rupture. Rejoignez le poste de départ de la navette.`,mark===15?'danger':'warning');this.event('escape-warning',{seconds:mark});}
  for(const h of CONTENT.hazards)if(h.room===s.room&&this.hazardPhase(h)==='on'&&Math.abs(s.x-h.x)<h.w/2+12&&Math.abs(s.y-h.y)<h.d/2+10)e.damage(h.damage,'Vapeur brûlante');
  if(n.remaining<=0){n.status='failed';s.health=0;s.dead=true;e.pendingHack=null;e.aim=null;e.hold=null;this.event('anesidora-failure');e.message('SIGNAL PERDU · La rupture de l’Anesidora a coupé toute voie de retour.','danger');}
 }
 status(){const s=this.s,p=this.p;
  if(p.anesidora.status==='active')return{label:'ANESIDORA / RUPTURE',detail:`${Math.ceil(p.anesidora.remaining)} s · ${p.anesidora.stabilized?'retour isolé':'refroidissement disponible +40 s'}`,progress:p.anesidora.remaining/220,urgent:p.anesidora.remaining<45};
  if(s.room==='a_samuels'&&!s.flags.samuels)return{label:'INTERFACE / CIRCUITS',detail:`D-01 → C-02 → P-03 · charge thermique ${Math.ceil(p.samuels.heat)} %`,progress:p.samuels.heat/100,urgent:p.samuels.heat>75};
  if(['GEMINI'].includes(this.e.room.sector)&&!s.flags.detached&&s.flags.gemini){
   const a=s.alien,g=p.gemini,rr=ductRoute(a.room,'g_lab',s);
   const text=g.stage==='ready'?'Activez le leurre dans KG-348':g.stage==='contained'?'PRÉSENCE CONFIRMÉE · séparation autorisée':g.stage==='closing'?`FERMETURE · ${Math.ceil(g.closing)} s`:a.room==='g_lab'?(a.mode==='vent'?'Contact au plafond · attendez la descente':'CONTACT AU SOL · E au poste du sas'):g.segment?`Transit en gaine · ${rr?.length||1} raccord(s)`:'Leurre actif · recherche du contact';
   return{label:'KG-348 / CONFINEMENT',detail:text,progress:g.stage==='contained'?1:g.stage==='closing'?1-g.closing/4:a.room==='g_lab'?.7:.25,urgent:false};
  }return null;
 }
}
