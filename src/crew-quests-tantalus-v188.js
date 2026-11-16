// V188 — the twelve other Tantalus crew quests (bible §8.1), after the four of
// spec 005 (`crew-quests-v188.js`, which appends these and runs them with the
// same rules: offered in the hub conversation, listed at the briefing table, an
// analysis quest pays only when its last reading is answered from the evidence,
// a collection quest only when its items came back from missions).
// Act V advisors first (Sanaa Doyle, Cal Mercer, Maksim Orlov, Leila Sørensen:
// their council advantage needs loyalty ≥ 75, `story-act5-v188.js`).
// Pure data (FR/EN). Titles, givers, openings and effects come from §8.1; the
// evidence, the readings, the lines and the values are [PROPOSÉ] (bible §8.5).
import { normalizeStoryCampaignV188 } from './story-campaign-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const has = (list, id) => Array.isArray(list) && list.includes(id);
const completed = save => Array.isArray(save?.galaxy?.completedCampaignIds) ? save.galaxy.completedCampaignIds : [];
const option = (id, label, correct = false) => Object.freeze({ id, label, correct });
const step = (prompt, options, explain) => Object.freeze({ prompt, options: Object.freeze(options), explain });
const done = id => save => has(completed(save), id);
const prologueDone = save => save?.portMeridienV90?.phase === 'complete';
const interludeResolved = save => normalizeStoryCampaignV188(save?.storyCampaignV188).interlude?.phase === 'resolved';
const COCYTE = 'world-05-lethe';
const onCocyte = ctx => ctx.worldId === COCYTE;

