// V188 gameplay gaps — door collision that matches the door the player sees and uses.
//
// The colony main gate (colony-multiroute template, every colony mission, Alpha/Bravo included)
// is drawn face-on: a 373 px frame centred on the 44 px gate leaves' seam (door x 934 in
// special-alpha-bravo-doctrine). closedDoorColliders() returned that whole drawn frame, so a
// closed gate stopped the marine 165 px before the gate, in front of the frame's left post,
// where nothing visible blocks him. A face-on gate closes at its seam: the closed collider is
// the door's own box there (its full drawn height is kept). The interaction reach is unchanged
// (doorInteractionReachV188 still reads the drawn frame), so the gate stays operable from the
// same places. Other wide frames (pressure airlocks, seen side-on) keep their drawn collider.
const FACE_ON_ROLES_V188 = new Set(['colony-gate']);

export function withGameplayGapsV188(Base) {
  if (Base.gameplayGapsV188) return Base;
  return class GameplayGapsV188 extends Base {
    static gameplayGapsV188 = true;
    closedDoorColliders() {
      const colliders = super.closedDoorColliders();
      if (!Array.isArray(colliders) || !Array.isArray(this.doors)) return colliders;
      const closed = this.doors.filter((door) => door.progress < 0.82);
      if (closed.length !== colliders.length) return colliders;
      return colliders.map((box, index) => {
        const door = closed[index];
        if (!box || !FACE_ON_ROLES_V188.has(box.visualRole) || !(Number(door?.w) > 0) || !(box.w > door.w * 2)) return box;
        return { ...box, x: Number(door.x), w: Number(door.w), faceOnFrameV188: { x: box.x, w: box.w } };
      });
    }
  };
}
