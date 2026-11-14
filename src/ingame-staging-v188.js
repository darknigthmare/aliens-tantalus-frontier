// V188 — in-game staging (bible §56.11): short directed moments played over
// the live hub level, never a cut to another screen. Cinemascope bars slide
// in, the picture can be graded (hypersleep blur, rain, alarm), subtitles
// carry the lines, then control returns. The world keeps running; only the
// player's input is held. Enter / Space / E advance, Escape skips. Each beat
// plays once per campaign (storyCampaignV188.beatsSeen) and grants nothing.

const t = (fr, en) => Object.freeze({ fr, en });
const say = (speaker, crewId, fr, en, { radio = false, seconds = 5.5 } = {}) => Object.freeze({ speaker, crewId, text: t(fr, en), radio, seconds });
const sound = (fr, en, seconds = 3.2) => Object.freeze({ speaker: null, crewId: null, text: t(fr, en), sound: true, seconds });

// `place` ties each beat to where it plays in the game (descriptive, read by the
// coherence test): the capsule Echo-9 confirms in the hub cryo bay
// (hub-onboarding-v84 wake contact), the proving-ground console, and the
// Port-Méridien quay posts (port-meridien-v90 PORT_POSTS_V90).
export const STAGED_BEATS_V188 = Object.freeze({
  // P-1: out of hypersleep in capsule 03, before control is given (texts [PROPOSÉ] §56.11).
  'beat-wake': Object.freeze({ id: 'beat-wake', grade: 'hypersleep', place: Object.freeze({ scene: 'hub', roomId: 'cryo-bay', prop: 'capsule-03', x: 4736 }), terminal: t('MU/TH/UR · RELÈVE ECHO-9 · CAPSULE 03 · RÉVEIL D’URGENCE', 'MU/TH/UR · ECHO-9 RELIEF · CAPSULE 03 · EMERGENCY WAKE'), lines: Object.freeze([
    sound('[La capsule siffle. Le givre fond sur la verrière.]', '[The capsule hisses. Frost melts on the canopy.]', 3.6),
    say('TANTALUS · JOURNAL DE BORD', null, 'Relève Echo-9 sortie d’hypersommeil. Fonctions vitales stables. Confirmez votre réveil au poste de cryostase.',
      'Echo-9 relief out of hypersleep. Vital signs stable. Confirm your wake at the cryostasis station.', { seconds: 6.5 })
  ]) }),
  // P-2: the priority signal forces the link in the middle of the qualification.
  'beat-exercise-interrupt': Object.freeze({ id: 'beat-exercise-interrupt', grade: 'alert', place: Object.freeze({ scene: 'hub', annexId: 'proving-ground', prop: 'range-console' }), lines: Object.freeze([
    say('ROOK · PASSERELLE', 'crew-06-rook', 'Velez, un signal prioritaire force la liaison. Il demande la console du pas de tir.',
      'Velez, a priority signal is forcing the link. It wants the firing-range console.', { radio: true }),
    say('TAMSIN VELEZ', 'crew-02-tamsin-velez', 'Echo-9, arme au repos. Rejoignez la console.', 'Echo-9, weapon down. Get to the console.', { seconds: 4 })
  ]) }),
  // P-3: the ramp touches down on the south quay, in the rain.
  'beat-port-arrival': Object.freeze({ id: 'beat-port-arrival', grade: 'rain', place: Object.freeze({ scene: 'port-meridien', post: 'unload', prop: 'quay-ramp', x: 220 }), lines: Object.freeze([
    sound('[Les vérins de la rampe. La pluie sur la tôle.]', '[The ramp actuators. Rain on the plating.]', 3.2),
    say('TAMSIN VELEZ', 'crew-02-tamsin-velez', 'Rampe au sol. Echo-9, le quai est à vous. Trouvez qui tient encore ce port.',
      'Ramp down. Echo-9, the quay is yours. Find out who is still holding this port.', { radio: true })
  ]) }),
  // P-3: the report contradicts the port's automatic beacon.
  'beat-port-report': Object.freeze({ id: 'beat-port-report', grade: 'rain', place: Object.freeze({ scene: 'port-meridien', post: 'report', prop: 'port-report', x: 2310 }), lines: Object.freeze([
    say('ROOK · PASSERELLE', 'crew-06-rook', 'La balise automatique du port annonce toujours « aucun survivant ». Elle se trompe de trois.',
      'The port’s automatic beacon still reports “no survivors”. It is wrong by three.', { radio: true }),
    say('TAMSIN VELEZ', 'crew-02-tamsin-velez', 'Notez-le. Tout ce qui ment ici finira dans le rapport.', 'Log it. Everything that lies here ends up in the report.', { radio: true, seconds: 4.5 })
  ]) })
});
export const STAGED_BEAT_IDS_V188 = Object.freeze(Object.keys(STAGED_BEATS_V188));

export function stagedBeatDurationV188(id) {
  return (STAGED_BEATS_V188[id]?.lines || []).reduce((sum, entry) => sum + entry.seconds, 0);
}

