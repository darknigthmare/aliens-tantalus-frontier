# La Mer des Chagrins — récupération partielle du lot visuel

Ce répertoire conserve **38 fichiers vérifiés**, dont **33 PNG**, soit **59 127 508 octets**. Le relevé source complet contient **126 fichiers** ; **88 restent à retrouver**. Ce checkpoint ne constitue ni le lot complet ni son intégration jouable.

## Reprise du 26 novembre 2026

Le premier checkpoint conservait 33 fichiers, dont 28 PNG. La tête `994853bdd9d959980f0f8256cb39b1eadfe29911` de la [PR #58](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/58) contient cinq fichiers supplémentaires dont les empreintes Git et les tailles correspondent exactement au relevé d'origine : `decor/drill.png`, `decor/locker.png`, `decor/medical.png`, `decor/reel.png` et `equipment/sensor.png`. Leurs objets Git sont réutilisés sans modification d'octets.

Dans l'environnement retrouvé, le commit source local n'est plus lisible et le dossier d'origine du lot est absent. Une recherche par tailles puis SHA Git des fichiers présents n'a pas fourni d'autre correspondance exacte. Cela n'établit pas que les fichiers sont irrécupérables ailleurs. Aucun fichier n'a été supprimé pendant cette reprise.

## Origine

- Commit source relevé : `f62b3c008df41be6004cff5ea9400daa05f7aa9f`.
- Parent du snapshot : `232cbd2ecb0e370f911b008b2226dafee81bffde`, tête de la PR #58 au moment du relevé.
- Arbre attendu du snapshot complet : `dc83ab7c82ff9b626ae5f8e5f2b0940b67be6b1c`.
- Les travaux actifs d'autres sessions ne sont pas remplacés.

## Fichiers et reprise

Les octets sont rangés dans `source/` en conservant les chemins relatifs d'origine. Les fichiers de configuration et les pages présents ici sont archivés : ils ne remplacent pas les fichiers actifs de la PR #58.

`RECOVERY_LEDGER.json` conserve les **126 chemins, modes Git, tailles et empreintes attendus**. Il distingue les 38 fichiers préservés des 88 restants, indique leur chemin d'archive et la provenance exacte des cinq récupérations supplémentaires.

Pour continuer, retrouver les octets manquants et vérifier chaque SHA. Ensuite seulement, assembler le snapshot et résoudre sa continuité avec la tête courante de la PR #58. Les changements du menu, du renderer et de distribution restent à appliquer et à qualifier ensemble. Aucun force push n'est nécessaire.

## Contrôles et limites

Les 33 entrées déjà archivées ont été comparées à l'arbre distant courant. Les cinq objets réutilisés ont été comparés à l'arbre distant de la PR #58 et au relevé initial : mêmes empreintes Git et mêmes tailles. Aucun réencodage ni redimensionnement d'image n'est effectué.

Les essais de jeu et de distribution ne sont pas relancés pour cette récupération de sources. L'admission du répertoire d'archives doit être traitée avant fusion ; la PR reste en brouillon. La fidélité 1:1 n'est pas certifiée.

**Ne supprimer aucun des 88 fichiers manquants sur la base de ce reçu partiel.**
