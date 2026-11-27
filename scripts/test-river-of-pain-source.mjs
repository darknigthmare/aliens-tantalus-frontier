#!/usr/bin/env node
/**
 * Qualify the recovered DLC without rewriting its source, reports or archives.
 * Browser integration is qualified by the separate browser runner.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyRiverOfPainRecovery } from './river-of-pain-distribution.mjs';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const source = join(root, 'dlc', 'fleuve-de-la-douleur');
const archive = join(root, 'archives', 'river-of-pain', 'ALIENS_TANTALUS_DLC_FLEUVE_DOULEUR_v0.8.0.zip');
const modelReports = [
  'CORE', 'COLONY', 'EXPLORATION', 'PASSAGES', 'PERSISTENCE',
  'LIFE', 'DEFENSE', 'DUCT', 'MOBILITY', 'FIDELITY',
].map((name) => name + '_TEST_RESULTS.json');
const traversalReports = [
  'TRAVERSAL', 'TRAVERSAL_EXPLORATION', 'TRAVERSAL_LIFE', 'TRAVERSAL_DEFENSE',
  'TRAVERSAL_DUCT', 'TRAVERSAL_MOBILITY', 'TRAVERSAL_FIDELITY',
].map((name) => name + '_RESULTS.json');
const report = {
  schema: 1,
  startedAt: new Date().toISOString(),
  passed: false,
  scope: 'Recovered DLC model, authored traversal, installer, original package verification and authentic v0.8 upgrade on a synthetic host shell; browser integration is separate.',
  commands: [],
};
let temporary;
let output;

function inside(parent, child) {
  const suffix = relative(parent, child);
  return suffix === '' || (!isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith('..' + sep));
}

// Resolve symlinked ancestors before creating any requested output directory.
async function futureRealPath(path) {
  const missing = [];
  let cursor = path;
  for (;;) {
    try {
      return join(await realpath(cursor), ...missing);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = dirname(cursor);
      if (parent === cursor) throw error;
      missing.unshift(basename(cursor));
      cursor = parent;
    }
  }
}

async function run(name, command, args, cwd) {
  process.stdout.write('\n[river-of-pain] ' + name + '\n');
  let stdout = '';
  let stderr = '';
  let launchError;
  const result = await new Promise((done) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, npm_config_update_notifier: 'false' },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; process.stdout.write(chunk); });
    child.stderr.on('data', (chunk) => { stderr += chunk; process.stderr.write(chunk); });
    child.on('error', (error) => { launchError = error; stderr += error.message + '\n'; });
    child.on('close', (exitCode, signal) => done({ exitCode, signal }));
  });
  report.commands.push({ name, ...result, passed: !launchError && result.exitCode === 0 });
  if (output) {
    await writeFile(join(output, name + '.stdout.log'), stdout);
    await writeFile(join(output, name + '.stderr.log'), stderr);
  }
  if (launchError || result.exitCode !== 0) {
    throw new Error(name + ' failed: ' + (launchError?.message || result.signal || 'exit ' + result.exitCode));
  }
}

async function readReport(directory, name) {
  return JSON.parse(await readFile(join(directory, 'docs', name), 'utf8'));
}

function countReport(name, data) {
  const rows = Array.isArray(data) ? data
    : Array.isArray(data.results) ? data.results
      : Array.isArray(data.cases) ? data.cases
        : Array.isArray(data.checks) ? data.checks : undefined;
  const count = rows ? rows.length : data.cases;
  assert.ok(Number.isInteger(count) && count > 0, name + ': missing case count');
  assert.ok(Array.isArray(data) ? data.every((item) => item.passed === true) : data.passed === true,
    name + ': qualification failed');
  if (rows) assert.ok(rows.every((item) => item.passed === true), name + ': failed case');
  return { name, passed: true, cases: count };
}

const extractionCode = [
  'from pathlib import Path, PurePosixPath',
  'import shutil, stat, sys, zipfile',
  'archive, destination = Path(sys.argv[1]), Path(sys.argv[2]).resolve()',
  'destination.mkdir(parents=True, exist_ok=False)',
  'expected_root = "ALIEN_FLEUVE_DOULEUR_v0.8.0"',
  'seen = set()',
  'with zipfile.ZipFile(archive) as bundle:',
  '    entries = bundle.infolist()',
  '    for item in entries:',
  '        path = PurePosixPath(item.filename)',
  '        mode = item.external_attr >> 16',
  '        if not path.parts or path.is_absolute() or ".." in path.parts or "\\\\" in item.filename or path.parts[0] != expected_root:',
  '            raise ValueError("Unsafe archive member")',
  '        if stat.S_ISLNK(mode) or (stat.S_IFMT(mode) not in (0, stat.S_IFREG, stat.S_IFDIR)):',
  '            raise ValueError("Unsupported archive member type")',
  '        target = destination.joinpath(*path.parts).resolve()',
  '        if not target.is_relative_to(destination) or target in seen:',
  '            raise ValueError("Duplicate or escaping archive member")',
  '        seen.add(target)',
  '    for item in entries:',
  '        target = destination.joinpath(*PurePosixPath(item.filename).parts)',
  '        if item.is_dir():',
  '            target.mkdir(parents=True, exist_ok=True)',
  '        else:',
  '            target.parent.mkdir(parents=True, exist_ok=True)',
  '            with bundle.open(item) as incoming, target.open("xb") as outgoing:',
  '                shutil.copyfileobj(incoming, outgoing)',
  '    print("Authentic v0.8 archive: %d safely extracted members" % len(entries))',
].join('\n');

try {
  if (process.env.ROP_QA_OUTPUT) {
    assert.ok(isAbsolute(process.env.ROP_QA_OUTPUT), 'ROP_QA_OUTPUT must be an absolute directory outside the repository');
    const requested = await futureRealPath(resolve(process.env.ROP_QA_OUTPUT));
    assert.ok(!inside(root, requested), 'ROP_QA_OUTPUT must be outside the repository');
    await mkdir(requested, { recursive: true });
    output = await mkdtemp(join(requested, 'river-of-pain-source-'));
  }

  report.recovery = await verifyRiverOfPainRecovery(root, { includeArchives: true });
  const tempParent = await realpath(tmpdir());
  assert.ok(!inside(root, tempParent), 'The temporary directory must be outside the repository');
  temporary = await mkdtemp(join(tempParent, 'river-of-pain-qualification-'));
  const tested = join(temporary, 'tested');
  const pristine = join(temporary, 'pristine');
  await cp(source, tested, { recursive: true, force: false, errorOnExist: true });
  await cp(source, pristine, { recursive: true, force: false, errorOnExist: true });

  // Require fresh results from this run instead of reading inherited reports.
  for (const name of [...modelReports, ...traversalReports, 'INSTALLER_TEST_RESULTS.json', 'REAL_UPGRADE_TEST_RESULTS.json']) {
    await rm(join(tested, 'docs', name), { force: true });
  }
  await run('original-tests', process.platform === 'win32' ? 'npm.cmd' : 'npm', ['test'], tested);
  report.model = [];
  for (const name of modelReports) report.model.push(countReport(name, await readReport(tested, name)));
  report.traversal = [];
  for (const name of traversalReports) report.traversal.push(countReport(name, await readReport(tested, name)));
  report.installer = countReport('INSTALLER_TEST_RESULTS.json', await readReport(tested, 'INSTALLER_TEST_RESULTS.json'));

  await run('original-verifier', process.env.PYTHON || 'python3', ['-X', 'utf8', 'tools/verify-v09.py'], pristine);
  report.packageVerification = countReport('DELIVERY_VALIDATION_V09.json', await readReport(pristine, 'DELIVERY_VALIDATION_V09.json'));

  const previous = join(temporary, 'previous');
  await run('extract-authentic-v08', process.env.PYTHON || 'python3', ['-c', extractionCode, archive, previous], temporary);
  await run('authentic-upgrade', process.execPath,
    ['tests/upgrade-real.mjs', join(previous, 'ALIEN_FLEUVE_DOULEUR_v0.8.0')], tested);
  const upgradeEvidence = await readReport(tested, 'REAL_UPGRADE_TEST_RESULTS.json');
  report.upgrade = {
    ...countReport('REAL_UPGRADE_TEST_RESULTS.json', upgradeEvidence),
    sourcePackage: upgradeEvidence.sourcePackage,
    qualification: upgradeEvidence.qualification,
  };

  // Verify that running the qualification left all recovered repository bytes intact.
  report.recoveryAfter = await verifyRiverOfPainRecovery(root, { includeArchives: true });
  report.totals = {
    modelChecks: report.model.reduce((sum, item) => sum + item.cases, 0),
    traversalScenarios: report.traversal.reduce((sum, item) => sum + item.cases, 0),
    installerCases: report.installer.cases,
    packageChecks: report.packageVerification.cases,
    authenticUpgradeCases: report.upgrade.cases,
  };
  report.passed = true;
} catch (error) {
  report.failure = error.message;
  process.exitCode = 1;
} finally {
  try {
    if (temporary) await rm(temporary, { recursive: true, force: true });
  } catch (error) {
    report.passed = false;
    report.cleanupFailure = error.message;
    process.exitCode = 1;
  }
  report.finishedAt = new Date().toISOString();
  if (output) {
    try {
      await writeFile(join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
      process.stdout.write('\nDurable qualification report: ' + join(output, 'summary.json') + '\n');
    } catch (error) {
      report.passed = false;
      report.outputFailure = error.message;
      process.exitCode = 1;
    }
  }
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}
