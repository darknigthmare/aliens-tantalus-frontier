# Alien: Blackout — originaux v0.1.0 à v0.6.0

Les six ZIP originaux sont conservés sans recompression en 13 fragments contigus, de 10 Mio maximum. Le lot représente **111 905 532 octets**. La lecture intégrale des **1 396 membres ZIP** a vérifié tous leurs CRC32 et calculé leurs SHA-256 sans extraction sur disque. Les inventaires comptent neuf occurrences PNG, toutes dans v0.1.0.

| Version | Octets | Membres ZIP | SHA-256 original |
| --- | ---: | ---: | --- |
| v0.1.0 | 7604057 | 76 | `7c74c14e3e1e660b8285be220953e872e1745909465e8e937348d3129bebd304` |
| v0.2.0 | 19015524 | 178 | `285aeffe826cd122b3fe8c2da90cb54f8cdb346709ae91493099c75b8d201794` |
| v0.3.0 | 15692851 | 220 | `d6f9e904153ce91c31324897f77a1a7df93db92f88ec5db64675df8c44e08fc8` |
| v0.4.0 | 20737593 | 281 | `579936acdb52b58c629c3e944ed7db853b66225dc81369ce0f9179912aa379ad` |
| v0.5.0 | 23799439 | 337 | `e44b6ffab9350a3dad521eab4466e5ecf7c3d96000e10558a070b2e55600d664` |
| v0.6.0 | 25056068 | 304 | `8102117a0d1e16b9f121a403659bde35ccfc82c93f747b15d40bef7dce748663` |

Chaque version possède son `MANIFEST.json`, son `ZIP_CONTENTS.json` et les fragments exacts du ZIP. Les manifestes donnent les tailles, offsets, SHA-256 et identifiants Git des fragments, ainsi que les empreintes intégrales des originaux. Les inventaires conservent tous les chemins, tailles, CRC32 et SHA-256 des membres. Aucun doublon de chemin ni chemin dangereux n’a été constaté.

## Vérifier et reconstruire

Depuis la racine du dépôt, vérifier une version sans créer de ZIP :

```sh
node archives/dlc-historical-recovery-20261126/reconstruct.mjs alien-blackout/v0.6.0
```

Pour écrire l’original dans un dossier voisin, ajouter `../restored-blackout` à cette commande. Le reconstructeur refuse d’écraser un fichier existant. Remplacer `v0.6.0` par l’une des six versions pour choisir l’archive.

## Périmètre

Les fichiers de ce lot sont admis par chemins, tailles et SHA-256 exacts. Toute la racine `archives` reste exclue du build public. Cette conservation ne transforme pas ces versions en contenu jouable du moteur courant et ne certifie pas une fidélité artistique. Les six originaux sont conservés ; aucune opération de suppression n’est prévue dans ce lot.
