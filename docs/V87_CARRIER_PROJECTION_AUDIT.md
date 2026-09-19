# V87 — Audit privé de la projection de caisse et des garde-fous du hub

Date : 19 septembre 2026. Base privée de la passe : `de1390d07ccbb88b2a63e95988b1a064a523cfa5`.

**Document privé, exclu de la distribution publique.** Il décrit une correction circonscrite, ses preuves locales et de production, ainsi que les travaux encore absents. Il ne constitue ni une certification de toutes les animations, ni une déclaration de jeu commercial complet.

## 1. Livraison et périmètre exact

Commit public : `0186438884a8b9f53a200a59d1346392bc548bbf`, parent `035d54c84ef3481f4e5484ee7e39bd22e3be76aa`.

Les cinq fichiers de ce commit sont exclusivement :

- `src/hub-v71-runtime.js` ;
- `src/ship-companion-controller-v87.js` ;
- `src/sprite-animation-runtime.js` ;
- `src/ship-carrier-presentation-v87.js` ;
- `sw.js`.

Le contrôle des références distantes communiqué pour cette publication confirme ce commit sur `main` et `codex/v86-public-release`. Les tests, rapports, extraits ChatGPT, prompts, références et photos privées de cette passe ne sont pas dans ce commit. Le présent document n'a pas été ajouté à la distribution publique.

## 2. Trois corrections effectives

### 2.1. Caisse alignée sur le porteur entre deux commits de transport

Le transport reste validé et sauvegardé par pas de simulation de 0,2 seconde. Auparavant, le corps suivait les frames de physique tandis que la caisse conservait l'ancre du dernier commit : elle pouvait donc rester visiblement en arrière. Le nouveau helper pur `sampleShipCarrierPresentationV87` utilise la projection d'une livraison validée, puis suit les pieds réels d'un joueur explicitement vivant dans la même salle et sur le même pont.

L'écart autorisé est borné par le reliquat de simulation actif et la frame de physique suivant le tick, avec un plafond de 0,25 seconde et les limites de continuité du transport : 800 px/s horizontalement, 1 800 px/s verticalement, tolérance de 12 px. Le rendu n'extrapole pas au-delà des pieds actuels et ne modifie ni la sauvegarde, ni les checkpoints, ni la progression. Il ne déduit pas un trajet entre deux salles.

La caisse garde une largeur de 48 px ; son centre est exactement à **+36 px ou -36 px** du porteur selon son orientation. Son bas reste à 24 px au-dessus des pieds. Le collider humain reste **44 × 92 px**. La projection approuvée est conservée seulement en mémoire pour figer pause, dialogue et affichage masqué, puis effacée lors de la fermeture ou d'un changement de propriétaire/profil. La projection portée est masquée pendant une transition d'annexe ou une discontinuité non validée.

Les caisses `awaiting-recovery` restent des objets immobiles à leur dernier point validé. Leur récupération physique et la preuve du trajet restent régies par le domaine existant. Le rendu ne les rapproche jamais du point de réapparition du joueur.

### 2.2. Arrêt de la frame après refus de sauvegarde

`HubGame.update` constate désormais si le tick des compagnons vient d'arrêter un hub auparavant actif. Il retourne alors avant la physique ou la progression d'un sas. Une sauvegarde refusée ne doit pas être suivie, dans la même frame, d'un changement de salle ou d'une deuxième tentative de persistance par la transition. Les mises à jour explicitement déjà en pause conservent leur compatibilité existante.

Les tests du contrôleur et des transactions couvrent le rollback mémoire/octets, l'arrêt sans deuxième persistance, l'isolation des profils, les refus de transport corrompu et la reprise physique après dépôt. Ce garde-fou ne supprime ni les dangers du hangar ni leurs collisions.

### 2.3. Réaction humaine vivante au choc électrique

Le résolveur d'animation Echo9 prend maintenant en compte `shockClock`, utilisé par le hub, en plus de `v52HurtClock`, utilisé en mission. La mort reste prioritaire. Un choc sur un personnage vivant sélectionne le clip `hurt`, pas une animation complète de chute/cadavre.

Cette correction réutilise les feuilles Echo9 existantes. Elle n'ajoute aucune nouvelle planche ni animation humaine dédiée au portage.

## 3. Vérifications locales

Racine des preuves de cette passe : `I:/CodexQA/AliensTantalus/v87-carry-fix-20260919/`.

