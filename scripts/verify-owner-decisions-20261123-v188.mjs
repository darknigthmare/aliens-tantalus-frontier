// Owner decisions of 2026-11-23 (docs/development/QUESTIONS_PROPRIETAIRE_V188.md): P-1 to P-5 of the full
// playthrough, arsenal A1 (194–196 purchasable behind a provisional plaque) and A5 (manual pump option),
// plus the small recorded defects R3–R6. Fixtures: default saves built by the game rules; the shared
// Forge-native mission host (forge-native-host-v136.mjs); a hub runtime prototype with declared stub
// fields for the crisis rules (no canvas). Declared injections are named where they happen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS, WEAPONS } from '../src/content.js';
import { createDefaultSave, migrateSave, getOperationBrief, getProcurementQuote, procureCatalogItem } from '../src/save.js';
import { applyColonyMissionResultV188, advanceColonySiteV188 } from '../src/colony-missions-v188.js';
import { COLONY_SUPPLY_RETURNS_V188, addColonySuppliesV188, colonySupplySourcesTextV188, colonySuppliesLineV188,
  applyColonyOperationResultV188, investColonySiteV188, COLONY_WORLD_ID_V188 } from '../src/colony-reconstruction-v188.js';
import { getJumpReadinessV115 } from '../src/galaxy-jump-v115.js';
import { infestationJumpGuidanceV188, INFESTATION_JUMP_ANNEX_IDS_V188 } from '../src/galaxy-travel-v188.js';
import { createInfestationExposureV62 } from '../src/infestation-chain-v62.js';
import { applyHubAnnexBusinessV71 } from '../src/hub-annex-services-v71.js';
import { deriveStoryCampaignV188, STORY_ACT_ONE_CAMPAIGN_ID_V188, STORY_RELAY_CAMPAIGN_ID_V188, startInterludeV188,
  interludeCrisisDeckBoundV188, INTERLUDE_CRISIS_V188 } from '../src/story-campaign-v188.js';
import { createHubCrisis } from '../src/world-crisis-core.js';
import { HubGame as HubV51, HUB_DECKS, HUB_WORLD } from '../src/hub-v51-runtime.js';
import { act5CouncilV188 } from '../src/story-act5-v188.js';
import { hasProvisionalPlaqueV188, PROVISIONAL_PLAQUE_WEAPON_IDS_V188, provisionalPlaqueSlotV188, drawProvisionalPlaqueV188,
  mountProvisionalPlaqueV188 } from '../src/weapon-provisional-plaque-v188.js';
import { resolveWeaponVisualProfileV63 } from '../src/weapon-visual-runtime-v63.js';
import { KEY_ACTIONS_V188, defaultKeyBindingsV188, normalizeKeyBindingsV188 } from '../src/accessibility-v188.js';
import { PUMP_ACTION_CODE_V188 } from '../src/weapon-arsenal-runtime-v188.js';
import { getPlayerOpeningObjectiveV88 } from '../src/player-opening-v88.js';
import { getOpeningExerciseObjectiveV89 } from '../src/opening-exercise-v89.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { missionV136 } from './forge-native-host-v136.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const app = read('src/app.js');
const campaign = id => { const entry = CAMPAIGNS.find(candidate => candidate.id === id); assert.ok(entry, 'registered campaign: ' + id); return entry; };
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId);
const STEP = 1 / 60;
const run = (engine, frames) => { for (let i = 0; i < frames; i++) engine.update(STEP); };

// —— P-1 · supplies ——
// The main line of the full playthrough (PLAYTHROUGH_V188_20261122.md, steps 5 to 20), in its order.
const MAIN_LINE = Object.freeze(['special-narrative-qz17', 'colony-c1', 'special-archive-relay', 'colony-c2',
  'station-s1', 'station-s2', 'station-s3', 'station-s4', 'special-apc-convoy', 'special-c12-horde', 'colony-c3',
  'special-black-cocoon', 'colony-c4', 'act5-last-run', 'act5-depot-queen', 'act5-port-walls']);
