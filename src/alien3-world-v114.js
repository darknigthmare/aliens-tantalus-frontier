/** V114 — canonical Fiorina world/fidelity registry.
 * The gameplay graph remains owned by V102–V112. This layer audits that the
 * authored spaces, their cut-specific presence and their architectural anchors
 * are coherent. It may add inspection shells, never hidden traversal routes.
 */
import {LOCATION_COVERAGE_V113,REFERENCES_V113} from './alien3-fidelity-v113.js';
import {ALIEN3_FIORINA_TEMPLATE_V102} from './alien3-dlc-v102.js';
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
export const CUTS_V114=freeze({theatrical:{id:'theatrical',label:'Montage cinéma'},assembly:{id:'assembly',label:'Assembly Cut'}});
const room=(id,title,nodeIds,cut='both',kind='existing',anchor='',status='linked',notes='')=>({id,title,nodeIds:String(nodeIds||'').split(' ').filter(Boolean),cut,kind,anchor,status,notes});
export const WORLD_ROOMS_V114=freeze([
 room('shore','Côte / EEV','f161-spawn f161-eev','both','existing','','linked','Zone extérieure et épave.'),
 room('flight-analysis','Analyse EEV','f161-flight-analysis-v94','both','existing','','linked','Lecture et diagnostic de l’EEV.'),
 room('infirmary','Infirmerie / alcôve Clemens','f161-infirmary f161-clemens-bed','both','existing','','linked','Soins, lits et circulation médicale.'),
 room('morgue','Morgue','f161-morgue-high','both','existing','','provisional','Altitude héritée : raccord à reconstruire avant certification 1:1.'),
 room('funeral','Chemin de crémation','f161-funeral-walk f161-furnace','both','existing','','linked','Séquence funéraire distincte de la fonderie finale.'),
 room('cells-west','Cellules ouest','f161-cell-a','both','existing','','linked','Coursive et fronts de cellules.'),
 room('cells-east','Cellules est','f161-cell-b f161-shutter-cell-node','both','existing','','linked','Coursive et verrou de service.'),
 room('assembly-hall','Salle commune / assemblée','f161-assembly-hall f161-mess-high','both','existing','','linked','Rassemblements et briefings.'),
 room('prayer','Recueillement','f161-faith-dais-v94','both','existing','','linked','Espace spirituel, sans porte fictive au fond.'),
 room('comms','Communications','f161-comms-high','both','existing','','linked','Console et message de la Compagnie.'),
 room('service','Service / pompage','f161-service-low f161-rescue-post-node f161-bishop','both','existing','','linked','Entretien et raccordement Bishop.'),
 room('ventilation','Ventilation','f161-fan-shaft f161-service-high f161-steam-service-node','both','existing','','linked','Verticalité et ventilateur.'),
 room('batteries','Atelier batteries','f161-battery-locker-v94 f161-hunt-service-v95','both','existing','','linked','Établi et stockage technique.'),
 room('lower-service','Galeries basses','f161-service-deep f161-tunnel-shrine','both','existing','','linked','Dessous du complexe.'),
 room('ore-tunnels','Tunnels minerai','f161-tunnel-low f161-tunnel-high f161-hunt-junction-v95','both','existing','','linked','Réseau de chasse.'),
 room('fuel','Réserve chimique','f161-chemical-store f161-fuel-manifold-a f161-fuel-manifold-b','both','existing','','linked','Préparation du plan incendiaire.'),
 room('waste','Cuve déchets','f161-waste-tank','assembly','existing','','linked','Piège de la version étendue.'),
 room('leadworks','Leadworks / coulée','f161-leadworks f161-lead-primer','both','existing','','linked','Installation de plomb et portique.'),
 room('mold','Moule / pistons','f161-mold f161-piston-a-node f161-piston-b-node f161-piston-c-node','both','existing','','linked','Zone du rabattage final.'),
 room('water','Refroidissement','f161-water-header f161-sprinkler','both','existing','','linked','Commande haute de refroidissement.'),
 room('foundry-overlook','Passerelles fonderie','f161-furnace-overlook f161-furnace-gantry','both','existing','','linked','Passerelles et vue haute.'),
 room('company','Arrivée Compagnie','f161-company f161-patna-cage-node f161-extraction','both','existing','','linked','Plateforme d’arrivée et confrontation.'),
 // Inspection shells add missing film places visually without pretending they are traversal nodes yet.
 room('andrews-office','Bureau d’Andrews','','both','inspection-shell','f161-assembly-hall','inspection-only','Pièce manquante : shell d’inspection ancré près de l’administration.'),
 room('slaughterhouse','Abattoir','','assembly','inspection-shell','f161-waste-tank','inspection-only','Shell d’inspection avec rail, crochets et treuil ; aucun passage de campagne ajouté.'),
 room('golic-confinement','Confinement de Golic','','assembly','inspection-shell','f161-golic-cache-v94','inspection-only','Shell d’inspection distinct du cache technique.'),
 room('dog-kennel','Chenil / Spike','','theatrical','inspection-shell','f161-eev','inspection-only','Variante cinéma seulement ; aucun chien en Assembly.'),
 room('ox-approach','Bovin / approche','','assembly','inspection-shell','f161-eev','inspection-only','Variante Assembly seulement ; aucun hôte canin simultané.'),
 room('patna-interior','Intérieur récupération','','both','inspection-shell','f161-company','inspection-only','Aperçu de l’intérieur, sans route ni objectif ajoutés.'),
 room('sulaco-prologue','Sulaco / départ EEV','','both','offworld','','documented-only','Hors Fiorina ; conservé dans la matrice mais jamais compté comme pièce de la prison.')
]);
const link=(id,a,b,mode='graph',notes='')=>({id,a,b,mode,notes});
export const WORLD_LINKS_V114=freeze([
 link('shore-analysis','shore','flight-analysis'),link('shore-infirmary','shore','infirmary'),link('medical-morgue','infirmary','morgue'),link('medical-cells','infirmary','cells-west'),
 link('cells-assembly','cells-west','assembly-hall'),link('cells-service','cells-east','service'),link('assembly-prayer','assembly-hall','prayer'),link('assembly-comms','assembly-hall','comms'),
 link('service-vent','service','ventilation'),link('service-batteries','service','batteries'),link('service-lower','service','lower-service'),link('lower-tunnels','lower-service','ore-tunnels'),
 link('service-fuel','service','fuel'),link('tunnels-waste','ore-tunnels','waste'),link('service-lead','service','leadworks'),link('lead-mold','leadworks','mold'),link('lead-water','leadworks','water'),
 link('mold-overlook','mold','foundry-overlook'),link('mold-company','mold','company'),
 link('office-annex','assembly-hall','andrews-office','inspection'),link('slaughter-annex','lower-service','slaughterhouse','inspection'),link('golic-annex','lower-service','golic-confinement','inspection'),
 link('dog-variant','shore','dog-kennel','inspection'),link('ox-variant','shore','ox-approach','inspection'),link('patna-annex','company','patna-interior','inspection')
]);
export function activeForCutV114(entry,cut='theatrical'){return entry.cut==='both'||entry.cut===cut;}
export function compileWorldV114(scene,cut='theatrical'){
 const nodes=new Map(scene.nodes.map(n=>[n.id,n]));
 return WORLD_ROOMS_V114.filter(r=>activeForCutV114(r,cut)).map(r=>{
  const bound=r.nodeIds.map(id=>nodes.get(id)).filter(Boolean),anchor=r.anchor?nodes.get(r.anchor):null;
  const xs=[...bound.map(n=>n.x),...(anchor?[anchor.x]:[])],ys=[...bound.map(n=>n.y),...(anchor?[anchor.y]:[])];
  return {...r,boundNodes:bound.map(n=>n.id),anchorNode:anchor?.id||null,center:xs.length?{x:xs.reduce((a,b)=>a+b,0)/xs.length,y:ys.reduce((a,b)=>a+b,0)/ys.length}:null};
 });
}
const adjacency=scene=>{const m=new Map(scene.nodes.map(n=>[n.id,new Set()]));for(const e of ALIEN3_FIORINA_TEMPLATE_V102.edges){m.get(e.from)?.add(e.to);m.get(e.to)?.add(e.from);}return m;};
function reachable(adj,starts,targets){const goal=new Set(targets),q=[...starts],seen=new Set(q);while(q.length){const id=q.shift();if(goal.has(id))return true;for(const n of adj.get(id)||[])if(!seen.has(n)){seen.add(n);q.push(n);}}return false;}
export function auditWorldV114(scene,cut='theatrical'){
 const errors=[],warnings=[],ids=new Set(scene.nodes.map(n=>n.id)),rooms=compileWorldV114(scene,cut),byId=new Map(rooms.map(r=>[r.id,r]));
 for(const r of rooms){for(const n of r.nodeIds)if(!ids.has(n))errors.push(`room-node:${r.id}:${n}`);if(r.anchor&&!ids.has(r.anchor))errors.push(`room-anchor:${r.id}:${r.anchor}`);if(r.status==='linked'&&!r.nodeIds.length)errors.push(`linked-without-node:${r.id}`);}
 const adj=adjacency(scene);for(const l of WORLD_LINKS_V114){const a=byId.get(l.a),b=byId.get(l.b);if(!a||!b)continue;if(l.mode==='graph'&&a.nodeIds.length&&b.nodeIds.length&&!reachable(adj,a.nodeIds,b.nodeIds))errors.push(`world-link:${l.id}`);}
 if(cut==='theatrical'&&rooms.some(r=>r.id==='ox-approach'))errors.push('cut-mix:ox');if(cut==='assembly'&&rooms.some(r=>r.id==='dog-kennel'))errors.push('cut-mix:dog');
 const inspection=rooms.filter(r=>r.status==='inspection-only').map(r=>r.id),provisional=rooms.filter(r=>r.status==='provisional').map(r=>r.id);
 if(inspection.length)warnings.push(`inspection-only:${inspection.join(',')}`);if(provisional.length)warnings.push(`provisional:${provisional.join(',')}`);
 return {ok:!errors.length,cut,errors,warnings,totalRooms:rooms.length,linkedRooms:rooms.filter(r=>r.status==='linked').length,inspectionRooms:inspection,provisionalRooms:provisional,graphNodes:scene.nodes.length,graphEdges:ALIEN3_FIORINA_TEMPLATE_V102.edges.length};
}
export function fidelityMatrixV114(scene){return {theatrical:auditWorldV114(scene,'theatrical'),assembly:auditWorldV114(scene,'assembly'),references:REFERENCES_V113.length,legacyLocations:LOCATION_COVERAGE_V113.length};}
