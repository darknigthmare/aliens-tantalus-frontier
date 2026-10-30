"""Production menu duels, original capture poses and declared render comparisons.

Only the Save picker imports an explicitly unearned roster-unlock profile.
Keyboard/menu actions obtain every gameplay contact, hold, escape and recovery.
The first observed floor frame synchronously clicks the production pause button;
that declared public UI action is the observer's only game-control action.
The additional atlas/mirrored comparisons are labelled render fixtures: clones
of an observed hold are used only by pure render functions, never by runtime.
No scheduler, simulation body, HP, result, RNG or live match field is rewritten.
"""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
import traceback
import urllib.request
from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parents[1]
READ = '() => globalThis.__ATF_XENO_TRIALS_V96__?.snapshot()'
TASKS = ['ART153-03', 'ART153-04', 'ART153-05', 'ART153-11', 'ART153-12', 'ART153-18', 'ART153-19', 'ART153-25', 'ART153-26']
TARGETS = ['import-game-dd-wy-commando', 'import-game-dd-guardian', 'dd-darwin-era-cultist']

def fixture(ids, name):
    code = """import{createDefaultSave}from'./src/save.js';import{XENO_TRIALS_FIGHTERS_V96 as roster}from'./src/xeno-trials-data-v96.js';const s=createDefaultSave();s.needsPlayerCreationV84=false;s.player.name=process.argv[1];s.scene='command';s.settings.reducedMotion=false;s.xenoTrialsV96.unlocked=[...new Set([...s.xenoTrialsV96.unlocked,...JSON.parse(process.argv[2])])];console.log(JSON.stringify({save:s,roster:roster.map(f=>({id:f.id,label:f.label,family:f.family}))}));"""
    result = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code, name, json.dumps(ids)], cwd=REPO))
    return json.dumps(result['save']).encode(), result['roster']

def observed(page):
    return page.evaluate(READ)

def setup(page, base, raw, name, player_id, opponent_id, roster):
    page.goto(base, wait_until='domcontentloaded')
    page.locator('#title-start').click(timeout=45000)
    page.locator('#title-options').click()
    page.locator('#save-import').set_input_files({'name': name + '.json', 'mimeType': 'application/json', 'buffer': raw})
    page.wait_for_function('name=>__ATF_V51__?.saveSystem.data.player.name===name', arg=name)
    page.locator('#nav [data-view="xenotrials"]').click()
    original = observed(page)['progress']
    page.locator('[data-xt-branch="on-demand"]').click()
    form = page.locator('[data-xt="form"]')
    family = next(f['family'] for f in roster if f['id'] == opponent_id)
    form.locator('[name="opponentFamily"]').select_option(family)
    form.locator('[name="opponentId"]').select_option(opponent_id)
    form.locator('[name="requestedRules"]').select_option('standard')
    page.locator('[data-xt="confirm-target"]').click()
    page.locator('[data-xt="family"]').select_option('all')
    page.locator('[data-xt="search"]').fill(next(f['label'] for f in roster if f['id'] == player_id))
    page.locator('[data-xt-fighter="' + player_id + '"]').click()
    form.locator('[name="difficulty"]').select_option('hard')
    page.locator('[data-xt="confirm-fighters"]').click()
    form.locator('[name="stageId"]').select_option('tantalus-cargo')
    page.locator('[data-xt="start"]').click()
    page.wait_for_function('''()=>{const m=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot().match;return m&&!m.paused&&!m.presentation.blocksSimulation;}''', timeout=45000)
    page.locator('[data-xt="canvas"]').focus()
    return original

def wait_frame(page, predicate, timeout=45000):
    return page.wait_for_function('''()=>{const s=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot(),m=s?.match;
      if(!m)return false;if(PREDICATE)return{state:s,png:document.querySelector('[data-xt="canvas"]').toDataURL('image/png')};return false;}'''.replace('PREDICATE', predicate), polling='raf', timeout=timeout).json_value()

