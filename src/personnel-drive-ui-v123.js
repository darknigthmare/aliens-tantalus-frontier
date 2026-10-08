import { buildPersonnelDriveVisualRegistryV123 } from './personnel-drive-visuals-v123.js';

const esc = value => String(value ?? '').replace(/[&<>"']/gu, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

/** The original board is contained, never cropped, recoloured or played as a cycle. */
export function renderPersonnelDriveGalleryV123(member, { compact = false } = {}) {
  if (!member?.archive || !member.unlocked) return '';
  const visuals = buildPersonnelDriveVisualRegistryV123(member.driveVisualsV123);
  if (!visuals.length) return '';
  const shown = compact ? visuals.slice(0, 1) : visuals;
  return `<section class="personnel-drive-gallery-v123${compact ? ' compact' : ''}" aria-label="Représentations d’archive de ${esc(member.name)}">
    <p class="personnel-drive-note-v123">${compact ? `${visuals.length} représentation(s) fournie(s)` : 'Planches originales fournies · représentations documentaires, non opérateurs jouables.'}</p>
    <div class="personnel-drive-boards-v123">${shown.map(visual => `<figure data-personnel-drive-v123="${esc(visual.id)}"><a href="${esc(visual.path)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir la planche originale : ${esc(visual.character)} · ${esc(visual.variant)}"><img src="${esc(visual.path)}" alt="Représentation visée : ${esc(visual.character)} · ${esc(visual.variant)} · fidélité non certifiée" width="${visual.width}" height="${visual.height}" loading="lazy"></a><figcaption><strong>${esc(visual.variant)}</strong>${compact ? '' : `<span>Source représentée : ${esc(visual.sourceWork)}</span><span>Identité visée ; ressemblance et fidélité 1:1 non certifiées.</span>${visual.auditNote ? `<span>${esc(visual.auditNote)}</span>` : ''}${visual.sourceUrl ? `<a href="${esc(visual.sourceUrl)}" target="_blank" rel="noopener noreferrer">Consulter la source documentaire</a>` : ''}`}</figcaption></figure>`).join('')}</div>
    ${compact ? '' : '<p class="personnel-drive-note-v123">Ces images ne modifient ni les personnages du Tantalus, ni la dotation, ni les collisions, ni les animations jouables. Les essais conservés ne constituent pas de nouvelles identités.</p>'}
  </section>`;
}
