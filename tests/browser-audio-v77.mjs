import assert from 'node:assert/strict';
import { installAudioBrowserFixtureV77 } from './audio-browser-fixture-v77.mjs';

const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9226';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4176/';
const info = await fetch(`${endpoint}/json/version`).then(response => response.json());
const socket = new WebSocket(info.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let sequence = 0, sessionId = null, targetId = null, browserContextId = null;
const pending = new Map(), errors = [];
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (pending.has(message.id)) { const request = pending.get(message.id); pending.delete(message.id);
    message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
});
function command(method, params = {}, browser = false) {
  const id = ++sequence, payload = { id, method, params }; if (sessionId && !browser) payload.sessionId = sessionId;
  socket.send(JSON.stringify(payload)); return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expression) {
  const response = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  return response.result.value;
}
async function waitFor(expression, label, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { if (await evaluate(expression)) return; await new Promise(resolve => setTimeout(resolve, 50)); }
  throw new Error(`Audio browser timeout: ${label}`);
}
const report = { ok: false };
try {
  ({ browserContextId } = await command('Target.createBrowserContext', {}, true));
  ({ targetId } = await command('Target.createTarget', { url: 'about:blank', browserContextId }, true));
  ({ sessionId } = await command('Target.attachToTarget', { targetId, flatten: true }, true));
  await command('Runtime.enable'); await command('Page.enable'); await command('Network.enable');
  await command('Network.setBypassServiceWorker', { bypass: true });
  await command('Page.navigate', { url: `${appUrl}?qa=audio-v77-${Date.now()}` });
  await waitFor(`document.readyState === 'complete'`, 'page loaded');
  report.initial = await evaluate(`(${installAudioBrowserFixtureV77.toString()})()`);
  assert.equal(report.initial.hasContextBeforeGesture, false);
  const point = await evaluate(`(() => { const r = document.querySelector('#audio-qa-activate').getBoundingClientRect(); return { x: r.left + r.width/2, y: r.top + r.height/2 }; })()`);
  await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
  await command('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  await waitFor(`__AUDIO_QA_V77__.unlockResolved && __AUDIO_QA_V77__.audio.effectBuffers.has('shot') && __AUDIO_QA_V77__.audio.musicStatus === 'playing'`, 'native decode and gesture playback');
  report.native = await evaluate(`(() => {
    const q = __AUDIO_QA_V77__, a = q.audio, buffer = a.effectBuffers.get('shot'), music = [...a.musicVoices][0];
    const played = a.shot(); return { trustedGesture: q.trustedGesture, contextState: a.context.state,
      nativeBuffer: buffer instanceof AudioBuffer, channels: buffer.numberOfChannels, duration: buffer.duration,
      sampleRate: buffer.sampleRate, effectStarted: played && q.startedEffects === 1,
      nativeMedia: music.audio instanceof HTMLAudioElement, mediaPaused: music.audio.paused,
      readyState: music.audio.readyState, currentScene: music.scene, error: q.error };
  })()`);
  assert.equal(report.native.trustedGesture, true); assert.equal(report.native.contextState, 'running');
  assert.equal(report.native.nativeBuffer, true); assert.equal(report.native.channels, 1); assert.ok(Math.abs(report.native.duration - 0.05) < 0.001);
  assert.equal(report.native.effectStarted, true); assert.equal(report.native.nativeMedia, true); assert.equal(report.native.mediaPaused, false);
  assert.ok(report.native.readyState >= 2); assert.equal(report.native.error, null);
  await evaluate(`__AUDIO_QA_V77__.audio.setScene('hub')`);
  await waitFor(`__AUDIO_QA_V77__.audio.musicVoices.size === 1 && [...__AUDIO_QA_V77__.audio.musicVoices][0].scene === 'hub'`, 'menu released after transition');
  await evaluate(`__AUDIO_QA_V77__.audio.setScene('mission')`);
  await waitFor(`__AUDIO_QA_V77__.audio.musicVoices.size === 1 && [...__AUDIO_QA_V77__.audio.musicVoices][0].scene === 'mission' && [...__AUDIO_QA_V77__.audio.musicVoices][0].weight === 1`, 'mission fade finished');
  report.volumes = await evaluate(`(() => { const q=__AUDIO_QA_V77__, a=q.audio; a.setVolumes({ effects:0, music:0.4 });
    const before=q.startedEffects; a.shot(); return { effectsGain:a.master.gain.value, musicVolume:[...a.musicVoices][0].audio.volume,
      mutedEffectStarted:q.startedEffects!==before, activeScene:[...a.musicVoices][0].scene, activeUrls:q.createdUrls.size }; })()`);
  assert.equal(report.volumes.effectsGain, 0); assert.equal(report.volumes.musicVolume, 0.4);
  assert.equal(report.volumes.mutedEffectStarted, false); assert.equal(report.volumes.activeScene, 'mission'); assert.equal(report.volumes.activeUrls, 1);
  await evaluate(`(() => { const q=__AUDIO_QA_V77__; q.holdNextPlay=true; void q.audio.setScene('hub'); return true; })()`);
  await waitFor(`typeof __AUDIO_QA_V77__.releaseHeldPlay === 'function'`, 'held native play promise');
  await evaluate(`(() => { const q=__AUDIO_QA_V77__; q.audio.setVolumes({music:0}); q.audio.setVolumes({music:0.4}); return true; })()`);
  await waitFor(`__AUDIO_QA_V77__.audio.musicVoices.size===1 && __AUDIO_QA_V77__.audio.musicPendingGeneration===-1 && __AUDIO_QA_V77__.audio.musicStatus==='playing'`, 'unmute creates replacement native voice');
  await evaluate(`__AUDIO_QA_V77__.releaseHeldPlay()`);
  await waitFor(`__AUDIO_QA_V77__.audio.musicVoices.size===1 && [...__AUDIO_QA_V77__.audio.musicVoices][0].weight===1`, 'replacement survives stale resolution');
  report.pendingMute = await evaluate(`(() => {const q=__AUDIO_QA_V77__; return {voices:q.audio.musicVoices.size,status:q.audio.musicStatus,
    paused:[...q.audio.musicVoices][0].audio.paused,scene:[...q.audio.musicVoices][0].scene,urls:q.createdUrls.size};})()`);
  assert.deepEqual(report.pendingMute,{voices:1,status:'playing',paused:false,scene:'hub',urls:1});
  report.http = await evaluate(`(async () => { const missing=await fetch('/assets/audio/sfx/not-provided.wav'); const manifest=await fetch('/assets/audio/manifest.json');
    return { missingStatus:missing.status, missingMime:missing.headers.get('content-type'), manifestStatus:manifest.status, manifestMime:manifest.headers.get('content-type') }; })()`);
  assert.equal(report.http.missingStatus, 404); assert.match(report.http.missingMime, /^text\/plain/);
  assert.equal(report.http.manifestStatus, 200); assert.match(report.http.manifestMime, /^application\/json/);
  report.cleanup = await evaluate(`(() => { const q=__AUDIO_QA_V77__; q.audio.enabled=false; q.audio.dispose();
    return { voices:q.audio.musicVoices.size, urls:q.createdUrls.size, effectVoices:q.audio.effectVoices.size }; })()`);
  assert.deepEqual(report.cleanup, { voices:0, urls:0, effectVoices:0 }); assert.deepEqual(errors, []);
  report.ok = true; console.log(JSON.stringify(report, null, 2));
} finally {
  try { if (targetId) await command('Target.closeTarget', { targetId }, true); if (browserContextId) await command('Target.disposeBrowserContext', { browserContextId }, true); } catch {}
  socket.close();
}
