import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join, parse, resolve } from 'node:path';

import { resolveSafeBuildOutput } from '../scripts/build-output-guard.mjs';

const root = resolve('virtual-project-root');

test('la sortie de build par défaut reste confinée dans dist', () => {
  assert.equal(resolveSafeBuildOutput(root), join(root, 'dist'));
  assert.equal(resolveSafeBuildOutput(root, 'release'), join(root, 'release'));
});

test('la garde refuse le projet, son parent et la racine du volume', () => {
  assert.throws(() => resolveSafeBuildOutput(root, '.'), /Unsafe ATF_BUILD_OUTPUT/);
  assert.throws(() => resolveSafeBuildOutput(root, dirname(root)), /Unsafe ATF_BUILD_OUTPUT/);
  assert.throws(() => resolveSafeBuildOutput(root, parse(root).root), /Unsafe ATF_BUILD_OUTPUT/);
});

test('une sortie absolue distincte reste autorisée', () => {
  const external = join(parse(root).root, 'CodexBuilds', 'alien-tantalus-v69');
  assert.equal(resolveSafeBuildOutput(root, external), external);
});
