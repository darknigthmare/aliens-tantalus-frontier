import { USER_PACK_V100 } from './user-pack-v100.js';
import { USER_REFERENCE_RECOVERY_V100 } from './user-reference-recovery-v100.js';
import { getEnemyPhysicalSizeV100 } from './enemy-physical-size-v100.js';
import { getReferenceAdaptationV106 } from './user-reference-status-v106.js';

// These are original illustrations, not silently admitted combat sprites.
// Keeping a separate identity/path for every view also preserves Altered designs.
export const USER_REFERENCE_LIBRARY_V100 = Object.freeze([
  ...USER_PACK_V100, ...USER_REFERENCE_RECOVERY_V100
].map(entry => Object.freeze({ ...entry,
  name: entry.name || entry.sourceFile,
  lineage: entry.lineage || 'non-classée',
  stage: entry.stage || 'non-documenté',
  faction: entry.faction || 'non-documentée',
  kind: entry.kind || 'creature',
  sourceBatch: entry.sourceBatch || (entry.id.startsWith('pack-') ? '270926' : 'recovery'),
  combatReady: false, automaticEncounter: false,
  visualStatus: 'original-reference-not-combat-sprite',
  // An Altered link does not transfer anatomy, life stage or physical dimensions.
  // Keep the original's candidate separate from this still-unmeasured artwork.
  physicalSize: null,
  parentPhysicalSize: getEnemyPhysicalSizeV100(entry.alteredOf || '')
})));

const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').toLowerCase();
export function filterUserReferencesV100(entries, filters = {}) {
  const terms = normalize(filters.search).split(/\s+/u).filter(Boolean);
  const matches = entries.filter(entry => ['biology', 'lineage', 'stage', 'kind', 'sourceBatch'].every(key =>
    !filters[key] || filters[key] === 'all' || entry[key] === filters[key])
    && (!filters.alteredOnly || Boolean(entry.alteredOf))
    && terms.every(term => normalize([entry.name, entry.sourceFile, entry.biology, entry.faction,
      entry.lineage, entry.stage, entry.alteredOf, entry.relationship, entry.visualNotes, entry.reason].join(' ')).includes(term)));
  return Object.freeze(matches.toSorted((a, b) => {
    const field = filters.sort === 'lineage' ? 'lineage' : filters.sort === 'stage' ? 'stage' : 'name';
    return String(a[field]).localeCompare(String(b[field]), 'fr', { numeric: true }) || a.id.localeCompare(b.id);
  }));
}

export const REFERENCE_LABELS_V100 = Object.freeze({
  xenomorph: 'Xénomorphes', synthetic: 'Synthétiques', engineer: 'Ingénieurs', human: 'Humains',
  pathogen: 'Pathogène', fauna: 'Faune', unknown: 'À identifier', object: 'Objets',
  creature: 'Créatures', equipment: 'Équipements', prop: 'Objets', lifecycle: 'Cycle biologique',
  organism: 'Organismes', concept: 'Concepts', 'non-organic': 'Objets non organiques', 'host-transformation': 'Hôtes en transformation',
  reference: 'Références', '270926': 'Pack 270926', recovery: 'Images récupérées',
  egg: 'Œuf', parasite: 'Parasite', juvenile: 'Juvénile', adult: 'Adulte', royal: 'Royal',
  cocoon: 'Cocon', 'non-documenté': 'Non documenté', 'non-classée': 'Non classée',
  King: 'Roi', Queen: 'Reine', Praetorian: 'Prétorien', Warrior: 'Guerrier', Drone: 'Drone',
  Chestburster: 'Chestburster', Facehugger: 'Facehugger', Juvenile: 'Juvénile', Egg: 'Œuf',
  'Queen Chestburster': 'Chestburster royal', Cocoon: 'Cocon', 'Encased Host': 'Hôte encapsulé',
  'Embryo Sac': 'Sac embryonnaire', Larva: 'Larve', container: 'Contenant',
  'armored-adult': 'Adulte en armure', 'ceremonial-adult': 'Adulte en tenue cérémonielle',
  'suited-adult': 'Adulte équipé', Hive: 'Ruche', Engineers: 'Ingénieurs', Unassigned: 'Non attribuée'
});

