// V188 — Asphodèle station front, first playable version (bible §7.2, §7.4;
// owner Q6: S1-S4 as missions before the hub; Q7: the CASSIUS choice is taken
// once; spec 005). Pure rules and data, no DOM. Mission completion is read from
// `galaxy.completedCampaignIds` (single source of truth); the additive save
// field `stationV188` only holds what no other record does: the intro heard,
// the CASSIUS decision and the return scenes already shown.
// Values marked [PROPOSÉ] are recorded in bible §7.5.

const t = (fr, en) => Object.freeze({ fr, en });
const has = (list, id) => Array.isArray(list) && list.includes(id);

export const STATION_WORLD_ID_V188 = 'world-05-lethe'; // Asphodèle orbits Cocyte
export const STATION_ACT_TWO_ID_V188 = 'special-archive-relay';
export const STATION_INTRO_ID_V188 = 'station-intro-silence';

const mission = (id, name, objective, registerV188, summary, description) => Object.freeze({
  id, pairId: null, mode: 'FRONTIER', name, source: 'Tantalus Frontier', worldId: STATION_WORLD_ID_V188, objective,
  year: 2204, canon: 'project-continuity', routes: 2, templateId: 'ship-interior-vertical', registerV188,
  stationArcV188: true, summary, description
});

// Ids, titles, objectives and registers come from bible §7.2 and §0.3.
export const STATION_CAMPAIGNS_V188 = Object.freeze([
  mission('station-s1', 'ASPHODÈLE · L’ARRIMAGE', 'board a drifting vessel', 'horror',
    'Abordage de la station par le sas où le dropship d’Echo-8 est resté amarré.',
    'La station tourne feux éteints. Entrer par le sas d’Echo-8, franchir les barricades de l’équipe perdue et atteindre le pont de contrôle. Les ventilateurs saturent le détecteur.'),
  mission('station-s2', 'ASPHODÈLE · LA VOIX DE CASSIUS', 'restore atmospheric processing', 'tension',
    'Rétablir l’énergie et l’air avec Idris Kwan à la radio, puis interroger CASSIUS.',
    'Relancer le traitement atmosphérique secteur par secteur. CASSIUS répond quand le pont de contrôle revient : il cite ses consignes et garde les ordres de livraison QZ17.'),
  mission('station-s3', 'ASPHODÈLE · LES PONTS SCELLÉS', 'escape the quarantine', 'horror',
    'Descendre dans les ponts inférieurs scellés : laboratoire de transit, berceaux ouverts, traces d’Echo-8.',
    'Derrière les cloisons scellées : le laboratoire de transit, des berceaux QZ17 ouverts et la dernière position d’Echo-8. Sortir avant que la quarantaine ne se referme.'),
  mission('station-s4', 'ASPHODÈLE · LE HUB ASPHODÈLE', 'hold the extraction zone', 'action',
    'Dernière purge et remise en pression, jusqu’à l’arrivée des premiers occupants.',
    'Purger le dernier nid, remettre la station en pression et tenir le quai jusqu’à l’arrivée de l’équipe technique du Tantalus.')
]);
export const STATION_CAMPAIGN_IDS_V188 = Object.freeze(STATION_CAMPAIGNS_V188.map(entry => entry.id));
const ORDER = STATION_CAMPAIGN_IDS_V188;

export const CASSIUS_CHOICES_V188 = Object.freeze(['rewrite', 'restrain', 'erase']);
// [PROPOSÉ] Effect on Cocyte when the choice is taken (bible §7.2 table, adapted).
// Rewritten, CASSIUS lifts the red quarantine it still enforces; restrained, it
// stops renewing it; erased, the station runs by hand and nothing changes.
export const CASSIUS_EFFECTS_V188 = Object.freeze({
  rewrite: Object.freeze({ quarantine: -6, stability: 3 }),
  restrain: Object.freeze({ quarantine: -3, stability: 0 }),
  erase: Object.freeze({ quarantine: 0, stability: 0 })
});
const SCENE_IDS = Object.freeze(['s1', 's3', 's4']);

export function createStationV188() { return { schema: 188, introHeard: false, cassius: null, scenesSeen: [] }; }
export function normalizeStationV188(raw) {
  const base = createStationV188();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  base.introHeard = raw.introHeard === true;
  base.cassius = CASSIUS_CHOICES_V188.includes(raw.cassius) ? raw.cassius : null;
  base.scenesSeen = Array.isArray(raw.scenesSeen) ? [...new Set(raw.scenesSeen.filter(id => SCENE_IDS.includes(id)))] : [];
  return base;
}

const completed = save => Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
export const isStationCampaignV188 = campaign => STATION_CAMPAIGN_IDS_V188.includes(typeof campaign === 'string' ? campaign : campaign?.id);

/** The intro can be heard once Act II is over (bible §7.2 « Après Acte II »). */
export function stationIntroAvailableV188(save) { return has(completed(save), STATION_ACT_TWO_ID_V188); }

