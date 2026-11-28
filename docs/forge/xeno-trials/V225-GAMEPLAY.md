# Xeno Trials V225

Les deux éditions partagent les ajouts suivants à la [Bible V146](xeno-trials-plan-v146.json).

| Fiches | Ajouts en jeu |
| --- | --- |
| 06 et 14 · Commando WY | En Élite, le Commando peut sortir d’une prise au sol avec Garde + Rapide. Il doit observer les gardes requises et payer 14 points d’endurance. Le joueur conserve une fenêtre pour relâcher la prise. La décision et sa dépense restent identiques à la reprise du checkpoint. |
| 08, 09 et 12 · Survie | Au verdict de survie au chronomètre, les deux spécimens encore vivants peuvent se désengager en marchant chacun de leur côté. Les sorties utilisent les atlas exacts de Warrior, Runner, Spitter et Prowler lorsque la paire et ses appuis sont admissibles. Le verdict reste inscrit une seule fois dans le registre. |
| 10 et 11 · Archives MIRE | **Rafle des archives** oppose 18 contacts de 15 à 20 PV en trois vagues. Dans **Archives sous verrou**, le joueur peut transmettre une copie temporaire en six secondes ou attendre la fin de la première vague pour chercher la copie scellée. Les casiers et l’antenne évoluent avec l’opération. Le choix, la charge du terminal et le délai sont conservés au rechargement. |
| 13 et 17 · Gorilla | Le Gorilla standard utilise la pose V206 d’armement lourd à quatre épines par avant-bras. Le dessin conserve son PNG original. Les autres phases du lourd restent à produire. |
| 14 · Entraînement | 56 ateliers. Les trois nouveaux portent sur le saut après un tir visé, le balayage de trois contacts avec un Super et l’ouverture du sas du réacteur grâce à une décharge sur un hostile. Les causes d’échec s’affichent avant le nouvel essai. |

Le terminal autonome reprend les duels préparés depuis V224. Le service worker recalcule les médias nécessaires et vérifie les octets du cache précédent contre le nouveau manifeste. Les duels qui nécessitent des médias supplémentaires ou modifiés restent dans la bibliothèque avec l’état incomplet. Leur préparation récupère les fichiers encore manquants. Un refus d’écriture conserve le cache précédent pour une reprise lors d’une prochaine mise à jour. Les sauvegardes et les tickets sont conservés.

Les contrôles ciblés passent par `npm run test:trials:v225`. Les deux éditions se construisent avec `npm run build:trials` et se vérifient avec `npm run check:built` et `npm run check:trials:built`.

Les autres appariements, planches et relevés par incarnation et édition restent ouverts dans la Bible.
