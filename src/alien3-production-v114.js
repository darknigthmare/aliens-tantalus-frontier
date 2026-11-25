import { withAlien3DlcRuntimeV88 } from './alien3-dlc-runtime-v88.js';
import { withAlien3DlcRuntimeV89 } from './alien3-dlc-runtime-v89.js';
import { withAlien3DlcRuntimeV90 } from './alien3-dlc-runtime-v90.js';
import { withAlien3DlcRuntimeV91 } from './alien3-dlc-runtime-v91.js';
import { withAlien3DlcRuntimeV92 } from './alien3-dlc-runtime-v92.js';
import { withAlien3DlcRuntimeV93 } from './alien3-dlc-runtime-v93.js';
import { withAlien3DlcRuntimeV94 } from './alien3-dlc-runtime-v94.js';
import { withAlien3DlcRuntimeV95 } from './alien3-dlc-runtime-v95.js';
import { withAlien3DlcRuntimeV96 } from './alien3-dlc-runtime-v96.js';
import { withAlien3DlcRuntimeV97 } from './alien3-dlc-runtime-v97.js';
import { withAlien3DlcRuntimeV98 } from './alien3-dlc-runtime-v98.js';
import { withAlien3DlcRuntimeV99 } from './alien3-dlc-runtime-v99.js';
import { withAlien3DlcRuntimeV100 } from './alien3-dlc-runtime-v100.js';
import { withAlien3DlcRuntimeV101 } from './alien3-dlc-runtime-v101.js';
import { withAlien3DlcRuntimeV102 } from './alien3-dlc-runtime-v102.js';
import { withAlien3DlcRuntimeV103 } from './alien3-dlc-runtime-v103.js';
import { withAlien3DlcRuntimeV104 } from './alien3-dlc-runtime-v104.js';
import { withAlien3DlcRuntimeV105 } from './alien3-dlc-runtime-v105.js';
import { withAlien3DlcRuntimeV106 } from './alien3-dlc-runtime-v106.js';
import { withAlien3DlcRuntimeV107 } from './alien3-dlc-runtime-v107.js';
import { withAlien3DlcRuntimeV108 } from './alien3-dlc-runtime-v108.js';
import { withAlien3DlcRuntimeV109 } from './alien3-dlc-runtime-v109.js';
import { withAlien3DlcRuntimeV110 } from './alien3-dlc-runtime-v110.js';
import { withAlien3DlcRuntimeV111 } from './alien3-dlc-runtime-v111.js';
import { withAlien3DlcRuntimeV112 } from './alien3-dlc-runtime-v112.js';
import { withAlien3DlcRuntimeV113 } from './alien3-dlc-runtime-v113.js';
import { withAlien3DlcRuntimeV114 } from './alien3-dlc-runtime-v114.js';
import { CAMPAIGN_V104 } from './alien3-dlc-v104.js';
import { compileEvidencePropsV113 } from './alien3-fidelity-v113.js';
import { drawEvidencePropV113, drawCompanyV113, drawPersonV113 } from './alien3-art-v113.js';
import { drawCommandoUpgradeV114 } from './alien3-art-v114.js';

const CUTS = new Set(['theatrical', 'assembly']);
const PHASES = ['wreckage', 'infirmary', 'first-blood', 'bishop', 'trap-prep', 'fire-maze', 'leadworks', 'molten-lead', 'thermal-shock', 'company', 'finale'];
const isFiorina = (options) => options?.campaign?.id === CAMPAIGN_V104;
// Apply at the outer production start as well: modern wrappers read these
// options before entering the historical DLC chain.
export function normalizeAlien3ProductionOptionsV114(options = {}) {
  if (!isFiorina(options)) return options;
  return { ...options, crew: [], equipment: [], vehicle: null, costume: null,
    coop: false, coopEnabled: false, userCasteCampaignV88: false,
    insertionHandoverV188: null, experimentalPhysicalMagazinesV167: false,
    alien3VectorActorsV105: true };
}
const editable = (target) => !!target?.closest?.('input,textarea,select,button,a,[contenteditable=true]');
const HISTORICAL = [withAlien3DlcRuntimeV88, withAlien3DlcRuntimeV89, withAlien3DlcRuntimeV90, withAlien3DlcRuntimeV91, withAlien3DlcRuntimeV92, withAlien3DlcRuntimeV93, withAlien3DlcRuntimeV94, withAlien3DlcRuntimeV95, withAlien3DlcRuntimeV96, withAlien3DlcRuntimeV97, withAlien3DlcRuntimeV98, withAlien3DlcRuntimeV99, withAlien3DlcRuntimeV100];
const PRESENTATION = [withAlien3DlcRuntimeV101, withAlien3DlcRuntimeV102, withAlien3DlcRuntimeV103, withAlien3DlcRuntimeV104, withAlien3DlcRuntimeV105, withAlien3DlcRuntimeV106, withAlien3DlcRuntimeV107, withAlien3DlcRuntimeV108, withAlien3DlcRuntimeV109, withAlien3DlcRuntimeV110, withAlien3DlcRuntimeV111, withAlien3DlcRuntimeV112, withAlien3DlcRuntimeV113, withAlien3DlcRuntimeV114];