/** Walks the sortie sequence on the supply rules only: launch cost from the real brief, colony returns from the real result. */
function walkMainLine({ returns = true, retriesBefore = {}, spentAboard = 0 } = {}) {
  const save = createDefaultSave(), trace = [];
  save.hub.systems.supplies -= spentAboard; // declared injection: supplies spent aboard (a rest costs 2, a quarantine 3)
  for (const id of MAIN_LINE) {
    const entry = campaign(id), world = worldOf(entry);
    for (let attempt = 0; attempt <= (retriesBefore[id] || 0); attempt++) {
      const cost = getOperationBrief(save, entry, world).cost.supplies, before = save.hub.systems.supplies;
      if (before < cost) return { save, trace, deadEnd: { id, before, cost } };
      save.hub.systems.supplies = before - cost;
      const success = attempt === (retriesBefore[id] || 0);
      if (success) {
        if (!save.galaxy.completedCampaignIds.includes(id)) save.galaxy.completedCampaignIds.push(id);
        if (returns) applyColonyMissionResultV188(save, { success: true, campaignId: id });
      }
      trace.push({ id, cost, before, after: save.hub.systems.supplies, success });
    }
  }
  return { save, trace, deadEnd: null };
}

test('P-1 supplies: the main line from a new game (78 supplies, 16 sorties) never dead-ends, with room for failed sorties', () => {
  assert.equal(createDefaultSave().hub.systems.supplies, 78, 'a new game starts with 78 supplies');
  assert.deepEqual({ ...COLONY_SUPPLY_RETURNS_V188 }, { mission: 8, site: 4 }, '[PROPOSÉ] values');
  // Before the decision (no return): 13 sorties at 6 empty the hold; one rest aboard (2 supplies) and the
  // line stops at C4 with 4/6, which is what the playthrough met (5/6).
  const dry = walkMainLine({ returns: false });
  assert.deepEqual(dry.deadEnd, { id: 'act5-last-run', before: 0, cost: 6 }, 'without a source the main line dead-ends');
  assert.deepEqual(walkMainLine({ returns: false, spentAboard: 2 }).deadEnd, { id: 'colony-c4', before: 4, cost: 6 });
  // With the returns: every sortie can be launched.
  const line = walkMainLine();
  assert.equal(line.deadEnd, null, JSON.stringify(line.deadEnd));
  assert.equal(line.trace.length, MAIN_LINE.length);
  assert.ok(line.trace.filter(step => MAIN_LINE.indexOf(step.id) < MAIN_LINE.indexOf('colony-c4')).length >= 12, 'about 13 sorties before C4');
  const lowest = Math.min(...line.trace.map(step => step.after));
  assert.ok(lowest >= 30, 'five sorties of margin at the lowest point: ' + lowest);
  assert.equal(walkMainLine({ spentAboard: 20 }).deadEnd, null, 'ten rests aboard still leave the line open');
  // Each colony mission of the line sent back its mission and its site level.
  for (const step of line.trace.filter(entry => /^colony-c[1-4]$/.test(entry.id)))
    assert.equal(step.after, Math.min(100, step.before - step.cost + COLONY_SUPPLY_RETURNS_V188.mission + COLONY_SUPPLY_RETURNS_V188.site), step.id);
  // One failed attempt before each of five different sorties still never dead-ends.
  const rough = walkMainLine({ retriesBefore: { 'special-narrative-qz17': 1, 'station-s2': 1, 'special-apc-convoy': 1, 'special-black-cocoon': 1, 'act5-depot-queen': 1 } });
  assert.equal(rough.deadEnd, null, 'five failed sorties are affordable: ' + JSON.stringify(rough.deadEnd));
  // A replayable contract nets supplies: a visible way to refill the hold.
  const refill = createDefaultSave(); refill.hub.systems.supplies = 6; refill.galaxy.completedCampaignIds.push('special-narrative-qz17', 'colony-c1');
  const contract = campaign('colony-l-murs'), cost = getOperationBrief(refill, contract, worldOf(contract)).cost.supplies;
  refill.hub.systems.supplies -= cost; applyColonyMissionResultV188(refill, { success: true, campaignId: contract.id });
  assert.equal(refill.hub.systems.supplies, 6 - cost + COLONY_SUPPLY_RETURNS_V188.mission); assert.ok(refill.hub.systems.supplies > 6, 'net gain');
});

