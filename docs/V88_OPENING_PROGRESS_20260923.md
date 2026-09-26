# V88 — Continuation jouable de la prise de poste, 23 septembre 2026

Document privé : ne pas publier les sources de conversation, leurs extraits, chemins personnels ni les captures QA.

## Source et portée

Lecture croisée des rapports `V87_GAMEPLAY_CHAT_GAPS_20260920.md`, `V87_SOURCE_COVERAGE_REFRESH.md`, `V83_GAMEPLAY_SOURCE_AUDIT.md`, de `references/v76-conversation-audit/group-gameplay.md` section 7 et du relevé privé `privateoutput/v87/campaign-source-visible.md` (notamment lignes 349–367).

- La création du Marine, la cryostase, DAVID-8R et le briefing initial sont déjà le parcours V84. Le composite V88 conserve ce runtime et ses textes ; il ne réécrit aucune réplique existante.
- Le texte PALISADE visible demande une affectation/couchette, un exercice, une aide à la maintenance, la voix de Port-Méridien, un manifeste et le choix médical/énergie avec conséquences. Le document Word complet et la fin de certaines réponses ne sont toujours pas récupérés : cette réalisation ne prétend pas les transcrire.
- Les trois courtes répliques de signal V88 sont explicitement des textes de projet nouvellement écrits, pas un dialogue canon retrouvé. DAVID-8R, Mara et Hélène Voss restent distincts.

## Réalisation

Un marqueur versionné indépendant `openingV88` existe seulement pour les nouvelles créations. Les anciennes campagnes gardent `null`, sans tutoriel imposé rétroactivement.

Le joueur rejoint physiquement ses quartiers, contrôle sa dotation, monte les deux échelles d’armurerie, passe le vrai sas du Proving Ground, tire sur les neuf cibles dans les trois directions et recharge. Seul le reçu réel de qualification permet la suite. Il rejoint ensuite le réacteur et tient une réparation trois secondes ; déplacement, saut et sortie de zone l’annulent, la pause fige le temps.

Trois courts nœuds de signal sont sauvegardés séparément. Le choix de fret se fait au pupitre réel du hangar, sur la passerelle au-dessus de l’arc électrique, après les échelles du réacteur et le conduit existant. Aucune collision, aucun arc ni prop n’a été retiré pour rendre le trajet artificiellement accessible. Le guidage indique W, ESPACE et C pour les passages concernés.

La première opération existante reçoit soit deux trousses supplémentaires dans son véritable inventaire, soit une réduction de deux unités de carburant au lancement (coût minimum un). Choix, paiement et opération sont idempotents ; le fret médical est immédiatement checkpointé. Une reprise effective conserve l’inventaire consommé, une reprise native rejetée suivie d’un refus de compatibilité ne supprime plus le fret d’une insertion fraîche. La réussite ou la retraite clôt le marqueur d’ouverture de cette opération seulement.

Les transitions sont atomiques via le candidat de sauvegarde et protégées par l’identité profil/timeline. Le validateur central de lancement empêche de contourner les étapes par l’interface.

## Reprise verticale du vaisseau

La vérification du pupitre a révélé une perte réelle du Y parent à la reprise. `hub.positionY` est désormais facultatif (défaut `null`, ancienne pose inchangée) et borné. Le composite valide plafond/sol, props solides, portes, murs et conduits avant restauration. Une pose valide sur passerelle reste sur cette surface ; une pose en l’air reprend avec vitesse verticale nulle et gravité normale, jamais un état `grounded` inventé. Une ancienne pose accroupie dans un conduit n’est pas restaurée à travers sa collision avec un acteur debout.

Le Y parent est pris dans la pose de retour si une annexe est active ; le Y local reste `annexPositionY`. Le Port et les autres annexes gardent leur restaurateur propre. REFUGE projette, seulement pour le nouveau champ, le Y de sa porte parente ; ni son Y local ni un ancien Y d’une autre salle ne sont copiés. La persistance intermédiaire pendant `start` n’écrase pas le checkpoint avant sa restauration.

Une deuxième régression réelle est apparue au reload : le premier timestamp rAF peut précéder le `performance.now()` pris dans start/resume. La boucle du hub bornait seulement le maximum, produisait un delta négatif, puis `jumpQueued = max(0, jumpQueued - delta)` inventait un saut sans aucune touche. Une trace passive a confirmé les seules entrées titre/souris. Le test a d’abord échoué avec `vy = -693.5`, puis passe après la borne basse zéro dans la boucle commune `hub-game.js`. Les deux entrées start et resume, puis une frame normale, sont couvertes. Aucune modification de vitesse ou durée normale du gameplay.

