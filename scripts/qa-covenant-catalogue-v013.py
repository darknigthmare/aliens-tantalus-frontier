#!/usr/bin/env python3
"""Inspect every original PNG and all four offline walking previews in Chromium."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalogue', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    checks, errors, cycles = [], [], []

    def check(name, condition, details=None):
        checks.append({'name': name, 'pass': bool(condition), 'details': details})
        if not condition:
            raise AssertionError(name + ': ' + str(details))

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(args.catalogue.resolve().as_uri(), wait_until='load')
            page.wait_for_function('typeof walkReady!=="undefined" && walkReady')
            counts = page.evaluate('''({rows:rows.length,cards:document.querySelectorAll('.card').length,
                phases:rows.filter(row=>row.category==='character-animation').length,
                cycles:document.querySelectorAll('#walkcycle option').length})''')
            check('85 original entries and four eight-frame cycles are available offline',
                  counts == {'rows': 85, 'cards': 85, 'phases': 32, 'cycles': 4}, counts)
            decoded = page.evaluate('''async()=>{
              const decoded=await Promise.all(rows.map(row=>new Promise(resolve=>{
                const im=new Image();im.onload=()=>resolve({id:row.id,w:im.naturalWidth,h:im.naturalHeight,
                  ok:im.naturalWidth===row.width&&im.naturalHeight===row.height});
                im.onerror=()=>resolve({id:row.id,ok:false});im.src=row.file;
              })));return {count:decoded.length,failed:decoded.filter(row=>!row.ok)};
            }''')
            check('Every original PNG decodes at its recorded dimensions',
                  decoded['count'] == 85 and not decoded['failed'], decoded)
            page.select_option('#use', 'runtime')
            check('Runtime filter returns 63 images', page.locator('.card').count() == 63)
            page.select_option('#use', 'catalogue')
            check('Catalogue-only filter returns 22 images', page.locator('.card').count() == 22)
            page.select_option('#use', '')
            page.select_option('#category', 'character-animation')
            check('Animation filter returns 32 distinct supplied phases', page.locator('.card').count() == 32)
            page.select_option('#category', '')
            page.fill('#query', 'microscope')
            check('Search still resolves the existing microscope', page.locator('.card').count() == 1)
            page.locator('.view').first.click()
            check('Detail retains the exact prop instance', page.locator('#detail').evaluate('(el)=>el.open')
                  and 'workshop-f10-12' in page.locator('#description').inner_text())
            page.click('#close')
            check('Detail closes', not page.locator('#detail').evaluate('(el)=>el.open'))
            page.fill('#query', '')
            cycle_ids = page.locator('#walkcycle option').evaluate_all('(options)=>options.map(option=>option.value)')
            check('Cycle selector names exactly the four actual player costumes',
                  set(cycle_ids) == {'daniels-work-walk', 'daniels-walk', 'daniels-eva-walk', 'david-young-walk'}
                  and len(cycle_ids) == 4, cycle_ids)
            page.evaluate('''()=>{
              window.catalogueDraws=[];const original=wc.drawImage.bind(wc);
              wc.drawImage=(...args)=>{const m=wc.getTransform();window.catalogueDraws.push({
                src:args[0].src,rectangle:args.slice(1),a:m.a,d:m.d});return original(...args)};
            }''')
            for identity in cycle_ids:
                page.select_option('#walkcycle', identity)
                page.wait_for_function('''id=>walkReady&&walkRows.length===8
                  &&walkRows.every(row=>row.id.startsWith(id+'-'))''', arg=identity)
                selected_ids = page.evaluate('walkRows.map(row=>row.id)')
                check('Selected cycle contains eight correctly ordered phases: ' + identity,
                      selected_ids == [identity + '-' + str(index + 1).zfill(2) for index in range(8)], selected_ids)
                if page.evaluate('walkPlaying'):
                    page.click('#walkplay')
                before = page.evaluate('({index:walkIndex,clock:walkClock})')
                page.wait_for_timeout(180)
                after = page.evaluate('({index:walkIndex,clock:walkClock})')
                check('Pause freezes preview clock and phase: ' + identity, before == after, after)
                page.select_option('#walkface', '1')
                page.evaluate('window.catalogueDraws=[]')
                selected = []
                for index in range(8):
                    page.locator('#walkphase').evaluate('''(el,value)=>{
                      el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));
                    }''', index)
                    selected.append(page.evaluate('''({index:walkIndex,id:walkRows[walkIndex].id,
                        draw:window.catalogueDraws.at(-1)})'''))
                check('All eight decoded phases issue real forward Canvas draws: ' + identity,
                      all(row['index'] == index and row['id'] == selected_ids[index]
                          and row['draw']['src'].endswith(row['id'] + '.png')
                          and len(row['draw']['rectangle']) == 8 and row['draw']['a'] > 0 and row['draw']['d'] > 0
                          for index, row in enumerate(selected)), selected)
                page.select_option('#walkface', '-1')
                mirrored = page.evaluate('window.catalogueDraws.at(-1)')
                check('Direction change really reflects the current Canvas image: ' + identity,
                      mirrored['a'] < 0 and mirrored['d'] > 0
                      and mirrored['src'].endswith(selected_ids[-1] + '.png'), mirrored)
                page.select_option('#walkspeed', '0.5')
                page.click('#walkplay')
                before_clock = page.evaluate('walkClock')
                page.wait_for_timeout(180)
                check('Playback resumes for the selected cycle at the chosen rate: ' + identity,
                      page.evaluate('walkClock') > before_clock and page.input_value('#walkspeed') == '0.5')
                cycles.append({'id': identity, 'frames': selected_ids, 'forwardDraws': selected,
                               'mirroredDraw': mirrored})
            # Real PNGs still decode in Chromium. Only callback delivery for the
            # first selection is delayed, making the out-of-order completion
            # race deterministic instead of depending on incidental disk speed.
            page.evaluate('''()=>{
              const NativeImage=window.Image;window.qaNativeImageV013=NativeImage;
              window.qaDelayedCompletionsV013=0;
              window.Image=function(...args){
                const image=new NativeImage(...args);let callback=null;
                Object.defineProperty(image,'onload',{configurable:true,
                  get(){return callback},set(value){callback=value}});
                image.addEventListener('load',event=>{
                  const delayed=image.src.includes('/daniels-walk-');
                  setTimeout(()=>{if(callback)callback.call(image,event);
                    if(delayed)window.qaDelayedCompletionsV013++;},delayed?600:0);
                });return image;
              };
              window.Image.prototype=NativeImage.prototype;
              const selector=document.querySelector('#walkcycle');
              for(const id of ['daniels-walk','daniels-eva-walk','david-young-walk']){
                selector.value=id;selector.dispatchEvent(new Event('change',{bubbles:true}));
              }
            }''')
            try:
                page.wait_for_function('walkReady && window.qaDelayedCompletionsV013===8')
                page.wait_for_timeout(80)
                race = page.evaluate('''({selected:document.querySelector('#walkcycle').value,
                  rows:walkRows.map(row=>row.id),images:walkImages.map(image=>image.src),
                  lastDraw:window.catalogueDraws.at(-1),delayedCompletions:window.qaDelayedCompletionsV013})''')
                expected = ['david-young-walk-' + str(index + 1).zfill(2) for index in range(8)]
                check('Late completion of an older selection cannot replace the final costume images',
                      race['selected'] == 'david-young-walk' and race['rows'] == expected
                      and len(race['images']) == 8
                      and all(url.endswith(identity + '.png') for url, identity in zip(race['images'], expected))
                      and '/david-young-walk-' in race['lastDraw']['src']
                      and race['delayedCompletions'] == 8, race)
            finally:
                page.evaluate('window.Image=window.qaNativeImageV013;delete window.qaNativeImageV013')
            page.select_option('#bg', 'light')
            check('Light alpha inspection background applies', page.locator('body').get_attribute('data-bg') == 'light')
            page.select_option('#bg', 'checker')
            checker = page.locator('#walkcanvas').evaluate('(canvas)=>getComputedStyle(canvas).backgroundImage')
            check('Checker alpha inspection background reaches the walking canvas',
                  page.locator('body').get_attribute('data-bg') == 'checker'
                  and checker != 'none', {'canvasBackgroundImage': checker})
            check('No page JavaScript errors', not errors, errors)
            browser.close()
    finally:
        result = {'scope': 'V013 cumulative offline catalogue only; independent of game browser checks',
                  'checks': checks, 'passed': sum(row['pass'] for row in checks),
                  'failed': sum(not row['pass'] for row in checks), 'cycles': cycles,
                  'fixtures': {'selectionRace': 'Real PNG decoding; onload callback for the first selected costume delayed by 600ms to force stale completion after the final choice'},
                  'pageErrors': errors, 'browserLaunched': bool(checks)}
        (args.output / 'catalogue-v013.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
