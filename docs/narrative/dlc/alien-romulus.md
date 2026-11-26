# Alien: Romulus — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.20 — Convergences.** Module autonome ; dialogues et chorégraphies d'adaptation originaux, séquences temporelles distinguées des niveaux libres.

20 chapitres ; 53 états de scène ; 26 lieux persistants + 2 lieux temporels ; 60 manipulations ; 38 séquences + prologue ; 41 franchissements physiques ; 30 seuils partagés ; 30 entrées matériel ; 8 profils ; 10 écarts.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

ZIP récupéré et vérifié localement ; transfert GitHub des octets interrompu par l'indisponibilité de l'environnement. Intégration native non qualifiée.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Chemin de publication prévu : `archives/dlc-source-recovery-20261126/alien-romulus/`. Ce chemin a été préparé localement ; aucun octet de ce ZIP n'a été publié. Voir le [reçu des sept archives](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Séquence Andy/Jackson's Star enrichie sans copier les dialogues du film.
- Capsules guidées vers le sas ; bâtis fixes conservés ; transfert complet vers Corbelan encore ellipse.
- Monte-charge Kay animé/sauvegardable ; course complète non prétendue.
- Couches pluie Navarro/Kay/Bjorn/Tyler, parka rouge Rain et tenue Andy séparées.

## Écarts concrets encore ouverts

- **ALIEN-ROMULUS-01** — Prologue exploratoire, foule complète et extensions Jackson's Star incomplets.
- **ALIEN-ROMULUS-02** — Trajet intégral capsules/Corbelan et course inter-ponts du monte-charge.
- **ALIEN-ROMULUS-03** — Lieu exact de l'injection Kay non certifié ; plans Renaissance/Corbelan non métriques.
- **ALIEN-ROMULUS-04** — Second F44 Tyler partiellement simulé ; vêtements/dommages/visages stylisés.
- **ALIEN-ROMULUS-05** — Couloir de sécurité coupé volontairement exclu, à ne pas inventer dans le montage cinéma.

## Reprise artistique et intégration

1. Comparer les manifests incarnation/concordance avant de produire des doublons.
2. Distinguer infrastructure fixe (berceau, monte-charge) et matériel attribuable à Rain.
3. Garder les ellipses déclarées tant qu'une référence ne justifie pas le trajet physique.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

Archive : `ALIEN_ROMULUS_CONVERGENCES_v0.20.zip` ; SHA-256 `f36995586ebc169a6d36fd52d4e62e0d353f1c5228a46c37cd273dd081c51293` ; 47 349 199 octets. Les noms suivants sont relatifs à la racine extraite (préfixe ZIP non consigné) et rattachés à cette archive. Le [reçu de récupération](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees) conserve le statut de transfert.

- `README.md` — contenu lu.
- `docs/REGISTRE_CONVERGENCES_V20.json` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
