# Alien: Covenant — sprites V0.11

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
