"""V189 native animation and audio QA.
Fresh contexts import an ordinary save with 30000 Trials credits, setup complete,
and music/effects preferences; every profile purchase uses the native UI.
Keyboard/pointer input is trusted Chromium input. One standard Gamepad API is a
reported fixture. A volume fixture dispatches the existing settings change handler.
Read-only snapshots, geometry and native WebAudio CDP events supply evidence.
No match actor, position, velocity, HP, clock, RNG, attack or result is injected.
Partial animation entries are distinct from the completed audio horde victory.
"""
import argparse, json, time, subprocess, hashlib, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
P = argparse.ArgumentParser()
P.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
P.add_argument('--output', type=Path, required=True)
P.add_argument('--mode', choices=['coverage','motion','combat','audio','controls','all'], default='all')
P.add_argument('--fighters', default='')
a = P.parse_args()
REPO = Path(os.environ.get('ATF_QA_REPO', Path(__file__).resolve().parents[1])).resolve()
OUT = a.output.resolve()
if OUT == REPO or REPO in OUT.parents:
    raise SystemExit('Keep browser evidence outside the repository.')
OUT.mkdir(parents=True, exist_ok=True)
R={'status':'running','checks':[],'captures':[],'pageErrors':[],'httpErrors':[],'requestFailures':[],'observations':[],'scenarios':{},'fixtures':['Ordinary save imported through native System UI with 30000 Trials credits, QA name, setup complete, music0/effects0.7. Profiles remain locked until real UI purchases.','A simulated standard Gamepad API for one movement case; not a physical controller.','Global effects volume changes may dispatch change on the real setting control while combat runs; no AudioDirector method is called.'],'limits':['Automated local Chromium inputs and actual WebAudio graph diagnostics; no physical listening qualification.','Partial motion/combat entries and roster coverage are distinct from complete victories.','No match actor, position, velocity, HP, clock, RNG, attack, director or result is injected.']}
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
    code="import{createDefaultSave}from'./src/save.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name='QA_ANIM_V189';s.settings.music=0;s.settings.effects=.7;s.scene='command';s.xenoTrialsV96.credits=30000;console.log(JSON.stringify(s));"
    raw=subprocess.check_output(['node','--input-type=module','-e',code],cwd=REPO)
    (OUT/'credit-fixture.json').write_bytes(raw)
    R['creditFixture']={'file':'credit-fixture.json','sha256':hashlib.sha256(raw).hexdigest(),'credits':30000,'player':'QA_ANIM_V189','queenStartsLocked':True}
    p.locator('#save-import').set_input_files({'name':'credit-fixture.json','mimeType':'application/json','buffer':raw})
    p.wait_for_function("globalThis.__ATF_V51__?.saveSystem.data.player.name==='QA_ANIM_V189'")

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


def profiles():
    code="import{XENO_TRIALS_FIGHTERS_V96 as F,getXenoTrialsArtV96}from'./src/xeno-trials-data-v96.js';console.log(JSON.stringify(F.map(f=>({id:f.id,label:f.label,hp:f.hp,family:f.family,profileId:f.profileId,artPath:getXenoTrialsArtV96(f.id).path}))));"
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=REPO,text=True))
CATALOG=profiles();BY_ID={f['id']:f for f in CATALOG}

class AudioGraph:
    def __init__(self,p):
        self.cdp=p.context.new_cdp_session(p);self.events=[]
        for name in ['contextCreated','contextChanged','contextWillBeDestroyed','audioNodeCreated','audioNodeWillBeDestroyed','nodesConnected','nodesDisconnected']:
            self.cdp.on('WebAudio.'+name,lambda data,name=name:self.events.append({'event':name,'data':data,'wallSeconds':time.monotonic()}))
        self.cdp.send('WebAudio.enable')
    def created(self,kind=None):
        return [e for e in self.events if e['event']=='audioNodeCreated' and (kind is None or e['data']['node']['nodeType']==kind)]
    def contexts(self):
        return [e['data']['context'] for e in self.events if e['event']=='contextCreated']
    def save(self,name):
        (OUT/name).write_text(json.dumps(self.events,ensure_ascii=False,indent=2))

