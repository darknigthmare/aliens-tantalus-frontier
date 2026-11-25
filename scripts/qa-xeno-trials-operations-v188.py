"""V188 objective integration QA with native browser UI and controls.
Fixtures: standard Gamepad API events and an ordinary save imported through
System UI with 30,000 Trials credits to purchase Queen for survival budgets.
Touch events use Chromium trusted input dispatch. Enemy, objective and hazard
positions, HP, clocks, RNG, kills and outcomes are never written.
No fighter, clock, outcome, damage or director state is injected.
"""
import argparse, json, time, subprocess, hashlib, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
P = argparse.ArgumentParser()
P.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
P.add_argument('--output', type=Path, required=True)
P.add_argument('--mode', choices=['escort','controls','extraction','failures','hazard','legacy','all'], default='all')
a = P.parse_args()
REPO = Path(os.environ.get('ATF_QA_REPO', Path(__file__).resolve().parents[1])).resolve()
OUT = a.output.resolve()
if OUT == REPO or REPO in OUT.parents:
    raise SystemExit('Keep browser evidence outside the repository.')
OUT.mkdir(parents=True, exist_ok=True)
R = {'limits':['Automated local Chromium native inputs; simulated standard Gamepad API is not a physical controller.','Four terminal operation runs, one hazard probe, one partial nine-button UI probe and one legacy horde; not forty completed operation playthroughs.','Checkpoint comparison canonicalizes paused/accumulator and excludes player input-rearm fields only.'], 'status':'running','checks':[],'captures':[],'pageErrors':[],'httpErrors':[],'requestFailures':[],'observations':[],'scenarios':{},'fixtures':['Native save import with 30000 credits; Queen purchased through UI. Standard Gamepad API mocked, no game state writes.']}
READ = '() => globalThis.__ATF_XENO_TRIALS_V96__?.snapshot()'
PAD = "(()=>{let connected=false;const pad={id:'QA standard controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,touched:false,value:0})),timestamp:0};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>connected?[pad]:[]});globalThis.__QA_STANDARD_PAD_V186__={set(next){if(next.axes)pad.axes=[...next.axes];if(next.buttons){pad.buttons=Array.from({length:17},(_,i)=>({pressed:(next.buttons[i]||0)>=.5,touched:(next.buttons[i]||0)>0,value:next.buttons[i]||0}));}pad.timestamp=performance.now();if(typeof next.connected==='boolean'&&next.connected!==connected){connected=next.connected;pad.connected=connected;dispatchEvent(new Event(connected?'gamepadconnected':'gamepaddisconnected'));}return{connected,axes:pad.axes,buttons:pad.buttons.map(b=>b.value)}}};})()"

def state(p):
    return p.evaluate(READ)

def check(label, condition, evidence=None):
    if not condition:
        raise AssertionError(label)
    R['checks'].append({'label': label, 'evidence': evidence})
    print('PASS ' + label, flush=True)
    (OUT/'report.json').write_text(json.dumps(R,ensure_ascii=False,indent=2))

def cap(p, name):
    p.screenshot(path=str(OUT / name), full_page=True)
    R['captures'].append(name)

def enter(p, s):
    p.locator(s).wait_for(state='visible')
    p.locator(s).focus()
    p.keyboard.press('Enter')

def open_system(p, reload=False):
    if reload:
        p.reload(wait_until='domcontentloaded')
    else:
        p.goto(a.base, wait_until='domcontentloaded')
    p.locator('#title-start').click(timeout=45000)
    p.locator('#title-options').click()
    p.wait_for_timeout(350)

def open_trials(p):
    enter(p, '#nav [data-view="xenotrials"]')
    p.wait_for_timeout(350)

def wait_active(p):
    p.wait_for_function('()=>{const m=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot().match;return m&&!m.paused&&!m.presentation.blocksSimulation;}', timeout=45000)

