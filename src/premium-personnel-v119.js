import { CAMPAIGNS } from './content-core-v50.js';
import { getPersonnelDriveVisualsV123, getPersonnelDriveDocumentariesV123 } from './personnel-drive-visuals-v123.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const clone = value => JSON.parse(JSON.stringify(value));
const KEYS = ['tir','physique','mobilite','sangFroid','technique','secourisme','perception','cohesion'];
const REFERENCES = freeze({
  alien: { title: 'Alien · 20th Century Studios', url: 'https://www.20thcenturystudios.com/movies/alien' },
  aliens: { title: 'Aliens · 20th Century Studios', url: 'https://www.20thcenturystudios.com/movies/aliens' },
  isolation: { title: 'Alien: Isolation · SEGA', url: 'https://alienisolation.sega.jp/story.html' },
  defiance: { title: 'Aliens: Defiance · Dark Horse', url: 'https://digital.darkhorse.com/books/4bcbe4264bdb4a0e8d2359f17d1c8721/aliens-defiance-library-edition' },
  covenant: { title: 'Alien: Covenant · 20th Century Studios', url: 'https://www.20thcenturystudios.com/movies/alien-covenant' },
  romulus: { title: 'Alien: Romulus · 20th Century Studios', url: 'https://www.20thcenturystudios.com/movies/alien-romulus' },
  descent: { title: 'Aliens: Dark Descent · Focus Entertainment', url: 'https://www.focus-entmt.com/en/games/aliens-dark-descent' },
  rogue: { title: 'Alien: Rogue Incursion · Survios', url: 'https://alienrogueincursion.com/vr/' }
});

function dossier(id, name, species, role, specialty, sources, era, reference, aptitudes, equipment, summary, reaction) {
  return {
    id: `personnel-archive-${id}`, name, species, role, specialty,
    sourceWorks: sources, sourceWork: sources[0], era,
    presenceMode: 'mire-reconstruction', presenceScope: 'archive-only',
    chronology: 'Dossier historique isolé de la continuité Frontier en 2204. Aucune présence physique, résurrection ou clonage déduit.',
    aptitudes: Object.fromEntries(KEYS.map((key, index) => [key, aptitudes[index]])),
    statStatus: 'project-study-profile-not-canonical-stats',
    equipment: equipment.map(label => ({ label, status: 'source-dossier-not-granted', instanceId: null })),
    summary, radioReaction: reaction, dialogueStatus: 'project-authored-paraphrase-not-film-quote',
    reference: REFERENCES[reference], referenceStatus: 'source-work-record-not-1:1-visual-certification',
    portrait: null, sprite: null, artStatus: 'dedicated-portrait-and-sprite-missing',
    playable: false, signatureAbility: null, recruitmentAllowed: false,
    unlock: { type: 'completed-source-mire', sources, scope: 'dossier-consultation-only' }
  };
}