test('P-1 supplies: sources, cap, replay and site validation; the Command table names them and the refusal stays', () => {
  const save = createDefaultSave(); save.hub.systems.supplies = 20;
  save.galaxy.completedCampaignIds.push('special-narrative-qz17', 'colony-c1');
  assert.equal(applyColonyMissionResultV188(save, { success: true, campaignId: 'colony-c1' }).kind, 'reward');
  assert.equal(save.hub.systems.supplies, 32, 'mission 8 + site level 4');
  assert.equal(applyColonyMissionResultV188(save, { success: true, campaignId: 'colony-c1' }).kind, 'replay');
  assert.equal(save.hub.systems.supplies, 40, 'a replay sends its mission supplies, no site level');
  assert.equal(applyColonyMissionResultV188(save, { success: false, campaignId: 'colony-c2' }), null);
  assert.equal(save.hub.systems.supplies, 40, 'a failure returns nothing');
  assert.ok(advanceColonySiteV188(save, 'power', { build: true })); assert.equal(save.hub.systems.supplies, 44, 'a site level validated by a quest');
  save.hub.systems.supplies = 99; assert.equal(addColonySuppliesV188(save, 8), 1); assert.equal(save.hub.systems.supplies, 100, 'hold capped at 100');
  // Before C1, an operation on Cocyte validates the pending level: that also returns the site supplies.
  const early = createDefaultSave(); early.galaxy.completedCampaignIds.push('special-archive-relay');
  early.galaxy.resources.credits = 5000; early.galaxy.resources.alloy = 500; early.hub.systems.supplies = 10;
  assert.equal(investColonySiteV188(early, 'walls').ok, true);
  assert.equal(applyColonyOperationResultV188(early, { success: true, worldId: COLONY_WORLD_ID_V188 }).validated, 'walls');
  assert.equal(early.hub.systems.supplies, 14);
  for (const [language, pattern] of [['fr', /\+8 par mission de Port-Méridien réussie, \+4 par niveau de chantier validé/], ['en', /\+8 per successful Port-Méridien mission, \+4 per reconstruction site level validated/]])
    assert.match(colonySupplySourcesTextV188(language), pattern);
  assert.equal(colonySuppliesLineV188(0, 'fr'), ''); assert.match(colonySuppliesLineV188(10, 'fr'), /\+10 ravitaillement/); assert.match(colonySuppliesLineV188(10, 'en'), /\+10 supplies/);
  assert.match(app, /supply-sources-v188/, 'the Command table carries the source line');
  assert.match(app, /colonySupplySourcesTextV188\(document\.documentElement\.lang\)/);
  assert.match(app, /data-launch-refusal-v188/, 'the « insufficient resources » line is kept');
  assert.match(app, /outcome\.suppliesPaidV188/, 'the debrief names the supplies sent back');
});

// —— P-2 · the Nacre-7 jump blocked by an open infestation chain ——
test('P-2 jump: the block stays, the panel says why and where to resolve it (FR/EN), and the three consoles act on the chain', () => {
  const save = createDefaultSave();
  assert.equal(infestationJumpGuidanceV188(save), null, 'no chain, no guidance');
  createInfestationExposureV62(save, { type: 'live-specimen', id: 'test-exposure', campaignId: 'act5-depot-queen', severity: 45 });
  const destination = WORLDS.find(world => save.galaxy.unlockedWorldIds.includes(world.id) && world.id !== save.worldId) || WORLDS[1];
  assert.ok(getJumpReadinessV115(save, destination, WORLDS).reasons.includes('Infestation à bord non résolue'), 'the block is unchanged');
  const fr = infestationJumpGuidanceV188(save, 'fr'), en = infestationJumpGuidanceV188(save, 'en');
  assert.match(fr.why, /^Pourquoi : .*contamination à bord \(étape : exposition\)/); assert.match(en.why, /^Why: .*contamination aboard \(stage: exposure\)/);
  assert.match(fr.how, /sas d’arrivée.*CCTV.*BIOFORGE/s); assert.match(en.how, /arrival airlock.*CCTV.*BIOFORGE/s);
  assert.deepEqual([...fr.annexIds], ['arrival-airlock', 'cctv', 'bioforge']); assert.equal(fr.breach, false);
  // The consoles named by the guidance are the services that strengthen containment.
  let score = save.hub.infestationChain.containment.score;
  for (const annexId of INFESTATION_JUMP_ANNEX_IDS_V188) {
    applyHubAnnexBusinessV71(save, annexId);
    const next = save.hub.infestationChain.containment.score;
    assert.ok(next > score, annexId + ' raises the containment score'); score = next;
  }
  // Containment failed: the guidance points at the intrusion aboard instead.
  save.hub.infestationChain.stage = 'infestation';
  assert.equal(infestationJumpGuidanceV188(save, 'fr').breach, true); assert.match(infestationJumpGuidanceV188(save, 'fr').how, /confinement a cédé/);
  assert.match(infestationJumpGuidanceV188(save, 'en').how, /containment has failed/i);
  save.hub.infestationChain.resolved = true;
  assert.equal(infestationJumpGuidanceV188(save), null, 'a closed chain needs no guidance');
  assert.match(app, /data-jump-infestation-guidance-v188/, 'the galaxy jump panel shows it');
});

