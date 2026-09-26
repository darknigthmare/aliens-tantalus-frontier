import { USER_REFERENCE_ART_V95 } from './user-reference-art-v95.js';

// A cloud/reference effect is documentation, never an invented creature identity.
// Only reviewed native art is exposed; it has no health, spawn or damage contract.
export const USER_REFERENCE_GALLERY_V95 = Object.freeze(USER_REFERENCE_ART_V95
  .filter(art => ['effect', 'reference'].includes(art.kind) && art.reviewStatus === 'accepted-static-adaptation')
  .map(art => Object.freeze({ ...art, id: `${art.kind}-v95-user-${art.slug}`,
    visualMode: art.kind === 'effect' ? 'static-effect' : 'static-reference', animationStatus: 'missing', canonExact: false,
    gameplayStatus: 'reference-gallery-only', automaticEncounter: false })));
export const USER_REFERENCE_EFFECTS_V95 = Object.freeze(USER_REFERENCE_GALLERY_V95.filter(art => art.kind === 'effect'));

export function createUserReferenceEffectsGalleryV95(documentRef, { id = 'user-reference-effects-v95' } = {}) {
  if (!documentRef || !USER_REFERENCE_GALLERY_V95.length) return null;
  const node = (tag, text) => {
    const element = documentRef.createElement(tag);
    if (text) element.textContent = text;
    return element;
  };
  const section = node('section');
  section.id = id;
  section.className = 'panel user-reference-effects-v95';
  section.setAttribute('aria-label', 'Galerie de références, hors bestiaire');
  section.appendChild(node('h3', 'Galerie de références'));
  section.appendChild(node('p', 'Références consultables, hors bestiaire et hors file d’impression. Images fixes : aucune animation ni capacité de combat n’est revendiquée.'));
  const grid = node('div'); grid.className = 'catalog-grid';
  for (const effect of USER_REFERENCE_GALLERY_V95) {
    const card = node('article'); card.className = 'catalog-card'; card.dataset.referenceEffectV95 = effect.id;
    const preview = node('img');
    preview.src = effect.path; preview.alt = effect.name; preview.loading = 'lazy';
    preview.width = 220; preview.height = 150; preview.style.objectFit = 'contain';
    card.appendChild(preview);
    card.appendChild(node('h4', effect.name));
    card.appendChild(node('p', effect.kind === 'reference'
      ? 'Identité à confirmer · référence uniquement · hors impression'
      : 'RÉFÉRENCE ENVIRONNEMENTALE · PAS UN ENNEMI · POSE FIXE'));
    card.appendChild(node('p', effect.kind === 'reference'
      ? 'Rattachement au bestiaire en attente de confirmation : aucun doublon de l’identité existante n’est créé.'
      : 'Effet visuel consultable : aucune contamination ni aucun danger actif n’est revendiqué.'));
    card.appendChild(node('p', effect.referenceNote || 'Référence utilisateur adaptée au projet, canon non certifié.'));
    grid.appendChild(card);
  }
  section.appendChild(grid);
  return section;
}
