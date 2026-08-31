# V66 — Lot 001 : revue des proportions et de l'échelle

Date : 2026-08-31. Revue technique en lecture seule des 20 sources et des métadonnées des cinq premiers atlas, avant calibration inter-clip finale. Aucun atlas ni fichier de références de production n'a été modifié par cette revue.

## Preuve visuelle et méthode

Planche technique : [comparaison des vingt premières poses](v66-batch-001-source-scale-contact.jpg).

Chaque case reprend la première cellule source à la même échelle : 443,5 px de source affichés sur 320 px, sans étirement différentiel. Cette planche JPEG est un aperçu de contrôle, pas un asset de jeu ni une génération OpenAI. Les sources restent intactes. Les crânes ont aussi été comparés en mémoire à résolution source 1:1 ; la mesure visuelle comporte une incertitude d'environ 3 à 5 px.

Ne pas utiliser la hauteur totale de la boîte englobante pour calibrer une créature accroupie, bondissante ou couchée. Les invariants employés ici sont :

- œuf : largeur du corps inférieur, hors pétales ;
- Chestburster : longueur du crâne, hors cou et queue ;
- bipèdes : longueur du crâne recoupée avec l'axe épaule-bassin et les segments des jambes ;
- Runner : longueur du dôme, recoupée visuellement avec la cage thoracique.

Les rapports ci-dessous sont des calibrations prudentes proposées ; ils ne transforment pas un dessin généré en copie anatomique exacte.

## P1 — Œuf : changement d'échelle confirmé au pixel

Mesure GDI sur les trois premières poses de chaque clip. Suppression logique du fond magenta pour la mesure seulement : R > 100, B > 100, G < 100, R > 1,5G et B > 1,5G. Recherche de la largeur maximale du masque dans la moitié inférieure de la boîte du sujet, jusqu'à huit pixels avant le bas. Cette bande exclut les pétales et mesure le corps inférieur intact.

| Clip | Indices atlas | Largeurs du corps inférieur source (px) | Médiane | Facteur proposé |
| --- | --- | --- | --- | --- |
| sealed | 0, 1, 2 | 258, 258, 258 | 258 | 1,000 |
| opening | 8, 9, 10 | 210, 212, 219 | 212 | 1,217 |
| hatch | 16, 17, 18 | 203, 199, 200 | 200 | 1,290 |
| destroyed | 24, 25, 26 | 205, 208, 210 | 208 | 1,240 |

Coordonnées de bande pour la première pose, dans la cellule source : sealed y=226..405 ; opening y=216..367 ; hatch y=242..387 ; destroyed y=246..389. Les boîtes source correspondantes sont respectivement [87,39,351,414], [93,57,309,376], [45,87,333,396], [41,93,332,398].

Le facteur est médiane sealed / médiane du clip. Le clip détruit reste ensuite libre de s'affaisser : il ne faut pas remettre à hauteur l'œuf effondré. Une calibration identique sur toutes les poses du clip maintient sa chronologie.

## Crânes et proportions des quatre créatures

Mesures de crâne approximatives sur la première pose, en pixels source ; la corde du crâne est suivie en cas d'inclinaison. Les valeurs ne proviennent pas de la hauteur de la créature.

| Profil | idle | move | attack | death | sourceScaleByClip proposé |
| --- | --- | --- | --- | --- | --- |
| Chestburster | ~109 | ~95 | ~91 | ~88 | 1,00 / 1,15 / 1,20 / 1,20 |
| Drone Big Chap | ~140 | ~129 | ~132 | ~140 | 1,00 / 1,00 / 1,00 / 1,00 |
| Warrior | ~115 | ~112 | ~113 | ~120 | 1,00 / 1,00 / 1,00 / 1,00 |
| Runner | ~173 | ~150 | ~150 | ~162 | 1,00 / 1,15 / 1,15 / 1,07 |

- Chestburster : la petite baisse de taille du crâne entre repos et mouvement est visible. La pose d'attaque enroulée et le cou redressé de la mort ne sont pas des changements d'échelle. La calibration proposée ne touche pas leur articulation. Vérifier ensuite les quatre clips animés, notamment la longueur du corps et le raccord de fin de mort.
- Drone : la variation de crâne d'environ 8 % n'est pas accompagnée d'une diminution comparable du torse. L'axe épaule-bassin est visuellement proche de 74 px dans les trois premières séquences. Garder 1,0 évite d'agrandir tout le corps pour corriger une variation locale de dessin. La version d'attaque réduite aux petits crânes d'environ 80 px a bien été rejetée ; l'attaque à taille d'origine doit rester sélectionnée.
- Warrior : la baisse de hauteur pendant la course et l'attaque est un accroupissement, pas une réduction du personnage. Longueur de crâne et segments des jambes restent proches. Garder 1,0 ; ne jamais appliquer 360/279 à l'attaque à partir de sa hauteur de boîte.
- Runner : la réduction de dôme au déplacement et à l'attaque est plus nette, environ 13 %. Les facteurs proposés corrigent ce signal ; la cage thoracique n'est toutefois pas un calque entre clips. Après calibration, vérifier que les proportions de torse ne deviennent pas excessives. Une retouche locale du dôme serait préférable à une correction globale plus forte si la comparaison animée montre un conflit entre les invariants.

