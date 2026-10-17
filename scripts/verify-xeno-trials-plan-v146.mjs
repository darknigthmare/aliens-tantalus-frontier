import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96 } from '../src/xeno-trials-data-v96.js';

const root = new URL('../docs/forge/xeno-trials/', import.meta.url);
const read = name => readFileSync(new URL(name, root));
const plan = JSON.parse(read('xeno-trials-plan-v146.json'));
const manifest = JSON.parse(read('manifest-v146.json'));
const ids = new Set(XENO_TRIALS_FIGHTERS_V96.map(f => f.id));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('V146 is a planning artifact, not a runtime implementation or fidelity approval', () => {
  assert.equal(plan.schema, 146);
  assert.equal(plan.phase, 'preproduction-only');
  assert.equal(plan.approved1to1, 0);
  assert.equal(manifest.implementationChanges, false);
  assert.equal(manifest.sourceCommit, plan.sourceCommit);
  assert.match(plan.sourceCommit, /^[0-9a-f]{40}$/);
  assert.equal(plan.simulationHz, 120);
});
test('every current fighter ID is covered once, without dropping a variant', () => {
  const roster = plan.tables['02_Roster'];
  assert.equal(roster.rows.length, XENO_TRIALS_FIGHTERS_V96.length);
  assert.deepEqual(new Set(roster.rows.map(r => r[0])), ids);
  assert.deepEqual(new Set(plan.currentFighterIds), ids);
  const current = new Map(XENO_TRIALS_FIGHTERS_V96.map(f => [f.id, f]));
  for (const row of roster.rows) {
    assert.equal(row[1], current.get(row[0]).label);
    assert.equal(row[2], current.get(row[0]).family);
    assert.equal(row[10], 'Non');
  }
});
test('all per-fighter production slots have exact coverage', () => {
  for (const [name, count] of Object.entries(plan.coveragePerFighter)) {
    const table = plan.tables[name], column = table.headers.indexOf('Combattant_ID');
    assert.ok(column >= 0, name);
    const counts = new Map();
    for (const row of table.rows) counts.set(row[column], (counts.get(row[column]) || 0) + 1);
    assert.deepEqual(new Set(counts.keys()), ids, name);
    for (const [id, actual] of counts) assert.equal(actual, count, `${name}/${id}`);
  }
});
test('every table row has the correct shape and a unique stable identifier', () => {
  let rows = 0;
  for (const [name, table] of Object.entries(plan.tables)) {
    assert.equal(new Set(table.headers).size, table.headers.length, name);
    assert.equal(new Set(table.rows.map(r => r[0])).size, table.rows.length, name);
    assert.equal(manifest.tableRows[name], table.rows.length);
    for (const row of table.rows) {
      assert.equal(row.length, table.headers.length, name);
      assert.ok(typeof row[0] === 'string' && row[0].length > 0);
      assert.ok(row.every(v => v === null || ['string','number','boolean'].includes(typeof v)));
    }
    rows += table.rows.length;
  }
  assert.equal(rows, manifest.rowsTotal);
});
test('reference IDs resolve, with URLs and explicit evidence limits', () => {
  const sources = new Map(plan.tables['15_Sources'].rows.map(r => [r[0],r]));
  for (const row of sources.values()) {
    assert.match(row[8], /^https:\/\//);
    assert.ok(row[3] && row[5] && row[6], row[0]);
  }
  for (const [name, table] of Object.entries(plan.tables)) {
    const index = table.headers.indexOf('Sources_ID');
    if (index < 0) continue;
    for (const row of table.rows) for (const id of row[index].split(/[,;]/).map(x => x.trim()).filter(Boolean))
      assert.ok(sources.has(id), `${name}: unknown source ${id}`);
  }
  const readings = plan.tables['17_RelevesReference'];
  for (const row of readings.rows) {
    assert.equal(row[8], null, 'No invented timecode/page');
    assert.equal(row[9], null, 'No invented approved capture');
  }
});
test('existing arenas remain separate from proposed arenas and excluded fighters', () => {
  const actual = new Set(XENO_TRIALS_STAGES_V96.map(s => s.id));
  const listed = plan.tables['10_Arenes'].rows.filter(r => r[2] === 'Existante dans le roster');
  assert.deepEqual(new Set(listed.map(r => r[0])), actual);
  assert.deepEqual(new Set(plan.currentStageIds), actual);
  const proposed = plan.tables['10_Arenes'].rows.filter(r => r[2] === 'Proposition hors roster');
  assert.equal(proposed.length, plan.scope.proposedStages);
  for (const row of proposed) assert.ok(!actual.has(row[0]));
  for (const row of plan.tables['16_HorsRoster'].rows) assert.ok(!ids.has(row[0]));
});
test('the planning phase cannot mark work finished or an early-round fatality approved', () => {
  for (const row of plan.tables['13_Production'].rows) {
    assert.equal(row[10], 'Non commencé');
    assert.equal(row[8], null);
    assert.equal(row[9], null);
  }
  for (const row of plan.tables['08_Finitions'].rows) {
    assert.match(row[6], /terminale/);
    assert.match(row[5], /non canonique/);
    assert.equal(row[10], 'À valider');
  }
});
test('the actual Excel and JSON files match the reviewed manifest', () => {
  const xlsx = read(manifest.workbook);
  assert.equal(xlsx.subarray(0,2).toString(), 'PK');
  assert.equal(hash(xlsx), manifest.sha256);
  assert.equal(hash(read(manifest.json)), manifest.jsonSha256);
});
test('XLSX structure, formulas, cached dashboard counts and tables are valid', () => {
  const script = fileURLToPath(new URL('./verify-xeno-trials-workbook-v146.py', import.meta.url));
  const result = JSON.parse(execFileSync('python3', [script, fileURLToPath(root)], {encoding:'utf8', timeout:30000}));
  assert.equal(result.ok, true);
  assert.equal(result.sheets, 20);
  assert.equal(result.tables, 18);
  assert.equal(result.formulaErrors, 0);
  assert.ok(result.formulas >= 980);
});


test('reviewed planning documents are admitted only in source, never in the game distribution', async () => {
  const { isPublicDistributionPathV86, isPublicDistributionTextV86 } = await import('./verify-public-release-v86.mjs');
  for (const name of ['README.md', 'manifest-v146.json', 'xeno-trials-plan-v146.json', manifest.workbook]) {
    const path = `docs/forge/xeno-trials/${name}`;
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    if (!name.endsWith('.xlsx')) assert.equal(isPublicDistributionTextV86(read(name).toString('utf8')), true);
  }
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials', { directory: true }), true);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials', { directory: true, built: true }), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/unreviewed.xlsx'), false);
});
