from playwright.sync_api import sync_playwright
from pathlib import Path
import json,time
R=Path(__file__).resolve().parents[1];out={'agentBrowser':(R/'qa/agent-browser-probe.txt').read_text(),'probes':[]}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for url in ['http://127.0.0.1:8127/',(R/'JOUER_ISOLATION.html').as_uri()]:
  page=b.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  try:
   res=page.goto(url,timeout=12000,wait_until='load');page.wait_for_selector('body[data-ready="true"]',timeout=10000)
   content=page.locator('body').inner_text();buttons=page.locator('button').count();page.screenshot(path=str(R/'qa/loading-probe.png'))
   out['probes'].append({'url':url,'ok':True,'status':res.status if res else None,'content':content[:300],'buttons':buttons,'errors':errors})
  except Exception as e:
   out['probes'].append({'url':url,'ok':False,'error':str(e),'errors':errors})
  page.close()
 b.close()
(R/'qa/loading-probe.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False,indent=2))
