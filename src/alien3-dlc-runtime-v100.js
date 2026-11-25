import {
  ALIEN3_BACKGROUND_PROFILES_V100,
  ALIEN3_CAMPAIGN_ID_V100,
  ALIEN3_UI_COPY_V100,
  ALIEN3_V100_EVIDENCE_IDS,
  alien3BackgroundProfileV100,
  alien3PlayerFacingCategoryV100,
  alien3PlayerFacingFilterV100,
  alien3ThreatLabelV100,
  alien3UiTextLooksTechnicalV100,
  createAlien3StateV100,
  sanitizeAlien3StateV100
} from './alien3-dlc-v100.js';
import { alien3AdaptiveChaseV99, alien3CodexLinksV99, alien3DlcCodexEntryV99 } from './alien3-dlc-v99.js';

const isRecord=(v)=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const wrap=(text,max=62)=>{const words=String(text||'').split(/\s+/);const out=[];let line='';for(const word of words){const next=line?`${line} ${word}`:word;if(next.length>max&&line){out.push(line);line=word;}else line=next;}if(line)out.push(line);return out;};

const TITLE_REPLACEMENTS = new Map([
  ['DIRECTEUR DE POURSUITE ADAPTATIF','LA CHASSE APPREND'],
  ['PONT DE CAMÉRA','PASSAGE ENTRE DEUX ESPACES'],
  ['CONTRATS CAMÉRA','MISE EN SCÈNE DES LIEUX'],
  ['TRANSITION DE PLAN LISSÉE','PASSAGE ENTRE LES PLANS'],
  ['TÉLÉGRAPHE INTER-PLAN','SIGNE AVANT L’ATTAQUE'],
  ['INTERFACE CODEX DÉDIÉE','ARCHIVES DE FIORINA'],
  ['PRESSION DE CHASSE','LA CHASSE SE RESSERRE'],
  ['ARCHIVE PARFAITE · PURSUIT','ARCHIVE RECONSTITUÉE'],
  ['HYBRID DIRECTOR','ORGANISATION DES LIEUX'],
  ['OCCULTANTS DE PROFONDEUR','ANGLES MORTS'],
  ['COMPORTEMENT DU RUNNER','HABITUDES DU RUNNER'],
  ['RECHERCHE CODEX','RECHERCHE DANS LES ARCHIVES'],
  ['LIENS CROISÉS','DOSSIERS LIÉS'],
  ['BRÈCHE TEMPÊTE','BRÈCHE DANS LA TEMPÊTE'],
  ['COUPE DU BLOC','COUPURE DANS LE BLOC'],
  ['RETOUR COMMUNICATIONS','RETOUR AUX COMMUNICATIONS'],
  ['COUPURE FONDERIE','EMBUSCADE DE LA FONDERIE'],
  ['OMBRE PATNA','OMBRE AVANT PATNA']
]);
function playerTitle(text){const raw=String(text||'').trim();return TITLE_REPLACEMENTS.get(raw)||raw.replace(/\bV(?:8[8-9]|9\d|100)\b/gi,'').replace(/\bHYBRID\b/gi,'').replace(/\s{2,}/g,' ').trim();}
function playerBody(text){return String(text||'')
  .replace(/\bV(?:8[8-9]|9\d|100)\b/gi,'')
  .replace(/\bHUD\b/gi,'indicateur de terrain')
  .replace(/\bframe(?:s)?\b/gi,'instant')
  .replace(/\bspawn\b/gi,'apparition')
  .replace(/Adaptive Pursuit/gi,'la chasse')
  .replace(/Hybrid Director/gi,'organisation des lieux')
  .replace(/télégraphe inter-plan/gi,'signes qui précèdent ses changements de profondeur')
  .replace(/inter-plan/gi,'entre deux profondeurs')
  .replace(/plans? de profondeur/gi,'différentes profondeurs du décor')
  .replace(/transition de plan/gi,'passage entre deux profondeurs')
  .replace(/occultants? de profondeur/gi,'angles morts')
  .replace(/pression de chasse/gi,'danger pendant la chasse')
  .replace(/Codex/gi,'archives')
  .replace(/contrat(?:s)? caméra/gi,'mise en scène')
  .replace(/gameplay/gi,'survie')
  .replace(/interface persistante/gi,'archives persistantes')
  .replace(/\s{2,}/g,' ').trim();}
