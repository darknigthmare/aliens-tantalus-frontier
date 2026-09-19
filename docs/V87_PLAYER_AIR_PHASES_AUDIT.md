# V87 — Phases aériennes du joueur et récupération des sources

Rapport privé du 19 septembre 2026. Ne pas copier dans la publication publique.
Base source : `2c8f39f11988fdefb695b4f26df00cce1cfaa1e6`.
Base publique : `f3ba2dd38174aa4082cf304bfdca4beab446ae29`.

## Récupération réellement tentée

Relecture fraîche des trois conversations « Vérification animations joueur »,
« Conception pièce hommage chat » et « Créer une campagne complète » : les
messages correspondent aux extractions privées déjà présentes. Le connecteur
retourne `attachments=[]` et `hasMore=false`. Aucun nouveau lien de téléchargement,
ZIP ou manifeste n'est récupéré. Les références internes ne sont pas des fichiers.

Le navigateur ChatGPT actuellement accessible affiche « Un instant… », accompagné
d'une iframe de vérification Cloudflare. La validation doit être faite par
l'utilisateur ; aucune tentative de contournement ou de lecture de cookies.
CUA échoue avant ouverture sur `apply deny-read ACLs`, y compris après un reset.
La recherche bornée des téléchargements du projet retrouve seulement le ZIP
animaux déjà reçu et le classeur connu, pas de nouveau paquet joueur V87.

## Défaut reproduit avant correction

Une séquence `jump-fall` choisie uniquement sur le temps écoulé affiche déjà la
cellule 10 au sommet supposé après 0,26 seconde alors que la vitesse verticale
réelle reste négative (-171). Une chute simple commence par la cellule 8 et
`movement:takeoff`. Une blessure qui interrompt la chute redémarre ce faux
décollage. Le retour au sol passe directement à idle.

Le correctif vise une présentation commandée par la physique existante : montée,
sommet, descente et contact au sol, avec états séparés par acteur. Il ne doit
modifier ni gravité, ni vitesse, ni collisions, ni sauvegarde, ni identité visuelle.

## Limite artistique explicite

Nouvel essai ImageGen intégré avec la planche Marine comme référence : échec avant
génération, `unable to read referenced image` / `apply deny-read ACLs`.
Zéro image produite ; aucun appel API ou CLI de remplacement.
Le prompt exact et l'erreur restent dans la sortie privée
`privateoutput/v87/player-run-generation-attempt-20260919.json` du workspace de tâche.

Cette correction réutilise les poses existantes : ce n'est pas la livraison de
cycles denses, de directions gauche/droite dessinées séparément, d'armes détachées,
de montées d'échelle sans décor intégré, ni des 507 clips annoncés par la source.
Les nouveaux manifestes et les références personnelles restent non récupérés.

## Correction intégrée

`player-airborne-presentation-v87.js` observe les valeurs physiques et conserve un
état transitoire par acteur. Les cellules 9/10 servent en vol, 11 uniquement après
un contact au sol observé. `jump:impulse`, `jump:apex` et `ground:contact` sont
issus des transitions physiques, pas du temps du clip. Blessure, mort, combat,
outils et échelles gardent leur priorité. Les frames existantes ne sont pas
comptabilisées comme de nouvelles illustrations.

Les contrôleurs mission J1/J2, hub J1 et BIOFORGE transmettent l'acteur réel.
Les transitions de pont/annexe, les discontinuités temporelles et les grands
déplacements réinitialisent l'observation. Trois resets explicites supplémentaires
couvrent la reprise checkpoint J1/J2, le respawn électrique et le scellement de
l'arène BIOFORGE, même à coordonnées identiques ou proches. Aucun changement de
physique, hitbox, vitesse, inventaire ou schéma de sauvegarde.

## Validation exécutée

- Suite complète : 2 738 tests, 2 737 réussites, zéro échec, un ignoré lié au
  privilège Windows des liens symboliques. Lint syntaxe/sécurité : 493 modules.
- 26 nouveaux tests de phases pures et de méthodes moteur réelles. Revue
  indépendante : 76 tests ciblés réussis ; ses deux reproductions checkpoint et
  transfert BIOFORGE ne produisent plus de réception/contact fantôme.
- Navigateur privé final `browser-03` : sept scénarios au clavier, rendu réel et
  zéro erreur JS/HTTP. J1/J2 en mission : sauts et sorties de plateforme ; J1
  blessé en chute ; J1 hub : saut et sortie de plateforme. Aucun J2 hub inventé.
- Fixtures initiales de scénario déclarées ; ensuite touches réelles et boucle
  normale. Les observateurs transmettent sans altération les appels sample,
  drawImage et onEvent. La cellule 11 est prouvée par les blits ; les captures
  après récupération sont nommées `after-landing`, pas présentées comme frame 11.
- Distribution publique : 917 fichiers source et 906 fichiers construits,
  732 assets inchangés, zéro document privé dans l'arbre courant. Build réussi.
  Ce contrôle ne certifie pas la purge de l'historique ancien de GitHub.
- Cache privé `atf-v86-physical-placeables-shell-4`, cache public
  `atf-v86-public-shell-9`, nouvelle dépendance d'animation incluse hors ligne.

Journaux et captures privés : `I:/CodexQA/AliensTantalus/v87-player-air-20260919/`.
Ni tous les sprites, ni la fidélité 1:1, ni le jeu commercial complet ne sont
déclarés terminés par cette correction ciblée.

## Publication vérifiée

Commit public `5bb59dc5298d226cfbd1ce6389bd3f3e99830145`, six fichiers runtime/cache
uniquement. Push atomique vérifié sur `main` et `codex/v86-public-release`. Aucune
branche ou ascendance privée ajoutée à ce push.

Vercel production READY : `dpl_BCRAimubfz4tNETHYbfknN11muo5`, branche `main`,
commit exact ci-dessus, framework null/static, build 45,292 secondes, alias
`https://aliens-tantalus-frontier.vercel.app`, aucune erreur d'alias.

- Sept scénarios navigateur réussis sur le build public puis en production :
  `browser-public-build/report.json` et `browser-production/report.json`, zéro
  erreur JS/HTTP. La régression de la première fixture de test (réception initiale
  J2 avant le départ J1) a été corrigée en attendant le repos physique des deux
  acteurs ; les critères d'indépendance n'ont pas été affaiblis.
- HTTP local et production : shell et 92 fichiers critiques/assainis identiques
  au commit, 16 assets de base et les art REFUGE/animaux inchangés validés,
  238 URL privées refusées. Rapports sous `privateoutput/v87/` du workspace de
  tâche : `player-air-http-local.json`, `player-air-http-production.json`.
- PWA local et production : cache `atf-v86-public-shell-9`, 211 chemins,
  nouvelle dépendance d'animation disponible hors ligne, 16 URL privées refusées
  en ligne et hors ligne. `pwa-local.json`, `pwa-production.json` sur I:.
- Requête logs error/fatal limitée au déploiement et aux 15 dernières minutes :
  aucun log trouvé. Jeu statique : cette absence ne remplace pas la QA navigateur
  et ne constitue pas un audit de toute la télémétrie ou des anciens déploiements.

Les cinq modules privés testés, publics commités et construits ont aussi été
comparés après normalisation LF/CRLF : identiques. Les essais d'art ennemi
préexistants non suivis ont été laissés intacts et non stagés.
