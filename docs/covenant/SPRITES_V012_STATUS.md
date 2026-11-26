# Alien: Covenant — sprites V0.12

Le pack cumulatif contient **61 PNG originaux**, dont **12 nouveaux** dans ce lot. Les 49 PNG et le manifeste source V0.11 restent inchangés. Le jeu admet 39 images dans des états et emplacements précis ; 22 images restent au catalogue.

**La couverture complète et la fidélité identique à 1:1 ne sont pas certifiées.** Les poses générées, les détails masqués et les adaptations de présentation sont documentés dans les manifestes.

## Nouveaux éléments

| Élément | PNG | Utilisation |
|---|---:|---|
| Daniels, tenue de travail — cycle de marche | 8 | Marche ordinaire, mains libres, dans sept salles du vaisseau |
| Plaque d’identification de Shaw | 1 | Objet exact `shaw-f10-identification`, salle `shaw` |
| Microscope de David | 1 | Objet exact `workshop-f10-12`, salle `workshop` |
| Rack de trois réservoirs de l’atterrisseur | 1 | Catalogue ; dessin de production de Tony Drew |
| Treuil de la voile du Covenant | 1 | Catalogue ; dessin de production de Tony Drew |
| **Total du lot** | **12** | **10 images dans le rendu, 2 au catalogue** |

Le rack n’est pas associé à la caisse de carburant du jeu. Le treuil n’est pas associé au câble personnel EVA. Leurs constructions et leurs fonctions ne correspondent pas à ces consommateurs.

## Lire le catalogue hors ligne

Décompresser le ZIP en conservant ses dossiers, puis ouvrir `index.html`. Le dossier `sprites/` contient les 61 PNG originaux. Le catalogue propose recherche, catégories, filtres de disponibilité, agrandissement et fonds sombre, clair ou damier.

L’aperçu de la marche propose lecture/pause, ralenti, sélection des huit phases et direction. Les pivots et l’échelle sont ceux du rendu. Les images du catalogue sont affichées à l’échelle ; les PNG sources ne sont ni recadrés ni recompressés. `APERCU_NOUVEAUTES.jpg` est une planche de contrôle dérivée.

`manifest.json` regroupe les références, les instructions de génération, les limites et les empreintes. Les deux manifestes source exacts sont aussi conservés dans `provenance/`. `coverage.json` décrit les profils, les familles et les occurrences ; `QA.json` donne la portée des vérifications. `SHA256SUMS.txt` permet de contrôler les PNG.

## Portée du cycle de Daniels

Les huit phases alternent les appuis des deux jambes. La sixième a été régénérée après détection d’une mauvaise alternance dans le premier essai. Les huit PNG sont indépendants et leurs octets sont conservés.

Le cycle s’applique à `daniels-work` dans `cryo`, `service`, `cabin`, `funeralairlock`, `evaprep`, `bridge` et `comms`. Il suit l’horloge existante du moteur et ne s’affiche que pendant un déplacement effectif. Les huit images doivent être chargées pour que le cycle soit utilisé.

La course, le port d’une arme, les actions spéciales, le rampement et les phases non fournies gardent leur rendu existant. Les huit phases sont une reconstitution de marche ; elles ne proviennent pas d’une capture de mouvement du film. De légères variations de silhouette, de visage et de contact des pieds restent visibles.

## Fidélité des accessoires

La plaque de Shaw est guidée par deux vues de la scène de découverte. La microtypographie, la longueur totale de la chaîne et les éléments cachés par la main ne sont pas établis avec précision. La boucle complète est une présentation adaptée au jeu.

Le microscope est guidé par une vue du film où David l’utilise. Le bord inférieur du socle, les petites fixations et les parties arrière restent partiellement reconstruits. L’éclairage neutre du sprite remplace celui de la scène.

Le rack et le treuil suivent des dessins de production publiés par Tony Drew. Ces références ne certifient pas chaque détail de la construction visible dans le montage final. Les URL et attributions figurent dans le manifeste.

## Couverture et travail restant

| Mesure | État du lot cumulatif |
|---|---:|
| PNG disponibles et vérifiés par empreinte | 61 |
| PNG admis dans le rendu | 39 |
| PNG au catalogue seulement | 22 |
| Profils humains de l’inventaire ayant une pose neutre | 23 / 23 |
| Cycles complets de marche fournis | 1, pour Daniels en tenue de travail |
| Profils humains sans cycle de marche PNG | 22 / 23 |
| Familles d’objets candidats du film ayant un PNG direct ou une variante liée | 15 / 50 |
| Familles d’objets candidats avec au moins une occurrence admissible dans le rendu | 13 / 50 |
| Occurrences d’objets admissibles au rendu PNG selon leurs règles | 23 / 630 |
| Images certifiées identiques à 1:1 | 0 |

Le dénominateur de 630 inclut des structures, mécanismes animés, effets et créations de gameplay. Il ne signifie pas que 607 objets doivent devenir des images statiques. Le registre distingue disponibilité d’un PNG, correspondance avec une famille, salle autorisée, occurrence masquée et état rendu.

Il manque notamment les cycles des variantes de Daniels sur le terrain et en EVA, celui de David dans le prologue, ainsi que les courses et les états d’action. Les sept familles d’armes, les deux poses du xénomorphe et la statue demeurent absentes après les refus de génération déjà documentés ; aucune nouvelle tentative sur ces sujets n’est incluse dans ce lot.

Les objets encore sans référence suffisante comprennent le couchage de David, le modèle de cabane, le support du manteau, le rack de harnais, le pendentif, les carnets, la caisse de carburant, le récipient de déchets, le câble EVA, la radio de terrain, les plateaux médicaux, la balise du Juggernaut et l’outil EVA. Les bandages désignent une pièce portée par Lope : un rouleau isolé ne couvrirait pas ce besoin. La liste complète et les identifiants se trouvent dans le registre de couverture.

## Vérification et conservation

Les 12 nouveaux PNG ont une transparence réelle et une silhouette entièrement dans le cadre ; aucun pixel de bord ne dépasse l’alpha 16. Les empreintes Git et SHA-256 des 61 originaux sont contrôlées lors de l’emballage. Les pivots sont des métadonnées de rendu et ne modifient aucun pixel source.

Les 35 tests locaux de contrats et d’intégration et les 19 tests de succession des audits passent. Ils comprennent le cycle complet, le refus d’un cycle incomplet, la sélection temporelle, les états de fallback, la conservation des sources, les admissions exactes et la distribution autonome. Les 29 associations de rendu V0.11 sont conservées.

Le navigateur local n’a pas pu être lancé, faute de binaire Chromium ; l’installation supportée a reçu une réponse HTTP 403. Aucun résultat de navigateur V0.12 n’est déduit des réussites antérieures. La CI dédiée sur le nouveau commit vérifie le parcours dans le jeu, les images décodées, la sauvegarde, le menu hôte, les phases de marche et le catalogue hors ligne. Ses journaux sont rattachés à la [PR 71](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/71), et son résultat disponible est inscrit dans le `QA.json` du pack livré.

Le module conserve ses règles, collisions et formats de sauvegarde. Les preuves d’audit antérieures gardent leurs empreintes ; les changements des fichiers hôtes sont ajoutés comme une nouvelle étape de succession exacte.
