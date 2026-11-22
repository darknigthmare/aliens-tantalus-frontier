// Developer tools (spec 012, source-only): isolated storage for a dev session.
// Injected by scripts/dev.mjs as the FIRST script of index.html, only for
// `/?atf-dev=v188` on the local dev server. Before any game script runs, the page's
// `localStorage` is replaced by an in-memory store seeded from this tab's dev session
// (sessionStorage). The player's real profiles in localStorage are neither read nor
// written; closing the tab or « Quitter » drops the session.
(function installDevStorageV188() {
  'use strict';
  var SESSION_KEY = 'atf-dev-session-v188';
  var session = null;
  try { session = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (error) { session = null; }
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
  Object.defineProperty(window, 'localStorage', { configurable: true, enumerable: true, get: function () { return store; } });
  // Another tab writing the real profiles must not reach this session's profile guards.
  window.addEventListener('storage', function (event) { event.stopImmediatePropagation(); }, true);
  window.__ATF_DEV_SESSION_V188__ = Object.freeze({
    active: Boolean(session),
    entryId: session && session.entryId || null,
    launch: session && session.launch || null,
    toggles: session && session.toggles || {},
    sessionKey: SESSION_KEY,
    isolated: true,
    get writes() { return writes; },
    snapshotStorage: function () { var copy = {}; data.forEach(function (value, key) { copy[key] = value; }); return copy; }
  });
  document.documentElement.dataset.atfDevSession = session ? 'active' : 'empty';
})();
