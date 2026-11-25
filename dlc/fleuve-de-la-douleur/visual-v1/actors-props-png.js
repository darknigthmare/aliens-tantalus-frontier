/* Install after fidelity-ui.js and before ui.js. Only covered presentation
 * states are replaced; world sorting, model state and persistence stay native. */
(function (root) {
  'use strict';
  const P = root.ROP_Renderer.prototype;
  const originalPerson = P.person, originalResident = P.resident;
  const originalProp = P.prop, originalExtraProp = P.extraProp;
  const propKinds = new Set(['case', 'glass', 'egg', 'sealed-egg', 'egg-bed', 'specimen']);
  P.person = function (body, id, player, multiplier) {
    player = Boolean(player);
    if (multiplier === undefined) multiplier = 1;
    const sprites = root.ROP_SPRITES, sim = this.fidelitySim, state = sim && sim.s;
    // Residents deliberately arrive with id "anne"; their supplied appearance
    // is the real identity. Never replace them with Anne's portrait.
    const identity = body.appearance ? body.appearance.id : id;
    const key = (body.appearance ? 'resident:' : player ? 'player:' : 'person:') + identity;
    const moving = sprites && sprites.moving(this, key, body);
    if (!sprites || !identity || moving || body.aim || body.hurt > 0 || body.hp <= 0
      || body.reload > 0 || body.crouch && body.stowed
      || state && state.passages && state.passages.transit
      || player && state && state.status === 'dead'
      || player && sim && sim.cooldown > 0) return originalPerson.call(this, body, id, player, multiplier);
    const armed = !body.appearance && (id === 'brackett' || id === 'paris');
    const weapon = armed && !body.stowed ? player && state
      ? root.ROP_ARMORY.active(state) : 'pulse' : 'none';
    const pose = body.stowed ? 'stowed' : body.crouch ? 'crouch' : 'idle';
    const facing = body.facing || 1;
    let entry = sprites.select({ category: 'person', targetId: identity,
      pose, weapon, state: 'normal', facing });
    // In both native person renderers, stowed only changes an armed Marine's
    // hands/weapon. Unarmed standing portraits have the exact idle silhouette.
    // Keep explicit stowed art first; never borrow idle for crouch or motion.
    if (!entry && !armed && body.stowed && !body.crouch)
      entry = sprites.select({ category: 'person', targetId: identity,
        pose: 'idle', weapon: 'none', state: 'normal', facing });
    if (!entry) return originalPerson.call(this, body, id, player, multiplier);
    const position = this.project(body.x, body.z), scale = this.scale * (.82 + body.z * .28) * multiplier;
    let drawn = false;
    this.ctx.save();
    try {
      this.ellipse(position.x, position.y + 2 * scale, (armed ? 24 : 18) * scale, 5 * scale, '#01080dc0');
      drawn = sprites.draw(this.ctx, entry, { x: position.x, y: position.y, scale, facing });
    } finally { this.ctx.restore(); }
    if (!drawn) return originalPerson.call(this, body, id, player, multiplier);
  };
  if (originalResident) P.resident = function (body, definition, sim) {
    const sprites = root.ROP_SPRITES;
    const waiting = body.wait > 0 || Math.abs(body.x - sim.s.player.x) < 160;
    const cowering = body.alarm > 0 && Math.abs(body.x - definition.refuge.x) < 18;
    const moving = sprites && sprites.moving(this, 'resident-accessory:' + definition.id,
      { ...body, walk: waiting ? 0 : body.walk });
    const entry = sprites && !moving && !cowering && !body.aim && !(body.hurt > 0)
      && !(body.hp <= 0) && !(body.reload > 0)
      && !(sim.s.passages && sim.s.passages.transit)
      && sprites.select({ category: 'person', targetId: definition.id, pose: 'idle',
        weapon: 'none', state: 'normal', facing: body.facing || 1, accessory: definition.tool });
    if (!entry) return originalResident.call(this, body, definition, sim);
    const position = this.project(body.x, body.z), scale = this.scale * (.82 + body.z * .28);
    let drawn = false;
    this.ctx.save();
    try {
      this.ellipse(position.x, position.y + 2 * scale, 18 * scale, 5 * scale, '#01080dc0');
      drawn = sprites.draw(this.ctx, entry,
        { x: position.x, y: position.y, scale, facing: body.facing || 1 });
    } finally { this.ctx.restore(); }
    if (!drawn) return originalResident.call(this, body, definition, sim);
    // The PNG includes the declared tool in the resident's hands. Only this
    // successful draw omits the native tool overlay; proximity labels remain
    // at their exact native coordinates in the same depth-sorted actor pass.
    if (root.ROP_CORE.dist(body, sim.s.player) < 250) {
      const k = this.scale;
      this.text(definition.name, position.x, position.y - (definition.height + 30) * k,
        12 * k, '#d2dccc', 'center');
      this.text(body.alarm > 0 ? 'CHERCHE UN ABRI' : 'E / P · ÉCHANGER',
        position.x, position.y - (definition.height + 14) * k, 8.5 * k,
        body.alarm > 0 ? '#d6aa7b' : '#91bbb0', 'center');
    }
  };
  function drawPropImage(prop, room, state) {
    const sprites = root.ROP_SPRITES;
    if (!sprites || !propKinds.has(prop.kind)) return false;
    const entry = sprites.select({ category: 'prop', targetId: prop.kind,
      pose: 'static', weapon: 'none', state: 'normal', facing: 0 });
    if (!entry) return false;
    if (prop.kind === 'egg-bed') {
      // A single upright egg cannot stand in for the broad collision bed.
      // A separately authored wide floor image may decorate its exact area.
      if (!prop.footprint || entry.asset.bounds.w / entry.asset.bounds.h < 3) return false;
      originalProp.call(this, prop, room, state);
      const back = this.project(prop.x, prop.z - prop.footprint.d / 2);
      const front = this.project(prop.x, prop.z + prop.footprint.d / 2);
      const width = prop.footprint.w * this.scale, depth = front.y - back.y;
      const imageWidth = entry.asset.height * entry.asset.bounds.w / entry.asset.bounds.h;
      const scale = Math.min(this.scale, width / imageWidth, depth / entry.asset.height);
      this.ctx.save();
      try {
        this.ctx.beginPath(); this.ctx.rect(front.x - width / 2, back.y, width, depth); this.ctx.clip();
        sprites.draw(this.ctx, entry, { x: front.x, y: front.y, scale, facing: 0 });
      } finally { this.ctx.restore(); }
      return true;
    }
    // The collidable science specimen is a broad physical cover. Its original
    // footprint drawing stays authoritative; a jar image must not narrow it.
    if (prop.collidable || prop.footprint) return false;
    const position = this.project(prop.x, prop.z), scale = this.scale * (.8 + prop.z * .28);
    // The isolation "glass" asset is a wall window, not a door standing on the
    // floor. Native window drawings end 53 model units above their floor anchor.
    const mountHeight = prop.kind === 'glass' ? 53 * scale : 0;
    return sprites.draw(this.ctx, entry, { x: position.x, y: position.y - mountHeight, scale, facing: 0 });
  }
  P.prop = function (prop, room, state) {
    if (!drawPropImage.call(this, prop, room, state)) return originalProp.call(this, prop, room, state);
  };
  P.extraProp = function (prop, room, state) {
    if (drawPropImage.call(this, prop, room, state)) return true;
    return originalExtraProp ? originalExtraProp.call(this, prop, room, state) : false;
  };
  const htmlEscape = value => String(value).replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  function itemEntry(id) {
    return root.ROP_SPRITES && root.ROP_SPRITES.select({ category: 'item', targetId: id,
      pose: 'inventory', weapon: 'none', state: 'normal', facing: 0 });
  }
  function itemMarkup(id) {
    const entry = itemEntry(id);
    if (!entry) return '';
    return '<img class="river-item-sprite" data-river-item="' + id + '" src="' + htmlEscape(entry.image.src)
      + '" alt="" aria-hidden="true" style="width:36px;height:36px;object-fit:contain;vertical-align:middle;margin:0 6px">';
  }
  function decorateLifeMarkup(html) {
    for (const [id, definition] of Object.entries(root.ROP_DATA.life.items)) {
      const image = itemMarkup(id);
      if (!image) continue;
      const label = htmlEscape(definition.label);
      html = html.split('<strong>' + label + '</strong>').join('<strong>' + image + label + '</strong>');
      if (root.ROP_LIFE.parts.includes(id)) {
        const safe = Array.from(label).map(character =>
          '\\^$.*+?()[]{}|'.includes(character) ? '\\' + character : character).join('');
        html = html.replace(new RegExp('(<span><b>[0-9]+</b>\\s*)' + safe, 'g'),
          (_, prefix) => prefix + image + label);
      }
    }
    return html;
  }
  function appendItem(element, id, large) {
    const entry = itemEntry(id), document = root.document;
    if (!entry || !element || element.querySelector('[data-river-item="' + id + '"]')) return;
    const image = document.createElement('img');
    image.className = 'river-item-sprite'; image.dataset.riverItem = id;
    image.src = entry.image.src; image.alt = ''; image.setAttribute('aria-hidden', 'true');
    image.style.cssText = large
      ? 'display:block;width:64px;height:48px;object-fit:contain;margin:0 auto 8px'
      : 'width:36px;height:36px;object-fit:contain;vertical-align:middle;margin:0 6px';
    element.prepend(image);
    if (large) {
      const originalIcon = element.querySelector('.kit-icon');
      if (originalIcon) originalIcon.style.display = 'none';
    }
  }
  function decorateInventory() {
    const document = root.document;
    if (!document) return;
    const kitItems = { light: 'light', tracker: 'tracker', weld: 'weld',
      heal: 'medkit', flare: 'flare', decoy: 'decoy' };
    for (const button of document.querySelectorAll('[data-kit]')) {
      const id = kitItems[button.dataset.kit];
      if (id) appendItem(button, id, true);
    }
    const spans = document.querySelectorAll('.parts-row > span');
    for (let index = 0; index < spans.length; index++) appendItem(spans[index], root.ROP_LIFE.parts[index], false);
    for (const button of document.querySelectorAll('[data-supply-take]')) {
      const article = button.closest('article'), label = article && article.querySelector('strong');
      appendItem(label, button.dataset.supplyTake, false);
    }
    const sim = root.ROP_APP && root.ROP_APP.simulation;
    if (sim && sim.character.weapon && root.ROP_ARMORY.active(sim.s) === 'pulse')
      appendItem(document.querySelector('.kit-top > b'), 'ammo', false);
  }
  if (typeof root.ROP_LIFE_UI === 'function') {
    const originalLifeFactory = root.ROP_LIFE_UI;
    root.ROP_LIFE_UI = function (options) {
      const api = originalLifeFactory({
        ...options,
        openDialog: function (kind, title, body) {
          const args = Array.from(arguments);
          if (kind === 'supply' || kind === 'bench') args[2] = decorateLifeMarkup(body);
          const result = options.openDialog.apply(this, args);
          decorateInventory();
          return result;
        }
      });
      const pockets = api.pockets;
      api.pockets = function () {
        // equipment() inserts this markup synchronously; the next microtask
        // decorates the existing controls without adding or changing actions.
        Promise.resolve().then(decorateInventory);
        return decorateLifeMarkup(pockets.apply(this, arguments));
      };
      return api;
    };
  }
  function decorateArsenal() {
    const sprites = root.ROP_SPRITES, document = root.document;
    if (!sprites || !document) return;
    for (const weapon of ['pulse', 'flame']) {
      const button = document.querySelector('[data-armory="' + weapon + '"]');
      const article = button && button.closest('article');
      if (!article || article.querySelector('.river-weapon-sprite')) continue;
      const entry = sprites.select({ category: 'weapon', targetId: weapon,
        pose: 'inventory', weapon, state: 'normal', facing: 0 });
      const label = article.querySelector('.weapon-symbol');
      if (!entry || !label) continue;
      const image = document.createElement('img');
      image.className = 'river-weapon-sprite';
      image.alt = weapon === 'pulse' ? 'M41A — fusil à impulsion' : 'M240 — lance-flammes';
      image.src = entry.image.src;
      image.style.cssText = 'display:block;width:100%;height:112px;object-fit:contain;margin:0 0 8px';
      image.dataset.spriteId = entry.asset.id;
      label.before(image);
    }
  }
  // Decorate the already existing armory dialog. Its controls and entitlement
  // checks are still created by the unmodified v0.9 UI factory.
  if (typeof root.ROP_FIDELITY_UI === 'function') {
    const originalFactory = root.ROP_FIDELITY_UI;
    root.ROP_FIDELITY_UI = function (options) {
      return originalFactory({
        ...options,
        openDialog: function () {
          const result = options.openDialog.apply(this, arguments);
          if (arguments[0] === 'armory') decorateArsenal();
          return result;
        }
      });
    };
  }
  if (root.ROP_SPRITES) {
    root.ROP_SPRITES.subscribe(decorateArsenal);
    root.ROP_SPRITES.subscribe(decorateInventory);
  }
})(globalThis);
