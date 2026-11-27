# Alien: Earth — originaux V1 à V10

Les dix ZIP originaux sont conservés sans recompression en **27 fragments contigus**, de 10 Mio maximum, pour **236 322 551 octets**. La lecture intégrale des **1 314 membres ZIP** a vérifié leurs CRC32 et calculé leurs SHA-256 sans extraction sur disque. Les inventaires recensent **457 occurrences PNG**, sans les assimiler à 457 images distinctes.

| Version | Octets | Membres ZIP | SHA-256 original |
| --- | ---: | ---: | --- |
| v1 | 11089227 | 43 | `f47ab4a6a99a64158b34663571277a5623ce567ff3e96a391b02874974193f77` |
| v2 | 16902480 | 69 | `bb879ec2d1677a01cb5798f63972b28f397ffef8957e959c3cbfea95b80f8086` |
| v3 | 16185188 | 73 | `da9c35a79591ad2c4f9d7cc616c5782735a9c9f484474ed47778d925c4154780` |
| v4 | 14122782 | 84 | `4235e12983f36c2079bc346598fd5697757dc937691391cfd7a754178767e8dc` |
| v5 | 19392814 | 105 | `1df3294a24538ad636c8245e4b15353df97a469516ae14f54f74f3b437afa8c1` |
| v6 | 22772673 | 143 | `47075ae3467b9a3c149ad92afec5cc434e7ee6f6ef2cb6ea8fa121d342e9a227` |
| v7 | 29105693 | 172 | `e5123f208ddb844b47fc876612d945f721ce3d382620cfa389fac1dd75d27b5c` |
| v8 | 30595564 | 199 | `d4d30711500d317b1f0e4d408ea9d3122fb7a5b56607a6a3d7162501eb6ca8a9` |
| v9 | 36819269 | 224 | `7680925c191f65ca205925e5268594f6fa03c6b2d08cf796c60f22d40969ef49` |
| v10 | 39336861 | 202 | `b0afb821b6acbe57f591c9c489426abb4c3b8e92bb945f7b2dc0b5e9b67423e7` |

Chaque version possède son `MANIFEST.json`, son `ZIP_CONTENTS.json` et les fragments exacts de l’original. Les inventaires donnent les chemins, tailles, CRC32 et SHA-256 calculés sur les membres réels ; aucun doublon de chemin ni chemin dangereux n’a été constaté. V11 reste dans les archives précédemment réconciliées ; il ne fait pas partie de ce lot.

## Vérifier ou reconstruire

Depuis la racine du dépôt, vérifier V10 sans écrire de ZIP :

```sh
node archives/dlc-historical-recovery-20261126/reconstruct.mjs alien-earth/v10
```

Remplacer `v10` par `v1` à `v9` pour choisir un autre original. Ajouter `../restored-earth` pour écrire le ZIP dans un dossier voisin ; le reconstructeur refuse d’écraser un fichier existant.

## Périmètre

Les chemins, tailles et SHA-256 sont admis par une liste fermée. La racine `archives` demeure exclue du build public. Cette conservation n’active aucun contenu dans le runtime et ne certifie pas la fidélité artistique des images. Les dix originaux sont conservés ; aucune suppression n’est prévue dans ce lot.
