# Source de vérité des promesses de gameplay — v1 à v51

Ce document fixe le périmètre demandé dans la conversation publique fournie par le propriétaire du projet. Il ne valide aucune fonction à lui seul : une promesse n'est considérée comme tenue que si elle possède une action jouable, une conséquence persistante lorsqu'elle s'y prête et un test d'acceptation qui exécute cette action.

## Règle de preuve

- `effective` : l'action est jouable dans le runtime, ses données influencent le résultat et un test l'exécute.
- `systemic` : toutes les entrées du catalogue passent par un adaptateur jouable commun; elles ne prétendent pas disposer chacune d'un niveau ou d'une animation artisanale unique.
- `partial` : une partie seulement de la promesse est exécutable.
- `absent` : champ, carte, texte, compteur ou bouton sans conséquence de gameplay.

Un filtre, une galerie, une fiche de lore, un bouton de navigation ou une quantité de contenu ne constituent jamais une mécanique.

## Promesses consolidées de la conversation

1. Messages 2–3 : produire un véritable successeur spirituel professionnel d'`Aliens: Infestation`, avec exploration, furtivité, combat, level design, cohérence du lore et systèmes interconnectés.
2. Message 4 : rendre utilisables les armes et équipements issus des références Alien retenues, pas seulement les afficher.
3. Message 5 : permettre les tenues de Marines et les variantes humaines/synthétiques comme joueur, allié, PNJ ou adversaire selon leur rôle.
4. Message 6 : donner aux familles d'ennemis des statistiques, fréquences, habitats, comportements et lieux de rencontre effectifs.
5. Message 7 : rendre pilotables les véhicules terrestres, aériens, maritimes et spatiaux; affecter les alliés aux sièges et exécuter leurs actions.
6. Message 8 : faire de l'USS Tantalus une base-vaisseau jouable et proposer au moins cinquante mondes avec colonies, complexes, processeurs atmosphériques, intérieurs et extérieurs.
7. Messages 9–19 : conserver tout le périmètre déjà annoncé, vérifier ce qui manque et approfondir au lieu de remplacer les fonctions précédentes.
8. Message 21 : utiliser des images OpenAI originales lorsqu'un asset manque, avec provenance et intégration runtime.
9. Messages 22–25 : continuer jusqu'à fermer les manques, pas jusqu'à produire une liste de projets futurs.
10. Message 26 : le hub doit être un niveau parcourable et non un écran composé de boutons.
11. Message 27 : aucune fonction de la v1 ne doit disparaître; l'arsenal, les ennemis, les véhicules et les autres systèmes restent accessibles.
12. Message 28 : proposer un éditeur en blocs/écran pour les missions et l'intérieur du vaisseau, sauvegardable et réellement jouable.
13. Messages 30–34 : poursuivre la création des lieux, planètes, menaces et systèmes manquants avec des conséquences cohérentes.
14. Message 35 : couvrir les castes xénomorphes originales, les factions humaines et les rôles ennemis par des variantes systémiques distinctes.
15. Message 36 : intégrer les inspirations Kenner/NECA dans une continuité cohérente et explicitement adaptée.
16. Message 39 : prendre en charge les variantes Red Hive et K-Series comme comportements/rencontres, pas comme noms seuls.
17. Message 40 : intégrer les références `Dark Descent`, `Rogue Incursion`, `AVP`, Jaguar, Arcade, `Armageddon` et `Crucible` au travers de lieux, équipements, ennemis, véhicules ou missions jouables.
18. Message 41 : intégrer `Alien: Earth`, `Prometheus`, `Covenant` et `Fire and Stone` selon le même contrat.
19. Messages 43–44 : auditer l'ensemble depuis le début, y compris `Alien 5`, les courts officiels et les omissions constatées.
20. Message 45 : réaliser une passe gameplay puis un Metroidvania moderne multi-écrans, horizontal et vertical, avec embranchements, conduits et parallaxe.
21. Message 47 : transformer les éléments manquants en fonctions intégrées plutôt qu'en contenu décoratif.
22. Message 48 : conserver le nom final `Aliens: Tantalus Frontier` tout en poursuivant l'intégration.
23. Message 49 : chaque mission de lore doit avoir une opération MIRE et une conséquence Frontier cohérente dans le monde persistant.
24. Message 50 : les spécimens uniques peuvent réapparaître hors de leur mission si la simulation fournit une justification et une règle de spawn.
25. Message 51 : rendre le contrôle Neuro-Xeno/ATARAX/Ripper jouable, avec signal, échec, contre-mesures, adversaires et classe joueur compatible.
26. Message 52 : chaque famille réellement animée doit disposer d'une plaque, de clips, pivots, hitboxes et événements documentés; une plaque de galerie non consommée ne suffit pas.
27. Message 53 : adapter les concepts de `Colonial Marines` et du projet `Alien: Crucible` en nouvelles menaces et rencontres cohérentes.

## Conditions d'acceptation transversales

- Une campagne consomme son monde, son mode, son objectif, son plan, ses routes, ses dangers, son escouade, son équipement et son véhicule.
- Une victoire, une retraite ou une défaite modifie le monde, l'équipage, le vaisseau et les ressources de manière traçable.
- Une arme équipée utilise au minimum ses dégâts, cadence, chargeur, rechargement, pénétration et famille.
- Un équipement équipé fournit une action ou un modificateur limité par ses charges.
- Un ennemi consomme sa biologie, son comportement, sa vitesse, son armure, son acide, sa fréquence et ses habitats.
- Un véhicule se déplace comme entité, possède une coque, consomme ses sièges et expose leurs actions.
- L'éditeur compile les tuiles courantes en géométrie, spawn, objectif, portes, dangers et ennemis du playtest.
- Le hub contient des routes physiques, des incidents et des services qui affectent réellement la simulation.
- La difficulté, le coop, les sous-titres et la réduction des mouvements ont chacun un consommateur runtime vérifiable.
- La gate de sortie comprend des tests Node ciblés et un parcours navigateur de la boucle complète.

La matrice d'audit v51 associe ces promesses à leurs modules et tests. Toute ligne sans preuve exécutable reste ouverte, même si son contenu existe dans `src/content.js`.
