import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, open, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const [archiveId, outputDirectory] = process.argv.slice(2);
const index = JSON.parse(await readFile(join(here, 'INDEX.json'), 'utf8'));
const selected = archiveId ? index.preserved.filter(row => row.archiveId === archiveId) : index.preserved;
assert.ok(selected.length, 'Unknown archive ID; see INDEX.json');
if (outputDirectory) await mkdir(outputDirectory, { recursive: true });
for (const archive of selected) {
  const digest = createHash('sha256');
  let total = 0;
  let output;
  try {
    // Exclusive creation never overwrites a previous reconstruction.
    if (outputDirectory) output = await open(join(outputDirectory, archive.originalFilename), 'wx');
    for (const part of archive.parts) {
      assert.equal(part.offset, total, 'Non-contiguous original bytes');
      assert.ok(part.path.startsWith('archives/dlc-historical-recovery-20261126/'));
      assert.ok(!part.path.split('/').includes('..') && !part.path.includes('\\'));
      const data = await readFile(join(root, part.path));
      assert.equal(data.length, part.bytes, 'Part length mismatch: ' + part.path);
      assert.equal(createHash('sha256').update(data).digest('hex'), part.sha256, 'Part SHA256 mismatch: ' + part.path);
      assert.equal(createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex'), part.gitBlobSha1, 'Git blob mismatch: ' + part.path);
      digest.update(data);
      total += data.length;
      if (output) await output.writeFile(data);
    }
    assert.equal(total, archive.bytes, 'Original ZIP length mismatch');
    assert.equal(digest.digest('hex'), archive.sha256, 'Original ZIP SHA256 mismatch');
  } finally {
    if (output) await output.close();
  }
  console.log(JSON.stringify({ archiveId: archive.archiveId, bytes: total, sha256: archive.sha256, verified: true, written: Boolean(outputDirectory) }));
}