def setup(browser,label,mobile=False,language='en',audio_graph=False):
    c=browser.new_context(viewport={'width':390,'height':844} if mobile else {'width':1440,'height':1000},is_mobile=mobile,has_touch=True,service_workers='block')
    c.add_init_script(PAD);p=c.new_page();hook(p);graph=AudioGraph(p) if audio_graph else None
    p.goto(a.base,wait_until='domcontentloaded');p.locator('#title-start').wait_for(state='visible',timeout=45000)
    if graph:
        p.wait_for_timeout(200);check('Native WebAudio creates no context or node before the first user gesture',not graph.events,list(graph.events))
    p.locator('#title-start').click();p.locator('#title-options').click();p.wait_for_timeout(350);fixture(p)
    p.locator('#language-select-v185').select_option(language);open_trials(p)
    return c,p,graph

def buy_profile(p,id):
    p.locator('[data-xt="search"]').fill(BY_ID[id]['label']);before=state(p)['progress']
    if id not in before['unlocked']:
        enter(p,'[data-xt-unlock="'+id+'"]');after=state(p)['progress']
        assert id in after['unlocked'] and after['credits']<before['credits']
        R.setdefault('purchases',[]).append({'id':id,'cost':before['credits']-after['credits']})
    enter(p,'[data-xt-fighter="'+id+'"]')

def start_duel(p,id,opponent='ultramorph'):
    enter(p,'[data-xt-branch="on-demand"]')
    p.locator('[name="opponentFamily"]').select_option(BY_ID[opponent]['family'])
    p.locator('[name="opponentId"]').select_option(opponent);p.locator('[name="difficulty"]').select_option('easy')
    enter(p,'[data-xt="confirm-target"]');buy_profile(p,id);enter(p,'[data-xt="confirm-fighters"]');enter(p,'[data-xt="start"]');wait_active(p)
    p.locator('[data-xt="canvas"]').focus()

def close(c,p):
    if sys.exc_info()[0]:
        try:R.setdefault('scenarioFailureStates',[]).append(state(p));cap(p,'failure-'+str(len(R['scenarioFailureStates']))+'.png')
        except Exception:pass
    c.close()

def abandon(p,label):
    release(p);m=state(p)['match']
    if not m['paused']:pause(p)
    enter(p,'[data-xt="abandon-overlay"]');p.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
    R['scenarios'].setdefault(label,{})['ending']='Native abandonment after partial verification; no complete-match victory claimed.'

def receipt(m,id,revision=189):
    key='spriteAtlasV'+str(revision)
    return next((r for r in m.get('rigViewsV154',[]) if r.get(key,{}).get('fighterId')==id),None)

def witness(p,label,m):
    seen=R.setdefault('drawnWitnesses',{})
    for r in m.get('rigViewsV154',[]):
        for revision in [188,189]:
            a=r.get('spriteAtlasV'+str(revision))
            if not a:continue
            k=str(revision)+':'+a['fighterId']+':'+a['frameId']
            if k not in seen:seen[k]={'scenario':label,'tick':m['tick'],'receipt':r,'player':{f:m['fighters'][0][f] for f in ['id','x','y','vy','hp','facing']},'camera':m['cameraV119']}

def director(p):
    return p.evaluate("()=>{const a=globalThis.__ATF_AUDIO_V77__;return{enabled:a?.enabled,state:a?.context?.state||'uncreated',gain:a?.master?.gain?.value||0,volumes:{...a?.volumes},effects:a?.effectVoices?.size,music:a?.musicVoices?.size,timers:a?.timers?.size}}")

def setting_effects(p,value):
    p.locator('#setting-effects').evaluate('(e,v)=>{e.value=String(v);e.dispatchEvent(new Event("change",{bubbles:true}));}',value)
    p.wait_for_timeout(90)
    assert p.evaluate('()=>__ATF_V51__.saveSystem.data.settings.effects')==value

