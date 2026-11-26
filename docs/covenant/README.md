# Alien: Covenant — bible et production V0.16

## Suivi courant

La [bible détaillée V0.16](BIBLE_COVENANT_V016.md), son [inventaire JSON](BIBLE_COVENANT_V016.json), sa [lecture HTML](BIBLE_COVENANT_V016.html) et son [classeur Excel](BIBLE_COVENANT_V016.xlsx) relient les huit domaines demandés aux références et aux consommateurs réels du moteur.

**257 contrats de production** détaillent personnages, lieux, armes, props, véhicules, vaisseaux, terrains et planètes. Le registre conserve 315 références, 23 profils, 57 entrées spatiales, 67 connexions, 134 seuils, 7 familles d’armes, 126 familles de props et 630 occurrences, 16 terrains et 3 planètes. Les identifiants historiques sont conservés ; les vues documentaires se recoupent et ne s’additionnent pas en objets uniques.

La continuation ajoute **16 PNG**, soit **119 originaux cumulés : 72 admis au rendu et 47 au catalogue**. Les cinq cycles complets et leurs 40 phases restent inchangés. Les cinq poses de David sont des images de catalogue, sans nouveau cycle activé. Les autres nouveautés sont cinq accessoires de production, quatre terrains et deux vues du rover Audi.

Le [manifeste V016](../../assets/openai/sprites/alien-covenant-v016/manifest.json), le [suivi de livraison](SPRITES_V016_STATUS.md) et la [provenance](PROVENANCE_V016.json) distinguent ce qui a été documenté, produit et vérifié. Les 16 nouveautés restent au catalogue ; un emplacement envisagé ne constitue pas une admission runtime.

Aucune fidélité 1:1 n’est certifiée. Les références inspectées, parties reconstruites et manques sont conservés dans les fiches. Les refus antérieurs de génération ne sont pas relancés. Après la panne de l’environnement, toutes les images ont été récupérées ; douze prompts exacts sur seize ont pu être conservés. Les quatre autres sont explicitement marqués non récupérés.

## Historique et rattachement

La [bible principale](../narrative/CAMPAGNE_PRINCIPALE.md) renvoie à cette annexe. Le [suivi V014](SPRITES_V014_STATUS.md) conserve son périmètre de 103 PNG, 72 admissions et cinq cycles. Les fichiers V011–V014 gardent leurs octets. Cette continuation n’intègre pas un éventuel lot V015 d’une autre branche.

La [PR 79](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/79) complète la [PR 71](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71). La [consolidation de PR68](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/16686e8681cc0370db3fa3df2967704ef1862155/docs/narrative/dlc/alien-covenant.md) garde son état historique épinglé. La simulation V0.10.0, les sauvegardes, collisions et connexions ne sont pas modifiées.

---

## Historique conservé — passe sprites V0.11

Cette passe poursuit le module Covenant récupéré depuis
`ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip`. Les 22 fichiers d’origine représentent
992 906 octets ; leurs empreintes figurent dans
[RUNTIME_SOURCE_V011.json](RUNTIME_SOURCE_V011.json). Le moteur, les règles,
les actions et les sauvegardes restent ceux de V0.10.0. La version V0.11
identifie le raccord visuel et son intégration au menu de Tantalus.

## Contenu et portée

[INVENTORY_V011.json](INVENTORY_V011.json) relève les 23 profils d’apparence,
18 présences, 7 familles d’armes dont 4 jouables, les rencontres de créatures
et 126 familles de props. Les 630 occurrences de props sont regroupées par
famille, dimensions et salles ; leur liste ne signifie pas que 630 images
différentes doivent être produites. Les murs, mécanismes actifs, effets et
objets originaux de gameplay sont distingués des accessoires à documenter.

Le catalogue de production
[`manifest.json`](../../assets/openai/sprites/alien-covenant-v011/manifest.json)
conserve les références, prompts, états disponibles et limites. Une image
peut être présente dans ce catalogue sans emplacement de jeu validé.
`runtimeAdmission: "catalogue-only"` la conserve dans les sources et
l’exclut du manifeste jouable et de la distribution. Les dessins particuliers
et embryons ne remplacent donc pas arbitrairement un objet générique.

