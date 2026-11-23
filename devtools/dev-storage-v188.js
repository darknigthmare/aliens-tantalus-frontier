// Developer tools (spec 012): isolated storage for a dev session.
// The builder and the dev server inline this file as the FIRST script of index.html,
// wrapped in the exact dev-query test (scripts/build-dev-tools-v188.mjs), so it runs on
// `?atf-dev=v188` before any game script and never otherwise. The page's `localStorage`
// is replaced by an in-memory store seeded from this tab's dev session (sessionStorage);
// `indexedDB` (field photo gallery) is withheld. The player's real profiles are neither
// read nor written; closing the tab or « Quitter » drops the session.
// Full-line comments are removed when inlined: keep every comment on its own line.
(function installDevStorageV188() {
  'use strict';
  if (window.__ATF_DEV_SESSION_V188__) return;
  var SESSION_KEY = 'atf-dev-session-v188';
  var session = null;
  try { session = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (error) { session = null; }
  if (!session || typeof session !== 'object') session = null;
  var data = new Map();
  var seed = session && session.storage && typeof session.storage === 'object' ? session.storage : {};
  Object.keys(seed).forEach(function (key) { if (typeof seed[key] === 'string') data.set(key, seed[key]); });
  var writes = 0;
  function persist() {
    writes += 1;
    if (!session) return;
    var storage = {};
    data.forEach(function (value, key) { storage[key] = value; });
    session.storage = storage;
    try { window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (error) { /* Quota: the in-memory store still holds the session. */ }
  }
  var store = {
    get length() { return data.size; },
    key: function (index) { return Array.from(data.keys())[index] ?? null; },
    getItem: function (key) { key = String(key); return data.has(key) ? data.get(key) : null; },
    setItem: function (key, value) { data.set(String(key), String(value)); persist(); },
    removeItem: function (key) { data.delete(String(key)); persist(); },
    clear: function () { data.clear(); persist(); }
  };
  var isolated = false;
  try {
    Object.defineProperty(window, 'localStorage', { configurable: true, enumerable: true, get: function () { return store; } });
    isolated = window.localStorage === store;
  } catch (error) { isolated = false; }
  // Fail closed: a page that cannot be isolated does not run the game.
  if (!isolated) { try { window.stop(); } catch (error) { /* keep going */ } window.location.replace('about:blank'); return; }
  try { Object.defineProperty(window, 'indexedDB', { configurable: true, enumerable: true, get: function () { return undefined; } }); } catch (error) { /* the gallery then reports its own storage error */ }
  // Another tab writing the real profiles must not reach this session's profile guards.
  window.addEventListener('storage', function (event) { event.stopImmediatePropagation(); }, true);
  // The launcher that opened the session names its own directory (one same-origin segment).
  var base = session && typeof session.base === 'string' && /^\/[a-z0-9][a-z0-9-]{0,63}\/$/.test(session.base) ? session.base : null;
  window.__ATF_DEV_SESSION_V188__ = Object.freeze({
    active: Boolean(session),
    entryId: session && session.entryId || null,
    launch: session && session.launch || null,
    toggles: session && session.toggles || {},
    base: base,
    sessionKey: SESSION_KEY,
    isolated: true,
    get writes() { return writes; },
    // « Quitter »: later writes (pagehide autosave) must not bring the session back.
    discard: function () { session = null; try { window.sessionStorage.removeItem(SESSION_KEY); } catch (error) { /* ignore */ } },
    snapshotStorage: function () { var copy = {}; data.forEach(function (value, key) { copy[key] = value; }); return copy; }
  });
  document.documentElement.dataset.atfDevSession = session ? 'active' : 'empty';
  // The game's module scripts are deferred: they have run when the document is parsed.
  function afterGameScripts() {
    if (session && base) {
      var bridge = document.createElement('script');
      bridge.type = 'module'; bridge.src = base + 'dev-session-v188.js';
      document.head.appendChild(bridge);
      return;
    }
    var note = document.createElement('p');
    note.setAttribute('data-atf-dev-empty', 'v188');
    note.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483000;margin:0;padding:6px 10px;background:#0d1214;color:#d8e4e2;border:1px solid #f0b35a;font:12px/1.35 system-ui,sans-serif';
    note.textContent = 'Session de développement vide : stockage isolé, aucun profil réel lu ni écrit. Ouvrir une entrée depuis le lanceur. · Empty dev session: isolated storage.';
    document.body.appendChild(note);
  }
  if (typeof document.addEventListener === 'function') document.addEventListener('DOMContentLoaded', afterGameScripts, { once: true });
})();
