# V90 — deuxième tranche native, 23 septembre 2026

## Périmètre livré

Deux comportements partiels ajoutés aux 35 identités importées existantes, dans le moteur réel de mission. Aucun nouvel ennemi, PNG, atlas, nom de caste ou remplacement des anciens profils Altered. Les rencontres restent contextuelles, déterministes, deux contacts maximum et une seule identité royale.

- Pathogen Queen : annonce puis salve de trois globules acides avec trajectoires distinctes vers une zone verrouillée. Pas de flaque ajoutée ni de carapace destructible inventée. Le projectile déjà lancé persiste après la mort, mais l’attaque en préparation est annulée.
- Pathogen Runner : approche au sol à rythme variable, pauses comprises, toujours inférieure à sa vitesse native de base. Aucun saut, changement anatomique ou animation nouvelle. Son attaque de proximité annoncée est un réglage du projet, pas une reproduction certifiée.

Le [dossier officiel Cold Iron du 29 août 2022](https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/) décrit les salves acides de la Reine ainsi que le Runner plus lent et irrégulier. Les trois trajectoires, temps, portées, dégâts, neutralisation par balle et rythme cyclique sont nos adaptations 2D. La carapace détachable et les autres attaques de la Reine décrites par cette source ne sont pas implémentées par ce lot.

## Contrat d’intégration

`getEnemyUserCampaignV88(id)` expose `specializedBehaviorV90` (`id`, `label`, `summary`, `sourceUrls`, `adaptationNote`) et `behaviorContractV90`. Le moteur préfère ce dernier au contrat V89. L’encyclopédie doit sélectionner `specializedBehaviorV90 || specializedBehaviorV89` sans afficher une animation certifiée. Les trois contrats V89 restent inchangés. Bilan : cinq identités avec spécialisation partielle, trente à comportement simplifié.

Les nouveaux champs `strideStep`/`strideClock` et `shotIndex` transitent par l’état natif existant, sans changer l’identité ou les stats sauvegardées. La restauration valide strictement ces champs. L’absence/invalidité d’un état d’attaque revient à une récupération sûre ; les effets invalides sont rejetés. Le cycle SaveSystem complet est testé, pas seulement un aller-retour direct capture/apply.

Les globules partagent le budget existant de quatre projectiles : la capacité nécessaire à toute la salve est réservée avant insertion ; une branche cachée derrière un obstacle est écartée. Les collisions balayées bloquent les portes minces. Chaque fragment possède sa propre clé de sauvegarde, jamais une nouvelle détonation pour un fragment consommé. Chaque impact déduplique les passagers d’un même véhicule.

## Vérifications

- Tests ciblés : **98 PASS / 0 FAIL**, dont `tests/enemy-user-behavior-v90.test.mjs` (18 cas), les 28 cas V89 inchangés et les régressions campagne V88 / delta / Cargo / MIX. Couverture : vrai spawn, géométrie de mission, obstacles, pause/delta nul ou négatif, mort pendant annonce, dégâts coop, véhicule partagé, tirs interceptés, plafond d’effets, état corrompu et sauvegarde complète pendant annonce/vol/épuisement/déplacement.
- Navigateur : `tests/browser-user-behavior-v90.mjs`, Chrome isolé, 3 contrôles et 8 captures, zéro erreur console/HTTP. PNG natifs chargés et dégâts mesurés : Reine 15,75 sur le fragment central, Runner 17.
- Preuve privée finale : `E:/CodexQA/AliensTantalus/v90-campaign-20260923/browser-private/run03/report.json`. Les captures Reine/3 globules et Runner de `run02` ont été inspectées ; `run03` vérifie à nouveau le code final après durcissement de la restauration. `run02` corrige uniquement le cadrage de la fixture (la Reine est réellement dans un autre secteur, hors caméra au premier essai).
- Portée honnête : scène déterministe utilisant le moteur de production et la géométrie de mission inchangée ; joueur placé et temps avancé par le harnais. Ce n’est pas une preuve de parcours complet au clavier ni de fidélité canonique intégrale.

## Manques restant ouverts

Voir [inventaire borné des références](references/V90_SOURCE_BACKED_GAPS_20260923.md). Il distingue les absences du lot natif, les références actuellement vérifiées, les candidats graphiques du chantier parallèle et les identités encore incertaines. Aucun élément absent n’est activé avec un PNG emprunté. Le présent lot n’ajoute ni entrée factice à l’encyclopédie ni ennemi sans art approuvé.
