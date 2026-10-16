"""Real Chromium checks of the shipped worker, with clearly synthetic HTTP assets.
This is NOT a game walkthrough. Run separately from the real distribution journey.
"""
import argparse
import base64
import json
import mimetypes
from pathlib import Path
import re
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
args = parser.parse_args()
output = Path(args.output).resolve()
output.mkdir(parents=True, exist_ok=True)
worker = Path('sw.js').read_text()
png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7S8AAAAASUVORK5CYII=')
state = {'revision': 1, 'private': False, 'requests': []}

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_GET(self):
        state['requests'].append({'path': self.path, 'authorized': bool(self.headers.get('Authorization'))})
        headers = {}
        if self.path == '/sw.js':
            body = re.sub(r"const CACHE = 'atf-v143-[a-z0-9-]+';", f"const CACHE = 'atf-v143-browser-{state['revision']}';", worker).encode()
            mime = 'application/javascript'
            headers['Cache-Control'] = 'no-cache'
        elif self.path.startswith('/api/'):
            body, mime = json.dumps({'private': True}).encode(), 'application/json'
            headers['Cache-Control'] = 'private, no-store'
        elif self.path.endswith('.png'):
            body, mime = png, 'image/png'
            if self.path.endswith('private.png'):
                headers['Cache-Control'] = 'private, no-store'
        elif self.path in ['/', '/index.html']:
            body, mime = b'<!doctype html><title>Worker fixture only</title>', 'text/html'
        elif self.path.endswith('.js'):
            body, mime = b'/* synthetic shell module */', 'application/javascript'
        elif self.path.endswith('.css'):
            body, mime = b'/* synthetic shell css */', 'text/css'
        elif self.path.endswith(('.json', '.webmanifest')):
            body, mime = b'{}', 'application/json'
        else:
            body, mime = b'fixture', mimetypes.guess_type(self.path)[0] or 'application/octet-stream'
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(body)))
        for key, value in headers.items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
report = {'scope': 'Production worker with synthetic shell fixtures; not game assets.', 'checks': []}

def checked(label, condition):
    assert condition, label
    report['checks'].append(label)

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context()
        page = context.new_page()
        page.goto(base)
        page.evaluate("""async () => {
          await caches.open('atf-old-private'); await caches.open('unrelated-project');
          await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready;
        }""")
        page.reload()
        page.wait_for_function('navigator.serviceWorker.controller !== null')
        keys = page.evaluate('caches.keys()')
        checked('activation removes only legacy ATF caches', 'atf-old-private' not in keys and 'unrelated-project' in keys)
        checked('current worker controls a reloaded page', page.evaluate('!!navigator.serviceWorker.controller'))
        page.evaluate("""async () => {
          await fetch('/api/save', {headers:{Authorization:'Bearer fixture-A'}});
          await fetch('/assets/user/private.png');
          await fetch('/assets/user/public.png');
          await fetch('/assets/user/authorized.png', {headers:{Authorization:'Bearer fixture-A'}});
        }""")
        page.wait_for_function("""async () => !!(await (await caches.open('atf-v143-browser-1')).match('/assets/user/public.png'))""")
        cached = page.evaluate("""async () => (await (await caches.open('atf-v143-browser-1')).keys()).map(r=>new URL(r.url).pathname)""")
        checked('API response is never stored', '/api/save' not in cached)
        checked('private response is never stored', '/assets/user/private.png' not in cached)
        checked('authorized asset request is never stored', '/assets/user/authorized.png' not in cached)
        checked('public asset is stored', '/assets/user/public.png' in cached)
        context.set_offline(True)
        offline = page.evaluate("""async () => {
          const result = {};
          for(const [key,url,options] of [['public','/assets/user/public.png',{}],['accountB','/api/save',{headers:{Authorization:'Bearer fixture-B'}}],['private','/assets/user/private.png',{}]]) {
            try { result[key] = (await fetch(url,options)).ok; } catch { result[key] = false; }
          }
          return result;
        }""")
        checked('public asset works offline', offline['public'])
        checked('another account receives no offline API fallback', not offline['accountB'])
        checked('private asset is not available offline', not offline['private'])
        context.set_offline(False)
        state['revision'] = 2
        page.evaluate("""async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); }""")
        page.wait_for_function('navigator.serviceWorker.getRegistration().then(r=>!!r.waiting)', timeout=60000)
        checked('update waits while the old client is active', page.evaluate("caches.has('atf-v143-browser-1')"))
        page.close()
        fresh = context.new_page()
        fresh.goto(base)
        fresh.wait_for_function("caches.keys().then(keys => keys.includes('atf-v143-browser-2') && !keys.includes('atf-v143-browser-1'))")
        checked('update activates after old client closes', True)
        checked('unrelated cache survives the update', fresh.evaluate("caches.has('unrelated-project')"))
        context.close()
        browser.close()
    report['status'] = 'passed'
finally:
    server.shutdown()
    report.setdefault('status', 'failed')
    (output / 'worker-report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
