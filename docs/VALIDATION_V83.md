# Validation V83 — locale, publication non effectuée

Date : 2026-09-12. Version : 83.0.0. Branche : `codex/v52-physical-worlds`.

## Résultats exécutés

- Toutes les gates art/inventaire/audio/BIOFORGE et lint de `npm run qa` sont passées jusqu'aux tests. Un attendu de test PWA renommant à tort les deux assets V82 en V83 a été corrigé ; les fichiers images et leurs identités V82 n'ont jamais été renommés.
- `npm test` relancé sur l'ensemble final : **1746 tests, 1745 réussis, 0 échec, 1 ignoré**. Le test ignoré concerne la création de liens symboliques non autorisée par cet hôte.
- `npm run build` : build 83.0.0 produit, **3450 entrées de catalogue**. Sortie sur C via `ATF_BUILD_OUTPUT` pour préserver l'espace D.
- Audit PNG historique : **423 PNG audités, 0 erreur, 13 réserves antérieures inchangées**. Rapport périmé corrigé sur seulement deux compteurs après le suivi Git de la poutre V82 : 690→691 découverts, 36→37 non classés. Cette poutre dispose de sa gate dédiée V82 et a également été vérifiée sans défaut alpha.
- Gate V83 : 9 tests dédiés ; V82 historique conserve ses constantes/cache/assets et utilise une fixture de release injectée pour rester testable.

## Navigateur réel

Scénarios reproductibles via `tests/browser-combat-v83.mjs` et `tests/browser-proving-ground-v81.mjs`. Chromium isolé, contrôlé par CDP ; l'outil agent-browser n'était pas installé. Aucun profil utilisateur ni sauvegarde personnelle n'a été utilisé.

Combat, quatre captures : écran titre chargé sans erreur, visée diagonale J1 au clavier, verticale J2, maintien souris avec plusieurs tirs et nettoyage au relâchement, toucher, pause et contrôle de la visibilité/accessibilité des boutons à 844×390. Le scénario utilise une mission de test explicitement initialisée et un observateur des tirs natifs ; il ne prétend pas traverser une campagne complète. Les manettes sont vérifiées avec des objets standard simulés dans les tests, pas du matériel physique.

Qualification M41A, quatorze captures : porte authorée, console, déplacements, échelle, pad, neuf cibles touchées en dix tirs, une recharge, qualification, reprise pendant le tir et après résultat, contrôles mobiles. **1163 échantillons d'identité Echo-9**, aucune exception/erreur console/log/réseau. Le seul placement de départ QA est avant la porte authorée d'Armory ; il est déclaré dans le rapport.

Preuves : `references/v83-release-qa/browser-local/` et `references/v83-release-qa/proving-regression/`. Copies contrôlées par SHA-256 depuis les sorties de test.

## Non validé / non livré

- Pas de nouvelles images : ImageGen ne peut pas ouvrir la référence locale Lurker à cause de l'erreur Windows `apply deny-read ACLs`. Échec enregistré avant génération, sans asset ajouté ou promotion de candidat.
- Pas d'animations corporelles dédiées aux huit directions ; pas de lance-flammes/harpon/tir chargé complet. Trajectoires et VFX directionnels ne valent pas complétude artistique.
- Le prologue, le créateur, le recrutement causal et d'autres demandes restent MISSING/PARTIAL ; bilan 14/571 ennemis intégrés inchangé.
- Aucun push GitHub ni déploiement Vercel V83 effectué. La publication des rapports et captures QA reste en attente d'un accord explicite, demandé précédemment après le refus du contrôle de publication. Les preuves sous `references/v83-*` sont exclues du build public.

Le vérificateur `scripts/verify-production-v83.mjs` compare un commit déterminé, ses 39 fichiers critiques et 12 images inchangées. Les preuves HTTP locales, lorsqu'elles sont produites, sont rangées en `local-build-http.json`, jamais présentées comme une preuve de production Vercel.
