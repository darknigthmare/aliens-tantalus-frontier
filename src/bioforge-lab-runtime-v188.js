// V188 — Bioforge containment lab runtime (spec 013). Mixin applied after
// withBioforgeRuntimeV80 (appended at the end of the composition; the V80 chain
// and its guards are untouched). It adds:
//  - a walk without session ("standby") in the control room and cold storage,
//    armed only while the Bioforge view is shown;
//  - a physical exit after a successful purge ("egress"): the cell exits open,
//    the purge atlas plays, and the hub door opens only after the exit
//    decontamination cycle; crossing it returns to the Tantalus;
//  - read-only laboratory interactions (cold storage, terminal, analysis,
//    incinerator) and in-world prompts;
//  - the lab presentation (bioforge-lab-render-v188.js).
// Neither walk writes the save: the periodic physical checkpoint is suppressed
// while no session is fighting. Session rules, ids and saves are unchanged.
import {
  BIOFORGE_ENTRY_MIST_SECONDS_V188, createBioforgeExitDeconV188, stepBioforgeExitDeconV188, isInsideBioforgeExitBoothV188,
  resolveBioforgeLabInteractionV188, getBioforgeTankDisplayV188, getBioforgeAdmissionBoardV188, getBioforgeLabZoneV188,
  buildBioforgeColdStorageReportV188, buildBioforgeAnalysisReportV188, buildBioforgeIncineratorReportV188,
  BIOFORGE_EXIT_DECON_SECONDS_V188, BIOFORGE_LAB_PHASE_LABELS_V188
} from './bioforge-lab-layout-v188.js';
import {
  createBioforgeLabVfxV188, drawBioforgeLabBackV188, drawBioforgeLabPartitionsV188, drawBioforgeLabFrontV188,
  drawBioforgeLabCaptionV188, stepBioforgeLabAmbienceV188, BIOFORGE_LAB_FOREGROUND_ALPHA_V188
} from './bioforge-lab-render-v188.js';

