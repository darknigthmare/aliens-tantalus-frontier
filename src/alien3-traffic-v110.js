/** Bounded valve closing and crew safety over the V109 plume, never a second steam volume.
 * The original V109 owner continues to recharge, cool, hurt and account for openings.
 * Crew decisions preview one real V105 navigation step, then commit it only if safe.
 */
import {center105,feet105,delta105,finite105,segmentRectV105,moveActorV105} from './alien3-navigation-v105.js';
import {STEAM_RULES_V109,STEAM_SITES_V109,steamCircuitV109,steamAccessV109,fieldsV109,validateSteamV109} from './alien3-steam-v109.js';
export const TRAFFIC_RULES_V110=Object.freeze({closeSeconds:.85,residualHot:.30,margin:12,depth:.45,noticeDistance:430,noticeHeight:25,noticeCooldown:5.5});
const record=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const integer=x=>Number.isSafeInteger(x)&&x>=0&&x<=1e7;
const moveKeys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyQ','KeyZ','KeyW','KeyS','Space'];
export function createTrafficV110(enc,model){return {schema:110,signature:model.signature,sequence:enc?.mode||'inspection',circuits:STEAM_SITES_V109.map(s=>({id:s.id,closed:0})),closing:null,waiting:{},noticeClock:0,stats:{closed:0,cancelled:0,waitingStarts:0,resumed:0,waitingSeconds:0}};}
export function cancelClosingV110(state){if(!state?.closing)return false;state.closing=null;state.stats.cancelled++;return true;}
export function beginClosingV110(engine,site){const s=engine.alien3TrafficV110,c=steamCircuitV109(engine.alien3SteamV109,site?.id);if(!s||!c)return{ok:false,reason:'inactive'};
 const access=steamAccessV109(engine,site);if(!access.ok)return access;if(s.closing||engine.alien3SteamV109.work)return{ok:false,reason:'busy'};if(c.remaining<=STEAM_RULES_V109.tailSeconds)return{ok:false,reason:'dissipating'};
 s.closing={id:site.id,elapsed:0,x:center105(engine.player),foot:feet105(engine.player),health:engine.player.health};return{ok:true,site};}
export function closingValidV110(engine){const s=engine.alien3TrafficV110,w=s?.closing;if(!w)return{ok:false,reason:'none'};const site=engine.alien3SteamGeometryV109?.sites.find(s=>s.id===w.id),access=steamAccessV109(engine,site);if(!access.ok)return access;
 if(engine.alien3SteamV109.work)return{ok:false,reason:'busy'};
 if((engine.alien3OperationsV107?.inputMode||'hold')==='hold'&&!engine.keys?.has('KeyV'))return{ok:false,reason:'release'};
 if(moveKeys.some(k=>engine.keys?.has(k))||Math.abs(center105(engine.player)-w.x)>5||Math.abs(feet105(engine.player)-w.foot)>5)return{ok:false,reason:'movement'};
 if(engine.player.health<w.health)return{ok:false,reason:'damage'};if(steamCircuitV109(engine.alien3SteamV109,w.id).remaining<=STEAM_RULES_V109.tailSeconds)return{ok:false,reason:'dissipating'};return{ok:true,site};}
export function advanceClosingV110(engine,dt){const s=engine.alien3TrafficV110;if(!s?.closing)return null;const check=closingValidV110(engine);if(!check.ok){cancelClosingV110(s);return{type:'cancel',reason:check.reason};}const sec=delta105(dt);if(!sec)return null;
 const w=s.closing;w.elapsed=Math.min(TRAFFIC_RULES_V110.closeSeconds,w.elapsed+sec);if(w.elapsed+1e-8<TRAFFIC_RULES_V110.closeSeconds)return null;
 const c=steamCircuitV109(engine.alien3SteamV109,w.id);c.remaining=Math.min(c.remaining,STEAM_RULES_V109.tailSeconds+TRAFFIC_RULES_V110.residualHot);c.pulseClock=STEAM_RULES_V109.pulse; // no opening hiss replay
 s.circuits.find(c=>c.id===w.id).closed++;s.stats.closed++;s.closing=null;return{type:'closed',site:check.site};}