# RAF evidence copies pixels locally, then synchronously activates the production
# pause button through its DOM click handler. This floor callback is not read-only;
# it never calls a runtime setter or assigns a match field. PNG compression waits
# until that public UI pause, or both post-resume observations are complete.
CAPTURE_OBSERVER = r'''c=> {
  const slots=globalThis.__ATF_CAPTURE_OBSERVER_V163__ ||= {};
  if(slots[c.stage])slots[c.stage].cancelled=true;
  const out=slots[c.stage]={expected:c,ready:false,done:false,error:null,trace:[],floor:null,struggle:null,release:null};
  const read=()=>globalThis.__ATF_XENO_TRIALS_V96__?.snapshot();
  const compact=s=>{const m=s?.match,h=m?.grappleV153;return m?{tick:m.tick,round:m.round,paused:m.paused,
    matchId:m.config.matchId,grapple:h?{id:h.id,attacker:h.attacker,target:h.target,escapeProgress:h.escapeProgress}:null,
    fighters:m.fighters.map(f=>({id:f.id,side:f.side,hp:f.hp,guard:f.guard,escapes:f.stats?.grappleEscapesV153||0})),
    receipts:m.captureViewsV163?.map(v=>({grappleId:v.grappleId,role:v.role,side:v.side,targetId:v.targetId,
      phase:v.phase,fullFloorPin:v.fullFloorPin,pairedContacts:v.pairedContacts,escapeProgress:v.escapeProgress})),
    ends:m.events.filter(e=>e.type==='grapple-end-v153').slice(-2)}:{match:null};};
  const fail=message=>{out.error=message;out.done=true;};
  const sameMatch=m=>m&&m.config.matchId===c.matchId&&m.round===c.round
    &&m.fighters.length===2&&m.fighters.every((f,i)=>f.id===c.fighterIds[i]&&f.side===c.sides[i]);
  const sameHold=h=>h&&h.attacker===c.attackerSide&&h.target===c.targetSide&&(c.holdId===null||h.id===c.holdId);
  const receipt=(m,phase)=>m.captureViewsV163?.find(v=>v.role==='captive'&&v.side===c.targetSide
    &&v.targetId===c.targetId&&v.grappleId===(c.holdId??m.grappleV153?.id)&&v.phase===phase);
  // This detached, same-size copy belongs to the snapshot in this synchronous
  // callback. It is never drawn back into the live canvas or supplied to combat.
  // PNG compression here could consume the remaining native guard-escape window.
  const frame=s=>{
    const source=document.querySelector('[data-xt="canvas"]'),bitmap=document.createElement('canvas');
    bitmap.width=source.width;bitmap.height=source.height;
    const startedMs=performance.now();bitmap.getContext('2d').drawImage(source,0,0);
    return{state:s,bitmap,bitmapCopy:{width:bitmap.width,height:bitmap.height,startedMs,finishedMs:performance.now()}};
  };
  const armed=read(),start=performance.now();out.armedState=compact(armed);
  if(!sameMatch(armed?.match)){fail('Different match, round or participants at observer arm');return{error:out.error};}
  if(c.stage==='post'&&!(armed.match.paused&&sameHold(armed.match.grappleV153)
    &&(!c.after||receipt(armed.match,'capture')?.fullFloorPin&&Math.abs(receipt(armed.match,'capture').contacts?.floorSupport?.[1]-receipt(armed.match,'capture').floor)<1e-6))){
    fail('Actual pause no longer owns the same native hold and floor support');return{error:out.error};}
  let floorHoldId=c.holdId??armed.match.grappleV153?.id??null;
  function sample(){
    if(out.cancelled||out.done)return;
    const s=read(),m=s?.match,row=compact(s);out.last=row;
    if(!out.trace.length||row.tick!==out.trace.at(-1).tick||row.paused!==out.trace.at(-1).paused){out.trace.push(row);if(out.trace.length>240)out.trace.shift();}
    if(performance.now()-start>c.timeoutMs){fail('Native '+c.stage+' observer exceeded original '+c.timeoutMs+'ms budget');return;}
    if(!sameMatch(m)||m.tick<armed.match.tick){fail('Match, round, participants or monotonic tick changed');return;}
    if(c.stage==='post'&&m.paused){requestAnimationFrame(sample);return;}
    const h=m.grappleV153;
    if(h&&!sameHold(h)){fail('Different native hold cannot replace expected capture');return;}
    if(c.stage==='floor'){
      if(m.events.some(e=>e.type==='grapple-end-v153'&&e.tick>=c.sinceTick)){fail('Native hold ended before exact floor observation');return;}
      if(h){floorHoldId??=h.id;if(h.id!==floorHoldId){fail('A later hold cannot replace first floor contact');return;}
        const r=receipt(m,'capture');
        if(c.after?r?.fullFloorPin&&r.pairedContacts:m.tick-h.bornTick>=55){
          const control=document.querySelector('[data-xt="pause"]');
          if(m.paused||!control||control.disabled||typeof control.click!=='function'){
            fail('First floor frame requires an enabled public pause button and a running match');return;}
          out.floor=frame(s);
          // A Playwright round trip can outlast the remaining CPU escape ticks.
          // The real UI handler must pause this same hold before this RAF returns.
          out.pauseAction={method:'DOM click on production pause button',selector:'[data-xt="pause"]',
            beforeTick:m.tick,beforePaused:m.paused,holdId:h.id};
          control.click();
          const paused=read()?.match,p=paused&&receipt(paused,'capture');
          Object.assign(out.pauseAction,{afterTick:paused?.tick,afterPaused:paused?.paused,
            afterHoldId:paused?.grappleV153?.id});
          if(!sameMatch(paused)||paused.paused!==true||paused.tick!==m.tick
            ||paused.grappleV153?.id!==h.id||!sameHold(paused.grappleV153)
            ||c.after&&!(p?.fullFloorPin&&p.pairedContacts&&Math.abs(p.contacts?.floorSupport?.[1]-p.floor)<1e-6)){
            fail('Public pause button did not retain the exact native tick, hold, participants and floor support');return;}
          out.ready=true;out.done=true;return;}}
    }else if(h){
      const r=receipt(m,'capture');
      if(!out.struggle&&m.tick>armed.match.tick&&h.escapeProgress>0&&(!c.after||r?.escapeProgress>0&&r.pairedContacts))out.struggle=frame(s);
    }else{
      const end=m.events.find(e=>e.type==='grapple-end-v153'&&e.grappleId===c.holdId);
      if(end){out.release=frame(s);out.done=true;
        if(!out.struggle)fail('Expected hold ended before a real post-resume resistance frame');
        else if(c.after&&!receipt(m,'recovery'))fail('First native release has no recovery painted for the same captive and hold');
        return;}
    }
    requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
  return{armed:true};
}
'''

