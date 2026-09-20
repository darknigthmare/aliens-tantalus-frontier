# V87 — Audit de composition de l'écran principal

Date : 20 septembre 2026. **Document privé, exclu du dépôt public, du build distribué et du cache PWA.**

Statut : **implémenté, vérifié en privé, sur le build public et en production Vercel READY**. La vérification HTTP de production confirme les fichiers du commit ; les neuf compositions ont été rejouées sur le build local puis sur l'alias déployé.
Base privée avant ce lot : `f27e6bbb9d8f7e1b5f1348ef878f8d91ff9907da`.
La livraison publique précédente `4f318e43c2b5ed61d2be644f0cd9588ff8435ed9` ne contient pas encore ces corrections.

## Périmètre

Demande prioritaire : auditer puis corriger uniquement l'écran principal, notamment les vaisseaux superposés et les effets de planète mal alignés ou incohérents en perspective.
L'identité graphique existante est conservée : transport Tantalus, navette utilitaire, trois planètes, arrière-plan spatial, hublot/premier plan et interface du titre.
Les 18 PNG acceptés sont inchangés ; aucune nouvelle image ni retouche d'asset n'a été produite.
Aucun changement de `src/app.js`, de gameplay, de sauvegarde ou du lot animalier en cours.

## Causes reproduites et corrections

| Constat réel | Cause contrôlée | Correction |
| --- | --- | --- |
| Deux vaisseaux massifs se recouvrent | La navette secondaire hérite du cadre plein écran et de `object-fit: cover`, tandis que le transport possède un autre placement. La navette devient visuellement plus grosse que le transport. | Cadres indépendants à ratio 16:9 : navette 16vw, transport 58vw sur bureau, placements distincts ; adaptation explicite sur mobile. Un seul bitmap par identité. |
| Jets lumineux traversant l'écran sans partir des moteurs | L'effet d'échappement occupe lui aussi le viewport entier et est superposé au premier plan. | Cadre et mouvement exactement partagés avec le transport ; translation/échelle interne alignées sur ses deux sorties moteur ; profondeur de rendu derrière le vaisseau. |
| Nuages qui tournent comme une plaque plate | Le bitmap est déjà une projection éclairée du globe, mais reçoit une rotation CSS de 360° en 44 secondes. | Suppression de cette rotation ; variation lumineuse discrète, sans rotation ni translation indépendante du disque. |
| Atmosphère et nuages décalés par rapport au globe | Les sept PNG sphériques ont des marges transparentes et des centres différents. Le même cadre extérieur ne fait donc pas coïncider leurs silhouettes visibles. | Mesures alpha en lecture seule, puis registrations carrées individuelles vers un disque commun ; proportions natives conservées et nuages limités au disque. |
| Débris envahissant les vaisseaux et le texte | Champ de débris plein écran, fortement agrandi par le cadrage `cover`, particulièrement sur mobile. | Cadre séparé de 54vw sur bureau, ratio conservé, placement inférieur et opacité réduite ; adaptation mobile. |
| Variantes de planète ignorant une partie des règles mobiles | Les sélecteurs de preset ont une spécificité supérieure à l'ancien sélecteur responsive. | Même niveau de spécificité dans les media queries portrait et paysage, pour conserver le placement voulu pour les trois presets. |

Les couches planes utilisent aussi `backface-visibility: visible` : leur visibilité ne dépend plus d'une élimination de faces 3D inutile à cette composition.
Cela ne constitue pas la preuve d'un bug universel de Chrome : les disparitions de couches et attentes RAF observées dans les premiers essais de QA étaient également liées à la fenêtre masquée et au throttling. La validation finale utilise un Chrome headless isolé et stable, pas ces captures intermédiaires.

## Fichiers du correctif

- `src/title-scene-assets-v79.js` : sept registrations sphériques mesurées, sans changer les chemins ni les hashes des PNG.
- `src/title-scene-catalog-v79.js` : transmission des registrations et profondeur des jets moteur.
- `src/title-scene-v79.js` : application des variables CSS de placement.
- `title-scene-v79.css` : dimensions, ancrages, ordre visuel, animation et responsive.
- `tests/title-composition-v87.test.mjs` : quatre tests dédiés.
- `tests/browser-title-composition-v87.mjs` : harnais navigateur privé, contextes isolés et délais CDP bornés.

Les mises à jour du numéro de cache réalisées par l'agent principal pour la prochaine publication ne sont pas attribuées à ce correctif.

## Validation locale exécutée

Commande de régression :

```text
node --test tests/title-composition-v87.test.mjs tests/title-scene-v79.test.mjs tests/title-assets-v79.test.mjs tests/title-screen-v61.test.mjs tests/title-screen-input-v78.test.mjs
```

**39 tests réussis, zéro échec.** Ils couvrent les placements normalisés, l'identité des deux vaisseaux, les contrats CSS, les hashes et reçus des 18 assets existants, les fallbacks/erreurs de chargement, les modes de mouvement, la migration et les contrôles du menu.
`node --check` des modules modifiés et du harnais : réussi. `git diff --check` sur les fichiers du titre : réussi.
Ce résultat ne remplace pas une suite globale ni un build de publication, non exécutés par ce sous-lot.