// Handcrafted identities, never generated recruits. Equipment and study ratings
// are dossier data, not free inventory or asserted canonical combat statistics.
export const PREMIUM_PERSONNEL_V119 = freeze([
  dossier('ellen-ripley','Ellen Ripley','human','Officier de bord','Survie et extraction',['Alien 1979','Aliens 1986'],'Nostromo / LV-426','alien',[45,45,50,75,50,30,60,45],['Équipement de bord du Nostromo','Power Loader — dossier LV-426'],
    'Officier du Nostromo puis témoin central de l’opération de LV-426. Les épisodes sont distingués dans les archives, pas fusionnés en une recrue de 2204.','Vérifions la sortie avant de repartir.'),
  dossier('dwayne-hicks','Dwayne Hicks','human','Caporal des Colonial Marines','Couverture et commandement',['Aliens 1986'],'Opération LV-426','aliens',[70,55,45,65,30,35,45,55],['M41A','Fusil de secours','Armure de Marine'],
    'Caporal de l’unité du Sulaco. Ce dossier conserve son rôle au sein de l’équipe de LV-426 sans choisir une continuité ultérieure contradictoire.','Couverture établie. Confirmez votre passage.'),
  dossier('bishop','Bishop','synthetic','Officier synthétique','Analyse et assistance',['Aliens 1986'],'Opération LV-426','aliens',[20,40,40,70,75,60,55,40],['Matériel d’analyse','Systèmes de navette — dossier'],
    'Synthétique accompagnant les Marines du Sulaco. Il est distinct de Bishop-9, membre contemporain déjà présent dans le Tantalus.','Je vérifie les paramètres avant votre arrivée.'),
  dossier('vasquez','Jenette Vasquez','human','Soldat des Colonial Marines','Appui lourd',['Aliens 1986'],'Opération LV-426','aliens',[75,65,40,55,25,25,50,65],['M56 Smartgun','Harnais d’appui','Équipement de Marine'],
    'Marine affectée à l’appui lourd pendant l’opération du Sulaco. Le dossier n’accorde ni arme ni capacité gratuite à la campagne actuelle.','Appui en place. Gardez le couloir dégagé.'),
  dossier('hudson','William Hudson','human','Soldat des Colonial Marines','Observation et défense',['Aliens 1986'],'Opération LV-426','aliens',[60,40,50,30,55,25,70,70],['M41A','Équipement de Marine','Détecteur de mouvement — dossier'],
    'Marine du Sulaco dont le dossier met en regard surveillance et réaction sous pression. Les valeurs proposées sont une lecture de simulation du projet.','J’ai un signal. Confirmez les positions.'),
  dossier('apone','Al Apone','human','Sergent des Colonial Marines','Coordination d’escouade',['Aliens 1986'],'Opération LV-426','aliens',[60,55,35,60,35,30,50,75],['M41A','Armure de Marine','Radio d’escouade'],
    'Sergent de l’unité du Sulaco. Son rôle de coordination est documenté, mais aucune aura de commandement n’est ajoutée tant qu’un opérateur dédié n’est pas implémenté.','Vérifiez votre binôme et confirmez le départ.'),
  dossier('amanda-ripley','Amanda Ripley','human','Technicienne','Réparation et infiltration',['Alien Isolation'],'Sevastopol','isolation',[30,35,65,65,70,25,70,40],['Outils de maintenance','Détecteur de mouvement','Équipement de survie'],
    'Technicienne à la recherche d’informations sur le Nostromo. Le dossier de Sevastopol ne crée pas de présence contemporaine à bord.','Il faut vérifier l’alimentation du passage.'),
  dossier('christopher-samuels','Christopher Samuels','synthetic','Agent synthétique','Assistance et analyse',['Alien Isolation'],'Sevastopol','isolation',[20,45,35,60,80,45,55,60],['Équipement de liaison','Accès techniques — dossier'],
    'Synthétique lié à la recherche de la boîte noire du Nostromo et à l’expédition vers Sevastopol. Reconstruction documentaire uniquement.','Je vais examiner le système et vous informer.'),
  dossier('zula-hendricks','Zula Hendricks','human','Colonial Marine / opératrice indépendante','Enquête et survie',['Aliens: Defiance','Aliens Rogue Incursion'],'Defiance / Purdan — archives distinctes','defiance',[65,45,55,60,35,35,60,45],['Équipement de Marine','Outils de terrain','Armement selon épisode'],
    'Marine connue des récits Defiance puis opératrice de Rogue Incursion. Les archives indiquent leurs sources séparément ; l’équipement varie selon l’épisode.','Cherchons les preuves et préparons notre retour.'),
  dossier('daniels','Daniels','human','Officier de terraformation','Survie et opérations coloniales',['Alien Covenant'],'Expédition Covenant','covenant',[35,40,55,65,60,40,60,45],['Équipement de colonisation','Tenue de mission — dossier'],
    'Membre de l’expédition coloniale Covenant. L’archive ne présume pas d’une nouvelle affectation ni d’une issue non montrée après le film.','Assurons d’abord un trajet de retour.'),
  dossier('tennessee','Tennessee','human','Pilote','Transport et extraction',['Alien Covenant'],'Expédition Covenant','covenant',[25,40,35,60,70,25,70,75],['Poste de pilotage','Équipement de bord'],
    'Pilote de l’expédition Covenant. Le dossier concerne les décisions de transport et d’extraction, pas un bonus de pilotage actif.','Coordonnées reçues. Je vérifie l’approche.'),
  dossier('rain-carradine','Rain Carradine','human','Travailleuse coloniale','Survie et récupération',['Alien Romulus'],'Jackson’s Star / station Renaissance','romulus',[35,35,65,60,50,35,70,50],['Équipement de récupération','Armement de la station — dossier'],
    'Travailleuse coloniale impliquée dans la récupération à bord de la station Renaissance. Les événements ultérieurs ne sont pas inventés.','On confirme le passage et on reste ensemble.'),
  dossier('andy','Andy','synthetic','Synthétique de soutien','Assistance et accès techniques',['Alien Romulus'],'Jackson’s Star / station Renaissance','romulus',[25,65,35,45,70,40,55,65],['Équipement de liaison','Systèmes de la station — dossier'],
    'Synthétique associé à Rain. Ses directives et leurs changements appartiennent au dossier de la station, pas à un nouveau modèle contemporain identique.','Je vérifie les accès avant votre passage.'),
  dossier('maeko-hayes','Maeko Hayes','human','Administratrice / renseignement','Coordination et analyse',['Aliens Dark Descent'],'Incident de Lethe','descent',[25,30,35,55,70,35,70,80],['Terminal de renseignement','Équipement d’opération — dossier'],
    'Personnage du dossier Dark Descent sur Lethe. Sa fonction de coordination ne remplace pas les opérateurs Echo-9 déjà enregistrés.','La situation doit être confirmée avant le déploiement.'),
  dossier('jonas-harper','Jonas Harper','human','Sergent des Colonial Marines','Coordination de terrain',['Aliens Dark Descent'],'Incident de Lethe','descent',[65,50,40,55,35,30,55,70],['Équipement de Marine','Radio tactique'],
    'Sergent lié aux opérations de Lethe. Le dossier reste une reconstruction isolée et ne tranche pas en faveur d’une survie inventée.','Gardez une route d’extraction disponible.'),
  dossier('davis-01','Davis 01','synthetic','Synthétique indépendant','Analyse et assistance',['Aliens Rogue Incursion','Aliens: Defiance'],'Defiance / Purdan — archives distinctes','rogue',[35,45,40,65,65,45,50,55],['Terminal de liaison','Matériel synthétique — selon épisode'],
    'Compagnon synthétique de Zula Hendricks. Il est documenté comme identité propre, sans réutiliser le sprite d’un autre synthétique pour le rendre jouable.','Je recoupe les données et je vous transmets les risques.')
]);

