/* V0.2 protocol: authored topology, pressure-based containment, physical utilities,
   observed-target memory and transactional V1/V2 saves. Extends the delivered runtime. */
(() => {
  'use strict';
  const D = BO_DATA, R = BO.rooms, E = BO.edges, Base = BO.BlackoutEngine;
  const copy = BO.clone, distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const keys = ['jobs','transitions','doorToggles','refugeBlocks','blackouts','losses','breaches','services'];
  const serviceFor = (chapter,id) => chapter.services.find(s=>s.id===id);
  const capped = (v,a,b) => Math.max(a,Math.min(b,v));
  class BlackoutEngineV2 extends Base {
    loadSector(index,preserve=true) {
      super.loadSector(index,preserve);
      this.doorCooldown = Object.fromEntries(Object.keys(this.doors).map(k=>[k,0]));
      this.serviceState = Object.fromEntries(this.chapter.services.map(s=>[s.id,{progress:0,done:false}]));
      this.serviceWorkers = []; this.ventLock = 0;
      this.habituation = Object.fromEntries(this.chapter.rooms.map(id=>[id,0]));
      for (const k of keys) this.stats[k] ??= 0;
      this.stats.jobs = this.history.filter(h=>h.chapter<index).length*3;
      this.stats.services = this.history.filter(h=>h.chapter<index).reduce((n,h)=>n+(h.services?.length||0),0);
    }
    makeAlien(room,i) {
      return {...super.makeAlien(room,i),state:'patrol',pressure:null,memory:null,search:0,refugeApproach:false};
    }
    get taskPhase() {
      const t=this.currentTask;
      return t ? t.phases.find(p=>this.taskProgress/t.duration < p.fraction) || t.phases.at(-1) : null;
    }
    taskNoise() { return this.taskPhase?.noise || 5; }
    get gaitLockLabel() { return this.ventLock>0 ? `GAINES ISOLÉES · ${Math.ceil(this.ventLock)} s` : 'RÉSEAU DE GAINES OUVERT'; }
    lureEfficiency(room=this.camera) { return 1/(1+(this.habituation[room]||0)*.65); }
    lure(room=this.camera) {
      if(!this.chapter.rooms.includes(room)) return false;
      if(!this.canCommand()||!this.monitor||this.lureCooldown>0||this.energy<9) return false;
      const efficiency=this.lureEfficiency(room);
      this.energy-=9; this.lureCooldown=24;
      this.noise(room,12*efficiency,18);
      this.habituation[room]=Math.min(5,(this.habituation[room]||0)+1);
      this.emit('lure',`Interphone : ${R.get(room).name}. Efficacité ${Math.round(efficiency*100)} % ; changez de pièce pour varier le stimulus.`);
      return true;
    }
    toggleDoor(id) {
      if(this.doorCooldown[id]>0) {
        this.emit('notice',`Cycle du verrou : réarmement dans ${Math.ceil(this.doorCooldown[id])} s.`);
        return false;
      }
      const ok=super.toggleDoor(id);
      if(ok&&!this.doors[id]) { this.doorCooldown[id]=1.5; for(const a of this.aliens) if(a.pressure?.edge===id) a.pressure=null; }
      return ok;
    }
    order(index,room,type='move',service=null) {
      if(type!=='service') return super.order(index,room,type);
      const c=this.crew[index],s=serviceFor(this.chapter,service);
      if(!this.canCommand()||!c?.alive||!s||s.room!==room||this.serviceState[s.id]?.done) return false;
      const route=this.path(c.room,room);
      if(route===null) { this.emit('notice','Annexe inaccessible : une cloison coupe le trajet.'); return false; }
      Object.assign(c,{hidden:false,work:false,goal:{room,type,service},route,local:[],pathKey:null,action:'moving'});
      this.emit('order',`${c.name} : ${s.title.toLowerCase()} — ${R.get(room).name}.`);
      return true;
    }
    orderService(index=this.selected,room=this.camera) {
      const s=this.chapter.services.find(s=>s.room===room);
      if(!s) { this.emit('notice','Cette pièce ne contient pas d’intervention annexe.'); return false; }
      if(this.serviceState[s.id].done) { this.emit('notice','Ce circuit a déjà été utilisé dans ce secteur.'); return false; }
      return this.order(index,room,'service',s.id);
    }
    sealRefuge() {
      const ok=super.sealRefuge();
      if(ok)for(const a of this.aliens){
        a.pressure=null;a.refugeApproach=false;
        a.state=a.inVent?'vent':a.memory?'search':'patrol';
      }
      return ok;
    }
    prepareRefugeAttack() {
      const a=this.aliens[0];
      if(this.nextVent>0||!a||a.inVent||a.refuge||this.shield>0||!R.get(a.room).vent) return;
      // The threat must physically reach an authored vent mouth before Amanda's warning starts.
      if(distance(a,{x:635,y:478})>8) { a.refugeApproach=true; return; }
      a.refuge=true; a.refugeApproach=false; a.goal=null; a.pressure=null; a.state='refuge';
      this.ventCountdown=this.difficulty==='recit'?17:this.difficulty==='cauchemar'?10:14;
      this.emit('vent','Bruits dans la gaine d’Amanda. Scellez le refuge !');
    }
    structuralRoute(from,to) {
      if(from===to) return [];
      const q=[from],seen=new Map([[from,null]]);
      for(let i=0;i<q.length;i++) {
        for(const ed of D.edges.filter(e=>e.chapter===this.chapterIndex&&(e.a===q[i]||e.b===q[i]))) {
          const id=ed.a===q[i]?ed.b:ed.a;
          if(seen.has(id))continue;
          const step={from:q[i],id,edge:ed.id,side:ed.a===q[i]?ed.pa:ed.pb,arrival:ed.a===q[i]?ed.pb:ed.pa};
          seen.set(id,step);
          if(id===to) { const route=[];let v=to;while(v!==from){const n=seen.get(v);route.unshift(n);v=n.from;}return route; }
          q.push(id);
        }
      }
      return null;
    }
    audible(a) {
      const result=[];
      for(const n of this.noises) {
        const route=this.structuralRoute(a.room,n.room);
        if(route===null||route.length>2)continue;
        const attenuation=route.reduce((v,s)=>v*(this.doors[s.edge]?.28:.64),1);
        const score=n.weight*attenuation;
        if(score>1.15)result.push({...n,score});
      }
      return result.sort((a,b)=>b.score-a.score || b.life-a.life);
    }
    pressureDoor(a,edge,dt) {
      const ed=E.get(edge);
      if(!ed||!this.doors[edge]||!(ed.a===a.room||ed.b===a.room)) {a.pressure=null;return false;}
      const side=ed.a===a.room?ed.pa:ed.pb,point=BO.port(a.room,side);
      if(!this.walk(a,point,this.config.alienSpeed,dt)) { a.state='investigate'; return true; }
      if(a.pressure?.edge!==edge) {
        a.pressure={edge,progress:0}; a.state='pressure';
        this.emit('impact',`CHOCS SUR D${edge.split('-d')[1]} — ${R.get(a.room).name}. Forçage estimé : ${this.config.breachTime} s.`);
      }
      a.state='pressure';a.pressure.progress+=dt;
      if(a.pressure.progress>=this.config.breachTime) {
        this.doors[edge]=false;this.doorCooldown[edge]=18;this.stats.breaches++;
        a.pressure=null;a.pathKey=null;a.local=[];
        const other=ed.a===a.room?ed.b:ed.a;
        a.goal={room:other,x:480,y:478};a.think=4;
        this.noise(a.room,8,6);
        this.emit('breach',`D${edge.split('-d')[1]} FORCÉE. Passage ouvert ; verrou indisponible pendant 18 s.`);
      }
      return true;
    }
    updateAlien(a,dt) {
      if(a.refuge)return;
      if(a.memory) { a.memory.left-=dt; if(a.memory.left<=0)a.memory=null; }
      if(a.inVent) {
        a.state='vent';a.inVent.left-=dt;
        if(a.inVent.left<=0) {
          a.room=a.inVent.room;a.x=635;a.y=478;a.inVent=null;
          a.goal=null;a.pathKey=null;a.local=[];a.think=1.8;a.state='investigate';
          this.emit('vent-exit',`Vibration de grille : ${R.get(a.room).name}.`);
        }
        return;
      }
      const visible=this.crew.filter(c=>c.alive&&!this.isIncapacitated?.(c)&&c.room===a.room&&(!c.hidden||c.spotted>0)
        &&distance(a,c)<230&&!R.get(a.room).obstacles.some(o=>BO.blocked(a,c,o)))
        .sort((x,y)=>distance(a,x)-distance(a,y));
      if(visible.length) {
        const c=visible[0];c.spotted=6;a.memory={id:c.id,room:c.room,x:c.x,y:c.y,left:this.config.memory};
        a.goal={room:c.room,x:c.x,y:c.y};a.state='pursuit';a.search=0;a.refugeApproach=false;
        a.pressure=null;this.navigate(a,c.room,c,this.config.alienSpeed,dt,true);return;
      }
      if(a.pressure) {if(this.doors[a.pressure.edge]){this.pressureDoor(a,a.pressure.edge,dt);return;}a.pressure=null;}
      if(a.memory) {
        const m=a.memory,c=this.crew.find(c=>c.id===m.id);
        a.goal={room:m.room,x:m.x,y:m.y};a.state='search';
        if(!this.disableLegacyLockerReveal&&c?.alive&&c.hidden&&c.room===m.room&&a.room===m.room&&distance(a,c)<75) c.spotted=Math.max(c.spotted,1);
      }
      if(a.refugeApproach&&!a.memory) {
        a.state='vent-approach';this.walk(a,{x:635,y:478},this.config.alienSpeed,dt);return;
      }
      a.think-=dt;
      if(!a.memory&&(!a.goal||a.think<=0)) {
        a.think=3+this.rand()*2;
        const sound=this.audible(a)[0];
        if(sound) {a.goal={room:sound.room,x:800,y:478};a.state='investigate';}
        else if(!a.goal) {
          const next=this.neighbors(a.room,true);
          if(next.length) {a.goal={room:next[Math.floor(this.rand()*next.length)].id,x:300+this.rand()*380,y:478};a.state='patrol';}
        }
      }
      if(a.goal) {
        const route=this.path(a.room,a.goal.room,true);
        if(route===null) {
          const structural=this.structuralRoute(a.room,a.goal.room);
          if(structural?.length) {
            const first=structural[0];
            if(this.doors[first.edge])this.pressureDoor(a,first.edge,dt);
            else this.navigate(a,first.id,BO.port(first.id,first.arrival),this.config.alienSpeed,dt,true);
            return;
          }
          a.goal=null;a.local=[];a.pathKey=null;
        } else if(this.navigate(a,a.goal.room,a.goal,this.config.alienSpeed,dt,true)) {
          a.search+=dt;
          if(a.search>2.3) {a.goal=null;a.search=0;a.pathKey=null;}
        }
      }
      // Even a quiet, vent-free dead end is not a permanent cage.
      if(!a.goal&&!this.neighbors(a.room,true).length) {
        const closed=D.edges.filter(ed=>ed.chapter===this.chapterIndex&&this.doors[ed.id]&&(ed.a===a.room||ed.b===a.room));
        if(closed.length) {
          closed.sort((x,y)=>distance(a,BO.port(a.room,x.a===a.room?x.pa:x.pb))-distance(a,BO.port(a.room,y.a===a.room?y.pa:y.pb)));
          this.pressureDoor(a,closed[0].id,dt);
        }
      }
    }
    step(dt) {
      this.serviceWorkers=[];
      for(const id of Object.keys(this.doorCooldown))this.doorCooldown[id]=Math.max(0,this.doorCooldown[id]-dt);
      const previousLock=this.ventLock;
      this.ventLock=Math.max(0,this.ventLock-dt);
      if(previousLock>0&&this.ventLock===0)this.emit('clapet','Les clapets ont rouvert. Les gaines redeviennent traversables.');
      for(const id of Object.keys(this.habituation))this.habituation[id]=Math.max(0,this.habituation[id]-dt/75);
      const phase=this.taskPhase?.label,taskIndex=this.taskIndex;
      super.step(dt);
      if(this.currentTask&&taskIndex===this.taskIndex&&phase!==this.taskPhase?.label)this.emit('phase',`${this.currentTask.title} : ${this.taskPhase.label.toLowerCase()}.`);
      for(const s of this.chapter.services) {
        const state=this.serviceState[s.id];
        if(state.done)continue;
        const workers=this.serviceWorkers.filter(c=>c.alive&&c.work&&c.goal?.service===s.id&&c.room===s.room);
        if(!workers.length||this.status!=='playing')continue;
        const speed=this.workRate?this.workRate(workers,s):Math.max(...workers.map(c=>c.name===s.specialist?1.35:1));
        state.progress=Math.min(s.duration,state.progress+dt*speed);
        if(Math.floor(this.t*2)!==Math.floor((this.t-dt)*2))this.noise(s.room,3,4);
        if(state.progress>=s.duration) {
          state.done=true;
          if(s.kind==='capacitor')this.energy=Math.min(100,this.energy+24);
          if(s.kind==='ventlock')this.ventLock=40;
          this.stats.services++;
          workers.forEach(c=>{c.goal=null;c.work=false;c.action='idle';});
          this.emit('service',`${s.title} : terminé. ${s.effect}`);
        }
      }
      if(['sector-complete','won'].includes(this.status)) {
        const h=this.history.at(-1);
        if(h?.chapter===this.chapterIndex)h.services=Object.entries(this.serviceState).filter(([,v])=>v.done).map(([id])=>id);
      }
    }
    restart() {
      const index=this.chapterIndex;
      this.history=this.history.filter(h=>h.chapter<index);
      this.loadSector(index,false);
      this.emit('notice','Secteur recommencé : équipage rétabli, interventions et circuits locaux remis à zéro. Aucun double crédit.');
    }
    snapshot() {
      const s=super.snapshot();
      Object.assign(s.state,copy({doorCooldown:this.doorCooldown,serviceState:this.serviceState,habituation:this.habituation,ventLock:this.ventLock}));
      return s;
    }
    restore(payload) {
      const legacy=payload?.schema===1&&payload?.version==='0.1.0';
      if(!payload||payload.format!==D.id||(!legacy&&(payload.schema!==2||payload.version!=='0.2.0')))throw Error('Format Blackout non compatible (v0.1 ou v0.2 attendu).');
      const raw=payload.state, num=(v,lo,hi)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi;
      if(!raw||typeof raw!=='object'||!D.difficulties[raw.difficulty]||!Number.isInteger(raw.chapterIndex)||!D.chapters[raw.chapterIndex])throw Error('Secteur ou difficulté invalide.');
      const ch=D.chapters[raw.chapterIndex], conf=D.difficulties[raw.difficulty], oldRooms=new Map(D.legacy.rooms.map(r=>[r.id,r]));
      const roomAllowed=id=>ch.rooms.includes(id)&&(!legacy||oldRooms.has(id));
      const pointAllowed=(id,p)=>{
        if(!roomAllowed(id)||!p||!num(p.x,50,950)||!num(p.y,R.get(id).view==='SIDE'?478:340,R.get(id).view==='SIDE'?478:502))return false;
        if(!legacy)return BO.validPoint(id,p);
        return !oldRooms.get(id).obstacles.some(o=>p.x>o.x-12&&p.x<o.x+o.w+12&&p.y>o.y-12&&p.y<o.y+o.h+12);
      };
      for(const [key,lo,hi]of [['time',0,720],['t',0,1e7],['energy',0,100],['shield',0,9],['reboot',0,12],['lureCooldown',0,24],['ventCountdown',0,17],['nextVent',-100000,120],['sectorElapsed',0,720],['taskProgress',0,40],['repairProgress',0,100]])if(!num(raw[key],lo,hi))throw Error('Valeur invalide : '+key);
      if(!Number.isInteger(raw.taskIndex)||raw.taskIndex<0||raw.taskIndex>3||!['playing','sector-complete','won','failed'].includes(raw.status))throw Error('Progression invalide.');
      if(raw.taskIndex<3&&raw.taskProgress>ch.tasks[raw.taskIndex].duration)throw Error('Progression de terminal incohérente.');
      if(raw.taskIndex===3&&raw.taskProgress!==0)throw Error('Intervention terminée incohérente.');
      if((raw.status==='won'&&raw.chapterIndex!==6)||(['won','sector-complete'].includes(raw.status)&&raw.taskIndex!==3))throw Error('Fin incohérente.');
      if(!roomAllowed(raw.camera)||!Number.isInteger(raw.selected)||raw.selected<0||raw.selected>3||!Number.isInteger(raw.seed)||raw.seed<0||raw.seed>4294967295)throw Error('Sélection invalide.');
      if(typeof raw.monitor!=='boolean'||typeof raw.sensor!=='boolean')throw Error('Systèmes invalides.');
      const sourceEdges=(legacy?D.legacy.edges:D.edges).filter(e=>e.chapter===raw.chapterIndex),nowEdges=D.edges.filter(e=>e.chapter===raw.chapterIndex);
      if(!raw.doors||Object.keys(raw.doors).length!==sourceEdges.length||sourceEdges.some(e=>typeof raw.doors[e.id]!=='boolean'))throw Error('Portes invalides.');
      if((raw.monitor?1:0)+(raw.sensor?1:0)+Object.values(raw.doors).filter(Boolean).length>5)throw Error('Charge électrique invalide.');
      if(!Array.isArray(raw.crew)||raw.crew.length!==4)throw Error('Équipage invalide.');
      for(const [i,c]of raw.crew.entries()) {
        if(!c||c.id!==D.crew[i].id||!pointAllowed(c.room,c)||typeof c.alive!=='boolean'||typeof c.hidden!=='boolean'||typeof c.work!=='boolean'||!['sneak','walk','run'].includes(c.mode)||!num(c.attack,0,7)||!num(c.spotted,0,6.1)||!num(c.stress,0,100)||!num(c.walk,0,1e9))throw Error('État équipage invalide.');
        if(c.goal&&(!roomAllowed(c.goal.room)||!['move','task','hide','exit','repair',...(!legacy?['service']:[])].includes(c.goal.type)))throw Error('Ordre invalide.');
        if(c.goal?.type==='service'&&serviceFor(ch,c.goal.service)?.room!==c.goal.room)throw Error('Intervention annexe invalide.');
      }
      if(!Array.isArray(raw.aliens)||raw.aliens.length!==(ch.secondAlien?2:1))throw Error('Menaces invalides.');
      for(const [i,a]of raw.aliens.entries()) {
        if(!a||a.id!==`xeno-${i}`||!pointAllowed(a.room,a)||typeof a.refuge!=='boolean'||!num(a.think,-1e7,20)||!num(a.walk,0,1e9))throw Error('Menace invalide.');
        if(a.inVent&&(!roomAllowed(a.inVent.room)||!num(a.inVent.left,0,7)))throw Error('Gaine invalide.');
        if(a.goal&&!pointAllowed(a.goal.room,a.goal))throw Error('Trajet hostile invalide.');
        if(!legacy) {
          if(!num(a.search,0,30)||typeof a.refugeApproach!=='boolean'||!['patrol','investigate','pursuit','pressure','vent','refuge','search','vent-approach'].includes(a.state))throw Error('État de traque invalide.');
          if(a.pressure) {
            const ed=nowEdges.find(e=>e.id===a.pressure.edge);
            if(!ed||!(ed.a===a.room||ed.b===a.room)||!num(a.pressure.progress,0,conf.breachTime)||!raw.doors[ed.id])throw Error('Pression de porte incohérente.');
          }
          if(a.memory&&(!D.crew.some(c=>c.id===a.memory.id)||!pointAllowed(a.memory.room,a.memory)||!num(a.memory.left,0,conf.memory)))throw Error('Mémoire de chasse invalide.');
        }
      }
      if(raw.brokenCamera!==null&&!(raw.chapterIndex===3&&raw.brokenCamera===D.chapters[3].rooms[2]))throw Error('Caméra invalide.');
      if(!Array.isArray(raw.notes)||raw.notes.length>(legacy?42:56)||new Set(raw.notes).size!==raw.notes.length||raw.notes.some(n=>!R.has(n)||(legacy&&!oldRooms.has(n))))throw Error('Archives invalides.');
      if(!Array.isArray(raw.history)||raw.history.length>7)throw Error('Historique invalide.');
      const seenHistory=new Set();
      for(const h of raw.history) {
        if(!h||!Number.isInteger(h.chapter)||h.chapter<0||h.chapter>raw.chapterIndex||!Array.isArray(h.survivors)||h.survivors.length<1||h.survivors.length>4||new Set(h.survivors).size!==h.survivors.length||h.survivors.some(n=>!D.crew.some(c=>c.name===n))||!num(h.timeLeft,0,720)||!num(h.energy,0,100))throw Error('Bilan de secteur invalide.');
        if(!legacy&&seenHistory.has(h.chapter))throw Error('Bilan de secteur dupliqué.');seenHistory.add(h.chapter);
        if(!legacy&&(!Array.isArray(h.services)||new Set(h.services).size!==h.services.length||h.services.some(id=>!serviceFor(D.chapters[h.chapter],id))))throw Error('Bilan des annexes invalide.');
      }
      if(!Array.isArray(raw.noises)||raw.noises.length>40||raw.noises.some(n=>!roomAllowed(n.room)||!num(n.life,0,30)||!num(n.weight,0,20)))throw Error('Bruit invalide.');
      if(!raw.stats||keys.some(k=>!legacy||!['breaches','services'].includes(k)?!Number.isInteger(raw.stats[k])||raw.stats[k]<0||raw.stats[k]>1e7:false))throw Error('Statistiques invalides.');
      if(!legacy) {
        if(!raw.doorCooldown||Object.keys(raw.doorCooldown).length!==nowEdges.length||nowEdges.some(e=>!num(raw.doorCooldown[e.id],0,18)||(raw.doorCooldown[e.id]>0&&raw.doors[e.id])))throw Error('Réarmement de porte invalide.');
        if(!raw.serviceState||Object.keys(raw.serviceState).length!==ch.services.length||ch.services.some(s=>{const v=raw.serviceState[s.id];return !v||typeof v.done!=='boolean'||!num(v.progress,0,s.duration)||(v.done&&v.progress!==s.duration);}))throw Error('Circuit annexe invalide.');
        if(!num(raw.ventLock,0,40)||!raw.habituation||Object.keys(raw.habituation).length!==ch.rooms.length||ch.rooms.some(id=>!num(raw.habituation[id],0,5)))throw Error('État des circuits invalide.');
        const jobs=raw.history.filter(h=>h.chapter<raw.chapterIndex).length*3+raw.taskIndex;
        if(raw.stats.jobs!==jobs)throw Error('Crédit d’interventions incohérent.');
      }
      // No mutation has occurred above. Construct only trusted fields; derived paths are discarded.
      const s=copy(raw);let repositioned=0;
      const safePoint=(id,p)=> {
        if(BO.validPoint(id,p))return{x:p.x,y:p.y};
        let best=null,cost=Infinity;
        for(let x=50;x<=950;x+=5)for(let y=R.get(id).view==='SIDE'?478:340;y<=(R.get(id).view==='SIDE'?478:500);y+=5) {
          const point={x,y},d=distance(p,point);if(d<cost&&BO.validPoint(id,point)){best=point;cost=d;}
        }
        if(!best)throw Error('Aucun point sûr pour la migration.');repositioned++;return best;
      };
      const crew=s.crew.map((c,i)=>({...D.crew[i],room:c.room,...safePoint(c.room,c),alive:c.alive,hidden:c.hidden,spotted:c.spotted,attack:c.attack,mode:c.mode,goal:c.goal?{room:c.goal.room,type:c.goal.type,...(c.goal.service?{service:c.goal.service}:{})}:null,route:[],local:[],pathKey:null,action:c.hidden?'hide':c.goal?'moving':'idle',work:c.work,walk:c.walk,stress:c.stress}));
      const aliens=s.aliens.map((a,i)=>({id:`xeno-${i}`,room:a.room,...safePoint(a.room,a),goal:a.goal?{room:a.goal.room,...safePoint(a.goal.room,a.goal)}:null,route:[],local:[],pathKey:null,think:a.think,inVent:a.inVent?{room:a.inVent.room,left:a.inVent.left}:null,refuge:a.refuge,walk:a.walk,state:legacy?'patrol':a.state,pressure:legacy?null:a.pressure,memory:legacy?null:a.memory,search:legacy?0:a.search,refugeApproach:legacy?false:a.refugeApproach}));
      const doors=legacy?Object.fromEntries(nowEdges.map(e=>{const old=sourceEdges.find(o=>(o.a===e.a&&o.b===e.b)||(o.a===e.b&&o.b===e.a));return[e.id,old?raw.doors[old.id]:false];})):s.doors;
      const history=[...new Map(s.history.map(h=>[h.chapter,{chapter:h.chapter,survivors:h.survivors,timeLeft:h.timeLeft,energy:h.energy,services:legacy?[]:h.services}])).values()];
      const stats=Object.fromEntries(keys.map(k=>[k,s.stats[k]||0]));stats.jobs=history.filter(h=>h.chapter<s.chapterIndex).length*3+s.taskIndex;
      if(legacy)stats.services=0;
      const fields=['difficulty','chapterIndex','taskIndex','taskProgress','time','t','seed','energy','monitor','sensor','shield','reboot','lureCooldown','ventCountdown','nextVent','sectorElapsed','camera','selected','notes','status','brokenCamera','repairProgress','noises'];
      const clean=Object.fromEntries(fields.map(k=>[k,s[k]]));
      Object.assign(clean,{crew,aliens,doors,history,stats,doorCooldown:legacy?Object.fromEntries(nowEdges.map(e=>[e.id,0])):s.doorCooldown,serviceState:legacy?Object.fromEntries(ch.services.map(v=>[v.id,{progress:0,done:false}])):s.serviceState,habituation:legacy?Object.fromEntries(ch.rooms.map(id=>[id,0])):s.habituation,ventLock:legacy?0:s.ventLock,events:[],serviceWorkers:[],paused:true});
      Object.assign(this,clean);
      this.emit('restore',legacy?`Sauvegarde v0.1 migrée vers les nouveaux plans, en pause. ${repositioned} point(s) ajusté(s) au mobilier ; portes rapprochées par leurs pièces.`:'Sauvegarde v0.2 restaurée en pause, circuits et traque conservés.');
      return true;
    }
  }
  BO.BlackoutEngine=BlackoutEngineV2;
  BO.VERSION='0.2.0';
})();
