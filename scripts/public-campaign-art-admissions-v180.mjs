import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { CAMPAIGN_ART_ASSETS_V180 } from '../src/campaign-art-v180.js';

const prefix = 'assets/openai/campaign';
const files = new Set(['acheron-colony', 'lv223-engineer-temple', 'fiorina-foundry', 'sevastopol-transit']
  .map(name => `${prefix}/v180/${name}.webp`));
export function publicCampaignArtPathAdmissionV180(path, { directory = false } = {}) {
  if (path === prefix || path === `${prefix}/v180`) return directory;
  if (!path.startsWith(prefix + '/')) return null;
  return !directory && files.has(path);
}
export async function verifyCampaignArtAdmissionsV180(root) {
  assert.deepEqual(new Set(CAMPAIGN_ART_ASSETS_V180.map(asset => asset.path.slice(1))), files);
  for (const asset of CAMPAIGN_ART_ASSETS_V180) {
    const bytes = await readFile(join(root, asset.path.slice(1)));
    assert.equal(bytes.length, asset.bytes, asset.path);
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF', asset.path);
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP', asset.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
  }
  return files.size;
}
