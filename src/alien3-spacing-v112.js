/** Soft circulation for existing prisoners. No player wall, new route, force, or arrival flag.
 * A proposed V111 navigation step is committed only after a body-spacing check.
 * Queues are transient. The old navigation owner still decides destinations and completion.
 */
import {delta105,finite105,center105,feet105,segmentRectV105} from './alien3-navigation-v105.js';
import {routedCrewMoveV111} from './alien3-routing-v111.js';
export const SPACING_RULES_V112=Object.freeze({gap:14,verticalGap:10,depth:.4,noticeDistance:340,noticeHeight:28,noticeCooldown:6,epsilon:1e-6});
const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x),integer=x=>Number.isSafeInteger(x)&&x>=0&&x<=1e7;
const valid=a=>a?.alive!==false&&a&&['x','y','w','h'].every(k=>finite105(a[k]))&&a.w>0&&a.h>0;
const keys=['x','y','vx','vy','facing','nav','moving','blocked'];
function commit(a,b){for(const k of keys)a[k]=b[k];}
const sameDepth=(a,b)=>Math.abs((a.depth??1)-(b.depth??1))<=SPACING_RULES_V112.depth;
function overlap(a,b){const pad=SPACING_RULES_V112.gap,vertical=SPACING_RULES_V112.verticalGap;
 const dx=Math.min(a.x+a.w+pad,b.x+b.w)-Math.max(a.x-pad,b.x),dy=Math.min(a.y+a.h+vertical,b.y+b.h)-Math.max(a.y-vertical,b.y);
 return dx>0&&dy>0?Math.min(dx,dy):0;
}
/** Return only a local circulation reason, not an order to the other actor. */
export function crewSpacingRiskV112(before,after,others,model){if(!valid(before)||!valid(after))return {reason:'invalid-step',actorId:null};
 for(const b of [...others].filter(b=>b?.id!==before.id&&valid(b)&&sameDepth(before,b)).sort((a,b)=>String(a.id).localeCompare(String(b.id)))){
  const old=overlap(before,b),next=overlap(after,b);
  // Escape a pre-existing overlap (old saves, inspection, actor just appeared); never shove.
  if(old>0&&next<old-SPACING_RULES_V112.epsilon)continue;
  const d=Math.hypot(after.x-before.x,after.y-before.y);if(d<1e-9)continue;
  // Test full rectangle sweep via the centre with Minkowski inflation. Different floors
  // do not meet this rectangle; depth zero is a real lane, never a default to middle.
  const A={x:center105(before),y:before.y+before.h/2},B={x:center105(after),y:after.y+after.h/2};
  const hit=segmentRectV105(A,B,b,before.w/2+SPACING_RULES_V112.gap,before.h/2+SPACING_RULES_V112.verticalGap);
  if(hit!==null){return {reason:'companion',actorId:b.id,name:b.name||'Le détenu',fraction:Math.max(0,hit-1e-5)};}
  // One entrant at a time on a ladder/lift that is already occupied. An actor already
  // committed to it is not evicted. Its physical separation still uses the sweep above.
  const na=before.nav,nb=b.nav,nc=after.nav;
  if(!na?.nextId&&nc?.nextId&&nb?.nextId&&nc.edgeId===nb.edgeId){const edge=model.edges.find(e=>e.id===nc.edgeId);if(['ladder','lift'].includes(edge?.kind))return{reason:'connector',actorId:b.id,name:b.name||'Le détenu',edgeId:edge.id};}
 }
 return null;
}
export function crewUpdateOrderV112(participants,model){return [...participants].sort((a,b)=>{
 const goalA=model.nodeById.get(a.goal),goalB=model.nodeById.get(b.goal),dirA=Math.sign((goalA?.x??center105(a))-center105(a)),dirB=Math.sign((goalB?.x??center105(b))-center105(b));
 // Leader commits before follower on the same floor and direction. The original array
 // remains untouched; deterministic tie-breaking avoids dependency on insertion order.
 if(Math.abs(feet105(a)-feet105(b))<24&&dirA===dirB&&dirA)return dirA>0?b.x-a.x:a.x-b.x;
 return String(a.id).localeCompare(String(b.id));
});}
export function createSpacingV112(enc,model){return {schema:112,signature:model.signature,sequence:enc?.mode||'inspection',waiting:{},noticeClock:0,stats:{waits:0,resumes:0,waitingSeconds:0,blockedSteps:0,limitedSteps:0}};}
function clearWait(state,id,moving){if(!state.waiting[id])return;if(moving)state.stats.resumes++;delete state.waiting[id];}
/** One and only one speed budget. A declined proposal does not commit V111 counters,
 * reverse its segment, make footsteps or mark a post ready. */
