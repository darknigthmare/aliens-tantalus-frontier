# V83 — preuve du build local

Date : 2026-09-12. Commit applicatif vérifié : `3b719e9e7731b200152c5c304a2de07bbb899ce7`.

## Résultats

- Build `83.0.0` servi sur `http://127.0.0.1:4177`, pas sur Vercel.
- Vérificateur HTTP : succès ; 39 fichiers runtime critiques correspondent au commit, 12 images vérifiées, dont 2 assets modulaires du stand de tir. Les 102 chemins de preuves privées contrôlés répondent 404.
- Scénario navigateur exécuté sur ce build : écran titre, tirs diagonaux J1, tir vertical J2, maintien et relâchement souris, visée tactile, pause et boutons de déplacement/tir accessibles à 844×390. Aucune erreur relevée par le scénario.
- Validation préalable du code : lint sur 387 modules ; 1745 tests réussis, 0 échec, 1 ignoré (liens symboliques indisponibles sur cet hôte) ; build produit avec 3450 entrées de catalogue.

## Preuves

- `references/v83-release-qa/local-build-http.json`
- `references/v83-release-qa/browser-built/combat-v83-browser.json`
- Quatre captures dans `references/v83-release-qa/browser-built/`, copiées sans modification avec vérification SHA-256.
- La qualification M41A complète sur le serveur source reste documentée dans `references/v83-release-qa/proving-regression/` ; elle n'est pas présentée comme une qualification rejouée sur le build ou en production.

## Limites

Ces contrôles ne valident ni toute la campagne, ni la cohérence visuelle de toutes les salles. La capture mobile montre encore une bande de sous-titres volumineuse qui peut masquer les personnages : point de polish restant. Les poses corporelles diagonales et les ennemis manquants ne sont pas livrés par ce lot ; l'échec ImageGen avant génération est documenté séparément. Aucun push GitHub ni déploiement Vercel de V83 n'a été effectué. Les rapports et captures restent soumis à l'accord explicite de publication demandé précédemment.
