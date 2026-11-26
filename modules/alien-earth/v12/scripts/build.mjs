import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAlienEarthDlc, renderEarthStandaloneV12 } from '../../../../scripts/build-alien-earth-dlc.mjs';
const root = fileURLToPath(new URL('../../../../', import.meta.url));
if (process.argv.includes('--standalone')) {
  const outputArgument = process.argv.find(value => value.startsWith('--output='));
  assert.ok(outputArgument, 'Use --standalone --output= with an explicit export path.');
  const output = resolve(outputArgument.slice(9)), result = await renderEarthStandaloneV12(root);
  await mkdir(dirname(output), { recursive: true }); await writeFile(output, result.html);
  console.log(JSON.stringify({ output, modules: result.modules, images: result.images }));
} else console.log(JSON.stringify(await buildAlienEarthDlc(root, process.env.ATF_BUILD_OUTPUT || root)));
