# ALIENS: TANTALUS FRONTIER

Version jouable web **v49.0.0**, reconstruite à partir du fil de production v1→v46 « Alien infestation Suite spirituelles ». Le dépôt conserve le contrat additif de la v46, publie l’audit exhaustif des 27 postulats et remplace le hub panoramique v48 par un véritable niveau modulaire : quatre ponts de 3 840 unités, seize salles OpenAI distinctes, quatre couches lointaines et seize props PNG indépendants.

## Jouer

```powershell
npm run dev
```

Ouvrir `http://127.0.0.1:4173`. À bord du Tantalus : `A/D` ou les flèches marcher, `Maj` courir, `Espace` sauter, `E` interagir à proximité et `W/S` changer de pont près d’un ascenseur. Les portes coulissantes, collisions, obstacles, PNJ et changements de salle se jouent directement dans le Canvas; ils ne sont pas remplacés par une grille de boutons. Dans une opération : `A/D` ou les flèches pour se déplacer, `E` pour interagir, `F` ou clic pour tirer, `Q` pour le tracker, `V` pour entrer/sortir du véhicule, `Espace` pour sauter et `P` pour mettre en pause. Le joueur 2 utilise `I/J/L/O` lorsque la coop locale est activée.

## Contenu verrouillé

| Catalogue | Total v46 |
|---|---:|
| Campagnes | 436 |
| Mondes | 64 |
| Armes | 146 |
| Équipements | 106 |
| Ennemis | 568 |
| Véhicules / châssis | 279 |
| Dossiers Apex | 244 |
| Profils Neuro-Xeno | 234 |
| Membres Echo-9 | 16 |
| Tenues modulaires | 392 |
| Modules USS Tantalus | 158 |
| Plans de niveau | 800 |

Les 412 campagnes historiques sont structurées en 206 paires : une reconstitution `MIRE` isolée et une conséquence `FRONTIER` en 2204. Vingt-quatre opérations signature complètent ce noyau.

## Surfaces jouables

- Metroidvania latéral Canvas 2D : salles horizontales et verticales, plateformes, portes, tracker, combat, ennemis, objectif et véhicule.
- Hub USS Tantalus navigable par quatre ponts de 3 840 unités et seize salles indépendantes : décors par salle, portes coulissantes, parallaxe lointaine/viewport/avant-plan, trois obstacles par salle, PNJ, ascenseurs et interactions de proximité.
- Carte de 64 mondes avec stabilité, infestation, atmosphère, factions et campagnes liées.
- Armurerie, équipements, bestiaire, dossiers Apex, Neuro-Xeno, véhicules et actions par siège.
- Echo-9, santé, stress, loyauté, statistiques, trois profils de sauvegarde et migration des anciennes clés.
- Frontier Forge : édition par blocs d’une mission ou du vaisseau, import/export JSON et playtest.
- PWA hors-ligne, responsive, clavier, contrastes lisibles et réduction des mouvements.

## Qualité et build

```powershell
npm run qa
```

`qa` contrôle la syntaxe, les invariants v46, les relations entre catalogues, la migration des sauvegardes, les surfaces HTML, les assets OpenAI et le build statique dans `dist/`. La release v49 passe 15 tests et le build; son hub a aussi été vérifié en navigateur sur les parcours desktop et mobile.

## Dossier de production

- [Contrat de contenu](docs/CONTENT_CONTRACT.md)
- [Audit exhaustif des 27 postulats](docs/POSTULATE_PARITY_AUDIT.md)
- [Historique v1→v49](docs/VERSION_HISTORY.md)
- [Provenance du hub modulaire v49](docs/ART_PROVENANCE_V49.md)
- [Provenance des quatre ponts et de l’équipage v48](docs/ART_PROVENANCE_V48.md)
- [Bible sprites et animations](docs/SPRITE_ANIMATION_BIBLE.md)
- [Provenance artistique et prompts](docs/ART_PROVENANCE.md)
- [Provenance et prompts de la vague v47.1](docs/ART_PROVENANCE_V47_1.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Licence et propriété intellectuelle](LICENSE_NOTICE.md)

## Références de fidélité

La base Tantalus est documentée par les [notes de mise à jour officielles de Focus Entertainment](https://support.focus-entmt.com/hc/en-us/articles/12816621940754-PC-PLAYSTATION-XBOX-UPDATE-AUGUST-1-2023) et les [concepts de production Tantalus Base d’Emilien Morisset](https://arka.artstation.com/projects/1xRx88). La direction « used future » s’appuie notamment sur l’[entretien officiel Alien: Isolation de PlayStation](https://blog.playstation.com/archive/2014/03/26/behind-terror-alien-isolation-exclusive-interview).

Ce dépôt ne redistribue aucun fichier officiel extrait d’un jeu. Son exploitation publique ou commerciale suppose que le détenteur du dépôt dispose bien des droits annoncés.
