# Xeno Trials — animations et audio V189

Cette continuation part du commit public `e1d53588f3b56d89ab593f36c3b9cc337c5eadc1`. Les 189 combattants, les 80 hordes, les 40 opérations, leurs stages, objectifs, checkpoints, réglages et primes sont conservés. Le moteur de combat et les règles économiques ne changent pas.

## Deux lots de quarante dessins

- Queen, Crusher ACM, Ravager et Burster disposent chacun de dix poses de combat : attente, deux appuis, préparation/contact/récupération de leur attaque primaire, garde, recul, chute et corps couché. La préparation respecte leur anatomie : griffes royales, tête blindée, faux ou contact bas. Ces dessins ne remplacent pas leurs spéciaux ou supers.
- Warrior, Runner, Prowler et Spitter disposent chacun de huit phases de marche et de deux poses aériennes. Le déplacement réel pilote le cycle ; `y` et `vy` natifs choisissent la montée ou la descente. Les pivots aériens sont mesurés sur le bassin et sa projection de référence, sans recaler artificiellement les pieds sur le sol. Le contact, les dégâts, la stature et le saut restent possédés par le moteur. Les autres états reviennent aux dessins de combat V188 ou à leur rendu natif.

Ces huit PNG apportent **80 nouvelles poses et 11 379 512 octets**. Les 40 poses dessinées V188 restent inchangées : le programme Trials possède maintenant 120 poses dessinées distinctes sur huit identités. Le suivi des dix actions compte aussi 40 dessins d’imports plus anciens, soit 160 poses admises dans ce périmètre ; les 27 poses de capture V163 en sont exclues. Ces comptes ne signifient pas que les 189 personnages possèdent des animations complètes.

La caméra inclut les nouvelles limites de silhouette et les corps couchés sans réduire individuellement la taille physique d’une espèce. Les repères, pixels, alpha et échelles des anciens fichiers restent conservés. La [production combat](sprite-production-v189.json) et la [production mouvement](sprite-motion-production-v189.json) distinguent les références fan-made, le contexte officiel, les générations rejetées, les mesures et la revue artistique. Queen et Ravager ont nécessité plusieurs éditions pour nettoyer les gouttières ; les limites d’alpha n’ont pas été abaissées pour accepter ces candidats.

La revue d’intégration a trouvé un manque réel : l’observateur V186 ne suivait que ses cinq castes mesurées, donc les nouveaux atlas ne recevaient pas leurs cues de recul et de chute. Un prédicat facultatif permet maintenant au runtime de suivre un atlas de combat V189 d’identité exacte et réellement chargé. Les cinq meshes V186, leurs admissions par défaut, la limite de seize fantômes et leur durée de 0,65 seconde restent conservés. Aucun nouveau mesh fictif n’est attribué à ces personnages ; aucune réaction cosmétique n’entre dans un checkpoint.

## Audio et dossier des spécimens

Trials possède désormais des sons MIRE originaux liés aux événements réellement acceptés : attaques, impacts, garde, rupture, boss, dangers, objectifs et résultats. Le pont utilise le contexte partagé du directeur audio de l’application et respecte le volume global des effets. Il exige un geste utilisateur pour créer ou reprendre un contexte ; un simple rendu ou chargement de checkpoint ne crée pas une permission sonore. Les voix propres à Trials sont limitées à huit et les contacts de foule regroupés. La pause, la perte de focus, le mute et l’arrêt libèrent ses ressources ; quitter Trials ne ferme pas le contexte utilisé par le reste du jeu.

La revue finale a également isolé une demande d’activation dont le fournisseur partagé pouvait rester en attente après la sortie. Le contrôleur résout maintenant sa propre promesse à `false` dès `stop()`, même si le fournisseur ne répond jamais ; une réponse tardive ne recrée ni bus ni voix. Cette annulation reste locale et ne suspend ni ne ferme le contexte audio global.

