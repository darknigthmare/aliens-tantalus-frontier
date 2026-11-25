/** V188 arsenal completion (spec 014) — one read-only profile per catalogue
 * weapon, the contract the native runtime and the dev shooting range read.
 *
 * Provenance split, never a 1:1 claim:
 *  - documented: the feed type and ammunition recorded per source identity in
 *    docs/arsenal/data/tantalus_arsenal_master_v1.csv (embedded verbatim below
 *    and re-checked against the CSV by scripts/verify-weapon-arsenal-v188.mjs),
 *    plus the V124 ammunition receipts (M41A, M56) and the V193 admission;
 *  - adapted: capacities, cadences, reload beats, VFX/audio choices are
 *    Tantalus gameplay tuning, marked [PROPOSÉ];
 *  - to define: anything the sources do not settle stays [À DÉFINIR].
 * A finish variant (weapon-041…146) shares its base model's mechanism through
 * the catalogue generator itself (index modulo the 40 seeds in
 * content-core-v50.js); no name, slug or prefix inference is used.
 */
import { WEAPONS } from './content-core-v50.js';
import { getWeaponPresentationProfileV124 } from './weapon-presentation-profiles-v124.js';
import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';
import { inspectDetachableFeedV193 } from './weapon-feed-admission-v193.js';
import { resolveWeaponActionProfileV130 } from './weapon-actions-v130.js';
import { resolveWeaponActionProfileV131 } from './weapon-actions-v131.js';
import { resolveWeaponMechanicsV122 } from './weapon-mechanics-weapons-v122.js';
import { WEAPON_MODULE_CATALOG_V168 } from './weapon-attachments-v168.js';
import { M41A_UNDERBARREL_HOST_V174 } from './weapon-underbarrel-v174.js';
import { WEAPON_MASTERY_MAX_LEVEL_V167 } from './weapon-mastery-v167.js';
import { WEAPON_CATALOG_ADDITIONS_V188, isPendingPlaqueWeaponV188 } from './weapon-catalog-additions-v188.js';
import { ARSENAL_PLACEHOLDER_CATEGORIES_V188 } from './weapon-provisional-plaque-v188.js';