// —— P-3 · act order ——
test('P-3 order: after the prologue Act I (QZ-17) is recommended, then Act II (QZ-18); QZ-18 stays launchable and old saves stay valid', () => {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  save.onboardingV84 = { phase: 'complete' }; save.openingV88 = { phase: 'ready' }; save.portMeridienV90 = { phase: 'complete' };
  const first = deriveStoryCampaignV188(save, { language: 'fr' });
  assert.equal(first.step, 'briefing'); assert.equal(first.recommendedCampaignId, STORY_ACT_ONE_CAMPAIGN_ID_V188);
  assert.match(first.objective, /Acte I « La cargaison fantôme » \(QZ-17\)/);
  assert.match(deriveStoryCampaignV188(save, { language: 'en' }).objective, /Act I "The Ghost Cargo" \(QZ-17\)/);
  save.galaxy.completedCampaignIds.push(STORY_ACT_ONE_CAMPAIGN_ID_V188);
  const second = deriveStoryCampaignV188(save, { language: 'fr' });
  assert.equal(second.recommendedCampaignId, STORY_RELAY_CAMPAIGN_ID_V188); assert.match(second.objective, /QZ-18/);
  // An existing save that played QZ-18 first, or is inside it, keeps its state.
  const old = createDefaultSave(); old.needsPlayerCreationV84 = false; old.onboardingV84 = { phase: 'complete' }; old.openingV88 = { phase: 'ready' }; old.portMeridienV90 = { phase: 'complete' };
  old.strategy.currentOperation = { campaignId: STORY_RELAY_CAMPAIGN_ID_V188 };
  assert.equal(deriveStoryCampaignV188(old).step, 'qz18', 'a QZ-18 in progress is still followed');
  old.strategy.currentOperation = null; old.galaxy.completedCampaignIds.push(STORY_RELAY_CAMPAIGN_ID_V188);
  assert.equal(deriveStoryCampaignV188(old).step, 'debrief');
  assert.match(app, /Prochaine étape conseillée : Acte I \(QZ-17\), puis Acte II \(QZ-18\)/, 'the Lethe notebook advice names Act I first');
  // No lock was added: the QZ-18 brief is unchanged by the order.
  const relay = campaign(STORY_RELAY_CAMPAIGN_ID_V188);
  assert.equal(getOperationBrief(createDefaultSave(), relay, worldOf(relay)).worldUnlocked, true);
});

