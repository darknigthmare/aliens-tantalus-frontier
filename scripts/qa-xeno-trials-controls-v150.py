"""Isolated real-Chromium input/RAF test. Uses production Trials runtime with
one transparent image fixture (not game artwork), no save/profile and no network.
It does not constitute a full campaign or artistic validation.
"""
import argparse
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = r'''<!doctype html><html lang="fr"><meta charset="utf-8"><title>Trials controls QA</title>
<style>body{background:#101820;color:#ddd;font:15px monospace;margin:20px}button{padding:12px}canvas{display:block;width:800px;height:448px}#notice{max-width:780px}</style>
<h1>Xeno Trials · Banc de commandes V150</h1><p id="notice">Contrôleur de production ; images remplacées par un pixel transparent pour isoler les entrées. Ce banc ne valide pas les graphismes du jeu.</p>
<canvas id="canvas"></canvas><div id="controls"><button data-xeno-action="guard">GARDE</button><button data-xeno-action="special">SPÉCIAL</button><button data-xeno-action="heavy">LOURD</button></div>
<p id="state"></p><script type="module">
import {createXenoTrialsRuntimeV96} from '/src/xeno-trials-runtime-v96.js';
const canvas=document.querySelector('canvas');
const fixture=new Image();fixture.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=';
await fixture.decode();
window.runtime=createXenoTrialsRuntimeV96({canvas,controlsRoot:document.querySelector('#controls'),
 config:{playerId:'import-game-afe2-warden',opponentId:'warrior',seed:149,roundSeconds:99},
 loadImage:async()=>fixture,onState:s=>document.querySelector('#state').textContent=`Manche ${s.round} | ${s.phase} | pause=${s.paused}`});
await runtime.start();window.ready=true;
</script></html>'''


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--chromium', default=None)
    args = parser.parse_args()
    root, out = args.root.resolve(), args.output.resolve()
    if out == root or root in out.parents:
        raise ValueError('QA output must stay outside the source tree')
    out.mkdir(parents=True, exist_ok=True)
    report = {'status': 'running', 'scope': 'isolated DOM and production runtime; transparent image fixture',
              'checks': [], 'pageErrors': [], 'limits': ['Not a full game playthrough', 'No authored artwork validation', 'No physical phone/gamepad']}

    class Handler(SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == '/__qa150':
                payload = HTML.encode(); self.send_response(200); self.send_header('Content-Type','text/html; charset=utf-8')
                self.send_header('Content-Length',str(len(payload))); self.end_headers(); self.wfile.write(payload)
            else:
                super().do_GET()
        def log_message(self, *_):
            pass

    server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(root)))
    thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
    browser = page = None
    def check(label, ok):
        if not ok: raise AssertionError(label)
        report['checks'].append({'label': label, 'status': 'passed'})
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, **({'executable_path': args.chromium} if args.chromium else {}))
            report['chromium'] = browser.version
            page = browser.new_page(viewport={'width':1100,'height':800}, service_workers='block')
            page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/__qa150')
            page.wait_for_function('window.ready && !runtime.getState().presentation.blocksSimulation', timeout=20000)
            page.locator('canvas').focus()
            state = lambda: page.evaluate('runtime.getState()')
            wait = lambda: page.wait_for_timeout(35)
            before=state()['fighters'][0]['stats']['specials']
            page.locator('[data-xeno-action="special"]').click(button='right'); wait()
            check('Right mouse button does not activate special',state()['fighters'][0]['stats']['specials']==before)
            page.keyboard.press('Escape')  # close the native menu; resume explicitly below when needed
            if state()['paused']: page.evaluate('runtime.resume()')
            guard=page.locator('[data-xeno-action="guard"]'); guard.focus()
            page.keyboard.down('Space'); page.keyboard.down('Enter'); wait()
            check('Space + Enter hold the real guard',state()['fighters'][0]['guard'])
            page.keyboard.up('Space'); wait()
            check('Releasing Space preserves Enter ownership',state()['fighters'][0]['guard'])
            page.keyboard.up('Enter'); wait()
            check('Releasing last key ends guard',not state()['fighters'][0]['guard'])
            # Test modifier default prevention with a DOM KeyboardEvent: no OS menu automation.
            prevented=page.evaluate('''() => {let e=new KeyboardEvent('keydown',{code:'KeyL',ctrlKey:true,bubbles:true,cancelable:true});document.querySelector('canvas').dispatchEvent(e);return e.defaultPrevented;}''')
            check('Ctrl+L is not consumed by the controller',not prevented)
            page.evaluate("runtime.setInput('guard',true)"); wait()
            page.locator('canvas').focus(); wait()
            check('Focusout cannot release the separate public input source',state()['fighters'][0]['guard'])
            page.evaluate("runtime.setInput('guard',false)"); wait()
            check('Public input release ends guard',not state()['fighters'][0]['guard'])
            page.keyboard.press('p'); wait(); frozen=state()
            check('P pauses the actual controller',frozen['paused'])
            page.wait_for_timeout(160)
            check('Pause freezes the engine tick',state()['tick']==frozen['tick'])
            page.screenshot(path=str(out/'controls-paused.png'))
            page.keyboard.press('p'); wait(); check('P resumes without a held guard',not state()['paused'] and not state()['fighters'][0]['guard'])
            page.evaluate('runtime.stop()'); old=state()['tick'];page.wait_for_timeout(100)
            check('Stop ends the frame loop',state()['tick']==old)
            check('No browser exception in this isolated scenario',not report['pageErrors'])
            browser.close();browser=None; report['status']='passed'
    except Exception as exc:
        report['status']='failed';report['error']=str(exc)
    finally:
        server.shutdown(); server.server_close(); thread.join(timeout=2)
        (out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'status':report['status'],'checks':len(report['checks']),'error':report.get('error')}))
    return 0 if report['status']=='passed' else 1

if __name__=='__main__':
    raise SystemExit(main())