def pad(p, connected=None, axis=0, buttons=None):
    data = {'axes': [axis, 0, 0, 0], 'buttons': {str(k): v for k, v in (buttons or {}).items()}}
    if connected is not None:
        data['connected'] = connected
    p.evaluate('(next)=>__QA_STANDARD_PAD_V186__.set(next)', data)

def pause(p):
    p.locator('[data-xt="canvas"]').focus()
    p.keyboard.press('KeyP')
    p.wait_for_function('globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match.paused')

def release(p):
    for k in ['ArrowLeft','ArrowRight','KeyJ','KeyK','KeyL','KeyS','KeyE','Space']:
        p.keyboard.up(k)

def choose_protocol(p, id):
    selector = f'[data-xt-activity="{id}"]'
    while not p.locator(selector).count():
        if p.locator('[data-xt="program-next"]').is_disabled():
            raise AssertionError('Protocol absent from native paginated board: ' + id)
        enter(p, '[data-xt="program-next"]')
    enter(p, selector)

def diff(x, y, path=''):
    if type(x) != type(y):
        return [(path, x, y)]
    if isinstance(x, dict):
        out = []
        for k in sorted(set(x) | set(y)):
            if k not in x or k not in y:
                out.append((path + '.' + k, x.get(k), y.get(k)))
            else:
                out.extend(diff(x[k], y[k], path + '.' + k))
        return out
    if isinstance(x, list):
        if len(x) != len(y):
            return [(path + '.length', len(x), len(y))]
        return [d for i, (a, b) in enumerate(zip(x, y)) for d in diff(a, b, path + f'[{i}]')]
    return [] if x == y else [(path, x, y)]

def protected(m, keys):
    out = json.loads(json.dumps({k: m[k] for k in keys}))
    out['paused'] = True
    out['accumulator'] = 0
    for k in ['previousInput', 'rearmControls']:
        out['fighters'][0].pop(k, None)
    return out

