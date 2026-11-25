# Aliens (1986) — pack de sprites V115

**70 PNG retenus**, copiés sans retouche des pixels. Ouvrir [la galerie](index.html) pour filtrer les sujets et contrôler leurs contours sur fond clair, sombre ou damier.

Ce pack contient des images de travail destinées au DLC. **`runtimeIntegrated: false` et `filmFidelityValidated: false` restent explicites.** Le runtime autonome V114 et son corpus historique ne sont pas modifiés par l’assemblage de ce pack.

## Contenu

| Catégorie | PNG retenus |
|---|---:|
| Personnages | 14 |
| Accessoires et équipements | 28 |
| Architecture | 17 |
| Créatures | 2 |
| Variantes | 6 |
| Véhicules | 3 |

## Sélection et traçabilité

Chaque sujet possède un identifiant stable. La révision réussie la plus élevée est retenue ; à révision égale, la dernière tentative réussie est choisie. Les versions remplacées ne sont pas recopiées. Une tentative refusée ou encore en cours ne produit aucun faux PNG.

Le [manifeste](manifest.json) fournit les dimensions natives, les empreintes SHA-256, les mesures d’alpha, les marges, le pivot proposé, les références et les prompts. Les noms temporaires, identifiants techniques de génération et chemins locaux ne sont pas publiés. Les références de costumes, d’accessoires de tournage et de figurines licenciées ont des niveaux de preuve différents ; elles ne certifient pas automatiquement l’image générée.

## Limites à conserver

- Ce sont des images fixes : la marche, les actions, les transitions et les directions opposées ne sont pas déduites d’un sprite d’attente.
- Les pivots sont proposés à partir des bounds d’alpha et restent à calibrer dans le moteur. Les armes et accessoires séparés demandent leur propre attache.
- Les petites marges signalées dans le manifeste demandent un contrôle des cheveux, pieds, câbles et autres extrémités.
- Un alpha maximal de 254 correspond à 99,6 % d’opacité ; les couleurs RGB sous alpha=0 restent invisibles dans une composition normale. Un aperçu ignorant l’alpha peut afficher un halo qui n’existe pas dans cette composition.
- Les petits marquages, les visages, les proportions filmiques et la continuité des tenues restent à comparer aux références. La fidélité 1:1 n’est pas certifiée.

## Sujets sans image retenue

| Sujet | État de la dernière demande |
|---|---|
| Hicks — silhouette complète | `generation-refused` |
| Vasquez — silhouette complète | `generation-refused` |
| Chestburster — forme du film | `generation-refused` |
| Ripley — ensemble M41A et M240 | `generation-refused` |

Ces demandes restent ouvertes et ne sont pas comptées dans les PNG générés.

## Consultation et distribution

La galerie utilise uniquement des chemins relatifs vers les PNG du dépôt et un script inline pour les filtres. Elle n’effectue aucun appel réseau automatique et ne touche pas aux sauvegardes. Les liens externes de référence sont consultables volontairement. Les trois fichiers de cette revue restent des documents source, hors du build public.
