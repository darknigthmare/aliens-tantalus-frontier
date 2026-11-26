# Récupération des DLC — reprise du 26 novembre 2026

[Index des DLC](../DLC_INDEX_20261126.md) · [Reçu structuré](RECUPERATION_20261126.json)

**Les 13 archives originales supplémentaires sont sauvegardées : 456 836 135 octets. Les 110 PNG historiques de La Mer des Chagrins sont également conservés avec leurs empreintes.** Les bibles comptent 18 familles et 22 exigences. Aucune fidélité visuelle 1:1 ni activation gameplay nouvelle n’est déduite de ces sauvegardes.

Ce document sépare la reprise actuelle du [reçu précédent](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/a4c8ae68eb66ef3a85dbabab89aa03780cd72d62/docs/narrative/dlc/RECUPERATION_20261126.md). Les anciens 31 effacements de copies locales et leur 1 959 810 600 octets ne sont pas comptés une deuxième fois. L’espace libre constaté après réinitialisation de l’environnement ne constitue pas une mesure de nettoyage effectué par cette reprise.

## Sauvegardes de cette reprise

### Sept archives complémentaires — PR #73

[PR #73](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/73), commit `6b46eaf8f574871e39487e0a10ef46acfb1f41a6` : **7 ZIP, 282 592 224 octets**, 31 fragments, 153 documents extraits exactement. Le lot comprend 210 fichiers de dépôt, 301 491 758 octets avec documents et scripts ; ce volume ne s’ajoute pas à celui des ZIP comme un autre ensemble d’originaux.

| DLC | Archive originale | Octets | Preuve de reconstruction |
| --- | --- | ---: | --- |
| prometheus | ALIENS_TANTALUS_DLC_PROMETHEUS_V12.zip | 14 678 996 | [Manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/dlc-source-recovery-20261126/prometheus/MANIFEST.json) |
| alien-romulus | ALIEN_ROMULUS_CONVERGENCES_v0.20.zip | 47 349 199 | [Manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/dlc-source-recovery-20261126/romulus/MANIFEST.json) |
| alien-isolation | ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip | 85 001 778 | [Manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/dlc-source-recovery-20261126/alien-isolation/MANIFEST.json) |
| avp-requiem | ALIENS_TANTALUS_DLC_AVPR_V0_10.zip | 32 506 386 | [Manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/dlc-source-recovery-20261126/avpr/MANIFEST.json) |
| colonial-marines | ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip | 62 621 653 | [Manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/dlc-source-recovery-20261126/colonial-marines/MANIFEST.json) |
| Alien 5 — Projet Lazare | DLC_ALIEN5_PROJET_LAZARE_V11_CANDIDAT.zip | 7 330 460 | [Manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/dlc-source-recovery-20261126/alien5-lazare/MANIFEST.json) |
| alien-blackout | ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip | 33 103 752 | [Manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/6b46eaf8f574871e39487e0a10ef46acfb1f41a6/archives/blackout-source-recovery-20261126/alien-blackout/MANIFEST.json) |

Les sept empreintes complètes correspondent au premier reçu. CRC de tous les membres, chemins sûrs, reconstruction physique et égalité SHA-256 sont vérifiés. Les 210 chemins distants, modes, tailles et blobs correspondent au plan : 0 écart. Les inventaires contiennent 2 746 fichiers internes, plus 24 entrées de répertoires Prometheus. Quinze tests locaux de succession/admission passent ; ces résultats ne sont pas une nouvelle suite gameplay ni une anticipation de la CI globale.

Les 207 fichiers de préservation sont admis uniquement en source avec tailles et empreintes ; la distribution construite les refuse. Les trois autres fichiers sont les scripts de contrôle et de succession. L’admission doit être réconciliée avec celles des autres PR lors d’une future fusion. Blackout reste associé à la [PR #54](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/54), dont la branche n’est pas modifiée par cette sauvegarde.

### Six versions du 40e anniversaire — PR #72

[PR #72](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/72), tête `8ec16d6448e0833e932294456e3393674a4a79ad` : **6 ZIP, v0.1 à v0.6, 174 243 911 octets**, 20 fragments et 13 documents source. Le [manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/8ec16d6448e0833e932294456e3393674a4a79ad/archives/40th-anniversary-recovery-20261126/MANIFEST.json) et le [reçu de vérification](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/8ec16d6448e0833e932294456e3393674a4a79ad/archives/40th-anniversary-recovery-20261126/VERIFICATION.json) conservent les preuves.

Les 6 CRC et les 6 reconstructions complètes sont conformes. Les 36 fichiers du premier commit ont été comparés à leurs blobs/modes/tailles ; le 37e fichier est le reçu de vérification. **L’admission précise avant fusion reste à réaliser pour cette PR.** Aucun menu ou moteur n’est modifié. Le commit local `1f39f0f2c41e6a8c80eca4fd5481b92ac372972d` et son bundle de 256 822 850 octets restent non récupérés ; les six archives originales ne sont pas une restitution de ce WIP.

### Mer des Chagrins — PR #67

[PR #67](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/67), commit `e716f75318f243a981fdf6e64728cd6f039ad6dd` : **115/126 sources uniques, 215 587 160 octets**, dont **110 PNG et 5 fichiers texte**. Le [ledger réconcilié](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/e716f75318f243a981fdf6e64728cd6f039ad6dd/archives/sea-sprites-recovery-20261126/RECOVERY_LEDGER.json) associe chaque chemin source à son fichier préservé. Les 110 PNG sont conservés sous `sprites-complete/`, avec les chemins exacts indiqués dans le ledger.

Ces images ont été retrouvées par leur contenu ; elles ne sont pas de nouvelles générations. Les variantes déjà présentes dans la PR #58 ou sous un autre chemin d’archive ne sont pas ajoutées une seconde fois au total unique. Les anciens compteurs 33/38 sources et 93/88 manquants sont supersédés. Il reste **11 fichiers de code/configuration, 225 325 octets**, listés ci-dessous ; leur recherche de blob a renvoyé NOT_FOUND. L’absence actuelle ne signifie pas qu’ils n’ont jamais existé.

| Fichier source restant | Octets | SHA Git attendu |
| --- | ---: | --- |
| `dlc/sea-of-sorrows-visual/src/art-pack.js` | 42 511 | `413e6fcf637f20fff668b88cb37c561253fddc22` |
| `dlc/sea-of-sorrows-visual/src/gallery.js` | 7 603 | `5817c0ec29695ca79037bb4be35dd248d5fc4904` |
| `dlc/sea-of-sorrows-visual/src/png-renderer.js` | 42 552 | `e6be8473acb9c410b7e9b04d294cf4ef3f422604` |
| `package.json` | 23 562 | `0f245a74beb4b4afca261849a3ca8263ac070eb3` |
| `scripts/build-asset-filter.mjs` | 32 235 | `d65aec47499cbd776393a7dd364fee614d893775` |
| `scripts/mer-des-chagrins-admission-20261125.mjs` | 17 012 | `eff73761509f336c815c993323f10f378edcae36` |
| `scripts/mer-des-chagrins-visual-admission-20261125.mjs` | 7 759 | `1d8e3bf6019bc7c00340ccf85c06bc9edf0493a1` |
| `scripts/verify-mer-des-chagrins-admission-20261125.mjs` | 12 961 | `0914405703f736e12476f97a3fd79107b9d3b0d3` |
| `scripts/verify-mer-des-chagrins-sprite-pack-20261125.mjs` | 7 038 | `3242153dbd3bcb81d4e43e41c0a58e62876c23ef` |
| `scripts/verify-mer-des-chagrins-visual-20261125.mjs` | 25 432 | `f1195c792b3d8407b9f425cd988fce103f071b52` |
| `scripts/verify-mer-des-chagrins-visual-admission-20261125.mjs` | 6 660 | `958a315a94be0815b43b11a2aaed7daabe96be49` |

Les pivots de 48 décors, l’orientation des deux brancards et les deux correctifs du renderer restent à appliquer au code complet, puis à tester. Aucun basculement vers un module incomplet n’a été effectué.

## Nouveaux sprites AVP

La [PR #74](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/74), commit `8e8d51c186052c0b0662786677dea3652c915583`, préserve **trois nouveaux PNG : 11 048 227 octets**. Ils représentent un panneau rituel, une dalle au serpent et une dalle au masque, guidés par les photographies d’accessoires de tournage recensées dans le [manifeste](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/8e8d51c186052c0b0662786677dea3652c915583/assets/openai/sprites/avp2004-reliefs-v001/manifest.json). Leur couverture vise les décors `AVP2004-159` et `AVP2004-249`.

Ces fichiers restent des **sources candidates**. L’alpha médian est 253/255 ; des pixels faiblement opaques subsistent autour des silhouettes, et les détails doivent être comparés aux références. Aucune intégration runtime ni fidélité 1:1 n’est certifiée. Les trois PNG originaux sont intacts. Les six fichiers du lot sont admis uniquement en source ; les 16 tests ciblés et la comparaison des dix fichiers distants ne constituent pas une validation artistique.

## Bibles et discussions

Le commit `84cca8266421b3d865941acd645c861549c121ef` de la [PR #68](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/68) modifie 20 documents existants : 18 fiches, index et registre. Il conserve les 14 exigences initiales et ajoute 8 exigences datées (D15–D22). Les trois recherches ciblées produisent des synthèses, pas un export exhaustif des conversations.

Les ajouts concernent rapports avec captures de jeu, mode hybride et Codex Fiorina dédié, quatre priorités Romulus, PNG individuels, profil 2D et galerie, continuités et archives historiques, références visuelles, castes IA et provenance par support/tier. Les 77 liens relatifs et 20 empreintes Git ont été vérifiés. Les scripts et leurs reçus historiques ne sont pas modifiés par ces textes.

Les progrès voisins restent attribués à leur propre PR : Aliens 123 PNG en [PR #70 fusionnée](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/70) ; Covenant 49 PNG, 29 admis/20 catalogue en [PR #71 ouverte](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71). Leurs images et tests ne sont pas présentés comme créés ou exécutés par cette consolidation.

## Nettoyage et espace

Une nouvelle tentative a porté sur l’archive Covenant V0.10, vérifiée à nouveau (77 435 386 octets, SHA-256 `b765f46776df1308d3872f4793478facc18f2b0603ade64fddbe4d996a4183d1`). Les 121 fragments des archives historiques ont été comparés au manifeste GitHub : 0 écart de SHA/taille.

La suppression persistante a encore échoué : `destination_conflict`, « Library folder migration requires a fresh native request ». **0 fichier persistant supprimé et 0 octet de quota libéré par cette tentative.** Les tentatives répétées ont été arrêtées. Aucune copie non sauvegardée n’est déclarée effacée.

Après vérification distante, **78 copies temporaires créées pour cette reprise ont été supprimées : 1 447 943 791 octets logiques, zéro échec**. Le reçu JSON conserve chaque entrée, son nom, sa catégorie, sa taille, son empreinte et son chemin de sauvegarde distant.

| Groupe de copies temporaires | Fichiers supprimés | Octets logiques |
| --- | ---: | ---: |
| Six archives du 40e anniversaire, reconstructions et fragments | 32 | 522 731 733 |
| Sept archives complémentaires, reconstructions et fragments | 45 | 847 776 672 |
| Copie de contrôle Covenant V0.10 | 1 | 77 435 386 |
| Total de cette reprise | 78 | 1 447 943 791 |

Les archives téléchargées, leurs reconstructions et leurs fragments sont des copies des mêmes originaux. Ce total mesure la taille logique des copies locales retirées ; il ne s’ajoute pas au volume des originaux comme s’il s’agissait d’éléments distincts, et il ne mesure pas le quota persistant de ChatGPT. Les dossiers anciens manquants après réinitialisation ne sont pas comptés comme des suppressions exécutées ou validées ici. Les 31 suppressions locales du premier passage restent dans le [reçu historique](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/a4c8ae68eb66ef3a85dbabab89aa03780cd72d62/docs/narrative/dlc/RECUPERATION_20261126.json).

Une seconde lecture indépendante des arbres distants confirme 36/36 sources initiales du 40e anniversaire, 115/115 sources Mer dont 110 PNG, et 210/210 fichiers des sept archives, sans divergence de SHA, de taille ou de mode. Ce contrôle porte sur les octets préservés ; il ne certifie pas leur fidélité visuelle.

## Travail restant

- Retrouver les 11 fichiers Mer, reconstituer le renderer complet et valider son activation.
- Récupérer l’ancien WIP et le bundle du 40e anniversaire ; les 6 archives sont désormais sauvegardées.
- Retrouver les 20 anciens PNG et 53 documents Aliens signalés non transférés, ainsi que les sources de poses déjà absentes.
- Retrouver les sprites/manifests Earth, les trois scripts distincts et le lot artistique Hors des Ombres, les anciens WIP Résurrection et Covenant non identifiés octet pour octet.
- Compléter les animations et les variantes réellement manquantes avec références ; les refus antérieurs, les objets sans référence et les assets de catalogue restent explicitement séparés.

La fidélité 1:1 reste une cible de production. Intégrité des fichiers, sauvegarde GitHub, admission au build, rendu actif, parcours réel et comparaison visuelle sont des validations distinctes.
