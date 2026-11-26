# ALIENS — V110 « Tenir les accès » / RC1

Suite autonome de la V109 fournie. Sept lieux connectés, huit inspections et les cinq objectifs locaux de Repli sur Operations sont conservés. La V110 ajoute des plaques finies, des sas renforçables et une pression physique des Warriors sur les battants qui bloquent leur piste.

## Jouer

Ouvrez **JOUER_ALIENS_V110.html** dans un navigateur récent. Le jeu est autonome : aucune bibliothèque distante, police ou image réseau n’est requise. Le document utilise un chargeur de modules Blob ; un environnement qui interdit ce chargement doit l’autoriser ou servir le projet localement selon sa politique. Le test de transport navigateur est décrit dans le rapport QA.

Le ZIP contient le jeu, les sources, les preuves et le Codex. Les anciens HTML et résultats suffixés V109/V108 sont conservés comme références de la branche ; la livraison courante est V110.

## Commandes

- Déplacement : flèches / WASD / ZQSD. V : marche prudente. Souris : visée, bouton gauche ou F : tir.
- E : interaction / ouverture locale / stock / transfert de groupe. R : fermer ou ouvrir le sas de liaison à portée. T : détecteur de mouvements.
- G : rallier. H : tenir. C : couvrir. La cible de l’ordre se choisit dans la barre d’équipe ; Newt ne combat jamais.
- B : ravitailler en munitions. I : soigner. Y : alimenter la sentinelle. Les réserves précédentes restent finies.
- **O : renforcer ; U : découper ; J : réparer** le sas de liaison proche.
- M : carte observée. Tab : archives. Échap / bouton Pause : pause, sauvegarde, export/import et options.

Les contrôles tactiles sont placés hors terrain. Sur petit écran paysage, utilisez « Génie → » / « ← Réserves » : les deux instruments partagent un emplacement pour conserver la place du jeu. Les raccourcis sélectionnent aussi le bon instrument.

## Les trois plaques

Allez en maintenance, jusqu’à la caisse de la table de câblage. E demande 1,1 seconde puis donne **trois plaques** une seule fois. La réserve ne se remplit pas à l’entrée, au chargement ou après interruption.

O : sas fermé, intact, non renforcé ; 1,8 seconde, une plaque pour 72 points de protection. Un sas soudé ne s’ouvre plus avec R.

U : découpe le renfort en 1,4 seconde, puis ouvre. Aucune plaque n’est récupérée.

J : réfection d’un battant touché ou bréché en 2,2 secondes ; une plaque, intégrité 100, fermeture. Il faut dégager les deux faces du seuil et ne pas avoir d’acteur en franchissement.

Bouger, tirer, perdre des PV, quitter la portée ou subir un nouvel impact de structure interrompt le travail avant consommation. Seule la pause suspend le monde entier ; les autres contacts et équipiers continuent pendant le geste.

## La menace

Un Warrior doit connaître une piste au-delà du sas, ne pas trouver de route ouverte, puis atteindre sa face physique. Il prépare 0,8 seconde, frappe pour 28 et récupère 0,7 seconde. Le renfort est touché avant l’intégrité. À pleine résistance sans réparation : quatre impacts sans plaque, sept avec un renfort entier. Les Facehuggers ne percent pas les battants. Les impacts et outils produisent des bruits dans le réseau existant, sans nouvelles vagues.

Une brèche ouvre vraiment les deux faces. Les corps, la vision, les balles et les chemins utilisent la même géométrie. R ne peut pas refermer un panneau arraché : J est requis. Les portes intérieures ne font pas partie de ce nouveau système.

## Reprendre

Le document exporte l’état complet des huit pièces, de l’équipe, des ressources, des contacts et du génie. L’import est validé avant modification puis reprend en pause, y compris pour une soudure ou une préparation ennemie en cours.

Les vrais fichiers V109 sont validés puis migrés sans ressources ou progression gratuites. Le kit doit être récupéré même si la maintenance avait déjà été visitée. Les anciennes versions passent par leurs validateurs respectifs ; une sauvegarde V106 reste une inspection.

## Recettes de développement

Node 20 ou supérieur ; Python 3.10+ ; Python Playwright et Chromium pour la recette navigateur. Les tests utilisent ici `/usr/bin/chromium` ; adapter ce chemin à l’installation locale pour reproduire les captures. Ce sont des dépendances de test, pas du HTML distribué.

```text
npm run check
npm run drive
node tools/export-contracts-v110.mjs
python tools/build-preview.py
python qa/browser-v110.py
python tools/build-docs-v110.py
python qa/distribution-smoke-v110.py
python tools/release-check-v110.py
```

`python tools/verify-package.py` vérifie en lecture seule le paquet distribué sans régénérer son manifeste. Construire de nouveaux résultats modifie légitimement des fichiers de preuve : vérifier le paquet d’origine avant de relancer les recettes.

## Portée

C’est la branche autonome V109 prolongée, **pas une fusion dans la campagne native Tantalus**. Aucun dépôt, service worker ou fichier de sauvegarde natif n’est modifié. L’adaptateur V106 hérité est inactif et n’est pas un raccord V110.

Les transferts entre pièces sont discrets, les tirs restent locaux, le réseau sonore reste une règle tactique. Graphismes procéduraux stylisés, inventaire collectif sans poids, pas de manette/multijoueur certifiés ni de sprites définitifs. Le Sulaco est une inspection séparée : aucun nouveau final historique n’est revendiqué. Aucun push GitHub ou déploiement Vercel.