export const CREW_QUESTS_TANTALUS_V188 = Object.freeze([
  // —— Act V advisors ——
  Object.freeze({
    id: 'ship-doyle', crewId: 'crew-07-sanaa-doyle', giver: 'Sanaa Doyle', slot: 'quest-sentry', kind: 'components',
    title: t('Les sentinelles', 'The Sentries'), after: t('Après « Tenir le port » (C1)', 'After "Hold the Port" (C1)'),
    where: t('Sanaa Doyle, à l’armurerie ou sur sa ronde.', 'Sanaa Doyle, at the armoury or on her rounds.'),
    offer: t('« Le poste de sécurité du quai nord a été abandonné avec ses tourelles sentinelles encore en caisse. Deux suffiront pour le mur. Tu me les ramènes ? »',
      '"The north-quay security post was abandoned with its sentry turrets still crated. Two will do for the wall. Will you bring them back?"'),
    available: done('colony-c1'), components: 2, collectWhen: onCocyte,
    progressText: t('Tourelles ramenées : {n}. Une opération réussie sur Cocyte en ramène une.', 'Turrets brought back: {n}. A successful operation on Cocyte brings one back.'),
    acceptText: t('Quête acceptée. Ramenez deux tourelles sentinelles d’opérations sur Cocyte.', 'Quest accepted. Bring back two sentry turrets from operations on Cocyte.'),
    turnInText: t('Les deux tourelles sont au hangar, caisses ouvertes.', 'The two turrets are in the hangar, crates open.'),
    turnInLabel: t('LES REMETTRE À SANAA', 'HAND THEM TO SANAA'),
    toastText: t('Sanaa Doyle : tourelle sentinelle récupérée ({n}/{needed}).', 'Sanaa Doyle: sentry turret recovered ({n}/{needed}).'),
    completion: t('LES SENTINELLES · Sanaa règle les capteurs des deux tourelles sur le mur nord. « Elles ne dorment pas. Moi non plus, mais elles, ça ne les fatigue pas. » Le chantier Murs et sas gagne un niveau ; une tourelle portable rejoint l’inventaire.',
      'THE SENTRIES · Sanaa tunes both turrets’ sensors on the north wall. "They don’t sleep. Neither do I, but it doesn’t tire them." The Walls and airlocks site gains a level; a portable sentry joins the inventory.'),
    reward: Object.freeze({ loyalty: 12, colonySite: 'walls', equipment: 'equipment-020-portable-sentry' })
  }),
  Object.freeze({
    id: 'ship-mercer', crewId: 'crew-16-cal-mercer', giver: 'Cal Mercer', slot: 'quest-apc', kind: 'components',
    title: t('Remettre le M577 en état', 'Getting the M577 Back in Shape'), after: t('Après le convoi du M577 (Acte III)', 'After the M577 convoy (Act III)'),
    where: t('Cal Mercer, à la baie véhicules ou sur sa ronde.', 'Cal Mercer, at the vehicle bay or on his rounds.'),
    offer: t('« Le blindé est rentré du corridor sur trois roues motrices et un moteur qui tousse. Il me faut trois pièces : un train, un filtre, un bloc de plaques. On en trouve dans les épaves de Cocyte. »',
      '"The APC came back from the corridor on three drive wheels and an engine that coughs. I need three parts: a running gear, a filter, a block of plates. There are some in the wrecks on Cocyte."'),
    available: done('special-apc-convoy'), components: 3, collectWhen: onCocyte,
    progressText: t('Pièces ramenées : {n}. Une opération réussie sur Cocyte en ramène une.', 'Parts brought back: {n}. A successful operation on Cocyte brings one back.'),
    acceptText: t('Quête acceptée. Ramenez trois pièces du M577 d’opérations sur Cocyte.', 'Quest accepted. Bring back three M577 parts from operations on Cocyte.'),
    turnInText: t('Le train, le filtre et les plaques sont à la baie véhicules.', 'The running gear, the filter and the plates are in the vehicle bay.'),
    turnInLabel: t('LES REMETTRE À CAL', 'HAND THEM TO CAL'),
    toastText: t('Cal Mercer : pièce du M577 récupérée ({n}/{needed}).', 'Cal Mercer: M577 part recovered ({n}/{needed}).'),
    completion: t('REMETTRE LE M577 EN ÉTAT · Cal referme le capot. « Six roues, un moteur qui ne tousse plus, et des plaques que je pourrai poser sur vous aussi. » Il sera prêt à blinder le dernier départ.',
      'GETTING THE M577 BACK IN SHAPE · Cal shuts the hood. "Six wheels, an engine that doesn’t cough anymore, and plates I can put on you too." He will be ready to armour the last departure.'),
    reward: Object.freeze({ loyalty: 12 })
  }),
  Object.freeze({
    id: 'ship-orlov', crewId: 'crew-08-maksim-orlov', giver: 'Maksim Orlov', slot: 'quest-flight-recorder', kind: 'analysis',
    title: t('Fenêtre de tir', 'Launch Window'), after: t('Après l’Acte IV', 'After Act IV'),
    where: t('Maksim Orlov, au hangar ou sur sa ronde.', 'Maksim Orlov, at the hangar or on his rounds.'),
    offer: t('« Le transport Kappa a mis trop longtemps à venir te chercher au dépôt. J’ai ses enregistreurs. Je veux savoir pourquoi, avant d’avoir à le refaire. »',
      '"The Kappa transport took too long to come and get you at the depot. I have its recorders. I want to know why, before I have to do it again."'),
    available: done('special-black-cocoon'),
    steps: Object.freeze([
      step(t('Enregistreur de vol : le Kappa arrive au-dessus du dépôt à 02:14, tourne vingt-deux minutes à 900 m, puis descend. Sur la bande radio : « Attente d’autorisation. Créneau réservé. »',
        'Flight recorder: the Kappa arrives over the depot at 02:14, circles for twenty-two minutes at 900 m, then descends. On the radio track: "Awaiting clearance. Slot reserved."'),
      [option('freight', t('Le créneau d’approche était réservé à une navette de fret.', 'The approach slot was reserved for a freight shuttle.'), true),
        option('weather', t('Une tempête au-dessus du dépôt.', 'A storm over the depot.'))],
      t('Orlov : « Météo dégagée, j’ai vérifié. Le ciel était libre, le créneau non. »', 'Orlov: "Clear weather, I checked. The sky was free, the slot wasn’t."')),
      step(t('Le plan de vol du créneau porte le code de priorité QZ17, autorisé depuis le relais d’Asphodèle.',
        'The slot’s flight plan carries the QZ17 priority code, authorised from the Asphodèle relay.'),
      [option('same', t('La même priorité de fret que les appels retenus à QZ-18.', 'The same freight priority as the calls held at QZ-18.'), true),
        option('pilot', t('Une erreur du pilote du Kappa.', 'A mistake by the Kappa pilot.'))],
      t('Orlov : « Pendant vingt-deux minutes, tu étais derrière une caisse. La prochaine fois, je n’attends pas d’autorisation. »', 'Orlov: "For twenty-two minutes, you were behind a crate. Next time, I don’t wait for clearance."'))
    ]),
    completion: t('FENÊTRE DE TIR · Orlov retire le code QZ17 de ses procédures d’approche. Il tiendra une fenêtre d’extraction sans attendre personne.',
      'LAUNCH WINDOW · Orlov removes the QZ17 code from his approach procedures. He will hold an extraction window without waiting for anyone.'),
    reward: Object.freeze({ loyalty: 12 })
  }),
  Object.freeze({
    id: 'ship-sorensen', crewId: 'crew-15-leila-s-rensen', giver: 'Leila Sørensen', slot: 'quest-route-map', kind: 'analysis',
    title: t('La route des fermes', 'The Farm Road'), after: t('Après « L’air du port » (C2)', 'After "The Port’s Air" (C2)'),
    where: t('Leila Sørensen, à la salle de navigation ou sur sa ronde.', 'Leila Sørensen, at the navigation room or on her rounds.'),
    offer: t('« Si la route du dépôt est coupée un jour, il faudra rentrer à pied. J’ai les relevés des drones. Aide-moi à tracer une route de survie jusqu’aux fermes. »',
      '"If the depot road is ever cut, we’ll have to walk back. I have the drone surveys. Help me plot a survival route to the farms."'),
    available: done('colony-c2'),
    steps: Object.freeze([
      step(t('Relevé du pont de la route du dépôt : piles fissurées, tablier qui fléchit sous les convois. Sous le tablier, un sentier de maintenance longe la rivière jusqu’au port.',
        'Survey of the bridge on the depot road: cracked piers, a deck that sags under convoys. Under the deck, a maintenance path follows the river to the port.'),
      [option('mark', t('Baliser le sentier : une route à pied si le pont cède.', 'Mark the path: a way on foot if the bridge gives way.'), true),
        option('ignore', t('Le pont tiendra, le sentier ne sert à rien.', 'The bridge will hold, the path is useless.'))],
      t('Leila : « Il cédera. Les ponts cèdent toujours quand on est dessus. »', 'Leila: "It will give way. Bridges always give way while you’re on them."')),
      step(t('Détecteur de mouvement des drones, trois nuits de suite : des contacts sur la crête, toujours au même endroit, jamais dans le lit de la rivière.',
        'The drones’ motion tracker, three nights running: contacts on the ridge, always in the same place, never in the riverbed.'),
      [option('river', t('Passer par la rivière, loin de la crête.', 'Go by the river, away from the ridge.'), true),
        option('ridge', t('Passer par la crête, on voit plus loin.', 'Go by the ridge, you can see further.'))],
      t('Leila : « La crête, c’est leur chemin. La rivière, ce sera le nôtre. »', 'Leila: "The ridge is their path. The river will be ours."'))
    ]),
    completion: t('LA ROUTE DES FERMES · Leila balise le sentier sous le pont et le lit de la rivière jusqu’aux fermes. Si on doit lâcher des colons sur la route, elle saura les ramener.',
      'THE FARM ROAD · Leila marks the path under the bridge and the riverbed to the farms. If colonists have to be dropped on the road, she will know how to bring them back.'),
    reward: Object.freeze({ loyalty: 12 })
  }),
  // —— The other crew members, in the order of §8.1 ——
  Object.freeze({
    id: 'ship-velez', crewId: 'crew-02-tamsin-velez', giver: 'Tamsin Velez', slot: 'quest-range', kind: 'analysis',
    title: t('Ceux d’Echo-8', 'Echo-8’s People'), after: t('Après le prologue', 'After the prologue'),
    where: t('La sergente Velez, au pas de tir ou sur sa ronde.', 'Sergeant Velez, at the firing range or on her rounds.'),
    offer: t('« Echo-8 tenait les meilleurs temps du pas de tir. Bats-les, et je te parlerai d’eux. »', '"Echo-8 held the best times on the firing range. Beat them, and I’ll tell you about them."'),
    available: prologueDone,
    // Proof: a new M41A qualification run completed after the quest was accepted (receipt of `proving-ground-session-v81.js`).
    gate: Object.freeze({ mark: save => save?.hub?.provingGroundV81?.qualification?.lastReceiptId || null,
      waitText: t('Velez : « Le pas de tir est au pont des opérations. Une qualification M41A complète, et on parle. »', 'Velez: "The range is on the operations deck. A full M41A qualification, and we talk."') }),
    steps: Object.freeze([
      step(t('Velez pose la feuille de tir d’Echo-8 à côté de la tienne. « Kessler marquait tout à la craie. Sur la station, il a tracé des traits sur les barricades. Tu sais ce qu’il comptait ? »',
        'Velez lays Echo-8’s range sheet beside yours. "Kessler marked everything in chalk. On the station, he drew strokes on the barricades. Do you know what he was counting?"'),
      [option('hours', t('Les heures tenues.', 'The hours held.'), true), option('ammo', t('Les chargeurs restants.', 'The magazines left.'))],
      t('Velez : « Les heures. Il disait qu’une barricade qu’on ne compte pas, on l’abandonne. »', 'Velez: "The hours. He said a barricade you don’t count is a barricade you give up."')),
      step(t('« Ils étaient six. Je les ai entraînés ici. Qu’est-ce que tu veux que je dise d’eux ? »', '"There were six of them. I trained them here. What do you want me to say about them?"'),
      [option('names', t('Leurs noms. Un par un.', 'Their names. One by one.'), true), option('end', t('Comment ça a fini.', 'How it ended.'), true)],
      t('Velez parle longtemps. Elle ne regarde pas la feuille.', 'Velez talks for a long time. She doesn’t look at the sheet.'))
    ]),
    completion: t('CEUX D’ECHO-8 · Velez range la feuille d’Echo-8 dans son casier. Elle t’attribue une dotation d’assaut : une musette de munitions rejoint l’inventaire.',
      'ECHO-8’S PEOPLE · Velez files Echo-8’s sheet in her locker. She issues you an assault allotment: an ammo satchel joins the inventory.'),
    reward: Object.freeze({ loyalty: 8, equipment: 'equipment-021-ammo-satchel' })
  }),
  Object.freeze({
    id: 'ship-echo-a', crewId: 'crew-14-echo-a', giver: 'ECHO-A', slot: 'echo8-recording', kind: 'analysis',
    title: t('Deux relèves', 'Two Reliefs'), after: t('Après « Les ponts scellés » (S3)', 'After "The Sealed Decks" (S3)'),
    where: t('ECHO-A, à son poste tactique ou sur sa ronde.', 'ECHO-A, at its tactical post or on its rounds.'),
    offer: t('« J’étais affecté à Echo-8. Je n’étais pas avec eux. Je voudrais comparer mes protocoles avec leur dernier enregistrement. »',
      '"I was assigned to Echo-8. I was not with them. I would like to compare my protocols with their last recording."'),
    available: done('station-s3'),
    steps: Object.freeze([
      step(t('Protocole ECHO-A 4.2 : « Escouade bloquée : repli vers le point d’extraction le plus proche. » Enregistrement : Kessler choisit le sas 3, côté laboratoire, là où sont les survivants, loin du dropship.',
        'ECHO-A protocol 4.2: "Squad pinned down: fall back to the nearest extraction point." Recording: Kessler chooses airlock 3, on the laboratory side, where the survivors are, away from the dropship.'),
      [option('broke', t('Kessler a quitté le protocole pour les survivants.', 'Kessler left the protocol for the survivors.'), true),
        option('followed', t('Kessler a suivi le protocole.', 'Kessler followed the protocol.'))],
      t('ECHO-A : « Le protocole les aurait ramenés. Ils ne seraient pas revenus seuls. »', 'ECHO-A: "The protocol would have brought them back. They would not have come back alone."')),
      step(t('ECHO-A : « Echo-9 est la relève d’Echo-8. Je serai remplacé un jour, moi aussi. Quand tu seras remplacé, qui remarquera ? »',
        'ECHO-A: "Echo-9 is Echo-8’s relief. I will be replaced one day too. When you are replaced, who will notice?"'),
      [option('remain', t('Ceux qui restent.', 'Those who remain.'), true), option('nobody', t('Personne. C’est le métier.', 'Nobody. That’s the job.'), true)],
      t('ECHO-A enregistre la réponse dans un secteur qu’il ne partage pas.', 'ECHO-A records the answer in a sector it does not share.'))
    ]),
    completion: t('DEUX RELÈVES · ECHO-A ajoute une ligne à ses protocoles : « Noter qui reste. » Il la dira au retour du Tantalus.',
      'TWO RELIEFS · ECHO-A adds a line to its protocols: "Note who remains." It will say it when the Tantalus returns.'),
    // « Réplique d'épilogue » (§8.1): said in the epilogue conversation, after the ending.
    epilogueLine: t('« J’ai noté qui reste. Tous. Echo-8 aussi : ils sont restés. »', '"I have noted who remains. All of them. Echo-8 too: they stayed."'),
    reward: Object.freeze({ loyalty: 8 })
  }),
  Object.freeze({
    id: 'ship-mbaye', crewId: 'crew-12-asha-mbaye', giver: 'Asha Mbaye', slot: 'quest-colonist-list', kind: 'analysis',
    title: t('Les noms de Port-Méridien', 'The Names of Port-Méridien'), after: t('Après l’Acte II', 'After Act II'),
    where: t('Asha Mbaye, au poste de liaison coloniale ou sur sa ronde.', 'Asha Mbaye, at the colonial liaison post or on her rounds.'),
    offer: t('« La colonie tient une liste de disparus. Les registres de QZ-18 ont peut-être leurs appels. Aide-moi à la compléter. »',
      '"The colony keeps a list of the missing. The QZ-18 registers may have their calls. Help me complete it."'),
    available: done('special-archive-relay'),
    steps: Object.freeze([
      step(t('Liste de la colonie : « Famille Okonjo, ferme 12, trois personnes — disparus, sans nouvelles. » Registre de QZ-18 : trois appels de la ferme 12, retenus six jours derrière le fret, puis effacés.',
        'Colony list: "Okonjo family, farm 12, three people — missing, no news." QZ-18 register: three calls from farm 12, held six days behind the freight, then erased.'),
      [option('held', t('Ils ont appelé ; leurs appels ont été retenus.', 'They called; their calls were held.'), true),
        option('silent', t('Ils n’ont jamais appelé.', 'They never called.'))],
      t('Asha : « Ils ont appelé trois fois. Personne ne les a entendus. »', 'Asha: "They called three times. Nobody heard them."')),
      step(t('Le dernier appel de la ferme 12 donne une position : le hameau de la balise, au nord du port.', 'The last call from farm 12 gives a position: the beacon hamlet, north of the port.'),
      [option('hamlet', t('Les chercher au hameau de la balise.', 'Look for them at the beacon hamlet.'), true), option('depot', t('Les chercher au dépôt.', 'Look for them at the depot.'))],
      t('Asha transmet la position aux équipes de Port-Méridien.', 'Asha sends the position to the Port-Méridien teams.'))
    ]),
    completion: t('LES NOMS DE PORT-MÉRIDIEN · Asha remplace « disparus » par « appel retenu » sur onze lignes. Les équipes du port retrouvent deux familles au hameau ; elles viennent grossir la colonie.',
      'THE NAMES OF PORT-MÉRIDIEN · Asha replaces "missing" with "call held" on eleven lines. The port teams find two families at the hamlet; they swell the colony.'),
    reward: Object.freeze({ loyalty: 6, population: 2 })
  }),
  Object.freeze({
    id: 'ship-okafor', crewId: 'crew-04-noor-okafor', giver: 'Noor Okafor', slot: 'quest-tags', kind: 'components',
    title: t('Le registre des pertes', 'The Register of Losses'), after: t('Après le convoi du M577 (Acte III)', 'After the M577 convoy (Act III)'),
    where: t('Noor Okafor, à l’infirmerie ou sur sa ronde.', 'Noor Okafor, at the infirmary or on her rounds.'),
    offer: t('« La compagnie ne compte pas les colons morts hors de ses installations. Moi, si. Ramène-moi leurs plaques quand tu en trouves. »',
      '"The company doesn’t count colonists who die outside its facilities. I do. Bring me their tags when you find them."'),
    available: done('special-apc-convoy'), components: 3, collectWhen: onCocyte,
    progressText: t('Plaques ramenées : {n}. Une opération réussie sur Cocyte en ramène une.', 'Tags brought back: {n}. A successful operation on Cocyte brings one back.'),
    acceptText: t('Quête acceptée. Ramenez trois plaques de colons d’opérations sur Cocyte.', 'Quest accepted. Bring back three colonists’ tags from operations on Cocyte.'),
    turnInText: t('Les trois plaques sont dans la boîte, nettoyées.', 'The three tags are in the box, cleaned.'),
    turnInLabel: t('LES REMETTRE À NOOR', 'HAND THEM TO NOOR'),
    toastText: t('Noor Okafor : plaque de colon récupérée ({n}/{needed}).', 'Noor Okafor: colonist’s tag recovered ({n}/{needed}).'),
    completion: t('LE REGISTRE DES PERTES · Noor recopie les trois noms dans son registre et en envoie une copie à Lucia Ferro. L’infirmerie de Port-Méridien gagne un niveau.',
      'THE REGISTER OF LOSSES · Noor copies the three names into her register and sends a copy to Lucia Ferro. The Port-Méridien infirmary gains a level.'),
    reward: Object.freeze({ loyalty: 6, colonySite: 'infirmary' })
  }),
  Object.freeze({
    id: 'ship-bishop', crewId: 'crew-05-bishop-9', giver: 'BISHOP-9', slot: 'quest-directive', kind: 'analysis',
    title: t('Directive de préservation', 'Preservation Directive'), after: t('Après l’Interlude', 'After the Interlude'),
    where: t('BISHOP-9, au laboratoire ou sur sa ronde.', 'BISHOP-9, at the laboratory or on his rounds.'),
    offer: t('« Vous ne m’avez rien demandé depuis la quarantaine. Vous pouvez. »', '"You haven’t asked me anything since the quarantine. You may."'),
    available: interludeResolved,
    steps: Object.freeze([
      step(t('La directive de préservation de BISHOP-9 est au dossier. Que lui demander ?', 'BISHOP-9’s preservation directive is in the file. What do you ask him?'),
      [option('conflict', t('Si la directive et la vie d’un membre de l’équipage s’opposaient, que feriez-vous ?', 'If the directive and a crew member’s life were in conflict, what would you do?'), true),
        option('author', t('Qui a écrit cette directive ?', 'Who wrote this directive?'), true)],
      t('BISHOP-9 prend le temps de répondre.', 'BISHOP-9 takes his time to answer.'))
    ]),
    // His answer depends on the trust already earned (NPC_TRUST_LEVELS_V62: « operationnel » from 55).
    completionFor: save => (Number(save?.crew?.find?.(member => member.id === 'crew-05-bishop-9')?.loyalty) >= 55
      ? t('DIRECTIVE DE PRÉSERVATION · BISHOP-9 : « Je choisirais l’équipage. Puis je signalerais mon choix à la compagnie, parce que je ne mens pas. Vous saurez donc toujours ce que j’ai fait. »',
        'PRESERVATION DIRECTIVE · BISHOP-9: "I would choose the crew. Then I would report my choice to the company, because I do not lie. So you will always know what I have done."')
      : t('DIRECTIVE DE PRÉSERVATION · BISHOP-9 : « Je ne suis pas autorisé à commenter cette directive. Je peux vous dire que je n’ai pas été programmé pour nuire. Le reste, il faudra le constater. »',
        'PRESERVATION DIRECTIVE · BISHOP-9: "I am not authorised to comment on this directive. I can tell you I was not programmed to cause harm. The rest you will have to see for yourself."')),
    completion: t('DIRECTIVE DE PRÉSERVATION · BISHOP-9 a répondu.', 'PRESERVATION DIRECTIVE · BISHOP-9 has answered.'),
    reward: Object.freeze({ loyalty: 10 })
  }),
  Object.freeze({
    id: 'ship-reyes', crewId: 'crew-13-pablo-reyes', giver: 'Pablo Reyes', slot: 'quest-register', kind: 'analysis',
    title: t('La charge de trop', 'The Charge Too Many'), after: t('Après le convoi du M577 (Acte III)', 'After the M577 convoy (Act III)'),
    where: t('Pablo Reyes, à l’armurerie ou sur sa ronde.', 'Pablo Reyes, at the armoury or on his rounds.'),
    offer: t('« Sur une évacuation, avant le Tantalus, j’ai fait sauter un accès trop tôt. Trois civils derrière. Le registre de l’opération existe. Je n’ai jamais osé le lire. »',
      '"On an evacuation, before the Tantalus, I blew an access too early. Three civilians behind it. The operation’s register exists. I never dared read it."'),
    available: done('special-apc-convoy'),
    steps: Object.freeze([
      step(t('Registre : 13:58, détecteur de mouvement — trois signaux civils coupés du groupe, entourés de contacts. 14:01, ordre du commandement : « Fermez l’accès. » 14:02, charge de Reyes.',
        'Register: 13:58, motion tracker — three civilian signals cut off from the group, surrounded by contacts. 14:01, command order: "Close the access." 14:02, Reyes’s charge.'),
      [option('order', t('Il a obéi à un ordre ; les civils étaient déjà coupés à 13:58.', 'He obeyed an order; the civilians were already cut off at 13:58.'), true),
        option('early', t('Il a tiré avant l’ordre.', 'He fired before the order.'))],
      t('Reyes relit la ligne de 13:58 trois fois.', 'Reyes reads the 13:58 line three times.')),
      step(t('Reyes : « Alors pourquoi je l’ai porté pendant six ans ? »', 'Reyes: "Then why did I carry it for six years?"'),
      [option('pressed', t('Parce que c’est toi qui as appuyé.', 'Because you were the one who pressed.'), true), option('now', t('Tu peux le poser maintenant.', 'You can put it down now.'), true)],
      t('Reyes referme le registre.', 'Reyes closes the register.'))
    ]),
    completion: t('LA CHARGE DE TROP · Reyes prépare de nouveau ses charges sans trembler. Des grenades M40 HEDP rejoignent l’inventaire.',
      'THE CHARGE TOO MANY · Reyes prepares his charges again without shaking. M40 HEDP grenades join the inventory.'),
    reward: Object.freeze({ loyalty: 8, weapon: 'weapon-014-m40-hedp-grenade' })
  }),
  Object.freeze({
    id: 'ship-kwan', crewId: 'crew-03-idris-kwan', giver: 'Idris Kwan', slot: 'quest-reactor', kind: 'analysis',
    title: t('Le réacteur ne ment pas', 'The Reactor Doesn’t Lie'), after: t('Après le prologue', 'After the prologue'),
    where: t('Idris Kwan, au réacteur ou sur sa ronde.', 'Idris Kwan, at the reactor or on his rounds.'),
    offer: t('« Le réseau du réacteur fatigue. Répare-le avec moi au pupitre du réacteur, et je te montre les relevés. »', '"The reactor grid is tiring. Repair it with me at the reactor console, and I’ll show you the readings."'),
    available: prologueDone,
    // Proof: the reactor service (`service:power`, salle du réacteur) used after the quest was accepted.
    gate: Object.freeze({ mark: save => save?.hub?.services?.['service:power'] ?? null,
      waitText: t('Kwan : « Le pupitre du réacteur, pont technique. Réaffecte le carburant au réseau principal, puis reviens. »', 'Kwan: "The reactor console, engineering deck. Reassign fuel to the main grid, then come back."') }),
    steps: Object.freeze([
      step(t('Relevés après réparation : la consommation du pont 2 monte de 4 % chaque nuit, de 01:00 à 05:00. Le pont 2 abrite la quarantaine ; il est vide.',
        'Readings after the repair: deck 2 consumption rises 4% every night, from 01:00 to 05:00. Deck 2 houses the quarantine; it is empty.'),
      [option('quarantine', t('Quelque chose tourne la nuit sur le pont de quarantaine.', 'Something runs at night on the quarantine deck.'), true),
        option('leak', t('Une fuite du réacteur.', 'A reactor leak.'))],
      t('Kwan : « Le réacteur ne ment pas. Ce n’est pas une fuite, c’est une charge. »', 'Kwan: "The reactor doesn’t lie. It isn’t a leak, it’s a load."')),
      step(t('Le circuit qui consomme est celui des caissons de conservation du laboratoire, sur un accès scientifique.', 'The drawing circuit is the laboratory’s preservation units, on a science access.'),
      [option('science', t('Un caisson de conservation est en service, sur un accès scientifique.', 'A preservation unit is running, on a science access.'), true),
        option('crew', t('Un membre de l’équipage dort au pont 2.', 'A crew member sleeps on deck 2.'))],
      t('Kwan note le circuit et l’heure dans son carnet de quart.', 'Kwan notes the circuit and the time in his watch log.'))
    ]),
    completion: t('LE RÉACTEUR NE MENT PAS · Kwan garde le relevé : un caisson de conservation tourne la nuit au pont de quarantaine. L’indice est versé au laboratoire.',
      'THE REACTOR DOESN’T LIE · Kwan keeps the reading: a preservation unit runs at night on the quarantine deck. The clue goes to the laboratory.'),
    reward: Object.freeze({ loyalty: 6, research: 4 })
  }),
  Object.freeze({
    id: 'ship-park', crewId: 'crew-11-jun-park', giver: 'Jun Park', slot: 'quest-vents', kind: 'components',
    title: t('Après les conduits', 'After the Ducts'), after: t('Après l’Interlude', 'After the Interlude'),
    where: t('Jun Park, à l’atelier technique ou sur sa ronde.', 'Jun Park, at the technical workshop or on his rounds.'),
    offer: t('« Depuis le pont 2, je n’entre plus dans un conduit. Il faut pourtant qu’on les sécurise. Viens avec moi sur une mission dans les conduits. »',
      '"Since deck 2, I don’t go into a duct anymore. We still have to secure them. Come with me on a mission in the ducts."'),
    available: interludeResolved, components: 1, collectWhen: ctx => ctx.objective === 'navigate the vent network',
    progressText: t('Conduits sécurisés : {n}. Une mission réussie dans un réseau de conduits compte.', 'Ducts secured: {n}. A successful mission in a vent network counts.'),
    acceptText: t('Quête acceptée. Réussissez une mission dans un réseau de conduits.', 'Quest accepted. Complete a mission in a vent network.'),
    turnInText: t('Le réseau de conduits est sécurisé.', 'The vent network is secured.'),
    turnInLabel: t('EN PARLER À JUN', 'TALK TO JUN'),
    toastText: t('Jun Park : conduits sécurisés ({n}/{needed}).', 'Jun Park: ducts secured ({n}/{needed}).'),
    completion: t('APRÈS LES CONDUITS · Jun pose lui-même les grilles neuves du pont 2. L’équipage dort mieux ; le recyclage d’air du Tantalus est révisé.',
      'AFTER THE DUCTS · Jun fits the new deck-2 grilles himself. The crew sleeps better; the Tantalus air recycling is overhauled.'),
    reward: Object.freeze({ loyalty: 6, crewStress: -8, shipOxygen: 10 })
  })
]);