CAPTURE_EXPORT = r'''c=> {
  const out=globalThis.__ATF_CAPTURE_OBSERVER_V163__?.[c.stage];
  if(!out||out.error||!out.done)throw Error(out?.error||'Native observation is not complete');
  if(c.stage==='floor'){
    const current=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot().match,recorded=out.floor?.state?.match;
    if(!current?.paused||!recorded?.grappleV153||current.grappleV153?.id!==recorded.grappleV153.id)
      throw Error('Floor PNG requires the public pause on the same native hold');
  }else if(c.stage!=='post'||!out.struggle||!out.release){
    throw Error('Post PNGs require both same-hold resistance and release observations');
  }
  return Object.fromEntries(c.fields.map(field=>{
    const frame=out[field];if(!frame?.bitmap)throw Error('Missing copied native frame: '+field);
    return[field,{state:frame.state,png:frame.bitmap.toDataURL('image/png'),bitmapCopy:frame.bitmapCopy}];
  }));
}'''

def wait_observation(page, stage, field, timeout):
    page.wait_for_function("([stage,field])=>{const o=globalThis.__ATF_CAPTURE_OBSERVER_V163__?.[stage];if(o?.error)throw Error(o.error);return Boolean(o?.[field]);}", arg=[stage, field], polling='raf', timeout=timeout)

def get_frame(page):
    return page.evaluate('''()=>({state:globalThis.__ATF_XENO_TRIALS_V96__.snapshot(),png:document.querySelector('[data-xt="canvas"]').toDataURL('image/png')})''')

