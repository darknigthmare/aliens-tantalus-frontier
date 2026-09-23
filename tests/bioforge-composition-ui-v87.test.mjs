import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BioforgeUiV80, buildBioforgeUiModelV80 } from '../src/bioforge-ui-v80.js';
import {
  createBioforgeV80, startBioforgeSessionV80, advanceBioforgeSessionV80,
  appendBioforgeReinforcementsV87, cancelBioforgePendingV87,
  BIOFORGE_TERRESTRIAL_ROSTER_V80
} from '../src/bioforge-session-v80.js';

const PROFILE_A = 'enemy-002-facehugger';
const PROFILE_B = 'enemy-004-drone-big-chap';
const mixed = () => ({ composition: [
  { lineId: 'facehuggers', profileId: PROFILE_A, quantity: 9 },
  { lineId: 'drones', profileId: PROFILE_B, quantity: 9 }
], maxConcurrent: 4 });
class Element {
  constructor() {
    Object.assign(this, { children: [], dataset: {}, style: {}, attributes: {}, listeners: new Map(),
      value: '', textContent: '', disabled: false, hidden: false, focused: false });
  }
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener); this.listeners.set(type, listeners);
  }
  replaceChildren(...children) { this.children = children; }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  focus() { this.focused = true; }
  dispatch(type) {
    if (this.disabled && type === 'click') return;
    return this.listeners.get(type)?.reduce((_, listener) => listener({ target: this }), undefined);
  }
}
function harness(callbacks = {}) {
  const ids = [
    'profile-v80', 'quantity-v80', 'profile-thumbnail-v80', 'profile-preview-v80', 'profile-name-v80',
    'cost-v80', 'status-v80', 'phase-v80', 'session-metrics-v80', 'start-v80', 'purge-v80', 'return-v80',
    'composition-editor-v87', 'max-concurrent-v87', 'add-line-v87', 'composition-v87', 'composition-summary-v87',
    'queue-panel-v87', 'queue-v87', 'cancel-pending-v87', 'reinforcements-v87', 'reinforce-v87',
    'reinforcement-editor-v87'
  ];
  const nodes = Object.fromEntries(ids.map(id => [id, new Element()]));
  const root = new Element();
  root.querySelector = selector => nodes[selector.slice('#bioforge-'.length)] || null;
  const errors = [];
  const ui = new BioforgeUiV80({ root, documentRef: { createElement: () => new Element() },
    onError: error => errors.push(error.message), ...callbacks });
  return { ui, nodes, errors, root };
}
function activeState(configuration = mixed()) {
  let receipt = startBioforgeSessionV80(createBioforgeV80(), configuration, { now: 1 });
  assert.equal(receipt.applied, true, receipt.reason);
  for (let index = 0; index < 4 && receipt.state.activeSession.phase !== 'printing'; index++) {
    receipt = advanceBioforgeSessionV80(receipt.state, { now: index + 2 });
    assert.equal(receipt.applied, true, receipt.reason);
  }
  assert.equal(receipt.state.activeSession.phase, 'printing');
  return receipt.state;
}
function change(node, value, event = 'input') { node.value = String(value); node.dispatch(event); }
const settle = () => new Promise(resolve => setImmediate(resolve));

test('le modèle expose total mixte, attente et plafonds distincts depuis la vraie session', () => {
  const state = activeState();
  const model = buildBioforgeUiModelV80(state);
  assert.equal(model.quantity, 18);
  assert.equal(model.pending, 18);
  assert.equal(model.printed, 0);
  assert.equal(model.maxConcurrent, 4);
  assert.equal(model.budget, 12);
  assert.equal(model.composition.length, 2);
  assert.equal(model.canEditQueue, true);
  assert.equal(model.canReturn, false);
  assert.equal(model.lines[0].pending, 9);
  assert.equal(model.lines[1].pending, 9);
  assert.match(model.status, /18 en attente/);
});

