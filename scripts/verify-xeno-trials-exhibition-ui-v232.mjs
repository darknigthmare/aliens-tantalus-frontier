import test from 'node:test';
import assert from 'node:assert/strict';
import { getXenoTrialsExhibitionCatalogV232, readXenoTrialsExhibitionSelectionV232,
  buildExhibitionConfigV232, renderXenoTrialsExhibitionFormV232, renderReplayArchiveV232,
} from '../src/xeno-trials-exhibition-ui-v232.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsReplayRecorderV232, verifyXenoTrialsReplayV232 } from '../src/xeno-trials-replay-v232.js';

// Pure form-reader fixtures and the real match/recording engine; no browser,
// campaign profile, storage backend or physical controller is injected here.
const state = { unlocked: ['warrior', 'runner', 'arachnoid'], credits: 800, wins: 3, pending: { id: 'preserved' } };
const choices = (patch = {}) => ({ mode: 'duel', controls: 'cpu', assists: false,
  player0: 'warrior::', player1: 'arachnoid::purple', opponent0: 'runner::', opponent1: 'arachnoid::grey',
  stageId: 'containment-deck', difficulty: 'normal', roundsToWin: '2', roundSeconds: '99', seed: '1969', record: true, ...patch });

test('catalog admits only exact owned identities and their roster variants', () => {
  const catalog = getXenoTrialsExhibitionCatalogV232({ unlocked: ['missing', 'warrior', 'warrior', 'arachnoid'] });
  assert.deepEqual(catalog.map(({ id, variant, value }) => ({ id, variant, value })), [
    { id: 'warrior', variant: null, value: 'warrior::' },
    { id: 'arachnoid', variant: 'grey', value: 'arachnoid::grey' },
    { id: 'arachnoid', variant: 'purple', value: 'arachnoid::purple' },
  ]);
  catalog[0].id = 'runner'; assert.equal(getXenoTrialsExhibitionCatalogV232(state)[0].id, 'warrior');
  assert.deepEqual(getXenoTrialsExhibitionCatalogV232(null), []);
});

test('duel/tag and CPU/local produce canonical, recordable native configs without progression fields', () => {
  const before = JSON.stringify(state);
  for (const mode of ['duel', 'tag']) for (const controls of ['cpu', 'local']) {
    const selection = choices({ mode, controls, assists: mode === 'tag', record: false,
      activityV119: { branch: 'campaign', id: 'forged' }, reward: 99999, credits: 99999 });
    const config = buildExhibitionConfigV232(selection, state), match = createXenoTrialsMatchV96(config);
    assert.ok(config); assert.deepEqual(match.config, config);
    assert.equal(config.exhibitionV232.playerTeam.length, mode === 'tag' ? 2 : 1);
    assert.equal(config.exhibitionV232.opponentTeam.length, mode === 'tag' ? 2 : 1);
    for (const forbidden of ['activityV119', 'reward', 'record', 'credits', 'pending', 'checkpoint', 'progress'])
      assert.equal(Object.hasOwn(config, forbidden), false);
    const recorder = createXenoTrialsReplayRecorderV232(match); assert.ok(recorder);
    const opponent = controls === 'local' ? {} : null;
    assert.equal(recorder.beforeStep(match, 1 / 120, {}, opponent), true);
    stepXenoTrialsMatchV96(match, 1 / 120, {}, opponent); assert.equal(recorder.afterStep(match), true);
    const replay = recorder.finish(match); assert.ok(replay); assert.equal(verifyXenoTrialsReplayV232(replay).valid, true);
  }
  assert.equal(JSON.stringify(state), before);
});

test('locked identities, wrong variants and duplicate fighter IDs fail closed on either team', () => {
  for (const patch of [{ player0: 'queen::' }, { opponent0: 'queen::' }, { player0: 'warrior::grey' },
    { opponent0: 'arachnoid::' }, { player0: 'arachnoid::blue' }, { opponent0: 'missing::' },
    { player0: { id: 'warrior', variant: null } }, { player0: 'warrior' }, { player0: 'warrior::__proto__' }])
    assert.equal(buildExhibitionConfigV232(choices(patch), state), null);
  assert.equal(buildExhibitionConfigV232(choices({ mode: 'tag', player1: 'warrior::' }), state), null);
  assert.equal(buildExhibitionConfigV232(choices({ mode: 'tag', opponent1: 'runner::' }), state), null);
  assert.equal(buildExhibitionConfigV232(choices({ mode: 'tag', player0: 'arachnoid::grey', player1: 'arachnoid::purple' }), state), null);
  assert.ok(buildExhibitionConfigV232(choices({ opponent0: 'warrior::' }), state), 'cross-team mirror duels are admitted');
  assert.equal(buildExhibitionConfigV232(choices(), { unlocked: [] }), null);
});

