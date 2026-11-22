// Spec 012 (source-only): how the native dev server (scripts/dev.mjs) exposes the hidden
// developer tools. Nothing here is part of the public build (`npm run build` copies only
// the listed root files, src/ and assets/; devtools/ and scripts/ stay in the source tree).
//   /devtools/            the launcher (devtools/index.html)
//   /dev                  redirect to /devtools/
//   /?atf-dev=v188        index.html with two injected scripts: the isolated storage
//                         (first script of <head>, before any game script) and the dev
//                         session bridge (after src/app.js).
export const DEV_SESSION_QUERY_V188 = 'atf-dev';
export const DEV_SESSION_VALUE_V188 = 'v188';
export const DEV_STORAGE_SCRIPT_V188 = '/devtools/dev-storage-v188.js';
export const DEV_SESSION_SCRIPT_V188 = '/devtools/dev-session-v188.js';

export function isDevSessionRequestV188(url = '') {
  try {
    const parsed = new URL(String(url || '/'), 'http://127.0.0.1');
    return ['/', '/index.html'].includes(parsed.pathname) && parsed.searchParams.get(DEV_SESSION_QUERY_V188) === DEV_SESSION_VALUE_V188;
  } catch { return false; }
}

/** Inserts the two scripts at exact, single anchors; refuses an unexpected shell. */
export function injectDevSessionHtmlV188(html) {
  if (typeof html !== 'string') throw new Error('Dev session: HTML expected.');
  const charset = '<meta charset="UTF-8">', app = '<script type="module" src="/src/app.js"></script>';
  if (html.split(charset).length !== 2 || html.split(app).length !== 2) throw new Error('Dev session: index.html anchors missing or duplicated.');
  return html
    .replace(charset, `${charset}\n  <script src="${DEV_STORAGE_SCRIPT_V188}"></script>`)
    .replace(app, `${app}\n  <script type="module" src="${DEV_SESSION_SCRIPT_V188}"></script>`)
    .replace('<html lang="fr"', '<html data-atf-dev-page="v188" lang="fr"');
}
