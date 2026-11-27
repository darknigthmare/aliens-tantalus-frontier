# Covenant — fichiers locaux préservés le 26 novembre 2026

Cette reprise ajoute à la PR [#79](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/79) les **46 fichiers encore lisibles et absents de sa tête `7399f15c97db68f977ee59093a175a6c19afd121`**. Leurs **32 263 702 octets originaux** sont conservés, sans recompression ni retouche. Le [manifeste](MANIFEST.json) donne leurs empreintes SHA-256, leurs identités Git et les noms d'origine.

## Ce que contient la récupération

| Famille | Fichiers | Statut |
| --- | ---: | --- |
| Images de marche de Ricks et Oram | 6 PNG | Essais précédemment rejetés ou remplacés, retrouvés par leur empreinte dans le manifeste V015 |
| Autres images de marche | 10 PNG | Candidats sans correspondance exacte dans les manifestes V011–V017 ; attribution de phase et décision de production non retrouvées |
| Revues et mesures d'images V015 | 6 | Deux JSON et quatre planches JPEG historiques |
| Inspection de la bible V014 | 22 | Un journal NDJSON, trois reçus JSON et dix-huit aperçus PNG historiques |
| Recherche et inventaire de travail | 2 | Notes de références et liste des chemins de la précédente passe |

Les six essais de Ricks et Oram gardent leurs décisions de rejet. Les dix autres images restent nommées `unassigned-walking-01` à `unassigned-walking-10` : leur apparence évoque la série Upworth mais le nom de personnage, la phase et le prompt ne sont pas déduits pour reconstituer artificiellement une trace de production.

Le catalogue de production conserve **154 PNG**, dont **81 admis au rendu**. Les seize images retrouvées sont des sources historiques supplémentaires ; elles ne ferment aucun manque d'animation et ne remplacent aucun sprite retenu. La fidélité au film demeure à contrôler sur des références adaptées, avec `verified1to1: false`.

## Doublons évités

L'inventaire a comparé les 69 fichiers lisibles des deux espaces de travail Covenant. **23 étaient déjà présents à l'identique** dans la PR : les 22 PNG retenus de V015 et le classeur `BIBLE_COVENANT_V014.xlsx`. Le manifeste relie ces fichiers à leurs chemins existants ; ils ne sont pas copiés une seconde fois.

Les anciennes copies `covenant-work`, `covenant-v016` et `covenant-continuation` comprennent des liens vers un environnement désormais absent. Aucun contenu n'est déclaré récupéré sur la seule présence de ces liens. Les dossiers vides ne sont pas présentés comme des fichiers récupérés.

## Vérification de cette reprise

Commande de contrôle :

```sh
node scripts/verify-covenant-local-recovery-20261126.mjs
```

Le contrôle vérifie les 46 tailles et empreintes, la présence exacte de leurs chemins, les 23 correspondances déjà publiées, l'exclusion de la distribution construite, le rejet d'un manifeste modifié et d'un chemin non prévu. Il vérifie aussi que le manifeste du rendu conserve exactement son empreinte et ses 81 admissions, et que les sept catalogues contiennent toujours 154 PNG.

Les contrôles complémentaires ont été rejoués sur cette reprise : `npm run test:covenant` **67/67**, `npm run check:covenant` réussi et `node scripts/verify-covenant-v017-preservation.mjs` réussi. Le premier lancement des tests était incomplet car le checkout partiel ne contenait pas encore `src` ; après récupération des sources requises, les 67 tests passent ensemble. Le nouveau contrôle de récupération est aussi ajouté au workflow Covenant V017. La CI de la nouvelle tête et le build général attendent leurs propres résultats.

Les JSON, journaux et planches QA copiés ici sont des preuves historiques. Leurs anciens totaux ne sont pas additionnés aux contrôles de cette reprise. Aucune nouvelle partie jouée, recette navigateur ou certification artistique n'est revendiquée par cette récupération.

## Correction de l'admission des métadonnées historiques

La CI du commit de récupération `fe39c6c68aeabd2ea113b5e06ae8b1c904e9cb94` a révélé une régression du contrôle général des sources : `MANIFEST.json` contient les noms historiques nécessaires à la traçabilité et n'était pas encore inscrit au registre des métadonnées Covenant autorisées. Le même contrôle concerne `qa/v015/recovered-png-qa.json`. Les échecs [Gameplay](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45856854205), [AVP](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45856854185) et [Aliens 1986](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45856854175) proviennent de cette omission ; les mêmes workflows avaient réussi sur la tête précédente `7399f15c97db68f977ee59093a175a6c19afd121`.

La correction inscrit seulement ces deux chemins et leurs empreintes SHA-256 exactes au mécanisme Covenant existant. Leurs octets restent inchangés. Les chemins restent interdits dans la distribution construite ; aucune règle générale de filtrage n'est relâchée. Le test de régression échoue sans ces inscriptions et vérifie aussi le rejet d'octets modifiés, d'empreintes échangées, d'un chemin non prévu et de toute admission au build.

Après correction, les **68/68 tests Covenant**, `check:covenant`, le contrôle de préservation V017 et le contrôle de récupération réussissent. Une vérification utilisant les fonctions réelles d'admission générale a aussi parcouru les 48 fichiers de ce dossier : 46 originaux, le manifeste et ce README. Les deux JSON sont admis exclusivement par leurs empreintes ; le contrôle de texte générique continue de refuser leurs métadonnées historiques. Le contrôle général du dépôt complet et les navigateurs restent à confirmer par la CI de la tête corrigée.

Un échec navigateur Covenant distinct existait déjà sur la tête précédente : la mesure du rocher excédait sa limite de largeur d'environ 0,00000451 unité, dans le [job de référence](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45833321845/job/139955508693). La présente correction ne modifie pas ce test ni le rendu du rocher.
