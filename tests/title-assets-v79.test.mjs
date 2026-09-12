import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  EXPECTED_CATEGORY_CONTRACTS,
  EXPECTED_PLANET_WORLD_IDS,
  EXPECTED_SLOT_TOTAL,
  auditSourceReceipt,
  auditTitleAssets,
  inspectPng,
  validateManifestData,
  validatePixelContract,
  validatePromptRecipes
} from '../scripts/audit-title-assets-v79.mjs';
import { TITLE_SCENE_READY_ASSETS_V79 } from '../src/title-scene-assets-v79.js';

const MANIFEST_PATH = 'docs/references/v79-title-scene-production/asset-manifest.json';
const PROMPTS_PATH = 'docs/references/v79-title-scene-production/openai-prompt-recipes.json';
const EXACT_PROMPTS_PATH = 'docs/references/v79-title-scene-production/exact-generation-prompts.md';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('le contrat V79 conserve exactement 53 slots et 20 worldIds planète réels', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  assert.equal(manifest.slots.length, EXPECTED_SLOT_TOTAL);
  assert.deepEqual(validateManifestData(manifest), []);
  const planets = manifest.slots.filter(({ category }) => category === 'planet');
  assert.equal(planets.length, 20);
  assert.equal(new Set(planets.flatMap(({ worldIds }) => worldIds)).size, 20);
  for (const planet of planets) assert.deepEqual(planet.worldIds, [EXPECTED_PLANET_WORLD_IDS[planet.id]]);
  assert.equal(manifest.rightsPolicy, 'original-ai-generated-no-official-copy');
  assert.equal(manifest.runtimeAcceptance, 'integrated-only');
});

test('les 53 recettes OpenAI sont originales, uniques et liées aux perspectives verrouillées', async () => {
  const [manifest, prompts] = await Promise.all([
    readFile(MANIFEST_PATH, 'utf8').then(JSON.parse),
    readFile(PROMPTS_PATH, 'utf8').then(JSON.parse)
  ]);
  assert.deepEqual(validatePromptRecipes(prompts, manifest), []);
  assert.equal(prompts.recipes.length, EXPECTED_SLOT_TOTAL);
  assert.equal(new Set(prompts.recipes.map(({ promptId }) => promptId)).size, EXPECTED_SLOT_TOTAL);
  assert.match(prompts.basePrompt, /original production-ready/u);
  assert.match(prompts.basePrompt, /no copied franchise key art/iu);
});

