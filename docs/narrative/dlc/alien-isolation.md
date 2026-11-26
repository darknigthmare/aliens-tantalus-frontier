# Alien: Isolation — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.8.0 — Une station, des chemins.** Adaptation autonome condensée ; pas toutes les pièces ni tous les DLC commerciaux d'Alien: Isolation.

76 lieux ; 112 liaisons / 224 seuils ; 840 placements ; 246 règles ; 19 chapitres ; 52 objectifs ; 32 tâches facultatives ; 57 archives ; 155 SVG.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Livraison récupérée et documents lus ; préservation des sources en préparation, intégration native non qualifiée.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Corpus d'archive repéré : `archives/dlc-source-recovery-20261126/alien-isolation/`. La préparation de ce chemin n'est pas une preuve de publication ; consulter le reçu de récupération.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Ouverture, approche et arrivée distinctes ; neuf changements de pont représentés en escaliers.
- Morley requis à chaque entrée de pharmacie ; KG-348 verrouille ses annexes.
- Chasseur non tuable ; roue/équipement sans pause ; Nora/Elias escortes originales.
- Carte globale schématique et transports inter-salles condensés.

## Écarts concrets encore ouverts

- **ALIEN-ISOLATION-01** — Plan métrique complet, toutes les pièces et extensions commerciales non reproduits.
- **ALIEN-ISOLATION-02** — Rendu vectoriel provisoire, visages/animations et correspondance exacte des appareils à qualifier.
- **ALIEN-ISOLATION-03** — Persistance native et hôte Tantalus non qualifiés par les essais en mémoire du paquet.

## Reprise artistique et intégration

1. Inventorier Amanda, le chasseur, synthétiques et appareils depuis le vrai contenu, puis rapprocher les 155 SVG.
2. Conserver l'équilibre de furtivité et la non-mortalité du chasseur ; un nouvel asset ne justifie pas un arsenal létal contre lui.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `README_FR.md` — contenu lu.
- `docs/CODEX_ISOLATION.md` — contenu lu.
- `docs/METRIQUES.json` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
