/** Frontier Forge V130. Pure authoring data; never imports a campaign store. */
export const TILE_TYPES = Object.freeze(['floor','platform','wall','door','vent','ladder','lift','spawn','objective','enemy','vehicle','terminal','hazard']);
export const LAYERS = Object.freeze(['background','structure','gameplay','foreground']);
export const LIMITS = Object.freeze({ rooms:32, columns:128, rows:72, cells:60000, bytes:4*1024*1024, history:60, historyBytes:16*1024*1024 });
export const LABELS = Object.freeze({floor:'Sol',platform:'Passerelle',wall:'Cloison',door:'Sas',vent:'Conduit',ladder:'Échelle',lift:'Ascenseur',spawn:'Insertion',objective:'Objectif',enemy:'Menace',vehicle:'Véhicule',terminal:'Terminal',hazard:'Danger'});
export const DEFAULT_LAYER = type => ['floor','platform','wall','ladder','lift','vent'].includes(type) ? 'structure' : 'gameplay';
export const clone = value => structuredClone(value);
export const keyOf = cell => `${cell.layer}:${cell.x}:${cell.y}`;
const text = (value, fallback='', max=120) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,max) : fallback;
const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/;
const integer = (n,min,max) => Number.isInteger(n) && n >= min && n <= max;
const fail = message => { throw new Error(message); };
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export const decorative = cell => ['background','foreground'].includes(cell.layer);
export function freshId(prefix, used) { let index=1; while(used.has(`${prefix}-${index}`)) index++; return `${prefix}-${index}`; }
export function emptyRoom(id='room-1',name='Secteur 01',size=[32,18]) { return {id,name,size:[...size],cells:[]}; }

