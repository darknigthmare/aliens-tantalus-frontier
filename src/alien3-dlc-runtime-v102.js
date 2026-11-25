import {ALIEN3_CAMPAIGN_ID_V102,compileAlien3DecorV102,auditAlien3DecorV102,createAlien3StateV102,sanitizeAlien3StateV102,ALIEN3_HUD_RECTS_V102,sectorAt102,clamp102,playerEntryV102} from './alien3-dlc-v102.js';
import {drawAlien3BackdropV102,drawAlien3SceneryV102,drawAlien3ForegroundV102} from './alien3-art-v102.js';
import {ALIEN3_CHAPTERS_V88} from './alien3-dlc-v88.js';
import {alien3DlcCodexEntryV99,ALIEN3_DLC_CODEX_V99} from './alien3-dlc-v99.js';
import {alien3PlayerFacingCategoryV100} from './alien3-dlc-v100.js';
const clean=s=>String(s||'').replace(/\bV\d+\b/g,'').replace(/CLEMONS/g,'CLEMENS').replace(/\b(?:runtime|QA|checksum|télémétrie|telemetry|director|workprint)\b/gi,'').replace(/S\+{2,}/g,'Archive complète').replace(/\bCodex\b/gi,'Archives').replace(/\bgameplay\b/gi,'survie').replace(/\s{2,}/g,' ').trim();
const wrap=(c,s,max)=>{let line='',out=[];for(const word of clean(s).split(/\s+/)){const test=line?line+' '+word:word;if(c.measureText(test).width>max&&line){out.push(line);line=word;}else line=test;}if(line)out.push(line);return out;};
export function drawAlien3CompactHudV102(ctx,engine){
 const player=engine.player||{};const room=sectorAt102((player.x||0)+(player.w||0)/2);const chapter=ALIEN3_CHAPTERS_V88.find(c=>c.id===engine.alien3V88?.phase);
 ctx.save();ctx.textAlign='left';ctx.textBaseline='alphabetic';
 const panel=(r)=>{ctx.fillStyle='rgba(7,17,14,.82)';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle='#798369';ctx.fillRect(r.x,r.y,2,r.h);};
 panel(ALIEN3_HUD_RECTS_V102[0]);panel(ALIEN3_HUD_RECTS_V102[1]);
 ctx.font='600 12px sans-serif';ctx.fillStyle='#d4d7bc';ctx.fillText('FIORINA 161',31,31);ctx.font='11px sans-serif';ctx.fillStyle='#a5b2a0';ctx.fillText(clean(room.label),31,48,277);
 ctx.fillStyle='#c8d3b8';ctx.font='12px sans-serif';ctx.fillText(`État ${Math.round(clamp102((player.health||0)/Math.max(1,player.maxHealth||100)*100,0,100))} %`,978,33);
 ctx.fillStyle='#a6b79c';ctx.font='11px sans-serif';ctx.fillText('C  Archives',1164,33);ctx.fillStyle='#657e64';ctx.fillRect(978,43,135,3);ctx.fillStyle='#a1bd84';ctx.fillRect(978,43,135*clamp102((player.health||0)/Math.max(1,player.maxHealth||100),0,1),3);
 const raw=engine.getInteractionPrompt?.(player);let text=raw&& !/C\s+ARCHIVES/i.test(raw)?clean(raw):clean(chapter?.objective||'Rejoindre le complexe.');
 if(text){panel(ALIEN3_HUD_RECTS_V102[2]);ctx.fillStyle='#d1d3ba';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText(text,640,688,648);}
 ctx.restore();
}
export function withAlien3DlcRuntimeV102(Base){return class Alien3DlcRuntimeV102 extends Base{
 start(options={}){
  this.alien3ActiveV102=options.campaign?.id===ALIEN3_CAMPAIGN_ID_V102;
  this.alien3V102=this.alien3ActiveV102?createAlien3StateV102():null;
  this.alien3DecorSceneV102=null;this.alien3RenderStatsV102={props:0};
  const result=super.start(options);
  if(this.alien3ActiveV102){this.alien3DecorSceneV102=compileAlien3DecorV102(this.missionLevelRuntime);this.alien3DecorAuditV102=auditAlien3DecorV102(this.alien3DecorSceneV102);}
  return result;
 }
 isAlien3MissionV102(){return Boolean(this.alien3ActiveV102&&this.alien3V102);}
 // V101 drawing is intentionally superseded. Its definitions remain for old saves/tests.
 currentAlien3DecorLayoutV101(){return this.isAlien3MissionV102()?[]:super.currentAlien3DecorLayoutV101?.()||[];}
 drawAlien3DecorBandV101(c,layer){return this.isAlien3MissionV102()?0:super.drawAlien3DecorBandV101?.(c,layer);}
 drawAlien3LandmarksV101(c){return this.isAlien3MissionV102()?0:super.drawAlien3LandmarksV101?.(c);}
 getAlien3VisualFlagsV102(){const p=this.alien3V88?.phase;return {companyArrived:this.alien3V89?.company?.visible===true||['company','finale'].includes(p),leadHot:this.alien3V88?.leadPoured===true||['molten-lead','thermal-shock','company','finale'].includes(p)};}
 alien3ArtTimeV102(){return this.accessibilityRuntime?.reducedMotion||this.reducedMotion?0:(this.animationTime||0);}
 update(dt){if(this.isAlien3MissionV102()&&(!this.running||this.paused||this.alien3V98?.codexUi?.open))return;const out=super.update(dt);if(this.isAlien3MissionV102()&&this.running&&!this.paused){const id=sectorAt102(this.player?.x||0).id;if(!this.alien3V102.visited.includes(id))this.alien3V102.visited.push(id);}return out;}
 drawBackdrop(c){if(!this.isAlien3MissionV102())return super.drawBackdrop(c);return drawAlien3BackdropV102(c,{camera:this.camera,scene:this.alien3DecorSceneV102,time:this.alien3ArtTimeV102(),flags:this.getAlien3VisualFlagsV102()});}
 drawWorld(c){if(!this.isAlien3MissionV102())return super.drawWorld(c);if(this.alien3DecorSceneV102)this.alien3RenderStatsV102.props=drawAlien3SceneryV102(c,this.alien3DecorSceneV102,{camera:this.camera,time:this.alien3ArtTimeV102(),flags:this.getAlien3VisualFlagsV102(),detail:this.alien3V102.settings.detail});return super.drawWorld(c);}
 drawForeground(c){if(!this.isAlien3MissionV102())return super.drawForeground?.(c);return drawAlien3ForegroundV102(c,{camera:this.camera,actors:[this.player,this.alien3RunnerV88]});}
 drawHud(c){if(!this.isAlien3MissionV102())return super.drawHud(c);drawAlien3CompactHudV102(c,this);if(this.alien3V98?.codexUi?.open)this.drawAlien3CodexUiV102(c);}
 drawAlien3CodexUiV98(c){return this.isAlien3MissionV102()?this.drawAlien3CodexUiV102(c):super.drawAlien3CodexUiV98?.(c);}
 drawAlien3CodexUiV99(c){return this.isAlien3MissionV102()?this.drawAlien3CodexUiV102(c):super.drawAlien3CodexUiV99?.(c);}
 drawAlien3CodexUiV100(c){return this.isAlien3MissionV102()?this.drawAlien3CodexUiV102(c):super.drawAlien3CodexUiV100?.(c);}
 alien3CodexVisibleEntriesV99(){
  if(!this.isAlien3MissionV102())return super.alien3CodexVisibleEntriesV99?.()||[];
  if(typeof this.alien3CodexUnlockedV99!=='function')return (super.alien3CodexVisibleEntriesV99?.()||[]).map(playerEntryV102);
  const unlocked=new Set(this.alien3CodexUnlockedV99()),viewed=new Set(this.alien3CodexViewedV99?.()||[]),marks=new Set(this.alien3CodexBookmarksV99?.()||[]);
  const g=this.alien3V99?.codexGraph||{},category=this.alien3V98?.codexUi?.selectedCategory||'TOUS';
  const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),query=norm(g.query).trim();
  return ALIEN3_DLC_CODEX_V99.filter(e=>unlocked.has(e.id)).map(playerEntryV102).filter(e=>(category==='TOUS'||e.category===category)&&(g.filter!=='NON LUS'||!viewed.has(e.id))&&(g.filter!=='FAVORIS'||marks.has(e.id))&&(!query||norm(e.title+' '+e.body).includes(query))).sort((a,b)=>query?Number(!norm(a.title).includes(query))-Number(!norm(b.title).includes(query)):0);
 }
 drawAlien3CodexUiV102(c){
  if(!this.alien3V98?.codexUi?.open)return;
  const entries=this.alien3CodexVisibleEntriesV99?.()||[];const state=this.alien3V99?.codexGraph||{};const current=entries.find(e=>e.id===state.currentId)||entries[0];
  c.save();c.fillStyle='rgba(5,14,11,.97)';c.fillRect(54,76,1172,561);c.strokeStyle='#62735b';c.strokeRect(54.5,76.5,1171,560);c.fillStyle='#d5d5b8';c.font='25px sans-serif';c.fillText('Archives de Fiorina',81,121);c.font='12px sans-serif';c.fillStyle='#94a58f';c.fillText('C  Fermer     /  Rechercher     [ / ]  Rubrique     , / .  Dossier     B  Repère',82,149);
  const idx=Math.max(0,entries.findIndex(e=>e.id===current?.id));const offset=Math.max(0,idx-5);
  entries.slice(offset,offset+12).forEach((e,i)=>{const y=192+i*30;if(e.id===current?.id){c.fillStyle='#324934';c.fillRect(79,y-19,372,27);}c.fillStyle=e.id===current?.id?'#ddd9b9':'#9bac94';c.font='12px sans-serif';c.fillText(clean(e.title),91,y,343);});
  c.fillStyle='#dcdabe';c.font='21px sans-serif';c.fillText(clean(current?.title||'Aucun dossier découvert'),491,194,700);c.font='12px sans-serif';c.fillStyle='#8f9f85';c.fillText(alien3PlayerFacingCategoryV100(current?.category),491,220);c.font='16px sans-serif';c.fillStyle='#c4c9b1';wrap(c,current?.body||'Les documents trouvés dans le complexe apparaîtront ici.',667).slice(0,12).forEach((l,i)=>c.fillText(l,491,261+i*25));c.restore();
 }
 captureResumeState(){const out=super.captureResumeState();if(!this.isAlien3MissionV102())return out;return {...out,specialOperation:{...out.specialOperation,alien3V102:sanitizeAlien3StateV102(this.alien3V102)}};}
 applyResumeState(raw){const out=super.applyResumeState(raw);if(this.alien3ActiveV102&&out?.applied){this.alien3V102=sanitizeAlien3StateV102(raw?.specialOperation?.alien3V102);this.alien3DecorSceneV102=compileAlien3DecorV102(this.missionLevelRuntime);}return out;}
 getAlien3SnapshotV102(){return this.isAlien3MissionV102()?{alien3V102:sanitizeAlien3StateV102(this.alien3V102),decorAuditV102:this.alien3DecorAuditV102}:{alien3V102:null};}
 getSnapshot(){return {...super.getSnapshot(),...this.getAlien3SnapshotV102()};}
};}