def fight_until(p,label,predicate,limit=90):
    keys=Keys(p);heavy=-500;light=-500;deadline=time.monotonic()+limit
    p.locator('[data-xt="canvas"]').focus()
    while time.monotonic()<deadline:
        m=state(p)['match'];witness(p,label,m)
        if predicate(m):keys.clear();return m
        if m['phase']=='match-over':keys.clear();return m
        if m['paused'] or m['presentation']['blocksSimulation'] or m['hordeV180']['phase']!='active' or len(m['fighters'])<2:
            keys.clear();p.wait_for_timeout(50);continue
        player=m['fighters'][0];enemy=min(m['fighters'][1:],key=lambda f:abs(f['x']-player['x']))
        gap=p.evaluate("async fighters=>{const e=fighters.slice(1).sort((a,b)=>Math.abs(a.x-fighters[0].x)-Math.abs(b.x-fighters[0].x))[0];return(await import('/src/xeno-trials-geometry-v105.js')).getXenoTrialsBodyGapV105(fighters[0],e);}",m['fighters'])
        keys.use(['ArrowRight' if enemy['x']>player['x'] else 'ArrowLeft'] if gap>40 else [])
        if gap<125 and not player['attack'] and player['stun']<=0:
            if m['tick']-heavy>=180 and player['stamina']>=25:p.keyboard.press('KeyK',delay=45);heavy=m['tick']
            elif m['tick']-light>=180 and m['tick']-heavy>=75 and player['stamina']>=12:p.keyboard.press('KeyJ',delay=45);light=m['tick']
        p.wait_for_timeout(50)
    keys.clear();raise AssertionError('Native combat time budget exceeded '+label)

