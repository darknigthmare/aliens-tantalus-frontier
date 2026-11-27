/* V0.3 original game content. No canonical dialogue or official assets copied. */
(() => {
  'use strict';
  const D=BO_DATA;
  D.version='0.3.0';D.schema=3;D.subtitle='Les voix dans le noir';D.edition='Les voix dans le noir';
  const kinds=['power','pressure','signal'];
  D.chapters.forEach((chapter,i)=>chapter.tasks.forEach((task,j)=>{
    const kind=kinds[(i+j)%3];
    task.protocol={id:`${chapter.id}-protocol-${j+1}`,kind,ordinal:i*3+j};
  }));
  const rules=[
    ['Intervenir, pas seulement attendre','Un équipier doit atteindre le terminal, puis préparer 30 % de l’intervention. La suite attend un réglage validé. Les réglages ne sont pas accessibles à distance sans présence humaine.'],
    ['Alimentation : trois bus','Six départs ont chacun une signature A/B/C. Activez une combinaison dont les trois sommes correspondent aux cibles affichées, puis validez. Plusieurs combinaisons peuvent être acceptées.'],
    ['Pression : trois boucles couplées','Les vannes A, B et C parcourent sept crans. A agit sur les circuits I et II, B sur II et III, C sur I et III. Les touches moins permettent de revenir en arrière sans pénalité.'],
    ['Transmission : signal étalon','Réglez fréquence, phase et gain pour faire coïncider la courbe locale avec l’étalon. Le signal doit rester aligné 1,5 seconde en présence d’un opérateur avant validation.'],
    ['Validation erronée','Un réglage modifié ne coûte rien. Seule une validation incorrecte consomme deux points de batterie et produit un bruit de poids 7. Le délai entre validations est de quatre secondes.'],
    ['Assistance explicite','L’assistance facultative résout chaque réglage après douze secondes de travail supplémentaire au terminal. Elle est signalée dans les résultats et dans la sauvegarde. Elle n’est jamais activée silencieusement à l’import.'],
    ['Travail interrompu','Préparation, réglages et validation acquis sont conservés au départ du terminal. La stabilisation de transmission exige de nouveau une présence active. La résolution et l’animation de travail sont deux états distincts.'],
    ['Blessures persistantes','Le premier contact prolongé blesse, le suivant est mortel. Un blessé se déplace et intervient à 75 % de sa capacité. Une blessure survit au passage entre secteurs.'],
    ['Quatre trousses pour la traversée','L’équipage partage quatre trousses. Un soin prend six secondes immobiles, utilise une trousse à la fin et restaure un point de santé. Aucun soin n’annule une mort.'],
    ['Soin interrompu','Un nouvel ordre, un déplacement direct, un contact observé ou un changement de secteur interrompt le soin sans dépenser la trousse. Les trousses ne sont pas réservées quatre fois simultanément.'],
    ['Prudence facultative','En prudence, un équipier réagit à une menace qu’il voit dans sa propre pièce. Il cherche une porte ouverte qui l’éloigne du contact et rejoint ensuite un casier. Il ne connaît pas les positions dans les salles voisines.'],
    ['Aucun mur transparent pour les civils','L’autonomie vérifie portée et occultation par les volumes physiques. Elle peut agir pendant une coupure radio mais ne fournit pas une vue omnisciente au joueur.'],
    ['Reprendre un ordre suspendu','Un repli conserve l’ordre interrompu. Le joueur décide de le reprendre avec le bouton dédié ; il n’existe pas de retour automatique dans une pièce encore dangereuse.'],
    ['Binômes physiques','Un suiveur se déplace à travers les portes et contourne le mobilier. Une boucle de suivi, le suivi de soi-même ou d’un équipier mort est refusé. Une cloison fermée bloque réellement la liaison.'],
    ['Soutien au terminal','Un binôme à moins de 125 unités d’un opérateur dans la même pièce apporte 15 % de vitesse de travail. Le soutien n’ajoute pas une seconde validation et ne remplace pas l’opérateur.'],
    ['Tension utile au gameplay','Au-dessus de 65 % de tension, le travail ralentit de 20 %. Rassurer un équipier retire 35 points, coûte deux points de batterie et impose vingt secondes de délai radio.'],
    ['Dernier sas','Après la dernière intervention, tous les survivants doivent rester douze secondes au sas. La traque et le refuge restent actifs. Un départ du sas remet l’amarrage à zéro.'],
    ['Répéter sans ressusciter le passé','Recommencer le secteur revient à ses effectifs, trousses, santé et compteurs d’entrée. Les morts des secteurs précédents ne reviennent pas. Les v1/v2 importées utilisent leur état d’import comme référence de reprise.'],
    ['Sauvegardes v3 séparées','La v3 utilise son propre emplacement local. Les formats v1, v2 et v3 sont acceptés ; aucun export v3 n’est présenté comme compatible en retour avec les anciens exécutables.'],
    ['Import transactionnel','Un fichier invalide est refusé avant mutation. Santé, trousses, protocoles, suivi, soins, amorçage et compteurs sont validés. La partie restaurée reste en pause.'],
    ['Pause lisible','La pause et les fenêtres du codex interrompent réellement le temps. Les commandes tactiques peuvent être préparées en pause. Les compteurs de stabilisation ne progressent pas en pause.'],
    ['Information de surveillance','Le capteur fournit les pièces occupées. Les coordonnées exactes nécessitent d’observer effectivement une caméra intacte de la pièce. Les mouvements en gaine restent masqués.'],
    ['Graine de campagne','La graine choisie au départ règle les variantes des protocoles et le hasard de la traque. Le générateur est indépendant pour que les réglages ne consomment pas de tirages de l’IA.'],
    ['Épilogues conditionnels','Le récit final dépend du nombre de survivants ; le bilan précise les blessures et les aides utilisées. Il s’agit de textes originaux de cette adaptation, pas d’une restitution des dialogues officiels.']
  ];
  rules.forEach(([name,text],i)=>D.rules.push({id:`BO-V3-${i+1}`,name,text}));
  D.protocolTypes={power:'Répartition électrique',pressure:'Boucles de pression',signal:'Synchronisation de transmission'};
  D.crew.forEach((c,i)=>{c.description=[
    'Saito garde les gestes courts et surveille les raccords. Son efficacité mécanique ne le protège ni du stress ni d’une blessure.',
    'Thorncroft reconnaît les procédures de sécurité. Il peut accompagner un autre opérateur ou tenir un poste sans devenir indispensable.',
    'Studwick préfère les séquences de diagnostic aux ordres vagues. Son binôme est un soutien de proximité, pas un bonus à travers les murs.',
    'Yutani connaît les procédures d’accès. Son nom ne déverrouille aucune porte gratuitement : elle doit atteindre les consoles comme les autres.'
  ][i];});
})();
