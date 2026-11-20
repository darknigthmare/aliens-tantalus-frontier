import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { INTRO_SESSION_KEY_V188, INTRO_TIMING_V188, introModeV188, collectTitleImageUrlsV188, preloadImagesV188, playIntroV188 } from '../src/intro-sequence-v188.js';
import { TitleScreenController } from '../src/title-screen-v61.js';
import { createDefaultSave } from '../src/save.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const memory = (initial = {}) => { const data = { ...initial }; return { getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = String(value); }, data }; };
const fakeTarget = () => { const listeners = []; return { listeners, addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }),
  removeEventListener: (type, fn) => { const index = listeners.findIndex(entry => entry.type === type && entry.fn === fn); if (index >= 0) listeners.splice(index, 1); } }; };
const fakeOverlay = () => ({ ...fakeTarget(), dataset: {}, removed: false, remove() { this.removed = true; } });
const instantTimer = (fn) => { queueMicrotask(fn); return 0; };

test('intro: full credit once per session, then the short fade', () => {
  assert.equal(introModeV188(memory()), 'full');
  assert.equal(introModeV188(memory({ [INTRO_SESSION_KEY_V188]: '1' })), 'short');
  assert.equal(introModeV188({ getItem: () => { throw new Error('blocked'); } }), 'full');
  assert.ok(INTRO_TIMING_V188.full.hold > INTRO_TIMING_V188.short.hold && INTRO_TIMING_V188.maxWait <= 8000);
});

test('intro: collects every title bitmap (img and CSS backgrounds) and never waits forever', async () => {
  const element = (tagName, extra = {}) => ({ tagName, hidden: false, ...extra });
  const nodes = [element('IMG', { src: '/a.png' }), element('IMG', { src: '/hidden.png', hidden: true }), element('DIV', { bg: 'url("/b.png"), linear-gradient(red, blue)' }), element('DIV', { bg: 'url(data:image/png;base64,xx)' })];
  const root = { tagName: 'SECTION', querySelectorAll: () => nodes };
  assert.deepEqual(collectTitleImageUrlsV188(root, node => ({ backgroundImage: node.bg || 'none' })), ['/a.png', '/b.png']);
  const never = { set src(_) {} };
  assert.equal(await preloadImagesV188(['/slow.png'], { timeout: 5, createImage: () => never }), null, 'timeout wins');
  const ok = { set src(_) { queueMicrotask(() => this.onload()); } };
  assert.deepEqual(await preloadImagesV188(['/x.png'], { timeout: 1000, createImage: () => ok }), ['/x.png']);
});

