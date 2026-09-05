import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import test from 'node:test';

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  return crc >>> 0;
});

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const name = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
};

function encodePng(width, height, channels, pixelAt) {
  const colorType = channels === 4 ? 6 : 2;
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * channels);
    for (let x = 0; x < width; x += 1) {
      const pixel = pixelAt(x, y);
      for (let channel = 0; channel < channels; channel += 1) {
        row[1 + x * channels + channel] = pixel[channel];
      }
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

async function put(root, relative, buffer) {
  const target = join(root, ...relative.split('/'));
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
}

test('V62 PNG audit separates opaque scenes and catches alpha/grid failures', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'atf-png-audit-v62-'));
  const output = join(fixture, 'report.json');
  try {
    const good = 'sprites/normalized/player/good.png';
    const missing = 'sprites/normalized/player/missing-alpha.png';
    const badGrid = 'sprites/normalized/player/bad-grid.png';
    await put(fixture, good, encodePng(32, 32, 4, (x, y) => (
      x >= 8 && x < 24 && y >= 8 && y < 24 ? [32, 48, 56, 255] : [0, 0, 0, 0]
    )));
    await put(fixture, missing, encodePng(32, 32, 3, () => [255, 255, 255]));
    await put(fixture, badGrid, encodePng(31, 32, 4, () => [0, 0, 0, 0]));
    await put(fixture, 'hub/vents/fixture-opaque-scene.png', encodePng(32, 18, 3, () => [12, 18, 22]));
    const transparentLayer = (width, height) => encodePng(width, height, 4, (x, y) => (
      x >= 4 && x < width - 4 && y >= 4 && y < height - 4
        ? [32, 48, 56, 255]
        : [0, 0, 0, 0]
    ));
    await put(fixture, 'metroidvania/tantalus-mission-far.png', encodePng(40, 24, 3, () => [12, 18, 22]));
    await put(fixture, 'metroidvania/tantalus-mission-mid.png', transparentLayer(48, 24));
    await put(fixture, 'metroidvania/tantalus-mission-foreground.png', transparentLayer(48, 24));
    await put(fixture, 'metroidvania/fixture-parallax-far.png', encodePng(40, 24, 3, () => [12, 18, 22]));
    await put(fixture, 'metroidvania/fixture-parallax-mid.png', transparentLayer(48, 24));

    const manifest = {
      contracts: {
        grids: {
          fixture: { columns: 2, rows: 2, cellWidth: 16, cellHeight: 16, guard: 1 }
        }
      },
      sheets: [good, missing, badGrid].map((path, index) => ({
        id: `fixture.${index}`,
        grid: 'fixture',
        files: { normalized: `/assets/openai/${path}` }
      }))
    };
    const manifestPath = join(fixture, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(manifest));

    const python = process.platform === 'win32' ? 'py' : 'python3';
    const result = spawnSync(python, [
      'scripts/audit-png-alpha-v62.py',
      '--asset-root', fixture,
      '--manifest', manifestPath,
      '--output', output
    ], { cwd: process.cwd(), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const report = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(report.summary.assetsAudited, 9);
    assert.equal(report.summary.byExpectation['opaque-expected'], 3);
    assert.equal(report.summary.runtimeCoverNormalizedAssets, 3);
    const codes = report.findings.map((entry) => `${entry.path}:${entry.code}`);
    assert.ok(codes.includes('assets/openai/sprites/normalized/player/missing-alpha.png:missing-alpha'));
    assert.ok(codes.includes('assets/openai/sprites/normalized/player/missing-alpha.png:edge-connected-near-white'));
    assert.ok(codes.includes('assets/openai/sprites/normalized/player/bad-grid.png:grid-dimension-mismatch'));
    assert.ok(!codes.some((entry) => entry.includes('fixture-opaque-scene.png:missing-alpha')));
    assert.ok(codes.includes('assets/openai/metroidvania/fixture-parallax-far.png:layer-dimension-mismatch'));
    assert.ok(codes.includes('assets/openai/metroidvania/fixture-parallax-mid.png:layer-dimension-mismatch'));
    assert.ok(!codes.some((entry) => entry.includes('tantalus-mission') && entry.includes('layer-dimension-mismatch')));
    const normalized = report.assets.filter((asset) => asset.runtimeCoverNormalization);
    assert.ok(normalized.every((asset) => (
      asset.runtimeCoverNormalization.id === 'tantalus-mission-runtime-cover-v62'
      && asset.runtimeCoverNormalization.mode === 'centered-cover'
      && asset.runtimeCoverNormalization.targetAspect === 2
    )));
    assert.deepEqual(
      normalized.find((asset) => asset.path.endsWith('tantalus-mission-far.png'))
        .runtimeCoverNormalization.sourceCrop,
      { sourceX: 0, sourceY: 2, sourceWidth: 40, sourceHeight: 20 }
    );
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('V64 historical PNG audit ignores V65/V66/V73/V74 production before all counters', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'atf-v66-png-isolation-'));
  try {
    const png = encodePng(32, 32, 4, (x, y) => x >= 8 && x < 24 && y >= 8 && y < 24 ? [32, 48, 56, 255] : [0, 0, 0, 0]);
    const ignored = ['v65', 'v66', 'v73', 'v74'].flatMap((version) =>
      ['frames', 'reference-masters', 'previews', 'metadata'].map((directory) => `sprites/${directory}/${version}/fixture.png`));
    ignored.push('sprites/frames/v66/batch-001/enemy-001-ovomorph/rejected/failed.png', 'sprites/normalized/enemy-clips-v66/fixture.png', 'sprites/normalized/enemy-motion-v66/fixture.png', 'sprites/normalized/enemy-profiles-v66/unaccepted.png');
    for (const path of [...ignored, 'sprites/normalized/player/runtime.png']) await put(fixture, path, png);
    const manifestPath = join(fixture, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify({ contracts: { grids: { fixture: { columns: 1, rows: 1, cellWidth: 32, cellHeight: 32, guard: 1 } } }, sheets: [{ id: 'fixture.runtime', grid: 'fixture', files: { normalized: '/assets/openai/sprites/normalized/player/runtime.png' } }] }));
    const program = [
      'import importlib.util,json,sys',
      'from pathlib import Path',
      "sys.path.insert(0,'scripts')",
      "spec=importlib.util.spec_from_file_location('v64_fixture','scripts/audit-png-alpha-v64.py')",
      'module=importlib.util.module_from_spec(spec)',
      'spec.loader.exec_module(module)',
      'audit=module.load_base_audit()',
      `report=audit.build_report(Path(${JSON.stringify(fixture)}),Path(${JSON.stringify(manifestPath)}),ignored_production_prefixes=module.IGNORED_PRODUCTION_PREFIXES)`,
      "print(json.dumps({'summary':report['summary'],'paths':[asset['path'] for asset in report['assets']]}))",
    ].join('\n');
    const result = spawnSync(process.platform === 'win32' ? 'py' : 'python3', ['-c', program], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.summary.assetsAudited, 1);
    assert.equal(report.summary.rawMastersExcluded, 0);
    assert.equal(report.paths.length, 1);
    assert.match(report.paths[0], /sprites\/normalized\/player\/runtime\.png$/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});

test('V64 Git/export inventory ignores unpublished non-runtime PNGs but audits untracked runtime errors', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'atf-v64-git-png-scope-'));
  const repo = join(fixture, 'repo');
  const exported = join(fixture, 'export');
  const transparent = encodePng(32, 32, 4, (x,y) => x>=8 && x<24 && y>=8 && y<24 ? [32,48,56,255] : [0,0,0,0]);
  const white = encodePng(32, 32, 4, () => [255,255,255,255]);
  const manifest = JSON.stringify({ contracts: { grids: { fixture: { columns:1, rows:1, cellWidth:32, cellHeight:32, guard:1 } } },
    sheets: [{ id:'fixture.runtime', grid:'fixture', files:{ normalized:'/assets/openai/sprites/normalized/player/runtime.png' } }] });
  const audit = (directory) => {
    const program = [
      'import importlib.util,json,sys', 'from pathlib import Path', "sys.path.insert(0,'scripts')",
      "spec=importlib.util.spec_from_file_location('v64_scope','scripts/audit-png-alpha-v64.py')",
      'module=importlib.util.module_from_spec(spec)', 'spec.loader.exec_module(module)',
      `root=Path(${JSON.stringify(directory)})`,
      "print(json.dumps(module.build_scoped_report(root/'assets/openai',root/'assets/openai/sprites/manifest.json',root)))",
    ].join('\n');
    const result = spawnSync(process.platform==='win32'?'py':'python3',['-c',program],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr||result.stdout);
    return JSON.parse(result.stdout);
  };
  try {
    for (const directory of [repo,exported]) {
      await put(directory,'assets/openai/sprites/normalized/player/runtime.png',transparent);
      await put(directory,'assets/openai/sprites/raw/tracked-master.png',white);
      await put(directory,'assets/openai/unused-master.png',white);
      await put(directory,'assets/openai/sprites/manifest.json',manifest);
    }
    for (const args of [['init',repo],['-C',repo,'add','assets']]) {
      const result=spawnSync('git',args,{encoding:'utf8'});
      assert.equal(result.status,0,result.stderr||result.stdout);
    }
    await put(repo,'assets/openai/sprites/raw/tools/local-backup.png',white);
    await put(repo,'assets/openai/sprites/normalized/equipment/unaccepted.png',white);
    await put(repo,'assets/openai/sprites/frames/v66/batch-005/local-candidate.png',white);
    await put(repo,'assets/openai/sprites/frames/v74/rejected.png',white);
    const trackedReport=audit(repo);
    assert.deepEqual(trackedReport,audit(exported),'same tracked assets produce byte-equivalent report content without Git');
    assert.equal(trackedReport.summary.assetsAudited,1);
    assert.equal(trackedReport.summary.rawMastersExcluded,1);
    assert.equal(trackedReport.summary.unclassifiedNotAsserted,1);
    assert.equal(trackedReport.summary.pngFilesDiscovered,3);
    await put(repo,'assets/openai/hub/props/untracked-clean.png',white);
    const changed=audit(repo);
    assert.equal(changed.summary.assetsAudited,2,'new untracked runtime prop is not hidden by Git filtering');
    assert.ok(changed.summary.findings.error>0,'opaque white runtime prop must still fail alpha QA');
    assert.ok(changed.assets.some(asset=>asset.path.endsWith('/hub/props/untracked-clean.png')));
    const declared = JSON.parse(manifest);
    declared.sheets.push({ id:'fixture.newly-declared', grid:'fixture',
      files:{normalized:'/assets/openai/sprites/normalized/equipment/unaccepted.png'} });
    await put(repo,'assets/openai/sprites/manifest.json',JSON.stringify(declared));
    const manifestDeclared=audit(repo);
    assert.equal(manifestDeclared.summary.assetsAudited,3,'a newly manifest-declared PNG is audited even while untracked');
    assert.ok(manifestDeclared.assets.find(asset=>asset.path.endsWith('/equipment/unaccepted.png')).findings.some(finding=>finding.severity==='error'));
    const colliding = JSON.parse(manifest);
    colliding.sheets.push({ id:'fixture.prefix-sibling',grid:'fixture',
      files:{normalized:'/assets/openai/sprites/normalized/equipment/unaccepted.png-runtime.png'} });
    await put(repo,'assets/openai/sprites/normalized/equipment/unaccepted.png-runtime.png',white);
    await put(repo,'assets/openai/sprites/manifest.json',JSON.stringify(colliding));
    assert.throws(()=>audit(repo),/Unpublished PNG prefix overlaps a runtime asset/,
      'a pathological untracked filename must not hide a runtime sibling through prefix matching');
  } finally { await rm(fixture,{recursive:true,force:true}); }
});