def hook(p):
    p.set_default_timeout(20000)
    p.on('pageerror', lambda e: R['pageErrors'].append(str(e)))
    p.on('response', lambda r: R['httpErrors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
    p.on('requestfailed',lambda r:R['requestFailures'].append({'url':r.url,'failure':r.failure}))

def fixture(p):
    code="import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA_OPS_V188';s.scene='command';s.xenoTrialsV96.credits=30000;console.log(JSON.stringify(s));"
    raw=subprocess.check_output(['node','--input-type=module','-e',code],cwd=REPO)
    (OUT/'credit-fixture.json').write_bytes(raw)
    R['creditFixture']={'file':'credit-fixture.json','sha256':hashlib.sha256(raw).hexdigest(),'credits':30000,'player':'QA_OPS_V188','queenStartsLocked':True}
    p.locator('#save-import').set_input_files({'name':'credit-fixture.json','mimeType':'application/json','buffer':raw})
    p.wait_for_function("globalThis.__ATF_V51__?.saveSystem.data.player.name==='QA_OPS_V188'")

def start_operation(p,id,queen=True):
    enter(p,'[data-xt-branch="operations"]')
    choose_protocol(p,id)
    if queen:
        label=subprocess.check_output(['node','--input-type=module','-e',"import{getXenoTrialsFighterV96}from'./src/xeno-trials-data-v96.js';console.log(getXenoTrialsFighterV96('queen').label)"],cwd=REPO,text=True).strip()
        p.locator('[data-xt="search"]').fill(label)
        if 'queen' not in state(p)['progress']['unlocked']:
            enter(p,'[data-xt-unlock="queen"]')
        enter(p,'[data-xt-fighter="queen"]')
    enter(p,'[data-xt="confirm-fighters"]')
    enter(p,'[data-xt="start"]')
    wait_active(p)

class Keys:
    def __init__(self,p):self.p=p;self.held=set()
    def use(self,wanted):
        wanted=set(wanted)
        for k in self.held-wanted:self.p.keyboard.up(k)
        for k in wanted-self.held:self.p.keyboard.down(k)
        self.held=wanted
    def clear(self):self.use([])

def clear_contacts(p, limit=85):
    keys=Keys(p);deadline=time.monotonic()+limit;heavy=-500;light=-500
    p.locator('[data-xt="canvas"]').focus()
    while time.monotonic()<deadline:
        m=state(p)['match'];player=m['fighters'][0];h=m['hordeV180'];atlas_receipts(p,m)
        if h['phase']=='complete' or m['phase']=='match-over':
            keys.clear();return m
        if m['paused'] or m['presentation']['blocksSimulation'] or h['phase']!='active' or len(m['fighters'])<2:
            keys.clear();p.wait_for_timeout(60);continue
        enemy=min(m['fighters'][1:],key=lambda f:abs(f['x']-player['x']))
        gap=p.evaluate("async fighters=>{const e=fighters.slice(1).sort((a,b)=>Math.abs(a.x-fighters[0].x)-Math.abs(b.x-fighters[0].x))[0];return(await import('/src/xeno-trials-geometry-v105.js')).getXenoTrialsBodyGapV105(fighters[0],e);}",m['fighters'])
        keys.use(['ArrowRight' if enemy['x']>player['x'] else 'ArrowLeft'] if gap>40 else [])
        if gap<125 and not player['attack'] and player['stun']<=0:
            if m['tick']-heavy>=180 and player['stamina']>=25:p.keyboard.press('KeyK',delay=45);heavy=m['tick']
            elif m['tick']-light>=180 and m['tick']-heavy>=75 and player['stamina']>=12:p.keyboard.press('KeyJ',delay=45);light=m['tick']
        p.wait_for_timeout(65)
    keys.clear();raise AssertionError('Native combat controller exceeded its real time budget')
def body(p,player):
    return p.evaluate("async f=>(await import('/src/xeno-trials-geometry-v105.js')).getXenoTrialsBodyBoundsV105(f)",player)

def atlas_receipts(p,m):
    receipts=[r for r in m.get('rigViewsV154',[]) if r.get('spriteAtlasV188')]
    seen=R.setdefault('atlasWitnesses',{})
    for r in receipts:
        a=r['spriteAtlasV188'];key=a['fighterId']+':'+a['frameId']
        if key not in seen:seen[key]={'tick':m['tick'],'side':r['side'],'receipt':r}
        if a['frameId']=='ko-ground' and 'nativeAtlasKo' not in R:
            R['nativeAtlasKo']={'tick':m['tick'],'receipt':r,'ghosts':m.get('defeatedViewsV186',[])};cap(p,'09-native-atlas-ko-ground.png')

def observe(label,m):
    R['observations'].append({'scenario':label,'tick':m['tick'],'phase':m['phase'],'player':{k:m['fighters'][0][k] for k in ['id','hp','x','y','facing']},'operation':m.get('operationV188'),'hazard':m.get('stageHazardViewV188'),'hazardState':m.get('stageHazardsV188'),'horde':m.get('hordeV180')})

def close(c,p):
    if sys.exc_info()[0]:
        try:
            R.setdefault('scenarioFailureStates',[]).append(state(p));cap(p,'failure-'+str(len(R['scenarioFailureStates']))+'.png')
        except Exception:pass
    c.close()

def setup(browser,label,mobile=False,language='fr'):
    c=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1440,'height':1000},is_mobile=mobile,has_touch=True,service_workers='block')
    c.add_init_script(PAD);p=c.new_page();hook(p)
    open_system(p);fixture(p);p.locator('#language-select-v185').select_option(language);open_trials(p)
    return c,p

def layout(p):
    return p.evaluate('''()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};const get=k=>document.querySelector(`[data-xt="${k}"]`),op=get('operation-hud'),control=document.querySelector('[data-xeno-action="interact"]');return{viewport:{width:innerWidth,height:innerHeight},op:rect(op),player:rect(get('player-vitals')),population:rect(get('horde-hud')),inHud:!!op.closest('[data-xt="combat-hud"]'),interact:rect(control),interactHidden:control.hidden,opText:op.textContent,hint:get('operation-hint').textContent,device:get('input-device').textContent}}''')

