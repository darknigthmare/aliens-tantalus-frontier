import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { captionReadingMillisecondsV84, CombatCaptionDirectorV84 } from '../src/combat-captions-v84.js';
test('caption reading window grows with message length and remains bounded', () => {
  assert.equal(captionReadingMillisecondsV84(null), 2500);
  assert.equal(captionReadingMillisecondsV84('Contact'), 2500);
  assert.equal(captionReadingMillisecondsV84('x'.repeat(108)), 6000);
  assert.equal(captionReadingMillisecondsV84('x'.repeat(10000)), 12000);
});
test('weapon throttling and squad-log protection use the same reading duration', () => {
  const director = new CombatCaptionDirectorV84();
  director.offer('mission', 'x'.repeat(108), 10);
  assert.equal(director.offer('weapon', 'Shot', 15.9), null);
  assert.ok(director.offer('weapon', 'Shot', 16));
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /log\.dataset\.captionUntil = String\(Date\.now\(\) \+ captionReadingMillisecondsV84\(event\.text \|\| event\.channel\)\)/);
  assert.match(app, /if \(Number\(log\.dataset\.captionUntil \|\| 0\) > Date\.now\(\)\) return/);
});
