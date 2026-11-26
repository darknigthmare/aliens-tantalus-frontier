# Reçu de récupération et d'espace libéré — 26 novembre 2026

[Retour à l'index DLC](../DLC_INDEX_20261126.md) · [Reçu JSON](RECUPERATION_20261126.json)

## Résultat constaté

**31 copies locales ont été supprimées après comparaison avec GitHub, soit 1 959 810 600 octets de copies supprimées. Aucune suppression de fichier distant n'a réussi.** Le résultat porte sur le disque de travail local ; il ne prouve aucune augmentation du quota distant.

| Opération | Résultat vérifié | Limite |
| --- | --- | --- |
| Archives historiques sur GitHub | 16 archives, 7 familles, 1 189 845 299 octets vérifiés au [commit 6ed9b921](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6ed9b9210a097bbdf90ec3a22043a3fe5845e541/archives/local-recovery-20261125) | Périmètre des archives de cette branche |
| Nettoyage local | 31 copies, 1 959 810 600 octets supprimés après contrôle distant | Aucune modification de dépôt supprimée ; reçu agrégé, sans liste individuelle des 31 copies |
| Nettoyage distant | 0 fichier supprimé, 0 octet libéré | 15 tentatives ont échoué avec `destination_conflict` lors de la migration ; une nouvelle tentative Covenant a échoué de la même façon |
| Sept ZIP récupérés pendant la reprise | 282 592 224 octets lus ; CRC, chemins et identité des fichiers d'origine contrôlés | Transfert des octets sur GitHub interrompu par l'indisponibilité de l'environnement |

Les 31 copies locales peuvent inclure plusieurs copies d'un même contenu. Leur volume ne doit pas être additionné à celui des 16 archives comme s'il s'agissait de fichiers uniques. Ce reçu rapporte les résultats agrégés de la passe de récupération ; il n'invente pas un inventaire individuel des suppressions.

## Sept archives verifiees mais non publiees

**Aucun des sept ZIP de ce tableau n'a été publié pendant cette reprise.** Les empreintes attestent les fichiers contrôlés avant l'interruption. Elles permettent une reprise et une comparaison future ; elles ne certifient pas l'existence des octets sur GitHub.

| Famille / version | Archive | Octets | SHA-256 |
| --- | --- | ---: | --- |
| Prometheus V12 | `ALIENS_TANTALUS_DLC_PROMETHEUS_V12.zip` | 14 678 996 | `b7d1e1324dd6e4e08ce5bb6574a68a204a4214e649dc8c79e2d705b6da336da1` |
| Alien: Romulus v0.20 | `ALIEN_ROMULUS_CONVERGENCES_v0.20.zip` | 47 349 199 | `f36995586ebc169a6d36fd52d4e62e0d353f1c5228a46c37cd273dd081c51293` |
| Alien: Isolation v0.8 | `ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip` | 85 001 778 | `880f74e69551afd41af36b62c34778dd239a10386f573cb86eb170641855a978` |
| AVP: Requiem v0.10 | `ALIENS_TANTALUS_DLC_AVPR_V0_10.zip` | 32 506 386 | `b74829983d3ddedd5d55b7a3aa6fc40a9f315966ada4bb733495e3b4d7731617` |
| Aliens: Colonial Marines v0.10 | `ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip` | 62 621 653 | `5d7e921c787396377098457898f28b99424c306f340ec0b4973a01595cca6322` |
| Alien5 — Projet Lazare V11 | `DLC_ALIEN5_PROJET_LAZARE_V11_CANDIDAT.zip` | 7 330 460 | `c90acf14976373a0bcdb28748f32a1abcf1d29693384d6258e36b38b1774841c` |
| Alien: Blackout v0.7 | `ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip` | 33 103 752 | `b02538fafdc1a73aa88d80efa82e51d5852a6bf4fdaee85f90972ab32f21e35c` |

Le [reçu JSON](RECUPERATION_20261126.json) associe chaque empreinte aux documents sélectionnés et au chemin de publication prévu. Les préfixes ZIP non consignés restent nuls. Les chemins `archives/dlc-source-recovery-20261126/…` et `archives/blackout-source-recovery-20261126/…` ont été préparés localement : ils ne sont pas des liens vers des archives publiées. Le ZIP Blackout complète la récupération de la [PR #54](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/54) ; cette publication complémentaire reste à faire. Aucune nouvelle PR de préservation des six autres ZIP n'est annoncée.

Les documents sélectionnés ont été lus pour les bibles. Ni le lancement des sept modules ni leurs campagnes n'ont été retestés pour ce reçu.

## Travaux effectivement préservés dans les PR

| Lot | État au relevé | Preuve et suite |
| --- | --- | --- |
| Aliens V115 | 70 PNG en [PR #65](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/65), brouillon | Commit `30353c828cca199a7c1f2b07fa05b438326db86e` ; qualification et raccord à achever |
| Fleuve de la Douleur | 28 props supplémentaires en [PR #66](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/66), 70 PNG au total sur sa branche | Commit `0adf04e16e38adbb325cf297727bb414dc8df646` ; aucune certification 1:1 ajoutée par ce reçu |
| Mer des Chagrins | 33 fichiers / 48 916 609 octets, dont 28 PNG, en [PR #67](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/67), brouillon | Commit `bfae75ca358810b83dceea5a0c65ba259f53690d` ; ledger de 126 chemins, 93 fichiers encore à transférer |
| Covenant | 3 PNG / 4 414 495 octets, en [PR #69](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/69), brouillon | Commit `65e3c378b8dd4469a053eafff6a5ae4d5a9669e1` ; candidats conservés en source, sans raccord runtime |

### Candidats Covenant

Le [manifeste épinglé de PR69](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/65e3c378b8dd4469a053eafff6a5ae4d5a9669e1/docs/development/covenant-sprites-20261126/manifest.json) décrit trois fichiers physiques : `neomorph-adult-citadel.png` (1774 × 887), `facehugger-covenant.png` (2172 × 724) et `ovomorph-covenant.png` (1166 × 1349). Le JSON de ce reçu reprend leurs tailles, SHA-256 et SHA Git.

Deux générations ont été refusées et n'ont créé aucun fichier : `neomorph-juvenile-hallett.png` et `xenomorph-covenant-idle.png`. Elles ne sont pas comptées dans la livraison. Les trois candidats ont des octets conservés et une structure PNG contrôlée ; la qualité de l'alpha, l'apparence scène par scène, les pivots, l'échelle et leur observation en jeu restent à qualifier. Les statuts demeurent `runtimeIntegrated:false` et `verified1to1:false`.

## Travail restant avant un nouveau nettoyage

- **Anthologie 40e anniversaire :** bundle de 256 822 850 octets et intégration locale repérés ; publication du bundle non réalisée dans cette reprise.
- **Covenant :** modifications locales du raccord encore à préserver. Les trois PNG de PR69 ne sauvegardent pas ce travail d'intégration.
- **Earth :** nouveaux sprites et manifests locaux à retrouver, comparer et publier.
- **Hors des Ombres :** différences locales et recouvrement avec la [PR #59](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/59) à réconcilier avant suppression.
- **Mer des Chagrins :** 93 fichiers du snapshot de 126 chemins restent à transférer ; la PR67 constitue un point de reprise partiel, pas une livraison complète du renderer.
- **Sept ZIP du tableau :** reprendre les octets accessibles, publier dans les PR appropriées, puis vérifier chaque empreinte distante.

Aucun de ces manques n'est déclaré sauvegardé par l'existence de ce reçu. Une ligne de manifeste sans octets transférés ne permet pas le nettoyage du fichier correspondant.

## Portée documentaire et fidélité

Les 18 fiches de bibles intègrent les exigences et les écarts des documents réellement lus. L'accès aux conversations historiques complètes était indisponible ; la consolidation ne prétend pas couvrir tous les chats. La cible de fidélité reste 1:1, avec `exact:false` et `canonExact:false` tant que la référence et la comparaison spécifique ne sont pas acquises.

L'environnement local est devenu indisponible avant la fin des transferts. Aucune exécution de gameplay n'est attribuée à ce reçu. Les résultats CI distants doivent rester attachés à leur commit ; les validations d'une autre PR ne sont pas transférées à cette branche.

## Précisions de reprise

Les noms des sept archives sont maintenant consignés avec leurs tailles et leurs empreintes. Les racines internes non relevées restent indéterminées. Le volume de nettoyage représente la somme des tailles des copies supprimées ; l'espace libre final n'a pas été mesuré après l'indisponibilité de l'environnement.

Pour Hors des Ombres, 365 des 368 fichiers locaux examinés correspondaient déjà à la PR59 au commit `4af559dfa8db35cbc3b028c415d557366d9d075e`. Les trois scripts distincts et le pack artistique local nécessitent encore une sauvegarde. Pour Résurrection, l'archive V125 est préservée, tandis que le brouillon local d'intégration et d'admission reste à publier.