/** Fail closed, before mutation. Only whitelisted data crosses JSON boundaries. */
export function parseProject(input) {
  if (typeof input === 'string') {
    if (new TextEncoder().encode(input).length > LIMITS.bytes) fail('Fichier trop volumineux (4 Mio maximum).');
    try { input=JSON.parse(input); } catch { fail('JSON illisible : le plan actuel est conservé.'); }
  }
  if (!isRecord(input)) fail('Projet Frontier Forge invalide.');
  if (input.schema !== undefined && ![1,2,3].includes(input.schema)) fail('Version de projet non prise en charge.');
  const modern = input.schema === 3;
  if (modern && (!Array.isArray(input.rooms) || !input.rooms.length || input.rooms.length > LIMITS.rooms)) fail('Le projet doit contenir de 1 à 32 salles.');
  if (!modern && !Array.isArray(input.tiles)) fail('Liste de blocs manquante.');
  const rawRooms = modern ? input.rooms : [{id:'room-1',name:input.name || 'Secteur 01',size:input.size || [32,18],cells:input.tiles.map((tile,index) => {
    if (!isRecord(tile) || typeof tile.position !== 'string' || !/^\d{1,3}:\d{1,3}$/.test(tile.position)) fail('Position de bloc invalide.');
    const [x,y]=tile.position.split(':').map(Number);
    return {id:`cell-${index+1}`,x,y,type:tile.type,layer:DEFAULT_LAYER(tile.type)};
  })}];
  let total=0;
  const roomIds=new Set(), cellIds=new Set();
  const rooms=rawRooms.map(raw => {
    if (!isRecord(raw) || (typeof raw.id !== 'string' || !idPattern.test(raw.id)) || roomIds.has(raw.id)) fail('Identifiant de salle invalide ou dupliqué.');
    roomIds.add(raw.id);
    if (!Array.isArray(raw.size) || raw.size.length !== 2 || !integer(raw.size[0],8,LIMITS.columns) || !integer(raw.size[1],8,LIMITS.rows)) fail('Dimensions autorisées : 8–128 colonnes et 8–72 lignes.');
    if (!Array.isArray(raw.cells) || (total+=raw.cells.length)>LIMITS.cells) fail('Budget dépassé : 60 000 blocs maximum par projet.');
    const occupied=new Set();
    const cells=raw.cells.map(cell => {
      if (!isRecord(cell) || (typeof cell.id !== 'string' || !idPattern.test(cell.id)) || cellIds.has(cell.id)) fail('Identifiant de bloc invalide ou dupliqué.');
      if (!TILE_TYPES.includes(cell.type) || !LAYERS.includes(cell.layer)) fail('Type ou calque inconnu.');
      if (!integer(cell.x,0,raw.size[0]-1) || !integer(cell.y,0,raw.size[1]-1)) fail('Un bloc dépasse les limites de sa salle.');
      if (occupied.has(keyOf(cell))) fail('Deux blocs occupent la même case du même calque.');
      cellIds.add(cell.id); occupied.add(keyOf(cell));
      return {id:cell.id,x:cell.x,y:cell.y,type:cell.type,layer:cell.layer,label:text(cell.label),locked:cell.locked === true};
    });
    return {id:raw.id,name:text(raw.name,'Secteur sans nom'),size:[...raw.size],cells};
  });
  if (modern && input.links !== undefined && (!Array.isArray(input.links) || input.links.length > LIMITS.cells)) fail('Liste de liaisons invalide.');
  const linkIds=new Set(), endpoints=new Set();
  const links=(modern ? input.links || [] : []).map(raw => {
    if (!isRecord(raw) || (typeof raw.id !== 'string' || !idPattern.test(raw.id)) || linkIds.has(raw.id)) fail('Identifiant de liaison invalide ou dupliqué.');
    const readEndpoint = endpoint => {
      if (!isRecord(endpoint)) fail('Extrémité de liaison invalide.');
      const room=rooms.find(item => item.id===endpoint.roomId);
      const cell=room?.cells.find(item => item.id===endpoint.cellId);
      if (!cell || cell.type !== 'door' || decorative(cell)) fail('Une liaison doit relier deux sas physiques existants.');
      if (endpoints.has(cell.id)) fail('Un sas est déjà relié.');
      endpoints.add(cell.id);
      return {roomId:room.id,cellId:cell.id};
    };
    const from=readEndpoint(raw.from), to=readEndpoint(raw.to);
    if (from.roomId === to.roomId) fail('Reliez deux salles distinctes.');
    linkIds.add(raw.id);
    return {id:raw.id,from,to,bidirectional:raw.bidirectional !== false};
  });
  const activeRoomId=modern ? input.activeRoomId : rooms[0].id;
  if (!roomIds.has(activeRoomId)) fail('Salle active introuvable.');
  const result={schema:3,kind:input.kind==='ship'?'ship':'mission',name:text(input.name,'Frontier Forge'),activeRoomId,rooms,links};
  if(new TextEncoder().encode(JSON.stringify(result,null,2)).length>LIMITS.bytes)fail('Budget du document dépassé (4 Mio).');
  return result;
}

