# Alien 3 / Fiorina 161 — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : V114 natif, V116 fusionné, V117 en PR.** Campagne native ; audit préparatoire V117 confronté au document de la PR64.

V117 : 77 PNG distincts ; 91 entrées ; 107 occurrences de frames ; 14 animations. Seize PNG nouveaux dont onze employés par les raccords natifs et cinq documentaires.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

V114 native et V115/V116 fusionnées dans la cumulative ; V117 en PR64 ouverte.

[PR #56](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/56) · [PR #61](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/61) · [PR #63](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/63) · [PR #64](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/64)

Chemins repérés : `src/alien3-*.js`, `assets/openai/sprites/alien3-fiorina-v115/`.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D11`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Appui/pivot, propriétaire de collision et garde narrative conservés par raccord.
- Spike/montage cinéma et bovin/Assembly séparés ; scènes d'inspection ≠ route de campagne.
- Pas d'arsenal Marines pour Ripley ; fusil Compagnie représenté à l'arrivée, non ramassable.
- V117 livre course Runner à quatre phases, windup, six poses d'arrivée Ripley et downed prison ; 61 PNG historiques conservés.

## Écarts concrets encore ouverts

- **ALIEN3-FIORINA-01** — Runner recover et M41A noir autonome non produits, service image ayant refusé les tentatives de V117.
- **ALIEN3-FIORINA-02** — Enregistreur de vol et kit médical complet sans géométrie de référence suffisante ; seringue/flacon séparés ne ferment pas le kit.
- **ALIEN3-FIORINA-03** — EEV et autres props demandent un raccord natif identifié et une image admissible ; pas de substitution globale inventée.
- **ALIEN3-FIORINA-04** — Toutes les nouvelles entrées gardent exact:false ; les écarts de dôme, marquages et parties cachées restent déclarés.

## Reprise artistique et intégration

1. Lire le manifeste V117 et ses raccords avant de générer ; préserver les anciens reçus V115/V116.
2. Ne pas réintroduire Murphy/Boggs/Rains vivants pour afficher leurs poses.
3. Ne pas confondre une lampe de catalogue avec les lampes fixes actives.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `AUDIT_RACCORDS_V117.md` — contenu lu.
- `AUDIT_SPRITES_FIORINA_V114.md` — contenu lu.
- [FIORINA_SPRITES_V117.md](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/906d514fdae2a110ab1a5b0c9598c36068d6425e/docs/development/FIORINA_SPRITES_V117.md) — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
