/** V104 — common DLC contracts adapted to Fiorina.
 * Original service round for the validation host; not a scene of the film.
 * World-space coordinates and derived visual events never unlock campaign objectives.
 */
import {compileAlien3CirculationV103,resolveAlien3SpaceV103,reachableUtilityV103,ALIEN3_CAMPAIGN_ID_V103} from './alien3-dlc-v103.js';
export const CAMPAIGN_V104=ALIEN3_CAMPAIGN_ID_V103;
export const VERSION_V104=104;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export const clamp104=(x,a,b)=>Math.min(b,Math.max(a,finite(x)?x:a));
export const delta104=dt=>clamp104(dt,0,.05);
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const STANDARD_RULES_V104=freeze([
 ['SC01','Une scène compilée fournit les appuis, les commandes, les portes et le plan.','data'],
 ['SC02','Une coordonnée monde n’est pas retraitée comme une coordonnée écran.','data'],
 ['SC03','Le fond couvre le premier pixel ; les particules restent dans leur alcôve.','browser'],
 ['SC04','Un saut conserve le nom du lieu jusqu’à la réception.','runtime'],
 ['SC05','Un contact exige proximité, hauteur, profondeur et absence de porte fermée.','runtime'],
 ['SC06','Les états visuels sont issus des événements, jamais de l’abscisse du joueur.','runtime'],
 ['SC07','Le feu, les dépôts de suie, le plomb chaud et le refroidissement restent distincts.','data'],
 ['SC08','La Compagnie ne se dessine pas avant son arrivée.','runtime'],
 ['SC09','Le HUD normal est temporaire ; les vitales restent visibles en danger.','browser'],
 ['SC10','Le plan et les archives suspendent l’horloge de cette couche.','runtime'],
 ['SC11','La sauvegarde valide identité et géométrie avant de remplacer l’état.','runtime'],
 ['SC12','Un fichier refusé ne détruit ni la partie courante ni sa reprise.','browser'],
 ['SC13','Les phases d’attaque, touches et fenêtres ouvertes ne sont pas rejouées à l’import.','data'],
 ['SC14','La ronde originale doit être terminée au clavier sans positions injectées.','browser'],
 ['SC15','Un mécanisme local d’éclairage ne termine pas une mission du film.','runtime'],
 ['SC16','Les captures sont natives du renderer partagé, pas une reconstitution après coup.','evidence'],
 ['SC17','Les tests préparés, la ronde et le moteur complet ont des preuves distinctes.','scope'],
 ['SC18','Les options de mouvement et de lisibilité n’altèrent pas la progression.','runtime']
].map(([id,text,check])=>({id,text,check})));
export const EVENT_BINDINGS_V104=freeze([
 {id:'outbreak',label:'Départ du feu',assemblies:['service-pump','chemical-store'],read:'alien3V90.firePlan.ignited et non accidentResolved ; repli fireMazeIgnited',result:'Flamme locale et fumée, sans nouveaux dégâts.'},
 {id:'aftermath',label:'Après l’incendie',assemblies:['service-pump','chemical-store'],read:'Feu observé ou firePlan.accidentResolved',result:'Suie conservée après extinction ; aucune flamme ajoutée.'},
 {id:'molten',label:'Coulée',assemblies:['leadworks','lead-primer','mold'],read:'alien3V88.moltenLeadApplied ; repli de phase uniquement si absent',result:'Lueur chaude aux récepteurs industriels.'},
 {id:'cooling',label:'Refroidissement',assemblies:['mold','water-header'],read:'alien3V88.thermalShockApplied ; repli de phase uniquement si absent',result:'Vapeur localisée ; pas de changement du débit ou de la victoire.'},
 {id:'recovery',label:'Récupération',assemblies:['patna-kit'],read:'alien3V89.company.visible === true ou phase company/finale',result:'Matériel existant de la Compagnie visible.'}
]);
export const ROUND_V104=freeze({id:'service-round',title:'La ronde des éclairages',startNode:'f161-infirmary',endNode:'f161-assembly-hall',utilities:['care-light','cell-light','service-light'],instructions:['Rétablir la lampe de soin.','Rétablir l’éclairage des cellules ouest.','Monter à l’atelier et rétablir sa lampe.','Revenir dans la salle commune.'],scope:'Parcours original du banc de validation, indépendant de la campagne historique.'});
export const fnv104=text=>{let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');};
export function compileAlien3StandardV104(plan=null){
 const scene=compileAlien3CirculationV103(plan);
 const signature=fnv104(JSON.stringify({nodes:scene.nodes.map(n=>[n.id,n.x,n.y,n.width]),edges:scene.edges.map(e=>[e.id,e.from,e.to,e.kind]),gates:scene.gates.map(g=>[g.id,g.x,g.y,g.w,g.h]),utilities:scene.utilities.map(u=>[u.id,u.x,u.y,u.footY,u.depth])}));
 const actorSupports=scene.nodes.map(n=>({id:n.id,x:n.x-n.width/2,y:n.y,w:n.width}));
 const byId=new Map(scene.nodes.map(n=>[n.id,n]));for(const e of scene.edges){const a=byId.get(e.from),b=byId.get(e.to);if(a&&b&&a.y===b.y&&['walk','gate','airlock'].includes(e.kind))actorSupports.push({id:e.id,x:Math.min(a.x,b.x),w:Math.abs(b.x-a.x),y:a.y});}
 const real=plan?.geometry?.platforms;return {schema:104,signature,scene,actorSupports:Array.isArray(real)?real.map(p=>({...p})):actorSupports,supportSource:Array.isArray(real)?'compiled':'template-derived'};
}
export function createStateV104(model){return {schema:104,campaignId:CAMPAIGN_V104,signature:model.signature,clock:0,settings:{reducedMotion:false,highContrast:false,hud:'contextual'},events:{burned:false,leadSeen:false,coolingSeen:false,companySeen:false},round:null};}
export function visualEventsV104(engine,state){
 const s=engine.alien3V88||{},f=engine.alien3V90?.firePlan,phase=s.phase;
 const company=engine.alien3V89?.company?.visible===true||['company','finale'].includes(phase);
 const resolved=f?.accidentResolved===true;
 const activeFire=f&&typeof f.ignited==='boolean'?f.ignited&&!resolved:(typeof s.fireMazeIgnited==='boolean'?s.fireMazeIgnited&&phase==='fire-maze':phase==='fire-maze');
 const hot=typeof s.moltenLeadApplied==='boolean'?s.moltenLeadApplied:['molten-lead','thermal-shock','company','finale'].includes(phase);
 const cooling=typeof s.thermalShockApplied==='boolean'?s.thermalShockApplied:phase==='thermal-shock';
 return {fire:activeFire,soot:resolved||state?.events?.burned===true,leadHot:hot,steam:cooling,companyArrived:company};
}
export function advanceEventsV104(state,flags,dt){state.clock=Math.min(1e7,state.clock+delta104(dt));state.events.burned ||= flags.fire||flags.soot;state.events.leadSeen ||=flags.leadHot;state.events.coolingSeen ||=flags.steam;state.events.companySeen ||=flags.companyArrived;}
export function stableSpaceV104(model,actor,previousId=null){const previous=model.scene.spaces.find(s=>s.id===previousId);if(!actor||![actor.x,actor.y,actor.w,actor.h].every(finite))return previous||null;if(actor.grounded===false&&!actor.climbing&&previous)return previous;return resolveAlien3SpaceV103(model.scene,actor)||previous||null;}
export function visualLaneV104(engine,actor=engine.player){const d=engine.alien3V98?.director;if(actor===engine.player&&d?.laneShiftActive)return clamp104(d.laneFrom+(d.laneTo-d.laneFrom)*clamp104(d.laneBlend,0,1),0,2);return clamp104(actor===engine.player?(engine.alien3V97?.hybrid?.playerLane??actor?.depth??1):(engine.alien3V97?.hybrid?.runnerLane??actor?.hybridDepthLaneV97??actor?.depth??1),0,2);}
const validActor=a=>!!a&&['x','y','w','h'].every(k=>finite(a[k]))&&a.w>0&&a.h>0&&a.alive!==false&&!a.downed;
function segmentRect(a,b,r){let lo=0,hi=1;for(const [v,d,min,max]of [[a.x,b.x-a.x,r.x,r.x+r.w],[a.y,b.y-a.y,r.y,r.y+r.h]]){if(Math.abs(d)<1e-9){if(v<min||v>max)return false;}else{const x=(min-v)/d,y=(max-v)/d;lo=Math.max(lo,Math.min(x,y));hi=Math.min(hi,Math.max(x,y));if(lo>hi)return false;}}return true;}
export function contactAllowedV104(a,b,{laneA=1,laneB=1,depth=false,doors=[],reach=62}={}){if(!validActor(a)||!validActor(b))return {ok:false,reason:'actor'};if(![laneA,laneB,reach].every(finite)||reach<0)return{ok:false,reason:'invalid-range'};if(depth&&Math.abs(laneA-laneB)>.40)return{ok:false,reason:'depth'};if(Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)<5)return{ok:false,reason:'floor'};if(Math.max(0,b.x-a.x-a.w,a.x-b.x-b.w)>reach)return{ok:false,reason:'distance'};const p={x:a.x+a.w/2,y:a.y+a.h*.58},q={x:b.x+b.w/2,y:b.y+b.h*.58};if(doors.some(d=>d&&d.open!==true&&!(finite(d.progress)&&d.progress>=.94)&&['x','y','w','h'].every(k=>finite(d[k]))&&d.w>0&&d.h>0&&segmentRect(p,q,d)))return{ok:false,reason:'door'};return{ok:true,reason:null};}
export function startRoundV104(state,lights){state.round={id:ROUND_V104.id,stage:0,completed:[],seconds:0,finished:false};for(const id of ROUND_V104.utilities)lights[id]=false;}
export function roundActionV104(state,id,on){const r=state.round;if(!r||r.finished||!on||id!==ROUND_V104.utilities[r.stage])return false;r.completed.push(id);r.stage++;return true;}
export function advanceRoundV104(state,actor,model,dt){const r=state.round;if(!r||r.finished)return false;r.seconds=Math.min(1e7,r.seconds+delta104(dt));const n=model.scene.nodes.find(n=>n.id===ROUND_V104.endNode);if(r.stage===3&&validActor(actor)&&actor.grounded!==false&&!actor.climbing&&Math.abs(actor.x+actor.w/2-n.x)<48&&Math.abs(actor.y+actor.h-n.y)<14){r.stage=4;r.finished=true;return true;}return false;}
export function roundObjectiveV104(state){const r=state?.round;return !r?'':r.finished?'Les éclairages sont rétablis.':ROUND_V104.instructions[r.stage]||'';}
const record=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function validateStateV104(raw,model){
 const fail=reason=>({ok:false,reason});if(!record(raw)||raw.schema!==104||raw.campaignId!==CAMPAIGN_V104)return fail('identity');if(raw.signature!==model.signature)return fail('layout-signature');if(!finite(raw.clock)||raw.clock<0||raw.clock>1e7)return fail('clock');
 if(!record(raw.settings)||typeof raw.settings.reducedMotion!=='boolean'||typeof raw.settings.highContrast!=='boolean'||!['contextual','always'].includes(raw.settings.hud))return fail('settings');if(!record(raw.events)||['burned','leadSeen','coolingSeen','companySeen'].some(k=>typeof raw.events[k]!=='boolean'))return fail('events');
 if(raw.round!==null){const r=raw.round;if(!record(r)||r.id!==ROUND_V104.id||!Number.isInteger(r.stage)||r.stage<0||r.stage>4||!Array.isArray(r.completed)||!finite(r.seconds)||r.seconds<0||r.seconds>1e7||r.finished!==(r.stage===4))return fail('round');const prefix=ROUND_V104.utilities.slice(0,Math.min(r.stage,3));if(JSON.stringify(r.completed)!==JSON.stringify(prefix))return fail('round-order');}
 return {ok:true,state:{schema:104,campaignId:CAMPAIGN_V104,signature:raw.signature,clock:raw.clock,settings:{reducedMotion:raw.settings.reducedMotion,highContrast:raw.settings.highContrast,hud:raw.settings.hud},events:{burned:raw.events.burned,leadSeen:raw.events.leadSeen,coolingSeen:raw.events.coolingSeen,companySeen:raw.events.companySeen},round:raw.round?{id:raw.round.id,stage:raw.round.stage,completed:[...raw.round.completed],seconds:raw.round.seconds,finished:raw.round.finished}:null}};
}
export function supportedPoseV104(pose,model,doors=[]){if(!record(pose)||!['x','y','w','h','health','depth'].every(k=>finite(pose[k]))||pose.w<=0||pose.h<=0||pose.w>128||pose.h>160||pose.x<0||pose.x+pose.w>6200||pose.health<=0||pose.health>100||![0,1,2].includes(pose.depth))return false;const x=pose.x+pose.w/2,y=pose.y+pose.h;if(!model.actorSupports.some(s=>Math.abs(s.y-y)<3&&x>=s.x&&x<=s.x+s.w))return false;return !doors.some(d=>d.open!==true&&d.x<pose.x+pose.w&&d.x+d.w>pose.x&&d.y<pose.y+pose.h&&d.y+d.h>pose.y);}
export function makeBenchSaveV104(engine){const p=engine.player,s=engine.alien3StandardV104,lights=engine.alien3V103.lights;const pose={x:p.x,y:p.y,w:p.w,h:p.h,health:p.health,depth:p.depth??1};const doors=(engine.doors||[]).map(d=>({id:d.id,open:!!d.open}));if(!p.grounded||p.climbing||!supportedPoseV104(pose,s,engine.doors))throw Error('Rejoignez un appui stable avant de sauvegarder.');return {format:'fiorina-service-round',schema:104,pose,doors,lights:{...lights},visited:[...engine.alien3V103.visitedNodes],state:structuredClone(engine.alien3V104),phase:engine.alien3V88?.phase||'infirmary'};}
const PHASES=new Set(['wreckage','infirmary','trap-prep','bishop','leadworks','molten-lead','thermal-shock','company','fire-maze','finale']);
export function validateBenchSaveV104(raw,model){const fail=reason=>({ok:false,reason});if(!record(raw)||raw.schema!==104||raw.format!=='fiorina-service-round')return fail('file-format');const v=validateStateV104(raw.state,model);if(!v.ok)return v;if(!PHASES.has(raw.phase))return fail('phase');const lampIds=model.scene.utilities.map(u=>u.id),doorIds=model.scene.gates.map(g=>g.id),nodeIds=new Set(model.scene.nodes.map(n=>n.id));if(!record(raw.lights)||Object.keys(raw.lights).length!==lampIds.length||lampIds.some(id=>typeof raw.lights[id]!=='boolean'))return fail('lights');if(!Array.isArray(raw.doors)||raw.doors.length!==doorIds.length||new Set(raw.doors.map(d=>d?.id)).size!==doorIds.length||raw.doors.some(d=>!doorIds.includes(d.id)||typeof d.open!=='boolean'))return fail('doors');if(!Array.isArray(raw.visited)||raw.visited.length>72||raw.visited.some(id=>!nodeIds.has(id)))return fail('visits');const doors=model.scene.gates.map(g=>({...g,open:raw.doors.find(d=>d.id===g.id).open}));if(!supportedPoseV104(raw.pose,model,doors))return fail('pose');return {ok:true,snapshot:{format:raw.format,schema:104,pose:Object.fromEntries(['x','y','w','h','health','depth'].map(k=>[k,raw.pose[k]])),doors:raw.doors.map(d=>({id:d.id,open:d.open})),lights:{...raw.lights},visited:[...new Set(raw.visited)],state:v.state,phase:raw.phase}};}
export function parseBenchSaveV104(text,model){if(typeof text!=='string'||new TextEncoder().encode(text).length>1048576)return{ok:false,reason:'file-size'};try{return validateBenchSaveV104(JSON.parse(text),model);}catch{return{ok:false,reason:'json'};}}
