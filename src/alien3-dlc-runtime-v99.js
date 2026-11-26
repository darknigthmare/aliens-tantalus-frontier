import {
  ALIEN3_ADAPTIVE_CHASES_V99,
  ALIEN3_CAMERA_BRIDGES_V99,
  ALIEN3_CAMPAIGN_ID_V99,
  ALIEN3_CODEX_FILTERS_V99,
  ALIEN3_DLC_CODEX_BATCHES_V99,
  ALIEN3_DLC_CODEX_EXTENSION_V99,
  ALIEN3_DLC_CODEX_TERMINALS_V99,
  ALIEN3_DLC_CODEX_V99,
  ALIEN3_V99_EVIDENCE_IDS,
  alien3AdaptiveChaseAtV99,
  alien3AdaptiveChaseV99,
  alien3CameraBridgeV99,
  alien3CodexLinksV99,
  alien3CodexSearchV99,
  alien3DlcCodexBatchV99,
  alien3DlcCodexEntryV99,
  alien3V99Grade,
  createAlien3StateV99,
  sanitizeAlien3StateV99
} from './alien3-dlc-v99.js';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const isRecord=(v)=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
const EXTENSION_IDS=new Set(ALIEN3_DLC_CODEX_EXTENSION_V99.map((x)=>x.id));
const TERMINAL_IDS=new Set(ALIEN3_DLC_CODEX_TERMINALS_V99.map((x)=>x.id));
const center=(e)=>({x:(Number(e?.x)||0)+(Number(e?.w)||0)/2,y:(Number(e?.y)||0)+(Number(e?.h)||0)/2});
const wrap=(text,max=62)=>{const words=String(text||'').split(/\s+/);const out=[];let line='';for(const word of words){const next=line?`${line} ${word}`:word;if(next.length>max&&line){out.push(line);line=word;}else line=next;}if(line)out.push(line);return out;};

