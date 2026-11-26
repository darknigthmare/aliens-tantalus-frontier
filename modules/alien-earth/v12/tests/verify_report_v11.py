from pathlib import Path
import json, hashlib, os
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
D=R/'docs'
report_path=D/'RAPPORT_QA_ALIEN_EARTH_V11.html'
audit_path=D/'AUDIT_FIDELITE_ALIEN_EARTH_V11.html'
result={'version':'11.0.0','method':'Chromium page.set_content / opaque origin','checks':[],'pageErrors':[]}
def check(name,ok,detail=''):
 result['checks'].append({'name':name,'pass':bool(ok),'detail':str(detail)}); print(('PASS ' if ok else 'FAIL ')+name)
 if not ok: raise AssertionError(name+' '+str(detail))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 result['browser']=b.version
 page=b.new_page(viewport={'width':1360,'height':960}); page.on('pageerror',lambda e:result['pageErrors'].append(str(e)))
 raw=report_path.read_text()
 page.set_content(raw,wait_until='load'); page.wait_for_timeout(150)
 check('QA report identifies V11','V11' in page.inner_text('body') and 'Le navire derrière les portes' in page.inner_text('body'))
 check('QA report exposes exact counts','70' in page.inner_text('body') and '102' in page.inner_text('body') and '1216' in page.inner_text('body') and '200' in page.inner_text('body'))
 check('QA report embeds real screenshots',page.locator('figure img').count()>=8)
 check('QA report states fidelity boundary','blueprint officiel' in page.inner_text('body') and 'vectoriel' in page.inner_text('body'))
 page.screenshot(path=str(D/'v11/RAPPORT_APERCU_V11.png'),full_page=False)
 page.set_content(audit_path.read_text(),wait_until='load');page.wait_for_timeout(100)
 check('Audit lists all seventy locations',page.locator('.room').count()==70,page.locator('.room').count())
 check('Audit lists twenty-five silhouettes',page.locator('table').nth(1).locator('tr').count()-1==25)
 check('Audit makes remaining gaps visible','1:1 total non déclaré' in page.inner_text('body'))
 check('Audit reports zero structural threshold anomalies','0 anomalie' in page.inner_text('body'))
 check('No report browser errors',not result['pageErrors'],result['pageErrors'])
 b.close()
result['passed']=sum(c['pass'] for c in result['checks']);result['total']=len(result['checks'])
result['reportSha256']=hashlib.sha256(report_path.read_bytes()).hexdigest();result['auditSha256']=hashlib.sha256(audit_path.read_bytes()).hexdigest();result['ok']=result['passed']==result['total'] and not result['pageErrors']
(D/'v11/QA_REPORT_DOCUMENT_V11.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
if not result['ok']: raise SystemExit(1)
print(f"SUCCESS {result['passed']}/{result['total']}")
