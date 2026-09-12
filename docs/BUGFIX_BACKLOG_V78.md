# V78 — Bugs bornés issus des conversations, baseline a4ef470

Audit ouvert le 2026-09-08 et validé le 2026-09-12. Les 26 entrées de `references/V76_CHATGPT_PROJECT_GAP_MATRIX.md` ont été recoupées par famille avec le code ; les grandes missions, banques finales et nouvelles fonctions sont exclues de ce lot de bugs. Aucun P0 nouveau démontré. Les priorités ci-dessous concernent les défauts reproductibles de la baseline, pas une affirmation que les 26 conversations seraient terminées.

## Sources utilisateur exactes retrouvées

- **Décrire les bugfix Codex**, `6a9cb8bc-d6fc-83ed-8ce7-d324e4b1a573`, `references/v76-conversation-audit/group-gameplay.md:213-267`. Extraits : « Dans l uss a chaque conversation j’ai un ecrna flou et plus possible d interagir » ; « Les items comme le poste de commandement est maintenant bien niveau perspective mais il considere que c est un props avec collision alors que on peut normalement passer devant (pas de collision sauf si on saute dessus) ». Le supplément demande également une nouvelle partie/prologue physique après création du joueur.
- **Améliorer le menu principal**, `6a9e0753-f3a8-83eb-a165-d534d0da00ca`, même fichier:62-91. « Non tu a pas comprit je te parle du prompt détailler pour modifier mon menu actuel du jeux pour que ce soit pas une image fixe et unique ». Le fond modulaire constitue une demande distincte ; il ne prouve pas que tous les contrôles du menu fonctionnent.
- **Gérer sons et musique**, `6a9f2a3e-ea20-83eb-bbac-49af1626675a`, même fichier:31-60. V77 a effectivement livré l’infrastructure optionnelle, les réglages et leur QA ; les anciens constats d’absence de code audio dans l’extraction V76 sont périmés. La banque finale demeure absente.

Les invariants de protection des sauvegardes et de navigation aux contrôleurs ci-dessous sont des défauts techniques constatés dans le périmètre accueil/nouvelle partie ; aucune citation utilisateur spécifique aux profils n’a été inventée.

## 1. P1 — Une action de commandement écrase la chronologie sans confirmation

- Baseline : `src/app.js:2022`, bouton visible `index.html:81`, écriture immédiate `src/save.js:1824-1827`.
- Scénario : profil 2 au jour 42 ; cliquer **NOUVELLE CHRONOLOGIE** dans Commandement. Le handler appelle immédiatement `newGame(saveSystem.profile)` et remplace aussi la valeur persistée.
- Preuve exécutée sur le handler extrait de `git show a4ef470:src/app.js`, avec le vrai SaveSystem et un stockage Map isolé : jour 42 → jour 1, jour stocké 1, aucune confirmation, destination hub. L’écran titre possède pourtant déjà une étape de confirmation.
- Correction minimale : centraliser les demandes de remise à zéro et obtenir une confirmation explicite avant remplacement du profil ; garder une action Annuler sans écriture.
- Suivi V78 : corrigé par une confirmation liée à l’objet de sauvegarde et au profil exact, avec annulation sans écriture, protection contre répétition/double clic et échec de stockage non destructif. Vérifié en tests et dans Chromium isolé.

## 2. P1 — Recharger l’application oublie le profil choisi

- Baseline : `src/app.js:92` force `saveSystem.load(1)` ; `src/save.js:1783-1784` initialise toujours le profil 1 ; `src/app.js:1938-1944` permet néanmoins de jouer sur 2/3.
- Scénario : créer/charger le profil 2, progresser, fermer/recharger, puis Continuer. Le titre et le jeu utilisent le profil 1, pas la partie sélectionnée.
- Preuve en stockage isolé : sélection avant recharge 2, après boot 1 ; le profil 2 conserve correctement son jour 42 tandis que le profil présenté revient au jour 1. Ce n’est donc pas une suppression de son fichier, mais une reprise de la mauvaise partie.
- Correction minimale : persister le profil actif valide et le restaurer au boot, avec repli contrôlé si le slot est absent/corrompu.
- Suivi V78 : corrigé. Le profil 1/2/3 actif est mémorisé seulement après écriture réussie et restauré au boot. Un marqueur invalide revient au profil 1 ; un slot corrompu entre en récupération sans réécriture. Profils 2/3 et reload vérifiés dans Chromium isolé.

