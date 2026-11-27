import { createXenoTrialsResearchLabV209, getXenoTrialsResearchLabViewV209, setXenoTrialsResearchLabPausedV209,
  stepXenoTrialsResearchLabV209, XENO_TRIALS_RESEARCH_LABS_V209 } from './xeno-trials-research-lab-v209.js';

const KEY = Object.freeze({ ArrowLeft: 'left', KeyQ: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', KeyE: 'interact' });
const percent = value => `${value / 10}%`;
const position = (node, value) => { node.style.insetInlineStart = percent(value); };

export function createXenoTrialsResearchLabRuntimeV209(panel, id, { onComplete, onLeave }) {
  const entry = XENO_TRIALS_RESEARCH_LABS_V209.find(lab => lab.id === id);
  const lab = createXenoTrialsResearchLabV209(id);
  if (!lab) return null;
  const doc = panel.ownerDocument, host = doc.defaultView;
  const held = new Map(), pointers = new Map(), labels = new WeakMap(), listeners = [];
  let frame = null, lastTime = null, stopped = false, notified = false, saveFailed = false, gamepadNeutral = true;
  panel.innerHTML = `<section class="xt-lab-v209" data-lab="${id}" tabindex="-1">
    <header><h2>${entry.title}</h2><span data-lab-view="clock" role="timer" aria-label="Secondes restantes"></span></header>
    <p>${entry.instruction}</p>
    <div class="xt-lab-track-v209" aria-hidden="true">
      ${id === 'OVOMORPH' ? '<span class="xt-lab-zone-v209"></span>' : ''}
      ${id === 'OVOMORPH' ? `<div class="xt-lab-atlas-v209"><img data-lab-specimen alt="" src="${entry.art}"></div>`
        : entry.art ? `<img class="xt-lab-specimen-v209" data-lab-specimen alt="" src="${entry.art}">`
          : '<span class="xt-lab-echo-v209" data-lab-view="echo"></span>'}
      ${entry.gates?.map((value, index) => `<span class="xt-lab-gate-v209" data-lab-gate="${index}" style="inset-inline-start:${percent(value)}"></span>`).join('') || ''}
      ${entry.sites.map((value, index) => `<span class="xt-lab-site-v209" data-lab-site="${index}" style="inset-inline-start:${percent(value)}">${index + 1}</span>`).join('')}
      <span class="xt-lab-operator-v209" data-lab-view="operator"></span>
    </div>
    <div class="xt-lab-readings-v209"><p data-lab-view="status" role="status"></p><progress data-lab-view="total" max="3" value="0" aria-label="Objectifs de laboratoire"></progress>
      <progress data-lab-view="work" max="1" value="0" aria-label="Action en cours" ${entry.gates ? 'hidden' : ''}></progress></div>
    <p class="xt-help">Q/D ou flèches · E pour interagir · P ou Échap pour la pause · Croix ou stick et A à la manette.</p>
    <div class="xt-actions xt-lab-buttons-v209">
      <button type="button" class="button" data-lab-input="left" aria-label="Aller à gauche">←</button>
      <button type="button" class="button" data-lab-input="right" aria-label="Aller à droite">→</button>
      <button type="button" class="button primary" data-lab-input="interact">INTERAGIR</button>
      <button type="button" class="button" data-lab-view="pause">PAUSE</button>
      <button type="button" class="button" data-lab-view="leave">RETOUR AUX ATELIERS</button>
    </div>
  </section>`;
  const screen = panel.firstElementChild;
  const el = key => screen.querySelector(`[data-lab-view="${key}"]`);
  const sites = [...screen.querySelectorAll('[data-lab-site]')], gates = [...screen.querySelectorAll('[data-lab-gate]')];
  const buttons = [...screen.querySelectorAll('[data-lab-input]')];
  function write(node, text) {
    if (labels.get(node) === text) return;
    labels.set(node, text);
    node.textContent = text;
  }
  function listen(target, type, handler) {
    target.addEventListener(type, handler);
    listeners.push(() => target.removeEventListener(type, handler));
  }
  function render() {
    const view = getXenoTrialsResearchLabViewV209(lab);
    screen.setAttribute('data-phase', view.phase);
    screen.setAttribute('data-paused', String(view.paused));
    position(el('operator'), view.position);
    if (entry.gates) position(el('echo'), view.echo);
    for (const [index, site] of sites.entries()) site.setAttribute('data-state', index < view.stage ? 'done' : index === view.stage ? 'target' : 'waiting');
    for (const [index, gate] of gates.entries()) gate.setAttribute('data-open', String(index < view.stage));
    el('total').value = view.stage;
    el('work').value = id === 'OVOMORPH' && view.inZone ? view.stress / 100 : view.work;
    write(el('clock'), String(view.seconds));
    const status = view.paused ? 'SIMULATION EN PAUSE' : view.phase === 'complete' ? saveFailed ? 'OBSERVATION VALIDÉE · SAUVEGARDE REFUSÉE' : 'OBSERVATION VALIDÉE'
      : view.phase === 'retry' ? view.reason === 'wake' ? 'VEILLE ROMPUE · RECOMMENCER' : 'TEMPS ÉCOULÉ · RECOMMENCER'
        : id === 'OVOMORPH' ? view.inZone ? 'ZONE DE VEILLE · CIRCULEZ' : 'CALIBRER LA BALISE SIGNALÉE'
          : id === 'ROMULUS-COCOON' ? view.scannerOpen ? 'FENÊTRE OUVERTE · MAINTENIR INTERAGIR' : 'FENÊTRE FERMÉE'
            : view.stage < sites.length ? 'OUVRIR LE SAS SIGNALÉ' : 'TRANSIT DE L’ÉCHO EN COURS';
    write(el('status'), status);
    write(el('pause'), view.phase === 'active' ? view.paused ? 'REPRENDRE' : 'PAUSE' : 'RECOMMENCER L’ATELIER');
    buttons.forEach(button => { button.disabled = view.paused || view.phase !== 'active'; });
  }
  function clearInputs() { held.clear(); pointers.clear(); gamepadNeutral = true; }
  function input() {
    const result = {};
    for (const action of held.values()) result[action] = true;
    for (const action of pointers.values()) result[action] = true;
    const pad = Array.from(host.navigator.getGamepads?.() ?? []).find(candidate => candidate?.mapping === 'standard');
    if (pad) {
      const left = pad.axes[0] < -.35 || pad.buttons[14]?.pressed === true;
      const right = pad.axes[0] > .35 || pad.buttons[15]?.pressed === true;
      const interact = pad.buttons[0]?.pressed === true;
      if (gamepadNeutral) gamepadNeutral = left || right || interact;
      else {
        if (left) result.left = true;
        if (right) result.right = true;
        if (interact) result.interact = true;
      }
    }
    return result;
  }
  function schedule() { if (!stopped && lab.phase === 'active' && !lab.paused && frame === null) frame = host.requestAnimationFrame(step); }
  function step(time) {
    frame = null;
    if (stopped || lab.paused) return;
    if (doc.hidden || !doc.hasFocus()) { pause(); return; }
    if (lastTime !== null) stepXenoTrialsResearchLabV209(lab, (time - lastTime) / 1000, input());
    lastTime = time;
    render();
    if (lab.phase === 'complete' && !notified) { notified = true; saveFailed = onComplete?.(id) === false; render(); }
    schedule();
  }
  function pause() {
    if (!setXenoTrialsResearchLabPausedV209(lab, true)) return;
    clearInputs();
    if (frame !== null) host.cancelAnimationFrame(frame);
    frame = null; lastTime = null;
    render();
  }
  function toggle() {
    if (!doc.hasFocus() || doc.hidden) return;
    if (lab.phase !== 'active') {
      Object.assign(lab, createXenoTrialsResearchLabV209(id));
      notified = saveFailed = false; lastTime = null; clearInputs(); render(); schedule();
    } else if (lab.paused) {
      setXenoTrialsResearchLabPausedV209(lab, false);
      screen.focus({ preventScroll: true }); schedule(); render();
    } else pause();
  }
  listen(host, 'blur', pause);
  listen(doc, 'visibilitychange', () => { if (doc.hidden) pause(); });
  listen(doc, 'focusin', event => { if (!screen.contains(event.target)) pause(); });
  listen(host, 'keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || !screen.contains(doc.activeElement)) return;
    if (['Escape', 'KeyP'].includes(event.code)) { event.preventDefault(); if (!event.repeat) toggle(); return; }
    const action = KEY[event.code];
    if (!action || lab.paused || lab.phase !== 'active') return;
    event.preventDefault();
    if (!event.repeat) held.set(event.code, action);
  });
  listen(host, 'keyup', event => held.delete(event.code));
  for (const button of buttons) {
    listen(button, 'pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      pointers.set(event.pointerId, button.dataset.labInput);
      try { button.setPointerCapture?.(event.pointerId); } catch {}
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) listen(button, type, event => pointers.delete(event.pointerId));
    listen(button, 'keydown', event => { if (['Enter', 'Space'].includes(event.code)) { event.preventDefault(); if (!event.repeat) held.set(event.code, button.dataset.labInput); } });
    listen(button, 'blur', () => { held.delete('Enter'); held.delete('Space'); });
  }
  listen(el('pause'), 'click', toggle);
  listen(el('leave'), 'click', () => onLeave?.());
  const image = screen.querySelector('[data-lab-specimen]');
  if (image) listen(image, 'error', () => { image.hidden = true; });
  screen.focus({ preventScroll: true }); render(); schedule();
  return { focus: () => screen.focus({ preventScroll: true }), getState: () => getXenoTrialsResearchLabViewV209(lab), stop() {
    if (stopped) return;
    stopped = true; clearInputs();
    if (frame !== null) host.cancelAnimationFrame(frame);
    for (const remove of listeners.splice(0)) remove();
    panel.replaceChildren();
  } };
}
