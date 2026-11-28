import assert from 'node:assert/strict';
import test from 'node:test';
import { autoTranslateV185, loadCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_GROUNDING_OPERATION_V223 as reactor, getXenoTrialsGroundingDoorV223 } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207,
  XENO_TRIALS_PRACTICE_DRILLS_V224, XENO_TRIALS_PRACTICE_DRILLS_V225 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';

const jump = { jump: true };
const superInput = { super: true };
const interact = { interact: true };

test('the joined active and retry cues are translated inside the live English objective line', async () => {
  await loadCatalogV185();
  setLanguageV185('en', { persist: false });
  try {
    const nodes = new Map();
    const ui = { el(name) {
      if (!nodes.has(name)) nodes.set(name, { dataset: {} });
      return nodes.get(name);
    } };
    for (const [objective, cue, expected] of [
      ['Engager le Super dans leur direction', 'TROIS CONTACTS À PORTÉE · SUPER', ['Launch Super toward them', 'THREE CONTACTS IN RANGE · SUPER']],
      ['Sauter après le départ et laisser passer le tir en dessous', 'TIR PARTI · SAUTEZ SUR PLACE',
        ['Jump after the shot launches and let it pass beneath you', 'SHOT AWAY · JUMP IN PLACE']],
      ['Synchroniser une autre balise pendant sa fenêtre verte', 'BALISE VERTE · MAINTENEZ INTERACTION',
        ['Synchronize another beacon during its green window', 'GREEN BEACON · HOLD INTERACT']],
    ]) {
      XenoTrialsUiV96.prototype.updatePracticeV207.call(ui, { id: 'translation-check', state: 'active', index: 0, objectives: [objective], cue });
      const html = ui.el('practice-target').innerHTML;
      assert.equal(html, `<span>${objective}</span> · <span>${cue}</span>`);
      assert.deepEqual([...html.matchAll(/<span>([^<]+)<\/span>/g)].map(match => autoTranslateV185(match[1])), expected);
    }
    assert.equal(autoTranslateV185('ATTENDEZ TROIS CONTACTS AVANT DE LANCER SUPER · REJOUER'),
      'WAIT FOR THREE CONTACTS BEFORE FIRING SUPER · REPLAY');
  } finally {
    setLanguageV185('fr', { persist: false });
  }
});

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  const events = [...match.events];
  let serial = match.serial;
  function step(input = {}) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
    coach.observe(input, true);
    events.push(...match.events.filter(event => event.id > serial));
    serial = match.serial;
  }
  function until(condition, input = {}, limit = 1600) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++)
      step(typeof input === 'function' ? input() : input);
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  return { match, coach, player, opponent, step, until, events };
}

test('the same locked Spitter projectile crosses under a real jump taken after the native launch', () => {
  const { match, coach, player, opponent, step, until, events } = start('aimed-acid-timing');
  const initial = { x: player.x, hp: player.hp };
  until(() => coach.view().index === 1);
  const attackId = opponent.attack.id;
  assert.equal(match.projectiles.length, 0);
  until(() => coach.view().cue === 'TIR PARTI · SAUTEZ SUR PLACE');
  const shot = match.projectiles.find(candidate => candidate.groupIdV147 === attackId);
  const vector = [shot.vx, shot.vy];
  assert.equal(shot.signatureIdV147, 'fte-spitter-aimed-acid');
  assert.ok(shot.vx < 0 && shot.vy < 0);
  assert.equal(player.y, 0);
  step(jump);
  until(() => coach.view().state === 'complete');
  const body = getXenoTrialsBodyBoundsV105(player);
  assert.ok(shot.x < body.left - shot.radiusV147 && player.y > shot.y + shot.radiusV147);
  assert.deepEqual([shot.vx, shot.vy], vector);
  assert.deepEqual({ x: player.x, hp: player.hp }, initial);
  assert.equal(events.some(event => ['hit', 'block'].includes(event.type)), false);
});

test('jumping before emission raises the observed native trajectory, and remaining on the floor takes the shot', () => {
  const rushed = start('aimed-acid-timing');
  rushed.until(() => rushed.coach.view().index === 1);
  const aimedAt = rushed.match.tick;
  rushed.until(() => rushed.match.tick >= aimedAt + 31);
  rushed.step(jump);
  rushed.until(() => rushed.coach.view().state === 'retry');
  assert.equal(rushed.coach.view().retryCue, 'ATTENDEZ LE DÉPART DU TIR AVANT DE SAUTER');
  assert.equal(rushed.coach.view().index, 1);
  const lifted = rushed.match.projectiles.find(shot => shot.owner === 'opponent');
  assert.ok(rushed.player.y > 0 && lifted.vy > 0);

  const late = start('aimed-acid-timing');
  const hp = late.player.hp;
  late.until(() => late.coach.view().state === 'retry');
  assert.equal(late.coach.view().index, 2);
  assert.ok(late.player.hp < hp);
  assert.ok(late.events.some(event => event.type === 'hit' && event.attacker === 'opponent' && event.side === 'player'));
});

