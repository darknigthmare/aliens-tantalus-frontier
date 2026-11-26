# Sauvegarde des sources de sept DLC — 26 novembre 2026

Ces archives restaurent sept livraisons originales qui n’étaient pas présentes dans la sauvegarde `archive/local-recovery-20261125`. Elles préservent exactement les ZIP reçus, sans modification de leurs membres. Les fragments de 10 Mio se concatènent dans l’ordre inscrit dans chaque manifeste. Chaque ZIP conserve son SHA256, son inventaire de membres, leurs SHA256 et CRC32, ainsi que les SHA de blobs Git des fragments.

| DLC | ZIP original | Octets | Manifeste |
| --- | --- | ---: | --- |
| Prometheus | ALIENS_TANTALUS_DLC_PROMETHEUS_V12.zip | 14 678 996 | [Manifeste](prometheus/MANIFEST.json) |
| Romulus | ALIEN_ROMULUS_CONVERGENCES_v0.20.zip | 47 349 199 | [Manifeste](romulus/MANIFEST.json) |
| Alien: Isolation | ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip | 85 001 778 | [Manifeste](alien-isolation/MANIFEST.json) |
| AVP: Requiem | ALIENS_TANTALUS_DLC_AVPR_V0_10.zip | 32 506 386 | [Manifeste](avpr/MANIFEST.json) |
| Colonial Marines | ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip | 62 621 653 | [Manifeste](colonial-marines/MANIFEST.json) |
| Alien 5 : Projet Lazare | DLC_ALIEN5_PROJET_LAZARE_V11_CANDIDAT.zip | 7 330 460 | [Manifeste](alien5-lazare/MANIFEST.json) |
| Blackout | ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip | 33 103 752 | [Manifeste](../blackout-source-recovery-20261126/alien-blackout/MANIFEST.json) |

**Total des ZIP originaux : 282 592 224 octets ; 31 fragments.** Les documents extraits sont des copies exactes choisies pour faciliter la lecture des bibles et des registres. Les autres membres restent intégralement conservés dans les ZIP ; ils ne sont pas écartés du sauvetage.

## Restauration

Depuis la racine du dépôt :

```sh
python3 archives/dlc-source-recovery-20261126/reconstruct.py archives/dlc-source-recovery-20261126/prometheus/MANIFEST.json --destination /tmp/tantalus-restored
```

Choisir le manifeste de la ligne souhaitée. Le script refuse d’écraser un fichier existant, vérifie chaque fragment, le ZIP complet et les CRC avant de rendre le fichier final disponible. Une reconstruction locale complète des sept ZIP a été vérifiée pendant la préparation de cette sauvegarde ; les SHA correspondent aux sept originaux.

## Portée

Les fichiers restent réservés aux sources et sont exclus de la distribution publique. Cette sauvegarde n’active aucun module, ne modifie aucun identifiant de jeu ni aucune sauvegarde joueur. Elle ne certifie ni le gameplay historique, ni les images, ni la fidélité 1:1.

`IMAGE_CANDIDATES.json` inventorie uniquement les fichiers graphiques par extension. Il peut contenir des captures QA, des références et des éléments d’interface : son nombre n’est pas un nombre de sprites manquants ou validés.

Projet Lazare conserve son statut de création alternative inspirée de concepts abandonnés ; ce n’est pas l’adaptation d’un scénario officiel complet.

Les bibles sont suivies dans [la PR68](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/68). L’intégration Blackout reste suivie dans [la PR54](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/54), que cette sauvegarde n’altère pas.

La suppression d’une copie locale ou persistante exige une vérification distincte de sa correspondance exacte avec cette sauvegarde publiée. La présence de ce dossier ne prouve aucune suppression ni libération d’espace.
