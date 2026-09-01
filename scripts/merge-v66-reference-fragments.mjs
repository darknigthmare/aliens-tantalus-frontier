// Deterministic merge of locally reviewed identity locks into the shared V66
// reference registry. This updates reference contracts only; it never accepts art.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { ROOT, scopedPath } from './enemy-batch-production.mjs';

const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const canonicalBytes = (document) => Buffer.from(JSON.stringify(document, null, 2) + '\n', 'utf8');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export function assembleReferenceRegistry(baseDocument, fragments) {
  if (!record(baseDocument) || baseDocument.schema !== 1 || !record(baseDocument.profiles)) {
    throw new Error('Existing reference registry has the wrong schema.');
  }
  if (!Array.isArray(fragments) || !fragments.length) {
    throw new Error('At least one reference fragment is required.');
  }
  const profiles = { ...baseDocument.profiles };
  const incoming = new Set();
  for (const fragment of fragments) {
    if (!record(fragment) || fragment.schema !== 1 || !record(fragment.profiles)) {
      throw new Error('Reference fragment has the wrong schema.');
    }
    const entries = Object.entries(fragment.profiles);
    if (!entries.length) throw new Error('Reference fragment has no profiles.');
    for (const [profileId, entry] of entries) {
      if (incoming.has(profileId)) throw new Error('Duplicate incoming reference profile: ' + profileId);
      if (!record(entry) || entry.status !== 'reviewed' || !String(entry.designLock || '').trim()
        || !Array.isArray(entry.urls) || !Array.isArray(entry.localPaths) || entry.canonExact !== false) {
        throw new Error('Incomplete reviewed reference lock: ' + profileId);
      }
      if (entry.urls.some((url) => !String(url).startsWith('https://'))) {
        throw new Error('Reference URLs must use HTTPS: ' + profileId);
      }
      if (profiles[profileId] && !isDeepStrictEqual(profiles[profileId], entry)) {
        throw new Error('Refusing to overwrite an existing reference lock: ' + profileId);
      }
      incoming.add(profileId);
      profiles[profileId] = entry;
    }
  }
  const sortedProfiles = Object.fromEntries(Object.entries(profiles).sort(([left], [right]) => (
    left < right ? -1 : left > right ? 1 : 0
  )));
  return {
    document: { ...baseDocument, profiles: sortedProfiles },
    incoming: [...incoming].sort(),
  };
}

export async function mergeReferenceFragments({
  fragmentPaths,
  targetPath = 'docs/references/V66_ENEMY_BATCH_REFERENCES.json',
  root = ROOT,
} = {}) {
  if (!Array.isArray(fragmentPaths) || !fragmentPaths.length) {
    throw new Error('Usage: merge-v66-reference-fragments.mjs fragment.json ...');
  }
  const target = scopedPath(root, targetPath);
  const base = await readJson(target);
  const fragments = await Promise.all(fragmentPaths.map((path) => readJson(scopedPath(root, path))));
  const { document, incoming } = assembleReferenceRegistry(base, fragments);
  for (const profileId of incoming) {
    for (const localPath of document.profiles[profileId].localPaths) {
      await readFile(scopedPath(root, localPath));
    }
  }
  const bytes = canonicalBytes(document);
  await writeFile(target, bytes);
  return {
    path: targetPath,
    sha256: hash(bytes),
    mergedProfiles: incoming,
    acceptedAutomatically: 0,
  };
}

export async function main(args = process.argv.slice(2)) {
  if (!args.length) throw new Error('Usage: merge-v66-reference-fragments.mjs fragment.json ...');
  console.log(JSON.stringify(await mergeReferenceFragments({ fragmentPaths: args }), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
