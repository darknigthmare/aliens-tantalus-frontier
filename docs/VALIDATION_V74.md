# Validation V74

5 septembre 2026. Livraison incrémentale, pas certification de campagne complète ou de fidélité 1:1. Voir [production et dettes restantes](ENEMY_PRODUCTION_V74.md).

## Vérification locale

- Suite complète : **1 224 tests, 1 223 réussis, 0 échec, 1 ignoré**, 18,1 secondes. Le test ignoré concerne les privilèges de création de lien symbolique Windows.
- Contrat central de production : **276 tests réussis**, sortie exacte liée par SHA-256 aux neuf intégrations V66. Le manifeste V65/V66 contient **10 atlas / 320 poses** ; le même lot de 50 conserve **47 profils non finalisés**.
- Lint syntaxe/sécurité : **295 modules**, réussi.
- Normalisation rejouée depuis les sources pour 016, 050 et 049 : **32 poses chacun, 0 anomalie technique**, aucune acceptation automatique. 049 reste bloqué artistiquement.
- Build : **74.0.0**, 3 450 entrées de catalogue ; ce compte n'est pas un nombre d'assets terminés. Huit contrôles d'inclusion/exclusion réellement exécutés dans dist passent.
- Filtre de publication : **13 tests réussis**. Atlas acceptés 016/050 et rapports publics conservés ; sources V74, prompts, diagnostics et candidats 049/054 exclus avant descente dans leurs dossiers.

## Contrôles réels du navigateur

Les fixtures isolées importent les modules expédiés, chargent les vrais atlas et appellent le rendu V51/V52. Elles n'altèrent pas de sauvegarde utilisateur et ne constituent pas un parcours complet de campagne.

- 016 : deux moteurs × deux orientations ; compression, explosion unique et mort tenue ; six obstacles, quatre bornes de portée et deux véritables restaurations JSON.
- 050 : deux moteurs × deux orientations ; morsure unique et 32 poses ; 12 cas de coque de 240 pixels sans intrusion et 8 restaurations JSON : des contrôleurs neufs à trois horloges différentes conservent les poses attendues 24/27/31/31.
- Bestiaire réel : navigation depuis l'accueil vers Xénobiologie ; six cas à 1280×720, 1280×900 et 390×844. Trois/quatre silhouettes sur un même sol, sans débordement, facteur commun conservé.

La contre-revue a découvert puis fait corriger l'asymétrie de portée 016, la pénétration 050 dans une coque de 240 pixels et le cadavre 050 qui rejouait sa chute après chargement. Les tests spécifiques et captures sont sous `references/v74-enemy-fixes/`.

## Publication

Commit, vérification sur copie propre et déploiement de cette version restent à confirmer dans cette section après exécution. La version de production précédente reste V73 jusqu'à cette confirmation.