const bodyPoint=p=>({x:center105(p),y:feet105(p)-Math.min(p.h*.5,40)});
/** Negative/zero outside; positive means distance to the closest safe side of the expanded plume. */
function penetration(p,f){if(Math.abs((p.depth??1)-f.depth)>TRAFFIC_RULES_V110.depth||Math.abs(feet105(p)-f.foot)>36)return 0;const a=bodyPoint(p),margin=p.w/2+TRAFFIC_RULES_V110.margin,left=f.x-margin,right=f.x+f.w+margin;
 if(a.x<=left||a.x>=right||a.y<=f.y||a.y>=f.y+f.h)return 0;return Math.min(a.x-left,right-a.x);}
export function unsafeCrewStepV110(before,after,fields){if(!before||!after)return null;const a=bodyPoint(before),b=bodyPoint(after);
 for(const f of fields){if(!f.hot||f.w<=0||Math.abs((before.depth??1)-f.depth)>TRAFFIC_RULES_V110.depth)continue;
 // A step upstairs is not stopped by steam underneath the floor; a ladder ending in a jet is.
 const lo=Math.min(feet105(before),feet105(after)),hi=Math.max(feet105(before),feet105(after));if(f.foot<lo-36||f.foot>hi+36)continue;
 const pad=before.w/2+TRAFFIC_RULES_V110.margin;if(segmentRectV105(a,b,f,pad,0)===null)continue;
 const was=penetration(before,f),next=penetration(after,f);
 // If a player opens a plume around a moving prisoner, movement out is allowed, never a teleport.
 if(was>0&&next<was-1e-7)continue;return f;
 }return null;}
export function safeCrewMoveV110(actor,goal,model,doors,dt,fields,{speed=105}={}){const sec=delta105(dt);if(!sec||!actor.alive||!goal)return{moved:0,arrived:false,waiting:false};
 const trial=structuredClone(actor),result=moveActorV105(trial,goal,model,doors,sec,{speed}),hazard=result.moved>0?unsafeCrewStepV110(actor,trial,fields):null;
 if(hazard){actor.vx=0;actor.vy=0;actor.moving=false;actor.blocked=false;return {moved:0,arrived:false,waiting:true,siteId:hazard.id};}
 // Copy only navigation-owned fields; never overwrite a stage, identity, health or the user's order.
 for(const key of ['x','y','vx','vy','facing','nav','moving','blocked'])actor[key]=trial[key];return{...result,waiting:false};}
export function snapshotTrafficV110(s){return s?{schema:110,signature:s.signature,sequence:s.sequence,circuits:s.circuits.map(c=>({id:c.id,closed:c.closed})),stats:structuredClone(s.stats)}:null;}
export function validateTrafficV110(raw,enc,steam,model){const fail=reason=>({ok:false,reason});if(!record(raw)||raw.schema!==110||raw.signature!==model.signature||raw.sequence!==(enc?.mode||'inspection'))return fail('identity');const checkedSteam=validateSteamV109(steam,enc,model);if(!checkedSteam.ok)return fail('steam-'+checkedSteam.reason);steam=checkedSteam.state;if(!Array.isArray(raw.circuits)||raw.circuits.length!==3)return fail('circuits');const s=createTrafficV110(enc,model),ids=new Set();let closed=0;
 for(const c of raw.circuits){const target=s.circuits.find(x=>x.id===c?.id),previous=steam.circuits.find(x=>x.id===c?.id);if(!record(c)||!target||ids.has(c.id))return fail('circuit-id');ids.add(c.id);if(!integer(c.closed)||c.closed>previous.uses)return fail('closed-count');target.closed=c.closed;closed+=c.closed;}
 if(!record(raw.stats)||!['closed','cancelled','waitingStarts','resumed'].every(k=>integer(raw.stats[k]))||raw.stats.closed!==closed||raw.stats.resumed>raw.stats.waitingStarts||!finite105(raw.stats.waitingSeconds)||raw.stats.waitingSeconds<0||raw.stats.waitingSeconds>1e8)return fail('stats');s.stats=structuredClone(raw.stats);return{ok:true,state:s};}
