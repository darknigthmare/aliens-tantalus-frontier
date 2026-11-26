#!/usr/bin/env python3
"""Read the real generated documents in Chromium; no native storage claim."""
from pathlib import Path
import json,hashlib,traceback
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];O=R/'reports/v0100/documents';O.mkdir(parents=True,exist_ok=True)
checks=[];errors=[]
def check(name,value):
 v=bool(value);checks.append({'name':name,'pass':v});print('PASS'if v else'FAIL',name,flush=True)
paths=['reports/RAPPORT_ILLUSTRE.html','CODEX_MER_DES_CHAGRINS.html','REGISTRE_FIDELITE_MER_DES_CHAGRINS.html'];hashes={};fatal=None
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for path in paths:
   text=(R/path).read_text();hashes[path]=hashlib.sha256(text.encode()).hexdigest()
   p=b.new_page(viewport={'width':1440,'height':900});p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(text,wait_until='load')
   check(path+' version courante',p.locator('body').inner_text().count('0.10.0')>0)
   check(path+' aucun identifiant dupliqué',p.evaluate('(()=>{let a=[...document.querySelectorAll("[id]")].map(e=>e.id);return a.length===new Set(a).size})()'))
   check(path+' liens internes valides',p.evaluate('([...document.querySelectorAll("a[href^=\\"#\\"]")].every(a=>document.getElementById(a.getAttribute("href").slice(1))))'))
   check(path+' fidélité partielle visible','texte intégral' in p.locator('body').inner_text()and'1:1' in p.locator('body').inner_text())
   if 'CODEX' in path:
    check('50 fiches avec schéma',p.locator('h3[id^="room-"]').count()==50 and p.locator('.schematic').count()==50)
    p.locator('#room-s17').scroll_into_view_if_needed();p.screenshot(path=str(O/'codex-atelier.png'))
   if 'RAPPORT' in path:
    check('Onze images du rapport',p.locator('figure img').count()==11)
    check('Scènes préparées déclarées',p.locator('body').inner_text().count('SCÈNE PRÉPARÉE.')==2)
    p.screenshot(path=str(O/'rapport-bureau.png'))
   for width in [1440,1024,390,360]:
    p.set_viewport_size({'width':width,'height':900 if width>500 else 844});p.wait_for_timeout(70)
    check(path+f' {width}px pas de débordement horizontal global',p.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'))
   if 'REGISTRE' in path:p.screenshot(path=str(O/'registre-360.png'),full_page=False)
   p.close()
  check('Aucune exception documentaire',not errors);b.close()
except Exception as e:fatal=str(e);traceback.print_exc()
report=dict(version='0.10.0',source_sha256=hashes,checks=checks,passed=sum(x['pass']for x in checks),failed=sum(not x['pass']for x in checks)+bool(fatal),errors=errors,fatal=fatal,method='Actual document HTML set_content; responsive geometry and limited visual review, not human review of every page.')
(O/'checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('RESULT',report['passed'],report['failed']);raise SystemExit(bool(report['failed']))
