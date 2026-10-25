import { restoreMissionInsertionV62 } from './mission-insertion-v62.js';
import { BLACK_COCOON_CAMPAIGN_V121 } from './black-cocoon-state-v121.js';
import { C12_HORDE_CAMPAIGN_V121 } from './c12-horde-state-v121.js';

// Authored project fiction attached to the two existing playable operations.
// These transmissions do not reconstruct the absent Blackout/Earth archives.
const campaigns = new Map([BLACK_COCOON_CAMPAIGN_V121, C12_HORDE_CAMPAIGN_V121].map(c => [c.id, c]));
const line = (speaker, text) => Object.freeze({ speaker, text });
const scene = (title, location, objective, ...lines) => Object.freeze({ title, location, objective, lines: Object.freeze(lines) });
const SCENES = Object.freeze({
  'special-c12-horde': Object.freeze({
    briefing: scene('Une sortie plutôt qu’une victoire', 'TANTALUS · CENTRE DE COMMANDE',
      'Rétablir l’ascenseur C-12, tenir le délai de remise en service puis rejoindre le sas.',
      line('Rook · liaison reconnaissance', 'Le corridor du convoi mène au complexe, mais C-12 ne reste pas ouvert. La panne de l’ascenseur coupe notre repli.'),
      line('MU/TH/UR', 'Ordre de mission : rétablissement local et évacuation. Le nombre d’assaillants abattus n’est pas une autorisation de prolonger le contact.')),
    preparation: scene('Préparer le moment de repartir', 'TANTALUS · ARMURERIE DE DÉPART',
      'Choisir le point à examiner au retour. Le relais ouvre la séquence ; les réserves se trouvent près de lui.',
      line('Echo-9', 'Je prends les réserves au relais. Si la masse m’oblige à reculer, je garde la passerelle comme seconde ligne.'),
      line('Inez Harlow · liaison science', 'Le bilan distinguera la remise en service et l’évacuation. Une caisse retrouvée ne prouve pas que le sas est franchi.')),
    approach: scene('Le sas derrière la ligne', 'LETHE · ACCÈS C-12',
      'Rejoindre le relais et maintenir E pour engager le rétablissement.',
      line('Rook · liaison reconnaissance', 'Entrée à gauche, relais au centre, évacuation à droite. Les arrivées hautes utilisent un autre axe : ne restez pas fixé sur le sol.'),
      line('Echo-9', 'Je repère d’abord le repli. Je n’attends pas le dernier contact pour chercher la sortie.')),
    deployment: scene('Le compte à rebours utile', 'C-12 · PALIER DE MAINTENANCE',
      'Activer le relais, puis tenir ou se déplacer pendant les 45 secondes de rétablissement.',
      line('MU/TH/UR', 'Après activation : quatre secondes d’avertissement. Le rétablissement demande ensuite quarante-cinq secondes.'),
      line('Rook · liaison reconnaissance', 'Tirez pour dégager votre axe et rechargez à couvert. La mission n’exige pas de supprimer tous les contacts.')),
    'player-control': scene('Quitter la zone au bon moment', 'C-12 · CONTRÔLE TACTIQUE',
      'Quand l’ascenseur est disponible, gagner le sas à droite et maintenir E pendant deux secondes.',
      line('Echo-9', 'Relais, délai, sas. La caisse de l’alcôve reste facultative ; je ne confonds pas récupération et extraction.'),
      line('MU/TH/UR', 'Le retour sera confirmé par le sas refermé. Les relevés interrompus resteront des relevés partiels.'))
  }),
  'special-black-cocoon': Object.freeze({
    briefing: scene('Une liaison a disparu', 'TANTALUS · DOSSIER DE RÉCUPÉRATION',
      'Reprendre le contrôle depuis la galerie de la ruche, récupérer le matériel et établir une liaison.',
      line('MU/TH/UR', 'Dernière liaison reçue depuis les galeries de Lethe. Le dossier reprend au premier signe de conscience de l’opérateur ; sa capture n’a pas de témoin exploitable.'),
      line('Inez Harlow · liaison science', 'Nous préparerons le contrôle biologique si un transport revient. Nous ne certifierons aucun retour sur la seule émission d’un appel.')),
    preparation: scene('Les limites de la récupération', 'TANTALUS · LIAISON DE SECOURS',
      'Choisir le point du compte rendu : trajet d’exfiltration ou contrôle biologique au retour.',
      line('Rook · liaison reconnaissance', 'Le signal se perd sous la surface. Au rétablissement du relais, nous vérifierons les sorties et la zone d’approche.'),
      line('Echo-9', 'Si j’atteins le transport, mes armes iront au râtelier avant le scanner. Le retour au bord doit être contrôlé jusqu’au bout.')),
    approach: scene('Au plus près de la résine', 'LETHE · GALERIES COLONISÉES',
      'Maintenir E pour couper la résine ; forcer avec F produit davantage de bruit.',
      line('Echo-9', 'Je suis vivant. Je cherche un appui et je coupe assez pour me dégager, sans m’épuiser à lutter contre toute la paroi.'),
      line('MU/TH/UR', 'Liaison indisponible. Les instructions conservées dans l’équipement restent locales jusqu’au rétablissement du relais.')),
    deployment: scene('Reprendre des moyens avant de courir', 'LETHE · GALERIE BASSE',
      'Après la libération, rejoindre le sac de récupération, puis le relais dans les tunnels est.',
      line('Echo-9', 'Le sac d’abord. Je reste bas dans les galeries et je garde le trajet de retour en vue.'),
      line('Rook · message de liaison conservé', 'Au prochain contact : batterie discrète sur la passerelle ou générateur au relais. Ensuite seulement, chercher une sortie praticable.')),
    'player-control': scene('Chaque confirmation compte', 'COCON NOIR · CONTRÔLE TACTIQUE',
      'Rétablir la liaison, ouvrir une sortie, rejoindre Kappa puis terminer le contrôle biologique à bord.',
      line('MU/TH/UR', 'La sortie industrielle et le circuit de refroidissement mènent à la surface. Le contrôleur du transport confirmera la zone utilisable.'),
      line('Echo-9', 'Une balise n’est pas un embarquement. Je garde assez de moyens pour la rampe, puis pour rejoindre le scanner.'))
  })
});
export const LETHE_STORY_PROTOCOLS_V163 = Object.freeze({
  'special-c12-horde': Object.freeze([
    Object.freeze({ id: 'lift-review', label: 'Bilan de l’ascenseur', description: 'Relire le rétablissement et la confirmation de repli.' }),
    Object.freeze({ id: 'pressure-review', label: 'Bilan des axes', description: 'Relire les contacts réellement émis et les réserves récupérées.' })
  ]),
  'special-black-cocoon': Object.freeze([
    Object.freeze({ id: 'route-review', label: 'Trajet d’exfiltration', description: 'Relire l’alimentation, la sortie choisie et l’approche du transport.' }),
    Object.freeze({ id: 'quarantine-review', label: 'Contrôle du retour', description: 'Relire l’embarquement, le dépôt des armes et le contrôle biologique.' })
  ])
});
export const hasCampaignStoryV163 = campaignId => campaigns.has(campaignId);
function insertionFor(value) {
  try {
    const state = restoreMissionInsertionV62(value), campaign = campaigns.get(state.campaignId);
    return campaign && state.worldId === campaign.worldId ? state : null;
  } catch { return null; }
}
export function letheStoryProtocolV163(value) {
  const state = insertionFor(value), raw = state?.phases.find(p => p.kind === 'preparation')?.payload?.letheStoryV163;
  return raw?.schema === 163 && raw.operationId === state.operationId && raw.campaignId === state.campaignId
    ? LETHE_STORY_PROTOCOLS_V163[state.campaignId].find(p => p.id === raw.protocolId) || null : null;
}
export function chooseLetheStoryProtocolV163(value, protocolId, { now = 0 } = {}) {
  const state = insertionFor(value), protocol = state && LETHE_STORY_PROTOCOLS_V163[state.campaignId].find(p => p.id === protocolId);
  if (!state || !protocol) return { ok: false, reason: 'protocol-unavailable' };
  if (state.status !== 'active' || state.paused || state.phases[state.currentIndex].kind !== 'preparation')
    return { ok: false, reason: 'preparation-inactive' };
  if (letheStoryProtocolV163(state)?.id === protocolId) return { ok: true, changed: false, state };
  state.phases[state.currentIndex].payload.letheStoryV163 = {
    schema: 163, operationId: state.operationId, campaignId: state.campaignId, protocolId
  };
  if (Number.isFinite(now) && now >= state.updatedAt) state.updatedAt = now;
  return { ok: true, changed: true, state, protocol };
}
export function campaignInsertionStoryV163(value) {
  const state = insertionFor(value), authored = state && SCENES[state.campaignId][state.phases[state.currentIndex]?.kind];
  if (!authored) return null;
  return { id: `lethe-${state.campaignId.slice(8)}`, provenance: 'tantalus-project-original', canonExact: false,
    campaignName: campaigns.get(state.campaignId).name, ...authored, protocol: letheStoryProtocolV163(state),
    choices: LETHE_STORY_PROTOCOLS_V163[state.campaignId],
    canChoose: state.status === 'active' && !state.paused && state.phases[state.currentIndex].kind === 'preparation',
    protocolNotice: 'Compte rendu standard. Le point choisi guide les questions au retour ; il ne change ni les objectifs ni les récompenses.' };
}
