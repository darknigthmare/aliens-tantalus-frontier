import { USER_PACK_V100 } from './user-pack-v100.js';
import { ENEMY_IMPORT_ADMISSIONS_V106 } from './enemy-import-admissions-v106.js';

// Presentation policy only: never rewrite a saved enemy ID, combat biology,
// statistics, reference image or source registry. Faction is not a species.
// Engineers and their equipment are distinct from their creations/hosts:
// https://store.necaonline.com/blogs/news/prometheus-has-landed
// Synth troops are not human personnel, even under the same manufacturer:
// https://www.aliensfireteamelite.com/en/
const UNKNOWN = 'unknown';
const PERSONNEL = new Set(['human', 'synthetic', 'engineer']);
const LEGACY_MODIFIERS = Object.freeze([
  'Standard', 'Albino', 'Armored', 'Acid-Blooded', 'Cryo-Adapted', 'Vacuum-Adapted',
  'Hive Guard', 'Apex', 'Juvenile', 'Elder', 'Neuro-Linked'
]);
const LEGACY_SEEDS = Object.freeze({
  41: Object.freeze({ id: 'enemy-041-working-joe', biology: 'synthetic', faction: 'Seegson' }),
  42: Object.freeze({ id: 'enemy-042-combat-synthetic', biology: 'synthetic', faction: UNKNOWN }),
  43: Object.freeze({ id: 'enemy-043-weyland-yutani-commando', biology: 'human', faction: 'Weyland-Yutani' }),
  44: Object.freeze({ id: 'enemy-044-upp-vanguard', biology: 'human', faction: 'UPP' }),
  45: Object.freeze({ id: 'enemy-045-seegson-security', biology: 'human', faction: 'Seegson' }),
  46: Object.freeze({ id: 'enemy-046-colonial-raider', biology: 'human', faction: UNKNOWN }),
  47: Object.freeze({ id: 'enemy-047-atarax-controller', biology: 'human', faction: 'ATARAX' }),
  48: Object.freeze({ id: 'enemy-048-cult-host', biology: 'human', faction: UNKNOWN })
});
const ENGINEER_IDS = new Set(['pose-v95-user-ingineer-mother']);
const AUTOMATON_IDS = new Set(['pose-v106-import-game-afe2-bulwark']);
const AFE_SYNTH_IDS = new Set([
  'pose-v94-afe-synth-trooper', 'pose-v94-afe-synth-guard',
  'pose-v94-afe-synth-sniper', 'pose-v94-afe-synth-heavy'
]);
const text = value => typeof value === 'string' && value.trim() ? value.trim() : UNKNOWN;

// Original illustrations are dossiers, not admissions to any combat registry.
// Exact biology + organism excludes Black Goo containers and Xeno host morphs.
export const ENGINEER_REFERENCE_DOSSIERS_V105 = Object.freeze(USER_PACK_V100
  .filter(entry => entry.biology === 'engineer' && entry.kind === 'organism')
  .map(entry => Object.freeze({ ...entry, documentaryReferenceV105: true,
    source: 'Pack utilisateur 270926 — référence documentaire non certifiée canonique',
    provenance: 'user-provided-documentary-reference', combatReady: false, automaticEncounter: false
  })));

// A reference only becomes an alias when this exact admitted profile is also
// present in the live registry. The original illustration stays in the library.
export const ENGINEER_REFERENCE_PROFILE_IDS_V105 = Object.freeze({
  ...Object.fromEntries(ENEMY_IMPORT_ADMISSIONS_V106.filter(art => art.slug.startsWith('engineer-'))
    .map(art => [art.referenceId, 'pose-v106-import-' + art.slug])),
  'pack-v100-engineer-armorsuit': 'pose-v105-import-engineer-armorsuit'
});

function legacySeed(entry) {
  const ordinal = Number(String(entry.id || '').match(/^enemy-(\d{3})-/)?.[1]);
  if (!ordinal || ordinal > 568) return null;
  const seed = LEGACY_SEEDS[(ordinal - 1) % 52 + 1];
  const cycle = Math.floor((ordinal - 1) / 52);
  if (!seed || entry.biology !== seed.biology || entry.modifier !== LEGACY_MODIFIERS[cycle]) return null;
  if (!cycle && entry.id !== seed.id) return null;
  if (cycle) {
    const modifierSlug = LEGACY_MODIFIERS[cycle].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const expectedId = `enemy-${String(ordinal).padStart(3, '0')}-${modifierSlug}-${seed.id.replace(/^enemy-\d{3}-/, '')}`;
    if (entry.id !== expectedId) return null;
  }
  return { ...seed, cycle };
}

/** Only the exact historical V50 cross-product is archived. Explicit authored
 * identities (including Altered imports) are never hidden by a word in a name.
 * Armored is retained as a project equipment variant, not a biological caste.
 */
export function getEnemyCatalogPolicyV105(entry = {}) {
  const seed = legacySeed(entry);
  const biology = ENGINEER_IDS.has(entry.id) ? 'engineer' : text(entry.biology);
  const legacyVariant = Boolean(seed?.cycle && entry.provenance === 'systemic-variant');
  const archived = legacyVariant && entry.modifier !== 'Armored';
  const engineerReference = ENGINEER_IDS.has(entry.id);
  const automaton = AUTOMATON_IDS.has(entry.id)
    || entry.mechanical === true && /combat.?automaton/i.test(entry.lineage || '');
  return Object.freeze({
    biology,
    family: automaton ? 'automaton' : biology,
    faction: text(entry.faction) !== UNKNOWN ? text(entry.faction)
      : seed?.faction || (AFE_SYNTH_IDS.has(entry.id) ? 'Weyland-Yutani' : UNKNOWN),
    personnel: automaton || PERSONNEL.has(biology),
    role: text(entry.combatRole || entry.caste),
    stage: automaton || biology === 'synthetic' ? 'manufactured-unit' : PERSONNEL.has(biology) ? 'adult' : null,
    archived,
    status: archived ? 'legacy-generated-unverified' : legacyVariant ? 'project-equipment-variant'
      : engineerReference || entry.documentaryReferenceV105 ? 'user-reference-classification' : 'source-classification',
    baseId: legacyVariant ? seed.id : null,
    originalName: text(entry.name),
    legacyModifier: legacyVariant ? entry.modifier : null,
    note: archived
      ? 'Déclinaison automatique historique non validée pour cette identité. Conservée pour retrouver les anciens identifiants et sauvegardes ; ne documente ni une mutation, ni un âge, ni un cycle biologique. Statistiques et médias historiques inchangés.'
      : legacyVariant
        ? 'Variante d’équipement blindé du projet, pas une mutation biologique ni une nouvelle espèce. Statistiques et médias historiques inchangés ; variante canonique non certifiée.'
        : entry.documentaryReferenceV105
          ? 'Organisme Engineer classé d’après le fichier utilisateur. Illustration originale conservée, pas un sprite ni un combattant admis. Nom, tenue et affiliation ne certifient aucune identité ni filiation canonique.'
        : engineerReference
          ? 'Classé Engineer d’après la référence utilisateur nommée Ingineer-Mother. Identité et filiation non certifiées canoniques ; ni fusion avec une autre figure Engineer, ni classement des créations des Engineers dans leur espèce.'
          : null
  });
}

export function isCatalogRecordVisibleV105(record, { includeLegacyVariants = false } = {}) {
  return Boolean(record && (includeLegacyVariants || record.catalogPolicyV105?.archived !== true));
}
