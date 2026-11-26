# Alien: Isolation — Dernière transmission

Version récupérée : **0.8.0 — Une station, des chemins**. Les **646 fichiers** de `v0.8/` sont conservés à l’octet et vérifiés par `RECOVERY_MANIFEST.json`.

## Jouer

Dans Tantalus : **Extensions → Alien: Isolation → Ouvrir l’expédition**. Le lanceur [`../../dlc/alien-isolation/index.html`](../../dlc/alien-isolation/index.html) fournit le retour au Tantalus et le plein écran. Le jeu autonome [`v0.8/JOUER_ISOLATION.html`](v0.8/JOUER_ISOLATION.html) reste utilisable séparément. Le runtime public ne contient que les deux HTML de `dlc/alien-isolation/` ; sources, outils, rapports et captures restent dans le dépôt.

## Sauvegardes

Le DLC conserve `tantalus.dlc.alien-isolation.v1`. Le menu utilise le lanceur hôte existant, qui arrête les scènes et l’audio avant de naviguer. Les profils Tantalus et les carnets AVP restent séparés. Pour changer d’origine (fichier, serveur local, site), exporter puis importer le JSON depuis les menus d’Isolation. L’export représente le dernier enregistrement, pas automatiquement la position affichée.

## Provenance

Archive : `ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip`, **85 001 778 octets**. SHA-256 : `880f74e69551afd41af36b62c34778dd239a10386f573cb86eb170641855a978`.

L’archive exacte est conservée dans la [PR #73](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/73), au commit `6b46eaf8f574871e39487e0a10ef46acfb1f41a6`. Cette intégration vérifie chaque membre extrait et ne reprend pas les autres DLC de cette PR.

Jeu autonome : **1 107 027 octets**, SHA-256 `e21c5a50305e392dd8ee324783f2e6b9448f78001e342255a34c024440928df9`.

## Contrôles

```sh
npm run test:dlc:isolation
npm run test:dlc
npm run check:dlc:isolation
npm run build:dlc:isolation
npm run qa:dlc:isolation
```

Les tests historiques qui régénèrent des journaux (`test:campaign`, `test:spatial`) doivent être exécutés dans une copie : l’admission refuse les modifications du corpus historique. Poursuivre le développement dans une version suivante. Voir le [rapport d’intégration](../../docs/development/ALIEN_ISOLATION_GITHUB_INTEGRATION_20261126.md).

## Périmètre

**76 lieux, 112 liaisons, 19 chapitres et 52 objectifs principaux**. Prototype condensé 2D/2.5D, avec graphismes stylisés ; la publication ne certifie pas une fidélité 1:1 des lieux, de l’ensemble de l’équipement ou des personnages. Les changements V0.9 annoncés dans la session précédente n’ont pas été retrouvés et ne sont pas inclus. Les documents contenus dans `v0.8/` décrivent leur livraison historique.
