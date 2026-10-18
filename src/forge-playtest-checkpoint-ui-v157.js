import { inspectForgePlaytestCheckpointV157 } from './forge-playtest-checkpoint-v157.js';

/** The application owns navigation. This UI only admits the local record and
 * passes it to resumePlaytest; it never opens a campaign, writes an authoring
 * document, starts an engine or grants a reward. */
export function mountForgePlaytestCheckpointUIV157({ document: doc = globalThis.document, roots = [],
  store, getProject, getEngine, resumePlaytest, isVisible = () => true, onMessage = () => {} } = {}) {
  if (!doc || !store || typeof getProject !== 'function' || typeof getEngine !== 'function'
    || typeof resumePlaytest !== 'function') return null;
  let busy = false, dead = false, message = 'Un checkpoint local de playtest. Le plan et la campagne gardent leurs sauvegardes séparées.';
  let error = false;
  const sections = [], removers = [];
  const update = () => {
    if (dead) return;
    let present = false;
    try { present = store.raw() !== null; } catch { /* Action reports the storage error explicitly. */ }
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
  const run = async action => {
    if (busy || dead) return false;
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
    finally { busy = false; update(); }
  };
  for (const root of roots.filter(Boolean)) {
    const section = doc.createElement('section');
    section.className = 'panel forge-checkpoint-v157';
    section.setAttribute('aria-label', 'Checkpoint local du playtest Forge');
    const heading = doc.createElement('h3'); heading.textContent = 'CHECKPOINT DU PLAYTEST'; section.append(heading);
    const actions = doc.createElement('div'); actions.className = 'button-row';
    for (const [action, label] of [['save', 'Sauvegarder le playtest'], ['resume', 'Reprendre le playtest'], ['clear', 'Effacer le checkpoint']]) {
      const button = doc.createElement('button'); button.type = 'button'; button.className = 'button'; button.textContent = label;
      button.dataset.forgeCheckpointV157 = action;
      const listener = () => { void run(action); };
      button.addEventListener('click', listener); removers.push(() => button.removeEventListener('click', listener));
      actions.append(button);
    }
    section.append(actions);
    const note = doc.createElement('p');
    note.textContent = 'Local à cet appareil · un emplacement · même plan et même équipement. Sauvegardez au sol, récit fermé, après les rechargements, déploiements et transits. Aucun transfert cloud.';
    section.append(note);
    const status = doc.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); section.append(status);
    root.append(section); sections.push({ root, section, status });
  }
  update();
  const timer = globalThis.setInterval(update, 500);
  return { refresh: update, run, destroy() { dead = true; globalThis.clearInterval(timer); removers.forEach(remove => remove()); sections.forEach(({ section }) => section.remove()); } };
}
