# V89 — L’exercice interrompu

Document privé de réalisation et de QA. Ne pas publier les sources de conversation ou les captures privées avec le jeu.

## Exigence et limite

Les rapports V87_GAMEPLAY_CHAT_GAPS_20260920, V87_SOURCE_COVERAGE_REFRESH et V83_GAMEPLAY_SOURCE_AUDIT ont été recoupés avec `privateoutput/v87/campaign-source-visible.md`, lignes 347–367. Le dernier plan visible nomme les cinq séquences du chapitre 1, notamment **L’exercice interrompu**, et demande une découverte utile du bâtiment. Le Word intégral et la carte urbaine ne sont pas disponibles dans ces sources récupérées.

V88 avait déjà livré couchette/dotation, qualification physique, réparation du relais, message bref, fret exclusif et conséquences dans la première opération existante. Son exercice n’était pas interrompu en cours de tirs. V89 comble ce point précis. Aucun dialogue V84 n’est réécrit. Le déclenchement au troisième impact et la liaison à rétablir trois secondes sont des décisions de réalisation du projet, pas une transcription retrouvée ni des faits canoniques de la franchise.

## Parcours réalisé

La première qualification des nouvelles timelines est interrompue après trois impacts réels. Le chrono, la cible courante, les cibles touchées, le score, le chargeur, la réserve et l’éventuelle recharge restent dans **la même session V81**, sans seconde copie. Les projectiles déjà en vol sont mis en sécurité sans rendre leurs munitions, conformément au comportement de reprise V81.

Le Marine quitte alors librement le pas de tir, descend l’échelle existante et rejoint la vraie console. E lance une réparation stationnaire de trois secondes actives : déplacement/saut/sortie de zone l’annulent, pause la fige, rechargement de page annule seulement le travail partiel. Une réparation terminée est sauvegardée. Le joueur remonte l’échelle, rejoint physiquement le pas de tir et appuie sur E pour reprendre les cibles restantes. Le parcours sans raté reprend six cibles ; les textes ne promettent pas six si des cibles antérieures ont été manquées.

Neuf tirs réussis, les trois directions et une vraie recharge peuvent alors donner le reçu V81 habituel et ouvrir l’étape V88 du relais. Aucun nouveau bonus ni reçu d’entraînement n’est créé. Les règles de réussite/échec/abandon V81 sont inchangées. Une session abandonnée ne reprend pas la réparation de l’ancienne ; une interruption déjà achevée n’est pas rejouée pendant les entraînements ultérieurs.

## Persistance et isolation

`openingExerciseV89` vaut explicitement `null` dans le défaut et les anciennes parties. Seules les nouvelles timelines de création reçoivent `{schema:89, phase:'pending', sessionId:null}`. Cette opt-in évite d’interrompre rétroactivement une V88 déjà en train de viser ou de recharger. Phases : pending → console → return → complete.

L’app valide propriétaire profil/époque/timeline, vue hub, absence de playtest, acteur vivant, sas stabilisé, session exacte et contact réel. Le marqueur, le snapshot V81 et la pose de l’annexe sont committés ensemble. Un quota ne valide ni réparation ni reprise ; la simulation reste suspendue et E permet de réessayer l’enregistrement initial. Un échec de checkpoint au redémarrage ne réutilise pas la liaison d’une ancienne session. Les actions périmées ne modifient pas le profil actif.

Le composite public reste `hub-opening-v88.js`, maintenant enrichi par le mixin `hub-opening-exercise-v89.js` au-dessus des vrais ancêtres V84/V81. Le module pur `opening-exercise-v89.js` expose aussi l’objectif en lecture seule pour le menu V89. L’interface réutilise le stand et ses assets existants ; aucun placeholder ni nouvel asset non validé.

## Validation effectuée

- Sept nouveaux tests `opening-exercise-v89.test.mjs` : opt-in/migration, ordre/preuves/contacts, trois vrais projectiles dans le moteur, gel exact, marche réelle, reprise à la console, timer/annulation/pause, neuf tirs après reprise, handler app réel extrait en VM avec vrai SaveSystem, quota/retry, propriétaire/vue/session périmés, abandon et nouvelle session.
- Régressions V88/onboarding/reprise fret : 34/34 lors du premier raccord. Stand/session/ouverture : 28/28 avant les deux derniers tests de quota/abandon.
- Chromium natif, contexte isolé : `E:/CodexQA/AliensTantalus/v89-opening-20260923/run-01/opening-v89-browser.json`, **PASS**, six captures, zéro erreur runtime/HTTP. Une seule fixture initiale au sol de l’armurerie avant qualification ; aucune mutation ultérieure de pose/progression. Ce scénario ne prétend pas refaire créateur/réveil/couchette.
- Parcours natif : deux échelles d’armurerie + sas, console d’armement, pas de tir, trois tirs/1 cartouche restante, gel vérifié après F/R/E et attente, reload au gel, échelle/console, réparation annulée en marchant, reload pendant réparation partielle, réparation réussie, E à distance incapable de reprendre, reload à l’état return, retour au pas de tir, six tirs restants avec recharge, qualification9/9 et unique reçu conservé après reload. Santé finale100.
- Capture02 relue à1280×720 : SUSPENDU / CHRONO GELÉ, état3/9 et guidage physique lisibles sans masquer le Marine ni son parcours.
- Batterie finale ciblée : **125/125 PASS**, comprenant les sept nouveaux tests et les contrats V81/V84/V85/V88/app/BIOFORGE voisins. Le contrat d’ascendance prouve maintenant les prototypes V84 et V81 réels derrière le mixin V89, sans supprimer les gardes d’import existantes. `git diff --check` passe (avertissements de conversion CRLF uniquement), syntaxe du runtime vérifiée.
- Deuxième parcours natif sur sources finales : **PASS**, `run-final-02/opening-v89-browser.json`, quatre rechargements, six captures, neuf tirs/neuf impacts, une recharge, un seul reçu et santé100, zéro erreur. Capture04 relue : console réelle et consigne de retour au pas de tir lisibles sans débordement. Les deux passes sont conservées séparément.
- Revue indépendante read-only : aucun défaut P1/P2 prouvé. Trois contrôles ajoutés seulement en mémoire passent : véritable sortie E depuis console et return (abandon + sas), reload return puis quota à la reprise (reste suspendu, retry, reload complete), garde réelle ownsTimelineV84 sur époque périmée et nouvelle timeline dans le même profil. Aucun fichier de production modifié par cette revue.
- Le skill agent-browser/agent-browser-verify a guidé le scénario et la vérification visuelle. L’exécutable agent-browser n’est pas installé ; le harnais CDP natif existant du projet a été réutilisé avec son propre contexte jetable, sans accès au profil personnel du navigateur.

## Hors de cette tranche

Les blessés civils à l’arrivée, la vraie carte Port-Méridien, le chapitre complet PALISADE et ses conséquences à long terme ne sont pas livrés par V89. Aucun débrief fictif n’est attribué à une mission générique. Les anciennes timelines V88 ne reçoivent pas cette interruption rétroactivement. Aucun commit, push ou déploiement effectué par ce sous-agent.