export function spacedCrewMoveV112(state,routes,a,goal,model,doors,dt,fields,others,{speed=105,held=false}={}){
 const sec=delta105(dt);if(!sec||!valid(a)||!goal)return {moved:0,arrived:false,waiting:false};
 if(held){clearWait(state,a.id,false);return routedCrewMoveV111(routes,a,goal,model,doors,sec,fields,{speed,held:true});}
 const proposal=velocity=>{const body=structuredClone(a),state={...routes,memory:Object.fromEntries(Object.entries(routes.memory).map(([id,m])=>[id,{...m}])),stats:{...routes.stats}};const result=routedCrewMoveV111(state,body,goal,model,doors,sec,fields,{speed:velocity});return {body,state,result};};
 let plan=proposal(speed),risk=plan.result.moved>0?crewSpacingRiskV112(a,plan.body,others,model):null;
 // Following a slower leader uses the remaining free distance, not a stop/start cycle.
 // Recompute from the unchanged start with a smaller budget; only one proposal is committed.
 if(risk?.reason==='companion'&&risk.fraction>1e-5){const limited=proposal(speed*risk.fraction);if(limited.result.moved>1e-7&&!crewSpacingRiskV112(a,limited.body,others,model)){plan=limited;risk=null;state.stats.limitedSteps++;}}
 const trial=plan.body,trialRoutes=plan.state,result=plan.result;
 if(risk){const old=state.waiting[a.id];if(!old)state.stats.waits++;state.waiting[a.id]={actorId:risk.actorId,reason:risk.reason,edgeId:risk.edgeId||null};state.stats.waitingSeconds+=sec;state.stats.blockedSteps++;a.vx=a.vy=0;a.moving=false;a.blocked=false;return {moved:0,arrived:false,waiting:false,yielding:true,companionId:risk.actorId,reason:risk.reason};}
 commit(a,trial);routes.memory=trialRoutes.memory;routes.stats=trialRoutes.stats;routes.noticeClock=trialRoutes.noticeClock;
 if(result.moved>0||result.arrived)clearWait(state,a.id,result.moved>0);
 return {...result,yielding:false};
}
export function snapshotSpacingV112(s){return s?{schema:112,signature:s.signature,sequence:s.sequence,stats:structuredClone(s.stats)}:null;}
export function validateSpacingV112(raw,enc,model){const fail=reason=>({ok:false,reason});if(!record(raw)||raw.schema!==112||raw.signature!==model.signature||raw.sequence!==(enc?.mode||'inspection'))return fail('identity');const s=createSpacingV112(enc,model);if(!record(raw.stats)||!['waits','resumes','blockedSteps','limitedSteps'].every(k=>integer(raw.stats[k]))||!finite105(raw.stats.waitingSeconds)||raw.stats.waitingSeconds<0||raw.stats.waitingSeconds>1e8)return fail('stats');if(raw.stats.resumes>raw.stats.waits||raw.stats.waits>raw.stats.blockedSteps||(raw.stats.blockedSteps===0)!==(raw.stats.waitingSeconds===0)||raw.stats.waitingSeconds>raw.stats.blockedSteps*.05+1e-6)return fail('accounting');s.stats=Object.fromEntries(Object.keys(s.stats).map(k=>[k,raw.stats[k]]));return {ok:true,state:s};}
export const SPACING_DESIGN_V112=Object.freeze([
 ['gap','Garder une distance','Les détenus conservent une marge horizontale de 14 unités et une marge verticale de 10 ; le décor n’est pas modifié.'],
 ['body','Le corps entier','Le test de déplacement porte sur la largeur et la hauteur du corps, pas seulement sur son centre.'],
 ['sweep','Contrôler le pas proposé','Le volume balayé par le pas est testé avant de reporter des coordonnées dans l’acteur.'],
 ['leader','Laisser avancer celui de devant','Sur un même niveau et dans la même direction, le meneur avance avant le suivant. L’ordre original des participants est conservé.'],
 ['held','Un ordre reste un ordre','G fait attendre un détenu ; son voisin ne le traverse pas pour rattraper sa destination.'],
 ['resume','Repartir sans déplacement instantané','La position et le segment sont conservés ; la marche reprend quand le prochain pas retrouve sa marge.'],
 ['floor','Séparer les étages','Un détenu dans une galerie inférieure ne bloque pas celui sur la coursive haute.'],
 ['depth','La profondeur zéro existe','Un acteur sur le plan arrière ne retombe pas sur le médian à cause d’une valeur zéro.'],
 ['vertical','Un seul entrant sur la liaison verticale','L’entrée sur une échelle ou un élévateur déjà utilisé attend sa libération. Les acteurs déjà engagés peuvent poursuivre dans leurs marges.'],
 ['inside','Sortir d’un chevauchement hérité','Un déplacement qui réduit une superposition préexistante reste possible ; aucun acteur n’est repoussé ou téléporté.'],
 ['one-budget','Un budget de vitesse','Le pas proposé et le pas accepté partagent le même budget. Un refus ne consomme pas un second déplacement.'],
 ['ownership','Ne pas changer le propriétaire des étapes','L’attente n’attribue ni arrivée, ni santé, ni objectif ; les conditions du piège restent celles du parcours.'],
 ['no-sound','Attendre sans faux pas','Aucun son de marche ni compteur de distance n’est ajouté pour un déplacement refusé.'],
 ['plans','Conserver les détours','La proposition utilise V111 et ses vrais segments ; pas de nouveau raccourci ni d’ouverture automatique.'],
 ['no-cache','Reprise sans réservation périmée','Les poses viennent de la sauvegarde existante ; la file d’attente est reconstruite à partir des corps après import.'],
 ['safe','Un poste sûr indépendant','Le registre de circulation du dernier poste sûr reste distinct de la partie courante.'],
 ['pause','Suspendre les files','Pause, plan, archives et chargement ne font ni bouger le groupe ni avancer son attente.'],
 ['notice','Une remarque au bon endroit','Le message est bref, à proximité, au même étage et sans porte fermée entre les personnages.'],
 ['player','Pas de mur humain pour Ripley','Cette couche régule les détenus entre eux ; elle ne transforme ni Ripley ni le Runner en nouvel obstacle de navigation.'],
 ['deadlock','Portée limitée','Ce n’est pas un planificateur multi-agent global. Deux acteurs face à face sans espace de dégagement attendent ; aucun passage forcé ni poussée ne sont simulés.'],
 ['legacy','Pas d’assertion de campagne native','Le banc exécute les modules livrés avec une physique simplifiée. La campagne entière et ses sprites définitifs restent à qualifier.']
].map(([id,title,text])=>Object.freeze({id:'v112-'+id,title,text})));
