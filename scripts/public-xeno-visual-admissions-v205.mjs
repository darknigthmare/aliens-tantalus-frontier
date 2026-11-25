import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { XENO_VISUAL_ASSETS_NEW_INPUTS_V205 } from './audit-xeno-visual-assets-v205.mjs';
import { XENO_TRIALS_STAGE_BACKDROPS_V205, XENO_TRIALS_PROJECTILE_IMAGES_V205,
  XENO_TRIALS_EFFECT_IMAGES_V205 } from '../src/xeno-trials-visual-assets-v205.js';

export const PUBLIC_XENO_VISUAL_DIRECTORY_V205 = 'assets/openai/xeno-trials-v205';
const assets = Object.entries(XENO_VISUAL_ASSETS_NEW_INPUTS_V205).filter(([, receipt]) => receipt.kind === 'asset');
const production = Object.entries(XENO_VISUAL_ASSETS_NEW_INPUTS_V205).filter(([, receipt]) => receipt.kind === 'production-asset');
const files = new Set(assets.map(([path]) => path));
const sourceFiles = new Set([...assets, ...production].map(([path]) => path));
const parents = entries => entries.flatMap(([path]) => path.split('/').slice(0, -1).map((_, i) => path.split('/').slice(0, i + 1).join('/')));
const buildDirectories = new Set([PUBLIC_XENO_VISUAL_DIRECTORY_V205, ...parents(assets)]);
export const PUBLIC_XENO_VISUAL_DIRECTORIES_V205 = new Set([PUBLIC_XENO_VISUAL_DIRECTORY_V205,
  ...parents([...assets, ...production])]);

export function publicXenoVisualPathAdmissionV205(path, { directory = false, built = false } = {}) {
  if (path !== PUBLIC_XENO_VISUAL_DIRECTORY_V205 && !path.startsWith(PUBLIC_XENO_VISUAL_DIRECTORY_V205 + '/')) return null;
  return directory ? (built ? buildDirectories : PUBLIC_XENO_VISUAL_DIRECTORIES_V205).has(path)
    : (built ? files : sourceFiles).has(path);
}

/** Validate the actual release bytes as well as the source copy. No document
 * or unreviewed candidate is admitted by merely using the same directory. */
export async function verifyXenoVisualAdmissionsV205(root) {
  const required = [...Object.values(XENO_TRIALS_STAGE_BACKDROPS_V205),
    ...Object.values(XENO_TRIALS_PROJECTILE_IMAGES_V205), ...Object.values(XENO_TRIALS_EFFECT_IMAGES_V205)];
  for (const path of required) assert.ok(files.has(path.slice(1)), 'Missing V205 runtime image admission: ' + path);
  for (const [path, receipt] of assets) {
    assert.ok(path.startsWith(PUBLIC_XENO_VISUAL_DIRECTORY_V205 + '/') && path.endsWith('.png'), 'Invalid V205 image path: ' + path);
    const bytes = await readFile(join(root, path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), receipt.sha256, 'Changed V205 image bytes: ' + path);
    assert.ok(bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'Invalid V205 PNG: ' + path);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.ok(width > 0 && height > 0 && width <= 8192 && height <= 8192, 'Invalid V205 dimensions: ' + path);
    assert.ok(width * height <= 16777216, 'V205 image budget exceeded: ' + path);
  }
  return { assets: assets.length, runtimeImages: required.length };
}
