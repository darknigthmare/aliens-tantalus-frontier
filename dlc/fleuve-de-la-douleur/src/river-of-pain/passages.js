/* Thresholds v04: deterministic traversal and imperfect, local sensory reports.
 * No browser dependencies. Passage animation is a bounded connector sequence,
 * not a freely navigable continuous shaft. No global enemy omniscience.
 */
(function(root){'use strict';
const D=root.ROP_DATA||(typeof require==='function'?require('./data.js'):null);
const rooms=new Map(D.rooms.map(r=>[r.id,r]));
const TYPES={corde:{type:'ladder',label:'Corde de reconstitution',boarding:.5,duration:1.8},escalier:{type:'stairs',label:'Escalier',boarding:.45,duration:1.4},'échelle':{type:'ladder',label:'Échelle de service',boarding:.5,duration:1.8},'monte-charge':{type:'lift',label:'Monte-charge',boarding:1.2,duration:2.4},sas:{type:'airlock',label:'Sas',boarding:1.1,duration:1.1}};
const key=(a,b)=>[a,b].sort().join('|');
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
function initial(){return {revision:4,transit:null,listening:null,reports:[],counts:{stairs:0,ladder:0,lift:0,airlock:0,listens:0,cancelled:0}};}
function config(p){return TYPES[p.kind]||null;}
function linked(from,to){return rooms.get(from)?.portals.find(p=>p.to===to);}
function validateAndUpgrade(s){
 if(s.passages===undefined)s.passages=initial();
 const a=s.passages;
 if(!record(a)||a.revision!==4||!record(a.counts)||!Array.isArray(a.reports)||a.reports.length>12)throw Error('Registre de passages invalide.');
 for(const name of Object.keys(initial().counts))if(!Number.isInteger(a.counts[name])||a.counts[name]<0||a.counts[name]>1e7)throw Error('Compteur de passage invalide.');
 for(const q of a.reports)if(!record(q)||!linked(q.from,q.to)||!finite(q.when)||q.when<0||q.when>s.elapsed+.01||!['quiet','uncertain','movement','danger'].includes(q.level)||typeof q.sealed!=='boolean')throw Error('Relevé de seuil invalide.');
 if(a.transit!==null){
  const t=a.transit,p=linked(t?.from,t?.to),d=p&&config(p);
  if(!record(t)||!p||!d||t.from!==s.room||t.portalId!==p.id||t.type!==d.type||!['boarding','travel'].includes(t.stage)||typeof t.emergency!=='boolean'||!finite(t.timer)||t.timer<0||!finite(t.duration)||t.duration!==d.duration+(t.emergency&&t.type==='lift'?1.6:0)||t.timer>(t.stage==='boarding'?d.boarding:t.duration)+.001||!finite(t.x)||!finite(t.z)||Math.abs(t.x-s.player.x)>.01||Math.abs(t.z-s.player.z)>.001)throw Error('Franchissement invalide.');
  if(s.status!=='playing'||s.systems.hiding||p.childOnly&&!D.characters[s.character].child||p.requires&&!s.flags[p.requires]||s.doors[key(t.from,t.to)]==='sealed')throw Error('Accès de franchissement incohérent.');
 }
 if(a.listening!==null){const q=a.listening;
  if(!record(q)||!linked(q.from,q.to)||q.from!==s.room||!finite(q.timer)||q.timer<0||q.timer>1.6||!finite(q.x)||!finite(q.z)||Math.abs(q.x-s.player.x)>38||Math.abs(q.z-s.player.z)>.07||a.transit||s.status!=='playing')throw Error('Écoute invalide.');}
 return s;
}
function report(sim,portal){
 const s=sim.s,back=linked(portal.to,s.room),w=s.world[portal.to];
 const sealed=s.doors[key(s.room,portal.to)]==='sealed';
 const queued=s.pursuers.filter(q=>q.enemy.hp>0&&key(q.from,q.to)===key(s.room,portal.to));
 const range=sealed?400:820;
 const near=(w?.enemies||[]).filter(e=>e.hp>0&&back&&Math.hypot(e.x-back.x,(e.z-back.z)*600)<range);
 const level=queued.length||near.some(e=>e.state==='chase'||e.state==='windup')?'danger':near.length?'movement':w?'quiet':'uncertain';
 return {from:s.room,to:portal.to,when:s.elapsed,level,sealed};
}
function wording(q){return {quiet:'Aucun mouvement perçu. Ce n’est pas une garantie.',uncertain:'Le bruit du bâtiment masque le passage.',movement:q.sealed?'Des frottements étouffés derrière la cloison.':'Quelque chose se déplace au-delà du seuil.',danger:q.sealed?'Des coups contre la cloison. Elle est sous pression.':'Mouvements rapides près du passage. Reculez.'}[q.level];}
function latest(s,portal){return [...s.passages.reports].reverse().find(q=>q.from===s.room&&q.to===portal.to)||null;}
const API={initial,config,TYPES,linked,key,report,wording,latest,validateAndUpgrade};
root.ROP_PASSAGES=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
