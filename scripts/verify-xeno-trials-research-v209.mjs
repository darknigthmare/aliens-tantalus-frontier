import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { XENO_TRIALS_RESEARCH_V209, getXenoTrialsResearchAssetsV209,
  getXenoTrialsResearchEvaluationV209 } from '../src/xeno-trials-research-v209.js';
import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as tick } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsPracticeConfigV207 } from '../src/xeno-trials-practice-v207.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';

test('the fifteen Bible proposals have explicit, separate dossiers and only reviewed comparison models start a fight', () => {
  const bible = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  assert.deepEqual(XENO_TRIALS_RESEARCH_V209.map(specimen => specimen.id).sort(), bible.tables['16_HorsRoster'].rows.map(row => row[0]).sort());
  assert.equal(XENO_TRIALS_FIGHTERS_V96.length, 189);
  assert.equal(XENO_TRIALS_RESEARCH_V209.filter(specimen => specimen.fighterId).length, 8);
  assert.equal(XENO_TRIALS_RESEARCH_V209.filter(specimen => specimen.kind === 'event').length, 3);
  assert.equal(getXenoTrialsResearchEvaluationV209('SIREN'), null);
  assert.equal(getXenoTrialsResearchEvaluationV209('OVOMORPH'), null);
  for (const asset of getXenoTrialsResearchAssetsV209())
    assert.ok(readFileSync(new URL('..' + asset, import.meta.url)).length > 1000);
});

test('all eight experimental identities start native trials with distinct profiles and actual contacts', () => {
  for (const specimen of XENO_TRIALS_RESEARCH_V209.filter(entry => entry.fighterId)) {
    const settings = getXenoTrialsResearchEvaluationV209(specimen.id);
    const config = getXenoTrialsPracticeConfigV207('sandbox', settings);
    const match = createXenoTrialsMatchV96({ ...config, introSeconds: 0 });
    const [player, opponent] = match.fighters;
    opponent.x += bounds(player).right + 8 - bounds(opponent).left;
    for (let i = 0; i < 42; i++) stepXenoTrialsMatchV96(match, tick, { light: i === 0 }, {});
    assert.equal(player.id, specimen.fighterId);
    assert.equal(config.roundsToWin, 1);
    assert.ok(opponent.hp < getXenoTrialsFighterV96(opponent.id).hp, specimen.id);
    assert.equal(match.events.filter(event => event.type === 'hit' && event.side === 'opponent').length, 1, specimen.id);
  }
});

test('the two juvenile scenarios use different movement and bounded HP against a much taller opponent', () => {
  const juvenile = id => {
    const settings = getXenoTrialsResearchEvaluationV209(id);
    const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207('sandbox', settings), introSeconds: 0 });
    assert.ok(bounds(match.fighters[0]).height < bounds(match.fighters[1]).height / 4);
    assert.ok(match.fighters[0].hp < 60);
    stepXenoTrialsMatchV96(match, tick, { jump: true }, {});
    return match.fighters[0];
  };
  assert.ok(juvenile('FACEHUGGER').y > 0);
  const burster = juvenile('CHESTBURSTER');
  assert.equal(burster.y, 0);
  assert.equal(burster.movesetV207.evade.direction, 1);
});
