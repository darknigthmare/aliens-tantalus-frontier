import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';
import { XENO_TRIALS_FACTIONS_V96, XENO_TRIALS_FIGHTERS_V96, getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_RECRUITS_V230, XENO_TRIALS_RECRUIT_PROPOSALS_V230, getXenoTrialsRecruitV230 } from '../src/xeno-trials-recruits-v230.js';
import { XENO_TRIALS_RESEARCH_FIGHTERS_V210, getXenoTrialsResearchEvaluationV210 } from '../src/xeno-trials-research-v210.js';
import { abandonXenoTrialsV96, beginXenoTrialsV96, createXenoTrialsProgressV96, getXenoTrialsUnlockCostV96,
  normalizeXenoTrialsProgressV96, unlockXenoTrialsFighterV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { filterXenoTrialsRosterV97 } from '../src/xeno-trials-selection-v97.js';
import { getXenoTrialsRecruitPreviewV230 } from '../src/xeno-trials-ui-v96.js';
import { getXenoTrialsMenuTileV222 } from '../src/xeno-trials-menu-media-v222.js';

const historicalRosterDigest = '24a9db2c539897f16808863b5c04a65c233b76469f735716b86d4549b0d98298';
const asymmetricDossiers = ['FACEHUGGER', 'CHESTBURSTER'];

test('every displayed recruit name finds its exact card and its static preview crops the correct native sheet', () => {
  for (const fighter of XENO_TRIALS_RECRUITS_V230) {
    const recruit = getXenoTrialsRecruitV230(fighter.id);
    for (const query of [fighter.label, recruit.label, recruit.labelEn])
      assert.ok(filterXenoTrialsRosterV97(XENO_TRIALS_FIGHTERS_V96, { query }).some(row => row.id === fighter.id), query);
    assert.equal(getXenoTrialsMenuTileV222('fighter', fighter.id), null);
    const preview = getXenoTrialsRecruitPreviewV230(fighter.id);
    assert.ok(preview.includes(`viewBox="${recruit.preview.rect.join(' ')}"`));
    assert.ok(preview.includes(`href="${recruit.preview.path}"`));
    assert.ok(preview.includes(`width="${recruit.preview.width}" height="${recruit.preview.height}"`));
  }
  assert.equal(getXenoTrialsRecruitPreviewV230('warrior'), null);
});

test('the permanent MIRE roster appends the thirteen exact adult research definitions', () => {
  const roster = XENO_TRIALS_FIGHTERS_V96;
  assert.equal(roster.length, 202);
  assert.equal(createHash('sha256').update(JSON.stringify(roster.slice(0, 189))).digest('hex'), historicalRosterDigest);
  assert.equal(XENO_TRIALS_RESEARCH_FIGHTERS_V210.length, 15);
  assert.equal(XENO_TRIALS_RECRUITS_V230.length, 13);
  assert.deepEqual(roster.slice(189), XENO_TRIALS_RECRUITS_V230);
  assert.equal(new Set(roster.map(fighter => fighter.id)).size, 202);

  for (const fighter of XENO_TRIALS_RECRUITS_V230) {
    const recruit = getXenoTrialsRecruitV230(fighter.id);
    assert.equal(recruit.fighter, fighter);
    assert.equal(getXenoTrialsFighterV96(fighter.id), fighter);
    assert.equal(recruit.dossier.kind, 'duel');
    assert.equal(getXenoTrialsResearchEvaluationV210(recruit.dossierId).playerId, fighter.id);
    assert.equal(recruit.authorization, 'mire-simulation');
    assert.equal(fighter.canonExact, false);
    assert.deepEqual(XENO_TRIALS_FACTIONS_V96.filter(faction => faction.roster.includes(fighter.id)).map(faction => faction.id), [recruit.factionId]);
  }

  for (const dossier of asymmetricDossiers) {
    const evaluation = getXenoTrialsResearchEvaluationV210(dossier);
    assert.ok(getXenoTrialsFighterV96(evaluation.playerId));
    assert.equal(getXenoTrialsRecruitV230(evaluation.playerId), null);
    assert.equal(getXenoTrialsUnlockCostV96(evaluation.playerId), null);
  }
  for (const event of ['OVOMORPH', 'ROMULUS-COCOON', 'TADPOLE']) assert.equal(getXenoTrialsResearchEvaluationV210(event), null);
});

test('each card points to the admitted project body and its own sheet cell', () => {
  const subjects = new Set();
  for (const fighter of XENO_TRIALS_RECRUITS_V230) {
    const recruit = getXenoTrialsRecruitV230(fighter.id);
    const art = getXenoTrialsArtV96(fighter.id);
    const { path, width, height, rect: [x, y, w, h] } = recruit.preview;
    assert.equal(recruit.art, art);
    assert.equal(path, art.path);
    assert.deepEqual([w, h], [art.sourceWidth, art.sourceHeight]);
    assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= width && y + h <= height, fighter.id);
    assert.ok(statSync(new URL('..' + path, import.meta.url)).size > 0, fighter.id);
    subjects.add(JSON.stringify(recruit.preview));
  }
  assert.equal(subjects.size, 13);
  assert.equal(getXenoTrialsRecruitV230('mire-v209-praetorian').label, 'Praetorian · comparaison MIRE');
  assert.equal(getXenoTrialsRecruitV230('mire-v209-six').label, 'Lignée Specimen Six · modèle MIRE');
  for (const id of ['warrior', 'predalien', 'royal-guard', 'albino-six']) assert.equal(getXenoTrialsRecruitV230(id), null);
});