export const WEAPON_ARSENAL_SCHEMA_V188 = 188;
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
const CSV_PATH = 'docs/arsenal/data/tantalus_arsenal_master_v1.csv';
/** [ID stable, Alimentation, Munition / calibre, Œuvre principale, Crédibilité, Capacité canon, Rôle] */
export const ARSENAL_SOURCE_ROWS_V188 = freeze([
  ["weapon-001-m41a-pulse-rifle", "box", "10x24 caseless", "Aliens (1986)", "Référence identifiée", "99", "Rifle"],
  ["weapon-002-m41a2-pulse-rifle", "box", "10mm caseless (to verify)", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Rifle"],
  ["weapon-003-m4a3-service-pistol", "box", "9mm (verify)", "Aliens: Colonial Marines", "Identité secondaire, contrôle requis", "À définir / source", "Pistol"],
  ["weapon-004-vp70-combat-pistol", "box", "9mm (prop real)", "Aliens (1986)", "Identité secondaire, contrôle requis", "À définir / source", "Pistol"],
  ["weapon-005-m56-smartgun", "belt", "M250 caseless (variant)", "Aliens (1986)", "Référence identifiée", "À définir / source", "Heavy"],
  ["weapon-006-m240-incinerator-unit", "tank", "incinerator fuel", "Aliens (1986)", "Référence identifiée", "À définir / source", "Flamethrower"],
  ["weapon-007-m37a2-pump-shotgun", "tube", "12ga (verify)", "Aliens: Colonial Marines", "Identité secondaire, contrôle requis", "À définir / source", "Shotgun"],
  ["weapon-008-m39-submachine-gun", "box", "cased_ballistic", "Aliens: Colonial Marines", "Identité secondaire, contrôle requis", "À définir / source", "SMG"],
  ["weapon-009-m42a-scope-rifle", "box", "10mm caseless (verify)", "Alien RPG / Colonial Marines", "Identité secondaire, contrôle requis", "À définir / source", "Sniper"],
  ["weapon-010-m6b-rocket-launcher", "single", "rocket_M6B", "Aliens versus Predator 2 (2001)", "Identité secondaire, contrôle requis", "À définir / source", "Launcher"],
  ["weapon-011-m83-sadar", "single", "rocket_M83", "Aliens versus Predator: Extinction", "Identité secondaire, contrôle requis", "À définir / source", "Launcher"],
  ["weapon-012-m5-rpg", "single", "rocket_M5", "Aliens: Colonial Marines", "Identité secondaire, contrôle requis", "À définir / source", "Launcher"],
  ["weapon-013-m94-impact-grenade", "drum", "impact_grenade", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Grenade launcher"],
  ["weapon-014-m40-hedp-grenade", "single", "30mm_HE", "Aliens (1986)", "Référence identifiée", "À définir / source", "Grenade"],
  ["weapon-015-ua-571-c-sentry-gun", "box", "sentry_caseless", "Aliens (1986)", "Référence identifiée", "À définir / source", "Sentry"],
  ["weapon-016-heavy-pulse-rifle", "box", "10mm caseless (verify)", "Aliens: Dark Descent", "Identité secondaire, contrôle requis", "À définir / source", "Heavy"],
  ["weapon-017-f44aa-pulse-rifle", "box", "unknown (film prop)", "Alien: Romulus (2024)", "Référence identifiée", "À définir / source", "Rifle"],
  ["weapon-018-type-88-heavy-assault-rifle", "box", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Rifle"],
  ["weapon-019-ak-4047-pulse-rifle", "box", "unknown", "Alien RPG / Colonial Marines", "Identité secondaire, contrôle requis", "À définir / source", "Rifle"],
  ["weapon-020-es-4-electroshock-pistol", "cell", "charge_cell", "Prometheus (2012)", "Référence identifiée", "À définir / source", "Pistol"],
  ["weapon-021-357-magnum-revolver", "cylinder", ".357", "Alien: Isolation", "Référence identifiée", "6", "Revolver"],
  ["weapon-022-bolt-gun", "single", "bolt", "Alien: Isolation", "Référence identifiée", "À définir / source", "Industrial"],
  ["weapon-023-compound-bow", "single", "arrow", "Tantalus original", "Création Tantalus", "À définir / source", "Bow"],
  ["weapon-024-harpoon-gun", "single", "harpoon", "Alien (1979)", "Identité secondaire, contrôle requis", "À définir / source", "Harpoon"],
  ["weapon-025-plasma-rifle", "cell", "plasma_cell", "Aliens versus Predator (1999)", "Identité secondaire, contrôle requis", "À définir / source", "Energy"],
  ["weapon-026-combi-stick", "none", "none", "Predator 2 (1990)", "Référence identifiée", "À définir / source", "Melee"],
  ["weapon-027-smart-disc", "none", "none", "Predator 2 (1990)", "Référence identifiée", "À définir / source", "Thrown"],
  ["weapon-028-wrist-blades", "none", "none", "Predator (1987)", "Référence identifiée", "À définir / source", "Melee"],
  ["weapon-029-cutting-torch", "tank", "torch_fuel", "Alien: Isolation", "Identité secondaire, contrôle requis", "À définir / source", "Tool"],
  ["weapon-030-maintenance-jack", "none", "none", "Alien: Isolation", "Référence identifiée", "À définir / source", "Melee"],
  ["weapon-031-fire-axe", "none", "none", "Alien: Covenant (2017)", "Identité secondaire, contrôle requis", "À définir / source", "Melee"],
  ["weapon-032-combat-knife", "none", "none", "Aliens versus Predator 2 (2001)", "Identité secondaire, contrôle requis", "À définir / source", "Melee"],
  ["weapon-033-stun-baton", "cell", "charge_cell", "Alien: Isolation", "Référence identifiée", "À définir / source", "Melee"],
  ["weapon-034-sonic-harpoon", "single", "sonic_bolt", "Tantalus original", "Création Tantalus", "À définir / source", "Harpoon"],
  ["weapon-035-neuro-link-disruptor", "cell", "charge_cell", "Tantalus original", "Création Tantalus", "À définir / source", "Energy"],
  ["weapon-036-ripper-acid-projector", "tank", "acid_canister", "Tantalus original", "Création Tantalus", "À définir / source", "Chemical"],
  ["weapon-037-reef-caster", "tank", "acid_canister", "Tantalus original", "Création Tantalus", "À définir / source", "Chemical"],
  ["weapon-038-foundry-nailgun", "box", "nail", "Tantalus original", "Création Tantalus", "À définir / source", "Industrial"],
  ["weapon-039-cryo-lance", "tank", "cryo_canister", "Tantalus original", "Création Tantalus", "À définir / source", "Chemical"],
  ["weapon-040-pathogen-containment-projector", "tank", "quarantine_agent", "Tantalus original", "Création Tantalus", "À définir / source", "Chemical"],
  ["weapon-147-ocap-91-volcan", "tank", "fuel_canister", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Flamethrower"],
  ["weapon-148-type-76-auto-shotgun", "box", "shotgun_shell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Shotgun"],
  ["weapon-149-m12-rpg", "single", "rocket_M12", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Launcher"],
  ["weapon-150-l59-minigun", "belt", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Heavy"],
  ["weapon-151-lem-mp11-stormsurge", "box", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "SMG"],
  ["weapon-152-type-99-incinerator", "tank", "incinerator_fuel", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Flamethrower"],
  ["weapon-153-am-16-gruppa", "box", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Rifle"],
  ["weapon-154-microburst", "box", "microgrenade", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Launcher"],
  ["weapon-155-rapid-responder", "box", "shotgun_shell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Shotgun"],
  ["weapon-156-type-21-tactical-shotgun", "box", "shotgun_shell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Shotgun"],
  ["weapon-157-kramer-short-barrel", "box", "shotgun_shell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Shotgun"],
  ["weapon-158-n79-eva-laser", "cell", "energy_cell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Energy"],
  ["weapon-159-l33-pike", "box", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Sniper"],
  ["weapon-160-eds-93-zadak", "cell", "plasma_cell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Shotgun"],
  ["weapon-161-thunderbolt-mk2", "belt", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Heavy"],
  ["weapon-162-x45-bombard", "box", "flechette", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Sniper"],
  ["weapon-163-svat-92-sokol", "box", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Sniper"],
  ["weapon-164-mark-7-mod2-cqb", "box", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Pistol"],
  ["weapon-165-m51-breaching-scattergun", "box", "shotgun_shell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Shotgun"],
  ["weapon-166-p649-hel", "cell", "energy_cell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Energy"],
  ["weapon-167-dkt-59-misha", "box", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Pistol"],
  ["weapon-168-evi-87-zvezda", "cell", "plasma_cell", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Energy"],
  ["weapon-169-ppz-49-vol", "box", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "SMG"],
  ["weapon-170-frontier-revolver", "cylinder", "cased_ballistic", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Revolver"],
  ["weapon-171-x1-fireball", "box", "gel_D17", "Aliens: Fireteam Elite", "Identité secondaire, contrôle requis", "À définir / source", "Launcher"],
  ["weapon-172-lem-stg24-storm-rifle", "box", "cased_ballistic", "Aliens: Fireteam Elite — Pathogen", "Identité secondaire, contrôle requis", "À définir / source", "Rifle"],
  ["weapon-173-u1a2-gl-conversion", "box", "grenade_40mm", "Aliens: Fireteam Elite — Pathogen", "Identité secondaire, contrôle requis", "À définir / source", "Grenade launcher"],
  ["weapon-174-4c2-astra", "box", "cased_ballistic", "Aliens: Fireteam Elite — Pathogen", "Identité secondaire, contrôle requis", "À définir / source", "Rifle"],
  ["weapon-175-2b1-vajra", "box", "impact_grenade", "Aliens: Fireteam Elite — Pathogen", "Identité secondaire, contrôle requis", "À définir / source", "Launcher"],
  ["weapon-176-6a-jaipur-smg", "box", "flechette", "Aliens: Fireteam Elite — Pathogen", "Identité secondaire, contrôle requis", "À définir / source", "SMG"],
  ["weapon-177-8a7-dambulla-machine-pistol", "box", "cased_ballistic", "Aliens: Fireteam Elite — Pathogen", "Identité secondaire, contrôle requis", "À définir / source", "Pistol"]
]);
const sourceRows = new Map(ARSENAL_SOURCE_ROWS_V188.map(([id, feed, ammo, media, credibility, capacity, role]) =>
  [id, { id, feed, ammo, media, credibility, capacity, role }]));

/** The verified lot (spec 014 §Lot A): USCM-issue seeds 001–017, the V171
 * revolver prototype and the V188 additions, with every finish variant. */
const MARINE_BASES = Object.freeze(Array.from({ length: 17 }, (_, index) => WEAPONS[index].id));
export const ARSENAL_LOT_A_BASE_IDS_V188 = Object.freeze([...MARINE_BASES, 'weapon-021-357-magnum-revolver',
  ...WEAPON_CATALOG_ADDITIONS_V188.filter(weapon => !weapon.feedV188).map(weapon => weapon.id)]);
/** Lot B (franchise arsenal): the provisional-plaque rows 197+, each verified in a mission by its own suite. */
export const ARSENAL_LOT_B_IDS_V188 = Object.freeze(WEAPON_CATALOG_ADDITIONS_V188.filter(weapon => weapon.feedV188).map(weapon => weapon.id));

/** Native specialized-feed bridge. Each kind reuses one V171 mechanism state
 * machine; the template id names that state machine, never the weapon source. */
export const ARSENAL_FEED_TEMPLATES_V188 = freeze({
  tube: 'weapon-007-m37a2-pump-shotgun', cylinder: 'weapon-021-357-magnum-revolver',
  belt: 'weapon-005-m56-smartgun', tank: 'weapon-006-m240-incinerator-unit', single: 'weapon-011-m83-sadar',
  // An energy cell is replaced as one sealed unit: it reuses the tank state machine (no shell, no cycle).
  cell: 'weapon-006-m240-incinerator-unit'
});
const BRIDGED_BASES = freeze({
  'weapon-005-m56-smartgun': 'belt', 'weapon-006-m240-incinerator-unit': 'tank',
  'weapon-007-m37a2-pump-shotgun': 'tube', 'weapon-010-m6b-rocket-launcher': 'single',
  'weapon-011-m83-sadar': 'single', 'weapon-012-m5-rpg': 'single', 'weapon-021-357-magnum-revolver': 'cylinder',
  'weapon-194-hicks-ithaca-37-shotgun': 'tube', 'weapon-195-sevastopol-pump-shotgun': 'tube',
  'weapon-196-sevastopol-flamethrower': 'tank',
  // Lot B (T104): the CSV-recorded non-box feeds outside Lot A. Capacities stay the catalogue values.
  'weapon-020-es-4-electroshock-pistol': 'cell', 'weapon-025-plasma-rifle': 'cell', 'weapon-035-neuro-link-disruptor': 'cell',
  'weapon-158-n79-eva-laser': 'cell', 'weapon-160-eds-93-zadak': 'cell', 'weapon-166-p649-hel': 'cell', 'weapon-168-evi-87-zvezda': 'cell',
  'weapon-036-ripper-acid-projector': 'tank', 'weapon-037-reef-caster': 'tank', 'weapon-039-cryo-lance': 'tank',
  'weapon-040-pathogen-containment-projector': 'tank', 'weapon-147-ocap-91-volcan': 'tank', 'weapon-152-type-99-incinerator': 'tank',
  'weapon-150-l59-minigun': 'belt', 'weapon-161-thunderbolt-mk2': 'belt', 'weapon-170-frontier-revolver': 'cylinder',
  // Lot B additions: the feed kind each row records (documented or [PROPOSÉ] in the row itself).
  ...Object.fromEntries(WEAPON_CATALOG_ADDITIONS_V188.filter(weapon => ['tube', 'cylinder', 'belt', 'tank', 'cell'].includes(weapon.feedV188?.kind))
    .map(weapon => [weapon.id, weapon.feedV188.kind]))
});
/** Recorded, deliberately NOT bridged (see ARSENAL_COMPLETION_V188.md): the stun baton spends no charge
 * (V130 contact action), the cutting torch is a V130 tool, arrows and harpoons are V131 recoverable
 * projectiles fed from the reserve, and a one-round bolt gun / sonic harpoon would be a balance change. */
export const ARSENAL_UNBRIDGED_SPECIAL_FEEDS_V188 = freeze({
  'weapon-033-stun-baton': 'v130-contact-action-spends-no-charge', 'weapon-029-cutting-torch': 'v130-tool-action',
  'weapon-023-compound-bow': 'v131-recoverable-arrows-from-reserve', 'weapon-024-harpoon-gun': 'v131-recoverable-harpoons-from-reserve',
  'weapon-022-bolt-gun': 'single-capacity-would-change-balance-owner-decision',
  'weapon-034-sonic-harpoon': 'single-capacity-would-change-balance-owner-decision'
});
export { ARSENAL_PLACEHOLDER_CATEGORIES_V188 };
/** Capacities that the feed mechanism (or the CSV) settles; others keep the catalogue value. */
const CAPACITY_RULES = freeze({
  single: { capacity: 1, source: 'mechanism: one projectile per tube (CSV Alimentation=single)' },
  'weapon-021-357-magnum-revolver': { capacity: 6, source: CSV_PATH + ' · Capacité canon = 6' }
});
/** Owner decision A9 (23 Nov. 2026): the M41A dossier cites the commonly documented cyclic rate. The figure is
 * read from secondary summaries of the Colonial Marines Technical Manual (1995) — the manual itself was not
 * consulted — and the in-game cadence stays balance tuning [PROPOSÉ]: no gameplay value changes. */
export const ARSENAL_DOCUMENTED_RATES_V188 = freeze({
  'weapon-001-m41a-pulse-rifle': { roundsPerMinute: 900, status: 'secondary-summary-of-the-1995-technical-manual',
    sourceUrl: 'https://www.avpcentral.com/aliens-colonial-marines-technical-manual',
    sourceRefs: ['https://avpcentral.com/m41a-pulse-rifle-history-and-variants'],
    note: 'Cadence citée : 900 coups/min selon les synthèses du Colonial Marines Technical Manual (1995), source secondaire. La cadence en jeu est un réglage d’équilibrage.' }
});
export const arsenalDocumentedRateV188 = weaponOrId => ARSENAL_DOCUMENTED_RATES_V188[arsenalBaseIdV188(weaponOrId)] || null;
const PUMP_CYCLE_SECONDS = 0.4; // [PROPOSÉ] pump stroke; V124 ejects the hull at 0.18 s of it

const catalogue = new Map(WEAPONS.map(weapon => [weapon.id, weapon]));
const numberOf = id => Number(String(id).match(/^weapon-(\d{3})-/)?.[1] || 0);
/** Exact generator identity: ids 001–146 are seeds[(n - 1) % 40]. */
export function arsenalBaseIdV188(weaponOrId) {
  const id = typeof weaponOrId === 'string' ? weaponOrId : weaponOrId?.id;
  if (!catalogue.has(id)) return null;
  const number = numberOf(id);
  return number >= 1 && number <= 146 ? WEAPONS[(number - 1) % 40].id : id;
}

const credibilityStatus = value => value === 'Référence identifiée' ? 'documented-identity'
  : value === 'Création Tantalus' ? 'project-original' : value ? 'secondary-identity-to-verify' : 'to-define';
const casingPolicy = presentation => !presentation.casing ? (presentation.ammunition === 'caseless' ? 'none-caseless' : 'none')
  : presentation.casing.ejectOn === 'cycle' ? 'pump-cycle' : presentation.casing.ejectOn === 'reload' ? 'retained-until-reload' : 'per-shot';
const RELOAD_BEATS = freeze({
  box: [['eject-magazine', 0.35], ['insert-magazine', 0.75], ['chamber', 0.92]],
  drum: [['eject-drum', 0.35], ['insert-drum', 0.75], ['chamber', 0.92]],
  tube: [['open-port', 0], ['insert-shell-each', 'progress×planned'], ['pump-if-empty', 1]],
  cylinder: [['open-cylinder', 0], ['dump-retained-cases', 0.32], ['load-rounds', 0.78], ['close-cylinder', 1]],
  belt: [['isolate-old-belt', 0.45], ['link-new-belt', 0.88], ['ready', 1]],
  tank: [['isolate-old-tank', 0.45], ['replenish-tank', 0.88], ['ready', 1]],
  cell: [['eject-cell', 0.35], ['seat-cell', 0.75], ['charged', 0.92]],
  single: [['open-tube', 0], ['chamber-projectile', 0.9], ['ready', 1]],
  none: []
});
const tracerFor = (action, presentation, baseId) => baseId === 'weapon-005-m56-smartgun' ? 'smartgun-tracer'
  : ['rocket', 'launcher'].includes(action?.kind) ? 'rocket-smoke-trail'
    : action?.kind === 'stream' ? 'flame-stream' : ['plasma', 'electric', 'laser'].includes(action?.kind) ? 'energy-bolt'
      : presentation.mechanism === 'gel-projectile' ? 'gel-arc' : 'none';
const impactFor = (action, presentation) => ['rocket', 'launcher'].includes(action?.kind) || ['grenade'].includes(action?.kind)
  ? 'explosion' : action?.kind === 'stream' ? 'burn' : ['plasma', 'electric', 'laser'].includes(action?.kind) ? 'energy-scorch'
    : presentation.mechanism === 'melee' ? 'melee-contact' : presentation.mechanism === 'none' ? 'none' : 'spark';
/** Existing V188 cue ids only (no new sample is claimed). */
export function arsenalShotCueV188(profile) {
  if (!profile) return null;
  const kind = profile.fire.actionKind, mechanism = profile.vfx.mechanism;
  if (kind === 'stream' || mechanism === 'flamethrower') return 'weapon-flamethrower';
  if (['rocket', 'launcher'].includes(kind) || mechanism === 'gel-projectile') return 'weapon-m41a-grenade';
  if (profile.baseId === 'weapon-005-m56-smartgun') return 'weapon-smartgun';
  if (kind === 'scatter' || /shotgun/.test(mechanism)) return 'weapon-shotgun';
  if (['pistol', 'revolver'].includes(profile.held.type) || mechanism === 'revolver') return 'weapon-pistol';
  return null; // legacy 'shot' (M41A keeps its historical single-shot sound)
}

function feedFor(weapon, baseId, presentation) {
  const row = sourceRows.get(baseId);
  const addition = isPendingPlaqueWeaponV188(weapon);
  const kind = row?.feed || (addition ? weapon.feedV188?.kind || BRIDGED_BASES[baseId] : null) || presentation.reload.feed || 'none';
  const detachable = inspectDetachableFeedV193(weapon);
  const bridge = BRIDGED_BASES[baseId] || null;
  // A finish variant shares its base's tube or cylinder: the generated legacy
  // number (e.g. a 90-shell tube) is not a mechanism. Belts and tanks keep the
  // catalogue gameplay quantity.
  const base = catalogue.get(baseId);
  const rule = CAPACITY_RULES[baseId] || (bridge ? CAPACITY_RULES[bridge] : null)
    || (['tube', 'cylinder'].includes(bridge) && base && base.id !== weapon.id
      ? { capacity: base.magazine, source: 'base model ' + base.id + ' tube capacity (finish variant shares the mechanism) [PROPOSÉ]' } : null)
    || (weapon.feedV188?.capacityDocumented ? { capacity: weapon.magazine, source: weapon.feedV188.capacitySource } : null);
  return {
    kind, kindSource: row ? CSV_PATH + ' · Alimentation (' + row.id + ')' : weapon.feedV188 ? 'weapon-catalog-franchise-v188 · feedV188 (' + weapon.feedV188.note + ')'
      : addition ? 'weapon-catalog-additions-v188 · sourceMechanism'
      : 'V124 presentation feed [À DÉFINIR]',
    ammunition: row?.ammo || (addition ? weapon.ammunitionV188 : null) || '[À DÉFINIR]',
    sourceCapacity: row?.capacity && /^\d+$/.test(row.capacity) ? Number(row.capacity) : null,
    catalogueCapacity: weapon.magazine,
    runtimeCapacity: rule ? rule.capacity : weapon.magazine,
    capacitySource: rule ? rule.source : 'catalogue gameplay value [PROPOSÉ]',
    detachableMagazine: detachable.detachable === true,
    detachableReason: detachable.reason,
    worldPickup: detachable.detachable === true ? 'v168-dropped-magazine-recovery' : 'none-non-detachable-or-unreviewed',
    nativeBridge: bridge, bridgeTemplateId: bridge ? ARSENAL_FEED_TEMPLATES_V188[bridge] : null,
    pumpCycleSeconds: bridge === 'tube' ? PUMP_CYCLE_SECONDS : null
  };
}

function buildProfile(weapon) {
  const baseId = arsenalBaseIdV188(weapon), base = catalogue.get(baseId);
  const presentation = getWeaponPresentationProfileV124(weapon);
  const held = resolveHeldWeaponProfileV125(weapon);
  const action = resolveWeaponActionProfileV131(weapon) || resolveWeaponActionProfileV130(weapon)
    || (resolveWeaponMechanicsV122(weapon) ? { kind: 'gel-projectile' } : null);
  const row = sourceRows.get(baseId), addition = isPendingPlaqueWeaponV188(weapon);
  const feed = feedFor(weapon, baseId, presentation);
  const interval = Number.isFinite(action?.interval) ? action.interval : 1 / weapon.fireRate;
  const modes = [action?.kind === 'burst' ? 'burst-3' : action?.kind === 'scatter' ? (feed.nativeBridge === 'tube' ? 'pump-single' : 'semi-scatter')
    : action?.kind === 'stream' ? 'continuous-stream' : ['rocket', 'launcher'].includes(action?.kind) ? 'single-projectile'
      : ['melee', 'stun', 'torch', 'disc', 'grenade'].includes(action?.kind) ? action.kind : 'automatic'];
  if (baseId === M41A_UNDERBARREL_HOST_V174) modes.push('underbarrel-30mm-v174-contract-not-native');
  const slots = ['muzzle', 'optic', 'side_rail', 'cosmetic',
    { box: 'magwell', drum: 'magwell', belt: 'belt_harness', tank: 'tank_mount', cell: 'cell_port',
      tube: 'chamber', cylinder: 'chamber', single: 'projectile_head' }[feed.kind]].filter(Boolean);
  const modules = WEAPON_MODULE_CATALOG_V168.filter(module => module.supported.includes(weapon.id)).map(module => module.id);
  const placeholder = addition ? ARSENAL_PLACEHOLDER_CATEGORIES_V188[weapon.placeholderCategoryV188]
    || ARSENAL_PLACEHOLDER_CATEGORIES_V188[weapon.family === 'flame' ? 'flame' : 'shotgun'] : null;
  const placeholderSlot = placeholder ? placeholder[0] : null;
  return {
    schema: 188, weaponId: weapon.id, baseId, name: weapon.name, family: weapon.family, source: weapon.source,
    mark: weapon.mark, lotA: ARSENAL_LOT_A_BASE_IDS_V188.includes(baseId), lotB: ARSENAL_LOT_B_IDS_V188.includes(weapon.id),
    role: row?.role || (placeholder ? placeholder[2] : weapon.family),
    feed,
    fire: { actionKind: action?.kind || 'legacy-single-bullet', modes,
      roundsPerSecond: Math.round(1000 / interval) / 1000, rateSource: '[PROPOSÉ] catalogue fireRate / V131 interval',
      documentedRate: ARSENAL_DOCUMENTED_RATES_V188[baseId] || null,
      damage: weapon.damage, damageSource: '[PROPOSÉ] ' + (weapon.statsPolicy || 'catalogue') },
    reload: { seconds: weapon.reload, beats: RELOAD_BEATS[feed.nativeBridge || feed.kind] || RELOAD_BEATS.box,
      transaction: feed.detachableMagazine ? 'v167-physical-magazine-opt-in' : feed.nativeBridge ? 'v188-native-special-feed'
        : feed.kind === 'none' ? 'none' : 'v77-numeric-transfer', source: '[PROPOSÉ] project timing, not a measured source' },
    vfx: { mechanism: presentation.mechanism, muzzle: presentation.muzzle.kind,
      ejection: casingPolicy(presentation), reloadDiscard: presentation.reload.discard,
      tracer: tracerFor(action, presentation, baseId), impact: impactFor(action, presentation),
      acidSplash: 'from-target-biology-vfx-v188', layers: ['weapon-effects-v124', 'vfx-v188', 'weapon-arsenal-runtime-v188'] },
    audio: { shot: null, reload: feed.kind === 'none' ? null : 'weapon-reload', dryFire: 'weapon-dry-fire',
      cycle: feed.nativeBridge === 'tube' ? 'weapon-dry-fire' : null, status: 'existing-original-synthesis-cues-reused [ADAPTÉ]' },
    held: { art: held ? 'native-plaque' : addition ? 'canvas-placeholder' : 'none', imageKey: held?.imageKey || null,
      placeholderSlot, type: held?.type || (placeholder ? placeholder[1] : null),
      attachmentPoints: held ? ['grip', 'muzzle', 'support', 'reload', 'ejection'].filter(key => held[key + 'Pivot'])
        : addition ? ['grip', 'muzzle'].concat(['pistol', 'melee'].includes(placeholder[1]) ? [] : ['support'], weapon.family === 'melee' ? [] : ['reload'],
          presentation.casing ? ['ejection'] : []) : [],
      moduleSlots: slots, admittedModules: modules },
    progression: { masteryMaxLevel: WEAPON_MASTERY_MAX_LEVEL_V167, masteryLedger: 'weapon-mastery-v167 (any catalogue id)' },
    fidelity: { status: weapon.plaqueStatus === 'provisional-drawn' ? 'source-identity-provisional-plaque'
      : addition ? 'source-identity-no-plaque' : credibilityStatus(row?.credibility || base?.provenance),
      identityEvidence: weapon.identityEvidence || null, capacityDocumented: weapon.feedV188?.capacityDocumented === true,
      sourceMedia: row?.media || weapon.sourceWork || null, sourceUrl: weapon.sourceUrl || null,
      researchId: weapon.researchId || null, canonExact: false, visualFidelity1to1: false,
      note: 'Documenté / adapté / à définir séparés dans docs/development/ARSENAL_COMPLETION_V188.md' }
  };
}
const profiles = WEAPONS.map(weapon => {
  const profile = buildProfile(weapon);
  profile.audio.shot = arsenalShotCueV188(profile);
  return freeze(profile);
});
const byId = new Map(profiles.map(profile => [profile.weaponId, profile]));
export const WEAPON_ARSENAL_PROFILES_V188 = Object.freeze(profiles);
export const ARSENAL_BRIDGED_WEAPON_IDS_V188 = Object.freeze(profiles.filter(p => p.feed.nativeBridge).map(p => p.weaponId));
/** Exact catalogue id (string, descriptor.id, weaponId or catalogId); nothing else resolves. */
export function getArsenalProfileV188(weaponOrId) {
  const id = typeof weaponOrId === 'string' ? weaponOrId
    : weaponOrId && typeof weaponOrId === 'object' ? weaponOrId.id || weaponOrId.weaponId || weaponOrId.catalogId : null;
  return typeof id === 'string' ? byId.get(id) || null : null;
}
export function listArsenalProfilesV188({ lotA = null, lotB = null, bridged = null } = {}) {
  return profiles.filter(p => (lotA === null || p.lotA === lotA) && (lotB === null || p.lotB === lotB)
    && (bridged === null || Boolean(p.feed.nativeBridge) === bridged));
}
