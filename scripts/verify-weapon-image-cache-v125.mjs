import assert from 'node:assert/strict';
import test from 'node:test';
import { WeaponImageCacheV125, weaponImageReadyV125 } from '../src/weapon-image-cache-v125.js';

const asset = (number, path = `/assets/weapon-${number}.png`) => ({ imageKey: `weapon:${number}`, path, sourceWidth: 64, sourceHeight: 32 });
function host() {
  const requests = [], created = [];
  class ImageHost {
    complete = false; naturalWidth = 0; naturalHeight = 0;
    constructor() { created.push(this); }
    set src(value) { this._src = value; requests.push(value); }
    get src() { return this._src; }
    finish({ failed = false, width = 64, height = 32 } = {}) {
      this.complete = true;
      this.naturalWidth = failed ? 0 : width; this.naturalHeight = failed ? 0 : height;
      this[failed ? 'onerror' : 'onload']?.();
    }
  }
  const images = new Map();
  const cache = new WeaponImageCacheV125({ imageStore: images, ImageClass: ImageHost, maxImages: 4 });
  return { requests, created, ImageHost, images, cache };
}

test('unselected native images are bounded, least recently used entries are evicted and repeated renders do not reload', () => {
  const { cache, images, requests, created } = host();
  const unrelated = { name: 'body loaded elsewhere' }; images.set('unrelated', unrelated);
  for (let number = 0; number < 4; number++) cache.ensure(asset(number)).finish();
  const mostRecent = cache.ensure(asset(0));
  cache.ensure(asset(4)).finish();
  assert.equal(cache.entries.size, 4); assert.equal(images.has('weapon:1'), false);
  assert.equal(images.get('weapon:0'), mostRecent);
  assert.equal(created[1].onload, null); assert.equal(created[1].onerror, null);
  for (let count = 0; count < 30; count++) cache.ensure(asset(0));
  assert.equal(requests.length, 5, 'drawing a retained image must not schedule another request');
  assert.equal(images.get('unrelated'), unrelated);
  assert.equal(cache.snapshot().ready, 4);
});

test('selected operator/pickup art is pinned and a full pinned set cannot exceed the cache limit', () => {
  const { cache, requests, images } = host();
  const initial = [0, 1, 2, 3].map(number => asset(number));
  cache.retain(initial);
  assert.equal(cache.ensure(asset(4)), null); assert.equal(requests.length, 4);
  assert.equal(cache.snapshot().retained, 4);
  cache.retain([asset(0), asset(2), asset(4), asset(5)]);
  assert.deepEqual([...cache.entries.keys()].sort(), ['weapon:0', 'weapon:2', 'weapon:4', 'weapon:5']);
  assert.equal(images.has('weapon:1'), false); assert.equal(images.has('weapon:3'), false);
  const requestCount = requests.length;
  for (let count = 0; count < 10; count++) cache.retain([asset(0), asset(2), asset(4), asset(5)]);
  assert.equal(requests.length, requestCount); assert.equal(cache.entries.size, 4);
});

test('late owned load/error callbacks cannot resurrect an evicted or previous-scene image', () => {
  const { cache, images } = host();
  const old = cache.ensure(asset(0));
  const lateLoad = old.onload, lateError = old.onerror;
  cache.clear();
  assert.equal(cache.entries.size, 0); assert.equal(images.size, 0);
  const current = cache.ensure(asset(0));
  old.complete = true; old.naturalWidth = 64; old.naturalHeight = 32;
  lateLoad(); lateError();
  assert.equal(images.get('weapon:0'), current);
  assert.equal(cache.snapshot().loading, 1); assert.equal(cache.snapshot().ready, 0); assert.equal(cache.snapshot().failed, 0);
  current.finish(); assert.equal(cache.snapshot().ready, 1);
});

