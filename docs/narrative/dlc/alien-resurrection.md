# Alien Résurrection — bible de reprise du 26 novembre 2026

[Retour à l'index des DLC](../DLC_INDEX_20261126.md)

## Périmètre et version

**Source examinée : 125.0.0-references-architecture-candidate.1.** Correctif V124 et aperçu ValidationHost ; une préservation de sources n'établit pas la fusion native.

60 états de salles ; 40 frontières locales dont 20 sas et 20 ouvertures ; 19 transferts narratifs ; 503 objets ; 15 nouveaux atlas / 167 clips / 697 images de frames.

Ces comptes reprennent la définition de la version source : états de scène, pièces physiques, inspections, occurrences de frames et images uniques sont comptés séparément.

## Publication et raccord au jeu

Archive historique préservée ; sources/essais locaux distincts de leur publication et d'une intégration native.

Aucune PR dédiée confirmée dans l'inventaire initial ; compléter depuis le reçu de publication, sans inventer de numéro.

Corpus d'archive repéré : `archives/local-recovery-20261125/alien-resurrection/`. Voir la [branche d'archives épinglée](https://github.com/darknigthmare/aliens-tantalus-frontier/tree/6ed9b9210a097bbdf90ec3a22043a3fe5845e541/archives/local-recovery-20261125/alien-resurrection/).

## Décisions à préserver

Cette fiche applique les exigences `D01`, `D02`, `D03`, `D04`, `D05`, `D06`, `D07`, `D08`, `D09`, `D12`, `D13`, `D15`, `D18`, `D19`, `D20`, `D21`, `D22` du [registre commun](../DLC_INDEX_20261126.md#exigences-issues-des-discussions). Leur portée est une demande de production et de qualité, pas l'affirmation que leur réalisation est achevée.

## Déjà documenté dans la source

- États de salle et pièces physiques distingués ; ouvertures permanentes non artificiellement fermables.
- Armes propriétaire et modes joueur distingués ; Draco à acquisition physique.
- Provenance de costumes Call/Christie/Wren ; chestburster séparé du facehugger.

## Écarts concrets encore ouverts

- **ALIEN-RESURRECTION-01** — Quartiers Perez absents comme lieu visitable distinct.
- **ALIEN-RESURRECTION-02** — Confrontation Purvis/Wren à déplacer réellement dans le Betty.
- **ALIEN-RESURRECTION-03** — Portage Christie/Vriess manquant ; fauteuil autonome non équivalent.
- **ALIEN-RESURRECTION-04** — Réservoirs/extérieurs/épilogue condensés ; visages illustrés non 1:1.

## Reprise artistique et intégration

1. Reprendre la matrice de référence avant toute création d'armes/tenues.
2. Traiter le portage comme poses + propriétaire de mouvement + passage, pas seulement image.
3. Garder inconnue la consigne historique « pas le 1 » dont la liste de conseils manque.

Pour chaque asset, renseigner un identifiant stable, la référence et sa scène, la tenue/l'état, le fichier et son empreinte, le pivot et l'échelle, puis le propriétaire du raccord. Conserver les états **absent → candidat → admis → chargé → raccordé → observé en jeu**. La correction d'une pose ne change pas le collider, la sauvegarde ni le destin narratif du personnage. La règle de priorité est la couverture réellement manquante au commit courant, après comparaison des manifests et des PR ci-dessus.

## Production commune précisée par les discussions

Les décisions `D18` à `D22` complètent le contrat commun : PNG indépendant par asset ou pose, profil latéral 2D et direction artistique Tantalus ; identité, tenue et variante conservées ; galerie et archive vérifiables. Associer une référence visuelle contextualisée lorsque disponible. Un résultat de recherche non ouvert reste une piste. Chaque continuité et chaque version gardent leur provenance ; les états d’IA propres aux castes restent à relier à des comportements réellement présents. Ces exigences ne certifient ni la couverture, ni un raccord encore absent.

## Rapport de livraison demandé dans les échanges

Le 25 septembre 2026 à 07:18:20 UTC, la demande « un rapport avec des captures du jeu à chaque fois » est formulée comme règle permanente (`D15`, preuve `CTX-R2-01`). Une reprise de version doit donc fournir le rapport associé, les captures du runtime effectivement observé, le parcours et les limites de la vérification. Une galerie d’assets ou une image générée n’est pas une capture de jeu.

Les anciens rapports V102/V103 mentionnent un codex hybride et des exceptions 2D (cuisines, shaft, Betty/Newborn, décompression). Ils restent des rapports historiques, à confronter à la matrice V125 avant modification ; leurs compteurs et réussites ne sont pas transférés à cette version. Les passages requis, le portage Christie/Vriess et le lieu du face-à-face Purvis/Wren doivent conserver leur preuve propre. La consigne «pas le 1» reste inconnue faute de la liste originale.

## Documents examinés

- `README_V125.md` — contenu lu.
- `docs/CODEX_REFERENCES_FIDELITE_V125.md` — contenu lu.

## Qualification

Les données décrivent les sources récupérées et les documents d'intégration cités. Aucun test gameplay n'a été relancé pour rédiger cette fiche. L'existence d'un document, d'un PNG ou d'une archive ne prouve pas sa jouabilité ni une fidélité 1:1.

La cible demeure `1:1` ; l'état de qualification reste `exact:false` et `canonExact:false` tant que la comparaison spécifique n'est pas acquise. Une adaptation identifiée conserve son étiquette.
