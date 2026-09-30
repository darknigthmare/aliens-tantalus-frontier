/**
 * Research queue only: these records are NOT runtime enemy definitions.
 * A named/licensed subject is not an admitted PNG, an animation, or a 1:1 claim.
 * Admission must use a separate reviewed asset registry with measured geometry.
 */
const freeze = value => {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) freeze(item);
    Object.freeze(value);
  }
  return value;
};

export const ENEMY_EXPANSION_SOURCES_V96 = freeze({
  hammerpedeNeca: {
    url: 'https://store.necaonline.com/blogs/news/174242631-shipping-now-prometheus-series-2-figures-check-out-the-action-shots',
    title: 'NECA — Prometheus Series 2 action shots',
    authority: 'primary-licensed-manufacturer', published: '2013-02-22', checked: '2026-09-26',
    supports: 'Named bendable Hammerpede accessories supplied with the Deacon figure and product photographs.',
    limitation: 'A licensed product reference, not a film model extraction or certification of every visible detail.'
  },
  kennerNeca: {
    url: 'https://store.necaonline.com/blogs/news/shipping-this-week-aliens-series-10-freddy-s-revenge-1-4-scale-freddy-and-foam-space-jockey',
    title: 'NECA — Aliens Series 10 Kenner tribute',
    authority: 'primary-licensed-manufacturer', published: '2016-12-19', checked: '2026-09-26',
    supports: 'Names Gorilla Alien, Mantis Alien and Queen Facehugger; translucent green Mantis; reprinted Dark Horse mini-comics packaged with the figures.',
    limitation: 'Kenner/NECA licensed expanded-universe designs, not appearances in the Alien films. Packaging alone does not establish the contents of each comic.'
  },
  afeGameSpot: {
    url: 'https://www.gamespot.com/articles/aliens-fireteam-elite-synthetic-enemy-guide-every-type-and-how-to-kill-them/1100-6495625/',
    title: 'GameSpot — Aliens: Fireteam Elite synthetic enemy guide',
    authority: 'secondary-gameplay-guide', published: '2021-08-26', checked: '2026-09-26',
    supports: 'Synth Warden, Containment Synth and Synth Detonator are distinct combat enemies; cap, shield and headless silhouette respectively.',
    limitation: 'Secondary reporting and screenshots; exact unit-specific visual references still require review before generation.'
  },
  afeOfficial: {
    url: 'https://www.aliensfireteamelite.com/en/releasenotes/',
    title: 'Aliens: Fireteam Elite — official release notes',
    authority: 'primary-developer', checked: '2026-09-26',
    supports: 'Official game/product context only.',
    limitation: 'Not used as proof of these individual unit names or their visual details.'
  }
});

const common = {
  status: 'research-candidate', runtimeActive: false, automaticEncounter: false,
  assetStatus: 'not-admitted', animationStatus: 'missing', canonExact: false,
  identityVerified: false, sourceChecked: '2026-09-26',
  eligible: false, blocked: true, eligibilityMeaning: 'runtime-admission',
  blockedReasons: ['No separately admitted PNG with measured geometry and provenance.'],
  adaptation: 'Original fan-made adaptation subject to visual review; no 1:1 certification.'
};

