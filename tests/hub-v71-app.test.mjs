import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

import { getSpecialOperationV67 } from '../src/special-operations-v67.js';

const APP_URL = new URL('../src/app.js', import.meta.url);
const source = await readFile(APP_URL, 'utf8');

function between(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(start, -1, `marqueur absent: ${startMarker}`);
  assert.notEqual(end, -1, `marqueur absent: ${endMarker}`);
  assert.ok(end > start, `ordre de marqueurs invalide: ${startMarker} -> ${endMarker}`);
  return source.slice(start, end);
}

test('app instancie exclusivement le HubGame composite V81', () => {
  assert.match(source, /import\s*\{\s*HubGame,\s*HUB_DECKS,\s*HUB_NPC_ROSTER\s*\}\s*from\s*'\.\/hub-v81-runtime\.js';/);
  assert.match(source, /const hubEngine = new HubGame\(byId\('hub-canvas'\),\s*\{[\s\S]*?onAction:\s*handleHubAction,[\s\S]*?onPersist:\s*persistHub,[\s\S]*?onStatus:\s*renderHubStatus/);
  assert.doesNotMatch(source, /from\s*'\.\/hub-v(?:51|58|60|61|62)-runtime\.js';/);
});

test('le registre partiel ouvre le hub physique sans fabriquer une campagne', () => {
  const operation = getSpecialOperationV67('tantalus-hub-expansion');
  assert.ok(operation);
  assert.equal(operation.implementationStatus, 'partial');
  assert.equal(operation.playable, true);
  assert.equal(operation.accessSurface, 'hub');
  assert.equal(operation.campaignId, undefined);

  const render = between('function renderSpecialOperationsV67(', '\nfunction neuroName(');
  assert.match(render, /const operations = SPECIAL_OPERATIONS_V67/);
  assert.match(render, /const hubSurface = operation\.accessSurface === 'hub';/);
  assert.match(render, /const canPlan = operation\.playable && \(hubSurface \|\| worldUnlocked\)/);
  assert.match(render, /hubSurface \? 'data-open-hub'/);
  assert.match(render, /USS TANTALUS · HUB PHYSIQUE/);

  const delegated = between('function bindDelegatedActions()', '\nfunction bind()');
  assert.match(delegated, /target\.dataset\.openHub !== undefined\) showView\('hub'\)/);
});

test('les événements de sas et de station sont consommés avant toute navigation de menu', () => {
  const handler = between('function handleHubAction(', '\nfunction retreatMission(');
  const transitionStart = handler.indexOf("if (interaction.type === 'hub:annex-transition')");
  const stationStart = handler.indexOf("if (interaction.type === 'hub:annex-station')");
  const ventStart = handler.indexOf("if (interaction.action.startsWith('hub:vent-'))");
  const navigationStart = handler.indexOf("if (interaction.action.startsWith('navigate:'))");
  assert.ok(transitionStart >= 0);
  assert.ok(stationStart > transitionStart);
  assert.ok(ventStart > stationStart);
  assert.ok(navigationStart > ventStart);

  const transitionBranch = handler.slice(transitionStart, stationStart);
  const stationBranch = handler.slice(stationStart, ventStart);
  assert.match(transitionBranch, /return;/);
  assert.match(stationBranch, /return resolveAnnexStationV71\(interaction\);/);
  for (const branch of [transitionBranch, stationBranch]) assert.doesNotMatch(branch, /showView\(|openHubStation\(|openHubDialogue\(/);
  assert.match(transitionBranch, /SAS STABILISÉ|SAS EN MOUVEMENT/);
});

test('les boutons modules ne font plus de mutation directe et produisent un ordre persistant minimal', () => {
  const queue = between('function queuePhysicalModuleActionV71(', '\nfunction cancelPhysicalModuleActionV71(');
  assert.match(queue, /saveSystem\.data\.hub\.pendingModuleActionV71\s*=\s*\{\s*schema:\s*71,\s*type,\s*moduleId:\s*module\.id,\s*queuedAt:\s*Date\.now\(\)\s*\}/);
  assert.match(queue, /assertOperationMutable\(\)/);
  assert.match(queue, /if \(saveSystem\.data\.hub\.pendingModuleActionV71\)/);
  assert.match(queue, /Un ordre logistique est déjà en attente/);
  assert.match(queue, /getModuleQuote\(module\)/);
  assert.doesNotMatch(queue, /installShipModule\(|repairShipModule\(/);

  const cancel = between('function cancelPhysicalModuleActionV71(', '\nfunction returnToForgeContext(');
  assert.match(cancel, /pending\.moduleId !== moduleId/);
  assert.match(cancel, /pendingModuleActionV71 = null/);

  const render = between('function renderModules()', '\nfunction worldPosition(');
  assert.match(render, /const hasPending = Boolean\(pending\)/);
  assert.match(render, /data-module-cancel="\$\{module\.id\}"/);
  assert.match(render, /ANNULER ORDRE/);
  assert.match(render, /available && !hasPending/);

  const delegated = between('function bindDelegatedActions()', '\nfunction bind()');
  assert.match(delegated, /target\.dataset\.moduleInstall[\s\S]*queuePhysicalModuleActionV71\('install',\s*target\.dataset\.moduleInstall\)/);
  assert.match(delegated, /target\.dataset\.moduleRepair[\s\S]*queuePhysicalModuleActionV71\('repair',\s*target\.dataset\.moduleRepair\)/);
  assert.match(delegated, /target\.dataset\.moduleCancel[\s\S]*cancelPhysicalModuleActionV71\(target\.dataset\.moduleCancel\)/);
  assert.doesNotMatch(delegated, /installShipModule\(|repairShipModule\(/);
  assert.doesNotMatch(delegated, /runTimedMutation\(\(\) => (?:install|repair)ShipModule/);
});

test('installation et réparation ne s’exécutent qu’après confirmation physique de la station logistique', () => {
  const resolver = between('function resolveAnnexStationV71(', '\nfunction handleHubAction(');
  assert.match(resolver, /if \(!annexId \|\| !interaction\.effect\)/);
  assert.match(resolver, /if \(annexId === 'logistics' && pending\)/);
  assert.match(resolver, /pending\.type === 'install'[\s\S]*installShipModule\(working, pending\.moduleId\)[\s\S]*repairShipModule\(working, pending\.moduleId\)/);
  assert.match(resolver, /working\.hub\.pendingModuleActionV71 = null/);
  assert.match(resolver, /runAnnexStationTransactionV71\(annexId/);
  assert.match(resolver, /return exposeAnnexStationResultV71\(result\)/);
  assert.match(resolver, /depuis la station logistique/);

  const transaction = between('function runAnnexStationTransactionV71(', '\nfunction exposeAnnexStationResultV71(');
  assert.match(transaction, /const working = clone\(saveSystem\.data\)/);
  assert.match(transaction, /assertAnnexServiceAvailableV71\(working, annexId\)/);
  assert.match(transaction, /completeAnnexServiceV71\(working, ticket\)/);
  assert.match(transaction, /applyHubAnnexBusinessV71\(working, annexId\)/);
  assert.match(transaction, /saveSystem\.data = working/);
  assert.ok(
    transaction.indexOf('completeAnnexServiceV71(working, ticket)')
      < transaction.indexOf('applyHubAnnexBusinessV71(working, annexId)')
  );

  const directInstallCalls = [...source.matchAll(/\binstallShipModule\(/g)].length;
  const directRepairCalls = [...source.matchAll(/\brepairShipModule\(/g)].length;
  assert.equal(directInstallCalls, 1, 'une seule exécution install, dans la station logistique');
  assert.equal(directRepairCalls, 1, 'une seule exécution repair, dans la station logistique');
});
