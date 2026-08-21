import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSave } from '../src/save.js';
import {
  selectNeuroProfile,
  clearNeuroProfile,
  selectApexDossier
} from '../src/advanced-systems.js';
import { NEURO_XENO_PROFILES, APEX_DOSSIERS } from '../src/content.js';

test('le domaine refuse les trois mutations Neuro/Apex pendant une opération sans altérer le loadout', () => {
  const save = createDefaultSave(1);
  const profile = NEURO_XENO_PROFILES.find((entry) => entry.playerClassCompatible);
  const dossier = APEX_DOSSIERS[0];
  assert.ok(profile);
  assert.ok(dossier);

  selectNeuroProfile(save, profile.id);
  selectApexDossier(save, dossier.id);
  const before = structuredClone({
    selectedNeuroProfileId: save.strategy.selectedNeuroProfileId,
    selectedApexDossierId: save.strategy.selectedApexDossierId,
    classId: save.player.classId,
    neuroProfileId: save.player.neuroProfileId
  });
  save.strategy.currentOperation = { id: 'operation-lock-proof' };

  assert.throws(() => selectNeuroProfile(save, profile.id), /verrouillé pendant une opération/i);
  assert.throws(() => clearNeuroProfile(save), /verrouillé pendant une opération/i);
  assert.throws(() => selectApexDossier(save, dossier.id), /verrouillé pendant une opération/i);
  assert.deepEqual({
    selectedNeuroProfileId: save.strategy.selectedNeuroProfileId,
    selectedApexDossierId: save.strategy.selectedApexDossierId,
    classId: save.player.classId,
    neuroProfileId: save.player.neuroProfileId
  }, before);
});
