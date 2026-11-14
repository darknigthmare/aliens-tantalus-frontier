// Regression tests, bug hunt "textes joueur" P2 (2026-11-14).
// Covers: level content named in the mission log, cargo obstacle names, English
// HUD / door plates / ship option, accented economy messages, numbers by
// language, objective and insertion labels, ids hidden from catalog cards and
// the command log. Each test fails on 9f1bc6f.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { autoTranslateV185, useCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185, currentLanguageV185 } from '../src/i18n-v185.js';
import * as labels from '../src/mission-log-labels-v188.js';
import * as cargo from '../src/cargo-brutal-runtime-v67.js';
import { MISSION_LEVEL_TEMPLATES_V52 } from '../src/mission-levels-v52.js';
import { NARRATIVE_COLLECTABLES_V68 } from '../src/narrative-collectables-v68.js';
import { QZ17_ROUTE_CONSEQUENCES_V68 } from '../src/narrative-collectables-runtime-v68.js';
import { MISSION_INSERTION_PHASE_LABELS_V62 } from '../src/mission-insertion-ui-v62.js';
import * as saveModule from '../src/save.js';
import { formatCatalogValueV62 } from '../src/catalog-ui-v62.js';
import { WEAPONS } from '../src/content.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const ID = /\b[a-z0-9]+(?:[-_][a-z0-9]+)+\b|\b[A-Z0-9]+(?:-[A-Z0-9]+){2,}\b/u;
const FRENCH = /[éèàçêûôîœ]|\b(du|des|la|le|les|et|une|pour|avec|sans|aucun|dans|vers|déjà|deja|termine|PV|SECTEUR|PORTAIL|Classe)\b/iu;
const level = (lang, fn) => {
  const previous = currentLanguageV185();
  useCatalogV185({ EN_CATALOG_V185, EN_PATTERNS_V185 });
  setLanguageV185(lang, { document: null, storage: null, persist: false });
  try { return fn(); } finally { setLanguageV185(previous, { document: null, storage: null, persist: false }); }
};
const en = text => level('en', () => autoTranslateV185(text));
const content = { collectables: NARRATIVE_COLLECTABLES_V68, routes: QZ17_ROUTE_CONSEQUENCES_V68 };
const allLevelEvents = () => {
  const events = [];
  for (const template of Object.values(MISSION_LEVEL_TEMPLATES_V52)) {
    events.push({ type: 'mission-level-ready', templateId: template.id, routes: 3, zones: 6, events: 3 });
    for (const event of template.events) events.push({ type: 'mission-level-event', eventId: event.id });
  }
  for (const record of NARRATIVE_COLLECTABLES_V68.filter(entry => entry.title)) events.push({ type: 'narrative-collectable-discovered', collectableId: record.id });
  for (const route of Object.values(QZ17_ROUTE_CONSEQUENCES_V68)) events.push({ type: 'narrative-route-unlocked', flag: route.flag, accessKind: route.accessKind });
  events.push({ type: 'mission-timer-started', timerId: 'extraction', duration: 14 }, { type: 'mission-timer-complete', timerId: 'extraction' });
  // Unknown ids from future content fall back to generic words.
  events.push({ type: 'mission-level-event', eventId: 'future-event-x' }, { type: 'narrative-collectable-discovered', collectableId: 'future-archive' },
    { type: 'narrative-route-unlocked', flag: 'future-flag' }, { type: 'mission-level-ready', templateId: 'future-template', routes: 1, zones: 1, events: 0 });
  return events;
};