test('éditeur : ajout, changement de profil, quantité et maximum sans muter la sauvegarde', () => {
  const { ui, nodes } = harness();
  const state = createBioforgeV80(), before = structuredClone(state);
  ui.render(state);
  change(nodes['profile-v80'], PROFILE_A, 'change');
  change(nodes['quantity-v80'], 9);
  nodes['add-line-v87'].dispatch('click');
  change(nodes['profile-v80'], PROFILE_B, 'change');
  change(nodes['quantity-v80'], 9);
  change(nodes['max-concurrent-v87'], 4);
  const selection = ui.readSelection();
  assert.deepEqual(selection.composition.map(({ profileId, quantity }) => ({ profileId, quantity })),
    [{ profileId: PROFILE_A, quantity: 9 }, { profileId: PROFILE_B, quantity: 9 }]);
  assert.equal(selection.maxConcurrent, 4);
  assert.equal(nodes['start-v80'].disabled, false);
  assert.match(nodes['composition-summary-v87'].textContent, /TOTAL 18\/48.*SIMULTANÉ 4\/12/);
  assert.deepEqual(state, before);
  assert.equal(nodes['composition-v87'].children.length, 2);
  const previews = nodes['composition-v87'].children.map(row => row.children[0]);
  assert.notEqual(previews[0].style.backgroundImage, previews[1].style.backgroundImage);
  for (const preview of previews) assert.deepEqual(preview.dataset, {
    profileId: preview.dataset.profileId, atlasColumns: '4', atlasRows: '8', atlasFrame: '0'
  });
});

test('réordonner conserve les IDs ; retirer garde une sélection cohérente et au moins une ligne', () => {
  const { ui, nodes } = harness();
  ui.render(createBioforgeV80());
  nodes['add-line-v87'].dispatch('click');
  nodes['add-line-v87'].dispatch('click');
  const ids = ui.readSelection().composition.map(line => line.lineId);
  nodes['composition-v87'].children[2].children[2].children[0].dispatch('click');
  assert.deepEqual(ui.readSelection().composition.map(line => line.lineId), [ids[0], ids[2], ids[1]]);
  assert.equal(nodes['composition-v87'].children[1].children[1].focused, true);
  nodes['composition-v87'].children[1].children[2].children[2].dispatch('click');
  assert.deepEqual(ui.readSelection().composition.map(line => line.lineId), [ids[0], ids[1]]);
  nodes['composition-v87'].children[1].children[2].children[2].dispatch('click');
  assert.equal(nodes['composition-v87'].children[0].children[2].children[2].disabled, true);
  assert.equal(nodes['composition-v87'].children[0].children[2].children[0].disabled, true);
  assert.equal(nodes['composition-v87'].children[0].children[2].children[1].disabled, true);
});

test('les valeurs invalides restent visibles et ne déclenchent aucun lancement', async () => {
  let starts = 0;
  const { ui, nodes } = harness({ onStart: () => { starts++; } });
  ui.render(createBioforgeV80());
  for (const quantity of [0, 1.5, 49, -1, 'not-a-number']) {
    change(nodes['quantity-v80'], quantity);
    assert.equal(nodes['quantity-v80'].value, String(quantity));
    assert.equal(nodes['start-v80'].disabled, true);
    nodes['start-v80'].dispatch('click');
  }
  change(nodes['quantity-v80'], 48);
  change(nodes['max-concurrent-v87'], 13);
  assert.equal(nodes['start-v80'].disabled, true);
  change(nodes['max-concurrent-v87'], 1);
  assert.equal(nodes['start-v80'].disabled, false);
  assert.equal(nodes['add-line-v87'].disabled, true);
  nodes['start-v80'].dispatch('click');
  await settle();
  assert.equal(starts, 1);
});

test('les rafraîchissements identiques conservent brouillon et nœuds pour le focus clavier', () => {
  const { ui, nodes } = harness();
  const state = createBioforgeV80();
  ui.render(state);
  change(nodes['quantity-v80'], 18);
  const row = nodes['composition-v87'].children[0];
  ui.render(structuredClone(state));
  assert.equal(ui.readSelection().composition[0].quantity, 18);
  assert.equal(nodes['composition-v87'].children[0], row);
});

test('ouvrir pour un autre propriétaire réinitialise explicitement le brouillon sans reprendre ses données', () => {
  const { ui, nodes } = harness();
  const state = createBioforgeV80();
  ui.render(state);
  change(nodes['quantity-v80'], 18);
  ui.render(structuredClone(state), { resetDraft: true });
  assert.equal(ui.readSelection().composition[0].quantity, 1);
  assert.equal(nodes['quantity-v80'].value, '1');
});

