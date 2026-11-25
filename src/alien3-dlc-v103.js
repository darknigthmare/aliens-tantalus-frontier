/** World-space circulation and utility contracts. No film set measurements;
 * no new campaign rooms, locks or routes are invented by this visual layer. */
import {ALIEN3_CAMPAIGN_ID_V102,ALIEN3_FIORINA_TEMPLATE_V102,compileAlien3DecorV102} from './alien3-dlc-v102.js';
export const ALIEN3_CAMPAIGN_ID_V103=ALIEN3_CAMPAIGN_ID_V102;
export const ALIEN3_FIORINA_TEMPLATE_V103=ALIEN3_FIORINA_TEMPLATE_V102;
export const finite103=(v,f=0)=>typeof v==='number'&&Number.isFinite(v)?v:f;
export const clamp103=(v,a,b)=>Math.max(a,Math.min(b,finite103(v,a)));
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
const section=(id,label,nodeIds,style,usage,landmark)=>({id,label,nodeIds:nodeIds.split(' '),style,usage,landmark});
export const ALIEN3_SPACES_V103=freeze([
 section('shore','Côte et épave','f161-spawn f161-eev','coast','Approche extérieure ; l’épave conduit vers le complexe.','Coque éventrée et prise d’air'),
 section('medical','Infirmerie','f161-infirmary f161-clemens-bed f161-funeral-walk','medical','Soins et circulation principale ; le mobilier reste derrière le passage.','Brancard, lavabo et lampe de soin'),
 section('morgue','Morgue et dossiers','f161-master-archive-node f161-morgue-high','medical','Palier supérieur, séparé de l’infirmerie par son altitude.','Table mortuaire et armoire'),
 section('west-cells','Cellules ouest','f161-cell-a f161-assembly-hall','detention','Coursive basse ; les cellules peintes ne sont pas des passages ajoutés.','Barreaux et couchettes'),
 section('east-cells','Cellules est','f161-cell-b f161-shutter-cell-node','detention','Approche du verrou des galeries ; conserver une sortie identifiable.','Volet réel à l’est'),
 section('refectory','Réfectoire','f161-mess-high f161-mess-ceiling','detention','Tables regroupées ; accès par les connecteurs déjà présents.','Longue table et bancs'),
 section('comms','Communications','f161-comms-high','comms','Poste haut réel, distinct du secteur caméra nommé communications.','Deux écrans sur console'),
 section('prayer','Recueillement','f161-faith-dais-v94 f161-perch-cell-v93','chapel','Palier haut austère, sans nouvelle porte au fond.','Livre et petites flammes'),
 section('service','Pompage et secours','f161-service-low f161-rescue-post-node f161-bishop','service','Eau, entretien et passage principal ; éclairage de service indépendant des objectifs.','Pompe sur semelle'),
 section('ventilation','Ventilation','f161-fan-shaft f161-service-high f161-steam-service-node','service','Palier technique supérieur ; une échelle ne doit pas changer la profondeur.','Ventilateur sous grille'),
 section('batteries','Atelier des batteries','f161-hunt-service-v95 f161-battery-locker-v94','service','Établi et rangement au-dessus de la circulation basse.','Panneau à outils'),
 section('lower-service','Galeries basses','f161-service-deep f161-tunnel-shrine f161-golic-cache-v94','service','Dessous du complexe ; les regards vers les étages ne constituent pas un accès.','Alcôve et réseaux'),
 section('supply','Réserve et supervision','f161-chemical-store f161-command-post-node','comms','Stockage puis commande industrielle ; respecter la position du portail existant.','Fûts et console de supervision'),
 section('leadworks','Fonderie','f161-leadworks f161-lead-primer f161-piston-a-node','foundry','Regrouper alimentation, creuset et levage, sans ajouter de danger décoratif.','Creuset sous portique'),
 section('water','Collecteur supérieur','f161-sprinkler f161-water-header f161-piston-b-node','service','Conduite d’eau séparée visuellement du transfert de métal.','Réservoir et vérins'),
 section('waste','Cuve et évacuation','f161-waste-tank f161-sluice-low f161-pressure-alcove-v95','service','Niveau inférieur : reprise des effluents et retour hydraulique.','Réservoir bas et caniveau'),
 section('mold','Moule et pistons','f161-mold f161-piston-c-node','foundry','Le piège et ses commandes historiques conservent leurs conditions.','Bac de coulée bas'),
 section('furnace','Four principal','f161-furnace f161-parley-v93','furnace','Approche chaude puis confrontation ; ne pas masquer les personnages.','Bouche circulaire du four'),
 section('gantries','Passerelles du four','f161-furnace-high f161-furnace-overlook f161-furnace-gantry','foundry','Commande haute avec débouchés d’échelles conservés.','Treuil et caillebotis'),
 section('arrival','Approche et plateforme','f161-company f161-patna-cage-node f161-extraction','company','L’équipement de récupération reste conditionné à l’arrivée de la Compagnie.','Cage portable et projecteur')
]);
const utility=(id,assemblyId,label)=>({id,assemblyId,label,kind:'service-light',defaultOn:true});
export const ALIEN3_UTILITIES_V103=freeze([
 utility('shore-light','coast-intake','Éclairage de la prise d’air'),utility('care-light','medical-care','Lampe de soin'),
 utility('cell-light','cell-a','Éclairage de la coursive'),utility('comms-light','actual-comms','Lampe des communications'),
 utility('service-light','service-shop','Lampe de l’établi'),utility('lead-light','leadworks','Éclairage du creuset'),
 utility('mold-light','mold','Lampe du moule'),utility('landing-light','final-landing','Éclairage de la plateforme')
]);
export const ALIEN3_RULES_V103=freeze([
 ['SPACE','Une section décrit un lieu et un étage ; elle ne crée pas une nouvelle salle instanciée.','scope'],
 ['PORTAL','Un cadre de porte provient d’une arête gate/airlock ; la feuille et la collision restent pilotées par la porte native.','automated'],
 ['GATE-GEOMETRY','Une porte fournie par le plan compilé est utilisée sans déplacer sa collision.','automated'],
 ['VERTICAL-PRIORITY','Haut/Bas donnent la priorité à une échelle réellement atteignable, avant un changement de profondeur.','automated'],
 ['CIRCUIT','Un réseau décoratif possède une source et un récepteur du même ensemble, reliés par un tracé continu.','automated'],
 ['LIGHT','Couper un éclairage de service ne coupe ni le feu du four, ni l’eau du piège, ni un objectif.','automated'],
 ['REACH','Une commande exige proximité, niveau, plan médian, personnage vivant et absence de porte fermée entre les deux.','automated'],
 ['PAUSE','Le plan et les archives arrêtent la simulation ; la fermeture ne supprime pas une pause préexistante.','automated'],
 ['MAP','Le plan ne montre ni ennemis ni dossiers secrets ; un nœud n’est relevé qu’au voisinage du personnage.','automated'],
 ['PERSIST','Les visites et les éclairages sont sauvegardés ; ni la géométrie ni l’ouverture du plan ne sont sérialisées.','automated'],
 ['REDUCED-MOTION','Le mouvement réduit conserve les états lisibles sans animation de panneaux.','automated'],
 ['PROVENANCE','Banc visuel et tests isolés ne constituent pas une validation de la campagne complète.','scope']
].map(([id,text,validation])=>({id:'A3-103-'+id,text,validation})));
export function compileAlien3CirculationV103(plan=null){
 const decor=compileAlien3DecorV102(plan),template=ALIEN3_FIORINA_TEMPLATE_V103;
 const nodes=decor.nodes,byId=new Map(nodes.map(n=>[n.id,n])),edges=(plan?.graph?.edges||template.edges).map(e=>({...e}));
 const spaces=ALIEN3_SPACES_V103.map(s=>{const ns=s.nodeIds.map(id=>byId.get(id)).filter(Boolean);return {...s,nodes:ns.map(n=>n.id),x:Math.min(...ns.map(n=>n.x-n.width/2)),right:Math.max(...ns.map(n=>n.x+n.width/2)),floor:ns.length?ns.reduce((a,n)=>a+n.y,0)/ns.length:NaN};});
 const gates=edges.filter(e=>['gate','airlock'].includes(e.kind)).map(e=>{const a=byId.get(e.from),b=byId.get(e.to),id=e.gateId||e.id;const p=plan?.geometry?.doors?.find(p=>p.id===id);return {id,edgeId:e.id,from:e.from,to:e.to,label:({ 'f161-infirmary-gate':'Accès aux cellules','f161-cellblock-gate':'Galeries de service','f161-leadworks-gate':'Accès à la fonderie'})[id]||'Passage',...(p?{x:p.x,y:p.y,w:p.w,h:p.h}:{x:(a.x+b.x)/2-22,y:Math.max(a.y,b.y)-132,w:44,h:132}),geometrySource:p?'compiled':'template-derived'};});
 // Each assembly receives only a local electrical run: no invented inter-room plumbing.
 const circuits=[];
 for(const g of decor.groups){const ps=decor.props.filter(p=>p.assemblyId===g.id);const source=ps.find(p=>p.kind==='junction')||ps.find(p=>['console','rack','support'].includes(p.kind));const target=ps.find(p=>p.kind==='lamp'||p.kind==='lampstand');if(!source||!target)continue;
  const a={x:source.x+source.w/2,y:source.y+source.h/2},b={x:target.x+target.w/2,y:target.y+target.h/2};
  const rail=Math.min(source.y,target.y)-5;
  circuits.push({id:g.id+'-lighting-run',assemblyId:g.id,sourceId:source.id,targetId:target.id,kind:'electrical',condition:g.condition,points:[a,{x:a.x,y:rail},{x:b.x,y:rail},b]});
 }
 const utilities=ALIEN3_UTILITIES_V103.map(u=>{const g=decor.groups.find(g=>g.id===u.assemblyId);return {...u,nodeId:g.nodeId,supportId:g.supportId,x:g.x+g.w-13,y:g.y-54,w:13,h:29,footY:g.y,depth:1,targets:decor.props.filter(p=>p.assemblyId===g.id&&['lamp','lampstand'].includes(p.kind)).map(p=>p.id)};});
 return {schema:103,decor,nodes,edges,spaces,gates,circuits,utilities,width:6200,height:720};
}
export function resolveAlien3SpaceV103(scene,actor){
 if(!actor||!Number.isFinite(actor.x)||!Number.isFinite(actor.y))return null;
 const x=actor.x+finite103(actor.w)/2,foot=actor.y+finite103(actor.h);
 const candidates=scene.spaces.filter(s=>x>=s.x-16&&x<=s.right+16&&Math.abs(foot-s.floor)<98);
 return candidates.sort((a,b)=>Math.abs(foot-a.floor)-Math.abs(foot-b.floor)||Math.abs(x-(a.x+a.right)/2)-Math.abs(x-(b.x+b.right)/2))[0]||null;
}
export function reachableUtilityV103(u,actor,{lane=1,doors=[],running=true,paused=false,modal=false,missionActive=true}={}){
 if(!u||!actor||!running||paused||modal||!missionActive||actor.alive===false||actor.downed||actor.climbing||actor.inVehicle)return false;
 const x=actor.x+finite103(actor.w)/2,foot=actor.y+finite103(actor.h),ux=u.x+u.w/2;
 if(![x,foot,ux,lane].every(Number.isFinite)||Math.abs(lane-u.depth)>.15||Math.abs(foot-u.footY)>24||Math.abs(x-ux)>82)return false;
 return !doors.some(d=>{if(d.open===true&&finite103(d.progress,1)>=.82)return false;const mid=d.x+d.w/2;return mid>Math.min(x,ux)&&mid<Math.max(x,ux)&&foot>d.y&&foot<d.y+d.h+24;});
}
export function relevantLadderV103(ladders,actor,direction){
 if(!actor||!direction||actor.inVehicle||actor.alive===false)return null;
 const x=actor.x+finite103(actor.w)/2,foot=actor.y+finite103(actor.h);
 return (ladders||[]).filter(l=>[l.x,l.top,l.bottom].every(Number.isFinite)&&Math.abs(x-l.x)<=Math.max(22,finite103(l.w,42)/2)&&foot>=l.top-5&&foot<=l.bottom+5&&(actor.climbing||(direction<0?foot>l.top+3:foot<l.bottom-3))).sort((a,b)=>Math.abs(x-a.x)-Math.abs(x-b.x))[0]||null;
}
export const createAlien3StateV103=()=>({schema:103,visitedNodes:[],lights:Object.fromEntries(ALIEN3_UTILITIES_V103.map(u=>[u.id,true]))});
export function sanitizeAlien3StateV103(raw){const out=createAlien3StateV103();if(!raw||raw.schema!==103)return out;const valid=new Set(ALIEN3_FIORINA_TEMPLATE_V103.nodes.map(n=>n.id));out.visitedNodes=[...new Set((Array.isArray(raw.visitedNodes)?raw.visitedNodes:[]).filter(id=>valid.has(id)))].slice(0,valid.size);for(const id of Object.keys(out.lights))if(typeof raw.lights?.[id]==='boolean')out.lights[id]=raw.lights[id];return out;}
export function discoverAlien3NodesV103(scene,state,actor){if(!actor||actor.alive===false)return [];const x=actor.x+finite103(actor.w)/2,y=actor.y+finite103(actor.h);const added=scene.nodes.filter(n=>Math.abs(x-n.x)<=80&&Math.abs(y-n.y)<=28&&!state.visitedNodes.includes(n.id)).map(n=>n.id);state.visitedNodes.push(...added);return added;}
export function buildAlien3MapV103(scene,state,actor,doors=[]){
 const known=new Set(state.visitedNodes);const nodes=scene.nodes.filter(n=>known.has(n.id)).map(n=>({...n,label:scene.spaces.find(s=>s.nodeIds.includes(n.id))?.label||'Passage relevé'}));
 const edges=scene.edges.filter(e=>known.has(e.from)&&known.has(e.to)).map(e=>({...e}));
 const gates=scene.gates.filter(g=>known.has(g.from)&&known.has(g.to)).map(g=>{const d=doors.find(d=>d.id===g.id);return {...g,state:d?(d.open?'open':'closed'):'unknown'};});
 return {nodes,edges,gates,player:{x:finite103(actor?.x)+finite103(actor?.w)/2,y:finite103(actor?.y)+finite103(actor?.h)},spaces:scene.spaces.filter(s=>s.nodeIds.some(id=>known.has(id))).map(s=>({id:s.id,label:s.label,floor:s.floor,x:s.x,right:s.right})),totalKnown:nodes.length};
}
export function auditAlien3CirculationV103(scene){const errors=[],ids=new Set();const byId=new Map(scene.nodes.map(n=>[n.id,n])),props=new Map(scene.decor.props.map(p=>[p.id,p]));for(const s of scene.spaces){if(ids.has(s.id))errors.push('space-duplicate:'+s.id);ids.add(s.id);if(![s.x,s.right,s.floor].every(Number.isFinite)||s.right<=s.x)errors.push('space-bounds:'+s.id);for(const id of s.nodeIds)if(!byId.has(id))errors.push('space-node:'+id);}
 for(const c of scene.circuits){const a=props.get(c.sourceId),b=props.get(c.targetId);if(!a||!b||a.assemblyId!==b.assemblyId)errors.push('circuit-parent:'+c.id);if(c.points.length<2||c.points.some(p=>![p.x,p.y].every(Number.isFinite)))errors.push('circuit-point:'+c.id);if(a&&Math.hypot(c.points[0].x-a.x-a.w/2,c.points[0].y-a.y-a.h/2)>.01)errors.push('circuit-start:'+c.id);if(b&&Math.hypot(c.points.at(-1).x-b.x-b.w/2,c.points.at(-1).y-b.y-b.h/2)>.01)errors.push('circuit-end:'+c.id);}
 for(const g of scene.gates){if(!scene.edges.some(e=>e.id===g.edgeId&&[e.gateId,e.id].includes(g.id)))errors.push('gate-edge:'+g.id);if(![g.x,g.y,g.w,g.h].every(Number.isFinite)||g.w<=0||g.h<=0)errors.push('gate-geometry:'+g.id);}
 for(const u of scene.utilities){const s=scene.decor.supports.find(p=>p.id===u.supportId);if(!s||u.x<s.x||u.x+u.w>s.x+s.w||Math.abs(u.footY-s.y)>.01)errors.push('utility-support:'+u.id);if(!u.targets.length||u.targets.some(id=>!props.has(id)))errors.push('utility-target:'+u.id);}
 return {ok:!errors.length,errors,spaces:scene.spaces.length,nodes:scene.nodes.length,edges:scene.edges.length,gates:scene.gates.length,circuits:scene.circuits.length,segments:scene.circuits.reduce((n,c)=>n+c.points.length-1,0),utilities:scene.utilities.length,topologyChanged:false};}
