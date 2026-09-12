# Validation V84 — locale, publication non effectuée

Date : 2026-09-13. Version : 84.0.0. Branche : `codex/v52-physical-worlds`.

## Résultats exécutés

- `npm run qa` exécuté de bout en bout : **1889 tests, 1888 réussis, 0 échec, 1 ignoré**. L'unique test ignoré dépend de la création de liens symboliques non autorisée par l'hôte.
- Lint : **403 modules** contrôlés. Les gates art, inventaire, audio et BIOFORGE incluses dans la commande sont passées.
- Build 84.0.0 : **3450 entrées de catalogue**. Sortie `build-v84` sur C via `ATF_BUILD_OUTPUT`, afin de préserver l'espace D. La taille du catalogue ne mesure pas le nombre d'assets terminés.
- Régressions ciblées : transitions et migration du prologue, sauvegarde atomique, validation d'identité, brouillon sans écriture, callbacks tardifs interprofils, import différé, arrêt BIOFORGE sans contamination, dialogues reprenables et contrôle de proximité/portes.
- L'identité du joueur reste indépendante des quatre Marines sélectionnés. Les tests mission/Alpha-Bravo couvrent quatre alliés en solo, substitution de J2 en coop, reprise et certificat stratégique idempotent, sans compter J1 à la place d'un Marine absent.
- Le goulot CIC reproduit sur l'ancienne fixture est corrigé. Marche et saut, dans les deux sens à 30/60/120 FPS, restent possibles sans modifier les dimensions des acteurs ni la physique globale. Le plateau du pupitre reste utilisable à l'atterrissage.

## Navigateur réel sur la version construite

Chromium isolé contrôlé par CDP, sans profil ni sauvegarde personnels. L'outil agent-browser n'étant pas disponible, les scénarios utilisent le navigateur local et les événements réels clavier/souris. Ces essais ne certifient pas une manette physique.

### Création et parcours cryo → CIC → briefing

`tests/browser-onboarding-v84.mjs`, servi depuis le build à `http://127.0.0.1:4177/` : six captures, aucune erreur JavaScript/HTTP/réseau. Stockage vierge, ouverture native du créateur, annulation conservant les octets précédents, validation du dossier puis apparition devant la capsule. L'interaction de réveil, la marche vers DAVID-8R, le dialogue, la traversée effective du CIC et les trois répliques de Tamsin passent sans téléportation ni écriture directe de phase par le test.

La reprise au milieu du dialogue conserve le nœud et la position. Une seconde reprise conserve la fin du briefing. La création d'une autre chronologie au format 390 × 844 teste une erreur simulée de quota de stockage : l'ancien dossier reste intact, le brouillon reste ouvert et l'annulation ne remplace pas la sauvegarde.

Preuves : `references/v84-release-qa/onboarding-built/`.

### Sous-titres et contrôles de combat

`tests/browser-captions-v84.mjs` : cinq captures aux formats 1280 × 720, 844 × 390, 390 × 844, 480 × 320 et 320 × 568. Le rail des sous-titres reste hors du canvas et hors des touches ; textes longs défilables, taille et surface tactile contrôlées. La capture mobile paysage a été relue visuellement. La lisibilité et la composition globale du jeu mobile ne sont pas pour autant considérées comme finalisées.

`tests/browser-combat-v83.mjs` : quatre captures, titre V84, visée diagonale J1 et verticale J2 au clavier, maintien souris, relâchement, tactile et pause. La mission est une fixture explicitement initialisée ; aucun parcours intégral de campagne n'est revendiqué. Aucune erreur JavaScript/HTTP/réseau.

Preuves : `references/v84-release-qa/captions-built/` et `references/v84-release-qa/combat-built/`.

## Régression de la qualification M41A sur les sources

`tests/browser-proving-ground-v81.mjs` servi à `http://127.0.0.1:4176/` : **9/9 cibles, score 1025, 10 tirs, 1 rechargement, 2 reprises stables**, aucun projectile résiduel et reçu/bonus unique conservé. **1148 observations d'identité Echo-9 sans fallback**, quatorze captures, aucune erreur JavaScript/HTTP/réseau.

Le test déclare son périmètre : sauvegarde legacy explicite injectée avant chargement, bouton Continuer réel, puis placement QA initial devant la porte d'Armory. La qualification, ses déplacements et ses tirs sont ensuite natifs. Ce scénario ne remplace pas la vérification du créateur neuf, couverte séparément sur le build.

Preuves : `references/v84-release-qa/proving-regression/`. Les **33 fichiers archivés** de ces quatre scénarios (29 captures et quatre rapports) ont été copiés avec comparaison SHA-256. Les premiers essais échoués ou intermédiaires n'ont pas été promus comme preuves réussies.

## Vérification HTTP et publication

`scripts/verify-production-v84.mjs` vérifie un commit déterminé : **46 fichiers critiques**, les **12 images V81/V82 inchangées** (dont deux éléments modulaires), les métadonnées de build, les types MIME et le cache V84. Les preuves QA V81–V84 suivies dans Git doivent répondre 404 sur le build public. La normalisation CRLF/LF est explicitement distinguée d'une égalité binaire.

Le rapport HTTP local après commit, lorsqu'il est produit, est rangé en `references/v84-release-qa/local-build-http.json`. Un résultat loopback n'est jamais une preuve de déploiement Vercel.

Aucun push GitHub ni déploiement Vercel V84 effectué. L'envoi des rapports et captures QA reste en attente d'un accord explicite, demandé précédemment après le refus du contrôle de publication. Ces preuves sont exclues du build public ; aucun secret ni configuration privée ne fait partie du lot.

## Non livré et réserves conservées

- **Aucune image ni sprite sheet générée dans ce lot.** Le réveil utilise les assets existants, pas une animation dédiée d'ouverture de capsule. Le formulaire réemploie le mannequin existant et ne propose pas de morphologies ou de portraits individuels nouveaux.
- Aptitudes, recrutement causal et historique relationnel restent ouverts ; les dialogues V84 sont des textes originaux Tantalus Frontier, pas une transcription retrouvée ni du canon de franchise.
- L'équilibrage de toutes les campagnes avec J1 indépendant et quatre Marines n'est pas certifié par les seules régressions de composition/ordres.
- La matrice reste **0 DONE / 17 PARTIAL / 9 MISSING**. Les ennemis restent **14/571 intégrés, 557 non intégrés**. Aucun statut de jeu commercial complet ni de fidélité graphique 1:1 n'est revendiqué.
