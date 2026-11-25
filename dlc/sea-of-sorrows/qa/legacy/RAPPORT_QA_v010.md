# Rapport de validation — v0.1.0

Date de fabrication : 29 septembre 2026.

## Résultats exécutés

**34 tests Node réussis sur 34** : 28 tests de données / simulation et 6 tests de copie locale / désinstallation. Journaux : `core-tests.tap` et `all-node-tests.log`. Les vérifications de syntaxe des quatre fichiers JavaScript passent.

**22 contrôles de navigateur réussis sur 22** et **80 rendus de salle** : les 40 salles ont été rendues dans les deux présentations globales avec Chromium, piloté par Playwright. Aucune exception JavaScript n’a été observée pendant ce scénario. Journal structuré : `browser-tests.json` ; script reproductible : `qa/browser_check.py`.

Les 33 objectifs ont été validés dans les deux modes en utilisant les portes autorisées par le graphe. Les mises en situation du test positionnent les acteurs près des interactions et préparent la fin du combat de la reine ; elles ne constituent pas un parcours humain en conditions normales. Les mécaniques de bouclier / attaches, de tir, de mousse et de caisson possèdent aussi des tests séparés.

## Ce qui a effectivement été contrôlé

Identifiants uniques, connexions, correspondance des retours, accès aux objets sans collision, restrictions des portes, fermeture persistante de la cage et de la membrane, continuité du retour vers l’aire d’atterrissage, déplacement et visée en profondeur, interception par les couverts, contournement des obstacles, passage en vue latérale, pression d’empathie, ravitaillement consommé une fois, rechargement, filtre, vulnérabilité de la reine, capture vivante, interdiction des tirs de Manning sur le spécimen, restauration de point de reprise, corps et acide persistants, import atomique et rejet de données invalides, espace de sauvegarde distinct.

Dans le navigateur : démarrage par boutons, déplacement au clavier, porte et objectif par E, pause pendant les lectures, carte, recherche dans les dossiers, bascule F6, HUD hors du champ de jeu, reprise depuis une sauvegarde de fixture, préservation d’une clé représentant une autre campagne, 40 salles dans les deux vues, capture réelle dans une situation préparée, format étroit et commandes tactiles de base.

L’installateur a été testé sur des répertoires temporaires uniquement. Il conserve l’index du projet cible, est idempotent, refuse une destination inconnue, protège les fichiers modifiés ou additionnels et permet une désinstallation de sa propre copie non modifiée.

## Correctifs pendant cette passe

Le dossier de la salle s06 a été déplacé hors de l’emprise d’une couverture. Le titre ne sauvegarde plus son état temporaire au-dessus d’une partie existante. Les imports contrôlent aussi les statistiques, les acteurs, les types d’ennemis et les points de reprise. Les événements de tir utilisent le gestionnaire d’effets prévu par le renderer. Les lampes extérieures ont un support au sol. Les obstacles et les portes organiques ne reprennent plus systématiquement l’habillage métallique. Les couverts de premier plan deviennent partiellement transparents lorsqu’ils masquent le joueur. Le plan tient compte des fermetures dynamiques, pas seulement des conditions initiales. Le canvas adapte sa largeur logique au format étroit sans étirer les personnages.

## Captures

Neuf captures PNG sont livrées. Elles proviennent du vrai code du prototype exécuté dans Chromium. Ce ne sont ni des illustrations générées ni des captures de Tantalus Frontier déjà intégré.

Les vues de la carène, des tubes, de la reine et de la soute utilisent des états préparés pour examiner le rendu. La capture verrouillée résulte des tirs de mousse et de l’activation du caisson dans cette mise en situation. Les légendes du rapport illustré signalent ces préparations.

## Limitations de la validation

La politique du navigateur installé dans l’environnement bloque les navigations vers localhost et file://. Le HTML autonome a donc été chargé directement dans le DOM du navigateur. Un stockage local en mémoire explicitement simulé sert à tester le contrat de sauvegarde de l’interface. Le format et l’import / export utilisent le vrai moteur ; les permissions et la persistance natives en ouverture par double-clic ne sont pas certifiées.

Pas de partie humaine complète, pas d’audit complet de difficulté ou d’accessibilité, pas de certification mobile, pas de manette, pas de mesure de performance sur matériel utilisateur, pas de validation dans le moteur courant de Tantalus Frontier. Aucun serveur distant n’a été déployé.

Le graphisme est un rendu vectoriel stylisé de prototypage. La topographie détaillée et les dialogues sont originaux ; la fidélité mot à mot et scène par scène au roman complet n’a pas été vérifiée.

## Reproduire

`npm run check`

`python tools/build_standalone.py`

`python qa/browser_check.py --chromium CHEMIN_CHROMIUM`

Le dernier test utilise volontairement une fixture de stockage et un chargement DOM hors réseau, afin de ne pas présenter une persistance native non testée comme acquise.
