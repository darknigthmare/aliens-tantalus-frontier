/** Admission and geometry inspection for the shipped ACTIVE-ROOM playtest only.
 * This module does not implement room travel, project scripts or scene storage.
 */
import { parseProject, projectRoom, nativeTiles, validateProject, decorative, clone } from './forge-model-v130.js';

export const FORGE_TEST_BOUNDS_V136 = Object.freeze({
  mission: Object.freeze({ width: 6200, height: 1080, actorWidth: 42, actorHeight: 92 }),
  ship: Object.freeze({ width: 5120, height: 720, actorWidth: 44, actorHeight: 92 })
});
const overlap = (a,b) => a.x < b.x+b.w-.01 && a.x+a.w > b.x+.01 && a.y < b.y+b.h-.01 && a.y+a.h > b.y+.01;

/** Mirrors the geometry rules used by the two published native compilers. Not pathfinding. */
export function inspectForgePlaytestV136(input) {
  const project = parseProject(input), room = projectRoom(project), kind = project.kind;
  const bounds = FORGE_TEST_BOUNDS_V136[kind], cw = bounds.width/room.size[0], ch = bounds.height/room.size[1];
  const cells = room.cells.filter(c => !decorative(c));
  const issues = validateProject(project).issues.filter(i => i.roomId === room.id && !['decor-preview','links-authoring'].includes(i.code));
  const add = (severity,code,message,cell=null) => issues.push({severity,code,message,roomId:room.id,cellId:cell?.id||null,x:cell?.x??null,y:cell?.y??null});
  const ofType = type => cells.filter(c => c.type === type), counts = Object.fromEntries(['floor','platform','wall','door','ladder','lift','vent','spawn','objective','terminal','enemy','vehicle','hazard'].map(t=>[t,ofType(t).length]));
  const geometry = [];
  for (const c of cells) {
    let box = {id:c.id,cellId:c.id,type:c.type,x:c.x*cw,y:c.y*ch,w:cw,h:ch};
    if(kind==='mission'&&['floor','platform'].includes(c.type))box.w=cw+1;
    if(c.type==='floor'&&kind==='mission')box.h=Math.max(24,ch);
    if(c.type==='platform') {box.h=kind==='mission'?24:Math.max(14,ch*.28);if(kind==='mission')box.y+=ch*.5;}
    if(c.type==='lift') { box.h=kind==='mission'?24:ch; box.dynamic=true; }
    if(c.type==='door') {
      box.h=kind==='mission'?Math.max(132,ch*2.6):Math.max(116,ch*2.5);
      box.w=kind==='mission'?Math.max(48,cw*.32):Math.min(68,cw*.44);
      box.x=c.x*cw+(kind==='mission'?cw*.34:cw/2-box.w/2);box.y=(c.y+1)*ch-box.h;
    }
    if(c.type==='hazard') {box.y+=ch*(kind==='mission'?.65:.58);box.h=ch*(kind==='mission'?.35:.42);}
    if(c.type==='spawn') {
      box.w=bounds.actorWidth;box.h=bounds.actorHeight;
      box.x=c.x*cw+(kind==='mission'?cw*.35:cw/2-22);
      box.y=(c.y+1)*ch-box.h;
    }
    if(['floor','platform','wall','door','hazard','spawn','lift'].includes(c.type))geometry.push(box);
  }
  const solids=geometry.filter(g=>['floor','platform','wall','door'].includes(g.type));
  const platforms=geometry.filter(g=>['floor','platform'].includes(g.type));
  for(const spawn of geometry.filter(g=>g.type==='spawn')) {
    const cell=cells.find(c=>c.id===spawn.cellId);
    if(spawn.x<0||spawn.y<0||spawn.x+spawn.w>bounds.width||spawn.y+spawn.h>bounds.height)
      add('error','native-spawn-bounds','Le corps du Marine dépasse les limites du test.',cell);
    if(solids.some(s=>overlap(spawn,s)))add('error','native-spawn-blocked','Le volume réel du Marine rencontre un plafond, un mur, une plateforme ou un sas.',cell);
    if(geometry.some(g=>g.type==='hazard'&&overlap(spawn,g)))add('error','native-spawn-hazard','Insertion dans le volume d’un danger.',cell);
    const spans=platforms.filter(p=>Math.abs(p.y-spawn.y-spawn.h)<1).map(p=>[p.x,p.x+p.w]).sort((a,b)=>a[0]-b[0]);
    let supported=spawn.x;
    for(const [left,right] of spans)if(left<=supported+.01&&right>supported)supported=right;
    if(supported<spawn.x+spawn.w-.01)add('error','native-spawn-support','Le pied du Marine n’est pas entièrement supporté par une surface fixe.',cell);
  }
  if(kind==='mission') {
    if(room.size[0]>64||room.size[1]>36)add('error','native-grid-capacity','Mission : le compilateur publié est limité à 64 × 36. Un plan plus grand serait tronqué ou remplacé par le niveau par défaut.');
    add('warning','native-reference-scenario','Mission : le moteur publié conserve des conditions du scénario de référence. Ce contrôle ne garantit pas que son objectif soit terminable.');
    if(counts.ladder)add('warning','native-ladder-extension','Les marqueurs d’échelle Mission s’étendent sur quatre cases dans le moteur publié ; vérifier les raccords en jeu.');
    if(counts.objective>1)add('error','native-objective-capacity','Mission : le moteur utilise un seul objectif par salle. Les objectifs supplémentaires seraient ignorés.');
    if(counts.terminal>2)add('error','native-terminal-capacity','Mission : deux terminaux maximum (alimentation puis archive). Les suivants ne sont pas compilés.');
    if(counts.vehicle>1)add('error','native-vehicle-capacity','Mission : un seul véhicule est pris en charge par salle.');
    if(counts.lift)add('warning','native-moving-lifts','Les ascenseurs Mission sont des plateformes cycliques : vérifier leur course en jeu.');
  } else {
    add('warning','native-ship-context','Vaisseau : le test reprend le contexte natif du hub ; ce contrôle ne neutralise pas ses événements de crise.');
    if(counts.vehicle)add('error','native-ship-vehicle','Vaisseau : aucun véhicule pilotable n’est compilé. Retirez ce marqueur ou choisissez Mission.');
    if(counts.lift)add('warning','native-ship-lift','Vaisseau : le marqueur ascenseur est actuellement un accès vertical, pas une cabine mobile.');
    if(counts.objective)add('warning','native-ship-objective','Les objectifs Vaisseau se valident au contact dans le moteur publié.');
  }
  if(counts.enemy>128)add('error','native-enemy-budget','Réduisez le nombre de menaces à 128 au maximum pour ce test.');
  if(counts.vent===1)add('warning','native-single-vent','Un seul conduit : aucune sortie distincte ne peut être garantie.');
  if(counts.enemy)add('warning','native-enemy-identity','Les marqueurs utilisent le catalogue du moteur ; aucune espèce précise n’est encodée dans ces blocs.');
  if(room.cells.some(decorative))add('warning','native-decoration-omitted','Les calques décoratifs restent visibles seulement dans l’éditeur sur cette branche.');
  if(project.rooms.length>1||project.links.length)add('warning','native-active-room-only','Seule la salle active est testée. Les autres salles et les liaisons ne sont pas chargées.');
  return {schema:1,kind:'forge-playtest-audit',roomId:room.id,roomName:room.name,mode:kind,scope:'active-room',
    bounds:{...bounds},grid:[...room.size],counts,geometry,issues,
    ok:!issues.some(i=>i.severity==='error'),errors:issues.filter(i=>i.severity==='error').map(i=>i.message),
    warnings:issues.filter(i=>i.severity==='warning').map(i=>i.message),navigation:'not-simulated'};
}

export function admittedForgeProjectV136(input) {
  const project=parseProject(input), audit=inspectForgePlaytestV136(project);
  if(!audit.ok)throw new Error(`Test Forge refusé : ${audit.errors.join(' ')}`);
  const room=projectRoom(project);
  return {...project,size:[...room.size],tiles:nativeTiles(room)};
}