/** Why a station mission cannot be launched yet, or null when it can. */
export function stationLockReasonV188(save, campaignId) {
  const index = ORDER.indexOf(campaignId);
  if (index < 0) return null;
  const station = normalizeStationV188(save?.stationV188), done = completed(save);
  if (!stationIntroAvailableV188(save)) return 'act-two';
  if (!station.introHeard) return 'intro';
  if (index > 0 && !done.includes(ORDER[index - 1])) return 'previous';
  if (index >= 2 && !station.cassius) return 'cassius';
  return null;
}
export function stationCampaignUnlockedV188(save, campaign) {
  const id = typeof campaign === 'string' ? campaign : campaign?.id;
  return !isStationCampaignV188(id) || stationLockReasonV188(save, id) === null;
}
/** Filter for every player list of campaigns: a locked station mission is not offered. */
export function filterUnlockedCampaignsV188(save, campaigns) {
  const active = save?.strategy?.currentOperation?.campaignId;
  return campaigns.filter(campaign => campaign.id === active || stationCampaignUnlockedV188(save, campaign));
}

export function markStationIntroHeardV188(save) {
  if (!save || !stationIntroAvailableV188(save)) return false;
  const station = normalizeStationV188(save.stationV188);
  if (station.introHeard) { save.stationV188 = station; return false; }
  station.introHeard = true; save.stationV188 = station; return true;
}

/** After S2: the CASSIUS decision is due until it is taken (it cannot be dismissed). */
export function cassiusChoicePendingV188(save) {
  return has(completed(save), 'station-s2') && !normalizeStationV188(save?.stationV188).cassius;
}
/** Mutates the candidate save, once (Q7). Returns the effect applied or null. */
export function chooseCassiusV188(save, choice) {
  if (!CASSIUS_CHOICES_V188.includes(choice) || !cassiusChoicePendingV188(save)) return null;
  const station = normalizeStationV188(save.stationV188);
  station.cassius = choice; save.stationV188 = station;
  const effect = CASSIUS_EFFECTS_V188[choice], world = save.galaxy?.worldState?.[STATION_WORLD_ID_V188];
  if (world) {
    if (Number.isFinite(world.quarantine)) world.quarantine = Math.max(0, Math.min(100, world.quarantine + effect.quarantine));
    if (Number.isFinite(world.stability)) world.stability = Math.max(0, Math.min(100, world.stability + effect.stability));
  }
  return effect;
}

/** The next return scene to show (s1, s3, s4) after its mission, or null. */
export function stationReturnSceneDueV188(save) {
  const station = normalizeStationV188(save?.stationV188), done = completed(save);
  return SCENE_IDS.find(id => done.includes(`station-${id}`) && !station.scenesSeen.includes(id)) || null;
}
export function markStationSceneSeenV188(save, sceneId) {
  if (!SCENE_IDS.includes(sceneId)) return false;
  const station = normalizeStationV188(save?.stationV188);
  if (station.scenesSeen.includes(sceneId)) { save.stationV188 = station; return false; }
  station.scenesSeen = [...station.scenesSeen, sceneId]; save.stationV188 = station; return true;
}

/** S2 recovers the archived delivery orders, whatever is later done to CASSIUS (bible §5.7.1). */
export function cassiusOrdersRecoveredV188(save) { return has(completed(save), 'station-s2'); }
/** S3: Sergeant Kessler's tag and Echo-8's last recording (bible §7.4). */
export function kesslerTagRecoveredV188(save) { return has(completed(save), 'station-s3'); }
/** S4: the station is retaken (condition of the "Transmit" option, bible §5.7.1). */
export function asphodeleRetakenV188(save) { return has(completed(save), 'station-s4'); }

const REASONS = Object.freeze({
  'act-two': t('Ouvre après l’Acte II (QZ-18).', 'Opens after Act II (QZ-18).'),
  intro: t('Écoutez d’abord l’enregistrement d’Echo-8 avec Rook (quête « Six heures »).', 'First listen to Echo-8’s recording with Rook (quest "Six Hours").'),
  previous: t('Terminez d’abord la mission précédente de la station.', 'Finish the previous station mission first.'),
  cassius: t('Décidez d’abord du sort de CASSIUS.', 'Decide CASSIUS’s fate first.')
});
export function stationLockTextV188(reason, language = 'fr') { return REASONS[reason]?.[language === 'en' ? 'en' : 'fr'] || ''; }

const CASSIUS_LABELS = Object.freeze({
  rewrite: t('Priorités réécrites : « les vivants d’abord »', 'Priorities rewritten: "the living first"'),
  restrain: t('Bridé : fonctions réduites', 'Restrained: reduced functions'),
  erase: t('Effacé : station en mode manuel', 'Erased: station on manual')
});
export function cassiusLabelV188(choice, language = 'fr') { return CASSIUS_LABELS[choice]?.[language === 'en' ? 'en' : 'fr'] || ''; }

