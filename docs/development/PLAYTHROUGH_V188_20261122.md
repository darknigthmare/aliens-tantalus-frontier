# Parcours complet de la campagne principale — V188, 22 novembre 2026

Document de développement, source uniquement. Il n'est pas livré dans le build public :
`scripts/verify-public-release-v86.mjs` l'admet par son chemin exact.

## Cadre

- **Base** : `7989c757`, branche de travail de l'agent ; serveur `PORT=4701 node scripts/dev.mjs`.
- **Navigateur** : Chromium `/opt/pw-browsers/chromium-1243`, piloté par Playwright
  (`/opt/node-tools/node_modules/playwright`) en CDP. La même page reste ouverte d'une commande
  à l'autre. Fenêtre de 1366×768 pour tout le parcours ; 390×844 pour les contrôles téléphone.
- **Point de départ** : une **nouvelle partie** sur le profil 1. L'écran titre, la confirmation
  « Nouvelle partie » et le créateur de personnage passent par l'interface réelle.
  Personnage : « Ada Moreau », origine 02, mort définitive de l'équipage active.
- **Points de reprise** : après chaque étape, le `localStorage` complet est exporté dans le
  dossier de travail de l'agent (`pt188/checkpoints/cp01…cp27`). La reprise a été testée deux fois :
  restauration de `cp02` après le redémarrage du conteneur, puis rechargement de page en pleine
  mission. Les fichiers restent hors du dépôt.
- **Journal** : le journal brut (`pt188/run.log`) et 139 captures (`pt188/shots/`) restent aussi hors du dépôt.

### Entrées réelles et injections déclarées

Entrées réelles : clics souris ; clavier A/D, W/S, Espace, C, E (appui et maintien), F, R,
Entrée et Échap ; touches 1 à 7 de l'audience. Les cinématiques sont passées avec Échap, les mises en
scène en jeu avec Entrée, et les insertions avec leurs propres boutons. Les choix passent par les
boutons des boîtes de dialogue.

| Code | Injection | Où |
| --- | --- | --- |
| H1 | Pose du marine au sol du pont, sur le même pont, pour quitter une passerelle haute | Pont 3, une fois (sortie de la cabine du hangar) |
| H2 | Plancher de santé dans le hub | Prévu pour l'Interlude, non utilisé (0 fois) |
| M1 | Téléportation du marine vers un lieu lu dans le niveau (`player.x/y`) | QZ-17 (preuves, nœuds), QZ-18 (deux postes de la passerelle), C1-C4, S1-S4, Cocon noir, C-12 (rampe → ascenseur), murs du port |
| M2 | `defeatEnemy` du moteur sur les hostiles proches ou les apparitions du niveau, avec un plancher de santé de 80 | Toutes les missions sauf QZ-18, le convoi APC et la course de l'Acte V |
| M2b | Convertis restants de C4 retirés, comme dans `qa-colony-levels-v188.mjs` | C4 |
| M4 | Attente raccourcie : S4 `holdRemaining = 3` ; Cocon noir, attente de Kappa passée à 87/90 s | S4, Acte IV |
| E1 | Sauvegarde modifiée : ravitaillement 5 → 60, carburant 12 → 40 | Avant C4 (voir B5 et Q1) |
| E2 | Sauvegarde modifiée : chaîne d'infestation pathogène marquée résolue | Avant le saut vers Nacre-7 (voir Q2) |

Combats faits sans injection : la qualification M41A (9/9), le convoi APC (deux Crushers et la
Reine), la course « Dernier départ » avec le largage au pont, la poursuite de la Reine du dépôt et les
six xénomorphes de l'Interlude.

## Étapes

