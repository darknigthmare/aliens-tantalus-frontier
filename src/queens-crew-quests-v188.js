// V188 — the three Tantalus quests tied to « La Saison des Reines » (bible §14.9,
// spec 011 T103): `ship-q-doyle`, `ship-q-orlov`, `ship-q-harlow`. They run with
// the rules of the other crew quests (`crew-quests-v188.js` appends them): offered
// in the hub conversation, listed at the briefing table, an analysis quest pays
// only when its last reading is answered from the evidence.
// Ids, givers, titles and the moment (« après l'arc 2 ») come from §14.9; the
// evidence, the readings, the lines and the values are [PROPOSÉ] (bible §14.11).
// Effects produced here: loyalty, research, and the bestiary of the adaptations
// (`queensBestiaryV188`, unlocked by `ship-q-harlow`). The smartgun's anti-air
// tuning and the Cheyenne upgrade are recorded as finished quests only: no
// weapon or vehicle statistic changes yet (spec 011 « Reste »).
import { queensArcCompleteV188 } from './side-campaign-queens-v188.js';

const t = (fr, en) => Object.freeze({ fr, en });
const option = (id, label, correct = false) => Object.freeze({ id, label, correct });
const step = (prompt, options, explain) => Object.freeze({ prompt, options: Object.freeze(options), explain });
const afterArc2 = save => queensArcCompleteV188(save, 2);
const AFTER = t('Après l’arc 2 de « La Saison des Reines » (Echo Basin)', 'After Arc 2 of "The Season of Queens" (Echo Basin)');

