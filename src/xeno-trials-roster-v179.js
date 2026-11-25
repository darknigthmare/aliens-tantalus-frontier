import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsFighterV96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsSignatureV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsSuperV148 } from './xeno-trials-supers-v148.js';
import { getXenoTrialsRigV154 } from './xeno-trials-rig-v154.js';
import { getEnemyImportAnimationV107 } from './enemy-import-animation-v107.js';
import { getEnemyImportAttackV109 } from './enemy-import-attacks-v109.js';

/** A view over the admitted roster, never a second ownership/unlock registry.
 * Filtering/sorting remains owned by V97. Page changes do not select, unlock,
 * replace or reprice a fighter. Every page uses the same 40-entry contract.
 */
export const XENO_TRIALS_ROSTER_PAGE_SIZE_V179 = 40;

export function getXenoTrialsRosterPageV179(fighters = XENO_TRIALS_FIGHTERS_V96,
  { page = 0, selectedId = null, revealSelected = false } = {}) {
  const entries = Array.isArray(fighters) ? fighters : [];
  const size = XENO_TRIALS_ROSTER_PAGE_SIZE_V179;
  const pageCount = Math.max(1, Math.ceil(entries.length / size));
  const selectedIndex = revealSelected ? entries.findIndex(fighter => fighter?.id === selectedId) : -1;
  const requestedPage = selectedIndex >= 0 ? Math.floor(selectedIndex / size)
    : Number.isFinite(page) ? Math.trunc(page) : 0;
  const current = Math.max(0, Math.min(pageCount - 1, requestedPage));
  const offset = current * size;
  const visible = Object.freeze(entries.slice(offset, offset + size));
  return Object.freeze({ fighters: visible, page: current, pageCount, total: entries.length,
    start: visible.length ? offset + 1 : 0, end: offset + visible.length, size,
    hasPrevious: current > 0, hasNext: current + 1 < pageCount });
}

const roles = Object.freeze({
  balanced: Object.freeze({ label: 'Polyvalent', tactic: 'Alternez garde et frappes courtes ; gardez de l’endurance pour punir une attaque manquée.' }),
  agile: Object.freeze({ label: 'Mobile', tactic: 'Changez de distance entre deux attaques et exploitez la récupération adverse.' }),
  tank: Object.freeze({ label: 'Défensif', tactic: 'Avancez avec prudence et réservez la frappe lourde aux ouvertures à courte portée.' }),
  ranged: Object.freeze({ label: 'Distance', tactic: 'Conservez une ligne de tir dégagée et de l’espace derrière vous pour vous dégager.' })
});

// These tips describe the existing arena contracts only. They do not add a
// franchise ability or certify that a static portrait has a corresponding clip.
const specials = Object.freeze({
  tail: ['Fouet caudal', 'Frappe de contact à portée de queue. Préparez votre distance avant de la déclencher.'],
  pounce: ['Bond', 'Ruée de contact vers l’avant. La préparation laisse une ouverture à l’adversaire.'],
  ram: ['Charge', 'Avancée de contact vers l’avant. Gardez assez d’endurance pour la récupération.'],
  slash: ['Lacération', 'Frappe de contact. Attendez une ouverture avant d’engager sa préparation.'],
  acid: ['Salve acide', 'Projectile en ligne droite. La préparation et la récupération vous exposent.'],
  pulse: ['Impulsion', 'Tir en ligne droite. Gardez une ligne de tir et surveillez l’approche adverse.'],
  baton: ['Frappe de matraque', 'Frappe de contact. Approchez avant d’engager le coup.'],
  flame: ['Lance-flammes', 'Jet en cône de courte portée, avec plusieurs contacts possibles pendant son émission.'],
  detonation: ['Détonation', 'Ruée puis explosion de proximité. Le combattant est consommé même si la cible esquive ; double KO possible.'],
  shield: ['Bouclier', 'Frappe courte avec recul marqué. Placez-vous à portée avant de la déclencher.'],
  dash: ['Ruée', 'Attaque de contact. Le déplacement ordinaire reste nécessaire pour se mettre à portée.']
});

/** Useful player-facing notes plus separate evidence fields for the work log.
 * Resolve the canonical arena definition before reading its exact-ID capability
 * contracts, so an edited object cannot acquire a namesake's special or art.
 * No rendering, simulation, save or media mutation happens here.
 */
export function getXenoTrialsRosterProfileV179(fighter) {
  const definition = getXenoTrialsFighterV96(fighter?.id);
  if (!definition || fighter.profileId !== definition.profileId) return null;
  const art = getXenoTrialsArtV96(definition.id);
  const signature = getXenoTrialsSignatureV147(definition);
  const superAttack = getXenoTrialsSuperV148(definition);
  const rig = getXenoTrialsRigV154(definition, art);
  const walk = getEnemyImportAnimationV107(art);
  const light = getEnemyImportAttackV109(art);
  const role = roles[definition.role];
  const special = specials[definition.special] || ['Attaque spéciale', 'Préparez votre distance et gardez assez d’endurance avant d’engager cette attaque.'];
  const visualParts = [walk ? 'Marche animée' : null, light ? 'Frappe légère animée' : null,
    rig ? 'Présentation articulée' : null].filter(Boolean);
  return Object.freeze({ id: definition.id, label: definition.label,
    roleLabel: role?.label || 'Combattant', tactic: role?.tactic || 'Observez la portée et la préparation adverses avant de vous engager.',
    specialLabel: signature?.label || special[0], specialDescription: signature?.description || special[1],
    superLabel: superAttack?.label || null, superDescription: superAttack?.description || null,
    visualLabel: visualParts.length ? visualParts.join(' · ') : 'Pose fixe dédiée',
    visualStatus: visualParts.length ? 'admitted-partial-presentation' : 'admitted-static-pose',
    rigId: rig?.id || null, walkId: walk?.id || null, lightAttackId: light?.id || null,
    artPath: art.path, profileId: definition.profileId,
    referenceStatus: signature?.evidence || 'existing-admitted-project-adaptation',
    canonExact: false, fullAnimation: false });
}
