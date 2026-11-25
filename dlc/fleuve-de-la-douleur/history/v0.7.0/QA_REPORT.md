# Qualification locale — 0.7.0-candidate.1

Les résultats ci-dessous viennent des suites réellement achevées sur les sources courantes. Aucun compteur historique n’est additionné. Le hash SHA-256 du HTML utilisé par les trois sessions navigateur est `1debd06feb649074ce8aaaeb655d0041718edab1a4a42c74b02d96aaf783dbc0`. Les assertions et groupes ne désignent pas autant de joueurs ou de machines.

| Suite | Résultat | Portée |
|---|---:|---|
| core.cjs | 96/96 | État, progression, collisions, codec |
| colony.cjs | 75/75 | Tableaux, cachettes, soudures, escortes |
| exploration.cjs | 149/149 | Géométrie, détours, visée, mémoire |
| passages.cjs | 118/118 | Raccords, écoute de seuil, détecteur |
| persistence.cjs | 18/18 | MemoryStorage simulé, pas stockage natif certifié |
| life.cjs | 141/141 | Habitants, coffres, ateliers, balises |
| defense.cjs | 121/121 | Volets, alarmes, contournements, tirs |
| ducts.cjs | 112/112 | Propriété unique, grilles, préavis, proximité, pression, migrations |
| installer.mjs | 28/28 | Hôtes de test, conflits, restauration |
| upgrade-real.mjs | 4/4 | Vrai payload 0.6 → 0.7 sur un shell hôte de test |
| browser-v07.py A | 18/18 | Début au clavier, ancien export 0.6, verrouillage, relevé et carte |
| browser-v07.py B | 14/14 | Adulte existant, transfert, préavis, pression, exports réels, Newt |
| browser-v07.py C | 15/15 | Formats courts à 130 %, commandes, menus hérités, interruption |

**Modèle : 830/830. Navigateur courant : 47/47.** Les anciens 145 contrôles navigateur de la 0.6 ne sont pas revendiqués comme rejoués. Les 12 captures sont décrites dans les rapports BROWSER_V07A/B/C.json. Les cinq familles de parcours sont comptées séparément.

| Pilote | Résultat | Portée |
|---|---:|---|
| traversal.cjs | 6/6 | Campagne principale, deux vues × trois difficultés |
| traversal-exploration.cjs | 6/6 | Six détours et leurs raccourcis |
| traversal-life.cjs | 6/6 | Résidents, conversations, réserves, fabrication et pose |
| traversal-defense.cjs | 6/6 | Volets et alarmes accessibles tôt, puis campagne |
| traversal-ducts.cjs | 6/6 | Dix grilles fermées/libérées/écoutées sur place, héritage et campagne |

## Continuité, pas une durée de jeu humaine

Les trente pilotes utilisent les déplacements et commandes du modèle depuis une partie neuve. Ils ne téléportent pas le joueur, ne réécrivent pas sa santé et n’appellent pas de validation forcée d’objectif. Les soins disponibles et l’assistance de début de chapitre restent actifs. Les pilotes connaissent itinéraires et solutions ; aucune difficulté finale ou durée de campagne humaine n’est déduite de leurs chronomètres.

Le tour des dix grilles est effectué avant la crise. Les vrais transferts tardifs éventuels ne remplacent pas les tests localisés : créature sous pression, sortie occupée, perception, compagnon proche, mort pendant entrée, pièce pleine et rupture sont vérifiés séparément. Les fixtures tardives du navigateur sont des sauvegardes explicitement préparées, validées puis chargées par le sélecteur ordinaire. Pas de modification de position, de santé ou de temps pendant l’interaction navigateur.

## Navigateur et stockage

CLI agent-browser absent dans cet environnement. La navigation HTTP locale a été refusée : Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR at http://127.0.0.1:43599/JOUER.html. Le HTML exact a été exécuté avec set_content dans une origine opaque autorisée, sans changement de politique ni contournement.

Les boutons et touches commandent la simulation normale. Les attentes portent sur l’état observable ou son temps réellement écoulé, jamais sur une écriture de la minuterie. Les trois sessions sont séparées pour borner leurs ressources. Une première attente échouée visait le libellé historique « PIÈCE COURANTE » ; le bouton réel est « PIÈCE ACTUELLE ». Le sélecteur de test a été corrigé, puis la session entière a été rejouée. Seules les recettes finales achevées sont retenues.

Les exports JSON d’une grille verrouillée, d’un adulte en transport et d’une grille endommagée sont téléchargés puis réimportés. L’identité, la santé et la propriété unique sont conservées, sans double manipulation ou nouvelle créature. Les fichiers real-v01-save.json à real-v06-save.json proviennent des anciennes livraisons ; ils ne sont pas des états courants renommés. Les six sont vérifiés par le modèle ; le vrai 0.6 est aussi importé par le navigateur courant.

Le protocole de double copie et ses erreurs de quota restent éprouvés avec MemoryStorage explicitement simulé. La persistance native après fermeture reste non qualifiée, comme le mode privé, plusieurs onglets simultanés et les quotas réels. La réussite de l’import/export ne certifie pas ces comportements.

## Corrections découvertes pendant cette passe

Le verrouillage vérifie désormais toute présence d’un adulte à la bouche, même s’il n’est pas déjà dans l’état d’entrée. La vérification est refaite à la fin du travail. Une balle mortelle efface l’entrée de gaine du cadavre, pour qu’un export ne contienne pas une créature morte prétendument engagée. Les grilles libérées ne récupèrent pas de santé. Le menu affichait un ancien numéro 0.5 : sa version visible est maintenant 0.7. Le raccourci 4 est inscrit dans l’aide. Le libellé du détecteur est maintenant hors du masque arrondi du radar, pour ne plus en rogner les lettres.

## Captures, documents et périmètre non couvert

Les PNG sont des captures de Chromium exécutant le HTML fourni, pas des illustrations d’intention. Le rapport associe chaque image à la méthode de préparation et à sa pièce. Les formats portrait et paysage courts sont émulés ; ils ne certifient ni téléphone, ni Safari, ni manette physique. Les tests du rapport illustré sont documentaires, séparés des 47 contrôles du jeu.

Les mises à niveau utilisent le vrai module et l’installateur 0.6 dans un shell de test ; aucun build de l’hôte Tantalus complet n’est revendiqué. Les grilles sont des stations non collisionnables, les gaines des transports discrets, pas des salles pour le joueur ou un réseau d’IA continu. Les sorties hors champ restent en attente, et occuper leur dégagement peut volontairement retarder une arrivée. Les autres limitations de production restent visibles.

DLC autonome avec lanceur additionnel, pas le jeu Tantalus complet ni son GameEngine natif. Aucun push GitHub ni déploiement Vercel. Dessins stylisés par code provisoires, pas atlas définitifs ou reconstitution 1:1. Roman intégral non consulté : plans, dialogues, tâches et documents sont une condensation originale. L’écho Frontière 2204 et les sauvegardes du moteur hôte ne sont pas modifiés.
