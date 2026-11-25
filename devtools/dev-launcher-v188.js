// Developer tools (spec 012): the launcher page (devtools/index.html; hidden directory in a build).
// It writes only to sessionStorage (this tab) and opens the isolated game page.
import { buildDevCatalogV188, filterDevCatalogV188, DEV_CATEGORIES_V188 } from './dev-catalog-v188.js';
import { buildDevSessionV188, DEV_SESSION_KEY_V188 } from './dev-fixtures-v188.js';

export const DEV_GAME_URL_V188 = '/?atf-dev=v188';
export const DEV_BASE_PATH_V188 = new URL('./', import.meta.url).pathname;
const TOGGLES = [['godMode', 'Mode dieu'], ['infiniteAmmo', 'Munitions infinies'], ['reveal', 'Révéler carte et hostiles'], ['noSpawns', 'Aucune apparition'],
  ['colliders', 'Afficher les collisions'], ['places', 'Afficher lieux et checkpoints'], ['spawnZones', 'Afficher les zones d’apparition'], ['footLine', 'Ligne des pieds et attaches']];
const catalog = buildDevCatalogV188();
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let prefs = { language: 'fr', difficulty: 'standard', category: '', query: '', toggles: {} };
try { prefs = { ...prefs, ...JSON.parse(sessionStorage.getItem('atf-dev-launcher-prefs-v188') || '{}') }; } catch { /* defaults */ }
const savePrefs = () => { try { sessionStorage.setItem('atf-dev-launcher-prefs-v188', JSON.stringify(prefs)); } catch { /* ignore */ } };

for (const category of DEV_CATEGORIES_V188) $('[data-dev-category]').insertAdjacentHTML('beforeend',
  `<option value="${category.id}">${escapeHtml(category.fr)} (${catalog.filter(entry => entry.category === category.id).length})</option>`);
for (const [key, label] of TOGGLES) $('[data-dev-toggles]').insertAdjacentHTML('beforeend',
  `<label><input type="checkbox" data-dev-toggle="${key}"${prefs.toggles[key] ? ' checked' : ''}> ${escapeHtml(label)}</label>`);
$('[data-dev-toggles]').insertAdjacentHTML('beforeend', `<label>Vitesse <select data-dev-timescale>${[0.1, 0.25, 0.5, 1, 1.5, 2]
  .map(v => `<option value="${v}"${Number(prefs.toggles.timeScale || 1) === v ? ' selected' : ''}>×${v}</option>`).join('')}</select></label>`);
// Phone-size screens: the options fold under their title so the catalogue stays one swipe away.
$('[data-dev-options]').open = !globalThis.matchMedia?.('(max-width: 640px)').matches || Object.values(prefs.toggles).some(value => value === true);
$('[data-dev-language]').value = prefs.language; $('[data-dev-difficulty]').value = prefs.difficulty;
$('[data-dev-category]').value = prefs.category; $('[data-dev-search]').value = prefs.query;

function render() {
  const items = filterDevCatalogV188(catalog, { query: prefs.query, category: prefs.category });
  const lang = prefs.language === 'en' ? 'en' : 'fr';
  $('[data-dev-count]').textContent = `${items.length} / ${catalog.length} entrées`;
  const groups = DEV_CATEGORIES_V188.map(category => [category, items.filter(entry => entry.category === category.id)]).filter(([, list]) => list.length);
  $('[data-dev-catalog]').innerHTML = groups.map(([category, list]) => `<section class="atf-dev-group"><h2>${escapeHtml(category[lang])} <small>${list.length}</small></h2><ul>${
    list.slice(0, 600).map(entry => `<li><button type="button" class="atf-dev-launch" data-dev-launch="${escapeHtml(entry.id)}"${entry.blocked ? ' disabled' : ''}
      title="${escapeHtml(entry.blocked || entry.sceneId)}"><span>${escapeHtml(entry.label[lang])}</span><code>${escapeHtml(entry.sceneId)}</code></button>${entry.blocked ? `<em>${escapeHtml(entry.blocked)}</em>` : ''}</li>`).join('')}</ul></section>`).join('');
}
function launch(id) {
  const entry = catalog.find(item => item.id === id);
  if (!entry) return;
  const toggles = { ...prefs.toggles, timeScale: Number(prefs.toggles.timeScale || 1) };
  try {
    const session = buildDevSessionV188(entry, { language: prefs.language, difficulty: prefs.difficulty, toggles });
    // The isolated game page loads the session bridge from this launcher's own directory.
    session.base = DEV_BASE_PATH_V188;
    sessionStorage.setItem(DEV_SESSION_KEY_V188, JSON.stringify(session));
    globalThis.__ATF_DEV_LAUNCHER_V188__.last = { entryId: entry.id, sceneId: entry.sceneId, injections: session.injections, completed: session.completed.length };
    location.assign(DEV_GAME_URL_V188);
  } catch (error) {
    $('[data-dev-count]').textContent = `Échec de la fixture ${entry.id} : ${error.message}`;
  }
}
$('[data-dev-search]').addEventListener('input', event => { prefs.query = event.target.value; savePrefs(); render(); });
$('[data-dev-category]').addEventListener('change', event => { prefs.category = event.target.value; savePrefs(); render(); });
$('[data-dev-language]').addEventListener('change', event => { prefs.language = event.target.value; savePrefs(); render(); });
$('[data-dev-difficulty]').addEventListener('change', event => { prefs.difficulty = event.target.value; savePrefs(); });
$('[data-dev-toggles]').addEventListener('change', event => {
  if (event.target.matches('[data-dev-toggle]')) prefs.toggles[event.target.dataset.devToggle] = event.target.checked;
  if (event.target.matches('[data-dev-timescale]')) prefs.toggles.timeScale = Number(event.target.value);
  savePrefs();
});
$('[data-dev-catalog]').addEventListener('click', event => { const button = event.target.closest('[data-dev-launch]'); if (button && !button.disabled) launch(button.dataset.devLaunch); });
globalThis.__ATF_DEV_LAUNCHER_V188__ = { catalog, launch, last: null };
render();
