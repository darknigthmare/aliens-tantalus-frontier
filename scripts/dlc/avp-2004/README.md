# AVP · Sous la glace — sources de la v0.11.0

Ces sources proviennent de l'extraction sans perte des 30 scripts, de la feuille de style et des 145 SVG du jeu autonome livré en v0.11.0. La reconstruction initiale a produit exactement le SHA-256 du fichier livré : `587fc2639b4d015fb9162e513702f25ca016ef5259bd27facef7249ef3141bfe`.

Le raccord hôte ajoute le retour au Tantalus depuis la pause et conserve les trois carnets AVP. Les règles, salles, objets, personnages et mécanismes de campagne restent ceux de la v0.11.0. Le moteur AVP reste distinct du GameEngine de Tantalus ; aucun inventaire, récompense ou sauvegarde native n'est converti.

## Construire et vérifier

Depuis la racine du dépôt, avec Node 22 ou supérieur :

```sh
node scripts/build-dlc-avp-2004.mjs
node scripts/build-dlc-avp-2004.mjs --check
npm run test:dlc
npm run check
npm run build
npm run check:built
```

Le fichier distribué est `src/dlc/avp-2004/index.html`. Le build le copie avec `src/`. Les sources de ce dossier, les documents et les inventaires restent hors distribution. Les SVG séparés correspondent aux valeurs de `web/assets.js` ; modifier le dictionnaire puis les SVG correspondants ensemble.

## Périmètre conservé

- 43 salles navigables et un lieu de l'épilogue ; 104 faces de passage.
- 19 chapitres, 17 opérations, 188 notices du carnet.
- 145 illustrations SVG originales et le registre des 250 références de fidélité.
- Namespace de sauvegarde inchangé : `atf.dlc.avp2004.v1`, trois carnets et leurs backups.

D'après le [reçu historique de conservation](../../../archives/local-recovery-20261125/PENDING_TRANSFER.json), l'archive ZIP complète de 58 704 014 octets (rapports, captures, anciens tests et références compris) est conservée sur GitHub en six fragments, au [commit d'archive `6ed9b921`](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6ed9b9210a097bbdf90ec3a22043a3fe5845e541/archives/local-recovery-20261125). Son SHA-256 est `0520c1d4ecc47ffd72ea2907807e978ca4fc0b8b26e49a80bc8c83166641a155`. Le HTML autonome original reste dans `archives/local-recovery-20261125/avp-2004/original-standalone-v0.11.0.html`. La [procédure de reconstruction](../../../docs/development/AVP_2004_GITHUB_INTEGRATION_20261125.md) décrit l'archive ; la validation de cette passe porte sur le reçu historique inchangé, sans nouveau réassemblage du ZIP.

## Validation et fidélité

Avant l'arrêt de l'environnement local, les fichiers de l'archive ont passé 619 contrôles d'empreinte, 770 contrôles de simulation, 23 contrôles d'installation/mise à niveau et 12 parcours déterministes. Ces résultats concernent la base v0.11.0 ; ils ne constituent pas une validation du raccord navigateur nouvellement ajouté. Les nouveaux tests d'intégration sont exécutables par la CI du présent dépôt et leurs résultats doivent être consultés séparément.

La v0.12 évoquée dans le travail précédent n'a pas été retrouvée sous forme de fichiers. Cette intégration ne la remplace pas et ne revendique aucune fidélité visuelle ou géographique 1:1. Le registre distingue déjà contenu jouable, représentation scénique, documentation et références restant à vérifier.
