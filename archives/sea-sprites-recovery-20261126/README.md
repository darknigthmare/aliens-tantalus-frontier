# La Mer des Chagrins — récupération partielle du lot visuel

Ce répertoire conserve les **33 fichiers réellement transférés et vérifiés**, dont **28 PNG**, avant l’indisponibilité de l’environnement local le 26 novembre 2026. Leur total est de **48 916 609 octets**.

Le snapshot local complet contient **126 fichiers** : **93 fichiers restent à transférer**. Ce checkpoint ne constitue ni le lot complet ni son intégration jouable.

## Origine

- Commit local source : `f62b3c008df41be6004cff5ea9400daa05f7aa9f`.
- Parent du snapshot : `232cbd2ecb0e370f911b008b2226dafee81bffde`, tête de la [PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58) au moment du relevé.
- Arbre attendu du snapshot complet : `dc83ab7c82ff9b626ae5f8e5f2b0940b67be6b1c`.
- Copie locale observée : `/workspace/scratch/523a772a550e/repo`.
- Le checkout local a ensuite reçu une fusion non résolue dans une autre session. Cette reprise n’a pas modifié ce checkout ni ses conflits.

## Fichiers et reprise

Les octets sont rangés dans `source/` en conservant les chemins relatifs d’origine. Les fichiers de configuration et pages présents ici sont archivés : ils ne remplacent pas les fichiers actifs de la PR #58.

`RECOVERY_LEDGER.json` donne les **126 chemins, modes Git, tailles et SHA Git attendus**, distingue les 33 fichiers préservés des 93 restants, et associe chaque fichier préservé à son chemin d’archive.

Pour reprendre, récupérer les octets encore manquants, vérifier leurs SHA, puis assembler le snapshot et résoudre sa continuité avec la tête courante de la PR #58. Les changements du menu, du renderer et de distribution restent à appliquer et à qualifier ensemble. Aucun force push n’est nécessaire.

## Contrôle effectué

Chaque appel de création de blob a renvoyé le SHA Git du fichier source exact. Ce checkpoint réutilise ces objets immuables ; aucun réencodage ou redimensionnement d’image n’a été réalisé.

Les essais de jeu et de distribution n’ont pas été relancés pour ce checkpoint. L’admission de ce nouveau répertoire d’archives doit être traitée avant fusion ; la PR reste en brouillon pour la conservation des sources.

La fidélité 1:1 n’est pas certifiée. Ne supprimer aucun des 93 fichiers manquants sur la base de ce reçu partiel.
