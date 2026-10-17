import { getXenoTrialsCasteV151 } from './xeno-trials-castes-v151.js';
import { getXenoTrialsSuperV148 } from './xeno-trials-supers-v148.js';
import { getSynthTrialAttackV110 } from './synth-combat-v110.js';

/** Capability references, not motion capture or canonical balance.
 * Exact IDs + admitted profile IDs prevent accidental inheritance by a namesake,
 * an albino/armored derivative, a Synth Warden, or the original film Queen.
 * Every time, range, damage and projectile count below is original arena tuning.
 */
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const XENO_TRIALS_SIGNATURE_SOURCES_V147 = freeze({
  pathogen: {
    url: 'https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/',
    title: 'Cold Iron Studios — Pathogen Deep Dive', published: '2022-08-29', checked: '2026-10-17',
    locator: 'Pathogen Brute; Pathogen Queen; Matt Highison commentary',
    scope: 'Ground shockwaves from Brute arm impacts; clustered acid shots from the Queen.',
    limits: 'No measured frames, timings, hitboxes, projectile count or 2D choreography.'
  },
  dossier: {
    url: 'https://steamcommunity.com/app/3448650/allnews/',
    title: 'Cold Iron Studios — Xenomorph Showcase', published: '2026-08-20', checked: '2026-10-17',
    locator: 'Xenomorph Dossier: WARDEN, EXPLODER, HARBRINGER; Patch #2: Harbinger leap',
    scope: 'Warden ranged acid and knockdowns; Exploder proximity detonation; Harbinger leaping knockdown.',
    limits: 'HARBRINGER is the dossier spelling. No canonical frame counts or arena balance.'
  }
});
export const XENO_TRIALS_SIGNATURES_V147 = freeze([
  { id: 'pathogen-brute-ground-impact', fighterId: 'drive-v123-fte-pathogen-brute-profile-v13',
    profileId: 'pose-v123-drive-fte-pathogen-brute-profile-v13', label: 'Onde de percussion', style: 'ground-wave', sourceId: 'pathogen',
    evidence: 'reference-capability-adaptation', canonExact: false, animation: 'existing-static-pose',
    description: 'Frappe au sol puis deux ondes rasantes. Sauter au-dessus de leur front ou sortir de portée.',
    spec: { cost: 38, damage: 34, reach: 270, startup: .45, active: .10, recovery: .65, stun: .32, push: 34,
      groundedOnly: true, projectileSpeed: 480, projectileHeight: 20, cooldown: 2.1 } },
  { id: 'pathogen-queen-acid-cluster', fighterId: 'drive-v123-fte-pathogen-queen-right-v13',
    profileId: 'pose-v123-drive-fte-pathogen-queen-right-v13', label: 'Grappe acide', style: 'acid-cluster', sourceId: 'pathogen',
    evidence: 'reference-capability-adaptation', canonExact: false, animation: 'existing-static-pose',
    description: 'Trois projectiles divergents visent la position observée au départ. Aucun suivi après émission. Le résidu retombe au sol et reste corrosif quelques secondes : quitter la zone ou sauter.',
    spec: { cost: 42, damage: 13, reach: 620, startup: .5, active: .10, recovery: .7, stun: .12, push: 12,
      groundedOnly: true, projectileSpeed: 450, spread: .14, cooldown: 2.4 } },
  { id: 'afe2-warden-acid', fighterId: 'import-game-afe2-warden', profileId: 'pose-v106-import-game-afe2-warden',
    label: 'Projection acide', style: 'aimed-acid', sourceId: 'dossier',
    evidence: 'reference-capability-adaptation', canonExact: false, animation: 'existing-static-pose',
    description: 'Projection acide à distance, précédée d’une anticipation. La frappe lourde provoque un recul prolongé.',
    spec: { cost: 38, damage: 32, reach: 560, startup: .4, active: .10, recovery: .55, stun: .26, push: 28,
      groundedOnly: true, projectileSpeed: 470, cooldown: 1.9 },
    heavy: { cost: 27, damage: 28, reach: 86, startup: .3, active: .10, recovery: .48, stun: .46, push: 46 } },
  { id: 'afe2-exploder-detonation', fighterId: 'import-game-afe2-exploder', profileId: 'pose-v106-import-game-afe2-exploder',
    label: 'Détonation sacrificielle', style: 'detonation', sourceId: 'dossier',
    evidence: 'reference-capability-adaptation', canonExact: false, animation: 'existing-static-pose',
    description: 'Courte ruée puis détonation de proximité. Le spécimen est consommé, même si la cible esquive : double KO possible.',
    spec: { cost: 38, damage: 180, reach: 170, startup: .45, active: .62, recovery: .4, stun: .5, push: 50,
      groundedOnly: true, chargeDuration: .48, chargeSpeed: 410, cooldown: 1.6 } },
  { id: 'afe2-harbinger-leap', fighterId: 'import-game-afe2-harbinger', profileId: 'pose-v106-import-game-afe2-harbinger',
    label: 'Bond de renversement', style: 'leap', sourceId: 'dossier',
    evidence: 'reference-capability-adaptation', canonExact: false, animation: 'existing-static-pose',
    description: 'Bond physique vers l’avant. La direction se verrouille au départ ; une seule collision inflige le coup.',
    spec: { cost: 38, damage: 35, reach: 78, startup: .32, active: .42, recovery: .6, stun: .42, push: 42,
      groundedOnly: true, leapSpeed: 390, leapImpulse: 280, cooldown: 1.9 } }
]);
const byId = new Map(XENO_TRIALS_SIGNATURES_V147.map(entry => [entry.fighterId, entry]));
export function getXenoTrialsSignatureV147(definition) {
  const entry = byId.get(definition?.id);
  return entry && entry.profileId === definition.profileId ? entry : getXenoTrialsCasteV151(definition);
}
export function getXenoTrialsSpecialStyleV147(definition) {
  return getXenoTrialsSignatureV147(definition)?.style || definition?.special;
}
export function getXenoTrialsAttackV147(definition, kind, fallback) {
  if (kind === 'super') return getXenoTrialsSuperV148(definition)?.spec || null;
  const entry = getXenoTrialsSignatureV147(definition);
  return (kind === 'special' ? entry?.spec : kind === 'heavy' ? entry?.heavy : null)
    || getSynthTrialAttackV110(definition, kind, fallback);
}

