import test from 'node:test';
import assert from 'node:assert/strict';
import { drawTacticalReloadHudV77, getTacticalReloadLayoutV77 } from '../src/tactical-reload-hud-v77.js';
import { captureTacticalReloadV77, startTacticalReloadV77 } from '../src/tactical-reload-v77.js';

function fixture(cssWidth, coopEnabled = true) {
  const actor = () => ({ alive: true, weaponMode: 'rifle', ammo: 2, ammoReserve: 40, magazineSize: 30 });
  const engine = { canvas: { width: 1280, height: 720 }, player: actor(), coop: actor(), coopEnabled };
  if (cssWidth !== undefined) engine.canvas.getBoundingClientRect = () => ({ width: cssWidth, height: cssWidth * 720 / 1280 });
  startTacticalReloadV77(engine.player, 'rifle');
  startTacticalReloadV77(engine.coop, 'rifle');
  return engine;
}

function drawingContext() {
  const styles = [];
  const calls = [];
  return {
    styles, calls,
    ctx: new Proxy({}, {
      get: (_target, name) => (...args) => calls.push([name, ...args]),
      set: (_target, name, value) => { styles.push([name, value]); return true; }
    })
  };
}

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ~= ${expected}`);

function overlayFixture({ retreatLeft = 14, retreatWidth = 150.453125, hidden = false } = {}) {
  const engine = fixture(480);
  const rectangle = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });
  const element = (bounds) => ({ getBoundingClientRect: () => bounds, style: { display: hidden ? 'none' : 'grid', visibility: 'visible', opacity: '1' } });
  const retreat = element(rectangle(retreatLeft, 12, retreatWidth, 36.34375));
  const toolbar = element(rectangle(14, 12, 452, 36.34375));
  const touch = element(rectangle(10, 216, 460, 94));
  const elements = { '#retreat-mission': retreat, '.game-toolbar': toolbar, '.mission-touch-controls': touch };
  engine.canvas.getBoundingClientRect = () => rectangle(0, 25, 480, 270);
  engine.canvas.ownerDocument = {
    querySelector: (selector) => elements[selector] || null,
    defaultView: { innerWidth: 480, innerHeight: 320, getComputedStyle: (node) => node.style }
  };
  return { engine, retreat, touch };
}

test('native desktop and DOM-less engine stubs keep the established 548px HUD row', () => {
  const layout = getTacticalReloadLayoutV77(fixture());
  assert.equal(layout.scale, 1);
  assert.equal(layout.compact, false);
  assert.equal(layout.stacked, false);
  assert.equal(layout.touchReserveCss, 0);
  assert.deepEqual(layout.boxes.map(({ x, y, width, height }) => [x, y, width, height]), [[18, 548, 352, 56], [390, 548, 352, 56]]);
  assert.deepEqual(layout.font, { title: 12, body: 11 });
});

test('the 844x390 phone landscape scale preserves 12/11 CSS-pixel text and 56 CSS-pixel panels', () => {
  const engine = fixture(691.2);
  const layout = getTacticalReloadLayoutV77(engine);
  close(layout.scale, 0.54);
  assert.equal(layout.compact, true);
  assert.equal(layout.stacked, false);
  assert.equal(layout.touchReserveCss, 70);
  close(layout.boxes[0].css.height, 56);
  close(layout.boxes[1].css.x - layout.boxes[0].css.x - layout.boxes[0].css.width, 20);
  close(layout.cssHeight - layout.boxes[0].css.y - layout.boxes[0].css.height, 82);
  close(layout.font.title * layout.scale, 12);
  close(layout.font.body * layout.scale, 11);
  const { ctx, styles } = drawingContext();
  drawTacticalReloadHudV77(engine, ctx);
  const fonts = styles.filter(([key]) => key === 'font').map(([, value]) => Number(value.match(/([\d.]+)px/)[1]));
  assert.equal(fonts.length, 4);
  for (const size of fonts) assert.ok(size * layout.scale >= 11 - 1e-10);
});

test('portrait stacks two distinct 56px panels above touch controls and exposes the landscape hint', () => {
  const layout = getTacticalReloadLayoutV77(fixture(390));
  assert.equal(layout.stacked, true);
  assert.equal(layout.landscapeRecommended, true);
  assert.equal(layout.totalHeightCss, 120);
  assert.equal(layout.touchReserveCss, 70);
  assert.equal(layout.boxes[0].css.x, layout.boxes[1].css.x);
  assert.equal(layout.boxes[1].css.y - layout.boxes[0].css.y, 64);
  assert.equal(layout.boxes[0].role, 'player');
  assert.equal(layout.boxes[1].role, 'coop');
});

test('an extremely narrow landscape viewport reserves both tactile button rows without changing portrait rules', () => {
  const engine = fixture(520);
  engine.canvas.ownerDocument = { defaultView: { innerWidth: 520, innerHeight: 320 } };
  const landscape = getTacticalReloadLayoutV77(engine);
  assert.equal(landscape.narrowLandscape, true);
  assert.equal(landscape.requestedTouchReserveCss, 120);
  assert.equal(landscape.touchReserveCss, 120);
  close(landscape.cssHeight - landscape.boxes.at(-1).css.y - landscape.boxes.at(-1).css.height, 132);
  engine.canvas.ownerDocument.defaultView = { innerWidth: 390, innerHeight: 844 };
  const portrait = getTacticalReloadLayoutV77(engine);
  assert.equal(portrait.narrowLandscape, false);
  assert.equal(portrait.requestedTouchReserveCss, 70);
});

test('when the canvas physically cannot fit two rows plus the touch reserve, boxes stay inside and report the actual reserve', () => {
  const engine = fixture(320);
  engine.canvas.ownerDocument = { defaultView: { innerWidth: 480, innerHeight: 220 } };
  const layout = getTacticalReloadLayoutV77(engine);
  assert.equal(layout.requestedTouchReserveCss, 120);
  assert.equal(layout.touchReserveCss, 36);
  assert.equal(layout.landscapeRecommended, true);
  assert.ok(layout.boxes.at(-1).css.y + layout.boxes.at(-1).css.height <= layout.cssHeight);
});

for (const retreatLeft of [14, 315.546875]) {
  test('480x320 letterboxed HUD clears the measured retreat and touch controls with retreat at x=' + retreatLeft, () => {
    const { engine, retreat, touch } = overlayFixture({ retreatLeft });
    const layout = getTacticalReloadLayoutV77(engine);
    const canvas = engine.canvas.getBoundingClientRect();
    assert.equal(layout.overlayClearance.measured, true);
    assert.equal(layout.overlayClearance.fits, true);
    close(layout.overlayClearance.availableCss, 159.65625);
    close(canvas.top + layout.boxes[0].css.y, retreat.getBoundingClientRect().bottom + 4);
    assert.ok(canvas.top + layout.boxes.at(-1).css.y + layout.boxes.at(-1).css.height <= touch.getBoundingClientRect().top - 4);
    assert.equal(layout.totalHeightCss, 120);
    close(layout.font.title * layout.scale, 12);
    close(layout.font.body * layout.scale, 11);
    assert.equal(layout.boxes[0].css.height, 56);
    assert.equal(layout.boxes[1].css.height, 56);
  });
}

test('a toolbar button outside the HUD horizontal span does not reserve its transparent parent', () => {
  const { engine } = overlayFixture({ retreatLeft: 400, retreatWidth: 60 });
  const layout = getTacticalReloadLayoutV77(engine);
  assert.equal(layout.overlayClearance.topCss, 0);
  assert.equal(layout.boxes[0].css.y, 18);
});

test('hidden overlays leave fallback geometry intact and off-canvas touch controls do not steal a vertical band', () => {
  const { engine } = overlayFixture({ hidden: true });
  let layout = getTacticalReloadLayoutV77(engine);
  assert.equal(layout.overlayClearance.toolbar, null);
  assert.equal(layout.overlayClearance.touch, null);
  assert.equal(layout.boxes[0].css.y, 18);
  const visible = overlayFixture();
  visible.touch.getBoundingClientRect = () => ({ left: 10, top: 320, width: 460, height: 94 });
  layout = getTacticalReloadLayoutV77(visible.engine);
  assert.equal(layout.overlayClearance.bottomCss, 270);
  assert.equal(layout.overlayClearance.fits, true);
});

test('DOM geometry that cannot fit the panels reports the limitation without shrinking their readable text', () => {
  const { engine, touch } = overlayFixture();
  touch.getBoundingClientRect = () => ({ left: 10, top: 150, width: 460, height: 94 });
  const layout = getTacticalReloadLayoutV77(engine);
  assert.equal(layout.overlayClearance.fits, false);
  assert.equal(layout.totalHeightCss, 120);
  for (const box of layout.boxes) assert.ok(box.css.y >= 0 && box.css.y + box.css.height <= layout.cssHeight);
  close(layout.font.body * layout.scale, 11);
});

for (const cssWidth of [320, 390, 639, 640, 691.2, 844, 960, 1280, 1920]) {
  test('all HUD boxes remain inside the canvas without overlap at ' + cssWidth + ' CSS pixels', () => {
    const layout = getTacticalReloadLayoutV77(fixture(cssWidth));
    assert.equal(layout.stacked, cssWidth < 640);
    for (const box of layout.boxes) {
      assert.ok(box.x >= 0 && box.y >= 0);
      assert.ok(box.width > 0 && box.height > 0);
      assert.ok(box.x + box.width <= 1280 + 1e-8);
      assert.ok(box.y + box.height <= 720 + 1e-8);
      close(box.css.width, box.width * layout.scale);
      close(box.css.height, box.height * layout.scale);
    }
    const [first, second] = layout.boxes;
    assert.ok(first.x + first.width <= second.x || first.y + first.height <= second.y);
    close(layout.font.title * layout.scale, 12);
    close(layout.font.body * layout.scale, 11);
  });
}

test('a narrow solo player consumes one row and viewport resize never mutates tactical simulation', () => {
  const engine = fixture(390, false);
  const before = captureTacticalReloadV77(engine.player);
  const first = getTacticalReloadLayoutV77(engine);
  assert.equal(first.boxes.length, 1);
  assert.equal(first.stacked, false);
  assert.equal(first.totalHeightCss, 56);
  engine.canvas.getBoundingClientRect = () => ({ width: 1280 });
  const second = getTacticalReloadLayoutV77(engine);
  assert.equal(second.boxes[0].y, 548);
  const { ctx } = drawingContext();
  drawTacticalReloadHudV77(engine, ctx);
  assert.deepEqual(captureTacticalReloadV77(engine.player), before);
});

test('a hidden canvas or incomplete browser rect falls back to the native scale instead of invalid coordinates', () => {
  const engine = fixture();
  for (const rect of [undefined, {}, { width: 0 }, { width: NaN }, { width: -1 }]) {
    engine.canvas.getBoundingClientRect = () => rect;
    const layout = getTacticalReloadLayoutV77(engine);
    assert.equal(layout.scale, 1);
    assert.equal(layout.boxes[0].y, 548);
  }
});