export function projectRoom(project) { return project.rooms.find(room=>room.id===project.activeRoomId); }
export function nativeTiles(room) {
  return room.cells.filter(cell=>!decorative(cell)).map(cell=>({position:`${cell.x}:${cell.y}`,type:cell.type}));
}
export function validateProject(project, roomId=project.activeRoomId) {
  const issues=[];
  const add=(severity,code,message,room,cell=null)=>issues.push({severity,code,message,roomId:room.id,cellId:cell?.id||null,x:cell?.x??null,y:cell?.y??null});
  let activeCounts;
  for(const room of project.rooms) {
    const physical=room.cells.filter(cell=>!decorative(cell));
    const counts=Object.fromEntries(TILE_TYPES.map(type=>[type,0]));
    const occupied=new Map();
    for(const cell of physical) { counts[cell.type]++; const key=`${cell.x}:${cell.y}`; if(!occupied.has(key)) occupied.set(key,[]); occupied.get(key).push(cell); }
    const active=room.id===roomId;
    if(active) activeCounts=counts;
    if(!counts.spawn) add(active?'error':'warning','missing-spawn','Un point d’insertion est requis pour tester cette salle.',room);
    if(counts.spawn>1) add('error','multiple-spawn','Gardez un seul point d’insertion par salle.',room);
    if(!counts.objective) add(active?'error':'warning','missing-objective','Aucun objectif dans cette salle.',room);
    if(!(counts.floor||counts.platform)) add('error','missing-ground','Ajoutez un sol ou une passerelle.',room);
    for(const cells of occupied.values()) {
      if(cells.length>1) add('error','native-overlap','Deux blocs physiques partagent une case ; le compilateur natif ne sépare pas ces calques.',room,cells[1]);
    }
    const solid=(x,y)=>occupied.get(`${x}:${y}`)?.some(cell=>['floor','platform','wall','lift'].includes(cell.type));
    for(const cell of physical) {
      if(['spawn','objective','terminal','door','enemy','vehicle'].includes(cell.type) && !solid(cell.x,cell.y+1)) add(cell.type==='spawn'?'error':'warning','unsupported','Ce bloc n’a pas de support immédiatement dessous.',room,cell);
      if(cell.type==='spawn' && (solid(cell.x,cell.y-1) || occupied.get(`${cell.x}:${cell.y}`)?.some(c=>c.type==='hazard'))) add('error','unsafe-spawn','Insertion obstruée ou dangereuse.',room,cell);
      if(cell.type==='door') {
        if(!solid(cell.x-1,cell.y) && !solid(cell.x+1,cell.y) && cell.x!==0 && cell.x!==room.size[0]-1) add('warning','floating-door','Sas sans cloison latérale : vérifiez son encadrement.',room,cell);
        if(!project.links.some(link=>link.from.cellId===cell.id||link.to.cellId===cell.id)) add('warning','unlinked-door','Ce sas ne relie aucune autre salle.',room,cell);
      }
      if(cell.type==='ladder' && !solid(cell.x,cell.y+1) && !occupied.get(`${cell.x}:${cell.y+1}`)?.some(c=>['ladder','lift'].includes(c.type))) add('warning','ladder-base','Base d’échelle non raccordée.',room,cell);
    }
    // An air-space flood detects sealed volumes only. It is NOT a jump/navigation proof.
    const spawn=physical.find(cell=>cell.type==='spawn');
    if(spawn) {
      const queue=[[spawn.x,spawn.y]], seen=new Set([`${spawn.x}:${spawn.y}`]);
      for(let i=0;i<queue.length;i++) for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const [x,y]=[queue[i][0]+dx,queue[i][1]+dy], key=`${x}:${y}`;
        if(x<0||y<0||x>=room.size[0]||y>=room.size[1]||seen.has(key)||solid(x,y)) continue;
        seen.add(key);queue.push([x,y]);
      }
      for(const cell of physical.filter(cell=>cell.type==='objective')) if(!seen.has(`${cell.x}:${cell.y}`)) add('error','sealed-objective','Objectif dans un volume fermé depuis l’insertion (contrôle de grille).',room,cell);
    }
    if(room.cells.some(decorative)) add('warning','decor-preview','Les calques décoratifs sont conservés et visibles dans l’éditeur, pas dans le playtest natif.',room);
  }
  const reached=new Set([roomId]); let changed=true;
  while(changed) {changed=false;for(const link of project.links){ if(reached.has(link.from.roomId)&&!reached.has(link.to.roomId)){reached.add(link.to.roomId);changed=true;} if(link.bidirectional&&reached.has(link.to.roomId)&&!reached.has(link.from.roomId)){reached.add(link.from.roomId);changed=true;} }}
  for(const room of project.rooms) if(!reached.has(room.id)) add('warning','disconnected-room','Salle non reliée depuis la salle active.',room);
  if(project.links.length) add('warning','links-authoring','Les liaisons sont des données d’édition. Le playtest natif teste uniquement la salle active.',projectRoom(project));
  const activeIssues=issues.filter(issue=>issue.roomId===roomId);
  const errors=activeIssues.filter(issue=>issue.severity==='error').map(issue=>issue.message);
  return {ok:errors.length===0,errors,warnings:activeIssues.filter(issue=>issue.severity==='warning').map(issue=>issue.message),counts:activeCounts,issues,scope:'active-room',navigation:'sealed-volumes-only'};
}

