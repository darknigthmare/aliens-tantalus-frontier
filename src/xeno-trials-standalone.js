import { AudioDirector } from './audio.js';
import { installAutoTranslationV185 } from './i18n-auto-v185.js';
import { setLanguageV185 } from './i18n-v185.js';
import { APP_RELEASE_V143 } from './release-info-v143.js';
import { XenoTrialsUiV96 } from './xeno-trials-ui-v96.js';
import {
  createStandaloneTrialsStore,
  STANDALONE_TRIALS_SAVE_LIMIT,
  STANDALONE_TRIALS_STORAGE_KEY,
} from './xeno-trials-standalone-save.js';

const COPY = {
  fr: {
    unit: 'Liaison autonome',
    intro: 'Dispositif de simulation biologique',
    description: 'Un terminal MIRE récupéré donne accès aux simulations clandestines de Weyland-Yutani. Traversez la campagne, tenez face aux hordes et remontez jusqu’aux archives Arbiter.',
    settings: 'Paramètres et sauvegarde',
    language: 'Langue',
    music: 'Musique',
    effects: 'Effets sonores',
    motion: 'Réduire les animations',
    'save-explainer': 'La progression est enregistrée dans ce navigateur. Exportez un fichier pour la conserver ou la transférer.',
    export: 'Exporter la sauvegarde',
    import: 'Restaurer un fichier',
    replace: 'Remplacer la sauvegarde',
    play: 'Ouvrir le terminal',
    resume: 'Ouvrir la reprise',
    reload: 'Recharger la sauvegarde',
    stats: progress => `${progress.credits} crédits MIRE · ${progress.xp} XP · ${progress.unlocked.length} spécimens disponibles`,
    build: version => `Version ${version}`,
    development: 'Version de développement',
    imported: 'La sauvegarde a été restaurée.',
    'profile-unreadable': 'La sauvegarde locale est illisible. Restaurez un fichier Xeno Trials pour récupérer l’accès au terminal.',
    'profile-changed': 'La sauvegarde a changé dans un autre onglet. Rechargez pour continuer.',
    'storage-unavailable': 'Ce navigateur ne permet pas d’accéder à la sauvegarde locale.',
    'backup-invalid': 'La restauration a échoué. Vérifiez que le fichier est une sauvegarde Xeno Trials valide.',
    'save-failed': 'Impossible d’enregistrer les réglages. Les réglages précédents ont été conservés.',
  },
  en: {
    unit: 'Standalone terminal',
    intro: 'Biological simulation device',
    description: 'A recovered MIRE terminal opens Weyland-Yutani’s clandestine simulations. Complete the campaign, survive the hordes, and trace the results back to the Arbiter archives.',
    settings: 'Settings and save',
    language: 'Language',
    music: 'Music',
    effects: 'Sound effects',
    motion: 'Reduce motion',
    'save-explainer': 'Progress is saved in this browser. Export a backup to keep it or move it to another device.',
    export: 'Export save',
    import: 'Restore a backup',
    replace: 'Replace local save',
    play: 'Open the terminal',
    resume: 'Open saved evaluation',
    reload: 'Reload the save',
    stats: progress => `${progress.credits} MIRE credits · ${progress.xp} XP · ${progress.unlocked.length} specimens available`,
    build: version => `Build ${version}`,
    development: 'Development build',
    imported: 'Backup restored.',
    'profile-unreadable': 'The local save is unreadable. Restore a Xeno Trials backup to regain terminal access.',
    'profile-changed': 'The save changed in another tab. Reload to continue.',
    'storage-unavailable': 'This browser cannot access the local save.',
    'backup-invalid': 'Restoring failed. Check that the file is a valid Xeno Trials backup.',
    'save-failed': 'Could not save the settings. Your previous settings are still in effect.',
  },
};

function localSaveStorage() {
  try { return window.localStorage; } catch { return null; }
}

const store = createStandaloneTrialsStore(localSaveStorage());
const audio = new AudioDirector();
const el = id => document.querySelector(`[data-xts="${id}"]`);
const root = document.getElementById('xeno-trials-v96');
const launcher = el('launcher');
const controls = el('settings').elements;
let playing = false;
let importing = false;
let notification = null;

function applyPreferences() {
  const settings = store.settings();
  setLanguageV185(settings.language, { storage: null, persist: false });
  audio.setVolumes({ music: settings.music / 100, effects: settings.effects / 100 });
  document.documentElement.classList.toggle('xts-reduced-motion', settings.reducedMotion);
  controls.language.value = settings.language;
  controls.music.value = String(settings.music);
  controls.effects.value = String(settings.effects);
  controls.reducedMotion.checked = settings.reducedMotion;
}

