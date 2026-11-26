import { CONTENT } from './content.js';
import { ROOMS, distance, clearSight, clamp } from './engine.js';
/** Optional original refuge projects. All costs are committed only after validation.
 * This module owns no host-game state and never writes to the browser directly.
 */
const refugeSpecs=Object.fromEntries(CONTENT.refuges.map(r=>[r.id,r]));
const refugeNum=(v,a,b,f=a)=>Number.isFinite(Number(v))?Math.max(a,Math.min(b,Math.floor(Number(v)))):f;
export const refugeCostLabel=cost=>Object.entries(cost).map(([k,v])=>`${v} ${{scrap:'pièce(s)',chemical:'produit(s)',battery:'pile(s)'}[k]}`).join(' + ');
export function freshRefuges(){return {version:1,parts:[],consumed:[],stations:Object.fromEntries(CONTENT.refuges.map(r=>[r.id,{powered:false,installed:false,uses:0}]))};}
export function cleanRefuges(raw,state){
 const out=freshRefuges(),ids=new Set(CONTENT.refuges.flatMap(r=>r.parts.map(p=>p.id)));
 out.parts=Array.isArray(raw?.parts)?[...new Set(raw.parts.filter(id=>ids.has(id)))]:[];
 out.consumed=Array.isArray(raw?.consumed)?[...new Set(raw.consumed.filter(id=>ids.has(id)))]:[];
 for(const spec of CONTENT.refuges){
  const v=raw?.stations?.[spec.id],station=out.stations[spec.id];
  // A saved upgrade is valid only if the associated survivor has actually arrived.
  const arrived=Array.isArray(state?.encounters?.rescues)&&state.encounters.rescues.some(n=>n?.id===spec.npc&&n.status==='rescued');
  station.powered=arrived&&v?.powered===true;
  station.installed=station.powered&&v?.installed===true;
  station.uses=refugeNum(v?.uses,0,spec.charges);
  if(station.installed)for(const part of spec.parts)if(!out.consumed.includes(part.id))out.consumed.push(part.id);
 }
 out.parts=out.parts.filter(id=>!out.consumed.includes(id));return out;
}
export class IsolationRefuges{
 constructor(engine){this.e=engine;}
 get s(){return this.e.s;}get data(){return this.s.refuges;}
 spec(id){return refugeSpecs[id]||null;}
 station(id){return this.data.stations[id];}
 upgraded(id){return this.station(id)?.installed===true;}
 arrived(id){const spec=this.spec(id);return !!spec&&this.s.encounters.rescues.some(n=>n.id===spec.npc&&n.status==='rescued');}
 collected(id){return this.data.parts.includes(id)||this.data.consumed.includes(id);}
 event(type,data){this.e.events.push({type,time:+this.s.time.toFixed(2),...data});}
 status(id){const spec=this.spec(id),station=this.station(id);if(!spec)return null;
  return{...station,id,arrived:this.arrived(id),remaining:Math.max(0,spec.charges-station.uses),parts:spec.parts.map(p=>({...p,collected:this.collected(p.id),used:this.data.consumed.includes(p.id)}))};
 }
 reason(spec,action){
  const station=this.station(spec.id);
  if(!this.arrived(spec.id))return 'Ramenez d’abord '+this.e.encounters.spec(spec.npc).name+' au refuge.';
  if(action==='power'){if(station.powered)return 'Ce poste est déjà alimenté.';}
  else if(!station.powered)return 'Rétablissez le relais du refuge : 2 pièces + 1 pile.';
  if(action==='install'){
   if(station.installed)return 'Ce projet est déjà installé.';
   const missing=spec.parts.filter(p=>!this.data.parts.includes(p.id));
   if(missing.length)return 'Colis manquants : '+missing.map(p=>p.label).join(' / ')+'. J affiche leurs emplacements.';
  }
  if(action==='service'){
   if(station.uses>=spec.charges)return 'Les trois lots de ce poste sont épuisés.';
   if(spec.id==='medical'&&this.s.health>=100)return 'Santé complète : aucune ressource consommée.';
   if(spec.id==='technical'&&!this.s.tools.flame)return 'Le lance-flammes doit avoir été récupéré.';
   if(spec.id==='technical'&&this.s.fuel>=180)return 'Réserve de carburant pleine : aucune ressource consommée.';
  }
  const cost=spec[action==='power'?'powerCost':action==='install'?'installCost':'serviceCost'];
  if(Object.entries(cost).some(([k,v])=>this.s.inventory[k]<v))return 'Ressources nécessaires : '+refugeCostLabel(cost)+'.';
  return null;
 }
 targets(){
  const out=[];
  for(const p of this.e.room.props){
   if(p.interactive==='supply'&&!this.collected(p.part)){
    const spec=this.spec(p.refuge),part=spec?.parts.find(v=>v.id===p.part);if(!part||this.s.chapter<this.e.encounters.spec(spec.npc).min)continue;
    out.push({id:p.id,type:'supply',x:p.x,y:p.y,label:'Récupérer · '+part.label,hold:1.2,prop:p});
   }
   if(p.interactive==='refuge'){
    const spec=this.spec(p.refuge),station=this.station(p.refuge);if(!spec||!station)continue;
    const cost=spec[p.action==='power'?'powerCost':p.action==='install'?'installCost':'serviceCost'];
    const name=p.action==='power'?'Alimenter le poste':p.action==='install'?spec.project:spec.service;
    const suffix=p.action==='install'&&station.installed?'INSTALLÉ':p.action==='power'&&station.powered?'ACTIF':p.action==='service'?`${Math.max(0,spec.charges-station.uses)} / ${spec.charges} lots · ${refugeCostLabel(cost)}`:refugeCostLabel(cost);
    out.push({id:p.id,type:'refuge',x:p.x,y:p.y,label:`${name} · ${suffix}`,hold:p.action==='install'?3:p.action==='power'?2:spec.hold,prop:p});
   }
  }
  return out.filter(t=>clearSight(this.s.room,this.s,t));
 }
 use(t){
  if(this.e.paused||this.s.dead||this.s.ended||this.s.hidden||this.e.pendingHack)return false;
  // Do not trust caller-provided prop/action/cost. Resolve the current local target again.
  const current=this.targets().find(q=>q.id===t?.id&&q.type===t?.type);
  if(!current||distance(this.s,current)>87)return false;
  const p=current.prop,spec=this.spec(p.refuge);
  if(current.type==='supply'){
   if(this.collected(p.part))return false;
   this.data.parts.push(p.part);if(!this.s.opened.includes(p.id))this.s.opened.push(p.id);
   this.event('refuge-part-collected',{part:p.part,room:this.s.room});
   this.e.message(spec.parts.find(x=>x.id===p.part).label+' récupéré. À rapporter : '+spec.name+'.','archive');return true;
  }
  const error=this.reason(spec,p.action);if(error){this.e.message(error,'warning');return false;}
  const cost=spec[p.action==='power'?'powerCost':p.action==='install'?'installCost':'serviceCost'];
  for(const [key,n]of Object.entries(cost))this.s.inventory[key]-=n;
  const station=this.station(spec.id);
  if(p.action==='power'){station.powered=true;this.e.message(spec.name+' alimenté. Les services sont disponibles.');}
  else if(p.action==='install'){
   station.installed=true;for(const part of spec.parts){this.data.parts=this.data.parts.filter(id=>id!==part.id);if(!this.data.consumed.includes(part.id))this.data.consumed.push(part.id);}
   this.e.message(spec.project+' installé. '+spec.description,'dialogue');
  }else{
   station.uses++;if(spec.id==='medical')this.s.health=clamp(this.s.health+40,0,100);else this.s.fuel=clamp(this.s.fuel+40,0,180);
   this.e.message(spec.service+' · '+(spec.charges-station.uses)+' lot(s) restant(s).');
  }
  this.event('refuge-'+p.action,{refuge:spec.id,uses:station.uses});return true;
 }
}