Les références guident les visages, costumes, matières et silhouettes.
Les angles non visibles et poses de jeu restent des reconstructions.
`verified1to1` reste faux ; génération, admission technique et vérification
en jeu sont des étapes distinctes.

## Raccord de rendu

Les sources éditables se trouvent dans `modules/covenant/dlc/covenant`.
Le registre et le renderer V0.11 sont chargés après `fidelity-art.js`.
Le renderer d’origine reste le fallback de toute pose non couverte et de
tout fichier absent, en échec de chargement ou de dimensions incorrectes.

- Les humains utilisent un profil exact et un état déclaré. Une image
  immobile avec les mains libres ne devient pas une marche, un rechargement,
  une pose de travail ou un corps tenant une arme. Un état armé nécessite
  une pose et une attache de main adaptées.
- Les créatures immobiles utilisent leur pose neutre. Une image d’attaque
  aérienne intervient pendant `lunge` uniquement. L’anticipation,
  les déplacements sans pose dédiée, la mort, la capture et les séquences
  scénarisées gardent leurs dessins d’origine.
- Les PNG gardent leurs octets et proportions. La géométrie de rendu utilise
  les bornes d’alpha significatives au seuil 32 et une ancre de support.
  Le sens opposé emploie la réflexion existante du jeu ; cela ne constitue
  pas une nouvelle vue documentée du costume ou de ses inscriptions.
  Exception : la pose walter-injured ne peut pas être retournée, afin de
  préserver le côté anatomique de la main manquante ; le sens opposé
  conserve le renderer d’origine.
- Les accessoires isolés se placent dans l’enveloppe de l’objet existant.
  Les consoles, affichages fonctionnels, rotors, grue et autres mécanismes
  actifs restent procéduraux. L’atterrisseur intact n’apparaît pas dans sa
  scène de destruction. Le cryopod ouvert est limité à la chambre `cryo`.
- Les images de table conservent le support prévu par le décor. Les
  suppressions de props et les contraintes des scènes restent appliquées.

Le renderer lit l’état de simulation. Il ne distribue ni munitions ni
ressources et ne change pas les collisions, portes, forces, objectifs,
migrations ou sauvegardes. Les variantes d’armes uniquement visuelles ne
deviennent pas des armes jouables supplémentaires.

## Publication du module

L’entrée **ALIEN: COVENANT** du menu Tantalus ouvre `dlc/covenant/`.
Cette page est reconstruite depuis les sources récupérées, avec CSS et
scripts embarqués. Les PNG admis restent des fichiers séparés sous
`assets/openai/sprites/alien-covenant-v011/`.

Le module reste autonome. Il conserve la clé `atf.mire.covenant.v1`,
le format externe 1 et la révision 10, ainsi que son retour au Tantalus.
La pièce blanche demeure un tableau isolé : elle ne crée pas de liaison
géographique avec le vaisseau et ne remplace pas la progression de campagne.

Le bridge historique est conservé comme source, mais n’est pas exécuté par
la page. Le raccord de menu passe par le contrôleur de titre existant.

## Vérification

Commandes déclarées à la racine :

```sh
npm run test:covenant
npm run check:covenant
npm run qa:covenant:playthrough
npm run build
npm run check:built
npm run qa:covenant -- --root dist --source-root .
```

`sync-covenant-sprites-v011.py` mesure les PNG d’origine et reconstruit
`sprites-v011.json` ainsi que la page distribuée. Il ne redessine, ne
redimensionne et ne retouche aucun sprite. Le manifeste de production peut
être complété par des placements revus dans
`docs/covenant/SPRITE_PROVENANCE_V011.json`.

Les tests unitaires déclarent leurs doubles d’Image, Canvas et renderer
parent. Les pilotes historiques utilisent le vrai moteur et ses commandes
de simulation ; ils ne valent pas une observation visuelle. Le QA navigateur
distingue le parcours réel au clavier **cryo → service → bridge → comms**,
la sauvegarde/reprise et l’ouverture publique du prologue des poses de
créatures préparées dans un contexte séparé. Les échecs d’images sont
également injectés dans un contexte séparé pour vérifier le fallback.

La CI conserve ses journaux, sauvegardes et captures hors des sources et de
la distribution. Un script disponible ou un ancien résultat n’est pas une
réussite de la révision courante. Le suivi de production et les reçus de
validation indiquent ce qui a effectivement été exécuté.