def audio_case(browser):
    c,p,g=setup(browser,'audio',language='fr',audio_graph=True)
    try:
        enter(p,'[data-xt-branch="horde"]');p.locator('[data-xt="program-filter"]').select_option('standard');choose_protocol(p,'xth180-incoming-1');buy_profile(p,'queen')
        enter(p,'[data-xt="confirm-fighters"]');enter(p,'[data-xt="start"]');wait_active(p)
        watch(p,5,lambda s:s['match']['audioV189']['status']=='running')
        initial=state(p)['match'];d=director(p)
        check('Trials uses the native shared WebAudio context after a trusted UI gesture',initial['audioV189']['usingSharedContext'] and initial['audioV189']['contextState']=='running' and len(g.contexts())==1,{'audio':initial['audioV189'],'director':d,'contexts':g.contexts()})
        check('Global effect volume reaches the actual shared gain',abs(d['gain']-.7*.26)<1e-6 and abs(initial['audioV189']['gain']-d['gain'])<1e-6,{'audio':initial['audioV189'],'director':d})
        heard=fight_until(p,'audio',lambda m:m['audioV189']['counts']['hit']+m['audioV189']['counts']['hurt']>0 and m['audioV189']['counts']['heavy']>0)
        check('Accepted native attacks and contacts create real oscillator nodes',len(g.created('Oscillator'))>0 and heard['audioV189']['emittedCues']>0 and heard['audioV189']['activeVoices']<=8,{'audio':heard['audioV189'],'serial':heard['serial'],'nodeTypes':[e['data']['node']['nodeType'] for e in g.created()]})
        pause(p);frozen=state(p)['match'];p.wait_for_timeout(150)
        check('Pause disconnects Trials voices while retaining the running shared context',frozen['audioV189']['activeVoices']==0 and not frozen['audioV189']['humActive'] and director(p)['state']=='running',frozen['audioV189'])
        check('French pause exposes its localized native audio mute action',p.locator('[data-xt="audio-toggle"]').inner_text()=='COUPER LES SONS DE TRIALS')
        enter(p,'[data-xt="audio-toggle"]');check('French muted pause offers its localized enable action',p.locator('[data-xt="audio-toggle"]').inner_text()=='ACTIVER LES SONS DE TRIALS');enter(p,'[data-xt="resume-overlay"]');wait_active(p)
        muted_before=state(p)['match']['audioV189'];p.keyboard.press('KeyK',delay=45);p.wait_for_timeout(350);muted=state(p)['match']['audioV189']
        check('Native pause mute suppresses combat cues and leaves no audio voices',muted['enabled']==False and muted['status']=='muted' and muted['activeVoices']==0 and muted['emittedCues']==muted_before['emittedCues'],muted)
        pause(p);enter(p,'[data-xt="audio-toggle"]');enter(p,'[data-xt="resume-overlay"]');wait_active(p)
        setting_effects(p,0);zero=state(p)['match']['audioV189'];d0=director(p)
        check('The declared global-volume control fixture mutes the real master gain and Trials graph',d0['gain']==0 and zero['gain']==0 and zero['activeVoices']==0 and zero['status']=='muted',{'audio':zero,'director':d0})
        setting_effects(p,.35);half=state(p)['match']['audioV189'];dh=director(p)
        check('Restoring the global effect volume scales the real gain without replaying queued cues',abs(dh['gain']-.35*.26)<1e-6 and half['status']=='running' and half['activeVoices']<=8,{'audio':half,'director':dh})
        pause(p);saved=state(p);cp=saved['progress']['pending']['checkpointV186'];(OUT/'audio-native-checkpoint.json').write_text(json.dumps(cp,ensure_ascii=False,indent=2));cap(p,'audio-native-pause-fr.png')
        open_system(p,reload=True);open_trials(p);enter(p,'[data-xt="restart"]');p.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().match?.resumedV186===true')
        restored=state(p)['match'];p.wait_for_timeout(180);restored2=state(p)['match']
        check('A real checkpoint reload primes old event serials and plays no historic cues',restored2['paused'] and restored2['audioV189']['emittedCues']==0 and restored2['audioV189']['activeVoices']==0 and restored2['audioV189']['consumedSerial']==cp['snapshot']['serial'] and restored2['tick']==cp['tick'],{'audio':restored2['audioV189'],'checkpointSerial':cp['snapshot']['serial'],'tick':cp['tick']})
        enter(p,'[data-xt="resume-overlay"]');wait_active(p)
        ended=fight_until(p,'audio',lambda m:m['phase']=='match-over')
        check('Native horde combat reaches a real twelve-enemy victory with bounded audio voices',ended['result']['winner']=='player' and ended['result']['hordeV180']['kills']==12 and ended['audioV189']['activeVoices']<=8,{'result':ended['result'],'audio':ended['audioV189']})
        p.wait_for_timeout(350);before_leave=state(p)['match']['audioV189'];enter(p,'[data-xt="return"]');p.wait_for_timeout(150)
        check('Leaving Trials keeps the shared audio context alive',director(p)['state']=='running' and state(p)['match'] is None,{'director':director(p),'lastAudio':before_leave})
        R['scenarios']['audio']={'initial':initial['audioV189'],'nativeCues':heard['audioV189'],'muted':muted,'zero':zero,'half':half,'restored':restored2['audioV189'],'final':before_leave,'graphEvents':len(g.events),'result':ended['result']}
        g.save('native-web-audio-graph.json')
    finally:close(c,p)

def watch(p,seconds,condition):
    end=time.monotonic()+seconds
    while time.monotonic()<end:
        s=state(p)
        if condition(s):return s
        p.wait_for_timeout(30)
    raise AssertionError('Native observation condition not reached in budget')

