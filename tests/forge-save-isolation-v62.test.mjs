import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FORGE_LEGACY_IMPORT_ID_V62,
  FORGE_SAVE_KEY_V62,
  ForgeSaveSystemV62,
  copyLegacyCampaignProjectsV62,
  createDefaultForgeSaveV62,
  sanitizeForgeProjectV62,
  sanitizeForgeSaveV62
} from '../src/forge-save-v62.js';
import { SAVE_PREFIX, SAVE_SCHEMA, createDefaultSave, migrateSave } from '../src/save.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const writes = [];
  return {
    values,
    writes,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { writes.push(key); values.set(key, String(value)); },
    removeItem: (key) => values.delete(key)
  };
}

const validLegacyProject = (overrides = {}) => ({
  schema: 2,
  id: 'local-forge-mission',
  name: 'Mission Périmètre Hadley',
  kind: 'mission',
  size: [32, 18],
  tiles: [
    { position: '1:16', type: 'floor' },
    { position: '2:15', type: 'spawn' },
    { position: '25:15', type: 'objective' }
  ],
  validation: { ok: false, errors: ['données périmées'], counts: {} },
  updatedAt: 61,
  ...overrides
});

test('Forge V62 sanitizes projects and recomputes validation instead of trusting imported data', () => {
  const project = sanitizeForgeProjectV62({
    ...validLegacyProject(),
    id: '  Mission <script>alert(1)</script>  ',
    name: 'Pont\u0000 tactique',
    size: [9999, -5],
    tiles: [
      { position: '1:1', type: 'floor', executable: true },
      { position: '2:2', type: 'spawn' },
      { position: '3:3', type: 'objective' },
      { position: '200:2', type: 'enemy' },
      { position: '4:4', type: '<script>' }
    ],
    validation: { ok: false, errors: ['falsifié'] },
    arbitraryCampaignState: { credits: 999999 }
  });

  assert.equal(project.id, 'mission-script-alert-1-script');
  assert.equal(project.name, 'Pont tactique');
  assert.deepEqual(project.size, [128, 8]);
  assert.equal(project.tiles.length, 3);
  assert.equal(project.validation.ok, true);
  assert.equal(Object.hasOwn(project, 'arbitraryCampaignState'), false);
});

test('workspace sanitization resolves duplicate maximum-length ids deterministically', () => {
  const longId = 'a'.repeat(120);
  const save = sanitizeForgeSaveV62({
    projects: [
      validLegacyProject({ id: longId }),
      validLegacyProject({ id: longId })
    ],
    activeProjectId: longId.toUpperCase()
  }, 90);
  assert.equal(save.projects.length, 2);
  assert.equal(save.projects[0].id.length, 120);
  assert.equal(save.projects[1].id.length, 120);
  assert.match(save.projects[1].id, /-2$/);
  assert.equal(new Set(save.projects.map((project) => project.id)).size, 2);
  assert.equal(save.activeProjectId, longId);
});

test('pure legacy copy is non-mutating, preserves existing Forge work and is idempotent', () => {
  const campaign = {
    profile: 2,
    statistics: { campaigns: 19 },
    galaxy: { resources: { credits: 4821 } },
    editor: {
      activeProjectId: 'local-forge-mission',
      projects: [validLegacyProject(), null, '<invalid>']
    }
  };
  const forge = createDefaultForgeSaveV62(100);
  forge.projects.push(validLegacyProject({ id: 'forge-native', name: 'Projet V62' }));
  forge.activeProjectId = 'forge-native';
  const campaignBefore = structuredClone(campaign);
  const forgeBefore = structuredClone(forge);

  const first = copyLegacyCampaignProjectsV62(forge, [{ profile: 2, data: campaign }], 200);
  assert.equal(first.imported, 1);
  assert.equal(first.alreadyImported, false);
  assert.equal(first.save.projects.length, 2);
  assert.equal(first.save.activeProjectId, 'forge-native');
  assert.deepEqual(first.save.projects[1].legacyOrigin, { profile: 2, projectId: 'local-forge-mission' });
  assert.deepEqual(campaign, campaignBefore);
  assert.deepEqual(forge, forgeBefore);

  const second = copyLegacyCampaignProjectsV62(first.save, [{ profile: 2, data: campaign }], 300);
  assert.equal(second.imported, 0);
  assert.equal(second.alreadyImported, true);
  assert.equal(second.save.projects.length, 2);
  assert.equal(second.save.imports[FORGE_LEGACY_IMPORT_ID_V62].projectCount, 1);
});

test('ForgeSaveSystem uses its own key and never rewrites campaign profiles during one-time import', () => {
  const campaign = createDefaultSave(1);
  campaign.release = '61.0.0';
  campaign.statistics.campaigns = 12;
  campaign.galaxy.resources.credits = 7120;
  campaign.editor = {
    projects: [validLegacyProject()],
    activeProjectId: 'local-forge-mission'
  };
  const campaignKey = `${SAVE_PREFIX}1`;
  const campaignText = JSON.stringify(campaign);
  const storage = memoryStorage({ [campaignKey]: campaignText });
  const system = new ForgeSaveSystemV62(storage);

  const loaded = system.load({ now: 6200 });
  assert.equal(loaded.imported, 1);
  assert.notEqual(FORGE_SAVE_KEY_V62, campaignKey);
  assert.equal(storage.getItem(campaignKey), campaignText);
  assert.deepEqual([...new Set(storage.writes)], [FORGE_SAVE_KEY_V62]);
  assert.equal(system.data.activeProjectId, 'legacy-p1-local-forge-mission');

  const reload = new ForgeSaveSystemV62(storage).load({ now: 6300 });
  assert.equal(reload.imported, 0);
  assert.equal(reload.alreadyImported, true);
  assert.equal(reload.save.projects.length, 1);
  assert.equal(storage.getItem(campaignKey), campaignText);
});

test('campaign schema 52 migration remains additive and retains the complete V60/V61 editor payload', () => {
  const legacy = createDefaultSave(3);
  legacy.schema = 51;
  legacy.release = '61.0.0';
  legacy.statistics.kills = 77;
  legacy.galaxy.resources.credits = 9001;
  legacy.editor = {
    projects: [validLegacyProject({ id: 'legacy-ship', kind: 'ship', name: 'Tantalus deck test' })],
    activeProjectId: 'legacy-ship'
  };
  const editorBefore = structuredClone(legacy.editor);

  const migrated = migrateSave(legacy, 3);
  assert.equal(SAVE_SCHEMA, 52);
  assert.equal(migrated.schema, 52);
  assert.equal(migrated.statistics.kills, 77);
  assert.equal(migrated.galaxy.resources.credits, 9001);
  assert.deepEqual(migrated.editor, editorBefore);
  assert.deepEqual(legacy.editor, editorBefore);

  const sanitizedForge = sanitizeForgeSaveV62({ projects: migrated.editor.projects, activeProjectId: migrated.editor.activeProjectId }, 6400);
  assert.equal(sanitizedForge.projects.length, 1);
  assert.equal(sanitizedForge.activeProjectId, 'legacy-ship');
});
