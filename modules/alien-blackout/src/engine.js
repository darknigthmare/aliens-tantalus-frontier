/* Alien: Blackout — standalone adaptation runtime. No dependency on a Tantalus host.
 * Coordinates are logical camera-space units. All walking uses the same obstacle geometry.
 */
(()=>{'use strict';
const D=globalThis.BO_DATA, clone=o=>JSON.parse(JSON.stringify(o)), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rooms=new Map(D.rooms.map(r=>[r.id,r])), edges=new Map(D.edges.map(e=>[e.id,e]));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function port(room,side){const r=rooms.get(room);return r.view==='SIDE'?({W:{x:65,y:478},E:{x:935,y:478},N:{x:690,y:478},S:{x:320,y:478}}[side]):({W:{x:65,y:478},E:{x:935,y:478},N:{x:690,y:347},S:{x:320,y:497}}[side]);}
function validPoint(room,p,rad=12){const r=rooms.get(room);if(!r||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;if(p.x<50||p.x>950||p.y<(r.view==='SIDE'?478:340)||p.y>(r.view==='SIDE'?478:502))return false;return !r.obstacles.some(o=>p.x>o.x-rad&&p.x<o.x+o.w+rad&&p.y>o.y-rad&&p.y<o.y+o.h+rad);}
function blocked(a,b,o){ // Slab intersection against expanded physical footprint.
 let lo=0,hi=1;for(const k of ['x','y']){const v=b[k]-a[k],min=o[k]-14,max=o[k]+(k==='x'?o.w:o.h)+14;if(Math.abs(v)<1e-8){if(a[k]<=min||a[k]>=max)return false;}else{let t1=(min-a[k])/v,t2=(max-a[k])/v;if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>=hi)return false;}}return hi>0.00001&&lo<0.99999;
}
function localPath(room,a,b){
 const r=rooms.get(room);b={x:clamp(b.x,50,950),y:r.view==='SIDE'?478:clamp(b.y,340,502)};
 if(!validPoint(room,b))return null;
 if(!r.obstacles.some(o=>blocked(a,b,o)))return [b];
 const pts=[{x:a.x,y:a.y},b];for(const o of r.obstacles)for(const x of [o.x-17,o.x+o.w+17])for(const y of [o.y-17,o.y+o.h+17])if(validPoint(room,{x,y}))pts.push({x,y});
 const cost=pts.map(()=>Infinity),prev=pts.map(()=>-1),todo=new Set(pts.map((_,i)=>i));cost[0]=0;
 while(todo.size){let u=-1;for(const i of todo)if(u===-1||cost[i]<cost[u])u=i;if(!Number.isFinite(cost[u]))break;todo.delete(u);if(u===1)break;for(const v of todo){if(r.obstacles.some(o=>blocked(pts[u],pts[v],o)))continue;const n=cost[u]+dist(pts[u],pts[v]);if(n<cost[v]){cost[v]=n;prev[v]=u;}}}
 if(!Number.isFinite(cost[1]))return null;const out=[];for(let p=1;p!==0;p=prev[p]){if(p<0)return null;out.unshift(pts[p]);}return out;
}
class BlackoutEngine{
 constructor(options={}){this.onEvent=options.onEvent||(()=>{});this.seed=Number.isInteger(options.seed)?options.seed>>>0:26319;this.difficulty='survie';this.events=[];this.t=0;this.status='menu';this.paused=true;this.stats={jobs:0,transitions:0,doorToggles:0,refugeBlocks:0,blackouts:0,losses:0};this.notes=[];this.history=[];this.selected=0;this.camera=D.chapters[0].entry;this.crew=[];this.aliens=[];this.loadSector(0,false);this.status='menu';}
 rand(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 get chapter(){return D.chapters[this.chapterIndex];}get config(){return D.difficulties[this.difficulty];}get currentTask(){return this.chapter.tasks[this.taskIndex]||null;}
 get usedPower(){return (this.monitor?1:0)+(this.sensor?1:0)+Object.values(this.doors).filter(Boolean).length;}
 get link(){return this.shield<=0&&this.reboot<=0&&this.status==='playing';}
 emit(type,text){const e={type,text,time:Math.round(this.t*10)/10};this.events.push(e);if(this.events.length>80)this.events.shift();this.onEvent(e);}
 start(difficulty='survie'){if(!D.difficulties[difficulty])throw Error('Difficulté inconnue.');this.difficulty=difficulty;this.t=0;this.seed=26319;this.stats={jobs:0,transitions:0,doorToggles:0,refugeBlocks:0,blackouts:0,losses:0};this.notes=[];this.history=[];this.events=[];this.loadSector(0,false);this.paused=false;}
 loadSector(index,preserve=true){
  if(!Number.isInteger(index)||!D.chapters[index])throw Error('Secteur invalide.');const prior=this.crew;this.chapterIndex=index;this.taskIndex=0;this.taskProgress=0;this.time=this.config.time;this.energy=100;this.monitor=true;this.sensor=false;this.shield=0;this.reboot=0;this.lureCooldown=0;this.ventCountdown=0;this.nextVent=this.config.ventDelay;this.sectorElapsed=0;this.noises=[];this.status='playing';this.doors=Object.fromEntries(D.edges.filter(e=>e.chapter===index).map(e=>[e.id,false]));this.camera=this.chapter.entry;this.brokenCamera=index===3?this.chapter.rooms[2]:null;this.repairProgress=0;
  this.crew=D.crew.map((c,i)=>({...c,room:this.chapter.entry,x:173+i*29,y:478,alive:preserve?prior?.[i]?.alive!==false:true,hidden:true,spotted:0,attack:0,mode:'sneak',goal:null,route:[],local:[],pathKey:null,action:'idle',work:false,walk:0,stress:0}));
  this.aliens=[this.makeAlien(this.chapter.alienStart,0)];if(this.chapter.secondAlien)this.aliens.push(this.makeAlien(this.chapter.rooms[2],1));this.selected=this.crew.findIndex(c=>c.alive);if(this.selected<0)this.selected=0;this.paused=false;this.visit(this.chapter.entry);this.emit('sector',this.chapter.startLine);
 }
 makeAlien(room,i){return{id:`xeno-${i}`,room,x:840-i*200,y:478,goal:null,route:[],local:[],pathKey:null,think:6+i*5,inVent:null,refuge:false,walk:0};}
 visit(id){if(!this.notes.includes(id)){this.notes.push(id);this.emit('archive',rooms.get(id).note);}}
 select(i){if(Number.isInteger(i)&&this.crew[i]?.alive){this.selected=i;return true;}return false;}
 cameraTo(id){if(this.chapter.rooms.includes(id)){this.camera=id;return true;}return false;}
 neighbors(id,alien=false){const a=[];for(const e of D.edges)if(e.chapter===this.chapterIndex&&!this.doors[e.id]){if(e.a===id)a.push({id:e.b,edge:e.id,side:e.pa,arrival:e.pb,vent:false});if(e.b===id)a.push({id:e.a,edge:e.id,side:e.pb,arrival:e.pa,vent:false});}if(alien&&!(this.ventLock>0))for(const [x,y]of this.chapter.vents){if(id===x)a.push({id:y,vent:true});if(id===y)a.push({id:x,vent:true});}return a;}
 path(from,to,alien=false){if(!this.chapter.rooms.includes(from)||!this.chapter.rooms.includes(to))return null;if(from===to)return [];const q=[from],prev=new Map([[from,null]]);for(let i=0;i<q.length;i++){for(const n of this.neighbors(q[i],alien)){if(prev.has(n.id))continue;prev.set(n.id,{from:q[i],...n});if(n.id===to){const out=[];let v=to;while(v!==from){const p=prev.get(v);out.unshift({...p});v=p.from;}return out;}q.push(n.id);}}return null;}
 canCommand(){if(!this.link){this.emit('notice','Liaison coupée : attendez la fin du scellement ou du redémarrage.');return false;}return true;}
 order(index,room,type='move'){
  const c=this.crew[index];if(!this.canCommand()||!c?.alive||!this.chapter.rooms.includes(room)||!['move','task','hide','exit','repair'].includes(type))return false;
  const route=this.path(c.room,room);if(route===null){this.emit('notice','Aucune route ouverte. Libérez une cloison ou choisissez une autre pièce.');return false;}
  c.hidden=false;c.work=false;c.goal={room,type};c.route=route;c.local=[];c.pathKey=null;c.action=type==='hide'?'hiding':'moving';this.emit('order',`${c.name} : ${type==='hide'?'rejoindre un casier':rooms.get(room).name}.`);return true;
 }
 orderTask(index=this.selected){const t=this.currentTask;return t?this.order(index,t.room,'task'):this.order(index,this.chapter.exit,'exit');}
 gather(){if(!this.canCommand())return false;let result=true;this.crew.forEach((c,i)=>{if(c.alive&&!this.order(i,this.chapter.exit,'exit'))result=false;});return result;}
 hide(index=this.selected){return this.order(index,this.crew[index]?.room,'hide');}
 stop(index=this.selected){const c=this.crew[index];if(!this.canCommand()||!c?.alive)return false;c.goal=null;c.route=[];c.local=[];c.work=false;c.hidden=false;c.action='idle';return true;}
 mode(value,index=this.selected){if(!['sneak','walk','run'].includes(value)||!this.canCommand()||!this.crew[index]?.alive)return false;this.crew[index].mode=value;return true;}
 noise(room,weight=2,life=10){this.noises.push({room,weight,life});if(this.noises.length>40)this.noises.shift();}
 toggleDoor(id){if(!this.canCommand()||!Object.hasOwn(this.doors,id))return false;if(!this.doors[id]&&this.usedPower>=5){this.emit('notice','Les cinq canaux sont occupés. Coupez le capteur ou ouvrez une autre cloison.');return false;}this.doors[id]=!this.doors[id];this.stats.doorToggles++;const e=edges.get(id);this.noise(e.a,1.5,8);this.noise(e.b,1.5,8);this.emit('door',`Cloison ${id.split('-d')[1]} ${this.doors[id]?'fermée':'ouverte'}.`);return true;}
 toggleSystem(key){if(!['monitor','sensor'].includes(key)||!this.canCommand())return false;if(!this[key]&&this.usedPower>=5){this.emit('notice','Aucun canal d’énergie libre.');return false;}this[key]=!this[key];return true;}
 lure(room=this.camera){if(!this.canCommand()||!this.monitor||this.lureCooldown>0||this.energy<9)return false;this.energy-=9;this.lureCooldown=24;this.noise(room,12,18);this.emit('lure',`Interphone déclenché : ${rooms.get(room).name}.`);return true;}
 sealRefuge(){if(this.status!=='playing'||this.shield>0||this.reboot>0)return false;this.shield=9;this.monitor=false;this.sensor=false;for(const k in this.doors)this.doors[k]=false;if(this.ventCountdown>0){this.ventCountdown=0;this.stats.refugeBlocks++;for(const a of this.aliens)if(a.refuge){a.refuge=false;a.inVent={room:a.room,left:7};}}this.nextVent=this.config.ventDelay;this.emit('seal','Refuge scellé. Liaison coupée neuf secondes ; les cloisons distantes sont libérées.');return true;}
 repairCamera(index=this.selected){if(!this.brokenCamera){this.emit('notice','Aucune caméra à réparer dans ce secteur.');return false;}return this.order(index,this.brokenCamera,'repair');}
 fail(message){this.status='failed';this.paused=true;this.emit('failed',message);}
 walk(a,target,speed,dt){
  const key=`${a.room}/${Math.round(target.x)}/${Math.round(target.y)}`;
  if(a.pathKey!==key){a.local=localPath(a.room,a,target)||[];a.pathKey=key;}
  if(!a.local.length)return dist(a,target)<7;
  let budget=speed*dt;while(a.local.length&&budget>0){const p=a.local[0],d=dist(a,p);if(d<=budget){a.x=p.x;a.y=p.y;budget-=d;a.local.shift();}else{a.x+=(p.x-a.x)/d*budget;a.y+=(p.y-a.y)/d*budget;budget=0;}a.walk+=dt*speed*.045;}return dist(a,target)<5;
 }
 navigate(a,targetRoom,targetPoint,speed,dt,isAlien=false){
  if(a.room===targetRoom)return this.walk(a,targetPoint,speed,dt);
  const route=this.path(a.room,targetRoom,isAlien);a.route=route||[];if(!route?.length){a.action='blocked';return false;}
  const n=route[0];const pt=n.vent?{x:635,y:478}:port(a.room,n.side);
  if(this.walk(a,pt,speed,dt)){
   if(n.vent){a.inVent={room:n.id,left:4};a.goal=null;a.local=[];a.pathKey=null;return false;}
   if(this.doors[n.edge])return false;
   a.room=n.id;Object.assign(a,port(n.id,n.arrival));a.local=[];a.pathKey=null;if(!isAlien){this.stats.transitions++;this.visit(a.room);}return false;
  }return false;
 }
 manual(dx,dy,dt,index=this.selected){if(!Number.isFinite(dx)||!Number.isFinite(dy)||!Number.isFinite(dt)||dt<=0)return false;dt=Math.min(dt,.1);const c=this.crew[index];if(!this.link||this.paused||!c?.alive||c.room!==this.camera)return false;c.hidden=false;c.work=false;c.goal=null;c.action='manual';c.pathKey=null;c.local=[];const v=c.mode==='run'?160:c.mode==='sneak'?72:108;const r=rooms.get(c.room),l=Math.hypot(dx,dy)||1;const n={x:c.x+dx/l*v*dt,y:r.view==='SIDE'?478:c.y+dy/l*v*dt};if(validPoint(c.room,n)&&!r.obstacles.some(o=>blocked(c,n,o))){c.x=n.x;c.y=n.y;c.walk+=dt*v*.045;return true;}return false;}
 interact(index=this.selected){const c=this.crew[index];if(!this.canCommand()||!c?.alive)return false;const r=rooms.get(c.room),t=this.currentTask;if(t?.room===c.room&&dist(c,{x:r.terminal[0],y:r.terminal[1]})<80)return this.order(index,c.room,'task');for(const [side,p]of Object.entries(r.ports))if(dist(c,port(c.room,side))<90){if(this.doors[p.edge]){this.emit('notice','La cloison est fermée. Ouvrez-la depuis le panneau des portes.');return false;}return this.order(index,p.room,'move');}this.emit('notice','Approchez un terminal ou un seuil construit.');return false;}
 tick(delta){if(!Number.isFinite(delta)||delta<=0||this.paused||this.status!=='playing')return;let dt=Math.min(delta,2);while(dt>0&&this.status==='playing'){const step=Math.min(.05,dt);this.step(step);dt-=step;}}
 step(dt){
  this.t+=dt;this.sectorElapsed=Math.min(this.config.time,this.sectorElapsed+dt);this.time=Math.max(0,this.time-dt);if(this.time<=0){this.fail('Le secteur a épuisé son délai de secours. La liaison ne répond plus.');return;}
  this.lureCooldown=Math.max(0,this.lureCooldown-dt);const wasShield=this.shield;this.shield=Math.max(0,this.shield-dt);if(wasShield>0&&this.shield===0)this.emit('notice','Refuge rouvert. Réactivez la caméra lorsque le moment est sûr.');this.reboot=Math.max(0,this.reboot-dt);
  const drain=(this.monitor?.07:0)+(this.sensor?.045:0)+Object.values(this.doors).filter(Boolean).length*.1;
  this.energy=clamp(this.energy+(drain===0?.4:-drain*this.config.power)*dt,0,100);
  if(this.energy===0&&this.reboot===0){this.stats.blackouts++;this.reboot=12;this.monitor=false;this.sensor=false;for(const k in this.doors)this.doors[k]=false;this.emit('blackout','Batterie vide. Douze secondes de redémarrage ; portes libérées.');}
  this.noises=this.noises.map(n=>({...n,life:n.life-dt})).filter(n=>n.life>0);
  if(this.ventCountdown>0){this.ventCountdown=Math.max(0,this.ventCountdown-dt);if(this.ventCountdown<=0){this.fail('Amanda a été atteinte dans sa gaine. Scellez le refuge dès l’alerte.');return;}}
  else{this.nextVent-=dt;this.prepareRefugeAttack?.();}
  const task=this.currentTask, workers=[];let repairers=0;
  this.crew.forEach((c,i)=>{
   if(!c.alive||this.isIncapacitated?.(c))return;c.spotted=Math.max(0,c.spotted-dt);c.stress=clamp(c.stress+(c.spotted>0?7:-2)*dt,0,100);
   if(c.goal){const r=rooms.get(c.goal.room),type=c.goal.type;const target=type==='hide'?{x:r.hide[i][0],y:r.hide[i][1]}:['task','repair','service'].includes(type)?{x:r.terminal[0]+(i-1.5)*32,y:r.terminal[1]}:{x:335+i*52,y:478};
    const arrived=this.navigate(c,c.goal.room,target,c.mode==='run'?160:c.mode==='walk'?108:72,dt);
    if(c.mode==='run'&&!arrived&&Math.floor(this.t*3)!==Math.floor((this.t-dt)*3))this.noise(c.room,3.8,3);
    if(arrived){c.x=target.x;c.y=target.y;c.action=type;if(type==='hide'){c.hidden=true;c.goal=null;}else if(type==='task'){c.work=!!task&&task.room===c.room;if(c.work)workers.push(c);else{c.goal=null;c.work=false;}}else if(type==='service'){c.work=true;this.serviceWorkers?.push(c);}else if(type==='repair'&&this.brokenCamera===c.room){repairers++;c.work=true;}else{c.goal=null;c.work=false;c.action='idle';}}
   }else c.work=false;
  });
  if(task&&workers.length){const speed=this.workRate?this.workRate(workers,task):Math.max(...workers.map(c=>c.name===task.specialist?1.35:1));const next=this.taskProgress+dt*speed;this.taskProgress=this.limitTaskProgress?this.limitTaskProgress(task,next):next;if(Math.floor(this.t*2)!==Math.floor((this.t-dt)*2))this.noise(task.room,this.taskNoise?.(task)||5,4);if(this.taskProgress>=task.duration){this.taskIndex++;this.taskProgress=0;this.stats.jobs++;workers.forEach(c=>{c.goal=null;c.work=false;c.action='idle';});this.emit('task',`${task.title} : terminé. ${this.currentTask?'Prochaine étape : '+this.currentTask.title+'.':'Ralliez le sas de transfert avec tous les survivants.'}`);}}
  if(repairers){this.repairProgress+=dt*repairers;if(this.repairProgress>=7){this.brokenCamera=null;this.emit('repair','Image de la paillasse restaurée.');this.crew.forEach(c=>{if(c.goal?.type==='repair'){c.goal=null;c.work=false;}});}}
  for(const a of this.aliens)this.updateAlien(a,dt);
  let alive=0;for(const c of this.crew){if(!c.alive||this.isIncapacitated?.(c))continue;alive++;let threat=false;for(const a of this.aliens){if(a.refuge||a.inVent||a.room!==c.room)continue;const visible=!c.hidden||c.spotted>0;const d=dist(a,c);if(visible&&d<200&&!rooms.get(c.room).obstacles.some(o=>blocked(a,c,o))){c.spotted=6;threat=true;if(d<52)c.attack+=dt;}}if(!threat)c.attack=Math.max(0,c.attack-dt*1.5);if(c.attack>=this.config.attack&&(!this.resolveContact||this.resolveContact(c))){c.alive=false;c.work=false;c.hidden=false;c.goal=null;this.stats.losses++;this.emit('death',`${c.name} ne répond plus.`);if(this.selected===this.crew.indexOf(c)){const next=this.crew.findIndex(v=>v.alive);if(next>=0)this.selected=next;}}}
  if(!this.crew.some(c=>c.alive)){this.fail('Plus aucun membre du Haldin ne répond.');return;}
  if(!this.currentTask&&this.crew.filter(c=>c.alive).every(c=>c.room===this.chapter.exit&&!c.goal)&&(!this.extractionReady||this.extractionReady(dt))){
   const h={chapter:this.chapterIndex,survivors:this.crew.filter(c=>c.alive).map(c=>c.name),timeLeft:Math.round(this.time),energy:Math.round(this.energy)};this.history.push(h);this.status=this.chapterIndex===6?'won':'sector-complete';this.paused=true;this.emit('complete',this.status==='won'?'La dernière liaison est fermée. Le Haldin quitte Mendel.':'Tous les survivants sont au transfert.');
  }
 }
 updateAlien(a,dt){
  if(a.refuge)return;if(a.inVent){a.inVent.left-=dt;if(a.inVent.left<=0){a.room=a.inVent.room;a.x=635;a.y=478;a.inVent=null;a.goal=null;a.pathKey=null;a.think=2;}return;}
  const targets=this.crew.filter(c=>c.alive&&c.room===a.room&&(!c.hidden||c.spotted>0)&&dist(a,c)<230&&!rooms.get(a.room).obstacles.some(o=>blocked(a,c,o))).sort((x,y)=>dist(a,x)-dist(a,y));
  if(targets.length){const c=targets[0];c.spotted=6;a.goal={room:c.room,x:c.x,y:c.y};}
  a.think-=dt;
  if(!a.goal||a.think<=0){a.think=3+this.rand()*2;const ns=this.noises.filter(n=>n.room===a.room||this.neighbors(a.room,true).some(v=>v.id===n.room)).sort((x,y)=>y.weight-x.weight);if(targets.length){const c=targets[0];a.goal={room:c.room,x:c.x,y:c.y};}else if(ns.length){a.goal={room:ns[0].room,x:800,y:478};}else if(!a.goal){const ns=this.neighbors(a.room,true);if(ns.length)a.goal={room:ns[Math.floor(this.rand()*ns.length)].id,x:230+this.rand()*510,y:478};}}
  if(a.goal&&this.navigate(a,a.goal.room,{x:a.goal.x,y:a.goal.y},this.config.alienSpeed,dt,true)){a.goal=null;a.pathKey=null;}
 }
 continue(){if(this.status==='sector-complete'&&this.chapterIndex<6){this.loadSector(this.chapterIndex+1,true);return true;}return false;}
 restart(){const diff=this.difficulty;this.loadSector(this.chapterIndex,false);this.difficulty=diff;this.emit('notice','Secteur recommencé avec l’équipage rétabli.');}
 snapshot(){return{format:D.id,schema:D.schema,version:D.version,state:clone({difficulty:this.difficulty,chapterIndex:this.chapterIndex,taskIndex:this.taskIndex,taskProgress:this.taskProgress,time:this.time,t:this.t,seed:this.seed,energy:this.energy,monitor:this.monitor,sensor:this.sensor,shield:this.shield,reboot:this.reboot,lureCooldown:this.lureCooldown,ventCountdown:this.ventCountdown,nextVent:this.nextVent,sectorElapsed:this.sectorElapsed,doors:this.doors,camera:this.camera,selected:this.selected,crew:this.crew,aliens:this.aliens,notes:this.notes,history:this.history,stats:this.stats,status:this.status,brokenCamera:this.brokenCamera,repairProgress:this.repairProgress,noises:this.noises,events:this.events})};}
 restore(payload){
  // Validate entirely before mutating this instance. Never import functions or host campaign data.
  if(!payload||payload.format!==D.id||payload.schema!==D.schema||payload.version!==D.version)throw Error('Sauvegarde Blackout v0.1 incompatible.');
  const s=payload.state;if(!s||!D.difficulties[s.difficulty]||!Number.isInteger(s.chapterIndex)||!D.chapters[s.chapterIndex])throw Error('Secteur ou difficulté invalide.');const ch=D.chapters[s.chapterIndex];
  const num=(v,lo,hi)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
  for(const [key,lo,hi]of [['time',0,720],['t',0,1e7],['energy',0,100],['shield',0,9],['reboot',0,12],['lureCooldown',0,24],['ventCountdown',0,17],['nextVent',-100000,120],['sectorElapsed',0,720],['taskProgress',0,40],['repairProgress',0,100]])if(!num(s[key],lo,hi))throw Error('Valeur invalide : '+key);
  if(!Number.isInteger(s.taskIndex)||s.taskIndex<0||s.taskIndex>3||!['playing','sector-complete','won','failed'].includes(s.status))throw Error('Progression invalide.');
  if((s.status==='won'&&s.chapterIndex!==6)||(['won','sector-complete'].includes(s.status)&&s.taskIndex!==3))throw Error('Fin incohérente.');
  if(!ch.rooms.includes(s.camera)||!Number.isInteger(s.selected)||s.selected<0||s.selected>3||!Number.isInteger(s.seed)||s.seed<0||s.seed>4294967295)throw Error('Sélection invalide.');
  if(typeof s.monitor!=='boolean'||typeof s.sensor!=='boolean')throw Error('Systèmes invalides.');const ds=D.edges.filter(e=>e.chapter===s.chapterIndex);if(!s.doors||Object.keys(s.doors).length!==ds.length||ds.some(e=>typeof s.doors[e.id]!=='boolean'))throw Error('Portes invalides.');if((s.monitor?1:0)+(s.sensor?1:0)+Object.values(s.doors).filter(Boolean).length>5)throw Error('Charge électrique invalide.');
  if(!Array.isArray(s.crew)||s.crew.length!==4)throw Error('Équipage invalide.');
  function actor(a){if(!a||!ch.rooms.includes(a.room)||!validPoint(a.room,a))throw Error('Position invalide.');}
  s.crew.forEach((c,i)=>{actor(c);if(c.id!==D.crew[i].id||typeof c.alive!=='boolean'||typeof c.hidden!=='boolean'||!['sneak','walk','run'].includes(c.mode)||!num(c.attack,0,6)||!num(c.spotted,0,6.1)||!num(c.stress,0,100)||!num(c.walk,0,1e9))throw Error('État équipage invalide.');if(c.goal&&(!ch.rooms.includes(c.goal.room)||!['move','task','hide','exit','repair'].includes(c.goal.type)))throw Error('Ordre invalide.');});
  if(!Array.isArray(s.aliens)||s.aliens.length!==(ch.secondAlien?2:1))throw Error('Menaces invalides.');s.aliens.forEach((a,i)=>{actor(a);if(a.id!==`xeno-${i}`||typeof a.refuge!=='boolean'||!num(a.think,-1e7,20)||!num(a.walk,0,1e9))throw Error('Menace invalide.');if(a.inVent&&(!ch.rooms.includes(a.inVent.room)||!num(a.inVent.left,0,7)))throw Error('Gaine invalide.');if(a.goal&&(!ch.rooms.includes(a.goal.room)||!validPoint(a.goal.room,a.goal)))throw Error('Trajet hostile invalide.');});
  if(s.brokenCamera!==null&&s.brokenCamera!==D.chapters[3].rooms[2])throw Error('Caméra invalide.');if(!Array.isArray(s.notes)||s.notes.length>42||new Set(s.notes).size!==s.notes.length||s.notes.some(n=>!rooms.has(n)))throw Error('Archives invalides.');
  if(!Array.isArray(s.history)||s.history.length>7||!Array.isArray(s.noises)||s.noises.length>40||s.noises.some(n=>!ch.rooms.includes(n.room)||!num(n.life,0,30)||!num(n.weight,0,20)))throw Error('Historique invalide.');
  if(!s.stats||Object.keys(this.stats).some(k=>!Number.isInteger(s.stats[k])||s.stats[k]<0||s.stats[k]>1e7))throw Error('Statistiques invalides.');
  const clean=clone(s);delete clean.__proto__;this.difficulty=clean.difficulty;this.loadSector(clean.chapterIndex,false);
  const keys=['difficulty','chapterIndex','taskIndex','taskProgress','time','t','seed','energy','monitor','sensor','shield','reboot','lureCooldown','ventCountdown','nextVent','sectorElapsed','doors','camera','selected','notes','history','stats','status','brokenCamera','repairProgress','noises'];for(const k of keys)this[k]=clean[k];
  this.crew=clean.crew.map((c,i)=>({...c,...D.crew[i],local:[],pathKey:null,route:[]}));this.aliens=clean.aliens.map(a=>({...a,local:[],pathKey:null,route:[]}));this.events=[];this.paused=true;this.emit('restore','Sauvegarde restaurée en pause. Reprenez lorsque vous êtes prêt.');return true;
 }
}
globalThis.BO={BlackoutEngine,rooms,edges,port,validPoint,localPath,blocked,clone};
})();
