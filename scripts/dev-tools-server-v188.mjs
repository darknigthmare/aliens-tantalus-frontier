// Spec 012 (source-only): how the native dev server (scripts/dev.mjs) exposes the hidden
// developer tools. It serves the same client-side isolation as the public build
// (scripts/build-dev-tools-v188.mjs): every index.html response carries the inline
// bootstrap, which does nothing unless the exact dev query is present.
//   /devtools/            the launcher (devtools/index.html), source directory name
//   /dev                  redirect to /devtools/
//   /?atf-dev=v188        the game page; the inline bootstrap installs the isolated storage
//                         before any game script, then loads the session bridge of the
//                         launcher that opened it.
import { DEV_SESSION_QUERY_V188, DEV_SESSION_VALUE_V188, injectDevBootstrapHtmlV188, readDevStorageShimV188 } from './build-dev-tools-v188.mjs';

export { DEV_SESSION_QUERY_V188, DEV_SESSION_VALUE_V188 };

/** Same predicate as the shipped inline test, for a request URL (documentation and tests). */
export function isDevSessionRequestV188(url = '') {
  try { return /[?&]atf-dev=v188(?:&|$)/.test(new URL(String(url || '/'), 'http://127.0.0.1').search); } catch { return false; }
}

export async function createDevShellStamperV188(root) {
  const shim = await readDevStorageShimV188(root);
  return html => injectDevBootstrapHtmlV188(html, shim);
}