Preuves navigateur privées :

```text
E:/CodexQA/AliensTantalus/v87-title-20260920/after/report.json
```

Le rapport final indique `ok: true`, neuf configurations et zéro erreur JavaScript/HTTP :

- Presets `frontier-night`, `storm-terminator`, `ember-quarantine`.
- Viewports 1280×720, 390×844 et 844×390.
- Images réellement chargées/décodées ; fond historique masqué ; absence de débordement horizontal.
- Navette inférieure à 40 % de la largeur du transport ; jets conservant exactement le cadre mobile du transport.
- Planète, atmosphère et nuages dans le même cadre carré, sans transformation indépendante.
- Mode sans animations : zéro animation active.
- Échantillon animé après 2,2 secondes réelles : onze animations actives avant masquage, aucune après `hide()`.

Le harnais ouvre d'abord le vrai écran titre, puis utilise des fixtures de présentation explicites avec le contrôleur réel pour examiner chaque preset. Il ne modifie ni sauvegarde, ni contenu des PNG, ni CSS de la page testée ; il ne simule pas des frames.
Un contrôle complémentaire avec `agent-browser` a confirmé le chargement, le bouton d'entrée accessible dans le snapshot et l'absence d'erreur signalée.

Captures finales inspectées :

- `after/frontier-night-1280.jpg` : séparation des vaisseaux et alignement des jets sur bureau.
- `after/storm-terminator-390.jpg` : composition portrait.
- `after/ember-quarantine-844.jpg` : composition paysage court.
- Le même dossier contient les neuf combinaisons, `boot-1280.jpg`, `reduced-motion-static.jpg` et `frontier-night-motion-2s.jpg`.

Les captures `before/` conservent le défaut initial. Les captures `diagnostic-backface.jpg` et `agent-browser-*.jpg` sont intermédiaires : elles ne remplacent pas les captures et le rapport final sous `after/`.
Le premier harnais final a été interrompu après attente de RAF dans la fenêtre masquée ; le suivant a échoué avec un timeout CDP. Ils ne sont pas comptés comme réussites.
Le redémarrage headless a d'abord rencontré un `ECONNRESET` avant disponibilité du port, puis le parcours final complet a réussi.

## Limites visuelles et de portée

- La planète reste une illustration projetée fixe. Aucune rotation sphérique 3D n'est produite ni prétendue ; une telle rotation nécessiterait une texture ou des images réellement adaptées.
- Les nuages ont une légère variation lumineuse, pas une simulation atmosphérique. Les registrations corrigent les centres et proportions des bitmaps existants, pas leur éclairage peint intrinsèque.
- Le mode statique et les variantes de qualité conservent leurs choix de couches préexistants ; le correctif ne complète pas les 35 slots artistiques manquants du manifeste V79.
- Pas de nouvelle fidélité 1:1 certifiée, d'audit complet du jeu, de couverture de toutes les résolutions ni de parcours gameplay supplémentaire revendiqués.
- Aucun accès au navigateur personnel ; les sessions utilisées sont les sessions QA isolées autorisées.

## Publication

Le commit public `2fda1b42d989e6459cff380d33bc98302587dccd` a été poussé atomiquement sur `main` et `codex/v86-public-release`. La revue indépendante a vérifié le parent public exact `4f318e4`, l'absence d'ascendance du commit privé et un delta de 18 fichiers de jeu autorisés seulement (ce lot contient aussi Mica).

Les neuf configurations ont été rejouées sur le build public servi en HTTP local, avec les mêmes assertions : zéro erreur, asset manquant ou débordement ; 12 captures dans `E:/CodexQA/AliensTantalus/v87-title-20260920/public-built/after/`. Contexte navigateur isolé fermé après le test. Le cache public est `atf-v86-public-shell-12`. Le contrôle hors ligne du shell et de ses dépendances sélectionnées passe ; il ne certifie pas toutes les missions hors ligne.

Déploiement production `dpl_J9RjhoztADaLBstgSzqWZMWRinRe` confirmé **READY** sur `2fda1b4`, alias `https://aliens-tantalus-frontier.vercel.app`. Le contrôle HTTP de production confirme 97 modules critiques et 263 chemins privés en vrai 404. Aucun log error/fatal retourné sur la fenêtre interrogée de 15 minutes ; aucun dispositif de surveillance continue n'est revendiqué. Voir `docs/V87_MICA_AUDIT.md` pour le périmètre de publication commun.

Dernier contrôle du titre **en production : PASS**, neuf configurations et 12 captures dans `E:/CodexQA/AliensTantalus/v87-title-20260920/production/after/`. Aucune erreur JS/console/HTTP, aucun asset manquant ni débordement horizontal, fallback masqué dans les neuf cas ; 11 animations normales, zéro en mouvement réduit, arrêt après masquage. Inspection visuelle des trois formats conforme au build validé. Le contexte isolé a été fermé ; aucun navigateur personnel modifié.
