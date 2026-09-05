# V74 — Burster016 : recette navigateur du moteur réel

## Résultat et limites

Recette isolée V51/V52 réussie : compression visible, explosion unique, fin de pression, huit poses de mort puis maintien du cadavre. Les trois obstacles solides et deux restaurations JSON ont également été exercés. L'acceptation de production et le commit restent centralisés.

Les valeurs mesurées sont celles intégrées par l'agent principal : rendu256×256, corps88×88, pivot128/240. Sources et atlas sont inchangés (SHA atlas `3ad1538aef3dd62354950f7cf7f63e875ff2cd6688bfb06c8f2fa9abf80ff3df`). La comparaison marine et l'incertitude sont dans `scale/README.md`.

Cette recette n'est pas une partie de campagne complète. Les callbacks terminaux de santé sont des observateurs locaux ; createEnemy, updateEnemy, obstacles, détonation, defeatEnemy, spawnImpact, sauvegarde/restauration, résolution d'animation et rendu emploient les vrais modules.

## Résultats exacts observés

- Quatre cas : V51 et V52 production, chacun à gauche et à droite.
- Le véritable catalogue donne enemy.damage30 ; l'explosion applique round(30×1.35)=41, donc joueur100→59 une seule fois. La fixture ne remplace pas cette valeur par les20dégâts synthétiques des tests unitaires.
- À t0…5/12, poses de pression0…5, acteur vivant et0dégât. À6/12, une détonation, acteur mort, latch terminal activé, cellule22. Puis cellule23 à7/12 ; après8/12, cellules24…31 au rythme10fps.
- Le dernier échantillon reste death31. Pas de retour en position debout, aucun déplacement artificiel ni seconde détonation. Une récompense salvage, un événement kill, un événement enemy-detonation.
- Le vrai moteur émet24particules (trois groupes de spawnImpact) et un rayon de dégâts132. **Il n'existe pas encore de planche bitmap d'explosion dédiée dans cette intégration.** La capture diagnostique affiche uniquement les vraies données de particules ; elle ne fabrique pas une explosion illustrée.
- Le pivot rendu réel reste(644,930), corps88×88, dans les deux orientations.
- Six cas obstacle : mur, porte fermée et couverture non détruite, chacun dans les deux sens, ajoutés pendant la compression. Résultat : acteur vivant, attaque annulée,0dégât,0explosion.
- Quatre bornes supplémentaires : centres séparés de107px → armement ;109px → pas d'armement, à gauche comme à droite.

## Défaut trouvé et correction coordonnée

La première recette proche (séparation des centres78px) passait dans les deux sens. Le contrôle des limites a ensuite reproduit une asymétrie : la comparaison des anciens bords gauches, avec un corps88px contre42px, donnait un seuil de centre85px à droite et131px à gauche. À107px, le côté droit refusait incorrectement l'armement.

L'agent gameplay a ajouté `distanceMetric:'centers'` au contrat016 isolé. Les valeurs stop68/melee108/rayon132 sont conservées. Les quatre bornes107/109 ont été rejouées après cette correction. Aucun seuil partagé des autres ennemis n'a été modifié par cette sous-tâche.

## Sauvegarde et restauration réellement exercées

La sérialisation utilise `ResumeEngine.prototype.captureResumeState`, conversion JSON puis `applyResumeState` sur une nouvelle instance isolée. Il ne s'agit pas d'une copie manuelle des flags.

1. Snapshot à0,25s de compression : restauration acceptée, aucune cible / elapsed / batchAttackV66 sérialisé, compression annulée et cooldown préservé ;0nouvelimpact et0explosion après0,5s.
2. Snapshot après détonation : acteur restauré mort, marqueur terminal vrai, récompense unique conservée, animation poursuivie en mort ;0nouvelimpact et0explosion.

La page ne crée aucun SaveSystem et n'écrit pas dans localStorage. La comparaison complète du stockage avant/après vaut inchangée. Ce contrôle ne prétend pas avoir sauvegardé une partie utilisateur.

## Reproduction et preuves

Page : `/docs/references/v74-enemy-fixes/016/browser.html` sur le serveur local du dépôt. Bouton «Rejouer les contrôles». Module `browser-burster-fixture.mjs`, résultats exacts `browser-results.json`, capture réellement consultée `browser-burster-pass.png`.

Le lecteur montre les deux impacts et les16poses temporelles du vrai moteur (8pression +8mort). Les silhouettes, les membres, la direction et la pose finale couchée ont été regardés ; aucune découpe de cellule ni rectangle blanc constaté. Les écarts de matière par rapport au modèle physique de référence ne permettent toujours pas une promesse1:1.

L'usage du navigateur isolé a permis de confirmer les pixels rendus et de découvrir le défaut de seuil d'armement qui n'apparaissait pas dans les seuls cas proches.

Fichiers écrits par cette sous-tâche : sous-dossier `scale/`, cette note, `browser-burster-fixture.mjs`, `browser.html`, `browser-results.json`, `browser-burster-pass.png`. Aucun STATE, manifeste, source active, atlas, readylist ou registre partagé modifié ici.


## Rejeu final après les correctifs Korari050

La page016 a été rejouée après la correction des coques et de la reprise de mort050 dans les modules partagés : ouverture puis bouton,4combats,6obstacles,4bornes107/109 et2restaurations JSON passent toujours.0erreur navigateur, stockage inchangé, capture actualisée et réellement inspectée. Le test groupé `node --test tests/enemy-korari-v74.test.mjs tests/enemy-korari-vehicle-resume-v74.test.mjs tests/enemy-burster-v74.test.mjs` passe140/140,0skip. Les deux sessions isolées016/050 sont fermées en fin de recette. La réserve sur l'absence d'atlas d'explosion dédié reste inchangée.
