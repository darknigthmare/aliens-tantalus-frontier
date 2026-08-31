import test from 'node:test';
import assert from 'node:assert/strict';
import { EnemyAtlasLRUV65 } from '../src/enemy-atlas-loader-v65.js';

class FakeImage {
  constructor() {
    this.complete = false;
    this.naturalWidth = 0;
    this.width = 0;
    this.decoding = '';
  }

  set src(value) {
    this._src = value;
    queueMicrotask(() => {
      if (value.includes('fail')) {
        this.onerror?.(new Error('fixture failure'));
        return;
      }
      this.complete = true;
      this.naturalWidth = 1024;
      this.width = 1024;
      this.onload?.();
    });
  }

  get src() {
    return this._src;
  }
}

const sheet = (id) => Object.freeze({
  id: `enemy.profile.${id}.action.v65`,
  imageKey: `enemy-profile-v65:${id}`,
  path: `/assets/openai/sprites/normalized/enemy-profiles-v65/${id}.webp`,
  family: 'enemy'
});

test('le LRU V65 déduplique les demandes et borne les atlases ennemis décodés', async () => {
  const images = new Map();
  const loader = new EnemyAtlasLRUV65({ imageStore: images, maxEntries: 2, ImageCtor: FakeImage });
  const a = sheet('a');
  const b = sheet('b');
  const c = sheet('c');
  const first = loader.ensure(a);
  const duplicate = loader.ensure(a);
  assert.equal(first, duplicate);
  await first;
  await loader.ensure(b);
  assert.equal(loader.get(a), images.get(a.imageKey));
  await loader.ensure(c);

  assert.equal(images.has(a.imageKey), true);
  assert.equal(images.has(b.imageKey), false);
  assert.equal(images.has(c.imageKey), true);
  assert.equal(images.size, 2);
  assert.deepEqual(loader.snapshot(), {
    schema: 65,
    maxEntries: 2,
    entries: 2,
    ready: 2,
    loading: 0,
    failed: 0,
    unavailable: [],
    loads: 3,
    failures: 0,
    evictions: 1,
    imageKeys: [a.imageKey, c.imageKey]
  });
});

test('un chargement cassé reste diagnostiqué sans image et le préchargement reste borné', async () => {
  const images = new Map();
  const loader = new EnemyAtlasLRUV65({ imageStore: images, maxEntries: 2, ImageCtor: FakeImage });
  assert.equal(await loader.ensure(sheet('fail')), null);
  assert.equal(images.size, 0);
  assert.equal(loader.recordStatus(sheet('fail')).status, 'failed');
  await loader.preload([sheet('a'), sheet('b'), sheet('c'), sheet('c')], { concurrency: 2 });
  assert.equal(loader.snapshot().entries, 2);
  assert.equal(loader.snapshot().failures, 1);
  assert.equal(images.size, 2);
});

test('le chargeur refuse les assets non ennemis et fonctionne sans constructeur Image', async () => {
  const loader = new EnemyAtlasLRUV65({ imageStore: new Map(), ImageCtor: undefined });
  assert.throws(() => loader.ensure({ family: 'vehicle', imageKey: 'x', path: '/x.png' }), /plaque ennemie/);
  assert.equal(await loader.ensure(sheet('no-browser-image')), null);
});