/** Accessible, paginated original-art archive; no save writes or combat admission. */
export function createUserReferenceLibraryV100(documentRef, { onOpenEnemy = null, entries = USER_REFERENCE_LIBRARY_V100 } = {}) {
  const node = (tag, text, className) => {
    const element = documentRef.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const section = node('section', '', 'panel reference-library-v100'); section.id = 'user-reference-library-v100';
  section.setAttribute('aria-label', 'Imports et variantes Altered');
  section.append(node('p', 'ARCHIVES XÉNOBIOLOGIQUES // ORIGINAUX CONSERVÉS', 'eyebrow'));
  section.append(node('h3', 'Imports, lignées et variantes Altered'));
  section.append(node('p', 'Illustrations fournies, conservées sans retouche. Les variantes ne remplacent jamais l’ennemi d’origine. Chaque dossier indique séparément la découpe admise en combat ou au banc de confinement. Une pose fixe ne constitue ni une animation ni une fidélité 1:1 certifiée.'));
  const controls = node('div', '', 'reference-library-v100__filters');
  const filters = { search: '', biology: 'all', lineage: 'all', stage: 'all', kind: 'all', sourceBatch: 'all', sort: 'name', alteredOnly: false };
  let limit = 24, selectedId = null, visible = [], controlsByKey = {};
  const field = (label, control) => { const wrapper = node('label'); wrapper.append(node('span', label), control); controls.append(wrapper); return control; };
  const search = field('Rechercher une image', node('input')); search.type = 'search'; search.placeholder = 'Nom, lignée, faction…';
  search.dataset.referenceSearch = 'true';
  search.addEventListener('input', () => { filters.search = search.value; limit = 24; render(); });
  for (const [key, label] of [['biology', 'Famille'], ['lineage', 'Lignée'], ['stage', 'Stade'], ['kind', 'Type'], ['sourceBatch', 'Lot']]) {
    const select = field(label, node('select')); select.dataset.referenceFilter = key;
    const all = node('option', 'Tous'); all.value = 'all'; select.append(all);
    const values = [...new Set(entries.map(entry => entry[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
    for (const value of values) { const option = node('option', REFERENCE_LABELS_V100[value] || value); option.value = value; select.append(option); }
    select.value = 'all'; controlsByKey[key] = select;
    select.addEventListener('change', () => { filters[key] = select.value; limit = 24; render(); });
  }
  const sort = field('Trier', node('select')); sort.dataset.referenceFilter = 'sort';
  for (const [value, label] of [['name', 'Nom'], ['lineage', 'Lignée'], ['stage', 'Stade']]) { const option = node('option', label); option.value = value; sort.append(option); }
  sort.addEventListener('change', () => { filters.sort = sort.value; render({ revealSelected: true }); });
  const altered = field('Altered uniquement', node('input')); altered.type = 'checkbox'; altered.dataset.referenceAltered = 'true';
  altered.addEventListener('change', () => { filters.alteredOnly = altered.checked; limit = 24; render(); });
  const reset = node('button', 'Réinitialiser les filtres', 'button'); reset.type = 'button'; reset.dataset.referenceReset = 'true';
  reset.addEventListener('click', () => {
    for (const key of Object.keys(controlsByKey)) { controlsByKey[key].value = 'all'; filters[key] = 'all'; }
    search.value = ''; filters.search = ''; sort.value = 'name'; filters.sort = 'name'; altered.checked = false; filters.alteredOnly = false; limit = 24; selectedId = null; render();
  }); controls.append(reset); section.append(controls);
  const count = node('p', '', 'eyebrow'); count.setAttribute('aria-live', 'polite'); count.dataset.referenceCount = 'true';
  const body = node('div', '', 'reference-library-v100__body');
  const left = node('div'); const grid = node('div', '', 'reference-library-v100__grid');
  const more = node('button', 'Afficher 24 images de plus', 'button'); more.type = 'button'; more.dataset.referenceMore = 'true';
  more.addEventListener('click', () => {
    const oldLimit = limit; limit += 24; renderList({ appendOnly: true });
    grid.children[oldLimit]?.querySelector('button')?.focus();
  });
  const detail = node('article', '', 'reference-library-v100__detail'); detail.tabIndex = -1; detail.dataset.referenceDetail = 'true';
  left.append(grid, more); body.append(left, detail); section.append(count, body);

  function focusDetail() {
    detail.focus({ preventScroll: true });
    // The mobile grid uses page scrolling, so bring the selected dossier into view.
    if (documentRef.defaultView?.matchMedia?.('(max-width: 780px)').matches)
      detail.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  function renderDetail() {
    detail.replaceChildren();
    delete detail.dataset.referenceId;
    const entry = visible.find(item => item.id === selectedId);
    if (!entry) { detail.append(node('p', 'Aucune image ne correspond aux filtres.')); return; }
    detail.dataset.referenceId = entry.id;
    detail.append(node('h4', entry.name + (entry.alteredOf && !/altered/i.test(entry.name) ? ' — Altered' : '')));
    const image = node('img'); image.src = entry.path; image.alt = entry.name; image.decoding = 'async';
    image.addEventListener('error', () => { image.hidden = true; detail.append(node('p', 'Original indisponible : fichier à restaurer, aucune image de remplacement.')); }, { once: true });
    const full = node('a'); full.href = entry.path; full.target = '_blank'; full.rel = 'noopener'; full.setAttribute('aria-label', `Ouvrir l’original entier : ${entry.name}`); full.append(image); detail.append(full);
    detail.append(node('p', 'RÉFÉRENCE ORIGINALE · PAS UN NOUVEAU SPRITE DE COMBAT', 'reference-library-v100__status'));
    const adaptation = getReferenceAdaptationV106(entry.id);
    const status = node('p', adaptation.status === 'existing-combat-pose' ? 'POSE PRÉEXISTANTE LIÉE — ORIGINAL ALTERED CONSERVÉ'
      : adaptation.status === 'combat-pose' ? 'DÉRIVÉ SÉPARÉ : POSE FIXE INTÉGRÉE AU MOTEUR'
      : adaptation.status === 'confinement-pose' ? 'DÉRIVÉ SÉPARÉ : BANC DE CONFINEMENT, HORS COMBAT'
        : 'ORIGINAL SEULEMENT : ADAPTATION NON ADMISE');
    status.dataset.referenceAdaptation = adaptation.status; detail.append(status);
    if (adaptation.art) {
      const cutout = node('a', 'Ouvrir la découpe native validée'); cutout.href = adaptation.art.path; cutout.target = '_blank'; cutout.rel = 'noopener'; detail.append(cutout);
      detail.append(node('p', adaptation.art.reviewNote));
      if (adaptation.profileId && onOpenEnemy) {
        const open = node('button', 'Voir la fiche intégrée', 'button'); open.type = 'button'; open.dataset.referenceAdmitted = adaptation.profileId;
        open.addEventListener('click', () => onOpenEnemy(adaptation.profileId)); detail.append(open);
      }
    }
    const facts = node('dl');
    for (const [label, value] of [['Fichier original', entry.sourceFile], ['Famille', REFERENCE_LABELS_V100[entry.biology] || entry.biology],
      ['Faction', REFERENCE_LABELS_V100[entry.faction] || entry.faction], ['Lignée', entry.lineage], ['Stade', REFERENCE_LABELS_V100[entry.stage] || entry.stage],
      ['Relation', entry.relationship], ['Original lié', entry.alteredOf], ['Empreinte SHA-256', entry.sourceSha256 || entry.sha256]]) {
      if (value) facts.append(node('dt', label), node('dd', value));
    } detail.append(facts);
    if (entry.visualNotes || entry.reason) detail.append(node('p', entry.visualNotes || entry.reason));
    const warnings = [...(entry.ambiguities || []), ...(entry.assetWarnings || [])];
    if (warnings.length) {
      detail.append(node('h5', 'Réserves de classement et de cadrage'));
      const list = node('ul'); for (const warning of warnings) list.append(node('li', warning)); detail.append(list);
    }
    if (entry.parentPhysicalSize) {
      const size = entry.parentPhysicalSize;
      const measurement = size.measurementType === 'axial-length' ? 'longueur axiale, pas hauteur' : 'hauteur selon posture';
      const target = size.targetMeters === null ? 'à mesurer' : `${size.targetMeters} m`;
      detail.append(node('p', `Repère candidat de l’original lié uniquement : ${target} (${measurement} ; posture de l’original : ${size.posture}). Repère non transférable à cette forme ou à ce stade : taille propre à mesurer. Proposition du 28/09/2026, non certifiée canonique ; aucune modification automatique des sprites ou des collisions.`));
    }
    detail.append(node('p', 'Le nom du fichier sert au classement. Il ne certifie ni une identité canonique ni une chaîne de reproduction.'));
    if (entry.alteredOf && onOpenEnemy) {
      const parent = node('button', 'Voir l’ennemi d’origine', 'button'); parent.type = 'button'; parent.dataset.referenceParent = entry.alteredOf;
      parent.addEventListener('click', () => onOpenEnemy(entry.alteredOf)); detail.append(parent);
    }
    const siblings = entries.filter(item => item.id !== entry.id && item.lineage === entry.lineage && item.lineage !== 'non-classée');
    if (siblings.length) {
      const label = node('label', 'Autre image de cette lignée'); const select = node('select'); select.setAttribute('aria-label', 'Autre image de cette lignée');
      const empty = node('option', 'Choisir une autre image…'); empty.value = ''; select.append(empty);
      for (const sibling of siblings) { const option = node('option', sibling.name); option.value = sibling.id; select.append(option); }
      select.addEventListener('change', () => {
        if (!select.value) return;
        // Reset incompatible filters so a sibling cannot become an invisible selection.
        reset.click(); selectedId = select.value; render({ revealSelected: true }); focusDetail();
      }); label.append(select); detail.append(label);
    }
  }
  function renderList({ appendOnly = false } = {}) {
    // Pagination keeps already loaded images and their focus/scroll position.
    const start = appendOnly ? grid.children.length : 0;
    if (!appendOnly) grid.replaceChildren();
    for (const entry of visible.slice(start, limit)) {
      const card = node('article'); const button = node('button'); button.type = 'button'; button.dataset.referenceEntry = entry.id;
      button.setAttribute('aria-pressed', String(entry.id === selectedId));
      const image = node('img'); image.src = entry.path; image.alt = ''; image.loading = 'lazy'; image.decoding = 'async';
      button.append(image, node('span', entry.name), node('small', entry.alteredOf ? 'Altered · original préservé' : entry.lineage));
      button.addEventListener('click', () => {
        selectedId = entry.id;
        for (const other of grid.querySelectorAll('[data-reference-entry]')) other.setAttribute('aria-pressed', String(other.dataset.referenceEntry === selectedId));
        renderDetail(); focusDetail();
      }); card.append(button); grid.append(card);
    }
    more.hidden = visible.length <= limit;
    count.textContent = `${visible.length} / ${entries.length} images · ${Math.min(limit, visible.length)} affichées · aucun remplacement`;
  }
  function render({ revealSelected = false } = {}) {
    visible = filterUserReferencesV100(entries, filters);
    const selectedIndex = visible.findIndex(item => item.id === selectedId);
    if (selectedIndex < 0 || (selectedIndex >= limit && !revealSelected)) selectedId = visible[0]?.id || null;
    if (selectedIndex >= limit && revealSelected) limit = Math.ceil((selectedIndex + 1) / 24) * 24;
    renderList(); grid.scrollTop = 0; renderDetail();
  }
  render(); return section;
}
