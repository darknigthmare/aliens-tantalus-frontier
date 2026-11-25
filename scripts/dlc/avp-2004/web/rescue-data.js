
/* AVP 0.8: original gameplay rules, not a claim about film props or real first aid. */
(function (G) {
  'use strict';
  const D = G.AVP_DATA;
  D.version = '0.8.0'; D.schema = 8; D.releaseName = 'Personne derrière la grille';
  D.rescueRules = {
    sebastian: { maxHp: 90, reviveHp: 32, armor: 1, woundBelow: 30 },
    scar: { maxHp: 140, reviveHp: 54, armor: .68, woundBelow: 46 },
    reviveTime: 3.8, treatTime: 2.6, stationTime: 4.2, treatAmount: 54,
    hitImmunity: 1.1, reviveImmunity: 2.4, aidRadius: 100
  };
  D.careStations = [
    { id: 'halte-infirmerie', room: 'infirmary', x: 635, y: 144, after: 'gear', title: 'La réserve de l’expédition', description: 'Une caisse récente laissée dans l’infirmerie. Un seul lot de soins pour Lex et les compagnons présents.' },
    { id: 'halte-parvis', room: 'forecourt', x: 1510, y: 156, after: 'facade', title: 'Le palier de descente', description: 'Le matériel de premiers secours est arrimé près du palier. Il faut revenir à pied et se regrouper avant de le déployer.' },
    { id: 'halte-refuge', room: 'refuge', x: 1100, y: 145, after: 'ritual', title: 'Une halte dans la pierre', description: 'L’expédition a laissé une réserve dans le renfoncement. Un abri de vue ne neutralise pas les poursuivants.' },
    { id: 'halte-surface', room: 'tanks', x: 820, y: 146, after: 'escaped', title: 'Avant la banquise', description: 'Une dernière caisse de secours sur le chemin des cuves. Scar doit être proche pour bénéficier des soins.' }
  ];
  const entries = [
    ['Des blessures réelles', 'Sebastian et Scar possèdent une santé distincte. Les ennemis ordinaires peuvent les choisir comme cible lorsqu’ils sont vus plus près que Lex. Ni attaque ni blessure n’est simulée dans une pièce hors écran.', 'forecourt'],
    ['Une frappe engagée', 'Le destinataire d’une attaque est choisi à son anticipation. À l’impact, la portée, l’orientation, la profondeur et la ligne de vue sont vérifiées de nouveau. Un adversaire ne transfère pas son coup à Lex parce que sa première cible s’est écartée.', 'sacrifice'],
    ['Quand le compagnon tombe', 'À zéro santé, le compagnon reste dans la salle où il est tombé. Il ne marche, ne grimpe, ne lit et ne tire plus. Il n’y a pas d’hémorragie fatale ni de nouvelle mort alternative au récit.', 'sacrifice'],
    ['I : porter secours', 'Rejoindre le compagnon au sol et maintenir I pendant 3,8 secondes le remet sur pied avec une santé partielle. Aucun consommable n’est exigé pour empêcher une pénurie de bloquer définitivement le parcours.', 'forecourt'],
    ['I : soigner un compagnon', 'Un compagnon debout et blessé peut recevoir une trousse en maintenant I pendant 2,6 secondes. La trousse est prélevée à la réussite seulement. H conserve le soin personnel de Lex.', 'infirmary'],
    ['Ne pas soigner sous les coups', 'Le soin ne suspend pas le monde. Se déplacer, frapper, esquiver ou recevoir un coup interrompt la manœuvre. Relâcher I remet à zéro sa progression ; aucune trousse n’est dépensée avant la fin.', 'infirmary'],
    ['Des réserves finies', 'Les quatre haltes ne possèdent qu’un lot chacune. Elles restaurent jusqu’à 60 points de Lex et 65 des compagnons debout à proximité. Elles ne donnent ni trousses supplémentaires ni invulnérabilité.', 'infirmary'],
    ['Le calme avant la halte', 'Une menace visible à moins de 580 unités, une poursuite engagée vers la pièce ou la détonation en cours empêchent la halte. Ces protections sont des règles de jeu, pas des conseils médicaux.', 'refuge'],
    ['Rester à portée', 'Un soin ne traverse pas un mur, une porte ou une autre bande de profondeur. La réserve ne soigne pas un compagnon distant. Le relevé principal et la sortie demandent toujours leurs compagnons debout.', 'glyphs'],
    ['L’acide ne choisit pas', 'Le sang acide au sol blesse aussi les compagnons présents. La résistance de l’équipement de Scar réduit les dégâts du jeu sans les annuler. Une blessure critique ralentit les deux personnages.', 'nursery'],
    ['L’ordre reste le même', 'La mise à terre conserve suivi, garde et consigne de tir. Après le secours, un personnage qui gardait son poste continue de le garder. Regrouper ne constitue pas un soin à distance.', 'hunter'],
    ['Un carnet de secours', 'Santé, mises à terre, haltes épuisées et bref délai entre les coups sont conservés. Les soins partiels, les touches maintenues et les jauges d’interface ne sont jamais restaurés.', 'infirmary']
  ];
  for (let i = 0; i < entries.length; i++) D.codex.push({ id: 'rescue-rule-' + i, category: 'Secours', title: entries[i][0], text: entries[i][1], unlockRoom: entries[i][2] });
  for (const p of D.careStations) D.codex.push({ id: p.id, category: 'Secours', title: p.title, text: p.description, unlockRoom: p.room });
})(globalThis);