/** Player-facing summary for the briefing table. */
export function stationSnapshotV188(save, language = 'fr') {
  const lang = language === 'en' ? 'en' : 'fr', station = normalizeStationV188(save?.stationV188), done = completed(save);
  const steps = STATION_CAMPAIGNS_V188.map(entry => Object.freeze({ id: entry.id, name: entry.name, done: done.includes(entry.id),
    lock: done.includes(entry.id) ? null : stationLockReasonV188(save, entry.id) }));
  const next = steps.find(step => !step.done && !step.lock) || null;
  const blocked = steps.find(step => !step.done && step.lock) || null;
  return Object.freeze({
    open: stationIntroAvailableV188(save), introHeard: station.introHeard, cassius: station.cassius,
    cassiusLabel: station.cassius ? cassiusLabelV188(station.cassius, lang) : null,
    cassiusPending: cassiusChoicePendingV188(save), retaken: asphodeleRetakenV188(save),
    steps: Object.freeze(steps), nextId: next?.id || null,
    hint: next ? null : blocked ? stationLockTextV188(blocked.lock, lang) : null
  });
}

// —— Return scenes and the CASSIUS decision (texts FR/EN) ——
// Shown once at the briefing table after the mission (bible §7.2, §7.4). Grants nothing.
export const STATION_SCENES_V188 = Object.freeze({
  s1: Object.freeze({ slot: 'asphodele-exterior', title: t('Asphodèle · le pont de contrôle', 'Asphodèle · the control deck'),
    text: t('Le pont de contrôle est atteint. Sur les barricades d’Echo-8, des marques à la craie comptent les heures : six traits, puis plus rien. Les récupérateurs de Grue tiennent l’anneau extérieur et regardent passer le dropship. L’énergie reste coupée : Idris Kwan prépare la relance depuis le Tantalus.',
      'The control deck is reached. On Echo-8’s barricades, chalk marks count the hours: six strokes, then nothing. Grue’s salvagers hold the outer ring and watch the dropship go by. Power is still off: Idris Kwan prepares the restart from the Tantalus.') }),
  s3: Object.freeze({ slot: 'echo8-recording', title: t('Asphodèle · les ponts inférieurs', 'Asphodèle · the lower decks'),
    text: t('Derrière le sas 3, le laboratoire de transit : des berceaux QZ17 ouverts, et les journaux des survivants qui s’arrêtent au quatrième jour. Près de la sortie, la plaque du sergent Dario Kessler et le dernier enregistrement de l’équipe. La plaque est rapportée à bord pour le casier vide d’Echo-8.',
      'Behind airlock 3, the transit laboratory: open QZ17 cradles, and the survivors’ logs that stop on the fourth day. Near the exit, Sergeant Dario Kessler’s tag and the team’s last recording. The tag is brought aboard for Echo-8’s empty locker.') }),
  s4: Object.freeze({ slot: 'asphodele-exterior', title: t('Asphodèle · reprise', 'Asphodèle · retaken'),
    text: t('La station est remise en pression. L’équipe technique du Tantalus s’installe au pont de contrôle ; qui tient Asphodèle tient les communications de Cocyte. Les modules du hub restent à rouvrir un par un.',
      'The station is repressurised. The Tantalus technical team settles on the control deck; whoever holds Asphodèle holds Cocyte’s communications. The hub modules remain to be reopened one by one.') })
});
export const CASSIUS_DIALOG_V188 = Object.freeze({
  slot: 'cassius-core', title: t('La voix de CASSIUS', 'The voice of CASSIUS'),
  text: t('CASSIUS ne ment pas. Il cite ses consignes : quarantaine de la station et de Cocyte, priorité cargaison, préservation des actifs. Les ordres de livraison QZ17 archivés sont copiés au dossier. Il attend une décision ; elle ne pourra pas être reprise.',
    'CASSIUS does not lie. It quotes its directives: quarantine of the station and of Cocyte, cargo priority, preservation of assets. The archived QZ17 delivery orders are copied to the file. It awaits a decision; it cannot be taken back.'),
  options: Object.freeze({
    rewrite: t('RÉÉCRIRE SES PRIORITÉS', 'REWRITE ITS PRIORITIES'),
    restrain: t('LE BRIDER', 'RESTRAIN IT'),
    erase: t('L’EFFACER', 'ERASE IT')
  }),
  results: Object.freeze({
    rewrite: t('CASSIUS reste au service de la station, « les vivants d’abord ». Il lève la quarantaine rouge sur Cocyte. Il pourrait être repris si la compagnie retrouvait un accès administrateur.',
      'CASSIUS stays in the station’s service, "the living first". It lifts the red quarantine on Cocyte. It could be taken back if the company regained administrator access.'),
    restrain: t('CASSIUS ne garde que ses fonctions de base. La quarantaine n’est plus renouvelée ; certaines annexes de la station resteront fermées.',
      'CASSIUS keeps only its basic functions. The quarantine is no longer renewed; some station annexes will stay closed.'),
    erase: t('CASSIUS est effacé. La station passe en mode manuel ; ses archives sont perdues, sauf les ordres déjà copiés. Les ponts inférieurs devront être ouverts à la force.',
      'CASSIUS is erased. The station switches to manual; its archives are lost, except the orders already copied. The lower decks will have to be forced open.')
  })
});
