# ALIENS: TANTALUS FRONTIER

Version jouable web **v50.0.0**, reconstruite à partir du fil de production v1→v50 « Alien infestation Suite spirituelles ». Le dépôt conserve le contrat additif de la v46, publie l’audit exhaustif des 27 postulats et ajoute deux espaces Canvas complémentaires : un hub modulaire de quatre ponts de 5 120 unités et une mission verticale de 6 200 × 1 080.

## Jouer

```powershell
npm run dev
```

Ouvrir `http://127.0.0.1:4173`. À bord du Tantalus : `A/D` ou les flèches marcher, `Maj` courir, `Espace` sauter, `E` interagir à proximité et `W/S` changer de pont près d’un ascenseur. Les portes coulissantes, collisions, obstacles, PNJ et changements de salle se jouent directement dans le Canvas; ils ne sont pas remplacés par une grille de boutons. Dans une opération : `A/D` ou les flèches se déplacer, `W/S` grimper, `E` interagir, `F` ou clic tirer, `Q` utiliser le tracker, `V` entrer/sortir du véhicule, `Espace` sauter et `P` mettre en pause. En coop locale, le joueur 2 utilise `J/L`, `I/K`, `U` et `O`.

## Contenu verrouillé

| Catalogue | Total v46 conservé en v50 |
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

Les 412 campagnes historiques sont structurées en 206 paires : une reconstitution `MIRE` isolée et une conséquence `FRONTIER` en 2204. Vingt-quatre opérations signature complètent ce noyau. Ce catalogue est majoritairement systémique : il ne représente pas 436 niveaux tous artisanaux, mis en scène et terminés.

## Surfaces jouables

- Mission Metroidvania Canvas `6200 × 1080` : `15` plateformes plus le sol, `6` échelles, `4` portes physiques, verrou d’alimentation, raccourci de conduit, couverture, tracker, combat, objectif et véhicule.
- Hub USS Tantalus navigable par quatre ponts de `5120` unités et seize salles de `1280` unités : décors indépendants, portes coulissantes, parallaxe, PNJ, ascenseurs et interactions de proximité. Le hub reste volontairement décrit comme **plat et linéaire** tant que sa verticalité n’est pas produite.
- Bibliothèque v50 de `18` plaques OpenAI RGBA normalisées en `1024 × 1024`, soit `288` cellules contrôlées, couvrant joueur, ennemis, PNJ, arme et véhicule.
- Carte de 64 mondes avec stabilité, infestation, atmosphère, factions et campagnes liées.
- Armurerie, équipements, bestiaire, dossiers Apex, Neuro-Xeno, véhicules et actions par siège.
- Echo-9, santé, stress, loyauté, statistiques, trois profils de sauvegarde et migration des anciennes clés.
- Frontier Forge : édition par blocs d’une mission ou du vaisseau, import/export JSON et playtest.
- PWA hors-ligne, responsive, clavier, contrastes lisibles et réduction des mouvements; en portrait, le Canvas est recentré, le readout redondant est masqué et les contrôles restent hors de la scène.

## Qualité et build

```powershell
npm run qa
```

`npm run qa` est validé en v50 : lint de **26 modules**, **20/20 tests** et build statique `50.0.0` de **3 443 entrées**. Les parcours navigateur passent aussi : hub **45/45 assets**, mission **31/31 assets** avec `6200 × 1080`, `16` plateformes sol compris, `6` échelles, `4` portes, escalade et verrou power; galerie sprites desktop/mobile **71 cartes**, **27 plaques / 432 cellules**, dont les **18** plaques v50 normalisées.

## Dossier de production

- [Contrat de contenu](docs/CONTENT_CONTRACT.md)
- [Audit exhaustif des 27 postulats](docs/POSTULATE_PARITY_AUDIT.md)
- [Historique v1→v50](docs/VERSION_HISTORY.md)
- [Audit level design v50 et comparaison avec Aliens: Infestation](docs/LEVEL_DESIGN_AUDIT_V50.md)
- [Provenance du hub modulaire v49](docs/ART_PROVENANCE_V49.md)
- [Provenance des quatre ponts et de l’équipage v48](docs/ART_PROVENANCE_V48.md)
- [Bible sprites et animations](docs/SPRITE_ANIMATION_BIBLE.md)
- [Prompts des couches Metroidvania v50](docs/prompts/V50_METROIDVANIA_LAYER_PROMPTS.md)
- [Provenance artistique et prompts](docs/ART_PROVENANCE.md)
- [Provenance et prompts de la vague v47.1](docs/ART_PROVENANCE_V47_1.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Licence et propriété intellectuelle](LICENSE_NOTICE.md)

## Références de fidélité

La base Tantalus est documentée par les [notes de mise à jour officielles de Focus Entertainment](https://support.focus-entmt.com/hc/en-us/articles/12816621940754-PC-PLAYSTATION-XBOX-UPDATE-AUGUST-1-2023) et les [concepts de production Tantalus Base d’Emilien Morisset](https://arka.artstation.com/projects/1xRx88). La direction « used future » s’appuie notamment sur l’[entretien officiel Alien: Isolation de PlayStation](https://blog.playstation.com/archive/2014/03/26/behind-terror-alien-isolation-exclusive-interview).

Ce dépôt ne redistribue aucun fichier officiel extrait d’un jeu. Son exploitation publique ou commerciale suppose que le détenteur du dépôt dispose bien des droits annoncés.
