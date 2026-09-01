import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleReferenceRegistry } from '../scripts/merge-v66-reference-fragments.mjs';

const lock = (name) => ({
  status: 'reviewed',
  urls: ['https://example.com/' + name],
  localPaths: ['docs/' + name + '.md'],
  designLock: 'Reviewed identity lock for ' + name,
  reviewer: 'Codex test',
  reviewedAt: '2026-09-01',
  canonExact: false,
});

test('reference fragments merge deterministically without accepting art', () => {
  const base = { schema: 1, profiles: { 'enemy-010-zulu': lock('zulu') } };
  const result = assembleReferenceRegistry(base, [
    { schema: 1, profiles: { 'enemy-002-beta': lock('beta') } },
    { schema: 1, profiles: { 'enemy-001-alpha': lock('alpha') } },
  ]);
  assert.deepEqual(Object.keys(result.document.profiles), [
    'enemy-001-alpha',
    'enemy-002-beta',
    'enemy-010-zulu',
  ]);
  assert.deepEqual(result.incoming, ['enemy-001-alpha', 'enemy-002-beta']);
});

test('reference fragments cannot overwrite an existing reviewed lock', () => {
  const base = { schema: 1, profiles: { 'enemy-001-alpha': lock('alpha') } };
  const replacement = { ...lock('alpha'), designLock: 'Changed identity' };
  assert.throws(
    () => assembleReferenceRegistry(base, [{ schema: 1, profiles: { 'enemy-001-alpha': replacement } }]),
    /Refusing to overwrite/,
  );
});

test('duplicate incoming profiles are rejected', () => {
  const fragment = { schema: 1, profiles: { 'enemy-001-alpha': lock('alpha') } };
  assert.throws(
    () => assembleReferenceRegistry({ schema: 1, profiles: {} }, [fragment, fragment]),
    /Duplicate incoming/,
  );
});

test('canon-exact claims and incomplete locks are rejected', () => {
  const invalid = { ...lock('alpha'), canonExact: true };
  assert.throws(
    () => assembleReferenceRegistry(
      { schema: 1, profiles: {} },
      [{ schema: 1, profiles: { 'enemy-001-alpha': invalid } }],
    ),
    /Incomplete reviewed reference lock/,
  );
});
