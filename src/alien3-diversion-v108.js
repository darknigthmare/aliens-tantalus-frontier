/** Optional industrial distraction in the two original encounter sequences.
 * Projectiles use the shared world geometry; scenery props do not become colliders.
 * All coordinates are game units. No claim of film-canonical equipment or real physics.
 */
import {center105,feet105,finite105,clamp105,delta105,gateOpenV105,closedBetweenV105,segmentRectV105} from './alien3-navigation-v105.js';
export const DIVERSION_RULES_V108=Object.freeze({reserve:3,radius:3.5,speed:345,lift:-142,gravity:620,cooldown:.85,pickupRange:42,pickupHeight:15,pickupDepth:.28,step:1/120,maxAge:6,maxBounces:2,power:.82,impactGap:.12});
export const DIVERSION_CONTRACTS_V108=Object.freeze([
 ['stock','Trois identités de boulon, pas un stock abstrait qui se régénère.'],['origin','Le lancer commence à la main de Ripley et conserve sa profondeur.'],['facing','Le lancer suit la direction du personnage ; aucune cible distante n’est choisie par téléportation.'],
 ['arc','Le boulon suit un arc intégré en sous-pas ; les déplacements balayent leur segment.'],['solid','Le sol, le dessous des plateformes et les portes fermées arrêtent ou font rebondir l’objet.'],['art','Les alcôves et objets du fond ne sont pas des obstacles physiques inventés.'],['impact','Le bruit est émis au point d’impact, à sa profondeur et son étage.'],['silent-air','Aucun bruit de diversion n’est émis avant le premier impact.'],['bounce','Deux rebonds amortis au maximum, puis immobilisation au sol.'],['voice-limit','Un délai empêche un obstacle mince de déclencher une rafale de sons.'],
 ['attention','Le bruit est traité par l’audition existante ; il ne force ni reconnaissance ni annulation d’attaque.'],['trace','Le Runner reçoit la dernière origine du bruit, jamais la position cachée actuelle du joueur.'],['dormant','Le prédateur reste dormant durant la préparation du piège qui le prévoit.'],['no-damage','Un boulon ne blesse et ne fige aucun acteur.'],['near-pickup','Ramasser exige appui, même profondeur, même étage et passage dégagé.'],['recover','Le même boulon repasse dans la poche, sans produire de copie.'],['lost','Un objet tombé hors du niveau ou dans le plomb chaud est perdu pour ce parcours.'],
 ['busy','Une manœuvre active empêche le lancer ; sa durée et son propriétaire ne sont pas modifiés.'],['limited-rate','La cadence du lancer ne dépend pas du nombre de répétitions clavier.'],['modal','Pause, plan, archives, échec et perte de focus suspendent les objets.'],['no-autothrow','Fermer un panneau ne déclenche pas un lancer qui avait été refusé.'],['pointer','Boutons tactiles et clavier appellent les mêmes méthodes de lancer et de récupération.'],
 ['save-air','Le fichier conserve le mouvement d’un boulon en vol, mais aucun son en attente.'],['save-ground','La position au repos doit correspondre à un support réel.'],['save-count','Les états poche, vol, sol et perdu doivent toujours totaliser trois objets.'],['safe','Le poste sûr conserve son stock propre, distinct de la situation courante.'],['migration','Les fichiers V105, V106 et V107 valides reçoivent une réserve initiale lors de la migration.'],['checksum','La validation vérifie aussi les positions et les invariants ; l’empreinte seule ne suffit pas.'],['render','Dessiner l’arc ou les impacts n’avance ni physique ni audition.'],['scope','Mécanique originale du banc et des séquences optionnelles ; aucun équipement natif de campagne remplacé.']
].map(([id,text])=>Object.freeze({id:'A3-108-'+id,text,validation:['scope','art','no-damage'].includes(id)?'scope / automated':'automated / browser'})));
const MODES=['traque','rabattage'];const states=['pocket','flying','rest','lost'];const R=DIVERSION_RULES_V108;
const emptyBolt=i=>({id:'bolt-'+(i+1),state:'pocket',x:null,y:null,vx:0,vy:0,depth:1,age:0,bounces:0,flight:0,origin:null,supportId:null,impactWait:0});
export function createDiversionV108(enc,model){return {schema:108,sequence:enc?.mode||null,signature:model?.signature||null,bolts:MODES.includes(enc?.mode)?Array.from({length:R.reserve},(_,i)=>emptyBolt(i)):[],cooldown:0,stats:{thrown:0,recovered:0,impacts:0,lost:0,heard:0}};}
export const pocketCountV108=s=>s?.bolts?.filter(b=>b.state==='pocket').length||0;
export function compileBoltGeometryV108(model){
 const levels=new Map();for(const p of model?.standard?.actorSupports||[]){if(![p.x,p.y,p.w].every(finite105)||p.w<=0)continue;const a=levels.get(p.y)||[];a.push({lo:p.x,hi:p.x+p.w});levels.set(p.y,a);}
 const floors=[];for(const [y,list]of [...levels.entries()].sort((a,b)=>a[0]-b[0])){const spans=list.sort((a,b)=>a.lo-b.lo);let merged=null;for(const p of spans){if(merged&&p.lo<=merged.hi+.01)merged.hi=Math.max(merged.hi,p.hi);else{merged={...p};floors.push({y,span:merged});}}}
 return {signature:model?.signature||null,floors:floors.map((f,i)=>({id:'support-'+i,x:f.span.lo,y:f.y,w:f.span.hi-f.span.lo,h:12,kind:'floor'}))};
}
export function groundBoltV108(b,geometry){return geometry.floors.find(f=>f.id===b.supportId&&b.x>=f.x-R.radius&&b.x<=f.x+f.w+R.radius&&Math.abs(b.y+R.radius-f.y)<.1)||null;}
function activeSolids(geometry,doors){return [...(doors||[]).filter(d=>!gateOpenV105(d)&&[d.x,d.y,d.w,d.h].every(finite105)&&d.w>0&&d.h>0).map(d=>({...d,kind:'door'})),...geometry.floors];}
function swept(a,b,r){const t=segmentRectV105(a,b,r,R.radius,R.radius);if(t===null)return null;const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;const faces=[{dist:Math.abs(x-(r.x-R.radius)),nx:-1,ny:0},{dist:Math.abs(x-(r.x+r.w+R.radius)),nx:1,ny:0},{dist:Math.abs(y-(r.y-R.radius)),nx:0,ny:-1},{dist:Math.abs(y-(r.y+r.h+R.radius)),nx:0,ny:1}];const face=faces.sort((u,v)=>u.dist-v.dist)[0];return {t,x,y,...face,solid:r};}
function lose(s,b,reason){b.state='lost';b.vx=0;b.vy=0;b.supportId=null;s.stats.lost++;return {type:'lost',id:b.id,reason,x:b.x,y:b.y,depth:b.depth};}
export function throwBoltV108(s,player,geometry,doors=[],depth=1){
 if(!s||pocketCountV108(s)===0)return {ok:false,reason:'empty',message:'Il ne reste plus de boulon.'};if(s.cooldown>0)return {ok:false,reason:'cooldown'};
 if(!player||player.alive===false||player.grounded!==true||player.climbing||![player.x,player.y,player.w,player.h,depth].every(finite105))return {ok:false,reason:'support',message:'Reprenez appui pour lancer.'};
 const facing=player.facing===-1?-1:1,x=center105(player)+facing*(player.w*.5+6),y=player.y+player.h*.43;
 if(activeSolids(geometry,doors).some(r=>segmentRectV105({x,y},{x,y},r,R.radius+1,R.radius+1)!==null))return {ok:false,reason:'blocked',message:'Il n’y a pas assez de place pour lancer.'};
 const b=s.bolts.find(b=>b.state==='pocket');Object.assign(b,{state:'flying',x,y,vx:facing*R.speed,vy:R.lift,depth:clamp105(depth,0,2),age:0,bounces:0,flight:b.flight+1,origin:{x,y},supportId:null,impactWait:0});s.cooldown=R.cooldown;s.stats.thrown++;return {ok:true,id:b.id,flight:b.flight};
}
export function nearbyBoltV108(s,p,geometry,doors=[],depth=p?.depth??1){if(!s||!p||p.alive===false||p.grounded!==true||p.climbing||!finite105(depth))return null;
 return s.bolts.filter(b=>b.state==='rest'&&groundBoltV108(b,geometry)&&Math.abs(b.x-center105(p))<=R.pickupRange&&Math.abs((b.y+R.radius)-feet105(p))<=R.pickupHeight&&Math.abs(b.depth-depth)<=R.pickupDepth&&!closedBetweenV105({x:center105(p),y:p.y+p.h*.65},{x:b.x,y:b.y},doors)).sort((a,b)=>Math.abs(a.x-center105(p))-Math.abs(b.x-center105(p)))[0]||null;
}
export function recoverBoltV108(s,p,geometry,doors=[],depth=p?.depth??1){const b=nearbyBoltV108(s,p,geometry,doors,depth);if(!b)return {ok:false,reason:'reach'};const i=s.bolts.indexOf(b),flight=b.flight;s.bolts[i]={...emptyBolt(i),flight};s.stats.recovered++;return {ok:true,id:b.id};}
export function advanceBoltsV108(s,geometry,doors,dt,{hotLead=false}={}){
 if(!s)return[];const sec=delta105(dt);if(!sec)return[];s.cooldown=Math.max(0,s.cooldown-sec);const out=[],solids=activeSolids(geometry,doors);
 for(const b of s.bolts){if(b.state!=='flying')b.impactWait=Math.max(0,b.impactWait-sec);if(b.state==='rest'&&hotLead&&b.x>=4815&&b.x<=5010&&Math.abs(b.y+R.radius-510)<16){out.push(lose(s,b,'lead'));continue;}if(b.state!=='flying')continue;
 let remaining=sec;while(remaining>1e-8&&b.state==='flying'){const step=Math.min(R.step,remaining);remaining-=step;b.age+=step;b.impactWait=Math.max(0,b.impactWait-step);b.vy=Math.min(800,b.vy+R.gravity*step);
 const a={x:b.x,y:b.y},next={x:b.x+b.vx*step,y:b.y+b.vy*step};let hit=null;for(const solid of solids){if(Math.max(a.x,next.x)+R.radius<solid.x||Math.min(a.x,next.x)-R.radius>solid.x+solid.w||Math.max(a.y,next.y)+R.radius<solid.y||Math.min(a.y,next.y)-R.radius>solid.y+solid.h)continue;const c=swept(a,next,solid);if(c&&(!hit||c.t<hit.t-1e-8))hit=c;}
 if(!hit){b.x=next.x;b.y=next.y;}else{
 b.x=hit.x+hit.nx*.06;b.y=hit.y+hit.ny*.06;
 if(b.impactWait<=0){out.push({type:'impact',id:b.id,flight:b.flight,x:hit.x,y:hit.y,foot:hit.solid.kind==='floor'?hit.ny===-1?hit.solid.y:hit.solid.y+hit.solid.h:hit.solid.y+hit.solid.h,depth:b.depth,solidId:hit.solid.id,kind:hit.solid.kind,power:b.bounces===0?R.power:R.power*.52});b.impactWait=R.impactGap;s.stats.impacts++;}
 if(hit.solid.kind==='floor'&&hit.ny===-1){if(hotLead&&b.x>=4815&&b.x<=5010&&Math.abs(hit.solid.y-510)<16){out.push(lose(s,b,'lead'));break;}
 if(b.bounces>=R.maxBounces||Math.abs(b.vy)<65){b.state='rest';b.y=hit.solid.y-R.radius;b.vx=0;b.vy=0;b.supportId=hit.solid.id;}else{b.bounces++;b.vy=-Math.abs(b.vy)*.27;b.vx*=.56;}}
 else if(hit.nx){b.vx=-b.vx*.35;b.bounces=Math.min(R.maxBounces,b.bounces+1);}
 else{b.vy=Math.abs(b.vy)*.3;b.bounces=Math.min(R.maxBounces,b.bounces+1);}
 }
 if(b.state==='flying'&&(b.age>R.maxAge||b.y>724||b.y< -32||b.x<0||b.x>6200))out.push(lose(s,b,'outside'));
 }
 }
 return out;
}
export function snapshotDiversionV108(s){if(!s)return null;return structuredClone(s);}
export function validateDiversionV108(raw,enc,model,doors=[]){const fail=reason=>({ok:false,reason}),mode=enc?.mode||null,geometry=compileBoltGeometryV108(model);
 if(!model||!raw||Array.isArray(raw)||raw.schema!==108||raw.sequence!==mode||raw.signature!==model.signature)return fail('identity');if(!finite105(raw.cooldown)||raw.cooldown<0||raw.cooldown>R.cooldown+.001)return fail('cooldown');
 const count=MODES.includes(mode)?3:0;if(!Array.isArray(raw.bolts)||raw.bolts.length!==count)return fail('stock');const ids=new Set();
 for(const b of raw.bolts){if(!b||Array.isArray(b)||!['bolt-1','bolt-2','bolt-3'].includes(b.id)||ids.has(b.id)||!states.includes(b.state))return fail('bolt-id');ids.add(b.id);
 if(!['vx','vy','depth','age','bounces','flight','impactWait'].every(k=>finite105(b[k]))||Math.abs(b.vx)>R.speed+.01||Math.abs(b.vy)>800.01||b.depth<0||b.depth>2||b.age<0||b.age>R.maxAge+.051||!Number.isInteger(b.bounces)||b.bounces<0||b.bounces>R.maxBounces||!Number.isInteger(b.flight)||b.flight<0||b.flight>1e6||b.impactWait<0||b.impactWait>R.impactGap+.001)return fail('bolt-numeric');
 if(b.state==='pocket'){if(b.x!==null||b.y!==null||b.origin!==null||b.supportId!==null||b.vx!==0||b.vy!==0||b.bounces!==0||b.age!==0||b.impactWait!==0)return fail('pocket');continue;}
 if(!finite105(b.x)||!finite105(b.y)||b.x< -30||b.x>6230||b.y< -45||b.y>766||!b.origin||!finite105(b.origin.x)||!finite105(b.origin.y)||b.origin.x<0||b.origin.x>6200||b.origin.y< -20||b.origin.y>720||b.flight<1)return fail('bolt-position');
 if(Math.abs(b.x-b.origin.x)>R.speed*b.age+1.5||Math.abs(b.y-b.origin.y)>800*b.age+2)return fail('bolt-travel');
 if(b.state==='rest'){if(b.vx!==0||b.vy!==0||!groundBoltV108(b,geometry))return fail('rest-support');}
 if(b.state==='flying'&&(b.supportId!==null||doors.some(d=>!gateOpenV105(d)&&b.x>d.x&&b.x<d.x+d.w&&b.y>d.y&&b.y<d.y+d.h)))return fail('flight-solid');
 if(b.state==='lost'&&(b.vx!==0||b.vy!==0||b.supportId!==null))return fail('lost');
 }
 const keys=['thrown','recovered','impacts','lost','heard'];if(!raw.stats||Array.isArray(raw.stats)||keys.some(k=>!Number.isInteger(raw.stats[k])||raw.stats[k]<0||raw.stats[k]>1e7))return fail('stats');
 if(raw.stats.thrown!==raw.bolts.reduce((n,b)=>n+b.flight,0)||raw.stats.recovered!==raw.stats.thrown-raw.bolts.filter(b=>b.state!=='pocket').length||raw.stats.lost!==raw.bolts.filter(b=>b.state==='lost').length||raw.stats.heard>raw.stats.impacts)return fail('conservation');
 return {ok:true,state:structuredClone(raw)};
}
