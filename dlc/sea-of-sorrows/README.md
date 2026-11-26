# ALIEN : LA MER DES CHAGRINS — 0.10.0
## Les seuils de la mémoire

Prototype autonome cumulatif, non officiel. Édition réelle de l’archive v0.9 ; empreinte de base dans BUILD_PROVENANCE.json. Aucun push, déploiement ou raccordement natif à Tantalus Frontier. La fidélité 1:1 est une cible non atteinte ; aucun pourcentage inventé.

## Jouer et consulter

Ouvrir `MER_DES_CHAGRINS_JOUABLE.html` avec un navigateur autorisant JavaScript. Ne pas tenter de le lire dans un simple aperçu de fichier. Les neuf modules, données et styles sont embarqués sans accès réseau. L’entrée modulaire est `index.html` ; un serveur local facultatif se lance avec `python3 tools/server.py`. Les tests de ce conteneur n’ont pas pu certifier ces navigations natives : ERR_BLOCKED_BY_ADMINISTRATOR. Ils exécutent le vrai HTML dans Chromium avec un stockage de test en mémoire, sans contourner la politique de navigation.

`CODEX_MER_DES_CHAGRINS.html` : guide cumulatif et 50 fiches avec schémas. `REGISTRE_FIDELITE_MER_DES_CHAGRINS.html` : états présents / narratifs / interprétés / à vérifier, et sources. `MER_DES_CHAGRINS_RAPPORT_ILLUSTRE.html` ou `reports/RAPPORT_ILLUSTRE.html` : 11 captures actuelles et rapport. Les rapports historiques ne décrivent pas les nouveautés de la version actuelle.

## Armes et personnages

Après la remise de l’équipement, approcher le râtelier de la Réserve de matériel (s09) ou de l’Atelier de maintenance (s17) et interagir. Les deux râteliers partagent une dotation unique : impulsions (30 chargées +60 de réserve), plasma (12 tirs chargés +2 cellules). Équipement → Armes sélectionne les cinq armes possédées. R recharge, et le cycle manette inclut les fusils débloqués ; 1/2/3 gardent les anciennes armes. Le plasma remplace une cellule seulement à vide ; sa chaleur peut le bloquer. Ces paramètres et l’attribution à Decker sont des choix de jeu. Aucun retrait à distance, aucune ressource gratuite après import ou retour au second râtelier.

Le registre ne confond pas cinq armes manipulables avec les sept entrées documentaires. Grenades de Silas et charges orbitales restent narratives. Les 16 fiches de distribution incluent une équipe médicale composite ; Silas, Muller, Dave et Pritchett n’ont encore qu’une fiche. Les visages et la plupart des tenues sont interprétés. Les deux porteurs conservent leurs parasites pendant l’évacuation et dans le tableau de stase. La règle des trois attaches de la reine reste originale.

## Reprendre une expédition

Exporter dans l’ancienne version puis importer dans la nouvelle, en conservant l’export ancien séparément. Le schéma principal reste 8, avec une extension optionnelle d’armurerie de révision1. Les anciens schémas1 à8 sont acceptés. Une sauvegarde utilisant les nouveaux fusils n’est pas certifiée rétrocompatible avec la v0.9. Les copies de repli et de sécurité restent dans le même stockage local, pas dans un cloud.

## Reproduire les contrôles

Node20+ : `npm run check` (syntaxe et 461 tests, sans npm install requis). `npm run qa:fidelity-campaign` reproduit les six tours actuels via le calcul de chemins du moteur, sans playtest humain. `npm run qa:fidelity-browser` lance les 130 contrôles ciblés et 71 régressions actuelles. `npm run qa:docs` contrôle les trois documents. Les anciens scripts `qa:*` sont conservés pour la traçabilité mais tous ne constituent pas une suite actuelle relancée.

Python3.12+ est utilisé par les générateurs. Les contrôles visuels utilisent Python Playwright et Chromium ; le chemin de Chromium se trouve dans les scripts. PIL et mistune ne servent qu’aux documents. Aucune de ces dépendances n’est nécessaire pour jouer au HTML embarqué.

`npm run build` synchronise data/campaign.json vers src/data.js et reconstruit le HTML. `npm run docs` exige des rapports de tests à jour. `python3 tools/build_manifest.py` régénère les empreintes. `npm run qa:delivery` vérifie la livraison. Les traces courantes sont dans reports/v0100 ; les 198 exports d’objectifs actuels dans qa/fidelity-fixtures.

Manette physique, tactile complet, écoute sur matériel, persistance native et parcours humain intégral non certifiés. Graphismes vectoriels provisoires. Les noms de sous-salles, plans, dialogues et systèmes originaux ne sont pas présentés comme le texte intégral du roman.