test('mission log: level, field event, archive, route and holdout lines name the content in FR and EN, never an id', () => {
  assert.equal(typeof labels.missionLevelLogLineV188, 'function');
  for (const event of allLevelEvents()) {
    const fr = labels.missionLevelLogLineV188(event, content);
    assert.ok(fr, event.type);
    assert.doesNotMatch(fr, ID, `${event.type}: no raw id in "${fr}"`);
    for (const raw of [event.templateId, event.eventId, event.collectableId, event.flag].filter(Boolean)) assert.ok(!fr.includes(raw.toUpperCase()), fr);
    const english = en(fr);
    if (event.type !== 'mission-timer-started') assert.notEqual(english, fr, `EN for ${fr}`); // HOLDOUT · EXTRACTION · 14 S is already English.
    assert.doesNotMatch(english, /[éèàçêû]|ÉVÉNEMENT|RÉCUPÉRÉE|DÉBLOQUÉE|preuve|porte physique|conduit physique/u, `French left in "${english}"`);
  }
  assert.equal(labels.missionLevelLogLineV188({ type: 'mission-level-ready', templateId: 'ship-interior-vertical', templateLabel: 'Intérieur de vaisseau vertical', routes: 3, zones: 6, events: 3 }),
    'NIVEAU INTÉRIEUR DE VAISSEAU VERTICAL · 3 routes · 6 zones · 3 événements');
  assert.match(labels.missionLevelLogLineV188({ type: 'narrative-collectable-discovered', collectableId: 'qz17-pda-loading-chief' }, content), /PDA DE QUAI/u);
  const app = read('src/app.js');
  assert.match(app, /missionLevelLogLineV188\(event,/);
  assert.doesNotMatch(app, /String\(event\.(eventId|collectableId|flag|timerId|templateId)[^)]*\)\.toUpperCase\(\)/u);
  assert.match(read('src/game-v52-level-runtime.js'), /templateLabel: plan\.templateLabel/);
});