const HOLD_KEYS = new Set(['KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyQ', 'KeyF', 'KeyR', 'KeyC', 'KeyZ', 'KeyX', 'KeyV', 'KeyH', 'KeyP', 'KeyM',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ShiftLeft', 'ShiftRight', 'Tab']);
const ADVANCE_KEYS = new Set(['Enter', 'NumpadEnter', 'Space', 'KeyE']);

export class InGameStagingV188 {
  constructor({ document: documentRef = globalThis.document, setTimer = (fn, ms) => globalThis.setTimeout(fn, ms), clearTimer = id => globalThis.clearTimeout(id),
    target = globalThis } = {}) {
    Object.assign(this, { documentRef, setTimer, clearTimer, target }); this.active = null;
  }

  get playing() { return Boolean(this.active); }

  /** Plays a beat over `host` (the level's frame). Resolves 'complete' or 'skipped'. */
  play(id, { host, language = 'fr', reducedMotion = false, onHold = () => {}, onRelease = () => {} } = {}) {
    const beat = STAGED_BEATS_V188[id];
    if (!beat || !host || !this.documentRef?.createElement) return Promise.resolve('unavailable');
    this.stop('replaced');
    const lang = language === 'en' ? 'en' : 'fr', doc = this.documentRef;
    const root = doc.createElement('div'); root.className = 'ingame-stage-v188'; root.dataset.beat = id; root.dataset.phase = 'in';
    root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
    root.setAttribute('role', 'region'); root.setAttribute('aria-live', 'polite');
    root.setAttribute('aria-label', lang === 'en' ? 'Scene in progress — Enter: next, Escape: skip' : 'Scène en cours — Entrée : suite, Échap : passer');
    const bars = ['top', 'bottom'].map(side => { const bar = doc.createElement('div'); bar.className = `ingame-stage-v188__bar ingame-stage-v188__bar--${side}`; return bar; });
    const terminal = doc.createElement('p'); terminal.className = 'ingame-stage-v188__terminal';
    const subtitle = doc.createElement('div'); subtitle.className = 'ingame-stage-v188__subtitle';
    const speaker = doc.createElement('p'); speaker.className = 'ingame-stage-v188__speaker';
    const text = doc.createElement('p'); text.className = 'ingame-stage-v188__text';
    const hint = doc.createElement('p'); hint.className = 'ingame-stage-v188__hint'; hint.textContent = lang === 'en' ? 'ENTER: NEXT · ESC: SKIP' : 'ENTRÉE : SUITE · ÉCHAP : PASSER';
    subtitle.append(speaker, text); root.append(...bars, terminal, subtitle, hint);
    if (beat.terminal) terminal.textContent = beat.terminal[lang]; else terminal.hidden = true;
    host.append(root);
    const html = doc.documentElement; if (html?.dataset) html.dataset.ingameStageV188 = id; // hides the level's HUD chrome
    if (beat.grade) host.dataset.stageGradeV188 = `${beat.grade}-start`;
    onHold();
    return new Promise(resolve => {
      const state = { id, root, host, index: -1, timer: null, done: false };
      const finish = reason => {
        if (state.done) return; state.done = true; this.clearTimer(state.timer);
        this.target.removeEventListener?.('keydown', onKey, true);
        root.dataset.phase = 'out'; if (host.dataset.stageGradeV188) host.dataset.stageGradeV188 = `${beat.grade}-end`;
        state.timer = this.setTimer(() => { root.remove?.(); delete host.dataset.stageGradeV188; }, reducedMotion ? 0 : 700);
        if (html?.dataset) delete html.dataset.ingameStageV188;
        this.active = null; onRelease(); resolve(reason);
      };
      const show = index => {
        state.index = index; const entry = beat.lines[index];
        if (!entry) return finish('complete');
        speaker.textContent = entry.speaker || ''; speaker.hidden = !entry.speaker;
        speaker.dataset.radio = entry.radio ? 'true' : 'false'; text.dataset.sound = entry.sound ? 'true' : 'false';
        text.textContent = entry.text[lang]; subtitle.dataset.line = String(index);
        if (index === 0 && beat.grade) host.dataset.stageGradeV188 = `${beat.grade}-mid`;
        this.clearTimer(state.timer); state.timer = this.setTimer(() => show(index + 1), entry.seconds * 1000);
      };
      const onKey = event => {
        if (event.code === 'Escape') { event.preventDefault?.(); event.stopImmediatePropagation?.(); return finish('skipped'); }
        if (ADVANCE_KEYS.has(event.code)) { event.preventDefault?.(); event.stopImmediatePropagation?.(); if (!event.repeat) show(state.index + 1); return; }
        if (HOLD_KEYS.has(event.code)) { event.preventDefault?.(); event.stopImmediatePropagation?.(); }
      };
      this.target.addEventListener?.('keydown', onKey, true);
      state.finish = finish; this.active = state;
      // Bars slide in first; the first line follows.
      state.timer = this.setTimer(() => { root.dataset.phase = 'on'; show(0); }, reducedMotion ? 0 : 450);
    });
  }

  stop(reason = 'stopped') { this.active?.finish?.(reason); }
}
