import { renderWeaponResearchIndexV171 } from './weapon-research-index-v171.js';
/** Evidence-first backlog for weapons absent or not authenticated in Tantalus.
 * This is a documentary layer, never a purchasable content registry.
 * A similarly named native weapon cannot silently certify a sequel revision.
 */
export const WEAPON_FIDELITY_SCHEMA_V170 = 170;
export const WEAPON_FIDELITY_SOURCES_V170 = Object.freeze({
  afe2: 'https://www.gamewatcher.com/aliens-fireteam-elite-2/weapons',
  afe2Publisher: 'https://www.daybreakgames.com/press/afe2/article/dbg-afe2-now-live',
  afe2Steam: 'https://store.steampowered.com/app/3448650/Aliens_Fireteam_Elite_2/',
  afe2Patch: 'https://www.daybreakgames.com/press/afe2/article/afe2-102226-patchnotes',
  afe1: 'https://www.aliensfireteamelite.com/en/releasenotes/',
  isolation: 'https://www.feralinteractive.com/en/manuals/alienisolation/latest/steam/'
});
const freeze = x => { if (x && typeof x === 'object' && !Object.isFrozen(x)) {
  Object.values(x).forEach(freeze); Object.freeze(x); } return x; };
// [stable dossier id, display name, family, feed NOT YET verified, comparison with live weapon]
const AFE2 = [
  ['proposed-db-48-daittyo-heavy-rifle','DB-48 Daittyo Heavy Rifle','ballistic','unverified',null],
  ['proposed-l56a3-smartgun','L56A3 Smartgun','smart','belt-unverified',null],
  ['comparison-m41a2-afe2','M41A2 Pulse Rifle — AFE2 appearance','ballistic','box-unverified','weapon-002-m41a2-pulse-rifle'],
  ['proposed-hnt-1-el-alamein-revolver-rifle','HNT-1 El Alamein Revolver Rifle','ballistic','cylinder-unverified',null],
  ['proposed-bd-03-djinn-personal-railgun','BD-03 Djinn Personal Railgun','energy','charge-unverified',null],
  ['proposed-type-111-directed-particle-emitter','Type 111 Directed Particle Emitter','energy','cell-unverified',null],
  ['proposed-eds-93-zadak-plasma-discharger-mk-2','EDS-93 Zadak Plasma Discharger Mk.2','energy','cell-unverified',null],
  ['proposed-smb-94-zephyr-plasma-emitter','SMB-94 Zephyr Plasma Emitter','energy','cell-unverified',null],
  ['proposed-m12a1-rocket-launcher','M12A1 Rocket Launcher','explosive','rocket-unverified',null],
  ['comparison-ocap91-afe2','OCAP-91 Volcan — AFE2 appearance','flame','tank-unverified','weapon-147-ocap-91-volcan'],
  ['proposed-type-21-tactical-shotgun-mk-2','Type 21 Tactical Shotgun Mk.2','ballistic','shell-unverified',null],
  ['comparison-x1-fireball-afe2','X1 Fireball — AFE2 appearance','flame','projectile-unverified','weapon-171-x1-fireball']
];
// Manufacturer names are intentionally absent: Feral's manual establishes
// the in-game weapon class but not the complete in-universe model designation.
const ISOLATION = [
  ['proposed-model-37-12-gauge-pump-action','Shotgun — Sevastopol','ballistic','tube-unverified',null],
  ['proposed-sevastopol-flamethrower','Flamethrower — Sevastopol','flame','tank-unverified',null],
  ['proposed-dv-303-bolt-gun','Bolt Gun — Sevastopol','ballistic','single-unverified',null],
  ['comparison-isolation-revolver','Revolver — Sevastopol','ballistic','cylinder-unverified','weapon-021-357-magnum-revolver'],
  ['comparison-isolation-stun-baton','Stun Baton — Sevastopol','electric','energy-unverified','weapon-033-stun-baton']
];
const AFE2_PATCH = [
  ['proposed-mondo-heat-9000','Mondo Heat 9000','thermal','heat-and-cryo-augment-unverified',null]
];
const AFE1 = [
  ['proposed-m41e4-heavy-pulse-rifle','M41E4 Heavy Pulse Rifle','ballistic','unverified',null]
];
const sourceDossier = (a, work, evidence, sourceKey, crossRefs = []) => ({
  id: a[0], title: a[1], work, family: a[2], feed: a[3],
  comparisonCatalogId: a[4], evidence, sourceUrl: WEAPON_FIDELITY_SOURCES_V170[sourceKey],
  crossRefs, isPurchasable: false, visuallyAuthenticated: false,
  canonExact: false, mechanicsConfirmed: false, animationConfirmed: false,
  acceptance: 'visual-and-action-authentication-required',
  reviewStatus: 'source-name-only',
  note: a[4] ? 'Existing model only provides an identity comparison; not an AFE2 or Sevastopol visual match.' : ''
});
export const WEAPON_FIDELITY_DOSSIERS_V170 = freeze([
  ...AFE2.map(a => sourceDossier(a, 'Aliens: Fireteam Elite 2',
    'secondary-prelaunch-gameplay-screenshots','afe2',
    [WEAPON_FIDELITY_SOURCES_V170.afe2Publisher, WEAPON_FIDELITY_SOURCES_V170.afe2Steam])),
  ...AFE2_PATCH.map(a => sourceDossier(a, 'Aliens: Fireteam Elite 2 — Patch 2026',
    'first-party-patch-notes','afe2Patch')),
  ...ISOLATION.map(a => sourceDossier(a, 'Alien: Isolation',
    'first-party-game-manual','isolation')),
  ...AFE1.map(a => sourceDossier(a, 'Aliens: Fireteam Elite',
    'first-party-patch-notes','afe1'))
]);
export const WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170 = freeze([
  'Assault Brake','Auto-Loader','Composite Assembly','Composite Spring Magazine',
  'Extended Field Brake','Hollow Points','STAP Magazine','Dual Rail Booster',
  'Multiport Compensator','Magnified Reflex Sight','Holotab Sight','Compound Optic',
  'Kinetic Enhancement Harness'
].map(name=>({
  id: 'afe1-' + name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
  name, sourceUrl: WEAPON_FIDELITY_SOURCES_V170.afe1,
  status: 'not-admitted', weaponCompatibilities: [], gameplayStats: null,
  dedicatedSprite: null, sourceStatus: 'official-name-not-visual-certified'
})));
const id = x => typeof x === 'string' && /^[a-z0-9][a-z0-9-]{3,120}$/.test(x);
const approvedUrls = new Set(Object.values(WEAPON_FIDELITY_SOURCES_V170));
export function validateWeaponFidelityV170(rows = WEAPON_FIDELITY_DOSSIERS_V170) {
  const errors = [], keys = new Set();
  for (const a of rows) {
    if (!id(a.id) || keys.has(a.id)) errors.push('duplicate-or-invalid-id:' + a.id);
    keys.add(a.id);
    if (!a.title || !a.work || !a.family || !a.feed) errors.push('missing-classification:' + a.id);
    if (!approvedUrls.has(a.sourceUrl) || !a.crossRefs.every(url => approvedUrls.has(url)))
      errors.push('unapproved-source:' + a.id);
    if (!['secondary-prelaunch-gameplay-screenshots','first-party-game-manual','first-party-patch-notes'].includes(a.evidence))
      errors.push('unrecognized-evidence:' + a.id);
    if (a.isPurchasable !== false || a.visuallyAuthenticated !== false
      || a.canonExact !== false || a.mechanicsConfirmed !== false
      || a.animationConfirmed !== false || a.acceptance !== 'visual-and-action-authentication-required')
      errors.push('unsupported-release-claim:' + a.id);
    if (a.comparisonCatalogId !== null && !/^weapon-\d{3}-[a-z0-9-]+$/.test(a.comparisonCatalogId))
      errors.push('invalid-comparison-id:' + a.id);
  }
  if (new Set(WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170.map(a=>a.id)).size
    !== WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170.length) errors.push('duplicate-attachment-id');
  return { valid: errors.length === 0, errors, dossiers: rows.length,
    secondary: rows.filter(a=>a.evidence.startsWith('secondary')).length,
    firstParty: rows.filter(a=>a.evidence.startsWith('first-party')).length,
    attachments: WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170.length,
    approved1to1: 0, purchasable: 0 };
}
export function getWeaponFidelityDossiersV170({ work = null, missingOnly = false } = {}) {
  return WEAPON_FIDELITY_DOSSIERS_V170.filter(a =>
    (work === null || a.work === work) && (!missingOnly || !a.comparisonCatalogId));
}
const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderWeaponFidelityDossiersV170() {
  const html = WEAPON_FIDELITY_DOSSIERS_V170.map(a =>
    '<article class="catalog-card" data-fidelity-id="' + esc(a.id) + '">'
    + '<span class="eyebrow">' + esc(a.work) + ' · ' + (a.comparisonCatalogId ? 'COMPARAISON' : 'NON DISTRIBUÉ') + '</span>'
    + '<h4>' + esc(a.title) + '</h4>'
    + '<p>' + (a.evidence.startsWith('secondary') ? 'Source visuelle secondaire.' : 'Identité dans une source officielle.')
    + ' Apparence et comportement 1:1 non vérifiés.</p>'
    + '<footer><a href="' + esc(a.sourceUrl) + '" target="_blank" rel="noopener noreferrer">Référence</a>'
    + '<span>RECHERCHE</span></footer></article>').join('');
  return '<section class="panel" id="armory-fidelity-v170" aria-label="Dossiers des armes non authentifiées">'
    + '<details><summary>ARCHIVES ARMEMENT · ' + WEAPON_FIDELITY_DOSSIERS_V170.length
    + ' références à authentifier</summary><p>Dossiers d’identification uniquement : aucune acquisition disponible.</p>'
    + '<div class="catalog-grid">' + html + '</div></details>'
    + '<details><summary>ACCESSOIRES DOCUMENTÉS · ' + WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170.length
    + ' modules à authentifier</summary><p>Les noms proviennent des notes officielles.'
    + ' Aucune compatibilité, modification de statistiques ou silhouette n’est supposée.</p>'
    + '<ul>' + WEAPON_FIDELITY_ATTACHMENT_REFERENCES_V170.map(a =>
      '<li>' + esc(a.name) + ' · <a href="' + esc(a.sourceUrl)
      + '" target="_blank" rel="noopener noreferrer">Source</a></li>').join('')
    + '</ul></details></section>' + renderWeaponResearchIndexV171();
}