export const QUEENS_CREW_QUESTS_V188 = Object.freeze([
  Object.freeze({
    id: 'ship-q-doyle', crewId: 'crew-07-sanaa-doyle', giver: 'Sanaa Doyle', slot: 'quest-sentry', kind: 'analysis',
    title: t('Tirer sur ce qui vole', 'Shooting What Flies'), after: AFTER,
    where: t('Sanaa Doyle, à l’armurerie ou sur sa ronde.', 'Sanaa Doyle, at the armoury or on her rounds.'),
    offer: t('« Sur les falaises, le smartgun a suivi des cibles qui n’étaient plus là. J’ai les bandes de visée. Aide-moi à comprendre ce qu’il regardait. »',
      '"On the cliffs, the smartgun tracked targets that weren’t there anymore. I have the aiming tapes. Help me work out what it was looking at."'),
    available: afterArc2,
    steps: Object.freeze([
      step(t('Bande de visée, falaises d’Echo Basin : le smartgun accroche une cible en piqué, puis tire à l’endroit où elle était une demi-seconde plus tôt. Au sol, la même arme ne manque pas.',
        'Aiming tape, Echo Basin cliffs: the smartgun locks a diving target, then fires where it was half a second earlier. On the ground, the same weapon does not miss.'),
      [option('lead', t('Le suivi est réglé pour une cible qui court, pas pour une cible qui tombe.', 'The tracking is tuned for a target that runs, not one that falls.'), true),
        option('jam', t('L’arme s’est enrayée à cause de la poussière.', 'The weapon jammed because of the dust.'))],
      t('Doyle : « Pas d’enrayage sur la bande. Elle tire. Elle tire juste, sur du vide. »', 'Doyle: "No jam on the tape. It fires. It fires true, at nothing."')),
      step(t('Deuxième bande : dans le canyon, le capteur de mouvement du harnais affiche trois contacts pour une seule créature. Les deux autres apparaissent toujours du côté de la paroi.',
        'Second tape: in the canyon, the harness motion sensor shows three contacts for a single creature. The other two always appear on the wall side.'),
      [option('echo', t('Des échos : il faut ignorer les contacts collés aux parois.', 'Echoes: contacts stuck to the walls must be ignored.'), true),
        option('pack', t('Elles chassent par trois.', 'They hunt in threes.'))],
      t('Doyle : « Une seule est tombée du surplomb. J’y étais. Les deux autres, c’était la roche. »', 'Doyle: "Only one dropped from the overhang. I was there. The other two were the rock."'))
    ]),
    completion: t('TIRER SUR CE QUI VOLE · Sanaa note deux réglages sur le harnais du smartgun : avance de tir pour une cible en chute, filtre des contacts de paroi. « La prochaine qui tombe du ciel, je l’attends en dessous. »',
      'SHOOTING WHAT FLIES · Sanaa notes two settings on the smartgun harness: lead for a falling target, a filter for wall contacts. "The next one that drops from the sky, I’ll be waiting underneath."'),
    doneNote: t('Smartgun (Doyle) : réglages anti-aériens notés. Effet en mission à produire.', 'Smartgun (Doyle): anti-air settings noted. Mission effect still to be produced.'),
    reward: Object.freeze({ loyalty: 10 })
  }),
  Object.freeze({
    id: 'ship-q-orlov', crewId: 'crew-08-maksim-orlov', giver: 'Maksim Orlov', slot: 'quest-flight-recorder', kind: 'analysis',
    title: t('Le vent des canyons', 'The Canyon Wind'), after: AFTER,
    where: t('Maksim Orlov, au hangar ou sur sa ronde.', 'Maksim Orlov, at the hangar or on his rounds.'),
    offer: t('« Le Cheyenne est rentré des falaises avec une tuyère tordue et un enregistreur plein. Je veux savoir ce qui l’a secoué avant d’y retourner. »',
      '"The Cheyenne came back from the cliffs with a bent nozzle and a full recorder. I want to know what shook it before I go back."'),
    available: afterArc2,
    steps: Object.freeze([
      step(t('Enregistreur de vol : à chaque passage sous un surplomb, le Cheyenne perd quarante mètres en deux secondes, puis les reprend. Le moteur ne varie pas.',
        'Flight recorder: on every pass under an overhang, the Cheyenne loses forty metres in two seconds, then gains them back. The engine does not vary.'),
      [option('rotor', t('Un courant descendant le long de la paroi : passer au large des surplombs.', 'A downdraught along the wall: keep clear of the overhangs.'), true),
        option('engine', t('Une panne moteur intermittente.', 'An intermittent engine fault.'))],
      t('Orlov : « Le moteur est propre. C’est l’air qui tombe. Les nids sont là où l’air tombe : elles le savent. »', 'Orlov: "The engine is clean. It’s the air that falls. The nests are where the air falls: they know it."')),
      step(t('Rapport de structure : la tuyère gauche a été tordue par un choc venu d’en haut, pas par un tir. Trace d’acide sur le carénage.',
        'Structural report: the left nozzle was bent by an impact from above, not by a shot. Acid trace on the fairing.'),
      [option('plate', t('Blinder le dessus des tuyères et garder de l’altitude.', 'Armour the top of the nozzles and keep altitude.'), true),
        option('speed', t('Voler plus bas et plus vite.', 'Fly lower and faster.'))],
      t('Orlov : « Plus bas, c’est chez elles. Je monte, et je mets une plaque là où elles tombent. »', 'Orlov: "Lower is their place. I climb, and I put a plate where they land."'))
    ]),
    completion: t('LE VENT DES CANYONS · Orlov soude deux plaques au-dessus des tuyères du Cheyenne et réécrit ses approches : au large des surplombs, jamais sous le vent des parois.',
      'THE CANYON WIND · Orlov welds two plates above the Cheyenne’s nozzles and rewrites his approaches: clear of the overhangs, never downwind of the walls.'),
    doneNote: t('Cheyenne (Orlov) : plaques et approches revues. Effet en vol à produire.', 'Cheyenne (Orlov): plates and approaches revised. Flight effect still to be produced.'),
    reward: Object.freeze({ loyalty: 10 })
  }),
  Object.freeze({
    id: 'ship-q-harlow', crewId: 'crew-09-inez-harlow', giver: 'Inez Harlow', slot: 'seal-fragment', kind: 'analysis',
    title: t('L’arbre des lignées', 'The Tree of the Lineages'), after: AFTER,
    where: t('Inez Harlow, au laboratoire ou sur sa ronde.', 'Inez Harlow, in the laboratory or on her rounds.'),
    offer: t('« J’ai trois lignées et aucun arbre. Si je les classe mal, je me trompe sur leur origine. Regarde les relevés avec moi. »',
      '"I have three lineages and no tree. If I classify them wrongly, I get their origin wrong. Look at the readings with me."'),
    available: afterArc2,
    steps: Object.freeze([
      step(t('Relevés de Nacre-7 : carapace lisse, respiration en eau froide, œufs fixés comme des coraux sur les coques immergées.',
        'Nacre-7 readings: smooth carapace, cold-water breathing, eggs fixed like coral on sunken hulls.'),
      [option('milieu', t('Une adaptation au milieu : la lignée a pris les traits de l’eau froide.', 'An adaptation to the environment: the lineage took on the traits of cold water.'), true),
        option('species', t('Une autre espèce, sans rapport avec les œufs QZ17.', 'Another species, unrelated to the QZ17 eggs.'))],
      t('Inez : « Même structure d’œuf que ceux de Cocyte. Même organisme. C’est l’eau qui a changé le reste. »', 'Inez: "Same egg structure as the Cocyte ones. Same organism. The water changed the rest."')),
      step(t('Relevés d’Echo Basin : deux formes sur un même monde. L’une creuse la roche tendre, l’autre plane depuis les surplombs. Coquilles du même âge dans les deux nids.',
        'Echo Basin readings: two forms on one world. One digs the soft rock, the other glides from the overhangs. Shells of the same age in both nests.'),
      [option('two', t('Deux dépôts faits en même temps, dans deux milieux du même monde.', 'Two deposits made at the same time, in two environments of the same world.'), true),
        option('drift', t('Une seule lignée qui s’est divisée au fil des générations.', 'A single lineage that split over generations.'))],
      t('Inez : « Pas le temps pour des générations. Même âge, deux milieux. On a posé deux lots. »', 'Inez: "No time for generations. Same age, two environments. Two batches were set down."')),
      step(t('Les trois lignées côte à côte : trois milieux, un seul organisme, des dépôts datés des mêmes six mois.',
        'The three lineages side by side: three environments, a single organism, deposits dated to the same six months.'),
      [option('root', t('Une seule racine : un foyer d’origine d’où tous les œufs sont partis.', 'A single root: one source from which all the eggs left.'), true),
        option('chance', t('Trois infestations sans lien.', 'Three unrelated infestations.'))],
      t('Inez : « Trois branches, un tronc. Et quelqu’un qui tient l’arrosoir. »', 'Inez: "Three branches, one trunk. And someone holding the watering can."'))
    ]),
    completion: t('L’ARBRE DES LIGNÉES · Inez épingle l’arbre au mur du laboratoire : une racine, trois branches. Le bestiaire des adaptations est ouvert à la table de briefing ; chaque lignée y entre quand son arc est terminé.',
      'THE TREE OF THE LINEAGES · Inez pins the tree to the laboratory wall: one root, three branches. The bestiary of the adaptations is open at the briefing table; each lineage enters it when its arc is over.'),
    reward: Object.freeze({ loyalty: 10, research: 10 })
  })
]);
export const QUEENS_CREW_QUEST_IDS_V188 = Object.freeze(QUEENS_CREW_QUESTS_V188.map(quest => quest.id));