def motion_case(browser):
    for id in ['warrior','runner','prowler','spitter']:
        c,p,g=setup(browser,'motion-'+id)
        try:
            start_duel(p,id,opponent='smasher');start=state(p)['match'];seen={};deadline=time.monotonic()+12
            if id=='runner':pad(p,True);p.wait_for_timeout(60);pad(p);p.wait_for_timeout(60);pad(p,axis=-1)
            else:p.keyboard.down('ArrowLeft')
            while time.monotonic()<deadline:
                m=state(p)['match'];witness(p,'motion-'+id,m);r=receipt(m,id)
                if r and r['spriteAtlasV189']['kind']=='motion':
                    frame=r['spriteAtlasV189']['frameId']
                    if frame.startswith('walk-'):seen.setdefault(frame,{'tick':m['tick'],'x':m['fighters'][0]['x'],'receipt':r})
                if len(seen)==8:break
                p.wait_for_timeout(15)
            check(id+' visits all eight drawn walk frames through real displacement',set(seen)=={'walk-'+str(n) for n in range(8)} and m['fighters'][0]['x']<start['fighters'][0]['x']-20,seen)
            pause(p);release(p)
            if id=='runner':pad(p)
            frozen=state(p)['match'];p.wait_for_timeout(200);still=state(p)['match']
            check(id+' pause freezes the actual simulation and last drawn pose',still['tick']==frozen['tick'] and still['rigViewsV154']==frozen['rigViewsV154'])
            enter(p,'[data-xt="resume-overlay"]');wait_active(p);p.locator('[data-xt="canvas"]').focus();x=state(p)['match']['fighters'][0]['x'];p.keyboard.down('ArrowLeft')
            moved=watch(p,3,lambda z:z['match']['fighters'][0]['x']<x-20);p.keyboard.up('ArrowLeft')
            check(id+' resume continues its native movement clock',moved['match']['tick']>frozen['tick'] and receipt(moved['match'],id) is not None)
            p.wait_for_timeout(80)
            if id=='runner':pad(p,buttons={0:1});p.wait_for_timeout(60);pad(p)
            else:p.keyboard.press('Space',delay=35)
            air={};landed=None;deadline=time.monotonic()+4
            while time.monotonic()<deadline:
                m=state(p)['match'];witness(p,'motion-'+id,m);f=m['fighters'][0];r=receipt(m,id)
                if r and r['spriteAtlasV189']['frameId'] in ['air-rise','air-fall']:
                    phase=r['spriteAtlasV189']['frameId'];air.setdefault(phase,{'tick':m['tick'],'y':f['y'],'vy':f['vy'],'receipt':r})
                    if phase=='air-fall' and id=='runner' and 'motion-runner-air.png' not in R['captures']:cap(p,'motion-runner-air.png')
                if len(air)==2 and f['y']==0:landed=m;break
                p.wait_for_timeout(15)
            check(id+' jump selects rise and fall from real native vertical velocity',len(air)==2 and air['air-rise']['vy']>0 and air['air-fall']['vy']<=0 and all(not a['receipt']['spriteAtlasV189']['grounded'] and not a['receipt']['supports'] for a in air.values()),air)
            check(id+' landing returns to its existing combat idle without aerial floor supports',landed is not None and receipt(landed,id) is None and receipt(landed,id,188) is not None,{'tick':landed and landed['tick'],'receipt188':landed and receipt(landed,id,188)})
            old_phases={};p.keyboard.press('KeyK',delay=35);deadline=time.monotonic()+3
            while time.monotonic()<deadline:
                attack_state=state(p)['match'];witness(p,'motion-'+id,attack_state);old=receipt(attack_state,id,188)
                if old and old['spriteAtlasV188']['phase'] in ['windup','contact','recovery','hurt','guard','ko']:old_phases.setdefault(old['spriteAtlasV188']['phase'],{'tick':attack_state['tick'],'receipt':old,'attack':attack_state['fighters'][0]['attack'],'hp':attack_state['fighters'][0]['hp']})
                if old_phases:break
                p.wait_for_timeout(15)
            check(id+' keeps its existing V188 combat reaction ahead of the new motion layer',bool(old_phases),old_phases)
            R['scenarios']['motion-'+id]={'walkFrames':seen,'air':air,'landedTick':landed['tick'],'oldCombatPhases':old_phases};cap(p,'motion-'+id+'-landed.png');abandon(p,'motion-'+id)
        finally:close(c,p)

