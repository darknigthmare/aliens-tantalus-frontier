# Aliens (1986) — V122, atlas et sprites manquants

**9 images ajoutées au catalogue, soit 164 au total : 7 images locales récupérées et 2 nouvelles générations.** Les neuf images sont reliées à huit fiches de lieux existantes, pour onze affichages dans l’atlas.

| Sprite | Dimensions natives | Origine |
| --- | ---: | --- |
| USS Sulaco — vue extérieure | 1774 × 887 | Local récupéré |
| Tracteur d’exploration Jorden — édition longue | 1717 × 916 | Local récupéré |
| Sulaco — dalle de pont | 1254 × 1254 | Local récupéré |
| LV-426 — façade du processeur atmosphérique | 1837 × 856 | Local récupéré |
| Hadley’s Hope — bâtiment de la colonie | 1774 × 887 | Local récupéré |
| Gateway — vue orbitale sur la Terre | 1586 × 992 | Local récupéré |
| Narcissus — navette de secours | 1472 × 1069 | Local récupéré |
| Hadley’s Hope — tour de liaison | 1254 × 1254 | Nouvelle génération |
| Hadley’s Hope — panneau de façade | 1536 × 1024 | Nouvelle génération |

## Intégration

Le cache V116 charge les PNG à l’ouverture de leurs fiches. Les images sont ajustées avec une échelle uniforme à leurs limites alpha mesurées. Les recherches, onglets, fermeture et échec réseau gardent les fiches lisibles. Aucun lieu, passage, véhicule pilotable ni changement de sauvegarde n’est introduit par ces illustrations. Le prologue Narcissus demeure une fiche sans salle jouable.

## Fidélité et provenance

Les originaux PNG sont conservés sans redimensionnement ni retouche des pixels par script. Les références comprennent des maquettes, un concept Ron Cobb, une illustration Syd Mead et un objet MoPOP. La tour de liaison et le panneau de façade sont les deux nouvelles créations ; la tour a reçu une correction ciblée des franges colorées. Les petites variations de géométrie, matières et usure restent documentées : **fidélité exacte 1:1 non validée**.

## Reprise

[Galerie](index.html) · [Bible complète JSON](bible.json) · [Bible de suivi](bible.md) · [Manifeste](manifest.json) · [Prompts et provenance](generation-ledger.json) · [Références](references.md) · [Vérifications](verification.json).

Les 20 PNG, 53 documents et 19 sources de poses historiquement signalés comme non récupérés ne sont pas déclarés retrouvés par cette livraison. Les catégories peuvent se recouper. Le Derelict endommagé 1986, les cycles d’animation complets et les parcours encore absents restent ouverts.

## Résultats de cette reprise

- 665/665 tests historiques du DLC et 38/38 tests du runner réussis. Les 328 assertions de présentation, dont 104 pour V122, sont incluses dans ce runner et ne s’ajoutent pas au total.
- Admission de 1 159 fichiers historiques et des 164 PNG réussie. Build isolé du DLC réussi, avec neuf ajouts et six manifestes historiques conservés.
- Revue indépendante : neuf PNG nouveaux et 155 PNG antérieurs vérifiés ; huit fiches et onze placements confirmés.
- Contrôle Chromium réel terminé le 26 novembre 2026 à 17 h 25 (Europe/Paris) : **28/28 vérifications réussies**, sur ordinateur (1440 × 1000) et mobile (390 × 844), sur les octets runtime du commit `48a9be00d6df`. Chargement des onze placements, proportions, recherche, onglets, cache, sauvegardes et repli en cas d’échec d’image vérifiés ; aucune erreur JavaScript. Le navigateur a été retrouvé dans un autre dossier de QA après l’échec initial de téléchargement HTTP 403, conservé dans le reçu historique.
- Le contrôle global du dépôt s’arrête sur les 105 JPG historiques absents du checkout partiel. La règle reste inchangée ; la CI sur le checkout complet reste nécessaire avant fusion.
