const TILE_TYPES = ['floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift', 'spawn', 'objective', 'enemy', 'vehicle', 'terminal', 'hazard'];

export class LevelEditor {
  constructor(canvas, onChange = () => {}) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.onChange = onChange;
    this.cols = 32;
    this.rows = 18;
    this.tool = 'floor';
    this.tiles = new Map();
    this.dragging = false;
    this.lastPaintKey = null;
    this.history = [];
    this.future = [];
    this.shipMode = false;
    this.bind();
    this.draw();
  }

  bind() {
    const paint = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = Math.floor(((event.clientX - rect.left) / rect.width) * this.cols);
      const y = Math.floor(((event.clientY - rect.top) / rect.height) * this.rows);
      if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;
      const key = `${x}:${y}`;
      const erase = event.button === 2 || event.shiftKey;
      if (this.lastPaintKey === `${key}:${erase ? 'erase' : this.tool}`) return;
      this.lastPaintKey = `${key}:${erase ? 'erase' : this.tool}`;
      this.mutate(() => {
        if (erase) this.tiles.delete(key);
        else this.tiles.set(key, this.tool);
      });
    };
    this.canvas.addEventListener('pointerdown', (event) => { this.dragging = true; paint(event); });
    this.canvas.addEventListener('pointermove', (event) => { if (this.dragging) paint(event); });
    globalThis.addEventListener('pointerup', () => { this.dragging = false; this.lastPaintKey = null; });
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  setTool(tool) { if (TILE_TYPES.includes(tool)) this.tool = tool; }
  setShipMode(enabled) {
    const next = Boolean(enabled);
    if (next === this.shipMode) return;
    this.mutate(() => { this.shipMode = next; });
  }

  state() {
    return { shipMode: this.shipMode, tiles: [...this.tiles] };
  }

  restore(state, notify = true) {
    this.shipMode = Boolean(state.shipMode);
    this.tiles = new Map(state.tiles || []);
    this.draw();
    if (notify) this.onChange(this.serialize());
  }

  mutate(callback) {
    const before = this.state();
    const signature = JSON.stringify(before);
    callback();
    if (JSON.stringify(this.state()) === signature) return;
    this.history.push(before);
    this.history = this.history.slice(-100);
    this.future = [];
    this.draw();
    this.onChange(this.serialize());
  }

  clear() { this.mutate(() => this.tiles.clear()); }

  undo() {
    const previous = this.history.pop();
    if (!previous) return false;
    this.future.push(this.state());
    this.restore(previous);
    return true;
  }

  redo() {
    const next = this.future.pop();
    if (!next) return false;
    this.history.push(this.state());
    this.restore(next);
    return true;
  }

  validate() {
    const counts = Object.fromEntries(TILE_TYPES.map((type) => [type, 0]));
    for (const type of this.tiles.values()) if (Object.hasOwn(counts, type)) counts[type] += 1;
    const errors = [];
    if (!counts.spawn) errors.push('Un point de spawn est requis.');
    if (!counts.objective) errors.push('Un objectif est requis.');
    if (!(counts.floor || counts.platform)) errors.push('Au moins un sol ou une plateforme est requis.');
    return { ok: errors.length === 0, errors, counts };
  }

  getSnapshot() {
    return {
      ...this.serialize(),
      tool: this.tool,
      canUndo: this.history.length > 0,
      canRedo: this.future.length > 0
    };
  }

  serialize() {
    return {
      schema: 2,
      kind: this.shipMode ? 'ship' : 'mission',
      size: [this.cols, this.rows],
      tiles: [...this.tiles].map(([position, type]) => ({ position, type })),
      validation: this.validate()
    };
  }

  load(project) {
    if (!project?.tiles) throw new Error('Projet éditeur invalide.');
    this.history.push(this.state());
    this.future = [];
    this.shipMode = project.kind === 'ship';
    this.tiles = new Map(project.tiles.map((tile) => [tile.position, tile.type]));
    this.draw();
    this.onChange(this.serialize());
  }

  draw() {
    const ctx = this.context;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cw = w / this.cols;
    const ch = h / this.rows;
    ctx.fillStyle = this.shipMode ? '#071013' : '#080d0d';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(132, 207, 163, .1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.cols; x += 1) { ctx.beginPath(); ctx.moveTo(x * cw, 0); ctx.lineTo(x * cw, h); ctx.stroke(); }
    for (let y = 0; y <= this.rows; y += 1) { ctx.beginPath(); ctx.moveTo(0, y * ch); ctx.lineTo(w, y * ch); ctx.stroke(); }
    const colors = {
      floor: '#6f816d', platform: '#8ba78c', wall: '#42534d', door: '#c6aa61', vent: '#5c8791', ladder: '#a98156',
      lift: '#9a7bad', spawn: '#80dfaa', objective: '#e0c66d', enemy: '#c9545c', vehicle: '#7295b9', terminal: '#52c9bf', hazard: '#d47545'
    };
    for (const [key, type] of this.tiles) {
      const [x, y] = key.split(':').map(Number);
      ctx.fillStyle = colors[type] || '#fff';
      ctx.fillRect(x * cw + 1, y * ch + 1, cw - 2, ch - 2);
      ctx.fillStyle = '#07100c';
      ctx.font = '12px monospace';
      ctx.fillText(type[0].toUpperCase(), x * cw + cw * 0.36, y * ch + ch * 0.66);
    }
  }
}

export { TILE_TYPES };
