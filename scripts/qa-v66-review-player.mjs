// Local, isolated candidate review. No game saves, production state or acceptance writes.
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const endpoint = 'http://127.0.0.1:9236';
const url = 'http://127.0.0.1:4177/docs/references/v66-batch-002-player/index.html';
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const browserInfo = await fetch(endpoint + '/json/version').then((response) => response.json());
const socket = new WebSocket(browserInfo.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once:true }); socket.addEventListener('error', reject, { once:true }); });
let sequence = 0, sessionId, contextId;
const pending = new Map(), exceptions = [], consoleErrors = [];
socket.addEventListener('message', ({data}) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) { const request = pending.get(message.id); clearTimeout(request.timer); pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); }
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') consoleErrors.push(message.params.args.map((arg) => arg.value || arg.description).join(' '));
});
function command(method, params = {}, browser = false) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 15000);
    pending.set(id, {resolve, reject, timer});
    socket.send(JSON.stringify({id, method, params, ...(!browser && sessionId ? {sessionId} : {})}));
  });
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', {expression, awaitPromise:true, returnByValue:true});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function waitFor(expression) {
  const start = Date.now();
  while (Date.now() - start < 15000) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Player did not become ready: ' + expression);
}
const results = [];
try {
  ({browserContextId:contextId} = await command('Target.createBrowserContext', {}, true));
  const {targetId} = await command('Target.createTarget', {url:'about:blank', browserContextId:contextId}, true);
  ({sessionId} = await command('Target.attachToTarget', {targetId, flatten:true}, true));
  await command('Runtime.enable'); await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', {width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await command('Page.navigate', {url});
  await waitFor("document.querySelector('#play') && !document.querySelector('#play').disabled");
  requireThat(await evaluate("document.body.innerText.includes('ATLAS CANDIDATS')"), 'Candidate notice missing');
  const profiles = await evaluate("Array.from(document.querySelector('#profile').options, option=>option.value)");
  requireThat(profiles.length === 20, 'Expected exactly twenty candidate profiles');
  for (const profile of profiles) {
    await evaluate(`document.querySelector('#profile').value=${JSON.stringify(profile)}; document.querySelector('#profile').dispatchEvent(new Event('change'))`);
    await waitFor(`!document.querySelector('#play').disabled && document.querySelector('#stage').dataset.profile===${JSON.stringify(profile)}`);
    const clips = await evaluate("Array.from(document.querySelector('#clip').options, option=>option.value)");
    for (const clip of clips) {
      await evaluate(`document.querySelector('#clip').value=${JSON.stringify(clip)}; document.querySelector('#clip').dispatchEvent(new Event('change'))`);
      const frames = [];
      for (let i=0;i<8;i++) {
        const frame = await evaluate("({index:Number(document.querySelector('#stage').dataset.frame), pixels:document.querySelector('#stage').toDataURL()})");
        requireThat(frame.index === i, `Wrong frame order: ${profile}/${clip}`);
        frames.push(createHash('sha256').update(frame.pixels).digest('hex'));
        await evaluate("document.querySelector('#next').click()");
      }
      requireThat(new Set(frames).size === 8, `Repeated canvas poses: ${profile}/${clip}`);
      results.push({profileId:profile,clipId:clip,loaded:true,uniqueRenderedPoses:8});
    }
  }
  // Test actual RAF progression and non-looping death, not only manual stepping.
  await evaluate("document.querySelector('#clip').value='move'; document.querySelector('#clip').dispatchEvent(new Event('change')); document.querySelector('#play').click()");
  await waitFor("Number(document.querySelector('#stage').dataset.frame)>0");
  await evaluate("document.querySelector('#play').click(); document.querySelector('#clip').value='death'; document.querySelector('#clip').dispatchEvent(new Event('change')); document.querySelector('#speed').value='2'; document.querySelector('#play').click()");
  await waitFor("document.querySelector('#stage').dataset.frame==='7' && document.querySelector('#play').textContent==='Lire'");
  const right = await evaluate("document.querySelector('#stage').toDataURL()");
  await evaluate("document.querySelector('#facing').value='-1'; document.querySelector('#facing').dispatchEvent(new Event('change'))");
  requireThat(right !== await evaluate("document.querySelector('#stage').toDataURL()"), 'Facing toggle did not change rendering');
  await mkdir('.qa/v66-batch-002', {recursive:true});
  const capture = await command('Page.captureScreenshot', {format:'png'});
  await writeFile('.qa/v66-batch-002/player.png', Buffer.from(capture.data, 'base64'));
  await command('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true});
  requireThat(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'), 'Review player overflows mobile viewport');
  requireThat(exceptions.length === 0 && consoleErrors.length === 0, JSON.stringify({exceptions,consoleErrors}));
  const report = {schema:1,checkedAt:new Date().toISOString(),url,result:'pass',profiles:20,clips:results.length,poses:results.length*8,
    actualPlaybackChecked:true,nonLoopDeathHeld:true,facingToggleChecked:true,mobileOverflow:false,exceptions,consoleErrors,
    productionStateWrites:0,acceptedAutomatically:0,scope:'Local atlas-review player only, not gameplay integration or artistic acceptance',results};
  await writeFile('docs/references/V66_BATCH_002_PLAYER_QA.json', JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,results:undefined}));
} finally {
  if (contextId) await command('Target.disposeBrowserContext', {browserContextId:contextId}, true);
  socket.close();
}