## Rendu monde : cellule carrée, silhouette préservée

Toutes les cellules finales font 256 × 256. Il faut leur appliquer un rendu carré, renderWidth == renderHeight ; le rectangle du corps visible est déjà dessiné dans cette cellule. Un rendu rectangulaire étirerait les crânes, torses et jambes.

Formule de contrôle : hauteur visible monde = hauteur corporelle normalisée hors queue × taille du canevas monde / 256. Une correction sourceScale peut modifier l'échelle finale commune du profil ; les propositions suivantes sont donc à recalculer sur les atlas définitifs, pas à copier aveuglément.

| Profil | Cible de corps visible, joueur ~92 px | Canevas carré de départ | Justification |
| --- | --- | --- | --- |
| Œuf | 70–90 px debout | ~94 px avant calibration, puis recalcul | Corps sealed initial ~223 px normalisés ; la calibration des autres clips peut diminuer la mise à l'échelle commune. |
| Drone | 120–130 px | ~196 × 196 | Corps idle initial ~163 px normalisés ; 163 × 196 / 256 = 124,8 px. |
| Warrior | 110–120 px | ~152 × 152 | Corps idle initial ~194 px normalisés ; 194 × 152 / 256 = 115,2 px. |
| Runner | 60–75 px hors queue, hors saut | ~188–196 px après calibration proposée | Le dôme et les contacts des pattes mesurent la silhouette ; la queue levée ne détermine pas la hauteur. |
| Chestburster | ~15–20 px à plat, ~35–45 px redressé | ~110–120 px | Un canevas ~196 px pour obtenir 30 px à plat rendrait la créature anormalement longue, comparable à un adulte. |

Ces tailles de canevas sont des points de départ pour le contrôle monde, pas des tailles de hitbox. Garder hitbox, portée et collisions cohérentes avec le corps réellement visible.

## P2 — Pivots : ne pas ancrer le corps au milieu de la queue

Le normaliseur initial place le bas de chaque boîte à y=240 et son centre horizontal à x=128. Cela conserve les marges mais ne prouve pas que le bassin ou la racine du corps reste immobile.

- Bipèdes : utiliser la projection au sol du bassin comme racine, avec la ligne de contact des pieds comme baseline. La queue et les griffes tendues ne doivent pas recentrer tout le corps. La première pose du Drone a le bassin vers x≈285 dans sa cellule source alors que le centre de la boîte complète est vers x≈244.
- Warrior : même principe, bassin proche de x≈280 dans la première cellule, pas centre de la boîte incluant la queue vers x≈230.
- Runner : conserver un point de racine sous la cage thoracique entre les appuis avant et arrière, excluant la queue ; les poses de suspension ne doivent pas être abaissées pour remettre artificiellement leurs pattes au sol.
- Chestburster : racine sous la partie antérieure du corps / cou, non au milieu de la longueur de queue. Conserver le déplacement d'attaque seulement s'il est prévu par le runtime.
- Œuf : centre de la base du corps et baseline inférieure ; ni pétales ni Facehugger émergent ne déplacent ce point.

Exemple à vérifier en animation : recentrer la boîte complète de l'attaque Drone peut déplacer son bassin d'environ 14 px dans l'atlas au seul moment où les bras et la queue changent d'étendue. Des pivots de contact revus par pose seraient plus solides que le centre de chaque boîte. Cette revue signale le risque mais n'a modifié ni le normaliseur ni les atlas.

## Cohérence visuelle constatée et limites

Les cinq identités sont lisiblement distinctes : œuf organique à quatre pétales, petit Chestburster clair sans jambes, Drone au dôme lisse, Warrior au crâne nervuré, Runner cuivre quadrupède sans tubes dorsaux de Warrior. Les morts observées se terminent sur un corps inerte. La correction des doigts de l'attaque Warrior a retiré les longues lames du candidat rejeté.

La validation mécanique des 160 cellules et les contrôles de l'alpha relèvent du pipeline ; cette revue ne remplace pas ces tests. Les modifications de ratios de rendu, la calibration, les pivots et les collisions exigent une nouvelle vérification après intégration. Une conformité 1:1 ou une fluidité commerciale parfaite n'est pas certifiée par cette seule planche de comparaison.
