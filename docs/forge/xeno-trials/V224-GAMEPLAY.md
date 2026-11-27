# Xeno Trials V224

Le jeu de base et l’édition autonome partagent les ajouts suivants à la [Bible V146](xeno-trials-plan-v146.json).

| Fiches | Ajouts en jeu |
| --- | --- |
| 06 et 14 · Runner | En difficulté élevée, le Runner peut sauter à la verticale au-dessus de l’onde rasante du Brute pathogène après avoir observé son départ. La fenêtre tient compte de sa vitesse de saut et de la largeur du projectile. La décision se rejoue à l’identique depuis le checkpoint. |
| 08, 09 et 12 · Sortie du vainqueur | Après un KO final signé alors que Warrior, Runner, Spitter ou Prowler est en l’air, sa réception animée précède sa sortie marchée. La séquence fonctionne des deux côtés avec les atlas admis et conserve la position physique et le verdict. |
| 10 et 11 · Conduits de la colonie | **Pression de la colonie** oppose 18 ennemis à 15–20 PV en trois vagues. Pendant **Décompression du collecteur**, le premier scellé redirige vapeur et pression vers le conduit encore ouvert. Le second libère le sas arrière. La position de ses panneaux suit le temps de décompression et reprend à la sauvegarde. |
| 13 et 17 · Attaques spéciales | Deux dessins V205 complètent la préparation et la récupération du bond d’Arachnoid Grey. Les deux dessins V206 de Grid encadrent son spécial caudal. Les quatre PNG issus des planches du projet sont conservés à l’octet. |
| 14 · Entraînement | 53 ateliers. Trois nouveaux parcours entraînent le réarmement d’un Super après réception, le tir à distance contre le Burster et la synchronisation de trois balises avant la fin de la batterie. |

Dans le terminal autonome, le panneau **Duels hors connexion** affiche les préparations prêtes ou incomplètes. Le retrait d’une entrée conserve les médias communs encore nécessaires à d’autres duels. Le téléchargement du ticket en cours reste accessible sur l’écran de reprise. L’index et les médias appartiennent à la version de l’édition installée. Une nouvelle version peut demander de préparer les duels à nouveau.

Sur écran étroit, l’atelier affiche sa consigne active avant le briefing. En portrait, la tablette affiche la carte sous l’image de l’arène quand la bande disponible lui donne la place nécessaire.

Les contrôles ciblés sont disponibles avec `npm run test:trials:v224`. Les deux distributions se construisent avec `npm run build:trials` et se vérifient avec `npm run check:built` et `npm run check:trials:built`.

Les autres appariements et planches, les relevés par incarnation et édition et la revue visuelle des scènes de référence restent ouverts dans la Bible.