## 3. P1 — L’accueil manette ne peut activer que Continuer

- Baseline : `src/title-screen-v61.js:155-169` ne lit que A/Start et appelle `continueGame()` dès que le menu est ouvert. Aucune navigation D-pad/stick ni activation du bouton sélectionné.
- Scénario : ouvrir le menu à la manette, vouloir Système, Forge ou Nouvelle partie : la direction ne sélectionne rien ; l’appui A lance Continuer. Une manette déjà maintenue à l’entrée n’a pas non plus la suppression d’arête utilisée par le runtime mission.
- Preuve exécutée sur le module exact de a4ef470 : D-pad bas → aucune action ; A → `continue`, indépendamment d’une cible de menu. Fixture de gamepad standard uniquement, aucune prétention de test matériel physique.
- Correction minimale : sélection stable, navigation répétée bornée, activation ciblée, Retour, neutralisation des boutons maintenus/reconnectés et nettoyage RAF.
- Suivi V78 : corrigé. D-pad/stick, A/Start, B, clavier, focus circulaire, suppression d’arête, reconnexion et deux pads dans une même frame sont couverts. La QA Chromium simule un mapping standard et ne revendique aucune manette physique.

## 4. P1 — La table de briefing bloque encore le passage devant

- Source directe : citation de collision ci-dessus, `group-gameplay.md:233`.
- Baseline : `src/hub-profiles-v53.js:19`, géométrie `src/hub-game.js:101-115`, collision horizontale `src/hub-v51-runtime.js:612-628`, ennemis `:681-682`.
- Preuve réelle : la table mesurée est 480 × 82,6319 px, x=1680, y=541,3681 (la hauteur 142 du profil est plafonnée à celle du bitmap). Un marine au sol allant de x=1634 à x=1639 est repoussé à x=1636 avec vx=0. Les ennemis sont également retenus par ce volume plein.
- Correction V78 autorisée : marquer uniquement ce prop `one-way-top`, ignorer sa face latérale pour les acteurs, conserver son plateau sur une descente venant réellement du dessus. Le painter order est déjà correct : prop avant joueur ; aucun asset remplacé.
- Test dédié : `tests/hub-briefing-v78.test.mjs` couvre les 2 sens, 30/60/120 FPS, saut traversant/atterrissage, entrée latérale par-dessous, sortie du plateau, reprise au sol, pause sur plateau, ennemis et invariants des 15 autres props.
- Limite explicite : la sauvegarde des ponts conserve historiquement x, pas une pose verticale exacte. Ce lot n’ajoute pas de schéma de sauvegarde verticale ; il empêche l’enfermement lors de la reprise dans l’emprise de la table.
- Suivi V78 : corrigé et validé dans le vrai hub navigateur. Le marine passe devant sur toute la largeur, saute à travers par-dessous, se pose sur le plateau et retombe au pont après la sortie ; l’ennemi de crise partage le passage latéral et les quinze autres props gardent leur collision.

## Constats exclus ou déjà traités

- Le voile de dialogue historique est traité par `HubDialogueUiV76` et une couche dédiée hors du stacking context ; ne pas recopier l’ancien diagnostic comme un nouveau P0 sans reproduction.
- Les volumes MUSIQUE/EFFETS, l’autoplay, l’invalidation des sons différés et la persistance des réglages ont une preuve navigateur V77 dédiée. Aucun nouveau défaut audio P0/P1 démontré par ce passage.
- Les biographies Echo-9, le prologue complet, le tir diagonal et les vingt planètes modulaires sont des demandes encore à produire, pas quatre bugs de quelques lignes à déclarer artificiellement corrigés.
