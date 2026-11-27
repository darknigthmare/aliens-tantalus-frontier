# Xeno Trials V222

Le jeu de base et l’édition autonome reçoivent les mêmes mécaniques. Les fiches ci-dessous prolongent la [Bible V146](xeno-trials-plan-v146.json) depuis la V221.

| Fiches | Ajouts en jeu |
| --- | --- |
| 07 et 14 · Défense | La parade, l’ouverture et la disponibilité de la riposte se mettent à jour au changement de phase, y compris sans charge de Super. Le signal de parade reste visible pendant ses huit ticks réels. |
| 08 et 12 · Finitions | Le relevé croisé active deux capteurs existants dans quatre arènes originales. Le KO doit tomber entre les capteurs et la paire doit être admise. L’action occupe la place de la confirmation simple lorsque les autres finitions sont indisponibles. La géométrie, le verdict et la prime sont vérifiés par 33 KO natifs contre l’IA, sur 12 cibles. |
| 10 et 11 · Annexe logistique | **Ronde logistique** oppose 13 contacts à 15–20 PV en trois vagues. **Convoi aux portiques** arrête le chariot à deux contrôles. Le joueur rejoint chaque borne pendant que la horde peut encore endommager le convoi, puis revient au chariot. L’avancement et l’ouverture parallaxée des portiques reprennent avec la sauvegarde. |
| 13 et 17 · Grid et Gorilla | Grid reçoit les poses originales de contact et de récupération du lourd V205/V206. Gorilla reçoit la préparation et la récupération de son bélier au sol à partir des dessins V206. Les dessins s’affichent pendant les fenêtres correspondantes du moteur. |
| 14 · Entraînement | 47 ateliers. Les trois nouveaux couvrent le pivot après le saut adverse, le maintien de la garde pendant les deux salves du Warden et la livraison du caisson de la rampe électrique après sa décharge. |
| Édition autonome · Navigation hors connexion | Deux planches WebP totalisent 810 116 octets et couvrent les 191 vues de combattants et variantes et les 131 décors. Le terminal utilise leurs tuiles dans les listes, dossiers, choix d’arène et cartes d’activité quand le navigateur est hors connexion. Le cache garde également les images et atlas nécessaires au duel initial. |

Les planches sont des miniatures des visuels de jeu admis. Le générateur reproductible est `scripts/generate-xeno-trials-menu-media-v222.mjs`. Les médias de certaines évaluations continuent à se charger à la demande. Les autres appariements de finition, les planches d’animation et les relevés par incarnation et édition restent ouverts.

Quand la connexion change pendant la navigation, le terminal conserve le focus clavier sur la carte en cours de consultation.

Les nouveaux parcours moteur sont disponibles avec `npm run test:trials:v222`. Construire les deux éditions avec `npm run build:trials`, puis vérifier les artefacts avec `npm run check:built` et `npm run check:trials:built`.
