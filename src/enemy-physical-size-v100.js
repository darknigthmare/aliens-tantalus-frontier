import { ENEMIES } from './content-core-v50.js';

// Dossier metadata only. These are the previous conversation's candidates,
// not verified canon measurements and never renderer/collision instructions.
const SOURCE = 'conversation-candidate-2026-09-28';
const SOURCE_THREAD_ID = null;
const freezeReference = (entry) => Object.freeze({
  ...entry,
  rangeMeters: entry.rangeMeters ? Object.freeze({ ...entry.rangeMeters }) : null,
  notes: Object.freeze([...entry.notes]),
  source: SOURCE,
  sourceThreadId: SOURCE_THREAD_ID,
  status: 'estimated-unverified',
  canonVerified: false,
  appliesToGameplay: false
});
const reference = (baseArchetypeId, measurementType, axis, posture, lifeStage, targetMeters, notes, rangeMeters = null) =>
  freezeReference({ baseArchetypeId, measurementType, axis, posture, lifeStage, targetMeters,
    rangeMeters, notes, requiresMeasurement: targetMeters === null });

// No numerical range is invented when the source only proposed one target.
export const ENEMY_PHYSICAL_SIZE_REFERENCES_V100 = Object.freeze([
  reference('enemy-001-ovomorph', 'height', 'vertical', 'closed-egg', 'egg', 0.90,
    ['Hauteur de l’œuf fermé ; proposition issue de la conversation.']),
  reference('enemy-002-facehugger', 'axial-length', 'head-to-tail', 'extended', 'parasite', 1.05,
    ['Longueur totale avec la queue, jamais une hauteur de sprite.']),
  reference('enemy-003-chestburster', 'axial-length', 'head-to-tail', 'extended-larva', 'larval', null,
    ['Longueur à mesurer ; la larve est déjà un stade distinct, sans réduction juvénile automatique.']),
  reference('enemy-004-drone-big-chap', 'height', 'vertical', 'standing-upright', 'adult', 2.25,
    ['Hauteur redressée ; ne pas normaliser une pose accroupie sur sa boîte alpha.']),
  reference('enemy-006-runner', 'height', 'vertical', 'quadrupedal', 'adult', 1.15,
    ['Hauteur du corps quadrupède ; queue exclue du repère vertical.']),
  reference('enemy-007-praetorian', 'height', 'vertical', 'standing-upright', 'adult', 3.00,
    ['Estimation de conception proposée, non mesure canon vérifiée.']),
  reference('enemy-008-queen', 'height', 'vertical', 'standing-without-ovipositor', 'adult', 4.30,
    ['Repère proposé pour la reine d’Aliens (1986), sans ovipositeur ; pas pour toutes les lignées royales.']),
  reference('enemy-009-crusher', 'height', 'vertical', 'low-quadrupedal', 'adult', 2.20,
    ['Hauteur du corps massif ; sa longueur doit rester une mesure indépendante.']),
  reference('enemy-035-trilobite-echo', 'axial-length', 'unresolved-axial-extent', 'reference-pose-required', 'unspecified', null,
    ['Étendue axiale et posture de référence à définir ; aucune hauteur inférée.']),
  reference('enemy-049-wild-boar-host', 'height', 'vertical-at-withers', 'quadrupedal', 'adult', 0.85,
    ['Hauteur au garrot ; plage de comparaison rappelée dans la conversation.'], { min: 0.55, max: 1.10 }),
  reference('enemy-051-ceto-reef-predator', 'axial-length', 'head-to-tail', 'aquatic-extended', 'unspecified', null,
    ['Faune originale : longueur axiale à mesurer, aucune hauteur canon déduite.']),
  reference('enemy-569-newborn', 'height', 'vertical', 'standing-upright', 'adult', 2.40,
    ['Estimation de conception proposée, non mesure canon vérifiée.']),
  reference('enemy-570-offspring', 'height', 'vertical', 'standing-upright', 'adult', 2.50,
    ['Estimation de conception proposée, non mesure canon vérifiée.'])
]);

const enemiesById = new Map(ENEMIES.map((enemy) => [enemy.id, enemy]));
const enemiesByName = new Map(ENEMIES.map((enemy) => [enemy.name, enemy]));
const sizeByEnemyId = new Map();

// Resolve exact seeded archetypes and exact declared modifiers only. Similar
// names (Ripper Queen, Neuro-Xeno Drone, etc.) do not establish inheritance.
for (const baseSize of ENEMY_PHYSICAL_SIZE_REFERENCES_V100) {
  const baseEnemy = enemiesById.get(baseSize.baseArchetypeId);
  if (!baseEnemy) continue;
  sizeByEnemyId.set(baseEnemy.id, baseSize);
  for (const enemy of ENEMIES) {
    if (!enemy.modifier || enemy.modifier === 'Standard'
      || enemy.name !== `${enemy.modifier} ${baseEnemy.name}`
      || enemy.biology !== baseEnemy.biology || enemy.caste !== baseEnemy.caste) continue;
    if (enemy.modifier === 'Juvenile') {
      // No arbitrary percentage, including for a larva or egg base archetype.
      sizeByEnemyId.set(enemy.id, freezeReference({
        ...baseSize,
        lifeStage: 'juvenile-variant',
        posture: 'juvenile-reference-pose-required',
        targetMeters: null,
        rangeMeters: null,
        requiresMeasurement: true,
        notes: [...baseSize.notes, 'Variante juvénile séparée : cible et posture à mesurer, sans multiplicateur automatique.']
      }));
    } else {
      // Albino/armored/elder/controlled labels do not imply a larger body.
      sizeByEnemyId.set(enemy.id, baseSize);
    }
  }
}

/**
 * Accept a known ENEMIES id, exact name, or object with id/profileId.
 * Return immutable candidate metadata, or null when no explicit base exists.
 * Caller-supplied names/modifiers never override the canonical ENEMIES entry.
 */
export const getEnemyPhysicalSizeV100 = (entry) => {
  const key = typeof entry === 'string' ? entry : entry?.id ?? entry?.profileId;
  if (typeof key !== 'string') return null;
  const enemy = enemiesById.get(key) ?? enemiesByName.get(key);
  return enemy ? sizeByEnemyId.get(enemy.id) ?? null : null;
};