// —— P-4 · Interlude crisis on deck 2 ——
/** Hub runtime prototype with the fields the crisis rules read (declared stubs; no canvas, no art). */
function crisisHub(deck, bound) {
  const hub = Object.create(HubV51.prototype), actions = [];
  Object.assign(hub, { enemies: [], projectiles: [], floorY: HUB_WORLD.floorY, state: { deck, activeCrisis: null }, v51Walls: [], obstacles: [], v51Doors: [],
    player: { x: 400, y: HUB_WORLD.floorY - 92, w: 44, h: 92, alive: true, health: 100 }, persist() {}, onAction: action => actions.push(action),
    damagePlayer() {}, crisisDeckBoundV188: bound });
  return { hub, actions };
}
test('P-4 Interlude: the quarantine threats spawn on deck 2 around the quarantine room and wait there; other crises are unchanged', () => {
  const save = createDefaultSave();
  save.storyCampaignV188 = { ...save.storyCampaignV188, m577Manifest: { containers: 1, colonists: 4, resolved: true } };
  save.galaxy.completedCampaignIds.push('special-apc-convoy', 'special-c12-horde');
  const crisis = startInterludeV188(save, createHubCrisis);
  assert.ok(crisis, 'the Interlude starts'); assert.equal(crisis.deck, INTERLUDE_CRISIS_V188.deck); assert.equal(INTERLUDE_CRISIS_V188.deck, 2);
  assert.equal(interludeCrisisDeckBoundV188(save, save.hub.activeCrisis), true);
  assert.equal(interludeCrisisDeckBoundV188(save, { ...save.hub.activeCrisis, id: 'crisis-other' }), false, 'only the Interlude crisis is bound');
  const bound = candidate => interludeCrisisDeckBoundV188(save, candidate);
  // The marine is on deck 0 when the alert starts: nothing spawns around him.
  const { hub, actions } = crisisHub(0, bound);
  hub.state.activeCrisis = save.hub.activeCrisis; hub.configureCrisis(save.hub.activeCrisis);
  const count = hub.crisis.initialThreats;
  assert.equal(hub.crisis.deckV188, 2); assert.equal(hub.enemies.length, 0, 'no threat on the marine’s deck');
  assert.deepEqual(hub.crisisHeldThreatsV188(), { count, deck: 2 });
  for (let i = 0; i < 120; i++) hub.updateCombat(STEP);
  assert.equal(hub.crisis.active, true, 'the crisis is not resolved by an empty deck'); assert.equal(actions.length, 0);
  // He takes the lift to deck 2: the threats are there, around the quarantine room.
  hub.state.deck = 2; hub.player.x = 60; hub.updateCombat(STEP);
  assert.equal(hub.enemies.length, count); assert.equal(hub.crisisHeldThreatsV188(), null);
  const roomIndex = HUB_DECKS[2].rooms.findIndex(room => room.id === 'quarantine');
  assert.ok(roomIndex >= 0, 'deck 2 holds the quarantine room');
  const centre = (roomIndex + 0.5) * HUB_WORLD.roomWidth;
  for (const enemy of hub.enemies) assert.ok(Math.abs(enemy.x + enemy.w / 2 - centre) <= 190 * count / 2 + 1, 'spawned around the quarantine room');
  // Leaving the deck does not lose them; clearing them on deck 2 resolves the crisis once.
  hub.state.deck = 1; hub.updateCombat(STEP); assert.equal(hub.enemies.length, 0); assert.equal(hub.crisis.active, true);
  hub.state.deck = 2; hub.updateCombat(STEP);
  for (const enemy of hub.enemies) enemy.alive = false; // declared injection: threats neutralised
  hub.updateCombat(STEP);
  assert.equal(hub.crisis.resolved, true); assert.deepEqual(actions.map(action => action.action), ['crisis:resolved']);
  // An ordinary crisis (not bound by the host) keeps the historical behaviour: threats on the marine's deck.
  const ordinary = crisisHub(0, () => false);
  ordinary.hub.configureCrisis({ id: 'crisis-fire', kind: 'fire', count: 3, deck: 3, roomId: 'reactor', resolved: false });
  assert.equal(ordinary.hub.enemies.length, 3); assert.equal(ordinary.hub.crisis.deckV188, undefined);
  assert.match(app, /hubEngine\.crisisDeckBoundV188 = crisis => interludeCrisisDeckBoundV188\(saveSystem\.data, crisis\)/);
});

// —— P-5 · war council wording ——
test('P-5 council: exactly one container gets its own sentence; the 0 and 2–3 container texts are unchanged', () => {
  const noteFor = (containers, language) => {
    const save = createDefaultSave();
    save.storyCampaignV188 = { ...save.storyCampaignV188, m577Manifest: containers === null ? null : { containers, colonists: 6 - containers * 2, resolved: true } };
    return act5CouncilV188(save, language).options.find(option => option.id === 'cede').notes;
  };
  assert.match(noteFor(1, 'fr')[0], /^Un seul conteneur à rendre : insuffisant pour une restitution/);
  assert.match(noteFor(1, 'en')[0], /^Only one container to hand back: not enough for a restitution/);
  assert.match(noteFor(0, 'fr')[0], /^Sans conteneur à rendre/); assert.match(noteFor(null, 'fr')[0], /^Sans conteneur à rendre/);
  for (const containers of [2, 3]) { assert.match(noteFor(containers, 'fr')[0], /avec 2 conteneurs ou plus à bord/); assert.equal(noteFor(containers, 'fr').length, 2); }
});

