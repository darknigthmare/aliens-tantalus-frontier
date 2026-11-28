# Xeno Trials V229

Ce lot produit **36 nouvelles phases dessinées**, auparavant sans dessin dans le [registre V228](sprite-production-v228.json), sous forme de **20 PNG originaux**. Les douze gestes rapides et lourds des six profils sont complets. La matrice principale passe de 480 à **516 clés dessinées** et de 7 695 à **7 659 phases sans dessin** ; 111 phases exclusivement partagées restent décomptées séparément. Cinq profils gagnent leur premier mouvement dessiné dans cette matrice, qui couvre désormais 46 incarnations avec au moins un geste dessiné. Le [registre V229](sprite-production-v229.json) répertorie les PNG originaux, les régions de lecture, les références d’édition et les mesures de chaque phase admise.

| Identité jouable | Gestes travaillés | Référence et périmètre |
| --- | --- | --- |
| Predalien — Primal Hunt | Rapide et lourd au sol | Modèle du projet inspiré de Primal Hunt (2002), distinct du modèle Recherche AVPR. |
| Boiler | Rapide et lourd au sol | Modèle du projet inspiré d’Aliens: Colonial Marines (2013). |
| Royal Guard | Rapide et lourd au sol | Adaptation du projet inspirée de l’édition arcade Capcom (1994). |
| Razor Claws | Rapide et lourd au sol | Adaptation du projet inspirée de l’édition arcade Capcom (1994), avec conservation des gestes aériens existants. |
| Xenoborg | Rapide et lourd au sol | Modèle du projet inspiré d’Aliens versus Predator (1999), avec ses implants et armes propres. |
| Synthétique de combat blindé | Rapide et lourd au sol | Variante blindée systémique originale du projet. |

Les nouvelles chorégraphies sont dessinées avec ImageGen à partir des neutres du projet. Les PNG admis restent identiques aux sorties originales. Une planche peut porter trois phases d’un même geste ; ses trois régions rectangulaires sont alors disjointes et contrôlées séparément. Les fichiers PNG et les clés dessinées ont des compteurs distincts.

L’admission du rendu exige l’identité, la variante, le profil, le chemin, l’empreinte, les dimensions et l’orientation exacts de l’art source. Les volumes du crâne et du thorax, les accessoires, les appendices et les appuis sont comparés au neutre. Les fenêtres de préparation, de contact et de récupération correspondent au temps réellement exécuté par les coups natifs. Les rendus dans les deux sens et les cadrages de caméra sont vérifiés avec les fichiers décodés.

La sélection par catégories repliables, l’indice Puissance MIRE, les statistiques et les gabarits du roster font partie de la recette des deux éditions. Les modèles Recherche restent comptés séparément du roster et les alias d’autres éditions n’héritent pas des nouveaux dessins.

La préparation légère du Predalien a été redessinée après mesure d’un dôme trop long. Une variation apparente entre les poses subsiste dans les mesures ; la séquence corrigée et son faible alpha de fond ont été examinés sur deux fonds, puis dans Chromium sur ordinateur et mobile. Les références précisent les détails observables et les limites des adaptations. Les poses sont des gestes originaux de Tantalus ; le lot ne certifie pas une fidélité franchise 1:1. La récupération rapide de Grid refusée par le service en V227 reste hors de ce lot.

Vérifier les poses et le roster avec `npm run test:trials:v229`, contrôler les sources avec `npm run check`, construire les deux éditions avec `npm run build:trials`, puis vérifier `npm run check:built` et `npm run check:trials:built`. Les registres, rapports et outils de production restent exclus des paquets jouables.
