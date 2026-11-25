/* V0.3 expands the delivered V2 simulation: physical terminal protocols, crew
   directives, persistent injuries, medical supplies and a defended final docking.
   Plain JavaScript, deterministic and offline. No native MIRE integration implied. */
(() => {
  'use strict';
  const D=BO_DATA, R=BO.rooms, Parent=BO.BlackoutEngine, clone=BO.clone;
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const mod=(v,n)=>(v%n+n)%n;
  const statNames=['protocols','protocolErrors','assisted','injuries','treatments','withdrawals','reassurances'];
  const zeroStats=()=>Object.fromEntries(statNames.map(k=>[k,0]));
  const health=(alive=true)=>({hp:alive?2:0,autonomy:'direct',following:null,interrupted:null,retreat:null,medical:0,cautionCooldown:0});
  // Separate deterministic stream. Configuring a terminal never consumes an AI draw.
  function specification(task,seed) {
    let state=(seed+Math.imul(task.protocol.ordinal+1,2654435761))>>>0;
    const next=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/65536)%n;};
    const kind=task.protocol.kind;
    if(kind==='power') {
      const matrix=Array.from({length:6},()=>[1+next(4),next(4),next(4)]);
      const mask=5+next(55),solution=matrix.map((_,i)=>(mask>>i)&1);
      const target=[0,1,2].map(j=>matrix.reduce((s,row,i)=>s+row[j]*solution[i],0));
      return {kind,id:task.protocol.id,matrix,target,initial:[0,0,0,0,0,0],limits:[2,2,2,2,2,2]};
    }
    if(kind==='pressure') {
      const solution=[next(7),next(7),next(7)];if(solution.every(x=>x===0))solution[0]=1;
      return {kind,id:task.protocol.id,target:[mod(solution[0]+solution[2],7),mod(solution[0]+solution[1],7),mod(solution[1]+solution[2],7)],initial:[0,0,0],limits:[7,7,7]};
    }
    return {kind,id:task.protocol.id,target:[2+next(6),next(8),1+next(4)],initial:[0,0,0],limits:[8,8,5]};
  }
  function outputs(spec,values) {
    if(spec.kind==='power')return [0,1,2].map(j=>spec.matrix.reduce((s,row,i)=>s+row[j]*values[i],0));
    if(spec.kind==='pressure')return [mod(values[0]+values[2],7),mod(values[0]+values[1],7),mod(values[1]+values[2],7)];
    return values.slice();
  }
  function matching(spec,values){return outputs(spec,values).every((v,i)=>v===spec.target[i]);}
  function initialProtocols(chapter,seed,completed=0) {
    return chapter.tasks.map((t,i)=>({id:t.protocol.id,values:specification(t,seed).initial,solved:i<completed,assisted:false,assistProgress:0,cooldown:0,stable:0}));
  }
  class BlackoutEngineV3 extends Parent {
    loadSector(index,preserve=true) {
      const old=this.v3?clone(this.v3):null;
      super.loadSector(index,preserve);
      const seed=old?.seed??26319;
      this.v3={seed,assistance:old?.assistance??false,medkits:preserve&&old?old.medkits:4,
        members:Object.fromEntries(this.crew.map(c=>[c.id,preserve&&old?{...health(c.alive),hp:old.members[c.id].hp,autonomy:old.members[c.id].autonomy}:health(c.alive)])),
        protocols:initialProtocols(this.chapter,seed),telemetry:preserve&&old?old.telemetry:zeroStats(),reassureCooldown:0,evac:0,entry:null};
      this.captureEntry();
    }
    start(difficulty='survie',options={}) {
      const seed=options.seed===undefined?26319:options.seed;
      if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw Error('La graine doit être un entier entre 0 et 4 294 967 295.');
      super.start(difficulty);
      this.seed=seed;
      this.v3.seed=seed;this.v3.assistance=options.assistance===true;
      this.v3.protocols=initialProtocols(this.chapter,seed);this.captureEntry();
      this.emit('liaison',this.v3.assistance?'Réglages assistés : douze secondes de diagnostic local par intervention.':'Réglages manuels : préparez le terminal, alignez ses circuits, puis validez.');
    }
    captureEntry() {
      this.v3.entry={alive:this.crew.map(c=>c.alive),hp:this.crew.map(c=>this.v3.members[c.id].hp),medkits:this.v3.medkits,
        telemetry:clone(this.v3.telemetry),stats:clone(this.stats)};
    }
    get protocol() {
      const task=this.currentTask;
      if(!task)return null;
      const spec=specification(task,this.v3.seed),state=this.v3.protocols[this.taskIndex];
      return {spec,state,ready:this.terminalReady(),output:outputs(spec,state.values),matching:matching(spec,state.values)};
    }
    terminalReady() {
      const t=this.currentTask;if(!t||this.taskProgress<t.duration*.3-.001)return false;
      return this.crew.some((c,i)=>c.alive&&c.work&&c.goal?.type==='task'&&c.goal.room===t.room&&c.room===t.room&&
        distance(c,{x:R.get(t.room).terminal[0]+(i-1.5)*32,y:R.get(t.room).terminal[1]})<8);
    }
    limitTaskProgress(task,next) {
      const state=this.v3.protocols[this.taskIndex];
      return state?.solved?next:Math.min(next,Math.max(this.taskProgress,task.duration*.3));
    }
    workRate(workers,task) {
      return Math.max(...workers.map(c=>{
        const member=this.v3.members[c.id];
        const support=this.crew.some(other=>other!==c&&other.alive&&other.room===c.room&&
          this.v3.members[other.id].following===c.id&&this.v3.members[other.id].medical===0&&distance(c,other)<125);
        return (c.name===task.specialist?1.35:1)*(member.hp===1?.75:1)*(c.stress>=65?.8:1)*(support?1.15:1);
      }));
    }
    adjustProtocol(index,direction=1) {
      const p=this.protocol;
      if(!p||!this.canCommand()||!p.ready||p.state.solved||!Number.isInteger(index)||index<0||index>=p.state.values.length||![-1,1].includes(direction))return false;
      p.state.values[index]=mod(p.state.values[index]+direction,p.spec.limits[index]);p.state.stable=0;
      return true;
    }
    validateProtocol() {
      const p=this.protocol;
      if(!p||!this.canCommand()||!p.ready||p.state.solved||p.state.cooldown>0)return false;
      if(!p.matching) {
        p.state.cooldown=4;this.energy=Math.max(0,this.energy-2);this.noise(this.currentTask.room,7,6);
        this.v3.telemetry.protocolErrors++;
        this.emit('notice','Réglage refusé : la lecture ne correspond pas à la cible. −2 % de batterie ; nouveau contrôle dans quatre secondes.');return false;
      }
      if(p.spec.kind==='signal'&&p.state.stable<1.5){this.emit('notice','Signal aligné. Maintenez la liaison 1,5 seconde pour le stabiliser.');return false;}
      this.solveProtocol(false);return true;
    }
    solveProtocol(assisted) {
      const p=this.protocol;if(!p||p.state.solved)return;
      p.state.solved=true;p.state.assisted=assisted;
      this.v3.telemetry.protocols++;if(assisted)this.v3.telemetry.assisted++;
      this.emit('calibration',`${D.protocolTypes[p.spec.kind]} validée${assisted?' avec assistance locale':''}. Le travail peut reprendre.`);
    }
    setAssistance(value) {
      if(typeof value!=='boolean'||this.status!=='playing')return false;
      this.v3.assistance=value;this.emit('notice',value?'Assistance activée : le réglage attend douze secondes supplémentaires au terminal.':'Assistance désactivée : les réglages suivants restent manuels.');return true;
    }
    walk(actor,point,speed,dt) {
      const m=this.v3?.members[actor.id];
      return super.walk(actor,point,speed*(m?.hp===1?.75:1),dt);
    }
    manual(dx,dy,dt,index=this.selected) {
      const c=this.crew[index];if(!c?.alive||!this.link||this.paused||c.room!==this.camera)return false;
      if(!Number.isFinite(dx)||!Number.isFinite(dy)||!Number.isFinite(dt)||dt<=0)return false;
      const m=this.v3.members[c.id];m.medical=0;m.following=null;m.retreat=null;m.interrupted=null;
      return super.manual(dx,dy,dt*(m.hp===1?.75:1)*(this.manualSpeedFactor?.(c)??1),index);
    }
    order(index,room,type='move',service=null) {
      const ok=super.order(index,room,type,service);
      if(ok&&this.v3){const m=this.v3.members[this.crew[index].id];m.following=null;m.medical=0;m.retreat=null;m.interrupted=null;}
      return ok;
    }
    stop(index=this.selected) {
      const ok=super.stop(index);if(ok){const m=this.v3.members[this.crew[index].id];m.following=null;m.medical=0;m.retreat=null;m.interrupted=null;}return ok;
    }
    resolveContact(c) {
      const m=this.v3.members[c.id];
      if(m.hp<=1){m.hp=0;m.medical=0;m.following=null;m.retreat=null;return true;}
      m.hp=1;m.medical=0;c.attack=0;c.stress=100;this.v3.telemetry.injuries++;
      this.emit('injury',`${c.name} est blessé. Éloignez-le de la menace : un autre contact sera mortel.`);
      return false;
    }
    treat(index=this.selected) {
      const c=this.crew[index],m=c?this.v3.members[c.id]:null;
      if(!this.canCommand()||!c?.alive||m.hp!==1||m.medical>0||this.v3.medkits<1)return false;
      if(c.spotted>0){this.emit('notice','Soin impossible sous la menace : mettez cet équipier à l’abri.');return false;}
      this.stop(index);m.medical=6;c.action='medical';this.emit('medical',`${c.name} commence les soins. Six secondes immobiles ; une trousse consommée seulement à la fin.`);return true;
    }
    reassure(index=this.selected) {
      const c=this.crew[index];
      if(!this.canCommand()||!c?.alive||this.v3.reassureCooldown>0||this.energy<2||c.stress<1)return false;
      c.stress=Math.max(0,c.stress-35);this.energy-=2;this.v3.reassureCooldown=20;
      this.v3.telemetry.reassurances++;this.noise(c.room,1.5,3);
      this.emit('radio',`Amanda → ${c.name} : « Reste avec moi. Une porte après l’autre. »`);return true;
    }
    setAutonomy(value,index=this.selected) {
      if(!['direct','cautious'].includes(value)||!this.canCommand()||!this.crew[index]?.alive)return false;
      this.v3.members[this.crew[index].id].autonomy=value;return true;
    }
    followCrew(index,leaderIndex) {
      const c=this.crew[index],leader=this.crew[leaderIndex];
      if(!this.canCommand()||!c?.alive||!leader?.alive||c===leader)return false;
      let id=leader.id;const seen=new Set([c.id]);
      while(id){if(seen.has(id)){this.emit('notice','Ce binôme créerait une boucle de suivi.');return false;}seen.add(id);id=this.v3.members[id]?.following;}
      this.stop(index);this.v3.members[c.id].following=leader.id;
      this.emit('order',`${c.name} rejoint le binôme de ${leader.name}. Les passages restent physiques.`);return true;
    }
    resumeInterrupted(index=this.selected) {
      const c=this.crew[index],m=c?this.v3.members[c.id]:null;if(!m?.interrupted)return false;
      const goal=clone(m.interrupted);return this.order(index,goal.room,goal.type,goal.service);
    }
    // Local crew decision, independent of radio power. Uses only the open public map.
    internalOrder(c,room,type='move') {
      const route=this.path(c.room,room);if(!route)return false;
      c.goal={room,type};c.route=route;c.local=[];c.pathKey=null;c.work=false;c.hidden=false;c.action='moving';return true;
    }
    visibleThreats(c) {
      return this.aliens.filter(a=>!a.refuge&&!a.inVent&&a.room===c.room&&distance(c,a)<190&&
        !R.get(c.room).obstacles.some(o=>BO.blocked(c,a,o)));
    }
    updateDirectives(dt) {
      for(const c of this.crew) {
        const m=this.v3.members[c.id];m.cautionCooldown=Math.max(0,m.cautionCooldown-dt);
        if(!c.alive){m.following=null;m.medical=0;continue;}
        if(this.directiveLocked?.(c))continue;
        if(m.autonomy==='cautious'&&!c.hidden&&m.cautionCooldown===0) {
          const threats=this.visibleThreats(c);
          if(threats.length) {
            const candidates=this.neighbors(c.room).map(n=>({...n,point:BO.port(c.room,n.side)}))
              .filter(n=>BO.localPath(c.room,c,n.point));
            candidates.sort((a,b)=>Math.min(...threats.map(t=>distance(t,b.point)))-Math.min(...threats.map(t=>distance(t,a.point))));
            if(candidates.length) {
              if(!m.interrupted&&c.goal)m.interrupted=clone(c.goal);
              m.following=null;m.medical=0;m.cautionCooldown=8;m.retreat=candidates[0].id;
              this.internalOrder(c,m.retreat);c.mode='run';this.v3.telemetry.withdrawals++;
              this.emit('withdrawal',`${c.name} : « Contact visuel. Je décroche vers ${R.get(m.retreat).name}. »`);
              continue;
            }
          }
        }
        if(m.retreat) {
          if(c.room===m.retreat&&c.goal?.type!=='hide'&&!c.hidden)this.internalOrder(c,c.room,'hide');
          if(c.hidden)m.retreat=null;
          continue;
        }
        if(m.medical>0)continue;
        if(m.following) {
          const leader=this.crew.find(v=>v.id===m.following);
          if(!leader?.alive){m.following=null;c.goal=null;c.local=[];c.work=false;this.emit('radio',`${c.name} a perdu son binôme. Il attend un nouvel ordre.`);continue;}
          c.mode=leader.mode;
          if(c.room!==leader.room) {
            if(c.goal?.room!==leader.room||!c.goal)this.internalOrder(c,leader.room);
          } else {
            if(leader.hidden&&!leader.goal){if(!c.hidden&&c.goal?.type!=='hide')this.internalOrder(c,c.room,'hide');continue;}
            if(c.goal&&['move','hide'].includes(c.goal.type)){c.goal=null;c.local=[];c.pathKey=null;}
            const index=this.crew.indexOf(c),dir=index%2?-1:1;
            let target={x:Math.max(75,Math.min(925,leader.x+dir*75)),y:leader.y};
            if(!BO.validPoint(c.room,target))target={x:Math.max(75,Math.min(925,leader.x-dir*75)),y:leader.y};
            if(BO.validPoint(c.room,target)&&distance(c,target)>18){c.hidden=false;c.action='following';this.walk(c,target,c.mode==='run'?160:c.mode==='sneak'?72:108,dt);if(c.mode==='run'&&Math.floor(this.t*3)!==Math.floor((this.t+dt)*3))this.noise(c.room,3.8,3);}
            else c.action='support';
          }
        }
      }
    }
    extractionReady(dt) {
      if(this.chapterIndex!==6)return true;
      if(this.v3.evac===0)this.emit('docking','Amarrage du Haldin : gardez tous les survivants au sas pendant douze secondes. La menace reste active.');
      this.v3.evac=Math.min(12,this.v3.evac+dt);return this.v3.evac>=12;
    }
    step(dt) {
      this.v3.reassureCooldown=Math.max(0,this.v3.reassureCooldown-dt);
      for(const p of this.v3.protocols)p.cooldown=Math.max(0,p.cooldown-dt);
      if(this.chapterIndex===6&&!this.crew.filter(c=>c.alive).every(c=>c.room===this.chapter.exit&&!c.goal))this.v3.evac=0;
      this.updateDirectives(dt);
      super.step(dt);
      const p=this.protocol;
      if(p&&!p.state.solved&&this.status==='playing') {
        if(p.ready) {
          if(p.matching&&this.link)p.state.stable=Math.min(1.5,p.state.stable+dt);else p.state.stable=0;
          if(this.v3.assistance){p.state.assistProgress=Math.min(12,p.state.assistProgress+dt);if(p.state.assistProgress>=12)this.solveProtocol(true);}
        } else p.state.stable=0;
      }
      for(const c of this.crew) {
        const m=this.v3.members[c.id];
        if(m.medical<=0)continue;
        if(!c.alive||c.spotted>0||c.goal||m.hp!==1||this.v3.medkits<1||this.status!=='playing') {
          m.medical=0;this.emit('medical','Soin interrompu. La trousse n’a pas été consommée.');continue;
        }
        m.medical=Math.max(0,m.medical-dt);c.action='medical';
        if(m.medical===0) {
          if(this.v3.medkits>0){this.v3.medkits--;m.hp=2;c.stress=Math.max(0,c.stress-25);this.v3.telemetry.treatments++;this.emit('medical',`${c.name} a terminé les soins. ${this.v3.medkits} trousse(s) restante(s).`);}
          else this.emit('medical',`Plus de trousse disponible pour ${c.name}.`);
          c.action='idle';
        }
      }
    }
    restart() {
      const carry=clone(this.v3.entry),index=this.chapterIndex,seed=this.v3.seed,assistance=this.v3.assistance;
      const autonomy=this.crew.map(c=>this.v3.members[c.id].autonomy);
      this.history=this.history.filter(h=>h.chapter<index);
      this.loadSector(index,false);this.seed=(seed+index*7919)>>>0;
      this.v3.seed=seed;this.v3.assistance=assistance;this.v3.protocols=initialProtocols(this.chapter,seed);
      this.crew.forEach((c,i)=>{c.alive=carry.alive[i];this.v3.members[c.id]={...health(c.alive),hp:carry.hp[i],autonomy:autonomy[i]};});
      this.v3.medkits=carry.medkits;this.v3.telemetry=clone(carry.telemetry);this.stats=clone(carry.stats);
      this.stats.jobs=this.history.length*3;this.selected=Math.max(0,this.crew.findIndex(c=>c.alive));this.v3.entry=carry;
      this.emit('notice','Secteur repris depuis ses effectifs et ses ressources d’entrée. Les pertes des secteurs précédents restent définitives.');
    }
    contacts() {
      if(!this.link||!this.sensor)return [];
      return this.aliens.filter(a=>!a.inVent&&!a.refuge).map(a=>({room:a.room,...(this.monitor&&this.camera===a.room&&this.brokenCamera!==a.room?{x:a.x,y:a.y}:{})}));
    }
    get ending() {
      const alive=this.crew.filter(c=>c.alive).length;
      return {title:alive===4?'Personne ne manque à l’appel.':alive>=2?'On ne remplit pas les places vides.':'Une voix traverse le silence.',
        text:alive===4?'Les quatre balises franchissent le sas. Amanda attend le dernier verrou avant de quitter sa console. Pour une fois, personne ne répond à la place d’un absent.':alive>=2?'Le Haldin s’éloigne avec ceux que vous avez ramenés. Amanda laisse les canaux manquants ouverts quelques secondes, puis coupe la liaison.':'Une seule balise répond encore. Amanda la suit jusqu’au sas. Le Haldin emporte un survivant et les noms de ceux qui ne rentreront pas.',
        assisted:this.v3.telemetry.assisted,injuries:this.v3.telemetry.injuries,treatments:this.v3.telemetry.treatments};
    }
    snapshot() {const p=super.snapshot();p.state.v3=clone(this.v3);return p;}
    restore(payload) {
      const native=payload?.schema===3&&payload?.version==='0.3.0';
      if(!native&&!((payload?.schema===1&&payload?.version==='0.1.0')||(payload?.schema===2&&payload?.version==='0.2.0')))throw Error('Sauvegarde attendue : Blackout v0.1, v0.2 ou v0.3.');
      const base=clone(payload);if(native){base.schema=2;base.version='0.2.0';}
      // Parent validator runs on an isolated instance. No user state is mutated on error.
      const candidate=new Parent();candidate.restore(base);
      const v=native?validateV3(payload.state.v3,candidate):migrateV3(candidate);
      const events=payload.state.events;
      const validEvent=x=>x&&typeof x.type==='string'&&x.type.length<=40&&typeof x.text==='string'&&x.text.length<=2000&&typeof x.time==='number'&&Number.isFinite(x.time)&&x.time>=0&&x.time<=1e7;
      if(native&&(!Array.isArray(events)||events.length>80||events.some(x=>!validEvent(x))))throw Error('Journal de liaison invalide.');
      candidate.events=(Array.isArray(events)?events:[]).filter(validEvent).slice(-80).map(x=>({type:x.type,text:x.text,time:x.time}));
      const callback=this.onEvent;
      for(const key of Object.keys(candidate))if(key!=='onEvent')this[key]=candidate[key];
      this.onEvent=callback;this.v3=v;this.paused=true;
      this.emit('restore',native?'Sauvegarde v0.3 restaurée en pause : protocoles, blessures et binômes conservés.':'Ancienne liaison migrée en v0.3, en pause. Réglages manuels, quatre trousses ; état importé utilisé comme référence de reprise.');
      return true;
    }
  }
  function migrateV3(e) {
    const seed=e.seed;
    const v={seed,assistance:false,medkits:4,members:Object.fromEntries(e.crew.map(c=>[c.id,health(c.alive)])),
      protocols:initialProtocols(e.chapter,seed,e.taskIndex),telemetry:{...zeroStats(),protocols:e.stats.jobs},reassureCooldown:0,evac:e.status==='won'?12:0,entry:null};
    v.entry={alive:e.crew.map(c=>c.alive),hp:e.crew.map(c=>c.alive?2:0),medkits:4,telemetry:{...zeroStats(),protocols:e.stats.jobs-e.taskIndex},stats:{...e.stats,jobs:e.stats.jobs-e.taskIndex}};
    return v;
  }
  function validateV3(v,e) {
    const number=(n,a,b)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b;
    const integer=(n,a,b)=>Number.isInteger(n)&&number(n,a,b);
    const object=o=>o&&typeof o==='object'&&!Array.isArray(o);
    const telemetry=t=>object(t)&&statNames.every(k=>integer(t[k],0,1e7));
    const fail=message=>{throw Error('État v0.3 invalide : '+message);};
    if(!object(v)||!integer(v.seed,0,4294967295)||typeof v.assistance!=='boolean'||!integer(v.medkits,0,4)||!number(v.reassureCooldown,0,20)||!number(v.evac,0,12)||!telemetry(v.telemetry))fail('ressources ou réglages.');
    if(v.evac>0&&e.chapterIndex!==6)fail('amarrage hors du dernier secteur.');
    if(!object(v.members)||Object.keys(v.members).length!==4)fail('équipiers.');
    const goalAllowed=g=>g===null||(object(g)&&e.chapter.rooms.includes(g.room)&&['move','task','hide','exit','repair','service'].includes(g.type)&&
      (g.type!=='service'||e.chapter.services.some(s=>s.id===g.service&&s.room===g.room)));
    for(const c of e.crew) {
      const m=v.members[c.id];
      if(!object(m)||!integer(m.hp,0,2)||c.alive!==(m.hp>0)||!['direct','cautious'].includes(m.autonomy)||
        !(m.following===null||D.crew.some(x=>x.id===m.following&&x.id!==c.id))||!goalAllowed(m.interrupted)||
        !(m.retreat===null||e.chapter.rooms.includes(m.retreat))||!number(m.medical,0,6)||!number(m.cautionCooldown,0,8))fail('santé ou directive.');
      if(m.medical>0&&(!c.alive||m.hp!==1||c.goal||v.medkits<1))fail('soin sans ressource ou incompatible avec l’ordre.');
    }
    for(const c of e.crew) {let id=c.id;const seen=new Set();while(id){if(seen.has(id))fail('cycle de binôme.');seen.add(id);id=v.members[id].following;}}
    if(!Array.isArray(v.protocols)||v.protocols.length!==3)fail('protocoles.');
    v.protocols.forEach((p,i)=>{
      const spec=specification(e.chapter.tasks[i],v.seed);
      if(!object(p)||p.id!==spec.id||!Array.isArray(p.values)||p.values.length!==spec.limits.length||p.values.some((x,j)=>!integer(x,0,spec.limits[j]-1))||
        typeof p.solved!=='boolean'||typeof p.assisted!=='boolean'||!number(p.stable,0,1.5)||!number(p.cooldown,0,4)||!number(p.assistProgress,0,12)||
        (i<e.taskIndex&&!p.solved)||(i>e.taskIndex&&p.solved)||(p.assisted&&!p.solved))fail('réglage du terminal '+(i+1)+'.');
    });
    const entry=v.entry;
    if(!object(entry)||!Array.isArray(entry.alive)||entry.alive.length!==4||entry.alive.some(x=>typeof x!=='boolean')||!Array.isArray(entry.hp)||entry.hp.length!==4||
      entry.hp.some((x,i)=>!integer(x,0,2)||entry.alive[i]!==(x>0))||!entry.alive.some(Boolean)||!integer(entry.medkits,0,4)||!telemetry(entry.telemetry)||!object(entry.stats)||
      Object.keys(e.stats).some(k=>!integer(entry.stats[k],0,1e7)))fail('référence de reprise.');
    if(entry.alive.some((a,i)=>!a&&e.crew[i].alive))fail('résurrection incohérente.');
    if(v.telemetry.assisted>v.telemetry.protocols||v.telemetry.treatments>4||v.medkits>entry.medkits)fail('compteurs incohérents.');
    // Reconstruct only declared fields; no arbitrary object properties cross the boundary.
    return {seed:v.seed,assistance:v.assistance,medkits:v.medkits,members:Object.fromEntries(D.crew.map(c=>{
      const m=v.members[c.id];return[c.id,{hp:m.hp,autonomy:m.autonomy,following:m.following,interrupted:m.interrupted?{room:m.interrupted.room,type:m.interrupted.type,...(m.interrupted.service?{service:m.interrupted.service}:{})}:null,retreat:m.retreat,medical:m.medical,cautionCooldown:m.cautionCooldown}];
    })),protocols:v.protocols.map(p=>({id:p.id,values:p.values.slice(),solved:p.solved,assisted:p.assisted,assistProgress:p.assistProgress,cooldown:p.cooldown,stable:p.stable})),
      telemetry:Object.fromEntries(statNames.map(k=>[k,v.telemetry[k]])),reassureCooldown:v.reassureCooldown,evac:v.evac,entry:{alive:entry.alive.slice(),hp:entry.hp.slice(),medkits:entry.medkits,telemetry:Object.fromEntries(statNames.map(k=>[k,entry.telemetry[k]])),stats:Object.fromEntries(Object.keys(e.stats).map(k=>[k,entry.stats[k]]))}};
  }
  BO.BlackoutEngine=BlackoutEngineV3;BO.VERSION='0.3.0';
  globalThis.BO_V3={specification,outputs,matching,statNames};
})();