const BY_ID = new Map(PREMIUM_PERSONNEL_V119.map(entry => [entry.id, entry]));
const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
export function createPremiumPersonnelV119() { return { schema: 119, unlockedDossierIds: [], selectedDossierId: null }; }

function evidenceFor(entry, save, campaigns) {
  const completed = new Set(Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : []);
  // Publisher-wide reconstitutions do not identify a particular work or its
  // characters. Defiance remains documented, but until a source-specific MIRE
  // exists only the existing Rogue Incursion ledger can recover these dossiers.
  return campaigns.filter(campaign => campaign?.mode === 'MIRE' && entry.unlock.sources.includes(campaign.source) && completed.has(campaign.id))
    .map(campaign => ({ campaignId: campaign.id, source: campaign.source, mode: campaign.mode }));
}

// Imported unlock flags alone cannot bypass an existing MIRE completion. The
// completed campaign ledger remains the single causal source in the save payload.
export function sanitizePremiumPersonnelV119(raw, save = {}, campaigns = CAMPAIGNS) {
  const state = createPremiumPersonnelV119();
  const knownCampaigns = Array.isArray(campaigns) ? campaigns : [];
  state.unlockedDossierIds = PREMIUM_PERSONNEL_V119.filter(entry => evidenceFor(entry, save, knownCampaigns).length).map(entry => entry.id);
  if (isObject(raw) && raw.schema === 119 && state.unlockedDossierIds.includes(raw.selectedDossierId)) state.selectedDossierId = raw.selectedDossierId;
  return state;
}

export function syncPremiumPersonnelV119(save) {
  if (!isObject(save)) return null;
  save.premiumPersonnelV119 = sanitizePremiumPersonnelV119(save.premiumPersonnelV119, save);
  return save.premiumPersonnelV119;
}

export function getPremiumPersonnelV119(save = {}, campaigns = CAMPAIGNS) {
  const profile = isObject(save) ? save : {};
  const state = sanitizePremiumPersonnelV119(profile.premiumPersonnelV119, profile, campaigns);
  // A malformed save stays a locked legacy read model; documentary visibility
  // is attached only to a valid profile and never repairs or writes that save.
  return [...PREMIUM_PERSONNEL_V119.map(entry => {
    const evidence = evidenceFor(entry, profile, Array.isArray(campaigns) ? campaigns : []);
    return { ...clone(entry), archive: true, unlocked: evidence.length > 0, selected: entry.id === state.selectedDossierId,
      evidence, driveVisualsV123: getPersonnelDriveVisualsV123(entry.id),
      status: evidence.length ? 'Dossier MIRE consultable' : 'Archive à récupérer',
      conditionLabel: `Réussir une reconstitution MIRE : ${entry.unlock.sources.join(' ou ')}.` };
  }), ...(isObject(save) ? getPersonnelDriveDocumentariesV123() : [])];
}

export function selectPremiumDossierV119(save, id) {
  if (!isObject(save)) return { ok: false, reason: 'invalid-save' };
  const state = sanitizePremiumPersonnelV119(save?.premiumPersonnelV119, save);
  if (!BY_ID.has(id) || !state.unlockedDossierIds.includes(id)) return { ok: false, reason: 'mire-completion-required' };
  state.selectedDossierId = id; save.premiumPersonnelV119 = state;
  return { ok: true, dossierId: id, presenceMode: BY_ID.get(id).presenceMode, playable: false };
}

export function premiumPersonnelCoverageV119(campaigns = CAMPAIGNS) {
  const sources = [...new Set(campaigns.map(campaign => campaign.source))].filter(source => source !== 'Tantalus Frontier');
  const representedSources = sources.filter(source => PREMIUM_PERSONNEL_V119.some(entry => entry.sourceWorks.includes(source)));
  return { dossierCount: PREMIUM_PERSONNEL_V119.length, representedSources,
    unrepresentedSources: sources.filter(source => !representedSources.includes(source)),
    playableDossiers: PREMIUM_PERSONNEL_V119.filter(entry => entry.playable).length,
    dedicatedPortraits: PREMIUM_PERSONNEL_V119.filter(entry => entry.portrait).length };
}
