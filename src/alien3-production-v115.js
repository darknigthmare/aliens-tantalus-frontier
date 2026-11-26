import { withAlien3ProductionV114 } from './alien3-production-v114.js';
import { compileEvidencePropsV113 } from './alien3-fidelity-v113.js';
import { drawPersonV113, drawEvidencePropV113, drawCompanyV113 } from './alien3-art-v113.js';
import { drawCommandoUpgradeV114 } from './alien3-art-v114.js';
import { createAlien3SpriteBankV115, loadAlien3SpriteBankV115, drawAlien3SpriteV115,
  selectAlien3HumanSpriteV115, selectAlien3RunnerSpriteV115 } from './alien3-sprites-v115.js';

const depth = (actor) => Math.max(0, Math.min(2, actor.depth ?? 1));
const inView = (game, actor, margin = 200) => {
  const camera = game.camera || { x: 0, y: 0 };
  return actor.x + (actor.w || 0) >= (camera.x || 0) - margin
    && actor.x <= (camera.x || 0) + 1280 + margin
    && actor.y + (actor.h || 0) >= (camera.y || 0) - margin
    && actor.y <= (camera.y || 0) + 720 + margin;
};

/** Raster presentation wraps the native V114 adapter; all action guards stay below. */
export function withAlien3ProductionV115(Base) {
  return class Alien3ProductionV115 extends withAlien3ProductionV114(Base) {
    start(options = {}) {
      this.releaseAlien3SpritesV115();
      const out = super.start(options);
      // A parent start may call this.stop(); establish the new epoch afterwards.
      const epoch = (this.alien3SpriteLoadEpochV115 || 0) + 1;
      this.alien3SpriteLoadEpochV115 = epoch;
      this.alien3SpriteReceiptsV115 = new Map();
      if (this.isAlien3ProductionV114()) {
        this.alien3SpritesReadyV115 = loadAlien3SpriteBankV115().then((bank) => {
          if (this.alien3SpriteLoadEpochV115 !== epoch || !this.isAlien3ProductionV114()) {
            bank?.dispose(); return null;
          }
          this.alien3SpriteBankV115 = bank;
          if (!bank) return null;
          const costume = this.alien3CostumeContextV113();
          const ripley = selectAlien3HumanSpriteV115('ripley', { grounded: true }, costume).id;
          const nearby = (this.alien3CastV88 || [])
            .filter((actor) => !['ripley', 'bishop'].includes(actor.id) && actor.status === 'active' && inView(this, actor))
            .slice(0, 4).map((actor) => actor.id + '-idle');
          // A small warm set; subsequent poses and props request themselves only
          // when their native draw hook reaches the visible viewport.
          return bank.preload([ripley, 'runner-prowl', ...nearby]);
        });
      }
      return out;
    }

    releaseAlien3SpritesV115() {
      this.alien3SpriteLoadEpochV115 = (this.alien3SpriteLoadEpochV115 || 0) + 1;
      this.alien3SpriteBankV115?.dispose();
      this.alien3SpriteBankV115 = null;
      this.alien3SpritesReadyV115 = Promise.resolve(null);
      this.alien3SpriteReceiptsV115?.clear();
    }

    stop(...args) {
      this.releaseAlien3SpritesV115();
      return super.stop(...args);
    }

    /** Explicit real-image injection for dev preview/QA; never persisted in saves. */
    registerAlien3SpriteManifestV115(manifest, options = {}) {
      this.releaseAlien3SpritesV115();
      const bank = createAlien3SpriteBankV115(manifest, options);
      this.alien3SpriteBankV115 = bank;
      this.alien3SpritesReadyV115 = bank.ready;
      return bank;
    }

    recordAlien3SpriteV115(actorId, receipt) {
      this.alien3SpriteReceiptsV115?.set(actorId, receipt);
      return receipt.drawn;
    }

    tryAlien3HumanSpriteV115(context, actor, id = actor.id, time = this.alien3ArtTimeV102?.() || 0) {
      // Incapacity has a dedicated player pose. This presentation exception
      // never admits deceased roster actors or changes their gameplay state.
      const downedPlayer = actor === this.player && id === 'ripley' && actor?.downed === true;
      if (!this.isAlien3ProductionV114() || (!actor?.alive && !downedPlayer) || !this.alien3SpriteBankV115) return false;
      if (!inView(this, actor)) return false;
      const costume = this.alien3CostumeContextV113();
      const selected = selectAlien3HumanSpriteV115(id, actor, {
        ...costume,
        operationActive: id === 'ripley' && actor === this.player && !!this.alien3OperationsV107?.active
      });
      const lane = depth(actor);
      return this.recordAlien3SpriteV115(id, drawAlien3SpriteV115(context, this.alien3SpriteBankV115, selected.id, {
        x: actor.x + actor.w / 2, y: actor.y + actor.h + (lane - 1) * 23,
        depthScale: .88 + lane * .08, facing: actor.facing || 1, time,
        reducedMotion: costume.reducedMotion, requireAnimation: selected.requireAnimation
      }));
    }

    drawActor(context, actor) {
      if (this.isAlien3ProductionV114() && actor === this.player && this.tryAlien3HumanSpriteV115(context, actor, 'ripley')) return;
      return super.drawActor(context, actor);
    }

    drawAlien3NativePersonV114(context, actor, costumeId = actor.id) {
      if (this.isAlien3ProductionV114()) {
        const native = { ...actor, x: actor.x - 18, y: actor.y - 12, w: 36, h: 90, alive: true };
        // Resolve the real prisoner identity, not the old Junior look fallback.
        if (this.tryAlien3HumanSpriteV115(context, native, actor.id)) return;
      }
      return super.drawAlien3NativePersonV114(context, actor, costumeId);
    }

    drawAlien3ParticipantsV113(context, encounter, time) {
      if (!this.isAlien3ProductionV114() || !this.alien3SpriteBankV115) return super.drawAlien3ParticipantsV113(context, encounter, time);
      for (const actor of [...encounter.participants].sort((a, b) => (a.depth ?? 1) - (b.depth ?? 1))) {
        if (actor.alive && !this.tryAlien3HumanSpriteV115(context, actor, actor.id, time)) {
          drawPersonV113(context, actor, time, { ...this.alien3CostumeContextV113(), id: actor.id });
        }
      }
      return true;
    }

    drawEnemy(context, actor) {
      if (this.isAlien3ProductionV114() && actor === this.alien3RunnerV88 && actor?.alive) {
        if (!this.alien3EncounterV105 && actor.alien3DormantV88 && this.alien3V88?.phase !== 'thermal-shock') return;
        if (!inView(this, actor, 320)) return;
        const selected = selectAlien3RunnerSpriteV115(actor, this.alien3EncounterV105?.pursuit);
        const lane = depth(actor);
        if (this.recordAlien3SpriteV115('runner', drawAlien3SpriteV115(context, this.alien3SpriteBankV115, selected.id, {
          x: actor.x + actor.w / 2, y: actor.y + actor.h + (lane - 1) * 23,
          depthScale: .91 + lane * .07, facing: actor.facing || 1, time: this.alien3ArtTimeV102?.() || 0,
          reducedMotion: this.alien3V104?.settings?.reducedMotion === true, requireAnimation: selected.requireAnimation
        }))) return;
      }
      return super.drawEnemy(context, actor);
    }

    drawAlien3FidelitySceneryV113(context, scene, { flags = {}, time = 0 } = {}) {
      if (!this.isAlien3ProductionV114() || !this.alien3SpriteBankV115) return super.drawAlien3FidelitySceneryV113(context, scene, { flags, time });
      const cameraX = this.camera?.x || 0;
      const evidenceIds = { bishop: 'bishop-damaged', recorder: 'flight-recorder', 'medical-kit': 'medical-kit', flare: 'fire-flare' };
      for (const prop of compileEvidencePropsV113(scene)) {
        if (prop.x + prop.w < cameraX - 30 || prop.x > cameraX + 1310 || prop.condition === 'fire' && !flags.fire) continue;
        const id = evidenceIds[prop.kind];
        const drawn = id && this.recordAlien3SpriteV115(prop.id, drawAlien3SpriteV115(context, this.alien3SpriteBankV115, id, {
          x: prop.x + prop.w / 2, y: prop.y + prop.h, facing: 1, time,
          reducedMotion: this.alien3V104?.settings?.reducedMotion === true
        }));
        if (!drawn) drawEvidencePropV113(context, prop, { flags, time });
      }
      if (flags.companyArrived && !this.alien3EncounterV105) {
        const node = scene.nodes.find((entry) => entry.id === 'f161-company');
        if (node) for (const [index, offset] of [-42, 63].entries()) {
          const actor = { id: 'arrival-guard-' + index, alive: true, x: node.x + offset, y: node.y - 105, w: 44, h: 105, facing: -1 };
          if (!inView(this, actor)) continue;
          const drawn = this.recordAlien3SpriteV115(actor.id, drawAlien3SpriteV115(context, this.alien3SpriteBankV115, 'company-commando-idle', {
            x: actor.x + actor.w / 2, y: actor.y + actor.h, facing: actor.facing, time,
            reducedMotion: this.alien3V104?.settings?.reducedMotion === true
          }));
          if (!drawn) { drawCompanyV113(context, actor, time); drawCommandoUpgradeV114(context, actor); }
        }
      }
    }

    drawAlien3CompanyV89(context) {
      if (!this.isAlien3ProductionV114() || !this.alien3SpriteBankV115) return super.drawAlien3CompanyV89(context);
      if (!this.alien3V89?.company?.visible || this.alien3EncounterV105) return;
      const node = this.alien3SceneV103?.nodes.find((entry) => entry.id === 'f161-company');
      if (node) {
        const actor = { id: 'bishop-representative', x: node.x + 120, y: node.y - 96, w: 38, h: 96, alive: true, facing: -1 };
        if (!this.tryAlien3HumanSpriteV115(context, actor)) drawPersonV113(context, actor,
          this.alien3ArtTimeV102?.() || 0, { id: actor.id, ...this.alien3CostumeContextV113() });
      }
      // Existing authored science-team member; no new NPC AI, hitbox or dialogue.
      const scientist = this.alien3CompanyTeamV89?.find((actor) => actor.id === 'patna-science');
      if (scientist) this.tryAlien3HumanSpriteV115(context, { ...scientist, x: scientist.x - 18,
        y: scientist.y - 12, w: 36, h: 90, alive: true, facing: -1 }, 'company-scientist');
    }

    getAlien3SpriteReportV115() {
      return { active: this.isAlien3ProductionV114(), assets: this.alien3SpriteBankV115?.report() || null,
        receipts: Object.fromEntries(this.alien3SpriteReceiptsV115 || []) };
    }
  };
}
