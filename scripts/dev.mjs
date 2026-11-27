import { RIVER_OF_PAIN_RUNTIME, RIVER_OF_PAIN_ROOT } from './river-of-pain-distribution.mjs';
import { ALIENS1986_RUNTIME_ROOT, ALIENS1986_RUNTIME_FILES } from './public-aliens1986-dlc-admissions.mjs';
import { renderAliens1986RasterV116 } from './derive-aliens1986-raster-v116.mjs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { AUDIO_MIME_V77 } from '../src/audio-assets-v77.js';
import { writeAudioManifestV77 } from './audio-scan-v77.mjs';
import { APP_RELEASE_V143 } from '../src/release-info-v143.js';
import { stampReleaseHtmlV143, stampXenoTrialsHtmlV207 } from './build-release-v143.mjs';

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
  if (relative === 'xeno-trials') return join(root, 'xeno-trials.html');
  if (relative === 'archives' || relative.startsWith('archives/')) return null;
  if (relative.startsWith('dlc/') && relative !== RIVER_OF_PAIN_ROOT && relative !== RIVER_OF_PAIN_ROOT + '/'
    && relative !== ALIENS1986_RUNTIME_ROOT && relative !== ALIENS1986_RUNTIME_ROOT + '/'
    && !RIVER_OF_PAIN_RUNTIME.includes(relative) && !ALIENS1986_RUNTIME_FILES.includes(relative)) return null;
  if (relative.split(/[\\/]/).some(segment => /^(?:docs?|tests?|scripts|references?|exports?|captures?|screenshots?|\.git|\.env.*|\.qa.*|\.vercel)$/i.test(segment))) return null;
  return join(root, relative);
}

await writeAudioManifestV77(root);
const aliens1986Development = await renderAliens1986RasterV116({ root });
createServer(async (request, response) => {
  let file = safePath(request.url);
  if (!file) { response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    const bytes = await readFile(file);
    const body = file === join(root, 'index.html') ? stampReleaseHtmlV143(bytes.toString('utf8'), APP_RELEASE_V143)
      : file === join(root, 'xeno-trials.html') ? stampXenoTrialsHtmlV207(bytes.toString('utf8'), APP_RELEASE_V143)
      : file === join(root, ALIENS1986_RUNTIME_ROOT, 'game.html') ? aliens1986Development.html : bytes;
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
    if (extname(file) || request.url?.startsWith('/assets/') || request.url?.startsWith('/dlc/')) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    try {
      const body = stampReleaseHtmlV143(await readFile(join(root, 'index.html'), 'utf8'), APP_RELEASE_V143);
      response.writeHead(200, { 'content-type': mime['.html'], 'cache-control': 'no-store' });
      response.end(body);
    } catch { response.writeHead(404).end('Not found'); }
  }
}).listen(port, '127.0.0.1', () => console.log(`ALIENS: TANTALUS FRONTIER running at http://127.0.0.1:${port}`));
