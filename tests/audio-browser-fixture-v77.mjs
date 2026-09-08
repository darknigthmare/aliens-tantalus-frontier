// This function runs in an isolated browser context. Its tiny PCM payload is
// constructed in memory and never enters the production asset directory.
export async function installAudioBrowserFixtureV77() {
  const { AudioDirector } = await import('/src/audio.js');
  const { emptyAudioManifestV77 } = await import('/src/audio-assets-v77.js');
  const bytes = new Uint8Array(844), view = new DataView(bytes.buffer);
  const ascii = (offset, text) => { for (let i = 0; i < text.length; i++) bytes[offset + i] = text.charCodeAt(i); };
  ascii(0, 'RIFF'); view.setUint32(4, 836, true); ascii(8, 'WAVEfmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true); view.setUint32(28, 16000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  ascii(36, 'data'); view.setUint32(40, 800, true);
  for (let i = 0; i < 400; i++) view.setInt16(44 + i * 2, Math.round(Math.sin(i * Math.PI / 10) * 500), true);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  const sha256 = [...digest].map(x => x.toString(16).padStart(2, '0')).join('');
  const manifest = emptyAudioManifestV77();
  for (const [kind, ids] of [['sfx', ['shot']], ['music', ['menu', 'hub', 'mission']]]) for (const id of ids) {
    manifest.tracks[kind][id].sources = [{ path: `/assets/audio/${kind}/${id}.wav`, mime: 'audio/wav', bytes: bytes.length, sha256 }];
  }
  const requests = [], createdUrls = new Set();
  function MutedNativeAudio() {
    const element = new Audio(); element.muted = true;
    const nativePlay = element.play.bind(element);
    element.play = async () => {
      await nativePlay();
      if (state.holdNextPlay) {
        state.holdNextPlay = false;
        await new Promise(resolve => { state.releaseHeldPlay = resolve; });
      }
    };
    return element;
  }
  const audio = new AudioDirector({ AudioCtor: MutedNativeAudio,
    fetchImpl: async url => {
      requests.push(url);
      return url.endsWith('manifest.json')
        ? new Response(JSON.stringify(manifest), { headers: { 'content-type': 'application/json' } })
        : new Response(bytes.slice(), { headers: { 'content-type': 'audio/wav' } });
    },
    urlApi: { createObjectURL(blob) { const url = URL.createObjectURL(blob); createdUrls.add(url); return url; },
      revokeObjectURL(url) { createdUrls.delete(url); URL.revokeObjectURL(url); } }
  });
  const state = { audio, requests, createdUrls, trustedGesture: false, unlockResolved: false, startedEffects: 0, error: null,
    holdNextPlay: false, releaseHeldPlay: null };
  globalThis.__AUDIO_QA_V77__ = state;
  const button = document.createElement('button'); button.id = 'audio-qa-activate';
  button.textContent = 'Activer la vérification audio';
  Object.assign(button.style, { position: 'fixed', zIndex: '2147483647', left: '20px', top: '20px', width: '320px', height: '80px' });
  document.body.append(button);
  button.addEventListener('click', async event => {
    state.trustedGesture = event.isTrusted;
    try {
      state.unlockResolved = await audio.unlock();
      // The test exercises native playback while keeping the user's speakers
      // silent: effects connect to a zero-gain bus, native media are muted.
      const silence = audio.context.createGain(); silence.gain.value = 0; silence.connect(audio.context.destination);
      audio.master.disconnect(); audio.master.connect(silence);
      const original = audio.context.createBufferSource.bind(audio.context);
      audio.context.createBufferSource = () => {
        const node = original(), start = node.start.bind(node);
        node.start = (...args) => { state.startedEffects++; return start(...args); }; return node;
      };
      await audio.setScene('menu');
    } catch (error) { state.error = error.message; }
  });
  await audio.prepare();
  return { hasContextBeforeGesture: Boolean(audio.context), realAudioFilesWritten: 0, fixtureBytes: bytes.length };
}
