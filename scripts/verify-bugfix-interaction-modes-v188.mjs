// Regression tests, bug hunt "interaction priority" P2 (2026-11-14): the
// mode-specific layers join the shared E selection of game-v51-runtime.js.
// Owner decision: "the prompt is always right": E acts exactly on the target
// the visible prompt names; a pickup wins only when strictly nearer than every
// action, or when it is the only target.
// Fixture: scripts/engine-host-v188.mjs fixture({ campaign, seed, options })
// (production GameEngine, browser APIs stubbed); the authored mode levels are
// passed as options.missionLevel. Injections: actor positions, supply crates
// and security badges placed by hand, objective nodes / jamming relay / mode
// state fields set to reach a given step. Each case is listed where it is used.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './engine-host-v188.mjs';
import { CAMPAIGNS } from '../src/content.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';

const SHIP = CAMPAIGNS[0];
const campaign = id => { const found = CAMPAIGNS.find(entry => entry.id === id); assert.ok(found, id); return found; };
function isolate(engine) {
  engine.supplies = []; engine.drops = []; engine.vents = []; engine.doors = [];
  engine.powerNode = null; engine.archiveTerminal = null; engine.objective = null; engine.objectiveNodes = [];
  if (engine.weaponPickup) engine.weaponPickup.taken = true;
  if (engine.toolPickup) engine.toolPickup.taken = true;
  if (engine.vehicle) engine.vehicle.active = false;
}
function place(engine, x, feet) {
  const p = engine.player; p.x = x - p.w / 2; p.y = feet - p.h; p.vx = 0; p.vy = 0; p.grounded = true; return p;
}
// A supply crate centred `dx` px from the marine's centre, on his floor.
function crate(engine, dx, type = 'ammo') {
  const p = engine.player, w = 56, h = 42;
  const supply = { id: `qa-${type}-${dx}`, type, amount: 12, used: false, x: p.x + p.w / 2 + dx - w / 2, y: p.y + p.h / 2 - h / 2, w, h };
  engine.supplies.push(supply); return supply;
}
const agree = (engine, expected) => {
  const prompt = engine.getInteractionPrompt();
  assert.equal(prompt, expected); return prompt;
};

// ---------------------------------------------------------------- item 3
test('objective node: an action of the shared selection; a strictly nearer crate takes E and the prompt', async () => {
  const { engine, events } = await fixture({ campaign: SHIP, seed: 7 });
  isolate(engine);
  const p = place(engine, 2000, 776);
  const node = { id: 'qa-node', kind: 'rescue', x: p.x + 40, y: p.y, w: p.w, h: p.h, active: false };
  engine.objectiveNodes = [node];
  // Injection: crate 10 px from the marine's centre, node 40 px away.
  const near = crate(engine, 10);
  agree(engine, 'E  RÉCUPÉRER DES MUNITIONS');
  assert.equal(engine.interact(p), true);
  assert.equal(near.used, true, 'E takes the crate the prompt names');
  assert.equal(node.active, false, 'the farther node is left alone');
  // Crate farther than the node: the node keeps its priority as an action.
  engine.supplies = []; const far = crate(engine, 90);
  agree(engine, 'E  SÉCURISER LA CIBLE');
  assert.equal(engine.interact(p), true);
  assert.equal(node.active, true); assert.equal(far.used, false);
  assert.ok(events.some(event => event.type === 'objective-action' || event.type === 'objective-node'), JSON.stringify(events.map(e => e.type)));
});

test('objective node keeps priority over a door and over extraction at equal reach', async () => {
  const { engine } = await fixture({ campaign: SHIP, seed: 7 });
  isolate(engine);
  const p = place(engine, 2000, 776);
  const node = { id: 'qa-seal', kind: 'destroy-relay', x: p.x + 30, y: p.y, w: p.w, h: p.h, active: false };
  engine.objectiveNodes = [node];
  engine.objective = { x: p.x - 10, y: p.y, w: p.w, h: p.h };
  agree(engine, 'E  SABOTER LE RELAIS NEURO-LINK');
  assert.equal(engine.selectInteractionTargetV188(p).kind, 'objective-node-v188');
  assert.equal(engine.interact(p), true); assert.equal(node.active, true);
  assert.equal(engine.mission.state, 'active', 'extraction was not confirmed instead');
});

// ---------------------------------------------------------------- item 2
test('neuro jamming relay: a named FR/EN prompt, in the shared selection', async () => {
  const { engine, events } = await fixture({ campaign: SHIP, seed: 7 });
  isolate(engine);
  const p = place(engine, 2000, 776);
  // Injection: an armed counterplay with its relay 40 px from the marine.
  engine.neuroCounterplay = { active: true, state: 'jamming', pulses: 0, adversaryId: null,
    relay: { id: 'neuro-counter-relay', x: p.x + p.w / 2 + 40 - 27, y: p.y + p.h - 76, w: 54, h: 76, active: true } };
  const prompt = agree(engine, 'E  NEUTRALISER LE RELAIS DE BROUILLAGE');
  assert.ok(EN_CATALOG_V185[prompt], 'reviewed English');
  // A crate strictly nearer wins E and the prompt.
  const near = crate(engine, 5);
  agree(engine, 'E  RÉCUPÉRER DES MUNITIONS');
  assert.equal(engine.interact(p), true); assert.equal(near.used, true);
  assert.equal(engine.neuroCounterplay.relay.active, true, 'the relay was not hit by the crate press');
  agree(engine, prompt);
  assert.equal(engine.interact(p), true);
  assert.equal(engine.neuroCounterplay.relay.active, false);
  assert.ok(events.some(event => event.type === 'neuro-disruption-neutralized'));
});

