# Alien: Covenant — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.10.0.** Module autonome avec registre d'adaptation ; aucune ligne verified1to1=true annoncée.

56 espaces physiques + tableau séparé ; 67 liaisons / 134 seuils ; 42 objectifs / 12 chapitres ; 315 fiches dont 224 cinéma : 150 correspondances partielles et 74 sans correspondance.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Archive historique préservée ; intégration locale à préserver séparément, pas de PR runtime dédiée confirmée.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Corpus d'archive repéré : `archives/local-recovery-20261125/alien-covenant/`. Voir la [branche d'archives épinglée](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6ed9b9210a097bbdf90ec3a22043a3fe5845e541/archives/local-recovery-20261125/alien-covenant/).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13`, `D14` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Support/matière/contact par seuil ; embarquement de berge distinct d'une porte.
- Pièce blanche séparée ; Origae-6 non inventée comme lieu visité ; lander condamné selon chronologie.
- Walter intact/amputé, David sanctuaire et David sous apparence Walter distincts.
- Quatre armes manipulables ; SL40 représenté sans projectile inventé.

## Écarts concrets encore ouverts

- **ALIEN-COVENANT-01** — 74 références cinéma sans correspondance dans le registre source.
- **ALIEN-COVENANT-02** — Cabine cargo lifter, volumes de lancement/amarrage, états biologiques et équipements particuliers partiels.
- **ALIEN-COVENANT-03** — Visages, plans cotés et chorégraphies non certifiés.

## Reprise artistique et intégration

1. Toute génération doit indiquer Covenant explicitement, conformément à la correction utilisateur du 26 novembre.
2. Prioriser les profils actifs distincts et les équipements déjà raccordés ; conserver apparence Walter après révélation.
3. Les données de jeu (munitions/dégâts) ne deviennent pas des spécifications canoniques.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `docs/CODEX_LEVEL_DESIGN_COVENANT.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
