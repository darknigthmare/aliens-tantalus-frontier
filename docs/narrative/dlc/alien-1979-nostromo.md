# Alien / MIRE Nostromo — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : V119.** Branche autonome cumulative ; pas de fusion native attestée par la livraison source.

62 états de scène ; 51 connexions / 102 faces ; 229 cibles physiques ; 20 catégories d'équipement ; 46 opérations narratives.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Archive historique préservée ; aucun raccord natif dédié confirmé par ce snapshot.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Corpus d'archive repéré : `archives/local-recovery-20261125/mire-nostromo/`. Voir la [branche d'archives épinglée](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6ed9b9210a097bbdf90ec3a22043a3fe5845e541/archives/local-recovery-20261125/mire-nostromo/).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Ponts/corrosion structurés par fonctions et raccords de gameplay.
- Dallas/Lambert/Kane EVA avec repères rouge/bleu/jaune ; tenue claire Narcissus distincte pour Ripley.
- RXF-M5 visible sans transformation en arme libre.

## Écarts concrets encore ouverts

- **ALIEN-1979-NOSTROMO-01** — Relevé métrique complet des ponts et du Narcissus.
- **ALIEN-1979-NOSTROMO-02** — Visages, proportions, textures et chorégraphies à qualifier.
- **ALIEN-1979-NOSTROMO-03** — Raccord de lancement/retour/sauvegarde à établir depuis les sources réelles.

## Reprise artistique et intégration

1. Rapprocher les 20 catégories d'équipement et les variantes EVA des fichiers réellement produits avant génération.
2. Qualifier le Big Chap, les tenues par scène et le Narcissus contre leurs références ; garder les dimensions de jeu séparées des cotes de tournage.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `README.md` — contenu lu.
- `docs/CODEX_LEVEL_DESIGN_V119.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