test('mission log: objective actions and insertion phases are named, not printed as ids', () => {
  const actions = [...new Set([...read('src/game-complete-core.js').matchAll(/action: '([a-z-]+)'|markObjectiveAction\('([a-z-]+)'/g), ...read('src/cargo-brutal-runtime-v67.js').matchAll(/emitCargoObjectiveV67\('([a-z-]+)'/g)]
    .map(match => match[1] || match[2]).filter(Boolean))];
  assert.ok(actions.length >= 15);
  for (const action of [...actions, 'unknown-action']) {
    const fr = `OBJECTIF · ${labels.objectiveActionLabelV188(action).toUpperCase()}`;
    assert.doesNotMatch(fr, ID, fr);
    assert.doesNotMatch(en(fr), /OBJECTIF|[éèàç]/u, en(fr));
  }
  for (const phase of Object.keys(MISSION_INSERTION_PHASE_LABELS_V62)) assert.doesNotMatch(labels.insertionPhaseLabelV188(phase, MISSION_INSERTION_PHASE_LABELS_V62), ID);
  assert.equal(labels.insertionPhaseLabelV188('player-control', MISSION_INSERTION_PHASE_LABELS_V62), 'PRISE DE CONTRÔLE');
  const app = read('src/app.js');
  assert.match(app, /OBJECTIF · \$\{objectiveActionLabelV188\(event\.action\)/);
  assert.match(app, /INSERTION · \$\{insertionPhaseLabelV188\(phase/);
  assert.equal(en('SOUS-TITRE · MOUVEMENT DERRIÈRE LA PORTE'), 'CAPTION · MOVEMENT BEHIND THE DOOR');
});

test('cargo-brutal: the push prompt names the container in FR and EN', () => {
  assert.equal(typeof cargo.cargoObstacleLabelV188, 'function');
  for (const id of ['cargo-block-alpha', 'cargo-block-bravo', 'cargo-block-charlie', 'unknown']) {
    const prompt = `E / TIR  DÉPLACER ${cargo.cargoObstacleLabelV188(id).toUpperCase()} · 0/3`;
    assert.doesNotMatch(prompt, /CARGO-BLOCK|UNKNOWN/u);
    assert.doesNotMatch(en(prompt), /DÉPLACER|CONTENEUR|[éèà]/u, en(prompt));
  }
  assert.equal(en('E / TIR  DÉPLACER LE CONTENEUR ALPHA · 1/3'), 'E / FIRE  MOVE THE ALPHA CONTAINER · 1/3');
  assert.doesNotMatch(read('src/cargo-brutal-runtime-v67.js'), /DÉPLACER \$\{obstacle\.id/);
});

test('English: door plates, HUD and title ship option are translated', () => {
  for (const template of Object.values(MISSION_LEVEL_TEMPLATES_V52)) {
    const zones = template.zones.map(zone => zone.label);
    for (const role of ['PORTAIL COLONIAL', 'VOLET DE SÉCURITÉ', 'SAS PRESSURISÉ', 'CLOISON ÉTANCHE']) {
      const plate = `${role} · ${zones[0]} ↔ ${zones[1]}`;
      assert.doesNotMatch(en(plate), FRENCH, `${plate} → ${en(plate)}`);
    }
  }
  assert.doesNotMatch(read('src/game-v52-level-runtime.js'), /door\.fromZoneId \|\| ''/);
  assert.equal(en('PV 100  ARM 50  MUN 12/48'), 'HP 100  ARM 50  AMMO 12/48');
  assert.equal(en('SECTEUR 2/6 · TENIR LA BALISE · 9 S'), 'SECTOR 2/6 · HOLD THE BEACON · 9 S');
  assert.equal(en('COOP PV 80 ARM 20'), 'COOP HP 80 ARM 20');
  assert.equal(en('S  COUVERTURE · F  TIR · R  RECHARGER'), 'S  COVER · F  FIRE · R  RELOAD');
  assert.equal(en('Classe Conestoga · Tantalus / Sulaco'), 'Conestoga class · Tantalus / Sulaco');
  assert.match(en('MU/TH/UR · X · LV-426 · COLONIE À ROUTES MULTIPLES · RISQUE 42%'), /RISK 42%$/);
});

test('economy: accented French messages, translated in English, logic unchanged', () => {
  const save = saveModule.createDefaultSave(1);
  save.galaxy.resources.credits = 99999; save.galaxy.resources.research = 9999; save.galaxy.resources.alloy = 9999;
  const project = saveModule.RESEARCH_PROJECTS[0];
  saveModule.completeResearchProject(save, project.id);
  assert.throws(() => saveModule.completeResearchProject(save, project.id), error => error.message === 'Projet déjà terminé.');
  assert.equal(en('Projet déjà terminé.'), 'Project already completed.');
  const weapon = WEAPONS.find(item => !save.strategy.inventory.weaponIds.includes(item.id));
  saveModule.procureCatalogItem(save, 'weapon', weapon);
  assert.throws(() => saveModule.procureCatalogItem(save, 'weapon', weapon), error => error.message === 'Matériel déjà acquis.');
  assert.equal(en('Matériel déjà acquis.'), 'Equipment already acquired.');
  const source = read('src/save.js');
  for (const stale of ['deja termine', 'deja acquis', 'stabilite', 'recompenses transferees', 'Rotation terminee', 'Epave securisee', 'operateur blesse']) assert.ok(!source.includes(stale), stale);
  for (const line of ['Objectif accompli : stabilité +8, infestation -7, récompenses transférées.', 'Échec : stabilité -6, infestation +7 et un opérateur blessé.',
    'Retraite : stabilité -2, infestation +2.', 'Rotation terminée : santé +20, stress -24, fatigue -30.', 'Épave sécurisée : +620 crédits, +22 alliage et +5 carburant.',
    'Escouade incomplète : 2 opérateurs actifs requis.', 'Soutien livré : stabilité +9, infestation -5, quarantaine +8.']) {
    assert.doesNotMatch(en(line), /[éèàÉ]|stabilité|récompenses/u, line);
  }
  for (const id of ['frontier-recon', 'salvage-run', 'research-cycle', 'colony-relief', 'crew-rotation']) {
    const run = saveModule.createDefaultSave(1);
    Object.assign(run.galaxy.resources, { credits: 99999, research: 9999, alloy: 9999, fuel: 999, medical: 99, pathogen: 99 });
    let result;
    try { result = saveModule.executeStrategicAction(run, id).result; } catch { continue; }
    assert.notEqual(en(result), result, `${id}: ${result}`);
  }
});

test('numbers in the dossier tables follow the chosen language', () => {
  assert.equal(level('fr', () => formatCatalogValueV62(7.7)), '7,7');
  assert.equal(level('en', () => formatCatalogValueV62(7.7)), '7.7');
  assert.equal(level('en', () => formatCatalogValueV62(12345)), '12,345');
  assert.match(read('src/app.js'), /const number = \(value\) => new Intl\.NumberFormat\(currentLanguageV185\(\) === 'en' \? 'en-GB' : 'fr-FR'\)/);
});

test('ids stay off player screens: catalog cards and the command log', () => {
  assert.match(read('src/catalog-ui-v62.js'), /if \(this\.developerModeV110\) body\.append\(createElement\(this\.document, 'span', 'catalog-v62__card-id', record\.id\)\)/);
  const app = read('src/app.js');
  assert.match(app, /escapeHtml\(strategyLogTextV188\((?:entry\.title|strategyLogTitleV188\(entry, CAMPAIGNS\))\)\)/);
  assert.match(app, /function strategyLogTextV188\(text\)/);
  assert.ok(!read('src/save.js').includes("vehicleId + ' prepare"));
});
