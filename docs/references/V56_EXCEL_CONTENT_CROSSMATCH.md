# V56 — recoupement conversation / classeur Alien

Date de contrôle : 2026-08-24

## Sources consultées

- Conversation partagée du projet : <https://chatgpt.com/share/6a86c53b-94f0-83ed-af79-36bd234ddc29>
- Classeur local contrôlé : `Alien_Franchise_Encyclopedie_Exhaustive.xlsx`
- SHA-256 du classeur : `2A82ACA78FDAD882D913F93833CA9A1CC50E9195AAAD0478A4D8B6D0B1EA420B`
- Date déclarée dans le classeur : 2026-08-23

La conversation partagée est un instantané antérieur, daté du 2026-08-20. Elle ne contient ni le titre du fichier local ni une pièce jointe XLSX vérifiable. Le classeur est donc traité comme une source de recoupement plus récente, pas comme une pièce implicitement extraite du lien partagé.

## Volume réellement lu

Le classeur contient 19 feuilles, 17 tableaux et 2 363 entrées d’index global, dont notamment :

| Famille | Entrées |
|---|---:|
| Médias | 233 |
| Armes | 355 |
| Équipements | 363 |
| Véhicules | 344 |
| Personnages | 434 |
| Castes | 64 |
| Races | 48 |
| Lieux | 514 |
| Faune | 56 |
| Flore | 33 |

Ces nombres servent à détecter les absences de contenu. Ils ne prouvent pas, à eux seuls, la géométrie exacte d’un sprite.

## Hiérarchie de fidélité

1. Le classeur confirme qu’un objet, personnage ou véhicule doit exister et précise son œuvre d’origine.
2. Une source studio, un manuel licencié, un modèle officiel ou un prop multi-angle fixe la géométrie.
3. Une seule vue autorise uniquement les angles visibles ; aucun dos ou volume caché ne doit être revendiqué comme exact.
4. Une entrée ambiguë doit être renommée vers un modèle précis avant génération.
5. Sans silhouette publiée, l’asset reste bloqué : aucune image générique n’est substituée.

## Corrections V56 issues du recoupement

- `Motion Tracker` est qualifié comme **M314 Motion Tracker d’Aliens**, et non comme le détecteur différent d’`Alien: Isolation`.
- `Maintenance Jack`, `Cutting Torch` et `Security Access Tuner` sont bien rattachés à `Alien: Isolation`.
- `M292` désigne une artillerie automotrice. Le seul profil illustré retrouvé est explicitement le **M292A2** ; il ne remplace pas silencieusement le baseline M292.
- Le classeur emploie `AD-19/4 Bearcat`, tandis que les sources publiées décrivent la famille **AD-19C/D Bearcat**. Le `/4` n’est pas interprété comme une variante.
- `M570` n’est pas présent dans le classeur contrôlé et demeure sans silhouette exacte publiée.
- `Neuro-Xeno`, `ATARAX`, `Ripper`, `Cryo Lance` et plusieurs objets Tantalus sont des extensions du projet ; ils ne sont pas présentés comme des modèles écran.

## État de couverture au début de cette passe

- Ennemis V56 : 34 familles sur 34 dotées d’une plaque dédiée.
- Véhicules V56 : 28 familles sur 31 dotées d’une plaque runtime validée.
- Zones de mission : 18 zones existaient, mais elles réutilisaient initialement des couches génériques.
- Équipements : 106 entrées de catalogue issues de 30 familles de base ; aucune surface visuelle dédiée n’était alors branchée dans l’armurerie.
- Armes : 146 entrées issues de 40 familles de base ; la majorité des cartes ne montrait aucune plaque réelle.

## Résultat V56 après cette passe

- Équipements : 30/30 profils acceptés, soit 29 atlas physiques `normalized/tools` et un alias contrôlé vers la feuille 4x4 du Cutting Torch.
- Armes : 25 nouvelles feuilles V56 acceptées et 14 modèles canoniques encore gated ; avec le M41A de contrôle, le registre expose 26 profils armes.
- Manifeste : 127 nouveaux atlas V56, 178 atlas et 2 500 cellules au total.
- Le classeur reste un détecteur de contenu ; les statuts multi-angle, visible-angles, quarantaine et blocage viennent des références visuelles et de la QA, pas du seul nom Excel.

## Portes de fidélité et résolution V56

- `M570` : bloqué tant qu’une silhouette publiée et une identité non ambiguë ne sont pas disponibles.
- `M292` baseline : le candidat M292A2 doit rester explicitement nommé A2.
- `AD-19D` : une plaque de famille C/D ne doit pas être revendiquée comme cabine D exacte.
- `Pathogen Containment Projector` : **porte satisfaite** par un bitmap OpenAI réel et validé, ImageGen `exec-a52d9ef1-79e9-49a9-8d5e-ae5e61f4069c`. La feuille source et la feuille normalisée existent sous `assets/openai/sprites/{,normalized/}weapons/pathogen-containment-projector-action-sheet.png`; SHA-256 normalisé `ae5fe17cf87784690040aa09f44f5fc100f6a7fa36894bfad8cb80b0180d820b`, 1024x1024 RGBA, 4x4, 16/16 cellules, garde 0. Le détail QA est dans [`V56_PATHOGEN_CONTAINMENT_PROJECTOR_QA.json`](./V56_PATHOGEN_CONTAINMENT_PROJECTOR_QA.json).

Les décisions détaillées et leurs sources sont conservées dans :

- [V56_VEHICLE_REFERENCE_MATRIX.md](./V56_VEHICLE_REFERENCE_MATRIX.md)
- [V56_ENEMY_REFERENCE_MATRIX.md](./V56_ENEMY_REFERENCE_MATRIX.md)
- [V56_REMAINING_ASSET_MATRIX.md](./V56_REMAINING_ASSET_MATRIX.md)
