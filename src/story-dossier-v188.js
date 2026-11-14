// V188 — the QZ17 dossier (`story-dossier`, bible §5.7) and the final choice
// (§5.7.1). Pure: every piece is read from state the game already records;
// nothing is granted by a cinematic or a dialogue.
import { normalizeStoryCampaignV188 } from './story-campaign-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const has = (list, id) => Array.isArray(list) && list.includes(id);

export const DOSSIER_PIECES_V188 = Object.freeze([
  Object.freeze({ id: 'pda-email', source: 'act-1', label: t('Contradiction PDA / courriel', 'PDA / email contradiction'),
    held: save => Boolean(save?.narrativeArchives?.discovered?.['qz17-pda-loading-chief'] && save?.narrativeArchives?.discovered?.['qz17-email-logistics-denial']) }),
  Object.freeze({ id: 'seal-or-cradle', source: 'act-1', label: t('Fragment de sceau ou berceau ouvert', 'Seal fragment or opened cradle'),
    held: save => has(save?.narrativeArchives?.unlockedFlags, 'qz17-maintenance-bypass') || has(save?.narrativeArchives?.unlockedFlags, 'qz17-quarantine-lock') }),
  Object.freeze({ id: 'priority-1843', source: 'act-2', label: t('Priorité de fret à 18:43 autorisée depuis Asphodèle', 'Freight priority at 18:43 authorised from Asphodèle'),
    held: save => save?.archiveRelayArchivesV122?.case?.verdict === 'delayed-distress' && has(normalizeStoryCampaignV188(save?.storyCampaignV188).cinematicsSeen, 'cin-20-rook') }),
  Object.freeze({ id: 'bishop-directive', source: 'interlude', label: t('Directive de préservation de BISHOP-9', 'BISHOP-9’s preservation directive'),
    held: save => normalizeStoryCampaignV188(save?.storyCampaignV188).interlude?.phase === 'resolved' }),
  Object.freeze({ id: 'depot-cradles', source: 'act-4', label: t('Berceaux et cocons du dépôt', 'Depot cradles and cocoons'),
    held: save => has(save?.galaxy?.completedCampaignIds, 'special-black-cocoon') }),
  // Not playable yet: Asphodèle station (S2) and the colony annex "Ce que le quai a vu".
  Object.freeze({ id: 'cassius-orders', source: 'station-s2', label: t('Ordres de livraison archivés par CASSIUS', 'Delivery orders archived by CASSIUS'), held: () => false, unavailable: true }),
  Object.freeze({ id: 'wren-testimony', source: 'colony-a-quai', label: t('Témoignage de Tomas Wren', 'Tomas Wren’s testimony'), held: () => false, unavailable: true })
]);

export function storyDossierV188(save, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr';
  const pieces = DOSSIER_PIECES_V188.map(piece => Object.freeze({ id: piece.id, source: piece.source, label: piece.label[lang],
    held: Boolean(piece.held(save)), unavailable: Boolean(piece.unavailable) }));
  const count = pieces.filter(piece => piece.held).length;
  // Validated 2026-11-05: the badge signer is established only with 6 pieces out of 7.
  return Object.freeze({ pieces: Object.freeze(pieces), count, total: pieces.length, signerEstablished: count >= 6 });
}

// —— Final choice (§5.7.1) ——
export const FINAL_OPTIONS_V188 = Object.freeze({
  transmit: Object.freeze({ id: 'transmit', ending: 'relay-speaks', label: t('Transmettre', 'Transmit') }),
  hold: Object.freeze({ id: 'hold', ending: 'living-without-proof', label: t('Tenir la colonie', 'Hold the colony') }),
  cede: Object.freeze({ id: 'cede', ending: 'freight-first', label: t('Céder le dépôt', 'Cede the depot') })
});
export const ENDINGS_V188 = Object.freeze({
  'relay-speaks': t('Le relais parle', 'The relay speaks'),
  'freight-first': t('Le fret d’abord', 'Freight first'),
  'living-without-proof': t('Les vivants, sans preuve', 'The living, without proof')
});

/** Options open at the war council. Asphodèle (S4) and its relay room do not exist yet. */
export function finalChoiceOptionsV188(save, { asphodeleRetaken = false, relayRoomOpen = false } = {}) {
  const dossier = storyDossierV188(save), story = normalizeStoryCampaignV188(save?.storyCampaignV188);
  const options = [];
  if (asphodeleRetaken && relayRoomOpen && dossier.count >= 5) options.push({ ...FINAL_OPTIONS_V188.transmit });
  options.push({ ...FINAL_OPTIONS_V188.hold, recoveryAttemptAboard: story.interlude?.outcome === 'captured' });
  options.push({ ...FINAL_OPTIONS_V188.cede, restitution: (story.m577Manifest?.containers || 0) >= 2 });
  return Object.freeze({ dossier, options: Object.freeze(options) });
}

/** Vega follows Echo-9 when her trust is at least "operationnel" (loyalty >= 55,
 * NPC_TRUST_LEVELS_V62 bands); otherwise she decides from the dossier.
 * With >= 5 pieces but no safe channel, she holds the colony [PROPOSÉ]. */
export function resolveFinalChoiceV188(save, recommended, context = {}) {
  const { dossier, options } = finalChoiceOptionsV188(save, context);
  const vega = save?.crew?.find?.(member => member.id === 'crew-01-mara-vega');
  const followed = Number(vega?.loyalty) >= 55 && options.some(option => option.id === recommended);
  let chosen = followed ? recommended : dossier.count >= 5 ? (options.some(option => option.id === 'transmit') ? 'transmit' : 'hold') : 'cede';
  if (!options.some(option => option.id === chosen)) chosen = 'hold';
  return Object.freeze({ option: chosen, ending: FINAL_OPTIONS_V188[chosen].ending, decidedBy: followed ? 'echo-9' : 'vega', dossierCount: dossier.count });
}
