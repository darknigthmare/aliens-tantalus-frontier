/* River of Pain — deterministic simulation, no DOM or host-game save dependencies. */
(function(root){
'use strict';
const D=root.ROP_DATA || (typeof require==='function'?require('./data.js'):null);
const S=root.ROP_COLONY || (typeof require==='function'?require('./colony.js'):null);
const X=root.ROP_EXPLORATION || (typeof require==='function'?require('./exploration.js'):null);
const P=root.ROP_PASSAGES || (typeof require==='function'?require('./passages.js'):null);
const L=root.ROP_LIFE || (typeof require==='function'?require('./life.js'):null);
const F=root.ROP_DEFENSE || (typeof require==='function'?require('./defense.js'):null);
const V=root.ROP_DUCTS || (typeof require==='function'?require('./ducts.js'):null);
const M=root.ROP_MOBILITY || (typeof require==='function'?require('./mobility.js'):null);
const A=root.ROP_ARMORY || (typeof require==='function'?require('./armory.js'):null);
const physicalFloor=(s,r,body=null)=>M.floor(s,F.floor(s,r,body),body);
const rooms=new Map(D.rooms.map(r=>[r.id,r]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const clone=o=>JSON.parse(JSON.stringify(o));
const dist=(a,b)=>Math.hypot(a.x-b.x,(a.z-b.z)*600);
const pair=(a,b)=>[a,b].sort().join('|');
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const armed=c=>Boolean(D.characters[c].weapon);
const settings={story:{damage:.5,enemySpeed:.74,notice:.8},standard:{damage:1,enemySpeed:1,notice:1},nightmare:{damage:1.35,enemySpeed:1.16,notice:1.18}};
function roomDef(id){return rooms.get(id);}
function allowedPortal(portal,state){return (!portal.childOnly||D.characters[state.character].child)&&(!portal.requires||state.flags[portal.requires]);}
function route(from,to,character,flags={}){
  if(from===to)return [from];const visited=new Set([from]), queue=[[from]];
  while(queue.length){const path=queue.shift(), r=rooms.get(path[path.length-1]);if(!r)continue;
    for(const p of r.portals){if(p.childOnly&&!D.characters[character].child||p.requires&&!flags[p.requires]||visited.has(p.to))continue;
      const n=[...path,p.to];if(p.to===to)return n;visited.add(p.to);queue.push(n);}}
  return [];
}
function obstacleAt(r,x,z,radius=16,mode='hybrid'){
  if(x<38||x>r.width-38)return true;
  if(z<r.minZ-.002||z>r.maxZ+.002)return true;
  return r.cover.some(c=>Math.abs(x-c.x)<c.w/2+radius && Math.abs(z-c.z)<c.d/2+radius/700);
}
// Exact segment/AABB intersection. Padding uses the same radius as movement.
function segmentHit(r,a,b,padding=0){
 let best=null;
 for(const c of r.cover){let lo=0,hi=1,valid=true;
  for(const [key,half] of [['x',c.w/2+padding],['z',c.d/2+padding/700]]){
   const delta=b[key]-a[key],min=c[key]-half,max=c[key]+half;
   if(Math.abs(delta)<1e-10){if(a[key]<min||a[key]>max){valid=false;break;}}
   else{let t0=(min-a[key])/delta,t1=(max-a[key])/delta;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi){valid=false;break;}}
  }
  if(valid&&lo<=1&&hi>=0&&(!best||lo<best.t))best={t:Math.max(0,lo),cover:c};
 }
 return best;
}
function lineBlocked(r,a,b,padding=0){return !!segmentHit(r,a,b,padding);}
// Visibility graph of collision-expanded obstacle corners; no short-step ray gaps.
function localPath(r,a,b,mode='hybrid'){
 const radius=16,margin=radius+1,flat=mode==='classic'||r.minZ===r.maxZ;
 const end={x:b.x,z:flat?.7:b.z},minZ=flat?.7:r.minZ,maxZ=flat?.7:r.maxZ;
 const valid=p=>p.x>=42&&p.x<=r.width-42&&p.z>=minZ&&p.z<=maxZ&&!obstacleAt(r,p.x,p.z,radius,mode);
 if(!valid(end))return [];
 if(!lineBlocked(r,a,end,radius))return [end];
 const nodes=[{x:a.x,z:a.z},end];
 for(const c of r.cover)for(const x of [c.x-c.w/2-margin,c.x+c.w/2+margin])for(const z of [c.z-c.d/2-margin/700,c.z+c.d/2+margin/700]){const p={x,z};if(valid(p))nodes.push(p);}
 const distances=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),visited=new Set();distances[0]=0;
 for(let n=0;n<nodes.length;n++){
  let current=-1;for(let i=0;i<nodes.length;i++)if(!visited.has(i)&&(current<0||distances[i]<distances[current]))current=i;
  if(current<0||!Number.isFinite(distances[current]))break;if(current===1){const out=[];for(let i=1;i>0;i=previous[i])out.unshift({...nodes[i]});return out;}
  visited.add(current);
  for(let i=1;i<nodes.length;i++){if(i===current||visited.has(i)||lineBlocked(r,nodes[current],nodes[i],radius))continue;const next=distances[current]+dist(nodes[current],nodes[i]);if(next<distances[i]){distances[i]=next;previous[i]=current;}}
 }
 return [];
}
function createState(difficulty='standard',mode='hybrid'){
 const chapter=D.chapters[0], p=D.characters[chapter.character];return {schema:1,version:D.manifest.version,chapter:0,objective:0,character:chapter.character,room:chapter.start,
  systems:S.initial(),exploration:X.initial(),passages:P.initial(),life:L.initial(),defense:F.initial(),ducts:V.initial(),mobility:M.initial(),armory:A.initial(),phase:0,mode:mode==='classic'?'classic':'hybrid',difficulty:settings[difficulty]?difficulty:'standard',status:'playing',elapsed:0,
  player:{x:330,z:.7,hp:100,stamina:100,facing:1,crouch:false,noise:0,hurt:0,walk:0,ammo:p.clip,reserve:p.reserve,medkits:p.medkits,flares:p.flares,reload:0},
  world:{},pursuers:[],flags:{},archives:[],collected:[],visited:[chapter.start],doors:{},escort:null,work:null,
  stats:{shots:0,shotsHit:0,kills:0,hits:0,deaths:0,temporaryShelters:0,escorts:0,chapters:[]},log:[],power:0,finished:false};
}
function validateState(s){
 const importedVersion=s?.version;
 if(!s||typeof s!=='object'||Array.isArray(s)||s.schema!==1)throw Error('Format de sauvegarde incompatible.');
 if(!Number.isInteger(s.chapter)||s.chapter<0||s.chapter>=D.chapters.length)throw Error('Chapitre invalide.');
 if(!rooms.has(s.room)||!D.characters[s.character]||s.character!==D.chapters[s.chapter].character)throw Error('Lieu ou personnage invalide.');
 if(!Number.isInteger(s.objective)||s.objective<0||s.objective>D.chapters[s.chapter].objectives.length)throw Error('Progression invalide.');
 if(!['playing','chapterDone','dead','complete'].includes(s.status)||!settings[s.difficulty]||!['hybrid','classic'].includes(s.mode))throw Error('État de partie invalide.');
 if(!finite(s.elapsed)||s.elapsed<0||s.elapsed>1e9||!Number.isInteger(s.phase)||s.phase<0||s.phase>3)throw Error('Chronologie invalide.');
 const p=s.player,r=rooms.get(s.room);if(!p||!finite(p.x)||p.x<0||p.x>r.width||!finite(p.z)||p.z<0||p.z>1)throw Error('Position invalide.');
 for(const k of ['hp','stamina','ammo','reserve','medkits','flares','noise','hurt','walk','reload'])if(!finite(p[k])||p[k]<0||p[k]>100000)throw Error('Valeur de personnage invalide : '+k);
 if(p.hp>100||p.stamina>100||![-1,1].includes(p.facing)||typeof p.crouch!=='boolean')throw Error('État du personnage invalide.');
 if(typeof s.finished!=='boolean'||!finite(s.power)||s.power<0||s.power>100)throw Error('Systèmes de colonie invalides.');
 if(!Array.isArray(s.pursuers))s.pursuers=[];
 if(s.pursuers.length>16||s.pursuers.some(v=>!v||!rooms.has(v.from)||!rooms.has(v.to)||!finite(v.delay)||v.delay<0||v.delay>30||!v.enemy||!['adult','facehugger'].includes(v.enemy.kind)||!finite(v.enemy.hp)||v.enemy.hp<=0||v.enemy.hp>300))throw Error('Poursuite invalide.');
 for(const v of s.pursuers){v.enemy.path=[];if(!rooms.get(v.from).portals.some(p=>p.to===v.to&&!p.childOnly))throw Error('Passage de poursuite invalide.');}
 if(!s.world||typeof s.world!=='object'||Array.isArray(s.world)||Object.keys(s.world).length>D.rooms.length)throw Error('Monde invalide.');
 for(const [rid,v] of Object.entries(s.world)){
  const rr=rooms.get(rid);if(!rr||!v||!Array.isArray(v.enemies)||v.enemies.length>12||!Array.isArray(v.acid)||v.acid.length>24||!Array.isArray(v.flares)||v.flares.length>12)throw Error('État de salle invalide.');
  for(const e of v.enemies){if(!e||!finite(e.x)||e.x<0||e.x>rr.width||!finite(e.z)||e.z<0||e.z>1||!finite(e.hp)||e.hp<0||e.hp>300||!['adult','facehugger'].includes(e.kind)||!['patrol','search','chase','windup','retreat','dead'].includes(e.state))throw Error('Créature invalide.');
   for(const k of ['cooldown','notice','windup','repath','timer'])if(!finite(e[k])||e[k]<0||e[k]>100000)throw Error('Minuterie de créature invalide.'); e.path=[];}
  for(const e of [...v.acid,...v.flares])if(!finite(e.x)||!finite(e.z)||!finite(e.ttl)||e.ttl<0||e.ttl>60)throw Error('Danger invalide.');
  if(!finite(v.spawnPhase)||v.spawnPhase<0||v.spawnPhase>3)throw Error('Phase de salle invalide.');
 }
 for(const key of ['archives','collected','visited'])if(!Array.isArray(s[key])||s[key].length>400||s[key].some(x=>typeof x!=='string'||x.length>100))throw Error('Inventaire de progression invalide.');
 if(s.archives.some(x=>!D.archives.some(a=>a.id===x))||s.visited.some(x=>!rooms.has(x)))throw Error('Archive ou lieu inconnu.');
 const objIds=new Set(D.rooms.flatMap(r=>r.objects.map(o=>o.id)));if(s.collected.some(x=>!objIds.has(x)))throw Error('Objet inconnu.');
 if(!s.flags||typeof s.flags!=='object'||Array.isArray(s.flags)||Object.entries(s.flags).some(([k,v])=>k==='__proto__'||k==='constructor'||k.length>80||typeof v!=='boolean'))throw Error('Marqueur invalide.');
 const allPairs=new Set(D.rooms.flatMap(r=>r.portals.map(p=>pair(r.id,p.to))));
 if(!s.doors||typeof s.doors!=='object'||Object.entries(s.doors).some(([k,v])=>!allPairs.has(k)||!['open','sealed'].includes(v)))throw Error('Porte invalide.');
 if(s.escort&&(!rooms.has(s.escort.room)||!rooms.has(s.escort.goal)||!finite(s.escort.x)||!finite(s.escort.z)||typeof s.escort.name!=='string'||s.escort.name.length>70))throw Error('Escorte invalide.');
 if(s.escort)s.escort.path=[];
 if(!s.stats||!Array.isArray(s.stats.chapters)||s.stats.chapters.some(x=>!Number.isInteger(x)||x<0||x>=16))throw Error('Statistiques invalides.');
 for(const k of ['shots','shotsHit','kills','hits','deaths','temporaryShelters','escorts'])if(!Number.isInteger(s.stats[k])||s.stats[k]<0||s.stats[k]>1e8)throw Error('Statistique invalide.');
 if(!Array.isArray(s.log)||s.log.length>80||s.log.some(x=>typeof x!=='string'||x.length>500))throw Error('Journal invalide.');
 s.work=null;p.hurt=0;S.validateAndUpgrade(s);X.validateAndUpgrade(s);P.validateAndUpgrade(s);L.validateAndUpgrade(s);F.validateAndUpgrade(s);V.validateAndUpgrade(s);M.validateAndUpgrade(s);A.validateAndUpgrade(s);
 if(importedVersion!==D.manifest.version){
  for(const body of [p,s.escort].filter(Boolean)){if(!obstacleAt(r,body.x,body.z))continue;
   const candidates=[];for(let x=45;x<r.width-44;x+=15)for(let z=r.minZ;z<=r.maxZ+.001;z+=.025){const point={x,z:s.mode==='classic'?.7:z};if(!obstacleAt(r,point.x,point.z,20))candidates.push(point);}
   candidates.sort((a,b)=>dist(body,a)-dist(body,b));if(!candidates.length)throw Error('Aucun appui sûr pour cette ancienne sauvegarde.');Object.assign(body,candidates[0]);
   s.systems.hiding=null;s.log.unshift('Mise à niveau 0.3 : position ajustée vers l’appui libre le plus proche.');s.log=s.log.slice(0,60);
  }
 }
 return s;
}
function parseSave(text){
 if(typeof text!=='string'||text.length>1024*1024)throw Error('Fichier de sauvegarde trop volumineux.');
 const envelope=JSON.parse(text);if(envelope.id!=='river-of-pain'||envelope.schema!==1)throw Error('Ce fichier ne correspond pas à Hadley’s Hope.');
 validateState(envelope.state);if(envelope.checkpoint)validateState(envelope.checkpoint);return envelope;
}
class Simulation{
 constructor(state=createState()){this.s=validateState(clone(state));this.events=[];this.bullets=[];this.particles=[];this.cooldown=0;this.portalCooldown=0;this.board=null;this.checkpoint=clone(this.s);this.ensureRoom();}
 emit(type,detail={}){this.events.push({type,...detail});}
 notify(text){this.s.log.unshift(text);this.s.log=this.s.log.slice(0,60);this.emit('notice',{text});}
 useArmory(action){return action==='issue'?A.issue(this):action==='grenade'?A.launch(this):A.select(this,action);}
 get room(){return rooms.get(this.s.room);}
 get collisionRoom(){return physicalFloor(this.s,this.room);}
 useRover(action,id=null){return M.begin(this,action,id);}
 crossRover(to){return M.cross(this,to);}
 occluded(a,b){return lineBlocked(this.collisionRoom,a,b);}
 useDuct(id,action){return V.begin(this,id,action);}
 useDefense(id,action){return F.begin(this,id,action);}
 deployDecoy(){return L.deploy(this);}
 talkNearby(){const c=this.candidates().filter(c=>c.type==='resident'||c.ref.kind==='lore-contact').sort((a,b)=>dist(this.s.player,a.ref)-dist(this.s.player,b.ref))[0];if(c?.ref.kind==='lore-contact'){this.emit('loreContact',{id:c.ref.id});return true;}if(!c){this.notify('Approchez une personne de service pour lui parler.');return false;}return L.beginConversation(this,c.ref.id);}
 searchContainer(id,method){return L.search(this,id,method);}
 takeSupply(id,item){return L.take(this,id,item);}
 craftAt(id,recipe){return L.craft(this,id,recipe);}
 readResident(id,topic){return L.readTopic(this,id,topic);}
 roomName(id){return rooms.get(id)?.name||id;}
 trackJob(id){if(id!==null&&(!X.jobs.has(id)||X.jobStep(this.s,id)===3))return false;this.s.exploration.trackedJob=id;this.emit('save');return true;}
 get tracked(){return X.tracked(this.s);}
 get chapter(){return D.chapters[this.s.chapter];}
 get objective(){return this.chapter.objectives[this.s.objective]||null;}
 get character(){return D.characters[this.s.character];}
 ensureRoom(id=this.s.room,safePoint=this.s.player){
  const s=this.s,r=rooms.get(id); if(!s.world[r.id])s.world[r.id]={enemies:[],acid:[],flares:[],spawnPhase:0};
  const w=s.world[r.id];const threat=['service','pump','stores','power','med','science','hive','coolant','survey','hangar','wash','mess','concourse','road'];
  if(s.phase>=2&&w.spawnPhase<s.phase&&threat.includes(r.id)){
   const count=r.kind==='hive'?2:1;
   for(let i=0;i<count;i++){
    const anchor=r.spawns[i]; if(dist(anchor,safePoint)<480||obstacleAt(F.floor(s,r),anchor.x,s.mode==='classic'?.7:anchor.z,18,s.mode))continue;
    const kind=(r.id==='med'||r.id==='wash')?'facehugger':'adult';
    w.enemies.push({id:r.id+'-'+s.phase+'-'+i,x:anchor.x,z:s.mode==='classic'?.7:anchor.z,hp:kind==='adult'?72:24,kind,
     state:'patrol',facing:i?1:-1,notice:0,cooldown:0,windup:0,repath:0,path:[],timer:0,origin:{x:anchor.x,z:anchor.z}});
   }
   w.spawnPhase=s.phase;
  }
  return w;
 }
 move(body,dx,dz,speed,dt){
  const r=physicalFloor(this.s,this.room,body);if(r.minZ===r.maxZ||this.s.mode==='classic')dz=0;
  const mag=Math.hypot(dx,dz);if(mag>1){dx/=mag;dz/=mag;}
  const nx=clamp(body.x+dx*speed*dt,42,r.width-42),nz=clamp(body.z+dz*speed*dt/600,r.minZ,r.maxZ);
  if(!obstacleAt(r,nx,body.z,14,this.s.mode))body.x=nx;
  if(!obstacleAt(r,body.x,nz,14,this.s.mode))body.z=nz;
 }
 near(a,b,threshold=96){return Math.abs(a.x-b.x)<threshold&&(this.s.mode==='classic'||Math.abs(a.z-b.z)<.14);}
 candidates(){
  const s=this.s,p=s.player,r=this.room;if(s.status!=='playing'||s.passages.transit)return [];
  if(M.mounted(s))return M.candidates(this);
  const out=[];
  for(const o of r.objects){
   if(o.phaseMax!==undefined&&s.phase>o.phaseMax)continue;
   if(o.kind==='side-task'&&!X.available(s,o))continue;
   if(o.chapter!==undefined&&(o.chapter!==s.chapter||o.id!==this.objective?.id))continue;
   if(s.collected.includes(o.id)||o.kind==='archive'&&s.archives.includes(o.id))continue;
   if(s.escort&&o.id===s.escort.task)continue;
   if(this.near(p,o,105))out.push({type:'object',ref:o,priority:o.kind==='lore-contact'?4.2:o.chapter!==undefined?0:o.kind==='side-task'?.7:o.kind==='archive'?1:o.kind==='hide'?4:2,label:o.label});
  }
  for(const v of r.portals)if(this.near(p,v,90)){
   const blocked=v.childOnly&&!this.character.child;
   const locked=v.requires&&!s.flags[v.requires];const sealed=s.doors[pair(r.id,v.to)]==='sealed';
   out.push({type:'portal',ref:v,priority:blocked||locked?6:3,label:blocked?'Conduit trop étroit':locked?(v.lockReason||'Accès scientifique verrouillé'):sealed?'Désouder · '+rooms.get(v.to).name:rooms.get(v.to).name,blocked,locked,sealed});
  }
  out.push(...L.candidates(this),...F.candidates(this),...V.candidates(this),...M.candidates(this));
  // When standing on a threshold or an object, a different interaction 90 px away
  // must not steal E. In classic mode, use the same projected depth as the player.
  const distance=o=>Math.hypot(p.x-o.x,s.mode==='classic'?0:(p.z-o.z)*600);
  return out.sort((a,b)=>Number(distance(b.ref)<=28)-Number(distance(a.ref)<=28)||a.priority-b.priority||distance(a.ref)-distance(b.ref));
 }
 interact(){
  if(this.s.armory.projectiles.length){this.notify('Attendez l’impact avant de manipuler un poste.');return;}
  if(this.s.status!=='playing'||this.s.work||this.portalCooldown>0||this.s.passages.transit)return;
  this.s.passages.listening=null;
  if(this.s.systems.hiding){this.hide();return;}
  const c=this.candidates()[0];if(!c){this.notify('Approchez-vous d’une porte, d’un poste ou d’un objet.');return;}
  if(c.type==='mobility'||c.type==='mobilityStation'){this.emit('roverPanel',{id:c.type==='mobilityStation'?c.ref.id:null});return;}
  if(c.type==='duct'){this.emit('ductPanel',{id:c.ref.id});return;}
  if(c.type==='defense'){this.emit('defense',{id:c.ref.id});return;}
  if(c.type==='resident'){L.beginConversation(this,c.ref.id);return;}
  if(c.type==='container'){this.emit('container',{id:c.ref.id});return;}
  if(c.type==='bench'){this.emit('bench',{id:c.ref.id});return;}
  if(c.type==='portal'){
   if(c.blocked){this.notify('Ce conduit ne laisse passer qu’un enfant.');return;}
   if(c.locked){this.notify(c.ref.lockReason||'La Compagnie a réservé cet accès. Il faut obtenir l’autorisation.');return;}
   if(c.sealed){this.s.work={kind:'unseal',id:pair(this.s.room,c.ref.to),timer:0,duration:1.25,x:this.s.player.x,z:this.s.player.z};return;}
   this.requestPassage(c.ref);return;
  }
  const o=c.ref;
  if(o.kind==='lore-contact'){this.emit('loreContact',{id:o.id});return;}
  if(o.kind==='armory'){this.emit('armoryPanel');return;}
  if(o.kind==='inspection'){this.emit('inspection',{id:o.id});return;}
  if(o.kind==='side-task'){this.s.work={kind:'side',id:o.id,timer:0,duration:o.duration,x:this.s.player.x,z:this.s.player.z};return;}
  if(o.kind==='hide'){this.hide(o);return;}
  if(D.boards[o.id]){this.board=o.id;S.boardState(this.s,o.id);this.emit('board',{id:o.id});return;}
  if(o.kind==='archive'){
   this.s.archives.push(o.id);this.emit('archive',{id:o.id});this.notify('Document conservé : '+o.label);this.emit('save');return;
  }
  if(o.kind==='pickup'){
   this.s.collected.push(o.id);if(armed(this.s.character)){this.s.player.reserve+=30;this.s.player.medkits++;}else if(!this.character.child){this.s.player.medkits++;this.s.player.flares++;}else this.s.player.hp=clamp(this.s.player.hp+15,0,100);
   this.notify('Réserve récupérée.');this.emit('save');return;
  }
  if(o.kind==='escort'){
   if(o.grantFlag)this.s.flags[o.grantFlag]=true;
   this.s.escort={name:o.escortName,room:this.s.room,x:o.x-60,z:o.z,goal:o.escortTo,task:o.id,path:[],repath:0,walk:0,hp:100,panic:0,order:'follow',hurt:0};
   this.notify(o.escortName+' vous suit. Destination : '+rooms.get(o.escortTo).name+'.');this.emit('save');return;
  }
  this.s.work={kind:'task',id:o.id,timer:0,duration:['power','seal','valve'].includes(o.kind)?2.2:.9,x:this.s.player.x,z:this.s.player.z};
 }
 enter(portal){
  if(M.mounted(this.s)){this.notify('Arrêtez-vous et utilisez la cabine : cette porte n’est pas un accès routier.');return false;}
  const s=this.s;portal=this.room.portals.find(p=>p.id===portal?.id);if(!portal||s.status!=='playing'||s.systems.hiding||!this.near(s.player,portal,100))return false;if(!allowedPortal(portal,s)||s.doors[pair(s.room,portal.to)]==='sealed')return false;
  if(s.escort&&s.escort.room===s.room&&(s.escort.order==='wait'||dist(s.escort,s.player)>210)){this.notify(s.escort.order==='wait'?'Rappelez votre compagnon avant de passer.':'Votre compagnon doit vous rejoindre avant de passer.');return false;}
  const old=s.room, oldWorld=this.ensureRoom(), dest=rooms.get(portal.to),back=dest.portals.find(p=>p.to===old);if(!back)return false;
  if(!portal.childOnly&&dest.kind!=='vent'){
   const chasers=oldWorld.enemies.filter(e=>e.hp>0&&e.notice>.52&&dist(e,s.player)<950).slice(0,2);
   for(const e of chasers){if(s.pursuers.length<16){s.pursuers.push({from:old,to:dest.id,delay:2.5,enemy:{...clone(e),bash:null}});oldWorld.enemies=oldWorld.enemies.filter(v=>v.id!==e.id);}}
   if(chasers.length)this.notify('Du mouvement derrière la porte. Ne restez pas au seuil.');
  }
  s.passages.transit=null;s.passages.listening=null;s.room=dest.id;s.exploration.aiming=false; s.systems.hiding=null;this.board=null; s.player.x=clamp(back.x+(back.x<dest.width/2?75:-75),45,dest.width-45);
  s.player.z=s.mode==='classic'?.7:clamp(back.z,dest.minZ,dest.maxZ);
  if(obstacleAt(dest,s.player.x,s.player.z)){s.player.x=back.x;s.player.z=clamp(back.z,dest.minZ,dest.maxZ);}
  if(s.escort){s.escort.room=dest.id;s.escort.x=s.player.x+(s.player.x<dest.width/2?-45:45);s.escort.z=s.player.z;s.escort.path=[];}
  if(!s.visited.includes(dest.id))s.visited.push(dest.id);
  s.work=null;this.bullets=[];this.portalCooldown=.7;this.ensureRoom();this.emit('room',{from:old,to:dest.id,kind:portal.kind});this.emit('save');return true;
 }
 toggleDoor(){if(this.s.work||this.s.status!=='playing'||this.character.child||this.s.passages.transit)return;const c=this.candidates().find(c=>c.type==='portal'&&!c.blocked&&!c.locked);if(!c)return;
  if(!this.s.flags.welder){this.notify('Il faut un poste à souder.');return;}
  const k=pair(this.s.room,c.ref.to);this.s.work={kind:this.s.doors[k]==='sealed'?'unseal':'weld',id:k,timer:0,duration:1.25,x:this.s.player.x,z:this.s.player.z};}
 completeTask(id){
  if(M.mounted(this.s))return false;
  const s=this.s,t=this.objective;if(s.status!=='playing'||!t||t.id!==id||(s.room!==t.room&&rooms.get(t.room).objects.find(o=>o.id===id)?.kind!=='escort'))return false;
  const physical=rooms.get(t.room).objects.find(o=>o.id===id);if(physical.kind==='escort'&&s.room!==physical.escortTo)return false;if(physical.kind!=='escort'&&!this.near(s.player,physical,110))return false;
  if(D.boards[id]&&!S.boardState(s,id).solved)return false;
  const o=rooms.get(t.room).objects.find(o=>o.id===id);if(o.grantFlag)s.flags[o.grantFlag]=true;
  if(D.boards[id]){s.flags[id]=true;if(o.kind==='power'){s.power++;s.systems.circuits[D.boards[id].circuit]=s.phase;}}
  if(D.doorTasks[id]){const k=pair(...D.doorTasks[id]);s.doors[k]=id==='vent_open'?'open':'sealed';s.systems.doorIntegrity[k]=100;this.emit('bulkhead',{id:k});}
  if(o.kind==='seal')s.flags['reinforced-'+t.room]=true;
  if(id==='welding')s.flags.welder=true;
  if(id==='shelter')s.stats.temporaryShelters++;
  if(id==='newt_escape')s.flags.newtInVents=true;
  if(id==='departure')s.flags.fourDeparted=true;
  if(id==='tractor')this.notify('Le tracteur attend sur la piste, près du garage. Touche 5 : cabine. La route reste ouverte à pied.');
  if(id==='locker'){s.player.ammo=30;s.player.reserve=90;}
  s.collected.push(id);s.objective++;this.notify('Objectif accompli · '+o.label);this.emit('objective',{id});
  if(s.objective===this.chapter.objectives.length){s.passages.transit=null;s.passages.listening=null;s.stats.chapters.push(s.chapter);s.status=s.chapter===D.chapters.length-1?'complete':'chapterDone';
   if(s.status==='complete'){s.finished=true;this.emit('complete');}else this.emit('chapterDone');}
  this.emit('save');return true;
 }
 nextChapter(){
  const s=this.s;if(s.status!=='chapterDone')return false;
  M.parkForChapter(this);const from=s.character,lastGear=s.player;s.systems.loadouts[from]={ammo:lastGear.ammo,reserve:lastGear.reserve,medkits:lastGear.medkits,flares:lastGear.flares,hp:lastGear.hp,battery:s.systems.battery};s.chapter++;s.objective=0;const c=this.chapter;
  s.passages.transit=null;s.passages.listening=null;s.character=c.character;s.room=c.start;s.phase=c.phase;s.status='playing';s.work=null;s.escort=null;s.systems.hiding=null;s.systems.tracker=false;this.board=null;
  const def=this.character; const last={...s.player};
  s.player={x:330,z:.7,hp:Math.max(last.hp,70),stamina:100,facing:1,crouch:false,noise:0,hurt:0,walk:0,ammo:def.clip,reserve:def.reserve,medkits:def.medkits,flares:def.flares,reload:0};
  const remembered=s.systems.loadouts[s.character];if(remembered){for(const k of ['ammo','reserve','medkits','flares'])s.player[k]=remembered[k];s.player.hp=Math.max(remembered.hp,70);s.systems.battery=remembered.battery;}else{s.player.hp=100;s.systems.battery=100;}s.systems.flashlight=false;
  if(!s.visited.includes(s.room))s.visited.push(s.room);this.bullets=[];this.ensureRoom();this.checkpoint=clone(s);this.emit('chapter',{index:s.chapter});this.emit('save');return true;
 }
 retry(){const deaths=this.s.stats.deaths+1;this.s=clone(this.checkpoint);this.s.stats.deaths=deaths;this.s.status='playing';this.s.work=null;this.s.systems.failReason='';this.board=null;this.bullets=[];this.events=[];this.cooldown=0;this.portalCooldown=0;this.ensureRoom();this.emit('room',{to:this.s.room});this.emit('save');}
 setMode(mode){if(this.s.armory.projectiles.length){this.notify('Attendez l’impact avant de changer la projection.');return false;}if(M.mounted(this.s)){this.notify('Changez de présentation après être descendu du tracteur.');return false;}if(!['classic','hybrid'].includes(mode)||this.s.passages.transit)return false;
  if(mode==='classic'&&[this.s.player,this.s.escort].filter(Boolean).some(b=>obstacleAt(F.floor({...this.s,mode},this.room),b.x,.7,14,mode))){this.notify('Éloignez-vous de la largeur du volet avant de passer en vue classique.');return false;}
  this.s.passages.listening=null;this.s.mode=mode;
  if(mode==='classic'){this.s.player.z=.7;if(this.s.escort)this.s.escort.z=.7;for(const [rid,w] of Object.entries(this.s.world))for(const e of w.enemies){e.z=.7;e.path=[];e.repath=0;e.bash=null;const r=F.floor(this.s,rooms.get(rid),e);if(obstacleAt(r,e.x,e.z,14,mode)){const xs=[];for(let offset=10;offset<r.width;offset+=10){for(const x of [e.x-offset,e.x+offset])if(!obstacleAt(r,x,.7,14,mode))xs.push(x);if(xs.length)break;}if(xs.length)e.x=xs[0];}}for(const d of [...this.s.life.devices,...this.s.life.debris])d.z=.7;}
  else this.s.player.z=clamp(this.s.player.z,this.room.minZ,this.room.maxZ);
  this.bullets=[];this.s.work=null;this.emit('save');return true;}
 fire(){if(A.active(this.s)==='flame')return A.flame(this);const s=this.s,p=s.player;if(s.status!=='playing'||!armed(s.character)||p.reload>0||this.cooldown>0||s.work||s.systems.hiding||s.passages.transit)return false;
  if(p.ammo<=0){this.reload();return false;}this.s.passages.listening=null;p.ammo--;p.noise=1;s.stats.shots++;this.cooldown=.17;
  const a=s.exploration.aiming?s.exploration.aim:{x:p.facing,z:0};
  this.bullets.push({x:p.x+a.x*31,z:p.z+a.z*31/600,vx:a.x,vz:a.z,dir:p.facing,ttl:.8,previous:p.x,previousZ:p.z,damage:26});this.emit('shot');return true;}
 reload(){if(A.active(this.s)==='flame')return false;if(this.s.passages.transit)return false;const p=this.s.player;if(!armed(this.s.character)||p.reload||p.ammo>=30||p.reserve<=0)return false;p.reload=1.7;this.emit('reload');return true;}
 heal(){if(this.s.passages.transit)return false;const p=this.s.player;if(this.s.status!=='playing'||p.medkits<=0||p.hp>=100)return false;p.medkits--;p.hp=clamp(p.hp+40,0,100);this.emit('save');this.notify('Soin appliqué.');return true;}
 flare(){const s=this.s,p=s.player;if(s.status!=='playing'||p.flares<=0||this.character.child||s.systems.hiding||s.passages.transit)return false;
  s.passages.listening=null;
  p.flares--;this.ensureRoom().flares.push({x:clamp(p.x+p.facing*150,45,this.room.width-45),z:p.z,ttl:18});p.noise=.65;this.emit('flare');this.emit('save');return true;}
 hit(damage){if(M.mounted(this.s)&&this.s.mobility.rover.hp>0){M.damage(this,damage*settings[this.s.difficulty].damage,'attack');return;}const s=this.s,p=s.player;if(p.hurt>0||s.status!=='playing')return;p.hp=clamp(p.hp-damage*settings[s.difficulty].damage,0,100);p.hurt=1.1;s.stats.hits++;s.work=null;this.cancelPassage(false);s.passages.listening=null;this.emit('hit');
  if(p.hp<=0){s.status='dead';this.emit('dead');}}
 update(dt,input={}){
  dt=clamp(dt,0,1/20);const s=this.s;if(s.status!=='playing')return;
  A.update(this,dt);if(s.status!=='playing')return;
  L.updateDevices(this,dt);F.updateAlarms(this,dt);V.update(this,dt);
  const transit=s.passages.transit;
  if(transit?.stage==='travel'){s.elapsed+=dt;this.updatePassage(dt);return;}
  if(transit){if(input.x||input.z){this.cancelPassage();}else input={};}
  const driving=M.update(this,dt,input);if(driving)input={};
  const p=s.player,w=this.ensureRoom(),tune=settings[s.difficulty];let r=this.collisionRoom;
  if(s.systems.hiding&&(input.x||input.z)){this.hide();}
  if(s.systems.hiding)input={...input,crouch:true,fire:false,sprint:false};s.elapsed+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.portalCooldown=Math.max(0,this.portalCooldown-dt);
  p.hurt=Math.max(0,p.hurt-dt);p.noise=Math.max(0,p.noise-dt*.42);
  if(p.reload>0){p.reload=Math.max(0,p.reload-dt);if(p.reload===0){const n=Math.min(30-p.ammo,p.reserve);p.ammo+=n;p.reserve-=n;this.emit('loaded');}}
  this.updateColony(dt);this.updateExploration(dt);
  p.crouch=!!input.crouch;let speed=this.character.child?200:250;const moving=!input.aimHold&&!!(input.x||input.z);
  if(input.sprint&&!p.crouch&&p.stamina>0&&moving){speed*=1.45;p.stamina=Math.max(0,p.stamina-dt*21);p.noise=Math.max(p.noise,.7);}else p.stamina=clamp(p.stamina+dt*15,0,100);
  if(p.crouch)speed*=.53;if(input.x)p.facing=input.x>0?1:-1;
  if(input.aimX!==undefined||input.aimZ!==undefined)this.setAim(input.aimX||0,input.aimZ||0);else{s.exploration.aiming=false;s.exploration.aim={x:p.facing,z:0};}
  const oldX=p.x,oldZ=p.z;if(!driving)this.move(p,input.aimHold?0:input.x||0,input.aimHold?0:input.z||0,speed,dt);
  if(Math.abs(oldX-p.x)+Math.abs(oldZ-p.z)>0.001){p.walk+=dt*speed/18;p.noise=Math.max(p.noise,p.crouch?.03:.22);}
  if(input.fire)this.fire();
  L.updateWork(this);F.updateWork(this);V.updateWork(this);L.updateResidents(this,dt);
  if(s.work){
   if(dist(p,s.work)>38){s.work=null;this.notify('Action interrompue.');}
   else {s.work.timer+=dt;if(s.work.timer>=s.work.duration){const task=s.work;s.work=null;if(task.kind==='unseal'||task.kind==='weld'){s.doors[task.id]=task.kind==='weld'?'sealed':'open';s.systems.doorIntegrity[task.id]=100;this.notify(task.kind==='weld'?'Porte soudée.':'Porte libérée.');this.emit('save');}else if(task.kind==='armory'){A.finish(this);}else if(task.kind==='mobility'){M.finish(this,task);}else if(task.kind==='duct'){V.finish(this,task);}else if(task.kind==='defense'){F.finish(this,task);}else if(task.kind.startsWith('life-')){L.finishWork(this,task);}else if(task.kind==='side'){const o=this.room.objects.find(o=>o.id===task.id);if(o)X.advance(this,o);}else this.completeTask(task.id);}}
  }
  r=this.collisionRoom;
  // Pursuers use the same actual door connection. Sealing it holds them on the far side.
  for(const chase of s.pursuers){if(s.doors[pair(chase.from,chase.to)]==='sealed'){const k=pair(chase.from,chase.to);if(s.phase>=2){s.systems.doorIntegrity[k]=Math.max(0,(s.systems.doorIntegrity[k]??100)-dt*(s.difficulty==='nightmare'?6:s.difficulty==='story'?3:4.5));if(s.systems.doorIntegrity[k]===0){s.doors[k]='open';if(s.room===chase.to||s.room===chase.from){this.notify('La soudure cède. Éloignez-vous de la porte !');this.emit('breach');}}}continue;}chase.delay=Math.max(0,chase.delay-dt);if(chase.delay===0){
    const dest=rooms.get(chase.to),back=dest.portals.find(p=>p.to===chase.from);
    if(!s.world[dest.id])s.world[dest.id]={enemies:[],acid:[],flares:[],spawnPhase:0};
    const e=chase.enemy;e.bash=null;e.x=back.x;e.z=s.mode==='classic'?.7:back.z;e.path=[];e.notice=.7;e.state='chase';e.cooldown=.6;e.windup=0;e.repath=0;e.timer=0;e.facing=e.x<dest.width/2?1:-1;e.memory={x:e.x,z:e.z,ttl:0};
    if(s.world[dest.id].enemies.length<12&&!s.world[dest.id].enemies.some(v=>v.id===e.id))s.world[dest.id].enemies.push(e);chase.delivered=true;
    if(s.room===dest.id)this.notify('La porte ne les a pas arrêtés.');
  }}s.pursuers=s.pursuers.filter(p=>!p.delivered);
  for(const f of w.flares)f.ttl-=dt;w.flares=w.flares.filter(f=>f.ttl>0);
  for(const acid of w.acid){acid.ttl-=dt;if(Math.abs(p.x-acid.x)<38&&Math.abs(p.z-acid.z)<.08)this.hit(12);}w.acid=w.acid.filter(a=>a.ttl>0);
  for(const b of this.bullets){
   b.previous=b.x;b.previousZ=b.z;b.x+=b.vx*1120*dt;b.z+=b.vz*1120*dt/600;b.ttl-=dt;
   const a={x:b.previous,z:b.previousZ},len2=(b.x-a.x)**2+((b.z-a.z)*600)**2;
   const barrier=segmentHit(this.collisionRoom,a,b);let enemyHit=null;
   for(const e of w.enemies){if(e.hp<=0)continue;
    const t=clamp(((e.x-a.x)*(b.x-a.x)+(e.z-a.z)*(b.z-a.z)*360000)/(len2||1),0,1);
    if(dist(e,{x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t})<21&&(!enemyHit||t<enemyHit.t))enemyHit={e,t};
   }
   if(barrier&&(!enemyHit||barrier.t<=enemyHit.t)){b.ttl=0;if(barrier.cover.type==='shutter')F.damage(this,barrier.cover.id,D.defense.rules.shutterBulletDamage,'bullet');else if(barrier.cover.type==='rover')M.damage(this,4,'bullet');}
   else if(enemyHit&&b.ttl>0){const e=enemyHit.e;e.hp=Math.max(0,e.hp-b.damage);e.notice=1;e.state='chase';e.memory={x:p.x,z:p.z,ttl:8};s.stats.shotsHit++;b.ttl=0;this.emit('impact',{x:e.x,z:e.z});
    if(e.hp===0){e.state='dead';e.bash=null;e.ductEntry=null;s.stats.kills++;w.acid.push({x:e.x,z:e.z,ttl:25});this.emit('kill');}}

  }
  this.bullets=this.bullets.filter(b=>b.ttl>0&&b.x>0&&b.x<r.width&&b.z>=r.minZ-.08&&b.z<=r.maxZ+.08);
  r=this.collisionRoom;
  for(const e of w.enemies){
   if(e.hp<=0)continue;e.cooldown=Math.max(0,e.cooldown-dt);e.timer+=dt;e.repath=Math.max(0,e.repath-dt);
   if(M.driveEnemy(this,e,dt,tune))continue;
   const d=dist(e,p),fl=w.flares.find(f=>dist(f,e)<320);const sight=!s.systems.hiding&&d<(p.crouch?245:S.isPowered(s,r)||s.systems.flashlight?610:400)*tune.notice&&!lineBlocked(r,e,p);
   const heard=!s.systems.hiding&&d<p.noise*850;const sees=sight||heard;
   const memory=X.enemyMemory(e);memory.ttl=Math.max(0,memory.ttl-dt);
   if(sees||s.systems.hiding&&e.sawHide){memory.x=p.x;memory.z=p.z;memory.ttl=8;}
   if(!sees&&memory.ttl===0)e.notice=Math.min(e.notice,.45);
   if(fl){e.state='retreat';e.notice=Math.max(0,e.notice-dt);e.path=[];e.bash=null;this.move(e,e.x<fl.x?-1:1,0,165*tune.enemySpeed,dt);continue;}
   if(sees)e.notice=clamp(e.notice+dt*(heard?1.2:1.55),0,1);else e.notice=Math.max(0,e.notice-dt*.18);
   if(!sees&&memory.ttl>0&&(e.state==='chase'||e.state==='windup'||e.bash))e.notice=Math.max(e.notice,.55);
   if(e.state==='windup'){
    e.windup=Math.max(0,e.windup-dt);if(e.windup===0){if(d<80&&!lineBlocked(r,e,p)&&!s.systems.hiding)this.hit(e.kind==='adult'?30:20);else if(s.escort&&dist(e,s.escort)<80&&!lineBlocked(r,e,s.escort))this.hitEscort(e.kind==='adult'?24:16);e.cooldown=1.15;e.state='chase';}continue;}
   const exposedEscort=s.escort&&dist(e,s.escort)<200&&!lineBlocked(r,e,s.escort);if(exposedEscort){e.notice=Math.max(e.notice,.65);Object.assign(memory,{x:s.escort.x,z:s.escort.z,ttl:8});}
   // An audible decoy never overrides direct perception of a person.
   if(!sees&&!exposedEscort&&!(s.systems.hiding&&e.sawHide)){
    const lure=L.attractor(this,e)||F.attractor(this,e);
    if(lure){if(dist(e,lure)<54&&!this.occluded(e,lure)){if(lure.alarm)F.silence(this,lure.id);else L.discardDevice(this,lure,'destroyed');e.notice=.3;memory.ttl=2;e.path=[];e.repath=0;}
     else{Object.assign(memory,{x:lure.x,z:lure.z,ttl:4});e.notice=Math.max(e.notice,.65);e.repath=0;}}
   }
   if(V.entry(this,e,dt,sees||exposedEscort||!!(s.systems.hiding&&e.sawHide)))continue;
   if(F.breakThrough(this,e,dt,memory))continue;
   if(e.notice>.52){e.state='chase';if((!s.systems.hiding&&d<63||exposedEscort&&dist(e,s.escort)<63)&&e.cooldown<=0){e.state='windup';e.windup=.65;continue;}
    if(e.repath<=0){e.path=localPath(physicalFloor(s,this.room,e),e,memory,s.mode);e.repath=.65;}
    F.follow(this,e,e.path,(e.kind==='adult'?138:183)*tune.enemySpeed,dt);
   }else{
    e.state=e.notice>.12?'search':'patrol';const dx=e.facing;const before=e.x;this.move(e,dx,0,45,dt);
    if(Math.abs(e.x-before)<.01||e.x<100||e.x>r.width-100||e.timer>5.7){e.facing*=-1;e.timer=0;}
   }
  }
  if(s.escort&&s.escort.room===s.room){
   const e=s.escort;e.repath=Math.max(0,(e.repath||0)-dt);
   if(e.order!=='wait'&&dist(e,p)>68){if(e.repath===0){e.path=localPath(r,e,p,s.mode);e.repath=.6;}F.follow(this,e,e.path,e.panic>75?170:222,dt);e.walk=(e.walk||0)+dt*12;}
   if(e.hp>0&&s.room===e.goal&&dist(e,p)<170){const task=e.task;s.escort=null;s.stats.escorts++;this.completeTask(task);}
  }
  this.updateListening(dt);
  if(s.status==='playing')this.updatePassage(dt);
 }
 setAim(x,z){if(this.s.mode==='classic'||this.room.minZ===this.room.maxZ)z=0;if(Math.hypot(x,z)<.01){x=this.s.player.facing;z=0;}
  const angle=Math.round(Math.atan2(z,x)/(Math.PI/4))*Math.PI/4;this.s.exploration.aim={x:Math.cos(angle),z:Math.sin(angle)};this.s.exploration.aiming=true;if(Math.abs(x)>.1)this.s.player.facing=x<0?-1:1;return this.s.exploration.aim;}
 updateExploration(dt){const s=this.s,a=s.exploration,r=this.room,w=this.ensureRoom();
  for(const def of D.encounters){if(def.room!==s.room||s.phase<def.minPhase)continue;let v=a.encounters[def.id];
   if(!v&&s.player.x>=def.triggerX){v=a.encounters[def.id]={stage:'warning',remaining:def.warning};this.notify(def.label);this.emit('environment',{kind:def.type});this.emit('save');}
   if(!v||v.stage==='done')continue;v.remaining=Math.max(0,v.remaining-dt);if(v.remaining>0)continue;
   if(def.type==='intrusion'){
    const anchor={x:def.spawnX,z:s.mode==='classic'?.7:def.spawnZ};if(obstacleAt(this.collisionRoom,anchor.x,anchor.z,18,s.mode))continue;
    // No spawning on a player/escort or replacing an existing living actor.
    if(dist(anchor,s.player)<380||s.escort&&dist(anchor,s.escort)<380||w.enemies.filter(e=>e.hp>0).length>=6){v.remaining=.25;continue;}
    w.enemies=w.enemies.filter(e=>e.hp>0);w.enemies.push({id:def.id,x:anchor.x,z:anchor.z,hp:def.kind==='adult'?72:24,kind:def.kind,state:'search',facing:-1,notice:.25,cooldown:1.2,windup:0,repath:0,path:[],timer:0,origin:{...anchor},memory:{...anchor,ttl:0}});this.emit('breach');
   }
   v.stage='done';v.remaining=0;this.emit('save');
  }
 }
 canUseBoard(id){return this.s.status==='playing'&&!this.s.systems.hiding&&this.objective?.id===id&&D.boards[id]?.room===this.s.room&&this.near(this.s.player,this.room.objects.find(o=>o.id===id),110);}
 boardToggle(id,index){if(!this.canUseBoard(id)||this.s.work||!Number.isInteger(index)||index<0||index>=D.boards[id].channels.length)return false;const b=S.boardState(this.s,id);b.switches[index]=!b.switches[index];b.solved=false;this.emit('switch');return true;}
 boardSubmit(id){if(!this.canUseBoard(id)||this.s.work)return false;const reading=S.boardReading(this.s,id),b=S.boardState(this.s,id);b.attempts++;if(!reading.correct){this.emit('boardRejected',{id,overload:reading.overload});return false;}b.solved=true;this.board=null;this.s.work={kind:'task',id,timer:0,duration:1.4,x:this.s.player.x,z:this.s.player.z};this.emit('switch');return true;}
 hide(o=null){const s=this.s;if(s.status!=='playing'||s.work||s.passages.transit)return false;s.passages.listening=null;if(s.systems.hiding){s.systems.hiding=null;s.systems.exposedFor=0;this.notify('Vous quittez la cachette.');return true;}
  o=o||this.room.objects.find(v=>v.kind==='hide'&&this.near(s.player,v,95));if(!o||o.kind!=='hide'||!this.near(s.player,o,110))return false;
  s.systems.hiding=o.id;s.systems.flashlight=false;s.systems.tracker=false;s.systems.exposedFor=0;s.player.noise=0;s.player.crouch=true;
  for(const e of this.ensureRoom().enemies)e.sawHide=e.hp>0&&e.notice>.5&&dist(e,s.player)<350&&!this.occluded(e,s.player);
  this.notify('À couvert. E ou une direction pour sortir.');this.emit('save');return true;}
 toggleLight(){if(this.s.passages.transit)return false;if(this.s.status!=='playing'||this.s.systems.hiding)return false;const a=this.s.systems;if(a.battery<=0){this.notify('Lampe déchargée. Coupez-la pour récupérer une faible réserve.');return false;}a.flashlight=!a.flashlight;this.emit('switch');return true;}
 toggleTracker(){if(this.s.passages.transit)return false;if(this.s.status!=='playing'||!this.character.weapon||this.s.systems.hiding)return false;this.s.systems.tracker=!this.s.systems.tracker;this.s.systems.trackerTimer=0;return true;}
 primeThreshold(portal){const back=rooms.get(portal.to)?.portals.find(p=>p.to===this.s.room);if(back)this.ensureRoom(portal.to,{x:back.x,z:this.s.mode==='classic'?.7:back.z});}
 trackerContacts(){
  const s=this.s,p=s.player;
  const contacts=this.ensureRoom().enemies.filter(e=>e.hp>0&&dist(e,p)<1050).map(e=>({id:e.id,x:e.x,z:e.z,distance:dist(e,p),remote:false}));
  for(const portal of this.room.portals){if(!allowedPortal(portal,s)||s.doors[pair(s.room,portal.to)]==='sealed'||dist(p,portal)>500)continue;
   const back=rooms.get(portal.to).portals.find(q=>q.to===s.room),w=s.world[portal.to];if(!back||!w)continue;
   for(const e of w.enemies){const distance=dist(p,portal)+dist(e,back)+220;if(e.hp>0&&distance<1300)contacts.push({id:e.id,x:portal.x,z:s.mode==='classic'?.7:portal.z,distance,remote:true,via:portal.to});}}
  contacts.push(...V.contacts(this));
  const ids=new Set();return contacts.filter(c=>!ids.has(c.id)&&ids.add(c.id));
 }
 commandEscort(order){if(this.s.passages.transit)return false;const e=this.s.escort;if(!e||!['follow','wait','rally'].includes(order)||this.s.status!=='playing')return false;
  if(order==='rally'){if(dist(e,this.s.player)>230||this.s.player.stamina<15){this.notify('Rapprochez-vous pour rassurer votre compagnon.');return false;}e.panic=Math.max(0,e.panic-45);this.s.player.stamina-=15;}
  else e.order=order;this.notify(order==='wait'?'Attendez ici, à couvert.':order==='follow'?'Suivez-moi. On reste ensemble.':'Respirez. Je suis juste là.');this.emit('save');return true;}
 healEscort(){if(this.s.passages.transit)return false;const e=this.s.escort,p=this.s.player;if(this.s.status!=='playing'||!e||e.hp>=100||dist(e,p)>210||p.medkits<1)return false;p.medkits--;e.hp=Math.min(100,e.hp+40);e.panic=Math.max(0,e.panic-20);this.emit('save');return true;}
 hitEscort(damage){const e=this.s.escort;if(!e||e.hurt>0||this.s.status!=='playing')return;e.hp=Math.max(0,e.hp-damage*settings[this.s.difficulty].damage);e.hurt=1.3;e.panic=Math.min(100,e.panic+25);this.cancelPassage(false);this.emit('hit');if(e.hp===0){this.s.systems.failReason='Votre compagnon ne peut plus continuer. Reprenez l’escorte au point de contrôle.';this.s.passages.listening=null;this.s.passages.transit=null;this.s.status='dead';this.emit('dead');}}
 dropMarker(){if(this.s.passages.transit)return false;if(this.s.status!=='playing')return false;const a=this.s.systems,p=this.s.player;if(a.markers.length>=12)a.markers.shift();a.markers.push({room:this.s.room,x:p.x,z:p.z});this.notify('Repère de repli posé.');this.emit('save');return true;}
 updateColony(dt){const s=this.s,a=s.systems,p=s.player,w=this.ensureRoom();
  if(a.flashlight){a.battery=Math.max(0,a.battery-dt*.34);if(a.battery===0){a.flashlight=false;this.notify('La lampe n’a plus de réserve.');}}
  else a.battery=Math.min(100,a.battery+dt*(S.isPowered(s,this.room)?1.8:.22));
  if(a.hiding){p.noise=0;const hunter=w.enemies.find(e=>e.hp>0&&e.sawHide&&dist(e,p)<120);a.exposedFor=hunter?a.exposedFor+dt:Math.max(0,a.exposedFor-dt);if(a.exposedFor>1.4){a.hiding=null;a.exposedFor=0;this.hit(15);this.notify('La créature vous a vu entrer !');}}
  if(a.tracker){a.trackerTimer=Math.max(0,a.trackerTimer-dt);if(a.trackerTimer===0){for(const portal of this.room.portals)if(allowedPortal(portal,s)&&s.doors[pair(s.room,portal.to)]!=='sealed'&&dist(s.player,portal)<500)this.primeThreshold(portal);const contacts=this.trackerContacts();a.trackerTimer=contacts.length?Math.max(.4,Math.min(...contacts.map(c=>c.distance))/620):1.8;this.emit('tracker',{contacts:contacts.length,remote:contacts.filter(c=>c.remote).length});}}
  for(const h of S.activeHazards(s))if(h.active&&Math.abs(p.x-h.x)<64&&(s.mode==='classic'||Math.abs(p.z-h.z)<.095))this.hit(h.damage);
  if(s.escort){const e=s.escort;e.hp??=100;e.panic??=0;e.order??='follow';e.hurt=Math.max(0,(e.hurt||0)-dt);const danger=w.enemies.some(v=>v.hp>0&&dist(v,e)<360);e.panic=clamp(e.panic+dt*(danger?7:dist(e,p)>500?3:-8),0,100);}
 }

 requestPassage(portal){if(this.s.armory.projectiles.length){this.notify('Attendez l’impact de la grenade avant de franchir.');return false;}
  const s=this.s;portal=this.room.portals.find(p=>p.id===portal?.id);
  if(!portal||s.status!=='playing'||s.work||s.systems.hiding||s.passages.transit||this.portalCooldown>0||!allowedPortal(portal,s)||s.doors[pair(s.room,portal.to)]==='sealed'||!this.near(s.player,portal,100))return false;
  if(s.escort&&(s.escort.order==='wait'||dist(s.escort,s.player)>210)){this.notify('Votre compagnon doit vous rejoindre et vous suivre.');return false;}
  const d=P.config(portal);s.passages.listening=null;if(!d)return this.enter(portal);
  const emergency=d.type==='lift'&&!S.isPowered(s,this.room);
  s.passages.transit={from:s.room,to:portal.to,portalId:portal.id,type:d.type,stage:'boarding',timer:0,duration:d.duration+(emergency?1.6:0),emergency,x:s.player.x,z:s.player.z};
  s.exploration.aiming=false;this.bullets=[];this.emit('passage',{kind:d.type});this.emit('save');return true;
 }
 cancelPassage(notice=true){const a=this.s.passages;if(!a.transit||a.transit.stage==='travel')return false;a.transit=null;a.counts.cancelled++;if(notice)this.notify('Franchissement annulé avant engagement.');this.emit('save');return true;}
 updatePassage(dt){
  const s=this.s,a=s.passages,t=a.transit;if(!t)return;
  const portal=this.room.portals.find(p=>p.id===t.portalId),d=portal&&P.config(portal);
  if(!d||s.status!=='playing'){a.transit=null;return;}
  t.timer+=dt;
  if(t.stage==='boarding'){
   if(s.escort&&(s.escort.order==='wait'||dist(s.escort,s.player)>210)){this.cancelPassage();return;}
   if(t.timer>=d.boarding){t.stage='travel';t.timer=0;s.player.noise=0;this.emit('passageEngaged',{kind:t.type});this.emit('save');}return;
  }
  if(t.timer>=t.duration){a.transit=null;if(this.enter(portal)){a.counts[t.type]++;this.emit('save');}else{a.counts.cancelled++;this.notify('Le passage ne peut pas être achevé. Retour au seuil.');this.emit('save');}}
 }
 listen(){
  const s=this.s,a=s.passages;if(s.status!=='playing'||s.work||s.systems.hiding||a.transit)return false;
  if(a.listening){a.listening=null;return true;}
  const c=this.candidates().find(c=>c.type==='portal');if(!c){this.notify('Approchez une porte ou une grille pour écouter.');return false;}
  a.listening={from:s.room,to:c.ref.to,x:s.player.x,z:s.player.z,timer:0};s.exploration.aiming=false;
  this.notify('Restez immobile. Le monde continue autour de vous.');return true;
 }
 updateListening(dt){const s=this.s,a=s.passages,q=a.listening;if(!q)return;
  if(s.status!=='playing'||s.work||dist(q,s.player)>12||s.player.noise>.45){a.listening=null;this.notify('Écoute interrompue.');return;}
  q.timer+=dt;if(q.timer<1.6)return;
  const portal=this.room.portals.find(p=>p.to===q.to);this.primeThreshold(portal);const reading=P.report(this,portal);
  a.reports.push(reading);a.reports=a.reports.slice(-12);a.counts.listens++;a.listening=null;
  this.notify(P.wording(reading));this.emit('listened',{level:reading.level});this.emit('save');
 }
 save(){return JSON.stringify({id:'river-of-pain',schema:1,savedAt:new Date().toISOString(),state:this.s,checkpoint:this.checkpoint});}
 load(text){const env=parseSave(text);this.s=clone(env.state);this.checkpoint=clone(env.checkpoint||env.state);this.events=[];this.bullets=[];this.board=null;this.flameVisual=null;this.blastVisual=null;this.cooldown=0;this.portalCooldown=0;this.ensureRoom();this.emit('room',{to:this.s.room});return true;}
 drain(){return this.events.splice(0);}
}
for(const name of ['reload','fire','heal','flare','toggleDoor','hide','toggleTracker','listen','talkNearby','deployDecoy','useDefense','useDuct','dropMarker','craftAt','searchContainer','takeSupply','readResident','requestPassage']){
 const base=Simulation.prototype[name];if(base)Simulation.prototype[name]=function(...args){if(M.mounted(this.s))return false;return base.apply(this,args);};
}
const oldLight=Simulation.prototype.toggleLight;Simulation.prototype.toggleLight=function(){return M.mounted(this.s)?M.begin(this,'lights'):oldLight.call(this);};
const api={Simulation,createState,validateState,parseSave,roomDef,route,localPath,obstacleAt,lineBlocked,segmentHit,allowedPortal,dist,clamp,settings};
root.ROP_CORE=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
