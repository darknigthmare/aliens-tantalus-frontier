# Validation V75

8 septembre 2026. Cette validation couvre le jalon local de production ennemis V75. Elle ne certifie ni l’ensemble du jeu, ni une campagne complète, ni une fidélité 1:1, ni une publication publique.

## Contrôles ennemis vérifiés

- `npm run batch:v75:check` : **réussi**. Le [snapshot central](references/V75_ENEMY_PROGRESS.json) correspond à l’état calculé : 570 profils dans la file, 11 intégrés, 5 rejetés en revue et 559 non finalisés ; le profil Facehugger de référence est compté séparément dans le roster total de 571.
- `npm run art:v75:check` : **réussi** en mode contrôle. Les octets revus des 11 profils intégrés correspondent aux décisions, puis les atlas Prowler 015 et Ceto 051 sont reconstruits/contrôlés sans divergence. Cette gate ne vaut pas revue artistique des 559 profils restants.
- Suite runtime ennemis persistée : **308 tests réussis, 0 échec**. La commande exacte et la sortie complète sont liées depuis les décisions d’intégration et conservées dans [runtime-test-output.txt](references/v75-enemy-fixes/runtime-test-output.txt). Elle couvre les tests dédiés Prowler/Ceto, les régressions de combat V66/V73/V74, l’accès production et la reprise associée.
- Ceto ciblé, rejoué localement : `node --test tests/enemy-ceto-v75.test.mjs tests/enemy-ceto-pivot-v75.test.mjs tests/enemy-v66-production-access.test.mjs` : **11/11 réussis**. Le bassin dédié, l’atlas/pivot, les deux orientations, l’impact unique, les obstacles/ligne de vue, la locomotion, la mort, le flood et l’accès différé aux atlas sont couverts.
- Prowler : les huit cas dédiés de [enemy-prowler-v75.test.mjs](../tests/enemy-prowler-v75.test.mjs) sont inclus dans la suite persistée de 308 tests. Ils vérifient les octets/32 poses, l’identité et la taille, les deux orientations, le bond balayé avec impact unique, les obstacles, les véhicules, la reprise et les cellules d’attaque/mort.

Les décisions positives sont [Prowler accepté](references/v75-enemy-fixes/release/accepted-enemy-015-prowler.json), [Prowler intégré](references/v75-enemy-fixes/release/integrated-enemy-015-prowler.json), [Ceto accepté](references/v75-enemy-fixes/release/accepted-enemy-051-ceto-reef-predator.json) et [Ceto intégré](references/v75-enemy-fixes/release/integrated-enemy-051-ceto-reef-predator.json). Les décisions négatives enregistrent explicitement Lurker 011 et Atarax Ripper 023 avec `accepted:false` et `runtimeIntegrated:false`.

## Contrat de publication ciblé

La commande `node --test tests/build-asset-filter.test.mjs tests/pwa-offline-contract.test.mjs tests/v50-art.test.mjs` a réussi au checkpoint V75 : **18/18 tests**. Elle contrôle le filtre d’assets, la fermeture du shell hors ligne et les contrats d’art partagés. Ce résultat ciblé ne constitue ni un build de production complet ni une vérification du site déployé ; il doit être rejoué dans la QA de publication sur une copie propre.

## Contrôles encore en attente de la gate complète V76

- **QA globale : en attente.** Aucun total global V75 n’est revendiqué ici.
- **Build/copie propre : en attente.** Le contrat ciblé ci-dessus ne remplace pas un build complet depuis un arbre propre.
- **Navigateur : en attente.** Aucun parcours de campagne, aucune capture comparative et aucun contrôle responsive/public V75 ne sont revendiqués.
- **GitHub : en attente de la gate complète V76.** Aucun commit ni push de publication n’est revendiqué par ce document.
- **Vercel : en attente de la gate complète V76.** Aucun déploiement, alias, HTTP 200 ou correspondance d’empreintes distante n’est revendiqué.

Le détail de provenance est dans [ART_PROVENANCE_V75.md](ART_PROVENANCE_V75.md). Le solde réel du projet, au-delà de ce jalon ennemi, reste suivi dans la [matrice maîtresse des écarts](references/V76_CHATGPT_PROJECT_GAP_MATRIX.md).