def separated(a,b):
    return min(a['x']+a['width'],b['x']+b['width'])<=max(a['x'],b['x']) or min(a['y']+a['height'],b['y']+b['height'])<=max(a['y'],b['y'])

def responsive_operation(p,tag="queen"):
    results={}
    for name,size in [('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
        p.set_viewport_size(size);p.wait_for_timeout(120);d=layout(p)
        d['details']=p.evaluate("""()=>{const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}};return{leave:rect(document.querySelector('[data-xt="return"]')),pause:rect(document.querySelector('[data-xt="pause"]')),canvas:rect(document.querySelector('[data-xt="canvas"]')),hud:rect(document.querySelector('[data-xt="combat-hud"]')),controls:rect(document.querySelector('.xt-controls')),buttons:[...document.querySelectorAll('[data-xeno-action]')].filter(e=>!e.hidden).map(e=>({action:e.dataset.xenoAction,...rect(e)}))}}""")
        c=d['details']['canvas'];scale=min(c['width']/1000,c['height']/560);d['contactLineY']=c['y']+(c['height']-560*scale)/2+453.6*scale
        check(tag+' '+name+' operation telemetry keeps player, population and objective rows distinct',d['inHud'] and separated(d['player'],d['population']) and separated(d['op'],d['player']) and separated(d['op'],d['population']),d)
        buttons=d['details']['buttons'];check(tag+' '+name+' operation controls remain visible and at least forty-four pixels high',all(b['width']>=43 and b['height']>=43 and b['x']>=0 and b['y']>=0 and b['x']+b['width']<=size['width']+1 and b['y']+b['height']<=size['height']+1 for b in buttons) and not d['interactHidden'],buttons)
        clear_world=separated(c,d['details']['controls']) if name=='landscape' else d['details']['controls']['y']>d['contactLineY'] and d['details']['hud']['y']+d['details']['hud']['height']<d['contactLineY']
        check(tag+' '+name+' keeps the arena contact line visible and the canvas inside its viewport',clear_world and 0<d['contactLineY']<size['height'] and c['y']+c['height']<=size['height']+1,d['details'])
        check(tag+' '+name+' interaction never overlaps the terminal exit button',separated(d['interact'],d['details']['leave']),{'interact':d['interact'],'leave':d['details']['leave']})
        d['hitTests']=p.locator('[data-xeno-action], [data-xt="return"], [data-xt="pause"]').evaluate_all('''es=>es.filter(e=>!e.hidden).map(e=>{const r=e.getBoundingClientRect();return{action:e.dataset.xenoAction||e.dataset.xt,points:[[r.x+2,r.y+2],[r.right-2,r.y+2],[r.x+2,r.bottom-2],[r.right-2,r.bottom-2],[r.x+r.width/2,r.y+r.height/2]].map(([x,y])=>document.elementFromPoint(x,y)?.closest('button')===e)}})''' )
        check(tag+' '+name+' every visible control keeps its full native hit area',all(all(b['points']) for b in d['hitTests']),d['hitTests'])
        atlas_receipts(p,state(p)['match']);cap(p,'01-'+tag+'-'+name+'-operation-active-en.png');results[name]=d
    check('Dynamic operation orders and integrity translate to English',all('HOLD INTERACT' in d['opText'] and 'INTEGRITY' in d['opText'] for d in results.values()))
    R['scenarios'].setdefault('responsiveOperation',{})[tag]=results;p.set_viewport_size({'width':1440,'height':1000});p.locator('[data-xt="canvas"]').focus()

def board_case(p):
    enter(p,'[data-xt-branch="operations"]');ids=[];pages=[]
    while True:
        ids+=p.locator('[data-xt-activity]').evaluate_all('(es)=>es.map(e=>e.dataset.xtActivity)')
        pages.append(p.locator('[data-xt="program-page"]').inner_text())
        if p.locator('[data-xt="program-next"]').is_disabled():break
        enter(p,'[data-xt="program-next"]')
    check('Native operation board reaches forty unique physical-objective activities',len(ids)==40 and len(set(ids))==40 and len(pages)==4,{'ids':ids,'pages':pages})
    while not p.locator('[data-xt="program-previous"]').is_disabled():enter(p,'[data-xt="program-previous"]')
    enter(p,'[data-xt="home-return"]')

def restore_operation(p):
    pause(p);release(p);paused=state(p);cp=paused['progress']['pending']['checkpointV186'];expected=protected(cp['snapshot'],cp['snapshot'].keys())
    delta=diff(expected,protected(paused['match'],cp['snapshot'].keys()))
    check('Native pause stores exact engine objective and hazard state',not delta and cp['snapshot']['operationV188']['cargoTravelTicks']>0 and cp['snapshot']['stageHazardsV188']['lastTick']==cp['tick'],delta)
    (OUT/'operation-native-checkpoint.json').write_text(json.dumps(cp,ensure_ascii=False,indent=2))
    cap(p,'02-operation-checkpoint-en.png')
    open_system(p,reload=True);open_trials(p)
    check('Real reload retains the objective checkpoint and ticket without reward',state(p)['progress']['pending']['checkpointV186']==cp and state(p)['progress']['ledger']==paused['progress']['ledger'])
    pad(p,True,buttons={10:1});enter(p,'[data-xt="restart"]')
    p.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().match?.resumedV186===true')
    restored=state(p)['match'];delta=diff(expected,protected(restored,cp['snapshot'].keys()))
    check('Reload restores the exact admitted operation and hazard snapshot in pause',restored['paused'] and not delta,delta)
    p.wait_for_timeout(180)
    check('Restored pause advances neither objective, actor nor hazard clocks',not diff(expected,protected(state(p)['match'],cp['snapshot'].keys())))
    p.set_viewport_size({'width':390,'height':844});p.wait_for_timeout(100);cap(p,'03-mobile-restored-operation-en.png');R['scenarios']['escortCheckpointLayout']=layout(p)
    p.set_viewport_size({'width':1440,'height':1000});p.locator('[data-xt="canvas"]').focus();p.keyboard.press('KeyP');wait_active(p)
    frozen=state(p)['match']['operationV188']['cargoTravelTicks'];p.wait_for_timeout(180);gated=state(p)['match']
    check('L3 held across reload and resume stays gated until neutral',gated['gamepadV186']['needsNeutral'] and not gated['fighters'][0]['previousInput']['interact'] and gated['operationV188']['cargoTravelTicks']==frozen)
    pad(p);p.wait_for_timeout(90);pad(p,buttons={10:1});p.wait_for_timeout(200);accepted=state(p)['match']
    check('Neutral then a fresh standard L3 sample reaches native objective interaction',not accepted['gamepadV186']['needsNeutral'] and accepted['fighters'][0]['previousInput']['interact'] and accepted['operationV188']['cargoTravelTicks']>frozen)
    pad(p);p.locator('[data-xt="canvas"]').focus()

class Touch:
    def __init__(self,p):self.p=p;self.session=p.context.new_cdp_session(p);self.held=False
    def use(self,enabled):
        if enabled==self.held:return
        if enabled:
            b=self.p.locator('[data-xeno-action="interact"]').bounding_box();assert b and b['width']>0
            self.session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':b['x']+b['width']/2,'y':b['y']+b['height']/2,'id':1}]})
        else:self.session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        self.held=enabled

def objective(p,label,checkpoint=False,touch=False,failure=False,limit=155):
    keys=Keys(p);toucher=Touch(p) if touch else None;deadline=time.monotonic()+limit;last=-60;cp_done=False;touch_witness=None
    p.locator('[data-xt="canvas"]').focus()
    while time.monotonic()<deadline:
        m=state(p)['match'];op=m['operationV188'];player=m['fighters'][0];atlas_receipts(p,m)
        if m['tick']-last>=60 or m['phase']=='match-over':observe(label,m);last=m['tick']
        if m['phase']=='match-over':
            keys.clear()
            if toucher:toucher.use(False)
            R['scenarios'][label]={'result':m['result'],'touchWitness':touch_witness};cap(p,label+'-result.png');return m
        if m['paused'] or m['presentation']['blocksSimulation']:
            keys.clear();p.wait_for_timeout(60);continue
        if checkpoint and not cp_done and op['cargoTravelTicks']>=180:
            keys.clear();restore_operation(p);cp_done=True;continue
        target=m['operationViewV188']['target'];b=body(p,player);wanted=set()
        if not failure:
            destination=(op['cargoX']+45) if op['operationId'].startswith('xto188-escort') else target['x']
            dx=destination-b['center'];moving=abs(dx)>35
            if moving:wanted.add('ArrowRight' if dx>0 else 'ArrowLeft')
            interact=op['operationId'].startswith('xto188-escort') or not moving
            if toucher:
                toucher.use(interact)
                if interact and player['previousInput'].get('interact') and (any(op['progress']) or any(op['delivered'])) and touch_witness is None:
                    touch_witness={'tick':m['tick'],'previousInput':player['previousInput'],'operation':op,'layout':layout(p)};cap(p,'04-mobile-native-touch-interaction-fr.png')
            elif interact:wanted.add('KeyE')
        elif op['operationId'].startswith('xto188-escort'):wanted.add('KeyS')
        keys.use(wanted);p.wait_for_timeout(60)
    keys.clear()
    if toucher:toucher.use(False)
    raise AssertionError('Native objective controller exceeded its real time budget '+label)

def settle_reload(p,label,before,m,expect_win=True):
    p.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
    won=state(p)['progress'];id=m['config']['operationV188']['id'];cleared=won['modesV119']['operationsCleared']
    check(label+' settles exactly one ticket with its actual outcome',len(won['ledger'])==len(before['ledger'])+1 and won['ledger'][-1]['winner']==('player' if expect_win else 'opponent') and (id in cleared)==expect_win,{'ledger':won['ledger'][-1],'cleared':cleared,'credits':won['credits']})
    open_system(p,reload=True);open_trials(p)
    check(label+' reload preserves the result without awarding it twice',state(p)['progress']==won and state(p)['match'] is None)

def escort_case(browser):
    c,p=setup(browser,'escort',language='en')
    try:
        board_case(p);start_operation(p,'xto188-escort-1');before=state(p)['progress'];cap(p,'01-operation-briefing-active-en.png')
        R['scenarios']['escortDesktopLayout']=layout(p);responsive_operation(p)
        m=objective(p,'escort-native-win',checkpoint=True)
        check('Escort is won by cargo interaction while live enemies remain',m['result']['winner']=='player' and m['operationV188']['cargoX']==1250 and m['hordeV180']['alive']>0 and m['hordeV180']['totalKills']==0,m['result'])
        settle_reload(p,'Escort victory',before,m)
    finally:close(c,p)

def nine_controls_case(browser):
    c,p=setup(browser,'nine-controls',mobile=True,language='en')
    try:
        enter(p,'[data-xt-branch="operations"]');choose_protocol(p,'xto188-escort-1')
        fighter_id='drive-v123-fte-pathogen-brute-profile-v13'
        label=subprocess.check_output(['node','--input-type=module','-e',"import{getXenoTrialsFighterV96}from'./src/xeno-trials-data-v96.js';console.log(getXenoTrialsFighterV96('"+fighter_id+"').label)"],cwd=REPO,text=True).strip()
        p.locator('[data-xt="search"]').fill(label)
        enter(p,'[data-xt-unlock="'+fighter_id+'"]');enter(p,'[data-xt-fighter="'+fighter_id+'"]')
        enter(p,'[data-xt="confirm-fighters"]');enter(p,'[data-xt="start"]');wait_active(p)
        check('A native purchased super-capable fighter exposes all nine operation controls',p.locator('[data-xeno-action]:visible').count()==9 and p.locator('[data-xeno-action="super"]').is_visible())
        responsive_operation(p,'nine-controls');pause(p);enter(p,'[data-xt="abandon-overlay"]')
        p.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
        R['scenarios']['nineControlsProbe']={'partial':True,'fighterId':fighter_id,'ending':'native abandonment, no victory claim'}
    finally:close(c,p)

def extraction_case(browser):
    c,p=setup(browser,'extraction',mobile=True,language='fr')
    try:
        start_operation(p,'xto188-extraction-1');before=state(p)['progress'];combat=clear_contacts(p)
        check('Extraction pressure is cleared through actual keyboard combat',combat['hordeV180']['phase']=='complete' and combat['hordeV180']['totalKills']==12,{'tick':combat['tick'],'hp':combat['fighters'][0]['hp']})
        check('French operation HUD gives parcel and interaction instructions', 'caissons livrés' in p.locator('[data-xt="operation-progress-value"]').inner_text() and 'maintenez E' in p.locator('[data-xt="operation-hint"]').inner_text())
        m=objective(p,'extraction-native-win',touch=True)
        check('Native touch interaction collects, deposits all three parcels and opens the extraction exit',m['result']['winner']=='player' and all(m['operationV188']['delivered']) and m['operationV188']['carrying']==-1 and m['operationV188']['exitTicks']==180 and R['scenarios']['extraction-native-win']['touchWitness'] is not None,m['result'])
        settle_reload(p,'Extraction victory',before,m)
    finally:close(c,p)

def failure_cases(browser):
    for kind in ['escort','extraction']:
        c,p=setup(browser,kind+'-failure',language='en')
        try:
            start_operation(p,'xto188-'+kind+'-1',queen=False);before=state(p)['progress'];m=objective(p,kind+'-native-loss',failure=True)
            check(kind+' naturally fails under enemy or structural pressure',m['result']['winner']=='opponent' and m['operationV188']['status']=='failed' and m['operationV188']['failureReason'] in ['player-ko','structure-destroyed','time'],m['result'])
            settle_reload(p,kind+' failure',before,m,False)
        finally:close(c,p)

def hazard_case(browser):
    c,p=setup(browser,'hazards')
    try:
        start_operation(p,'xto188-escort-1');m=clear_contacts(p);check('Hazard probe clears only enemies and keeps its objective active',m['operationV188']['status']=='active' and m['hordeV180']['phase']=='complete')
        keys=Keys(p);baseline=m['stageHazardsV188']['playerDamage'];hit=None;avoid=None;deadline=time.monotonic()+55
        p.locator('[data-xt="canvas"]').focus()
        while time.monotonic()<deadline:
            m=state(p)['match'];haz=m.get('stageHazardViewV188');b=body(p,m['fighters'][0])
            if m['result']:raise AssertionError('Hazard probe reached an unintended terminal outcome')
            if m['stageHazardsV188']['playerDamage']>baseline and hit is None:
                hit={'tick':m['tick'],'damage':m['stageHazardsV188']['playerDamage']-baseline,'hp':m['fighters'][0]['hp'],'hazard':haz};cap(p,'05-native-hazard-contact.png');keys.clear()
            if not haz or not haz['zones']:keys.clear();p.wait_for_timeout(50);continue
            zone=haz['zones'][0]
            if hit is None:destination=(zone['left']+zone['right'])/2
            else:
                destination=100 if (zone['left']+zone['right'])/2>650 else 1250
                if haz['cycle']>hit['hazard']['cycle'] and haz['phase']=='warning' and avoid is None:
                    avoid={'cycle':haz['cycle'],'startsDamage':m['stageHazardsV188']['playerDamage'],'warningTick':m['tick'],'from':b};cap(p,'06-native-hazard-warning-dodge.png')
            dx=destination-b['center'];keys.use(['ArrowRight' if dx>0 else 'ArrowLeft'] if abs(dx)>30 else [])
            if avoid and haz['cycle']==avoid['cycle'] and haz['phase']=='active' and haz['remainingTicks']<10:
                keys.clear();avoid.update({'endTick':m['tick'],'endsDamage':m['stageHazardsV188']['playerDamage'],'body':b,'hazard':haz});break
            p.wait_for_timeout(50)
        keys.clear();R['scenarios']['hazards']={'contact':hit,'dodge':avoid}
        check('A real stage contact reduces player HP by its accepted environmental damage',hit is not None and hit['damage']==6,hit)
        check('Native movement during the next warning avoids the whole active hazard',avoid is not None and 'endTick' in avoid and avoid['startsDamage']==avoid['endsDamage'] and (avoid['body']['right']<=avoid['hazard']['zones'][0]['left'] or avoid['body']['left']>=avoid['hazard']['zones'][0]['right']),avoid)
        pause(p);cap(p,'07-native-hazard-pause.png')
    finally:close(c,p)

def legacy_case(browser):
    c,p=setup(browser,'legacy')
    try:
        enter(p,'[data-xt-branch="horde"]');p.locator('[data-xt="program-filter"]').select_option('standard');choose_protocol(p,'xth180-incoming-1')
        p.locator('[data-xt="search"]').fill(subprocess.check_output(['node','--input-type=module','-e',"import{getXenoTrialsFighterV96}from'./src/xeno-trials-data-v96.js';console.log(getXenoTrialsFighterV96('queen').label)"],cwd=REPO,text=True).strip());enter(p,'[data-xt-unlock="queen"]');enter(p,'[data-xt-fighter="queen"]');enter(p,'[data-xt="confirm-fighters"]');enter(p,'[data-xt="start"]');wait_active(p)
        initial=state(p)['match'];pad(p,True);p.wait_for_timeout(80);pad(p,buttons={10:1});p.wait_for_timeout(100);sample=state(p)['match'];pad(p)
        check('Legacy horde keeps eight input fields and hides the new operation controls',len(sample['fighters'][0]['previousInput'])==8 and 'operationV188' not in sample and 'stageHazardsV188' not in sample and p.locator('[data-xeno-action="interact"]').is_hidden())
        m=clear_contacts(p);check('Native combat still wins the historical twelve-enemy two-wave horde',m['result']['winner']=='player' and m['result']['hordeV180']['kills']==12 and m['hordeV180']['wave']==2,m['result']);cap(p,'08-legacy-horde-native-win.png')
    finally:close(c,p)

with sync_playwright() as pw:
    launch={'headless':True}
    if os.environ.get('ATF_CHROMIUM_EXECUTABLE'):launch['executable_path']=os.environ['ATF_CHROMIUM_EXECUTABLE']
    browser=pw.chromium.launch(**launch);R['browser']=browser.version
    try:
        for mode,case in [('escort',escort_case),('controls',nine_controls_case),('extraction',extraction_case),('failures',failure_cases),('hazard',hazard_case),('legacy',legacy_case)]:
            if a.mode in [mode,'all']:case(browser)
        check('Real native play draws at least one reviewed sprite atlas frame',bool(R.get('atlasWitnesses')),list(R.get('atlasWitnesses',{})))
        check('No browser exceptions or missing HTTP assets occur',not R['pageErrors'] and not R['httpErrors'],{'pageErrors':R['pageErrors'],'httpErrors':R['httpErrors']})
        failures=[r for r in R['requestFailures'] if r['failure']!='net::ERR_ABORTED'];check('Only page-navigation cancellation may interrupt requests',not failures,failures)
        R['status']='passed'
    except Exception as e:
        R['status']='failed';R['error']=str(e)
        for c in browser.contexts:
            for p in c.pages:
                try:R['failureState']=state(p);cap(p,'failure.png')
                except Exception:pass
        raise
    finally:
        (OUT/'report.json').write_text(json.dumps(R,ensure_ascii=False,indent=2));browser.close()
