# Alien5 — Projet Lazare — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : V11 / 2.0.0-candidate.1 — Red Harvest.** Branche alternative originale après Aliens, inspirée de concepts de production. Aucun film réalisé ni scénario intégral authentifié à reproduire.

68 lieux ; 95 connexions / 190 seuils ; 12 chapitres ; 27 objectifs ; 26 entrées matériel/installations ; 14 identités ; 43 références, dont 42 interprétations partielles et une à approfondir.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

ZIP récupéré et vérifié localement ; transfert GitHub des octets interrompu par l'indisponibilité de l'environnement. Intégration native non qualifiée.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Chemin de publication prévu : `archives/dlc-source-recovery-20261126/alien5-lazare/`. Ce chemin a été préparé localement ; aucun octet de ce ZIP n'a été publié. Voir le [reçu des sept archives](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Calder/Lazare, raccords, civils/dialogues/fins = créations du jeu ; Alien 3/Résurrection non effacés.
- Relais Newt désarmée, positions/ressources séparées, recrutement différent d'évacuation.
- Prototype biomécanique quatrième arme avec réserve finie ; valeurs = gameplay.
- Décor monumental du Derelict ne promet pas un intérieur sans raccord.

## Écarts concrets encore ouverts

- **ALIEN5-PROJET-LAZARE-01** — Authentification partielle des concepts et correspondances ; pas reconstitution de film 1:1 possible sur ces seules sources.
- **ALIEN5-PROJET-LAZARE-02** — Rendu vectoriel, métrique et équilibres humains non qualifiés.
- **ALIEN5-PROJET-LAZARE-03** — Le codex cumulatif conserve des comptes historiques V10 (60 lieux/83 liens) ; utiliser README/audit V11 pour 68/95.

## Reprise artistique et intégration

1. Étiqueter chaque asset comme concept attesté adapté ou création Lazare ; garder canonExact:false.
2. Préserver l'identité originale de Calder et des systèmes P-17/M-4/S-12 ; ne pas inventer leur présence dans une œuvre publiée.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

Archive : nom exact non consigné dans ce reçu ; SHA-256 `c90acf14976373a0bcdb28748f32a1abcf1d29693384d6258e36b38b1774841c` ; 7 330 460 octets. Les noms suivants sont relatifs à la racine extraite (préfixe ZIP non consigné) et rattachés à cette archive. Le [reçu de récupération](RECUPERATION_20261126.md#sept-archives-verifiees-mais-non-publiees) conserve le statut de transfert.

- `README.md` — contenu lu.
- `docs/CODEX_REGLES_V11.md` — contenu lu.
- `docs/AUDIT_FIDELITE_V11.json` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
