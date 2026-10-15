import { resolveCombatAimV83 } from './combat-aim-v83.js';

/** The held aim button reserves direction keys for the weapon. A selected
 * octant remains selected until release, so firing needs no movement input.
 * Mouse, touch and the right stick keep their independent aiming contracts. */
export function withDirectionalAimV130(Base) {
  return class DirectionalAimV130 extends Base {
    resolvePlayerCombatAimV83(actor = this.player) {
      const aim = super.resolvePlayerCombatAimV83(actor);
      if (!actor || !aim) return aim;
      this.directionalAimV130 ||= new WeakMap();
      const held = this.keys?.has(actor.coop ? 'ShiftRight' : 'ShiftLeft');
      const external = Boolean(actor.pointerAimV83 || actor.gamepadAimV83 || actor.gamepadAimHeldV124);
      if (!held || external || !actor.alive || actor.downed || actor.climbing || actor.ventTransit || actor.inVehicle) {
        this.directionalAimV130.delete(actor);
        return aim;
      }
      if (aim.active) this.directionalAimV130.set(actor, aim);
      const selected = this.directionalAimV130.get(actor);
      if (!selected) return aim;
      const result = Object.freeze({ ...resolveCombatAimV83({ x: selected.x, y: selected.y, facing: actor.facing }),
        heldV130: true, latchedV130: !aim.active });
      actor.combatAimV83 = result;
      actor.facing = result.facing;
      actor.aimingV124 = true;
      return result;
    }

    clearGameplayInput(...args) {
      this.directionalAimV130 = new WeakMap();
      return super.clearGameplayInput(...args);
    }

    setCoop(enabled, ...args) {
      if (!enabled && this.coop) this.directionalAimV130?.delete(this.coop);
      return super.setCoop(enabled, ...args);
    }

    getDirectionalAimSnapshotV130() {
      return ['player', 'coop'].filter(role => this[role]).map(role => ({ role,
        held: Boolean(this.keys?.has(role === 'coop' ? 'ShiftRight' : 'ShiftLeft')),
        direction: this[role].combatAimV83?.direction || null,
        latched: Boolean(this[role].combatAimV83?.latchedV130) }));
    }
  };
}
