# V82 — validation locale et état de publication

Date : 2026-09-12. Runtime : 82.0.0. Cache : `atf-v82-modular-proving-shell-1`.

## Résultats constatés

- `npm run qa` : réussite ; 1575 tests, 1574 réussis, zéro échec, un ignoré (création de liens symboliques interdite par cet hôte Windows). Lint de 377 modules et build avec 3450 entrées de catalogue réussis.
- Après ajout du contrôle de classification production/local/preview : nouvelle exécution `npm test`, 1576 tests, 1575 réussis, zéro échec et le même unique test ignoré.
- Les deux assets OpenAI V82 passent le contrôle déterministe, les hashes sources/exports et les tests alpha. Les sources restent inchangées ; seule la mise au format technique est appliquée.
- La gate HTTP V82 a été testée avec HTTP/Git simulés : 7 tests réussis. Le contrôle du build servi localement est prévu après création du commit ; aucun résultat distant V82 n'est revendiqué ici.
- Navigateur Chromium isolé : 14 captures finales, 1139 échantillons d'identité Echo-9, zéro exception/erreur console/requête échouée/HTTP d'erreur. Le titre attend ses 14 images décodées puis deux frames de composition, sans couche dégradée.
- Parcours réel : titre, nouveau profil, point de départ QA documenté devant la porte Armory, entrée dans Proving Ground, console, échelle, pad, neuf cibles touchées avec dix tirs et une recharge. Qualification et bonus persistants après deux reprises. Contrôles mobiles vérifiés à 390×844.
- Les captures du stand, des supports de cibles et du titre entièrement composé ont été inspectées. Ce parcours ne prétend pas couvrir toutes les campagnes, salles ou topologies ennemies.

Preuves : `docs/references/v82-release-qa/browser-local/proving-ground-v81-browser-report.json` et 14 JPEG voisins. Le nom historique du script/rapport V81 est conservé, mais son schéma et son runtime vérifié sont V82.

## Livrables d'image et prompts

Génération : outil OpenAI ImageGen intégré, sans API payante additionnelle configurée par l'agent.

- `assets/openai/hub/proving-ground/v82/proving-ground-wall-v82.webp` : mur 1920×720.
- `assets/openai/hub/proving-ground/v82/proving-ground-ceiling-beam-v82.png` : poutre alpha 1536×450, pivot de montage [768,141].
- Sources, SHA-256 et transformations : `docs/references/v82-proving-ground-art/art-audit.json`.
- Prompts exacts des deux décors : `docs/references/v82-proving-ground-art/exact-generation-prompts.md`.
- Deux planches Lurker réelles mais non acceptées : `docs/references/v82-lurker-attack/source-receipts/`, avec `technical-audit.json`, contacts/GIF et `exact-generation-prompts.md`.

Lurker R1 traverse les limites des cellules 2/3/4. R2 isole correctement huit poses mais sa récupération reste décalée de 35–37 px : aucun recalage artificiel ne masque cette dette. Ni intégration ni fidélité 1:1 ne sont revendiquées. Le registre effectif reste 14 profils sur571 ; 557 travaux de la file restent non intégrés.

## Stockage et publication

L'ancien `dist` non suivi a été copié vers `C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien/build-backup-v81`, puis sa copie D: retirée uniquement après vérification SHA-256 des1097 fichiers. Environ564 Mo libérés ; aucun source ni candidat historique supprimé. Le nouveau build utilise `ATF_BUILD_OUTPUT` sur C:.

La publication de ce lot sur GitHub/Vercel reste en attente de l'autorisation explicite demandée pour les rapports/captures QA. Le commit local V81 `36176df` est lui aussi encore non poussé. Les preuves et masters V82 sont exclus du build et de l'upload Vercel ; les deux exports runtime restent inclus. Aucun accès à des tokens/credentials n'a été tenté pour contourner le blocage.

La matrice globale garde 26 conversations : 0 DONE, 17 PARTIAL, 9 MISSING. Cette livraison améliore deux périmètres ; elle n'est pas une déclaration de finition commerciale.