| Vérification | Résultat et preuve |
|---|---|
| Suite de release | `unit-tests-release.log` : **2 593 tests**, **2 592 pass**, **1 skip**, **0 fail** ; le test ignoré n'est pas compté comme réussi. |
| Sous-ensemble projection/contrôleur/delivery/transactions/identité | **92/92 pass** lors du raccord ; comprend une séquence de 60 frames à 370 px/s sans décalage de caisse et sans écriture effectuée par le dessin. |
| Syntaxe et sécurité | Lint : **475 modules pass** au raccord, puis **476 modules pass** lors de la revalidation finale de release. `git diff --check` sans erreur. |
| E2E privé Moka | `e2e/private-moka/report.json` : **25 jalons**, `ok: true`, aucune erreur rapportée. |
| E2E public local Brume | `e2e/public-local-brume/report.json` : **25 jalons**, `ok: true`, aucune erreur rapportée. |
| PWA locale | `public-pwa-local.json` : cache **`atf-v86-public-shell-7`**, **196 chemins** ; helper et modules structurels/animaux/port accessibles hors ligne. |
| HTTP public local | `C:/Users/chuck/Documents/Codex/2026-08-20/prend-la-conversation-chat-gpt-alien/privateoutput/v87/carry-fix-public-local-http.json` : **84 fichiers critiques** comparés au commit, **16 assets runtime**, **6 assets animaux/port**, **226 sondes d'URL privées**, `ok: true`. |

Les parcours E2E partent d'une **fixture initiale explicite** : onboarding terminé, logements animaliers installés, joueur placé dans le hangar. Ensuite, amarrage, annulation, rechargement en approche, entrée au comptoir, achat, prise de caisse, déplacements, échelles, ascenseurs, réception, acclimatation, résidence, contact, marche de routine et rechargement utilisent les vraies commandes clavier/souris et la boucle RAF normale. Aucune affectation de position après la fixture n'est revendiquée. Cela ne certifie pas un parcours intégral de création de personnage ou toute la campagne.

Les 25 jalons consignés sont : boot, fixture, terminalApproach, abortApproach, midApproachBeforeReload, midApproachReload, docked, portArt, purchase, pickup, hangarCarry, hangarLadderTop, reactorBalcony, reactorLadderBottom, midshipLift, industrialLift, habitatLift, berth, carrierProjection, intake, acclimating, resident, pet, routineWalk et residentReload.

### Chronologie réelle des validations et du push

Le build isolé, les parcours E2E locaux et la PWA locale étaient passés **avant le push**. La vérification HTTP locale finale n'était pas encore validée à cet instant : le serveur Python de QA renvoyait initialement les WebP avec le type `application/octet-stream`. Le serveur QA a ensuite reçu la correction MIME, sans changement du jeu. **Après le push**, le contrôle HTTP local final a passé, puis les contrôles HTTP, PWA et navigateur de production ont été confirmés PASS. Il ne faut donc pas présenter l'intégralité de la QA HTTP locale comme achevée avant publication.

### Mesure du suivi visuel

| Parcours | Frames mesurées | Frames en mouvement | Gauche | Droite | Erreur horizontale maximale | Erreur verticale maximale |
|---|---:|---:|---:|---:|---:|---:|
| Privé Moka | 1 738 | 1 251 | 718 | 1 020 | 2,2737367544323206e-13 px | 0 px |
| Public local Brume | 1 921 | 1 426 | 813 | 1 108 | 2,2737367544323206e-13 px | 0 px |
| Production Moka | 1 724 | 1 240 | 708 | 1 016 | 2,2737367544323206e-13 px | 0 px |

L'écart horizontal relevé est un résidu d'arrondi flottant. Ces mesures prouvent l'alignement de la caisse sur l'ancre attendue, **pas la présence d'une pose humaine de portage ni la fluidité artistique de ses membres**.

## 4. Distribution, construction et confidentialité

La source publique contient **907 fichiers**, dont **730 assets**. La revue SHA-256 a trouvé **907/907 sources identiques** au snapshot `public-source/`, sans fichier source supplémentaire ou manquant. Le build QA isolé de ce snapshot contient **896 fichiers**.

Le dossier `dist/` présent dans le worktree public local était ancien : **884 fichiers**, 12 fichiers manquants et 12 fichiers différents par rapport au build QA actuel. **Ce vieux dist n'est pas l'artefact déployé.** `.vercelignore` exclut `dist`, et `vercel.json` prescrit `npm run build` avec sortie `dist`. L'autodéploiement reconstruit la source du commit public ; aucune validation de l'ancien dossier ne doit être déduite du succès de production.