## Validation exécutée

- 17/17 : ouverture V88 et route physique aller/retour du hangar (y compris hazard négatif inchangé).
- 25/25 après correction rAF : quatorze tests ouverture, sept tests fret dans le vrai démarrage app/moteur et quatre tests route du hangar.
- 81/81 : ouverture, régression fret app/moteur, runtime annexes V71, intégration/room REFUGE et migration onboarding V84.
- 26/26 : room et sauvegardes du Port, autorisations, quotas et isolation de profils.
- Régression indépendante `app-opening-resume-v88.test.mjs` : 7/7 ; mutation de l’ancien `Boolean(snapshot)` en mémoire fait échouer le scénario de reprise refusée comme attendu.
- `git diff --check` : succès, avertissements CRLF seulement.
- QA native Chromium : preuves dans `E:/CodexQA/AliensTantalus/v88-opening-20260923/`. Le harnais crée un seul profil isolé immédiatement après le briefing V84 puis n’écrit plus aucun état de progression/pose ; toutes les étapes utilisent clavier/souris et lectures d’état. Le scénario ne revendique donc pas une nouvelle exécution du créateur/réveil V84.
- Statut navigateur final : **PASS, `full-final-04/opening-v88-browser.json`**, après toutes les corrections décrites ici. Les rapports d’échec précédents sont conservés. `full-final-01` prouve neuf tirs, trois directions, recharge, réparation et signal, puis s’arrête sur le délai de boot au rechargement (45 s), sans erreur runtime/HTTP enregistrée ; ce premier essai n’est pas un PASS complet.
- `full-final-02` atteint le pupitre par le trajet réel, puis révèle le saut spontané au rechargement. `hangar-check-01/02` isolent ce défaut sans falsifier de parcours complet ; le premier confirme aussi l’allocation médicale et son checkpoint, puis révèle une hypothèse erronée du harnais (Continuer affiche le panneau Opérations : son bouton de reprise doit être utilisé). Ces essais ne sont pas comptés comme PASS.
- `freight-final-01` : **PASS**, scénario isolé au briefing, clic natif de lancement/insertion, inventaire réel 10 et checkpoint 10, reload avec `lastResumeResult.applied: true` et inventaire toujours 10, puis retraite et marqueur `complete`. Zéro erreur runtime/HTTP. Ce scénario n’invente pas une exécution des étapes précédentes. Le chiffre 10 inclut la dotation de l’opération, il ne doit pas être présenté comme deux trousses initiales seulement.
- Le harnais utilise désormais un défilement instantané puis un hit-test DOM avant chaque clic natif. Cela évite un clic hors cible sur le panneau Opérations large pendant un défilement encore actif ; aucun appel direct aux actions du moteur n’a été ajouté.
- **Passe complète finale** : 9/9 tirs, 3 directions, 1 recharge réelle ; relais annulé par déplacement puis terminé ; reprise au nœud 1 du signal ; aller maintenance et pupitre physique ; choix médical exclusif ; Y268, `grounded:true`, vitesse verticale zéro et santé100 immédiatement après reload ; trajet retour et briefing ; insertion, 10 trousses effectivement checkpointées ; reprise native appliquée et toujours 10 trousses ; retraite, `phase:complete` avec le même identifiant d’opération. Zéro erreur runtime/HTTP. Neuf captures conservées, contexte isolé fermé à la fin.
- Relecture visuelle de `full-final-04/06-freight-choice.jpg` à 1280×720 : les boutons réutilisent maintenant la classe `hub-dialogue-choice` ajoutée par le parent, texte lisible et aucun débordement de la modale. Le parcours final utilise les vrais boutons souris, pas leurs handlers appelés directement.

## Limites explicites

Ce sous-lot ne termine pas le chapitre PALISADE d’une heure dix ni les vingt chapitres. La vraie carte urbaine Port-Méridien, les blessés civils attendant au hangar, une interruption scénarisée en plein exercice, les animations nouvelles de réveil, les scènes complètes et tous les effets de choix à long terme restent à produire. Le signal n’usurpe pas la destination : aucune mission générique LV-426 n’est renommée en Port-Méridien. La première sortie est l’opération existante choisie par le joueur.

Pas de nouvel asset factice. Pas de commit, push ni déploiement exécuté par ce sous-agent ; ces gates relèvent de l’intégration du parent après validation globale.
