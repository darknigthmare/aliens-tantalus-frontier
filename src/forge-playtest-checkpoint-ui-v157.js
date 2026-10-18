import { inspectForgePlaytestCheckpointV157 } from './forge-playtest-checkpoint-v157.js';

/** The application owns navigation. This UI only admits the local record and
 * passes it to resumePlaytest; it never opens a campaign, writes an authoring
 * document, starts an engine or grants a reward. */
export function mountForgePlaytestCheckpointUIV157({ document: doc = globalThis.document, roots = [],
  store, getProject, getEngine, resumePlaytest, isVisible = () => true, onMessage = () => {} } = {}) {
  if (!doc || !store || typeof getProject !== 'function' || typeof getEngine !== 'function'
    || typeof resumePlaytest !== 'function') return null;
  let busy = false, dead = false, message = 'Un checkpoint local de playtest. Le plan et la campagne gardent leurs sauvegardes séparées.';
  let error = false, present = false;
  const sections = [], removers = [];
  const refreshPresence = () => {
    if (dead) return;
    try { present = store.raw() !== null; } catch { present = false; /* Actions report storage failures explicitly. */ }
  };
  refreshPresence();
  const update = () => {
    if (dead) return;
    const engine = getEngine(), active = Boolean(engine?.running && engine.forgeSessionV141);
    for (const { root, section, status } of sections) {
      section.hidden = !isVisible(root);
      section.setAttribute('aria-busy', String(busy));
      status.textContent = message;
      status.dataset.error = String(error);
      section.querySelector('[data-forge-checkpoint-v157="save"]').disabled = busy || !active;
      section.querySelector('[data-forge-checkpoint-v157="resume"]').disabled = busy || !present;
      section.querySelector('[data-forge-checkpoint-v157="clear"]').disabled = busy || !present;
    }
  };
  const publish = (text, failed = false) => { message = text; error = failed; update(); onMessage(text, failed); };
  const run = async (action, origin = null) => {
    if (busy || dead) return false;
    const ownerEngine = getEngine(), ownerSession = ownerEngine?.forgeSessionV141;
    const ownedFocus = origin && doc.activeElement === origin.button;
    let focusMoved = false;
    const observedFocus = event => {
      if (event.target !== origin?.button && event.target !== doc.body && event.target !== doc.documentElement) focusMoved = true;
    };
    if (ownedFocus) doc.addEventListener?.('focusin', observedFocus, true);
    busy = true; update();
    try {
      if (action === 'save') {
        await store.save(getEngine());
        publish('Checkpoint de playtest enregistré sur cet appareil. Vous pouvez arrêter le test et le reprendre avec ce même plan.');
      } else if (action === 'resume') {
        const project = getProject();
        const raw = await store.read(project);
        const checkpoint = await inspectForgePlaytestCheckpointV157(raw, project);
        if (dead) return false;
        const result = await resumePlaytest({ project: checkpoint.project, raw, checkpoint });
        if (result?.applied !== true) throw new Error(result?.reason || 'Reprise non confirmée ; le checkpoint est conservé.');
        publish('Checkpoint de playtest repris. Blessures, munitions, salles et progression locale conservées.');
      } else if (action === 'clear') {
        store.clear();
        publish('Checkpoint de playtest effacé. Le plan et la campagne sont conservés.');
      } else return false;
      return true;
    } catch (cause) { publish(cause?.message || 'Action de checkpoint impossible.', true); return false; }
    finally {
      refreshPresence(); busy = false; update();
      if (ownedFocus) doc.removeEventListener?.('focusin', observedFocus, true);
      const currentEngine = getEngine(), active = doc.activeElement;
      const sameOwner = currentEngine === ownerEngine && currentEngine?.forgeSessionV141 === ownerSession;
      const visible = node => node?.isConnected !== false && (!node.getClientRects || node.getClientRects().length > 0);
      // Disabling the focused action can move focus to body in Chromium.
      // Return only the focus we owned, while the same playtest/view remains.
      // An intentional canvas focus, another control or navigation wins.
      if (ownedFocus && !dead && !focusMoved && sameOwner && isVisible(origin.root) && !origin.section.hidden
        && visible(origin.section) && doc.hasFocus?.() !== false
        && (!active || active === doc.body || active === doc.documentElement || active === origin.button)) {
        const target = !origin.button.disabled && visible(origin.button) ? origin.button : origin.summary;
        if (visible(target)) target.focus?.({ preventScroll: true });
      }
    }
  };
  for (const root of roots.filter(Boolean)) {
    const runtime = ['play', 'hub'].includes(root.dataset?.panel);
    const section = doc.createElement('section');
    section.className = `panel forge-checkpoint-v157${runtime ? ' forge-checkpoint-runtime-v157' : ''}`;
    section.setAttribute('aria-label', 'Checkpoint local du playtest Forge');
    const details = doc.createElement('details'); details.open = !runtime;
    const summary = doc.createElement('summary'); summary.className = 'button';
    summary.textContent = 'Checkpoint du playtest'; summary.setAttribute('data-forge-checkpoint-toggle-v157', '');
    details.append(summary);
    const controls = doc.createElement('div'); controls.className = 'forge-checkpoint-controls-v157';
    const actions = doc.createElement('div'); actions.className = 'button-row';
    for (const [action, label] of [['save', 'Sauvegarder le playtest'], ['resume', 'Reprendre le playtest'], ['clear', 'Effacer le checkpoint']]) {
      const button = doc.createElement('button'); button.type = 'button'; button.className = 'button'; button.textContent = label;
      button.dataset.forgeCheckpointV157 = action;
      const listener = () => { void run(action, { button, section, summary, root }); };
      button.addEventListener('click', listener); removers.push(() => button.removeEventListener('click', listener));
      actions.append(button);
    }
    controls.append(actions);
    const note = doc.createElement('p');
    note.textContent = 'Local à cet appareil · un emplacement · même plan et même équipement. Sauvegardez au sol, récit fermé, après les rechargements, déploiements et transits. Aucun transfert cloud.';
    controls.append(note);
    const status = doc.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    controls.append(status); details.append(controls); section.append(details);
    const toggle = () => {
      if (details.open && runtime) { const engine = getEngine(); engine?.clearGameplayInput?.(); engine?.keys?.clear(); }
    };
    const keydown = event => {
      // Preserve native disclosure/button/Tab behavior while focused commands
      // cannot leak movement, fire or E to the canvas behind the toolbar.
      event.stopPropagation();
      if (event.key === 'Escape' && details.open) { event.preventDefault(); details.open = false; summary.focus?.({ preventScroll: true }); }
    };
    const keyup = event => event.stopPropagation();
    details.addEventListener('toggle', toggle); section.addEventListener('keydown', keydown); section.addEventListener('keyup', keyup);
    removers.push(() => details.removeEventListener('toggle', toggle), () => section.removeEventListener('keydown', keydown), () => section.removeEventListener('keyup', keyup));
    root.append(section); sections.push({ root, section, status });
  }
  const storageTarget = doc.defaultView || globalThis;
  const storageChanged = event => {
    if (event.key !== null && event.key !== store.key) return;
    refreshPresence(); update();
  };
  storageTarget.addEventListener?.('storage', storageChanged);
  removers.push(() => storageTarget.removeEventListener?.('storage', storageChanged));
  update();
  const timer = globalThis.setInterval(update, 500);
  return { refresh: update, run, destroy() { dead = true; globalThis.clearInterval(timer); removers.forEach(remove => remove()); sections.forEach(({ section }) => section.remove()); } };
}