| # | Étape | Résultat | Injections |
| --- | --- | --- | --- |
| 1 | Titre → Nouvelle partie (double confirmation) → CIN-00 → créateur | OK. La confirmation expire après 5 s. Dans le créateur à 1366×768, le bouton « Valider » se trouve sous le pli de la fenêtre (défilement interne). | — |
| 2 | P-1 : réveil mis en scène, DAVID-8R, CIN-01, Velez, couchette, armurerie | OK | — |
| 3 | P-2 : Proving Ground, liaison perdue (CIN-P2), réparation 3 s, reprise, 9/9 avec recharge ; relais du réacteur ; signal sur la passerelle ; manifeste au pupitre du hangar (réacteur, passerelle, conduit en rampant) ; fret médical | OK, entrées réelles | — |
| 4 | P-3 : briefing → CIN-02/CIN-03 → quai : lot, triage, sas (5 s), trois habitants, constat, CIN-doyenne → Commandement | OK. Les habitants attendent si le marine s'éloigne de plus de 390 px (règle du jeu). | H1 avant le départ |
| 5 | Acte I · QZ-17 | Mission terminée. **B1** trouvé et corrigé (mort en boucle au point de reprise). Après une retraite et un nouveau départ, les preuves sont conservées. Verdict « maintenance ». CIN-10/11/retour. Dossier 2/7. | M1, M2 |
| 6 | C1 · Tenir le port | OK | M1, M2 |
| 7 | Acte II · QZ-18 | OK : PDA, relais, postes, brouillon restauré (F 4 s), verdict « détresse retardée ». **B2** (table tactique inaccessible) et **B3** (dossier non redessiné) trouvés et corrigés. Dossier 3/7. | M1 (passerelle) |
| 8 | C2 · L'air du port | OK | M1, M2 |
| 9 | Quête de Rook « Six heures » (introduction de la station) | OK, réponses par le dialogue | — |
| 10 | S1-S4 | OK. S2 : audience CASSIUS perdue (pièces jouées en alternance), décision « Réécrire ». Dossier 4/7. | M1, M2, M4 (S4) |
| 11 | Acte III · convoi M577 (manifeste : 1 conteneur, 4 places) | OK au clavier. Deux échecs au Crusher 1 ont été causés par la pause du pilote entre deux commandes ; avec une reprise immédiate au point de reprise, aucun problème. | — |
| 12 | Acte III · C-12 | OK (munitions, relais, défense de 45 s, ascenseur) | M1, M2 |
| 13 | CIN-31 → CIN-40 → Interlude | La crise s'ouvre bien. Six xénomorphes tués au clavier. Jun Park rejoint par le conduit du support-vie (pont 3). Créature détruite, CIN-41. Voir **R2**. | — |
| 14 | C3 · Le convoi des rescapés | OK | M1, M2 |
| 15 | Acte IV · Cocon noir | OK (résine, sac, batterie, relais, échelle industrielle, Delta, balises Kappa, rampe, râtelier, scan), CIN-50/51. Dossier 6/7. | M1, M2, M4 |
| 16 | C4 · Le culte du port | Départ bloqué par le ravitaillement (**B5**). Mission terminée après E1. Décision « Marshals ». | E1, M1, M2, M2b |
| 17 | Acte V · conseil de guerre (ouvert dès l'Acte IV terminé, avant C4) | Avantage de Cal ; « Transmettre » fermé (salle des relais) ; recommandation « Tenir la colonie », suivie par Vega | — |
| 18 | Acte V · Dernier départ | OK au clavier. Remorque de fret lâchée au pont (X). | — |
| 19 | Acte V · La Reine du dépôt | OK au clavier. La Reine a arraché la remorque des colons, puis elle est tuée au carrefour du port. | — |
| 20 | Acte V · Les murs du port | OK (tenue de zone de 18 s, deux vagues) | M1, M2 |
| 21 | Audience Halloran sur « Tenir » | Gagnée 10/10 au clavier (silence, 1, 2, 6, 4, 5). Les commandos se retirent, scène du quai, CIN-60/61. | — |
| 22 | Fin « Les vivants, sans preuve » → épilogue → casier d'Echo-8 → générique | OK, `act5.phase = complete` | — |
| 23 | Appel « La Saison des Reines » (C5 · la nuit des murs, CIN, réquisition acceptée) | OK | — |
| 24 | Saut vers Nacre-7 (carte galactique, transit de 8 s, 14 jours) | Bloqué par une infestation à bord (**Q2**). Saut fait après E2. Mission 1.1 « Le quai noyé » proposée au Commandement. | E2 |

Erreurs : le collecteur installé dans la page (`error`, `unhandledrejection`, `console.error`) n'a rien
relevé pendant tout le parcours. Une seule exception a été vue : « Ce profil a changé dans une autre session »,
levée par la persistance du hub. Elle a été provoquée par l'injection E2, qui a modifié le stockage
pendant que la page tournait (voir R5). Aucune requête n'a échoué, ni aucun chargement d'image.
L'écran « Sprite indisponible — nouvelle tentative… » apparaît pendant le premier chargement de QZ-17,
puis disparaît (suspension prévue du chargement).

Mise en page : à 390×844, le Commandement, le menu, la carte galactique et le hub (contrôles tactiles)
n'ont pas de défilement horizontal. Le hub affiche « Mode paysage recommandé ». À 1366×768,
aucun débordement n'a été relevé sur les écrans visités.

## Bogues trouvés et corrigés (test d'abord)

Les tests sont dans `scripts/verify-bugfix-full-run-v188.mjs`, ajouté à `test:priorities:v188`.

- **B1 · Point de reprise du boss sous le sol (QZ-17).** `defeatEnemy` du boss écrivait le point
  de reprise « confinement » à la hauteur du sol de l'ancien monde (`FLOOR_Y = 930`). Le sol
  intérieur de QZ-17 est à y = 868. Après la mort du marine, ENTRÉE le replaçait sous le sol ; il
  tombait et retombait au tapis indéfiniment. Correction dans `src/game-v52-level-runtime.js` : pour
  un niveau de mission, le point de reprise est posé sur la surface où se tenait le boss
  (`enemy.groundY`). Test : restauration au point de reprise après la mort du boss, puis 3 s de
  simulation ; le marine est vivant et au sol.
- **B2 · Table tactique de la salle de briefing inaccessible.** Les objectifs (« Salle de briefing,
  table tactique… ») y envoient le joueur. Mais la table avait la priorité d'un accessoire faible (10),
  et Velez, Vega, ECHO-A et Orlov l'entourent : aucun point de la table ne proposait E. Correction
  dans `src/hub-game.js` : la table devient un poste prioritaire (100), comme l'UD-4L. Au centre de la
  table, sans faire face à un membre d'équipage, E ouvre la table. Face à Velez, E lui parle.
  Vérifié dans le navigateur : « E — Préparer une opération avec Echo-9 » ouvre la table, puis CIN-20.
- **B3 · Dossier QZ17 non redessiné après CIN-20-ROOK.** La pièce « Priorité de fret à 18:43 »
  dépend de cette cinématique. Le panneau restait à 2/7, même après un changement de vue, alors que
  la sauvegarde contenait 3/7. Correction dans `src/app.js` : une cinématique nouvellement vue
  redessine le panneau des missions du Commandement.
- **B5 · Départ refusé sans explication.** Après 13 sorties, le ravitaillement est à 5 pour un coût de 6.
  « DÉPLOYER ECHO-9 » était grisé sans aucune raison affichée. Correction dans `src/app.js` : le plan
  affiche les ressources manquantes sous le bouton, avec le texte de refus existant en FR/EN
  (« Ressources insuffisantes : 5/6 RAVIT. »). Vérifié dans le navigateur.

## Problèmes restants (non corrigés)

- **R1 · Anciennes sauvegardes avec un point de reprise sous le sol.** Une partie déjà enregistrée
  avec le point de reprise « confinement » faux le garde à la reprise. Le joueur peut en sortir avec
  « Battre en retraite » ; le nouveau départ conserve les preuves. Aucune migration n'a été ajoutée.
- **R2 · Placement de la crise de l'Interlude.** L'objectif indique « Pont 2, salle de quarantaine »,
  mais le système de crise du hub fait apparaître les menaces sur le pont où se trouve le joueur
  (`configureCrisis` n'utilise pas `deck` ni `roomId`). Le code de la crise est ancien et partagé ;
  le changer touche toutes les crises du hub.
- **R3 · Texte de l'objectif P-2.** L'objectif parle de « deux échelles vers le sas supérieur ».
  L'entrée réelle du Proving Ground est la porte au sol de l'armurerie, et l'annexe n'a qu'une échelle.
  Les deux panneaux d'objectif ont aussi deux textes différents.
- **R4 · Commandes du pupitre.** Le groupe `#hub-training-controls-v132` reste `display:flex` malgré
  l'attribut `hidden` (règle `.button-row`). Le bouton « P-5000 humain · H » reste dans le DOM hors
  du Proving Ground. Il n'est pas visible sur les captures.
- **R5 · Exception non interceptée en cas de conflit de profil.** « Ce profil a changé dans une autre
  session » remonte comme une erreur de page depuis `persistHub` (cas de deux onglets). Elle n'est
  pas affichée par un message de l'interface.
- **R6 · Libellés identiques au verdict QZ-17.** Les deux boutons « CONFIRMER LA CONFRONTATION » du
  terminal ont le même texte ; seul le paragraphe voisin les distingue.
- **R7 · Texte du conseil avec un seul conteneur.** Le conseil affiche « Sans conteneur à rendre,
  céder pèse sur le moral » alors que le M577 en a ramené un. La restitution n'existe qu'à partir de
  deux conteneurs, mais la phrase est inexacte.

## Questions de conception

- **Q1 · Ravitaillement de la ligne principale.** Une nouvelle partie commence avec 78 de
  ravitaillement, et une sortie sur Cocyte en coûte environ 6. La ligne principale avec ses missions
  de colonie et de station dépasse 13 sorties avant l'Acte V. Le jeu ne montre aucune source de
  ravitaillement évidente (projet « Logistique », annexe logistique, marché d'Asphodèle pour le
  carburant seulement). Faut-il une source visible, ou un coût réduit pour les missions de la ligne
  principale ?
- **Q2 · Infestation à bord avant le saut.** Le retour de « La Reine du dépôt » a ouvert une chaîne
  d'infestation pathogène (`hub.infestationChain`, étape « indices »). Elle bloque le saut vers
  Nacre-7 avec le seul message « Infestation à bord non résolue », sans dire quoi faire (annexes sas
  d'arrivée, CCTV, Bioforge, puis confinement). Faut-il guider le joueur, ou épargner la fin de
  campagne ?
- **Q3 · Ordre des actes.** Après P-3, l'objectif recommande QZ-18 (Acte II) avant QZ-17 (Acte I).
  Le conseil de guerre s'ouvre dès l'Acte IV terminé, avant C4. L'Interlude démarre avant C3. Le
  parcours a suivi l'ordre de la bible quand le jeu le permettait.
- **Q4 · Escouade et arme de départ.** Le plan affiche « M4A3 Service Pistol » comme arme alors que
  Velez parle du M41A qualifié au pas de tir.

## Vérifications

Voir le rapport de livraison de cette branche : `npm run test:all`, `check`, `build`, `check:built`
et `i18n:check` sont lancés sur le commit final, après la fusion d'`origin`.