test('existing MIRE credits grant lasting access and preserve the recruit through a normal duel ticket', () => {
  const before = { ...createXenoTrialsProgressV96(), credits: 2000 };
  const config = { opponentId: 'warrior', stageId: 'containment-deck' };
  const costs = [300, 300, 300, 180, 600, 900, 900, 900, 900, 300, 180, 300, 300];
  for (const [index, fighter] of XENO_TRIALS_RECRUITS_V230.entries()) {
    const cost = getXenoTrialsUnlockCostV96(fighter.id);
    const selection = { ...config, playerId: fighter.id };
    assert.equal(cost, costs[index], fighter.id);
    assert.equal(beginXenoTrialsV96(before, selection).reason, 'fighter-locked');
    assert.equal(unlockXenoTrialsFighterV96({ ...before, credits: cost - 1 }, fighter.id).applied, false);
    const unlock = unlockXenoTrialsFighterV96(before, fighter.id);
    assert.equal(unlock.applied, true);
    assert.equal(unlock.state.credits, before.credits - cost);
    const restored = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(unlock.state)));
    const duplicate = unlockXenoTrialsFighterV96(restored, fighter.id);
    assert.equal(duplicate.applied, false);
    assert.equal(duplicate.state.credits, restored.credits);
    const started = beginXenoTrialsV96(restored, selection);
    assert.equal(started.applied, true);
    assert.equal(started.config.playerId, fighter.id);
    const reload = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(started.state)));
    assert.equal(reload.pending.config.playerId, fighter.id);
    const abandoned = abandonXenoTrialsV96(reload);
    assert.equal(abandoned.applied, true);
    assert.equal(abandoned.state.ledger.at(-1).playerId, fighter.id);
    assert.equal(abandoned.state.credits, unlock.state.credits);
  }
  assert.equal(before.credits, 2000);
  assert.deepEqual(before.unlocked, ['warrior', 'runner', 'arachnoid']);
});

test('the existing combat engine lets every recruit fight in either seat', () => {
  const recruits = XENO_TRIALS_RECRUITS_V230;
  for (const [index, recruit] of recruits.entries()) {
    const opponent = recruits[(index + 1) % recruits.length];
    const match = createXenoTrialsMatchV96({ playerId: recruit.id, opponentId: opponent.id, introSeconds: 0 });
    const [player, rival] = match.fighters;
    assert.deepEqual([player.id, player.hp, rival.id, rival.hp], [recruit.id, recruit.hp, opponent.id, opponent.hp]);
    rival.x += getXenoTrialsBodyBoundsV105(player).right + 24 - getXenoTrialsBodyBoundsV105(rival).left;
    for (let tick = 0; tick < 55; tick++) stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { light: tick === 0 }, {});
    assert.equal(player.stats.hits, 1, recruit.id);
    assert.ok(rival.hp < opponent.hp, opponent.id);
  }
});

test('the popup proposals remain absent from fighter lookup and MIRE authorization', () => {
  const proposals = XENO_TRIALS_RECRUIT_PROPOSALS_V230;
  assert.equal(proposals.length, 7);
  assert.deepEqual(new Set(proposals.map(entry => entry.family)), new Set(['synthetic', 'human']));
  assert.equal(new Set(proposals.map(entry => entry.id)).size, proposals.length);
  for (const entry of proposals) {
    assert.ok(entry.label && entry.source && entry.proposal && entry.proposalEn);
    assert.equal(new URL(entry.sourceUrl).protocol, 'https:');
    assert.equal(getXenoTrialsRecruitV230(entry.id), null);
    assert.ok(!getXenoTrialsFighterV96(entry.id));
    assert.equal(getXenoTrialsUnlockCostV96(entry.id), null);
  }
});