export const BIOFORGE_AMBULATORY_KEYS_V188 = Object.freeze(['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'KeyE']);
export const BIOFORGE_PURGE_ANIMATION_SECONDS_V188 = 1.6;
export const BIOFORGE_LAB_CAPTION_SECONDS_V188 = 4;
const MOVE_KEYS = new Set(['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight']);
const PHASE_LABELS_V188 = BIOFORGE_LAB_PHASE_LABELS_V188;
const VIEW_W = 1280;

function labRandom(seed = 188) {
  let value = seed >>> 0 || 1;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

export function withBioforgeContainmentLabV188(Base) {
  return class BioforgeContainmentLabV188 extends Base {
    constructor(canvas, options = {}) {
      super(canvas, options);
      this.bioforgeLabVfxV188 = createBioforgeLabVfxV188();
      this.bioforgeLabRandomV188 = labRandom(188);
      this.bioforgeAmbulatoryV188 = null;
      this.bioforgeAmbulatoryArmedV188 = false;
      this.bioforgeExitDeconV188 = createBioforgeExitDeconV188();
      this.bioforgeEntryMistV188 = 0;
      this.bioforgeLabCaptionV188 = null;
      this.bioforgePurgeAnimationV188 = 0;
      this.bioforgeEgressDoneV188 = false;
      this.bioforgeLabDisplayCacheV188 = { key: null, tanks: [], board: [] };
      // The V51 keydown handler ignores keys while the engine is stopped. This
      // second listener only starts a lab walk; every later key goes through it.
      globalThis.addEventListener?.('keydown', (event) => {
        if (this.running || event.repeat || !BIOFORGE_AMBULATORY_KEYS_V188.includes(event.code)) return;
        if (!this.bioforgeAmbulatoryArmedV188 || !this.canRouteGameplayKey(event)) return;
        if (event.code === 'KeyE') this.interact(this.player);
        else if (this.setHeldGameplayKeyV77(event.code, true, 'keyboard') !== false && this.running) event.preventDefault?.();
      });
    }

    /** Called by the app while the Bioforge view is shown; stop() disarms. */
    armBioforgeAmbulatoryV188(armed = true) {
      this.bioforgeAmbulatoryArmedV188 = armed === true;
      return this.bioforgeAmbulatoryArmedV188;
    }

    getBioforgeAmbulatoryModeV188() {
      if (this.running || !this.bioforgeAmbulatoryArmedV188 || !this.player?.alive || !this.bioforgePreparedV80) return null;
      if (this.bioforgeLastErrorV80 === 'persistence-failed') return null;
      const root = this.bioforgeRootV80, session = root?.activeSession;
      if (!session && !root?.recovery?.purgeRequired) return 'standby';
      const cellDoor = this.doors?.find(door => door.id === 'arena-containment');
      if (session?.phase === 'return' && !this.bioforgeEgressDoneV188 && cellDoor && this.player.x >= cellDoor.x + cellDoor.w) return 'egress';
      return null;
    }

    beginBioforgeAmbulatoryV188(mode = this.getBioforgeAmbulatoryModeV188()) {
      if (!mode || this.running) return false;
      this.bioforgeAmbulatoryV188 = mode;
      this.bioforgePresentationActiveV126 = true;
      this.running = true;
      this.paused = false;
      this.bioforgeSnapshotClockV87 = 0;
      if (mode === 'egress') {
        this.bioforgeExitDeconV188 = createBioforgeExitDeconV188();
        this.bioforgePurgeAnimationV188 = 0;
        this.syncBioforgePhaseV80();
      }
      this.preparePlayerWeaponAssetsV125?.();
      this.last = globalThis.performance?.now?.() || 0;
      const generation = this.loopGeneration = (this.loopGeneration || 0) + 1;
      if (this.bioforgeAutoLoopV80 && typeof globalThis.requestAnimationFrame === 'function') {
        globalThis.requestAnimationFrame((time) => this.loop(time, generation));
      }
      this.emitBioforgeV80({ type: 'bioforge-ambulatory-started', mode });
      return true;
    }

    endBioforgeAmbulatoryV188() {
      if (!this.bioforgeAmbulatoryV188) return false;
      this.bioforgeAmbulatoryV188 = null;
      this.running = false;
      this.loopGeneration = (this.loopGeneration || 0) + 1;
      this.clearGameplayInput?.();
      return true;
    }

    setHeldGameplayKeyV77(code, active, source = 'keyboard') {
      if (active && !this.running && MOVE_KEYS.has(code) && !this.isBioforgeFormFocusedV87?.()) this.beginBioforgeAmbulatoryV188();
      return super.setHeldGameplayKeyV77(code, active, source);
    }

    prepare(rawState = null, options = {}) {
      this.endBioforgeAmbulatoryV188();
      this.bioforgeEgressDoneV188 = false;
      this.bioforgeExitDeconV188 = createBioforgeExitDeconV188();
      this.bioforgeLabCaptionV188 = null;
      return super.prepare(rawState, options);
    }

    start(options = {}) {
      const standby = this.bioforgeAmbulatoryV188 === 'standby' && this.player ? { x: this.player.x, facing: this.player.facing } : null;
      this.endBioforgeAmbulatoryV188();
      this.bioforgeEgressDoneV188 = false;
      this.bioforgeExitDeconV188 = createBioforgeExitDeconV188();
      const result = super.start(options);
      // A fresh session keeps the operator where they stood in the control room.
      const controlSeal = this.doors?.find(door => door.id === 'control-seal');
      if (standby && result?.started && this.bioforgeSourceV80 !== 'resume' && controlSeal
        && this.bioforgeRootV80.activeSession?.phase === 'configuration' && this.bioforgeTransferStageV80 === 0
        && standby.x + this.player.w <= controlSeal.x) {
        this.player.x = standby.x;
        this.player.facing = standby.facing;
        this.camera.x = Math.max(0, Math.min(this.bioforgeLevelV80.world.width - VIEW_W, this.player.x - 430));
      }
      return result;
    }

    stop(options = {}) {
      this.bioforgeAmbulatoryArmedV188 = false;
      this.bioforgeAmbulatoryV188 = null;
      return super.stop(options);
    }

    purgeBioforgeV80(reason = 'manual-purge') {
      this.bioforgeAmbulatoryV188 = null;
      this.bioforgeEgressDoneV188 = false;
      this.bioforgePurgeAnimationV188 = 0;
      return super.purgeBioforgeV80(reason);
    }

    syncBioforgePhaseV80() {
      const phase = super.syncBioforgePhaseV80();
      if (this.bioforgeAmbulatoryV188 === 'egress' && !this.bioforgeExitDeconV188?.complete) {
        const door = this.doors?.find(entry => entry.id === 'hub-return');
        if (door) {
          if (door.open) door.visualDirection = 'closing';
          Object.assign(door, { open: false, locked: true, reason: 'decontamination-required' });
        }
      }
      return phase;
    }

    update(delta) {
      // No periodic physical checkpoint while walking outside a fight.
      if (this.bioforgeAmbulatoryV188) this.bioforgeSnapshotClockV87 = 0;
      super.update(delta);
      if (!this.running || this.paused || this.enemyAtlasLoadingPausedV65) return;
      const dt = Math.max(0, Math.min(0.1, Number(delta) || 0));
      if (!dt) return;
      this.bioforgeEntryMistV188 = Math.max(0, this.bioforgeEntryMistV188 - dt);
      if (this.bioforgeLabCaptionV188) {
        this.bioforgeLabCaptionV188.remaining -= dt;
        if (this.bioforgeLabCaptionV188.remaining <= 0) this.bioforgeLabCaptionV188 = null;
      }
      if (this.bioforgeAmbulatoryV188 === 'egress') this.updateBioforgeEgressV188(dt);
      stepBioforgeLabAmbienceV188(this.bioforgeLabVfxV188, dt, this.buildBioforgeLabViewV188(), this.bioforgeLabRandomV188);
    }

    updateBioforgeEgressV188(dt) {
      this.bioforgePurgeAnimationV188 += dt;
      const decon = this.bioforgeExitDeconV188;
      const wasComplete = decon.complete, wasActive = decon.active;
      stepBioforgeExitDeconV188(decon, { dt, inside: isInsideBioforgeExitBoothV188(this.bioforgeLevelV80, this.player) });
      if (wasActive && !decon.active && !decon.complete) {
        this.setBioforgeLabCaptionV188('DÉCONTAMINATION INTERROMPUE · RESTEZ DANS LA CABINE');
        this.emitBioforgeV80({ type: 'bioforge-exit-decon-interrupted' });
      }
      if (!wasComplete && decon.complete) {
        this.syncBioforgePhaseV80();
        this.setBioforgeLabCaptionV188('DÉCONTAMINATION TERMINÉE · RETOUR AU TANTALUS AUTORISÉ');
        this.emitBioforgeV80({ type: 'bioforge-exit-decon-complete' });
      }
      const exit = this.doors.find(door => door.id === 'hub-return');
      if (decon.complete && exit?.open && this.player.x + this.player.w >= exit.x + exit.w - 4) {
        this.bioforgeEgressDoneV188 = true;
        this.endBioforgeAmbulatoryV188();
        this.emitBioforgeV80({ type: 'bioforge-egress-complete', sessionId: this.bioforgeRootV80.activeSession?.id || null });
      }
    }

    getBioforgeLabModeV188() {
      if (this.bioforgeAmbulatoryV188) return this.bioforgeAmbulatoryV188;
      return this.running && this.bioforgeRootV80.activeSession?.phase === 'configuration' ? 'session' : null;
    }

    resolveBioforgeLabPromptV188() {
      const target = resolveBioforgeLabInteractionV188(this.bioforgeLevelV80, this.player,
        { mode: this.getBioforgeLabModeV188(), stage: this.bioforgeTransferStageV80 });
      // A running or finished exit cycle needs no further press.
      if (target?.kind === 'exit-decon' && (this.bioforgeExitDeconV188.active || this.bioforgeExitDeconV188.complete)) return null;
      return target;
    }

    setBioforgeLabCaptionV188(text) {
      this.bioforgeLabCaptionV188 = { text, remaining: BIOFORGE_LAB_CAPTION_SECONDS_V188 };
      return text;
    }

    interact(actor = this.player) {
      if (actor !== this.player || !actor?.alive || this.isBioforgeFormFocusedV87()) return false;
      if (!this.running && !this.beginBioforgeAmbulatoryV188()) return super.interact(actor);
      if (this.paused) return false;
      const target = this.resolveBioforgeLabPromptV188();
      if (!target || target.kind === 'stage') {
        const stage = this.bioforgeTransferStageV80;
        const result = super.interact(actor);
        if (result && stage === 1 && this.bioforgeTransferStageV80 === 2) this.bioforgeEntryMistV188 = BIOFORGE_ENTRY_MIST_SECONDS_V188;
        return result;
      }
      return this.useBioforgeLabInteractionV188(target);
    }

    useBioforgeLabInteractionV188(target) {
      const root = this.bioforgeRootV80;
      let report = null;
      if (target.kind === 'cold-storage') report = buildBioforgeColdStorageReportV188(root);
      else if (target.kind === 'analysis') report = buildBioforgeAnalysisReportV188(root);
      else if (target.kind === 'incinerator') report = buildBioforgeIncineratorReportV188(this.bioforgeLastPurgeV80);
      else if (target.kind === 'terminal') {
        this.setBioforgeLabCaptionV188('TERMINAL DE CONTRÔLE · COMPOSITION ET LANCEMENT');
        this.emitBioforgeV80({ type: 'bioforge-terminal-requested' });
        return true;
      } else if (target.kind === 'exit-decon') {
        const decon = this.bioforgeExitDeconV188;
        if (decon.complete) this.setBioforgeLabCaptionV188('DÉCONTAMINATION TERMINÉE · RETOUR AU TANTALUS AUTORISÉ');
        else if (!isInsideBioforgeExitBoothV188(this.bioforgeLevelV80, this.player)) this.setBioforgeLabCaptionV188('ENTREZ DANS LA CABINE DE DÉCONTAMINATION');
        else if (!decon.active) {
          decon.active = true; decon.clock = 0;
          this.setBioforgeLabCaptionV188('DÉCONTAMINATION EN COURS · RESTEZ DANS LA CABINE');
          this.emitBioforgeV80({ type: 'bioforge-exit-decon-started', seconds: BIOFORGE_EXIT_DECON_SECONDS_V188 });
        }
        return true;
      } else return false;
      this.setBioforgeLabCaptionV188(report.text);
      this.emitBioforgeV80({ type: 'bioforge-lab-report', kind: target.kind, text: report.text });
      return true;
    }

    buildBioforgeLabViewV188() {
      const root = this.bioforgeRootV80, session = root?.activeSession;
      const key = `${session?.id || 'none'}|${session?.phase || ''}|${session?.printedCount || 0}|${session?.queue?.length || 0}|${session?.cancelledIds?.length || 0}|${JSON.stringify(root?.configuration?.composition || [])}`;
      const cache = this.bioforgeLabDisplayCacheV188;
      if (cache.key !== key) Object.assign(cache, { key, tanks: getBioforgeTankDisplayV188(root), board: getBioforgeAdmissionBoardV188(root) });
      const mode = this.getBioforgeLabModeV188();
      return {
        level: this.bioforgeLevelV80, cameraX: Number(this.camera?.x || 0), doors: this.doors || [], platforms: this.platforms || [],
        ladders: this.ladders || [], phase: session?.phase || (root?.recovery?.purgeRequired ? 'purging' : 'configuration'),
        stage: this.bioforgeTransferStageV80, time: Number(this.animationTime || 0),
        reducedMotion: Boolean(this.reducedMotion || this.accessibilityRuntime?.reducedMotion),
        tanks: cache.tanks, board: cache.board, exitDecon: this.bioforgeExitDeconV188, entryMist: this.bioforgeEntryMistV188,
        egress: mode === 'egress', vfx: this.bioforgeLabVfxV188,
        prompt: this.running && !this.paused && this.player?.alive ? this.resolveBioforgeLabPromptV188() : null
      };
    }

    drawBioforgeStationsV80(ctx) {
      const view = this.buildBioforgeLabViewV188();
      drawBioforgeLabBackV188(ctx, view);
      super.drawBioforgeStationsV80(ctx);
      drawBioforgeLabPartitionsV188(ctx, view);
    }

    drawBioforgeForegroundV80(ctx) {
      const foreground = this.images?.get('bioforge:v80:foreground');
      if (!foreground?.complete || !(Number(foreground.naturalWidth || foreground.width) > 0)) return;
      const height = 720;
      const width = Number(foreground.naturalWidth || foreground.width) * (height / Number(foreground.naturalHeight || foreground.height));
      const offset = -((Number(this.camera?.x || 0) * 1.08) % width);
      ctx.save();
      ctx.globalAlpha = BIOFORGE_LAB_FOREGROUND_ALPHA_V188;
      for (let x = offset - width; x < VIEW_W + width; x += width) ctx.drawImage(foreground, x, 0, width, height);
      ctx.restore();
    }

    drawBioforgePurgeV80(ctx) {
      let drawn = false;
      if (this.bioforgeAmbulatoryV188 === 'egress') {
        const purge = this.images?.get('bioforge:v80:purge');
        const atlas = this.bioforgeAssetsV80?.purge?.atlas;
        const ratio = this.bioforgePurgeAnimationV188 / BIOFORGE_PURGE_ANIMATION_SECONDS_V188;
        if (ratio < 1 && purge?.complete && Number(purge.naturalWidth || purge.width) > 0) {
          const frames = Number(atlas?.frames) || 8, frame = Math.min(frames - 1, Math.floor(ratio * frames));
          const frameWidth = Number(atlas?.frameWidth) || Number(purge.naturalWidth || purge.width) / 4;
          const frameHeight = Number(atlas?.frameHeight) || Number(purge.naturalHeight || purge.height) / 2;
          const arena = this.bioforgeLevelV80.arenaBounds, size = 640;
          ctx.drawImage(purge, (frame % 4) * frameWidth, Math.floor(frame / 4) * frameHeight, frameWidth, frameHeight,
            arena.x + arena.w / 2 - size / 2, this.bioforgeLevelV80.world.floorY - size, size, size);
          drawn = true;
        }
      } else drawn = super.drawBioforgePurgeV80(ctx);
      drawBioforgeLabFrontV188(ctx, this.buildBioforgeLabViewV188());
      return drawn;
    }

    getBioforgeLabInstructionV188(snapshot) {
      const mode = this.bioforgeAmbulatoryV188;
      if (mode === 'standby') return 'LABORATOIRE · CONSOLE (E) OU TERMINAL : LANCER LE CYCLE';
      if (mode === 'egress') {
        const decon = this.bioforgeExitDeconV188;
        if (decon.complete) return 'PORTE OUVERTE · REJOIGNEZ LE TANTALUS →';
        if (decon.active) return `DÉCONTAMINATION ${Math.round(decon.clock / BIOFORGE_EXIT_DECON_SECONDS_V188 * 100)} %`;
        return 'SAS DE SORTIE · E À LA CONSOLE DE LA CABINE';
      }
      switch (snapshot.phase) {
        case 'configuration':
          if (!snapshot.sessionId) return this.getBioforgeAmbulatoryModeV188() || this.bioforgeAmbulatoryArmedV188
            ? 'A/D : MARCHER · TERMINAL : LANCER LE CYCLE' : 'TERMINAL : LANCER LE CYCLE';
          return [
            'REJOINDRE LE SAS · E POUR OUVRIR',
            'DANS LE SAS · E À L’INTERLOCK',
            'REJOINDRE L’IMPRIMANTE · E POUR ARMER',
            'ENTRER DANS LA CELLULE · SCELLEMENT AUTOMATIQUE'
          ][Math.min(3, this.bioforgeTransferStageV80)];
        case 'sealing': return 'SCELLEMENT DE LA CELLULE';
        case 'printing': return 'IMPRESSION EN COURS · SORTIES VERROUILLÉES';
        case 'combat': return 'SORTIE VERROUILLÉE — CONFINEMENT ACTIF';
        case 'result': case 'purging': return 'PURGE DE LA CELLULE EN COURS';
        case 'return':
          return this.getBioforgeAmbulatoryModeV188() === 'egress' || (this.bioforgeAmbulatoryArmedV188 && this.player?.alive
            && this.player.x >= 1300 && !this.bioforgeEgressDoneV188)
            ? 'PURGE CONFIRMÉE · D : REJOINDRE LE SAS DE SORTIE' : 'PURGE CONFIRMÉE · TERMINAL : RETOUR AU HUB';
        default: return null;
      }
    }

    drawBioforgeHudV80(ctx) {
      const snapshot = this.getBioforgeSnapshotV80();
      // Top right: the reduced terminal occupies the top-left corner of the view.
      const w = 500, x = VIEW_W - w - 18, y = 16;
      ctx.save();
      ctx.fillStyle = 'rgba(3,10,8,.84)';
      ctx.fillRect(x, y, w, 72);
      ctx.strokeStyle = snapshot.isolation.secure ? '#668b71' : '#c84e4e';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + .5, y + .5, w, 72);
      const zone = getBioforgeLabZoneV188((this.player?.x || 0) + (this.player?.w || 0) / 2);
      ctx.fillStyle = '#9be0ae';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`BIOFORGE · ${PHASE_LABELS_V188[snapshot.phase] || String(snapshot.phase).toUpperCase()}${zone ? ` · ${zone.label}` : ''}`, x + 16, y + 24);
      ctx.fillStyle = '#ccd9cc';
      ctx.font = '12px monospace';
      const profileCount = new Set((snapshot.composition || []).map(line => line.profileId)).size;
      const board = this.bioforgeLabDisplayCacheV188.board || [];
      const single = profileCount === 1 ? board.find(row => row.profileId === snapshot.composition[0].profileId)?.name : null;
      const profileLabel = single ? String(single).toUpperCase() : profileCount > 1 ? `MIXTE (${profileCount} PROFILS)` : 'AUCUN PROFIL';
      ctx.fillText(`${profileLabel} · ${snapshot.printed}/${snapshot.quantity} IMPRIMÉS · ${snapshot.kills} NEUTRALISÉS`, x + 16, y + 46);
      const instruction = this.getBioforgeLabInstructionV188(snapshot);
      if (instruction) {
        ctx.fillStyle = snapshot.phase === 'combat' ? '#df8f7d' : '#d8bd79';
        ctx.fillText(instruction, x + 16, y + 64);
      }
      ctx.restore();
      drawBioforgeLabCaptionV188(ctx, this.bioforgeLabCaptionV188);
    }
  };
}
