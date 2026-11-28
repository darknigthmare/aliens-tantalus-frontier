# Xeno Trials V226

Les deux éditions poursuivent les chantiers de la [Bible V146](xeno-trials-plan-v146.json).

| Fiches | Ajouts en jeu |
| --- | --- |
| 06 et 14 · Synth Guard | En Élite, le Synth Guard peut reculer en garde après avoir observé la fermeture de pince du Power Loader. Il avance son retrait seulement si sa position et le temps disponible permettent de sortir de portée. Aux limites de l’arène ou trop près du Chargeur, sa défense habituelle reste disponible. |
| 10 et 11 · Champ d’évaluation | **Assaut du champ d’essai** déploie 18 contacts à 15–20 PV en trois vagues. Dans **Calibrage des déflecteurs**, un blocage réel dans chaque zone aligne deux panneaux dans le décor. Le joueur valide ensuite le terminal central. Les preuves de blocage et le temps de déploiement sont conservés au checkpoint. |
| 13 et 17 · Sprites | Six phases manquantes de Gorilla, Grid et Panther sont produites avec ImageGen à partir des planches originales du projet et de références visuelles. Le lot ferme les trous des mouvements dessinés déjà intégrés. Les dimensions, la transparence, les repères du sol et les fenêtres de frappe sont vérifiés pour chaque PNG. |
| 14 · Entraînement | 59 ateliers. Les nouveaux exercices font pratiquer le passage derrière une garde, les pulsations d’une flaque acide malgré la garde et la lecture de la pression déviée du collecteur. |

Le [registre de production des sprites](sprite-production-v226.json) inventorie la couverture du roster, les médias générés et les références consultées. Les actions inventées pour le jeu sont identifiées comme adaptations du projet. Les directions et les phases supplémentaires prescrites par la Bible restent à produire lorsqu’elles ne sont pas couvertes par les dessins admis. Le lot ne constitue pas une certification de fidélité 1:1.

Les tests ciblés sont disponibles avec `npm run test:trials:v226`. Construire les deux éditions avec `npm run build:trials`, puis vérifier les fichiers avec `npm run check:built` et `npm run check:trials:built`.
