# Provenance artistique V71 — Hub commercial

Date : 5 septembre 2026.

## Statut

Les décors V71 sont des créations bitmap originales du projet produites avec **OpenAI ImageGen**. Ils ne sont pas des sprites officiels extraits, téléchargés ou recopiés depuis un jeu Alien. Le contrat conserve donc explicitement :

- `provider: OpenAI ImageGen` ;
- `kind: original-project-art` ;
- `originalProjectAsset: true` ;
- `canonExact: false`.

La direction artistique recherche une cohérence « used future » et survival-horror, sans revendiquer une reproduction canonique pixel pour pixel.

## Sources originales conservées

| Rôle | Type | Dimensions | SHA-256 |
|---|---|---:|---|
| Backgrounds | atlas 5 × 2 | 1 983 × 793 RGB | `9a1d07dacad1a72ea8e5dfe93f8379786be3266a1ff0d441b1d3895d454e15ba` |
| Props | atlas 5 × 2 | 1 774 × 887 RGB | `4a8e31da6c84f9ffb5ffc4a6e3dc6e26ca840cc283e5634ee1b714fd1e49a8a2` |
| Foregrounds | atlas 5 × 2 | 1 983 × 793 RGB | `8eaf4c14587da67c3584230993e7f8e56b090d10cea4243b1ea861a6f0f70202` |
| Doors | atlas 5 × 2 | 1 536 × 1 024 RGB | `7a3e3809278cc99896e0b9ce119fb9067586d1836d18191f6951fbae2ba9d1c6` |
| BIOFORGE — vestibule | correctif dédié | 1 672 × 941 RGB | `fdc9899ed7e5a3afc96fb9fe13a6c77881cca877a5bef243b94123caf3a84487` |
| BIOFORGE — console | correctif dédié | 1 367 × 1 151 RGB | `d54133643658aea337ae4294c68a6614befb49c961eaf75c275013b31fcce2a9` |
| BIOFORGE — porte | correctif dédié | 1 024 × 1 536 RGB | `f5ee344422f619c12b8cbf1a454d74e2bbbc62095eb50986716ec9442db7ec92` |

Sources : `assets/openai/sprites/frames/v71/hub-commercial/`. Ces sept PNG sont des sources de production et sont volontairement exclus du build et de Vercel. Les trois correctifs BIOFORGE représentent un vestibule neutre, des cuves vides et aucune créature visible.

## Transformation déterministe

Le processeur `scripts/process-tantalus-hub-art-v71.py` :

1. découpe chacun des quatre atlas en dix cellules exactes, en ordre 5 × 2 ;
2. conserve tous les pixels des atlas au moyen de bornes proportionnelles explicites, y compris lorsque les dimensions ne sont pas divisibles par cinq ;
3. substitue au BIOFORGE les correctifs dédiés pour le background, le prop-console et la porte ;
4. retire le damier RGB clair relié au bord par flood-fill à quatre voisins, puis nettoie les régions de damier enclavées des props, foregrounds et portes ;
5. crée un vrai canal alpha et efface tout RGB caché sous les pixels totalement transparents ;
6. calcule la bbox du contenu, ajoute une marge et normalise l’échelle et le placement dans un canvas stable ;
7. dérive `far.webp` de `mid.webp` par flou, désaturation et assombrissement ;
8. enregistre dimensions, alpha, traitement, cellule ou source dédiée et SHA-256 de chaque sortie.

## Sorties runtime

Chaque annexe reçoit exactement cinq fichiers sous `assets/openai/hub/annexes/v71/<id>/` :

| Couche | Dimensions | Encodage |
|---|---:|---|
| `far.webp` | 1 920 × 720 | WebP RGB, dérivé sombre/flou |
| `mid.webp` | 1 920 × 720 | WebP RGB |
| `prop.webp` | 640 × 512 | WebP RGBA lossless |
| `foreground.webp` | 1 920 × 720 | WebP RGBA lossless |
| `door.webp` | 384 × 512 | WebP RGBA lossless |

Total : **50 fichiers distincts**. Les 30 couches RGBA ont un ratio de transparence reporté entre `0.419668` et `0.883459` ; la correction du damier retire entre `0.252766` et `0.790684` des pixels de leur source selon la composition. Les dix sorties `prop.webp` ont des facteurs d’échelle de `0.463289` à `1.653137`, calculés depuis leur bbox et leur marge avant placement dans le canvas 640 × 512.

Le registre machine canonique est `assets/openai/hub/annexes/v71/hub-commercial-art-report-v71.json`, SHA-256 `61f4c34305b8565fc4fa5236930063c257da2b995bd6ede4d155456f57df964f`. Il contient les 50 empreintes individuelles ; ce document ne les duplique pas afin d’éviter deux sources de vérité.

## Limites déclarées

- La validation de hash, dimensions et alpha ne remplace pas une inspection visuelle en jeu.
- Le cadrage des panoramas 1 920 × 720, l’échelle personnage/porte et les occlusions doivent encore être validés dans le navigateur.
- `prop.webp` est une couche composite par annexe ; ce lot ne fournit pas encore un fichier bitmap indépendant pour chacun des six props logiques.
- Aucun NPC dédié supplémentaire n’est généré dans cette vague.
- Les trois correctifs BIOFORGE montrent un vestibule et des cuves vides ; ils représentent seulement l’accès isolé. Aucun organisme ni aucune créature n’est présent dans le hub normal.