function terminalLabel(text){return String(text||ALIEN3_UI_COPY_V100.terminal).replace(/^CODEX DLC\s*·\s*/i,'').replace(/ADAPTIVE PURSUIT/gi,'Archives de chasse').replace(/HYBRID DIRECTOR/gi,'Archives des lieux').trim();}
function threatTone(pressure){const p=clamp(pressure,0,100);return p>=86?'#d79572':p>=64?'#d7bd83':p>=38?'#b6c39f':'#89a995';}
const CHASE_LABELS_V100=Object.freeze({
  'chase-storm-breach':'Brèche dans la tempête',
  'chase-cellblock-crosscut':'Coupure dans le bloc',
  'chase-communications-return':'Retour aux communications',
  'chase-foundry-cutoff':'Embuscade de la fonderie',
  'chase-patna-shadow':'Ombre avant Patna'
});
function alien3EventTitleV100(event){
  if(!event||typeof event!=='object')return'Fiorina 161';
  const chase=CHASE_LABELS_V100[event.chaseId];
  if(chase&&event.action==='start')return`La chasse commence · ${chase}`;
  if(chase&&event.action==='clear')return`Le calme revient · ${chase}`;
  if(chase&&event.action==='cutoff')return`Le Runner coupe la route · ${chase}`;
  if(event.type==='alien3-v99-camera')return'Passage vers un nouvel espace';
  if(/codex/.test(String(event.type)))return event.action==='ui-open'?'Archives de Fiorina ouvertes':'Archives de Fiorina mises à jour';
  if(/achievement|perfect/.test(String(event.type)))return'Archive de Fiorina reconstituée';
  if(/presentation/.test(String(event.type)))return'Archives de Fiorina mises à jour';
  if(/^alien3-v\d+-/.test(String(event.type)))return'Progression sur Fiorina 161';
  return String(event.title||'Fiorina 161');
}

