# Images de conversation — archive du 6 octobre 2026

Le fichier original `ALIEN_IMAGES_CONVERSATION_COMPLETE_2026-10-06.rar` est conservé sans recompression, sous forme de **17 fragments contigus**.

- Taille d’origine : **168791485 octets**.
- SHA-256 intégral : `4e5a50ea8b95eb92614d0e57d48c16064dc2f8ce4a5ae208446b1618ae70882a`.
- Inventaire natif : **232 fichiers, dont 227 PNG**, lu avec libarchive 3.7.4.
- Aucun doublon de chemin, chemin dangereux ou membre chiffré signalé dans les en-têtes.
- Les charges utiles des membres n’ont pas été décompressées pour vérifier leurs CRC. La sauvegarde certifie les octets du RAR, pas la validité graphique ou la fidélité artistique des images.

## Vérifier ou reconstituer

Depuis la racine du dépôt, la commande suivante contrôle les tailles, les plages contiguës, les SHA-256 et les identifiants Git des fragments, puis le SHA-256 intégral. Elle ne crée aucun RAR :

```sh
node archives/dlc-historical-recovery-20261126/reconstruct.mjs conversation-images/2026-10-06
```

Pour écrire le RAR original dans un dossier voisin du dépôt :

```sh
node archives/dlc-historical-recovery-20261126/reconstruct.mjs conversation-images/2026-10-06 ../restored-conversation-images
```

Le reconstructeur refuse d’écraser un fichier existant. La concaténation dans l’ordre des plages du manifeste restaure exactement le fichier original ; aucun outil RAR n’est requis pour cette opération.

## Repérage des images

L’inventaire comporte sept noms liés à Hicks : armure avec ou sans casque, variantes r2, M41A v1 et v2, et Wilks Book Two. Aucun nom ne désigne explicitement Hicks blessé, un warrior en marche ou un facehugger en attaque/défaite. Cette recherche porte sur les noms ; elle ne remplace pas une inspection visuelle des PNG.

`RAR_CONTENTS.json` conserve tous les noms et tailles annoncées par les en-têtes, ainsi que les correspondances nominales. Aucune image n’est ajoutée au runtime par cette sauvegarde.

Un rapprochement des textes internes confirme que les 227 chemins et tailles du manifeste correspondent aux en-têtes RAR. Les 227 SHA-256 déclarés concordent avec `SHA256SUMS.txt` et aucun ne correspond aux 151 PNG du catalogue DLC examiné le 26 novembre 2026. Les PNG n’ont pas été décompressés ni hachés individuellement pendant ce rapprochement.

Aucun des anciens manquants suivis — 20 PNG, 53 documents et 19 sources de poses — ne peut être déclaré retrouvé sur cette preuve. Les variantes Ripley sauvetage/loader et Hicks restent des pistes par sujet.

## Admission

Les chemins, tailles et SHA-256 de ces sources sont épinglés dans le vérificateur historique. Les chemins étrangers restent refusés et toute la racine `archives` reste exclue de la distribution publique.

