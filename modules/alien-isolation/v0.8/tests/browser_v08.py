"""Physical portal & map validation, plus full architectural contact sheets.
Prepared scene placements are explicitly labelled and are not campaign proofs.
No browser security/policy settings are changed.
"""
from pathlib import Path
import json,hashlib
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];checks=[];shots=[];rooms=[];errors=[]
(R/'qa/architecture').mkdir(exist_ok=True);(R/'qa/captures').mkdir(exist_ok=True)
C=json.loads((R/'src/content.json').read_text())
def check(name,ok):
 checks.append(dict(name=name,ok=bool(ok)));print(('PASS ' if ok else 'FAIL ')+name,flush=True)
def shot(p,name,title,why):
 p.wait_for_timeout(110);p.screenshot(path=str(R/'qa/captures'/name));shots.append(dict(file='captures/'+name,title=title,provenance=why))
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport=dict(width=1440,height=900));p.on('pageerror',lambda e:errors.append(str(e)));p.on('dialog',lambda d:d.accept());p.set_default_timeout(10000)
 p.set_content((R/'JOUER_ISOLATION.html').read_text(),wait_until='load');p.wait_for_selector('body[data-ready="true"]')
 check('Métadonnées et édition 0.8 sur le menu',p.evaluate("__isolation.CONTENT.meta.version==='0.8.0'") and 'UNE STATION, DES CHEMINS' in p.locator('.pill').inner_text())
 shot(p,'83_menu_spatial.png','Une station, des chemins','Écran de lancement du HTML exact 0.8, sans état injecté.')
 p.select_option('#difficulty','recit');p.click('#newGame');p.evaluate('__isolation.engine.paused=true');start=p.evaluate('({room:__isolation.engine.s.room,x:__isolation.engine.s.x,y:__isolation.engine.s.y,goal:__isolation.engine.s.goal,time:__isolation.engine.s.time})')
 p.keyboard.press('m');p.locator('#spatialRoomSelect').select_option('m_morgue');p.wait_for_timeout(100)
 check('Sélecteur propose les 76 lieux',p.locator('#spatialRoomSelect option').count()==76)
 check('Le plan inspecté correspond à la morgue', 'morgue' in p.locator('.spatial-plan').get_attribute('aria-label'))
 check('Deux connexions physiques dans le plan de la morgue',p.locator('.portal-list article').count()==2)
 check('Condition de Morley affichée au chapitre préparé',p.evaluate("()=>{__isolation.engine.s.chapter=5;__isolation.openPanel('map');return document.querySelector('.portal-list').textContent.includes('Morley')}"))
 p.click('[data-waypoint="m_morgue"]');check('Repère stocké sans téléportation ni objectif offert',p.evaluate("__isolation.engine.s.spatial.waypoint==='m_morgue'&&__isolation.engine.s.room==='t_cryo'&&__isolation.engine.s.goal===0"))
 check('Coordonnées inchangées par le plan',p.evaluate('({x:__isolation.engine.s.x,y:__isolation.engine.s.y})')=={k:start[k] for k in ['x','y']})
 shot(p,'84_plan_morgue.png','Plan local · Maintenance et morgue','SCÈNE PRÉPARÉE : progression fixée au chapitre 6 pour examiner les conditions. Manipulation réelle du sélecteur et du repère, sans déplacement ni validation d’objectif.')
 p.click('[data-inspect="m_pharmacy"]');check('Inspection du voisin suit le lien réciproque',p.locator('#spatialRoomSelect').input_value()=='m_pharmacy')
 p.click('[data-waypoint="clear"]');check('Effacer un repère conserve la campagne',p.evaluate('__isolation.engine.s.spatial.waypoint===null&&__isolation.engine.s.goal===0'))
 for width,height in [(1440,900),(1280,720),(1024,768),(800,700)]:
  p.set_viewport_size(dict(width=width,height=height));p.wait_for_timeout(80)
  check(f'Plan local sans débordement horizontal {width}×{height}',p.evaluate("document.querySelector('#modalBody').scrollWidth<=document.querySelector('#modalBody').clientWidth+1"))
  check(f'Plan et sélecteur accessibles {width}×{height}',p.locator('#spatialRoomSelect').is_visible() and p.locator('.spatial-plan').is_visible())
 p.set_viewport_size(dict(width=1440,height=900));p.keyboard.press('Escape')
 # Real keyboard E with a prepared position at an actual mounted portal.
 for id in ['t_cryo__t_galley','t_galley__t_bridge','t_bridge__t_sas']:
  edge=next(x for x in C['links'] if x['id']==id);p.evaluate('''l=>{const e=__isolation.engine;__isolation.closePanel();e.s.room=l.a;e.s.x=l.aPoint.x;e.s.y=l.aPoint.y;e.s.chapter=0;e.s.goal=1;e.s.hidden=null;e.s.dead=false;e.s.ended=false;e.s.alien.active=false;e.s.lifeSupport.cycle=null;e.cooldown=0;e.requireRelease=false;e.paused=false;__isolation.renderer.lastRoom=null;}''',edge)
  p.keyboard.down('e');p.wait_for_function('id=>__isolation.engine.s.room===id',arg=edge['b'],timeout=8000);p.keyboard.up('e');p.evaluate('__isolation.engine.paused=true')
  now=p.evaluate('({x:__isolation.engine.s.x,y:__isolation.engine.s.y,last:__isolation.engine.s.spatial.lastPortal})');arr=edge['bPortal']['arrival'];check('E franchit au point déclaré '+id,abs(now['x']-arr['x'])<.1 and abs(now['y']-arr['y'])<.1 and now['last']==id)
 # Actual reached new rooms: restore snapshots only, then pause.
 run=json.loads((R/'qa/spatial-campaign-live-42.json').read_text());check('Source de captures: parcours actif des 76 lieux terminé',run['ok'] and len(run['visited'])==76 and len(run['optional'])==32)
 for num,task in enumerate(['O21','O22','O23','O24','O25','O26','O27','O28','O29','O30','O31','O32'],85):
  ss=next(s for s in run['snapshots'] if s.get('optional')==task)
  p.evaluate('''text=>{__isolation.closePanel();const e=__isolation.engine;const result=e.load(text);if(!result.ok)throw Error(result.error);e.paused=true;__isolation.renderer.lastRoom=null;}''',ss['save'])
  shot(p,f'{num}_{task}_local.png',ss['description'],'PARCOURS ACTIF : point atteint en Récit, graine 42, ressources finies, ennemis et dégâts actifs. Restauration exacte puis pause; le pilote lit l’état interne pour planifier.')
 # Exhaustive render inspection. Both ends for normal mode; central view for CLASSIC.
 for ri,r in enumerate(C['rooms']):
  for classic,side in [(False,'L'),(False,'R'),(True,'C')]:
   p.evaluate('''a=>{__isolation.closePanel();const e=__isolation.engine,r=__isolation.CONTENT.rooms.find(r=>r.id===a.id);e.s.room=r.id;e.s.x=a.side==='L'?180:a.side==='R'?r.w-180:r.w/2;e.s.y=300;e.s.classic=a.classic;e.s.hidden=null;e.s.dead=false;e.s.ended=false;e.s.goal=0;e.s.chapter=0;e.s.flags={};e.s.tools.tracker=false;e.s.tracker=false;e.s.torch=false;e.s.alien.active=false;e.s.encounters.rescues.forEach(n=>n.status='dead');e.s.enemies.forEach(n=>n.hp=0);e.s.protocols.gemini.stage='idle';e.s.protocols.anesidora.status='idle';e.s.lifeSupport.cycle=null;e.s.lifeSupport.oxygen=100;e.s.actor=r.sector==='SOUVENIR'?'Marlow':'Amanda';e.s.spatial.waypoint=null;e.messages=[];e.paused=true;__isolation.renderer.lastRoom=null;__isolation.renderer.render();}''',dict(id=r['id'],classic=classic,side=side))
   p.wait_for_timeout(90);file=f"architecture/{ri:02d}_{r['id']}_{'CLASSIC' if classic else side}.jpg";p.screenshot(path=str(R/'qa'/file),type='jpeg',quality=68)
   rooms.append(dict(room=r['id'],view=r['view'],classic=classic,side=side,file=file,provenance='SCÈNE PRÉPARÉE : placement pour contrôle de rendu, menaces neutralisées, aucune revendication de progression.'))
  check('Trois cadrages du lieu '+r['id'],not errors)
 check('Aucune ressource réseau externe',p.evaluate("performance.getEntriesByType('resource').filter(r=>/^https?:/.test(r.name)).length===0"));check('Aucune exception navigateur',not errors);b.close()
out=dict(version=C['meta']['version'],htmlSha256=hashlib.sha256((R/'JOUER_ISOLATION.html').read_bytes()).hexdigest(),passCount=sum(c['ok'] for c in checks),fail=sum(not c['ok'] for c in checks),checks=checks,errors=errors,captures=shots,roomCaptures=rooms,loading='Page.set_content; native navigations blocked by administrator. No policy changes.')
(R/'qa/browser-v08-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('SUMMARY',out['passCount'],out['fail'],len(rooms),flush=True)
raise SystemExit(bool(out['fail']))
