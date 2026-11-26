#!/usr/bin/env python3
"""Exercise the cumulative offline catalogue using real Chromium image decode."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--catalogue',type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    args.output.mkdir(parents=True,exist_ok=True)
    checks=[];errors=[]
    def check(name,condition,details=None):
        checks.append({'name':name,'pass':bool(condition),'details':details})
        if not condition:raise AssertionError(name+': '+str(details))
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
            page=browser.new_page(viewport={'width':1440,'height':1000})
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.goto(args.catalogue.resolve().as_uri(),wait_until='load')
            page.wait_for_function('typeof walkReady!=="undefined" && walkReady')
            counts=page.evaluate('({rows:rows.length,cards:document.querySelectorAll(".card").length,frames:walkRows.length})')
            check('61 original entries and eight cycle frames available offline',counts=={'rows':61,'cards':61,'frames':8},counts)
            decoded=page.evaluate('''async()=>{const decoded=await Promise.all(rows.map(row=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve({id:row.id,w:im.naturalWidth,h:im.naturalHeight,ok:im.naturalWidth===row.width&&im.naturalHeight===row.height});im.onerror=()=>resolve({id:row.id,ok:false});im.src=row.file})));return {count:decoded.length,failed:decoded.filter(row=>!row.ok)}}''')
            check('Every original PNG decodes at its recorded dimensions',decoded['count']==61 and not decoded['failed'],decoded)
            page.select_option('#use','runtime');check('Runtime filter returns39',page.locator('.card').count()==39)
            page.select_option('#use','catalogue');check('Catalogue-only filter returns22',page.locator('.card').count()==22)
            page.select_option('#use','');page.select_option('#category','character-animation')
            check('Animation filter returns eight distinct phases',page.locator('.card').count()==8)
            page.select_option('#category','');page.fill('#query','microscope')
            check('Search resolves the new microscope',page.locator('.card').count()==1)
            page.locator('.view').first.click();check('Detail opens with the exact prop instance',page.locator('#detail').evaluate('(el)=>el.open') and 'workshop-f10-12' in page.locator('#description').inner_text())
            page.click('#close');check('Detail closes',not page.locator('#detail').evaluate('(el)=>el.open'))
            page.click('#walkplay')
            before=page.evaluate('({index:walkIndex,clock:walkClock})');page.wait_for_timeout(250)
            after=page.evaluate('({index:walkIndex,clock:walkClock})');check('Pause freezes the preview clock and phase',before==after,after)
            page.evaluate('''()=>{window.catalogueDraws=[];const original=wc.drawImage.bind(wc);wc.drawImage=(...args)=>{window.catalogueDraws.push({src:args[0].src,rectangle:args.slice(1)});return original(...args)}}''')
            selected=[]
            for index in range(8):
                page.locator('#walkphase').evaluate('(el,value)=>{el.value=String(value);el.dispatchEvent(new Event("input",{bubbles:true}))}',index)
                selected.append(page.evaluate('({index:walkIndex,id:walkRows[walkIndex].id,draw:window.catalogueDraws.at(-1)})'))
            check('All eight decoded phases issue real canvas draws',all(row['index']==i and row['id'].endswith(str(i+1).zfill(2)) and row['draw']['src'].endswith(row['id']+'.png') and len(row['draw']['rectangle'])==8 for i,row in enumerate(selected)),selected)
            page.select_option('#walkface','-1');check('Mirrored preview is selectable',page.input_value('#walkface')=='-1')
            page.select_option('#bg','light');check('Light alpha inspection background applies',page.locator('body').get_attribute('data-bg')=='light')
            page.select_option('#bg','checker');check('Checker alpha inspection background applies',page.locator('body').get_attribute('data-bg')=='checker')
            page.select_option('#walkspeed','0.5');page.click('#walkplay');before=page.evaluate('walkClock');page.wait_for_timeout(250)
            check('Playback resumes at the chosen rate',page.evaluate('walkClock')>before)
            check('No page JavaScript errors',not errors,errors)
            browser.close()
    finally:
        result={'scope':'V012 cumulative offline catalogue only; independent of game browser checks',
            'checks':checks,'passed':sum(row['pass'] for row in checks),'failed':sum(not row['pass'] for row in checks),
            'pageErrors':errors,'browserLaunched':bool(checks)}
        (args.output/'catalogue-v012.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps(result,ensure_ascii=False))

if __name__=='__main__':main()
