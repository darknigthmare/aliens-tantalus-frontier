import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { AUDIO_MIME_V77 } from '../src/audio-assets-v77.js';
import { writeAudioManifestV77 } from './audio-scan-v77.mjs';
import { APP_RELEASE_V143 } from '../src/release-info-v143.js';
import { stampReleaseHtmlV143 } from './build-release-v143.mjs';
import { createDevShellStamperV188 } from './dev-tools-server-v188.mjs';

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const mime = {
  ...AUDIO_MIME_V77,
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.md': 'text/markdown; charset=utf-8'
};

function safePath(url) {
  let requested;
  try { requested = decodeURIComponent((url || '/').split('?')[0]); }
  catch { return null; }
  const relative = normalize(requested === '/' ? 'index.html' : requested.replace(/^\/+/, ''));
  if (relative.startsWith('..')) return null;
  if (relative.split(/[\\/]/).some(segment => /^(?:docs?|tests?|scripts|references?|exports?|captures?|screenshots?|\.git|\.env.*|\.qa.*|\.vercel)$/i.test(segment))) return null;
  return join(root, relative);
}

await writeAudioManifestV77(root);
// Spec 012: same shell as the public build (release labels, then the inline dev bootstrap, inert without the dev query).
const devShell = await createDevShellStamperV188(root);
const shellHtml = html => devShell(stampReleaseHtmlV143(html, APP_RELEASE_V143));
createServer(async (request, response) => {
  // Spec 012: the hidden developer launcher (devtools/); the game page isolates itself (inline bootstrap).
  if ((request.url || '').split('?')[0] === '/dev') { response.writeHead(302, { location: '/devtools/' }).end(); return; }
  let file = safePath(request.url);
  if (!file) { response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    const bytes = await readFile(file);
    const body = file === join(root, 'index.html') ? shellHtml(bytes.toString('utf8')) : bytes;
    response.writeHead(200, {
      'content-type': mime[extname(file)] || 'application/octet-stream',
      'cache-control': extname(file) === '.html' ? 'no-store' : 'public, max-age=60',
      'x-content-type-options': 'nosniff'
    });
    response.end(body);
  } catch {
    if (!extname(file)) {
      try {
        const body = await readFile(file + '.html');
        response.writeHead(200, { 'content-type': mime['.html'], 'cache-control': 'no-store' }).end(body);
        return;
      } catch { /* Continue to the existing missing-asset or app-shell fallback. */ }
    }
    // Missing sprite/module requests must not look like successful HTML pages.
    if (extname(file) || request.url?.startsWith('/assets/')) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    try {
      const body = shellHtml(await readFile(join(root, 'index.html'), 'utf8'));
      response.writeHead(200, { 'content-type': mime['.html'], 'cache-control': 'no-store' });
      response.end(body);
    } catch { response.writeHead(404).end('Not found'); }
  }
}).listen(port, '127.0.0.1', () => console.log(`ALIENS: TANTALUS FRONTIER running at http://127.0.0.1:${port}`));