/**
 * Native integration of the recovered Fiorina modules. Physics, collision,
 * mission identity and resume validation remain owned by the production engine.
 * Inspection shells stay in the archived standalone, outside the playable map.
 */
export function withAlien3ProductionV114(Base) {
  const Legacy = HISTORICAL.reduce((Engine, mixin) => mixin(Engine), Base);
  class NarrativeBoundary extends Legacy {
    update(delta) {
      // V105 scenarios have their own pursuit/participants. Never run both
      // the narrative Runner director and the scenario controller in one tick.
      return this.alien3EncounterV105 ? Base.prototype.update.call(this, delta) : super.update(delta);
    }
    interact(...args) {
      return this.alien3EncounterV105 ? Base.prototype.interact?.call(this, ...args) : super.interact(...args);
    }
  }
  const Historical = PRESENTATION.reduce((Engine, mixin) => mixin(Engine), NarrativeBoundary);
  return class Alien3ProductionV114 extends Historical {
    isAlien3ProductionV114() { return this.alien3ProductionActiveV114 === true; }

    start(options = {}) {
      this.unbindAlien3ProductionInputV114();
      this.alien3ProductionActiveV114 = isFiorina(options);
      if (!this.alien3ProductionActiveV114) return super.start(options);
      const resume = options.resumeState;
      const savedCut = resume?.specialOperation?.alien3V114?.cut || resume?.specialOperation?.alien3V89?.cut;
      const cut = CUTS.has(savedCut) ? savedCut : CUTS.has(options.alien3CutV114)
        ? options.alien3CutV114 : options.strategicBriefing?.flags?.['alien3-assembly-cut'] ? 'assembly' : 'theatrical';
      const nativeOptions = {
        ...options, resumeState: undefined, crew: [], equipment: [], vehicle: null, costume: null,
        coop: false, coopEnabled: false, userCaste: null, userCasteCampaignV88: false, insertionHandoverV188: null,
        experimentalPhysicalMagazinesV167: false, alien3VectorActorsV105: true, alien3CutV114: cut,
        strategicBriefing: { ...options.strategicBriefing, flags: {
          ...options.strategicBriefing?.flags, 'alien3-assembly-cut': cut === 'assembly'
        }}
      };
      this.experimentalPhysicalMagazinesV167 = false;
      super.start(nativeOptions);
      this.setCoop(false);
      this.syncAlien3ProductionCutV114(cut);
      this.restrictAlien3LoadoutV114();
      this.bindAlien3ProductionInputV114();
      // Production resume is deliberately deferred until all V104+ models exist.
      if (resume) this.lastResumeResult = this.alien3ResumeResultV114 = this.applyResumeState(resume);
      return this.getSnapshot();
    }

    restrictAlien3LoadoutV114() {
      if (!this.isAlien3ProductionV114()) return;
      this.coopEnabled = false;
      if (this.coop) { this.coop.alive = false; this.coop.x = -4000; }
      if (this.player) {
        this.player.ammo = 0;
        this.player.ammoReserve = 0;
        this.player.weaponFeedV167 = null;
        this.player.inVehicle = false;
      }
      if (this.vehicle) { this.vehicle.active = false; this.vehicle.occupied = false; }
      this.experimentalPhysicalMagazinesV167 = false;
    }

    setCoop(enabled, ...args) {
      return super.setCoop?.(this.isAlien3ProductionV114() ? false : enabled, ...args);
    }

    alien3BlockedV104() {
      return super.alien3BlockedV104() || !!this.userCasteLoadingV88
        || !!this.forgeNarrativeOpenV156 || !!this.dropshipHandoverBlocksV188?.();
    }

    fireAlien3ProductionV114(actor = this.player) {
      if (!this.isAlien3ProductionV114() || actor !== this.player || this.alien3BlockedV104()) return false;
      if (this.alien3EncounterV105) return this.makeAlien3NoiseV105?.() || false;
      return Historical.prototype.fire.call(this, actor);
    }

    syncAlien3ProductionCutV114(cut) {
      if (!CUTS.has(cut)) return false;
      this.alien3CutV114 = cut;
      this.alien3InspectionRoomV114 = null;
      if (this.alien3SceneV103) this.refreshAlien3FidelityV114();
      return true;
    }

    setAlien3CutV114(cut) {
      if (!this.isAlien3ProductionV114()) return super.setAlien3CutV114(cut);
      if (!CUTS.has(cut) || this.alien3V89?.cutLocked || this.alien3V94?.profile?.locked || this.alien3V88?.crashRecorderRead) return false;
      const result = this.setAlien3ProfileV94(cut);
      if (result) this.syncAlien3ProductionCutV114(cut);
      return result;
    }

    setAlien3ArchiveCutV89(cut, actor = this.player) {
      const changed = super.setAlien3ArchiveCutV89(cut, actor);
      if (changed && this.isAlien3ProductionV114()) this.syncAlien3ProductionCutV114(cut);
      return changed;
    }

    setAlien3InspectionRoomV114() {
      // These study views are not connected collision rooms in the native map.
      this.alien3InspectionRoomV114 = null;
      return false;
    }

    captureResumeState() {
      const state = super.captureResumeState();
      return this.isAlien3ProductionV114() ? {
        ...state, specialOperation: { ...state.specialOperation,
          alien3V114: { schema: 114, cut: this.alien3CutV114 } }
      } : state;
    }

    applyResumeState(raw) {
      const saved = raw?.specialOperation?.alien3V114;
      if (this.isAlien3ProductionV114() && saved
        && (saved.schema !== 114 || !CUTS.has(saved.cut)
          || raw.specialOperation.alien3V89?.cut && raw.specialOperation.alien3V89.cut !== saved.cut)) {
        return { applied: false, reason: 'V114-cut' };
      }
      const result = super.applyResumeState(raw);
      if (result?.applied && this.isAlien3ProductionV114()) {
        this.syncAlien3ProductionCutV114(saved?.cut || this.alien3V89?.cut || this.alien3CutV114);
        this.restrictAlien3LoadoutV114();
        this.keys?.clear?.();
      }
      return result;
    }

    bindAlien3InputV103() {}
    bindAlien3CodexInputV97() {}
    bindAlien3CodexInputV98() {}
    bindAlien3CodexInputV99() {}
    bindAlien3ProductionInputV114() {
      if (!globalThis.addEventListener || this.alien3ProductionKeyV114) return;
      this.alien3ProductionKeyV114 = (event) => {
        if (!this.isAlien3ProductionV114() || !this.running || this.paused
          || this.enemyAtlasLoadingPausedV65 || this.userCasteLoadingV88
          || this.player?.alive === false || this.mission?.state !== 'active'
          || this.dropshipHandoverBlocksV188?.()
          || event.repeat || event.ctrlKey || event.metaKey || event.altKey || editable(event.target)) return;
        if (this.canRouteGameplayKey && !this.canRouteGameplayKey(event)) return;
        const open = this.alien3V98?.codexUi?.open;
        if (this.alien3MapOpenV103) {
          event.preventDefault?.(); event.stopImmediatePropagation?.();
          this.keys?.clear?.();
          if (event.code === 'KeyM' || event.code === 'Escape') this.closeAlien3MapV103();
          return;
        }
        if (!open && (event.code === 'KeyM' || event.code === 'KeyI')) {
          event.preventDefault?.(); event.stopImmediatePropagation?.(); this.keys?.clear?.();
          if (event.code === 'KeyM') this.openAlien3MapV103();
          else if (this.canPerformGameplayAction?.(this.player)) this.useAlien3UtilityV103();
          return;
        }
        if (event.code !== 'KeyC' && !open) return;
        event.preventDefault?.();
        event.stopImmediatePropagation?.();
        this.keys?.clear?.();
        if (event.code === 'KeyC') { this.toggleAlien3CodexUiV99(); return; }
        const graph = this.alien3V99?.codexGraph;
        if (!graph) return;
        if (graph.searchEditing) {
          if (event.code === 'Escape' || event.code === 'Enter') { graph.searchEditing = false; return; }
          if (event.code === 'Backspace') { this.setAlien3CodexSearchV99(graph.query.slice(0, -1), { count: false }); return; }
          if (event.key?.length === 1 && /[a-zA-Z0-9À-ÿ _-]/.test(event.key)) {
            this.setAlien3CodexSearchV99((graph.query + event.key).slice(0, 48), { count: false });
          }
          return;
        }
        const actions = {
          Escape: () => this.closeAlien3CodexUiV99(),
          Slash: () => { graph.searchEditing = true; graph.searchUses += 1;
            this.alien3V99.telemetry.codexSearches += 1; this.recoverAlien3EvidenceV99('codex-search-used', { silent: true }); },
          BracketLeft: () => this.cycleAlien3CodexCategoryV99(-1),
          BracketRight: () => this.cycleAlien3CodexCategoryV99(1),
          Comma: () => this.cycleAlien3CodexPageV99(-1),
          Period: () => this.cycleAlien3CodexPageV99(1),
          KeyB: () => this.toggleAlien3CodexBookmarkV99(),
          KeyK: () => this.cycleAlien3CodexFilterV99(1),
          KeyL: () => this.followAlien3CodexLinkV99(1),
          KeyH: () => this.alien3CodexHistoryBackV99()
        };
        actions[event.code]?.();
      };
      globalThis.addEventListener('keydown', this.alien3ProductionKeyV114, true);
    }

    unbindAlien3ProductionInputV114() {
      if (this.alien3ProductionKeyV114) globalThis.removeEventListener?.('keydown', this.alien3ProductionKeyV114, true);
      this.alien3ProductionKeyV114 = null;
    }

    stop(...args) {
      this.unbindAlien3ProductionInputV114();
      return super.stop(...args);
    }

    drawEnemy(context, actor) {
      if (this.isAlien3ProductionV114() && actor === this.alien3RunnerV88
        && !this.alien3EncounterV105 && actor.alien3DormantV88
        && this.alien3V88?.phase !== 'thermal-shock') return;
      return super.drawEnemy(context, actor);
    }

    drawAlien3FidelitySceneryV113(context, scene, { flags = {}, time = 0 } = {}) {
      if (!this.isAlien3ProductionV114()) return super.drawAlien3FidelitySceneryV113(context, scene, { flags, time });
      const cameraX = this.camera?.x || 0;
      for (const prop of compileEvidencePropsV113(scene)) {
        if (prop.x + prop.w >= cameraX - 30 && prop.x <= cameraX + 1310) drawEvidencePropV113(context, prop, { flags, time });
      }
      if (flags.companyArrived && !this.alien3EncounterV105) {
        const node = scene.nodes.find((entry) => entry.id === 'f161-company');
        if (node) for (const [index, offset] of [-42, 63].entries()) {
          const actor = { id: 'arrival-guard-' + index, alive: true, x: node.x + offset, y: node.y - 105, w: 44, h: 105, facing: -1 };
          drawCompanyV113(context, actor, time);
          drawCommandoUpgradeV114(context, actor);
        }
      }
    }

    drawAlien3NativePersonV114(context, actor, costumeId = actor.id) {
      drawPersonV113(context, { ...actor, id: costumeId, x: actor.x - 18, y: actor.y - 12,
        w: 36, h: 90, alive: true }, this.alien3ArtTimeV102?.() || 0,
      { ...this.alien3CostumeContextV113(), id: costumeId });
    }

    drawAlien3CastV88(context) {
      if (!this.isAlien3ProductionV114()) return super.drawAlien3CastV88(context);
      if (this.alien3EncounterV105) return;
      for (const actor of this.alien3CastV88 || []) {
        if (['ripley', 'bishop'].includes(actor.id) || actor.status !== 'active') continue;
        this.drawAlien3NativePersonV114(context, actor);
      }
    }

    drawAlien3PrisonersV89(context) {
      if (!this.isAlien3ProductionV114()) return super.drawAlien3PrisonersV89(context);
      if (this.alien3EncounterV105 || PHASES.indexOf(this.alien3V88?.phase) < PHASES.indexOf('trap-prep')) return;
      const cast = new Set((this.alien3CastV88 || []).filter((actor) => actor.status === 'active').map((actor) => actor.id));
      for (const actor of this.alien3PrisonersV89 || []) {
        if (actor.status === 'deceased' || cast.has(actor.id)) continue;
        this.drawAlien3NativePersonV114(context, actor, ['golic', 'junior', 'murphy', 'boggs', 'rains', 'dillon', 'morse'].includes(actor.id) ? actor.id : 'junior');
      }
    }

    drawAlien3CompanyV89(context) {
      if (!this.isAlien3ProductionV114()) return super.drawAlien3CompanyV89(context);
      if (!this.alien3V89?.company?.visible || this.alien3EncounterV105) return;
      const node = this.alien3SceneV103?.nodes.find((entry) => entry.id === 'f161-company');
      if (node) drawPersonV113(context, { id: 'bishop-representative', x: node.x + 120,
        y: node.y - 96, w: 38, h: 96, alive: true, facing: -1 },
      this.alien3ArtTimeV102?.() || 0, { id: 'bishop-representative', ...this.alien3CostumeContextV113() });
    }
  };
}