// ---------------------------------------------------------------- item 1: mode layers
// Puts the marine on the centre of `target` (feet on its floor line).
function standOn(engine, target, feet = target.y + target.h) { return place(engine, target.x + target.w / 2, feet); }
// Injection: a dropped magazine of the marine `dx` px from his centre. Only the
// read-only V168 lookup is replaced; the pickup itself is never performed here.
function magazine(engine, dx) {
  const p = engine.player, drop = { id: `qa-mag-${dx}`, ownerId: 'qa', rounds: 0, x: p.x + p.w / 2 + dx, y: p.y + p.h - 3 };
  engine.nearestMagazineV168 = () => drop; return drop;
}

test('cargo-brutal: the cargo step is an action of the shared selection (prompt = E)', async () => {
  const { engine } = await fixture({ campaign: campaign('special-cargo-brutal'), seed: 7 });
  const state = engine.cargoBrutalV67; assert.equal(state.phase, 'restore-power');
  engine.supplies = []; engine.drops = [];
  const p = standOn(engine, engine.powerNode);
  // Crate strictly nearer than the power node: the pickup is named and taken.
  const near = crate(engine, 0);
  agree(engine, 'E  RÉCUPÉRER DES MUNITIONS');
  assert.equal(engine.interact(p), true);
  assert.equal(near.used, true); assert.equal(state.powerRestored, false);
  // Crate farther: the cargo action keeps its priority.
  engine.supplies = []; place(engine, engine.powerNode.x + engine.powerNode.w / 2 + 20, p.y + p.h); const far = crate(engine, 60);
  agree(engine, 'E  RÉTABLIR LA PUISSANCE DE SOUTE');
  assert.equal(engine.interact(p), true);
  assert.equal(state.powerRestored, true); assert.equal(far.used, false);
  // On foot beside an obstacle E cannot move it: no "E / TIR" promise.
  state.phase = 'clear-route'; const obstacle = state.obstacles.find(entry => !entry.cleared);
  place(engine, obstacle.x + (obstacle.w || 0) / 2, p.y + p.h); engine.supplies = [];
  assert.doesNotMatch(engine.getInteractionPrompt(), /DÉPLACER/);
});

test('alpha-bravo V69: the fireteam station is an action of the shared selection (prompt = E)', async () => {
  const { engine } = await fixture({ campaign: campaign('special-alpha-bravo-doctrine'), seed: 7 });
  isolate(engine);
  const station = engine.alphaBravoStationActorsV69.find(entry => engine.alphaBravoTaskStateV69(entry.taskId)?.available);
  assert.ok(station);
  const p = standOn(engine, station);
  const near = crate(engine, 0);
  agree(engine, 'E  RÉCUPÉRER DES MUNITIONS');
  assert.equal(engine.interact(p), true); assert.equal(near.used, true);
  engine.supplies = []; place(engine, station.x + station.w / 2 + 20, p.y + p.h); const far = crate(engine, 80);
  const prompt = engine.getInteractionPrompt();
  assert.equal(engine.selectInteractionTargetV188(p).kind, 'alpha-bravo-v69');
  assert.equal(prompt, engine.selectInteractionTargetV188(p).prompt);
  assert.doesNotMatch(prompt, /MUNITIONS/);
  engine.interact(p); assert.equal(far.used, false, 'E never takes the farther crate behind the station prompt');
});

// ---------------------------------------------------------------- item 4
test('V131 bow / harpoon hint names E only when an arrow or harpoon can really be recovered', async () => {
  const { WEAPONS } = await import('../src/content-core-v50.js');
  for (const [name, bare, recover] of [['Compound Bow', 'F  BANDER ET TIRER', 'E  RÉCUPÉRER UNE FLÈCHE'], ['Harpoon Gun', 'F  TIRER', 'E  RÉCUPÉRER UN HARPON']]) {
    const weapon = WEAPONS.find(entry => entry.name === name); assert.ok(weapon, name);
    const { engine } = await fixture({ campaign: SHIP, seed: 7, options: { weapon } });
    isolate(engine); engine.covers = []; engine.ladders = [];
    const p = place(engine, 2000, 776);
    const profile = engine.weaponActionProfileV131(p); assert.ok(profile, name);
    const empty = engine.getInteractionPrompt();
    assert.doesNotMatch(empty, /RÉCUPÉRER/, `${name}: no arrow on the floor, no E promise (${empty})`);
    assert.ok(empty.endsWith(bare), empty);
    assert.equal(engine.interact(p), false);
    assert.ok(EN_CATALOG_V185[bare], bare);
    // Injection: one projectile of the equipped weapon, owned by the marine, beside him.
    engine.recoverableWeaponsV131 = [{ id: 'qa-arrow', weaponId: profile.weaponId, owner: p, x: p.x + p.w / 2 + 6, y: p.y + p.h / 2 }];
    agree(engine, recover);
    const reserve = p.ammoReserve;
    assert.equal(engine.interact(p), true); assert.equal(p.ammoReserve, reserve + 1);
  }
});