def queen_jump(p):
    before=state(p)['match'];f=before['fighters'][0]
    metrics=p.evaluate("async id=>(await import('/src/xeno-trials-scale-v110.js')).getXenoTrialsRenderMetricsV110(id)",f['id'])
    p.keyboard.press('Space',delay=35);air=[];deadline=time.monotonic()+4
    while time.monotonic()<deadline:
        m=state(p)['match'];f=m['fighters'][0]
        if f['y']>0:
            b=p.evaluate("async f=>(await import('/src/xeno-trials-geometry-v105.js')).getXenoTrialsBodyBoundsV105(f)",f)
            row={'tick':m['tick'],'y':f['y'],'vy':f['vy'],'bodyHeight':b['top']-b['bottom'],'nativeHeadCanvasY':453.6-(f['y']+metrics['visibleHeight'])*m['cameraV119']['zoom'],'camera':m['cameraV119'],'rigs':m['rigViewsV154']};air.append(row)
            if f['y']>50 and 'queen-native-source-jump.png' not in R['captures']:cap(p,'queen-native-source-jump.png')
        elif air:break
        p.wait_for_timeout(20)
    check('Queen native jump keeps its physical body height and full source above the camera edge',air and max(x['y'] for x in air)>30 and max(x['bodyHeight'] for x in air)-min(x['bodyHeight'] for x in air)<1e-7 and all(x['nativeHeadCanvasY']>=95 for x in air),air)
    R['scenarios']['queenJump']={'metrics':metrics,'samples':air}

def combat_case(browser):
    ids=a.fighters.split(',') if a.fighters else ['queen','crusher-acm','ravager','burster']
    for id in ids:
        c,p,g=setup(browser,'combat-'+id)
        try:
            start_duel(p,id,opponent='ultramorph')
            if id=='queen':queen_jump(p)
            phases={};guard=None;hurt=None;fall=None;deadline=time.monotonic()+4;p.keyboard.down('KeyS')
            while time.monotonic()<deadline:
                m=state(p)['match'];witness(p,'combat-'+id,m);r=receipt(m,id)
                if r and r['spriteAtlasV189']['frameId']=='guard':guard=r;break
                p.wait_for_timeout(20)
            p.keyboard.up('KeyS');check(id+' renders its new native guard drawing',guard is not None,guard)
            keys=Keys(p);last_attack=-1000;deadline=time.monotonic()+12
            while time.monotonic()<deadline:
                m=state(p)['match'];witness(p,'combat-'+id,m);f=m['fighters'][0];r=receipt(m,id)
                if r and r['spriteAtlasV189']['frameId']=='hit-recoil' and f['hp']<BY_ID[id]['hp']:hurt=hurt or {'tick':m['tick'],'hp':f['hp'],'receipt':r}
                if r and r['spriteAtlasV189']['phase'] in ['windup','contact','recovery']:phases.setdefault(r['spriteAtlasV189']['phase'],{'tick':m['tick'],'receipt':r,'attack':f['attack']})
                if len(phases)==3:break
                if f['hp']<=0:break
                fighters=m['fighters'];gap=p.evaluate("async fs=>(await import('/src/xeno-trials-geometry-v105.js')).getXenoTrialsBodyGapV105(fs[0],fs[1])",fighters)
                keys.use(['ArrowRight' if fighters[1]['x']>f['x'] else 'ArrowLeft'] if gap>30 else [])
                if gap<125 and not f['attack'] and f['stun']<=0 and m['tick']-last_attack>=180:p.keyboard.press('KeyK',delay=35);last_attack=m['tick']
                p.wait_for_timeout(15)
            keys.clear();check(id+' uses its new drawn windup, contact and recovery for a real accepted attack',len(phases)==3,phases)
            ko=None;deadline=time.monotonic()+85
            while time.monotonic()<deadline:
                m=state(p)['match'];witness(p,'combat-'+id,m);r=receipt(m,id)
                if r and r['spriteAtlasV189']['frameId']=='hit-recoil' and m['fighters'][0]['hp']<BY_ID[id]['hp']:hurt=hurt or {'tick':m['tick'],'hp':m['fighters'][0]['hp'],'receipt':r}
                if r and r['spriteAtlasV189']['frameId']=='ko-fall' and m['fighters'][0]['hp']<=0:fall=fall or {'tick':m['tick'],'receipt':r}
                if r and r['spriteAtlasV189']['frameId']=='ko-ground' and m['fighters'][0]['hp']<=0:ko={'tick':m['tick'],'receipt':r,'hp':m['fighters'][0]['hp'],'roundWinner':m.get('roundWinner'),'phase':m['phase']};break
                p.wait_for_timeout(25)
            check(id+' native HP loss triggers the new recoil drawing',hurt is not None,hurt)
            check(id+' natural defeat draws its falling KO before the body rests',fall is not None,fall)
            check(id+' naturally reaches its new grounded KO drawing after enemy damage',ko is not None and ko['receipt']['spriteAtlasV189']['fullProne'] and ko['receipt']['bounds']['bottom']<=453,ko)
            cap(p,'combat-'+id+'-native-ko.png');R['scenarios']['combat-'+id]={'guard':guard,'attackPhases':phases,'hurt':hurt,'fall':fall,'ko':ko};abandon(p,'combat-'+id)
        finally:close(c,p)

