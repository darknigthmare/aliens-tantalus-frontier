# Xeno Trials V221

V221 avance plusieurs chantiers de la [Bible V146](xeno-trials-plan-v146.json). Les mécaniques sont communes au jeu de base et à l’édition autonome.

| Fiches | Ajouts en jeu |
| --- | --- |
| 06 et 17 · Automated Power Loader | **Fermeture de pince** porte une frappe à courte portée sur une cible au sol, sans déplacement de l’automate. Elle conserve les fenêtres et le coût du spécial de la V220. Le joueur peut garder, sauter ou reculer pendant la préparation. Le relevé V220 reste la trace de l’ancienne charge. |
| 07 · Indication Super | La jauge à 100 respecte la disponibilité de l’action pendant la prise, l’esquive, la parade et le pivot. La transition de la parade est publiée pendant sa vraie fenêtre active. |
| 08 et 12 · Finitions | Après un verdict admissible dans les zones équipées des arènes Amarrage et Quarantaine, le vainqueur peut reculer vers le pupitre. Le dispositif de décor s’active derrière lui après son retrait. Les positions physiques et le résultat restent figés. |
| 09 · Arrivée | Warrior, Runner et Spitter entrent successivement sur leur marque au début du duel, avec leurs atlas de marche. Le second attend à sa marque extérieure. Le décompte, le tick et les positions de combat conservent leur cycle. La pause, le passage et les mouvements réduits s’appliquent. |
| 10 et 11 · Hangar | **Vigile du hangar** dispose trois vagues, douze escortes à 15–19 PV et un vigile à 86 PV. Dans **Dérivation du hangar**, sa neutralisation déverrouille le pupitre. L’alimentation ouvre le volet arrière en 72 ticks, puis la borne de sortie valide le secteur. La progression du volet est conservée à la reprise. |
| 13 et 17 · Panther | Le Panther standard utilise trois dessins du projet pour la préparation, le contact et la récupération de son bond horizontal au sol. Les sources sont les trois PNG V206 admis à l’identique et leurs repères de sol. |
| 14 · Entraînement | 44 ateliers. Les trois nouveaux font pratiquer un choix de clôture après KO, le franchissement ou l’évitement d’une onde rasante et le verrouillage d’un poste pendant la relève. |

Le passage en plein écran depuis le sous-menu Commandes ramène le focus dans la modale. Un clic sur le cadre laisse la simulation en pause. Échap revient d’abord à la pause et Tab ramène le focus dans le menu.

Trois reprises authentiques de la charge du Power Loader en V220 sont admises aux ticks 10, 39 et 60 de l’action. Leurs positions, jauges, événements et temps d’attaque sont restaurés.

Les autres appariements de finitions et les planches de mouvement avec relevés par incarnation et édition restent ouverts. La Fermeture de pince utilise la pose d’origine du projet. La planche spécifique des pinces et les vues de face et de dos restent à produire.

Les nouveaux parcours moteur sont disponibles avec `npm run test:trials:v221`. Les deux distributions se construisent avec `npm run build:trials` et se vérifient avec `npm run check:built` et `npm run check:trials:built`.