test('one paid native Loader Super hits three distinct contacts with the same attack', () => {
  const { match, coach, player, step, until, events } = start('horde-sweep');
  until(() => coach.view().cue === 'TROIS CONTACTS À PORTÉE · SUPER');
  assert.equal(player.superMeterV148, 100);
  assert.equal(player.facing, -1);
  const stamina = player.stamina;
  step(superInput);
  const cast = player.attack.id;
  assert.ok(player.stamina < stamina);
  assert.equal(player.superMeterV148, 0);
  assert.equal(coach.view().index, 2);
  until(() => coach.view().state === 'complete');
  const superStarts = events.filter(event => event.type === 'attack' && event.attackerInstanceV180 === 'player');
  assert.deepEqual(superStarts.map(event => [event.id, event.superIdV148]), [[cast + 1, 'synth-automated-powerloader::super1']]);
  const targets = events.filter(event => event.type === 'hit' && event.attackerInstanceV180 === 'player')
    .map(event => event.targetInstanceV180);
  assert.equal(new Set(targets).size, 3);
  assert.deepEqual(targets, player.attack.hitTargetsV180);
  assert.equal(match.hordeV180.totalKills, 3);
  assert.equal(match.result, null);
});

test('a premature Super really spends the gauge and hits a smaller group before the workshop explains the failure', () => {
  const { match, coach, player, step, until, events } = start('horde-sweep');
  until(() => match.tick === 235);
  assert.equal(coach.view().index, 0);
  step(superInput);
  assert.equal(player.superMeterV148, 0);
  until(() => coach.view().state === 'retry');
  const strikes = events.filter(event => event.type === 'hit' && event.attackerInstanceV180 === 'player');
  assert.ok(strikes.length > 0 && strikes.length < 3);
  assert.equal(coach.view().retryCue, 'ATTENDEZ TROIS CONTACTS AVANT DE LANCER SUPER');
  assert.equal(match.result, null);
  assert.equal(start('horde-sweep').player.superMeterV148, 100);
});

test('a native hostile arc contact powers the reactor and a separate opened-door interaction closes the operation', () => {
  const { match, coach, player, until, events } = start('reactor-lure');
  until(() => coach.view().cue === 'LAISSEZ UN CONTACT ENTRER DANS LA BANDE', interact);
  assert.equal(getXenoTrialsStageHazardViewV188(match).phase, 'warning');
  assert.equal(match.operationV188.progress[0], 0);
  until(() => coach.view().cue === 'ATTENDEZ L’OUVERTURE DU SAS', interact);
  const activation = match.operationV188.groundingActivationV223;
  assert.equal(activation.method, 'arc');
  const hit = events.find(event => event.type === 'stage-hazard-contact-v188' && event.tick === activation.tick);
  const powered = events.find(event => event.type === 'operation-objective-v188' && event.objectiveId === reactor.objectives[0].id);
  assert.match(hit.actorId, /^horde-/);
  assert.ok(hit.id < powered.id && hit.damage > 0);
  assert.equal(match.stageHazardsV188.playerDamage, 0);
  assert.equal(match.operationV188.progress[1], 0);
  until(() => coach.view().cue === 'REJOIGNEZ LE SAS ET MAINTENEZ INTERACTION', interact);
  assert.equal(getXenoTrialsGroundingDoorV223(match).opening, 1);
  assert.equal(match.tick, activation.tick + reactor.groundingOpeningTicksV223);
  until(() => coach.view().state === 'complete', () => ({ interact: true, right: player.x < 1120 }));
  const exit = events.find(event => event.type === 'operation-objective-v188' && event.objectiveId === reactor.objectives[1].id);
  assert.ok(exit.tick >= activation.tick + reactor.groundingOpeningTicksV223);
  assert.equal(match.result?.reason, 'operation-complete');
  assert.equal(match.opponentInputSourceV163, 'cpu');
  assert.equal(match.result.hordeV180.kills, 0);
});

test('entering the reactor arc as the player really takes damage and never counts as hostile activation', () => {
  const { match, coach, player, until, events } = start('reactor-lure');
  until(() => coach.view().index === 1);
  until(() => coach.view().state === 'retry', () => {
    const [zone] = getXenoTrialsStageHazardViewV188(match).zones;
    const x = (zone.left + zone.right) / 2;
    return { left: player.x > x + 6, right: player.x < x - 6 };
  });
  const contact = events.find(event => event.type === 'stage-hazard-contact-v188' && event.actorId === 'player');
  assert.equal(contact.kind, 'arc');
  assert.equal(match.stageHazardsV188.playerDamage, contact.damage);
  assert.equal(match.operationV188.groundingActivationV223, null);
  assert.equal(coach.view().index, 1);
  assert.equal(coach.view().retryCue, 'RESTEZ HORS DE LA BANDE ET LAISSEZ PASSER UN CONTACT');
});

test('56 workshops preserve all 53 previous completion marks and the rated economy', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V225.length, 56);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V225.slice(0, 53), XENO_TRIALS_PRACTICE_DRILLS_V224);
  const historical = XENO_TRIALS_PRACTICE_DRILLS_V224.map(entry => entry.id);
  const additions = ['aimed-acid-timing', 'horde-sweep', 'reactor-lure'];
  const baseline = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: historical });
  let profile = baseline;
  for (const id of additions) {
    const completion = completeXenoTrialsPracticeV207(profile, id);
    assert.equal(completion.applied, true);
    profile = completion.state;
    assert.equal(completeXenoTrialsPracticeV207(profile, id).applied, false);
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(profile), { ...baseline, practiceClearedV207: [...historical, ...additions] });
});
