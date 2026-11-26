/* Supplied static poses, attack poses and an explicit eight-frame walk cycle.
 * All decisions read the existing engine; this renderer writes no game state.
 */
(function (root) {
  'use strict';
  const Parent = root.CovenantRenderer;
  const TABLETOP = new Set(['flute', 'notebook', 'necklace', 'teaset', 'medtray', 'surgicaltray']);
  const LIVE_PROPS = new Set(['console', 'navigationdisplay', 'crane', 'freight-cart', 'freight-rail', 'freight-dock',
    'maintenance-fan', 'stone-crown', 'hydraulic-lever', 'counterweight', 'sluice-gauge']);
  const WEAPON_BOX = {
    f90: [-9, -19, 75, 21], sl40: [-9, -19, 75, 26],
    beretta: [0, -12, 34, 18], inox: [0, -12, 34, 18], eaa: [0, -12, 34, 18],
    ar15: [-11, -16, 81, 21], shotgun: [-14, -9, 79, 18]
  };
  class CovenantSpriteRenderer extends Parent {
    constructor(canvas, engine) {
      super(canvas, engine);
      this.spriteRegistry = root.CovenantSpritesV011;
      this.spriteDrawsV011 = { human: 0, creature: 0, weapon: 0, prop: 0 };
      this.spriteFrameDrawsV012 = Object.create(null);
    }
    visual(kind, key, state = 'idle') {
      return this.spriteRegistry?.sprite(kind, key, state, this.engine.room.id, this.engine.state.time || 0) || null;
    }
    drawPose(sprite, height, anchor = null) {
      const { image, entry } = sprite, [left, top, right, bottom] = entry.alphaBounds;
      const scale = height / (bottom - top), origin = anchor || entry.anchor;
      this.c.drawImage(image, left, top, right - left, bottom - top,
        (left - origin[0]) * scale, (top - origin[1]) * scale,
        (right - left) * scale, (bottom - top) * scale);
    }
    human(actor, role = 'daniels', moving = false) {
      const E = this.engine, player = role === 'daniels' && !actor.id;
      if (player && E.state.hidden) return;
      const profile = E.appearance(actor, role);
      const walking = actor.phase === 'walk' || player && (moving || E.motion?.moving);
      const special = player && (E.room.crawl || E.grip || E.work || E.scanning || E.healing
        || E.rotating || E.detector || E.reloadTime > 0 || E.shoveCooldown > 1.08
        || E.motion?.crouch || E.dead || (actor.y || 0) !== 0);
      const gun = player ? (E.state.weapon && !E.room.safePresentation ? E.currentWeapon().id : null) : profile.gun;
      const state = walking ? (player && E.motion?.run ? 'run' : 'walk') : gun ? 'armed' : 'idle';
      const sprite = !special && this.visual('human', profile.id, state);
      // Free hands in the neutral source do not imply a validated armed pose.
      if (!sprite || gun && !sprite.entry.heldGrip) return super.human(actor, role, moving);
      // The supplied cycle is ordinary unarmed player walking, not input intent.
      if (sprite.cycle && (!player || !E.motion?.moving || E.motion?.run || gun))
        return super.human(actor, role, moving);
      // Mirroring would move Walter's left-hand injury to the wrong anatomical side.
      if (profile.id === 'walter-injured' && (actor.facing || 1) !== sprite.entry.sourceFacing)
        return super.human(actor, role, moving);
      const p = this.project(actor.x, actor.z);
      if (p.x < -240 || p.x > this.W + 240) return;
      this.ellipse(p.x, p.y + 6, 23 * p.s * (profile.build || 1), 6 * p.s, '#06101599');
      this.c.save(); this.c.translate(p.x, p.y - (actor.y || 0));
      this.c.scale(p.s * (actor.facing || 1) * sprite.entry.sourceFacing, p.s);
      this.drawPose(sprite, sprite.entry.logicalHeight);
      if (gun) {
        const b = sprite.entry.alphaBounds, scale = sprite.entry.logicalHeight / (b[3] - b[1]);
        this.c.save();
        this.c.translate((sprite.entry.heldGrip[0] - sprite.entry.anchor[0]) * scale,
          (sprite.entry.heldGrip[1] - sprite.entry.anchor[1]) * scale);
        this.c.rotate(sprite.entry.heldAngle); this.gun(gun, 0, 0); this.c.restore();
      }
      this.c.restore(); this.spriteDrawsV011.human++;
      if (sprite.cycle) this.spriteFrameDrawsV012[sprite.entry.id] = (this.spriteFrameDrawsV012[sprite.entry.id] || 0) + 1;
    }
    creature(enemy) {
      const E = this.engine, sequence = E.state.sequence;
      if (!enemy.alive || E.room.crawl || sequence?.enemy === enemy.id || enemy.phase === 'captured'
        || enemy.phase === 'retreated' || enemy.phase === 'windup' || enemy.stun > 0) return super.creature(enemy);
      // An airborne attack sprite is valid only during the actual lunge.
      const state = enemy.phase === 'lunge' ? 'attack'
        : ['idle', 'search', 'recover'].includes(enemy.phase) ? 'idle' : 'walk';
      const sprite = this.visual('creature', enemy.kind, state);
      if (!sprite) return super.creature(enemy);
      const p = this.project(enemy.x, enemy.z);
      if (p.x < -320 || p.x > this.W + 320) return;
      this.ellipse(p.x, p.y + 6, enemy.kind === 'facehugger' ? 35 : 55 * p.s,
        enemy.kind === 'facehugger' ? 4 : 10, '#020c11ad');
      this.c.save(); this.c.translate(p.x, p.y - (enemy.y || 0));
      this.c.scale(p.s * (enemy.facing || -1) * sprite.entry.sourceFacing, p.s);
      this.drawPose(sprite, sprite.entry.logicalHeight); this.c.restore();
      this.spriteDrawsV011.creature++;
    }
    gun(id, x = 19, y = -73, scale = 1) {
      const sprite = this.visual('weapon', id), box = WEAPON_BOX[id];
      if (!sprite || !box) return super.gun(id, x, y, scale);
      const b = sprite.entry.alphaBounds, width = b[2] - b[0], height = b[3] - b[1];
      const fit = Math.min((box[2] - box[0]) / width, (box[3] - box[1]) / height);
      this.c.save(); this.c.translate(x, y); this.c.scale(scale, scale);
      // Preserve source aspect ratio and the original weapon footprint.
      const dx = box[0] + ((box[2] - box[0]) - width * fit) / 2;
      const dy = box[1] + ((box[3] - box[1]) - height * fit) / 2;
      this.c.drawImage(sprite.image, ...b.slice(0, 2), width, height, dx, dy, width * fit, height * fit);
      this.c.restore(); this.spriteDrawsV011.weapon++;
    }
    prop(o) {
      const E = this.engine;
      if (o.renderSuppressedByExit && E.room.exits.some(e => e.id === o.renderSuppressedByExit)) return;
      if (o.renderSuppressedBy && E.room.props.some(p => p.id === o.renderSuppressedBy)) return;
      if (LIVE_PROPS.has(o.kind)
        || o.kind === 'terraformer' && (E.state.sequence?.kind === 'airlock' || E.done('cargo-a3'))
        || o.kind === 'lander' && E.room.id === 'burning') return super.prop(o);
      let key = o.kind;
      if (key === 'recordingscreen') key += (o.referenceIds || []).includes('ACOV-005') ? '-branson' : '-signal';
      const sprite = this.visual('prop', o.id) || this.visual('prop', key);
      if (!sprite) return super.prop(o);
      const p = this.propPoint(o), w = o.w, h = o.h;
      if (p.x < -w || p.x > this.W + w) return;
      this.c.save(); this.c.translate(p.x, p.y); this.c.scale(p.s, p.s);
      let maxW = w, maxH = h, ground = 0;
      if (TABLETOP.has(o.kind)) {
        // The generated image is the object, while this is the original support.
        this.line([[-w * .38, 0], [-w * .38, -h * .4], [w * .38, -h * .4], [w * .38, 0]], '#526c69', 5);
        this.poly([[-w * .5, -h * .4], [-w * .45, -h * .58], [w * .4, -h * .58], [w * .5, -h * .4]], '#acb1a1', '#d4d4bb', 1);
        maxW = w * .83; maxH = h * .4; ground = -h * .59;
      }
      const b = sprite.entry.alphaBounds;
      const fit = Math.min(maxW / (b[2] - b[0]), maxH / (b[3] - b[1]));
      this.c.translate(0, ground);
      this.drawPose(sprite, (b[3] - b[1]) * fit);
      this.c.restore(); this.spriteDrawsV011.prop++;
    }
  }
  root.CovenantRenderer = CovenantSpriteRenderer;
  root.CovenantSpriteRendererV011 = CovenantSpriteRenderer;
})(globalThis);
