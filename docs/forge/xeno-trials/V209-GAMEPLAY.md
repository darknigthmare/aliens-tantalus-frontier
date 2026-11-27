# Xeno Trials V209

Le moteur partagé alimente les deux éditions depuis la version V208 publiée. Les additions de combat gardent leurs identifiants de scénario et les techniques déclenchent leurs effets dans la simulation.

## Combat

| Fiche de la bible V146 | Cas ajoutés dans V209 |
| --- | --- |
| 05 et 06 | 175 signatures nouvelles pour 154 spécimens existants. Au total, 169 spécimens ont au moins une signature alternative. Les touches H et O restent liées à l’admission du profil exact. |
| 07 | 32 supers pour 16 profils. Le Super I consomme la jauge pleine. Le Super II exige la parade préalable et une ouverture sur l’assaillant. |
| 08 et 12 | Quinze appariements de finition sur huit attaquants supplémentaires. Au Prowler, l’ingénierie ajoute une vanne vapeur et le transit des spécimens une purge cryogénique. Le bouton secondaire donne le choix quand deux gestes sont accessibles. |
| 09 et 13 | Préparation, contact et récupération peints pour le coup lourd au sol de l’Arachnoid gris. Les images V206 sélectionnées sont réutilisées avec ancrages au sol et affichage calé sur les fenêtres du moteur. |
| 14 | IA difficile capable de parer, riposter et choisir des signatures après observation. Deux nouveaux ateliers, données de contact et commandes enregistrables dans le banc libre. |

## Dossiers hors roster

Les Ateliers contiennent les quinze dossiers de la bible. Les évaluations expérimentales sont indépendantes des gains classés.

- Six modèles adultes sont jouables dans ces évaluations. Big Chap, Deacon, Neomorph, la lignée Six et Pathogen Blight utilisent les silhouettes du dépôt. Le Praetorian historique sert à la comparaison, avec des fiches distinctes pour AVP, AFE et AFE2.
- Le Facehugger saute en épreuve asymétrique. Le Chestburster franchit au sol. Ils disposent de peu de santé et s’opposent à un spécimen adulte.
- La veille Ovomorph, la lecture du Cocon et le transit Tadpole sont trois événements jouables dans les Laboratoires MIRE.
- Scorched, Predalien AVPR, Siren et Striker ont des dossiers en attente d’un modèle distinct. Les trois éditions du Praetorian restent à valider séparément.

Les autres kits, instances de super et de finition, animations propres à chaque incarnation et relevés comparatifs de la bible restent ouverts. Les ajouts de gameplay sont des adaptations du projet.

## Vérification et distribution

- `npm run test:trials:v209` vérifie les techniques, les dossiers, le banc et la succession des sources.
- `npm run build:trials` construit Tantalus dans `dist/` et l’édition autonome dans `dist-xeno-trials/`.
- `npm run check:built` et `npm run check:trials:built` contrôlent les deux distributions issues du même commit.