test('an owned asset path change cancels the old entry and its completion cannot replace the new art', () => {
  const { cache, requests, images } = host();
  const first = cache.ensure(asset(0)), late = first.onload;
  const replacement = cache.ensure(asset(0, '/assets/reviewed-replacement.png'));
  assert.notEqual(first, replacement); assert.equal(first.onload, null);
  assert.equal(images.get('weapon:0'), replacement);
  assert.deepEqual(requests, ['/assets/weapon-0.png', '/assets/reviewed-replacement.png']);
  first.complete = true; first.naturalWidth = 64; first.naturalHeight = 32; late();
  assert.equal(cache.snapshot().assets[0].path, '/assets/reviewed-replacement.png');
  assert.equal(cache.snapshot().loading, 1);
});

test('adoption preserves the existing loader callbacks, ready source and ownership without a hidden request', () => {
  const { cache, images, ImageHost, requests } = host();
  const external = new ImageHost();
  let loaded = 0, failed = 0;
  external.onload = () => loaded++; external.onerror = () => failed++;
  const onload = external.onload, onerror = external.onerror;
  images.set('weapon:0', external);
  assert.equal(cache.ensure(asset(0)), external);
  assert.equal(external.onload, onload); assert.equal(external.onerror, onerror);
  assert.equal(requests.length, 0); assert.equal(cache.snapshot().loading, 1);
  external.finish();
  assert.equal(loaded, 1); assert.equal(failed, 0); assert.equal(cache.snapshot().ready, 1);
  cache.clear();
  assert.equal(images.get('weapon:0'), external, 'the original loader retains ownership of its image');
  assert.equal(external.onload, onload); assert.equal(external.onerror, onerror);
  assert.equal(cache.ensure(asset(0)), external); assert.equal(requests.length, 0);
});

test('external replacement and eviction are observed instead of serving a permanently missing store reference', () => {
  const { cache, images, ImageHost } = host();
  const original = cache.ensure(asset(0)), late = original.onload;
  const external = new ImageHost(); external.finish(); images.set('weapon:0', external);
  assert.equal(cache.ensure(asset(0)), external); assert.equal(original.onload, null);
  late(); assert.equal(images.get('weapon:0'), external);
  images.delete('weapon:0');
  const restored = cache.ensure(asset(0));
  assert.ok(restored); assert.equal(images.get('weapon:0'), restored);
  assert.equal(cache.entries.size, 1);
});

test('failed natural dimensions cannot be hidden by HTML width attributes and failed entries never retry on render', () => {
  const { cache, requests } = host();
  const broken = { complete: true, naturalWidth: 0, naturalHeight: 0, width: 64, height: 32 };
  assert.equal(weaponImageReadyV125(broken, asset(0)), false);
  assert.equal(weaponImageReadyV125({ complete: true, width: 64, height: 32 }, asset(0)), true, 'a non-DOM host may expose only actual width/height');
  assert.equal(weaponImageReadyV125({ complete: true, naturalWidth: 64, naturalHeight: 31 }, asset(0)), false);
  const image = cache.ensure(asset(0)); image.finish({ failed: true });
  assert.equal(cache.snapshot().failed, 1); assert.equal(cache.snapshot().ready, 0);
  for (let count = 0; count < 20; count++) assert.equal(cache.ensure(asset(0)), image);
  assert.equal(requests.length, 1);
  cache.release('weapon:0'); cache.ensure(asset(0));
  assert.equal(requests.length, 2, 'only explicit release permits a fresh request');
});

test('invalid paths and missing image constructors do not mutate the store or schedule a request', () => {
  const { cache, images, requests } = host();
  for (const invalid of [null, {}, { imageKey: 'x', path: 'https://example.org/art.png' },
    { imageKey: 'x', path: '/assets/../private.png' }, { imageKey: 'x', path: '/other/art.png' }]) {
    assert.equal(cache.ensure(invalid), null);
  }
  assert.equal(images.size, 0); assert.equal(requests.length, 0);
  const absent = new WeaponImageCacheV125({ ImageClass: null });
  assert.equal(absent.ensure(asset(0)), null); assert.equal(absent.snapshot().retained, 0);
});
