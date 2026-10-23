import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioDirector } from '../src/audio.js';

function contextFixture() {
  const started = [], stopped = [];
  const param = () => ({ value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const gain = () => ({ gain: param(), connect() { return this; }, disconnect() {} });
  const source = kind => ({ kind, frequency: param(), connect() { return this; }, disconnect() {},
    start() { started.push(this); }, stop() { stopped.push(this); } });
  const context = { state: 'running', currentTime: 0, destination: {}, createGain: gain,
    createBufferSource: () => source('buffer'), createOscillator: () => source('oscillator'),
    close() { this.state = 'closed'; return Promise.resolve(); } };
  const director = new AudioDirector({ fetchImpl: null, AudioContextCtor: null, AudioCtor: null });
  director.context = context; director.master = gain(); director.manifestStatus = 'ready';
  return { director, context, started, stopped };
}

test('master mute admits neither cached effects nor synthesis and never queues an alarm for a later unmute', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { director: audio, started } = contextFixture();
  t.after(() => audio.dispose());
  audio.effectBuffers.set('shot', { length: 32, numberOfChannels: 1 });
  audio.setVolumes({ master: 0 });
  assert.equal(audio.shot(), false);
  assert.equal(audio.tracker(), false);
  assert.equal(audio.tone(220), false);
  assert.equal(audio.alarm(), false);
  assert.equal(started.length, 0, 'Muted gestures cannot start even a silent live voice.');
  assert.equal(audio.effectVoices.size, 0);
  assert.equal(audio.timers.size, 0, 'An alarm requested while muted must not arm a future second note.');
  audio.setVolumes({ master: 1 });
  t.mock.timers.tick(250);
  assert.equal(started.length, 0, 'Unmuting cannot reveal an effect requested during mute.');
  assert.equal(audio.shot(), true);
  assert.equal(started.length, 1); assert.equal(started[0].kind, 'buffer');
});

test('master mute keeps decoded buffers ready but does not fetch or call a fallback for muted events', async t => {
  const { director: audio, started } = contextFixture(); t.after(() => audio.dispose());
  let warmed = 0, fallback = 0;
  const warm = audio.warmEffect.bind(audio); audio.warmEffect = id => { warmed++; return warm(id); };
  audio.setVolumes({ master: 0, music: 0 });
  for (const id of ['shot', 'tracker', 'hit', 'ui', 'alarm'])
    assert.equal(audio.playEffect(id, () => fallback++), false);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(warmed, 0); assert.equal(fallback, 0); assert.equal(started.length, 0);
  const cached = { length: 16, numberOfChannels: 1 };
  audio.effectBuffers.set('ui', cached); audio.ui();
  assert.equal(audio.effectBuffers.get('ui'), cached);
  audio.setVolumes({ master: 1 }); assert.equal(audio.ui(), true);
});

test('muting an already sounding fallback alarm cancels its delayed half across a rapid unmute', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { director: audio, started, stopped } = contextFixture(); t.after(() => audio.dispose());
  audio.setVolumes({ music: 0 }); audio.alarm();
  assert.equal(started.length, 1); assert.equal(audio.timers.size, 1);
  audio.setVolumes({ effects: 0 });
  assert.equal(audio.effectVoices.size, 0); assert.equal(audio.timers.size, 0); assert.ok(stopped.length);
  audio.setVolumes({ effects: .7 }); t.mock.timers.tick(250);
  assert.equal(started.length, 1, 'A cancelled delayed half cannot restart after effects are restored.');
});

for (const change of ['scene', 'mute', 'dispose']) {
  test(`${change} rejects a pending music transfer without constructing a stale media voice`, async t => {
    const { director: audio } = contextFixture(); t.after(() => audio.dispose());
    let release, constructed = 0, urlCount = 0, loads = 0;
    const loaded = new Promise(resolve => { release = resolve; });
    audio.manifest.tracks.music.menu.sources = [{ path: '/assets/audio/music/menu.ogg', sha256: 'a'.repeat(64), mime: 'audio/ogg' }];
    audio.bank = { load: () => { loads++; return loaded; }, dispose() {} };
    audio.AudioCtor = class { constructor() { constructed++; } };
    audio.urlApi = { createObjectURL() { urlCount++; return 'blob:stale'; } };
    const first = audio.setScene('menu'); await Promise.resolve();
    assert.equal(loads, 1, 'A real asynchronous transfer is already pending before the transition.');
    if (change === 'scene') await audio.setScene('hub');
    else if (change === 'mute') audio.setVolumes({ music: 0 });
    else audio.dispose();
    release({ data: new ArrayBuffer(8), mime: 'audio/ogg' });
    assert.equal(await first, false); assert.equal(constructed, 0); assert.equal(urlCount, 0);
    assert.equal(audio.musicVoices.size, 0); assert.equal(audio.timers.size, 0);
    assert.equal(audio.musicPendingGeneration, -1);
  });
}
