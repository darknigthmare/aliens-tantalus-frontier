# V83 — Combat huit directions et corrections de cohérence

Livraison locale 83.0.0. Ce sous-lot ne clôture aucune des 26 conversations et ne prétend pas terminer le jeu commercial.

## Modifications effectives

- Missions J1/J2 : huit directions normalisées, bouche autour de l'épaule, vitesse constante, direction verticale sans perte du facing horizontal. Tourelles sur leur propre pivot.
- MAJ gauche/J1 et MAJ droite/J2 : visée sur place, sans glissement latéral ni réalignement automatique d'échelle. Saut et gravité conservés.
- Stick droit indépendant pour chaque manette. Connexion/reconnexion exigeant un retour au neutre ; pause, UI, onglet caché et déconnexion neutralisent l'entrée.
- Souris/stylet/tactile : conversion écran → monde tenant compte de la caméra et du viewport logique 1280×720. Maintien pour tirer ; relâchement sans touche résiduelle. Deux doigts permettent déplacement et visée indépendants.
- Suppression du second handler de clic non gardé : Ctrl-clic, UI et pointeur concurrent ne consomment plus de munition.
- Assistance : cône de 12°, visibilité contrôlée, vitesse renormalisée ; une visée explicite n'est pas détournée. La mêlée automatique ne détourne pas cette intention.
- Projectiles : collision continue avec ordre spatial, obstacles prioritaires à égalité, durée de vie respectée, bornes du niveau, pénétration/statuts/splash conservés. Surfaces one-way respectées.
- Escouades : tirs réellement dirigés vers le centre des cibles en hauteur, cadence et multiplicateurs Alpha-Bravo conservés.
- BIOFORGE : huit directions, collision continue, confinement sur quatre côtés, diagnostic d'échappée X/Y, manette et saut, suspension lors du chargement d'atlas.
- Rendu des projectiles orienté selon la trajectoire. Commandes mobiles compactes et aide accessible, sans paragraphe débordant derrière le canvas.
- Cache hors ligne V83 avec les deux nouveaux modules. Gate HTTP versionnée : 39 fichiers critiques, 12 assets existants inchangés, preuves QA privées exclues du build.

## Art et limites explicites

Les cinq feuilles Echo-9 restent celles validées en V81. Les poses corporelles de tir diagonal/vertical **ne sont pas produites** : tourner la trajectoire ou le VFX ne remplace pas les animations de bras/corps dédiées.

La tentative ImageGen intégrée avec référence Lurker a échoué avant génération : `helper_unknown_error: apply deny-read ACLs`. Le prompt et l'erreur sont conservés dans `references/v83-imagegen/lurker-reference-attempt.json`. Aucun asset V83 ni fidélité 1:1 n'est revendiqué. Les candidats V82 n'ont pas été promus. Bilan ennemi inchangé : **14/571 intégrés, 557 non intégrés**.

Les 14 familles d'armes passent la même chaîne directionnelle. Cela ne crée pas un jet de flammes, un harpon/grappin, un rayon ou un tir chargé distinct. Ces mécaniques restent ouvertes avec le prologue, le créateur, le recrutement causal et l'art manquant.

## Références

- `V83_GAMEPLAY_SOURCE_AUDIT.md` : sources et blocages persistants du prologue/Echo-9/recrutement.
- `references/V76_CHATGPT_PROJECT_GAP_MATRIX.md` : suivi courant, 0 DONE / 17 PARTIAL / 9 MISSING.
- `VALIDATION_V83.md` : résultats effectivement exécutés et état de publication.