test('all submitted settings use strict native bounds and supported enums', () => {
  for (const patch of [{ mode: 'campaign' }, { controls: 'remote' }, { assists: 'false' }, { assists: 1 }, { assists: true },
    { stageId: 'missing' }, { difficulty: 'nightmare' }, { roundsToWin: 0 }, { roundsToWin: 4 }, { roundsToWin: 1.5 },
    { roundSeconds: 14 }, { roundSeconds: 181 }, { roundSeconds: '99.5' }, { roundSeconds: '' }, { roundSeconds: '0x63' },
    { seed: 0 }, { seed: -1 }, { seed: 4294967296 }, { seed: Infinity }, { seed: NaN }, { seed: '1e3' }, { seed: true }])
    assert.equal(buildExhibitionConfigV232(choices(patch), state), null, JSON.stringify(patch));
  for (const patch of [{ roundsToWin: 1, roundSeconds: 15, seed: 1 }, { roundsToWin: 3, roundSeconds: 180, seed: 4294967295 }]) {
    const config = buildExhibitionConfigV232(choices(patch), state); assert.ok(config);
    assert.deepEqual(createXenoTrialsMatchV96(config).config, config);
  }
});

test('form reading uses exact data attributes and checkbox checked flags', () => {
  const input = choices({ mode: 'tag', controls: 'local', assists: true, record: false });
  const form = { querySelector(selector) {
    const field = /^\[data-xt-exhibition="([a-zA-Z0-9]+)"\]$/.exec(selector)?.[1];
    if (!Object.hasOwn(input, field)) return null;
    return { value: ['assists', 'record'].includes(field) ? 'on' : input[field], checked: input[field] === true };
  } };
  assert.deepEqual(readXenoTrialsExhibitionSelectionV232(form), input);
  assert.deepEqual(buildExhibitionConfigV232(form, state), buildExhibitionConfigV232(input, state));
  assert.deepEqual(readXenoTrialsExhibitionSelectionV232(null), {});
});

test('MIRE form renders four owned identity selectors, native settings and explicit no-prime text', () => {
  const html = renderXenoTrialsExhibitionFormV232(state, choices({ mode: 'tag', controls: 'local', assists: true }));
  for (const field of ['mode', 'controls', 'assists', 'player0', 'player1', 'opponent0', 'opponent1',
    'stageId', 'difficulty', 'roundsToWin', 'roundSeconds', 'seed', 'record'])
    assert.equal((html.match(new RegExp(`data-xt-exhibition="${field}"`, 'g')) || []).length, 1);
  assert.match(html, /MIRE \/ ÉVALUATION LIBRE/); assert.match(html, /ne délivre ni prime/);
  assert.match(html, /value="arachnoid::purple" selected/); assert.doesNotMatch(html, /value="queen::"/);
  assert.match(html, /data-xt-exhibition="record" checked/);
  assert.match(html, /data-xt="exhibition-start"/); assert.match(html, /data-xt="exhibition-back"/);
  const duel = renderXenoTrialsExhibitionFormV232(state);
  assert.match(duel, /data-xt-exhibition="player1" disabled/);
  assert.match(duel, /data-xt-exhibition="assists" disabled/);
  const empty = renderXenoTrialsExhibitionFormV232({ unlocked: [] });
  assert.match(empty, /Aucun spécimen acquis/); assert.match(empty, /data-xt="exhibition-start" disabled/);
  assert.match(renderXenoTrialsExhibitionFormV232({ unlocked: ['arachnoid'] }), /value="tag" disabled/);
  const untrusted = renderXenoTrialsExhibitionFormV232(state, choices({ seed: '\"><script>alert(1)</script>', player0: '<img>' }));
  assert.doesNotMatch(untrusted, /<script>|<img>/);
});

test('archive renders bounded independent play/delete IDs, known roster labels and safe empty state', () => {
  const record = index => ({ id: `xtr232-${String(index).padStart(24, '0')}`, ticks: 15000, complete: index % 2 === 0,
    config: buildExhibitionConfigV232(choices({ mode: index % 2 ? 'tag' : 'duel' }), state) });
  const records = Array.from({ length: 6 }, (_, index) => record(index)), before = JSON.stringify(records);
  const html = renderReplayArchiveV232(records);
  assert.equal((html.match(/data-xt-replay-play=/g) || []).length, 4);
  assert.equal((html.match(/data-xt-replay-delete=/g) || []).length, 4);
  for (const item of records.slice(0, 4)) {
    assert.ok(html.includes(`data-xt-replay-play="${item.id}"`)); assert.ok(html.includes(`data-xt-replay-delete="${item.id}"`));
  }
  assert.match(html, /Warrior \/ Runner/); assert.match(html, /2:05/); assert.match(html, /Relais/);
  assert.match(html, /Lecture d’archive uniquement/); assert.doesNotMatch(html, /undefined|NaN/);
  assert.equal(JSON.stringify(records), before);
  assert.match(renderReplayArchiveV232(null), /Aucun combat conservé/);
  const escaped = renderReplayArchiveV232([{ ...record(9), id: '\"><script>alert(1)</script>' }]);
  assert.doesNotMatch(escaped, /<script>|data-xt-replay-play=/);
});
