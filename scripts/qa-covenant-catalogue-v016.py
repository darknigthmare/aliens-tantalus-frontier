#!/usr/bin/env python3
"""Inspect 119 original PNGs, four bible formats and five complete walking previews."""
import argparse
import hashlib
import json
import math
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalogue', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--browser-executable', default=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH')
                        or os.environ.get('CHROMIUM_EXECUTABLE_PATH') or os.environ.get('CHROMIUM_PATH'))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    source = json.loads((args.catalogue.parent / 'manifest.json').read_text())
    runtime = json.loads((args.catalogue.parent / 'runtime-sprites.json').read_text())
    expected_total = len(source['assets'])
    expected_runtime = len(runtime['assets'])
    expected_cycles = {row['id']: row for row in source['cycles']}
    incomplete_david_ids = {'david-walk-' + phase for phase in ('01', '02', '05', '06', '07')}
    new_ids = {row['id'] for row in source['assets'] if '/alien-covenant-v016/' in row['path']}
    source_frame_ids = [frame for row in expected_cycles.values() for frame in row['frames']]
    checks, errors, cycles, bible_checks = [], [], [], []
    browser_launched, browser_path, browser_version = False, None, None
    browser_launch_attempted, environment_block = False, None

    def check(name, condition, details=None):
        checks.append({'name': name, 'pass': bool(condition), 'details': details})
        if not condition:
            raise AssertionError(name + ': ' + str(details))

    try:
        check('The cumulative release contains 119 originals, 72 runtime images and 47 catalogue images',
              expected_total == 119 and expected_runtime == 72 and expected_total - expected_runtime == 47,
              {'originals': expected_total, 'runtime': expected_runtime, 'catalogue': expected_total - expected_runtime})
        check('All sixteen V016 originals remain catalogue-only',
              len(new_ids) == 16 and not new_ids.intersection(row['id'] for row in runtime['assets']), sorted(new_ids))
        check('Complete cycles contain 40 unique phases and exclude the five incomplete David poses',
              len(expected_cycles) == 5 and len(source_frame_ids) == 40 and len(set(source_frame_ids)) == 40
              and not incomplete_david_ids.intersection(source_frame_ids), source_frame_ids)
        expected_source_files = {'provenance/manifest-' + version + '.json'
                                 for version in ('v011', 'v012', 'v013', 'v014', 'v016')}
        source_files = source.get('sourceManifests', [])
        check('The archive contains the five frozen source manifests with no unpublished V015',
              {row['file'] for row in source_files} == expected_source_files and len(source_files) == 5
              and all(hashlib.sha256((args.catalogue.parent / row['file']).read_bytes()).hexdigest() == row['sha256']
                      for row in source_files)
              and next(row['sha256'] for row in source_files if row['file'].endswith('v016.json'))
                  == '6e166985008494e08f2b528368d0ffa53ae299f59634f91a7b0e9941df607c6a',
              source_files)
        browser_launch_attempted = True
        with sync_playwright() as p:
            browser_path = args.browser_executable
            if not browser_path and not Path(p.chromium.executable_path).is_file():
                browser_path = shutil.which('chromium') or shutil.which('chromium-browser')
            if browser_path and not Path(browser_path).is_file():
                raise ValueError('Chromium executable does not exist: ' + browser_path)
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'],
                                        **({'executable_path': browser_path} if browser_path else {}))
            browser_launched, browser_version = True, browser.version
            page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(args.catalogue.resolve().as_uri(), wait_until='load')
            page.wait_for_function('typeof walkReady!=="undefined" && walkReady')
            counts = page.evaluate('''({rows:rows.length,cards:document.querySelectorAll('.card').length,
                animationImages:rows.filter(row=>row.category==='character-animation').length,
                completePhases:cycles.reduce((sum,cycle)=>sum+cycle.frames.length,0),
                cycles:document.querySelectorAll('#walkcycle option').length})''')
            check('Every source-manifest entry and all five eight-frame cycles are available offline',
                  counts == {'rows': expected_total, 'cards': expected_total, 'animationImages': 45,
                             'completePhases': 40, 'cycles': 5}, counts)
            bible_rows = source.get('bibleDocuments', [])
            bible_ok = len(bible_rows) == 4 and {row['file'] for row in bible_rows} == {
                'bible/BIBLE_COVENANT_V016.' + extension for extension in ('md', 'json', 'html', 'xlsx')}
            for row in bible_rows:
                raw = (args.catalogue.parent / row['file']).read_bytes()
                bible_ok = bible_ok and len(raw) == row['bytes'] and hashlib.sha256(raw).hexdigest() == row['sha256']
            check('All four detailed bible formats are linked and preserve their recorded bytes',
                  bible_ok and page.locator('#bible-open').get_attribute('href') == 'bible/BIBLE_COVENANT_V016.html'
                  and len(page.locator('.biblepanel a').all()) == 4, bible_rows)
            bible_page = browser.new_page(viewport={'width': 1440, 'height': 1000})
            bible_page.on('pageerror', lambda error: errors.append('bible: ' + str(error)))
            bible_page.goto((args.catalogue.parent / 'bible/BIBLE_COVENANT_V016.html').resolve().as_uri(), wait_until='load')
            bible_summary = bible_page.evaluate('({assets:data.assets.length,references:data.summary.referenceEntries,groups:data.groups.length})')
            check('The linked offline bible opens with the complete asset index and reference register',
                  bible_summary['assets'] == expected_total and bible_summary['references'] == 315
                  and bible_summary['groups'] >= 8, bible_summary)
            for identity, expected_images in (
                ('walter', ['walter-walk-' + str(index + 1).zfill(2) for index in range(8)]),
                ('landing', ['background-planet4-lake']),
                ('david', ['david-walk-' + phase for phase in ('01', '02', '05', '06', '07')]),
                ('TERR-LAKE', ['world-planet4-shore-rock']),
                ('prop-terraforming-generator-cover-concept', ['prop-generator-cover-left-concept', 'prop-generator-cover-right-concept']),
                ('VEH-AUDI', ['vehicle-audi-lunar-quattro-front', 'vehicle-audi-lunar-quattro-patrol'])
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
                source_links = bible_page.locator('#detail a[href^="http"]').evaluate_all('''links=>links.map(link=>({
                    href:link.href,text:link.textContent.trim(),
                    visible:link.getClientRects().length>0&&getComputedStyle(link).visibility!=='hidden'}))''')
                check('The detailed bible record exposes visible attributed source links: ' + identity,
                      bool(source_links) and all(row['text'] and row['visible'] for row in source_links), source_links)
                if identity == 'david':
                    delivered_david = {Path(row['src']).stem for row in pictures
                                       if Path(row['src']).stem.startswith('david-walk-')}
                    check('David has precisely the five supplied catalogue poses and no fabricated missing phase',
                          delivered_david == incomplete_david_ids, sorted(delivered_david))
                if identity == 'prop-terraforming-generator-cover-concept':
                    check('The generator-cover bible record keeps its production concept scope explicit',
                          'concept' in bible_page.locator('#detail').inner_text().lower())
                bible_page.evaluate('window.scrollTo(0,0)')
                bible_page.screenshot(path=str(args.output / ('bible-' + identity + '.png')))
                bible_page.screenshot(path=str(args.output / ('bible-' + identity + '.jpg')), type='jpeg', quality=65)
                bible_checks.append({'record': identity, 'expectedImages': expected_images,
                                     'decodedImages': len(pictures), 'sources': source_links,
                                     'preview': 'bible-' + identity + '.jpg'})
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
            check('Animation filter returns 45 original images, including five incomplete catalogue poses',
                  page.locator('.card').count() == 45)
            check('The reader explains the distinction between 45 images and 40 complete-cycle phases',
                  '45' in page.locator('#incomplete-walk-note').inner_text()
                  and '40' in page.locator('#incomplete-walk-note').inner_text()
                  and 'David' in page.locator('#incomplete-walk-note').inner_text())
            page.select_option('#category', '')
            page.fill('#query', 'microscope')
            check('Search still resolves the existing microscope', page.locator('.card').count() == 1)
            page.locator('.view').first.click()
            check('Detail retains the exact prop instance', page.locator('#detail').evaluate('(el)=>el.open')
                  and 'workshop-f10-12' in page.locator('#description').inner_text())
            page.click('#close')
            check('Detail closes', not page.locator('#detail').evaluate('(el)=>el.open'))
            page.fill('#query', '')
            for identity in ('david-walk-01', 'world-planet4-shore-rock',
                             'prop-generator-cover-left-concept', 'vehicle-audi-lunar-quattro-front'):
                page.fill('#query', identity)
                check('A new catalogue original resolves uniquely: ' + identity, page.locator('.card').count() == 1)
                page.locator('.view').first.click()
                detail_sources = page.locator('#description a[href^="http"]').evaluate_all('''links=>links.map(link=>({
                    href:link.href,text:link.textContent.trim(),visible:link.getClientRects().length>0}))''')
                check('A new original exposes visible source links and catalogue status: ' + identity,
                      bool(detail_sources) and all(row['text'] and row['visible'] for row in detail_sources)
                      and 'Catalogue uniquement' in page.locator('#description').inner_text(), detail_sources)
                page.click('#close')
            page.fill('#query', 'david-walk-')
            check('The catalogue contains exactly five incomplete David poses', page.locator('.card').count() == 5)
            page.fill('#query', '')
            cycle_ids = page.locator('#walkcycle option').evaluate_all('(options)=>options.map(option=>option.value)')
            check('Cycle selector names the four player costumes and the scoped Walter NPC cycle',
                  set(cycle_ids) == {'daniels-work-walk', 'daniels-walk', 'daniels-eva-walk', 'david-young-walk', 'walter-walk'}
                  and len(cycle_ids) == 5 and 'david-walk' not in cycle_ids, cycle_ids)
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
              const NativeImage=window.Image;window.qaNativeImageV016=NativeImage;
              window.qaDelayedCompletionsV016=0;
              window.Image=function(...args){
                const image=new NativeImage(...args);let callback=null;
                Object.defineProperty(image,'onload',{configurable:true,
                  get(){return callback},set(value){callback=value}});
                image.addEventListener('load',event=>{
                  const delayed=image.src.includes('/daniels-walk-');
                  setTimeout(()=>{if(callback)callback.call(image,event);
                    if(delayed)window.qaDelayedCompletionsV016++;},delayed?600:0);
                });return image;
              };
              window.Image.prototype=NativeImage.prototype;
              const selector=document.querySelector('#walkcycle');
              for(const id of ['daniels-walk','daniels-eva-walk','david-young-walk']){
                selector.value=id;selector.dispatchEvent(new Event('change',{bubbles:true}));
              }
            }''')
            try:
                page.wait_for_function('walkReady && window.qaDelayedCompletionsV016===8')
                page.wait_for_timeout(80)
                race = page.evaluate('''({selected:document.querySelector('#walkcycle').value,
                  rows:walkRows.map(row=>row.id),images:walkImages.map(image=>image.src),
                  lastDraw:window.catalogueDraws.at(-1),delayedCompletions:window.qaDelayedCompletionsV016})''')
                expected = ['david-young-walk-' + str(index + 1).zfill(2) for index in range(8)]
                check('Late completion of an older selection cannot replace the final costume images',
                      race['selected'] == 'david-young-walk' and race['rows'] == expected
                      and len(race['images']) == 8
                      and all(url.endswith(identity + '.png') for url, identity in zip(race['images'], expected))
                      and '/david-young-walk-' in race['lastDraw']['src']
                      and race['delayedCompletions'] == 8, race)
            finally:
                page.evaluate('window.Image=window.qaNativeImageV016;delete window.qaNativeImageV016')
            page.select_option('#bg', 'light')
            check('Light alpha inspection background applies', page.locator('body').get_attribute('data-bg') == 'light')
            page.select_option('#bg', 'checker')
            checker = page.locator('#walkcanvas').evaluate('(canvas)=>getComputedStyle(canvas).backgroundImage')
            check('Checker alpha inspection background reaches the walking canvas',
                  page.locator('body').get_attribute('data-bg') == 'checker'
                  and checker != 'none', {'canvasBackgroundImage': checker})
            check('No page JavaScript errors', not errors, errors)
            browser.close()
    except Exception as error:
        if browser_launch_attempted and not browser_launched:
            environment_block = {'stage': 'chromium-launch', 'reason': str(error),
                                 'assetFailureObserved': False}
        elif not checks or checks[-1]['pass']:
            checks.append({'name': 'Catalogue verification completed without an unexpected exception',
                           'pass': False, 'details': str(error)})
        raise
    finally:
        result = {'scope': 'V016 cumulative offline catalogue only; independent of game browser checks',
                  'sourceEntries': expected_total, 'runtimeEntries': expected_runtime,
                  'catalogueOnlyEntries': expected_total - expected_runtime,
                  'decodedEntries': decoded['count'] if 'decoded' in locals() else 0,
                  'bibleFiles': len(source.get('bibleDocuments', [])),
                  'bibleRecords': bible_checks,
                  'checks': checks, 'passed': sum(row['pass'] for row in checks),
                  'failed': sum(not row['pass'] for row in checks), 'cycles': cycles,
                  'fixtures': {'selectionRace': 'Real PNG decoding; onload callback for the first selected costume delayed by 600ms to force stale completion after the final choice'},
                  'pageErrors': errors, 'browserLaunched': browser_launched,
                  'executionStatus': ('blocked-environment' if environment_block
                                      else 'failed' if any(not row['pass'] for row in checks) else 'passed'),
                  'environmentBlock': environment_block,
                  'browserExecutable': browser_path, 'browserVersion': browser_version,
                  'animationImages': 45, 'completeCyclePhases': len(source_frame_ids),
                  'incompleteDavidPoses': sorted(incomplete_david_ids)}
        (args.output / 'catalogue-v016.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()

