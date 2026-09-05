# V74 — Korari 050 : recette d'intégration mesurée

## Résultat

**Contrôles techniques et recette moteur : PASS.** L'acceptation de production et le commit restent centralisés par l'agent principal. Ce document ne certifie ni fidélité pixel-à-pixel ni campagne entière terminée.

L'atlas V73, les quatre sources et leurs facteurs anatomiques1 sont inchangés. SHA-256 atlas : `01f0627eee240ded94a36859e2d4dc8960d5881828d24753be04e78ad7a096df`. L'identité reste **PROJECT_ORIGINAL / project-original** : quadrupède forestier original, pas créature canonique d'une franchise.

## Mesure et rendu réel

Le contact `korari-world-scale-proposals.png` compare trois tailles isotropes au vrai marine idle110×148. Les32 poses de `browser-korari-pass.png` sont ensuite rendues par `drawSpriteSample` du moteur V52, avec le vrai calcul de boîte et de pivot. Le combat supérieur emploie `drawEnemy`, pas une illustration substituée.

- Rendu288×288, source-cell256×256, facteur monde1,125, pivot source128/240.
- Volume corps96×60, centré sur la masse thoracique revue, hors longue queue et projections des griffes/mâchoire. Ce volume constant est une approximation de gameplay, pas un masque de silhouette par pose.
- Idle1 : silhouette native177×47 → monde199,125×52,875. Le marine idle natif115×193 →49,414×111,578. La hauteur du Korari accroupi vaut environ47,4% de celle du marine observé ; elle monte avec les postures. Le maximum alpha de la pose idle5 inclut la queue levée : ce n'est pas sa hauteur d'épaule.
- Au bond, les appuis conservent les dégagements natifs10/2/10px aux poses4/5/6 →11,25/2,25/11,25px en monde. Aucun second déplacement vertical artificiel n'est ajouté.
- Les32 pivots du vrai rendu restent à x=centre du corps, y=sol. En combat, pivots observés (718,930) et (578,930) ; boîte locale [0,0,96,60].
- Mâchoire/attaque5 : extension avant jusqu'à environx201natif, soit82,125px au-delà du root. Avec la demi-largeur du marine21, une séparation des centres98 fait entrer le contact dans sa boîte. Tolérance de portée104, hors queue.

La scène affichée a été réellement regardée : pas de débordement de cellule ni fond blanc, quatre membres lisibles, crâne unique et direction cohérente. Les petites variations de plaques d'écorce et points cyan constatées en V73 demeurent ; pas de promesse1:1.

## Contrat transmis et exercé

`distanceMetric:'centers'`, stopRange98, meleeRange104, lungeDistance72, windup3/12, impact4/12, duration8/12, cooldown1.35, speedMultiplier1.18, verticalRange90.

La mesure par centres est activée explicitement pour ce profil dans le correctif de l'agent gameplay. Elle corrige l'asymétrie que donneraient les anciens écarts entre bords gauches pour un corps96px face à un acteur42px.

Sur les quatre cas réels V51/V52×gauche/droite : aucun déplacement avant3/12 ; puis déplacement±70px depuis la séparation initiale168 ; dégâts100→74 **une seule fois** sur l'index local4 (=pose5) ; séparation finale98 ; récupération complète et cooldown restant0,683233s. Les routes joueur/coop ne changent pas de cible après armement.

## Régression et navigateur

`node --test tests/enemy-korari-v74.test.mjs tests/enemy-korari-vehicle-resume-v74.test.mjs tests/enemy-burster-v74.test.mjs` : **140/140 PASS**,0skip après les derniers correctifs. Sous-ensemble Korari :44tests (20initiaux +24véhicule/reprise). Couverture : sources/atlas inchangés, identité dédiée, échelle, appuis du bond, timeline, deux orientations, murs/portes/couvertures, cible hors portée, verrouillage contre un coop plus proche, mort pendant anticipation, interruption au bord du vide, huit cellules de mort24–31 puis maintien de31.

Navigateur agent-browser, session indépendante `atf-v74-korari`, page locale `/docs/references/v74-enemy-fixes/050/index.html` : PASS deux exécutions dont une par le bouton. Rapport exact `browser-results.json`. Aucun changement de localStorage ; aucun import de l'application ni écriture d'une sauvegarde persistante ; les snapshots JSON de contrôle restent dans la mémoire de la page. Les callbacks terminaux de dégâts ne font que capturer l'effet, tandis que ciblage, mouvement, obstacles, navigation, animation et rendu emploient les prototypes expédiés.

La mort est vérifiée à partir de l'état mort du fixture puis par une vraie sérialisation/restauration, pas par un combat complet au fusil dans la campagne. Une première assertion de diagnostic lisait le mauvais champ du pivot (x au lieu de world.x) ; corrigée dans le fixture, aucun changement du moteur requis. `browser-initial-diagnostic.png` est une trace de ce contrôle initial, pas le résultat final.

## Contre-vérification finale : coque et reprise du cadavre

Deux défauts complémentaires ont été corrigés par l'agent gameplay puis rejoués dans le navigateur réel. La première recette ne les couvrait pas ; ses anciens20tests ne doivent pas être présentés comme une preuve de restauration.

- **Coque240 :** la distance entre centres faisait pénétrer le Korari dans un véhicule large. Le contrat050 emploie désormais centre→bord physique de la coque +21px (demi-largeur marine de référence), soit arrêt à77px du bord et seuil d'impact83px. Les acteurs humains conservent les centres98/104.
- **12cas navigateur :** V51/V52 × deux sens × distances initiales centre→coque48/100/147. Déplacements respectifs0/23/70px en valeur absolue. Aucun recouvrement du corps : distance corps→coque0/29/29px. La mâchoire mesurée atteint la coque (centre→coque48/77/77 ≤82,125). Une seule morsure26 sur la coque, coque100→74, occupant100 inchangé. Les tests Node ajoutent aussi la fuite de7px après armement, qui fait manquer l'impact.
- **Mort050 :** la cellule ne dépend plus de l'ancien contrôleur de rendu. Elle est explicitement dérivée du compte à rebours du cadavre :24 + min(7,floor((2.8−deathClock)×10)). Le fixture avance ce vrai compteur, au lieu de le figer en faisant seulement avancer l'horloge du contrôleur.
- **8vraies reprises JSON navigateur :** captureResumeState → JSON.stringify/parse → applyResumeState sur une nouvelle instance V51/V52. Pour deathClock2.8/2.5/1.5/0, cellules respectives24/27/31/31. Chaque cas est ensuite échantillonné par trois contrôleurs entièrement neufs, aux horloges0/50/1000 : même cellule attendue, aucun redémarrage à24 pour les cadavres terminaux, aucune nouvelle attaque ni dégât.

Le rapport final contient les tableaux autonomes vehicleCases et resumes ; la capture finale montre les32poses et le statut de ces contrôles. Les deux pages016/050 ont été rejouées après les correctifs, par ouverture puis par leur bouton, sans erreur navigateur. Les captures ont été réellement inspectées après ce rejeu. Les deux sessions isolées sont fermées à la fin de la recette.

## Fichiers et frontières

Cette sous-tâche n'a écrit que `tests/enemy-korari-v74.test.mjs` et ce dossier. Readylist/géométrie et contrat gameplay ont été modifiés par leurs propriétaires, pas par cet audit. Les JSON V73 signés n'ont pas été réécrits.

La page est une recette de développement, pas un nouveau menu du jeu. Aucune acceptation, STATE, manifeste ou sauvegarde n'a été modifié ici.
