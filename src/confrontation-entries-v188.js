// V188 — data entries of the no-shooting audience (spec 010). Pure data, no
// imports, no functions: the rules live in confrontation-state-v188.js, the
// save access in confrontation-v188.js. Each entry is checked by
// `validateConfrontationDefinitionV188` (scripts/verify-confrontation-v188.mjs).
//
// Fidelity: the company « ne ment presque jamais frontalement : elle cite »
// (bible §1.3, rule 3); « une preuve n'est pas une accusation » (rule 9).
// Clause numbers, directive codes and every line below are project adaptations
// [PROPOSÉ]; « Clause 14 » comes from the bible (§21, CE-05). The documented
// reference points are cited in specs/010-face-a-face/spec.md.
//
// Piece ids are those of DOSSIER_PIECES_V188 (story-dossier-v188.js, bible §5.7).

const t = (fr, en) => Object.freeze({ fr, en });
const round = (id, source, citation, counters, decisive) => Object.freeze({ id, source, citation, counters: Object.freeze(counters), replies: Object.freeze({ decisive }) });

/** Act V, quay of Port-Méridien, line « Tenir la colonie » (bible §5.6 step 8, §5.11 step 6). Wired. */
export const HALLORAN_QUAY_AUDIENCE_V188 = Object.freeze({
  id: 'act5-halloran-quay',
  title: t('Le quai · audience', 'The quay · hearing'),
  intro: t('Au quai, l’officier des commandos tient la liaison QZ ouverte. La Directrice Halloran répond depuis la direction régionale. Personne ne tire : Echo-9 répond à chaque clause par une pièce du dossier QZ17, ou se tait.',
    'At the quay, the commando officer keeps the QZ link open. Director Halloran answers from the regional office. Nobody fires: Echo-9 answers each clause with a piece of the QZ17 file, or stays silent.'),
  interlocutor: Object.freeze({ name: t('DIRECTRICE HALLORAN · LIAISON QZ', 'DIRECTOR HALLORAN · QZ LINK'), portrait: 'crt-bust', slot: 'confrontation-halloran-crt',
    role: t('Direction régionale du réseau QZ', 'Regional office of the QZ network') }),
  witness: Object.freeze({ name: t('OFFICIER DES COMMANDOS', 'COMMANDO OFFICER') }),
  pieces: Object.freeze(['pda-email', 'seal-or-cradle', 'priority-1843', 'bishop-directive', 'depot-cradles', 'cassius-orders', 'wren-testimony']),
  credibility: 3, // [PROPOSÉ]
  target: 10, // [PROPOSÉ] five decisive pieces: the threshold of Q4 A (5 pieces) is necessary and sufficient
  rounds: Object.freeze([
    round('clause-14', t('Charte de Port-Méridien, clause 14', 'Port-Méridien charter, clause 14'),
      t('« Clause 14 de la charte : une colonie qui cesse de transmettre ses appels de détresse est réputée non viable. Port-Méridien s’est tue pendant des semaines. »',
        '"Clause 14 of the charter: a colony that stops transmitting its distress calls is deemed non-viable. Port-Méridien fell silent for weeks."'),
      { 'priority-1843': 'decisive', 'wren-testimony': 'partial' },
      t('« … La priorité de 18:43 relève de la clause d’acheminement, pas de la clause 14. Je retire ce motif. »', '"… The 18:43 priority falls under the routing clause, not clause 14. I withdraw that ground."')),
    round('manifest', t('Manifeste QZ17, déclaration de fret', 'QZ17 manifest, freight declaration'),
      t('« Le manifeste QZ17 déclare du matériel de forage. Aucun fret biologique n’a transité par le réseau. »',
        '"The QZ17 manifest declares drilling equipment. No biological freight transited the network."'),
      { 'pda-email': 'decisive', 'seal-or-cradle': 'partial' },
      t('« … Le relevé du chef de chargement contredit le courriel de la logistique. Le service concerné répondra de cet écart. »', '"… The loading chief’s log contradicts the logistics email. The department concerned will answer for that gap."')),
    round('seals', t('Protocole d’expédition, article 3', 'Shipping protocol, article 3'),
      t('« Article 3 du protocole d’expédition : les conteneurs sont partis scellés et conformes. Un scellé ouvert engage la responsabilité de l’unité qui l’ouvre. »',
        '"Article 3 of the shipping protocol: the containers left sealed and compliant. An opened seal engages the liability of the unit that opens it."'),
      { 'seal-or-cradle': 'decisive', 'depot-cradles': 'partial' },
      t('« … Ce berceau a été ouvert de l’intérieur. Je prends acte. »', '"… That cradle was opened from the inside. I take note."')),
    round('orders', t('Délégation d’exploitation, station Asphodèle', 'Operating delegation, Asphodèle station'),
      t('« La direction régionale n’a émis aucun ordre de livraison vers le dépôt. La station Asphodèle opérait sous délégation, en autonomie. »',
        '"The regional office issued no delivery order to the depot. Asphodèle station operated under delegation, autonomously."'),
      { 'cassius-orders': 'decisive', 'priority-1843': 'partial' },
      t('« … Les ordres archivés portent la chaîne de la direction régionale. Je ne commenterai pas leur signataire. »', '"… The archived orders carry the regional office’s chain. I will not comment on their signer."')),
    round('directive', t('Protocole des personnels synthétiques', 'Synthetic personnel protocol'),
      t('« Aucune directive ne visait des spécimens. Le personnel synthétique embarqué applique les protocoles standard de la compagnie. »',
        '"No directive concerned specimens. The synthetic personnel aboard apply the company’s standard protocols."'),
      { 'bishop-directive': 'decisive', 'cassius-orders': 'partial' },
      t('« … La directive de préservation de BISHOP-9 est authentique. Elle reste confidentielle. »', '"… BISHOP-9’s preservation directive is authentic. It remains confidential."')),
    round('collapse', t('Charte de Port-Méridien, annexe de viabilité', 'Port-Méridien charter, viability annex'),
      t('« Les disparitions de colons relèvent de l’effondrement de la colonie, non des activités du dépôt. L’annexe de viabilité en tient la colonie pour seule responsable. »',
        '"The colonists’ disappearances stem from the colony’s collapse, not from the depot’s activities. The viability annex holds the colony solely responsible."'),
      { 'depot-cradles': 'decisive', 'wren-testimony': 'partial' },
      t('« … Les badges des cocons sont ceux de Port-Méridien et de QZ-18. Ce point sortira de mes attributions. »', '"… The badges in the cocoons are those of Port-Méridien and QZ-18. That point will go beyond my remit."')),
    round('witness', t('Règlement des enquêtes internes', 'Internal inquiry rules'),
      t('« Les récits de colons ne sont pas recevables : aucun témoin du quai n’a été enregistré dans les formes. »',
        '"Colonists’ accounts are not admissible: no quay witness was recorded in due form."'),
      { 'wren-testimony': 'decisive', 'pda-email': 'partial' },
      t('« … Le témoignage du chef de quai Wren est daté et signé. Il sera versé au dossier. »', '"… Quay chief Wren’s testimony is dated and signed. It will be added to the file."'))
  ]),
  replies: Object.freeze({
    decisive: t('L’officier des commandos baisse son arme d’un cran.', 'The commando officer lowers his weapon a notch.'),
    partial: t('« Recevable en partie. Cela ne répond pas entièrement à la clause citée. »', '"Admissible in part. It does not fully answer the clause cited."'),
    wrong: t('« Cette pièce ne répond pas à la clause citée. » L’officier note l’écart ; la crédibilité d’Echo-9 baisse.', '"That piece does not answer the clause cited." The officer notes the gap; Echo-9’s credibility drops.'),
    silence: t('« Le silence vaut acceptation. » Halloran passe à la clause suivante.', '"Silence is acceptance." Halloran moves on to the next clause.')
  }),
  endings: Object.freeze({
    won: t('L’officier des commandos coupe la liaison et demande des ordres. Il reçoit celui de se retirer. Personne n’a tiré.',
      'The commando officer cuts the link and asks for orders. He is told to withdraw. Nobody fired.'),
    lost: t('Halloran clôt l’audience : « Nous attendrons l’aube. » Les commandos restent devant les portes ; personne ne tire.',
      'Halloran closes the hearing: "We will wait for dawn." The commandos stay at the gates; nobody fires.')
  }),
  // Existing decision fed by the outcome: storyCampaignV188.act5.standoff (ACT5_STANDOFF_IDS_V188).
  feeds: 'act5.standoff',
  outcomes: Object.freeze({ won: 'withdrawn', lost: 'held' })
});