def coverage_case(browser):
    data=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{getXenoTrialsAnimationCoverageListV189 as L,getXenoTrialsAnimationCoverageSummaryV189 as S}from'./src/xeno-trials-animation-coverage-v189.js';console.log(JSON.stringify({entries:L(),summary:S()}));"],cwd=REPO,text=True))
    expected={e['id']:e for e in data['entries']};c,p,g=setup(browser,'coverage',mobile=True)
    try:
        enter(p,'[data-xt-branch="on-demand"]');enter(p,'[data-xt="confirm-target"]');cards=[];pages=[]
        while True:
            rows=p.locator('[data-xt-fighter]').evaluate_all("""es=>es.map(e=>({id:e.dataset.xtFighter,label:e.querySelector('strong')?.textContent,badge:e.querySelector('.xt-motion-status-v189')?.textContent,path:e.querySelector('svg image')?.getAttribute('href')||e.querySelector('img')?.getAttribute('src')}))""")
            assert len(rows)<=40;cards+=rows;pages.append(p.locator('[data-xt="roster-page"]').inner_text())
            if p.locator('[data-xt="roster-next"]').is_disabled():break
            enter(p,'[data-xt="roster-next"]')
        check('All 189 native profile identities are reachable exactly once in five batches of forty',len(cards)==189 and len(pages)==5 and [r['id'] for r in cards]==[f['id'] for f in CATALOG],{'pages':pages,'ids':[r['id'] for r in cards]})
        labels={'Gestes dessinés':'Drawn motions','Gestes articulés':'Articulated motions','Posture de référence':'Reference pose'}
        check('Each native card badge and portrait source belongs to its exact identity',all(r['badge']==labels[expected[r['id']]['playerLabel']] and r['path']==BY_ID[r['id']]['artPath'] for r in cards),cards)
        last=cards[-1]['id'];enter(p,'[data-xt-fighter="'+last+'"]');portrait=p.locator('[data-xt="portraits"] figure').first.evaluate("""e=>({path:e.querySelector('svg image')?.getAttribute('href')||e.querySelector('img')?.getAttribute('src'),text:e.textContent})""")
        check('Selecting a profile from the final batch updates its exact native dossier portrait',portrait['path']==BY_ID[last]['artPath'] and p.locator('[data-xt-fighter="'+last+'"]').get_attribute('aria-pressed')=='true',{'selectedId':last,'portrait':portrait})
        p.locator('[data-xt="animation"]').select_option('drawn');drawn=p.locator('[data-xt-fighter]').evaluate_all('(es)=>es.map(e=>e.dataset.xtFighter)');drawn_expected=[e['id'] for e in data['entries'] if e['hasDrawnGestures']]
        check('The native drawn-motion filter includes only the admitted exact-profile sources',drawn==drawn_expected and len(drawn)==data['summary']['drawnProfiles'],{'ids':drawn,'summary':data['summary']})
        enter(p,'[data-xt="roster-selection"]')
        check('Find selection clears the motion filter and reveals the final-batch identity',p.locator('[data-xt="animation"]').input_value()=='all' and p.locator('[data-xt-fighter="'+last+'"]').count()==1 and p.locator('[data-xt-fighter="'+last+'"]').get_attribute('aria-pressed')=='true')
        p.locator('[data-xt="animation"]').select_option('drawn');enter(p,'[data-xt="reset-filters"]')
        check('Reset filters preserves selection and restores the complete native roster',p.locator('[data-xt="animation"]').input_value()=='all' and '189 / 189' in p.locator('[data-xt="count"]').inner_text())
        cap(p,'coverage-mobile-filter-reset-en.png');R['scenarios']['coverage']={'pages':pages,'cards':cards,'drawnIds':drawn,'summary':data['summary'],'lastSelection':last,'portrait':portrait}
    finally:close(c,p)

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
        witness(p,'controls',state(p)['match']);cap(p,'01-'+tag+'-'+name+'-operation-active-en.png');results[name]=d
    check('Dynamic operation orders and integrity translate to English',all('HOLD INTERACT' in d['opText'] and 'INTEGRITY' in d['opText'] for d in results.values()))
    R['scenarios'].setdefault('responsiveOperation',{})[tag]=results;p.set_viewport_size({'width':1440,'height':1000});p.locator('[data-xt="canvas"]').focus()


