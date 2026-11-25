# V113 RC1 — Tenir les angles

## Postes et secteurs
X désigne un sol visible à moins de 520 unités. Les équipiers sélectionnés reçoivent des destinations disjointes et doivent réellement les rejoindre ; les obstacles et les seuils restent interdits. Un ordre de groupe impossible échoue sans mutation partielle. Les chemins sont revérifiés après un contournement d’acteur et après une manœuvre de porte. Une route sans solution attend un changement au lieu de téléporter son membre.

N engage un secteur de couverture de 100°. Il ne suit pas le curseur après validation. 2 retient ou autorise le feu indépendamment de la position. G/H/C retirent le poste explicite ; le regroupement de transfert retire les réservations locales. Newt peut recevoir un poste mais aucun angle de tir ni consigne de feu.

## Acquisition automatique et sentinelle
Les Marines et la tourelle ne tirent pas quand une silhouette amie vivante précède la première cible/paroi sur l’axe. Ils peuvent choisir un autre contact valide. Un allié derrière la première cible ne bloque pas le tir. Cette sécurité préventive conserve les règles de portée, visibilité, obscurité et munitions ; elle ne modifie pas la balistique manuelle du joueur.

La sentinelle reste fixe. À moins de 76 unités et sans obstacle, sélectionner son entrée puis N commence une rotation de 1,15 seconde. La tourelle retient le feu pendant le geste et ne reçoit son angle final qu’à l’achèvement. Marche, tir, coup, éloignement ou perte/déplacement de cible interrompent ; pause et import conservent l’avancement. Aucun déplacement de la tourelle, soin ou munition ajouté.

## Persistance et commandes
Enveloppe113 strictement validée, imports atomiques et reprise en pause. Registres de postes, directions, discipline et rotations avec bilans bornés/cohérents. La vraie migration V112 préserve mondes, équipe, ressources et lumière ; elle crée uniquement les registres tactiques vierges. Caches de navigation non exportés.

X/N sont des modes de désignation par clic, sans tir ni pause automatique. Échap et clic droit annulent. Les contrôles sont hors canvas ; le plan des postes et secteurs est ancré au sol. Les arcs affichés sont abrégés à 160 unités et ne représentent ni une lumière ni la portée réelle de l’arme.

## Codex et recette
60 règles, dix fiches de lieux conservées, aucune nouvelle salle/population/étape obligatoire. 579 tests Node (486 historiques +93 nouveaux), 291 contrôles gameplay navigateur (236 réexécutés +55 nouveaux), huit opérations complètes et exercice distinct de poursuite. 63 captures directes de Chromium, dix intégrées sans retouche au rapport. Les contrôles de distribution et corpus sont séparés.

## Corrections issues des essais
Recalcul du trajet après évitement physique d’un compagnon et recherche de tangentes diagonales pour les passages étroits. Contrôle des réservations avant fixation d’un secteur. Des pilotes historiques tenaient un allié devant la sentinelle : ils dégagent désormais le tir avec des déplacements publics, au lieu de contourner sa nouvelle sécurité. Les anciennes valeurs de santé, munition ou collision ne sont pas réduites pour faciliter les tests.

## Hors périmètre
Suite autonome V112, pas de fusion native 64 salles ni publication GitHub/Vercel. Pas de nouveau final Reine/P-5000/sas, de sprite définitif, de suppression de feu, moral, grenade, tourelle transportable ou formation coordonnée entre pièces. Transferts discrets et tirs locaux.
