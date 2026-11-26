import {ALIEN3_CAMPAIGN_ID_V103,compileAlien3CirculationV103,auditAlien3CirculationV103,createAlien3StateV103,sanitizeAlien3StateV103,discoverAlien3NodesV103,reachableUtilityV103,relevantLadderV103,resolveAlien3SpaceV103} from './alien3-dlc-v103.js';
import {drawAlien3BackdropV103,drawAlien3SceneryV103,drawAlien3DoorV103,drawAlien3PlatformV103,drawAlien3MapV103} from './alien3-art-v103.js';
export function withAlien3DlcRuntimeV103(Base){return class Alien3DlcRuntimeV103 extends Base{
 start(options={}){
  this.unbindAlien3InputV103();this.alien3ActiveV103=options.campaign?.id===ALIEN3_CAMPAIGN_ID_V103;
  this.alien3V103=this.alien3ActiveV103?createAlien3StateV103():null;this.alien3MapOpenV103=false;this.alien3SceneV103=null;this.alien3UtilityCooldownV103=0;this.alien3NoticeV103=null;
  const result=super.start(options);if(this.isAlien3MissionV103()){this.alien3SceneV103=compileAlien3CirculationV103(this.missionLevelRuntime);this.alien3AuditV103=auditAlien3CirculationV103(this.alien3SceneV103);this.bindAlien3InputV103();}return result;
 }
 isAlien3MissionV103(){return Boolean(this.alien3ActiveV103&&this.alien3V103);}
 alien3ModalV103(){return Boolean(this.alien3MapOpenV103||this.alien3V98?.codexUi?.open);}
 bindAlien3InputV103(){if(this.alien3KeyV103||typeof globalThis.addEventListener!=='function')return;
  this.alien3KeyV103=event=>{if(!this.isAlien3MissionV103()||!this.running||event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
   const input=event.target; if(input?.isContentEditable||input?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
   if(this.alien3MapOpenV103){event.preventDefault?.();event.stopImmediatePropagation?.();if(!event.repeat&&['KeyM','Escape'].includes(event.code))this.closeAlien3MapV103();return;}
   if(event.repeat||this.alien3V98?.codexUi?.open)return;
   if(event.code==='KeyM'){event.preventDefault?.();event.stopImmediatePropagation?.();this.openAlien3MapV103();}
   if(event.code==='KeyI'&&!this.paused){event.preventDefault?.();event.stopImmediatePropagation?.();this.useAlien3UtilityV103();}
  };globalThis.addEventListener('keydown',this.alien3KeyV103,true);
 }
 unbindAlien3InputV103(){if(this.alien3KeyV103)globalThis.removeEventListener?.('keydown',this.alien3KeyV103,true);this.alien3KeyV103=null;}
 stop(...args){this.closeAlien3MapV103();this.unbindAlien3InputV103();return super.stop?.(...args);}
 openAlien3CodexUiV98(...a){return this.isAlien3MissionV103()&&this.alien3MapOpenV103?false:super.openAlien3CodexUiV98?.(...a);}
 openAlien3CodexUiV99(...a){return this.isAlien3MissionV103()&&this.alien3MapOpenV103?false:super.openAlien3CodexUiV99?.(...a);}
 openAlien3MapV103(){if(!this.isAlien3MissionV103()||!this.running||this.alien3V98?.codexUi?.open||this.mission?.state&&this.mission.state!=='active')return false;this.alien3MapOpenV103=true;this.clearGameplayInput?.();this.keys?.clear?.();return true;}
 closeAlien3MapV103(){const open=!!this.alien3MapOpenV103;this.alien3MapOpenV103=false;this.clearGameplayInput?.();this.keys?.clear?.();return open;}
 update(dt){if(this.isAlien3MissionV103()&&(!this.running||this.paused||this.alien3ModalV103()))return;
  const result=super.update(dt);if(!this.isAlien3MissionV103()||!this.alien3SceneV103||this.mission?.state&&this.mission.state!=='active')return result;
  const seconds=Number.isFinite(dt)?Math.max(0,Math.min(.25,dt)):0;this.alien3UtilityCooldownV103=Math.max(0,this.alien3UtilityCooldownV103-seconds);
  if(this.alien3NoticeV103)this.alien3NoticeV103.remaining-=seconds;
  const added=discoverAlien3NodesV103(this.alien3SceneV103,this.alien3V103,this.player);
  // Existing checkpoint event persistence sees the new state; no new reward is emitted.
  if(added.length)this.onEvent?.({type:'objective-action',action:'Passage ajouté au plan.'});return result;
 }
 updatePlayer(actor,dt,controls={}){
  if(!this.isAlien3MissionV103()||actor!==this.player)return super.updatePlayer?.(actor,dt,controls);
  if(this.alien3ModalV103()||this.paused)return;
  const up=[controls.up,'ArrowUp'].filter(Boolean).some(k=>this.keys?.has(k)),down=[controls.down,'ArrowDown'].filter(Boolean).some(k=>this.keys?.has(k));
  const ladder=relevantLadderV103(this.ladders,actor,Number(down)-Number(up));const hybrid=this.alien3V97?.hybrid;
  if(!hybrid||hybrid.mode!=='depth'||(!ladder&&!actor.climbing))return super.updatePlayer?.(actor,dt,controls);
  // V97 consumes vertical keys before the base controller. Scope its bypass to
  // this one update, preserving all inherited movement/collisions and restoring on error.
  const mode=hybrid.mode;hybrid.mode='side';try{return super.updatePlayer?.(actor,dt,controls);}finally{hybrid.mode=mode;}
 }
 alien3UtilityContextV103(){return {lane:this.alien3V97?.hybrid?.mode==='side'?1:this.alien3V97?.hybrid?.playerLane??this.player?.depth??1,doors:this.doors||[],running:!!this.running,paused:!!this.paused,modal:this.alien3ModalV103(),missionActive:!this.mission?.state||this.mission.state==='active'};}
 nearestAlien3UtilityV103(){if(!this.isAlien3MissionV103()||!this.alien3SceneV103)return null;const ctx=this.alien3UtilityContextV103();return this.alien3SceneV103.utilities.filter(u=>reachableUtilityV103(u,this.player,ctx)).sort((a,b)=>Math.abs(a.x-this.player.x)-Math.abs(b.x-this.player.x))[0]||null;}
 useAlien3UtilityV103(){const u=this.nearestAlien3UtilityV103();if(!u||this.alien3UtilityCooldownV103>0)return false;
  this.alien3V103.lights[u.id]=!this.alien3V103.lights[u.id];this.alien3UtilityCooldownV103=.22;
  const text=this.alien3V103.lights[u.id]?'Éclairage de service allumé.':'Éclairage de service éteint.';this.alien3NoticeV103={text,remaining:2.5};this.audio?.ui?.();this.onEvent?.({type:'objective-action',action:text});return true;
 }
 getInteractionPrompt(actor=this.player){const inherited=super.getInteractionPrompt?.(actor)||'';if(!this.isAlien3MissionV103())return inherited;if(this.alien3MapOpenV103)return '';
  // Main quest interactions keep priority; I independently operates a reachable light.
  if(/^\s*(?:E\b|V\s*\/\s*E)/i.test(inherited))return inherited;
  if(this.alien3NoticeV103?.remaining>0)return this.alien3NoticeV103.text;
  const u=this.nearestAlien3UtilityV103();if(!u)return inherited;const label=u.label.toLowerCase(),noun=label.startsWith('éclairage')?'l’'+label:'la '+label;return `I  ${this.alien3V103.lights[u.id]?'Éteindre':'Allumer'} ${noun}`;
 }
 fire(...a){return this.isAlien3MissionV103()&&this.alien3ModalV103()?false:super.fire?.(...a);}
 interact(...a){return this.isAlien3MissionV103()&&this.alien3ModalV103()?false:super.interact?.(...a);}
 useEquipment(...a){return this.isAlien3MissionV103()&&this.alien3ModalV103()?false:super.useEquipment?.(...a);}
 useMedkit(...a){return this.isAlien3MissionV103()&&this.alien3ModalV103()?false:super.useMedkit?.(...a);}
 reload(...a){return this.isAlien3MissionV103()&&this.alien3ModalV103()?false:super.reload?.(...a);}
 activateTracker(...a){return this.isAlien3MissionV103()&&this.alien3ModalV103()?false:super.activateTracker?.(...a);}
 toggleVehicle(...a){return this.isAlien3MissionV103()&&this.alien3ModalV103()?false:super.toggleVehicle?.(...a);}
 activateNeuroCountermeasure(...a){return this.isAlien3MissionV103()&&this.alien3ModalV103()?false:super.activateNeuroCountermeasure?.(...a);}
 drawStateOverlay(c){return this.isAlien3MissionV103()&&this.alien3MapOpenV103?undefined:super.drawStateOverlay?.(c);}
 drawBackdrop(c){if(!this.isAlien3MissionV103())return super.drawBackdrop(c);return drawAlien3BackdropV103(c,{camera:this.camera,player:this.player,scene:this.alien3SceneV103,time:this.alien3ArtTimeV102?.()||0,reducedMotion:this.reducedMotion||this.accessibilityRuntime?.reducedMotion});}
 drawWorld(c){if(!this.isAlien3MissionV103()||!this.alien3SceneV103)return super.drawWorld(c);
  this.alien3RenderStatsV103=drawAlien3SceneryV103(c,this.alien3SceneV103,{camera:this.camera,player:this.player,time:this.alien3ArtTimeV102?.()||0,state:this.alien3V103,flags:this.getAlien3VisualFlagsV102?.()||{},detail:this.alien3V102?.settings?.detail||'high'});
  // Suppress the V102 backplates and prop draw, not its data or historical gameplay.
  const previous=this.alien3DecorSceneV102;this.alien3DecorSceneV102=null;
  try{return super.drawWorld(c);}finally{this.alien3DecorSceneV102=previous;}
 }
 drawPlatform(c,p){return this.isAlien3MissionV103()?drawAlien3PlatformV103(c,p):super.drawPlatform?.(c,p);}
 drawDoor(c,d){return this.isAlien3MissionV103()&&this.alien3SceneV103?.gates.some(g=>g.id===d.id)?drawAlien3DoorV103(c,d):super.drawDoor?.(c,d);}
 drawHud(c){if(!this.isAlien3MissionV103())return super.drawHud(c);super.drawHud(c);if(!this.alien3ModalV103()){const room=resolveAlien3SpaceV103(this.alien3SceneV103,this.player);if(room){c.save();c.fillStyle='rgba(7,17,14,.98)';c.fillRect(29,36,283,19);c.font='11px sans-serif';c.fillStyle='#a5b2a0';c.textAlign='left';c.fillText(room.label,31,48,277);c.restore();}}if(!this.alien3V98?.codexUi?.open&&!this.alien3MapOpenV103){c.save();c.fillStyle='#b9c4a8';c.font='11px sans-serif';c.textAlign='left';c.fillText('M  Plan',880,33);c.restore();}if(this.alien3MapOpenV103)this.alien3MapLayoutV103=drawAlien3MapV103(c,this.alien3SceneV103,this.alien3V103,this.player,this.doors||[]);}
 captureResumeState(){const out=super.captureResumeState();return this.isAlien3MissionV103()?{...out,specialOperation:{...out.specialOperation,alien3V103:sanitizeAlien3StateV103(this.alien3V103)}}:out;}
 applyResumeState(raw){const result=super.applyResumeState(raw);if(this.alien3ActiveV103&&result?.applied){this.alien3V103=sanitizeAlien3StateV103(raw?.specialOperation?.alien3V103);this.alien3SceneV103=compileAlien3CirculationV103(this.missionLevelRuntime);this.alien3MapOpenV103=false;this.alien3UtilityCooldownV103=0;this.alien3NoticeV103=null;}return result;}
 getSnapshot(){return {...super.getSnapshot(),...(this.isAlien3MissionV103()?{alien3V103:sanitizeAlien3StateV103(this.alien3V103),circulationAuditV103:this.alien3AuditV103}: {})};}
};}
