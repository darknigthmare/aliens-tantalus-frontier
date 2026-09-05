import test from 'node:test';
import assert from 'node:assert/strict';
import { getCatalogGameplayScaleV72, getCatalogMarineReferenceV72, getCatalogComparisonLayoutV72 } from '../src/catalog-scale-v72.js';
import { getCatalogEntryV62, getHumanSizeComparisonV62 } from '../src/catalog-runtime-v62.js';
import { CatalogWorkbenchV62 } from '../src/catalog-ui-v62.js';
import { readFileSync } from 'node:fs';

test('V72 facehugger and queen use one world scale, never individual square fitting', () => {
  const face = getCatalogGameplayScaleV72(getCatalogEntryV62('enemy-002-facehugger').visual, 0.5);
  const queen = getCatalogGameplayScaleV72(getCatalogEntryV62('enemy-008-queen').visual, 0.5);
  assert.equal(face.width, 56);
  assert.equal(face.height, 36);
  assert.equal(queen.width, 224);
  assert.equal(queen.height, 170);
  assert.equal(queen.height / face.height, 340 / 72);
  assert.notEqual(face.width, face.height, 'the facehugger must not be stretched to a square');
  assert.equal(face.groundOffset, face.height / 16);
  assert.equal(queen.groundOffset, queen.height / 16);
});

test('V72 catalogue dimensions are renderer pixels, never fabricated canon metres', () => {
  const marine = getCatalogGameplayScaleV72(getCatalogMarineReferenceV72(), 0.65);
  assert.equal(marine.worldHeight, 148);
  assert.equal(marine.source, 'runtime-render-dimensions-not-canon-metres');
  assert.equal(getHumanSizeComparisonV62('enemy-008-queen'), null);
  assert.equal(getCatalogGameplayScaleV72(null), null);
  assert.equal(getCatalogGameplayScaleV72(getCatalogMarineReferenceV72(), -1), null);
  assert.equal(getCatalogEntryV62('enemy-002-facehugger').visual.renderHeight, 72);
});

const referenceVisuals = () => [getCatalogEntryV62('enemy-002-facehugger').visual,
  getCatalogMarineReferenceV72(), getCatalogEntryV62('enemy-008-queen').visual];

test('V74 three and four silhouettes derive one responsive world unit and one ground extent', () => {
  for (const visuals of [referenceVisuals(), [...referenceVisuals(), getCatalogEntryV62('enemy-055-albino-chestburster').visual]]) {
    const layout = getCatalogComparisonLayoutV72(visuals);
    assert.equal(layout.gapPixels, (visuals.length - 1) * 8);
    assert.equal(layout.aboveGround, 340 * 15 / 16);
    assert.equal(layout.belowGround, 340 / 16);
    assert.equal(layout.totalWorldWidth, visuals.length === 3 ? 670 : 858);
    assert.equal(layout.cssWorldUnit, `min(0.35px, max(0px, calc((100cqw - ${layout.gapPixels}px) / ${layout.totalWorldWidth})))`);
    for (const width of [190, 268, 297, 390, 900]) {
      const scale = Math.min(0.35, (width - layout.gapPixels) / layout.totalWorldWidth);
      const rendered = visuals.map((visual) => getCatalogGameplayScaleV72(visual, scale));
      assert.ok(rendered.reduce((sum, size) => sum + size.width, 0) + layout.gapPixels <= width + 1e-9);
      assert.ok(Math.abs(rendered[2].height / rendered[0].height - 340 / 72) < 1e-12);
      assert.ok(rendered.every((size) => size.pixelsPerWorldPixel === scale));
    }
  }
});

test('V74 missing media reserves an explicitly unknown slot without invented dimensions', () => {
  const layout = getCatalogComparisonLayoutV72([...referenceVisuals(), null]);
  assert.equal(layout.sizes[3], null);
  assert.equal(layout.slots[3], 160);
  assert.equal(getCatalogComparisonLayoutV72([]).cssWorldUnit, '0px');
});

test('V74 renderer binds every width, height and pivot to the same unit and keeps names outside narrow slots', () => {
  const element = (tag) => ({ tagName: tag, children: [], style: { setProperty(key, value) { this[key] = value; } }, dataset: {},
    setAttribute(key, value) { this[key] = value; }, append(...nodes) { this.children.push(...nodes); } });
  const css = readFileSync(new URL('../catalog-v62.css', import.meta.url), 'utf8');
  assert.match(css, /\.catalog-v72__comparison\s*\{[^}]*container-type:\s*inline-size[^}]*flex-wrap:\s*nowrap/u);
  assert.match(css, /\.catalog-v72__comparison-plane\s*\{[^}]*height:\s*calc\(var\(--catalog-above-ground\) \* var\(--catalog-world-unit\)/u);
  for (const id of ['enemy-008-queen', 'enemy-055-albino-chestburster']) {
    const section = element('section');
    const context = { document: { createElement: element }, detail: element('aside'), renderSection: () => section,
      animator: { mount(plane) { const preview = element('figure'); plane.append(preview); return preview; } } };
    CatalogWorkbenchV62.prototype.renderGameplayScaleV72.call(context, getCatalogEntryV62(id));
    const [stage, legend] = section.children;
    const count = id === 'enemy-008-queen' ? 3 : 4;
    assert.equal(stage.children.length, count);
    assert.equal(legend.tagName, 'ol');
    assert.equal(legend.children.length, count);
    assert.match(stage['aria-label'], count === 4 ? /Albino Chestburster/u : /Queen/u);
    stage.children.forEach((item, index) => {
      const [plane, marker] = item.children;
      const preview = plane.children[0];
      for (const property of ['width', 'height', 'marginBottom']) assert.match(preview.style[property], /var\(--catalog-world-unit\)/u);
      assert.match(item.style.width, /var\(--catalog-world-unit\)/u);
      assert.equal(marker.textContent, String(index + 1));
      assert.equal(preview.dataset.worldScale, 'responsive-common');
    });
  }
});