Le cache est passé à `atf-v86-public-shell-7`, avec le nouveau helper explicitement dans `CORE`. Les résultats PWA portent sur le shell, les modules et assets mesurés, pas sur toutes les missions du jeu hors ligne.

Le worktree public partage techniquement le répertoire Git du dépôt privé local. `git log --all` peut donc montrer des branches privées ; la publication ciblée utilise le commit public et son parent public ci-dessus. **Aucun nouvel ancêtre privé n'a été ajouté par ce commit. L'historique public legacy n'a pas été purgé.** L'exclusion des documents dans l'arbre livré et les sondes HTTP ne sont pas une preuve d'effacement des anciens objets ou de tout l'historique GitHub.

## 5. Production : résultats définitifs de cette passe

Déploiement Vercel : **`dpl_9gbmFaead9BVUZeoC3baAU9PyGkS`**, état **READY**, commit **`0186438884a8b9f53a200a59d1346392bc548bbf`**, alias `https://aliens-tantalus-frontier.vercel.app`.

| Contrôle de production | Résultat |
|---|---|
| HTTP | `privateoutput/v87/carry-fix-public-production-http.json` dans l'espace nominal privé : **84 fichiers critiques** identiques au commit public, **16 assets runtime**, **6 assets animaux/port**, **226 sondes privées**, **907 chemins** dans l'arbre source ; `ok: true`. |
| PWA | `public-pwa-production.json` : cache **shell-7**, **196 chemins**, **16 modules** structurels/animaux/port hors ligne, **6 PNG**, **4 feuilles d'outils**, **4 exclusions**, **0 erreur**. |
| Parcours réel Moka | `e2e/production-moka/report.json` : **25 jalons**, intégrité humaine **100** à la reprise de résidence, **0 erreur** ; mesures de caisse dans le tableau précédent. |
| Inspection de capture | `e2e/production-moka/05c-reactor-balcony.jpg` inspectée pendant la QA de publication : caisse alignée ; arme encore visible dans la pose humaine ordinaire ; master dropship flou toujours présent. |

Les contrôles navigateur, HTTP et PWA de production sont donc **PASS dans ce périmètre**, et non plus en attente. Aucun audit exhaustif de toute la campagne, de la télémétrie ou de tous les logs serveur n'est déduit de ces résultats.

## 6. Manquants et limites maintenus explicitement

- **Aucune nouvelle image produite dans cette passe.** L'outil ImageGen intégré a échoué sur la lecture Windows des références avec l'erreur ACL du helper. Aucune génération par API payante de remplacement n'est revendiquée.
- **Planche humaine carry dédiée absente.** Le suivi de caisse est corrigé, mais le corps peut encore afficher son arme ; idle/walk/climb/hurt de portage sans fusil restent à générer, contrôler et intégrer. L'ancien clip `lift-carry` n'est pas une marche portée complète.
- **Master dropship flou non remplacé.** La correction de projection n'améliore ni sa résolution ni sa perspective.
- **Paquet d'animations joueur V87, paquet REFUGE et dossier complet PALISADE non récupérés.** Les références ou annonces textuelles de ces livrables ne remplacent pas les fichiers effectifs. Le paquet animaux déjà récupéré est distinct du paquet REFUGE.
- **29 conversations connues seulement**, non un inventaire exhaustif du projet ChatGPT et non 29 contrats terminés. Le détail est maintenu dans `docs/V87_SOURCE_COVERAGE_REFRESH.md` ; les autres conversations ajoutées par l'utilisateur peuvent encore manquer.
- Les photos personnelles, le nom, la dédicace et les dates de la pièce hommage ne doivent pas être inventés ni publiés sous couvert d'une référence générique.
- Ce sous-lot ne termine ni tous les ennemis et véhicules, ni toutes les plaques d'animation, ni REFUGE, ni les régions et chapitres PALISADE. Il ne certifie aucune fidélité 1:1 globale, aucune durée de vie annoncée et aucun « jeu commercial complet ».

Conclusion : correction réelle et publiée de trois défauts ciblés, avec preuves unitaires, parcours locaux, parité publique et QA de production. Les limites artistiques et de récupération des sources restent ouvertes et identifiées ; elles ne sont pas effacées par les comptes de fichiers ou les jalons réussis.
