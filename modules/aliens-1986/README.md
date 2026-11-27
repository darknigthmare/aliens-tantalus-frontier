# Aliens (1986) — module V114 et présentation V116

Le menu principal propose **ALIENS (1986)** et ouvre [le lanceur du DLC](../../dlc/aliens-1986/index.html). La route servie est `/dlc/aliens-1986/`. Le jeu conserve son checkpoint indépendant `aliens_1986_v114_fidelity_checkpoint`.

## Source conservée

La livraison **V114 · Lieux et identités RC1** reste intégralement dans [v114](v114/) : **1 159 fichiers, 135 643 835 octets extraits**. Le [manifeste de récupération](RECOVERY_MANIFEST.json) fixe la taille et le SHA-256 de chaque membre.

Archive d'origine : `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1.zip`, 118 891 784 octets, SHA-256 `c6dfb2baa886d7b1651463f9685a666f37185aaa0d5cec7d42ccae928762d1e2`. Ses contenus extraits complets sont versionnés. Les déclarations historiques dans ce dossier décrivent leur date de rédaction.

Le HTML [JOUER_ALIENS_V114.html](v114/JOUER_ALIENS_V114.html) et la copie source `dlc/aliens-1986/game.html` gardent leurs octets V114. Le build produit un dérivé V116 dans `dist` ; le serveur de développement le sert en mémoire.

## Présentation V116

Les deux modules dans [v116](v116/) ajoutent le chargement des PNG et leur sélection selon les états de présentation. Le [registre des sprites](../../docs/development/aliens-1986-sprites-v116/README.md) décrit les images effectivement disponibles, leurs empreintes, les références visuelles et les limites de récupération.

Les personnages, objets et créatures existants utilisent uniquement les images déclarées. Une pose manquante garde le rendu de secours. Les dimensions physiques, la simulation, les sauvegardes et les ouvertures de portes restent celles de V114. Une image de marche n'est pas un cycle animé complet. Aucune fidélité exacte 1:1 au film n'est certifiée.

Le build public contient le lanceur, le jeu dérivé et les PNG nécessaires. Le corpus de sources, outils et preuves historiques reste hors du build public.

## Accessoires V117

Le [supplément V117](../../docs/development/aliens-1986-sprites-v117/README.md) ajoute sept états statiques aux 123 images du registre V116 : portes endommagée, renforcée et éventrée, plateau garni, caisse médicale vide, caisse de munitions fermée et vide. Les clés déjà prévues par le renderer V116 sélectionnent ces images selon l’état des sas et des stocks ; les 123 PNG précédents restent inchangés.

Le catalogue réunit désormais **130 images**. La présentation reste V116 et la sauvegarde reste V114. Les sept ajouts sont de nouvelles générations documentées, sans certification de fidélité 1:1 ; les anciens originaux locaux absents ne sont pas présentés comme récupérés.

## Jouer et vérifier

```sh
npm ci
npm run dev
npm run test:dlc:aliens1986
npm run check:dlc:aliens1986
npm run build
npm run check:built
```

Après construction, la recette navigateur utilise Python Playwright et Chromium :

```sh
python3 -B scripts/qa-aliens1986-integration.py --root dist --source-root . --output .qa/aliens1986-integration
```

Le workflow **Aliens 1986 DLC** conserve les preuves navigateur du commit testé.

## Périmètre de l'opération V114

Le module documente 25 lieux inspectables, dont 11 dans l'opération locale, 20 raccords réciproques, 40 faces, 25 portes intérieures, 8 profils d'armes fonctionnels, 16 profils de personnages et 12 PNJ de préparation.

Les huit repères absents restent signalés dans le corpus : Narcissus, appartement de Gateway, extérieur de Hadley, plafond d'Operations, conduits de repli, ascenseurs, famille Jorden et Derelict. Les nouvelles images n'ajoutent pas le pilotage des véhicules, une Reine jouable ni le final P-5000/sas. Ces scènes demandent un travail de gameplay distinct.
