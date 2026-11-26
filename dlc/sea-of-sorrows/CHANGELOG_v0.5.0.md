# 0.5.0 — La trace des vivants

Suite cumulative locale de la 0.4.0, sans intégration native, publication ou changement de continuité.

## Poursuite physique entre salles

32 liaisons autorisées symétriquement. Un adulte ou facehugger déjà engagé peut rejoindre la porte que Decker vient d’emprunter, puis franchir son seuil réciproque. Approche réelle, préavis d’environ 2,2 secondes, identité / santé / mousse conservées. Aucune nouvelle apparition ni téléportation vers un point arbitraire. Les allers-retours et sauvegardes ne dupliquent pas la créature.

Départ conditionné par contact récent, ligne de vue, chemin et portée ; pas de poursuite arbitraire depuis une patrouille ou un leurre. Deux créatures par départ au maximum. Un individu doit repercevoir le joueur pour poursuivre vers une nouvelle salle. Trajet perdu après 24 secondes : il reste à sa dernière position dans la salle source. Exclusions : transports, ascenseurs, reine, capture et passages narratifs condamnés.

## Regroupement corrigé

Les brancards doivent être proches ET disposer d’un trajet jusqu’au seuil : une cloison fermée interdit désormais leur transfert même à courte distance. Manning doit aussi pouvoir rejoindre le passage et être rassemblé pendant sa présence active. La carte continue de fournir des informations de graphe sans confondre celles-ci avec un départ physiquement autorisé.

## Commandes et sauvegardes

N parcourt riposte, feu libre, ne pas tirer. Le mode sans tir ne change pas le suivi ou la position assignée. U ouvre un journal limité aux 24 derniers faits consignés ; il ne révèle pas les ennemis cachés.

Trois points de repli validés dans une clé distincte, proposés au titre et dans Pause. Confirmation avant restauration, conservation de la progression en cours de choix, récupération possible malgré une sauvegarde courante illisible, refus d’écriture signalé. Ce sont des copies dans le même stockage du navigateur, pas des sauvegardes externes.

Schéma 5, migrations 1–4 et copie de l’ancien schéma sous `.backup-v4` lors de la reprise quand le stockage fonctionne. Validation des populations déplacées et rejets transactionnels des états malformés.

## Présentation et outillage

Avertissement au seuil rendu dans la scène et près de l’objectif, également visible en 960 × 720. Quatre notices ajoutées au codex (96 au total). Les 46 fiches détaillent les passages éligibles à la poursuite. Les anciens générateurs de parcours écrivent désormais leurs résultats dans des répertoires de relance distincts : ils ne remplacent pas les anciennes sauvegardes utilisées pour vérifier les migrations.

203 tests Node ; 149 contrôles de jeu dans Chromium. Six parcours complets avec retraite poursuivie réelle, 198 reprises après objectifs. Les échecs du pilote direct en Latérale / Survie et Latérale / Oppression restent consignés. Rendu vectoriel provisoire, tests automatisés non assimilés à des parties humaines, persistance native non certifiée dans cet environnement.
