# Fiorina 161 — sources locales Alien 3 V88 à V114

Récupération du **25 novembre 2026** pour Aliens: Tantalus Frontier. Ce dossier conserve les archives originales du développement local et les preuves complémentaires retrouvées. Les ZIP et documents gardent leurs octets d'origine ; les essais, variantes de code et rapports restent consultables sans écraser les sources actives.

## Archives conservées

| Archive | Octets | Membres fichiers |
| --- | ---: | ---: |
| [V101](ALIENS_TANTALUS_DLC_ALIEN3_FIORINA_V101_DENSE_LEVEL_DESIGN_PRODUCTION_SAFE.zip) | 8 282 852 | 321 |
| [V102](ALIENS_TANTALUS_DLC_ALIEN3_FIORINA_V102_DECORS_ANCRES_PRODUCTION_SAFE.zip) | 26 289 661 | 419 |
| [V103](ALIENS_TANTALUS_DLC_ALIEN3_FIORINA_V103_PASSAGES_RESEAUX_PRODUCTION_SAFE.zip) | 42 356 990 | 523 |
| [V113](ALIEN3_FIORINA_V113_SEUILS_DE_FIORINA_SUR_V112.zip) | 29 199 402 | 651 |
| [V114](ALIEN3_FIORINA_V114_ATLAS_CONTINUITE_SUR_V113.zip) | 10 077 153 | 35 |

Les cinq archives représentent **116 206 058 octets**. Leurs **1 949 occurrences de fichiers** comprennent des répétitions entre versions cumulatives : **1 047 contenus distincts** sont identifiés par SHA-256. Ce nombre ne désigne ni des assets nouveaux ni des contenus admis au moteur.

- **V101** : sources et essais cumulatifs V88–V101, rapports et captures.
- **V102–V103** : décors ancrés, circulation, ateliers, codex, scripts et preuves.
- **V113** : modules, ateliers, HTML jouables, scripts et QA cumulatifs V104–V113.
- **V114** : quatre modules incrémentaux, HTML jouable, codex, portée et preuves.

## Preuves complémentaires

Le dossier [evidence](evidence/) conserve **29 fichiers supplémentaires, 157 262 362 octets** : les **11 vérifications finales JSON V104–V114**, les **9 rapports illustrés PDF V104–V112** et les **9 HTML correspondants**, avec leurs suffixes de livraison d'origine. Ils sont conservés à l'octet près ; leurs résultats et captures restent historiques. Les rapports V113 et V114 sont déjà dans leurs ZIP.

[INVENTAIRE.json](INVENTAIRE.json) donne l'origine, la taille et le SHA-256 des archives et preuves, puis le chemin, la taille, le CRC32 et le SHA-256 de chaque membre ZIP. Tous les membres ont été lus, avec CRC valides, sans chemin dangereux, doublon de nom ou lien symbolique. Les **1 750 occurrences UTF-8 des archives** et les **20 fichiers UTF-8 complémentaires** ont été examinés pour les familles de secrets déclarées, sans signal trouvé. Ce contrôle ciblé n'est pas une garantie générale d'absence de toute donnée sensible.

## Continuité et limites

Les couches runtime **V88 à V114** sont présentes dans l'ensemble. Les données V88–V104 et les modules spécialisés ultérieurs conservent leurs noms, variantes et dépendances. La V114 complète la V113 ; son ZIP seul ne contient pas le moteur antérieur complet. Son HTML autonome embarque aussi son assemblage de prévisualisation.

Les ZIP individuels V88–V100 et V104–V112 n'ont pas tous été récupérés distinctement. Le contenu cumulatif est inventorié ; cela ne reconstitue pas les octets de chaque ancien ZIP. La V100 originale était indisponible, mais ses sources et rapports figurent dans V101–V103. Les JSON externes de vérification finale V102 et V103 ne sont pas récupérés dans ce lot. Les pièces jointes portant le même nom n'ont pas été déclarées identiques sur le seul nom.

Les rapports de QA gardent leur portée historique. Les captures montrent la prévisualisation de leur version. Les locaux d'inspection, costumes simplifiés, variantes cinéma/Assembly et incertitudes documentaires conservent leurs limites ; l'import ne certifie aucune fidélité globale « 1:1 ».

Ce dossier concerne **Fiorina et les travaux locaux de cette conversation**. Il ne prétend pas contenir le corpus distinct de 2 236 livrables du projet. Les trois ZIP Predator et leurs inventaires sont conservés sans modification dans le dossier voisin ; le manifeste commun inclut leurs empreintes d'origine.

## Sources archivées et jeu distribué

Le raccordement jouable se suit dans les sources actives et le rapport d'intégration. Les anciens installateurs ciblent des compositions historiques de moteur ; leur conservation ne justifie pas leur application aveugle sur le jeu actuel.

Le [manifeste commun](../MANIFEST.json) admet uniquement les chemins et octets inventoriés. Les archives restent exclues du déploiement et de la distribution du jeu. Aucun ancien HTML, rapport ou capture n'entre dans le téléchargement public par cet archivage.

Depuis la racine du dépôt :

~~~bash
node scripts/project-recovery-admission-20261116.mjs
node --test scripts/verify-project-recovery-admission-20261116.mjs
~~~

Ces commandes vérifient l'intégrité et l'admission des archives ; les tests du runtime, des sauvegardes, du build et des parcours restent distincts.