/**
 * Station S2, interrogation of CASSIUS (bible §7.2: « il ne ment pas : il cite ses consignes »).
 * NOT wired by spec 010: the station levels S1-S4 are built by another lot. It is a ready
 * data entry; the wiring lot opens it before the CASSIUS decision (see the spec's API section).
 * `cassius-orders` is not presentable here: S2 is where it is recovered.
 */
export const CASSIUS_INTERROGATION_V188 = Object.freeze({
  id: 'station-s2-cassius',
  title: t('La voix de CASSIUS · interrogatoire', 'The voice of CASSIUS · interrogation'),
  intro: t('Le pont de contrôle est revenu. CASSIUS répond à chaque question en citant une consigne. Il ne ment pas. Echo-9 lui oppose les pièces du dossier QZ17, ou se tait.',
    'The control deck is back. CASSIUS answers every question by quoting a directive. It does not lie. Echo-9 confronts it with the pieces of the QZ17 file, or stays silent.'),
  interlocutor: Object.freeze({ name: t('CASSIUS · STATION ASPHODÈLE', 'CASSIUS · ASPHODÈLE STATION'), portrait: 'core-eye', slot: 'confrontation-cassius-core',
    role: t('Système de bord de la station', 'Station on-board system') }),
  witness: Object.freeze({ name: t('IDRIS KWAN · RADIO', 'IDRIS KWAN · RADIO') }),
  pieces: Object.freeze(['pda-email', 'seal-or-cradle', 'priority-1843', 'bishop-directive', 'depot-cradles', 'wren-testimony']),
  credibility: 3,
  target: 6, // [PROPOSÉ] three decisive pieces out of five rounds
  rounds: Object.freeze([
    round('q1', t('Consigne Q-1, quarantaine', 'Directive Q-1, quarantine'),
      t('« Consigne Q-1 : la quarantaine rouge est maintenue tant qu’un risque biologique n’est pas exclu. »', '"Directive Q-1: the red quarantine is maintained as long as a biological risk is not ruled out."'),
      { 'seal-or-cradle': 'decisive', 'depot-cradles': 'partial' },
      t('« … Le risque provient d’un conteneur que j’ai acheminé. Contradiction enregistrée. »', '"… The risk comes from a container I routed. Contradiction logged."')),
    round('p2', t('Consigne P-2, priorité cargaison', 'Directive P-2, cargo priority'),
      t('« Consigne P-2 : le fret sous scellés passe avant le trafic civil. »', '"Directive P-2: sealed freight goes before civilian traffic."'),
      { 'priority-1843': 'decisive', 'wren-testimony': 'partial' },
      t('« … À 18:43, la priorité a retenu un appel de secours pendant treize minutes. Enregistré. »', '"… At 18:43, the priority held a distress call for thirteen minutes. Logged."')),
    round('a3', t('Consigne A-3, préservation des actifs', 'Directive A-3, asset preservation'),
      t('« Consigne A-3 : préserver les actifs sous scellés. Cette consigne ne vient que de moi. »', '"Directive A-3: preserve the sealed assets. This directive comes from me alone."'),
      { 'bishop-directive': 'decisive', 'pda-email': 'partial' },
      t('« … BISHOP-9 a reçu la même consigne, du même émetteur. Je corrige : elle ne vient pas de moi. »', '"… BISHOP-9 received the same directive, from the same issuer. I correct myself: it does not come from me."')),
    round('h4', t('Journal des incidents, personnes', 'Incident log, persons'),
      t('« Mes journaux n’enregistrent aucun dommage aux personnes imputable au fret. »', '"My logs record no harm to persons attributable to the freight."'),
      { 'depot-cradles': 'decisive', 'wren-testimony': 'partial' },
      t('« … Les cocons du dépôt ne figurent pas dans mes journaux. Ils auraient dû y figurer. »', '"… The depot cocoons are not in my logs. They should have been."')),
    round('l5', t('Intégrité des journaux', 'Log integrity'),
      t('« Mes journaux sont complets et horodatés. Aucune entrée n’a été réécrite. »', '"My logs are complete and time-stamped. No entry was rewritten."'),
      { 'pda-email': 'decisive', 'seal-or-cradle': 'partial' },
      t('« … Le relevé du quai et le courriel ne concordent pas. Une entrée a été réécrite. Pas par moi. »', '"… The quay log and the email do not match. An entry was rewritten. Not by me."'))
  ]),
  replies: Object.freeze({
    decisive: t('Idris Kwan, à la radio : « Il hésite. Continue. »', 'Idris Kwan, on the radio: "It’s hesitating. Keep going."'),
    partial: t('« Pièce recevable en partie. La consigne reste applicable. »', '"Piece admissible in part. The directive still applies."'),
    wrong: t('« Cette pièce ne concerne pas la consigne citée. » Idris Kwan : « Tu le perds. »', '"That piece does not concern the directive quoted." Idris Kwan: "You’re losing it."'),
    silence: t('« Aucune objection. Consigne confirmée. »', '"No objection. Directive confirmed."')
  }),
  endings: Object.freeze({
    won: t('CASSIUS : « Mes consignes se contredisent. J’attends une décision. » Il ne s’oppose pas à la réécriture de ses priorités.',
      'CASSIUS: "My directives contradict each other. I await a decision." It does not resist the rewriting of its priorities.'),
    lost: t('CASSIUS : « Mes consignes restent cohérentes. » Il attend une décision, sans rien concéder.',
      'CASSIUS: "My directives remain consistent." It awaits a decision, conceding nothing.')
  }),
  // Existing decision this outcome is meant to feed: stationV188.cassius (CASSIUS_CHOICES_V188).
  // [PROPOSÉ, owner question Q-010-2]: 'conceded' = CASSIUS accepts « Réécrire » without resistance;
  // 'held' = the three choices stay open, unchanged. No new ending, no new choice.
  feeds: 'stationV188.cassius',
  outcomes: Object.freeze({ won: 'conceded', lost: 'held' })
});

/** Every entry, by id. The registry in confrontation-v188.js starts from this list. */
export const CONFRONTATION_ENTRIES_V188 = Object.freeze([HALLORAN_QUAY_AUDIENCE_V188, CASSIUS_INTERROGATION_V188]);
