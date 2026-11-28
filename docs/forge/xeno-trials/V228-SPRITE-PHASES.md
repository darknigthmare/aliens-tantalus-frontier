# Xeno Trials V228

Le lot produit **30 nouvelles phases dessinées** auparavant absentes du [registre V227](sprite-production-v227.json), dans **22 PNG originaux**, dont quatre planches de trois poses. Les dix gestes rapides et lourds des cinq profils sont complets. La matrice principale passe de 450 à **480 clés dessinées** et de 7 725 à **7 695 phases sans dessin** ; les 111 phases exclusivement partagées restent décomptées séparément. Les dessins retenus et leurs empreintes figurent dans le [registre V228](sprite-production-v228.json), avec les références, les mesures d’appui, les pivots et les limites de chaque pose.

| Identité jouable | Actions travaillées | Référence visuelle |
| --- | --- | --- |
| Rhino Alien | Rapide et lourde | Rhino Alien Kenner Tribute NECA, coloris orange/noir, deux cornes, quatre membres et queue courte. |
| Mantis Alien | Rapide et lourde | Mantis Alien Kenner Tribute NECA Series 10, vert translucide, crête ajourée, avant-bras dentelés. |
| Working Joe blindé | Rapide et lourde | Variante systémique originale de Tantalus ; corps et armure correspondent au dessin natif du projet. |
| Synth Sniper | Rapide et lourde | Adaptation du projet guidée par les références d’Aliens: Fireteam Elite, avec son arme et son équipement propres. |
| Synth Heavy | Rapide et lourde | Adaptation du projet guidée par les références d’Aliens: Fireteam Elite, avec son armure et son canon propres. |

Les PNG sont produits avec ImageGen, inspectés en transparence et conservés à l’octet après admission. Une planche peut fournir trois phases nouvelles d’un même geste ; le rendu lit alors trois régions rectangulaires disjointes du PNG original. Le registre compte séparément les fichiers et les phases. La préparation, le contact et la récupération restent associés aux fenêtres d’attaque natives. L’intégration exige l’identité, la variante, le profil, le chemin, l’empreinte, les dimensions et l’orientation exacts de l’art source. Le neutre Rhino regarde vers la gauche ; son orientation est désormais explicitement inscrite dans son tuple d’admission tandis que ses nouvelles poses sont dessinées vers la droite pour le rendu des frappes.

La revue compare les appuis, le volume, les rapports du crâne et du torse, les appendices et les accessoires avec la pose neutre. Les deux éditions utilisent les mêmes dessins. La sélection par familles repliables et l’indice Puissance MIRE restent contrôlés avec les statistiques et les gabarits du roster.

Les mouvements sont des chorégraphies originales de Tantalus. Les références indiquent l’édition et les détails observables ; elles ne constituent pas une certification de fidélité 1:1. La récupération rapide de Grid exclue en V227 reste hors de ce lot après le refus du service de génération.

Vérifier les poses et le roster avec `npm run test:trials:v228`, contrôler les sources avec `npm run check`, construire les deux éditions avec `npm run build:trials`, puis vérifier `npm run check:built` et `npm run check:trials:built`. Les registres de production, les rapports et les tests restent exclus des paquets jouables.