function renderLauncher() {
  const copy = COPY[store.settings().language];
  const issue = store.issue;
  const progress = store.progress();
  for (const node of launcher.querySelectorAll('[data-xts-copy]')) node.textContent = copy[node.dataset.xtsCopy];
  el('build').textContent = APP_RELEASE_V143.builtAt ? copy.build(APP_RELEASE_V143.displayVersion) : copy.development;
  el('play').textContent = copy[progress.pending ? 'resume' : 'play'];
  el('play').disabled = Boolean(issue) || importing;
  el('stats').textContent = issue ? '' : copy.stats(progress);
  el('status').textContent = copy[notification ?? issue] ?? '';
  el('reload').hidden = issue !== 'profile-changed';
  el('settings-fields').disabled = Boolean(issue) || importing;
  el('export').disabled = Boolean(issue) || importing;
  el('import').disabled = importing || issue === 'storage-unavailable' || issue === 'profile-changed';
  if (store.hasSave) el('import').textContent = copy.replace;
}

function returnToLauncher({ close = false } = {}) {
  playing = false;
  if (close) trials.close();
  root.classList.remove('active');
  root.hidden = true;
  launcher.hidden = false;
  void audio.setScene('menu');
  renderLauncher();
  const target = store.issue === 'profile-changed' ? el('reload') : el('play');
  target.focus({ preventScroll: true });
}

const trials = new XenoTrialsUiV96({
  root,
  getProgress: store.progress,
  canCommit: () => playing && !store.issue,
  onCommit: store.commitProgress,
  onReturn: returnToLauncher,
  audioDirector: audio,
  standaloneV207: true,
  getReducedMotion: () => store.settings().reducedMotion,
});

function verifyOwnership() {
  if (store.issue !== 'storage-unavailable' && store.isCurrent()) return true;
  notification = null;
  returnToLauncher({ close: playing });
  return false;
}

el('play').addEventListener('click', () => {
  if (playing || importing || store.issue || !verifyOwnership()) return;
  notification = null;
  playing = true;
  launcher.hidden = true;
  root.hidden = false;
  root.classList.add('active');
  void audio.unlock();
  trials.open();
  if (!store.progress().pending) trials.showHomeV119();
  root.querySelector('[data-xt="return"]').focus({ preventScroll: true });
});

el('settings').addEventListener('submit', event => event.preventDefault());
el('settings').addEventListener('change', () => {
  try {
    store.commitSettings({
      language: controls.language.value,
      music: controls.music.valueAsNumber,
      effects: controls.effects.valueAsNumber,
      reducedMotion: controls.reducedMotion.checked,
    });
    notification = null;
  } catch { notification = store.issue ? null : 'save-failed'; }
  applyPreferences();
  renderLauncher();
});

el('export').addEventListener('click', () => {
  if (!verifyOwnership() || store.issue) return;
  const backup = new Blob([store.exportBackup()], { type: 'application/json' });
  const url = URL.createObjectURL(backup);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'xeno-trials-sauvegarde.json';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

el('import').addEventListener('click', () => el('file').click());
el('file').addEventListener('change', async event => {
  const input = event.currentTarget;
  const file = input.files[0];
  input.value = '';
  if (!file || playing || importing) return;
  importing = true;
  renderLauncher();
  try {
    if (file.size > STANDALONE_TRIALS_SAVE_LIMIT) throw new Error('profile-size');
    store.importBackup(await file.text());
    notification = 'imported';
    applyPreferences();
  } catch { notification = store.issue === 'profile-changed' ? null : 'backup-invalid'; }
  finally {
    importing = false;
    renderLauncher();
    if (!store.issue) el('status').scrollIntoView({ block: 'nearest' });
  }
});

el('reload').addEventListener('click', () => window.location.reload());
window.addEventListener('storage', event => {
  if (event.key === STANDALONE_TRIALS_STORAGE_KEY || event.key === null) verifyOwnership();
});
window.addEventListener('pageshow', event => {
  if (event.persisted) verifyOwnership();
});

applyPreferences();
installAutoTranslationV185();
renderLauncher();
void audio.setScene('menu');

window.__ATF_XENO_TRIALS_STANDALONE__ = Object.freeze({
  profile: store.profile,
  snapshot: () => {
    const live = trials.runtime?.getState();
    return live ? JSON.parse(JSON.stringify(live)) : null;
  },
});

const worker = document.querySelector('meta[name="xeno-trials-worker"]')?.content;
if (worker === '/sw.js') void navigator.serviceWorker?.register(worker).catch(() => {});