def acquire_player_capture(page, after, trace):
    # The Prowler and these humans have different front-biased bodies. Their
    # pivot distance is not the V153 contact test. All imports below only read
    # the public snapshot through the same pure geometry/spec functions used
    # by combat; movement, guard and every special still use actual keys.
    read_contact = r'''async()=>{
      const G=await import('/src/xeno-trials-geometry-v105.js'),
        A=await import('/src/xeno-trials-signatures-v147.js'),
        D=await import('/src/xeno-trials-data-v96.js'),
        E=await import('/src/xeno-trials-engine-v96.js');
      const m=globalThis.__ATF_XENO_TRIALS_V96__?.snapshot().match;if(!m)return null;
      const[a,b]=m.fighters,direction=b.x>=a.x?1:-1,
        playerBody=G.getXenoTrialsBodyBoundsV105(a),targetBody=G.getXenoTrialsBodyBoundsV105(b),
        special=A.getXenoTrialsAttackV147(D.getXenoTrialsFighterV96(a.id),'special',E.XENO_TRIALS_ATTACKS_V96.special),
        targetAttack=b.attack?A.getXenoTrialsAttackV147(D.getXenoTrialsFighterV96(b.id),b.attack.kind,E.XENO_TRIALS_ATTACKS_V96[b.attack.kind]):null;
      return{match:m,direction,gap:G.getXenoTrialsBodyGapV105(a,b,direction),playerBody,targetBody,
        targetAhead:(targetBody.center-playerBody.center)*direction>=0,
        verticalOverlap:playerBody.bottom<=targetBody.top&&targetBody.bottom<=playerBody.top,
        specialCost:special.cost,specialStartup:special.startup,
        targetThreat:!!targetAttack&&b.attack.age<targetAttack.startup+targetAttack.active,
        targetRecovery:!!targetAttack&&b.attack.age>=targetAttack.startup+targetAttack.active};
    }'''
    started = time.monotonic()
    deadline = started + 55
    trace.update({'status': 'running', 'timeLimitSeconds': 55, 'attemptLimit': 32,
                  'observationLimit': 600, 'observations': [], 'attempts': [], 'preparations': [],
                  'policy': 'Real keys: approach using pure V105 body gap to <=6px (V153 admission <=8px), guard visible attack startup/active at contact, then special during observed target recovery when grounded, unstunned, affordable and cooldown zero. No match field is assigned.'})
    held = None
    guarding = False
    preparations = {}
    observed_preparation_ids = set()
    last_observation_tick = -120

    def summarize(value):
        m = value['match']
        a, b = m['fighters']
        return {'tick': m['tick'], 'phase': m['phase'], 'round': m['round'],
                'gap': value['gap'], 'direction': value['direction'],
                'playerBody': value['playerBody'], 'targetBody': value['targetBody'],
                'targetAhead': value['targetAhead'], 'verticalOverlap': value['verticalOverlap'],
                'targetThreat': value['targetThreat'], 'targetRecovery': value['targetRecovery'],
                'player': {k: a.get(k) for k in ['x', 'y', 'vy', 'hp', 'stamina', 'stun', 'guard', 'attack', 'specialCooldown', 'stats']},
                'target': {k: b.get(k) for k in ['x', 'y', 'vy', 'hp', 'stamina', 'stun', 'guard', 'attack']},
                'grappleId': (m.get('grappleV153') or {}).get('id')}

    try:
        while time.monotonic() < deadline:
            value = page.evaluate(read_contact)
            if value is None:
                raise AssertionError('Native match disappeared during keyboard capture acquisition')
            m = value['match']
            sample = summarize(value)
            trace['lastObservation'] = sample
            if m['tick'] - last_observation_tick >= 12 or m.get('grappleV153'):
                trace['observations'].append(sample)
                if len(trace['observations']) > trace['observationLimit']:
                    trace['observations'].pop(0)
                    trace['discardedOldObservations'] = trace.get('discardedOldObservations', 0) + 1
                last_observation_tick = m['tick']
            if value['targetAhead'] and -8 <= value['gap'] <= 8 and not trace.get('firstContact'):
                trace['firstContact'] = sample
            if m.get('grappleV153'):
                start = next((e for e in m['events'] if e['type'] == 'grapple-start-v153' and e['grappleId'] == m['grappleV153']['id']), None)
                attack = next((e for e in reversed(m['events']) if start and e['type'] == 'attack' and e['side'] == 'player' and e['id'] < start['id']), None)
                prep = preparations.get(attack['id']) if attack and attack.get('kind') == 'special' else None
                accepted = next((attempt for attempt in reversed(trace['attempts']) if attempt.get('nativeSpecialAccepted') and attack and attempt.get('attackEventId') == attack['id']), None)
                if not (prep and accepted):
                    raise AssertionError('The native hold has no atomically observed startup linked to its accepted player special; all attempts are retained')
                trace.update({'status': 'captured', 'grapple': m['grappleV153'],
                              'successfulSpecial': {'attackEvent': attack, 'grappleStart': start,
                                                    'attemptNumber': accepted['number'],
                                                    'preparationProof': prep['preparationProof']},
                              'elapsedSeconds': time.monotonic() - started})
                return prep
            if m['phase'] == 'match-over':
                result = m.get('result') or {}
                trace['terminalBeforeCapture'] = {'tick': m['tick'], 'round': m['round'],
                    'winner': result.get('winner'), 'reason': result.get('reason')}
                raise AssertionError('Native match ended before keyboard capture: ' + json.dumps(trace['terminalBeforeCapture'], separators=(',', ':')))
            a, b = m['fighters']
            # Validate the pose and attack in the same atomic state+PNG read.
            # A prior polling snapshot only decides whether a read is useful;
            # it never supplies the identity claimed for the captured image.
            if (a.get('attack') or {}).get('kind') == 'special' and a['attack']['id'] not in observed_preparation_ids:
                frame = get_frame(page)
                frame_match = frame['state']['match']
                frame_player = frame_match['fighters'][0] if frame_match else None
                frame_attack = frame_player.get('attack') if frame_player else None
                cue = next((v for v in frame_match.get('rigViewsV154', []) if v['side'] == 'player' and (v.get('preparationV163') if after else v.get('clip') == 'windup')), None) if frame_match else None
                attack_event = next((e for e in reversed(frame_match['events']) if e['type'] == 'attack' and e['side'] == 'player'), None) if frame_match else None
                if frame_attack and frame_attack['kind'] == 'special' and frame_attack['age'] < value['specialStartup'] and cue and attack_event and attack_event['kind'] == 'special':
                    proof = {'attackId': frame_attack['id'], 'attackEventId': attack_event['id'],
                             'attackEventTick': attack_event['tick'], 'frameTick': frame_match['tick'],
                             'attackAge': frame_attack['age'], 'clip': cue.get('clip')}
                    frame['preparationProof'] = proof
                    preparations[attack_event['id']] = frame
                    observed_preparation_ids.add(frame_attack['id'])
                    trace['preparations'].append(proof)
            contact = value['targetAhead'] and -8 <= value['gap'] <= 6 and value['verticalOverlap']
            desired = ('ArrowRight' if value['direction'] > 0 else 'ArrowLeft') if value['gap'] > 6 else None
            if desired != held:
                if held:
                    page.keyboard.up(held)
                held = desired
                if held:
                    page.keyboard.down(held)
            want_guard = bool(contact and value['targetThreat'] and not a.get('attack') and a['stun'] <= 0 and a['y'] == 0 and a['stamina'] > 1)
            if want_guard != guarding:
                if want_guard:
                    page.keyboard.down('KeyS')
                else:
                    page.keyboard.up('KeyS')
                guarding = want_guard
            ready = (m['phase'] == 'active' and not m.get('paused') and contact
                     and value['targetRecovery'] and not a.get('attack')
                     and a['stun'] <= 0 and a['y'] == 0 and b['y'] == 0 and b['vy'] == 0
                     and a['specialCooldown'] <= 0 and a['stamina'] >= value['specialCost'])
            if ready:
                if len(trace['attempts']) >= trace['attemptLimit']:
                    raise AssertionError('Native keyboard capture reached its disclosed attempt limit')
                attempt = {'number': len(trace['attempts']) + 1, 'before': sample,
                           'elapsedSeconds': time.monotonic() - started}
                trace['attempts'].append(attempt)
                page.keyboard.press('KeyL', delay=40)
                after_press = page.evaluate(read_contact)
                if after_press:
                    attempt['after'] = summarize(after_press)
                    attempt['nativeSpecialAccepted'] = after_press['match']['fighters'][0]['stats']['specials'] > a['stats']['specials']
                    if attempt['nativeSpecialAccepted']:
                        event = next((e for e in reversed(after_press['match']['events']) if e['type'] == 'attack' and e['side'] == 'player' and e['kind'] == 'special'), None)
                        attempt['attackEventId'] = event['id'] if event else None
            page.wait_for_timeout(20)
        raise AssertionError('Keyboard Prowler did not earn a native capture before the deadline')
    except Exception as e:
        trace.update({'status': 'failed', 'error': str(e), 'elapsedSeconds': time.monotonic() - started})
        raise
    finally:
        if held:
            page.keyboard.up(held)
        if guarding:
            page.keyboard.up('KeyS')

