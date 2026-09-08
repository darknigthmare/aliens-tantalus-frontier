import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AudioDirector } from '../src/audio.js';
import { AudioAssetBankV77, emptyAudioManifestV77, normalizeAudioManifestV77, isAudioResponseV77 } from '../src/audio-assets-v77.js';
import { scanAudioV77, writeAudioManifestV77 } from '../scripts/audio-scan-v77.mjs';

// Real minimal mono PCM WAV generated only in tests, never a production bank.
function wav(sample = 800) {
  const bytes = Buffer.alloc(204); bytes.write('RIFF'); bytes.writeUInt32LE(196, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(8000, 24); bytes.writeUInt32LE(16000, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(160, 40);
  for (let i = 0; i < 80; i++) bytes.writeInt16LE(i % 2 ? sample : -sample, 44 + i * 2);
  return bytes;
}
const WAV = wav();
const source = (kind = 'sfx', id = 'shot', extension = 'wav', bytes = WAV) => ({ path: `/assets/audio/${kind}/${id}.${extension}`,
  mime: extension === 'mp3' ? 'audio/mpeg' : 'audio/wav', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
const response = (bytes = WAV, mime = 'audio/wav', status = 200) => new Response(bytes, { status, headers: { 'content-type': mime } });
// WebCrypto completes outside the JS event loop: a fixed number of ticks is not
// evidence that fetch/hash/decode/play has completed, especially in the full suite.
async function bounded(work, label) {
  let timer;
  try {
    return await Promise.race([work, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Audio fixture timeout: ${label}`)), 5000);
    })]);
  } finally { clearTimeout(timer); }
}
async function warmShot(director) {
  await bounded(director.prepare(), 'manifest ready before effect decode');
  const queued = director.effectBuffers.get('shot') || director.effectPending.get('shot');
  assert.ok(queued, 'unlock automatically queued the shot load');
  assert.ok(await bounded(Promise.resolve(queued), 'shot hash and decode completed'));
}
const parameter = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} });
class Context {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; this.started = []; this.tones = []; this.decodeCount = 0; }
  createGain() { return { gain: parameter(), connect() { return this; }, disconnect() {} }; }
  createOscillator() {
    const node = { frequency: parameter(), connect() { return this; }, disconnect() {}, stop() {}, start: () => this.tones.push(node) }; return node;
  }
  createBufferSource() {
    const node = { connect() {}, disconnect() {}, stop() {}, start: () => this.started.push(node) }; return node;
  }
  async decodeAudioData(buffer) {
    this.decodeCount++; const bytes = Buffer.from(buffer); if (bytes.toString('ascii', 0, 4) !== 'RIFF') throw new Error('invalid WAV');
    return { length: bytes.readUInt32LE(40) / 2, numberOfChannels: 1, duration: 0.01 };
  }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
}
function harness(manifest = emptyAudioManifestV77(), options = {}) {
  const requests = [], urls = new Map(), media = [], milestones = new Map(), sceneWork = [];
  let playAttempts = 0;
  const milestone = name => {
    if (!milestones.has(name)) {
      let resolve;
      const promise = new Promise(done => { resolve = done; });
      milestones.set(name, { promise, resolve });
    }
    return milestones.get(name);
  };
  const signal = (name, value) => milestone(name).resolve(value);
  class Media {
    constructor() { media.push(this); }
    canPlayType(mime) { return options.support?.(mime) ?? 'probably'; }
    async play() { signal(`play:${++playAttempts}`, this); await options.play?.(urls.get(this.src)?.type); this.played = true; }
    pause() { this.paused = true; }
    removeAttribute() { this.src = ''; }
    load() {}
  }
  let sequence = 0;
  const director = new AudioDirector({ AudioContextCtor: options.ContextCtor || Context, AudioCtor: Media,
    urlApi: { createObjectURL(blob) { const id = `blob:test-${++sequence}`; urls.set(id, blob); return id; }, revokeObjectURL(id) { urls.delete(id); } },
    fetchImpl: async (url, init) => {
      requests.push(url);
      signal(`request:${url.split('?')[0]}`, true);
      if (url.endsWith('manifest.json')) return response(JSON.stringify(manifest), 'application/json');
      return options.fetch?.(url, init) || response();
    }, now: options.now || (() => Date.now()) });
  const playScene = director.playScene.bind(director);
  director.playScene = (...args) => {
    const work = playScene(...args); sceneWork.push(work); return work;
  };
  return { director, requests, urls, media,
    waitForPlay: attempt => bounded(milestone(`play:${attempt}`).promise, `media play ${attempt} entered`),
    waitForRequest: path => bounded(milestone(`request:${path}`).promise, `request ${path} started`),
    finishLatestScene: () => {
      assert.ok(sceneWork.length, 'a production playScene call was observed');
      return bounded(sceneWork.at(-1), 'latest production playScene settled');
    }
  };
}

test('scanner : huit slots déterministes, .todo = absence et vrai WAV prioritaire', async () => {
  const root = await mkdtemp(join(tmpdir(), 'atf-audio-v77-'));
  try {
    await mkdir(join(root, 'assets/audio/sfx'), { recursive: true });
    await writeFile(join(root, 'assets/audio/sfx/shot.todo'), 'Missing final recording');
    const empty = await scanAudioV77(root); assert.equal(empty.tracks.sfx.shot.sources.length, 0);
    await writeFile(join(root, 'assets/audio/sfx/shot.wav'), WAV);
    await writeFile(join(root, 'assets/audio/sfx/shot.mp3'), Buffer.alloc(0));
    await writeAudioManifestV77(root); const first = await readFile(join(root, 'assets/audio/manifest.json'), 'utf8');
    await writeAudioManifestV77(root); assert.equal(await readFile(join(root, 'assets/audio/manifest.json'), 'utf8'), first);
    assert.equal(JSON.parse(first).tracks.sfx.shot.sources[0].sha256, source().sha256);
    assert.equal(Object.values(JSON.parse(first).tracks).flatMap(Object.keys).length, 8);
    await writeAudioManifestV77(root, { check: true });
    await writeFile(join(root, 'assets/audio/sfx/shot.wav'), wav(200));
    await assert.rejects(writeAudioManifestV77(root, { check: true }), /stale/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('manifest : refuse chemins arbitraires et classe MP3/WAV selon la priorité explicite', () => {
  const raw = emptyAudioManifestV77(); raw.tracks.sfx.shot.sources = [source(), source('sfx', 'shot', 'mp3'), { ...source(), path: '/../../secret.wav' }];
  assert.deepEqual(normalizeAudioManifestV77(raw).tracks.sfx.shot.sources.map(x => x.mime), ['audio/mpeg', 'audio/wav']);
});

test('banque : déduplique transfert et vérifie les octets WAV avec SHA avant de les mettre en cache', async () => {
  let fetches = 0; const bank = new AudioAssetBankV77({ fetchImpl: async () => { fetches++; return response(); } });
  const [a, b] = await Promise.all([bank.load(source()), bank.load(source())]);
  assert.equal(a, b); assert.equal(fetches, 1); assert.equal(a.data.byteLength, WAV.length);
  assert.equal(await bank.load(source()), a); assert.equal(fetches, 1); bank.dispose();
});

test('banque : HTML200,404,206, mauvais MIME et taille/hash invalides restent hors du cache', async () => {
  for (const make of [() => response('<html>SPA</html>', 'text/html'), () => response('absent', 'text/plain', 404),
    () => response(WAV, 'audio/wav', 206), () => response(WAV, 'application/octet-stream'),
    () => response(WAV.subarray(0, 20)), () => response(wav(900))]) {
    let fetches = 0; const bank = new AudioAssetBankV77({ fetchImpl: async () => { fetches++; return make(); } });
    assert.equal(await bank.load(source()), null); assert.equal(await bank.load(source()), null);
    assert.equal(bank.cache.size, 0); assert.equal(fetches, 1); bank.dispose();
  }
  assert.equal(isAudioResponseV77(response()), true);
});

test('banque : réessaie après le délai, borne mémoire et interrompt un réseau bloqué', async () => {
  let now = 0, calls = 0;
  const bank = new AudioAssetBankV77({ now: () => now, maxBytes: WAV.length, fetchImpl: async () => ++calls === 1 ? response('no', 'text/plain', 404) : response() });
  assert.equal(await bank.load(source()), null); now = 60001;
  assert.ok(await bank.load(source())); assert.ok(await bank.load(source('sfx', 'hit')));
  assert.equal(bank.cache.size, 1); assert.equal(bank.bytes, WAV.length); bank.dispose();
  const slow = new AudioAssetBankV77({ timeoutMs: 5, fetchImpl: (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('abort')), { once: true })) });
  assert.equal(await slow.load(source()), null); assert.equal(slow.pending.size, 0); slow.dispose();
});

test('effets : fallback immédiat durant chargement; aucun tir ancien retardé après décodage', async () => {
  const manifest = emptyAudioManifestV77(); manifest.tracks.sfx.shot.sources = [source()];
  let resolveFile; const pending = new Promise(resolve => { resolveFile = resolve; });
  const { director } = harness(manifest, { fetch: () => pending });
  await director.unlock(); director.shot(); assert.equal(director.context.tones.length, 1);
  resolveFile(response()); await warmShot(director);
  assert.equal(director.context.started.length, 0);
  director.shot(); assert.equal(director.context.started.length, 1); director.dispose();
});

test('effets : MP3 illisible passe au vrai WAV et un format non supporté ne déclenche aucun fetch', async () => {
  const corrupt = Buffer.from('invalid mp3'); const manifest = emptyAudioManifestV77();
  manifest.tracks.sfx.shot.sources = [source('sfx', 'shot', 'mp3', corrupt), source()];
  const first = harness(manifest, { fetch: url => url.includes('.mp3') ? response(corrupt, 'audio/mpeg') : response() });
  await first.director.unlock(); await warmShot(first.director);
  first.director.shot(); assert.equal(first.director.context.started.length, 1);
  assert.equal(first.director.context.decodeCount, 2); first.director.dispose();
  const second = harness(manifest, { support: mime => mime === 'audio/mpeg' ? '' : 'probably' });
  await second.director.unlock(); await warmShot(second.director);
  assert.equal(second.requests.some(url => url.includes('.mp3')), false);
  assert.equal(second.director.context.decodeCount, 1); second.director.dispose();
});

test('autoplay : resume rejeté est absorbé, aucun oscillateur en attente, prochain geste réessaie', async () => {
  let blocked = true;
  class LockedContext extends Context {
    constructor() { super(); this.state = 'suspended'; }
    async resume() { if (blocked) throw new DOMException('gesture required', 'NotAllowedError'); this.state = 'running'; }
  }
  const { director } = harness(undefined, { ContextCtor: LockedContext });
  assert.equal(await director.unlock(), false); director.shot(); assert.equal(director.context.tones.length, 0);
  assert.equal(director.unlockStatus, 'blocked'); blocked = false;
  assert.equal(await director.unlock(), true); director.shot(); assert.equal(director.context.tones.length, 1); director.dispose();
});

test('volumes : musique et effets indépendants; mute global arrête et nettoie les lectures', async () => {
  const manifest = emptyAudioManifestV77(); manifest.tracks.music.hub.sources = [source('music', 'hub')];
  let now = 0; const { director, urls } = harness(manifest, { now: () => now });
  await director.unlock(); assert.equal(await bounded(director.setScene('hub'), 'hub music started'), true);
  assert.equal(director.musicVoices.size, 1); const voice = [...director.musicVoices][0];
  director.fadeMusic(voice, 1, 0); director.setVolumes({ effects: 0, music: 0.5 });
  assert.equal(voice.audio.volume, 0.5); assert.equal(director.master.gain.value, 0);
  director.shot(); assert.equal(director.context.tones.length, 0);
  director.enabled = false; assert.equal(director.musicVoices.size, 0); assert.equal(urls.size, 0); director.dispose();
});

test('musique : fichier du menu reçu après changement vers mission ne démarre jamais', async () => {
  const manifest = emptyAudioManifestV77(); manifest.tracks.music.menu.sources = [source('music', 'menu')];
  manifest.tracks.music.mission.sources = [source('music', 'mission')];
  let resolveMenu; const delayed = new Promise(resolve => { resolveMenu = resolve; });
  const { director, media, waitForRequest } = harness(manifest, { fetch: url => url.includes('/menu.') ? delayed : response() });
  await director.unlock(); const menu = director.setScene('menu'); await waitForRequest('/assets/audio/music/menu.wav');
  assert.equal(await bounded(director.setScene('mission'), 'mission music started'), true);
  resolveMenu(response()); assert.equal(await bounded(menu, 'stale menu load settled'), false);
  assert.equal([...director.musicVoices][0]?.scene, 'mission'); assert.equal(media.filter(x => x.played).length, 1); director.dispose();
});

test('musique : refus autoplay ne marque pas le fichier absent et le geste suivant relance la lecture', async () => {
  let blocked = true; const manifest = emptyAudioManifestV77(); manifest.tracks.music.menu.sources = [source('music', 'menu')];
  const { director, requests, waitForPlay, finishLatestScene } = harness(manifest, { play: () => { if (blocked) throw new DOMException('blocked', 'NotAllowedError'); } });
  await director.unlock(); assert.equal(await bounded(director.setScene('menu'), 'autoplay rejection handled'), false);
  assert.equal(director.musicStatus, 'autoplay-blocked'); assert.equal(director.bank.failures.size, 0);
  blocked = false; await director.unlock(); await waitForPlay(2);
  assert.equal(await finishLatestScene(), true); assert.equal(director.musicStatus, 'playing');
  assert.equal(requests.filter(x => x.includes('/menu.wav')).length, 1); director.dispose();
});

test('absence de manifeste ou décodage invalide : API sans rejet et synthèse maintenue', async () => {
  const director = new AudioDirector({ AudioContextCtor: Context, AudioCtor: null, fetchImpl: async () => response('Not found', 'text/plain', 404) });
  await director.unlock(); await director.prepare(); director.shot(); director.tracker(); director.hit(); director.ui(); director.vent();
  assert.equal(director.manifestStatus, 'unavailable'); assert.ok(director.context.tones.length >= 5);
  assert.equal(await director.setScene('menu'), false); director.dispose();
});

test('dispose durant chargement : aucune lecture tardive et URLs libérées', async () => {
  const manifest = emptyAudioManifestV77(); manifest.tracks.music.menu.sources = [source('music', 'menu')];
  let resolveFile; const file = new Promise(resolve => { resolveFile = resolve; });
  const { director, media, urls, waitForRequest } = harness(manifest, { fetch: () => file });
  await director.unlock(); const playing = director.setScene('menu'); await waitForRequest('/assets/audio/music/menu.wav'); director.dispose();
  resolveFile(response()); assert.equal(await bounded(playing, 'disposed music load settled'), false);
  assert.equal(media.some(x => x.played), false); assert.equal(urls.size, 0); assert.equal(director.context.state, 'closed');
});

for (const outcome of ['resolve', 'autoplay-reject']) test(`musique play pending puis mute/unmute : ancien résultat ${outcome} sans effet sur la nouvelle voix`, async () => {
  for (const control of ['music', 'master', 'enabled']) {
    let resolveOld, rejectOld, attempts = 0;
    const oldPlay = new Promise((resolve, reject) => { resolveOld = resolve; rejectOld = reject; });
    const manifest = emptyAudioManifestV77(); manifest.tracks.music.menu.sources = [source('music', 'menu')];
    const { director, urls, waitForPlay, finishLatestScene } = harness(manifest, { play: () => ++attempts === 1 ? oldPlay : Promise.resolve() });
    try {
      await director.unlock(); const first = director.setScene('menu'); await waitForPlay(1);
      assert.equal(director.musicVoices.size, 1, control); assert.notEqual(director.musicPendingGeneration, -1);
      if (control === 'enabled') director.enabled = false; else director.setVolumes({ [control]: 0 });
      assert.equal(director.musicVoices.size, 0); assert.equal(urls.size, 0);
      if (control === 'enabled') director.enabled = true; else director.setVolumes({ [control]: 0.6 });
      await waitForPlay(2);
      assert.equal(await finishLatestScene(), true, `${control}: replacement completes while old play is still pending`);
      assert.equal(attempts, 2, `${control}: unmute ne doit pas attendre l'ancienne promesse`);
      assert.equal(director.musicVoices.size, 1); const current = [...director.musicVoices][0];
      if (outcome === 'resolve') resolveOld(); else rejectOld(new DOMException('old blocked request', 'NotAllowedError'));
      assert.equal(await bounded(first, `${control}: stale play result handled`), false);
      assert.equal(director.musicVoices.size, 1); assert.equal([...director.musicVoices][0], current);
      assert.equal(director.musicStatus, 'playing'); assert.equal(director.musicPendingGeneration, -1); assert.equal(urls.size, 1);
    } finally { resolveOld(); director.dispose(); }
  }
});
