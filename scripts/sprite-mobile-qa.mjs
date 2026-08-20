const endpoint = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9225';
const appUrl = process.env.APP_URL || 'http://127.0.0.1:4173/';
const target = await fetch(`${endpoint}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });

let sequence = 0;
const pending = new Map();
const errors = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails?.exception?.description || message.params.exceptionDetails?.text);
  if (!message.id || !pending.has(message.id)) return;
  const request = pending.get(message.id);
  pending.delete(message.id);
  message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
});
const command = (method, params = {}) => {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
};

await command('Page.enable');
await command('Runtime.enable');
await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await command('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await command('Page.navigate', { url: appUrl });
await new Promise((resolve) => setTimeout(resolve, 1300));

const evaluated = await command('Runtime.evaluate', {
  expression: `(() => {
    document.querySelector('[data-view="codex"]').click();
    const audit = document.querySelector('.postulate-audit');
    const gallery = document.querySelector('#art-bible');
    return {
      panel: document.querySelector('.view.active')?.dataset.panel,
      auditColumns: getComputedStyle(audit).gridTemplateColumns,
      galleryColumns: getComputedStyle(gallery).gridTemplateColumns,
      artCards: gallery.children.length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      menuToggleVisible: getComputedStyle(document.querySelector('#menu-toggle')).display !== 'none',
      errors: ${JSON.stringify(errors)}
    };
  })()`,
  returnByValue: true
});
if (evaluated.exceptionDetails) throw new Error(evaluated.exceptionDetails.text);
const report = evaluated.result.value;
report.errors = errors;
report.ok = report.panel === 'codex' && report.artCards === 12 && report.overflow <= 1 && report.menuToggleVisible && report.auditColumns.split(' ').length === 1 && report.galleryColumns.split(' ').length === 1 && errors.length === 0;
socket.close();
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