export function withAlien3DlcRuntimeV99(BaseEngine){
  return class Alien3DlcRuntimeV99 extends BaseEngine{
    start(options={}){
      this.alien3ActiveV99=String(options.campaign?.id||'')===ALIEN3_CAMPAIGN_ID_V99;
      this.alien3V99=this.alien3ActiveV99?createAlien3StateV99():null;
      this.pendingAlien3ResumeV99=null;
      // V99 owns Codex input and extends V98 without adding a second listener.
      this.alien3CodexInputBoundV98=true;
      const snapshot=super.start(options);
      if(!this.isAlien3MissionV99())return snapshot;
      if(this.pendingAlien3ResumeV99)this.alien3V99=sanitizeAlien3StateV99(this.pendingAlien3ResumeV99);
      this.configureAlien3WorldV99();
      this.bindAlien3CodexInputV99();
      return {...snapshot,...this.getAlien3SnapshotV99()};
    }
    isAlien3MissionV99(){return Boolean(this.alien3ActiveV99||this.isAlien3MissionV98?.());}

    configureAlien3WorldV99(){
      this.alien3V99 ||= createAlien3StateV99();
      this.alien3CodexTerminalsV97=ALIEN3_DLC_CODEX_TERMINALS_V99.map((x)=>({...x}));
      this.recoverAlien3EvidenceV99('adaptive-pursuit-ready',{silent:true});
      this.syncAlien3CodexTerminalsV99();
      this.onEvent({type:'alien3-v99-pursuit',action:'runtime-ready',chases:ALIEN3_ADAPTIVE_CHASES_V99.length,codex:ALIEN3_DLC_CODEX_V99.length,terminals:ALIEN3_DLC_CODEX_TERMINALS_V99.length});
      return this.alien3V99;
    }

    bindAlien3CodexInputV99(){
      if(this.alien3CodexInputBoundV99||!globalThis.addEventListener)return;
      this.alien3CodexInputBoundV99=true;
      globalThis.addEventListener('keydown',(event)=>{
        if(!this.running||!this.isAlien3MissionV99()||this.paused||this.mission?.state!=='active')return;
        if(event.repeat||event.ctrlKey||event.metaKey||event.altKey)return;
        if(typeof this.canRouteGameplayKey==='function'&&!this.canRouteGameplayKey(event))return;
        if(event.code==='KeyC'){event.preventDefault?.();this.toggleAlien3CodexUiV99();return;}
        if(!this.alien3V98?.codexUi?.open)return;
        if(this.alien3V99.codexGraph.searchEditing){
          if(event.code==='Escape'||event.code==='Enter'){event.preventDefault?.();this.alien3V99.codexGraph.searchEditing=false;return;}
          if(event.code==='Backspace'){event.preventDefault?.();this.setAlien3CodexSearchV99(this.alien3V99.codexGraph.query.slice(0,-1),{count:false});return;}
          if(event.key?.length===1&&/[a-zA-Z0-9À-ÿ _-]/.test(event.key)){event.preventDefault?.();this.setAlien3CodexSearchV99((this.alien3V99.codexGraph.query+event.key).slice(0,48),{count:false});return;}
        }
        if(event.code==='Slash'){event.preventDefault?.();this.alien3V99.codexGraph.searchEditing=true;this.alien3V99.codexGraph.searchUses+=1;this.alien3V99.telemetry.codexSearches+=1;this.recoverAlien3EvidenceV99('codex-search-used',{silent:true});return;}
        if(event.code==='BracketLeft'){event.preventDefault?.();this.cycleAlien3CodexCategoryV99(-1);return;}
        if(event.code==='BracketRight'){event.preventDefault?.();this.cycleAlien3CodexCategoryV99(1);return;}
        if(event.code==='Comma'){event.preventDefault?.();this.cycleAlien3CodexPageV99(-1);return;}
        if(event.code==='Period'){event.preventDefault?.();this.cycleAlien3CodexPageV99(1);return;}
        if(event.code==='KeyB'){event.preventDefault?.();this.toggleAlien3CodexBookmarkV99();return;}
        if(event.code==='KeyK'){event.preventDefault?.();this.cycleAlien3CodexFilterV99(1);return;}
        if(event.code==='KeyL'){event.preventDefault?.();this.followAlien3CodexLinkV99(1);return;}
        if(event.code==='KeyH'){event.preventDefault?.();this.alien3CodexHistoryBackV99();}
      });
    }

    recoverAlien3EvidenceV99(id,{silent=false}={}){
      const state=this.alien3V99;if(!state||!ALIEN3_V99_EVIDENCE_IDS.includes(id)||state.evidenceRecovered.includes(id))return false;
      state.evidenceRecovered.push(id);
      if(!silent){this.onEvent({type:'alien3-v99-pursuit',action:'evidence',evidenceId:id,total:state.evidenceRecovered.length});this.onEvent({type:'objective-action',action:`alien3-v99:evidence:${id}`});}
      return true;
    }

    alien3CodexUnlockedV99(){return [...new Set([...(this.alien3CodexUnlockedV98?.()||[]),...(this.alien3V99?.codexGraph?.extensionUnlocked||[])])];}
    alien3CodexViewedV99(){return [...new Set([...(this.alien3CodexViewedV98?.()||[]),...(this.alien3V99?.codexGraph?.extensionViewed||[])])];}
    alien3CodexBookmarksV99(){return [...new Set([...(this.alien3V98?.codexUi?.bookmarks||[]),...(this.alien3V99?.codexGraph?.extensionBookmarks||[])])];}
    unlockAlien3CodexExtensionV99(ids=[]){
      const s=this.alien3V99;if(!s)return[];const added=[];
      for(const id of ids){if(!EXTENSION_IDS.has(id)||s.codexGraph.extensionUnlocked.includes(id))continue;s.codexGraph.extensionUnlocked.push(id);added.push(id);this.onEvent({type:'alien3-v99-codex',action:'unlocked',codexId:id,total:this.alien3CodexUnlockedV99().length});}
      if(this.alien3CodexUnlockedV99().length===90)this.recoverAlien3EvidenceV99('codex-90-complete',{silent:true});
      return added;
    }
    markAlien3CodexViewedV99(id){
      if(!id||!this.alien3V99)return false;
      if(EXTENSION_IDS.has(id)){
        if(!this.alien3V99.codexGraph.extensionUnlocked.includes(id))return false;
        if(!this.alien3V99.codexGraph.extensionViewed.includes(id))this.alien3V99.codexGraph.extensionViewed.push(id);
      }else if(!super.markAlien3CodexViewedV98?.(id))return false;
      if(this.alien3CodexViewedV99().length===90)this.recoverAlien3EvidenceV99('codex-90-read',{silent:true});
      return true;
    }
    syncAlien3CodexTerminalsV99(){
      if(!this.alien3V99)return;
      for(const id of this.alien3V98?.codexUi?.terminalsRead||[])if(TERMINAL_IDS.has(id)&&!this.alien3V99.codexGraph.terminalsRead.includes(id))this.alien3V99.codexGraph.terminalsRead.push(id);
    }
    readAlien3CodexTerminalV97(terminal){
      if(!this.isAlien3MissionV99()||!this.alien3V99||terminal?.batch!=='pursuit-v99'){
        const result=super.readAlien3CodexTerminalV97(terminal);if(result&&this.alien3V99)this.syncAlien3CodexTerminalsV99();return result;
      }
      const ids=alien3DlcCodexBatchV99(terminal.batch);const added=this.unlockAlien3CodexExtensionV99(ids);
      if(!this.alien3V99.codexGraph.terminalsRead.includes(terminal.id))this.alien3V99.codexGraph.terminalsRead.push(terminal.id);
      this.alien3V99.codexGraph.currentId=ids[0]||null;this.recoverAlien3EvidenceV99('codex-pursuit-terminal');this.openAlien3CodexUiV99(this.alien3V99.codexGraph.currentId);
      this.onEvent({type:'alien3-v99-codex',action:'terminal',terminalId:terminal.id,unlocked:added.length});this.updateAlien3PerfectV99();return true;
    }

    openAlien3CodexUiV99(preferredId=null){
      const s=this.alien3V99;if(!s||!this.alien3V98)return false;const unlocked=this.alien3CodexUnlockedV99();if(!unlocked.length)return false;
      const id=preferredId&&unlocked.includes(preferredId)?preferredId:(s.codexGraph.currentId&&unlocked.includes(s.codexGraph.currentId)?s.codexGraph.currentId:unlocked[0]);
      this.alien3V98.codexUi.open=true;s.codexGraph.currentId=id;this.pushAlien3CodexHistoryV99(id);this.markAlien3CodexViewedV99(id);this.audio?.ui?.();this.onEvent({type:'alien3-v99-codex',action:'ui-open',codexId:id});return true;
    }
    closeAlien3CodexUiV99(){if(!this.alien3V98?.codexUi?.open)return false;this.alien3V98.codexUi.open=false;this.alien3V99.codexGraph.searchEditing=false;this.audio?.ui?.();return true;}
    toggleAlien3CodexUiV99(){return this.alien3V98?.codexUi?.open?this.closeAlien3CodexUiV99():this.openAlien3CodexUiV99();}
    pushAlien3CodexHistoryV99(id){const g=this.alien3V99?.codexGraph;if(!g||!id)return;g.history=g.history.slice(0,g.historyIndex+1);if(g.history[g.history.length-1]!==id)g.history.push(id);if(g.history.length>64)g.history.shift();g.historyIndex=g.history.length-1;}
    setAlien3CodexSearchV99(query,{count=true}={}){const g=this.alien3V99?.codexGraph;if(!g)return false;g.query=String(query||'').slice(0,48);if(count){g.searchUses+=1;this.alien3V99.telemetry.codexSearches+=1;this.recoverAlien3EvidenceV99('codex-search-used',{silent:true});}const entries=this.alien3CodexVisibleEntriesV99();if(entries.length){g.currentId=entries[0].id;this.markAlien3CodexViewedV99(g.currentId);this.recoverAlien3EvidenceV99('codex-search-result',{silent:true});}this.onEvent({type:'alien3-v99-codex',action:'search',query:g.query,results:entries.length});return true;}
    cycleAlien3CodexFilterV99(direction=1){const g=this.alien3V99?.codexGraph;if(!g)return false;let i=ALIEN3_CODEX_FILTERS_V99.indexOf(g.filter);i=(i+(direction<0?-1:1)+ALIEN3_CODEX_FILTERS_V99.length)%ALIEN3_CODEX_FILTERS_V99.length;g.filter=ALIEN3_CODEX_FILTERS_V99[i];g.filterUses+=1;this.alien3V99.telemetry.codexFilters+=1;this.recoverAlien3EvidenceV99('codex-filter-used',{silent:true});const entries=this.alien3CodexVisibleEntriesV99();if(entries.length)g.currentId=entries[0].id;this.audio?.ui?.();return true;}
    alien3CodexVisibleEntriesV99(){return alien3CodexSearchV99({unlocked:this.alien3CodexUnlockedV99(),viewed:this.alien3CodexViewedV99(),bookmarks:this.alien3CodexBookmarksV99(),query:this.alien3V99?.codexGraph?.query||'',filter:this.alien3V99?.codexGraph?.filter||'TOUS',category:this.alien3V98?.codexUi?.selectedCategory||'TOUS'});}
    cycleAlien3CodexPageV99(direction=1){const entries=this.alien3CodexVisibleEntriesV99();const g=this.alien3V99?.codexGraph;if(!g||!entries.length)return false;let i=entries.findIndex((x)=>x.id===g.currentId);if(i<0)i=direction<0?0:-1;const next=entries[(i+(direction<0?-1:1)+entries.length)%entries.length];g.currentId=next.id;g.linkCursor=0;this.pushAlien3CodexHistoryV99(next.id);this.markAlien3CodexViewedV99(next.id);this.audio?.ui?.();return true;}
    cycleAlien3CodexCategoryV99(direction=1){if(!this.alien3V98)return false;const cats=['TOUS','ARCHIVE','GAMEPLAY','LIEUX','PERSONNAGES','XÉNOBIOLOGIE','ÉVÉNEMENTS','SYSTÈMES','PRÉSENTATION'];let i=cats.indexOf(this.alien3V98.codexUi.selectedCategory);for(let n=0;n<cats.length;n++){i=(i+(direction<0?-1:1)+cats.length)%cats.length;this.alien3V98.codexUi.selectedCategory=cats[i];const list=this.alien3CodexVisibleEntriesV99();if(list.length){this.alien3V99.codexGraph.currentId=list[0].id;this.markAlien3CodexViewedV99(list[0].id);this.audio?.ui?.();return true;}}return false;}
    toggleAlien3CodexBookmarkV99(){const g=this.alien3V99?.codexGraph;const id=g?.currentId;if(!g||!id)return false;if(EXTENSION_IDS.has(id)){const a=g.extensionBookmarks;const i=a.indexOf(id);if(i>=0)a.splice(i,1);else{if(a.length>=12)a.shift();a.push(id);}}else super.toggleAlien3CodexBookmarkV98?.();this.audio?.ui?.();return true;}
    followAlien3CodexLinkV99(direction=1){const g=this.alien3V99?.codexGraph;if(!g?.currentId)return false;const links=alien3CodexLinksV99(g.currentId,this.alien3CodexUnlockedV99());if(!links.length)return false;g.linkCursor=(g.linkCursor+(direction<0?-1:1)+links.length)%links.length;const id=links[g.linkCursor];g.currentId=id;g.linkUses+=1;this.alien3V99.telemetry.codexLinks+=1;this.pushAlien3CodexHistoryV99(id);this.markAlien3CodexViewedV99(id);this.recoverAlien3EvidenceV99('codex-link-used',{silent:true});this.audio?.ui?.();return true;}
    alien3CodexHistoryBackV99(){const g=this.alien3V99?.codexGraph;if(!g||g.historyIndex<=0)return false;g.historyIndex-=1;g.currentId=g.history[g.historyIndex];g.historyUses+=1;this.alien3V99.telemetry.codexHistory+=1;this.markAlien3CodexViewedV99(g.currentId);this.recoverAlien3EvidenceV99('codex-history-used',{silent:true});return true;}

    syncAlien3DirectorProfileV98(initial=false){
      const before=this.alien3V98?.director?.currentProfileId||null;const profile=super.syncAlien3DirectorProfileV98(initial);if(!this.alien3V99||!profile)return profile;
      const after=profile.id;if(before&&after!==before&&!initial){const bridge=alien3CameraBridgeV99(after);const c=this.alien3V99.cameraBridge;c.activeId=bridge.id;c.fromProfileId=before;c.toProfileId=after;c.blend=0;c.seconds=0;c.changes+=1;if(!c.visited.includes(bridge.id))c.visited.push(bridge.id);this.alien3V99.telemetry.cameraBridges+=1;this.recoverAlien3EvidenceV99('camera-bridge-seen',{silent:true});if(c.visited.length===ALIEN3_CAMERA_BRIDGES_V99.length)this.recoverAlien3EvidenceV99('camera-bridges-complete',{silent:true});this.onEvent({type:'alien3-v99-camera',action:'bridge',from:before,to:after,bridgeId:bridge.id});}
      return profile;
    }
    advanceAlien3CameraBridgeV99(seconds){const c=this.alien3V99?.cameraBridge;if(!c?.activeId||c.blend>=1)return false;const bridge=ALIEN3_CAMERA_BRIDGES_V99.find((x)=>x.id===c.activeId);const duration=Math.max(.12,bridge?.enterSeconds||.4);c.seconds+=seconds;c.blend=clamp(c.seconds/duration,0,1);if(c.blend>=1)c.activeId=null;return true;}

    startAlien3AdaptiveChaseV99(chase){const s=this.alien3V99;if(!s||!chase||s.pursuit.started.includes(chase.id)||!this.alien3RunnerV88?.alive)return false;s.pursuit.activeId=chase.id;s.pursuit.started.push(chase.id);s.pursuit.activeSeconds=0;s.pursuit.pressure=Math.max(s.pursuit.pressure,chase.pressure*100);s.telemetry.chasesStarted+=1;this.onEvent({type:'alien3-v99-pursuit',action:'start',chaseId:chase.id,label:chase.label,pressure:s.pursuit.pressure});return true;}
    finishAlien3AdaptiveChaseV99(chase,outcome='clear'){const s=this.alien3V99;if(!s||s.pursuit.activeId!==chase?.id)return false;s.pursuit.activeId=null;s.pursuit.cooldown=1.1;s.pursuit.lastOutcome=outcome;if(!s.pursuit.cleared.includes(chase.id))s.pursuit.cleared.push(chase.id);s.telemetry.chasesCleared+=1;if(chase.id==='chase-foundry-cutoff')this.recoverAlien3EvidenceV99('foundry-pursuit-cleared',{silent:true});if(chase.id==='chase-patna-shadow')this.recoverAlien3EvidenceV99('patna-pursuit-cleared',{silent:true});if(s.pursuit.cleared.length===5)this.recoverAlien3EvidenceV99('five-chases-cleared',{silent:true});this.onEvent({type:'alien3-v99-pursuit',action:'clear',chaseId:chase.id,outcome,pressure:s.pursuit.pressure});return true;}
    updateAlien3AdaptivePursuitV99(seconds){
      const s=this.alien3V99;if(!s)return;s.pursuit.cooldown=Math.max(0,s.pursuit.cooldown-seconds);const sector=this.currentAlien3HybridSectorV97?.();const px=center(this.player).x;
      let chase=s.pursuit.activeId?alien3AdaptiveChaseV99(s.pursuit.activeId):null;
      if(!chase&&s.pursuit.cooldown<=0&&this.alien3RunnerV88?.alive){const candidate=alien3AdaptiveChaseAtV99(sector?.id,px);if(candidate&&!s.pursuit.started.includes(candidate.id)){this.startAlien3AdaptiveChaseV99(candidate);chase=candidate;}}
      if(!chase){s.pursuit.pressure=Math.max(0,s.pursuit.pressure-seconds*10);return;}
      s.pursuit.activeSeconds+=seconds;const lane=this.alien3V97?.hybrid?.playerLane??1;const runnerLane=this.alien3V97?.hybrid?.runnerLane??1;const distance=Math.abs((this.alien3RunnerV88?.x||0)-px);const target=clamp(chase.pressure*100+(distance<280?12:0)+(lane===runnerLane?9:0),0,100);s.pursuit.pressure+=(target-s.pursuit.pressure)*Math.min(1,seconds*2.8);s.pursuit.maxPressure=Math.max(s.pursuit.maxPressure,s.pursuit.pressure);s.telemetry.maxPressure=Math.max(s.telemetry.maxPressure,s.pursuit.pressure);
      if(this.alien3V97?.hybrid?.mode==='depth'&&!s.pursuit.cutoffs.includes(chase.id)&&s.pursuit.activeSeconds>.22){s.pursuit.cutoffs.push(chase.id);s.pursuit.runnerCutoffs+=1;if(this.alien3V98?.director&&this.alien3V98.director.runnerTelegraphClock<=0){this.alien3V98.director.runnerTelegraphFrom=runnerLane;this.alien3V98.director.runnerTelegraphTo=lane;this.alien3V98.director.runnerTelegraphClock=.38;}this.onEvent({type:'alien3-v99-pursuit',action:'cutoff',chaseId:chase.id,lane});}
      if(this.alien3V97?.hybrid?.mode==='depth'&&lane!==chase.preferredLane&&!s.pursuit.evaded.includes(chase.id)){s.pursuit.evaded.push(chase.id);s.telemetry.chasesEvaded+=1;this.recoverAlien3EvidenceV99('runner-cutoff-evaded',{silent:true});}
      if(px>=chase.targetX)this.finishAlien3AdaptiveChaseV99(chase,s.pursuit.evaded.includes(chase.id)?'lane-evade':'clear');
      if(s.pursuit.started.length===5)this.recoverAlien3EvidenceV99('five-chases-seen',{silent:true});
      if(s.pursuit.maxPressure>=65)this.recoverAlien3EvidenceV99('pressure-understood',{silent:true});
      if(this.camera&&this.player){const desired=Math.max(0,(Number(this.player.x)||0)-430+(Number(this.player.facing)||1)*chase.cameraKick*360);this.camera.x+=(desired-this.camera.x)*Math.min(1,seconds*2.1);}
    }

    update(delta){const result=super.update(delta);if(!this.isAlien3MissionV99()||!this.alien3V99||this.mission?.state!=='active')return result;const seconds=clamp(delta,0,.25);this.advanceAlien3CameraBridgeV99(seconds);this.updateAlien3AdaptivePursuitV99(seconds);this.syncAlien3CodexTerminalsV99();this.updateAlien3PerfectV99();return result;}

    drawAlien3CodexUiV98(ctx){return this.drawAlien3CodexUiV99(ctx);}
    drawAlien3CodexUiV99(ctx){
      if(!ctx||!this.alien3V98?.codexUi?.open||!this.alien3V99)return;const g=this.alien3V99.codexGraph;const entries=this.alien3CodexVisibleEntriesV99();const current=alien3DlcCodexEntryV99(g.currentId)||entries[0];if(!current)return;const unlocked=this.alien3CodexUnlockedV99(),viewed=new Set(this.alien3CodexViewedV99()),bookmarks=this.alien3CodexBookmarksV99(),links=alien3CodexLinksV99(current.id,unlocked);const idx=Math.max(0,entries.findIndex((x)=>x.id===current.id));
      ctx.save();ctx.fillStyle='rgba(1,3,3,.98)';ctx.fillRect(54,34,1172,638);ctx.strokeStyle='#92815a';ctx.lineWidth=2;ctx.strokeRect(55,35,1170,636);ctx.fillStyle='#e0ce94';ctx.font='bold 18px monospace';ctx.fillText('CODEX ALIEN 3 // FIORINA 161 // V99 GRAPH',78,70);ctx.fillStyle='#7c9184';ctx.font='11px monospace';ctx.fillText(`${unlocked.length}/90 DÉBLOQUÉS · ${viewed.size} LUS · ${Math.max(0,unlocked.length-viewed.size)} NON LUS · ${bookmarks.length} FAVORIS`,78,94);
      ctx.fillStyle='rgba(9,13,12,.95)';ctx.fillRect(76,116,208,520);ctx.strokeStyle='#354139';ctx.strokeRect(76.5,116.5,207,519);const cats=['TOUS','ARCHIVE','GAMEPLAY','LIEUX','PERSONNAGES','XÉNOBIOLOGIE','ÉVÉNEMENTS','SYSTÈMES','PRÉSENTATION'];cats.forEach((cat,i)=>{const y=145+i*34,active=cat===this.alien3V98.codexUi.selectedCategory;if(active){ctx.fillStyle='rgba(123,111,72,.25)';ctx.fillRect(86,y-19,188,27);}ctx.fillStyle=active?'#e3cf90':'#829188';ctx.font=active?'bold 10px monospace':'10px monospace';ctx.fillText(cat,98,y);});ctx.fillStyle='#788b80';ctx.font='10px monospace';ctx.fillText(`FILTRE ${g.filter}`,98,475);ctx.fillText(`RECHERCHE ${g.searchEditing?'▌':''}`,98,505);ctx.fillStyle='#b4b7a4';ctx.fillText((g.query||'—').slice(0,22),98,525);
      ctx.fillStyle='rgba(5,8,7,.96)';ctx.fillRect(300,116,300,520);ctx.strokeStyle='#354139';ctx.strokeRect(300.5,116.5,299,519);const start=Math.max(0,Math.min(Math.max(0,entries.length-10),idx-4));entries.slice(start,start+10).forEach((entry,i)=>{const y=145+i*45,active=entry.id===current.id;if(active){ctx.fillStyle='rgba(99,121,103,.23)';ctx.fillRect(310,y-20,280,35);}ctx.fillStyle=active?'#d9d9bd':'#99a39c';ctx.font=active?'bold 10px monospace':'10px monospace';ctx.fillText(`${bookmarks.includes(entry.id)?'◆':!viewed.has(entry.id)?'●':'·'} ${entry.title.slice(0,30)}`,320,y);ctx.fillStyle='#5e7167';ctx.font='9px monospace';ctx.fillText(entry.category,336,y+13);});
      ctx.fillStyle='#e0d4a5';ctx.font='bold 17px monospace';ctx.fillText(current.title,628,145);ctx.fillStyle='#819387';ctx.font='11px monospace';ctx.fillText(`${current.category} · ${idx+1}/${Math.max(1,entries.length)} · LIENS ${links.length}`,628,169);ctx.fillStyle='#bcbcac';ctx.font='13px monospace';wrap(current.body,65).slice(0,11).forEach((line,i)=>ctx.fillText(line,628,211+i*23));ctx.fillStyle='#8d9a8f';ctx.font='10px monospace';ctx.fillText('LIENS CROISÉS',628,493);links.slice(0,4).forEach((id,i)=>{const linked=alien3DlcCodexEntryV99(id);ctx.fillStyle=i===g.linkCursor?'#d9c78e':'#7f9185';ctx.fillText(`${i===g.linkCursor?'▶':'·'} ${linked?.title||id}`,642,515+i*19);});ctx.fillStyle='#65746c';ctx.fillText('[/] CAT · ,/. PAGE · B FAVORI · K FILTRE · / RECHERCHE · L LIEN · H RETOUR · C FERMER',628,614);ctx.fillText(`TERMINAUX ${g.terminalsRead.length}/7 · HISTORIQUE ${g.history.length} · RECHERCHES ${g.searchUses}`,628,633);ctx.restore();
    }

    drawHud(ctx){
      super.drawHud(ctx);if(!this.isAlien3MissionV99()||!this.alien3V99||!ctx)return;const s=this.alien3V99;const chase=alien3AdaptiveChaseV99(s.pursuit.activeId);ctx.save();ctx.fillStyle='rgba(3,5,4,.94)';ctx.fillRect(16,568,420,92);ctx.strokeStyle='#796f50';ctx.strokeRect(16.5,568.5,419,91);ctx.fillStyle='#dbc997';ctx.font='10px monospace';ctx.fillText(`V99 ADAPTIVE PURSUIT · ${chase?chase.label:'VEILLE'}`,28,588);ctx.fillStyle='#a9b1a0';ctx.fillText(`PRESSION ${Math.round(s.pursuit.pressure)} · POURSUITES ${s.pursuit.cleared.length}/5 · COUPURES ${s.pursuit.runnerCutoffs}`,28,607);const b=s.cameraBridge;ctx.fillText(`CAMÉRA ${b.visited.length}/9${b.activeId?` · TRANSITION ${Math.round(b.blend*100)}%`:''}`,28,626);ctx.fillText(`CODEX ${this.alien3CodexUnlockedV99().length}/90 · PREUVES ${s.evidenceRecovered.length}/18${s.perfectArchive.perfect?' · S++++++++++':''}`,28,645);ctx.restore();
    }

    updateAlien3PerfectV99(){const s=this.alien3V99;if(!s)return;s.perfectArchive.inheritedV98=Boolean(this.alien3V98?.perfectArchive?.perfect);s.perfectArchive.pursuitsComplete=s.pursuit.cleared.length===5;s.perfectArchive.cameraComplete=s.cameraBridge.visited.length===9;s.perfectArchive.codexUnlockComplete=this.alien3CodexUnlockedV99().length===90;s.perfectArchive.codexReadComplete=this.alien3CodexViewedV99().length===90;s.perfectArchive.codexNavigationComplete=s.telemetry.codexSearches>0&&s.telemetry.codexFilters>0&&s.telemetry.codexLinks>0&&s.telemetry.codexHistory>0;const required=ALIEN3_V99_EVIDENCE_IDS.filter((x)=>x!=='perfect-adaptive-pursuit');const ready=Object.entries(s.perfectArchive).filter(([k])=>k!=='perfect').every(([,v])=>v===true)&&required.every((id)=>s.evidenceRecovered.includes(id));if(!s.perfectArchive.perfect&&ready){s.perfectArchive.perfect=true;this.recoverAlien3EvidenceV99('perfect-adaptive-pursuit');this.onEvent({type:'alien3-v99-perfect',evidence:s.evidenceRecovered.length,codex:90});}}
    computeAlien3AchievementsV99(){const s=this.alien3V99;if(!s)return[];const ids=[];if(s.pursuit.cleared.length===5)ids.push('v99-five-pursuits');if(s.pursuit.evaded.length>=3)ids.push('v99-depth-escape-artist');if(s.pursuit.maxPressure>=80)ids.push('v99-pressure-tested');if(s.cameraBridge.visited.length===9)ids.push('v99-seamless-fiorina');if(this.alien3CodexUnlockedV99().length===90)ids.push('v99-codex-90');if(this.alien3CodexViewedV99().length===90)ids.push('v99-codex-archivist');if(s.telemetry.codexLinks>=3)ids.push('v99-cross-reference');if(s.perfectArchive.perfect)ids.push('v99-adaptive-pursuit-perfect');return ids;}

    completeAlien3MissionV89(actor=this.player){if(!this.isAlien3MissionV99()||!this.alien3V99)return super.completeAlien3MissionV89(actor);const emit=this.onEvent;let completion=null;this.onEvent=(event)=>{if(event?.type==='mission-complete'){completion=event;return;}emit(event);};let completed=false;try{completed=super.completeAlien3MissionV89(actor);}finally{this.onEvent=emit;}if(!completed)return false;this.updateAlien3PerfectV99();const s=this.alien3V99;s.achievementIds=this.computeAlien3AchievementsV99();const base=isRecord(this.mission.rewards)?this.mission.rewards:{};const grade=alien3V99Grade({gradeV98:base.mireGradeV98||'D',evidence:s.evidenceRecovered.length,chases:s.pursuit.cleared.length,codex:this.alien3CodexUnlockedV99().length,read:this.alien3CodexViewedV99().length,navigation:Number(s.telemetry.codexSearches>0)+Number(s.telemetry.codexFilters>0)+Number(s.telemetry.codexLinks>0),perfect:s.perfectArchive.perfect});const bonus={'S++++++++++':3000,'S+++++++++':2600,'S++++++++':2280,'S+++++++':1980,'S++++++':1710,'S+++++':1460,'S++++':1220,'S+++':980,'S++':760,'S+':560,S:390,A:260,B:140,C:60,D:0}[grade]||0;this.mission.rewards={...base,credits:(Number(base.credits)||0)+420+bonus,alien3V99:true,mireGradeV99:grade,v99EvidenceRecovered:[...s.evidenceRecovered],v99Achievements:[...s.achievementIds],adaptivePursuitV99:{started:[...s.pursuit.started],cleared:[...s.pursuit.cleared],evaded:[...s.pursuit.evaded],maxPressure:s.pursuit.maxPressure,runnerCutoffs:s.pursuit.runnerCutoffs},dedicatedCodexV99:{unlocked:this.alien3CodexUnlockedV99(),viewed:this.alien3CodexViewedV99(),bookmarks:this.alien3CodexBookmarksV99(),terminalsRead:[...s.codexGraph.terminalsRead],complete:this.alien3CodexUnlockedV99().length===90},perfectArchiveV99:{...s.perfectArchive}};for(const achievementId of s.achievementIds)emit({type:'alien3-v99-achievement',achievementId});emit(completion?{...completion,rewards:this.mission.rewards}:{type:'mission-complete',kills:Number(this.player?.kills)||0,rewards:this.mission.rewards,extractedBy:'primary'});return true;}

    getInteractionPrompt(actor=this.player){if(!this.isAlien3MissionV99()||!this.alien3V99)return super.getInteractionPrompt(actor);const terminal=this.alien3NearestCodexTerminalV97?.(actor);if(terminal)return`E  ${terminal.label}`;if(this.alien3V98?.codexUi?.open)return'CODEX V99 · / RECHERCHE · K FILTRE · L LIEN · H RETOUR · C FERMER';return super.getInteractionPrompt(actor)||'C  CODEX ALIEN 3';}
    captureResumeState(){const base=super.captureResumeState();if(!this.isAlien3MissionV99()||!this.alien3V99)return base;return{...base,specialOperation:{...(isRecord(base.specialOperation)?base.specialOperation:{}),alien3V99:sanitizeAlien3StateV99(this.alien3V99)}};}
    applyResumeState(rawState){const source=rawState?.specialOperation?.alien3V99||rawState?.alien3V99;const result=super.applyResumeState(rawState);if(!this.isAlien3MissionV99()||!result?.applied||!isRecord(source)||Number(source.schema)!==99)return result;this.alien3V99=sanitizeAlien3StateV99(source);this.pendingAlien3ResumeV99=this.alien3V99;this.syncAlien3CodexTerminalsV99();this.updateAlien3PerfectV99();return{...result,restored:(Number(result.restored)||0)+1,alien3DlcRestoredV99:true};}
    getAlien3SnapshotV99(){if(!this.isAlien3MissionV99()||!this.alien3V99)return{alien3V99:null};return{alien3V99:{...sanitizeAlien3StateV99(this.alien3V99),adaptiveChaseTotal:5,cameraBridgeTotal:9,dedicatedCodexTotal:90,codexTerminalTotal:7,evidenceTotal:18,combinedCodexUnlocked:this.alien3CodexUnlockedV99().length,combinedCodexViewed:this.alien3CodexViewedV99().length}};}
    getGameplayReport(){const report=super.getGameplayReport();return this.isAlien3MissionV99()?{...report,alien3V99:this.getAlien3SnapshotV99().alien3V99}:report;}
    getSnapshot(){return{...super.getSnapshot(),...this.getAlien3SnapshotV99()};}
  };
}
