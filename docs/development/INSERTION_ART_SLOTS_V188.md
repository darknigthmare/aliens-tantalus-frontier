# Emplacements d’art — insertion et extraction (V188)

Document source uniquement, exclu du build public. Spécification : [specs/003](../../specs/003-insertion-extraction-cinematiques/spec.md). Code : [`src/insertion-asset-slots-v188.js`](../../src/insertion-asset-slots-v188.js) et [`src/insertion-cinematic-v188.js`](../../src/insertion-cinematic-v188.js).

## État au 16 novembre 2026

La demande explicite de reprendre la génération remplace la pause de production du 15 novembre. **Les 19 emplacements sont enregistrés avec un visuel raster : 17 nouveaux PNG et 2 références existantes réutilisées à leur chemin d’origine.** Les 17 nouveaux fichiers représentent **27 813 449 octets**. Le chargeur et la liste de cache hors ligne connaissent les 19 sources ; l’échec d’un chargement conserve les primitives de repli.

Les PNG générés sont copiés intacts. Leur taille native diffère parfois des boîtes de rendu ; ce sont le cadrage et la mise à l’échelle du moteur qui les adaptent. Les prompts effectifs, références, SHA-256, dimensions et mesures d’alpha figurent dans [la provenance](INSERTION_ART_PROVENANCE_20261116.json). Les deux alias ne créent aucune copie de PNG.

**Le lot complet passe 83 tests ciblés.** Le rendu natif produit 59 plans et 9 vues complémentaires sans exception, avec les 19 emplacements effectivement dessinés comme images. La [recette](INSERTION_ART_QA_20261116.md) précise les préparations, les captures et les limites ; aucun parcours navigateur complet n’est revendiqué.

## Fichiers et boîtes de rendu

| Emplacement | Origine | Dimensions natives | Boîte de base | Usage |
| --- | --- | ---: | ---: | --- |
| `starfield-deep` | PNG nouveau | 1774 × 887 | 2048 × 1024 | Étoiles fines, défilement et disparition atmosphérique |
| `tantalus-drop-bay` | PNG nouveau | 1672 × 941 | 1280 × 720 | Baie avec ouverture orbitale dynamique |
| `tantalus-hull-exterior` | PNG nouveau | 2172 × 724 | 1600 × 500 | Coque Conestoga, départ et retour |
| `ud4l-side` | PNG nouveau | 2172 × 724 | 640 × 240 | Cheyenne de profil, vol et atterrissage |
| `ud4l-front` | Référence existante | 1490 × 1055 | 480 × 320 | Cheyenne de face réutilisé depuis V87 |
| `m577-side` | PNG nouveau | 1942 × 809 | 360 × 150 | M577, deux roues visibles sur le flanc |
| `ud4l-cockpit` | PNG nouveau | 1672 × 941 | 1280 × 720 | Cadre cockpit, verrière et cinq écrans vivants |
| `crt-bezel` | PNG nouveau | 1484 × 1060 | 420 × 300 | Cadre creux autour des écrans vivants |
| `ud4l-troop-bay` | PNG nouveau | 1672 × 941 | 1280 × 720 | Paroi latérale et six sièges vides vers la droite |
| `marine-seated` | PNG nouveau | 1024 × 1536 | 52 × 80 | Marine assis de profil droit, harnais intégré |
| `planet-limb` | PNG nouveau | 1254 × 1254 | 1600 × 1600 | Disque atmosphérique complet et teintable |
| `moon-limb` | PNG nouveau | 1254 × 1254 | 1600 × 1600 | Disque rocheux sans atmosphère |
| `target-vessel` | PNG nouveau | 1897 × 829 | 1600 × 700 | Cible originale de Nacre-7 uniquement |
| `entry-plasma` | PNG nouveau | 1672 × 941 | 1280 × 720 | Plasma translucide, intensité liée à la chaleur |
| `cloud-far` | PNG nouveau | 2172 × 724 | 2048 × 512 | Nuages lointains, alpha et parallaxe |
| `cloud-near` | PNG nouveau | 2172 × 724 | 2048 × 512 | Voiles proches, alpha et parallaxe |
| `terrain-far` | PNG nouveau | 2172 × 724 | 2048 × 400 | Horizon rocheux lointain teinté |
| `terrain-near` | PNG nouveau | 2172 × 724 | 2048 × 400 | Pad, caisses, clôtures et rochers proches |
| `comms-pilot` | Référence existante | 1024 × 1024 ; cadre 80 × 82 | 96 × 96 | Portrait de Maksim Orlov recadré depuis V168 |

Les 17 fichiers nouveaux se trouvent à `assets/insertion/v188/<id>.png`. Les deux alias sont définis dans `INSERTION_ASSET_REUSED_V188` :

| Emplacement | Source existante | Cadre utilisé |
| --- | --- | --- |
| `ud4l-front` | `assets/openai/ui/title/v87/orbitals/ud4l-cheyenne-reference-v87.png` | Référence entière 1490 × 1055, ratio conservé |
| `comms-pilot` | `assets/openai/sprites/normalized/npcs/maksim-orlov-locomotion-sheet.png` | Atlas 1024 × 1024 ; rectangle `(95, 9, 80, 82)` |

Le portrait reprend l’identité du pilote **Maksim Orlov** dans `NPC_DIALOGUE_PORTRAITS_V168` et le traitement de matage existant `resolveHumanSpriteDrawableV164`. Le recadrage et la teinte CRT se font au rendu ; les octets de l’atlas restent inchangés.

## Choix de références

La coque retient la référence **Conestoga · Tantalus / Sulaco** du registre actif `TITLE_SHIP_ASSETS_V87`. Le premier candidat, dérivé du concept de transport V79 retiré, a été écarté. Son empreinte, son prompt et la raison du refus restent conservés dans la provenance ; ses pixels ne sont pas livrés. La baie ventrale ouverte du candidat retenu reste une adaptation du projet.