Le bouton des sons est disponible dans la pause. Sa permission locale ne remplace pas les réglages du profil. Les états audio et l’historique sonore restent transitoires ; une reprise ne rejoue pas les événements déjà consommés. Aucun fichier sonore extrait d’un film ou d’un jeu n’est ajouté.

Le [suivi de couverture](animation-coverage-v189.json) décrit les 189 identités et dix actions chacune à partir des registres réellement admis. L’interface utilise ces données pour les badges et le filtre des gestes dessinés, tout en conservant les pages de quarante et la sélection. Dix états techniques détaillés restent dans les outils, hors des écrans de combat. Le plan V146 reste une preuve historique et n’est pas réécrit.

Le catalogue FR/EN reçoit neuf traductions revues par l’outil de maintenance existant, sans modifier les 6 334 textes et 494 modèles précédents. La [revue de traduction](i18n-animation-audio-review-v189.json) permet de reproduire cet ajout.

## Vérification, limites et livraison

`npm run test:trials:animation:v189` rassemble les contrôles des atlas, sons, couvertures, interface, traduction, runtime et succession. La recette `npm run qa:trials:animation:v189 -- --output <dossier-hors-depot>` reste distincte des tests Node, du contrôle source et du build. Les doubles DOM, Canvas, image et AudioContext des tests sont déclarés. Un graphe WebAudio natif ne constitue pas une écoute comparative sur matériel physique.

Les preuves finales, captures et empreintes sont conservées sous `/workspace/tantalus-inventory/reprise-v189/`. Les captures de planches attestent les poses et appuis, pas des victoires. Les parcours partiels de personnages, manches KO, partie horde complète et réglages préparés sont comptés séparément dans la recette. Les anciens verdicts et empreintes ne sont pas transférés aux nouveaux octets.

La recette finale corrigée passe **80 contrôles avec 14 captures**, sans erreur JavaScript, HTTP ou requête. Ses 595 fichiers restent identiques avant/après ; les 17 réponses HTTP vérifiées correspondent au disque, dont les huit nouveaux PNG. Elle observe 100 poses distinctes, dont 78 des 80 nouvelles et 22 anciennes. Les quatre nouveaux sujets sont suivis jusqu’à leur premier KO de manche puis abandonnés ; la horde audio est un match complet gagné contre douze contacts. Les quatre mouvements montrent leurs huit phases, les deux poses aériennes et le retour réel au rendu de combat V188. Le graphe natif relève un contexte partagé par chargement de page, donc deux créations avec le rechargement vérifié, un pic de quatre oscillateurs connectés, zéro après sortie et une seule annonce de victoire. Les volumes observés sont 0,182, zéro et 0,091. La première passe antérieure à la correction d’annulation audio reste archivée séparément.

La suite complète des **254 fichiers de tests** passe : **5 104 tests, 5 103 réussis, aucun échec, une fixture historique optionnelle ignorée**. Les 43 fichiers figés restent inchangés. La relecture indépendante confirme les 46 empreintes V189, les 71 déclarations V186, les 48 déclarations V188 et leurs 284 endpoints historiques ; seuls les deux bilans de validation restent hors gel.

Le contrôle source passe avec 2 578 fichiers, 1 442 ressources et aucun document privé. Le build corrigé et son contrôle passent avec 2 030 fichiers et 651 entrées de démarrage. Son SHA sera réestampillé et revérifié après le commit.

La fidélité canonique 1:1 reste ouverte : les plaques sont des adaptations fan-made et les sources primaires ne fournissent pas des cycles complets mesurés pour chaque identité. Les phases ajoutées restent des dessins adaptés au jeu, sans nouveaux relevés de motion capture. Les movesets complets des 189 personnages, les attaques aériennes, les chorégraphies spéciales et les autres identités restent à produire et à vérifier.

Le déploiement précédent a reçu `api-deployments-free-per-day` avec un délai de 86 400 secondes. La livraison respecte ce délai ; le reçu du commit public et le statut réel de mise en ligne sont consignés séparément, sans changement de facturation ou de protection.
