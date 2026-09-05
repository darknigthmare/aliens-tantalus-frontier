import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const ROOT = fileURLToPath(new URL('../', import.meta.url));
const REPORT_PATH = path.join(ROOT, 'assets/openai/hub/annexes/v71/hub-commercial-art-report-v71.json');
const SCRIPT_PATH = path.join(ROOT, 'scripts/process-tantalus-hub-art-v71.py');
const ANNEX_ORDER = [
  'arrival-airlock',
  'logistics',
  'mire-archives',
  'synthetic-bay',
  'cctv',
  'proving-ground',
  'morgue',
  'escape-pods',
  'durandal',
  'bioforge'
];
const ANNEX_LABELS = [
  "Sas d'arrivée",
  'Logistique',
  'Archives / Palimpsest',
  'Baie synthétique',
  'CCTV / Surveillance',
  "Terrain d'essai",
  'Morgue',
  'Capsules de sauvetage',
  'Noyau Durandal Ω',
  'Accès BIOFORGE isolé'
];
const LAYERS = ['far', 'mid', 'prop', 'foreground', 'door'];
const DIMENSIONS = {
  far: [1920, 720],
  mid: [1920, 720],
  prop: [640, 512],
  foreground: [1920, 720],
  door: [384, 512]
};


const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

function decodeWebpSize(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', 'signature RIFF absente');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', 'signature WEBP absente');
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const chunk = bytes.toString('ascii', offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (chunk === 'VP8X') {
      return [
        bytes.readUIntLE(data + 4, 3) + 1,
        bytes.readUIntLE(data + 7, 3) + 1
      ];
    }
    if (chunk === 'VP8L') {
      assert.equal(bytes[data], 0x2f, 'signature VP8L invalide');
      const bits = bytes.readUInt32LE(data + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    if (chunk === 'VP8 ') {
      assert.ok(bytes.subarray(data + 3, data + 6).equals(Buffer.from([0x9d, 0x01, 0x2a])), 'entête VP8 invalide');
      return [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff];
    }
    offset = data + length + (length & 1);
  }
  assert.fail('aucun chunk de dimensions WebP trouvé');
}

async function loadReport() {
  return JSON.parse(await readFile(REPORT_PATH, 'utf8'));
}

test('le rapport V71 verrouille les dix annexes, les libellés transcript et la provenance OpenAI originale', async () => {
  const report = await loadReport();
  assert.equal(report.schema, 71);
  assert.equal(report.contractId, 'tantalus-hub-commercial-annex-art-v71');
  assert.equal(report.artProvider, 'OpenAI ImageGen');
  assert.equal(report.originalProjectAsset, true);
  assert.equal(report.canonExact, false);
  assert.equal(report.normalHubCreaturesVisible, false);
  assert.deepEqual(report.provenance, {
    provider: 'OpenAI ImageGen',
    kind: 'original-project-art',
    originalProjectAsset: true,
    canonExact: false
  });
  assert.deepEqual(report.grid, { columns: 5, rows: 2, order: ANNEX_ORDER });
  assert.deepEqual(report.counts, { annexes: 10, layersPerAnnex: 5, files: 50 });
  assert.deepEqual(report.annexes.map(({ id }) => id), ANNEX_ORDER);
  assert.deepEqual(report.annexes.map(({ label }) => label), ANNEX_LABELS);
  assert.ok(report.annexes.every(({ normalHubCreaturesVisible }) => normalHubCreaturesVisible === false));
  assert.match(report.notes.archives, /bestiaire.*rapports.*replays/i);
  assert.match(report.notes.bioforge, /niveau séparé.*cuves.*vides/i);
  assert.equal(report.sources.length, 7);
  assert.deepEqual(report.sources.map(({ kind }) => kind), [
    'background', 'prop', 'foreground', 'door',
    'bioforge-background', 'bioforge-prop', 'bioforge-door'
  ]);
  for (const source of report.sources) {
    assert.equal(source.format, 'PNG');
    if (source.kind.startsWith('bioforge-')) {
      assert.equal(source.standalone, true);
      assert.equal(source.creatureVisible, false);
      assert.match(source.path, /bioforge-(?:access-background|access-console|door)-neutral-openai-v71\.png$/);
      const sourceBytes = await readFile(path.join(ROOT, source.path));
      assert.equal(sha256(sourceBytes), source.sha256);
      continue;
    }
    assert.deepEqual(source.grid.columns, 5);
    assert.deepEqual(source.grid.rows, 2);
    assert.equal(source.grid.xEdges.length, 6);
    assert.equal(source.grid.yEdges.length, 3);
    assert.equal(source.grid.xEdges[0], 0);
    assert.equal(source.grid.yEdges[0], 0);
    assert.equal(source.grid.xEdges.at(-1), source.dimensions[0]);
    assert.equal(source.grid.yEdges.at(-1), source.dimensions[1]);
    const sourceBytes = await readFile(path.join(ROOT, source.path));
    assert.equal(sha256(sourceBytes), source.sha256, `master dérivé ou modifié: ${source.path}`);
  }
  const bioforgeDoor = report.outputs.find(({ annexId, kind }) => annexId === 'bioforge' && kind === 'door');
  assert.ok(bioforgeDoor);
  assert.match(bioforgeDoor.source, /bioforge-door-neutral-openai-v71\.png$/);
  assert.deepEqual(bioforgeDoor.sourceCell, { standalone: true, bounds: [0, 0, 1024, 1536] });
  const bioforgeMid = report.outputs.find(({ annexId, kind }) => annexId === 'bioforge' && kind === 'mid');
  const bioforgeProp = report.outputs.find(({ annexId, kind }) => annexId === 'bioforge' && kind === 'prop');
  assert.match(bioforgeMid.source, /bioforge-access-background-neutral-openai-v71\.png$/);
  assert.match(bioforgeProp.source, /bioforge-access-console-neutral-openai-v71\.png$/);
  assert.equal(bioforgeMid.sourceCell.standalone, true);
  assert.equal(bioforgeProp.sourceCell.standalone, true);
});

test('les 50 WebP V71 sont indépendants, dimensionnés et munis de vrai alpha quand nécessaire', async () => {
  const report = await loadReport();
  assert.equal(report.outputs.length, 50);
  const inventory = new Set();
  const hashes = new Set();
  for (const output of report.outputs) {
    assert.ok(ANNEX_ORDER.includes(output.annexId), `annexe inconnue: ${output.annexId}`);
    assert.ok(LAYERS.includes(output.kind), `couche inconnue: ${output.kind}`);
    const expectedPath = `assets/openai/hub/annexes/v71/${output.annexId}/${output.kind}.webp`;
    assert.equal(output.path, expectedPath);
    assert.deepEqual(output.dimensions, DIMENSIONS[output.kind]);
    assert.deepEqual(output.provenance, {
      provider: 'OpenAI ImageGen',
      originalProjectAsset: true,
      canonExact: false
    });
    const bytes = await readFile(path.join(ROOT, output.path));
    assert.ok(bytes.length > 128, `WebP vide: ${output.path}`);
    assert.equal(sha256(bytes), output.sha256, `hash invalide: ${output.path}`);
    assert.deepEqual(decodeWebpSize(bytes), DIMENSIONS[output.kind], `dimensions binaires invalides: ${output.path}`);
    inventory.add(`${output.annexId}:${output.kind}`);
    hashes.add(output.sha256);
    if (['far', 'mid'].includes(output.kind)) {
      assert.equal(output.mode, 'RGB');
      assert.equal(output.alpha.hasAlpha, false);
      assert.equal(output.alpha.transparentPixels, 0);
    } else {
      assert.equal(output.mode, 'RGBA');
      assert.equal(output.alpha.hasAlpha, true);
      assert.ok(output.alpha.transparentPixels > 0, `fond opaque: ${output.path}`);
      assert.ok(output.alpha.partialAlphaPixels > 0, `bord alpha non anticrénelé: ${output.path}`);
      assert.ok(output.alpha.occupiedPixels > 256, `couche vide: ${output.path}`);
      assert.equal(output.alpha.hiddenRgbPixels, 0, `RGB caché: ${output.path}`);
      assert.equal(output.alpha.contentBounds.length, 4);
      assert.match(output.processing.operation, /border-connected-RGB-checker-flood-fill/);
      assert.ok(output.processing.checkerRemovedPixels > 0);
    }
  }
  assert.equal(inventory.size, 50);
  assert.equal(hashes.size, 50, 'aucun placeholder dupliqué accepté entre les 50 couches');
  for (const annex of report.annexes) {
    assert.deepEqual(Object.keys(annex.files), LAYERS);
    for (const layer of LAYERS) {
      assert.equal(annex.files[layer], `assets/openai/hub/annexes/v71/${annex.id}/${layer}.webp`);
    }
  }
});

test('le mode --check revalide sources, rapport et 50 sorties sans aucune réécriture', async () => {
  const report = await loadReport();
  const tracked = [REPORT_PATH, ...report.outputs.map(({ path: outputPath }) => path.join(ROOT, outputPath))];
  const before = await Promise.all(tracked.map(async (file) => {
    const info = await stat(file, { bigint: true });
    return { file, size: info.size, mtimeNs: info.mtimeNs };
  }));

  const candidates = process.env.PYTHON
    ? [[process.env.PYTHON, []]]
    : process.platform === 'win32'
      ? [['py', ['-3']], ['python', []]]
      : [['python3', []], ['python', []]];
  let result;
  for (const [command, prefix] of candidates) {
    result = spawnSync(command, [...prefix, SCRIPT_PATH, '--check'], {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true
    });
    if (!result.error || result.error.code !== 'ENOENT') break;
  }
  assert.ok(result, 'aucun interpréteur Python essayé');
  assert.ifError(result.error);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Validated 50 V71 hub assets without rewriting them/);

  const after = await Promise.all(tracked.map(async (file) => {
    const info = await stat(file, { bigint: true });
    return { file, size: info.size, mtimeNs: info.mtimeNs };
  }));
  assert.deepEqual(after, before, '--check ne doit toucher ni les assets ni le rapport');
});
