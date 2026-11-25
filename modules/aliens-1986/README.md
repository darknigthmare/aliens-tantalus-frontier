# Aliens (1986) — module récupéré et raccordé

La livraison **V114 · Lieux et identités RC1** est conservée intégralement dans [v114](v114/). Le menu principal de Tantalus propose **ALIENS (1986)** et ouvre [le lanceur du DLC](../../dlc/aliens-1986/index.html). Dans une version servie, la route est `/dlc/aliens-1986/`.

Le jeu utilise son propre checkpoint, `aliens_1986_v114_fidelity_checkpoint`. Le bouton de retour ramène au menu Tantalus. Cette intégration relie le lancement, la distribution et la sauvegarde du module autonome ; elle ne transforme pas ses missions en missions de la campagne native.

## Fichiers conservés

Les **1 159 fichiers** de l’archive sont repris sans modification : 40 modules de source, 8 fichiers de prévisualisation, 123 fichiers de QA, 37 outils, 22 fichiers de provenance, 908 preuves/états/captures et 21 fichiers à la racine. Le manifeste de récupération fournit la taille et le SHA-256 de chaque fichier.

Archive d’origine : `ALIENS_1986_V114_LIEUX_ET_IDENTITES_RC1.zip`, 118 891 784 octets, SHA-256 `c6dfb2baa886d7b1651463f9685a666f37185aaa0d5cec7d42ccae928762d1e2`. Le ZIP d’origine dépasse la taille d’un fichier GitHub ordinaire ; ses **contenus extraits complets** sont versionnés, avec leur provenance.

Les mentions « aucun push GitHub » dans les documents sous `v114/` décrivent la livraison historique. La [notice d’intégration du 25 novembre 2026](../../docs/development/ALIENS_1986_GITHUB_INTEGRATION_20261125.md) décrit le raccordement actuel.

## Jouer et vérifier

```bash
npm run dev
npm run test:dlc:aliens1986
npm run check:dlc:aliens1986
```

Ouvrir le menu principal, puis **ALIENS (1986)**. Le HTML autonome original reste directement ouvrable : [JOUER_ALIENS_V114.html](v114/JOUER_ALIENS_V114.html).

La recette navigateur utilise Python Playwright avec Chromium :

```bash
python3 -B scripts/qa-aliens1986-integration.py --root . --source-root . --output /tmp/aliens1986-qa
```

La CI dédiée rejoue la suite du DLC, ses admissions de distribution et le parcours navigateur sur le build. Les sources, outils, rapports et captures du corpus ne sont pas copiés dans le build public : seuls les deux HTML du lanceur sont distribués.

## Périmètre réel

- 25 lieux inspectables, dont 11 dans l’opération locale.
- 20 raccords réciproques, 40 faces et 25 portes intérieures.
- 8 profils d’armes fonctionnels ; 24 références d’équipement, dont certaines sont encore documentaires ou décoratives.
- 16 profils de personnages et 12 PNJ de préparation.

Les huit repères manquants de cette version restent signalés : Narcissus, appartement de Gateway, extérieur de Hadley, plafond d’Operations, conduits de repli, ascenseurs, famille Jorden et Derelict. Le pilotage des véhicules, la Reine et le final P-5000/sas ne sont pas jouables dans ce module. Le rendu est stylisé et aucune fidélité 1:1 n’est déclarée.

Le chantier V115 mentionné dans la conversation n’a pas été retrouvé parmi les fichiers récupérables. Aucune de ses fonctionnalités ni aucun de ses compteurs n’est présenté comme livré dans cette intégration.