export function withAlien3DlcRuntimeV100(BaseEngine){
  return class Alien3DlcRuntimeV100 extends BaseEngine{
    start(options={}){
      this.alien3ActiveV100=String(options.campaign?.id||'')===ALIEN3_CAMPAIGN_ID_V100;
      this.alien3V100=this.alien3ActiveV100?createAlien3StateV100():null;
      this.pendingAlien3ResumeV100=null;
      const snapshot=super.start(options);
      if(!this.isAlien3MissionV100())return snapshot;
      if(this.pendingAlien3ResumeV100)this.alien3V100=sanitizeAlien3StateV100(this.pendingAlien3ResumeV100);
      this.configureAlien3PresentationV100();
      return {...snapshot,...this.getAlien3SnapshotV100()};
    }
    isAlien3MissionV100(){return Boolean(this.alien3ActiveV100||this.isAlien3MissionV99?.());}
    recoverAlien3EvidenceV100(id,{silent=false}={}){const s=this.alien3V100;if(!s||!ALIEN3_V100_EVIDENCE_IDS.includes(id)||s.evidenceRecovered.includes(id))return false;s.evidenceRecovered.push(id);if(!silent)this.onEvent?.({type:'alien3-v100-presentation',action:'archive-note',evidenceId:id});return true;}
    installAlien3PlayerFacingEventsV100(){
      if(this.alien3EventBridgeV100||typeof this.onEvent!=='function')return false;
      const downstream=this.onEvent.bind(this);this.alien3EventBridgeV100=downstream;
      this.onEvent=(event)=>{
        if(event?.type==='objective-action'&&/^alien3-v\d+:/i.test(String(event.action||'')))return downstream({...event,action:'Archives de Fiorina mises à jour'});
        if(/^alien3-v\d+-/i.test(String(event?.type||'')))return downstream({...event,title:alien3EventTitleV100(event)});
        return downstream(event);
      };
      return true;
    }
    configureAlien3PresentationV100(){
      this.alien3V100 ||= createAlien3StateV100();
      this.installAlien3PlayerFacingEventsV100();
      this.recoverAlien3EvidenceV100('immersive-hud-active',{silent:true});
      this.recoverAlien3EvidenceV100('immersive-codex-active',{silent:true});
      this.recoverAlien3EvidenceV100('technical-copy-suppressed',{silent:true});
      this.recoverAlien3EvidenceV100('event-copy-immersive',{silent:true});
      this.syncAlien3PresentationV100(true);
      return this.alien3V100;
    }
    currentAlien3BackgroundProfileV100(){const sector=this.currentAlien3HybridSectorV97?.();return alien3BackgroundProfileV100(sector?.id);}
    syncAlien3PresentationV100(initial=false){
      const s=this.alien3V100;if(!s)return null;const profile=this.currentAlien3BackgroundProfileV100();const before=s.presentation.backgroundProfileId;s.presentation.backgroundProfileId=profile.id;
      if(!s.presentation.profilesVisited.includes(profile.id))s.presentation.profilesVisited.push(profile.id);
      if(!s.presentation.topEdgeVerified.includes(profile.id)&&profile.topEdgeY===0)s.presentation.topEdgeVerified.push(profile.id);
      if(before!==profile.id&&!initial)s.telemetry.backgroundSwitches+=1;
      const evid={
        'hybrid-storm-yard':'storm-background-top-edge','hybrid-cellblock':'cellblock-background-top-edge','hybrid-foundry-hall':'foundry-background-top-edge','hybrid-furnace-patna':'patna-background-top-edge'
      }[profile.sectorId]; if(evid)this.recoverAlien3EvidenceV100(evid,{silent:true});
      if(profile.sectorId==='hybrid-service-tunnels'||profile.sectorId==='hybrid-piston-mold'||profile.sectorId==='hybrid-final-platform')this.recoverAlien3EvidenceV100('side-view-background-top-edge',{silent:true});
      if(s.presentation.topEdgeVerified.length===ALIEN3_BACKGROUND_PROFILES_V100.length)this.recoverAlien3EvidenceV100('background-top-edge-all-sectors',{silent:true});
      this.updateAlien3PerfectV100();return profile;
    }
    update(delta){const result=super.update(delta);if(this.isAlien3MissionV100()&&this.alien3V100)this.syncAlien3PresentationV100();return result;}

    drawAlien3TopArchitectureV100(ctx,profile){
      const W=1280;const depth=Math.max(70,Number(profile?.ceilingDepth)||94);ctx.save();ctx.globalAlpha=.62;
      ctx.fillStyle='rgba(7,10,10,.96)';ctx.fillRect(0,0,W,20);
      const step=profile?.topArchitecture===1?158:profile?.topArchitecture===2?196:176;
      for(let x=-40,i=0;x<W+80;x+=step,i+=1){const h=depth+((i%3)*28);ctx.fillStyle=i%2?'rgba(12,16,15,.78)':'rgba(15,19,18,.72)';ctx.fillRect(x,0,46,h);ctx.fillStyle='rgba(64,70,63,.20)';ctx.fillRect(x+44,0,3,h+38);}
      ctx.strokeStyle='rgba(105,96,72,.22)';ctx.lineWidth=3;for(let x=80;x<W;x+=260){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+42,depth+70);ctx.stroke();}
      ctx.restore();
    }
    drawBackdrop(ctx){
      if(!this.isAlien3MissionV100()||!this.alien3V100||!ctx)return super.drawBackdrop(ctx);
      const profile=this.syncAlien3PresentationV100();const W=1280,H=720;const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,profile.skyTop);grad.addColorStop(.58,profile.skyMid);grad.addColorStop(1,profile.ground);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
      const cy=Number(this.camera?.y)||0;
      const far=this.images?.get?.('far');const mid=this.images?.get?.('mid');
      const farOverscan=1.12,midOverscan=1.14;
      const farTop=(H*farOverscan-H)*.5+cy*.04;const midTop=(H*midOverscan-H)*.5+cy*.18;
      if(typeof this.drawCoverLayer==='function'){
        const farReady=Boolean(far?.complete&&Number(far?.naturalWidth)>0&&Number(far?.naturalHeight)>0);
        if(farReady)this.drawCoverLayer(ctx,far,.09,.04,profile.farAlpha,farOverscan,farTop);
        else if(this.fallbackBackground)this.drawCoverLayer(ctx,this.fallbackBackground,.08,.04,.20,1.08,(H*1.08-H)*.5+cy*.04);
        this.drawCoverLayer(ctx,mid,.42,.18,profile.midAlpha,midOverscan,midTop);
      }
      this.drawAlien3TopArchitectureV100(ctx,profile);
      this.drawCeilingCables?.(ctx);
      const haze=ctx.createLinearGradient(0,0,0,220);haze.addColorStop(0,'rgba(15,19,18,.48)');haze.addColorStop(1,'rgba(15,19,18,0)');ctx.fillStyle=haze;ctx.fillRect(0,0,W,220);
      const vignette=ctx.createRadialGradient(640,345,210,640,345,780);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,3,4,.58)');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
      this.alien3V100.telemetry.topEdgeDraws+=1;return true;
    }

    alien3ImmersiveThreatV100(){return alien3ThreatLabelV100(this.alien3V99?.pursuit?.pressure||0);}
    alien3ImmersiveSectorModeV100(){const sector=this.currentAlien3HybridSectorV97?.();return sector?.mode==='depth'?ALIEN3_UI_COPY_V100.zoneOpen:ALIEN3_UI_COPY_V100.zoneTight;}
    alien3EnvironmentLineV100(){const e=this.alien3V96?.environment;if(!e)return'';const power=(e.powerLevel||0)>.66?'courant stable':(e.powerLevel||0)>.28?'courant faible':'courant instable';const vis=(e.visibility||0)>.7?'visibilité claire':(e.visibility||0)>.42?'visibilité réduite':'visibilité mauvaise';return`${Math.round(Number(e.temperature)||0)}°C · ${power} · ${vis}`;}
    clearAlien3TechnicalHudV100(ctx){ctx.save();ctx.fillStyle='rgba(3,6,6,.95)';ctx.fillRect(892,244,378,426);ctx.fillRect(10,562,1260,108);ctx.restore();}
    drawAlien3TransitionBannerV100(ctx){const h=this.alien3V97?.hybrid;if(!h?.transitionClock)return;ctx.save();ctx.fillStyle='rgba(5,9,8,.95)';ctx.fillRect(350,62,580,74);ctx.strokeStyle='#6f7d70';ctx.strokeRect(350.5,62.5,579,73);ctx.fillStyle='#e0ddc7';ctx.font='bold 14px monospace';ctx.fillText(this.alien3ImmersiveSectorModeV100(),382,89);ctx.fillStyle='#9fa99e';ctx.font='11px monospace';ctx.fillText(playerBody(this.currentAlien3HybridSectorV97?.().reason||'La configuration du lieu change.'),382,112);ctx.restore();}
    drawHud(ctx){
      if(!this.isAlien3MissionV100()||!this.alien3V100||!ctx)return super.drawHud(ctx);
      const originalFillText=typeof ctx.fillText==='function'?ctx.fillText.bind(ctx):null;
      if(originalFillText)ctx.fillText=(text,...args)=>{if(!alien3UiTextLooksTechnicalV100(text))originalFillText(text,...args);};
      try{super.drawHud(ctx);}finally{if(originalFillText)ctx.fillText=originalFillText;}
      this.clearAlien3TechnicalHudV100(ctx);const s=this.alien3V99;const chase=alien3AdaptiveChaseV99(s?.pursuit?.activeId);const sector=this.currentAlien3HybridSectorV97?.();const pressure=s?.pursuit?.pressure||0;const unread=Math.max(0,(this.alien3CodexUnlockedV99?.().length||0)-(this.alien3CodexViewedV99?.().length||0));
      ctx.save();
      ctx.fillStyle='rgba(4,8,7,.92)';ctx.fillRect(24,576,510,80);ctx.strokeStyle='#625c42';ctx.strokeRect(24.5,576.5,509,79);ctx.fillStyle=threatTone(pressure);ctx.font='bold 12px monospace';ctx.fillText('CHASSE',42,598);ctx.fillStyle='#dedfcf';ctx.font='bold 14px monospace';ctx.fillText(this.alien3ImmersiveThreatV100(),42,620);ctx.fillStyle='#9ca79e';ctx.font='10px monospace';ctx.fillText(chase?playerTitle(chase.label):'Aucun mouvement confirmé',42,640);
      ctx.fillStyle='rgba(4,8,7,.92)';ctx.fillRect(748,576,508,80);ctx.strokeStyle='#52685d';ctx.strokeRect(748.5,576.5,507,79);ctx.fillStyle='#9ec0aa';ctx.font='bold 12px monospace';ctx.fillText(ALIEN3_UI_COPY_V100.archiveTitle,768,598);ctx.fillStyle='#dfe6e0';ctx.font='11px monospace';ctx.fillText(`${ALIEN3_UI_COPY_V100.archiveSubtitle} · ${this.alien3CodexUnlockedV99?.().length||0}`,768,620);ctx.fillStyle='#95a69c';ctx.fillText(`${unread} ${ALIEN3_UI_COPY_V100.unread.toLowerCase()} · ${this.alien3CodexBookmarksV99?.().length||0} ${ALIEN3_UI_COPY_V100.bookmarks.toLowerCase()}${s?.perfectArchive?.perfect?' · '+ALIEN3_UI_COPY_V100.complete:''}`,768,640);
      ctx.fillStyle='rgba(4,8,7,.88)';ctx.fillRect(918,258,330,74);ctx.strokeStyle='#3e5148';ctx.strokeRect(918.5,258.5,329,73);ctx.fillStyle='#879b90';ctx.font='10px monospace';ctx.fillText('FIORINA 161',936,279);ctx.fillStyle='#d9dfda';ctx.font='bold 12px monospace';ctx.fillText(playerTitle(sector?.label||'Secteur inconnu'),936,299);ctx.fillStyle='#8da096';ctx.font='10px monospace';ctx.fillText(`${this.alien3ImmersiveSectorModeV100()}${this.alien3EnvironmentLineV100()?' · '+this.alien3EnvironmentLineV100():''}`.slice(0,50),936,318);
      ctx.restore();this.drawAlien3TransitionBannerV100(ctx);this.alien3V100.telemetry.hudDraws+=1;this.recoverAlien3EvidenceV100('archive-copy-immersive',{silent:true});
      if(this.alien3V98?.codexUi?.open)this.drawAlien3CodexUiV100(ctx);
    }

    drawAlien3CodexUiV98(ctx){return this.drawAlien3CodexUiV100(ctx);}
    drawAlien3CodexUiV99(ctx){return this.drawAlien3CodexUiV100(ctx);}
    drawAlien3CodexUiV100(ctx){
      if(!ctx||!this.alien3V98?.codexUi?.open||!this.alien3V99)return;const g=this.alien3V99.codexGraph;const entries=this.alien3CodexVisibleEntriesV99?.()||[];const current=alien3DlcCodexEntryV99(g.currentId)||entries[0];if(!current)return;const unlocked=this.alien3CodexUnlockedV99?.()||[];const viewed=new Set(this.alien3CodexViewedV99?.()||[]);const bookmarks=this.alien3CodexBookmarksV99?.()||[];const links=alien3CodexLinksV99(current.id,unlocked);const idx=Math.max(0,entries.findIndex((x)=>x.id===current.id));
      ctx.save();ctx.fillStyle='rgba(2,5,5,.995)';ctx.fillRect(0,0,1280,720);ctx.fillStyle='rgba(6,11,10,.98)';ctx.fillRect(52,32,1176,642);ctx.strokeStyle='#6b756a';ctx.lineWidth=2;ctx.strokeRect(53,33,1174,640);
      ctx.fillStyle='#dfdcc4';ctx.font='bold 20px monospace';ctx.fillText(ALIEN3_UI_COPY_V100.archiveTitle,78,70);ctx.fillStyle='#87988e';ctx.font='11px monospace';ctx.fillText(`${unlocked.length} dossiers retrouvés · ${viewed.size} consultés · ${Math.max(0,unlocked.length-viewed.size)} à lire · ${bookmarks.length} repères`,78,94);
      ctx.fillStyle='rgba(8,14,12,.96)';ctx.fillRect(76,116,208,520);ctx.strokeStyle='#2f4038';ctx.strokeRect(76.5,116.5,207,519);const cats=['TOUS','ARCHIVE','GAMEPLAY','LIEUX','PERSONNAGES','XÉNOBIOLOGIE','ÉVÉNEMENTS','SYSTÈMES','PRÉSENTATION'];cats.forEach((cat,i)=>{const y=145+i*34,active=cat===this.alien3V98.codexUi.selectedCategory;if(active){ctx.fillStyle='rgba(82,105,91,.30)';ctx.fillRect(86,y-19,188,27);}ctx.fillStyle=active?'#e0e7e1':'#83948b';ctx.font=active?'bold 10px monospace':'10px monospace';ctx.fillText(alien3PlayerFacingCategoryV100(cat).toUpperCase(),98,y);});ctx.fillStyle='#81948a';ctx.font='10px monospace';ctx.fillText(`AFFICHER · ${alien3PlayerFacingFilterV100(g.filter)}`,98,475);ctx.fillText(`${ALIEN3_UI_COPY_V100.search.toUpperCase()}${g.searchEditing?' ·':''}`,98,505);ctx.fillStyle='#c1cac4';ctx.fillText((g.query||'—').slice(0,22),98,525);
      ctx.fillStyle='rgba(5,9,8,.97)';ctx.fillRect(300,116,300,520);ctx.strokeStyle='#2f4038';ctx.strokeRect(300.5,116.5,299,519);const start=Math.max(0,Math.min(Math.max(0,entries.length-10),idx-4));entries.slice(start,start+10).forEach((entry,i)=>{const y=145+i*45,active=entry.id===current.id;if(active){ctx.fillStyle='rgba(72,98,83,.27)';ctx.fillRect(310,y-20,280,35);}ctx.fillStyle=active?'#e2e7e1':'#9aa79f';ctx.font=active?'bold 10px monospace':'10px monospace';ctx.fillText(`${bookmarks.includes(entry.id)?'◆':!viewed.has(entry.id)?'●':'·'} ${playerTitle(entry.title).slice(0,30)}`,320,y);ctx.fillStyle='#65776d';ctx.font='9px monospace';ctx.fillText(alien3PlayerFacingCategoryV100(entry.category).toUpperCase(),336,y+13);});
      ctx.fillStyle='#e0dcc7';ctx.font='bold 17px monospace';ctx.fillText(playerTitle(current.title),628,145);ctx.fillStyle='#83968b';ctx.font='11px monospace';ctx.fillText(`${alien3PlayerFacingCategoryV100(current.category)} · dossier ${idx+1}/${Math.max(1,entries.length)}`,628,169);ctx.fillStyle='#c0c5bd';ctx.font='13px monospace';wrap(playerBody(current.body),65).slice(0,11).forEach((line,i)=>ctx.fillText(line,628,211+i*23));ctx.fillStyle='#91a79a';ctx.font='10px monospace';ctx.fillText(ALIEN3_UI_COPY_V100.related.toUpperCase(),628,493);links.slice(0,4).forEach((id,i)=>{const linked=alien3DlcCodexEntryV99(id);ctx.fillStyle=i===g.linkCursor?'#dfcf9b':'#84988c';ctx.fillText(`${i===g.linkCursor?'▶':'·'} ${playerTitle(linked?.title||id)}`,642,515+i*19);});ctx.fillStyle='#71847a';ctx.fillText('[ / ] rubrique · , / . dossier · B repère · K filtre · / recherche · L dossier lié · H précédent · C fermer',628,614);ctx.fillText(`${g.terminalsRead.length} terminaux consultés · ${g.history.length} consultations récentes`,628,633);ctx.restore();this.alien3V100.telemetry.codexDraws+=1;this.recoverAlien3EvidenceV100('archive-copy-immersive',{silent:true});
    }

    phaseLabel(){return playerBody(super.phaseLabel?.()||'FIORINA 161').replace(/\bALIEN 3\b/gi,'Fiorina 161');}
    objectiveProgressText(){return playerBody(super.objectiveProgressText?.()||'Progression en cours.');}
    getInteractionPrompt(actor=this.player){
      if(!this.isAlien3MissionV100())return super.getInteractionPrompt(actor);const terminal=this.alien3NearestCodexTerminalV97?.(actor);if(terminal)return`E  ${ALIEN3_UI_COPY_V100.terminal.toUpperCase()} · ${terminalLabel(terminal.label)}`;if(this.alien3V98?.codexUi?.open)return'C  FERMER LES ARCHIVES · / RECHERCHER · L OUVRIR LE DOSSIER LIÉ · H RETOUR';return super.getInteractionPrompt(actor)?.replace(/CODEX(?:\s+V\d+)?/gi,'ARCHIVES')||'C  ARCHIVES DE FIORINA';
    }
    updateAlien3PerfectV100(){const s=this.alien3V100;if(!s)return false;const ready=s.presentation.topEdgeVerified.length===9&&s.presentation.immersiveHud&&s.presentation.immersiveCodex&&s.presentation.technicalCopySuppressed&&s.presentation.eventCopyImmersive;if(ready){s.perfectPresentation=true;this.recoverAlien3EvidenceV100('presentation-pass-complete',{silent:true});}return s.perfectPresentation;}
    captureResumeState(){const base=super.captureResumeState();if(!this.isAlien3MissionV100()||!this.alien3V100)return base;return{...base,specialOperation:{...(isRecord(base.specialOperation)?base.specialOperation:{}),alien3V100:sanitizeAlien3StateV100(this.alien3V100)}};}
    applyResumeState(rawState){const source=rawState?.specialOperation?.alien3V100||rawState?.alien3V100;const result=super.applyResumeState(rawState);if(!this.isAlien3MissionV100()||!result?.applied||!isRecord(source)||Number(source.schema)!==100)return result;this.alien3V100=sanitizeAlien3StateV100(source);this.pendingAlien3ResumeV100=this.alien3V100;this.updateAlien3PerfectV100();return{...result,restored:(Number(result.restored)||0)+1,alien3DlcRestoredV100:true};}
    getAlien3SnapshotV100(){if(!this.isAlien3MissionV100()||!this.alien3V100)return{alien3V100:null};return{alien3V100:{...sanitizeAlien3StateV100(this.alien3V100),backgroundProfilesTotal:9,topEdgeAnchored:this.alien3V100.presentation.topEdgeVerified.length===9,uiTechnicalCopySuppressed:this.alien3V100.presentation.technicalCopySuppressed,uiSamples:[ALIEN3_UI_COPY_V100.archiveTitle,this.alien3ImmersiveThreatV100(),this.alien3ImmersiveSectorModeV100()].filter((x)=>!alien3UiTextLooksTechnicalV100(x))}};}
    getGameplayReport(){const report=super.getGameplayReport();return this.isAlien3MissionV100()?{...report,alien3V100:this.getAlien3SnapshotV100().alien3V100}:report;}
    getSnapshot(){return{...super.getSnapshot(),...this.getAlien3SnapshotV100()};}
  };
}
