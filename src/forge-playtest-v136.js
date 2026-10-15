/** Admission and geometry inspection for the shipped ACTIVE-ROOM playtest only.
 * This module does not implement room travel, project scripts or scene storage.
 */
import { parseProject, projectRoom, nativeTiles, validateProject, decorative } from './forge-model-v130.js';
import { compileEditorGridV136, editorMissionSpawnV136, constrainEditorRectV136,
  EDITOR_MISSION_WORLD_V136 } from './editor-spatial-v136.js';
import { compileShipProject, HUB_WORLD } from './hub-v51-runtime.js';

export const FORGE_TEST_BOUNDS_V136 = Object.freeze({
  mission: EDITOR_MISSION_WORLD_V136,
  ship: Object.freeze({ width: HUB_WORLD.width, height: 720, actorWidth: 44, actorHeight: 92 })
});
const overlap = (a,b) => a.x < b.x+b.w-.01 && a.x+a.w > b.x+.01 && a.y < b.y+b.h-.01 && a.y+a.h > b.y+.01;

function missionGeometry(project, cells, bounds) {
  const grid = compileEditorGridV136(project), { tileWidth: cw, tileHeight: ch } = grid;
  const source = new Map(cells.map(cell => [`${cell.x}:${cell.y}`, cell]));
  return grid.tiles.flatMap(tile => {
    const cell = source.get(tile.position);
    let box = { id: cell.id, cellId: cell.id, type: tile.type, x: tile.x, y: tile.y, w: cw, h: ch };
    if (tile.type === 'floor') box = { ...box, w: cw + 1, h: Math.max(24, ch) };
    else if (tile.type === 'platform') box = { ...box, w: cw + 1, y: tile.y + ch * .5, h: 24 };
    else if (tile.type === 'lift') box = { ...box, h: 24, dynamic: true };
    else if (tile.type === 'door') {
      const h = Math.max(132, ch * 2.6);
      box = constrainEditorRectV136({ ...box, x: tile.x + cw * .34,
        y: tile.y + ch - h, w: Math.max(48, cw * .32), h }, grid);
    } else if (tile.type === 'hazard') box = { ...box, y: tile.y + ch * .65, h: ch * .35 };
    else if (tile.type === 'spawn') {
      if (tile !== grid.tiles.find(entry => entry.type === 'spawn')) return [];
      box = { ...box, ...editorMissionSpawnV136(grid), w: bounds.actorWidth, h: bounds.actorHeight };
    } else if (tile.type !== 'wall') return [];
    return [box];
  });
}

function shipGeometry(project, cells, bounds) {
  const compiled = compileShipProject(project), geometry = [];
  for (const [group, type] of [['floors', 'floor'], ['platforms', 'platform'], ['walls', 'wall'],
    ['doors', 'door'], ['hazards', 'hazard']]) {
    const sources = cells.filter(cell => cell.type === type);
    for (const [index, box] of compiled[group].entries()) {
      const cell = sources[index];
      geometry.push({ ...box, id: cell.id, cellId: cell.id, type });
    }
  }
  const spawn = cells.find(cell => cell.type === 'spawn');
  if (spawn && compiled.spawn) geometry.push({ id: spawn.id, cellId: spawn.id, type: 'spawn',
    ...compiled.spawn, w: bounds.actorWidth, h: bounds.actorHeight });
  for (const lift of compiled.lifts) {
    const cell = cells.find(cell => cell.type === 'lift' && cell.x === Math.round(lift.x / compiled.grid.cellWidth - .5)
      && cell.y === Math.round(lift.top / compiled.grid.cellHeight));
    geometry.push({ id: cell.id, cellId: cell.id, type: 'lift', x: lift.x - lift.w / 2,
      y: lift.top, w: lift.w, h: lift.bottom - lift.top, dynamic: false });
  }
  return geometry;
}

/** Uses the production grid/spawn helpers and the actual ship compiler.
 * Checks physical clearance of the active room, not pathfinding. */
export function inspectForgePlaytestV136(input) {
  const project = parseProject(input);
  return inspectForgeRoomPhysicsV141(project, project.activeRoomId, validateProject(project));
}

/** Internal physics inspection for an already parsed document. The journey
 * admission parses once and shares grid diagnostics across reachable rooms. */
export function inspectForgeRoomPhysicsV141(project, roomId = project.activeRoomId, validation = validateProject(project)) {
  const room = project.rooms.find(entry => entry.id === roomId), kind = project.kind;
  if (!room) throw new TypeError('Salle Forge introuvable pour le contrôle physique.');
  const bounds = FORGE_TEST_BOUNDS_V136[kind];
  const cells = room.cells.filter(c => !decorative(c));
  const issues = validation.issues.filter(i => i.roomId === room.id && !['decor-preview','links-authoring'].includes(i.code));
  const add = (severity,code,message,cell=null) => issues.push({severity,code,message,roomId:room.id,cellId:cell?.id||null,x:cell?.x??null,y:cell?.y??null});
  const ofType = type => cells.filter(c => c.type === type), counts = Object.fromEntries(['floor','platform','wall','door','ladder','lift','vent','spawn','objective','terminal','enemy','vehicle','hazard'].map(t=>[t,ofType(t).length]));
  const projection = { schema: 2, kind, size: [...room.size], tiles: nativeTiles(room) };
  const geometry = kind === 'mission' ? missionGeometry(projection, cells, bounds) : shipGeometry(projection, cells, bounds);
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
    if(counts.ladder)add('warning','native-ladder-extension','Les marqueurs d’échelle Mission s’étendent sur quatre cases, dans les limites du niveau ; vérifier les raccords en jeu.');
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
