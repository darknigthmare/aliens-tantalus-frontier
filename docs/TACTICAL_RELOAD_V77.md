# Rechargement tactique V77

Source : conversation ChatGPT `6a9df7c3-406c-83eb-9277-f30c778caa60`, demande utilisateur conservée dans l’audit V76. Cette livraison ne ferme pas la conversation : les animations artistiques finales restent manquantes.

## Boucle branchée

En mission, R pour J1 et T pour J2 commencent le rechargement. Une seconde pression tente la fenêtre verte ; la petite fenêtre claire produit un parfait. Un appui maintenu n’est pas une nouvelle tentative. Sans seconde pression, le rechargement normal reste disponible. Le bouton tactile est échantillonné au contact, pas au relâchement. Les deux manettes au mapping standard utilisent X/□ ; la connexion, une touche tenue ou la sortie d’une interface ne créent pas d’appui fantôme.

Les sept familles (arme de poing, fusil, shotgun, smartgun, lanceur, réservoir, énergie) ont leurs fenêtres normalisées. Le temps de l’arme équipée est conservé et borné. Une réussite accélère à82% du temps normal, un parfait à70%, avec un délai minimum de récupération. Un raté prolonge selon la famille. Un parfait donne +15% aux trois prochains tirs acceptés au maximum, sans bonus sur la tourelle APC ni consommation sur un tir refusé.

Le transfert chargeur/réserve est unique, synchrone et effectué à la fin effective. La sauvegarde conserve l’horloge de simulation, la tentative, le résultat, le transfert et les tirs bonus restants distinctement pour les deux joueurs. Une reprise ne transfère jamais de munitions une seconde fois. Pause, onglet masqué ou suspension des atlas arrêtent la simulation et filtrent les entrées. Les interruptions sont traitées sans gain d’inventaire.

## HUD et limites visuelles

Le HUD expose sa géométrie via `getTacticalReloadLayoutV77`. Sur mobile, ses textes gardent 12/11 pixels CSS au lieu d’être réduits avec le monde ; deux panneaux s’alignent dès 640 pixels de canevas visible, sinon ils sont empilés. Les contrôles ont leur propre couche hors du parent transformé du niveau. La réserve tactile passe de 70 à 120 pixels en paysage très étroit. Une surface physiquement insuffisante reste signalée par la géométrie, pas présentée comme parfaitement adaptée.

Le moteur dessine une jauge personnelle, le curseur, les deux fenêtres, le résultat et les tirs bonus. Le second joueur a son propre panneau. Les animations annoncées par l’état sont `reload_start`, `reload_normal`, `reload_success`, `reload_perfect`, `reload_fail_recover` et `reload_cancel` ; **ces noms ne constituent pas six clips produits**. `TACTICAL_RELOAD_PRESENTATION_V77.dedicatedBranchAnimations` reste explicitement `false` et le runtime utilise l’ancienne animation partagée.

L’inspection des PNG historiques révèle une divergence réelle entre l’identité locomotion et combat (casque, insigne d’épaule, pack et arme). La locomotion contient aussi des fragments et deux échelles peintes. Ces dettes ne sont pas masquées par un statut artistique final. Voir `docs/references/v77-player-reload/PRODUCTION_STATUS.md`.

## Vérification

Tests purs : `tests/tactical-reload-v77.test.mjs`. Tests du moteur de production et reprise native : `tests/tactical-reload-runtime-v77.test.mjs`. La QA navigateur et ses limites sont consignées dans `docs/VALIDATION_V77.md`. Les manettes simulées dans les tests ne certifient pas un périphérique physique ni du multijoueur réseau.
