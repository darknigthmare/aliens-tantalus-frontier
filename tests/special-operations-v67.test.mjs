import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS as CORE_CAMPAIGNS } from '../src/content-core-v50.js';
import { CAMPAIGNS } from '../src/content.js';
import {
  SPECIAL_OPERATIONS_V67,
  SPECIAL_OPERATION_COUNTS_V67,
  buildCampaignsWithSpecialOperationsV67,
  getSpecialOperationByCampaignIdV67,
  getSpecialOperationByChatIdV67,
  getSpecialOperationV67,
  validateSpecialOperationsV67
} from '../src/special-operations-v67.js';

const CHAT_IDS = Object.freeze([
  '6a99e9b5-a7fc-83eb-96bc-b53baa1b9cbe',
  '6a99eb43-9ebc-83eb-868c-1c56f918e531',
  '6a99eaec-f4a4-83ed-a3ea-88db3c94413a',
  '6a99e94f-ef7c-83ed-a229-7d42b85b6222',
  '6a99e7de-0d14-83eb-9074-0cc76c50989b',
  '6a99b3d2-0e58-83eb-abba-d955b5d73b2d',
  '6a99b4e6-45f4-83eb-bdae-5b3ad2e57833',
  '6a9981b6-ec38-83eb-bcaf-eea1783e448f',
  '6a999dca-3efc-83eb-907a-623f11cf2388',
  '6a999847-94b4-83ed-af17-c3b6b57da810',
  '6a99988b-90c4-83ed-a4f6-0462baed528f',
  '6a98fa78-6db8-83eb-bc72-cf41bc6833b1',
  '6a98c871-61ac-83ed-be5c-600c473690e2',
  '6a98dfeb-7284-83eb-a015-bf964b8b1229',
  '6a98e050-1748-83eb-8c5b-a7dd4bc1ac26',
  '6a98d47d-68f4-83eb-9ed3-4063af4e7496',
  '6a98e0e1-2b98-83eb-9cd4-e9772768b977',
  '6a98d3ea-99ac-83ed-b765-6932483ddbe1',
  '6a98dfcb-a2e4-83ed-b3c2-606a9384c6e4'
]);

test('le registre V69 couvre exactement les 19 conversations avec le bilan 1/9/9 et trois lots jouables', () => {
  assert.equal(SPECIAL_OPERATIONS_V67.length, 19);
  assert.deepEqual(SPECIAL_OPERATION_COUNTS_V67, {
    total: 19,
    effective: 1,
    partial: 9,
    missing: 9,
    playable: 3
  });
  assert.deepEqual(validateSpecialOperationsV67(), {
    ok: true,
    failures: [],
    counts: SPECIAL_OPERATION_COUNTS_V67
  });
  assert.deepEqual(
    [...SPECIAL_OPERATIONS_V67].sort((a, b) => a.productionOrder - b.productionOrder).map((operation) => operation.productionOrder),
    Array.from({ length: 19 }, (_, index) => index + 1)
  );
});

test('les identifiants internes et ChatGPT sont exacts, uniques et adressables', () => {
  const operationIds = SPECIAL_OPERATIONS_V67.map((operation) => operation.id);
  const chatIds = SPECIAL_OPERATIONS_V67.map((operation) => operation.chatId);
  assert.equal(new Set(operationIds).size, 19);
  assert.equal(new Set(chatIds).size, 19);
  assert.deepEqual([...chatIds].sort(), [...CHAT_IDS].sort());
  for (const operation of SPECIAL_OPERATIONS_V67) {
    assert.equal(getSpecialOperationV67(operation.id), operation);
    assert.equal(getSpecialOperationByChatIdV67(operation.chatId), operation);
    assert.equal(operation.sourceProjectId, 'g-p-6a945bfa0d3c8191befd9a84068b90a4');
    assert.equal(operation.canonExact, false);
    assert.ok(operation.chatTitle && operation.promisedTitle && operation.promiseSummary);
    assert.ok(operation.requiredMechanics.length > 0);
  }
  assert.equal(getSpecialOperationV67('inconnu'), null);
  assert.equal(getSpecialOperationByChatIdV67('inconnu'), null);
});

test('Cargo Brutal, QZ-17 et Alpha/Bravo ajoutent trois campagnes jouables sans collision historique', () => {
  const historicalIds = new Set(CORE_CAMPAIGNS.map((campaign) => campaign.id));
  assert.equal(CORE_CAMPAIGNS.length, 436);
  assert.equal(historicalIds.has('special-cargo-brutal'), false);

  const expanded = buildCampaignsWithSpecialOperationsV67(CORE_CAMPAIGNS);
  assert.equal(expanded.length, CORE_CAMPAIGNS.length + 3);
  assert.equal(new Set(expanded.map((campaign) => campaign.id)).size, expanded.length);

  const cargo = expanded.find((campaign) => campaign.id === 'special-cargo-brutal');
  assert.ok(cargo);
  assert.equal(cargo.specialOperationId, 'cargo-brutal');
  assert.equal(cargo.objective, 'secure the power loader');
  assert.equal(cargo.mode, 'FRONTIER');
  assert.equal(cargo.pairId, null);
  assert.equal(getSpecialOperationByCampaignIdV67(cargo.id)?.id, 'cargo-brutal');

  const qz17 = expanded.find((campaign) => campaign.id === 'special-narrative-qz17');
  assert.ok(qz17);
  assert.equal(qz17.specialOperationId, 'narrative-collectables');
  assert.equal(qz17.objective, 'investigate the ghost cargo');
  assert.equal(qz17.mode, 'FRONTIER');
  assert.equal(qz17.pairId, null);
  assert.equal(getSpecialOperationByCampaignIdV67(qz17.id)?.id, 'narrative-collectables');

  const alphaBravo = expanded.find((campaign) => campaign.id === 'special-alpha-bravo-doctrine');
  assert.ok(alphaBravo);
  assert.equal(alphaBravo.specialOperationId, 'alpha-bravo-coop');
  assert.equal(alphaBravo.worldId, 'world-05-lethe');
  assert.equal(alphaBravo.objective, 'defend the colony');
  assert.equal(alphaBravo.templateId, 'colony-multiroute');
  assert.equal(alphaBravo.minimumCrew, 4);
  assert.equal(alphaBravo.routes, 5);
  assert.equal(getSpecialOperationByCampaignIdV67(alphaBravo.id)?.id, 'alpha-bravo-coop');

  assert.equal(CAMPAIGNS.filter((campaign) => campaign.id === cargo.id).length, 1);
  assert.equal(CAMPAIGNS.filter((campaign) => campaign.id === qz17.id).length, 1);
  assert.equal(CAMPAIGNS.filter((campaign) => campaign.id === alphaBravo.id).length, 1);
  assert.equal(CAMPAIGNS.length, expanded.length);
});