# Clone-only fixtures. No evaluated function can access a runtime setter.
COMPARISON = r'''async native=>{
 const R=await import('/src/xeno-trials-rig-v154.js'),C=await import('/src/xeno-trials-capture-v163.js'),D=await import('/src/xeno-trials-data-v96.js'),M=await import('/src/xeno-trials-scale-v110.js');
 const images=new Map();for(const f of native.fighters){const art=D.getXenoTrialsArtV96(f.id,f.variant);const im=new Image();im.src=art.path;await im.decode();images.set(art.path,im);}
 for(const path of C.getXenoTrialsCaptureAssetsV163(native.fighters)){const im=new Image();im.src=path;await im.decode();images.set(path,im);}
 const canvas=document.createElement('canvas');canvas.width=2000;canvas.height=1120;const ctx=canvas.getContext('2d');const rows=[];
 for(const [row,mirror]of [false,true].entries()){
  const match=structuredClone(native);if(mirror){for(const f of match.fighters){f.x=1000-f.x;f.facing*=-1;}match.grappleV153.attackerX=1000-match.grappleV153.attackerX;match.grappleV153.targetX=1000-match.grappleV153.targetX;}
  const pair=C.getXenoTrialsCaptureViewV163(match,images),center=(pair.layout.bounds.left+pair.layout.bounds.right+pair.attacker.x*2)/4;
  for(let col=0;col<2;col++){
   const ox=col*1000,oy=row*560;ctx.fillStyle='#071119';ctx.fillRect(ox,oy,1000,560);ctx.save();ctx.beginPath();ctx.rect(ox,oy,1000,560);ctx.clip();ctx.translate(ox+500-center*2,oy+500-450*2);ctx.scale(2,2);ctx.strokeStyle='#8da9a5';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(0,450);ctx.lineTo(1000,450);ctx.stroke();
   const actors=col?[pair.target,pair.attacker]:match.fighters;
   for(const f of actors){const art=D.getXenoTrialsArtV96(f.id,f.variant),rig=R.getXenoTrialsRigV154(D.getXenoTrialsFighterV96(f.id),art),metrics=M.getXenoTrialsRenderMetricsV110(f.id,f.variant),image=images.get(art.path);
    if(col&&f===pair.target){C.drawXenoTrialsCaptureTargetV163(ctx,images.get(pair.atlas.path),pair);continue;}
    const cue=R.getXenoTrialsRigCueV154(rig,match,f),pose=col&&f===pair.attacker?pair.captorPose:R.sampleXenoTrialsRigV154(rig,cue);
    if(!R.drawXenoTrialsRigV154(ctx,rig,image,pose,metrics,f.x,450-f.y,f.facing)){ctx.save();ctx.translate(f.x,450-f.y);ctx.scale(f.facing*metrics.sourceFacing,1);ctx.drawImage(image,-metrics.width*metrics.pivotX,-metrics.height*metrics.bottom,metrics.width,metrics.height);ctx.restore();}
   }ctx.restore();ctx.fillStyle='#e5efeb';ctx.font='18px monospace';ctx.fillText((col?'V163 original floor-pose art':'Historical V158 native-source mesh')+' / clone fixture / '+(mirror?'mirrored':'observed direction')+' / zoom 2',ox+20,oy+30);
  }rows.push({mirror,receipt:C.getXenoTrialsCaptureReceiptV163(pair,'captive')});
 }
 return{png:canvas.toDataURL('image/png'),rows,fixture:'Pure render comparisons, cloned observed match; mirroring is fixture geometry, not a second gameplay event.'};
}'''
ATLAS_REVIEW = r'''async id=>{
 const A=(await import('/src/xeno-trials-capture-data-v163.js')).XENO_TRIALS_CAPTURE_ATLASES_V163.find(a=>a.fighterId===id),M=await import('/src/xeno-trials-scale-v110.js');
 const im=new Image();im.src=A.path;await im.decode();const native=M.getXenoTrialsRenderMetricsV110(id),canvas=document.createElement('canvas');canvas.width=1500;canvas.height=1380;const ctx=canvas.getContext('2d'),frames=[];
 ctx.fillStyle='#071119';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='17px monospace';
 for(const [i,f]of A.frames.entries()){
  const x=(i%3)*500,y=Math.floor(i/3)*460,scale=native.visibleHeight/f.staturePixels*2,[x0,y0,x1,y1]=f.rect,root=(x0+x1)/2;
  ctx.fillStyle='#8da9a5';ctx.fillRect(x+10,y+410,480,1);ctx.fillStyle='#e5efeb';ctx.fillText(i+' '+f.id+' / original pose fixture / 2x',x+12,y+28);
  ctx.save();ctx.translate(x+250-root*scale,y+410-f.supportY*scale);ctx.scale(scale,scale);ctx.drawImage(im,x0,y0,x1-x0,y1-y0,x0,y0,x1-x0,y1-y0);ctx.restore();
  frames.push({id:f.id,rect:f.rect,staturePixels:f.staturePixels,scale,supportY:f.supportY});
 }
 return{png:canvas.toDataURL('image/png'),fighterId:id,sourcePath:A.path,sourceSha256:A.sourceSha256,frames,fixture:'All 9 original atlas poses at 2x native world size. No gameplay choreography or franchise reference is fabricated.'};
}'''

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--base', default=os.environ.get('ATF_BASE_URL', 'http://127.0.0.1:4173'))
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--comparison-stage', choices=['before', 'after'], default='after')
    p.add_argument('--roles', choices=['cpu-captor', 'player-captor', 'both'], default='both')
    args = p.parse_args()
    out = args.output.resolve()
    if out == REPO or REPO in out.parents:
        raise SystemExit('Evidence must remain outside the repository')
    out.mkdir(parents=True, exist_ok=True)
    after = args.comparison_stage == 'after'
    report = {'status': 'running', 'comparisonStage': args.comparison_stage, 'taskIds': TASKS, 'checks': [], 'captures': [], 'profiles': [], 'pageErrors': [], 'requestFailures': [], 'httpErrors': [],
              'scope': 'Six production menu duels on real browser RAF: three original target identities, both captor roles/directions, actual native startup/contact/floor hold/guard resistance/escape/recovery, a synchronized DOM click on the production pause button, keyboard resume and public abandonment. Additional art/geometry comparisons are declared fixtures.',
              'limits': ['Save fixture unlocks four historical pilots without earning those unlocks; no credits/HP/positions/results/clock are fabricated.', 'Original native art and estimated body-length normalization, not canonical choreography or franchise 1:1 certification.', 'Authoritative standing collision bodies remain V153; visible floor pose/root offset is disclosed in receipts.', 'Recovery is presentation only and yields immediately to a new target action.', 'Automated keyboard/menu scenarios; not human playtesting.', 'The first observed floor frame activates the real public pause button with DOM click in the same RAF callback; this is an explicit UI action, not a read-only observation or a trusted physical click. No direct runtime pause API is called; no scheduler or match field is assigned.']}
    def check(label, passed, evidence=None, failure_detail=None):
        assert passed, label + ('; ' + failure_detail[:1000] if failure_detail else '')
        report['checks'].append({'label': label, 'evidence': evidence, 'status': 'passed'})
        report['lastPassedCheck'] = label
    def phase(profile, step):
        report['phase'] = profile + ': ' + step
    def capture(name, value, scope):
        value = dict(value)
        png = base64.b64decode(value.pop('png').split(',', 1)[1])
        (out/name).write_bytes(png)
        report['captures'].append({'file': name, 'sha256': hashlib.sha256(png).hexdigest(), 'scope': scope, 'data': value})
    def identity():
        with urllib.request.urlopen(args.base.rstrip('/') + '/build-info.json', timeout=20) as response:
            raw = response.read()
        info = json.loads(raw)
        return {'sourceCommit': info['sourceCommit'], 'buildId': info['buildId'], 'buildInfoSha256': hashlib.sha256(raw).hexdigest()}
    report['identityBefore'] = identity()
    page = None
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, **({'executable_path': os.environ['ATF_CHROMIUM_EXECUTABLE']} if os.environ.get('ATF_CHROMIUM_EXECUTABLE') else {}))
        try:
            roles = ['cpu-captor', 'player-captor'] if args.roles == 'both' else [args.roles]
            for target_id in TARGETS:
                for role in roles:
                    slug = target_id.replace('import-game-dd-', '').replace('dd-darwin-era-', '')
                    name = 'qa-trials-capture-v163-' + slug + '-' + role
                    raw, roster = fixture([*TARGETS, 'prowler'], name)
                    (out/(name+'.json')).write_bytes(raw)
                    report['profiles'].append({'name': name, 'path': name+'.json', 'sha256': hashlib.sha256(raw).hexdigest(), 'declaredChanges': ['name', 'scene=command', 'onboarding complete identity', 'four historical Trials pilots initially unlocked'], 'unearnedUnlocks': [*TARGETS, 'prowler']})
                    context = browser.new_context(viewport={'width': 1600, 'height': 1000}, service_workers='block', reduced_motion='no-preference')
                    page = context.new_page()
                    page.set_default_timeout(30000)
                    page.on('pageerror', lambda e: report['pageErrors'].append(str(e)))
                    page.on('requestfailed', lambda r: report['requestFailures'].append({'url': r.url, 'failure': r.failure}))
                    page.on('response', lambda r: report['httpErrors'].append({'url': r.url, 'status': r.status}) if r.status >= 400 else None)
                    page.on('dialog', lambda d: d.accept())
                    player, opponent = (target_id, 'prowler') if role == 'cpu-captor' else ('prowler', target_id)
                    phase(name, 'menu and native startup')
                    print(name + ': native menu and capture', flush=True)
                    original = setup(page, args.base, raw, name, player, opponent, roster)
                    m = observed(page)['match']
                    check(name + ': real menu selection and ordinary native health', [f['id'] for f in m['fighters']] == [player, opponent] and all(f['hp'] > 1 for f in m['fighters']))
                    capture(name+'-start.png', get_frame(page), 'Native production menu match before combat; real asset bytes and world dimensions.')
                    if role == 'cpu-captor':
                        prep_predicate = "m.rigViewsV154.some(v=>v.side==='opponent'&&v.preparationV163)" if after else "m.fighters[1].attack?.kind==='special'&&m.fighters[1].attack.age<.32"
                        preparation = wait_frame(page, prep_predicate)
                    else:
                        acquisition = {'profile': name}
                        report.setdefault('playerCaptureAcquisitions', []).append(acquisition)
                        preparation = acquire_player_capture(page, after, acquisition)
                    # Preparation is already observed; defer its transfer to disk and all
                    # checks until the first observed floor contact has activated the public pause button.
                    pm = preparation['state']['match']
                    target_side = 'player' if role == 'cpu-captor' else 'opponent'
                    binding = {'matchId': pm['config']['matchId'], 'round': pm['round'],
                               'fighterIds': [f['id'] for f in pm['fighters']],
                               'sides': [f['side'] for f in pm['fighters']],
                               'attackerSide': 'opponent' if role == 'cpu-captor' else 'player',
                               'targetSide': target_side, 'targetId': target_id,
                               'holdId': acquisition['grapple']['id'] if role == 'player-captor' else None,
                               'sinceTick': pm['tick'], 'after': after}
                    phase(name, 'floor observation with synchronous public button pause')
                    armed = page.evaluate(CAPTURE_OBSERVER, dict(binding, stage='floor', timeoutMs=45000))
                    assert not armed.get('error'), armed.get('error')
                    wait_observation(page, 'floor', 'ready', 45000)  # Acknowledges the completed native UI pause.
                    frozen = observed(page)['match'] or {}
                    # Transfer only metadata until the strict public-pause check
                    # succeeds; the detached bitmap remains browser-local.
                    floor_observation = page.evaluate('''()=>{
                      const o=globalThis.__ATF_CAPTURE_OBSERVER_V163__.floor;
                      return{floor:{state:o.floor.state,bitmapCopy:o.floor.bitmapCopy},trace:o.trace,pauseAction:o.pauseAction};
                    }''')
                    hold = floor_observation['floor']
                    m = hold['state']['match']
                    hold_id = m['grappleV153']['id']
                    binding['holdId'] = hold_id
                    fh = frozen.get('grappleV153') or {}
                    same_pause = (frozen.get('paused') is True and frozen.get('tick') == m['tick']
                                  and frozen['config']['matchId'] == binding['matchId']
                                  and frozen['round'] == binding['round']
                                  and [(f['id'], f['side']) for f in frozen['fighters']] == list(zip(binding['fighterIds'], binding['sides']))
                                  and fh.get('id') == hold_id and fh.get('attacker') == binding['attackerSide'] and fh.get('target') == target_side
                                  and (not after or any(v['role'] == 'captive' and v['side'] == target_side and v['targetId'] == target_id
                                       and v['grappleId'] == hold_id and v['phase'] == 'capture' and v['fullFloorPin'] and abs(v['contacts']['floorSupport'][1] - v['floor']) < 1e-6 for v in frozen.get('captureViewsV163', []))))
                    pause_diagnostics = {'paused': frozen.get('paused'), 'floorTick': m['tick'],
                        'pausedTick': frozen.get('tick'), 'floorHoldId': hold_id, 'pausedHoldId': fh.get('id'),
                        'publicControlAction': floor_observation.get('pauseAction'),
                        'floorBornTick': m['grappleV153'].get('bornTick'),
                        'floorEscape': m['grappleV153'].get('escapeProgress'), 'pausedEscape': fh.get('escapeProgress'),
                        'pausedPhase': frozen.get('phase'), 'floorRound': m['round'], 'pausedRound': frozen.get('round'),
                        'ends': [{k: e.get(k) for k in ['tick', 'grappleId', 'reason']}
                                 for e in frozen.get('events', []) if e.get('type') == 'grapple-end-v153'][-2:]}
                    report.setdefault('pauseObservations', []).append({'profile': name, 'sameNativeHold': same_pause,
                        'floorTick': m['tick'], 'holdId': hold_id, 'pausedMatch': frozen,
                        'floorTrace': floor_observation['trace'], 'publicControlAction': floor_observation.get('pauseAction'),
                        'compactDiagnostics': pause_diagnostics})
                    check(name + ': public pause retains native hold ownership, participants and floor support', same_pause,
                          failure_detail=json.dumps(pause_diagnostics, separators=(',', ':')))
                    hold = page.evaluate(CAPTURE_EXPORT, {'stage': 'floor', 'fields': ['floor']})['floor']
                    check(name + ': actual native Prowler startup is observed', preparation is not None)
                    capture(name+'-preparation.png', preparation, 'Real CPU or keyboard-owned special startup; no attack/capture field injected.')
                    check(name + ': actual capture event owns the displayed hold', any(e['type'] == 'grapple-start-v153' and e['grappleId'] == hold_id for e in m['events']))
                    if after:
                        receipt = next(v for v in m['captureViewsV163'] if v['role'] == 'captive')
                        check(name + ': original floor art, real hand contact and source provenance', receipt['targetId'] == target_id and receipt['fullFloorPin'] and receipt['pairedContacts'] and max(receipt['contactGaps']) <= 8 and receipt['canonExact'] is False and receipt['engineBodiesUnchanged'] is True, receipt)
                        check(name + ': painted floor support remains on the native floor', abs(receipt['contacts']['floorSupport'][1] - receipt['floor']) < 1e-6)
                    capture(name+'-floor-hold.png', hold, 'Actual engine-owned hold, native geometry and real paired pose receipt; no render fixture.')
                    page.wait_for_timeout(180)
                    check(name + ': public pause freezes exact native tick and capture receipts', observed(page)['match'] == frozen)
                    if role == 'cpu-captor' and after:
                        comparison = page.evaluate(COMPARISON, m)
                        check(name + ': declared mirror fixture preserves both hand contacts', all(row['receipt']['pairedContacts'] for row in comparison['rows']))
                        capture(name+'-comparison-fixture.png', comparison, 'Declared clone-only old V158 versus new native art; observed and mirrored direction, same world scale2x. Not a second gameplay event.')
                        capture(name+'-nine-poses-fixture.png', page.evaluate(ATLAS_REVIEW, target_id), 'Declared 9-pose art inspection at2x native stature; no live state writes.')
                    phase(name, 'arm same-hold resistance and release observations while paused')
                    armed = page.evaluate(CAPTURE_OBSERVER, dict(binding, stage='post', timeoutMs=15000))
                    assert not armed.get('error'), armed.get('error')
                    page.keyboard.press('KeyP')
                    page.locator('[data-xt="canvas"]').focus()
                    if role == 'cpu-captor':
                        page.keyboard.down('KeyS')
                    phase(name, 'post-resume resistance of the same native hold')
                    wait_observation(page, 'post', 'struggle', 15000)
                    phase(name, 'first native release and recovery of the same hold')
                    wait_observation(page, 'post', 'release', 15000)
                    if role == 'cpu-captor':
                        page.keyboard.up('KeyS')
                    frames = page.evaluate(CAPTURE_EXPORT, {'stage': 'post', 'fields': ['struggle', 'release']})
                    struggle, release = frames['struggle'], frames['release']
                    capture(name+'-resistance.png', struggle, 'Real guard resistance from keyboard or CPU, never assigned escape progress.')
                    rm = release['state']['match']
                    target = next(f for f in rm['fighters'] if f['side'] == target_side)
                    end = next(e for e in rm['events'] if e['type'] == 'grapple-end-v153' and e['grappleId'] == hold_id)
                    check(name + ': native guard escape resolves once without a new combat result', end['reason'] == 'escaped' and target['stats'].get('grappleEscapesV153', 0) == 1 and rm.get('result') is None, end)
                    if after:
                        check(name + ': release selects a separate recovery pose', any(v['phase'] == 'recovery' and v['role'] == 'captive' and v['side'] == target_side and v['targetId'] == target_id and v['grappleId'] == hold_id for v in rm['captureViewsV163']))
                    capture(name+'-release.png', release, 'Actual native escape and presentation recovery; engine stun/cost/result unchanged.')
                    page.wait_for_timeout(450)
                    capture(name+'-recovered-or-interrupted.png', get_frame(page), 'Native continuation after recovery; new combat actions may interrupt presentation.')
                    phase(name, 'public abandonment and exact reward check')
                    page.keyboard.press('KeyP')
                    if not observed(page)['match']['paused']:
                        page.keyboard.press('KeyP')
                    page.locator('[data-xt="abandon-overlay"]').click()
                    page.wait_for_function('()=>globalThis.__ATF_XENO_TRIALS_V96__.snapshot().match===null')
                    ended = observed(page)
                    check(name + ': real abandonment closes the ticket without fabricating reward', ended['progress']['pending'] is None and ended['progress']['credits'] == original['credits'] and ended['progress']['ledger'][-1]['winner'] == 'abandoned')
                    context.close()
            report['identityAfter'] = identity()
            check('The same served build completed the native capture matrix', report['identityBefore'] == report['identityAfter'])
            check('No browser exception, failed request or HTTP error', not (report['pageErrors'] or report['requestFailures'] or report['httpErrors']))
            report['status'] = 'passed'
        except Exception as e:
            report['status'] = 'failed'
            report['error'] = str(e)
            report['failureStack'] = traceback.format_exc(limit=6)[-4000:]
            details = 'capture pipeline failed; phase=' + str(report.get('phase')) + '; lastPassedCheck=' + str(report.get('lastPassedCheck')) + '; error=' + str(e)
            print('::error::' + details[:1800].replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A'), flush=True)
            if page:
                try:
                    report['captureObserverDiagnostics'] = page.evaluate("()=>Object.fromEntries(Object.entries(globalThis.__ATF_CAPTURE_OBSERVER_V163__||{}).map(([k,v])=>[k,{expected:v.expected,armedState:v.armedState,last:v.last,error:v.error,ready:v.ready,done:v.done,trace:v.trace,pauseAction:v.pauseAction}]))")
                    report['failureState'] = observed(page)
                    page.screenshot(path=str(out/'failure.png'), full_page=True)
                except Exception:
                    pass
        finally:
            (out/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
            browser.close()
    print(json.dumps({'status': report['status'], 'checks': len(report['checks']), 'report': str(out/'report.json')}))
    raise SystemExit(0 if report['status'] == 'passed' else 1)

if __name__ == '__main__':
    main()