/** Exact, immutable projection consumed by the existing native playtest. */
export function serializeProject(project) {
  const result=clone(project),room=projectRoom(result);
  return {...result,size:[...room.size],tiles:nativeTiles(room),validation:validateProject(result)};
}
export function lineCells(a,b) {
  const result=[];let [x,y]=[a.x,a.y],dx=Math.abs(b.x-x),dy=-Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1,err=dx+dy;
  for(let guard=0;guard<512;guard++){result.push({x,y});if(x===b.x&&y===b.y)break;const e=err*2;if(e>=dy){err+=dy;x+=sx;}if(e<=dx){err+=dx;y+=sy;}}
  return result;
}
export function rectangle(a,b) {return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(b.x-a.x)+1,h:Math.abs(b.y-a.y)+1};}
export const inside=(cell,rect)=>rect&&cell.x>=rect.x&&cell.y>=rect.y&&cell.x<rect.x+rect.w&&cell.y<rect.y+rect.h;

export class ForgeModel {
  constructor(input={schema:2,tiles:[],size:[32,18]}) {this.data=parseProject(input);this.history=[];this.future=[];this.pending=null;this.revision=0;}
  get room(){return projectRoom(this.data);}
  begin(label='Modification'){if(this.pending) fail('Une opération est déjà en cours.');this.pending={label,data:clone(this.data)};this.idCache=null;this.cellCache=null;}
  commit(){
    if(!this.pending)return false;
    const previous=this.pending;
    try{this.data=parseProject(this.data);}catch(error){this.cancel();throw error;}
    this.pending=null;
    if(JSON.stringify(previous.data)===JSON.stringify(this.data))return false;
    this.history.push(previous);this.future=[];this.trimHistory();this.revision++;return true;
  }
  trimHistory(){let bytes=0;for(let i=this.history.length-1;i>=0;i--){bytes+=JSON.stringify(this.history[i].data).length*2;if(bytes>LIMITS.historyBytes||this.history.length-i>LIMITS.history){this.history.splice(0,i+1);break;}}}
  cancel(){if(!this.pending)return false;this.data=this.pending.data;this.pending=null;return true;}
  transaction(label,fn){this.begin(label);try{fn();return this.commit();}catch(error){this.cancel();throw error;}}
  undo(){if(this.pending)this.cancel();const entry=this.history.pop();if(!entry)return false;this.future.push({label:entry.label,data:clone(this.data)});this.data=entry.data;this.revision++;return true;}
  redo(){if(this.pending)this.cancel();const entry=this.future.pop();if(!entry)return false;this.history.push({label:entry.label,data:clone(this.data)});this.data=entry.data;this.trimHistory();this.revision++;return true;}
  load(input){const next=parseProject(input);return this.transaction('Importer le projet',()=>{this.data=next;});}
  cellId(){if(!this.idCache){this.idCache=new Set(this.data.rooms.flatMap(room=>room.cells.map(cell=>cell.id)));this.nextCellId=1;}let id;do{id=`cell-${this.nextCellId++}`;}while(this.idCache.has(id));this.idCache.add(id);return id;}
  removeLinks(ids){const deleted=new Set(ids);this.data.links=this.data.links.filter(link=>!deleted.has(link.from.cellId)&&!deleted.has(link.to.cellId));}
  paint(x,y,type,layer,{erase=false,size=1}={}) {
    if(!TILE_TYPES.includes(type)||!LAYERS.includes(layer))fail('Outil ou calque inconnu.');
    if(!integer(size,1,6))fail('Taille de brosse invalide.');
    if(!this.cellCache || this.cellCacheRoom!==this.room || this.cellCacheLength!==this.room.cells.length){this.cellCache=new Map(this.room.cells.map(cell=>[keyOf(cell),cell]));this.cellCacheRoom=this.room;}
    for(let dy=0;dy<size;dy++)for(let dx=0;dx<size;dx++){
      const px=x+dx,py=y+dy;if(!integer(px,0,this.room.size[0]-1)||!integer(py,0,this.room.size[1]-1))continue;
      const positionKey=`${layer}:${px}:${py}`;const cell=this.cellCache.get(positionKey);
      if(cell?.locked)continue;
      if(erase){if(cell){this.removeLinks([cell.id]);this.room.cells.splice(this.room.cells.indexOf(cell),1);this.cellCache.delete(positionKey);}continue;}
      if(cell){if(cell.type!==type){if(cell.type==='door')this.removeLinks([cell.id]);cell.type=type;}}else {const placed={id:this.cellId(),x:px,y:py,type,layer,label:'',locked:false};this.room.cells.push(placed);this.cellCache.set(positionKey,placed);}
    }
    this.cellCacheLength=this.room.cells.length;
  }
  fill(x,y,type,layer,erase=false){
    if(!integer(x,0,this.room.size[0]-1)||!integer(y,0,this.room.size[1]-1))return;
    const map=new Map(this.room.cells.filter(cell=>cell.layer===layer).map(cell=>[`${cell.x}:${cell.y}`,cell]));
    const initial=map.get(`${x}:${y}`)?.type;
    if((!erase&&initial===type)||(erase&&!initial))return;
    const queue=[[x,y]],seen=new Set();
    for(let i=0;i<queue.length;i++){
      const [px,py]=queue[i],key=`${px}:${py}`;if(seen.has(key)||px<0||py<0||px>=this.room.size[0]||py>=this.room.size[1])continue;
      seen.add(key);const cell=map.get(key);if(cell?.locked||cell?.type!==initial)continue;
      this.paint(px,py,type,layer,{erase});queue.push([px-1,py],[px+1,py],[px,py-1],[px,py+1]);
    }
  }
  transform(ids,transform){
    const selected=new Set(ids),cells=this.room.cells.filter(cell=>selected.has(cell.id));
    if(!cells.length)return;
    if(cells.some(cell=>cell.locked))fail('La sélection contient un bloc verrouillé.');
    const moved=cells.map(cell=>({...cell,...transform(clone(cell))}));
    const occupied=new Set(this.room.cells.filter(cell=>!selected.has(cell.id)).map(keyOf)),dest=new Set();
    for(const cell of moved){if(!integer(cell.x,0,this.room.size[0]-1)||!integer(cell.y,0,this.room.size[1]-1))fail('Déplacement hors des limites.');const key=keyOf(cell);if(occupied.has(key)||dest.has(key))fail('Destination occupée sur le même calque.');dest.add(key);}
    const byId=new Map(moved.map(cell=>[cell.id,cell]));this.room.cells=this.room.cells.map(cell=>byId.get(cell.id)||cell);this.cellCache=null;
  }
  copy(ids){const selected=new Set(ids),cells=this.room.cells.filter(cell=>selected.has(cell.id));if(!cells.length)return null;const x=Math.min(...cells.map(c=>c.x)),y=Math.min(...cells.map(c=>c.y));return {cells:cells.map(cell=>({...clone(cell),x:cell.x-x,y:cell.y-y,locked:false}))};}
  paste(clipboard,x,y){
    if(!clipboard?.cells?.length)return [];
    const inserted=[],occupied=new Set(this.room.cells.map(keyOf));
    for(const original of clipboard.cells){const cell={...clone(original),x:x+original.x,y:y+original.y,id:this.cellId(),locked:false};if(cell.x<0||cell.y<0||cell.x>=this.room.size[0]||cell.y>=this.room.size[1]||occupied.has(keyOf(cell)))fail('Collage refusé : limites ou destination occupée.');occupied.add(keyOf(cell));this.room.cells.push(cell);inserted.push(cell.id);}
    this.cellCache=null;return inserted;
  }
  deleteCells(ids){const wanted=new Set(ids),removed=new Set(this.room.cells.filter(cell=>wanted.has(cell.id)&&!cell.locked).map(cell=>cell.id));this.room.cells=this.room.cells.filter(cell=>!removed.has(cell.id));this.removeLinks([...removed]);this.cellCache=null;}
  resize(width,height,{crop=false}={}){
    if(!integer(width,8,LIMITS.columns)||!integer(height,8,LIMITS.rows))fail('Dimensions invalides.');
    const removed=this.room.cells.filter(cell=>cell.x>=width||cell.y>=height);
    if(removed.length&&!crop)fail(`${removed.length} bloc(s) seraient supprimés. Confirmez le recadrage.`);
    if(removed.some(cell=>cell.locked))fail('Le recadrage supprimerait un bloc verrouillé.');
    this.removeLinks(removed.map(cell=>cell.id));this.room.cells=this.room.cells.filter(cell=>!removed.includes(cell));this.room.size=[width,height];
  }
  addRoom({duplicate=false}={}){
    if(this.data.rooms.length>=LIMITS.rooms)fail('Limite de 32 salles atteinte.');
    const id=freshId('room',new Set(this.data.rooms.map(room=>room.id)));
    const room=duplicate?clone(this.room):emptyRoom(id,`Secteur ${this.data.rooms.length+1}`);
    room.id=id;if(duplicate){room.name=`${room.name} · copie`;const used=new Set(this.data.rooms.flatMap(r=>r.cells.map(c=>c.id)));for(const cell of room.cells){cell.id=freshId('cell',used);used.add(cell.id);}}
    this.data.rooms.push(room);this.data.activeRoomId=id;this.idCache=null;this.cellCache=null;return id;
  }
  deleteRoom(){if(this.data.rooms.length===1)fail('La dernière salle ne peut pas être supprimée.');const id=this.room.id;this.data.rooms=this.data.rooms.filter(room=>room.id!==id);this.data.links=this.data.links.filter(link=>link.from.roomId!==id&&link.to.roomId!==id);this.data.activeRoomId=this.data.rooms[0].id;}
  link(fromCellId,toRoomId,toCellId,bidirectional=true){const link={id:freshId('link',new Set(this.data.links.map(item=>item.id))),from:{roomId:this.room.id,cellId:fromCellId},to:{roomId:toRoomId,cellId:toCellId},bidirectional};this.data.links.push(link);return link;}
}

