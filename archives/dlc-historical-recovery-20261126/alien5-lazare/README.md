# Projet Lazare — conservation des dix originaux V1 à V10

Cette reprise termine le lot historique préparé pour **Aliens: Tantalus Frontier / Alien 5 — Projet Lazare** : dix ZIP candidats, **149 847 999 octets originaux**, divisés sans recompression en **20 fragments** de 10 Mio au maximum. Les dix manifestes conservent l'ordre et les empreintes de chaque fragment ; les dix inventaires ZIP recensent **2 706 membres**. Les **92 documents extraits** restent identiques aux membres correspondants (7 911 113 octets).

| Version | Octets originaux | Membres ZIP | SHA-256 original |
| --- | ---: | ---: | --- |
| v1 | 7262597 | 35 | `e83ca79e0d920a328db05f241855e50672bcee70ea4199e408f021f2a560a3b2` |
| v2 | 12332131 | 106 | `987cc0a799dc245f312af4993775e7aa96a08809d87322b2f6f3bc6df7356d61` |
| v3 | 19057552 | 205 | `e940e4a368093e273de4366fbc318f0c30f45fd63ad15ad9b9b709e88f0692fb` |
| v4 | 34123255 | 401 | `5b62b7bec7a09cf4fdf2d3fed4c8b958064ce8bb0c10f8430993fe750d2d79d9` |
| v5 | 11589434 | 186 | `72c7475bb91e7454f2ba264c5c4b494dde1e07e9925733613d8afd38a3d74b6d` |
| v6 | 9004672 | 231 | `bddee773751646401c31cea82c7d2224559f15547ffeaf17863f00e9ca85c9d1` |
| v7 | 10588930 | 326 | `fefe675976a9fb703909aa885645e07e2e711413ed531e68256f03e3d9c250a9` |
| v8 | 8515512 | 314 | `3c79d05fc31134c0e2befb5caf6677e590f579f8d7c3332c04ffe819ea22275f` |
| v9 | 10684397 | 375 | `f49adb8cb42b38e937aad15edcbbe3d9632f7b7df3706c0b045bfde4c988d5b3` |
| v10 | 26689519 | 527 | `4371df32994992335a9e8e101b1a54d93b0ea565c0768e7f7a1390666063b4ab` |

## Conservation et usage

Les 132 fichiers préparés sont conservés à leurs tailles, SHA-256 et identifiants Git exacts. Cette notice s'y ajoute. Les 20 fragments recomposent exactement les dix ZIP ; aucune archive n'est recompressée, aucun script historique n'est exécuté. Les contrôles ZIP ont relu le CRC de chaque membre, refusé les chemins sortants, liens symboliques, doublons et membres chiffrés. Les archives contiennent sept occurrences PNG distinctes ; elles ne constituent pas sept nouvelles générations pour le jeu.

Les fichiers sont des sources historiques à examiner. Les mentions de réussite, de fidélité ou de version présentes dans leurs documents restent celles des livraisons d'origine. Cette récupération ne certifie aucune fidélité artistique 1:1, aucun raccordement au moteur actuel, aucun parcours ni build de ces prototypes.

## Reconstruction

Depuis la racine du dépôt :

```sh
node archives/dlc-historical-recovery-20261126/reconstruct.mjs alien5-lazare/v10
node archives/dlc-historical-recovery-20261126/reconstruct.mjs alien5-lazare/v10 /tmp/lazare-restaure
```

La première commande vérifie sans écrire. La seconde reconstitue le ZIP original et refuse d'écraser un fichier existant. Remplacer `v10` par `v1` à `v9` pour les autres versions.

## Placement de la PR

Cette sauvegarde poursuit la branche `codex/earth-v1-v10-recovery-20261126` au commit `39845d90e1630802153f0940eaf63f6d6e5e220e` (PR #84), en conservant les sauvegardes #83, #82, #76 et #73. **Lazare V11 est déjà préservé dans #73** et n'est pas recopié ici. La recherche des noms exacts et des branches n'a retrouvé aucune publication V1–V10 avant cette reprise ; la recherche n'est pas une affirmation sur tous les anciens commits Git.

Les dix entrées correspondantes de l'index passent à `preserved-exact-in-this-recovery` : 30 originaux y sont désormais conservés, 254 candidats restent à réconcilier. Tous les nouveaux fichiers sont admis à leurs octets exacts et exclus du build public. Aucun fichier actif du jeu ou ancienne archive n'est modifié, aucune suppression n'est effectuée.
