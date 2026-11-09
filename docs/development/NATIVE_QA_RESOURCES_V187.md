# Ressources de la recette Jun / Asha — V187

## Défaut constaté sur le commit 8219837

La [CI Excel du 9 novembre 2026](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/42562437098) termine avec 14 jobs réussis sur 15. Le job `crew-lifts` échoue dans `qa-npc-annex-service-routes-v163.py`, au préalable « Jun completes its exact native physical return before Asha occupation ». Le build exécuté est le merge temporaire `a97784b1828c614d786301f3a570abe5e968d40c`, dont l'arbre est identique à `8219837892fc8c5ede58f2c500a934192fea1ae0` : `695c389d35395f8b8a262fe364eefddb60b9904b`.

Le diagnostic imprimé est `jun-wall-budget-exhausted` : 900 007,6 ms murales, 293,794 s natives et une progression physique 102,5 ms auparavant. Jun marche encore sur `life-support`, pont 3, à x = 2 711,929264 vers son origine x = 3 158, y = 532. Il a deux franchissements et deux trajets d'ascenseur ; aucun transfert de priorité ni reçu de retour final n'est présent. Cette exécution reste **échouée et incomplète**. Elle ne prouve pas un retour réussi, ni un arrêt du personnage.

Le même préalable passe sur le [dernier main vert](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/42235507119), en environ 704,851 s murales. Le moteur borne chaque pas natif à 34 ms dans `src/hub-game.js`. Une machine lente peut donc consommer le plafond mural avant les 360 s natives admises. Le rapport 293,794 / 900 est une cadence de simulation constatée, pas une mesure directe de FPS.

Le lecteur du préalable utilise déjà le composant natif ciblé : une seule comparaison initiale avec le snapshot complet, puis lectures Asha/Jun par RAF. Aucun coût de lecture Chromium ni défaut de vitesse, de collision ou de trajet n'est établi par ce seul échec. Les captures de l'artefact distant ne sont pas homologuées ici ; sa copie vers l'environnement a rencontré un refus proxy 403, sans nouvelle tentative d'accès.

## Profils explicites et bornes physiques

`--dependency-resource-profile` concerne uniquement le préalable Jun avant l'occupation Asha :

| Profil | Plafond mural | Simulation native maximale | Sans progression physique |
| --- | ---: | ---: | ---: |
| `standard` (défaut historique) | 900 s | 360 s | 45 s |
| `ci-slow4` | 1 440 s (360 × 4) | 360 s | 45 s |

Le facteur quatre est une enveloppe de ressources choisie et déclarée pour la CI, supérieure au rapport mural/natif d'environ 3,06 constaté dans l'échec. Il ne garantit pas les performances d'un matériel. Une machine plus lente, un arrêt ou un retour incomplet doivent encore faire échouer la recette.

La CI sélectionne explicitement `ci-slow4`. Le profil standard reste disponible et garde son plafond de 900 s. Le nom et les bornes sont enregistrés dans le rapport. Les deux profils exigent le même propriétaire Jun, l'origine physique exacte, les deux franchissements et ascenseurs, la distance verticale de 496, une distance mesurée, les priorités admissibles et le reçu de retour final. L'occupation Asha, les passages du joueur et la collecte finale conservent leurs propres gardes.

Il n'y a ni avance d'horloge ni écriture d'acteur ou de contrôleur dans le navigateur. Les fixtures restent des imports de sauvegarde déclarés, issus de `createDefaultSave`, avec les seuls ajustements déjà décrits par le vérificateur.

## Vérifications et succession

Les tests d'observateur utilisent des doublures déclarées de RAF et d'horloge murale. Ils doivent distinguer un retour complet lent d'une fin de plafond, d'une immobilité, d'un dépassement natif, d'un transfert de priorité ou d'un reçu incomplet. Ils ne remplacent pas un parcours réel.

```sh
node --test scripts/verify-npc-annex-service-routes-v163.mjs scripts/verify-native-qa-resources-v187.mjs
python3 -B scripts/qa-npc-annex-service-routes-v163.py --base http://127.0.0.1:4173 --route asha-refuge --dependency-resource-profile ci-slow4 --fixture /tmp/asha-disclosed-native0530.json --output /tmp/asha-v187
```

Une comparaison navigateur doit réutiliser exactement les mêmes octets de fixture et les mêmes réglages. Conserver séparément identité du build, empreinte du vérificateur, profil de ressources, résultat et captures. Une exécution qui n'atteint pas le reçu final reste échouée, même si le personnage progressait encore.

V187 continue les reçus V186 et le contrôle de garde V182 par une transition explicite entre empreintes revues. Les anciens reçus et le contrat standard ne sont pas réécrits. Les classeurs et leurs JSON historiques restent conservés ; aucun succès de cette recette ne clôt toutes les origines, interruptions et priorités des sept services, ni une homologation artistique 1:1.

Les résultats du nouveau profil sont à qualifier sur sa propre tête publiée. Les résultats de `8219837` ne lui sont pas transférés.
