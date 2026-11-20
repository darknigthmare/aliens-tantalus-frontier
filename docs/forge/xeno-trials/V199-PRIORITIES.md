# Xeno Trials V199 · Attaques dessinées et continuité des duels

Ce lot reprend les priorités du [plan V146](xeno-trials-plan-v146.json) et du [suivi V149](progress-v149.json) après V198.

| Priorité | Disponible en jeu | Portée |
| --- | --- | --- |
| P0 · Intégrité | Les tickets historiques sans activité ou règles enregistrées reprennent avec les règles standard. Après un KO non terminal, la sauvegarde enregistre la fin de manche et l’ouverture de la suivante, même si le joueur interrompt le compte à rebours. | Les entrées sont réarmées à la reprise. Une écriture refusée laisse le dernier point valide. Le duel continue de régler son ticket une seule fois. |
| P0 · Combat aérien | Warrior et Runner disposent chacun de trois poses pour la frappe légère et trois pour la frappe lourde. | Les poses suivent les fenêtres natives de préparation, contact et récupération. Les appuis sont libres en l’air, avec un pivot mesuré au bassin. Le rendu de repli prend le relais si une pose descendrait sous le sol. |
| P1 · Supers | « Percussions en chaîne » du Brute Pathogen et « Saturation corrosive » de la Reine Pathogen disposent chacun de six poses dessinées, deux par phase. | Les attaques se déclenchent avec leur jauge et leurs règles habituelles. Les salves et leur cadence sont produites par le moteur. Le mouvement réduit garde une pose par phase. |
| P2 · Articulation des spécimens | Dix-sept identités supplémentaires reçoivent une introduction, deux présentations de manche et une récupération d’attaque. | Les 68 gestes s’appuient sur des points anatomiques mesurés sur leurs plaques transparentes propres. Les récupérations au sol suivent uniquement les fenêtres natives. Le lot porte à 29 le nombre de rigs ajoutés dans cette série. |

Les quatre planches contiennent 24 poses originales. Les textures ImageGen sont conservées à l’identique. Les découpes, empreintes, appuis et projections du bassin ont été mesurés sur les fichiers réellement admis. Le portrait du projet sert de repère pour la silhouette, notamment la posture basse du Runner, les lames du Brute et les appendices de la Reine. La comparaison de transparence porte sur les rectangles utilisés par le rendu.

Vingt-six des 189 combattants disposent d’au moins un geste dessiné admis. Les movesets complets, les autres supers dessinés et les quinze propositions hors roster restent ouverts. Le suivi d’admission décrit la couverture par geste et par fenêtre, avec les limites propres à chaque animation.

## Vérifications

Chromium passe 137 contrôles sur 15 lancements. Les deux jauges sont remplies en combat avant la commande du super, et les 24 nouvelles poses sont relevées dans le Canvas. Le moteur émet les trois salves du Brute et les deux de la Reine. Les 17 introductions P2 sont observées. Deux parcours couvrent la reprise d’un ancien ticket après une attaque et le rechargement pendant la préparation de la deuxième manche, avec le score enregistré dès le KO. Les 73 tests ciblés et le contrôle des fichiers du paquet passent.