def nine_controls_case(browser):
    c,p,g=setup(browser,'nine-controls',mobile=True,language='en')
    try:
        enter(p,'[data-xt-branch="operations"]');choose_protocol(p,'xto188-escort-1')
        fighter_id='drive-v123-fte-pathogen-brute-profile-v13'
        label=subprocess.check_output(['node','--input-type=module','-e',"import{getXenoTrialsFighterV96}from'./src/xeno-trials-data-v96.js';console.log(getXenoTrialsFighterV96('"+fighter_id+"').label)"],cwd=REPO,text=True).strip()
        p.locator('[data-xt="search"]').fill(label)
        enter(p,'[data-xt-unlock="'+fighter_id+'"]');enter(p,'[data-xt-fighter="'+fighter_id+'"]')
        enter(p,'[data-xt="confirm-fighters"]');enter(p,'[data-xt="start"]');wait_active(p)
        check('A native purchased super-capable fighter exposes all nine operation controls',p.locator('[data-xeno-action]:visible').count()==9 and p.locator('[data-xeno-action="super"]').is_visible())
        responsive_operation(p,'nine-controls');pause(p)
        check('English pause action names the native Trials mute control',p.locator('[data-xt="audio-toggle"]').inner_text()=='MUTE TRIALS SOUNDS')
        p.set_viewport_size({'width':844,'height':390});p.locator('[data-xt="audio-toggle"]').focus();sequence=[]
        for unused in range(3):
            p.keyboard.press('Tab');sequence.append(p.evaluate("()=>document.activeElement?.dataset.xt"))
        check('Landscape pause keeps the new audio action inside its native keyboard focus loop',sequence==['resume-overlay','abandon-overlay','audio-toggle'],sequence)
        enter(p,'[data-xt="abandon-overlay"]')
        p.wait_for_function('()=>__ATF_XENO_TRIALS_V96__.snapshot().progress.pending===null')
        R['scenarios']['nineControlsProbe']={'partial':True,'fighterId':fighter_id,'ending':'native abandonment, no victory claim'}
    finally:close(c,p)


with sync_playwright() as pw:
    launch={'headless':True}
    if os.environ.get('ATF_CHROMIUM_EXECUTABLE'):launch['executable_path']=os.environ['ATF_CHROMIUM_EXECUTABLE']
    browser=pw.chromium.launch(**launch);R['browser']=browser.version
    try:
        if a.mode in ['coverage','all']:coverage_case(browser)
        if a.mode in ['controls','all']:nine_controls_case(browser)
        if a.mode in ['motion','all']:motion_case(browser)
        if a.mode in ['combat','all']:combat_case(browser)
        if a.mode in ['audio','all']:audio_case(browser)
        check('No browser exceptions or missing HTTP assets occur',not R['pageErrors'] and not R['httpErrors'],{'pageErrors':R['pageErrors'],'httpErrors':R['httpErrors']})
        failures=[r for r in R['requestFailures'] if r['failure']!='net::ERR_ABORTED'];check('Only navigation cancellation may interrupt requests',not failures,failures);R['status']='passed'
    except Exception as e:R['status']='failed';R['error']=str(e);raise
    finally:(OUT/'report.json').write_text(json.dumps(R,ensure_ascii=False,indent=2));browser.close()
