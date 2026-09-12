# Validation V78 — profils, accueil, focus et table de briefing

Date : 2026-09-12. Branche : `codex/v52-physical-worlds`.

## Gate locale finale

`npm.cmd run qa` : **réussi**, code de sortie 0, sur le code final après revue croisée.

- Audio : **0/8 slots finaux** ; fallback synthétique/silencieux uniquement.
- Sprites historiques : 195 atlas RGBA / 2 772 cellules ; supplément ennemi 12 atlas / 384 poses.
- Audit PNG : 405 images runtime, 0 erreur, 13 candidats halo à revoir ; 231 masters exclus.
- Production ennemie : 571 profils, 248 plaques présentes/provenance vérifiée, 11 profils intégrés, **559 inachevés**.
- Lint syntaxe/sûreté : **333 modules**.
- Tests : **1 435**, dont **1 434 réussis, 0 échec, 1 ignoré** (création de lien symbolique indisponible sous Windows).
- Build : **78.0.0**, 3 450 entrées catalogue. Ce total ne constitue pas une preuve de contenu fini.

Les tests ciblés supplémentaires couvrent les transactions/slots, l’identité de racine partagée, les archives QZ-17, le titre, la manette simulée, l’insertion, le service worker et la table à 30/60/120 FPS.

## Navigateur local réel

La recette `tests/browser-title-screen-v78.mjs` utilise un contexte Chromium isolé, des événements CDP réels clavier/souris/tactile et un mapping de manette standard simulé. Rapport final : `docs/references/v78-browser-qa/final-local/title-browser-report.json`, **ok=true, 0 issue, 0 erreur console/HTTP**.

- Quatre viewports : 1280×720, 390×844, 844×390 et 480×320 ; toutes les actions visibles restent dans le viewport et répondent au hit-test.
- Navigation clavier, focus circulaire, touches maintenues, confirmation/annulation de nouvelle partie, Système, Forge et retour au titre réussis.
- Le pad simulé ouvre le menu, sélectionne Nouvelle partie, bloque l’accept maintenu, annule puis revient ; **aucune manette physique n’est revendiquée**.
- Profils 2/3 et volume musique survivent au reload. L’import du JSON `true` affiche l’erreur attendue sans changer slots, partie ou runtimes.
- Le profil 3 corrompu conserve exactement ses bytes à travers reload/annulation/unload. L’export navigateur du fichier original est byte-identique.
- Le focus atteint `hub-canvas`, puis la première action d’insertion, reste dans l’insertion après rerender et termine sur `game-canvas` lorsque le moteur démarre.
- Dans le vrai hub, le marine traverse toute la table de briefing au sol, saute à travers, atterrit exactement sur son plateau, puis revient au niveau du pont.
- Neuf captures finales documentent titre, quatre layouts, mission, récupération et table.

Les dossiers `title-before/` et `title-integrated/` sont des diagnostics intermédiaires. Seul `final-local/` porte le verdict final.

## Revue indépendante

Une seconde lecture a détecté puis fait corriger une racine de sauvegarde obsolète après quick-save et deux dettes d’accessibilité/concurrence. Le snapshot final confirme : import « dernière sélection gagnante », racine partagée conservée, focus titre/hub/insertion/mission et aucun P0/P1/P2 résiduel dans ce périmètre V78.

## Publication

L’utilisateur a explicitement autorisé le 2026-09-12 la publication publique du code, des captures et des preuves sur `darknigthmare/aliens-tantalus-frontier`, puis Vercel. Au moment de ce document de contenu, commit/push/déploiement V78 restent à exécuter ; la preuve HTTP et le statut exact seront ajoutés après publication, sans les inventer à l’avance.

## Limites maintenues

- Le fond du titre reste une image composite V61 : aucune couche indépendante, aucun preset dynamique et aucune des vingt planètes demandées. Le chat #2 reste **MISSING**.
- Aucun asset ImageGen ni nouvelle sprite sheet n’est produit dans V78.
- Banque audio finale : 0/8. Animations de rechargement dédiées et identité combat Echo-9 : absentes.
- Ennemis : 559 profils de production inachevés ; les candidats rejetés ne sont pas promus.
- Matrice des conversations : **0 DONE, 15 PARTIAL, 11 MISSING**.
