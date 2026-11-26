import { CONTENT } from './content.js';
/** Local pressure model. Not zero-gravity, decompression fluid dynamics or a rope simulation. */
const supportRoomMap=Object.fromEntries(CONTENT.rooms.map(r=>[r.id,r]));
const bounded=(value,min,max,fallback=min)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
export const isVacuum=room=>CONTENT.lifeSupport.vacuumRooms.includes(room);
export function freshLifeSupport(){return {oxygen:100,hypoxia:0,damageClock:0,used:[],warnings:[],airlock:null,exposure:0,cycles:0,refills:0};}
export function cleanLifeSupport(raw,state){
 const out=freshLifeSupport();if(!raw||typeof raw!=='object')return out;
 out.oxygen=bounded(raw.oxygen,0,100,100);out.hypoxia=bounded(raw.hypoxia,0,5);out.damageClock=bounded(raw.damageClock,0,2);
 const ids=new Set(CONTENT.rooms.flatMap(r=>r.props.filter(p=>p.interactive==='oxygen').map(p=>p.id)));
 out.used=Array.isArray(raw.used)?[...new Set(raw.used.filter(id=>ids.has(id)))]:[];
 out.warnings=Array.isArray(raw.warnings)?[...new Set(raw.warnings.filter(n=>[35,15,0].includes(n)))]:[];
 for(const key of ['exposure','cycles','refills'])out[key]=bounded(raw[key],0,1e8);
 const a=raw.airlock,link=CONTENT.links.find(l=>l.id===a?.id);
 if(link&&['cycling','ready'].includes(a.stage)&&a.room===state.room&&[link.a,link.b].includes(state.room)&&isVacuum(link.a)!==isVacuum(link.b)){
  out.airlock={id:link.id,room:state.room,stage:a.stage,remaining:bounded(a.remaining,0,CONTENT.lifeSupport.airlockSeconds),expires:bounded(a.expires,0,CONTENT.lifeSupport.airlockReadySeconds)};
 }
 return out;
}
export class IsolationLifeSupport{
 constructor(engine){this.e=engine;}
 get state(){return this.e.s.lifeSupport;}
 event(type,data={}){this.e.events.push({type,time:+this.e.s.time.toFixed(2),...data});}
 beforePassage(edge){
  const e=this.e,s=e.s,p=this.state;
  if(isVacuum(s.room)===isVacuum(edge.destination)||edge.kind==='memory')return true;
  const a=p.airlock;
  if(a?.id===edge.id&&a.room===s.room&&a.stage==='ready'){p.airlock=null;p.cycles++;this.event('airlock-crossed',{id:edge.id,from:s.room,to:edge.destination});return true;}
  if(a?.id===edge.id){e.message(`Égalisation de pression · ${Math.ceil(a.remaining)} s. Restez près du seuil.`);return false;}
  p.airlock={id:edge.id,room:s.room,stage:'cycling',remaining:CONTENT.lifeSupport.airlockSeconds,expires:CONTENT.lifeSupport.airlockReadySeconds};
  this.event('airlock-start',{id:edge.id,room:s.room});e.message('Sas en égalisation. Restez près du seuil, puis E pour traverser.','warning');return false;
 }
 refill(prop){
  const e=this.e,s=e.s,p=this.state;
  if(!prop||!supportRoomMap[s.room].props.some(x=>x.id===prop.id&&x.interactive==='oxygen')||Math.hypot(s.x-prop.x,s.y-prop.y)>88||p.used.includes(prop.id))return false;
  if(p.oxygen>95){e.message('Réserve suffisante : la bouteille de secours reste fermée.');return false;}
  p.used.push(prop.id);p.oxygen=Math.min(100,p.oxygen+CONTENT.lifeSupport.stationRefill);p.hypoxia=0;p.damageClock=0;p.refills++;
  p.warnings=p.warnings.filter(mark=>p.oxygen<=mark);this.event('oxygen-refill',{id:prop.id,oxygen:+p.oxygen.toFixed(2)});e.message('Bouteille raccordée : +65 O₂ au maximum. Ce point de recharge est maintenant vide.');return true;
 }
 update(dt,input={}){
  const e=this.e,s=e.s,p=this.state,c=CONTENT.lifeSupport;
  const a=p.airlock;
  if(a){const l=CONTENT.links.find(x=>x.id===a.id),point=l?.[l.a===s.room?'aPoint':'bPoint'];
   if(a.room!==s.room||!point||s.hidden||Math.hypot(s.x-point.x,s.y-point.y)>110){this.event('airlock-cancelled',{id:a.id});p.airlock=null;}
   else if(a.stage==='cycling'){a.remaining=Math.max(0,a.remaining-dt);if(a.remaining===0){a.stage='ready';this.event('airlock-ready',{id:a.id});e.message('Pression équilibrée · E au seuil pour traverser.');}}
   else{a.expires=Math.max(0,a.expires-dt);if(a.expires===0){p.airlock=null;this.event('airlock-expired',{id:a.id});}}
  }
  if(isVacuum(s.room)){
   p.exposure+=dt;
   const running=input.run&&!s.crouched&&e.frameTravel>0;
   p.oxygen=Math.max(0,p.oxygen-dt*c.drain[s.difficulty]*(running?c.runMultiplier:1)*(e.refuges.upgraded('technical')?.8:1));
   for(const mark of [35,15,0])if(p.oxygen<=mark&&!p.warnings.includes(mark)){
    p.warnings.push(mark);this.event('oxygen-warning',{mark,room:s.room});e.message(mark===0?'OXYGÈNE ÉPUISÉ · regagnez un local pressurisé ou une bouteille.':`OXYGÈNE ${mark} % · préservez une marge de retour.`,mark<=15?'danger':'warning');
   }
   if(p.oxygen===0){p.hypoxia=Math.min(c.hypoxiaDelay,p.hypoxia+dt);if(p.hypoxia>=c.hypoxiaDelay){p.damageClock-=dt;if(p.damageClock<=0){p.damageClock=2;e.damage(c.hypoxiaDamage,'Hypoxie de la combinaison');}}}
  }else{
   p.oxygen=Math.min(100,p.oxygen+dt*c.refillRate);p.hypoxia=0;p.damageClock=0;p.warnings=p.warnings.filter(mark=>p.oxygen<=mark);
  }
 }
 status(){const s=this.e.s,p=this.state,a=p.airlock;
  if(a)return {label:'SAS / PRESSION',detail:a.stage==='cycling'?`ÉGALISATION · ${a.remaining.toFixed(1)} s`:'PRESSION ÉQUILIBRÉE · E POUR TRAVERSER',progress:a.stage==='cycling'?1-a.remaining/CONTENT.lifeSupport.airlockSeconds:1,urgent:p.oxygen<15&&isVacuum(s.room)};
  if(isVacuum(s.room)||p.oxygen<99)return {label:isVacuum(s.room)?'COMBINAISON / OXYGÈNE':'CIRCUIT / RECHARGE',detail:`O₂ ${Math.ceil(p.oxygen)} % · ${isVacuum(s.room)?'bouteilles fixes à usage unique':'local pressurisé'}`,progress:p.oxygen/100,urgent:p.oxygen<=15};
  return null;
 }
}
