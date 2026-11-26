/* PNG presentation adapter for the immutable Sea of Sorrows 0.10 campaign.
 * Coordinates, collisions, targeting, story, inventory and saves remain owned by
 * the original simulation. Missing or unusable presentation falls back to its
 * existing vector renderer. Crops and attachment points use source-image pixels.
 */
(function (root) {
  'use strict';
  if (!root.SoSRenderer || !root.SoSArtPack || root.SoSPngRenderer) return;
  const R = root.SoSRenderer.prototype;
  const pack = root.SoSArtPack.assets || {};
  const native = Object.fromEntries([
    'human', 'alien', 'corpse', 'decor', 'prop', 'egg', 'archive', 'supply',
    'locker', 'armoryRack', 'sensor', 'emitter', 'object', 'device', 'weakpoint',
    'stretcher', 'stasisDisplay', 'door', 'shutter', 'lightPanel',
    'tacticalGround', 'drawEffects',
  ].map(name => [name, R[name]]));
  const states = new Map(), used = new Map(), methods = new Map();
  let drawCount = 0;
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const pair = a => Array.isArray(a) && a.length === 2 && a.every(finite);
  const entries = () => Object.entries(pack).flatMap(([category, group]) =>
    Object.entries(group).map(([id, entry]) => ({ category, id, entry })));
  const point = (entry, name) => {
    const p = entry[name];
    return pair(p) && p[0] >= 0 && p[0] <= entry.width && p[1] >= 0 && p[1] <= entry.height ? p : null;
  };
  const box = (entry, name) => {
    const a = entry[name];
    return Array.isArray(a) && a.length === 4 && a.every(finite) &&
      a[0] >= 0 && a[1] >= 0 && a[2] > 0 && a[3] > 0 &&
      a[0] + a[2] <= entry.width && a[1] + a[3] <= entry.height ? a : null;
  };
  function valid(entry) {
    if (!entry || typeof entry.src !== 'string' || !entry.src ||
        !Number.isInteger(entry.width) || !Number.isInteger(entry.height) ||
        entry.width < 1 || entry.height < 1 || entry.width > 16384 || entry.height > 16384 ||
        !finite(entry.worldHeight) || entry.worldHeight <= 0 || entry.worldHeight > 2000 ||
        !['left', 'right', 'none'].includes(entry.facing) || !point(entry, 'pivot')) return false;
    const a = entry.crop;
    return Array.isArray(a) && a.length === 4 && a.every(finite) &&
      a[0] >= 0 && a[1] >= 0 && a[2] > 0 && a[3] > 0 &&
      a[0] + a[2] <= entry.width && a[1] + a[3] <= entry.height;
  }
  function load(category, id) {
    const key = category + '/' + id;
    if (states.has(key)) return states.get(key);
    const entry = pack[category]?.[id];
    if (!entry) return null;
    const state = { key, entry, status: 'invalid', image: null, promise: Promise.resolve() };
    states.set(key, state);
    if (!valid(entry)) return state;
    if (typeof root.Image !== 'function') { state.status = 'unavailable'; return state; }
    state.status = 'loading';
    state.promise = new Promise(resolve => {
      const image = new root.Image();
      state.image = image;
      let settled = false;
      const finish = status => {
        if (settled) return;
        settled = true;
        state.status = status;
        image.onload = image.onerror = null;
        resolve();
      };
      image.onload = () => finish(image.naturalWidth === entry.width && image.naturalHeight === entry.height ? 'ready' : 'wrong-size');
      image.onerror = () => finish('failed');
      try { image.src = entry.src; }
      catch { finish('failed'); }
    });
    return state;
  }
  function asset(category, id, facing = 1) {
    const state = load(category, id);
    if (!state || state.status !== 'ready') return null;
    const entry = state.entry;
    const authored = entry.facing === 'left' ? -1 : 1;
    const flip = entry.facing === 'none' ? 1 : (facing < 0 ? -1 : 1) * authored;
    return { state, entry, flip, scale: entry.worldHeight / entry.crop[3] };
  }
  function localPoint(png, name) {
    const p = point(png.entry, name);
    return p ? { x: (p[0] - png.entry.pivot[0]) * png.scale * png.flip, y: (p[1] - png.entry.pivot[1]) * png.scale } : null;
  }
  function paint(c, png) {
    const a = png.entry, [x, y, w, h] = a.crop, k = png.scale;
    c.save();
    try {
      c.scale(png.flip, 1);
      c.drawImage(png.state.image, x, y, w, h,
        (x - a.pivot[0]) * k, (y - a.pivot[1]) * k, w * k, h * k);
      used.set(png.state.key, (used.get(png.state.key) || 0) + 1);
      drawCount++;
      return true;
    } catch {
      png.state.status = 'failed';
      return false;
    } finally { c.restore(); }
  }
  function atWorld(renderer, png, q, sx = renderer.unit, sy = sx) {
    const c = renderer.ctx;
    c.save(); c.translate(q.x, q.y); c.scale(sx, sy);
    const drawn = paint(c, png);
    c.restore();
    return drawn;
  }
  function emission(renderer, png, from, to, stretchToTarget = false) {
    const anchor = localPoint(png, 'emissionAnchor');
    if (!anchor || png.entry.facing !== 'right') return false;
    const dx = to.x - from.x, dy = to.y - from.y, distance = Math.hypot(dx, dy);
    if (!(distance > 0)) return false;
    const right = (png.entry.crop[0] + png.entry.crop[2] - png.entry.pivot[0]) * png.scale;
    const length = right - anchor.x;
    if (!(length > 0)) return false;
    const c = renderer.ctx;
    c.save(); c.translate(from.x, from.y); c.rotate(Math.atan2(dy, dx));
    c.scale(stretchToTarget ? distance / length : renderer.unit, renderer.unit);
    c.translate(-anchor.x, -anchor.y);
    const drawn = paint(c, png);
    c.restore();
    return drawn;
  }
  function atSource(renderer, png, origin, sx, sy) {
    // A pair authored on the same source canvas (door and frame) must keep
    // that common transform; their individual crops/heights are not two scales.
    const c = renderer.ctx, k = png.scale;
    c.save(); c.translate(origin.x, origin.y); c.scale(sx / k, sy / k);
    c.translate(png.entry.pivot[0] * k, png.entry.pivot[1] * k);
    const drawn = paint(c, png);
    c.restore();
    return drawn;
  }
  function coverHand(c, png, name) {
    const p = localPoint(png, name);
    if (!p) return;
    // Recompose only the existing pixels around a verified hand; source images
    // stay untouched. This lets a compact foreground pistol remain visible
    // without painting its grip over the actor's fingers.
    c.save(); c.beginPath(); c.ellipse(p.x, p.y, 3.2, 4.1, 0, 0, Math.PI * 2); c.clip();
    paint(c, png); c.restore();
  }
  const fallback = (name, self, args) => native[name]?.apply(self, args);
  const near = (r, a, n) => r.game.distance(a, r.game.p) < n;
  const profileFor = role => root.SoSData.fidelity.characters[role] || root.SoSData.fidelity.characters.worker;

  function bodyAsset(renderer, actor, role, portrait, time) {
    const g = renderer.game, actualPlayer = actor === g.p && role === 'decker';
    const armed = !portrait && (role === 'manning' || actualPlayer && g.state.inventory.pistol);
    const posture = actualPlayer && g.p.dodgeTime > 0 ? '-dodge' : actualPlayer && g.p.crouch ? '-crouch' : '';
    // Chapter-four medical variants belong only to the existing sanitary
    // transit scene. The generic medic/civilian portraits and all simulation
    // identities remain unchanged in every other room.
    const medicalPose = !portrait && g.room.id === 's03' ?
      actualPlayer && !armed ? 'decker-medical-gown' : role === 'medic' ? 'carlyle-physician' : null : null;
    // Two authored contact poses, only for the actual unarmed walking player.
    // The native simulation clock pauses with the game; reduced motion keeps
    // the existing static pose. This does not create a locomotion state.
    const walking = !portrait && actualPlayer && !armed && !posture && !medicalPose && actor.moving && !renderer.reduced;
    const phase = Math.floor(Math.max(0, finite(time) ? time : finite(g.time) ? g.time : 0) * 4) % 2;
    const candidates = portrait ? [role] : [...new Set([
      ...(medicalPose ? [medicalPose] : []),
      ...(walking ? ['decker-walk-' + (phase ? 'b' : 'a')] : []),
      ...(armed ? [role + posture + '-ready'] : []), role + posture,
      ...(armed ? [role + '-ready'] : []), role,
    ])];
    for (const id of candidates) {
      const png = asset('characters', id, actor.facing || 1);
      if (!png || armed && png.entry.weaponHidden !== true && !point(png.entry, 'handAnchor')) continue;
      if (!portrait && actualPlayer && g.state.flags.equipped && g.p.lamp && !point(png.entry, 'lampAnchor')) continue;
      png.pose = id;
      png.armed = armed;
      png.postureScale = posture && !id.includes(posture) ? .78 : 1;
      return png;
    }
    return null;
  }
  const portraitWaits = new WeakMap();
  function redrawPortraitWhenReady(renderer, actor, t, role) {
    const canvas = renderer.canvas, pending = load('characters', role);
    if (!pending || pending.status !== 'loading' || portraitWaits.has(canvas)) return;
    portraitWaits.set(canvas, true);
    pending.promise.then(() => {
      portraitWaits.delete(canvas);
      if (pending.status !== 'ready' || canvas.isConnected === false) return;
      const c = renderer.ctx;
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.fillStyle = '#132a36'; c.fillRect(0, 0, canvas.width, canvas.height);
      renderer.human(actor, t, role);
      c.restore();
    });
  }
  R.human = function (a, t, role) {
    const g = this.game, c = this.ctx;
    const portrait = this.canvas.classList?.contains('castPortrait') === true;
    if (!portrait && (a === g.p || a === g.state.companion)) {
      this._pngMuzzles ||= Object.create(null);
      delete this._pngMuzzles[role];
    }
    const png = bodyAsset(this, a, role, portrait, t);
    if (!png) {
      if (portrait) redrawPortraitWhenReady(this, a, t, role);
      return fallback('human', this, arguments);
    }
    let weapon = null, grip = null, hand = null;
    if (png.armed && png.entry.weaponHidden !== true) {
      const id = role === 'decker' ? g.p.weapon : 'pistol';
      weapon = asset('weapons', id, a.facing || 1);
      grip = weapon && localPoint(weapon, 'gripAnchor');
      hand = localPoint(png, 'handAnchor');
      if (!weapon || !grip || !hand) return fallback('human', this, arguments);
    }
    const q = this.pos(a.x, g.zFor(a)), s = this.unit * (.82 + g.zFor(a) * .30) * png.postureScale;
    this.shadow(q, 24 * s);
    c.save(); c.translate(q.x, q.y); c.scale(s, s);
    const frontWeapon = weapon?.entry.bodyLayer === 'front';
    const paintWeapon = () => {
      c.save(); c.translate(hand.x - grip.x, hand.y - grip.y); const ok = paint(c, weapon); c.restore(); return ok;
    };
    if (weapon && !frontWeapon && !paintWeapon()) { c.restore(); return fallback('human', this, arguments); }
    // Empty hands in the body image cover the mounted weapon, keeping its grip
    // behind the fingers instead of painting a firearm across them.
    if (!paint(c, png)) { c.restore(); return fallback('human', this, arguments); }
    if (frontWeapon) {
      if (!paintWeapon()) { c.restore(); return fallback('human', this, arguments); }
      coverHand(c, png, 'handAnchor'); coverHand(c, png, 'supportHandAnchor');
    }
    const muzzle = weapon && localPoint(weapon, 'muzzleAnchor');
    if (muzzle && !portrait && (a === g.p || a === g.state.companion)) {
      this._pngMuzzles[role] = {
        weapon: role === 'manning' ? 'ally' : g.p.weapon,
        x: (hand.x - grip.x + muzzle.x) * s,
        y: (hand.y - grip.y + muzzle.y) * s,
      };
    }
    if (!portrait && a === g.p && g.state.flags.equipped) {
      let p = localPoint(png, 'lampAnchor');
      const lamp = p && asset('equipment', 'lamp', a.facing || 1);
      const mount = lamp && localPoint(lamp, 'mountAnchor'), tip = lamp && localPoint(lamp, 'emitterAnchor');
      if (mount && tip) {
        c.save(); c.translate(p.x - mount.x, p.y - mount.y);
        const mounted = paint(c, lamp); c.restore();
        if (mounted) p = { x: p.x - mount.x + tip.x, y: p.y - mount.y + tip.y };
      }
      if (g.p.lamp && p) {
        const f = a.facing < 0 ? -1 : 1;
        this.ellipse(p.x, p.y, 3, 3, '#e0d08b');
        const beam = c.createLinearGradient(p.x, p.y, p.x + f * 330, p.y);
        beam.addColorStop(0, '#e1e6ad19'); beam.addColorStop(1, '#e1e6ad00');
        this.path([[p.x, p.y], [p.x + f * 330, p.y - 50], [p.x + f * 330, p.y + 70]], beam);
      }
    }
    c.restore();
    if (!portrait && role !== 'decker' && near(this, a, 290)) this.text(
      png.pose === 'carlyle-physician' ? 'Médecin du Carlyle' : profileFor(role).name,
      q.x, q.y - 126 * this.unit, 11, '#d4dcce', 'center');
  };

  const nativeDraw = R.draw;
  R.draw = function (time, dt) {
    this._pngMuzzles = Object.create(null);
    return nativeDraw.call(this, time, dt);
  };
  R.drawEffects = function (dt) {
    for (const e of this.effects) {
      e.ttl -= dt;
      if (e.ttl <= 0) continue;
      const c = this.ctx; c.save(); c.globalAlpha = e.ttl / e.max;
      if (e.type === 'shot') {
        const a = this.pos(e.from.x, this.game.mode === 'SIDE' ? .55 : e.from.z);
        const b = this.pos(e.to.x, this.game.mode === 'SIDE' ? .55 : e.to.z);
        const muzzle = this._pngMuzzles?.[e.weapon === 'ally' ? 'manning' : 'decker'];
        const attached = muzzle?.weapon === e.weapon;
        const x = a.x + (attached ? muzzle.x : 25), y = a.y + (attached ? muzzle.y : -61 * this.unit);
        const color = e.weapon === 'flame' ? '#f7c268' : e.weapon === 'foam' ? '#c9d4b0' : '#e8dcb2';
        const id = e.weapon === 'flame' ? 'flame' : ['pistol', 'pulse', 'ally'].includes(e.weapon) ? 'muzzle' : null;
        const png = id && asset('effects', id);
        // Flame follows the accepted shot's exact endpoint. The foam PNG is a
        // settled mass, so it belongs to an enemy's real foam state below.
        const target = { x: b.x, y: b.y - 62 * this.unit };
        if (!(id === 'flame' && png && emission(this, png, { x, y }, target, true))) {
          this.line(x, y, target.x, target.y, color, e.weapon === 'flame' ? 13 : e.weapon === 'foam' ? 9 : 1.7);
          if (!(id === 'muzzle' && png && emission(this, png, { x, y }, target))) {
            this.ellipse(attached ? x : a.x + 29, y, 13, 6, color);
          }
        }
      } else {
        const a = this.pos(e.x, this.game.mode === 'SIDE' ? .55 : e.z);
        const id = e.type === 'hit' ? 'impact' : e.type === 'spark' ? 'spark' : null;
        const png = id && asset('effects', id), impact = png && localPoint(png, 'impactAnchor');
        if (!impact || !atWorld(this, png, { x: a.x - impact.x * this.unit, y: a.y - (60 + impact.y) * this.unit })) {
          for (let j = 0; j < 7; j++) {
            const angle = j * .89, radius = (1 - e.ttl / e.max) * 60;
            this.line(a.x, a.y - 60 * this.unit, a.x + Math.cos(angle) * radius, a.y - 60 * this.unit + Math.sin(angle) * radius, '#c2cf82', 2);
          }
        }
      }
      c.restore();
    }
    this.effects = this.effects.filter(e => e.ttl > 0);
  };

  R.decor = function (kind, t) {
    const png = asset('decor', kind);
    if (!png || !paint(this.ctx, png)) return fallback('decor', this, arguments);
  };
  R.prop = function (b) {
    const png = asset('obstacles', b.kind);
    if (!png) return fallback('prop', this, arguments);
    const q = this.pos(b.x, b.z), depth = .83 + b.z * .3;
    const w = b.w * depth, h = b.h * this.unit * depth;
    this.shadow(q, w * .58);
    // The image's visible rectangle follows the native obstacle's dimensions;
    // the collision rectangle itself remains unchanged in the original core.
    const naturalWidth = png.entry.crop[2] * png.scale;
    if (!atWorld(this, png, q, w / naturalWidth, h / png.entry.worldHeight)) return fallback('prop', this, arguments);
  };
  R.alien = function (e, t) {
    // captureAdult is a simulation role for the same adult morphology, not a
    // separate species. Never mutate the kind or reuse a living pose for death.
    const png = asset('creatures', e.kind === 'captureAdult' ? 'adult' : e.kind, e.facing || 1);
    const q = this.pos(e.x, this.game.zFor(e)), s = this.unit * (.85 + this.game.zFor(e) * .33);
    let body = false;
    if (png) {
      this.shadow(q, (e.kind === 'queen' ? 85 : e.kind === 'facehugger' ? 30 : 45) * this.unit);
      body = atWorld(this, png, q, s);
    }
    if (!body) fallback('alien', this, arguments);
    if (e.foam > .1) {
      const c = this.ctx; c.save(); c.globalAlpha *= root.SoSCore.clamp(e.foam, .2, .85);
      const foam = asset('effects', 'foam'), ground = foam && localPoint(foam, 'groundAnchor');
      const drawn = ground && atWorld(this, foam, { x: q.x - ground.x * s, y: q.y - ground.y * s }, s);
      // The vector alien already includes its restraint. Only a PNG body
      // needs this native fallback when the foam texture is unavailable.
      if (!drawn && body) this.ellipse(q.x, q.y - 13 * s, 30 * s, 13 * s, '#c6cba3');
      c.restore();
    }
  };
  R.tacticalGround = function (t) {
    fallback('tacticalGround', this, arguments);
    // This native stage runs before corpses and actors. The original draw()
    // still paints acid's bubbles, footprint and ACIDE warning over the PNG.
    for (const a of this.game.rs.acid) if (a.time > 0) {
      const png = asset('effects', 'acid'), ground = png && localPoint(png, 'groundAnchor');
      if (!ground) continue;
      const q = this.pos(a.x, this.game.zFor(a));
      atWorld(this, png, { x: q.x - ground.x * this.unit, y: q.y - ground.y * this.unit });
    }
  };
  R.door = function (d) {
    const g = this.game, c = this.ctx, u = this.unit, p = d.portal || {};
    const mount = p.mount || 'back', type = p.type || 'bulkhead';
    // Oblique walls, travel, rock, lifts and stairs keep their authored native
    // geometry. This front-facing pair only fits actual industrial bays.
    if (type !== 'bulkhead' || !['back', 'front'].includes(mount)) return fallback('door', this, arguments);
    const status = g.doorStatus(d), frame = asset('doors', 'bulkhead-frame');
    const panel = status.open ? null : asset('doors', 'bulkhead-panel');
    const aperture = frame && box(frame.entry, 'apertureBounds');
    if (!aperture || frame.entry.facing !== 'none' || !status.open && (!panel ||
        panel.entry.facing !== 'none' || panel.entry.canvasMatch !== 'bulkhead-frame' ||
        panel.entry.width !== frame.entry.width || panel.entry.height !== frame.entry.height)) return fallback('door', this, arguments);
    const approach = this.pos(d.x, g.zFor(d)), q = this.pos(d.x, p.apertureZ ?? g.zFor(d));
    const h = 152 * u, w = (p.width || 110) * u, front = mount === 'front';
    const left = this.pos(0, front ? .95 : .10), right = this.pos(g.room.width, front ? .95 : .10);
    const sx = w / aperture[2], sy = h / aperture[3];
    const origin = { x: q.x - (aperture[0] + aperture[2] / 2) * sx, y: q.y - (aperture[1] + aperture[3]) * sy };
    c.save();
    if (front && Math.abs(g.p.x - d.x) < 170) c.globalAlpha = .42;
    // Preserve the exact native enclosing wall and approach. Only its frame
    // and leaf are replaced, so transparency is not composited twice.
    const keep = c.globalAlpha, wallH = h * 1.13;
    if (front) c.globalAlpha = .48;
    this.rect(left.x, q.y - wallH, Math.max(0, q.x - w * .61 - left.x), wallH + this.H * .12, '#243e49');
    this.rect(q.x + w * .61, q.y - wallH, Math.max(0, right.x - q.x - w * .61), wallH + this.H * .12, '#243e49');
    for (let x = left.x + 25 * u; x < right.x; x += 140 * u) {
      if (Math.abs(x - q.x) < w * .8) continue;
      this.line(x, q.y - wallH + 5 * u, x, q.y + this.H * .11, '#718a91', 4 * u);
      this.line(x + 7 * u, q.y - wallH + 5 * u, x + 7 * u, q.y + this.H * .11, '#0c2028', 2 * u);
    }
    this.line(left.x, q.y, right.x, q.y, '#9bafa7', 4 * u); c.globalAlpha = keep;
    this.line(left.x, q.y - h * 1.13, right.x, q.y - h * 1.13, '#758c93', 3 * u);
    this.rect(q.x - w * .5, q.y - h, w, h, '#081a23');
    this.line(approach.x - 28 * u, approach.y, q.x - 28 * u, q.y, '#e6c48c99', 2 * u);
    this.line(approach.x + 28 * u, approach.y, q.x + 28 * u, q.y, '#e6c48c99', 2 * u);
    if (panel && !atSource(this, panel, origin, sx, sy) || !atSource(this, frame, origin, sx, sy)) {
      c.restore(); return fallback('door', this, arguments);
    }
    c.globalAlpha = 1;
    const color = status.open ? '#abc9bb' : '#d39474';
    this.ellipse(approach.x, approach.y, 23 * u, 5 * u, color + '66');
    if (near(this, d, 175)) {
      const tx = Math.max(this.camera + 155, Math.min(g.room.width - 150, d.x)) - this.camera;
      this.rect(tx - 148, q.y - h - 49 * u, 296, 39 * u, '#071923eb');
      this.text(d.label, tx, q.y - h - 32 * u, 11 * u, color, 'center');
      this.text((front ? 'PREMIER PLAN' : 'PAROI DE FOND') + ' · PASSAGE', tx, q.y - h - 17 * u, 9 * u, '#a7bfbc', 'center');
    }
    c.restore();
  };
  R.shutter = function (s, t) {
    fallback('shutter', this, arguments);
    const g = this.game, far = this.pos(s.x, g.mode === 'SIDE' ? .55 : .13);
    if (far.x < -180 || far.x > this.W + 180) return;
    const png = asset('equipment', 'shutter-control'), status = png && localPoint(png, 'statusAnchor');
    if (!status) return;
    const a = g.rs.shutters[s.id], u = this.unit;
    const color = a.status === 'closed' ? '#c1a680' : a.status === 'broken' ? '#925f50' : '#97bab3';
    // Keep the real shutter, integrity/progress, supports and G/E prompts.
    // The painted lever is static; the live indicator and native label carry
    // open/closed/broken state at both actual control positions.
    for (const n of g.shutterControls(s)) {
      const q = this.pos(n.x, g.zFor(n)), panel = { x: q.x, y: q.y - 50 * u };
      if (atWorld(this, png, panel)) {
        this.ellipse(panel.x + status.x * u, panel.y + status.y * u, 2.3 * u, 2.3 * u, '#11242a');
        this.ellipse(panel.x + status.x * u, panel.y + status.y * u, 1.5 * u, 1.5 * u, color);
      }
    }
  };
  R.lightPanel = function (l, t) {
    const png = asset('equipment', 'light-panel');
    const onAnchor = png && localPoint(png, 'onAnchor'), offAnchor = png && localPoint(png, 'offAnchor');
    if (!onAnchor || !offAnchor) return fallback('lightPanel', this, arguments);
    const g = this.game, c = this.ctx, q = this.pos(l.x, g.zFor(l)), u = this.unit, on = g.rs.lighting.on;
    const panel = { x: q.x, y: q.y - 62 * u };
    c.save();
    this.rect(q.x - 5 * u, q.y - 74 * u, 10 * u, 74 * u, '#435e65');
    if (!atWorld(this, png, panel)) { c.restore(); return fallback('lightPanel', this, arguments); }
    // Neutralise both painted bulbs before lighting only the real state's bulb.
    for (const a of [onAnchor, offAnchor]) this.ellipse(panel.x + a.x * u, panel.y + a.y * u, 2.1 * u, 2.1 * u, '#11242a');
    const a = on ? onAnchor : offAnchor;
    this.ellipse(panel.x + a.x * u, panel.y + a.y * u, 1.5 * u, 1.5 * u, on ? '#9ebca0' : '#d3a66c');
    this.text('LUX', q.x, q.y - 110 * u, 10, '#d7dfc7', 'center');
    if (near(this, l, 140)) this.text('E · MAINTENIR', q.x, q.y + 28 * u, 10, '#e7d5ad', 'center');
    c.restore();
  };
  R.corpse = function (e) {
    const png = asset('corpses', e.kind, e.facing || 1);
    if (!png || !atWorld(this, png, this.pos(e.x, this.game.zFor(e)), this.unit)) return fallback('corpse', this, arguments);
  };
  R.egg = function (a, scale = 1) {
    const png = asset('organic', 'egg');
    if (!png || !atWorld(this, png, this.pos(a.x, a.z), this.unit * scale)) return fallback('egg', this, arguments);
  };
  R.archive = function (a) {
    const png = asset('equipment', 'archive');
    if (!png || !atWorld(this, png, this.pos(a.x, this.game.zFor(a)))) return fallback('archive', this, arguments);
  };
  R.supply = function () {
    const png = !this.game.rs.supplyUsed && asset('equipment', 'supply');
    if (!png || !atWorld(this, png, this.pos(320, .55))) return fallback('supply', this, arguments);
  };
  R.locker = function (l) {
    const g = this.game, state = g.rs.lockers[l.id];
    const empty = state.opened && Object.values(state.contents).every(n => n === 0);
    const png = !empty && !(state.progress > 0 && !state.opened) && asset('equipment', state.opened ? 'locker-open' : 'locker');
    if (!png) return fallback('locker', this, arguments);
    const q = this.pos(l.x, l.bodyZ), u = this.unit;
    this.shadow(q, 68 * u);
    if (!atWorld(this, png, q)) return fallback('locker', this, arguments);
    const color = state.opened ? '#91c9b1' : '#dfb679';
    this.text(l.id.slice(-2), q.x, q.y - 112 * u, 12 * u, color, 'center');
    if (near(this, l, 230)) this.text(state.opened ? 'OUVERT · RÉSERVES' : 'SCELLÉ', q.x, q.y - 134 * u, 10 * u, color, 'center');
  };
  R.armoryRack = function (a) {
    const png = !this.game.state.armory.claimed && asset('equipment', 'armory-rack');
    if (!png) return fallback('armoryRack', this, arguments);
    const q = this.pos(a.x, a.bodyZ), at = this.pos(a.x, this.game.zFor(a));
    if (!atWorld(this, png, q)) return fallback('armoryRack', this, arguments);
    this.text('DOTATION · IMPULSIONS / PLASMA', q.x, q.y - 159 * this.unit, 10 * this.unit, '#d9c295', 'center');
    this.line(q.x, q.y, at.x, at.y, '#acb99555', 1.5); this.ellipse(at.x, at.y, 24, 5, '#c3a86f55');
  };
  R.sensor = function (b, t) {
    const png = asset('equipment', 'sensor');
    if (!png) return fallback('sensor', this, arguments);
    const g = this.game, q = this.pos(b.x, g.zFor(b)), u = this.unit, c = this.ctx;
    this.shadow(q, 21 * u);
    if (!atWorld(this, png, q)) return fallback('sensor', this, arguments);
    const signal = b.powered && b.lastPulse >= 0 && g.state.stats.time - b.lastPulse < 2;
    this.ellipse(q.x + 9 * u, q.y - 8 * u, 3 * u, 3 * u, signal ? '#efd28a' : b.powered ? '#8bc9b3' : '#665e4e');
    if (signal) {
      c.save(); c.strokeStyle = '#e5cb91'; c.lineWidth = 1.4; c.beginPath();
      c.ellipse(q.x, q.y, (this.reduced ? 37 : 30 + Math.sin(t * 4) * 8) * u, 12 * u, 0, 0, Math.PI * 2); c.stroke(); c.restore();
    }
    if (near(this, b, 300)) {
      this.text('CAPTEUR ' + b.id.slice(-1) + ' · ' + Math.ceil(b.charge) + ' s', q.x, q.y - 56 * u, 10, '#d0e0ce', 'center');
      if (near(this, b, 85)) this.text('P · RÉCUPÉRER', q.x, q.y + 25 * u, 10, '#e0ce9b', 'center');
    }
  };
  R.emitter = function (n, t) {
    const png = asset('equipment', 'decoy');
    if (!png) return fallback('emitter', this, arguments);
    const q = this.pos(n.x, this.game.zFor(n)), u = this.unit, c = this.ctx;
    if (!atWorld(this, png, q)) return fallback('emitter', this, arguments);
    if (!this.reduced) {
      const radius = 12 + (t % 1) * 35;
      c.save(); c.globalAlpha *= .4 * (1 - t % 1); c.beginPath(); c.ellipse(q.x, q.y, radius, radius * .3, 0, 0, Math.PI * 2);
      c.strokeStyle = '#dabc83'; c.lineWidth = 1.3; c.stroke(); c.restore();
    }
    this.ellipse(q.x, q.y - 17 * u, 3, 3, '#deb97a');
  };
  R.object = function (o) {
    const g = this.game;
    if (['boss', 'rescue'].includes(o.type) || g.state.flags[o.flag]) return fallback('object', this, arguments);
    if (g.room.id === 's03' && o.id === 'o02-01' && o.type === 'analyse') {
      const handheld = asset('objectives', 'icc-handheld');
      if (handheld) {
        // Keep the native reporting pedestal, objective marker and physical
        // interaction. The handheld rests in its display cradle, not in space.
        fallback('object', this, arguments);
        const q = this.pos(o.x, g.zFor(o));
        atWorld(this, handheld, { x: q.x, y: q.y - 64 * this.unit });
        return;
      }
    }
    const id = o.type === 'capture' ? 'capture' : o.type === 'sleep' ? 'sleep' :
      ['sample', 'scan', 'survey', 'recover', 'brood', 'sense'].includes(o.type) ? 'case' : 'console';
    const png = asset('objectives', id), q = this.pos(o.x, g.zFor(o)), u = this.unit;
    if (!png || !atWorld(this, png, q)) return fallback('object', this, arguments);
    if (g.current?.id === o.id) {
      const yy = q.y - 148 * u;
      this.path([[q.x, yy + 9], [q.x - 5, yy], [q.x + 5, yy]], '#f0d385'); this.ellipse(q.x, q.y, 25, 4, '#d8c77044');
    }
  };
  R.device = function (d, t) {
    const id = ['isolation', 'parts'].includes(d.kind) ? d.kind : 'console';
    const png = !this.game.state.optional[d.id] && asset('devices', id);
    if (!png) return fallback('device', this, arguments);
    const q = this.pos(d.x, this.game.zFor(d)), u = this.unit;
    this.shadow(q, 37);
    if (!atWorld(this, png, q)) return fallback('device', this, arguments);
    if (near(this, d, 145)) this.text('MAINTENIR E', q.x, q.y - (id === 'parts' ? 95 : id === 'isolation' ? 133 : 77) * u, 10, '#e4c690', 'center');
  };
  R.weakpoint = function (w) {
    const png = w.hp > 0 && asset('equipment', 'weakpoint');
    if (!png || !atWorld(this, png, this.pos(w.x, this.game.zFor(w)))) return fallback('weakpoint', this, arguments);
  };

  R.stretcher = function (a, t) {
    const png = asset('stretchers', a.id);
    const parasite = asset('parasites', a.id === 'adams' ? 'royal' : 'normal');
    const face = png && localPoint(png, 'faceAnchor');
    // The parasite must remain visible; a stretcher lacking a verified head
    // attachment cannot silently remove the original contamination rendering.
    if (!png || !parasite || !face) return fallback('stretcher', this, arguments);
    const g = this.game, depth = a.displayZ ?? g.zFor(a), q = this.pos(a.x, depth);
    const s = this.unit * (.83 + depth * .3), c = this.ctx;
    this.shadow(q, 76 * s);
    c.save(); c.translate(q.x, q.y); c.scale(s, s);
    if (!paint(c, png)) { c.restore(); return fallback('stretcher', this, arguments); }
    c.save(); c.translate(face.x, face.y); paint(c, parasite); c.restore();
    // royal.worldHeight already includes the 1.27 size relation. No extra
    // multiplier belongs here (nor in the vector fallback).
    if (near(this, a, 270) || a.status === 'waiting' || a.status === 'ready') {
      this.text(a.name.toUpperCase(), 0, -90, 10, '#d5dbc2', 'center');
      this.rect(-33, -84, 66, 3, '#18372d'); this.rect(-33, -84, 66 * a.integrity / 100, 3, a.integrity < 40 ? '#d77c5c' : '#a4b591');
    }
    c.restore();
  };
  R.stasisDisplay = function (slot, t) {
    const canopy = asset('equipment', 'stasis-canopy');
    if (!canopy) return fallback('stasisDisplay', this, arguments);
    const a = this.game.state.rescue.actors.find(actor => actor.id === slot.id);
    if (!a) return;
    this.stretcher({ ...a, x: slot.x, z: slot.z, displayZ: slot.z, moving: false }, t);
    const q = this.pos(slot.x, slot.z), u = this.unit;
    atWorld(this, canopy, q);
    this.text(a.name + ' · STASE / PARASITE CONSERVÉ', q.x, q.y - 139 * u, 10 * u, '#c1d7ce', 'center');
  };

  for (const name of Object.keys(native)) {
    const render = R[name];
    if (render === native[name]) continue;
    methods.set(name, { calls: 0, pngCalls: 0, vectorCalls: 0 });
    R[name] = function (...args) {
      const metric = methods.get(name), before = drawCount;
      metric.calls++;
      const result = render.apply(this, args);
      metric[drawCount > before ? 'pngCalls' : 'vectorCalls']++;
      return result;
    };
  }
  root.SoSPngRenderer = Object.freeze({
    version: 1,
    // Loading is demand-driven during play. The gallery and QA may explicitly
    // preload every image; gameplay never waits on the network to start.
    preload(categories) {
      const selection = categories ? new Set(categories) : null;
      return Promise.all(entries().filter(a => !selection || selection.has(a.category)).map(a => load(a.category, a.id)?.promise));
    },
    status() {
      return {
        total: entries().length,
        requested: states.size,
        ready: [...states.values()].filter(s => s.status === 'ready').length,
        assets: Object.fromEntries([...states].map(([key, state]) => [key, state.status])),
        drawn: Object.fromEntries(used),
        methods: Object.fromEntries([...methods].map(([name, metric]) => [name, { ...metric }])),
      };
    },
  });
})(globalThis);