Les images existantes du **Nostromo**, du **Sulaco** et de l’**Auriga** sont réutilisées sans copie pour leurs destinations respectives. La cible originale générée sert seulement **Nacre-7** et sa variante de profondeur. Les stations de franchise sans visuel correspondant et les mondes non reconnus gardent leur prototype.

Le champ d’étoiles V79 a été examiné : ses grandes étoiles lumineuses conviennent au fond du titre. L’insertion demande des points beaucoup plus fins et clairsemés ; un champ dédié a donc été retenu.

Ces visuels restent des adaptations du projet et des réutilisations documentées. Une génération, un enregistrement ou une observation du rendu ne certifie aucune fidélité franchise « 1:1 ».

## Briefs et composition des acteurs

- **Cheyenne de profil** : adaptation de `dropship-hangar-side.png`, nez vers la droite, même silhouette et mêmes matériaux, patins et jambes de train retirés pour le vol, rampe fermée. Le train, les effets et les mouvements demeurent des éléments de rendu distincts.
- **Cheyenne de face** : la référence V87 existante fournit l’acteur frontal ; aucune nouvelle image concurrente n’est produite.
- **M577** : profil droit avec **exactement deux grandes roues visibles sur le flanc proche**, une avant et une arrière. Le vieux brief « quatre roues par côté » est corrigé. La forme est dérivée de la référence M577 du projet, sans certification de mesures film.
- **Cockpit** : adaptation originale pratique des matériaux du projet. Verrière et cinq réserves d’écran — navigation, terrain, télémétrie, systèmes, communications — laissent place aux données et au paysage vivants. Le cadre généré n’est pas présenté comme un décor de film reproduit exactement.
- **Soute** : paroi latérale avec **six sièges vides orientés vers la droite**, éclairage rouge et équipement rangé. Le brief remplace la précédente disposition de deux rangées face à face. Les occupants et le moniteur d’état sont dessinés séparément.
- **Marine assis** : personnage anonyme de profil droit, armure USCM adaptée des références du projet, casque, fusil vertical et harnais. Aucun siège n’est inclus dans le sprite. La boîte de base est **52 × 80 px** ; le plan de soute emploie un zoom cinématographique d’environ **3,5**, soit une silhouette autour de **184 × 276 px**. L’échelle de référence 1 m ≈ 51 px et le marine debout 44 × 92 px ne changent pas.

## Contrats des décors, effets et écrans

- Les planètes sont des disques carrés complets. Le cadre source mesuré est `(13, 21, 1222, 1210)` pour la planète et `(11, 12, 1226, 1228)` pour la lune, sur leurs PNG de 1254 × 1254. Le moteur positionne le disque puis compose le plan orbital.
- Les coques gardent leur ratio natif. Les couches de nuages et de terrain conservent leur ratio, leur vitesse et leur opacité.
- La teinte du monde est préparée sur une surface séparée, puis le masque alpha d’origine est réappliqué. Le cache de teinte conserve une version par emplacement.
- L’ouverture de baie `(160, 520, 960, 200)` conserve ses étoiles et son corps orbital animés. Les alarmes et la réduction des mouvements restent applicables.
- Le champ d’étoiles est opaque : sa visibilité doit suivre la transition atmosphérique et son défilement rester actif dans le chemin raster.
- Le plasma est réellement transparent, y compris au centre. Sa chaleur règle l’intensité de l’effet ; sa composition additive et son animation doivent respecter la réduction des mouvements. Aucun vaisseau n’est peint dans ce calque.
- Le cadre CRT possède une ouverture centrale transparente. Les axes centraux mesurés dans le PNG sont `x=[81,1403)` et `y=[94,923)`, environ 89 % de sa largeur et 78 % de sa hauteur. Le raccord doit garder lisibles les données proches des bords.
- Les fenêtres du cockpit sont remappées par bandes et colonnes vers le cadrage et les cinq rectangles CRT du moteur. La verrière est protégée et les données sont dessinées après les cadres. Les captures finales du cockpit et de la soute ont été inspectées.
- Les nuages utilisent une période en cache avec recouvrement de 16 %, fondus complémentaires et motif Canvas continu. Ce raccord corrige les lignes verticales observées sans modifier les PNG. Les textures de terrain conservent leur répétition ; aucune périodicité mathématique parfaite n’est revendiquée.

`planet-limb`, `moon-limb`, `cloud-*` et `terrain-*` restent neutres : `insertionWorldProfileV188` fournit teintes, météo et heure locale. Les valeurs proposées sans données de monde gardent leur marqueur dans le code.

## Remplacer ou ajouter un visuel

1. Conserver les octets d’origine, la provenance, les dimensions natives et l’alpha ; vérifier d’abord les sources existantes pour éviter une génération en double.
2. Déposer un nouveau PNG à son chemin de slot, ou déclarer une référence existante dans `INSERTION_ASSET_REUSED_V188` sans copier son fichier.
3. Enregistrer l’identifiant dans `INSERTION_ASSET_FILES_PRESENT_V188` et vérifier l’existence de son chemin réel, y compris pour un alias.
4. Conserver l’inscription dans `sw.js`, puis vérifier rendu et repli dans les trois types de lieu : atmosphère, monde sans atmosphère, espace.
5. Rejouer la recette concernée et mettre à jour la provenance sans convertir une simple disponibilité de fichier en validation finale.

Aucun des 19 emplacements de ce lot ne reste à produire. Leurs contrôles de rendu et leurs limites restent distincts d’une recette complète du jeu, et sont suivis dans la recette.
