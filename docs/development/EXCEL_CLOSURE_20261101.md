# Continuation des Excel — 1er novembre 2026

La continuation part de la PR #25, tête `ec099872d3fc59465c6d17e30b577629b462f139`, et conserve les dix-neuf classeurs historiques. Le [nouveau suivi](CLOTURE_EXCEL_20261101.xlsx) et ses [données](EXCEL_CLOSURE_20261101.json) recensent les lignes à poursuivre, leurs références exactes et leurs critères de clôture.

## Corrections en cours de validation

- **Idris, montre 05h → 09h :** la dépendance d’un passager éloigné renvoyait `false` comme obligation de service et annulait sa vraie montre. Le corps du réacteur était alors remplacé par un poste échantillonné dans l’annexe, sans voyage observé. Le moteur délègue maintenant à la montre héritée lorsque le passage local n’est pas occupé. Le même corps, son origine et ses compteurs sont conservés ; les voyageurs réellement présents gardent leur priorité physique.
- **Asha, retour de Jun :** l’observateur exigeait une immobilité pendant tout le voyage inter-ponts de Jun. Depuis la réservation du couloir physique V198/V201, Asha peut marcher à 27 px/s dans le refuge jusqu’au joueur qui occupe le seuil. L’observateur vérifie cette marche, son temps, sa distance, les appuis et le dégagement de 12 px. Il refuse les téléportations, les changements de propriétaire, les traversées prématurées et les faux reçus de retour de Jun. Le moteur d’Asha n’est pas modifié.
- **Relais Rook et Tamsin :** le workflow séparé `Native station relays V166` exécute les deux pilotes existants qui observent leur départ et leur retour à la station réelle. Les boucles locales V165 ne suffisent pas à prouver ce trajet complet. Chaque route conserve son propre résultat et ses captures ; aucun statut de réussite n’est déduit de la seule configuration du workflow.

## Lecture du suivi

L’inventaire analyse 1 178 lignes dans les 26 tables Trials et 1 503 lignes dans les 17 onglets Arsenal. Il rapproche les dossiers d’armes des CSV versionnés : 71 identités cataloguées et 129 propositions de recherche, avec 57 recettes. Les sorties de Trials sont rattachées aux fiches roster ; les affectations historiques et les références sont conservées dans les sources sans créer de nouveaux travaux fictifs.

Les 584 fiches sont distinctes par domaine et portée, mais un chantier ou une priorité peut regrouper plusieurs fiches. Leur total n’est pas un pourcentage de jeu terminé. Le suivi conserve explicitement les sept routes, les tâches d’art, les recettes, les opérations partielles et les propositions non admises. Les exigences anciennes de l’arsenal qui demandent une réconciliation avec le moteur actuel restent marquées ainsi ; elles ne sont ni déclarées absentes ni artificiellement terminées.

Une clôture technique décrit le parcours réellement vérifié. Elle ne ferme pas la fidélité artistique, les sources de mouvement ou les limites de contenu. Aucun costume ni aucune arme n’est nouvellement certifié 1:1. Les classeurs externes V173/V174/V177/V190 ne sont pas présents dans ce checkout ; leur contenu n’est pas reconstitué. Les archives Blackout/Earth, l’encyclopédie brute et V10 restent à récupérer dans les sources de travail suivies.

## Validation

Le JSON de continuation indique le commit, le résultat et les limites de chaque preuve. Les résultats de la base sont conservés comme historiques : 3 882 tests Node réussis, zéro échec et un test facultatif ignoré sur 3 883 tests ; Forge et Gameplay réussis ; Excel avec quatorze jobs réussis et `crew-lifts` en échec ; release en échec sur l’origine d’Idris. Ces résultats ne sont pas transférés au nouveau candidat.

Les dix-neuf classeurs antérieurs sont préservés. Le nouveau classeur dispose de formules recalculées et d’un test de réaction du compteur de régressions à une modification temporaire de statut. Il est inspecté et rendu avant livraison. Les documents de développement et le classeur restent exclus de la distribution jouable.

Cette branche de continuation est destinée à une PR brouillon dépendant de #25. Elle ne fusionne ni #24, ni #25, ni #26, et n’effectue aucun déploiement.
