import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BIOFORGE_PHASE_LABELS_V80,
  BioforgeUiV80,
  buildBioforgeUiModelV80,
  getBioforgeProfileLabelV80
} from '../src/bioforge-ui-v80.js';
import {
  advanceBioforgeSessionV80,
  beginBioforgePurgeV80,
  completeBioforgePurgeV80,
  createBioforgeV80,
  startBioforgeSessionV80
} from '../src/bioforge-session-v80.js';

const EMPTY_REPORT = {
  remainingEntities: 0,
  remainingProjectiles: 0,
  remainingHazards: 0,
  remainingEffects: 0,
  remainingTimers: 0
};

class FakeElementV80 {
  constructor() {
    this.alt = '';
    this.children = [];
    this.dataset = {};
    this.disabled = false;
    this.hidden = false;
    this.listeners = new Map();
    this.max = '';
    this.src = '';
    this.style = {};
    this.textContent = '';
    this.value = '';
  }

  addEventListener(type, listener) { this.listeners.set(type, listener); }
  replaceChildren(...children) { this.children = children; }
}

function createBioforgeUiHarnessV80() {
  const selectors = [
    '#bioforge-profile-v80', '#bioforge-quantity-v80', '#bioforge-profile-thumbnail-v80',
    '#bioforge-profile-preview-v80', '#bioforge-profile-name-v80', '#bioforge-cost-v80',
    '#bioforge-status-v80', '#bioforge-phase-v80', '#bioforge-session-metrics-v80',
    '#bioforge-start-v80', '#bioforge-purge-v80', '#bioforge-return-v80'
  ];
  const nodes = Object.fromEntries(selectors.map((selector) => [selector, new FakeElementV80()]));
  const root = new FakeElementV80();
  root.querySelector = (selector) => nodes[selector] || null;
  const documentRef = { createElement: () => new FakeElementV80() };
  const ui = new BioforgeUiV80({ root, documentRef });
  return { nodes, root, ui };
}

test('le modèle UI expose une configuration bornée et une plaque dédiée', () => {
  const model = buildBioforgeUiModelV80(createBioforgeV80());
  assert.equal(model.phase, 'configuration');
  assert.equal(model.phaseLabel, BIOFORGE_PHASE_LABELS_V80.configuration);
  assert.equal(model.canStart, true);
  assert.equal(model.canPurge, false);
  assert.equal(model.canReturn, true);
  assert.match(model.profile.path, /^\/assets\/openai\/sprites\/normalized\//);
  assert.ok(model.maximumQuantity >= 1 && model.maximumQuantity <= 12);
  assert.equal(getBioforgeProfileLabelV80(model.profileId), 'Drone Big Chap');
});

test('l’UI verrouille sortie et sélection pendant une session active', () => {
  let receipt = startBioforgeSessionV80(createBioforgeV80(), {
    profileId: 'enemy-002-facehugger',
    quantity: 3
  }, { now: 10 });
  receipt = advanceBioforgeSessionV80(receipt.state, { now: 20 });
  const model = buildBioforgeUiModelV80(receipt.state);
  assert.equal(model.phase, 'sealing');
  assert.equal(model.active, true);
  assert.equal(model.canStart, false);
  assert.equal(model.canPurge, true);
  assert.equal(model.canReturn, false);
});

test('le retour UI ne devient possible qu’après une purge atomique complète', () => {
  let receipt = startBioforgeSessionV80(createBioforgeV80(), {
    profileId: 'enemy-055-albino-chestburster',
    quantity: 2
  }, { now: 10 });
  receipt = beginBioforgePurgeV80(receipt.state, 'ui-test', { now: 20 });
  assert.equal(buildBioforgeUiModelV80(receipt.state).canReturn, false);
  receipt = completeBioforgePurgeV80(receipt.state, EMPTY_REPORT, { now: 30 });
  const model = buildBioforgeUiModelV80(receipt.state);
  assert.equal(model.phase, 'return');
  assert.equal(model.canReturn, true);
  assert.equal(model.canPurge, false);
  assert.match(model.status, /RETOUR AUTORISÉ/);
});

test('la vignette cadre la cellule zéro et une session active ne conserve que la purge visible', () => {
  const { nodes, root, ui } = createBioforgeUiHarnessV80();
  let state = createBioforgeV80();
  ui.render(state);
  const preview = nodes['#bioforge-profile-preview-v80'];
  const thumbnail = nodes['#bioforge-profile-thumbnail-v80'];
  assert.match(preview.src, /^\/assets\/openai\/sprites\/normalized\//u);
  assert.equal(preview.alt, 'Plaque validée · Drone Big Chap');
  assert.equal(thumbnail.style.backgroundImage, `url("${preview.src}")`);
  assert.deepEqual(
    { columns: thumbnail.dataset.atlasColumns, rows: thumbnail.dataset.atlasRows, frame: thumbnail.dataset.atlasFrame },
    { columns: '4', rows: '8', frame: '0' }
  );
  assert.equal(nodes['#bioforge-start-v80'].hidden, false);
  assert.equal(nodes['#bioforge-return-v80'].hidden, false);

  let receipt = startBioforgeSessionV80(state, { profileId: 'enemy-002-facehugger', quantity: 2 }, { now: 10 });
  receipt = advanceBioforgeSessionV80(receipt.state, { now: 20 });
  state = receipt.state;
  ui.render(state);
  assert.equal(root.dataset.sessionActive, 'true');
  assert.equal(nodes['#bioforge-start-v80'].hidden, true);
  assert.equal(nodes['#bioforge-return-v80'].hidden, true);
  assert.equal(nodes['#bioforge-purge-v80'].hidden, false);
  assert.equal(nodes['#bioforge-purge-v80'].disabled, false);

  receipt = beginBioforgePurgeV80(state, 'ui-visibility-test', { now: 30 });
  receipt = completeBioforgePurgeV80(receipt.state, EMPTY_REPORT, { now: 40 });
  ui.render(receipt.state);
  assert.equal(root.dataset.sessionActive, 'false');
  assert.equal(nodes['#bioforge-start-v80'].hidden, false);
  assert.equal(nodes['#bioforge-return-v80'].hidden, false);
  assert.equal(nodes['#bioforge-return-v80'].disabled, false);
});
