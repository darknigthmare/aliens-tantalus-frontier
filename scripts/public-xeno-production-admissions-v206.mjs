import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206 } from './audit-xeno-production-assets-v206.mjs';

export const PUBLIC_XENO_PRODUCTION_DIRECTORY_V206 = 'assets/openai/xeno-trials-v206';
const assets = Object.entries(XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206).filter(([, receipt]) => receipt.kind === 'production-asset');
const files = new Set(assets.map(([path]) => path));
const directories = new Set([PUBLIC_XENO_PRODUCTION_DIRECTORY_V206,
  ...assets.map(([path]) => path.slice(0, path.lastIndexOf('/')))]);

/** Exact production files can be retained in source control. No V206 PNG or
 * directory is copied into the playable distribution by this admission. */
export function publicXenoProductionPathAdmissionV206(path, { directory = false, built = false } = {}) {
  if (path !== PUBLIC_XENO_PRODUCTION_DIRECTORY_V206 && !path.startsWith(PUBLIC_XENO_PRODUCTION_DIRECTORY_V206 + '/')) return null;
  if (built) return false;
  return directory ? directories.has(path) : files.has(path);
}

export async function verifyXenoProductionAdmissionsV206(root) {
  assert.ok(assets.length > 0, 'V206 production images await final source freeze');
  for (const [path, receipt] of assets) {
    assert.match(path, /^assets\/openai\/xeno-trials-v206\/characters\/[a-z0-9-]+\.png$/);
    const bytes = await readFile(join(root, path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), receipt.sha256, 'Changed V206 production image: ' + path);
    assert.ok(bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'Invalid V206 PNG: ' + path);
    assert.ok(bytes.readUInt32BE(8) === 13 && bytes.toString('ascii', 12, 16) === 'IHDR', 'Missing V206 PNG dimensions: ' + path);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.ok(width > 0 && height > 0 && width <= 8192 && height <= 8192 && width * height <= 16777216,
      'V206 PNG dimensions exceed the production budget: ' + path);
  }
  return { productionImages: assets.length, runtimeImages: 0, sourceOnly: true };
}
