import { LevelEditor } from '../src/editor.js';

/** Canvas/input sink for the real editor controller. Browser QA owns DOM/art. */
export function editorHostV140(t, options = {}) {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const context = new Proxy({}, { get: (target, key) => target[key] ?? (() => {}), set: (target, key, value) => (target[key] = value, true) });
  const attributes = new Map(), captures = new Set();
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, style: {}, ownerDocument: null,
    getContext: () => context, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    setAttribute: (key, value) => attributes.set(key, value), hasAttribute: key => attributes.has(key),
    setPointerCapture: id => captures.add(id), hasPointerCapture: id => captures.has(id), releasePointerCapture: id => captures.delete(id),
    focus() { document.activeElement = this; } });
  const changes = [], editor = new LevelEditor(canvas, value => changes.push(structuredClone(value)), options);
  t?.after(() => editor.destroy());
  const pointer = (name, x, y, overrides = {}) => {
    const m = editor.matrix(), event = new Event(name, { cancelable: true });
    Object.assign(event, { pointerId: 1, pointerType: 'mouse', button: 0, isPrimary: true,
      clientX: m.x + (x + .5) * m.scale, clientY: m.y + (y + .5) * m.scale, shiftKey: false, altKey: false, ...overrides });
    canvas.dispatchEvent(event); return event;
  };
  const key = (value, modifiers = {}) => { const event = new Event('keydown', { cancelable: true }); Object.assign(event, { key: value, ...modifiers }); canvas.dispatchEvent(event); return event; };
  const select = (from, to = from, scope = 'visible') => {
    key('Escape'); editor.selectionScopeV133 = scope; key('v'); pointer('pointerdown', ...from); pointer('pointermove', ...to); pointer('pointerup', ...to);
  };
  const paint = (x, y, type = editor.tool, layer = editor.layer) => editor.edit('Poser un bloc', () => editor.model.paint(x, y, type, layer));
  const resize = (columns, rows, options) => editor.edit('Redimensionner', () => editor.model.resize(columns, rows, options));
  return { editor, changes, canvas, events, captures, pointer, key, select, paint, resize };
}