export const ENEMY_EXPANSION_CANDIDATES_V96 = freeze([
  {
    ...common, id: 'pose-v96-film-hammerpede', name: 'Hammerpede', biology: 'pathogen',
    sourceKind: 'film', work: 'Prometheus (2012)', provenance: 'licensed-reference',
    aliases: ['Hammerpede'], sourceIds: ['hammerpedeNeca'],
    sourceStatus: 'primary-licensed-reference-found', prioritized: true,
    productionStatus: 'reference-review-required',
    distinction: 'Separate organism; not the Trilobite, Deacon, or Kenner Snake Alien.',
    notAliasesOf: ['enemy-035-trilobite-echo', 'enemy-036-deacon-line', 'pose-v94-kenner-snake'],
    visualReviewNotes: ['Wormlike body and opened head structure.', 'Use the reviewed Hammerpede accessory, not the Deacon pictured on the same page.']
  },
  {
    ...common, id: 'pose-v96-kenner-mantis', name: 'Mantis Alien', biology: 'xenomorph',
    sourceKind: 'licensed-toy-comic-line', work: 'Aliens — Kenner / NECA Series 10', provenance: 'licensed-reference',
    aliases: ['Mantis Alien'], sourceIds: ['kennerNeca'],
    sourceStatus: 'primary-licensed-reference-found', prioritized: true,
    productionStatus: 'reference-review-required',
    distinction: 'Distinct mantis-derived Kenner tribute design, not a film caste or a green Warrior recolour.',
    notAliasesOf: ['enemy-005-warrior'],
    visualReviewNotes: ['Translucent green material is explicitly documented by the manufacturer.', 'Review the actual Mantis product photograph before locking appendages and silhouette.']
  },
  {
    ...common, id: 'pose-v96-kenner-queen-facehugger', name: 'Queen Facehugger', biology: 'xenomorph',
    sourceKind: 'licensed-toy-comic-line', work: 'Aliens — Kenner / NECA Series 10', provenance: 'licensed-reference',
    aliases: ['Queen Facehugger'], sourceIds: ['kennerNeca'],
    sourceStatus: 'primary-identity-confirmed-visual-lock-pending', prioritized: false,
    productionStatus: 'blocked-visual-reference',
    distinction: 'The named Kenner/NECA figure; not an automatic alias of the Alien 3 royal facehugger or a scaled film Facehugger.',
    notAliasesOf: ['enemy-002-facehugger'],
    visualReviewNotes: ['No generation until this exact figure has been visually inspected.']
  },
  {
    ...common, id: 'pose-v96-afe-synth-warden', name: 'Synth Warden', biology: 'synthetic',
    sourceKind: 'game', work: 'Aliens: Fireteam Elite (2021)', provenance: 'licensed-reference',
    aliases: ['Synth Warden', 'Synthetic Warden'], sourceIds: ['afeGameSpot', 'afeOfficial'],
    sourceStatus: 'secondary-identity-reference-visual-lock-pending', prioritized: false,
    productionStatus: 'blocked-visual-reference',
    distinction: 'Command synthetic identified by its cap and support behaviour, not the existing Synth Trooper or Heavy.',
    notAliasesOf: ['pose-v94-afe-synth-trooper', 'pose-v94-afe-synth-heavy'],
    visualReviewNotes: ['Secure a unit-specific in-game or official visual reference before production.', 'Cap and support behaviour are secondary-source observations, not yet independently verified primary details.']
  },
  {
    ...common, id: 'pose-v96-afe-containment-synth', name: 'Containment Synth', biology: 'synthetic',
    sourceKind: 'game', work: 'Aliens: Fireteam Elite (2021)', provenance: 'licensed-reference',
    aliases: ['Containment Synth', 'Containment Synthetic'], sourceIds: ['afeGameSpot', 'afeOfficial'],
    sourceStatus: 'secondary-identity-reference-visual-lock-pending', prioritized: false,
    productionStatus: 'blocked-visual-reference',
    distinction: 'Shield-bearing enemy, not the existing guard profile silently given a shared sprite.',
    notAliasesOf: ['pose-v94-afe-synth-guard'],
    visualReviewNotes: ['Review the shield/body proportions and rear silhouette from a unit-specific reference.']
  },
  {
    ...common, id: 'pose-v96-afe-synth-detonator', name: 'Synth Detonator', biology: 'synthetic',
    sourceKind: 'game', work: 'Aliens: Fireteam Elite (2021)', provenance: 'licensed-reference',
    aliases: ['Synth Detonator', 'Synthetic Detonator'], sourceIds: ['afeGameSpot', 'afeOfficial'],
    sourceStatus: 'secondary-identity-reference-visual-lock-pending', prioritized: false,
    productionStatus: 'blocked-visual-reference',
    distinction: 'Headless rush enemy, not the Sniper/Trooper/Guard/Heavy silhouettes already admitted in V94.',
    notAliasesOf: ['pose-v94-afe-synth-trooper'],
    visualReviewNotes: ['Review exact in-game model and equipment before generating or assigning mechanics.']
  }
]);

const byId = new Map(ENEMY_EXPANSION_CANDIDATES_V96.map(candidate => [candidate.id, candidate]));
export function getEnemyExpansionCandidateV96(id) {
  return typeof id === 'string' ? byId.get(id) || null : null;
}