test('les prompts exacts sont conservés pour les 18 sources intégrées et les 2 rejets audités', async () => {
  const [manifest, exactPrompts] = await Promise.all([
    readFile(MANIFEST_PATH, 'utf8').then(JSON.parse),
    readFile(EXACT_PROMPTS_PATH, 'utf8')
  ]);
  const receiptIds = [...exactPrompts.matchAll(/### `(?:exec-)?([a-f0-9-]{36})\.png`/gu)].map((match) => `exec-${match[1]}`);
  assert.equal(receiptIds.length, 20);
  assert.equal(new Set(receiptIds).size, 20);
  for (const slot of manifest.slots.filter(({ status }) => status === 'integrated')) {
    assert.ok(receiptIds.includes(slot.provenance.receiptId), slot.id);
    assert.equal(slot.provenance.sourceFile, `${MANIFEST_PATH.replace(/asset-manifest\.json$/u, '')}source-receipts/${slot.provenance.receiptId}.png`, slot.id);
    const sourceBytes = await readFile(slot.provenance.sourceFile);
    assert.equal(sha256(sourceBytes), slot.provenance.sourceSha256, `${slot.id}: hash du reçu source`);
    const headingOffset = exactPrompts.indexOf(slot.provenance.receiptId);
    assert.notEqual(headingOffset, -1, slot.id);
    assert.match(exactPrompts.slice(headingOffset, headingOffset + 2200), /\n\n> (?:Create|Generate)/u, slot.id);
  }
  assert.ok(receiptIds.includes('exec-c58503e4-fff5-4f40-a3b5-5d3fb09ca3bc'));
  assert.ok(receiptIds.includes('exec-3523fb89-881e-4b81-94d7-9612f02365cb'));
});

test('le registre runtime ne publie que les 18 bitmaps intégrés avec hash exact', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const byId = new Map(manifest.slots.map((slot) => [slot.id, slot]));
  assert.equal(TITLE_SCENE_READY_ASSETS_V79.length, 18);
  assert.equal(new Set(TITLE_SCENE_READY_ASSETS_V79.map(({ runtimeId }) => runtimeId)).size, 18);
  for (const asset of TITLE_SCENE_READY_ASSETS_V79) {
    const slot = byId.get(asset.id);
    assert.equal(slot.status, 'integrated', asset.id);
    assert.equal(slot.runtimeId, asset.runtimeId, asset.id);
    assert.equal(slot.sha256, asset.sha256, asset.id);
    assert.deepEqual(slot.worldIds ?? [], [...asset.worldIds], asset.id);
    const bytes = await readFile(asset.src.replace(/^\//u, ''));
    assert.equal(sha256(bytes), asset.sha256, asset.id);
  }
  assert.equal(TITLE_SCENE_READY_ASSETS_V79.some(({ id }) => id === 'orbitals-03-comms-relay'), false);
});

test('audit réel: 18 intégrés, 35 manquants et aucun fichier parasite', async () => {
  const report = await auditTitleAssets();
  assert.equal(report.expected, 53);
  assert.equal(report.statusSummary.integrated, 18);
  assert.equal(report.statusSummary.missing, 35);
  assert.equal(report.statusSummary.candidate, 0);
  assert.equal(report.statusSummary.verified, 0);
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.unexpectedFiles, []);
  const auditedReceipts = report.assetResults.filter(({ status }) => status === 'integrated').map(({ sourceReceipt }) => sourceReceipt);
  assert.equal(auditedReceipts.length, 18);
  assert.ok(auditedReceipts.every((receipt) => receipt?.present && receipt?.verified), 'les 18 reçus source doivent être lus et vérifiés');
  assert.equal(report.complete, false, '18/53 ne doit jamais être présenté comme une production complète');
});

test('le contrôle pixel détecte dimension, alpha, fond blanc et RGB caché', async () => {
  const bytes = await readFile('assets/openai/ui/title/v79/planet/planet-01-acheron.png');
  const stats = inspectPng(bytes);
  assert.deepEqual(validatePixelContract(stats, EXPECTED_CATEGORY_CONTRACTS.planet), []);
  assert.equal(stats.width, 1024);
  assert.equal(stats.height, 1024);
  assert.equal(stats.alphaMin, 0);
  assert.equal(stats.alphaMax, 255);
  assert.equal(stats.opaqueNearWhiteBorderRatio, 0);
  assert.equal(stats.hiddenRgbRatio, 0);

  const broken = {
    ...stats,
    width: 1000,
    alphaMin: 255,
    transparentRatio: 0,
    visibleRatio: 1,
    nearWhiteOpaqueRatio: 1,
    opaqueNearWhiteBorderRatio: 1,
    opaqueBorderRatio: 1,
    hiddenRgbRatio: 0.1
  };
  const codes = validatePixelContract(broken, EXPECTED_CATEGORY_CONTRACTS.planet).map(({ code }) => code);
  for (const code of ['dimension-mismatch', 'alpha-required', 'transparent-area', 'visible-area', 'white-matte', 'hidden-rgb']) {
    assert.ok(codes.includes(code), code);
  }
});

test('un slot ne peut pas devenir intégré sans validation humaine ni hash de reçu source exact', async () => {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const clone = structuredClone(manifest);
  clone.slots.find(({ id }) => id === 'planet-01-acheron').review.perspective = false;
  assert.ok(validateManifestData(clone).some(({ code }) => code === 'review-incomplete:perspective'));

  const altered = structuredClone(manifest.slots.find(({ id }) => id === 'planet-01-acheron'));
  altered.provenance.sourceSha256 = '0'.repeat(64);
  const sourceReceipt = await auditSourceReceipt(process.cwd(), altered);
  assert.equal(sourceReceipt.verified, false);
  assert.ok(sourceReceipt.findings.some(({ code }) => code === 'source-receipt-hash-mismatch'));
});
