import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_TRIALS_RESEARCH_V210, XENO_TRIALS_RESEARCH_FIGHTERS_V210, XENO_TRIALS_RESEARCH_SIGNATURES_V210,
  getXenoTrialsHistoricalResearchArtV210, getXenoTrialsResearchEvaluationV210,
  getXenoTrialsResearchPoseV210 } from '../src/xeno-trials-research-v210.js';
import { XENO_TRIALS_RESEARCH_MEDIA_V210 } from '../src/xeno-trials-research-media-v210.js';
import { XENO_TRIALS_STAGES_V96, getXenoTrialsFighterV96, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsAlternateSignatureV208 } from '../src/xeno-trials-signature-kit-v208.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as tick } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';

const newDossiers = XENO_TRIALS_RESEARCH_V210.flatMap(dossier => [dossier, ...(dossier.editions ?? [])])
  .filter(dossier => dossier.originalModel);

test('seven original study models have unique identities, legal opponents, and separate crops from two exact PNGs', () => {
  assert.equal(XENO_TRIALS_RESEARCH_V210.length, 15);
  assert.equal(XENO_TRIALS_RESEARCH_FIGHTERS_V210.length, 15);
  assert.equal(new Set(XENO_TRIALS_RESEARCH_FIGHTERS_V210.map(fighter => fighter.id)).size, 15);
  assert.deepEqual(newDossiers.map(dossier => dossier.id).sort(),
    ['SCORCHED', 'PREDALIEN-AVPR', 'SIREN', 'STRIKER', 'PRAETORIAN-AVP', 'PRAETORIAN-AFE', 'PRAETORIAN-AFE2'].sort());
  const dims = new Map();
  for (const { path, sha256 } of XENO_TRIALS_RESEARCH_MEDIA_V210) {
    const raw = readFileSync(new URL('..' + path, import.meta.url));
    assert.equal(createHash('sha256').update(raw).digest('hex'), sha256);
    dims.set(path, [raw.readUInt32BE(16), raw.readUInt32BE(20)]);
  }
  const clips = [];
  for (const dossier of newDossiers) {
    const config = getXenoTrialsResearchEvaluationV210(dossier.id);
    assert.equal(config.playerId, dossier.fighterId);
    assert.ok(getXenoTrialsFighterV96(config.opponentId), dossier.id);
    assert.ok(XENO_TRIALS_STAGES_V96.some(stage => stage.id === config.stageId), dossier.id);
    const art = getXenoTrialsHistoricalResearchArtV210(config.playerId), [x, y, w, h] = art.sourceRectV209;
    const [sheetWidth, sheetHeight] = dims.get(art.path);
    assert.ok(x > 0 && y > 0 && x + w <= sheetWidth && y + h <= sheetHeight);
    assert.ok(w >= 300 && h >= 300 && art.pivot.y === 1 && art.pivot.x > 0 && art.pivot.x < 1);
    assert.ok(clips.every(clip => clip.path !== art.path || clip.right <= x || x + w <= clip.left || clip.bottom <= y || y + h <= clip.top));
    clips.push({ path: art.path, left: x, right: x + w, top: y, bottom: y + h });
  }
});

function simulate(move, distant) {
  const dossier = newDossiers.find(d => d.fighterId === move.fighterId);
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsResearchEvaluationV210(dossier.id), introSeconds: 0 });
  const [fighter, target] = match.fighters;
  const command = 'signature' + move.kind.at(-1);
  const high = move.spec.contactBandV207 === 'anti-air';
  target.x += body(fighter).right + (distant ? 900 : 17) - body(target).left;
  if (high) {
    const contactAt = move.spec.startup + move.spec.active / 2;
    target.y = Math.max(1, body(fighter).height * .60 - 725 * contactAt ** 2);
    target.vy = 1450 * contactAt;
  }
  for (let i = 0; i < 135; i++) stepXenoTrialsMatchV96(match, tick, { [command]: i === 0 }, {});
  assert.ok(match.events.some(event => event.type === 'attack' && event.signatureIdV208 === move.id), move.id);
  return match.events.filter(event => event.type === 'hit' && event.side === 'opponent');
}

test('each H/O move engages in the native simulation and whiffs beyond its reach', () => {
  assert.equal(XENO_TRIALS_RESEARCH_SIGNATURES_V210.length, 14);
  for (const move of XENO_TRIALS_RESEARCH_SIGNATURES_V210) {
    const fighter = getXenoTrialsFighterV96(move.fighterId);
    assert.equal(getXenoTrialsAlternateSignatureV208(fighter, move.kind), move);
    assert.equal(getXenoTrialsAlternateSignatureV208({ ...fighter, profileId: 'unsupported' }, move.kind), null);
    assert.equal(simulate(move, false).length, 1, move.id);
    assert.equal(simulate(move, true).length, 0, move.id);
  }
});

test('procedural plate motion follows the native clock and supports reduced motion', () => {
  const [move] = XENO_TRIALS_RESEARCH_SIGNATURES_V210;
  const fighter = { id: move.fighterId, hp: 120, attack: { age: move.spec.startup / 2 } };
  const art = getXenoTrialsArtV96(fighter.id);
  const options = { spec: move.spec, moving: false, tick: 61 };
  const windup = getXenoTrialsResearchPoseV210(fighter, art, options);
  fighter.attack.age = move.spec.startup + move.spec.active / 2;
  const active = getXenoTrialsResearchPoseV210(fighter, art, options);
  assert.ok(windup.lean > 0 && active.lean < 0 && active.height < windup.height);
  assert.deepEqual(getXenoTrialsResearchPoseV210(fighter, art, options), active);
  assert.equal(getXenoTrialsResearchPoseV210(fighter, art, { ...options, reducedMotion: true }), null);
});
