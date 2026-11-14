import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave } from '../src/save.js';
import { DOSSIER_PIECES_V188, storyDossierV188, finalChoiceOptionsV188, resolveFinalChoiceV188, ENDINGS_V188 } from '../src/story-dossier-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function fullSave() {
  const save = createDefaultSave();
  save.narrativeArchives.discovered['qz17-pda-loading-chief'] = { id: 'qz17-pda-loading-chief' };
  save.narrativeArchives.discovered['qz17-email-logistics-denial'] = { id: 'qz17-email-logistics-denial' };
  save.narrativeArchives.unlockedFlags.push('qz17-maintenance-bypass');
  save.archiveRelayArchivesV122 = { ...save.archiveRelayArchivesV122, case: { id: 'qz18-last-relay', verdict: 'delayed-distress' } };
  save.storyCampaignV188.cinematicsSeen.push('cin-20-rook');
  save.storyCampaignV188.interlude = { phase: 'resolved', crisisId: 'c', outcome: 'captured' };
  save.galaxy.completedCampaignIds.push('special-black-cocoon');
  return save;
}

test('the seven bible pieces, read only from recorded state; two are not playable yet', () => {
  assert.deepEqual(DOSSIER_PIECES_V188.map(piece => piece.id), ['pda-email', 'seal-or-cradle', 'priority-1843', 'bishop-directive', 'depot-cradles', 'cassius-orders', 'wren-testimony']);
  assert.equal(storyDossierV188(createDefaultSave()).count, 0);
  const full = storyDossierV188(fullSave(), 'en');
  assert.equal(full.count, 5); assert.equal(full.total, 7); assert.equal(full.signerEstablished, false, '6 of 7 required (validated 2026-11-05)');
  assert.deepEqual(full.pieces.filter(piece => piece.unavailable).map(piece => piece.id), ['cassius-orders', 'wren-testimony']);
  const partial = fullSave(); partial.storyCampaignV188.cinematicsSeen = [];
  assert.equal(storyDossierV188(partial).pieces.find(piece => piece.id === 'priority-1843').held, false, 'the 18:43 piece needs Rook’s signature');
});

test('final choice: transmit only with Asphodèle retaken; hold and cede always; manifest and capture modifiers', () => {
  const save = fullSave(); save.storyCampaignV188.m577Manifest = { containers: 2, colonists: 2, resolved: true };
  const now = finalChoiceOptionsV188(save);
  assert.deepEqual(now.options.map(option => option.id), ['hold', 'cede']);
  assert.equal(now.options.find(option => option.id === 'cede').restitution, true);
  assert.equal(now.options.find(option => option.id === 'hold').recoveryAttemptAboard, true);
  assert.deepEqual(finalChoiceOptionsV188(save, { asphodeleRetaken: true, relayRoomOpen: true }).options.map(option => option.id), ['transmit', 'hold', 'cede']);
  assert.deepEqual(Object.keys(ENDINGS_V188), ['relay-speaks', 'freight-first', 'living-without-proof']);
});

test('Vega follows Echo-9 from "operationnel" trust, otherwise decides from the dossier', () => {
  const save = fullSave(), vega = save.crew.find(member => member.id === 'crew-01-mara-vega');
  vega.loyalty = 80; assert.deepEqual(resolveFinalChoiceV188(save, 'cede'), { option: 'cede', ending: 'freight-first', decidedBy: 'echo-9', dossierCount: 5 });
  vega.loyalty = 20; assert.equal(resolveFinalChoiceV188(save, 'cede').option, 'hold', '5 pieces, no safe channel: Vega holds [PROPOSÉ]');
  const weak = createDefaultSave(); weak.crew.find(member => member.id === 'crew-01-mara-vega').loyalty = 10;
  assert.equal(resolveFinalChoiceV188(weak, 'hold').ending, 'freight-first', 'fewer than 5 pieces: the company recovers the depot');
  assert.equal(resolveFinalChoiceV188(save, 'transmit', {}).option, 'hold', 'an unavailable option cannot be forced');
});

test('the command view shows the dossier panel', () => {
  assert.match(read('index.html'), /id="story-dossier-v188"/);
  assert.match(read('src/app.js'), /storyDossierV188\(saveSystem\.data, en \? 'en' : 'fr'\)/);
});
