import test from 'node:test';
import assert from 'node:assert/strict';
import { TITLE_SHIP_ASSETS_V87 } from '../src/title-scene-assets-v79.js';
import { getTitleSceneShipAnglesV88 } from '../src/title-scene-catalog-v79.js';
import { TitleSceneControllerV79 } from '../src/title-scene-v79.js';

const reference = TITLE_SHIP_ASSETS_V87.find(asset => asset.shipId === 'uss-sulaco');
const authored = (patch = {}) => ({ id: 'orbitals-uss-sulaco-front-quarter-v88', runtimeId: 'title.v88.ship.uss-sulaco.front-quarter',
  shipId: 'uss-sulaco', angleId: 'front-quarter', src: '/assets/openai/ui/title/v88/orbitals/uss-sulaco-front-quarter-v88.png',
  sha256: '1'.repeat(64), sourceWidth: 1024, sourceHeight: 768,
  hullRegistration: { x: 10, y: 20, width: 1000, height: 700, sourceWidth: 1024, sourceHeight: 768 },
  status: 'ready', viewAuthorship: 'native-authored-angle', ...patch });
const save = () => ({ profile: 1, createdAt: 1000, settings: { quality: 'high' },
  presentation: { titleScene: { shipId: 'uss-sulaco', shipName: 'TANTALUS' } } });
class Element {
  constructor(ownerDocument) { Object.assign(this, { ownerDocument, dataset: {}, children: [], hidden: false,
    listeners: new Map(), style: { values: new Map(), setProperty(k, v) { this.values.set(k, v); } } }); }
  setAttribute() {}
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}
function surface(angles = []) {
  const document = { hidden: false, createElement: () => new Element(document), addEventListener() {}, removeEventListener() {} };
  const root = new Element(document), fallback = new Element(document), stored = new Map();
  const controller = new TitleSceneControllerV79({ root, fallback, supportsScene: () => true, matchMedia: () => ({ matches: false }),
    random: () => .999, shipAngleAssets: angles, angleStorage: { getItem: k => stored.get(k), setItem: (k, v) => stored.set(k, v) },
    requestFrame: () => 1, cancelFrame() {} });
  const ship = () => root.children.find(e => e.dataset.role === 'orbitals');
  const load = (element = ship(), width, height) => {
    Object.assign(element.children[0], { naturalWidth: width, naturalHeight: height });
    element.children[0].listeners.get('load')();
  };
  return { root, fallback, controller, ship, load, stored };
}

test('identical PNG hashes cannot be relabelled as a different real camera angle', () => {
  assert.equal(getTitleSceneShipAnglesV88('uss-sulaco', [authored({ sha256: reference.sha256 })]).length, 1);
  assert.equal(getTitleSceneShipAnglesV88('uss-sulaco', [authored(), authored({ id: 'orbitals-other-v88',
    src: '/assets/openai/ui/title/v88/orbitals/other.png', angleId: 'rear-quarter' })]).length, 2);
});

test('native dimensions are accepted only when they match the registered ship image', () => {
  const s = surface(), state = save(), before = structuredClone(state); s.controller.show(state);
  s.load(s.ship(), reference.sourceWidth, reference.sourceHeight);
  assert.equal(s.ship().dataset.assetStatus, 'ready'); assert.equal(s.fallback.hidden, true);
  assert.equal(s.controller.getSnapshot().shipAssetFailure, null); assert.deepEqual(state, before);
});

test('a missing reference uses the explicit background instead of an invisible ship and retries on return', () => {
  const s = surface(), state = save(); s.controller.show(state); const failed = s.ship();
  failed.children[0].listeners.get('error')();
  assert.equal(s.controller.getSnapshot().fallbackVisible, true); assert.equal(s.root.hidden, true);
  assert.equal(s.controller.getSnapshot().shipAssetFailure.recovery, 'background');
  s.controller.hide(); s.controller.preservePlacementOnNextShowV87(); s.controller.show(state);
  assert.notEqual(s.ship(), failed); s.load(s.ship(), reference.sourceWidth, reference.sourceHeight);
  assert.equal(s.fallback.hidden, true); assert.equal(s.ship().dataset.assetStatus, 'ready');
});

test('a failed authored angle loads the same native reference without changing placement, flight phase or save', () => {
  const s = surface([authored()]), state = save(), before = structuredClone(state); s.controller.show(state);
  assert.equal(s.controller.getSnapshot().shipAngleId, 'front-quarter');
  const failed = s.ship(), placement = s.controller.placementId; s.controller.flightClock.elapsed = 12;
  failed.children[0].listeners.get('error')();
  assert.equal(s.controller.getSnapshot().shipAngleId, 'reference'); assert.equal(s.controller.getSnapshot().shipId, 'uss-sulaco');
  assert.equal(s.controller.placementId, placement); assert.equal(s.controller.flightClock.elapsed, 12);
  assert.equal(s.controller.getSnapshot().shipAssetFailure.recovery, 'reference');
  s.load(s.ship(), reference.sourceWidth, reference.sourceHeight); assert.equal(s.ship().dataset.assetStatus, 'ready');
  failed.children[0].listeners.get('load')(); assert.equal(s.controller.getSnapshot().shipAngleId, 'reference');
  assert.deepEqual(state, before);
});

test('wrong actual PNG dimensions reject an angle and a reference without stretching or a retry loop', () => {
  const s = surface([authored()]); s.controller.show(save()); s.load(s.ship(), 1536, 1024);
  assert.equal(s.controller.getSnapshot().shipAngleId, 'reference');
  assert.equal(s.controller.getSnapshot().shipAssetFailure.reason, 'dimensions');
  s.load(s.ship(), 1, 1); assert.equal(s.controller.getSnapshot().fallbackVisible, true);
  assert.equal(s.controller.getSnapshot().shipAssetFailure.recovery, 'background');
});

test('late angle failure cannot reactivate a hidden scene; disposal ignores stale image callbacks', () => {
  const s = surface([authored()]); s.controller.show(save()); const failed = s.ship(); s.controller.hide();
  failed.children[0].listeners.get('error')(); assert.equal(s.controller.active, false);
  assert.equal(s.root.dataset.active, 'false'); assert.equal(s.controller.frameId, null);
  const pending = s.ship(); s.controller.dispose(); const before = s.controller.getSnapshot();
  pending.children[0].listeners.get('error')(); assert.deepEqual(s.controller.getSnapshot(), before);
});