export const TRAFFIC_DESIGN_V110=Object.freeze([
 ['valve-close','Fermer la purge','La même touche V referme une vanne en 0,85 seconde ; proximité, appui, étage et profondeur restent obligatoires.'],
 ['valve-residual','Chaleur résiduelle','Une fermeture conserve au plus 0,30 seconde chaude et 1,20 seconde de dissipation ; le nuage ne disparaît pas d’un coup.'],
 ['valve-reserve','Pas de remboursement','Fermer tôt ne rend pas les 70 unités consommées. La recharge n’avance pas tant que le nuage existe.'],
 ['valve-interrupt','Lâcher la commande','Mouvement, dégâts, pause, archive, plan, relâchement en mode maintien et perte de focus annulent le geste incomplet.'],
 ['valve-toggle','Appuyer au lieu de maintenir','Le mode accessible conserve exactement la même durée. Un second appui annule au lieu de valider.'],
 ['valve-order','Pas d’actions concurrentes','Une fermeture active refuse E, G, une lampe, un bruit métallique et les boulons ; la fuite reste possible.'],
 ['valve-tail','Dissipation seule','Si le jet se termine de lui-même pendant le geste, la fermeture ne fabrique ni résultat ni crédit.'],
 ['crew-step','Un vrai pas avant chaque décision','Le trajet V105 est calculé sur une copie de pose. Seuls les champs de navigation sont validés lorsque le pas reste sûr.'],
 ['crew-margin','Marge devant le jet','Le corps s’arrête avec une marge de 12 unités devant la vapeur chaude, pas après l’avoir traversée.'],
 ['crew-floor','Respect des étages','Le jet ne bloque pas une coursive supérieure sans recouvrement physique. Une arrivée d’échelle dans le jet reste contrôlée.'],
 ['crew-depth','Respect de la profondeur','Un détenu sur une autre profondeur n’est pas bloqué par une vapeur qui ne l’atteint pas.'],
 ['crew-gate','Porte et volume communs','La même plume tronquée par une porte fermée sert au rendu, à la chaleur et au choix de passage du groupe.'],
 ['crew-resume','Repartir au bon moment','La destination et le segment sont conservés. Quand le passage n’est plus chaud, le déplacement reprend depuis la position réelle.'],
 ['crew-order','Votre ordre reste prioritaire','G maintient un ordre d’attente volontaire, même après la dissipation. La vapeur ne le transforme pas en ordre de départ.'],
 ['crew-arrival','Ne pas inventer une arrivée','Attendre devant un jet ne signifie pas tenir la commande. L’armement du moule reste refusé si le poste n’est pas atteint.'],
 ['crew-inside','Sortir d’un jet apparu autour du corps','Une sortie qui réduit la pénétration est autorisée. Aucun personnage n’est repoussé ni téléporté.'],
 ['crew-steps','Pas de faux bruit de pas','Les bruits hérités suivent uniquement la distance réellement commitée. Un détenu qui attend reste immobile.'],
 ['crew-notice','Prévenir sans saturer','Un message proche et au bon étage explique l’attente ; son délai évite de répéter le même avertissement à chaque frame.'],
 ['save-ledger','Compte de fermetures','Chaque fermeture appartient à une purge déjà utilisée. Un fichier ne peut pas en déclarer plus que d’ouvertures.'],
 ['save-current','État courant indépendant','Les réserves et durées viennent de V109 ; le nouveau registre ne crée pas de deuxième pression.'],
 ['save-safe','Poste sûr distinct','Le dernier poste sûr conserve son propre registre, ses réserves et ses ordres.'],
 ['save-transient','Pas de commande suspendue','Ni fermeture en cours, ni alerte différée, ni obstacle périmé ne sont repris depuis un fichier.'],
 ['save-recompute','Recalcul du danger','Après import en pause, l’attente du groupe est recalculée depuis la vraie plume, sa position et les portes.'],
 ['save-migration','Migration sans rétro-invention','Un fichier V105 à V109 reçoit un registre vide de fermetures, sans prétendre qu’un geste ancien a été réalisé.'],
 ['draw-shared','Rendu partagé','Les captures utilisent les modules de dessin livrés, sans illustration indépendante ni décor rajouté aux captures.'],
 ['scope','Périmètre','Attente prudente, pas simulation de panique, nouvelles blessures des détenus, invulnérabilité ou remplacement complet de l’IA.']
].map(([id,title,text])=>Object.freeze({id:'v110-'+id,title,text})));
