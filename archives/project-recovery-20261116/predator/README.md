# Sources historiques — trois DLC Predator de Tantalus

Reprise du **16 novembre 2026**. Ce dossier conserve les trois archives originales retrouvées sous « Yautja The Long Hunt » dont les noms et la documentation désignent **Aliens: Tantalus Frontier**. Les ZIP sont copiés à l’octet près ; aucun installateur ni code interne n’a été exécuté pendant cette récupération.

## Contenu conservé

| Archive | Taille, octets | Fichiers internes | PNG | SVG |
| --- | ---: | ---: | ---: | ---: |
| [AVP Predator v0.5.0](ALIENS_TANTALUS_DLC_AVP_PREDATOR_v0.5.0.zip) | 282 272 | 108 | 6 | 68 |
| [AVPR Wolf v0.7.0-candidate.1](ALIENS_TANTALUS_DLC_AVPR_WOLF_v0.7.0-candidate.1.zip) | 1 988 097 | 139 | 23 | 23 |
| [Predator Badlands v0.1.0](ALIENS_TANTALUS_DLC_PREDATOR_BADLANDS_v0.1.0.zip) | 1 405 111 | 43 | 7 | 18 |

Soit **3 675 480 octets de ZIP et 290 fichiers internes**. Les **36 PNG** correspondent à **21 captures historiques, 9 aperçus de scènes et 6 aperçus de planches de sprites**. Ce total ne désigne pas 36 nouveaux sprites prêts pour le jeu.

[INVENTAIRE.json](INVENTAIRE.json) conserve les identifiants de provenance, le SHA-256 de chaque ZIP, les chemins internes, les tailles, les CRC32 et les SHA-256 de chaque membre. Tous les membres des trois ZIP ont été réellement lus le 16 novembre 2026 ; les CRC sont valides et aucun chemin dangereux ni lien symbolique n’a été trouvé. [MANIFEST.json](MANIFEST.json) lie les octets exacts des fichiers admis dans ce dossier.

## État d’intégration

Ce sont des **sources historiques de prototypes autonomes ou d’intégrations légères**. Cette récupération ne raccorde aucun de ces DLC au `GameEngine`, au `SaveSystem`, au menu ou au chargement de la version principale. Les commandes et rapports QA présents dans les ZIP conservent leur valeur historique ; ils n’ont pas été rejoués pour cette livraison.

- **AVP Predator** : prototype « Le Rite sous la glace », point de vue Yautja.
- **AVPR Wolf** : le `README_INSTALL.md` décrit v0.7 ; le vieux `README.txt` interne mentionne encore v0.5. Les deux sont conservés sans réécriture. L’installateur historique ajoute un bouton et reste distinct d’une fusion native du moteur et des sauvegardes.
- **Badlands** : sa documentation qualifie explicitement les SVG de dessins stylisés provisoires. Leur présence ne constitue pas une certification de fidélité visuelle 1:1.

## Exclusion de la distribution du jeu

`archives/` est exclu du contexte Vercel et du build public. Le contrôle des sources n’admet que les chemins et empreintes de ce lot ; le contrôle d’une distribution construite refuse les archives et leurs outils. Aucun fichier de ce dossier ne fait partie du téléchargement du jeu.

Vérifier les octets de cette récupération depuis la racine du dépôt :

```bash
node scripts/project-recovery-admission-20261116.mjs
node --test scripts/verify-project-recovery-admission-20261116.mjs
```

Les contrôles de distribution existants restent `npm run check`, `npm run build` et `npm run check:built`. Leur mention ici ne vaut pas résultat de CI.

## État exact de la récupération précédente

À la reprise du 16 novembre, un corpus distinct de **2 236 livrables**, **2 211 contenus de fichiers uniques**, **15 602 360 161 octets originaux** et **9 237 857 729 octets de payload répartis en 1 146 volumes** était préparé localement. Son dossier d’archive était encore non suivi par Git et le checkpoint d’envoi ne recensait qu’un blob de payload. **Sa publication complète n’était donc pas achevée.**

Ce dossier ne contient pas les 9,2 Go de ce corpus et ne remplace ni son index ni ses preuves. Les trois ZIP ci-dessus étaient absents de son index ; leur conservation constitue uniquement le complément décrit ici. Les compteurs précédents restent des résultats historiques de récupération, sans nouvelle exécution du contrôle intégral de ce corpus.
