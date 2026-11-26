# Alien: Earth — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : V11.0.0.** Saison 1 condensée, moteur autonome ; audit historique d'intégration distinct du contenu.

70 lieux ; 32 tâches principales + 38 facultatives ; 102 liaisons / 204 seuils ; 958 placements / 49 types ; 331 règles ; 25 silhouettes ; 3 points de vue jouables.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Archive V11 préservée ; raccord natif non confirmé.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Corpus d'archive repéré : `archives/local-recovery-20261125/alien-earth/`. Voir la [branche d'archives épinglée](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6ed9b9210a097bbdf90ec3a22043a3fe5845e541/archives/local-recovery-20261125/alien-earth/).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Noms/fonctions attestés distingués d'adjacences reconstruites.
- Transferts géographiques/temporels explicites ; seuils ancrés.
- MCS-X/Maxim 9 Joe, pistolet Maginot Morrow ; KRISS documenté non jouable.
- Outils originaux marqués adaptation.

## Écarts concrets encore ouverts

- **ALIEN-EARTH-01** — Blueprints et inventaire image par image des huit épisodes non complets.
- **ALIEN-EARTH-02** — Armes/accessoires de fond, tenues/blessures, visages et animations.
- **ALIEN-EARTH-03** — Extérieurs New Siam/Neverland et chorégraphies non complets.
- **ALIEN-EARTH-04** — Audit historique : sauvegarde depuis le titre via visibilitychange à vérifier/corriger dans l'intégration actuelle.

## Reprise artistique et intégration

1. Comparer les 25 silhouettes et les packs récents avant de produire de nouveaux doublons.
2. Qualifier chaque personnage et chaque organisme contre les références de la saison 1 ; séparer invention de gameplay et espèce attestée.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Documents examinés

- `README_FR.md` — contenu lu.
- `docs/CODEX_ALIEN_EARTH_V11.md` — contenu lu.
- `ALIEN_EARTH_V11_INTEGRATION_AUDIT.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
