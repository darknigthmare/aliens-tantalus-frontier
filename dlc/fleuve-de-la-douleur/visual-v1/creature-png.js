/* Install immediately after render.js. Defense and duct wrappers must capture
 * this method afterwards so their warnings and entry opacity stay intact. */
(function (root) {
  'use strict';
  const P = root.ROP_Renderer.prototype, original = P.creature;
  P.creature = function (enemy) {
    const sprites = root.ROP_SPRITES;
    const moving = sprites && sprites.moving(this, 'creature:' + (enemy.id || enemy.kind), enemy);
    // A still PNG cannot represent an attack, death, bash, entry or locomotion.
    // The original body also owns the windup exclamation mark.
    if (!sprites || moving || enemy.hp <= 0 || enemy.state === 'chase'
      || enemy.state === 'windup' || enemy.bash || enemy.ductEntry) return original.call(this, enemy);
    const facing = enemy.facing || -1;
    const entry = sprites.select({ category: 'creature', targetId: enemy.kind,
      pose: 'idle', weapon: 'none', state: 'normal', facing });
    if (!entry) return original.call(this, enemy);
    const position = this.project(enemy.x, enemy.z), scale = this.scale * (.82 + enemy.z * .28);
    let drawn = false;
    this.ctx.save();
    try {
      this.ellipse(position.x, position.y + scale, 32 * scale, 7 * scale, '#00090dc9');
      drawn = sprites.draw(this.ctx, entry, { x: position.x, y: position.y, scale, facing });
    } finally { this.ctx.restore(); }
    if (!drawn) return original.call(this, enemy);
  };
})(globalThis);
