# Xeno Trials V210

V210 part de la version V209 publiée. Les deux éditions utilisent le même moteur, les mêmes dossiers MIRE et les mêmes règles de combat.

## Dossiers expérimentaux

Les Ateliers donnent accès à Scorched, Predalien AVPR, Siren et Striker, ainsi qu’aux trois évaluations séparées des Praetorian AVP, AFE et AFE2. Le modèle historique de comparaison reste accessible dans son dossier. Les sept nouvelles silhouettes sont des créations originales du projet. Les noms d’édition indiquent le dossier auquel chaque modèle répond. Chaque modèle possède deux signatures H/O, des appuis mesurés et une animation procédurale qui suit la simulation. Le réglage de réduction du mouvement utilise la pose neutre.

Le catalogue expérimental compte 15 combattants jouables. Les épreuves asymétriques Facehugger et Chestburster et les trois laboratoires de formes précoces restent accessibles depuis les Ateliers. Ces essais se jouent sans ticket ni prime.

## Couverture de la bible V146

| Fiche | Cas ajoutés |
| --- | --- |
| 05 | Maj en fin de descente prépare une esquive au sol pour Warrior, Runner, Prowler et Spitter. Snake et Power Loader mettent six ticks à se retourner lorsque la cible change de côté. Un impact peut interrompre le pivot. |
| 06 | 62 nouvelles signatures pour 52 combattants du roster historique. Le cumul couvre 307 entrées H/O et chaque combattant historique dispose d’au moins une technique alternative. |
| 07 | 48 supers pour 24 profils, dont les trois combattants de départ. Cinq Super I changent de hauteur au cours de leur fenêtre active. Le cumul atteint 45 Super I et 44 Super II. |
| 08 et 12 | 17 nouveaux appariements pour 15 attaquants, dont de nouvelles cibles Ravager et Crusher ACM. Six combinaisons d’interaction avec le volet du quai et le drain de quarantaine. |
| 09 | Deux planches originales, sept silhouettes indépendantes et animations de jeu liées aux états natifs de marche, de garde, de recul et d’attaque. |
| 14 | Trois ateliers couvrent le relâchement des commandes après la présentation, la garde basse et l’esquive à la réception. Le total atteint 19. |

La bible conserve des entrées H/O, des supers et des finitions à produire, ainsi que des animations dessinées et des relevés de référence à valider par incarnation. V210 traite les dossiers hors roster comme des adaptations MIRE jouables.

## Vérification et distribution

- `npm run test:trials:v210` vérifie les nouvelles techniques, les évaluations et la succession des sources.
- `npm run build:trials` construit le jeu de base dans `dist/` et l’édition autonome dans `dist-xeno-trials/`.
- `npm run check:built` et `npm run check:trials:built` vérifient les distributions du même commit.
