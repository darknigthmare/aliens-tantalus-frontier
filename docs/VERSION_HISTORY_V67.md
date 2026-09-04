# V67 — Registre ChatGPT et CARGO BRUTAL jouable

Date : 4 septembre 2026.

V67 ouvre la production méthodique des 19 conversations auditées du projet ChatGPT « Aliens tantalus project ». Cette version livre une première opération spécialisée, sans déclarer les 18 autres promesses terminées ni le jeu commercial complet.

## Contenu livré

- registre déterministe de 19 conversations dans `src/special-operations-v67.js` ;
- états mesurés à cette version : 1 promesse `effective` et jouable, 9 promesses `partial` et 9 `missing` ;
- ajout de la campagne `special-cargo-brutal`, portant alors le catalogue à 437 campagnes sans modifier les 206 paires MIRE/Frontier ;
- planification depuis l’onglet Opérations, insertion à pied puis prise de contrôle dans le niveau physique ;
- boucle dédiée : remise sous tension, activation du P-5000, trois obstacles de cargo, escorte de survivants, transport du noyau, Matriarche en trois phases et extraction ;
- conditions d’échec pour le Loader et le convoi, avec état de mission sérialisé et reprise sans duplication des récompenses.

## Art effectivement intégré

Deux atlas OpenAI originaux sont acceptés et branchés au runtime :

1. `cargo-brutal-props-atlas-v67.png`, 4 × 2, pour les obstacles, le noyau, le coupleur et la capsule ;
2. `cargo-survivors-shaw-ruiz-kessler-v67.png`, 4 × 3, avec une rangée d’identité distincte pour Shaw, Ruiz et Kessler.

La candidate Matriarche reste rejetée à cause de chevauchements entre cellules, d’une baseline instable et d’une identité insuffisamment validée. Le runtime conserve donc une approximation explicitement déclarée ; l’opération reste `partial` au sens de la validation artistique commerciale, même si sa boucle mécanique est jouable.

## Preuves de validation

- l’écran titre, le hub physique, l’onglet Opérations, la planification, les cinq étapes d’insertion et le premier objectif Cargo ont été parcourus dans Chromium ;
- les modules runtime et les deux atlas acceptés ont répondu en HTTP `200` ;
- le canvas observé n’était ni vide ni transparent ;
- console et erreurs de page : aucune entrée ;
- après correction du filtre de campagne et du landmark de bannière, axe-core a rendu 0 violation sur la vue Opérations ;
- les contrats automatisés couvrent la boucle, les échecs, la reprise, l’art, le contenu et le cache hors-ligne.

Les détails et limites sont conservés dans `docs/V67_BROWSER_QA.md`, `docs/V67_CARGO_BRUTAL_ART_QA.md` et `docs/CHATGPT_PROJECT_PARITY_V67.md`. Le commit de livraison est `2f806ae` (`feat: add playable Cargo Brutal special operation`). Ce document ne déduit pas de ce commit un état de déploiement Vercel non vérifié séparément.

## Limite honnête

V67 est le premier lot exécutable d’un backlog de 19 conversations. Il ne prouve ni une couverture artistique dédiée des 571 profils ennemis, ni la réalisation de chaque mission promise, ni une qualité commerciale globale.
