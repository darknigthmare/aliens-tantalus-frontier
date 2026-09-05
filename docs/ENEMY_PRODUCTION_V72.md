# Production ennemie V72 — 5 septembre 2026

La demande « tous les ennemis terminés, aucun placeholder, en une passe » **n'est pas atteinte**. Cette livraison conserve les fichiers effectivement produits et les défauts réellement observés. Elle ne remplace pas les fiches incomplètes par une autre espèce, ne supprime pas les ennemis du catalogue et ne considère pas un atlas simplement présent comme prêt.

## Nouvelles images réellement produites

OpenAI Image intégré : dix appels terminés, huit nouvelles sources actives de huit poses, deux essais rejetés conservés séparément. Aucun appel API payant supplémentaire ni génération par recoloration/script.

- Albino Red Xenomorph071 : attente, course, attaque, mort.
- Albino K-Series Yellow Xenomorph072 : attente corrigée avec grande lame de queue, course, attaque, mort.
- Essais rejetés : premier idle072 à pointe de queue incorrecte ; seconde course071 répétant encore la même demi-foulée.

Les deux profils disposent maintenant chacun d'un atlas candidat RGBA de32poses, de quatre clips, de cinq GIF et de métadonnées reproductibles. Le contrôle technique réussit, **mais les courses répètent trop les deux demi-foulées**. La course072 a aussi un contour de pied suspect. Les32ancrages de chaque profil et leur métrologie anatomique restent à terminer après sélection d'une course correcte. Ces profils sont enregistrés `review-rejected`, pas intégrés.

Provenance vérifiable : [reçus et SHA-256](references/V72_ENEMY_GAP_GENERATION_PROVENANCE.json), [prompts exacts et événements](references/v72-enemy-gap-prompts/), [QA071](references/V72_071_ALBINO_RED_CANDIDATE_REVIEW.md), [QA072](references/V72_072_ALBINO_K_SERIES_CANDIDATE_REVIEW.md).

## Sources existantes récupérées et auditées

- Combat Synthetic042 : cinq sources existantes conditionnées en candidat de40poses, cinq clips, six GIF et métadonnées. Échelle inter-clips, recharge et racines restent ouvertes : [QA042](references/V72_COMBAT_SYNTHETIC042_CANDIDATE_REVIEW.md).
- Red019 : course/attaque trop faibles et racines non validées : [QA019](references/V72_RED019_CANDIDATE_REVIEW.md).
- K-Series020 : **intégré individuellement dans la V72.1** après revue de32points d'appui/bassins et de12cordes crâniennes. Cellule rendue268×268, corps physique62×136, orientation gauche/droite correcte. Quatre clips de8poses utilisés par le bestiaire et le moteur. Le navigateur confirme un seul impact de30PV à4/12s (cellule20), sans nouveau dégât pendant la récupération ; sauvegarde inchangée dans cette recette isolée. [Preuves](references/v72-k-series-020-review/).

Les contrôles d'animation sont désormais immédiatement sous le portrait ; ils ne passent plus sous un comparateur à deux rangées. Suite finale :999tests,998réussis,1ignoré,0échec ; lint286modules et build72.1.0 réussis. Le manifeste complémentaire compte7atlases/224poses, soit les6profils V66 intégrés et le Facehugger V65. Les cinq anciens profils V66 sont revalidés sans nouvelle image après changement du registre partagé.

## Taille du reste à faire

Après enregistrement des huit sources : **220 plaquettes attestées sur2457requises** par la file V66. Ce compteur comprend quatre sources anciennes dont le prompt exact est encore manquant ; il n'est pas un nombre de plaquettes acceptées. Il reste2237plaquettes sans génération attestée dans cette file, auxquelles s'ajoutent les reprises artistiques et l'intégration. Le roster comporte571fiches ; beaucoup utilisent encore les anciens visuels de famille.

La priorité des33fiches sans média résolu représentait143clips, dont13sources existaient au début de cette passe. Les huit nouvelles sources réduisent les absences matérielles de ce sous-ensemble de130à122, sans fermer ses défauts artistiques. [Inventaire initial détaillé](references/V72_ENEMY_NO_PLACEHOLDER_PRIORITY.json) ; [références manquantes](references/V72_MISSING_ENEMY_REFERENCE_PLAN.md).

La fidélité des adaptations générées n'est pas une certification pixel pour pixel. Les variantes du projet restent explicitement `canonExact:false`. Une génération groupée ne dispense ni de revue d'identité ni de contrôle d'animation, d'échelle, d'alpha, de combat et de sauvegarde.