// —— A1 · weapons 194–196 purchasable behind a provisional drawn plaque ——
test('A1 arsenal: 194–196 are purchasable at the armory price rule behind a provisional Canvas plaque; no other weapon is opened', () => {
  assert.deepEqual([...PROVISIONAL_PLAQUE_WEAPON_IDS_V188], ['weapon-194-hicks-ithaca-37-shotgun', 'weapon-195-sevastopol-pump-shotgun', 'weapon-196-sevastopol-flamethrower']);
  const without = WEAPONS.filter(weapon => !resolveWeaponVisualProfileV63(weapon));
  for (const id of PROVISIONAL_PLAQUE_WEAPON_IDS_V188) {
    const weapon = WEAPONS.find(entry => entry.id === id);
    assert.ok(weapon, id); assert.equal(resolveWeaponVisualProfileV63(weapon), null, 'still no native plaque: ' + id);
    assert.equal(hasProvisionalPlaqueV188(weapon), true); assert.equal(provisionalPlaqueSlotV188(weapon), 'armory-plaque-provisional-' + id);
    assert.match(weapon.description, /Plaque d’armurerie provisoire \(dessin\) : disponible à l’armurerie\.$/);
    assert.ok(EN_CATALOG_V185[weapon.description]?.endsWith('Provisional armory plate (drawing): available at the armory.'), 'EN description: ' + id);
    assert.equal(weapon.canonExact, false, 'a drawn plaque certifies nothing');
    // Armory rule: the ordinary quote, then a real purchase on a default save.
    const save = createDefaultSave(); save.galaxy.resources.credits = 100000;
    const quote = getProcurementQuote(save, 'weapon', weapon);
    assert.ok(Number.isInteger(quote.credits) && quote.credits > 0 && quote.credits % 10 === 0, 'armory price rule');
    const credits = save.galaxy.resources.credits;
    assert.equal(procureCatalogItem(save, 'weapon', weapon).ok, true);
    assert.ok(save.strategy.inventory.weaponIds.includes(id)); assert.equal(save.galaxy.resources.credits, credits - quote.credits);
    assert.ok(migrateSave(JSON.parse(JSON.stringify(save))).strategy.inventory.weaponIds.includes(id), 'the purchase survives a reload');
  }
  // Every other weapon without a native plaque keeps the historical rule.
  for (const weapon of without.filter(entry => !PROVISIONAL_PLAQUE_WEAPON_IDS_V188.includes(entry.id))) assert.equal(hasProvisionalPlaqueV188(weapon), false, weapon.id);
  assert.equal(hasProvisionalPlaqueV188('weapon-001-m41a-pulse-rifle'), false); assert.equal(provisionalPlaqueSlotV188('weapon-001-m41a-pulse-rifle'), null);
  assert.match(app, /!resolveWeaponVisualProfileV63\(item\) && !hasProvisionalPlaqueV188\(item\)/, 'the armory gate names the exception');
  assert.match(app, /PLAQUETTE DÉDIÉE REQUISE/, 'the rule still exists for the others');
  // The plaque is a drawing: Canvas calls only, a text label, never an image.
  const calls = [];
  const ctx = new Proxy({}, { get: (target, key) => key in target ? target[key] : (...args) => { calls.push([key, ...args]); return { width: 60 }; }, set: (target, key, value) => { target[key] = value; return true; } });
  assert.equal(drawProvisionalPlaqueV188(ctx, 'weapon-196-sevastopol-flamethrower', 260, 132, { language: 'en', name: 'Sevastopol Flamethrower' }), true);
  assert.ok(calls.some(([name, text]) => name === 'fillText' && text === 'PROVISIONAL PLAQUE')); assert.ok(calls.some(([name, text]) => name === 'fillText' && text === 'SEVASTOPOL FLAMETHROWER'));
  assert.equal(calls.some(([name]) => name === 'drawImage'), false, 'no image');
  assert.equal(drawProvisionalPlaqueV188(ctx, 'weapon-001-m41a-pulse-rifle', 260, 132), false);
  const made = [], document = { createElement: tag => { const element = { tag, dataset: {}, style: {}, attributes: {}, setAttribute(name, value) { this.attributes[name] = value; }, getContext: () => ctx }; made.push(element); return element; } };
  const target = { children: [], append(child) { this.children.push(child); } };
  const canvas = mountProvisionalPlaqueV188(document, target, { id: 'weapon-194-hicks-ithaca-37-shotgun', name: 'Hicks Ithaca 37 Shotgun', catalog: 'weapons' }, { language: 'fr' });
  assert.equal(canvas.tag, 'canvas'); assert.equal(target.children[0], canvas);
  assert.equal(canvas.dataset.slotV188, 'armory-plaque-provisional-weapon-194-hicks-ithaca-37-shotgun');
  assert.match(canvas.attributes['aria-label'], /plaque provisoire\. Dessin d’attente/);
  assert.equal(mountProvisionalPlaqueV188(document, target, { id: 'weapon-001-m41a-pulse-rifle' }), null);
  assert.match(read('src/catalog-ui-v62.js'), /mountProvisionalPlaqueV188\(this\.document, target, record/);
});

// —— A5 · pump shotguns: automatic by default, manual pump as an option ——
function shotgun(manual) {
  const fixture = missionV136({ weapon: WEAPONS.find(weapon => weapon.id === 'weapon-194-hicks-ithaca-37-shotgun') });
  fixture.engine.player.ammoReserve = Math.max(fixture.engine.player.ammoReserve, 20); // declared injection
  if (manual !== undefined) fixture.engine.pumpInputV188 = { manual: () => manual, language: () => 'fr', keyLabel: () => 'B' };
  return fixture;
}
test('A5 pump: automatic by default (0.4 s); with the option the stroke waits for the dedicated action, same minimum cycle', () => {
  // Default: no host setting, the pump is automatic.
  const auto = shotgun();
  try {
    assert.equal(auto.engine.fire(auto.engine.player), true); assert.equal(auto.engine.pumpDueV188(), false);
    assert.equal(auto.engine.requestPumpV188(), false, 'the pump action does nothing in automatic mode');
    run(auto.engine, 30);
    assert.equal(auto.engine.getArsenalStateV188().needsCycle, false); assert.equal(auto.engine.getArsenalStateV188().stats.pumps, 1);
  } finally { auto.engine.stop?.(); }
  // Option on: the weapon waits; the prompt is drawn; a press pumps.
  const manual = shotgun(true);
  try {
    const { engine } = manual, actor = engine.player;
    assert.equal(engine.fire(actor), true);
    run(engine, 90);
    assert.equal(engine.getArsenalStateV188().needsCycle, true, 'no automatic stroke'); assert.equal(engine.getArsenalStateV188().stats.pumps, 0);
    assert.equal(engine.pumpDueV188(), true);
    actor.fireClock = 0; assert.equal(engine.fire(actor), false, 'no shot before the stroke');
    const drawn = [], promptCtx = new Proxy({ measureText: text => ({ width: String(text).length * 8 }), fillText: text => drawn.push(String(text)) },
      { get: (target, key) => target[key] ?? (() => {}), set: (target, key, value) => (target[key] = value, true) });
    engine.drawPumpPromptV188(promptCtx);
    assert.deepEqual(drawn, ['POMPER [B]'], 'a text prompt names the action and its key');
    assert.equal(engine.requestPumpV188(), true);
    assert.equal(engine.getArsenalStateV188().needsCycle, false); assert.equal(engine.getArsenalStateV188().stats.pumps, 1);
    assert.equal(engine.requestPumpV188(), false, 'nothing owed, nothing pumped');
    // A press made right after the shot is kept until the 0.4 s cycle has elapsed (no faster than automatic).
    actor.fireClock = 0; assert.equal(engine.fire(actor), true);
    assert.equal(engine.requestPumpV188(), true); assert.equal(engine.getArsenalStateV188().needsCycle, true, 'cycle time not elapsed yet');
    run(engine, 12); assert.equal(engine.getArsenalStateV188().needsCycle, true, '0.2 s: still cycling');
    run(engine, 18); assert.equal(engine.getArsenalStateV188().needsCycle, false, 'the kept press pumps at 0.4 s'); assert.equal(engine.getArsenalStateV188().stats.pumps, 2);
    // The dedicated key reaches the same action.
    actor.fireClock = 0; assert.equal(engine.fire(actor), true); run(engine, 30);
    assert.equal(engine.getArsenalStateV188().needsCycle, true);
    const event = new Event('keydown'); Object.defineProperty(event, 'code', { value: PUMP_ACTION_CODE_V188 }); 
    globalThis.dispatchEvent(event);
    assert.equal(engine.getArsenalStateV188().needsCycle, false, 'KeyB pumps'); assert.equal(engine.getArsenalStateV188().stats.pumps, 3);
    // A reload still racks the action by itself.
    actor.fireClock = 0; assert.equal(engine.fire(actor), true); run(engine, 30); assert.equal(engine.getArsenalStateV188().needsCycle, true);
    assert.equal(engine.reload(actor), true); run(engine, 400);
    assert.equal(engine.getArsenalStateV188().needsCycle, false); assert.equal(actor.ammo, 4);
  } finally { manual.engine.stop?.(); }
});

test('A5 pump: the option is persisted additively, the key is rebindable and the touch button follows the option', () => {
  assert.equal(createDefaultSave().settings.pumpManualV188, false, 'automatic by default');
  assert.equal(migrateSave({ schema: 52 }).settings.pumpManualV188, false, 'older saves stay automatic');
  assert.equal(migrateSave({ schema: 52, settings: { pumpManualV188: true } }).settings.pumpManualV188, true);
  assert.equal(migrateSave({ schema: 52, settings: { pumpManualV188: 'yes' } }).settings.pumpManualV188, false, 'only a real boolean turns it on');
  const action = KEY_ACTIONS_V188.find(entry => entry.id === 'pump');
  assert.deepEqual({ ...action }, { id: 'pump', code: PUMP_ACTION_CODE_V188, fr: 'Pomper (pompe manuelle)', en: 'Pump (manual pump)' });
  assert.equal(defaultKeyBindingsV188().pump, 'KeyB');
  assert.equal(normalizeKeyBindingsV188({ pump: 'KeyN' }).pump, 'KeyN', 'rebindable');
  // A save written before the option: the 14 older bindings are kept, the new action takes its default.
  const older = Object.fromEntries(KEY_ACTIONS_V188.filter(entry => entry.id !== 'pump').map(entry => [entry.id, entry.code]));
  assert.deepEqual(normalizeKeyBindingsV188(older), defaultKeyBindingsV188());
  assert.equal(normalizeKeyBindingsV188({ ...older, fire: 'KeyB' }).pump, null, 'an older binding on B keeps B; the pump is unbound until the player picks a key');
  const html = read('index.html');
  assert.match(html, /<input id="setting-pump-manual-v188" type="checkbox"> Fusils à pompe : pompe manuelle \(touche dédiée\)<\/label>/);
  assert.match(html, /<button id="mission-pump-v188" aria-label="Pomper le fusil à pompe" hidden>POMPE<\/button>/);
  for (const fr of ['Fusils à pompe : pompe manuelle (touche dédiée)', 'POMPE', 'Pomper le fusil à pompe']) assert.ok(EN_CATALOG_V185[fr], 'EN: ' + fr);
  assert.match(app, /'setting-pump-manual-v188': \['pumpManualV188', \(element\) => element\.checked\]/);
  assert.match(app, /button\.hidden = saveSystem\.data\?\.settings\?\.pumpManualV188 !== true/);
  assert.match(app, /byId\('mission-pump-v188'\)\.onclick = \(\) => engine\.requestPumpV188\?\.\(engine\.player\)/);
});

// —— Small recorded defects (R3–R6) ——
test('R3–R6: one objective text matching the room, hidden console group, profile conflict shown, distinct verdict labels', () => {
  // R3: the two P-2 objective panels read the same text, without the two ladders that do not exist.
  const opening = getPlayerOpeningObjectiveV88({ schema: 88, phase: 'qualification', freight: null }, { phase: 'complete' })
    || { text: read('src/player-opening-v88.js').match(/qualification: '([^']+)'/)[1] };
  const openingText = read('src/player-opening-v88.js').match(/qualification: '([^']+)'/)[1];
  const exercise = getOpeningExerciseObjectiveV89({ schema: 89, phase: 'pending', sessionId: null }, { phase: 'qualification' }, { phase: 'complete' });
  assert.ok(opening); assert.equal(exercise.text, openingText, 'both panels carry one text');
  assert.doesNotMatch(openingText, /deux échelles|sas supérieur/); assert.match(openingText, /porte du Proving Ground, au niveau du sol/);
  const i18n = read('src/i18n-v185.js');
  assert.equal(i18n.split(openingText).length - 1, 2, 'opening.qualification and exercise.arm share the French text');
  assert.doesNotMatch(i18n, /two ladders|deux échelles/);
  assert.match(EN_CATALOG_V185[openingText], /Proving Ground door, at floor level/);
  // R4: the console command group honours `hidden` and keeps no stale button.
  assert.match(read('styles.css'), /#hub-training-controls-v132\[hidden\] \{ display: none !important; \}/);
  assert.match(app, /if \(!model\?\.context\) \{ if \(root\.innerHTML\) root\.innerHTML = ''; return; \}/);
  // R5: a profile conflict raised by the hub persistence is shown as a message.
  assert.match(app, /if \(error\?\.code !== 'SAVE_CONFLICT'\) throw error;/);
  assert.match(app, /hubSaveConflictAtV188 = now; toast\(error\.message\);/);
  assert.ok(EN_CATALOG_V185['Ce profil a changé dans une autre session. Exportez cette session ou chargez le profil actuel avant de continuer.']);
  // R6: each available verdict button names its own conclusion.
  assert.match(read('src/narrative-archives-ui-v68.js'), /decision\.available \? `CONFIRMER · \$\{decision\.label\}`/);
  assert.equal(EN_PATTERNS_V185['CONFIRMER · {0}'], 'CONFIRM · {0}');
});
