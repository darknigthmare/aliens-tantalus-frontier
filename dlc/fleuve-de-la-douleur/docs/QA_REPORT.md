# Qualification locale — 0.9.0-candidate.1

Résultats des suites achevées sur le code courant. Les versions archivées ne sont pas additionnées. Un groupe de test n’est pas un joueur, une machine ou une partie humaine.

| Suite | Réussite |
|---|---:|
| CORE_TEST_RESULTS | 101/101 |
| COLONY_TEST_RESULTS | 75/75 |
| EXPLORATION_TEST_RESULTS | 159/159 |
| PASSAGES_TEST_RESULTS | 122/122 |
| PERSISTENCE_TEST_RESULTS | 18/18 |
| LIFE_TEST_RESULTS | 141/141 |
| DEFENSE_TEST_RESULTS | 121/121 |
| DUCT_TEST_RESULTS | 112/112 |
| MOBILITY_TEST_RESULTS | 91/91 |
| FIDELITY_TEST_RESULTS | 306/306 |

**Modèle : 1246/1246. Parcours complets : 42/42. Navigateur courant : 35/35. Installateur : 28/28. Montée réelle 0.8 → 0.9 sur shell hôte de test : 4/4.**

## Portée des preuves

Les 256 essais de seuil sont 128 extrémités × deux vues. Leur scène est explicitement préparée avec les autorisations nécessaires, puis E et le temps normal du modèle accomplissent le passage. Le contrôle de géométrie marche jusqu’aux objets dans les 47 pièces. Les positions de retour utilisent le retrait réel de 75 unités prévu par le moteur.

Les six pilotes les plus complets partent d’une nouvelle partie, visitent les 47 lieux, prélèvent la dotation, manipulent l’armement, inspectent les cinq nouvelles salles, franchissent la corde dans les deux sens et terminent les 49 objectifs, les escortes et les activités héritées. Ils marchent avec Simulation.update, sans téléportation, validation forcée d’objectif ou réécriture de santé. Les soins et l’assistance de chapitre prévus dans le jeu restent actifs. Ils connaissent les chemins et ne mesurent ni la durée humaine ni l’équilibrage de découverte.

Les dommages, interruptions et importations invalides sont des fixtures dédiées. Les grenades, le M240 et leur coût individuel sont vérifiés séparément ; il ne s’agit pas d’une certification de tous les combats possibles.

## Navigateur

Le CLI agent-browser n’est pas installé. La tentative HTTP locale a été bloquée (ERR_BLOCKED_BY_ADMINISTRATOR), consignée dans docs/HTTP_PREVIEW_V09.json. Le fichier exact est exécuté par Playwright set_content dans l’origine opaque autorisée, sans modifier les politiques. Le menu et les touches servent aux actions. Les scènes ciblées sont des sauvegardes préparées puis importées avec le sélecteur ordinaire, jamais des changements de position en pleine recette.

Le premier test de démarrage visait par erreur le libellé réservé à une reprise de sauvegarde ; il a été corrigé pour le vrai bouton PRENDRE LE CONTRÔLE. Les passages temporisés attendent leur véritable état travel. Une première série de prévisualisations a révélé une perte d’arguments dans le wrapper de décor, qui interrompait les images alors que le HUD continuait. Le wrapper transmet maintenant pièce et état. Les prévisualisations en échec ne sont pas les captures du rapport final.

Les vrais téléchargements de dotation et de grenade en vol sont réimportés, sans nouvelle ressource ou deuxième projectile. Le vrai fichier 0.8 issu de l’archive précédente est importé. Le stockage natif après fermeture, les quotas réels et les onglets concurrents restent non qualifiés ; MemoryStorage éprouve le protocole seulement.

## Corrections et limites

Une cible atteinte à courte portée n’est plus masquée par une interaction distante : ceci corrige notamment les seuils voisins d’un panier ou d’un résident. Les visuels du pilote, des œufs et des supports de l’épave ne réutilisent plus le mobilier colonial. Le repère de transmission n’emprunte pas la silhouette d’un autre personnage.

Support architectural visuel ne signifie pas géométrie de murs 3D entièrement collisionnable. Les modèles d’armes et les apparences sont stylisés et en partie interprétés. La présence de tous les lieux ou matériels du livre entier n’est pas certifiée.

DLC autonome avec lanceur additionnel. Aucun GameEngine natif de Tantalus fusionné, aucun push GitHub ou déploiement Vercel. Plans et dialogues originaux ; roman intégral non disponible dans les sources consultées. Graphismes vectoriels stylisés provisoires, pas une ressemblance photoréaliste ni des atlas définitifs. L’objectif 1:1 n’est pas certifié.

SHA-256 du jeu qualifié : `91ae538879b939018cea5dc3ba2eb9e45faea7693fdd952efbe8531b33cdfced`