export const TEMPLATES=Object.freeze({corridor:'Coursive technique',shaft:'Puits de maintenance',holdout:'Défense de secteur',hangar:'Hangar de transit'});
export function applyTemplate(model,template){
  if(!Object.hasOwn(TEMPLATES,template))fail('Gabarit inconnu.');
  if(model.room.cells.some(cell=>cell.locked))fail('Déverrouillez les blocs avant de remplacer la salle.');
  model.removeLinks(model.room.cells.map(cell=>cell.id));model.room.cells=[];
  const [w,h]=model.room.size,ground=h-2;
  for(let x=0;x<w;x++)model.paint(x,ground,'floor','structure');
  model.paint(2,ground-1,'spawn','gameplay');model.paint(w-3,ground-1,'objective','gameplay');
  if(template==='shaft'){
    for(let y=ground-1;y>=4;y--)model.paint(Math.floor(w/2),y,'ladder','structure');
    for(let y=5;y<ground-3;y+=4)for(let x=Math.floor(w/2)+1;x<Math.min(w-2,Math.floor(w/2)+7);x++)model.paint(x,y,'platform','structure');
  }else if(template==='holdout'){
    for(let x=5;x<w-5;x+=5){model.paint(x,ground-1,'enemy','gameplay');model.paint(x,ground-4,'platform','structure');}
    model.paint(3,ground-1,'terminal','gameplay');
  }else if(template==='hangar'){
    model.paint(Math.floor(w/2),ground-1,'vehicle','gameplay');model.paint(w-5,ground-1,'terminal','gameplay');
  }else model.paint(Math.floor(w/2),ground-1,'terminal','gameplay');
}
