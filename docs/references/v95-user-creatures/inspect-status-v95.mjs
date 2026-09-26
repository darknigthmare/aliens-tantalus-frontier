import { readFile } from 'node:fs/promises';
import { USER_REFERENCE_ART_V95 as arts } from '../../../src/user-reference-art-v95.js';
import { ENEMY_USER_CREATIONS_V95 as enemies } from '../../../src/enemy-user-creations-v95.js';
import { USER_EQUIPMENT_ART_V95 as equipment } from '../../../src/user-equipment-art-v95.js';
import { ENEMY_HISTORICAL_VARIANTS_V95 as historicalVariants } from '../../../src/enemy-historical-variants-v95.js';

// Read-only, derived status: neither receipt text nor a queued prompt counts as delivery.
const read = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const inventory = await read('INVENTORY.json');
const receiptNames = ['generation-a.json', 'generation-b.json', 'generation-root-20260926.json', 'generation-root-final.json', 'generation-quality-25-20260926.json'];
const attempts = (await Promise.all(receiptNames.map(async receiptFile => (await read(receiptFile))
  .map(attempt => ({ ...attempt, receiptFile }))))).flat();
// Extra colour art requested later is not an 80th source in the original archive.
const historicalColourVariants = Object.entries(historicalVariants).map(([profileId, family]) => ({
  profileId, defaultStateId: family.defaultStateId, referenceUrl: family.reference.url,
  states: family.states.map(({ stateId, label, path, sha256, provenance }) => ({ stateId, label, path, sha256, provenance }))
}));
const additionalHistoricalVariantPngs = new Set(historicalColourVariants.flatMap(family => family.states)
  .filter(state => state.path.startsWith('/assets/openai/sprites/static-enemy-v95/') && !arts.some(art => art.path === state.path))
  .map(state => state.path)).size;
const entries = inventory.entries.map(source => {
  const art = arts.find(a => a.referenceFiles.some(ref => ref.file === source.file));
  const parent = art && enemies.find(e => e.path === art.path || e.states.some(s => s.path === art.path));
  const gear = art && equipment.find(e => e.path === art.path);
  // Later receipts supersede earlier attempts without erasing their provenance.
  const receipt = attempts.findLast(a => (a.sourceNumber ?? a.number) === source.number);
  const decision = (receipt?.status || receipt?.decision || 'pending').replaceAll('_', '-');
  const blocked = /moderation|blocked|refus/i.test(decision) || /moderation_blocked/.test(receipt?.error || '');
  const priorScopeHold = decision === 'held-prior-moderation-scope-review' || [57, 74].includes(source.number);
  return {
    sourceNumber: source.number, file: source.file, sourceSha256: source.sha256,
    status: art ? (art.sourceNumber !== source.number ? 'linked-source-variant' : parent && art.path !== parent.path ? 'admitted-visual-variant' : art.kind === 'armor' ? 'admitted-enemy-and-equipment' : art.kind === 'weapon' ? 'admitted-equipment' : art.kind === 'effect' ? 'admitted-gallery-effect' : art.kind === 'reference' ? 'gallery-reference-pending-identity-review' : 'admitted-enemy') : priorScopeHold ? 'held-prior-moderation-scope-review' : blocked ? 'held-moderation' : /^(held|rejected)-visual-quality$/.test(decision) ? 'held-visual-quality' : 'pending',
    ...(art ? { asset: art.path, assetSha256: art.sha256, parentId: parent?.id || null, equipmentId: gear?.id || null, referenceNote: art.referenceNote } : {}),
    ...(art?.kind === 'reference' ? { identityStatus: art.identityStatus, legacyCandidateIds: art.legacyCandidateIds, note: 'PNG visible en galerie. Choix utilisateur requis avant duplication ou rattachement à une identité existante ; hors impression et campagne.' } : {}),
    ...(!art && (priorScopeHold || /visual-quality/.test(decision)) ? { decision: priorScopeHold ? 'held-prior-moderation-scope-review' : decision, retry: false, note: receipt?.reason || receipt?.notes || receipt?.review || (source.number === 74 ? 'Recoupement visuel avec le périmètre Spitter AFE déjà refusé ; aucun nouvel appel ni reformulation. Voir RUNTIME-REVIEW-20260926.json.' : 'Non admis ; pas de remplacement générique.') } : {}),
    ...(blocked && !priorScopeHold ? { decision, retry: false, receipt: receipt.receiptFile } : {})
  };
});
console.log(JSON.stringify({
  date: '2026-09-26', status: entries.some(e => e.status === 'pending') ? 'in-progress' : arts.some(a => a.kind === 'reference') ? 'processed-with-holds-and-identity-review' : 'complete-with-held-references',
  counts: { sources: entries.length, admittedSourceFiles: entries.filter(e => e.asset).length,
    nativePngs: arts.length, additionalHistoricalVariantPngs, totalNewNativePngs: arts.length + additionalHistoricalVariantPngs,
    newEnemyIdentities: enemies.length, alternatePoses: enemies.reduce((n,e)=>n+e.states.length,0),
    equipment: equipment.length, galleryEffects: arts.filter(e=>e.kind==='effect').length,
    galleryIdentityReviews: arts.filter(e=>e.kind==='reference').length,
    held: entries.filter(e=>e.status.startsWith('held')).length, pending: entries.filter(e=>e.status==='pending').length,
    existingStaticPosesPreserved: 43, historicalProfilesPreserved: 571 },
  animationStatus: 'static-poses-only', commit: false, push: false, deployment: false, historicalColourVariants, entries
}, null, 2));
