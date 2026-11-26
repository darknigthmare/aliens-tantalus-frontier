# AVP: Requiem — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 0.10.0-candidate.1 — Les lieux et les visages.** Module autonome ; montage cinéma/non censuré/scènes coupées encore distingués sans fusion sous un canon unique.

48 lieux au sol + 1 environnement aérien ; 65 liaisons / 130 seuils ; 15 séquences / 50 objectifs ; 373 props / 678 détails ; 30 entrées arsenal-équipement ; 11 profils / 8 présences secondaires ; 3 tableaux distants non jouables.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Livraison récupérée et documents lus ; préservation des sources en préparation, intégration native non qualifiée.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Corpus d'archive repéré : `archives/dlc-source-recovery-20261126/avp-requiem/`. La préparation de ce chemin n'est pas une preuve de publication ; consulter le reçu de récupération.

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D13` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- Routes/sentiers sans battant ; bâtiments ancrés ; descentes extérieures au sol ; Stryker avec rampe.
- Gunnison et clairière finale séparés par séquence aérienne.
- Armes film et jeu PSP non mélangées ; GUU-5P/Colt 723 reste incertain.
- Wolf masque/armure/cicatrice différenciés, sculpture faciale approximative.

## Écarts concrets encore ouverts

- **AVP-REQUIEM-01** — Préparation Wolf/homeworld, intérieur/prologue du vaisseau éclaireur et détachement orbital non reconstitués.
- **AVP-REQUIEM-02** — Commandement Stevens/remise Yutani consultatifs ; morgue/intérieurs secondaires incomplets.
- **AVP-REQUIEM-03** — Cimetière variante sans scène Karl ; pizzeria intérieur inventé ; maternité/nurserie sans toutes actions du film.
- **AVP-REQUIEM-04** — Stryker immobile ; Colt Python/MP5SD3/K3/CM203 et variantes sans gameplay complet.
- **AVP-REQUIEM-05** — Montage exact, apparences, dimensions et manipulations restent partiels.

## Reprise artistique et intégration

1. Établir le montage de référence par séquence ; ne pas ajouter dépôt de bus/scènes supprimées au cinéma sans étiquette.
2. Qualifier Wolf/Predalien/humains et leurs armes séparément ; garder les trois tableaux au statut documentaire.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Documents examinés

- `LIRE_DABORD.md` — contenu lu.
- `docs/AUDIT_FIDELITE_V0_10.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
