# Xeno Trials V223

Le jeu de base et l’édition autonome partagent les mécaniques suivantes de la [Bible V146](xeno-trials-plan-v146.json).

| Fiches | Ajouts en jeu |
| --- | --- |
| 06 et 14 · Runner | Les observations utilisées pour sa réponse basse repartent de zéro à chaque manche. Il apprend de deux gardes observées dans la manche en cours. La reprise du checkpoint donne la même première réaction que la poursuite du duel. |
| 08, 09 et 12 · Finitions après réception | 26 appariements corporels sur Runner, Warrior, Xeno-Brute et Ravager s’ouvrent une fois la réception visuelle terminée. Les repères de sol et les appuis du vainqueur sont vérifiés. La position de combat et le verdict restent figés. |
| 10 et 11 · Cœur des machines | **Prise de terre** ouvre le sas après une décharge sur un hostile. La borne peut être réarmée manuellement une fois toutes les vagues neutralisées. Le sas s’ouvre à l’arrière de l’arène et reprend à mi-course après rechargement. **Ronde du réacteur** ajoute trois vagues de 13 ennemis au total, à 15–19 PV. |
| 13 et 17 · Léger au sol | Arachnoid Grey utilise les trois dessins de préparation, contact et récupération du léger. Le Panther standard utilise ses deux dessins de préparation et de récupération. Les PNG sont issus des planches précédentes du projet. |
| 14 · Entraînement | 50 ateliers. Les trois nouveaux font travailler Esquive avant–Rapide après un coup hors de portée, la punition de la pince du Chargeur et le choix entre percussion caudale et morsure selon la distance. |

Dans l’édition autonome, **Télécharger ce duel** est disponible à l’étape Arène d’un duel à la demande une fois le terminal contrôlé par son service worker. Celui-ci vérifie les médias contre le manifeste de la version. La préparation conserve le décor, les poses, les variantes et les effets. Elle ne réserve pas de duel. Les fichiers déjà réceptionnés restent disponibles après interruption et les effets communs sont réutilisés aux téléchargements suivants. La préparation est liée à la version installée.

Les autres appariements, planches et relevés par incarnation et édition restent ouverts. Les tests ciblés sont disponibles avec `npm run test:trials:v223`. Les deux distributions se construisent avec `npm run build:trials` et se vérifient avec `npm run check:built` et `npm run check:trials:built`.
