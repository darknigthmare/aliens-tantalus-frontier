import { PERSONNEL_DRIVE_VISUAL_DATA_V123 } from './personnel-drive-data-v123.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const text = (value, max = 600) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const slug = value => text(value).normalize('NFD').replace(/[\u0300-\u036f]/gu, '').toLowerCase()
  .replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 100);
const CATEGORIES = new Set(['film', 'short', 'novel-audio', 'game', 'comic', 'documentary-antagonist']);
const disputedIdentity = value => /non[- _]*attest|identite[- _]*determinee|attributions[- _]*non[- _]*validees|rejetee/iu
  .test(text(value).normalize('NFD').replace(/[\u0300-\u036f]/gu, ''));

/** Provenance links are public references, never private download credentials. */
function publicSourceUrlV123(value) {
  if (typeof value !== 'string' || value.length > 2048 || !/^https:\/\/[^\s"<>\\]+$/u.test(value)) return null;
  let url; try { url = new URL(value); } catch { return null; }
  const host = url.hostname.toLowerCase().replace(/\.$/u, '');
  // Restrict references to DNS names: literal IPs and local/intranet suffixes
  // cannot be certified as public documentary sources by this static import.
  if (url.protocol !== 'https:' || url.username || url.password
    || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z](?:[a-z0-9-]*[a-z0-9])?$/u.test(host)
    || /(?:^|\.)(?:localhost|local|internal|intranet|lan|home|test|invalid|example)$/u.test(host)
    || /(?:^|\.)(?:(?:drive|docs)\.google\.com|chatgpt\.com|chat\.openai\.com|oaiusercontent\.com|sediment\.io)$/u.test(host)) return null;
  const sensitiveKey = key => /(?:^|[-_])(?:token|auth|authorization|signature|credential|credentials|secret|sig|key|apikey)(?:$|[-_])/iu.test(key)
    || /^(?:(?:access|refresh|id|security)token|auth(?:key|code)|signaturekey)$/iu.test(key);
  const keys = [...url.searchParams.keys(), ...new URLSearchParams(url.hash.slice(1)).keys()];
  if (keys.some(sensitiveKey)) return null;
  return url.href;
}

/** Documentary assets do not become actors, cosmetic skins or admitted animations. */
export function validatePersonnelDriveVisualV123(raw) {
  if (!raw || typeof raw !== 'object' || !/^[a-z0-9][a-z0-9-]{2,140}$/u.test(raw.id || '')
    || !/^\/assets\/user\/drive-v123\/personnel\/[a-z0-9-]+\.png$/u.test(raw.path || '')
    || !/^[a-f0-9]{64}$/u.test(raw.sha256 || '') || !Number.isSafeInteger(raw.bytes) || raw.bytes <= 0
    || !Number.isInteger(raw.width) || !Number.isInteger(raw.height) || raw.width < 1 || raw.height < 1
    || raw.width > 16384 || raw.height > 16384 || raw.identityStatus !== 'intended-identity-not-likeness-certified'
    || raw.admission !== 'documentary-reference-only' || raw.originalPixelsModified !== false || !CATEGORIES.has(raw.category)
    || raw.clippedAtCanvas === true || raw.identityDisputed === true
    || [raw.character, raw.sourceWork, raw.variant].some(disputedIdentity)
    || !text(raw.character, 120) || !text(raw.sourceWork, 160) || !text(raw.variant, 160)) return null;
  const dossierId = /^personnel-archive-[a-z0-9-]+$/u.test(raw.dossierId || '') ? raw.dossierId : null;
  const sourceUrl = publicSourceUrlV123(raw.sourceUrl);
  return freeze({ id: raw.id, path: raw.path, sha256: raw.sha256, bytes: raw.bytes,
    width: raw.width, height: raw.height, character: text(raw.character, 120), sourceWork: text(raw.sourceWork, 160),
    variant: text(raw.variant, 160), category: raw.category, dossierId, sourceUrl,
    auditNote: text(raw.auditNote), identityStatus: raw.identityStatus, admission: raw.admission,
    species: ['human', 'synthetic'].includes(raw.species) ? raw.species : 'unspecified',
    presentation: 'original-reference-board', originalPixelsModified: false,
    fidelity: 'not-certified-1:1', animationStatus: 'not-admitted-as-gameplay-animation', playable: false });
}

export function buildPersonnelDriveVisualRegistryV123(rawEntries = []) {
  const ids = new Set(), paths = new Set(), hashes = new Set();
  return freeze((Array.isArray(rawEntries) ? rawEntries : []).flatMap(raw => {
    const entry = validatePersonnelDriveVisualV123(raw);
    if (!entry || ids.has(entry.id) || paths.has(entry.path) || hashes.has(entry.sha256)) return [];
    ids.add(entry.id); paths.add(entry.path); hashes.add(entry.sha256);
    return [entry];
  }));
}

export const PERSONNEL_DRIVE_VISUALS_V123 = buildPersonnelDriveVisualRegistryV123(PERSONNEL_DRIVE_VISUAL_DATA_V123);

export function getPersonnelDriveVisualsV123(dossierId, registry = PERSONNEL_DRIVE_VISUALS_V123) {
  if (typeof dossierId !== 'string' || !/^personnel-archive-[a-z0-9-]+$/u.test(dossierId)) return [];
  return registry.filter(entry => entry.dossierId === dossierId);
}

/** Additional source records are consultable documents, not fabricated MIRE victories. */
export function getPersonnelDriveDocumentariesV123(registry = PERSONNEL_DRIVE_VISUALS_V123) {
  const groups = new Map();
  for (const entry of registry) {
    if (entry.dossierId) continue;
    const key = `${slug(entry.character)}--${slug(entry.sourceWork)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return [...groups.entries()].map(([key, visuals]) => {
    const first = visuals[0];
    return { id: `personnel-drive-document-${key}`, name: first.character, species: first.species,
      archive: true, documentaryV123: true, unlocked: true, selected: false, canSelect: false,
      presenceMode: 'documentary-reference', presenceScope: 'archive-only', playable: false,
      recruitmentAllowed: false, signatureAbility: null, portrait: null, sprite: null,
      artStatus: 'imported-documentary-reference-not-gameplay-sprite',
      role: first.category === 'documentary-antagonist' ? 'Sujet antagoniste documenté' : 'Sujet d’archive',
      specialty: 'Représentations fournies, sans capacité accordée', era: 'Période de l’œuvre source',
      sourceWork: first.sourceWork, sourceWorks: [first.sourceWork], aptitudes: null, equipment: [], evidence: [],
      chronology: 'Collection documentaire isolée de la continuité Frontier. Aucune présence physique, recrutement ou survie supplémentaire déduite.',
      summary: 'Les identités indiquent les sujets visés par les visuels fournis. Visages, vêtements et équipements restent des interprétations, sans certification de fidélité 1:1.',
      status: 'Collection documentaire', conditionLabel: 'Consultation documentaire ; aucune reconstitution MIRE n’est déclarée réussie par cet import.',
      radioReaction: null, reference: first.sourceUrl ? { title: first.sourceWork, url: first.sourceUrl } : null,
      driveVisualsV123: visuals };
  });
}

export function personnelDriveCoverageV123(registry = PERSONNEL_DRIVE_VISUALS_V123) {
  return { referenceCount: registry.length,
    existingDossiersIllustrated: new Set(registry.map(entry => entry.dossierId).filter(Boolean)).size,
    additionalDocumentaries: getPersonnelDriveDocumentariesV123(registry).length,
    playableAdded: 0, animationsAdded: 0, exactCertified: 0 };
}
