// Regression tests for the first-hour bug hunt (new game → end of the Port-Méridien quay).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { withHubDepthRoomsV188 } from '../src/hub-depth-runtime-v188.js';
import { PORT_DEPTH_ROOM_V188 } from '../src/hub-depth-rooms-v188.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { currentLanguageV185, setLanguageV185 } from '../src/i18n-v185.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

// Rail physics stand-in: the real HubGame moves x with the held direction and resolves the
// crate's rail collider; here every update advances the marine 10 px to the right.
class FakeQuay {
  constructor() { this.keys = new Set(); this.state = { deck: 0 }; this.player = { x: 382, y: 532, w: 44, h: 92, climbing: false, vx: 0, depthZ: 0 }; this.npcs = []; }
  isPortMeridienV90() { return true; }
  update() { this.player.x += 10; this.player.vx = 270; }
  nearestInteraction() { return null; }
  nearestHubNpc() { return null; }
  statusPrompt() { return ''; }
}

test('quay: a marine vaulting the ramp crate near the wall is not frozen by its floor footprint', () => {
  const Quay = withHubDepthRoomsV188(FakeQuay);
  const top = new Quay();
  top.player.y = 482; // standing on the crate (574 − 92), at the wall
  top.update(1 / 60);
  assert.equal(top.player.x, 392, 'on top of the crate the marine keeps walking towards the triage');
  const air = new Quay();
  air.player.x = 400; air.player.y = 430; air.player.depthZ = -10; // mid-vault, over the crate
  air.update(1 / 60);
  assert.equal(air.player.x, 410, 'mid-vault the marine crosses the crate');
  const floor = new Quay();
  floor.player.depthZ = -10; // on the quay floor, close to the wall: the crate still bars the way
  floor.update(1 / 60);
  assert.equal(floor.player.x, 382, 'on the floor near the wall the crate footprint still blocks');
  assert.equal(PORT_DEPTH_ROOM_V188.railCrate.depth, -34, 'the collider band is unchanged');
});

test('English: first-hour prompts and signs no longer stay in French', () => {
  const previous = currentLanguageV185();
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185('en', { document: null, storage: null, persist: false });
  try {
    const cases = [
      ['Centre d’information tactique ↔ Baie cryogénique', 'Combat information center ↔ Cryo bay'],
      ['Hangar dropship ↔ Réacteur', 'Dropship hangar ↔ Reactor'],
      ['E — RELAIS · 39 % · IMMOBILE', 'E — RELAY · 39 % · HOLD STILL'],
      ['IMMOBILE · 33 % · BOUGER ANNULE', 'HOLD STILL · 33 % · MOVING CANCELS'],
      ['E · ASSISTER LE BLESSÉ · RESTER IMMOBILE', 'E · ASSIST THE WOUNDED · HOLD STILL'],
      ['E · RÉALIMENTER LE SAS · RESTER IMMOBILE', 'E · RE-POWER AIRLOCK · HOLD STILL'],
      ['E — RÉTABLIR LA LIAISON PRIORITAIRE · 3 S · H — P-5000 HUMAIN', 'E — RESTORE PRIORITY LINK · 3 S · H — HUMAN P-5000'],
      ['F — TIRER · W/S — VISER HAUT/BAS · R — RECHARGER', 'F — FIRE · W/S — AIM HIGH/LOW · R — RELOAD'],
      ['EN COURS · CIBLES 3/9 · SCORE 120', 'IN PROGRESS · TARGETS 3/9 · SCORE 120'],
      ['TEMPS 73.2 S · VISÉE HORIZONTALE', 'TIME 73.2 S · AIM LEVEL'],
      ['LIAISON · 40 % · RESTEZ IMMOBILE', 'LINK · 40 % · HOLD STILL'],
      ['LIGNE M41A', 'M41A LINE'],
      ['E — SORTIR VERS L’ARMURERIE', 'E — EXIT TO THE ARMORY'],
      ['ASPHODÈLE · QZ ROUGE', 'ASPHODÈLE · RED QZ']
    ];
    for (const [french, english] of cases) assert.equal(autoTranslateV185(french), english, french);
    // Joined messages with an unknown piece keep the piece-by-piece fallback.
    assert.equal(autoTranslateV185('E — Texte inconnu · Salle de briefing'), 'E — Texte inconnu · Briefing room');
  } finally {
    useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
    setLanguageV185(previous, { document: null, storage: null, persist: false });
  }
});

test('French: the range HUD writes French labels, not internal ids', () => {
  const source = read('src/hub-v81-runtime.js');
  assert.doesNotMatch(source, /SORTIR VERS ARMORY/);
  assert.match(source, /PROVING_PHASE_LABELS_V188\[state\.phase\] \|\| state\.phase\.toUpperCase\(\)\} · CIBLES/);
  assert.match(source, /PROVING_AIM_LABELS_V188 = Object\.freeze\(\{ level: 'HORIZONTALE', high: 'HAUTE', low: 'BASSE' \}\)/);
});

test('creator and clock: tick box beside its label, stale refusal cleared, day prefix follows the language', () => {
  assert.match(read('player-onboarding-v84.css'), /#player-creator-v84 \.creator-check-v188 input \{ flex: none; width: 20px; height: 20px; min-width: 0;/);
  assert.match(read('src/player-creator-ui-v84.js'), /querySelector\('form'\)\.addEventListener\('input', \(\) => this\.error\(''\)\)/);
  assert.match(read('src/app.js'), /\$\{currentLanguageV185\(\) === 'en' \? 'D' : 'J'\}\$\{String\(day\)/);
});
