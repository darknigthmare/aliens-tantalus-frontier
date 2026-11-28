import { XENO_TRIALS_REFERENCED_ART_V231 } from './xeno-trials-research-art-v231.js';
import { XENO_TRIALS_PRESENTATION_PLATES_V230 } from './xeno-trials-presentation-art-v230.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96, XENO_TRIALS_STAGES_V96 } from './xeno-trials-data-v96.js';
import { normalizeXenoTrialsConfigV96 } from './xeno-trials-progress-v96.js';
import { getEnemyImportAnimationV107 } from './enemy-import-animation-v107.js';
import { getEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';
import { getXenoTrialsCaptureAssetsV163 } from './xeno-trials-capture-v163.js';
import { getXenoTrialsSpriteAtlasV188 } from './xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSpriteAtlasV189 } from './xeno-trials-sprite-atlas-v189.js';
import { getXenoTrialsRuntimeSpriteAtlas } from './xeno-trials-sprite-atlas-v191.js';
import { getXenoTrialsRuntimeActionAtlases } from './xeno-trials-action-atlas-v199.js';
import { getXenoTrialsPoseAssetsV209 } from './xeno-trials-poses-v209.js';
import { getXenoTrialsStageAssetsV180 } from './xeno-trials-stage-depth-v180.js';
import { getXenoTrialsStageAssetsV190 } from './xeno-trials-stage-scenes-v190.js';
import { getXenoTrialsFranchiseStageAssetsV192 } from './xeno-trials-franchise-stage-scenes-v192.js';
import { XENO_TRIALS_EFFECT_IMAGES_V205, XENO_TRIALS_PROJECTILE_IMAGES_V205 } from './xeno-trials-visual-assets-v205.js';

export const XENO_TRIALS_FIGHT_EFFECTS_V223 = Object.freeze([
  ...Object.values(XENO_TRIALS_PROJECTILE_IMAGES_V205), ...Object.values(XENO_TRIALS_EFFECT_IMAGES_V205),
]);

const offlineVariantV225 = (id, variant) => getXenoTrialsFighterV96(id)?.variants.includes(variant) ? variant : null;

export function getXenoTrialsFighterAssetsV223(id, requestedVariant) {
  const variant = offlineVariantV225(id, requestedVariant);
  const art = getXenoTrialsArtV96(id, variant), fighter = { id, variant };
  return [art.path, getEnemyImportAnimationV107(art)?.path, getEnemyImportAttackV109(art)?.path,
    getXenoTrialsSpriteAtlasV188(fighter, art)?.texture.path, getXenoTrialsSpriteAtlasV189(fighter, art)?.texture.path,
    getXenoTrialsRuntimeSpriteAtlas(fighter, art)?.texture.path,
    ...getXenoTrialsRuntimeActionAtlases(fighter, art).map(atlas => atlas.texture.path),
    ...getXenoTrialsPoseAssetsV209(fighter, art),
    ...XENO_TRIALS_REFERENCED_ART_V231.filter(plate => plate.fighterId === id && plate.variant === variant).map(plate => plate.path),
    ...XENO_TRIALS_PRESENTATION_PLATES_V230.filter(plate => plate.fighterId === id && plate.variant === variant).map(plate => plate.path), ...getXenoTrialsCaptureAssetsV163([fighter])].filter(Boolean);
}

export function getXenoTrialsArenaAssetsV223(stage) {
  return [stage.backdrop, ...getXenoTrialsStageAssetsV180(stage.id), ...getXenoTrialsStageAssetsV190(stage.id),
    ...getXenoTrialsFranchiseStageAssetsV192(stage.id)].filter(Boolean);
}

function offlineSelectionV224({ playerId, playerVariant, opponentId, opponentVariant, stageId }) {
  return [playerId, offlineVariantV225(playerId, playerVariant), opponentId, offlineVariantV225(opponentId, opponentVariant), stageId];
}

export function getXenoTrialsOfflineDuelKeyV224(config) {
  return JSON.stringify(offlineSelectionV224(normalizeXenoTrialsConfigV96(config)));
}

export function getXenoTrialsOfflineDuelV223(selection) {
  const duel = normalizeXenoTrialsConfigV96(selection);
  const stage = XENO_TRIALS_STAGES_V96.find(entry => entry.id === duel.stageId);
  const assets = [...new Set([
    ...getXenoTrialsFighterAssetsV223(duel.playerId, duel.playerVariant),
    ...getXenoTrialsFighterAssetsV223(duel.opponentId, duel.opponentVariant),
    ...getXenoTrialsArenaAssetsV223(stage), ...XENO_TRIALS_FIGHT_EFFECTS_V223,
  ])].sort();
  const identity = offlineSelectionV224(duel);
  return { key: JSON.stringify(identity), selection: identity, assets };
}

export function createXenoTrialsOfflineDuelClientV223(cacheName, browser = window) {
  const service = browser.navigator.serviceWorker;
  if (!/^atf-trials-v\d+-[a-f0-9]{24}$/.test(cacheName) || !service || !browser.MessageChannel) return null;
  function send(mode, payload = {}) {
    const controller = service.controller;
    if (!controller) return Promise.resolve({ state: 'unavailable' });
    return new Promise(resolve => {
      const { port1, port2 } = new browser.MessageChannel();
      const error = { state: 'error' };
      const timeout = ['prepare', 'remove'].includes(mode) ? 120000 : 3000;
      const timer = browser.setTimeout(() => finish(error), timeout);
      function finish(reply) {
        browser.clearTimeout(timer);
        port1.close();
        resolve(reply);
      }
      port1.onmessage = event => finish(event.data ?? error);
      const expiry = mode === 'remove' ? { expiresAt: Date.now() + timeout } : {};
      try { controller.postMessage({ type: 'XENO_TRIALS_OFFLINE_DUEL_V223', mode, cacheName, ...payload, ...expiry }, [port2]); }
      catch { port2.close(); finish(error); }
    });
  }
  return {
    available: () => Boolean(service.controller),
    async request(mode, duel) {
      const { state } = await send(mode, { assets: duel.assets, selection: duel.selection });
      return ['ready', 'missing', 'unavailable'].includes(state) ? state : 'error';
    },
    list: () => send('list'),
    async remove(key) { return (await send('remove', { key })).state === 'removed'; },
  };
}
