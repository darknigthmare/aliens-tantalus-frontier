import { EDITOR_TILE_TYPES_V135, EDITOR_BRUSH_MODES_V135, assertEditorDimensionsV135, normalizeEditorProjectV135,
  editorLineCellsV135, editorRectangleCellsV135, editorFloodCellsV135 } from './editor-authoring-v135.js';
const TILE_TYPES = EDITOR_TILE_TYPES_V135;

export class LevelEditor {
  constructor(canvas, onChange = () => {}) {
    this.canvas = canvas; this.context = canvas.getContext('2d'); this.onChange = onChange;
    this.cols = 32; this.rows = 18; this.tool = 'floor'; this.brushMode = 'paint'; this.tiles = new Map();
    this.dragging = false; this.lastPaintKey = null; this.history = []; this.future = []; this.shipMode = false;
    this.strokeV135 = null; this.listenersV135 = new Set(); this.keyboardCellV135 = [0, 0];
    this.bind(); this.draw();
  }

  bind() {
    this.canvas.style.touchAction = 'none';
    if (!this.canvas.hasAttribute?.('tabindex')) this.canvas.setAttribute?.('tabindex', '0');
    const cell = (event, clamp = false) => {
      const rect = this.canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return null;
      let x = Math.floor((event.clientX - rect.left) / rect.width * this.cols), y = Math.floor((event.clientY - rect.top) / rect.height * this.rows);
      if (clamp) { x = Math.max(0, Math.min(this.cols - 1, x)); y = Math.max(0, Math.min(this.rows - 1, y)); }
      return x >= 0 && x < this.cols && y >= 0 && y < this.rows ? [x, y] : null;
    };
    this.boundDownV135 = event => {
      if (this.strokeV135 || event.isPrimary === false || ![0, 2].includes(event.button ?? 0)) return;
      const start = cell(event); if (!start) return;
      event.preventDefault(); this.canvas.focus?.(); this.keyboardCellV135 = start;
      const mode = event.button === 2 || event.shiftKey ? 'erase' : this.brushMode;
      this.strokeV135 = { id: event.pointerId, mode, tool: this.tool, before: this.state(), start, previous: start };
      this.dragging = true;
      try { this.canvas.setPointerCapture?.(event.pointerId); } catch { /* Detached synthetic canvases need no capture. */ }
      if (mode === 'fill') this.applyCellsV135(editorFloodCellsV135(this.tiles, this.cols, this.rows, start, this.tool), this.tool);
      else this.applyCellsV135([start], mode === 'erase' ? undefined : this.tool);
      this.draw();
    };
    this.boundMoveV135 = event => {
      const stroke = this.strokeV135; if (!stroke || stroke.id !== event.pointerId) return;
      event.preventDefault(); const current = cell(event, true); if (!current) return;
      this.keyboardCellV135 = current;
      if (stroke.mode === 'rectangle') {
        this.tiles = new Map(stroke.before.tiles);
        this.applyCellsV135(editorRectangleCellsV135(stroke.start, current), stroke.tool);
      } else if (stroke.mode !== 'fill') {
        this.applyCellsV135(editorLineCellsV135(stroke.previous, current), stroke.mode === 'erase' ? undefined : stroke.tool);
      }
      stroke.previous = current; this.draw();
    };
    this.boundUpV135 = event => { if (this.strokeV135?.id === event.pointerId) this.finishStrokeV135(); };
    this.boundCancelV135 = event => { if (this.strokeV135?.id === event.pointerId) this.finishStrokeV135({ cancel: true }); };
    this.boundContextV135 = event => event.preventDefault();
    this.boundKeyV135 = event => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && ['z', 'y'].includes(event.key.toLowerCase())) {
        event.preventDefault(); if (event.key.toLowerCase() === 'y' || event.shiftKey) this.redo(); else this.undo(); return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (directions[event.key]) {
        event.preventDefault(); const delta = directions[event.key];
        this.keyboardCellV135 = [Math.max(0, Math.min(this.cols - 1, this.keyboardCellV135[0] + delta[0])), Math.max(0, Math.min(this.rows - 1, this.keyboardCellV135[1] + delta[1]))];
        this.draw(); this.notifyUiV135();
      } else if ([' ', 'Enter', 'Delete', 'Backspace'].includes(event.key)) {
        event.preventDefault(); this.paintCellV135(...this.keyboardCellV135, { erase: event.shiftKey || ['Delete', 'Backspace'].includes(event.key) });
      }
    };
    this.canvas.addEventListener('pointerdown', this.boundDownV135); this.canvas.addEventListener('pointermove', this.boundMoveV135);
    globalThis.addEventListener('pointerup', this.boundUpV135); globalThis.addEventListener('pointercancel', this.boundCancelV135);
    this.canvas.addEventListener('lostpointercapture', this.boundCancelV135); this.canvas.addEventListener('contextmenu', this.boundContextV135);
    this.canvas.addEventListener('keydown', this.boundKeyV135);
  }

  subscribe(listener) { this.listenersV135.add(listener); return () => this.listenersV135.delete(listener); }
  notifyUiV135() { for (const listener of this.listenersV135) listener(this.getSnapshot()); }
  notifyV135() { this.onChange(this.serialize()); this.notifyUiV135(); }
  applyCellsV135(cells, type) { for (const [x, y] of cells) { const key = `${x}:${y}`; if (type === undefined) this.tiles.delete(key); else this.tiles.set(key, type); } }
  setTool(tool) { if (TILE_TYPES.includes(tool)) { this.finishStrokeV135(); this.tool = tool; this.notifyUiV135(); } }
  setBrushMode(mode) {
    if (!EDITOR_BRUSH_MODES_V135.includes(mode)) return false;
    this.finishStrokeV135(); this.brushMode = mode; this.notifyUiV135(); return true;
  }
  setShipMode(enabled) { const next = Boolean(enabled); if (next !== this.shipMode) this.mutate(() => { this.shipMode = next; }); }
  state() { return { shipMode: this.shipMode, size: [this.cols, this.rows], tiles: [...this.tiles] }; }
  restore(state, notify = true) {
    this.shipMode = Boolean(state.shipMode); [this.cols, this.rows] = state.size || [32, 18]; this.tiles = new Map(state.tiles || []);
    this.keyboardCellV135 = [Math.min(this.cols - 1, this.keyboardCellV135[0]), Math.min(this.rows - 1, this.keyboardCellV135[1])];
    this.draw(); if (notify) this.notifyV135();
  }
  recordChangeV135(before) {
    if (JSON.stringify(this.state()) === JSON.stringify(before)) return false;
    this.history.push(before); this.history = this.history.slice(-100); this.future = []; this.draw(); this.notifyV135(); return true;
  }
  finishStrokeV135({ cancel = false } = {}) {
    const stroke = this.strokeV135; if (!stroke) return false;
    this.strokeV135 = null; this.dragging = false; this.lastPaintKey = null;
    try { if (this.canvas.hasPointerCapture?.(stroke.id)) this.canvas.releasePointerCapture(stroke.id); } catch { /* The browser may already have released it. */ }
    if (cancel) { this.restore(stroke.before, false); return false; }
    return this.recordChangeV135(stroke.before);
  }
  mutate(callback) { this.finishStrokeV135(); const before = this.state(); callback(); return this.recordChangeV135(before); }
  clear() { return this.mutate(() => this.tiles.clear()); }
  resize(columns, rows, { crop = false } = {}) {
    assertEditorDimensionsV135(columns, rows);
    const outside = [...this.tiles.keys()].filter(key => { const [x, y] = key.split(':').map(Number); return x >= columns || y >= rows; });
    if (outside.length && !crop) throw new Error(`${outside.length} tuile(s) seraient coupées. Autorisez explicitement le rognage ou agrandissez le plan.`);
    return this.mutate(() => { this.cols = columns; this.rows = rows; for (const key of outside) this.tiles.delete(key); });
  }
  paintCellV135(x, y, { erase = false } = {}) {
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
    return this.mutate(() => {
      const mode = erase ? 'erase' : this.brushMode, replacement = mode === 'erase' ? undefined : this.tool;
      this.applyCellsV135(mode === 'fill' ? editorFloodCellsV135(this.tiles, this.cols, this.rows, [x, y], replacement) : [[x, y]], replacement);
    });
  }
  undo() { this.finishStrokeV135(); const previous = this.history.pop(); if (!previous) return false; this.future.push(this.state()); this.restore(previous); return true; }
  redo() { this.finishStrokeV135(); const next = this.future.pop(); if (!next) return false; this.history.push(this.state()); this.restore(next); return true; }
  validate() {
    const counts = Object.fromEntries(TILE_TYPES.map(type => [type, 0]));
    for (const type of this.tiles.values()) if (Object.hasOwn(counts, type)) counts[type] += 1;
    const errors = []; if (!counts.spawn) errors.push('Un point de spawn est requis.'); if (!counts.objective) errors.push('Un objectif est requis.');
    if (!(counts.floor || counts.platform)) errors.push('Au moins un sol ou une plateforme est requis.');
    return { ok: errors.length === 0, errors, counts };
  }
  getSnapshot() { return { ...this.serialize(), tool: this.tool, brushMode: this.brushMode, cursor: [...this.keyboardCellV135], canUndo: this.history.length > 0, canRedo: this.future.length > 0 }; }
  serialize() { return { schema: 2, kind: this.shipMode ? 'ship' : 'mission', size: [this.cols, this.rows], tiles: [...this.tiles].map(([position, type]) => ({ position, type })), validation: this.validate() }; }
  load(project) {
    const normalized = normalizeEditorProjectV135(project);
    this.finishStrokeV135(); const before = this.state(); this.shipMode = normalized.kind === 'ship'; [this.cols, this.rows] = normalized.size; this.tiles = new Map(normalized.tiles);
    this.keyboardCellV135 = [0, 0]; this.recordChangeV135(before);
  }
  draw() {
    const ctx = this.context, w = this.canvas.width, h = this.canvas.height, cw = w / this.cols, ch = h / this.rows;
    ctx.fillStyle = this.shipMode ? '#071013' : '#080d0d'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = 'rgba(132, 207, 163, .1)'; ctx.lineWidth = 1;
    for (let x = 0; x <= this.cols; x += 1) { ctx.beginPath(); ctx.moveTo(x * cw, 0); ctx.lineTo(x * cw, h); ctx.stroke(); }
    for (let y = 0; y <= this.rows; y += 1) { ctx.beginPath(); ctx.moveTo(0, y * ch); ctx.lineTo(w, y * ch); ctx.stroke(); }
    const colors = { floor: '#6f816d', platform: '#8ba78c', wall: '#42534d', door: '#c6aa61', vent: '#5c8791', ladder: '#a98156', lift: '#9a7bad', spawn: '#80dfaa', objective: '#e0c66d', enemy: '#c9545c', vehicle: '#7295b9', terminal: '#52c9bf', hazard: '#d47545' };
    for (const [key, type] of this.tiles) {
      const [x, y] = key.split(':').map(Number); ctx.fillStyle = colors[type] || '#fff'; ctx.fillRect(x * cw + 1, y * ch + 1, Math.max(1, cw - 2), Math.max(1, ch - 2));
      if (cw >= 16 && ch >= 16) { ctx.fillStyle = '#07100c'; ctx.font = '12px monospace'; ctx.fillText(type[0].toUpperCase(), x * cw + cw * .36, y * ch + ch * .66); }
    }
    if (globalThis.document?.activeElement === this.canvas) {
      ctx.strokeStyle = '#f5e998'; ctx.lineWidth = 2; ctx.strokeRect(this.keyboardCellV135[0] * cw + 1, this.keyboardCellV135[1] * ch + 1, Math.max(1, cw - 2), Math.max(1, ch - 2));
    }
  }
  destroy() {
    this.finishStrokeV135({ cancel: true }); this.listenersV135.clear();
    for (const [name, listener] of [['pointerdown', this.boundDownV135], ['pointermove', this.boundMoveV135], ['lostpointercapture', this.boundCancelV135], ['contextmenu', this.boundContextV135], ['keydown', this.boundKeyV135]]) this.canvas.removeEventListener(name, listener);
    globalThis.removeEventListener('pointerup', this.boundUpV135); globalThis.removeEventListener('pointercancel', this.boundCancelV135);
  }
}
export { TILE_TYPES };