test('tous les profils validés ont leur propre chemin de vignette sans substitution', () => {
  const { ui, nodes } = harness();
  ui.render(createBioforgeV80());
  assert.equal(nodes['profile-v80'].children.length, 11);
  const paths = new Set();
  for (const profile of BIOFORGE_TERRESTRIAL_ROSTER_V80) {
    change(nodes['profile-v80'], profile.profileId, 'change');
    assert.equal(nodes['profile-preview-v80'].src, profile.path);
    assert.equal(nodes['composition-v87'].children[0].children[0].style.backgroundImage, `url("${profile.path}")`);
    paths.add(profile.path);
  }
  assert.equal(paths.size, 11);
});

test('en actif, anciens contrôles verrouillés, purge disponible et pas de boutons API absente', () => {
  const { ui, nodes } = harness();
  ui.render(activeState());
  assert.equal(nodes['profile-v80'].disabled, true);
  assert.equal(nodes['quantity-v80'].disabled, true);
  assert.equal(nodes['composition-editor-v87'].hidden, true);
  assert.equal(nodes['start-v80'].hidden, true);
  assert.equal(nodes['return-v80'].hidden, true);
  assert.equal(nodes['purge-v80'].disabled, false);
  assert.equal(nodes['queue-panel-v87'].hidden, false);
  assert.equal(nodes['reinforcements-v87'].hidden, true);
  assert.equal(nodes['cancel-pending-v87'].hidden, true);
});

test('ajouter des renforts utilise la vraie opération, un requestId et des IDs neufs à chaque lot', async () => {
  let state = activeState(), calls = [];
  const { ui, nodes } = harness({ onReinforce(configuration, options) {
    calls.push({ configuration, options });
    const receipt = appendBioforgeReinforcementsV87(state, configuration, { now: 10 + calls.length, ...options });
    assert.equal(receipt.applied, true, receipt.reason);
    state = receipt.state;
    ui.render(state);
    return receipt;
  } });
  ui.render(state);
  assert.equal(nodes['reinforcements-v87'].hidden, false);
  assert.equal(ui.reinforcementEditor.maximum.disabled, true);
  change(ui.reinforcementEditor.quantity, 3);
  assert.equal(await ui.submitReinforcements(), true);
  assert.equal(state.activeSession.quantity, 21);
  change(ui.reinforcementEditor.quantity, 2);
  assert.equal(await ui.submitReinforcements(), true);
  assert.equal(state.activeSession.quantity, 23);
  assert.notEqual(calls[0].options.requestId, calls[1].options.requestId);
  assert.notEqual(calls[0].configuration.composition[0].lineId, calls[1].configuration.composition[0].lineId);
  assert.equal(new Set(state.activeSession.queue.map(entry => entry.id)).size, 23);
  assert.equal(state.activeSession.composition.length, 4);
});

test('annulation par ligne ne touche pas aux autres profils et reflète la vraie file', async () => {
  let state = activeState();
  const { ui, nodes } = harness({ onCancelPending(selection) {
    const receipt = cancelBioforgePendingV87(state, { ...selection, now: 20 });
    assert.equal(receipt.applied, true, receipt.reason);
    state = receipt.state;
    ui.render(state);
    return receipt;
  } });
  ui.render(state);
  await ui.cancelQueue({ lineId: 'facehuggers' });
  assert.equal(state.activeSession.queue.filter(entry => entry.status === 'cancelled').length, 9);
  assert.equal(buildBioforgeUiModelV80(state).pending, 9);
  assert.equal(buildBioforgeUiModelV80(state).quantity, 18, 'annuler ne rend pas les places du plafond total');
  assert.equal(nodes['queue-v87'].children[0].children[2].disabled, true);
  assert.equal(nodes['queue-v87'].children[1].children[2].disabled, false);
  assert.match(nodes['session-metrics-v80'].textContent, /ANNULÉS 9/);
});

test('annuler la file conserve le vivant et le montre encore dans les compteurs', async () => {
  let state = advanceBioforgeSessionV80(activeState(), { now: 9 }).state;
  assert.equal(state.activeSession.aliveIds.length, 1);
  const liveId = state.activeSession.aliveIds[0];
  const { ui, nodes } = harness({ onCancelPending(selection) {
    const receipt = cancelBioforgePendingV87(state, { ...selection, now: 20 });
    state = receipt.state;
    ui.render(state);
    return receipt;
  } });
  ui.render(state);
  await ui.cancelQueue({});
  const model = buildBioforgeUiModelV80(state);
  assert.equal(model.pending, 0);
  assert.equal(model.printed, 1);
  assert.equal(model.activeCount, 1);
  assert.deepEqual(state.activeSession.aliveIds, [liveId]);
  assert.equal(nodes['cancel-pending-v87'].disabled, true);
  assert.match(nodes['session-metrics-v80'].textContent, /VIVANTS 1\/4/);
});