/** Segment / AABB intersection. Returns first contact fraction or null.
 * Swept Y as well as X prevents a diagonal projectile hitting an unrelated
 * rectangle corner, and stops fast shots tunnelling through small specimens.
 */
export function xenoTrialsSegmentContactV147(x0, y0, x1, y1, box, radius = 0) {
  if (![x0, y0, x1, y1, radius, box?.left, box?.right, box?.bottom, box?.top].every(Number.isFinite)
    || radius < 0 || box.left > box.right || box.bottom > box.top) return null;
  let enter = 0, exit = 1;
  for (const [start, delta, min, max] of [[x0, x1 - x0, box.left - radius, box.right + radius],
    [y0, y1 - y0, box.bottom - radius, box.top + radius]]) {
    if (Math.abs(delta) < 1e-10) { if (start < min || start > max) return null; continue; }
    const a = (min - start) / delta, b = (max - start) / delta;
    enter = Math.max(enter, Math.min(a, b)); exit = Math.min(exit, Math.max(a, b));
    if (enter > exit) return null;
  }
  return enter;
}

/** Emit a finite set of physical projectiles. Caller owns IDs and state.
 * Aim uses current body centres only; no target handle or homing is retained.
 */
export function createXenoTrialsSignatureProjectilesV147(entry, fighter, body, targetBody, attack) {
  if (!entry || !['ground-wave', 'acid-cluster', 'aimed-acid'].includes(entry.style)) return [];
  const spec = entry.spec;
  const common = { owner: fighter.side, life: spec.reach / spec.projectileSpeed, spec,
    power: 1, signatureIdV147: entry.id, groupIdV147: attack.id };
  if (entry.style === 'ground-wave') return [-1, 1].map(direction => ({ ...common,
    x: direction > 0 ? body.right : body.left, y: spec.projectileHeight / 2,
    direction, vx: direction * spec.projectileSpeed, vy: 0, style: 'ground-wave', radiusV147: spec.projectileHeight / 2 }));
  const x = attack.facing > 0 ? body.right : body.left, y = body.bottom + body.height * .55;
  const dx = Math.max(32, (targetBody.center - x) * attack.facing);
  const dy = (targetBody.bottom + targetBody.height * .5) - y;
  const angle = Math.max(-1.2, Math.min(1.2, Math.atan2(dy, dx)));
  return (entry.style === 'acid-cluster' ? [-spec.spread, 0, spec.spread] : [0]).map(spread => ({ ...common,
    x, y, direction: attack.facing, vx: attack.facing * Math.cos(angle + spread) * spec.projectileSpeed,
    vy: Math.sin(angle + spread) * spec.projectileSpeed, style: 'acid', radiusV147: 7 }));
}