test('intro: prepares the title underneath, swallows keys, remembers the session and removes itself', async () => {
  const overlay = fakeOverlay(), target = fakeTarget(), storage = memory(); let prepared = 0;
  const phases = [];
  const run = playIntroV188({ overlay, target, storage, setTimer: (fn, ms) => { phases.push(overlay.dataset.phase); return instantTimer(fn, ms); },
    prepareTitle: () => { prepared += 1; }, titleRoot: null });
  assert.equal(prepared, 1); assert.equal(overlay.dataset.mode, 'full');
  const key = target.listeners.find(entry => entry.type === 'keydown');
  assert.equal(key.capture, true, 'capture phase, before the title menu handler');
  let stopped = false; key.fn({ type: 'keydown', key: 'Enter', preventDefault() {}, stopImmediatePropagation() { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(await run, 'skipped');
  assert.equal(overlay.removed, true); assert.equal(storage.data[INTRO_SESSION_KEY_V188], '1');
  assert.equal(target.listeners.length, 0, 'input released'); assert.equal(overlay.listeners.length, 0);
  const second = fakeOverlay();
  assert.equal(await playIntroV188({ overlay: second, target: fakeTarget(), storage, setTimer: instantTimer }), 'complete');
  assert.equal(second.dataset.mode, 'short'); assert.equal(second.removed, true);
});

test('intro: wired before the first paint and onto the title screen', () => {
  const html = read('index.html'), css = read('styles.css'), app = read('src/app.js'), sw = read('sw.js'), early = read('src/intro-boot-v188.js');
  assert.ok(html.indexOf('<script src="/src/intro-boot-v188.js"></script>') < html.indexOf('<link rel="stylesheet" href="/styles.css">'), 'pre-paint flag');
  assert.match(html, /<body>\s*<div id="intro-v188" class="intro-v188"/);
  assert.match(html, /<span class="intro-v188__by">A fan game by<\/span><span class="intro-v188__name">Darknigthmare<\/span>/);
  for (const rule of [/html\[data-intro-v188="short"\] \.intro-v188__credit/, /\.intro-v188\[data-phase="fade"\] \{ opacity: 0; pointer-events: none; \}/,
    /\.intro-v188\[data-phase="fade"\] \.intro-v188__credit/, /html\[data-intro-stars-v188="ready"\] \.intro-v188__stars \{ opacity: 1; \}/, /intro-v188-failsafe 1s ease 14s forwards/]) assert.match(css, rule);
  for (const star of ['stars-01-distant-field.png', 'stars-02-near-sparks.png']) { assert.match(early, new RegExp(star)); assert.match(css, new RegExp(star)); }
  assert.match(app, /void playIntroV188\(\{ overlay: byId\('intro-v188'\), titleRoot: titleScreen\.root,/);
  assert.match(app, /prepareTitle: \(\) => \{ byId\('boot'\)\.remove\(\); showTitleScreen\(\); \}/);
  assert.match(app, /byId\('intro-v188'\)\?\.remove\(\);\n  byId\('boot'\)\.innerHTML/, 'a boot error is never hidden behind the credit');
  for (const file of ['/src/intro-sequence-v188.js', '/src/intro-boot-v188.js']) assert.ok(sw.includes(`'${file}'`), file);
});

/** Real title constructor/show/input and playIntro timers. Only DOM, RAF and
 * Playwright transport are hosted; capture is dispatched before bubble, unlike
 * Node's EventTarget alone. The Python helper and its actual preview call site
 * are extracted by AST, never reimplemented as a second transition policy. */
async function driveTitlePreviewEntry(timeout = null) {
  const names = ['addEventListener','removeEventListener','document','requestAnimationFrame','cancelAnimationFrame'];
  const globals = new Map(names.map(name => [name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  const listeners = [], frames = new Set(), timers = [], calls = [], keyResults = [];
  let frameSerial = 0, removed = false, fadeReady, unlocked = 0, continued = 0;
  const faded = new Promise(resolve => { fadeReady = resolve; });
  const target = {
    addEventListener(type,fn,options = false) { listeners.push({type,fn,capture:options === true || options?.capture === true}); },
    removeEventListener(type,fn,options = false) { const capture = options === true || options?.capture === true;
      const index = listeners.findIndex(entry => entry.type === type && entry.fn === fn && entry.capture === capture);
      if (index >= 0) listeners.splice(index,1); }
  };
  globalThis.addEventListener = target.addEventListener.bind(target); globalThis.removeEventListener = target.removeEventListener.bind(target);
  const classes = new Set(), document = Object.assign(new EventTarget(), { hidden:false,activeElement:null,hasFocus:() => true,
    documentElement:{classList:{add:name => classes.add(name),remove:name => classes.delete(name)}} });
  globalThis.document = document;
  globalThis.requestAnimationFrame = fn => { const id = ++frameSerial; frames.add(id);
    queueMicrotask(() => { if (frames.delete(id)) fn(performance.now()); }); return id; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  const node = id => Object.assign(new EventTarget(), {id,hidden:false,disabled:false,dataset:{},textContent:'',ownerDocument:document,
    setAttribute() {},focus() { document.activeElement = this; },scrollIntoView() {},
    click() { const event = new Event('click',{cancelable:true}); Object.assign(event,{detail:1}); this.dispatchEvent(event); } });
  const nodes = new Map(['title-start','title-menu','title-continue','title-new','title-forge','title-options',
    'title-profile-status','title-live-status','title-recovery-warning','title-resume-context-v89'].map(id => [id,node(id)]));
  const root = Object.assign(node('title-screen'),{querySelector:selector => nodes.get(selector.slice(1)) || null}), app = node('app');
  const save = createDefaultSave(1), saved = JSON.stringify(save);
  const title = new TitleScreenController({root,app,getSave:() => save,onUnlock:() => unlocked++,onContinue:() => continued++});
  const overlay = Object.assign(new EventTarget(),{dataset:new Proxy({}, {set(object,key,value) {
    object[key] = value; if (key === 'phase' && value === 'fade') fadeReady(); return true;
  }}),remove() { removed = true; }});
  const intro = playIntroV188({overlay,target,storage:memory({[INTRO_SESSION_KEY_V188]:'1'}),reducedMotion:true,
    prepareTitle:() => title.show(),setTimer(fn,ms) { const timer = setTimeout(fn,ms); timers.push(timer); return timer; }});
  await faded;
  assert.equal(document.activeElement.id,'title-start'); assert.equal(title.state,'idle');
  const context = createContext({__ATF_V61__:{snapshot:() => title.getSnapshot()}});
  const dispatchEnter = () => {
    const result = {phase:overlay.dataset.phase,removed,captureListeners:listeners.filter(entry => entry.type === 'keydown' && entry.capture).length,
      focus:document.activeElement.id,documentFocused:document.hasFocus(),before:title.state};
    let stopped = false, stopOwner = null, currentCapture = false;
    const event = {type:'keydown',code:'Enter',key:'Enter',repeat:false,isComposing:false,altKey:false,ctrlKey:false,metaKey:false,
      defaultPrevented:false,preventDefault() { this.defaultPrevented = true; },
      stopImmediatePropagation() { stopped = true; stopOwner = currentCapture ? 'intro-capture' : 'title-bubble'; }};
    for (const capture of [true,false]) for (const entry of [...listeners].filter(item => item.type === 'keydown' && item.capture === capture)) {
      if (stopped) break; currentCapture = capture; entry.fn(event);
    }
    keyResults.push({...result,defaultPrevented:event.defaultPrevented,stopOwner,after:title.state});
    for (const entry of [...listeners].filter(item => item.type === 'keyup')) entry.fn({...event,type:'keyup'});
  };
  const python = String.raw`
import ast,json,sys,time
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text())
budget=30000 if sys.argv[2]=='default' else int(sys.argv[2])
def rpc(method,**data):
 print(json.dumps({'method':method,**data}),flush=True)
 response=json.loads(sys.stdin.readline())
 if response.get('error'):raise TimeoutError(response['error'])
 return response.get('value')
class Locator:
 def __init__(self,selector):self.selector=selector
 def wait_for(self,**kwargs):return rpc('wait_intro',selector=self.selector,**kwargs)
class Keyboard:
 def press(self,key):return rpc('press',key=key)
class Page:
 keyboard=Keyboard()
 def locator(self,selector):return Locator(selector)
 def evaluate(self,expression):return rpc('evaluate',expression=expression)
 def wait_for_function(self,expression,timeout=budget):return rpc('wait_menu',expression=expression,timeout=timeout)
helpers=[node for node in tree.body if isinstance(node,ast.FunctionDef) and node.name=='open_preview_menu_after_intro']
scope={'page':Page(),'time':time,'menu_key_trace':{'keyRequested':False},
 'observed':lambda page:{'title':rpc('snapshot')}}
exec(compile(ast.Module(body=helpers,type_ignores=[]),sys.argv[1],'exec'),scope)
transition=next(node for node in ast.walk(tree) if isinstance(node,ast.Try) and node.body
 and isinstance(node.body[0],ast.Assign) and isinstance(node.body[0].value,ast.Call)
 and isinstance(node.body[0].value.func,ast.Name) and node.body[0].value.func.id=='start_title_menu_key_trace')
try:
 if sys.argv[2]!='default' and helpers:scope['open_preview_menu_after_intro'](scope['page'],scope['menu_key_trace'],timeout=budget)
 else:exec(compile(ast.Module(body=transition.body[1:],type_ignores=[]),sys.argv[1],'exec'),scope)
 result={'ok':True}
except TimeoutError as error:result={'ok':False,'error':str(error)}
print(json.dumps({'method':'complete','result':result,'keyRequested':scope['menu_key_trace']['keyRequested']}),flush=True)
`;
  const source = process.env.ATF_TITLE_PREVIEW_DRIVER_V188 || fileURLToPath(new URL('./qa-title-compositions-v163.py',import.meta.url));
  const child = spawn('python3',['-B','-c',python,source,timeout === null ? 'default' : String(timeout)],{stdio:['pipe','pipe','pipe']});
  let stderr = '', outcome, result; child.stderr.on('data',chunk => { stderr += chunk; });
  const done = new Promise(resolve => child.on('exit',code => resolve(code))), guard = setTimeout(() => child.kill('SIGKILL'),40000);
  try {
    for await (const line of createInterface({input:child.stdout})) {
      const request = JSON.parse(line); let error, value;
      if (request.method === 'complete') { outcome = request; continue; }
      const call = {...request,at:performance.now(),removed,titleState:title.state}; calls.push(call);
      try {
        if (request.method === 'wait_intro') {
          assert.equal(request.selector,'#intro-v188'); assert.equal(request.state,'detached');
          assert.ok(request.timeout > 0 && request.timeout <= (timeout ?? 30000)); let expiry;
          try { await Promise.race([intro,new Promise((_,reject) => {
            expiry = setTimeout(() => reject(Error('Native intro outlived the original title entry budget.')),request.timeout);
          })]); } finally { clearTimeout(expiry); }
          assert.equal(removed,true); assert.equal(listeners.filter(entry => entry.capture).length,0);
        } else if (request.method === 'press') { assert.equal(request.key,'Enter'); dispatchEnter(); }
        else if (request.method === 'snapshot') value = title.getSnapshot();
        else if (request.method === 'evaluate') value = runInContext(`(${request.expression})()`,context);
        else if (request.method === 'wait_menu') {
          assert.ok(request.timeout > 0 && request.timeout <= (timeout ?? 30000));
          const end = performance.now()+request.timeout;
          while (!runInContext(`(${request.expression})()`,context)) {
            if (performance.now() >= end) throw Error('Native title menu did not open within the original entry budget.');
            await new Promise(resolve => setTimeout(resolve,Math.min(10,Math.max(1,end-performance.now()))));
          }
        } else throw Error('Unexpected preview operation: '+request.method);
      } catch (caught) { error = caught.message; }
      call.elapsed = performance.now()-call.at;
      child.stdin.write(JSON.stringify({error,value})+'\n');
    }
    assert.equal(await done,0,stderr); assert.ok(outcome);
    result = {...outcome,calls,keyResults,state:title.state,unlocked,continued,saveUnchanged:JSON.stringify(save) === saved};
  } finally {
    clearTimeout(guard); child.kill(); await intro; timers.forEach(clearTimeout);
    title.dispose(); for (const [name,descriptor] of globals) {
      if (descriptor) Object.defineProperty(globalThis,name,descriptor); else delete globalThis[name];
    }
  }
  return result;
}

test('QA title preview: one Enter reaches the real title only after native intro detachment within the shared budget', {timeout:45000}, async t => {
  const result = await driveTitlePreviewEntry(); t.diagnostic(JSON.stringify(result));
  assert.equal(result.result.ok,true); assert.equal(result.state,'menu'); assert.equal(result.keyRequested,true);
  assert.deepEqual(result.keyResults,[{phase:'fade',removed:true,captureListeners:0,focus:'title-start',documentFocused:true,
    before:'idle',defaultPrevented:true,stopOwner:'title-bubble',after:'menu'}]);
  assert.equal(result.unlocked,1); assert.equal(result.continued,0); assert.equal(result.saveUnchanged,true);
  const wait = result.calls.find(call => call.method === 'wait_intro'), menu = result.calls.find(call => call.method === 'wait_menu');
  assert.ok(wait && menu); assert.ok(wait.timeout <= 30000 && menu.timeout > 0 && menu.timeout < wait.timeout);
  assert.ok(wait.elapsed >= INTRO_TIMING_V188.fade/2,'observe the real fade, not an already removed overlay');
  assert.ok(menu.timeout <= wait.timeout-wait.elapsed+50,'detachment and menu admission share the original 30 seconds');
  assert.equal(result.calls.filter(call => call.method === 'press').length,1,'one transition key, no retry');
});

test('QA title preview: an intro exceeding the remaining budget prevents the only Enter and leaves title/save unchanged', async t => {
  const result = await driveTitlePreviewEntry(40); t.diagnostic(JSON.stringify(result));
  assert.equal(result.result.ok,false); assert.match(result.result.error,/budget/);
  assert.equal(result.keyRequested,false); assert.deepEqual(result.keyResults,[]); assert.equal(result.calls.length,1);
  assert.equal(result.calls[0].method,'wait_intro'); assert.equal(result.state,'idle');
  assert.equal(result.unlocked,0); assert.equal(result.continued,0); assert.equal(result.saveUnchanged,true);
});