test('double clic renfort bloqué et refus conservé sans message de faux succès ni nouvel ID', async () => {
  let release, calls = [];
  const { ui, nodes, errors } = harness({ onReinforce(configuration, options) {
    calls.push({ configuration, options });
    return new Promise(resolve => { release = resolve; });
  } });
  ui.render(activeState());
  const first = ui.submitReinforcements();
  assert.equal(ui.busy, true);
  assert.equal(ui.reinforcementEditor.profile.disabled, true);
  assert.equal(nodes['reinforce-v87'].disabled, true);
  assert.equal(await ui.submitReinforcements(), false);
  assert.equal(calls.length, 1);
  release({ applied: false, reason: 'persistence-failed' });
  assert.equal(await first, false);
  assert.equal(errors.length, 1);
  const second = ui.submitReinforcements();
  assert.equal(calls[1].options.requestId, calls[0].options.requestId);
  assert.deepEqual(calls[1].configuration, calls[0].configuration);
  release({ applied: false, reason: 'persistence-failed' });
  assert.equal(await second, false);
  assert.equal(ui.busy, false);
});

test('la limite restante inclut toute la session, même les entrées annulées', () => {
  let state = activeState({ composition: [{ lineId: 'full', profileId: PROFILE_A, quantity: 48 }], maxConcurrent: 3 });
  state = cancelBioforgePendingV87(state, { lineId: 'full', now: 10 }).state;
  const { ui, nodes } = harness({ onReinforce: () => true });
  ui.render(state);
  assert.equal(ui.reinforcementEditor.limit, 0);
  assert.equal(nodes['reinforce-v87'].disabled, true);
  assert.equal(ui.reinforcementEditor.add.disabled, true);
});

test('métriques actives intègrent la population réelle incluant les descendants', () => {
  const model = buildBioforgeUiModelV80(activeState(), {
    population: { activeCount: 2, activeCost: 5, reservedCount: 1, reservedCost: 2 }
  });
  assert.equal(model.activeCount, 2);
  assert.equal(model.activeCost, 5);
  assert.equal(model.reservedCount, 1);
  assert.equal(model.reservedCost, 2);
});

test('le statut d’attente réel survit aux rafraîchissements de métriques', () => {
  const { ui, nodes } = harness();
  const state = activeState();
  const options = { population: { activeCount: 4, activeCost: 4, reservedCount: 0, reservedCost: 0 } };
  ui.render(state, options);
  assert.match(nodes['status-v80'].textContent, /IMPRESSION EN ATTENTE : PLAFOND SIMULTANÉ ATTEINT/);
  ui.render(structuredClone(state), options);
  assert.match(nodes['status-v80'].textContent, /IMPRESSION EN ATTENTE : PLAFOND SIMULTANÉ ATTEINT/);
});

test('markup et CSS conservent accès clavier/tactile et proportions carrées des cellules sources', async () => {
  const [html, css, uiSource] = await Promise.all([
    readFile('index.html', 'utf8'), readFile('bioforge-v80.css', 'utf8'), readFile('src/bioforge-ui-v80.js', 'utf8')
  ]);
  for (const id of ['profile-v80', 'quantity-v80', 'composition-v87', 'max-concurrent-v87',
    'reinforcements-v87', 'cancel-pending-v87', 'purge-v80']) {
    assert.equal(html.split(`id="bioforge-${id}"`).length - 1, 1);
  }
  assert.match(css, /\.bioforge-profile-thumbnail-v80\s*\{[^}]*width: 76px;[^}]*height: 76px;[^}]*aspect-ratio: 1;/);
  assert.match(css, /\.bioforge-line-thumbnail-v87\s*\{[^}]*width: 64px;[^}]*height: 64px;/);
  assert.match(css, /\.bioforge-actions-v80\s*\{[^}]*position: sticky;/);
  assert.match(css, /\.bioforge-terminal-v80 :focus-visible/);
  assert.match(css, /min-height: 44px;/);
  assert.doesNotMatch(css, /\[data-session-active="true"\] \.bioforge-config-v80/);
  assert.doesNotMatch(uiSource, /innerHTML\s*=/);
});
