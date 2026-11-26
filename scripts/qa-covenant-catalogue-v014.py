#!/usr/bin/env python3
"""Inspect every original PNG and all five offline walking previews in Chromium."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalogue', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    source = json.loads((args.catalogue.parent / 'manifest.json').read_text())
    runtime = json.loads((args.catalogue.parent / 'runtime-sprites.json').read_text())
    expected_total = len(source['assets'])
    expected_runtime = len(runtime['assets'])
    expected_cycles = {row['id']: row for row in source['cycles']}
    assert expected_total >= 94 and expected_runtime == 72
    checks, errors, cycles, bible_checks = [], [], [], []

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
            check('Every source-manifest entry and all five eight-frame cycles are available offline',
                  counts == {'rows': expected_total, 'cards': expected_total, 'phases': 40, 'cycles': 5}, counts)
            bible_rows = source.get('bibleDocuments', [])
            bible_ok = len(bible_rows) == 4 and {row['file'] for row in bible_rows} == {
                'bible/BIBLE_COVENANT_V014.' + extension for extension in ('md', 'json', 'html', 'xlsx')}
            for row in bible_rows:
                raw = (args.catalogue.parent / row['file']).read_bytes()
                bible_ok = bible_ok and len(raw) == row['bytes'] and hashlib.sha256(raw).hexdigest() == row['sha256']
            check('All four detailed bible formats are linked and preserve their recorded bytes',
                  bible_ok and page.locator('#bible-open').get_attribute('href') == 'bible/BIBLE_COVENANT_V014.html'
                  and len(page.locator('.biblepanel a').all()) == 4, bible_rows)
            bible_page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            bible_page.on('pageerror', lambda error: errors.append('bible: ' + str(error)))
            bible_page.goto((args.catalogue.parent / 'bible/BIBLE_COVENANT_V014.html').resolve().as_uri(), wait_until='load')
            bible_summary = bible_page.evaluate('({assets:data.assets.length,references:data.summary.referenceEntries,groups:data.groups.length})')
            check('The linked offline bible opens with the complete asset index and reference register',
                  bible_summary['assets'] == expected_total and bible_summary['references'] == 315
                  and bible_summary['groups'] >= 8, bible_summary)
            for identity, expected_images in (
                ('walter', ['walter-walk-' + str(index + 1).zfill(2) for index in range(8)]),
                ('landing', ['background-planet4-lake'])
            ):
                group_name = bible_page.evaluate('id=>data.groups.find(group=>group.rows.some(row=>row.id===id))?.name', identity)
                if group_name is None:
                    raise AssertionError('Missing bible record: ' + identity)
                bible_page.select_option('#group', group_name)
                bible_page.locator('#list [data-id="' + identity + '"]').click()
                for picture in bible_page.locator('#detail .gallery img').all():
                    picture.scroll_into_view_if_needed()
                bible_page.wait_for_function('''()=>[...document.querySelectorAll('#detail .gallery img')]
                    .every(image=>image.complete&&image.naturalWidth>0)''')
                pictures = bible_page.locator('#detail .gallery img').evaluate_all('''images=>images.map(image=>({
                    src:image.src,width:image.naturalWidth,height:image.naturalHeight}))''')
                check('The detailed bible record decodes its delivered new images: ' + identity,
                      all(any(row['src'].endswith('/sprites/' + image_id + '.png')
                              and row['width'] > 0 and row['height'] > 0 for row in pictures)
                          for image_id in expected_images),
                      {'record': identity, 'expectedImages': expected_images, 'decodedImages': len(pictures)})
                bible_page.evaluate('window.scrollTo(0,0)')
                bible_page.screenshot(path=str(args.output / ('bible-' + identity + '.png')))
                bible_page.screenshot(path=str(args.output / ('bible-' + identity + '.jpg')), type='jpeg', quality=65)
                bible_checks.append({'record': identity, 'expectedImages': expected_images,
                                     'decodedImages': len(pictures), 'preview': 'bible-' + identity + '.jpg'})
            bible_page.close()
            decoded = page.evaluate('''async()=>{
              const decoded=await Promise.all(rows.map(row=>new Promise(resolve=>{
                const im=new Image();im.onload=()=>resolve({id:row.id,w:im.naturalWidth,h:im.naturalHeight,
                  ok:im.naturalWidth===row.width&&im.naturalHeight===row.height});
                im.onerror=()=>resolve({id:row.id,ok:false});im.src=row.file;
              })));return {count:decoded.length,failed:decoded.filter(row=>!row.ok)};
            }''')
            check('Every original PNG decodes at its recorded dimensions',
                  decoded['count'] == expected_total and not decoded['failed'], decoded)
            page.select_option('#use', 'runtime')
            check('Runtime filter matches the 72 specifically admitted images', page.locator('.card').count() == expected_runtime)
            page.select_option('#use', 'catalogue')
            check('Catalogue-only filter contains every remaining original image',
                  page.locator('.card').count() == expected_total - expected_runtime)
            page.select_option('#use', '')
            page.select_option('#category', 'character-animation')
            check('Animation filter returns 40 distinct supplied phases', page.locator('.card').count() == 40)
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
            check('Cycle selector names the four player costumes and the scoped Walter NPC cycle',
                  set(cycle_ids) == {'daniels-work-walk', 'daniels-walk', 'daniels-eva-walk', 'david-young-walk', 'walter-walk'}
                  and len(cycle_ids) == 5, cycle_ids)
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
                playback = page.evaluate('''({clock:walkClock,index:walkIndex,
                  frequency:cycle.angularFrequency,draw:window.catalogueDraws.at(-1)})''')
                expected_index = math.floor(playback['clock'] * expected_cycles[identity]['angularFrequency'] / (2 * math.pi) * 8) % 8
                check('Playback uses the selected cycle cadence and requested rate: ' + identity,
                      playback['clock'] > before_clock and page.input_value('#walkspeed') == '0.5'
                      and playback['frequency'] == expected_cycles[identity]['angularFrequency']
                      and playback['index'] == expected_index
                      and playback['draw']['src'].endswith(selected_ids[expected_index] + '.png'), playback)
                cycles.append({'id': identity, 'frames': selected_ids, 'forwardDraws': selected,
                               'mirroredDraw': mirrored, 'angularFrequency': playback['frequency']})
            # Real PNGs still decode in Chromium. Only callback delivery for the
            # first selection is delayed, making the out-of-order completion
            # race deterministic instead of depending on incidental disk speed.
            page.evaluate('''()=>{
              const NativeImage=window.Image;window.qaNativeImageV014=NativeImage;
              window.qaDelayedCompletionsV014=0;
              window.Image=function(...args){
                const image=new NativeImage(...args);let callback=null;
                Object.defineProperty(image,'onload',{configurable:true,
                  get(){return callback},set(value){callback=value}});
                image.addEventListener('load',event=>{
                  const delayed=image.src.includes('/daniels-walk-');
                  setTimeout(()=>{if(callback)callback.call(image,event);
                    if(delayed)window.qaDelayedCompletionsV014++;},delayed?600:0);
                });return image;
              };
              window.Image.prototype=NativeImage.prototype;
              const selector=document.querySelector('#walkcycle');
              for(const id of ['daniels-walk','daniels-eva-walk','david-young-walk']){
                selector.value=id;selector.dispatchEvent(new Event('change',{bubbles:true}));
              }
            }''')
            try:
                page.wait_for_function('walkReady && window.qaDelayedCompletionsV014===8')
                page.wait_for_timeout(80)
                race = page.evaluate('''({selected:document.querySelector('#walkcycle').value,
                  rows:walkRows.map(row=>row.id),images:walkImages.map(image=>image.src),
                  lastDraw:window.catalogueDraws.at(-1),delayedCompletions:window.qaDelayedCompletionsV014})''')
                expected = ['david-young-walk-' + str(index + 1).zfill(2) for index in range(8)]
                check('Late completion of an older selection cannot replace the final costume images',
                      race['selected'] == 'david-young-walk' and race['rows'] == expected
                      and len(race['images']) == 8
                      and all(url.endswith(identity + '.png') for url, identity in zip(race['images'], expected))
                      and '/david-young-walk-' in race['lastDraw']['src']
                      and race['delayedCompletions'] == 8, race)
            finally:
                page.evaluate('window.Image=window.qaNativeImageV014;delete window.qaNativeImageV014')
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
        result = {'scope': 'V014 cumulative offline catalogue only; independent of game browser checks',
                  'sourceEntries': expected_total, 'runtimeEntries': expected_runtime,
                  'catalogueOnlyEntries': expected_total - expected_runtime,
                  'decodedEntries': decoded['count'] if 'decoded' in locals() else 0,
                  'bibleFiles': len(source.get('bibleDocuments', [])),
                  'bibleRecords': bible_checks,
                  'checks': checks, 'passed': sum(row['pass'] for row in checks),
                  'failed': sum(not row['pass'] for row in checks), 'cycles': cycles,
                  'fixtures': {'selectionRace': 'Real PNG decoding; onload callback for the first selected costume delayed by 600ms to force stale completion after the final choice'},
                  'pageErrors': errors, 'browserLaunched': bool(checks)}
        (args.output / 'catalogue-v014.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
